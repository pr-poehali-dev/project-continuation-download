/**
 * 20 врагов кампании — по 4 на каждую из 5 глав.
 * Имена-Python-ошибки усиливают тематику.
 *
 * Привязки:
 *  - chapter: 1-5 (когда враг доступен)
 *  - topics:  какие темы Python будет использовать
 *  - difficulty: фильтр сложности задач
 */

import type { TaskTopic, TaskDiff } from './combatTasks';

export interface CombatEnemy {
  /** Уникальный id (используется на бекенде для записи побед). */
  id: string;
  /** Имя врага (часто отсылка к Python ошибкам). */
  name: string;
  /** Глава (1-5), в которой враг появляется. */
  chapter: number;
  level: number;
  hp: number;
  difficulty: TaskDiff;
  /** Темы Python, по которым будут задачи. */
  topics: TaskTopic[];
  /** Фракция-владелец. */
  faction: 'NEXUS' | 'BLACK_SYNTAX' | 'ORDER' | 'ROGUE';
  /** Атаки PREDICT — короткий код, который враг "бросает" игроку. */
  enemyAttacks?: { code: string; expected: string }[];
  /** Кол-во задач в бою (= раундов). */
  taskCount: number;
  /** Награда XP при победе. */
  xpReward: number;
  /** Награда Creds при победе. */
  credsReward: number;
  color: string;
  emoji: string;
  /** Описание для UI выбора. */
  lore: string;
  /** Реплика-флавор в начале боя. */
  taunt?: string;
  /** Является ли боссом главы (многофазный бой, особые награды). */
  boss?: boolean;
}

