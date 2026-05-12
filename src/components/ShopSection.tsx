import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';
import { useGame } from '@/lib/GameContext';

const RARITY_COLORS: Record<string, string> = {
  common: '#aaaaaa', uncommon: '#00ff41', rare: '#00aaff', epic: '#aa00ff', legendary: '#ffaa00',
};
const RARITY_LABELS: Record<string, string> = {
  common: 'Обычный', uncommon: 'Необычный', rare: 'Редкий', epic: 'Эпический', legendary: 'Легендарный',
};
const SLOT_LABELS: Record<string, string> = {
  head: 'Шлем', body: 'Броня', weapon: 'Оружие', gloves: 'Перчатки', boots: 'Ботинки', implant: 'Имплант',
};
const STAT_LABELS: Record<string, string> = {
  strength: 'Сила', agility: 'Ловкость', intelligence: 'Интеллект', defense: 'Защита', luck: 'Удача',
};

// GDD: Glitch Box / Neon Core / Void Relic
const LOOTBOXES = [
  { type: 'basic', name: 'Glitch Box', price: 100, emoji: '📦', desc: 'Common / Uncommon', color: '#aaaaaa', lore: 'Стандартный лут с чёрного рынка CodeGrid-9' },
  { type: 'advanced', name: 'Neon Core', price: 300, emoji: '🔷', desc: 'Uncommon / Rare / Epic', color: '#00aaff', lore: 'Имплант-контейнер из лабораторий The Archive' },
  { type: 'legendary', name: 'Void Relic', price: 800, emoji: '🌑', desc: 'Rare / Epic / Legendary', color: '#aa00ff', lore: 'Артефакт эпохи до Великого Отключения 2048' },
] as const;

interface ShopItem {
  id: number; name: string; description: string;
  type: string; rarity: string; stat_bonus: Record<string, number>; price: number;
}

