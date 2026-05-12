import { useState, useMemo } from 'react';
import Icon from '@/components/ui/icon';
import { useGame } from '@/lib/GameContext';
import { useProgress } from '@/lib/useProgress';

// ─── Данные ──────────────────────────────────────────────────────────────────

interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  color: string;
  category: 'python' | 'combat' | 'story' | 'exploration' | 'social';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  progress: number;    // текущее
  goal: number;        // цель
  unlocked: boolean;
  reward: string;
  hint: string;
}

const CAT_META = {
  python:      { icon: '🐍', label: 'Python',       color: '#00ff41' },
  combat:      { icon: '⚔️', label: 'Бой',          color: '#ff00ff' },
  story:       { icon: '📜', label: 'Сюжет',        color: '#00aaff' },
  exploration: { icon: '🗺️', label: 'Исследование', color: '#ffaa00' },
  social:      { icon: '👥', label: 'Социальное',   color: '#aa00ff' },
};

const RARITY_META = {
  common:    { color: '#888',    stars: 1 },
  uncommon:  { color: '#00ff41', stars: 2 },
  rare:      { color: '#00aaff', stars: 3 },
  epic:      { color: '#aa00ff', stars: 4 },
  legendary: { color: '#ffaa00', stars: 5 },
};

const ACHIEVEMENTS: Achievement[] = [
  // Python
  { id: 'first_var',    title: 'Первая переменная',    desc: 'Успешно создай первую переменную в уроке',    icon: '📦', color: '#00ff41', category: 'python', rarity: 'common',    progress: 1, goal: 1,  unlocked: true,  reward: '+50 XP',         hint: 'Пройди урок "Переменные и типы"' },
  { id: 'first_func',   title: 'Функциональный',       desc: 'Напиши и запусти первую функцию',             icon: '🔧', color: '#00ff41', category: 'python', rarity: 'common',    progress: 0, goal: 1,  unlocked: false, reward: '+100 XP',        hint: 'Урок "Функции и модули"' },
  { id: 'loop_master',  title: 'Мастер циклов',        desc: 'Пройди 3 урока с циклами',                   icon: '🔄', color: '#00ff41', category: 'python', rarity: 'uncommon',  progress: 1, goal: 3,  unlocked: false, reward: '+200 XP · Bit Scrap ×5', hint: 'Выполняй задания по циклам' },
  { id: 'oop_class',    title: 'Архитектор',           desc: 'Создай первый класс Python',                 icon: '🤖', color: '#00aaff', category: 'python', rarity: 'rare',      progress: 0, goal: 1,  unlocked: false, reward: '+500 XP · Neon Crystal ×2', hint: 'Урок "Классы и ООП"' },
  { id: 'all_lessons',  title: 'Кодовая Эрудиция',    desc: 'Пройди все 12 уроков',                       icon: '🏅', color: '#ffaa00', category: 'python', rarity: 'legendary', progress: 3, goal: 12, unlocked: false, reward: '+2000 XP · Void Shard', hint: 'Изучи все темы Python' },
  { id: 'perfect_code', title: 'Чистый код',           desc: 'Реши 5 заданий с первой попытки',            icon: '✨', color: '#00ffff', category: 'python', rarity: 'epic',      progress: 2, goal: 5,  unlocked: false, reward: '+1000 XP · Clean Token', hint: 'Пиши код правильно с первого раза' },
  // Combat
  { id: 'first_kill',   title: 'Первая кровь',         desc: 'Победи первого врага в Code Combat',          icon: '⚡', color: '#ff00ff', category: 'combat', rarity: 'common',    progress: 1, goal: 1,  unlocked: true,  reward: '+100 XP',        hint: 'Выиграй бой в Code Combat' },
  { id: 'nexus_hunter', title: 'Охотник NEXUS',        desc: 'Победи 10 агентов NEXUS',                    icon: '💀', color: '#ff4060', category: 'combat', rarity: 'uncommon',  progress: 3, goal: 10, unlocked: false, reward: '+300 XP · NEXUS Chip ×3', hint: 'Побеждай в Code Combat' },
  { id: 'streak_king',  title: 'Серийный хакер',       desc: 'Выиграй 5 боёв подряд без поражения',        icon: '🔥', color: '#ff4060', category: 'combat', rarity: 'rare',      progress: 2, goal: 5,  unlocked: false, reward: '+600 XP · Loop Wire ×4', hint: 'Не проигрывай в Code Combat' },
  { id: 'boss_slayer',  title: 'Убийца боссов',        desc: 'Победи Archive_Rogue (Элита)',                icon: '🏆', color: '#ffaa00', category: 'combat', rarity: 'epic',      progress: 0, goal: 1,  unlocked: false, reward: '+1500 XP · Data Core ×5', hint: 'Сразись с Archive_Rogue LVL 25' },
  // Story
  { id: 'joined',       title: 'Добро пожаловать',     desc: 'Создай персонажа и войди в игру',             icon: '🌆', color: '#00ffff', category: 'story', rarity: 'common',    progress: 1, goal: 1,  unlocked: true,  reward: '+50 XP',         hint: 'Уже выполнено!' },
  { id: 'act1_done',    title: 'Пробуждение',          desc: 'Завершни первый квест от The Archive',        icon: '📡', color: '#00ff41', category: 'story', rarity: 'uncommon',  progress: 0, goal: 1,  unlocked: false, reward: '+400 XP · Syntax Gel ×3', hint: 'Выполни квест "Пробуждение агента"' },
  { id: 'faction_rep',  title: 'Агент Archive',        desc: 'Получи репутацию 100 в The Archive',         icon: '🎖️', color: '#00ff41', category: 'story', rarity: 'rare',      progress: 20, goal: 100, unlocked: false, reward: '+800 XP · Archive Badge', hint: 'Выполняй квесты The Archive' },
  // Exploration
  { id: 'first_dungeon', title: 'Первооткрыватель',   desc: 'Пройди первое подземелье',                   icon: '🏰', color: '#ffaa00', category: 'exploration', rarity: 'common',  progress: 0, goal: 1,  unlocked: false, reward: '+150 XP',       hint: 'Зайди в раздел Подземелья' },
  { id: 'map_explorer', title: 'Картограф',            desc: 'Открой 5 районов на карте города',           icon: '🗺️', color: '#ffaa00', category: 'exploration', rarity: 'uncommon', progress: 2, goal: 5, unlocked: false, reward: '+300 XP',        hint: 'Повышай уровень для открытия районов' },
  { id: 'perfect_dungeon', title: 'Совершенный данж', desc: 'Пройди подземелье с 100% правильных ответов', icon: '💯', color: '#aa00ff', category: 'exploration', rarity: 'epic',   progress: 0, goal: 1,  unlocked: false, reward: '+1200 XP · Void Shard', hint: 'Ответь верно на все вопросы в данже' },
  // Social
  { id: 'top_10',       title: 'Топ-10',               desc: 'Попади в топ-10 рейтинга',                   icon: '🥇', color: '#ffff00', category: 'social', rarity: 'rare',      progress: 0, goal: 1,  unlocked: false, reward: '+500 XP',        hint: 'Зарабатывай XP и повышай уровень' },
  { id: 'craftsman',    title: 'Мастер крафта',        desc: 'Создай 3 предмета в мастерской',             icon: '🔨', color: '#aa00ff', category: 'social', rarity: 'uncommon',  progress: 0, goal: 3,  unlocked: false, reward: '+400 XP · Materials', hint: 'Создавай импланты в Мастерской' },
];

