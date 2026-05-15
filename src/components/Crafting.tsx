import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { useGame } from '@/lib/GameContext';
import { pushNotif } from './Notifications';
import { progress } from '@/lib/progressStore';

// ─── Данные ──────────────────────────────────────────────────────────────────

interface Material {
  id: string;
  name: string;
  icon: string;
  color: string;
  desc: string;
  qty: number; // у игрока
}

interface Recipe {
  id: string;
  name: string;
  type: string;
  rarity: 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon: string;
  desc: string;
  lore: string;
  stat: string;
  ingredients: { matId: string; qty: number }[];
  unlockLevel: number;
  craftTime: number; // секунды
}

const RARITY_META = {
  uncommon:  { color: '#00ff41', label: 'Необычный' },
  rare:      { color: '#00aaff', label: 'Редкий'    },
  epic:      { color: '#aa00ff', label: 'Эпический' },
  legendary: { color: '#ffaa00', label: 'Легендарный' },
};

const MATERIALS: Material[] = [
  { id: 'bit_scrap',    name: 'Bit Scrap',     icon: '🔩', color: '#888',    desc: 'Обломки старых чипов. Основной ресурс.', qty: 12 },
  { id: 'neon_crystal', name: 'Neon Crystal',  icon: '💠', color: '#00aaff', desc: 'Кристаллизованный неоновый свет. Редко.', qty: 4 },
  { id: 'void_shard',   name: 'Void Shard',    icon: '🌑', color: '#aa00ff', desc: 'Фрагмент из Void Sector. Очень редко.', qty: 1 },
  { id: 'data_core',    name: 'Data Core',     icon: '💾', color: '#00ff41', desc: 'Сжатый архив данных The Archive.', qty: 6 },
  { id: 'nexus_chip',   name: 'NEXUS Chip',    icon: '🔲', color: '#ff4060', desc: 'Трофей с побеждённых агентов NEXUS.', qty: 3 },
  { id: 'syntax_gel',   name: 'Syntax Gel',    icon: '🧪', color: '#ffaa00', desc: 'Проводящий гель для нейроимплантов.', qty: 8 },
  { id: 'loop_wire',    name: 'Loop Wire',     icon: '🔌', color: '#ff00ff', desc: 'Квантовая проволока. Нужна для петель.', qty: 5 },
  { id: 'clean_code_token', name: 'Clean Token', icon: '✨', color: '#00ffff', desc: 'Токен Order of Clean Code. Культовый предмет.', qty: 2 },
];

