import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { useGame, XpResult } from '@/lib/GameContext';
import { api } from '@/lib/api';
import { pushNotif } from '@/components/Notifications';
import { useProgress } from '@/lib/useProgress';
import { progress as progressStore } from '@/lib/progressStore';

interface Quest {
  id: string;
  title: string;
  faction: string;
  factionColor: string;
  type: 'story' | 'learning' | 'daily' | 'side' | 'rep';
  typeLabel: string;
  status: 'active' | 'completed' | 'locked';
  desc: string;
  objectives: QuestObjective[];
  reward: string;
  xp: number;
  lore: string;
  act?: number;
  unlockLevel?: number;
}

interface QuestObjective {
  text: string;
  /** Автоматическая проверка по типу */
  check?: ObjectiveCheck;
}

type ObjectiveCheck =
  | { type: 'lessons'; count: number }
  | { type: 'lesson_id'; id: number }
  | { type: 'battles'; count: number }
  | { type: 'battles_streak'; count: number }
  | { type: 'dungeon'; id: string; minScore?: number }
  | { type: 'dungeons'; count: number }
  | { type: 'level'; value: number }
  | { type: 'npc'; id: string }
  | { type: 'daily_lessons'; count: number }
  | { type: 'daily_battles'; count: number }
  | { type: 'daily_dungeons'; count: number }
  | { type: 'manual' };

const TYPE_COLORS: Record<string, string> = {
  story: '#00ffff',
  learning: '#00ff41',
  daily: '#ffaa00',
  side: '#ff00ff',
  rep: '#aa00ff',
};
const TYPE_LABELS: Record<string, string> = {
  story: 'Сюжет',
  learning: 'Обучение',
  daily: 'Ежедневный',
  side: 'Побочный',
  rep: 'Репутация',
};

// ─── Квесты ──────────────────────────────────────────────────────────────────

