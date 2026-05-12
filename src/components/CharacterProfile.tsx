import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { useGame, InventoryItem } from '@/lib/GameContext';
import { api } from '@/lib/api';

const RARITY_COLORS: Record<string, string> = {
  common: '#aaaaaa', uncommon: '#00ff41', rare: '#00aaff', epic: '#aa00ff', legendary: '#ffaa00',
};
const RARITY_LABELS: Record<string, string> = {
  common: 'Обычный', uncommon: 'Необычный', rare: 'Редкий', epic: 'Эпический', legendary: 'Легендарный',
};
const SLOT_LABELS: Record<string, string> = {
  head: 'Шлем', body: 'Броня', weapon: 'Оружие', gloves: 'Перчатки', boots: 'Ботинки', implant: 'Имплант',
};
const SLOT_ICONS: Record<string, string> = {
  head: 'Crown', body: 'Shield', weapon: 'Zap', gloves: 'Hand', boots: 'Footprints', implant: 'Cpu',
};
const STAT_LABELS: Record<string, string> = {
  strength: 'Сила', agility: 'Ловкость', intelligence: 'Интеллект', defense: 'Защита', luck: 'Удача',
};
const STAT_COLORS: Record<string, string> = {
  strength: '#ff4060', agility: '#ffff00', intelligence: '#00ffff', defense: '#00ff41', luck: '#aa00ff',
};

// Базовые картинки по классу
const CLASS_BASE_IMG: Record<string, string> = {
  hacker: 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/c57f7ff6-a3a7-4783-8f10-0d9d80a09f23.jpg',
  netrunner: 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/2fd8ffba-85dd-4b30-aba1-ceb9dd168a5e.jpg',
  street_samurai: 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/ba390b4d-c17b-4e41-933f-463af7aa414a.jpg',
};

