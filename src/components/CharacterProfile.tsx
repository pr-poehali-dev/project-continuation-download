import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { useGame, InventoryItem } from '@/lib/GameContext';
import { api } from '@/lib/api';

const RARITY_COLORS: Record<string, string> = {
  common: '#aaaaaa',
  uncommon: '#00ff41',
  rare: '#00aaff',
  epic: '#aa00ff',
  legendary: '#ffaa00',
};

const RARITY_LABELS: Record<string, string> = {
  common: 'Обычный', uncommon: 'Необычный', rare: 'Редкий', epic: 'Эпический', legendary: 'Легендарный',
};

const SLOT_LABELS: Record<string, string> = {
  head: 'Шлем', body: 'Броня', weapon: 'Оружие',
  gloves: 'Перчатки', boots: 'Ботинки', implant: 'Имплант',
};
const SLOT_ICONS: Record<string, string> = {
  head: 'Crown', body: 'Shield', weapon: 'Zap',
  gloves: 'Hand', boots: 'Footprints', implant: 'Cpu',
};
const STAT_LABELS: Record<string, string> = {
  strength: 'Сила', agility: 'Ловкость', intelligence: 'Интеллект', defense: 'Защита', luck: 'Удача',
};
const STAT_COLORS: Record<string, string> = {
  strength: '#ff4060', agility: '#ffff00', intelligence: '#00ffff', defense: '#00ff41', luck: '#aa00ff',
};