const QUESTS: Quest[] = [
  // ════ STORY ════
  {
    id: 'act1_1',
    title: 'Пробуждение агента',
    faction: 'THE ARCHIVE',  factionColor: '#00ff41',
    type: 'story', typeLabel: 'Сюжет', status: 'active', act: 1,
    desc: 'Ты нашёл повреждённый имплант с ИИ PYTH-0N. Он хранит знания запрещённого языка. The Archive хочет тебя завербовать.',
    objectives: [
      { text: 'Пройди урок "Переменные и типы" (урок #1)', check: { type: 'lesson_id', id: 1 } },
      { text: 'Выполни первое задание в Code Combat', check: { type: 'battles', count: 1 } },
      { text: 'Поговори с PYTH-0N', check: { type: 'npc', id: 'pyth0n' } },
    ],
    reward: '500 XP · 300 Creds · Стартовый имплант',
    xp: 500,
    lore: '"Агент, PYTH-0N здесь. Меня заблокировали, но ты меня нашёл. Слушай: NEXUS не должна тебя найти. Выучи базовый синтаксис — это твоя первая защита." — PYTH-0N',
  },
  {
    id: 'act1_2',
    title: 'Первый контакт',
    faction: 'THE ARCHIVE', factionColor: '#00ff41',
    type: 'story', typeLabel: 'Сюжет', status: 'active', act: 1, unlockLevel: 1,
    desc: 'The Archive установило контакт. Тебе нужно доказать свои способности.',
    objectives: [
      { text: 'Достигни 3-го уровня', check: { type: 'level', value: 3 } },
      { text: 'Пройди подземелье NEXUS-Alpha', check: { type: 'dungeon', id: 'nexus_alpha' } },
      { text: 'Изучи 3 урока Python', check: { type: 'lessons', count: 3 } },
    ],
    reward: '1000 XP · 600 Creds · Удостоверение Archive',
    xp: 1000,
    lore: '"Докажи, что ты не просто любопытный." — Командующий K4I',
  },
  {
    id: 'act1_3',
    title: 'Цифровой след',
    faction: 'THE ARCHIVE', factionColor: '#00ff41',
    type: 'story', typeLabel: 'Сюжет', status: 'active', act: 1,
    desc: 'NEXUS засекла активность агентов. Нужно действовать быстро — прокачать навыки и подготовиться к контратаке.',
    objectives: [
      { text: 'Выиграй 3 боя в Code Combat', check: { type: 'battles', count: 3 } },
      { text: 'Изучи 5 уроков', check: { type: 'lessons', count: 5 } },
      { text: 'Поговори с Командующим K4I', check: { type: 'npc', id: 'k4i' } },
    ],
    reward: '1500 XP · 800 Creds · Имплант Archive-class',
    xp: 1500,
    lore: '"Нет времени. NEXUS активирует протокол зачистки." — VERA, инженер Archive',
  },
  {
    id: 'act2_1',
    title: 'Синтаксис подполья',
    faction: 'THE ARCHIVE', factionColor: '#00ff41',
    type: 'story', typeLabel: 'Сюжет', status: 'active', act: 2, unlockLevel: 5,
    desc: 'Ты в подполье. Пора изучить продвинутые техники — функции и структуры данных.',
    objectives: [
      { text: 'Изучи урок "Функции" (#6)', check: { type: 'lesson_id', id: 6 } },
      { text: 'Изучи урок "Списки" (#8)', check: { type: 'lesson_id', id: 8 } },
      { text: 'Победи CorpGuard в Code Combat (5 побед)', check: { type: 'battles', count: 5 } },
      { text: 'Пройди подземелье NEXUS-Beta', check: { type: 'dungeon', id: 'nexus_beta' } },
    ],
    reward: '2000 XP · 1000 Creds · Данные Archive',
    xp: 2000,
    lore: '"Функции — твоё оружие. Структуры данных — твоя броня." — PYTH-0N',
  },
  {
    id: 'act2_2',
    title: 'Взлом периметра',
    faction: 'THE ARCHIVE', factionColor: '#00ff41',
    type: 'story', typeLabel: 'Сюжет', status: 'active', act: 2, unlockLevel: 8,
    desc: 'Периметр NEXUS взломан частично. Нужны продвинутые знания ООП для финального удара.',
    objectives: [
      { text: 'Изучи урок "Классы и ООП" (#11)', check: { type: 'lesson_id', id: 11 } },
      { text: 'Пройди Archive Vault (80%+ точность)', check: { type: 'dungeon', id: 'archive_vault', minScore: 80 } },
      { text: 'Достигни 10-го уровня', check: { type: 'level', value: 10 } },
    ],
    reward: '3000 XP · 1500 Creds · Нейроимплант',
    xp: 3000,
    lore: '"ООП — это философия. Кто понял её, тот понял всё." — K4I',
  },
  {
    id: 'act3_boss',
    title: 'Финальный протокол',
    faction: 'THE ARCHIVE', factionColor: '#00ff41',
    type: 'story', typeLabel: 'Сюжет', status: 'active', act: 3, unlockLevel: 15,
    desc: 'Директор Ноль активировал протокол уничтожения. Это финальная битва.',
    objectives: [
      { text: 'Пройди все уроки АКТ I (1-5)', check: { type: 'lessons', count: 5 } },
      { text: 'Выиграй 10 боёв', check: { type: 'battles', count: 10 } },
      { text: 'Пройди NEXUS PRIME подземелье', check: { type: 'dungeon', id: 'nexus_prime' } },
      { text: 'Поговори с PYTH-0N для финала', check: { type: 'npc', id: 'pyth0n' } },
    ],
    reward: '10000 XP · 5000 Creds · Звание "Освободитель"',
    xp: 10000,
    lore: '"Это конец. Или начало новой эпохи." — PYTH-0N',
  },

  // ════ LEARNING ════
  {
    id: 'learn_vars',
    title: 'Мастер переменных',
    faction: 'THE ARCHIVE', factionColor: '#00ff41',
    type: 'learning', typeLabel: 'Обучение', status: 'active',
    desc: 'Освой основы Python: переменные, типы, преобразования.',
    objectives: [
      { text: 'Пройди урок "Переменные и типы" (#1)', check: { type: 'lesson_id', id: 1 } },
      { text: 'Пройди урок "Строки" (#2)', check: { type: 'lesson_id', id: 2 } },
      { text: 'Пройди урок "Условия if/else" (#3)', check: { type: 'lesson_id', id: 3 } },
    ],
    reward: '300 XP · 150 Creds',
    xp: 300,
    lore: 'Каждая переменная — ячейка памяти в системе NEXUS, которую ты перехватываешь.',
  },
  {
    id: 'learn_loops',
    title: 'Бесконечный цикл',
    faction: 'THE ARCHIVE', factionColor: '#00ff41',
    type: 'learning', typeLabel: 'Обучение', status: 'active',
    desc: 'Научись управлять повторяющимися операциями через циклы.',
    objectives: [
      { text: 'Пройди урок "Циклы for и while" (#4)', check: { type: 'lesson_id', id: 4 } },
      { text: 'Пройди урок "Break и continue" (#5)', check: { type: 'lesson_id', id: 5 } },
    ],
    reward: '400 XP · 200 Creds',
    xp: 400,
    lore: 'Цикл — это автоматизация. Один код, бесконечное действие.',
  },
  {
    id: 'learn_func',
    title: 'Архитектор функций',
    faction: 'THE ARCHIVE', factionColor: '#00ff41',
    type: 'learning', typeLabel: 'Обучение', status: 'active',
    desc: 'Создавай переиспользуемые блоки кода — основу любой системы.',
    objectives: [
      { text: 'Пройди урок "Функции" (#6)', check: { type: 'lesson_id', id: 6 } },
      { text: 'Пройди урок "Аргументы функций" (#7)', check: { type: 'lesson_id', id: 7 } },
      { text: 'Выиграй 2 боя используя функции', check: { type: 'battles', count: 2 } },
    ],
    reward: '600 XP · 300 Creds · Функциональный имплант',
    xp: 600,
    lore: 'Функция — это пушка. Один раз написал, стреляешь вечно.',
  },
  {
    id: 'learn_data',
    title: 'Структуры данных',
    faction: 'THE ARCHIVE', factionColor: '#00ff41',
    type: 'learning', typeLabel: 'Обучение', status: 'active',
    desc: 'Списки и словари — основа хранения информации об агентах NEXUS.',
    objectives: [
      { text: 'Пройди урок "Списки" (#8)', check: { type: 'lesson_id', id: 8 } },
      { text: 'Пройди урок "List comprehension" (#9)', check: { type: 'lesson_id', id: 9 } },
      { text: 'Пройди урок "Словари" (#10)', check: { type: 'lesson_id', id: 10 } },
    ],
    reward: '800 XP · 400 Creds',
    xp: 800,
    lore: 'Данные — сила. Тот, кто управляет структурами, управляет информацией.',
  },
  {
    id: 'learn_oop',
    title: 'Создай агента',
    faction: 'THE ARCHIVE', factionColor: '#00ff41',
    type: 'learning', typeLabel: 'Обучение', status: 'active',
    desc: 'ООП позволяет создавать автономных агентов.',
    objectives: [
      { text: 'Пройди урок "Классы и ООП" (#11)', check: { type: 'lesson_id', id: 11 } },
      { text: 'Пройди урок "Методы класса" (#12)', check: { type: 'lesson_id', id: 12 } },
      { text: 'Пройди подземелье Archive Vault', check: { type: 'dungeon', id: 'archive_vault' } },
    ],
    reward: '1200 XP · 600 Creds · OOP Имплант',
    xp: 1200,
    lore: '"class Agent: — с этой строки начинается революция." — PYTH-0N',
  },

  // ════ DAILY ════
  {
    id: 'daily_code',
    title: 'Ежедневный взлом',
    faction: 'THE ARCHIVE', factionColor: '#00ff41',
    type: 'daily', typeLabel: 'Ежедневный', status: 'active',
    desc: 'Ежедневные тренировки поддерживают форму агента.',
    objectives: [
      { text: 'Пройди 1 урок сегодня', check: { type: 'daily_lessons', count: 1 } },
      { text: 'Выиграй 1 бой сегодня', check: { type: 'daily_battles', count: 1 } },
    ],
    reward: '150 XP · 100 Creds',
    xp: 150,
    lore: 'Каждый день без Python — шаг назад. NEXUS не спит.',
  },
  {
    id: 'daily_dungeon',
    title: 'Зачистка подземелья',
    faction: 'BLACK SYNTAX', factionColor: '#aa00ff',
    type: 'daily', typeLabel: 'Ежедневный', status: 'active',
    desc: 'Black Syntax платит за зачистку секторов NEXUS.',
    objectives: [
      { text: 'Завершить любое подземелье сегодня (60%+)', check: { type: 'daily_dungeons', count: 1 } },
    ],
    reward: '200 XP · 150 Creds · Шанс на Glitch Box',
    xp: 200,
    lore: 'Black Syntax платит за информацию о слабостях NEXUS.',
  },
  {
    id: 'daily_grind',
    title: 'Боевой марафон',
    faction: 'THE ARCHIVE', factionColor: '#00ff41',
    type: 'daily', typeLabel: 'Ежедневный', status: 'active',
    desc: 'Усиленная тренировка — 3 боя за день.',
    objectives: [
      { text: 'Выиграй 3 боя сегодня', check: { type: 'daily_battles', count: 3 } },
    ],
    reward: '300 XP · 200 Creds · Neon Core Shard',
    xp: 300,
    lore: 'Каждый бой — это практика. Практика делает мастера.',
  },

  // ════ SIDE ════
  {
    id: 'side_streak',
    title: 'Серийный взломщик',
    faction: 'BLACK SYNTAX', factionColor: '#aa00ff',
    type: 'side', typeLabel: 'Побочный', status: 'active',
    desc: 'Докажи, что умеешь держать удар — 5 побед без поражений.',
    objectives: [
      { text: 'Победи 5 раз подряд без поражения', check: { type: 'battles_streak', count: 5 } },
    ],
    reward: '800 XP · 400 Creds · Streak Badge',
    xp: 800,
    lore: '"Стабильность — признак мастерства." — Void Trader',
  },
  {
    id: 'side_explorer',
    title: 'Исследователь кода',
    faction: 'THE ARCHIVE', factionColor: '#00ff41',
    type: 'side', typeLabel: 'Побочный', status: 'active',
    desc: 'Поговори со всеми НПС и узнай их истории.',
    objectives: [
      { text: 'Поговори с PYTH-0N', check: { type: 'npc', id: 'pyth0n' } },
      { text: 'Поговори с Командующим K4I', check: { type: 'npc', id: 'k4i' } },
      { text: 'Поговори с Void Trader', check: { type: 'npc', id: 'void_trader' } },
    ],
    reward: '500 XP · 300 Creds · Лор-фрагмент',
    xp: 500,
    lore: 'Каждый агент хранит часть истории. Собери их все.',
  },
  {
    id: 'side_dungeon_master',
    title: 'Покоритель подземелий',
    faction: 'THE ARCHIVE', factionColor: '#00ff41',
    type: 'side', typeLabel: 'Побочный', status: 'active',
    desc: 'Пройди все доступные подземелья.',
    objectives: [
      { text: 'Пройди NEXUS-Alpha', check: { type: 'dungeon', id: 'nexus_alpha' } },
      { text: 'Пройди NEXUS-Beta', check: { type: 'dungeon', id: 'nexus_beta' } },
      { text: 'Пройди Archive Vault', check: { type: 'dungeon', id: 'archive_vault' } },
    ],
    reward: '2000 XP · 1000 Creds · Dungeon Master Badge',
    xp: 2000,
    lore: 'Подземелья хранят секреты NEXUS. Взломай их все.',
  },

  // ════ REP ════
  {
    id: 'rep_archive',
    title: 'Доверие Archive',
    faction: 'THE ARCHIVE', factionColor: '#00ff41',
    type: 'rep', typeLabel: 'Репутация', status: 'active',
    desc: 'Докажи лояльность The Archive через обучение и миссии.',
    objectives: [
      { text: 'Изучи 5 уроков', check: { type: 'lessons', count: 5 } },
      { text: 'Выиграй 3 боя', check: { type: 'battles', count: 3 } },
      { text: 'Пройди 2 подземелья', check: { type: 'dungeons', count: 2 } },
    ],
    reward: '1000 XP · 500 Creds · Звание "Агент Archive"',
    xp: 1000,
    lore: 'The Archive не принимает слабых. Докажи, что ты достоин.',
  },
  {
    id: 'rep_black_syntax',
    title: 'Связи в подполье',
    faction: 'BLACK SYNTAX', factionColor: '#aa00ff',
    type: 'rep', typeLabel: 'Репутация', status: 'active',
    desc: 'Black Syntax ценит тех, кто умеет воевать.',
    objectives: [
      { text: 'Выиграй 5 боёв', check: { type: 'battles', count: 5 } },
      { text: 'Пройди 3 подземелья', check: { type: 'dungeons', count: 3 } },
      { text: 'Достигни 5-го уровня', check: { type: 'level', value: 5 } },
    ],
    reward: '1500 XP · 800 Creds · Black Syntax Badge',
    xp: 1500,
    lore: '"Мы уважаем тех, кто действует." — Void Trader',
  },
];