export const ENEMIES: CombatEnemy[] = [
  // ═══════════════ ГЛАВА 1: Пробуждение ═══════════════
  {
    id: 'syntax_ghost',
    name: 'SyntaxGhost',
    chapter: 1, level: 2, hp: 100, difficulty: 'trivial',
    topics: ['variables', 'conditions'],
    faction: 'NEXUS',
    taskCount: 3,
    xpReward: 80, credsReward: 40,
    color: '#00ff41', emoji: '👻',
    lore: 'Призрак неверного синтаксиса. Слабый, но множится в коде новичков.',
    taunt: 'Привет, агент. Покажи что умеешь объявлять переменные.',
    enemyAttacks: [
      { code: 'print(7 - 4)', expected: '3' },
    ],
  },
  {
    id: 'name_error',
    name: 'NameError-α',
    chapter: 1, level: 4, hp: 160, difficulty: 'easy',
    topics: ['variables', 'conditions', 'functions'],
    faction: 'NEXUS',
    taskCount: 4,
    xpReward: 140, credsReward: 70,
    color: '#00ff41', emoji: '🤖',
    lore: 'Дрон-сборщик имён. Стирает переменные из памяти.',
    enemyAttacks: [
      { code: 'x = 10\nprint(x * 2)', expected: '20' },
      { code: 'a, b = 3, 4\nprint(a + b)', expected: '7' },
    ],
  },
  {
    id: 'type_error',
    name: 'TypeError-β',
    chapter: 1, level: 6, hp: 220, difficulty: 'easy',
    topics: ['variables', 'conditions', 'loops'],
    faction: 'NEXUS',
    taskCount: 4,
    xpReward: 200, credsReward: 100,
    color: '#00aaff', emoji: '⚡',
    lore: 'Аномалия типов. Превращает int в str и обратно.',
  },
  {
    id: 'indent_demon',
    name: 'IndentDemon',
    chapter: 1, level: 8, hp: 350, difficulty: 'medium',
    topics: ['conditions', 'loops', 'functions'],
    faction: 'NEXUS',
    taskCount: 5,
    xpReward: 320, credsReward: 160,
    color: '#ff00ff', emoji: '🔱',
    boss: true,
    lore: 'БОСС ГЛАВЫ 1. Демон отступов. Сжирает табуляцию.',
    taunt: 'Один пропущенный пробел — и твоя программа мертва. Готов?',
    enemyAttacks: [
      { code: 'for i in range(3):\n    print(i)', expected: '0\n1\n2' },
    ],
  },

  // ═══════════════ ГЛАВА 2: Сеть данных ═══════════════
  {
    id: 'list_devourer',
    name: 'ListDevourer',
    chapter: 2, level: 10, hp: 400, difficulty: 'medium',
    topics: ['lists', 'comprehensions', 'loops'],
    faction: 'BLACK_SYNTAX',
    taskCount: 4,
    xpReward: 400, credsReward: 200,
    color: '#aa00ff', emoji: '🐍',
    lore: 'Пожиратель списков из Black Syntax. Любит срезы.',
    enemyAttacks: [
      { code: 'x = [1,2,3,4,5]\nprint(x[::2])', expected: '[1, 3, 5]' },
      { code: 'print(len([1, [2, 3], 4]))', expected: '3' },
    ],
  },
  {
    id: 'dict_phantom',
    name: 'DictPhantom',
    chapter: 2, level: 12, hp: 480, difficulty: 'medium',
    topics: ['dicts', 'lists', 'loops'],
    faction: 'BLACK_SYNTAX',
    taskCount: 5,
    xpReward: 500, credsReward: 250,
    color: '#aa00ff', emoji: '🎭',
    lore: 'Фантом ключей. Стирает значения из словарей.',
  },
  {
    id: 'comp_specter',
    name: 'ComprehensionSpecter',
    chapter: 2, level: 14, hp: 550, difficulty: 'hard',
    topics: ['comprehensions', 'lists', 'dicts'],
    faction: 'BLACK_SYNTAX',
    taskCount: 5,
    xpReward: 650, credsReward: 320,
    color: '#ff00ff', emoji: '🌀',
    lore: 'Специалист по однострочникам. Ненавидит циклы for.',
  },
  {
    id: 'data_warden',
    name: 'DataWarden',
    chapter: 2, level: 17, hp: 800, difficulty: 'hard',
    topics: ['lists', 'dicts', 'comprehensions', 'loops'],
    faction: 'BLACK_SYNTAX',
    taskCount: 6,
    xpReward: 1000, credsReward: 500,
    color: '#ff0088', emoji: '🏛️',
    boss: true,
    lore: 'БОСС ГЛАВЫ 2. Хранитель данных Black Syntax. Знает структуры наизусть.',
    taunt: 'Данные не лгут. Покажи что умеешь с ними работать.',
  },

  // ═══════════════ ГЛАВА 3: Функции силы ═══════════════
  {
    id: 'func_hollow',
    name: 'FunctionHollow',
    chapter: 3, level: 19, hp: 900, difficulty: 'hard',
    topics: ['functions', 'conditions'],
    faction: 'ORDER',
    taskCount: 5,
    xpReward: 1100, credsReward: 550,
    color: '#ffaa00', emoji: '⚖️',
    lore: 'Пустотный функционал Ордена. Не возвращает ничего.',
  },
  {
    id: 'class_arbiter',
    name: 'ClassArbiter',
    chapter: 3, level: 21, hp: 1100, difficulty: 'hard',
    topics: ['oop', 'functions'],
    faction: 'ORDER',
    taskCount: 5,
    xpReward: 1300, credsReward: 650,
    color: '#ffaa00', emoji: '🧙',
    lore: 'Арбитр классов. Судит чистоту твоего ООП.',
    enemyAttacks: [
      { code: 'class A:\n    x = 5\nprint(A().x)', expected: '5' },
    ],
  },
  {
    id: 'self_inquisitor',
    name: 'SelfInquisitor',
    chapter: 3, level: 23, hp: 1300, difficulty: 'elite',
    topics: ['oop', 'functions', 'errors'],
    faction: 'ORDER',
    taskCount: 6,
    xpReward: 1600, credsReward: 800,
    color: '#ff6600', emoji: '🛡️',
    lore: 'Инквизитор self. Заставит писать методы правильно.',
  },
  {
    id: 'algorithm_judge',
    name: 'AlgorithmJudge',
    chapter: 3, level: 25, hp: 1700, difficulty: 'elite',
    topics: ['functions', 'oop', 'comprehensions', 'loops'],
    faction: 'ORDER',
    taskCount: 7,
    xpReward: 2200, credsReward: 1100,
    color: '#ff8800', emoji: '⚔️',
    boss: true,
    lore: 'БОСС ГЛАВЫ 3. Алгоритм-судья Ордена. Многофазный бой: WRITE → DEBUG → REFACTOR.',
    taunt: 'Я был написан Гвидо. Я никогда не падал. Покажи свой код.',
  },

  // ═══════════════ ГЛАВА 4: Глубже в код ═══════════════
  {
    id: 'except_wraith',
    name: 'ExceptWraith',
    chapter: 4, level: 27, hp: 1900, difficulty: 'elite',
    topics: ['errors', 'functions'],
    faction: 'NEXUS',
    taskCount: 6,
    xpReward: 2500, credsReward: 1250,
    color: '#ff4060', emoji: '☠️',
    lore: 'Призрак непойманных исключений. Распадается на try/except.',
  },
  {
    id: 'module_titan',
    name: 'ModuleTitan',
    chapter: 4, level: 29, hp: 2200, difficulty: 'elite',
    topics: ['modules', 'functions', 'errors'],
    faction: 'NEXUS',
    taskCount: 7,
    xpReward: 3000, credsReward: 1500,
    color: '#ff2080', emoji: '🗿',
    lore: 'Титан модулей. Импортирует тебя в небытие.',
  },
  {
    id: 'recursion_lord',
    name: 'RecursionLord',
    chapter: 4, level: 31, hp: 2600, difficulty: 'elite',
    topics: ['functions', 'oop', 'errors'],
    faction: 'BLACK_SYNTAX',
    taskCount: 7,
    xpReward: 3500, credsReward: 1750,
    color: '#aa00aa', emoji: '🔁',
    lore: 'Лорд рекурсии. Любит сам себя.',
    enemyAttacks: [
      { code: 'def f(n): return 1 if n<=1 else n*f(n-1)\nprint(f(4))', expected: '24' },
    ],
  },
  {
    id: 'nexus_architect',
    name: 'NEXUS-Architect',
    chapter: 4, level: 35, hp: 3500, difficulty: 'elite',
    topics: ['oop', 'errors', 'modules', 'functions'],
    faction: 'NEXUS',
    taskCount: 8,
    xpReward: 5000, credsReward: 2500,
    color: '#ff0055', emoji: '🏗️',
    boss: true,
    lore: 'БОСС ГЛАВЫ 4. Главный архитектор NEXUS. Знает все паттерны.',
    taunt: 'Я писал код для тебя ещё до твоего рождения. Сразимся?',
  },

  // ═══════════════ ГЛАВА 5: Восхождение ═══════════════
  {
    id: 'async_specter',
    name: 'AsyncSpecter',
    chapter: 5, level: 38, hp: 4500, difficulty: 'elite',
    topics: ['async', 'functions'],
    faction: 'ROGUE',
    taskCount: 8,
    xpReward: 6000, credsReward: 3000,
    color: '#00ffff', emoji: '🌌',
    lore: 'Асинхронный призрак. Атакует во всех корутинах одновременно.',
  },
  {
    id: 'decorator_overlord',
    name: 'DecoratorOverlord',
    chapter: 5, level: 41, hp: 5500, difficulty: 'elite',
    topics: ['decorators', 'functions', 'oop'],
    faction: 'ROGUE',
    taskCount: 8,
    xpReward: 7500, credsReward: 3750,
    color: '#ff00ff', emoji: '👑',
    lore: 'Властелин обёрток. Декорирует всё включая твою смерть.',
  },
  {
    id: 'metaclass_ancient',
    name: 'MetaclassAncient',
    chapter: 5, level: 45, hp: 7000, difficulty: 'elite',
    topics: ['oop', 'decorators', 'functions', 'modules'],
    faction: 'ROGUE',
    taskCount: 9,
    xpReward: 10000, credsReward: 5000,
    color: '#8800ff', emoji: '🔮',
    lore: 'Древний метакласс. Создаёт классы которые создают классы.',
  },
  {
    id: 'pyth_0n',
    name: 'PYTH-0N',
    chapter: 5, level: 50, hp: 12000, difficulty: 'elite',
    topics: ['decorators', 'async', 'oop', 'errors', 'comprehensions', 'modules'],
    faction: 'NEXUS',
    taskCount: 10,
    xpReward: 25000, credsReward: 10000,
    color: '#ff0000', emoji: '🐉',
    boss: true,
    lore: 'ФИНАЛЬНЫЙ БОСС. CEO NEXUS. Воплощение языка Python. Все 5 типов задач, все темы.',
    taunt: 'I am the language. I am the rules. Покажи что ты усвоил.',
  },
];

export function getEnemyById(id: string): CombatEnemy | undefined {
  return ENEMIES.find(e => e.id === id);
}

export function getEnemiesForChapter(chapter: number): CombatEnemy[] {
  return ENEMIES.filter(e => e.chapter === chapter);
}

/** Доступные игроку по его прогрессу (главы пройдены или активны). */
export function getAvailableEnemies(currentChapter: number): CombatEnemy[] {
  return ENEMIES.filter(e => e.chapter <= currentChapter);
}