export default function ShopSection() {
  const { character, refreshCharacter, refreshInventory } = useGame();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyLoading, setBuyLoading] = useState<number | null>(null);
  const [lootLoading, setLootLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' | 'drop' } | null>(null);
  const [droppedItem, setDroppedItem] = useState<ShopItem | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.shop.items().then(d => {
      setItems(d.items || []);
      setLoading(false);
    });
  }, []);

  const showMsg = (text: string, type: 'success' | 'error' | 'drop' = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const buyItem = async (item: ShopItem) => {
    if (!character || character.coins < item.price) {
      showMsg('Недостаточно монет!', 'error');
      return;
    }
    setBuyLoading(item.id);
    const data = await api.shop.buy(item.id);
    setBuyLoading(null);
    if (data.error) { showMsg(data.error, 'error'); return; }
    await Promise.all([refreshCharacter(), refreshInventory()]);
    showMsg(`✅ Куплено: ${item.name}`, 'success');
  };

  const openLootbox = async (type: typeof LOOTBOXES[number]['type']) => {
    const box = LOOTBOXES.find(b => b.type === type)!;
    if (!character || character.coins < box.price) {
      showMsg('Недостаточно монет!', 'error');
      return;
    }
    setLootLoading(type);
    const data = await api.shop.lootbox(type);
    setLootLoading(null);
    if (data.error) { showMsg(data.error, 'error'); return; }
    setDroppedItem(data.item);
    await Promise.all([refreshCharacter(), refreshInventory()]);
    setMsg({ text: `🎁 ДРОП: ${data.item.name}!`, type: 'drop' });
  };

  const filteredItems = filter === 'all' ? items : items.filter(i => i.type === filter);

  return (
    <section className="py-16 px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-6 animate-fade-in-up">
          <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-1">// BLACK MARKET · UNDERNET HUB</div>
          <h2 className="font-orbitron text-2xl text-white">
            ЧЁРНЫЙ <span className="text-cyber-yellow">РЫНОК</span>
          </h2>
          <div className="font-mono text-[10px] text-gray-700 mt-0.5">Нелегальный торговец имплантами · CodeGrid-9 · 2087</div>
        </div>

        {/* Wallet: Creds + NeuroShards */}
        {character && (
          <div className="flex gap-3 mb-6 flex-wrap">
            <div className="border border-yellow-500/30 bg-yellow-500/5 px-4 py-2 flex items-center gap-2">
              <span className="text-yellow-400 font-orbitron text-sm">⚡ {character.coins}</span>
              <span className="font-mono text-[10px] text-gray-600">Creds</span>
            </div>
            <div className="border border-purple-500/30 bg-purple-500/5 px-4 py-2 flex items-center gap-2">
              <span className="text-purple-400 font-orbitron text-sm">◈ 0</span>
              <span className="font-mono text-[10px] text-gray-600">NeuroShards</span>
            </div>
          </div>
        )}

        {/* Message */}
        {msg && (
          <div
            className={`mb-6 text-center py-3 border font-orbitron text-sm animate-fade-in-up ${
              msg.type === 'error' ? 'border-red-500/40 text-red-400 bg-red-500/5' :
              msg.type === 'drop' ? 'border-cyber-yellow/60 text-cyber-yellow bg-cyber-yellow/10' :
              'border-cyber-green/40 text-cyber-green bg-cyber-green/5'
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Lootboxes */}
        <div className="mb-8">
          <div className="font-orbitron text-xs text-gray-400 mb-4 tracking-widest">// ЛУТБОКСЫ</div>
          <div className="grid grid-cols-3 gap-4">
            {LOOTBOXES.map(box => (
              <div key={box.type} className="cyber-panel p-5 text-center" style={{ borderColor: box.color + '40', boxShadow: `0 0 20px ${box.color}10` }}>
                <div className="text-4xl mb-2">{box.emoji}</div>
                <div className="font-orbitron text-sm mb-0.5" style={{ color: box.color }}>{box.name}</div>
                <div className="text-gray-600 text-xs font-mono mb-1">{box.desc}</div>
                <div className="text-gray-700 font-mono text-[10px] mb-3 leading-tight">{box.lore}</div>
                <div className="font-orbitron text-yellow-400 mb-3 text-sm">⚡ {box.price} Creds</div>
                <button
                  onClick={() => openLootbox(box.type)}
                  disabled={lootLoading === box.type || !character || character.coins < box.price}
                  className="cyber-btn w-full text-xs py-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ borderColor: box.color, color: box.color }}
                >
                  {lootLoading === box.type ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                      ОТКРЫВАЮ...
                    </span>
                  ) : 'ОТКРЫТЬ'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Dropped item display */}
        {droppedItem && (
          <div className="mb-8 cyber-panel p-6 text-center border-cyber-yellow/60 animate-fade-in-up"
            style={{ boxShadow: `0 0 30px ${RARITY_COLORS[droppedItem.rarity]}30` }}>
            <div className="font-orbitron text-xs text-gray-400 mb-2">ПОСЛЕДНИЙ ДРОП</div>
            <div className="font-orbitron text-2xl mb-1" style={{ color: RARITY_COLORS[droppedItem.rarity] }}>
              {droppedItem.name}
            </div>
            <div className="text-gray-400 font-mono text-xs">{RARITY_LABELS[droppedItem.rarity]} · {SLOT_LABELS[droppedItem.type]}</div>
          </div>
        )}

        {/* Shop items */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="font-orbitron text-xs text-gray-400 tracking-widest">// ПРЕДМЕТЫ</div>
            <div className="flex gap-2">
              {['all', 'head', 'body', 'weapon', 'gloves', 'boots', 'implant'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`text-xs font-mono px-2 py-1 border transition-all ${
                    filter === f ? 'border-cyber-cyan text-cyber-cyan' : 'border-cyber-cyan/15 text-gray-600 hover:border-cyber-cyan/40'
                  }`}>
                  {f === 'all' ? 'ВСЕ' : SLOT_LABELS[f]?.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-600 font-mono text-sm">ЗАГРУЗКА...</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {filteredItems.map(item => {
                const color = RARITY_COLORS[item.rarity];
                const canBuy = character && character.coins >= item.price;
                return (
                  <div key={item.id} className="cyber-panel p-4 flex items-center gap-3"
                    style={{ borderColor: color + '25' }}>
                    <div className="w-10 h-10 flex items-center justify-center border flex-shrink-0"
                      style={{ borderColor: color + '50', backgroundColor: color + '10' }}>
                      <span style={{ color }} className="text-lg">
                        {item.type === 'weapon' ? '⚔️' : item.type === 'head' ? '🪖' : item.type === 'body' ? '🛡️' : '🔧'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-rajdhani font-semibold" style={{ color }}>{item.name}</div>
                      <div className="text-gray-600 text-xs font-mono">{RARITY_LABELS[item.rarity]} · {SLOT_LABELS[item.type]}</div>
                      <div className="text-xs font-mono mt-0.5">
                        {Object.entries(item.stat_bonus).map(([s, v]) => (
                          <span key={s} className="mr-2 text-cyber-green">+{v} {STAT_LABELS[s]}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <div className="font-orbitron text-cyber-yellow text-sm">🪙 {item.price}</div>
                      <button
                        onClick={() => buyItem(item)}
                        disabled={buyLoading === item.id || !canBuy}
                        className="cyber-btn py-1 px-3 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                        style={canBuy ? { borderColor: color, color } : undefined}
                      >
                        {buyLoading === item.id ? '...' : 'КУПИТЬ'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}