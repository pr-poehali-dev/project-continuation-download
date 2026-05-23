import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { useGame, InventoryItem } from '@/lib/GameContext';
import { api } from '@/lib/api';
import EquipmentBadges from '@/components/EquipmentBadges';
import { getAvatar } from '@/lib/characterAvatars';

const RARITY_COLORS: Record<string, string> = {
  common: '#aaaaaa', uncommon: '#00ff41', rare: '#00aaff', epic: '#aa00ff', legendary: '#ffaa00',
};
const RARITY_LABELS: Record<string, string> = {
  common: 'Обычный', uncommon: 'Необычный', rare: 'Редкий', epic: 'Эпический', legendary: 'Легендарный',
};

const SLOTS = ['head', 'body', 'weapon', 'gloves', 'boots', 'implant'] as const;
type Slot = typeof SLOTS[number];

const SLOT_META: Record<Slot, { label: string; icon: string; emoji: string }> = {
  head:    { label: 'Шлем',      icon: 'Crown',      emoji: '🪖' },
  body:    { label: 'Броня',     icon: 'Shield',     emoji: '🛡️' },
  weapon:  { label: 'Оружие',    icon: 'Zap',        emoji: '⚔️' },
  gloves:  { label: 'Перчатки',  icon: 'Hand',       emoji: '🔧' },
  boots:   { label: 'Ботинки',   icon: 'Footprints', emoji: '👟' },
  implant: { label: 'Имплант',   icon: 'Cpu',        emoji: '🔩' },
};

const STAT_META: { key: string; label: string; color: string; icon: string }[] = [
  { key: 'strength',     label: 'Сила',       color: '#ff4060', icon: '💪' },
  { key: 'agility',      label: 'Ловкость',   color: '#ffff00', icon: '⚡' },
  { key: 'intelligence', label: 'Интеллект',  color: '#00ffff', icon: '🧠' },
  { key: 'defense',      label: 'Защита',     color: '#00ff41', icon: '🛡️' },
  { key: 'luck',         label: 'Удача',      color: '#aa00ff', icon: '🎲' },
];

const CLASS_COLOR: Record<string, string> = {
  cipher: '#00ff41', data_ghost: '#00aaff', neural_architect: '#aa00ff',
  hacker: '#00ff41', netrunner: '#00aaff', street_samurai: '#aa00ff',
};

const CLASS_LABEL: Record<string, string> = {
  cipher: 'CIPHER', data_ghost: 'DATA GHOST', neural_architect: 'NEURAL ARCHITECT',
  hacker: 'CIPHER', netrunner: 'DATA GHOST', street_samurai: 'NEURAL ARCHITECT',
};