export default function CharacterProfile() {
  const { character, inventory, refreshCharacter, refreshInventory, setCharacter } = useGame();
  const [activeTab, setActiveTab] = useState<'stats' | 'equipment' | 'skills' | 'inventory'>('stats');
  const [equipLoading, setEquipLoading] = useState<number | null>(null);
  const [unequipLoading, setUnequipLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    refreshInventory();
  }, []);

  if (!character) return null;

  const xpPct = Math.round((character.xp / character.xp_to_next) * 100);
  const hpPct = Math.round((character.hp / character.max_hp) * 100);

  const equip = async (item: InventoryItem) => {
    setEquipLoading(item.item_id);
    const data = await api.character.equip(item.item_id);
    setEquipLoading(null);
    if (data.error) { setMsg('⚠ ' + data.error); return; }
    setCharacter(data);
    setMsg(`✅ ${item.name} надет!`);
    setTimeout(() => setMsg(''), 2000);
  };

  const unequip = async (slot: string) => {
    setUnequipLoading(slot);
    const data = await api.character.unequip(slot);
    setUnequipLoading(null);
    if (data.error) { setMsg('⚠ ' + data.error); return; }
    setCharacter(data);
    setMsg('✅ Предмет снят');
    setTimeout(() => setMsg(''), 2000);
  };

  return (
    <section className="py-16 px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="text-cyber-magenta font-mono text-xs tracking-widest mb-2">// МОДУЛЬ</div>
          <h2 className="font-orbitron text-3xl text-white">ПРОФИЛЬ ПЕРСОНАЖА</h2>
          <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent mx-auto mt-3" />
        </div>

        {msg && (
          <div className="mb-4 text-center font-mono text-sm text-cyber-green animate-fade-in-up">{msg}</div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Character display */}
          <div className="cyber-panel p-6 flex flex-col items-center gap-4 animate-fade-in-up">
            <div className="relative">
              <div className="w-40 h-48 bg-cyber-dark/80 border border-cyber-magenta/40 flex items-center justify-center relative overflow-hidden"
                style={{ clipPath: 'polygon(0 0, 90% 0, 100% 10%, 100% 100%, 10% 100%, 0 90%)' }}>
                {/* Character layers */}
                <img
                  src="https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/f55d91c1-7259-4e87-a724-646937adde3d.jpg"
                  alt="Character base"
                  className="absolute inset-0 w-full h-full object-cover object-top opacity-80"
                />
                {/* Equipment overlay effects */}
                {character.equipment.head && (
                  <div className="absolute top-0 left-0 right-0 h-1/3 border-t-2 opacity-60"
                    style={{ borderColor: RARITY_COLORS[character.equipment.head.rarity] }} />
                )}
                {character.equipment.weapon && (
                  <div className="absolute right-1 top-1/3 w-1 h-1/3 opacity-70"
                    style={{ backgroundColor: RARITY_COLORS[character.equipment.weapon.rarity], boxShadow: `0 0 8px ${RARITY_COLORS[character.equipment.weapon.rarity]}` }} />
                )}
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-cyber-dark border border-cyber-cyan px-4 py-1 font-orbitron text-cyber-cyan text-sm whitespace-nowrap">
                LVL {character.level}
              </div>
            </div>

            <div className="mt-4 text-center w-full">
              <div className="font-orbitron text-white text-lg">{character.name}</div>
              <div className="text-cyber-cyan text-xs font-mono capitalize">{character.class} · Глава {character.current_chapter}</div>
            </div>

            {/* HP */}
            <div className="w-full">
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-red-400">HP</span>
                <span className="text-red-400">{character.hp}/{character.max_hp}</span>
              </div>
              <div className="xp-bar">
                <div className="hp-bar-fill h-full transition-all duration-500" style={{ width: `${hpPct}%` }} />
              </div>
            </div>

            {/* XP */}
            <div className="w-full">
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-cyber-cyan">XP</span>
                <span className="text-cyber-cyan">{character.xp}/{character.xp_to_next}</span>
              </div>
              <div className="xp-bar">
                <div className="xp-bar-fill" style={{ width: `${xpPct}%` }} />
              </div>
            </div>

            {/* Coins */}
            <div className="w-full flex items-center justify-center gap-2 border border-cyber-yellow/20 py-2">
              <span className="text-cyber-yellow font-orbitron text-lg">🪙 {character.coins}</span>
              <span className="text-gray-500 font-mono text-xs">монет</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="lg:col-span-2 animate-fade-in-up delay-200">
            <div className="flex border-b border-cyber-cyan/20 mb-4">
              {[
                { id: 'stats', label: 'СТАТЫ' },
                { id: 'equipment', label: 'ЭКИПИРОВКА' },
                { id: 'inventory', label: `ИНВЕНТАРЬ (${inventory.length})` },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-4 py-2 font-orbitron text-xs tracking-wider transition-all ${
                    activeTab === tab.id ? 'text-cyber-cyan border-b-2 border-cyber-cyan' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Stats */}
            {activeTab === 'stats' && (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(character.effective_stats).map(([stat, val]) => {
                  const base = character.base_stats[stat] || 0;
                  const bonus = character.equipment_bonuses[stat] || 0;
                  const color = STAT_COLORS[stat] || '#00ffff';
                  return (
                    <div key={stat} className="cyber-panel p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono text-gray-400">{STAT_LABELS[stat]}</span>
                        <span className="ml-auto font-orbitron text-sm" style={{ color }}>{val}</span>
                        {bonus > 0 && <span className="text-cyber-green text-xs font-mono">+{bonus}</span>}
                      </div>
                      <div className="xp-bar">
                        <div className="h-full transition-all duration-700"
                          style={{ width: `${Math.min(val, 100)}%`, background: `linear-gradient(90deg, ${color}60, ${color})`, boxShadow: `0 0 8px ${color}60` }} />
                      </div>
                      <div className="text-gray-600 text-xs font-mono mt-1">База: {base}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Equipment */}
            {activeTab === 'equipment' && (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(SLOT_LABELS).map(([slot, label]) => {
                  const item = character.equipment[slot];
                  const color = item ? RARITY_COLORS[item.rarity] : '#333';
                  return (
                    <div key={slot} className="cyber-panel p-3 flex items-center gap-3 group"
                      style={{ borderColor: item ? color + '40' : undefined }}>
                      <div className="w-10 h-10 flex items-center justify-center border flex-shrink-0"
                        style={{ borderColor: color + '60', backgroundColor: color + '10' }}>
                        <Icon name={SLOT_ICONS[slot] as 'Crown'} size={18} style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-500 text-xs font-mono">{label}</div>
                        {item ? (
                          <>
                            <div className="font-rajdhani text-sm font-semibold truncate" style={{ color }}>{item.name}</div>
                            <div className="text-gray-600 text-xs font-mono">{RARITY_LABELS[item.rarity]}</div>
                          </>
                        ) : (
                          <div className="text-gray-700 text-xs font-mono italic">Пусто</div>
                        )}
                      </div>
                      {item && (
                        <button
                          onClick={() => unequip(slot)}
                          disabled={unequipLoading === slot}
                          className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                          title="Снять"
                        >
                          <Icon name="X" size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Inventory */}
            {activeTab === 'inventory' && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {inventory.length === 0 ? (
                  <div className="text-center py-8 text-gray-600 font-mono text-sm">
                    Инвентарь пуст. Победи врагов или купи предметы в магазине!
                  </div>
                ) : inventory.map(item => {
                  const color = RARITY_COLORS[item.rarity] || '#aaa';
                  const isEquipped = Object.values(character.equipment).some(e => e?.id === item.item_id);
                  return (
                    <div key={item.inv_id} className="cyber-panel p-3 flex items-center gap-3"
                      style={{ borderColor: isEquipped ? color + '60' : undefined }}>
                      <div className="w-8 h-8 flex items-center justify-center border flex-shrink-0"
                        style={{ borderColor: color + '40', backgroundColor: color + '10' }}>
                        <Icon name={SLOT_ICONS[item.type] as 'Crown'} size={14} style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-rajdhani text-sm font-semibold" style={{ color }}>
                          {item.name}
                          {isEquipped && <span className="ml-2 text-cyber-green text-xs font-mono">▶ НАДЕТ</span>}
                        </div>
                        <div className="text-gray-600 text-xs font-mono">
                          {RARITY_LABELS[item.rarity]} · {SLOT_LABELS[item.type]}
                          {Object.entries(item.stat_bonus).map(([s, v]) => (
                            <span key={s} className="ml-2 text-cyber-green">+{v} {STAT_LABELS[s]}</span>
                          ))}
                        </div>
                      </div>
                      {!isEquipped && (
                        <button
                          onClick={() => equip(item)}
                          disabled={equipLoading === item.item_id}
                          className="cyber-btn py-1 px-3 text-xs flex-shrink-0"
                        >
                          {equipLoading === item.item_id ? '...' : 'НАДЕТЬ'}
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