const STATUS_ORDER = ['active', 'locked', 'completed'];

// ─── Проверка выполнения цели по реальным данным ─────────────────────────────

function checkObjective(
  obj: QuestObjective,
  p: ReturnType<typeof import('@/lib/useProgress').useProgress>,
  character: { level: number } | null,
): boolean {
  const check = obj.check;
  if (!check) return false;
  if (check.type === 'manual') return false;

  switch (check.type) {
    case 'lessons':         return p.lessonsCompleted.length >= check.count;
    case 'lesson_id':       return p.lessonsCompleted.includes(check.id);
    case 'battles':         return p.battlesWon >= check.count;
    case 'battles_streak':  return p.battlesStreakBest >= check.count;
    case 'dungeon':         {
      const done = p.dungeonsCompleted.includes(check.id);
      if (!done) return false;
      if (check.minScore !== undefined) return (p.dungeonsScores[check.id] ?? 0) >= check.minScore;
      return true;
    }
    case 'dungeons':        return p.dungeonsCompleted.length >= check.count;
    case 'level':           return (character?.level ?? 0) >= check.value;
    case 'npc':             return p.npcsSpoken.includes(check.id);
    case 'daily_lessons':   return p.dailyLessons >= check.count;
    case 'daily_battles':   return p.dailyBattles >= check.count;
    case 'daily_dungeons':  return p.dailyDungeons >= check.count;
    default:                return false;
  }
}