export default function CharacterProfile() {
  const { character, inventory, refreshInventory, setCharacter } = useGame();
  const [activeTab, setActiveTab] = useState<'stats' | 'equipment' | 'inventory'>('equipment');
  const [equipLoading, setEquipLoading] = useState<number | null>(null);
  const [unequipLoading, setUnequipLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => { refreshInventory(); }, []);

  if (!character) return null;

  const charColor = CLASS_COLOR[character.class] || '#00ff41';
  const charImg   = getAvatar(character.class, character.gender);
  const xpPct     = Math.round((character.xp / character.xp_to_next) * 100);
  const hpPct     = Math.round((character.hp / character.max_hp) * 100);

  // Лучшая редкость надетого
  const equippedItems = Object.values(character.equipment || {}).filter(Boolean);
  const rarityOrder   = ['legendary','epic','rare','uncommon','common'];
  const bestRarity    = rarityOrder.find(r => equippedItems.some(e => e?.rarity === r));
  const glowColor     = bestRarity
    ? RARITY_COLORS[bestRarity]
    : charColor;

  const showMsg = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 2500);
  };

  const equip = async (item: InventoryItem) => {
    setEquipLoading(item.item_id);
    const data = await api.character.equip(item.item_id);
    setEquipLoading(null);
    if (data.error) { showMsg('⚠ ' + data.error, false); return; }
    setCharacter(data);
    showMsg(`✅ ${item.name} надет`);
  };

  const unequip = async (slot: string) => {
    setUnequipLoading(slot);
    const data = await api.character.unequip(slot);
    setUnequipLoading(null);
    if (data.error) { showMsg('⚠ ' + data.error, false); return; }
    setCharacter(data);
    showMsg('✅ Предмет снят');
  };

  const switchGender = async (g: 'male' | 'female') => {
    if (g === character.gender) return;
    const data = await api.character.setGender(g);
    if (data.error) { showMsg('⚠ ' + data.error, false); return; }
    setCharacter(data);
    showMsg(g === 'female' ? '✅ Пол сменён на женский' : '✅ Пол сменён на мужской');
  };

  // Предметы инвентаря, которые можно надеть
  const equipableItems = inventory.filter(i => i.item_type === 'equipment' || SLOTS.includes(i.slot as Slot));

  return (
    <section className="min-h-screen py-8 px-4 lg:px-6 relative">
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <div className="mb-6">
          <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-1">// CODEGRID-9 · ПРОФИЛЬ АГЕНТА</div>
          <h2 className="font-orbitron text-2xl text-white">ПЕРСОНАЖ</h2>
        </div>

        {/* Toast */}
        {msg && (
          <div className={`mb-4 font-mono text-sm px-4 py-2 border animate-fade-in-up ${msg.ok ? 'text-cyber-green border-cyber-green/30 bg-cyber-green/5' : 'text-red-400 border-red-500/30 bg-red-500/5'}`}>
            {msg.text}
          </div>
        )}

        {/* ─── Main layout ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

          {/* ══ LEFT: Portrait + bars ══ */}
          <div className="flex flex-col gap-4">

            {/* Portrait */}
            <div className="relative">
              <div
                className="w-full aspect-[3/4] max-w-[280px] mx-auto overflow-hidden border-2 relative"
                style={{
                  borderColor: glowColor + '80',
                  boxShadow: `0 0 40px ${glowColor}20, 0 0 80px ${glowColor}08`,
                  clipPath: 'polygon(0 0, 92% 0, 100% 8%, 100% 100%, 8% 100%, 0 92%)',
                  backgroundColor: '#050a0e',
                }}
              >
                <img
                  src={charImg}
                  alt={character.name}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0" style={{
                  background: `linear-gradient(to top, rgba(5,10,14,0.95) 0%, rgba(5,10,14,0.4) 35%, transparent 60%)`
                }} />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="font-orbitron text-white text-lg font-black leading-tight drop-shadow-lg">
                    {character.name}
                  </div>
                  <div className="font-mono text-xs mt-0.5" style={{ color: charColor }}>
                    {CLASS_LABEL[character.class] ?? character.class.toUpperCase()}
                  </div>
                </div>
                <div
                  className="absolute top-3 right-3 px-2.5 py-1 font-orbitron text-xs font-black border"
                  style={{ color: charColor, borderColor: charColor, backgroundColor: '#050a0ecc', boxShadow: `0 0 10px ${charColor}30` }}
                >
                  LVL {character.level}
                </div>
                <EquipmentBadges size="lg" />
              </div>
            </div>

            {/* HP / XP bars */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between font-mono text-xs mb-1">
                  <span className="text-red-400">❤ HP</span>
                  <span className="text-red-400">{character.hp} / {character.max_hp}</span>
                </div>
                <div className="h-2.5 bg-black/70 border border-red-500/20 overflow-hidden">
                  <div className="h-full transition-all duration-700"
                    style={{ width: `${hpPct}%`, backgroundColor: '#ff4060', boxShadow: '0 0 8px #ff406080' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between font-mono text-xs mb-1">
                  <span style={{ color: charColor }}>◆ XP</span>
                  <span style={{ color: charColor }}>{character.xp} / {character.xp_to_next}</span>
                </div>
                <div className="h-2.5 bg-black/70 overflow-hidden" style={{ border: `1px solid ${charColor}20` }}>
                  <div className="h-full transition-all duration-700"
                    style={{ width: `${xpPct}%`, backgroundColor: charColor, boxShadow: `0 0 8px ${charColor}60` }} />
                </div>
              </div>
            </div>

            {/* Creds */}
            <div className="border border-yellow-500/25 bg-yellow-500/5 px-4 py-3 flex items-center justify-between">
              <span className="font-mono text-[11px] text-gray-600">КРЕДИТЫ</span>
              <span className="font-orbitron text-yellow-400 text-lg font-black">⚡ {character.coins}</span>
            </div>

            {/* Chapter */}
            <div className="border border-white/5 px-4 py-3 flex items-center justify-between">
              <span className="font-mono text-[11px] text-gray-600">ГЛАВА</span>
              <span className="font-orbitron text-white text-sm">{character.current_chapter}</span>
            </div>

            {/* Gender switcher */}
            <div className="border border-white/5 px-4 py-3">
              <div className="font-mono text-[11px] text-gray-600 mb-2">ВНЕШНОСТЬ</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => switchGender('male')}
                  className={`px-2 py-1.5 font-orbitron text-xs border transition-all ${
                    (character.gender || 'male') === 'male'
                      ? 'border-cyber-cyan text-cyber-cyan bg-cyber-cyan/10'
                      : 'border-white/10 text-gray-500 hover:border-white/30 hover:text-gray-300'
                  }`}
                >
                  ♂ Мужской
                </button>
                <button
                  onClick={() => switchGender('female')}
                  className={`px-2 py-1.5 font-orbitron text-xs border transition-all ${
                    character.gender === 'female'
                      ? 'border-cyber-magenta text-cyber-magenta bg-cyber-magenta/10'
                      : 'border-white/10 text-gray-500 hover:border-white/30 hover:text-gray-300'
                  }`}
                >
                  ♀ Женский
                </button>
              </div>
            </div>
          </div>

          {/* ══ RIGHT: Tabs ══ */}
          <div className="flex flex-col">

            {/* Tab bar */}
            <div className="flex border-b border-white/8 mb-5">
              {([
                { id: 'equipment', label: 'Экипировка',  icon: 'Shield' },
                { id: 'stats',     label: 'Характеристики', icon: 'BarChart2' },
                { id: 'inventory', label: 'Инвентарь',   icon: 'Package' },
              ] as const).map(tab => (
                <button key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 px-5 py-3 font-mono text-xs transition-all border-b-2"
                  style={{
                    color: activeTab === tab.id ? charColor : '#555',
                    borderBottomColor: activeTab === tab.id ? charColor : 'transparent',
                    backgroundColor: activeTab === tab.id ? charColor + '08' : 'transparent',
                  }}>
                  <Icon name={tab.icon} size={13} />
                  {tab.label.toUpperCase()}
                </button>
              ))}
            </div>

            {/* ── TAB: EQUIPMENT ── */}
            {activeTab === 'equipment' && (
              <div>
                <div className="font-mono text-[10px] text-gray-600 mb-4 tracking-widest">
                  // СЛОТЫ ЭКИПИРОВКИ — нажми надетый предмет чтобы снять
                </div>

                {/* 6 slots grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {SLOTS.map(slot => {
                    const item = character.equipment?.[slot];
                    const meta = SLOT_META[slot];
                    const color = item ? RARITY_COLORS[item.rarity] : '#222';
                    const isUnequipping = unequipLoading === slot;
                    return (
                      <div key={slot}
                        className="border p-3 transition-all relative group"
                        style={{
                          borderColor: item ? color + '60' : '#1a1a1a',
                          backgroundColor: item ? color + '08' : '#0a0a0a',
                        }}>
                        {/* Slot header */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base">{meta.emoji}</span>
                          <span className="font-mono text-[10px] text-gray-600">{meta.label.toUpperCase()}</span>
                        </div>

                        {item ? (
                          /* Надет предмет */
                          <div>
                            <div className="font-rajdhani text-sm font-semibold leading-tight mb-1"
                              style={{ color }}>
                              {item.name}
                            </div>
                            <div className="font-mono text-[9px] mb-2" style={{ color: color + '80' }}>
                              {RARITY_LABELS[item.rarity]}
                            </div>
                            {/* Бонусы */}
                            {item.stats && Object.entries(item.stats).filter(([,v]) => v).map(([k, v]) => (
                              <div key={k} className="font-mono text-[9px] text-gray-600">
                                +{v} {k}
                              </div>
                            ))}
                            {/* Кнопка снять */}
                            <button
                              onClick={() => unequip(slot)}
                              disabled={isUnequipping}
                              className="mt-2 w-full font-mono text-[9px] py-1 border transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                              style={{ borderColor: '#ff406050', color: '#ff4060', backgroundColor: '#ff406010' }}>
                              {isUnequipping ? '...' : 'СНЯТЬ'}
                            </button>
                          </div>
                        ) : (
                          /* Пустой слот */
                          <div className="flex flex-col items-center justify-center py-3 gap-1">
                            <Icon name={meta.icon as 'Shield'} size={20} style={{ color: '#2a2a2a' }} />
                            <span className="font-mono text-[9px] text-gray-700">пусто</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Summary */}
                {equippedItems.length > 0 && (
                  <div className="border border-white/5 p-4">
                    <div className="font-mono text-[10px] text-gray-600 mb-3 tracking-widest">// СУММАРНЫЕ БОНУСЫ</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {STAT_META.map(s => {
                        const bonus = equippedItems.reduce((acc, item) => {
                          return acc + ((item?.stats?.[s.key] as number) || 0);
                        }, 0);
                        if (!bonus) return null;
                        return (
                          <div key={s.key} className="flex items-center gap-2">
                            <span className="text-sm">{s.icon}</span>
                            <div>
                              <div className="font-mono text-[9px] text-gray-600">{s.label}</div>
                              <div className="font-orbitron text-xs font-black" style={{ color: s.color }}>+{bonus}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: STATS ── */}
            {activeTab === 'stats' && (
              <div className="space-y-3">
                <div className="font-mono text-[10px] text-gray-600 mb-2 tracking-widest">// ХАРАКТЕРИСТИКИ ПЕРСОНАЖА</div>
                {STAT_META.map(s => {
                  const base = (character.stats?.[s.key] as number) || 0;
                  const bonus = equippedItems.reduce((acc, item) => acc + ((item?.stats?.[s.key] as number) || 0), 0);
                  const total = base + bonus;
                  const pct   = Math.min(100, (total / 25) * 100);
                  return (
                    <div key={s.key} className="flex items-center gap-3">
                      <span className="text-base w-6 text-center flex-shrink-0">{s.icon}</span>
                      <span className="font-mono text-xs text-gray-500 w-24 flex-shrink-0">{s.label}</span>
                      <div className="flex-1 h-2.5 bg-black/60 border overflow-hidden" style={{ borderColor: s.color + '20' }}>
                        <div className="h-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: s.color, boxShadow: `0 0 6px ${s.color}60` }} />
                      </div>
                      <div className="w-12 text-right">
                        <span className="font-orbitron text-sm font-black" style={{ color: s.color }}>{total}</span>
                        {bonus > 0 && (
                          <span className="font-mono text-[9px] text-gray-600 ml-1">(+{bonus})</span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Level info */}
                <div className="mt-6 border border-white/5 p-4 grid grid-cols-2 gap-4">
                  {[
                    { label: 'Уровень', value: character.level, color: charColor },
                    { label: 'Глава',   value: character.current_chapter, color: '#00ffff' },
                    { label: 'Макс HP', value: character.max_hp, color: '#ff4060' },
                    { label: 'Монеты',  value: character.coins, color: '#ffaa00' },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="font-mono text-[10px] text-gray-600 mb-0.5">{s.label}</div>
                      <div className="font-orbitron text-lg font-black" style={{ color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB: INVENTORY ── */}
            {activeTab === 'inventory' && (
              <div>
                <div className="font-mono text-[10px] text-gray-600 mb-4 tracking-widest">
                  // ИНВЕНТАРЬ — нажми предмет чтобы надеть
                </div>
                {equipableItems.length === 0 ? (
                  <div className="text-center py-16 text-gray-600 font-mono text-sm">
                    <div className="text-4xl mb-3">📦</div>
                    <div>Инвентарь пуст</div>
                    <div className="text-[10px] mt-1 text-gray-700">Зарабатывай предметы в подземельях и в магазине</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {equipableItems.map(item => {
                      const color = RARITY_COLORS[item.rarity] || '#aaa';
                      const isEquipped = Object.values(character.equipment).some(e => e?.id === item.item_id);
                      const isLoading = equipLoading === item.item_id;
                      return (
                        <div key={item.item_id}
                          className="border p-3 transition-all flex items-start gap-3"
                          style={{
                            borderColor: isEquipped ? color + '60' : color + '25',
                            backgroundColor: isEquipped ? color + '08' : 'transparent',
                          }}>
                          {/* Item icon */}
                          <div className="w-10 h-10 border flex items-center justify-center flex-shrink-0 text-lg"
                            style={{ borderColor: color + '40', backgroundColor: color + '10' }}>
                            {item.slot === 'head' ? '🪖' : item.slot === 'body' ? '🛡️' : item.slot === 'weapon' ? '⚔️' : item.slot === 'implant' ? '🔩' : item.slot === 'boots' ? '👟' : '🔧'}
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="font-rajdhani text-sm font-semibold" style={{ color }}>{item.name}</div>
                            <div className="font-mono text-[9px]" style={{ color: color + '80' }}>{RARITY_LABELS[item.rarity]} · {SLOT_META[item.slot as Slot]?.label ?? item.slot}</div>
                            {item.stats && (
                              <div className="flex flex-wrap gap-2 mt-1">
                                {Object.entries(item.stats).filter(([,v]) => v).map(([k,v]) => (
                                  <span key={k} className="font-mono text-[9px] text-gray-600">+{v as number} {k}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          {/* Action */}
                          <div className="flex-shrink-0">
                            {isEquipped ? (
                              <button
                                onClick={() => unequip(item.slot)}
                                className="font-mono text-[9px] px-2 py-1 border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-all">
                                СНЯТЬ
                              </button>
                            ) : (
                              <button
                                onClick={() => equip(item)}
                                disabled={isLoading}
                                className="font-mono text-[9px] px-2 py-1 border transition-all disabled:opacity-50"
                                style={{ borderColor: color + '50', color, backgroundColor: color + '10' }}>
                                {isLoading ? '...' : 'НАДЕТЬ'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </section>
  );
}