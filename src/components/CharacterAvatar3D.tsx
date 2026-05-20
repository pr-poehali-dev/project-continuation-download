import { useMemo } from 'react';
import { useGame } from '@/lib/GameContext';
import { useProgress } from '@/lib/useProgress';
import {
  SILHOUETTE_SRC,
  buildVisualLayer,
  IMPLANT_AURAS,
  type EquipmentSlot,
  type VisualLayer,
} from '@/lib/equipmentVisuals';

interface Props {
  /** Размер контейнера (CSS значение или класс). По умолчанию полная ширина */
  className?: string;
  /** Цвет акцента (обычно от класса персонажа) */
  accentColor?: string;
  /** Показывать ли подпись/имя поверх */
  showName?: boolean;
  /** Интерактив — реагировать на наведение */
  interactive?: boolean;
}

const SLOT_ORDER: EquipmentSlot[] = ['body', 'boots', 'gloves', 'head', 'weapon', 'implant'];

export default function CharacterAvatar3D({
  className = '',
  accentColor = '#00ff41',
  showName = true,
  interactive = true,
}: Props) {
  const { character } = useGame();
  const prog = useProgress();

  // Собираем слои экипировки
  const layers = useMemo<VisualLayer[]>(() => {
    if (!character?.equipment) return [];
    const result: VisualLayer[] = [];
    for (const slot of SLOT_ORDER) {
      const item = character.equipment[slot];
      if (!item) continue;
      const layer = buildVisualLayer({
        name: item.name,
        slot: slot,
        rarity: item.rarity,
      });
      if (layer) result.push(layer);
    }
    return result;
  }, [character?.equipment]);

  // Импланты из Мастерской — ауры вокруг персонажа
  const auras = useMemo(() => {
    return prog.implantsEquipped
      .map(id => IMPLANT_AURAS[id])
      .filter(Boolean);
  }, [prog.implantsEquipped]);

  if (!character) return null;

  return (
    <div className={`relative ${className}`}
      style={{
        aspectRatio: '3/4',
        clipPath: 'polygon(0 0, 92% 0, 100% 8%, 100% 100%, 8% 100%, 0 92%)',
        backgroundColor: '#040608',
        overflow: 'hidden',
      }}>
      {/* ─── Фоновая «сетка пола» под персонажем ─── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 35% at 50% 90%, ${accentColor}30 0%, transparent 70%),
            linear-gradient(180deg, transparent 0%, ${accentColor}05 100%)
          `,
        }} />
      <div className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(${accentColor}40 1px, transparent 1px),
            linear-gradient(90deg, ${accentColor}40 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse 70% 50% at 50% 100%, black 0%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 50% at 50% 100%, black 0%, transparent 70%)',
        }} />

      {/* ─── Ауры от имплантов (за персонажем) ─── */}
      {auras.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {auras.map((aura, i) => (
            <div key={i}
              className={`absolute inset-0 ${aura.pulse ? 'aura-pulse' : ''}`}
              style={{
                background: `radial-gradient(ellipse 50% 60% at 50% 50%, ${aura.color}${Math.round(aura.intensity * 40).toString(16).padStart(2, '0')} 0%, transparent 65%)`,
                mixBlendMode: 'screen',
                animationDelay: `${i * 0.7}s`,
              }} />
          ))}
        </div>
      )}

      {/* ─── Силуэт персонажа ─── */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img src={SILHOUETTE_SRC}
          alt="silhouette"
          className="h-full w-full object-contain"
          style={{
            filter: `drop-shadow(0 0 20px ${accentColor}60) hue-rotate(${hueShift(accentColor)}deg) saturate(1.3)`,
            mixBlendMode: 'screen',
          }} />
      </div>

      {/* ─── Слои экипировки ─── */}
      {layers.map((layer, i) => (
        <img key={i}
          src={layer.src}
          alt=""
          className="absolute pointer-events-none"
          style={{
            top: layer.top,
            left: layer.left,
            width: layer.width,
            transform: `translate(-50%, 0) ${layer.rotate ? `rotate(${layer.rotate}deg)` : ''}`,
            mixBlendMode: layer.blend || 'screen',
            zIndex: layer.z || 20,
            filter: `drop-shadow(0 0 12px ${layer.glow}aa) drop-shadow(0 0 24px ${layer.glow}40)`,
          }} />
      ))}

      {/* ─── Hover свечение ─── */}
      {interactive && (
        <div className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 hover:opacity-100"
          style={{ background: `radial-gradient(circle at 50% 40%, ${accentColor}20 0%, transparent 60%)` }} />
      )}

      {/* ─── Scanline эффект ─── */}
      <div className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent 0px, transparent 2px, ${accentColor}08 2px, ${accentColor}08 3px)`,
        }} />

      {/* ─── Имя + класс ─── */}
      {showName && (
        <>
          <div className="absolute top-3 left-3 px-2 py-0.5 font-orbitron text-xs border z-50"
            style={{ color: accentColor, borderColor: accentColor + '80', backgroundColor: '#040608cc' }}>
            LVL {character.level}
          </div>
          {auras.length > 0 && (
            <div className="absolute top-3 right-3 px-2 py-0.5 font-mono text-[9px] border z-50"
              style={{ color: '#aa00ff', borderColor: '#aa00ff80', backgroundColor: '#040608cc' }}>
              ⚙ {auras.length} ИМПЛАНТ{auras.length > 1 ? 'ОВ' : ''}
            </div>
          )}
          <div className="absolute bottom-4 left-4 right-4 z-50">
            <div className="font-orbitron text-xl font-black text-white drop-shadow-lg">{character.name}</div>
            <div className="font-mono text-xs mt-0.5" style={{ color: accentColor }}>
              {classLabel(character.class)}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes aura-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        .aura-pulse { animation: aura-pulse 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

function hueShift(hex: string): number {
  // Грубая привязка цвета к hue-rotate для tint силуэта
  const map: Record<string, number> = {
    '#00ff41': 0,    // green base
    '#00aaff': 180,  // cyan
    '#aa00ff': 280,  // purple
    '#ff00ff': 320,  // magenta
    '#ffaa00': 60,   // gold
  };
  return map[hex.toLowerCase()] ?? 0;
}

function classLabel(cls: string): string {
  const map: Record<string, string> = {
    cipher: 'CIPHER',
    data_ghost: 'DATA GHOST',
    neural_architect: 'NEURAL ARCHITECT',
    hacker: 'CIPHER',
    netrunner: 'DATA GHOST',
    street_samurai: 'NEURAL ARCHITECT',
  };
  return map[cls] ?? cls.toUpperCase();
}