// ─── Вычисляем реальный прогресс из progressStore ────────────────────────────

function getRealProgress(a: Achievement, prog: ReturnType<typeof useProgress>, charLevel: number): { progress: number; unlocked: boolean } {
  switch (a.id) {
    case 'first_var':       return { progress: prog.lessonsCompleted.includes(1) ? 1 : 0, unlocked: prog.lessonsCompleted.includes(1) };
    case 'first_func':      return { progress: prog.lessonsCompleted.includes(6) ? 1 : 0, unlocked: prog.lessonsCompleted.includes(6) };
    case 'loop_master':     { const n = [4,5,3].filter(id => prog.lessonsCompleted.includes(id)).length; return { progress: n, unlocked: n >= 3 }; }
    case 'oop_class':       return { progress: prog.lessonsCompleted.includes(11) ? 1 : 0, unlocked: prog.lessonsCompleted.includes(11) };
    case 'all_lessons':     return { progress: prog.lessonsCompleted.length, unlocked: prog.lessonsCompleted.length >= 12 };
    case 'first_kill':      return { progress: Math.min(1, prog.battlesWon), unlocked: prog.battlesWon >= 1 };
    case 'nexus_hunter':    return { progress: Math.min(10, prog.battlesWon), unlocked: prog.battlesWon >= 10 };
    case 'streak_king':     return { progress: Math.min(5, prog.battlesStreakBest), unlocked: prog.battlesStreakBest >= 5 };
    case 'boss_slayer':     return { progress: prog.battlesWon >= 20 ? 1 : 0, unlocked: prog.battlesWon >= 20 };
    case 'joined':          return { progress: 1, unlocked: true };
    case 'act1_done':       return { progress: prog.battlesWon >= 1 && prog.lessonsCompleted.length >= 1 ? 1 : 0, unlocked: prog.battlesWon >= 1 && prog.lessonsCompleted.length >= 1 };
    case 'faction_rep':     { const rep = prog.lessonsCompleted.length * 5 + prog.battlesWon * 3 + prog.dungeonsCompleted.length * 10; return { progress: Math.min(100, rep), unlocked: rep >= 100 }; }
    case 'first_dungeon':   return { progress: prog.dungeonsCompleted.length >= 1 ? 1 : 0, unlocked: prog.dungeonsCompleted.length >= 1 };
    case 'map_explorer':    { const districts = Math.min(5, 1 + Math.floor(charLevel / 3)); return { progress: districts, unlocked: districts >= 5 }; }
    case 'perfect_dungeon': { const perfect = Object.values(prog.dungeonsScores).some(s => s === 100); return { progress: perfect ? 1 : 0, unlocked: perfect }; }
    case 'craftsman':       return { progress: Math.min(3, prog.itemsCrafted), unlocked: prog.itemsCrafted >= 3 };
    case 'top_10':          return { progress: charLevel >= 10 ? 1 : 0, unlocked: charLevel >= 10 };
    default:                return { progress: a.progress, unlocked: a.unlocked };
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Achievements() {
  const { character } = useGame();
  const prog = useProgress();
  const [filter, setFilter] = useState<Achievement['category'] | 'all'>('all');
  const [showUnlocked, setShowUnlocked] = useState<'all' | 'locked' | 'unlocked'>('all');

  // Вычисляем реальный прогресс для каждой ачивки
  const achievementsWithProgress = useMemo(() => {
    return ACHIEVEMENTS.map(a => {
      const real = getRealProgress(a, prog, character?.level ?? 1);
      return { ...a, progress: real.progress, unlocked: real.unlocked };
    });
  }, [prog, character?.level]);

  const filtered = achievementsWithProgress.filter(a => {
    if (filter !== 'all' && a.category !== filter) return false;
    if (showUnlocked === 'unlocked' && !a.unlocked) return false;
    if (showUnlocked === 'locked' && a.unlocked) return false;
    return true;
  });

  const totalXP = achievementsWithProgress.filter(a => a.unlocked).reduce((acc, a) => {
    const match = a.reward.match(/\+(\d+) XP/);
    return acc + (match ? parseInt(match[1]) : 0);
  }, 0);

  return (
    <section className="py-8 px-4 lg:px-6 min-h-screen relative">
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
      <div className="max-w-5xl mx-auto relative z-10">

        {/* Header */}
        <div className="mb-5 flex items-end justify-between flex-wrap gap-3">
          <div>
            <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-1">// HALL OF FAME · CODEGRID-9</div>
            <h2 className="font-orbitron text-2xl text-white">
              ДОСТИЖЕНИЯ <span className="text-cyber-yellow">THE ARCHIVE</span>
            </h2>
            <div className="flex items-center gap-4 mt-1 flex-wrap">
              <span className="font-mono text-xs text-cyber-green">{unlockedCount}/{ACHIEVEMENTS.length} разблокировано</span>
              <span className="font-mono text-xs text-cyber-yellow">+{totalXP} XP получено</span>
              <div className="h-1 w-24 bg-black/60 border border-white/8">
                <div className="h-full bg-cyber-yellow transition-all"
                  style={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => setFilter('all')}
            className="font-mono text-[10px] px-3 py-1.5 border transition-all"
            style={{ borderColor: filter === 'all' ? '#00ffff' : '#ffffff12', color: filter === 'all' ? '#00ffff' : '#555', backgroundColor: filter === 'all' ? '#00ffff10' : 'transparent' }}>
            ВСЕ
          </button>
          {(Object.keys(CAT_META) as Achievement['category'][]).map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className="font-mono text-[10px] px-3 py-1.5 border transition-all flex items-center gap-1"
              style={{ borderColor: filter === c ? CAT_META[c].color : '#ffffff12', color: filter === c ? CAT_META[c].color : '#555', backgroundColor: filter === c ? CAT_META[c].color + '10' : 'transparent' }}>
              {CAT_META[c].icon} {CAT_META[c].label}
            </button>
          ))}
          <div className="ml-auto flex gap-1">
            {(['all', 'unlocked', 'locked'] as const).map(s => (
              <button key={s} onClick={() => setShowUnlocked(s)}
                className="font-mono text-[10px] px-2 py-1.5 border transition-all"
                style={{ borderColor: showUnlocked === s ? '#ffffff30' : '#ffffff10', color: showUnlocked === s ? '#fff' : '#555' }}>
                {s === 'all' ? 'Все' : s === 'unlocked' ? '✓' : '🔒'}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(a => {
            const rm = RARITY_META[a.rarity];
            const cm = CAT_META[a.category];
            const pct = Math.min(100, Math.round((a.progress / a.goal) * 100));

            return (
              <div
                key={a.id}
                className={`border p-4 transition-all ${a.unlocked ? '' : 'opacity-70'}`}
                style={{
                  borderColor: a.unlocked ? rm.color + '50' : '#ffffff10',
                  backgroundColor: a.unlocked ? rm.color + '06' : 'transparent',
                  boxShadow: a.unlocked ? `0 0 20px ${rm.color}15` : 'none',
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className="text-3xl flex-shrink-0 w-12 h-12 flex items-center justify-center border"
                    style={{
                      borderColor: a.unlocked ? rm.color + '60' : '#333',
                      backgroundColor: a.unlocked ? rm.color + '12' : 'transparent',
                      filter: a.unlocked ? `drop-shadow(0 0 8px ${rm.color}60)` : 'grayscale(1) opacity(0.4)',
                    }}
                  >
                    {a.unlocked ? a.icon : '🔒'}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Badges */}
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="font-mono text-[9px]" style={{ color: cm.color }}>{cm.icon} {cm.label}</span>
                      <span className="font-mono text-[9px]" style={{ color: rm.color }}>
                        {'★'.repeat(rm.stars)}{'☆'.repeat(5 - rm.stars)}
                      </span>
                    </div>
                    <div className="font-orbitron text-sm font-bold leading-tight"
                      style={{ color: a.unlocked ? '#ffffff' : '#666' }}>
                      {a.title}
                    </div>
                    <p className="text-gray-600 font-rajdhani text-xs mt-0.5 leading-snug">{a.desc}</p>
                  </div>
                </div>

                {/* Progress */}
                {!a.unlocked && a.goal > 1 && (
                  <div className="mt-3">
                    <div className="flex justify-between font-mono text-[9px] mb-1" style={{ color: rm.color + '80' }}>
                      <span>{a.progress} / {a.goal}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1 bg-black/60">
                      <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: rm.color, boxShadow: `0 0 4px ${rm.color}` }} />
                    </div>
                  </div>
                )}

                {/* Reward & hint */}
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="font-mono text-[9px] text-cyber-yellow">{a.reward}</span>
                  {!a.unlocked && (
                    <span className="font-mono text-[9px] text-gray-700" title={a.hint}>
                      <Icon name="HelpCircle" size={10} />
                    </span>
                  )}
                  {a.unlocked && <Icon name="Check" size={12} className="text-cyber-green" />}
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 font-mono text-xs text-gray-700 border border-white/5">
            // Нет достижений по выбранному фильтру
          </div>
        )}
      </div>
    </section>
  );
}