const RECIPES: Recipe[] = [
  {
    id: 'hacker_eye',
    name: 'Hacker Eye Implant',
    type: 'implant',
    rarity: 'rare',
    icon: '👁️',
    desc: 'Нейросетевой имплант-глаз. Подсвечивает уязвимости кода врага.',
    lore: '"Видишь мир в шестнадцатеричном коде. Это либо дар, либо проклятие." — PYTH-0N',
    stat: '+15 INT · +10 AGI · Passive: Data Vision',
    ingredients: [
      { matId: 'bit_scrap', qty: 4 },
      { matId: 'neon_crystal', qty: 2 },
      { matId: 'syntax_gel', qty: 2 },
    ],
    unlockLevel: 5,
    craftTime: 3,
  },
  {
    id: 'loop_bracer',
    name: 'Loop Bracer',
    type: 'gloves',
    rarity: 'uncommon',
    icon: '🤜',
    desc: 'Перчатки с встроенным ускорителем ввода кода. Базовый крафт.',
    lore: '"Твои пальцы быстрее, чем алгоритмы защиты NEXUS." — The Archive',
    stat: '+10 AGI · +5 STR · Active: Fast Type (+5% скорость)',
    ingredients: [
      { matId: 'bit_scrap', qty: 3 },
      { matId: 'loop_wire', qty: 2 },
    ],
    unlockLevel: 2,
    craftTime: 2,
  },
  {
    id: 'archive_jacket',
    name: 'Archive Jacket',
    type: 'body',
    rarity: 'rare',
    icon: '🧥',
    desc: 'Бронежилет с вшитыми чипами The Archive. Защита и стиль.',
    lore: '"Каждый зашитый чип — история одного агента." — Командующий K4I',
    stat: '+20 DEF · +10 HP · Passive: Archive Signal',
    ingredients: [
      { matId: 'data_core', qty: 3 },
      { matId: 'nexus_chip', qty: 2 },
      { matId: 'syntax_gel', qty: 3 },
    ],
    unlockLevel: 8,
    craftTime: 5,
  },
  {
    id: 'lambda_blade',
    name: 'Lambda Blade',
    type: 'weapon',
    rarity: 'epic',
    icon: '⚡',
    desc: 'Клинок из сжатого lambda-кода. Режет как синтаксис, бьёт как runtime error.',
    lore: '"lambda x: x.destroy() — самый элегантный код, что я видел." — Black Syntax',
    stat: '+35 STR · +15 INT · Active: Lambda Strike (x2 dmg)',
    ingredients: [
      { matId: 'void_shard', qty: 1 },
      { matId: 'neon_crystal', qty: 3 },
      { matId: 'nexus_chip', qty: 2 },
      { matId: 'loop_wire', qty: 3 },
    ],
    unlockLevel: 15,
    craftTime: 8,
  },
  {
    id: 'clean_helm',
    name: 'Helmet of Clean Code',
    type: 'head',
    rarity: 'epic',
    icon: '🪖',
    desc: 'Священный шлем Order of Clean Code. Даёт ясность кода и разума.',
    lore: '"Чистый код — это молитва. Этот шлем — храм." — Верховный Архитектор',
    stat: '+25 INT · +15 LCK · Passive: Code Clarity (+10% XP)',
    ingredients: [
      { matId: 'clean_code_token', qty: 2 },
      { matId: 'data_core', qty: 4 },
      { matId: 'neon_crystal', qty: 2 },
    ],
    unlockLevel: 20,
    craftTime: 10,
  },
  {
    id: 'void_implant',
    name: 'Void Neural Core',
    type: 'implant',
    rarity: 'legendary',
    icon: '🌑',
    desc: 'Нейроимплант из Void Sector. Происхождение неизвестно. Эффект непредсказуем.',
    lore: '"Никто не знает откуда он. Но все хотят его." — Anonymous',
    stat: '+50 ALL STATS · Ultimate: Void Overflow',
    ingredients: [
      { matId: 'void_shard', qty: 1 },
      { matId: 'clean_code_token', qty: 1 },
      { matId: 'neon_crystal', qty: 4 },
      { matId: 'nexus_chip', qty: 3 },
      { matId: 'data_core', qty: 5 },
    ],
    unlockLevel: 30,
    craftTime: 15,
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function Crafting() {
  const { character } = useGame();
  const playerLevel = character?.level || 1;

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>(RECIPES[0]);
  const [materials, setMaterials] = useState<Material[]>(MATERIALS);
  const [crafting, setCrafting] = useState<string | null>(null);
  const [craftProgress, setCraftProgress] = useState(0);
  const [craftedItems, setCraftedItems] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<'all' | Recipe['rarity']>('all');

  const getMat = (id: string) => materials.find(m => m.id === id);

  const canCraft = (r: Recipe): { ok: boolean; missing: string[] } => {
    const missing: string[] = [];
    for (const ing of r.ingredients) {
      const mat = getMat(ing.matId);
      if (!mat || mat.qty < ing.qty) {
        missing.push(`${ing.matId} (нужно ${ing.qty}, есть ${mat?.qty ?? 0})`);
      }
    }
    return { ok: missing.length === 0 && playerLevel >= r.unlockLevel, missing };
  };

  const startCraft = (r: Recipe) => {
    const { ok } = canCraft(r);
    if (!ok || crafting) return;

    setCrafting(r.id);
    setCraftProgress(0);

    const interval = setInterval(() => {
      setCraftProgress(p => {
        const next = p + (100 / (r.craftTime * 10));
        if (next >= 100) {
          clearInterval(interval);
          // Consume materials
          setMaterials(prev => prev.map(m => {
            const ing = r.ingredients.find(i => i.matId === m.id);
            if (!ing) return m;
            return { ...m, qty: Math.max(0, m.qty - ing.qty) };
          }));
          setCraftedItems(prev => [...prev, r.id]);
          setCrafting(null);
          setCraftProgress(0);
          progress.recordCraft();
          pushNotif({
            type: 'item',
            title: `Скрафчено: ${r.name}`,
            body: `${RARITY_META[r.rarity].label} предмет добавлен в инвентарь`,
            icon: r.icon,
            color: RARITY_META[r.rarity].color,
          });
          return 100;
        }
        return next;
      });
    }, 100);
  };

  const rarityColors = RARITY_META;
  const filteredRecipes = RECIPES.filter(r => filterType === 'all' || r.rarity === filterType);
  const { ok: canCraftSelected, missing } = canCraft(selectedRecipe);

  return (
    <section className="py-8 px-4 lg:px-6 min-h-screen relative">
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <div className="mb-5">
          <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-1">
            // МАСТЕРСКАЯ · UNDERNET HUB
          </div>
          <h2 className="font-orbitron text-2xl text-white">
            КРАФТ <span className="text-cyber-magenta">ИМПЛАНТОВ</span>
            <span className="ml-3 font-mono text-[10px] border border-yellow-500/40 text-yellow-500 px-2 py-0.5 align-middle">БЕТА</span>
          </h2>
          <p className="text-gray-600 font-mono text-xs mt-1">
            Создавай уникальное снаряжение из ресурсов, добытых в миссиях
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">

          {/* ── LEFT: Materials ── */}
          <div className="w-full lg:w-56 flex-shrink-0 space-y-3">
            <div>
              <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-2">// РЕСУРСЫ</div>
              <div className="space-y-1.5">
                {materials.map(m => (
                  <div key={m.id}
                    className="flex items-center gap-2 border border-white/8 px-2.5 py-2"
                    title={m.desc}>
                    <span className="text-lg flex-shrink-0">{m.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs text-gray-400 truncate">{m.name}</div>
                    </div>
                    <div className="font-orbitron text-sm font-black flex-shrink-0"
                      style={{ color: m.qty > 0 ? m.color : '#444' }}>
                      {m.qty}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How to get materials */}
            <div className="border border-white/8 p-3">
              <div className="font-mono text-[10px] text-gray-600 mb-2">// КАК ДОБЫТЬ</div>
              <div className="space-y-1 font-mono text-[9px] text-gray-700 leading-relaxed">
                <div>⚔️ Code Combat → Bit Scrap, NEXUS Chip</div>
                <div>🏰 Подземелья → Neon Crystal, Data Core</div>
                <div>📜 Квесты → Syntax Gel, Loop Wire</div>
                <div>🌑 Void Sector → Void Shard</div>
                <div>✨ Order Missions → Clean Token</div>
              </div>
            </div>
          </div>

          {/* ── MIDDLE: Recipe list ── */}
          <div className="w-full lg:w-56 flex-shrink-0">
            <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-2">// РЕЦЕПТЫ</div>

            {/* Rarity filter */}
            <div className="flex flex-wrap gap-1 mb-3">
              <button onClick={() => setFilterType('all')}
                className="font-mono text-[9px] px-2 py-0.5 border transition-all"
                style={{ borderColor: filterType === 'all' ? '#00ffff' : '#ffffff10', color: filterType === 'all' ? '#00ffff' : '#555' }}>
                ВСЕ
              </button>
              {(Object.keys(rarityColors) as Recipe['rarity'][]).map(r => (
                <button key={r} onClick={() => setFilterType(r)}
                  className="font-mono text-[9px] px-2 py-0.5 border transition-all"
                  style={{ borderColor: filterType === r ? rarityColors[r].color : '#ffffff10', color: filterType === r ? rarityColors[r].color : '#555' }}>
                  {rarityColors[r].label[0]}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              {filteredRecipes.map(r => {
                const locked = playerLevel < r.unlockLevel;
                const { ok } = canCraft(r);
                const done = craftedItems.includes(r.id);
                const isCrafting = crafting === r.id;
                const isSelected = selectedRecipe.id === r.id;
                const rc = RARITY_META[r.rarity].color;

                return (
                  <button key={r.id}
                    onClick={() => setSelectedRecipe(r)}
                    disabled={locked}
                    className="w-full text-left p-2.5 border transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      borderColor: isSelected ? rc + '70' : '#ffffff08',
                      backgroundColor: isSelected ? rc + '08' : 'transparent',
                      borderLeftWidth: isSelected ? '3px' : '1px',
                    }}>
                    <div className="flex items-center gap-2">
                      <span className="text-xl flex-shrink-0">{r.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-rajdhani text-xs font-semibold text-white truncate">{r.name}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="font-mono text-[9px]" style={{ color: rc }}>{RARITY_META[r.rarity].label}</span>
                          {locked && <span className="font-mono text-[9px] text-gray-700">· LVL {r.unlockLevel}</span>}
                          {isCrafting && <span className="font-mono text-[9px] text-cyber-yellow animate-pulse">· КРАФТ...</span>}
                          {done && !isCrafting && <span className="font-mono text-[9px] text-cyber-green">· ✓</span>}
                          {ok && !isCrafting && !done && <span className="font-mono text-[9px] text-cyber-green">· доступно</span>}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT: Recipe detail ── */}
          <div className="flex-1 min-w-0">
            <div
              className="border p-5 h-full space-y-4"
              style={{ borderColor: RARITY_META[selectedRecipe.rarity].color + '40', backgroundColor: RARITY_META[selectedRecipe.rarity].color + '05' }}
            >
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="text-5xl">{selectedRecipe.icon}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-[10px] px-2 py-0.5 border"
                      style={{ color: RARITY_META[selectedRecipe.rarity].color, borderColor: RARITY_META[selectedRecipe.rarity].color + '50' }}>
                      {RARITY_META[selectedRecipe.rarity].label.toUpperCase()}
                    </span>
                    <span className="font-mono text-[10px] text-gray-600">{selectedRecipe.type}</span>
                    <span className="font-mono text-[10px] text-gray-700">LVL {selectedRecipe.unlockLevel}+</span>
                  </div>
                  <h3 className="font-orbitron text-xl font-black text-white">{selectedRecipe.name}</h3>
                  <p className="text-gray-500 font-rajdhani text-sm mt-1 leading-snug">{selectedRecipe.desc}</p>
                </div>
              </div>

              {/* Lore */}
              <div className="border-l-2 pl-3 italic"
                style={{ borderColor: RARITY_META[selectedRecipe.rarity].color + '60' }}>
                <p className="text-gray-600 font-rajdhani text-xs">{selectedRecipe.lore}</p>
              </div>

              {/* Stats */}
              <div className="border border-white/8 bg-black/30 p-3">
                <div className="font-mono text-[10px] text-gray-600 mb-1">// СТАТЫ</div>
                <div className="font-mono text-xs" style={{ color: RARITY_META[selectedRecipe.rarity].color }}>
                  {selectedRecipe.stat}
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <div className="font-mono text-[10px] text-gray-600 mb-2 tracking-widest">// ИНГРЕДИЕНТЫ</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedRecipe.ingredients.map(ing => {
                    const mat = getMat(ing.matId);
                    const enough = mat && mat.qty >= ing.qty;
                    return (
                      <div key={ing.matId}
                        className="border p-2.5 flex items-center gap-2"
                        style={{ borderColor: enough ? mat?.color + '40' : '#ff406040', backgroundColor: enough ? mat?.color + '06' : '#ff406008' }}>
                        <span className="text-lg">{mat?.icon ?? '❓'}</span>
                        <div>
                          <div className="font-mono text-[9px] text-gray-500">{mat?.name ?? ing.matId}</div>
                          <div className="font-orbitron text-xs font-bold" style={{ color: enough ? mat?.color : '#ff4060' }}>
                            {mat?.qty ?? 0} / {ing.qty}
                          </div>
                        </div>
                        {enough
                          ? <Icon name="Check" size={10} className="ml-auto text-cyber-green flex-shrink-0" />
                          : <Icon name="X" size={10} className="ml-auto text-red-400 flex-shrink-0" />
                        }
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Missing */}
              {!canCraftSelected && missing.length > 0 && playerLevel >= selectedRecipe.unlockLevel && (
                <div className="border border-red-500/30 bg-red-500/5 p-3">
                  <div className="font-mono text-xs text-red-400 mb-1">// НЕ ХВАТАЕТ</div>
                  {missing.map((m, i) => (
                    <div key={i} className="font-mono text-[10px] text-red-400/70">{m}</div>
                  ))}
                </div>
              )}

              {playerLevel < selectedRecipe.unlockLevel && (
                <div className="border border-white/10 p-3">
                  <div className="font-mono text-xs text-gray-600">
                    🔒 Требуется LVL {selectedRecipe.unlockLevel}
                    {' · '}ещё {selectedRecipe.unlockLevel - playerLevel} уровней
                  </div>
                </div>
              )}

              {/* Craft button */}
              {crafting === selectedRecipe.id ? (
                <div>
                  <div className="flex justify-between font-mono text-xs mb-1 text-cyber-yellow">
                    <span>СОЗДАНИЕ...</span>
                    <span>{Math.round(craftProgress)}%</span>
                  </div>
                  <div className="h-3 bg-black/60 border border-cyber-yellow/20">
                    <div
                      className="h-full transition-all duration-100"
                      style={{ width: `${craftProgress}%`, backgroundColor: '#ffaa00', boxShadow: '0 0 8px #ffaa0060' }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => startCraft(selectedRecipe)}
                  disabled={!canCraftSelected || !!crafting}
                  className="w-full py-4 font-orbitron text-sm border-2 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                  style={{
                    borderColor: canCraftSelected ? RARITY_META[selectedRecipe.rarity].color : '#333',
                    color: canCraftSelected ? RARITY_META[selectedRecipe.rarity].color : '#555',
                    backgroundColor: canCraftSelected ? RARITY_META[selectedRecipe.rarity].color + '15' : 'transparent',
                    boxShadow: canCraftSelected ? `0 0 25px ${RARITY_META[selectedRecipe.rarity].color}20` : 'none',
                  }}>
                  <Icon name="Hammer" size={16} />
                  {craftedItems.includes(selectedRecipe.id) ? 'СОЗДАТЬ ЕЩЁ' : 'СОЗДАТЬ ПРЕДМЕТ'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}