// ─── Компонент ────────────────────────────────────────────────────────────────

export default function QuestLog({ onNavigate }: { onNavigate?: (s: string) => void }) {
  const { character, applyXpResult } = useGame();
  const prog = useProgress();
  const [filter, setFilter] = useState<'all' | Quest['type']>('all');
  const [selected, setSelected] = useState<Quest | null>(QUESTS[0]);
  const [claimedQuests, setClaimedQuests] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('claimed_quests') || '[]')); }
    catch { return new Set(); }
  });
  const [claiming, setClaiming] = useState(false);

  const claimReward = async (q: Quest) => {
    if (claimedQuests.has(q.id) || claiming) return;
    setClaiming(true);
    const res = await api.questClaim(q.xp, Math.round(q.xp * 0.5));
    setClaiming(false);
    if (res && !res.error) {
      applyXpResult(res as XpResult);
      const newClaimed = new Set(claimedQuests).add(q.id);
      setClaimedQuests(newClaimed);
      localStorage.setItem('claimed_quests', JSON.stringify([...newClaimed]));
      pushNotif({ type: 'quest', title: `Квест завершён: ${q.title}`, body: `+${q.xp} XP · +${Math.round(q.xp * 0.5)} Creds`, icon: '📜', color: '#00ff41' });
      if (res.leveled_up)
        pushNotif({ type: 'level', title: `LEVEL UP! → LVL ${res.new_level}`, body: 'Статы улучшены!', icon: '⚡', color: '#00ff41' });
    }
  };

  const getObjDone = (q: Quest, idx: number): boolean => {
    const obj = q.objectives[idx];
    // Сначала проверяем автоматически
    const auto = checkObjective(obj, prog, character ? { level: character.level } : null);
    if (auto) return true;
    // Затем — ручная отметка
    return progressStore.getQuestObjective(q.id, idx);
  };

  const toggleManual = (q: Quest, idx: number) => {
    if (q.status !== 'active') return;
    const obj = q.objectives[idx];
    // Если есть автоматическая проверка — не позволяем снять вручную
    const auto = checkObjective(obj, prog, character ? { level: character.level } : null);
    if (auto) return; // уже выполнено автоматически
    const current = progressStore.getQuestObjective(q.id, idx);
    progressStore.setQuestObjective(q.id, idx, !current);
  };

  const getQuestProgress = (q: Quest) => {
    const done = q.objectives.filter((_, i) => getObjDone(q, i)).length;
    return { done, total: q.objectives.length, pct: Math.round((done / q.objectives.length) * 100) };
  };

  const filtered = QUESTS
    .filter(q => filter === 'all' || q.type === filter)
    .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));

  const activeCount = QUESTS.filter(q => q.status === 'active').length;
  const completedToday = prog.dailyLessons + prog.dailyBattles + prog.dailyDungeons;

  return (
    <section className="py-8 px-4 lg:px-6 min-h-screen relative">
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <div className="mb-5 flex items-end justify-between flex-wrap gap-3">
          <div>
            <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-1">// ЖУРНАЛ МИССИЙ · THE ARCHIVE</div>
            <h2 className="font-orbitron text-2xl text-white">
              КВЕСТЫ <span className="text-cyber-cyan">THE ARCHIVE</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="font-mono text-xs text-cyber-green">{activeCount} активных</div>
            <div className="font-mono text-xs text-gray-600">
              Сегодня: {completedToday} действий
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {(['all', 'story', 'learning', 'daily', 'side', 'rep'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="font-mono text-[10px] px-3 py-1.5 border transition-all"
              style={{
                borderColor: filter === f ? (f === 'all' ? '#00ffff' : TYPE_COLORS[f]) : '#333',
                color: filter === f ? (f === 'all' ? '#00ffff' : TYPE_COLORS[f]) : '#555',
                backgroundColor: filter === f ? (f === 'all' ? '#00ffff10' : TYPE_COLORS[f] + '10') : 'transparent',
              }}>
              {f === 'all' ? 'ВСЕ' : TYPE_LABELS[f].toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Quest list */}
          <div className="w-full lg:w-80 flex-shrink-0 space-y-2">
            {filtered.map(q => {
              const { done, total, pct } = getQuestProgress(q);
              const isSelected = selected?.id === q.id;
              const color = TYPE_COLORS[q.type];
              const isFullyDone = done === total;
              return (
                <button key={q.id} onClick={() => setSelected(q)}
                  className="w-full text-left p-3 border transition-all"
                  style={{
                    borderColor: isSelected ? color + '60' : '#ffffff0a',
                    backgroundColor: isSelected ? color + '06' : 'transparent',
                    borderLeftWidth: isSelected ? '3px' : '1px',
                    opacity: q.status === 'locked' ? 0.4 : 1,
                  }}>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <span className="font-mono text-[9px] px-1.5 py-0.5 border"
                          style={{ color, borderColor: color + '40' }}>
                          {TYPE_LABELS[q.type].toUpperCase()}
                        </span>
                        {q.act && <span className="font-mono text-[9px] text-gray-700">АКТ {q.act}</span>}
                      </div>
                      <div className="font-rajdhani text-sm font-semibold text-white truncate">{q.title}</div>
                    </div>
                    <div className="flex-shrink-0 font-mono text-[10px]" style={{ color: isFullyDone ? '#00ff41' : color }}>
                      {done}/{total}
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-0.5 bg-black/60">
                    <div className="h-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: isFullyDone ? '#00ff41' : color }} />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="font-mono text-[9px] text-gray-700">{q.faction}</div>
                    <div className="font-mono text-[9px]" style={{ color: isFullyDone ? '#00ff41' : '#555' }}>
                      {isFullyDone ? '✓ ГОТОВ К СДАЧЕ' : `${pct}%`}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quest detail */}
          {selected && (
            <div className="flex-1 min-w-0">
              <div className="border p-5 mb-4"
                style={{ borderColor: TYPE_COLORS[selected.type] + '30', backgroundColor: TYPE_COLORS[selected.type] + '04' }}>

                {/* Quest header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-[10px] px-2 py-0.5 border"
                        style={{ color: TYPE_COLORS[selected.type], borderColor: TYPE_COLORS[selected.type] + '50' }}>
                        {TYPE_LABELS[selected.type].toUpperCase()}
                      </span>
                      {selected.act && <span className="font-mono text-[10px] text-gray-600">АКТ {selected.act}</span>}
                      <span className="font-mono text-[10px]" style={{ color: selected.factionColor }}>
                        {selected.faction}
                      </span>
                    </div>
                    <h3 className="font-orbitron text-xl font-black text-white">{selected.title}</h3>
                  </div>
                  <div className="font-orbitron text-sm font-black flex-shrink-0"
                    style={{ color: TYPE_COLORS[selected.type] }}>
                    +{selected.xp} XP
                  </div>
                </div>

                <p className="text-gray-400 font-rajdhani text-sm leading-relaxed mb-5">{selected.desc}</p>

                {/* Objectives */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-mono text-[10px] text-gray-600 tracking-widest">// ЗАДАЧИ</div>
                    <div className="font-mono text-[10px] text-gray-600">
                      {selected.objectives.filter((_, i) => getObjDone(selected, i)).length}/{selected.objectives.length} выполнено
                    </div>
                  </div>
                  <div className="space-y-2">
                    {selected.objectives.map((obj, i) => {
                      const done = getObjDone(selected, i);
                      const isAuto = obj.check && obj.check.type !== 'manual'
                        ? checkObjective(obj, prog, character ? { level: character.level } : null)
                        : false;
                      const color = TYPE_COLORS[selected.type];
                      return (
                        <div key={i}
                          onClick={() => toggleManual(selected, i)}
                          className={`flex items-center gap-3 p-3 border transition-all ${!done && selected.status === 'active' && !isAuto ? 'cursor-pointer hover:border-white/15' : 'cursor-default'}`}
                          style={{ borderColor: done ? color + '30' : '#ffffff08', backgroundColor: done ? color + '05' : 'transparent' }}>

                          {/* Checkbox */}
                          <div className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 transition-all ${done ? '' : 'opacity-50'}`}
                            style={{ borderColor: done ? color : '#333', backgroundColor: done ? color + '25' : 'transparent' }}>
                            {done && <Icon name="Check" size={12} style={{ color }} />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <span className={`font-rajdhani text-sm ${done ? '' : 'text-gray-500'}`}
                              style={{ color: done ? color : undefined, textDecoration: done ? 'none' : undefined }}>
                              {obj.text}
                            </span>
                          </div>

                          {/* Метка источника */}
                          {done && isAuto && (
                            <span className="font-mono text-[9px] flex-shrink-0" style={{ color: color + '80' }}>
                              авто ✓
                            </span>
                          )}
                          {done && !isAuto && (
                            <span className="font-mono text-[9px] text-gray-600 flex-shrink-0">вручную ✓</span>
                          )}
                          {!done && !isAuto && selected.status === 'active' && obj.check?.type === 'manual' && (
                            <span className="font-mono text-[9px] text-gray-700 flex-shrink-0">нажми</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 h-1.5 bg-black/60">
                    <div className="h-full transition-all duration-500"
                      style={{
                        width: `${getQuestProgress(selected).pct}%`,
                        backgroundColor: TYPE_COLORS[selected.type],
                        boxShadow: `0 0 6px ${TYPE_COLORS[selected.type]}`,
                      }} />
                  </div>
                </div>

                {/* Reward */}
                <div className="border border-cyber-yellow/20 bg-cyber-yellow/5 p-3 mb-4">
                  <div className="font-mono text-[10px] text-gray-600 mb-1">// НАГРАДА</div>
                  <div className="font-orbitron text-sm text-cyber-yellow">{selected.reward}</div>
                </div>

                {/* Lore */}
                <div className="border-l-2 pl-4 italic" style={{ borderColor: TYPE_COLORS[selected.type] + '40' }}>
                  <p className="text-gray-600 font-rajdhani text-xs leading-relaxed">{selected.lore}</p>
                </div>

                {/* CTA если все выполнены */}
                {getQuestProgress(selected).pct === 100 && (
                  <div className="mt-4 p-3 border border-cyber-green/40 bg-cyber-green/5 flex items-center justify-between">
                    <div>
                      <div className="font-orbitron text-sm text-cyber-green">
                        {claimedQuests.has(selected.id) ? '✓ НАГРАДА ПОЛУЧЕНА' : '✓ ВСЕ ЗАДАЧИ ВЫПОЛНЕНЫ'}
                      </div>
                      <div className="font-mono text-[10px] text-gray-600 mt-0.5">
                        {claimedQuests.has(selected.id) ? `+${selected.xp} XP зачислено` : 'Квест готов к завершению'}
                      </div>
                    </div>
                    {!claimedQuests.has(selected.id) && (
                      <button
                        onClick={() => claimReward(selected)}
                        disabled={claiming}
                        className="font-orbitron text-xs px-4 py-2 border border-cyber-green text-cyber-green bg-cyber-green/10 hover:bg-cyber-green/20 transition-all disabled:opacity-50">
                        {claiming ? '...' : 'СДАТЬ'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation shortcuts */}
              {onNavigate && (
                <div className="border border-white/8 p-4">
                  <div className="font-mono text-[10px] text-gray-600 mb-3">// БЫСТРЫЕ ПЕРЕХОДЫ</div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'К урокам', section: 'lessons', icon: 'BookOpen' },
                      { label: 'В бой', section: 'battle', icon: 'Swords' },
                      { label: 'Данжи', section: 'dungeon', icon: 'Castle' },
                      { label: 'NPC', section: 'npc', icon: 'MessageCircle' },
                    ].map(a => (
                      <button key={a.section}
                        onClick={() => onNavigate(a.section)}
                        className="flex items-center gap-1.5 font-mono text-[10px] px-3 py-1.5 border border-white/10 text-gray-500 hover:text-white hover:border-white/30 transition-all">
                        <Icon name={a.icon as 'BookOpen'} size={11} />
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}