// Слои экипировки: item_id → image url
// Голова: шлем (item id 1=обруч, 2=визор, 3=шлем)
// Тело: броня (5=жакет, 6=экзоскелет, 8=корп-доспех)
// Оружие: (9=клинок v1, 11=вирус)
type LayerStyle = {
  top?: string | number; left?: string | number; right?: string | number; bottom?: string | number;
  width?: string; height?: string; objectFit?: React.CSSProperties['objectFit'];
  objectPosition?: string; opacity?: number; mixBlendMode?: React.CSSProperties['mixBlendMode'];
};
const EQUIPMENT_LAYERS: Record<number, { url: string; slot: string; style?: LayerStyle }> = {
  // head items — шлем-визор
  1: { url: 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/808a5d7e-ab11-472f-b303-2eb0b17838b3.jpg', slot: 'head', style: { top: 0, left: 0, right: 0, height: '35%', objectFit: 'cover', objectPosition: 'top', opacity: 0.85, mixBlendMode: 'screen' } },
  2: { url: 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/808a5d7e-ab11-472f-b303-2eb0b17838b3.jpg', slot: 'head', style: { top: 0, left: 0, right: 0, height: '35%', objectFit: 'cover', objectPosition: 'top', opacity: 0.9, mixBlendMode: 'screen' } },
  3: { url: 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/808a5d7e-ab11-472f-b303-2eb0b17838b3.jpg', slot: 'head', style: { top: 0, left: 0, right: 0, height: '38%', objectFit: 'cover', objectPosition: 'top', opacity: 0.95, mixBlendMode: 'screen' } },
  // body items — броня
  5: { url: 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/d9e56ebb-a248-4552-b6f6-59083eb9a589.jpg', slot: 'body', style: { top: '30%', left: 0, right: 0, bottom: '20%', objectFit: 'cover', opacity: 0.75, mixBlendMode: 'screen' } },
  6: { url: 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/d9e56ebb-a248-4552-b6f6-59083eb9a589.jpg', slot: 'body', style: { top: '28%', left: 0, right: 0, bottom: '18%', objectFit: 'cover', opacity: 0.85, mixBlendMode: 'screen' } },
  7: { url: 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/8340a2dc-3e97-435f-bbfc-4e7b631e109b.jpg', slot: 'body', style: { top: '25%', left: 0, right: 0, bottom: '15%', objectFit: 'cover', opacity: 0.9, mixBlendMode: 'screen' } },
  8: { url: 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/8340a2dc-3e97-435f-bbfc-4e7b631e109b.jpg', slot: 'body', style: { top: '22%', left: 0, right: 0, bottom: '12%', objectFit: 'cover', opacity: 0.95, mixBlendMode: 'screen' } },
  // weapon items
  9: { url: 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/bc18c7dc-e044-4163-bad8-2f635aa6a729.jpg', slot: 'weapon', style: { right: '-5%', top: '35%', width: '40%', height: '45%', objectFit: 'contain', opacity: 0.9 } },
  10: { url: 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/bc18c7dc-e044-4163-bad8-2f635aa6a729.jpg', slot: 'weapon', style: { right: '-8%', top: '30%', width: '42%', height: '50%', objectFit: 'contain', opacity: 0.95 } },
  11: { url: 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/bc18c7dc-e044-4163-bad8-2f635aa6a729.jpg', slot: 'weapon', style: { right: '-10%', top: '28%', width: '45%', height: '52%', objectFit: 'contain', opacity: 1 } },
  12: { url: 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/bc18c7dc-e044-4163-bad8-2f635aa6a729.jpg', slot: 'weapon', style: { right: '-10%', top: '25%', width: '48%', height: '55%', objectFit: 'contain', opacity: 1 } },
};

export default function CharacterProfile() {
  const { character, inventory, refreshInventory, setCharacter } = useGame();
  const [activeTab, setActiveTab] = useState<'stats' | 'equipment' | 'inventory'>('stats');
  const [equipLoading, setEquipLoading] = useState<number | null>(null);
  const [unequipLoading, setUnequipLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => { refreshInventory(); }, []);

  if (!character) return null;

  const xpPct = Math.round((character.xp / character.xp_to_next) * 100);
  const hpPct = Math.round((character.hp / character.max_hp) * 100);
  const baseImg = CLASS_BASE_IMG[character.class] || CLASS_BASE_IMG.hacker;
  const classColor: Record<string, string> = { hacker: '#00ffff', netrunner: '#ff00ff', street_samurai: '#ffff00' };
  const charColor = classColor[character.class] || '#00ffff';

  const equip = async (item: InventoryItem) => {
    setEquipLoading(item.item_id);
    const data = await api.character.equip(item.item_id);
    setEquipLoading(null);
    if (data.error) { setMsg('⚠ ' + data.error); setTimeout(() => setMsg(''), 3000); return; }
    setCharacter(data);
    setMsg(`✅ ${item.name} надет!`);
    setTimeout(() => setMsg(''), 2500);
  };

  const unequip = async (slot: string) => {
    setUnequipLoading(slot);
    const data = await api.character.unequip(slot);
    setUnequipLoading(null);
    if (data.error) { setMsg('⚠ ' + data.error); setTimeout(() => setMsg(''), 3000); return; }
    setCharacter(data);
    setMsg('✅ Предмет снят');
    setTimeout(() => setMsg(''), 2500);
  };

  // Собираем активные слои от экипировки
  const activeEquipLayers = Object.values(character.equipment)
    .filter(Boolean)
    .map(e => e && EQUIPMENT_LAYERS[e.id])
    .filter(Boolean);

  // Подсветка цветом экипировки
  const equipGlowColor = (() => {
    const equipped = Object.values(character.equipment).filter(Boolean);
    if (!equipped.length) return charColor;
    const rarityOrder = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
    const best = rarityOrder.find(r => equipped.some(e => e?.rarity === r));
    const rarityColors: Record<string, string> = { legendary: '#ffaa00', epic: '#aa00ff', rare: '#00aaff', uncommon: '#00ff41', common: '#aaaaaa' };
    return rarityColors[best || 'common'];
  })();

  return (
    <section className="py-8 px-4 lg:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="text-xs font-mono tracking-widest mb-1" style={{ color: charColor + '99' }}>// ПРОФИЛЬ</div>
          <h2 className="font-orbitron text-2xl text-white">ПЕРСОНАЖ</h2>
        </div>

        {msg && (
          <div className="mb-4 font-mono text-sm text-cyber-green animate-fade-in-up border border-cyber-green/30 bg-cyber-green/5 px-4 py-2">{msg}</div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* === CHARACTER VISUAL === */}
          <div className="flex-shrink-0 flex flex-col items-center gap-4">
            {/* Layered character display */}
            <div className="relative">
              <div
                className="w-52 h-72 relative overflow-hidden border-2 transition-all duration-500"
                style={{
                  borderColor: equipGlowColor,
                  boxShadow: `0 0 30px ${equipGlowColor}25, 0 0 60px ${equipGlowColor}10`,
                  clipPath: 'polygon(0 0, 90% 0, 100% 10%, 100% 100%, 10% 100%, 0 90%)',
                  backgroundColor: '#050a0e',
                }}
              >
                {/* Base character image */}
                <img src={baseImg} alt={character.name}
                  className="absolute inset-0 w-full h-full object-cover object-top" />

                {/* Equipment overlay layers */}
                {activeEquipLayers.map((layer, idx) => layer && (
                  <img
                    key={idx}
                    src={layer.url}
                    alt="equipment layer"
                    className="absolute transition-opacity duration-300"
                    style={layer.style as React.CSSProperties}
                  />
                ))}

                {/* Rarity glow border animated */}
                {Object.values(character.equipment).some(Boolean) && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `linear-gradient(180deg, ${equipGlowColor}08 0%, transparent 40%, transparent 70%, ${equipGlowColor}12 100%)`,
                    }}
                  />
                )}

                {/* Equipment indicator dots */}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {Object.entries(character.equipment).map(([slot, item]) => item && (
                    <div key={slot} className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: RARITY_COLORS[item.rarity], boxShadow: `0 0 4px ${RARITY_COLORS[item.rarity]}` }} />
                  ))}
                </div>
              </div>

              {/* Level badge */}
              <div
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 font-orbitron text-sm whitespace-nowrap border"
                style={{ color: charColor, borderColor: charColor, backgroundColor: '#050a0e', boxShadow: `0 0 12px ${charColor}30` }}
              >
                LVL {character.level}
              </div>
            </div>

            {/* Name & class */}
            <div className="mt-4 text-center">
              <div className="font-orbitron text-white text-lg">{character.name}</div>
              <div className="font-mono text-xs mt-0.5 capitalize" style={{ color: charColor }}>
                {character.class.replace('_', ' ')} · Глава {character.current_chapter}
              </div>
            </div>

            {/* Bars */}
            <div className="w-52 space-y-2">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-red-400">HP</span>
                  <span className="text-red-400">{character.hp}/{character.max_hp}</span>
                </div>
                <div className="h-2 bg-black/60 w-full border border-red-500/20">
                  <div className="h-full transition-all duration-500"
                    style={{ width: `${hpPct}%`, backgroundColor: '#ff4060', boxShadow: '0 0 6px #ff406080' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span style={{ color: charColor }}>XP</span>
                  <span style={{ color: charColor }}>{character.xp}/{character.xp_to_next}</span>
                </div>
                <div className="h-2 bg-black/60 w-full border border-cyber-cyan/10">
                  <div className="h-full transition-all duration-500"
                    style={{ width: `${xpPct}%`, backgroundColor: charColor, boxShadow: `0 0 6px ${charColor}60` }} />
                </div>
              </div>
            </div>

            {/* Coins */}
            <div className="w-52 border border-yellow-500/20 bg-yellow-500/5 py-2 text-center">
              <span className="font-orbitron text-yellow-400 text-lg">🪙 {character.coins}</span>
              <span className="text-gray-600 font-mono text-xs ml-2">монет</span>
            </div>

            {/* Equipped items quick view */}
            <div className="w-52">
              <div className="font-mono text-[10px] text-gray-600 mb-2 tracking-widest">// НАДЕТО</div>
              <div className="grid grid-cols-3 gap-1.5">
                {Object.entries(SLOT_LABELS).map(([slot]) => {
                  const item = character.equipment[slot];
                  const color = item ? RARITY_COLORS[item.rarity] : '#1a1a1a';
                  return (
                    <div
                      key={slot}
                      title={item ? `${item.name} (${SLOT_LABELS[slot]})` : SLOT_LABELS[slot]}
                      className="aspect-square flex items-center justify-center border transition-all cursor-default"
                      style={{ borderColor: color + (item ? '60' : '30'), backgroundColor: color + (item ? '15' : '05') }}
                    >
                      {item ? (
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}` }} />
                      ) : (
                        <Icon name={SLOT_ICONS[slot] as 'Crown'} size={12} style={{ color: '#2a2a2a' }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* === TABS === */}
          <div className="flex-1 min-w-0">
            <div className="flex border-b border-white/8 mb-4">
              {[
                { id: 'stats', label: 'СТАТЫ' },
                { id: 'equipment', label: 'ЭКИПИРОВКА' },
                { id: 'inventory', label: `ИНВЕНТАРЬ (${inventory.length})` },
              ].map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id as typeof activeTab)}
                  className={`px-4 py-2.5 font-orbitron text-xs tracking-wider transition-all border-b-2 ${
                    activeTab === t.id
                      ? 'border-b-cyber-cyan text-cyber-cyan'
                      : 'border-transparent text-gray-600 hover:text-gray-400'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* STATS tab */}
            {activeTab === 'stats' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(character.effective_stats).map(([stat, val]) => {
                  const base = character.base_stats[stat] || 0;
                  const bonus = character.equipment_bonuses[stat] || 0;
                  const color = STAT_COLORS[stat] || '#00ffff';
                  return (
                    <div key={stat} className="cyber-panel p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs text-gray-500">{STAT_LABELS[stat]}</span>
                        <div className="flex items-center gap-1.5">
                          {bonus > 0 && <span className="font-mono text-xs text-cyber-green">+{bonus}</span>}
                          <span className="font-orbitron text-base font-bold" style={{ color }}>{val}</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-black/50">
                        <div className="h-full transition-all duration-700"
                          style={{ width: `${Math.min((val / 30) * 100, 100)}%`, background: `linear-gradient(90deg, ${color}50, ${color})`, boxShadow: `0 0 8px ${color}50` }} />
                      </div>
                      <div className="text-gray-700 text-[10px] font-mono mt-1">База: {base}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* EQUIPMENT tab */}
            {activeTab === 'equipment' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(SLOT_LABELS).map(([slot, label]) => {
                  const item = character.equipment[slot];
                  const color = item ? RARITY_COLORS[item.rarity] : '#222';
                  return (
                    <div key={slot} className="cyber-panel p-3 flex items-center gap-3 transition-all"
                      style={{ borderColor: item ? color + '50' : '#ffffff08' }}>
                      <div className="w-10 h-10 flex items-center justify-center border flex-shrink-0 transition-all"
                        style={{ borderColor: color + '50', backgroundColor: color + '10' }}>
                        <Icon name={SLOT_ICONS[slot] as 'Crown'} size={18} style={{ color: item ? color : '#333' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-600 text-[10px] font-mono tracking-wide">{label}</div>
                        {item ? (
                          <>
                            <div className="font-rajdhani text-sm font-semibold leading-tight truncate" style={{ color }}>{item.name}</div>
                            <div className="font-mono text-[10px] text-gray-600">{RARITY_LABELS[item.rarity]}</div>
                            <div className="font-mono text-[10px] text-cyber-green">
                              {Object.entries(item.stat_bonus).map(([s, v]) => `+${v} ${STAT_LABELS[s]}`).join(' ')}
                            </div>
                          </>
                        ) : (
                          <div className="text-gray-700 text-xs font-mono italic mt-0.5">Пусто</div>
                        )}
                      </div>
                      {item && (
                        <button onClick={() => unequip(slot)} disabled={unequipLoading === slot}
                          className="text-gray-700 hover:text-red-400 transition-colors flex-shrink-0 p-1" title="Снять">
                          <Icon name="X" size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* INVENTORY tab */}
            {activeTab === 'inventory' && (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {inventory.length === 0 ? (
                  <div className="text-center py-12 text-gray-600 font-mono text-sm">
                    <div className="text-4xl mb-3">📦</div>
                    Инвентарь пуст<br />
                    <span className="text-xs">Победи врагов или купи предметы в магазине</span>
                  </div>
                ) : inventory.map(item => {
                  const color = RARITY_COLORS[item.rarity] || '#aaa';
                  const isEquipped = Object.values(character.equipment).some(e => e?.id === item.item_id);
                  const hasLayer = !!EQUIPMENT_LAYERS[item.item_id];
                  return (
                    <div key={item.inv_id}
                      className="cyber-panel p-3 flex items-center gap-3 transition-all"
                      style={{ borderColor: isEquipped ? color + '60' : '#ffffff08' }}>
                      <div className="w-10 h-10 flex items-center justify-center border flex-shrink-0"
                        style={{ borderColor: color + '50', backgroundColor: color + '10' }}>
                        <span style={{ color }} className="text-base">
                          {item.type === 'weapon' ? '⚔️' : item.type === 'head' ? '🪖' : item.type === 'body' ? '🛡️' : item.type === 'implant' ? '🔩' : '🔧'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-rajdhani text-sm font-semibold" style={{ color }}>{item.name}</span>
                          {isEquipped && <span className="text-cyber-green text-[10px] font-mono">▶ НАДЕТО</span>}
                          {hasLayer && !isEquipped && <span className="text-cyber-cyan text-[10px] font-mono">👁 слой</span>}
                        </div>
                        <div className="text-gray-600 text-[10px] font-mono">
                          {RARITY_LABELS[item.rarity]} · {SLOT_LABELS[item.type]}
                        </div>
                        <div className="text-cyber-green text-[10px] font-mono">
                          {Object.entries(item.stat_bonus).map(([s, v]) => `+${v} ${STAT_LABELS[s]}`).join(' ')}
                        </div>
                      </div>
                      {!isEquipped && (
                        <button onClick={() => equip(item)} disabled={equipLoading === item.item_id}
                          className="font-orbitron text-xs px-3 py-1.5 border transition-all flex-shrink-0 disabled:opacity-40"
                          style={{ borderColor: color, color, backgroundColor: color + '10' }}>
                          {equipLoading === item.item_id ? '...' : 'НАДЕТЬ'}
                        </button>
                      )}
                      {isEquipped && (
                        <button onClick={() => unequip(item.type)} disabled={unequipLoading === item.type}
                          className="font-orbitron text-xs px-3 py-1.5 border border-red-500/40 text-red-400 transition-all flex-shrink-0 disabled:opacity-40">
                          СНЯТЬ
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}