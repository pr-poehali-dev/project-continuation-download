import { useMemo } from 'react';
import { useGame } from '@/lib/GameContext';
import { useProgress } from '@/lib/useProgress';
import Icon from '@/components/ui/icon';
import { IMPLANT_AURAS, type EquipmentSlot } from '@/lib/equipmentVisuals';

interface Props {
  size?: 'sm' | 'lg';
}

const RARITY_COLORS: Record<string, string> = {
  common: '#aaaaaa', uncommon: '#00ff41', rare: '#00aaff', epic: '#aa00ff', legendary: '#ffaa00',
};

const SLOT_ICON: Record<EquipmentSlot, string> = {
  head:    'HardHat',
  body:    'Shield',
  weapon:  'Swords',
  gloves:  'Hand',
  boots:   'Footprints',
  implant: 'Cpu',
};

// Угловые позиции каждого слота
const SLOT_POSITION: Record<EquipmentSlot, string> = {
  head:    'top-2 right-2',
  body:    'top-1/2 -translate-y-1/2 right-2',
  weapon:  'bottom-12 right-2',
  gloves:  'top-1/2 -translate-y-1/2 left-2',
  boots:   'bottom-2 right-2',
  implant: 'top-12 right-2',
};

const SLOTS: EquipmentSlot[] = ['head', 'body', 'weapon', 'gloves', 'boots', 'implant'];

export default function EquipmentBadges({ size = 'sm' }: Props) {
  const { character } = useGame();
  const prog = useProgress();

  const auras = useMemo(
    () => prog.implantsEquipped.map(id => IMPLANT_AURAS[id]).filter(Boolean),
    [prog.implantsEquipped]
  );

  if (!character) return null;

  const equipped = SLOTS
    .map(slot => ({ slot, item: character.equipment?.[slot] }))
    .filter(x => x.item);

  const badgeSize = size === 'lg' ? 36 : 28;
  const iconSize  = size === 'lg' ? 18 : 14;

  return (
    <>
      {/* ─── Ауры от имплантов (фоновое свечение по контуру рамки) ─── */}
      {auras.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {auras.map((aura, i) => (
            <div key={i}
              className="absolute inset-0 aura-ring"
              style={{
                boxShadow: `inset 0 0 ${30 + i * 20}px ${aura.color}${Math.round(aura.intensity * 80).toString(16).padStart(2, '0')}`,
                animationDelay: `${i * 0.8}s`,
                opacity: aura.pulse ? undefined : 0.7,
              }} />
          ))}
        </div>
      )}

      {/* ─── Бейджи экипировки в углах ─── */}
      {equipped.map(({ slot, item }) => {
        if (!item) return null;
        const color = RARITY_COLORS[item.rarity] || RARITY_COLORS.common;
        return (
          <div key={slot}
            className={`absolute ${SLOT_POSITION[slot]} z-20 group cursor-help`}
            style={{ width: badgeSize, height: badgeSize }}>
            <div className="w-full h-full flex items-center justify-center border-2 bg-black/80 transition-transform group-hover:scale-110"
              style={{
                borderColor: color,
                color: color,
                boxShadow: `0 0 10px ${color}80, inset 0 0 6px ${color}40`,
                clipPath: 'polygon(15% 0, 100% 0, 100% 85%, 85% 100%, 0 100%, 0 15%)',
              }}>
              <Icon name={SLOT_ICON[slot]} size={iconSize} />
            </div>
            {/* Tooltip */}
            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-mono text-[10px] px-2 py-1 border bg-black/95 z-30"
              style={{ color, borderColor: color + '80' }}>
              {item.name}
            </div>
          </div>
        );
      })}

      {/* ─── Индикатор активных имплантов ─── */}
      {auras.length > 0 && (
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1 px-1.5 py-0.5 border bg-black/80 font-mono text-[9px]"
          style={{ color: '#aa00ff', borderColor: '#aa00ff80' }}>
          <Icon name="Cpu" size={10} />
          {auras.length}
        </div>
      )}

      <style>{`
        @keyframes aura-ring {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .aura-ring { animation: aura-ring 3s ease-in-out infinite; }
      `}</style>
    </>
  );
}
