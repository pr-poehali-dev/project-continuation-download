/**
 * Боевые задачи Combat Code 2.0
 *
 * 5 типов задач: WRITE / PREDICT / DEBUG / REFACTOR / COMPLETE
 * Каждая задача — реальная проверка через Pyodide (см. pyodideRunner.ts)
 */

import type { TestCase } from './pyodideRunner';

export type TaskType = 'write' | 'predict' | 'debug' | 'refactor' | 'complete';
export type TaskTopic = 'variables' | 'conditions' | 'loops' | 'lists' | 'dicts' | 'functions' | 'oop' | 'comprehensions' | 'errors' | 'modules' | 'async' | 'decorators';
export type TaskDiff = 'trivial' | 'easy' | 'medium' | 'hard' | 'elite';

/** Общая инфа любой задачи */
interface TaskBase {
  id: string;
  topic: TaskTopic;
  difficulty: TaskDiff;
  /** Базовый XP за идеальное решение. Урон считается отдельно. */
  baseXp: number;
  /** Подсказка — стоит штраф к урону. */
  hint: string;
  /** Лор-флавор: что говорит враг при выдаче задачи. */
  flavor?: string;
}

export interface WriteTask extends TaskBase {
  type: 'write';
  /** Что игрок должен написать. */
  description: string;
  /** Стартовый код (обычно пустой или заголовок функции). */
  starter: string;
  /** Тесты, по которым проверяем решение. */
  tests: TestCase[];
}

export interface PredictTask extends TaskBase {
  type: 'predict';
  /** Код который "бросает" враг — игрок угадывает вывод. */
  code: string;
  /** Эталонный вывод (обычно строка). Если undefined — посчитаем через Pyodide. */
  expectedOutput?: string;
}

export interface DebugTask extends TaskBase {
  type: 'debug';
  description: string;
  /** Сломанный код. */
  brokenCode: string;
  /** Тесты после починки. */
  tests: TestCase[];
}

export interface RefactorTask extends TaskBase {
  type: 'refactor';
  description: string;
  /** Длинный но рабочий код. */
  originalCode: string;
  /** Максимальная длина исправленного кода (без пробелов). */
  maxLength: number;
  tests: TestCase[];
}

export interface CompleteTask extends TaskBase {
  type: 'complete';
  description: string;
  /** Шаблон с дыркой ___PLAYER___. */
  template: string;
  tests: TestCase[];
}

export type CombatTask = WriteTask | PredictTask | DebugTask | RefactorTask | CompleteTask;

// ═════════════════ КОНТЕНТ — 30+ ЗАДАЧ ═════════════════

export const COMBAT_TASKS: CombatTask[] = [
  // ─── ГЛАВА 1: ОСНОВЫ (variables / conditions / loops) ──────────────────

  {
    id: 'w_var_1',
    type: 'write',
    topic: 'variables',
    difficulty: 'trivial',
    baseXp: 30,
    description: 'Создай функцию greet(name), которая возвращает строку "Привет, {name}!"',
    starter: 'def greet(name):\n    ',
    hint: 'return f"Привет, {name}!"',
    flavor: 'NEXUS-Drone сканирует твою личность. Покажи что ты не бот — поздоровайся.',
    tests: [
      { call: 'greet("Nova")', expect: "'Привет, Nova!'", label: 'greet("Nova")' },
      { call: 'greet("Ghost")', expect: "'Привет, Ghost!'", label: 'greet("Ghost")' },
    ],
  },
  {
    id: 'p_print_1',
    type: 'predict',
    topic: 'variables',
    difficulty: 'trivial',
    baseXp: 25,
    hint: 'Сложение чисел и строк работает по-разному.',
    flavor: 'Враг бросает простой код. Что он напечатает?',
    code: 'a = 5\nb = 3\nprint(a + b)',
    expectedOutput: '8',
  },
  {
    id: 'w_cond_1',
    type: 'write',
    topic: 'conditions',
    difficulty: 'easy',
    baseXp: 45,
    description: 'Функция is_adult(age) возвращает True если возраст >= 18, иначе False',
    starter: 'def is_adult(age):\n    ',
    hint: 'return age >= 18',
    flavor: 'Проверка допуска к корпоративной сети.',
    tests: [
      { call: 'is_adult(20)', expect: 'True' },
      { call: 'is_adult(17)', expect: 'False' },
      { call: 'is_adult(18)', expect: 'True' },
    ],
  },
  {
    id: 'c_loop_1',
    type: 'complete',
    topic: 'loops',
    difficulty: 'easy',
    baseXp: 50,
    description: 'Допиши тело цикла так, чтобы функция вернула сумму чисел от 1 до n включительно',
    template: 'def sum_to(n):\n    total = 0\n    for i in range(1, n + 1):\n        ___PLAYER___\n    return total',
    hint: 'total += i',
    flavor: 'Восстанови повреждённый алгоритм.',
    tests: [
      { call: 'sum_to(5)', expect: '15' },
      { call: 'sum_to(10)', expect: '55' },
      { call: 'sum_to(1)', expect: '1' },
    ],
  },
  {
    id: 'd_loop_1',
    type: 'debug',
    topic: 'loops',
    difficulty: 'medium',
    baseXp: 70,
    description: 'Функция должна возвращать список квадратов от 1 до n. Найди и исправь ошибку.',
    brokenCode: 'def squares(n):\n    result = []\n    for i in range(n):\n        result.append(i * i)\n    return result',
    hint: 'range(n) даёт 0..n-1, а нужно 1..n.',
    flavor: 'Враг подсунул сломанный код. Почини — урон будет тебе же.',
    tests: [
      { call: 'squares(3)', expect: '[1, 4, 9]' },
      { call: 'squares(5)', expect: '[1, 4, 9, 16, 25]' },
      { call: 'squares(1)', expect: '[1]' },
    ],
  },

  // ─── ГЛАВА 2: КОЛЛЕКЦИИ (lists / dicts / comprehensions) ───────────────

  {
    id: 'w_list_1',
    type: 'write',
    topic: 'lists',
    difficulty: 'easy',
    baseXp: 50,
    description: 'Функция reverse_list(lst) возвращает список в обратном порядке',
    starter: 'def reverse_list(lst):\n    ',
    hint: 'return lst[::-1]',
    flavor: 'Поменяй порядок пакетов данных.',
    tests: [
      { call: 'reverse_list([1, 2, 3])', expect: '[3, 2, 1]' },
      { call: 'reverse_list([])', expect: '[]' },
      { call: 'reverse_list(["a", "b"])', expect: "['b', 'a']" },
    ],
  },
  {
    id: 'w_comp_1',
    type: 'write',
    topic: 'comprehensions',
    difficulty: 'medium',
    baseXp: 80,
    description: 'evens(n) — список чётных чисел от 0 до n включительно через list comprehension',
    starter: 'def evens(n):\n    ',
    hint: 'return [x for x in range(n + 1) if x % 2 == 0]',
    flavor: 'Найди уязвимости — только чётные порты.',
    tests: [
      { call: 'evens(10)', expect: '[0, 2, 4, 6, 8, 10]' },
      { call: 'evens(5)', expect: '[0, 2, 4]' },
      { call: 'evens(1)', expect: '[0]' },
    ],
  },
  {
    id: 'p_list_1',
    type: 'predict',
    topic: 'lists',
    difficulty: 'medium',
    baseXp: 65,
    hint: 'Срезы можно расширять до конца.',
    flavor: 'Враг ломает твой стек. Угадай что в нём останется.',
    code: 'x = [10, 20, 30, 40, 50]\nprint(x[1:4])',
    expectedOutput: '[20, 30, 40]',
  },
  {
    id: 'w_dict_1',
    type: 'write',
    topic: 'dicts',
    difficulty: 'medium',
    baseXp: 80,
    description: 'count_chars(s) — словарь {буква: количество} для строки s',
    starter: 'def count_chars(s):\n    ',
    hint: 'result = {}\nfor c in s:\n    result[c] = result.get(c, 0) + 1\nreturn result',
    flavor: 'Расшифруй частоту символов.',
    tests: [
      { call: 'count_chars("hello")', expect: "{'h': 1, 'e': 1, 'l': 2, 'o': 1}" },
      { call: 'count_chars("aaa")', expect: "{'a': 3}" },
      { call: 'count_chars("")', expect: '{}' },
    ],
  },
  {
    id: 'r_loop_1',
    type: 'refactor',
    topic: 'comprehensions',
    difficulty: 'hard',
    baseXp: 100,
    description: 'Перепиши эту функцию в одну строку с list comprehension. Должно быть короче 35 символов.',
    originalCode: 'def doubles(nums):\n    result = []\n    for x in nums:\n        result.append(x * 2)\n    return result',
    maxLength: 35,
    hint: 'def doubles(n): return [x*2 for x in n]',
    flavor: 'Элегантность — это броня. Сократи код.',
    tests: [
      { call: 'doubles([1, 2, 3])', expect: '[2, 4, 6]' },
      { call: 'doubles([])', expect: '[]' },
      { call: 'doubles([-1, 0, 1])', expect: '[-2, 0, 2]' },
    ],
  },

  // ─── ГЛАВА 3: ФУНКЦИИ И ООП ─────────────────────────────────────────────

  {
    id: 'w_func_1',
    type: 'write',
    topic: 'functions',
    difficulty: 'medium',
    baseXp: 75,
    description: 'fizzbuzz(n) — список из n строк по правилам Fizz/Buzz/FizzBuzz, иначе число строкой',
    starter: 'def fizzbuzz(n):\n    ',
    hint: 'return ["FizzBuzz" if i%15==0 else "Fizz" if i%3==0 else "Buzz" if i%5==0 else str(i) for i in range(1, n+1)]',
    flavor: 'Классический тест на собеседовании NEXUS.',
    tests: [
      { call: 'fizzbuzz(5)', expect: "['1', '2', 'Fizz', '4', 'Buzz']" },
      { call: 'fizzbuzz(15)[-1]', expect: "'FizzBuzz'" },
      { call: 'fizzbuzz(3)', expect: "['1', '2', 'Fizz']" },
    ],
  },
  {
    id: 'w_oop_1',
    type: 'write',
    topic: 'oop',
    difficulty: 'hard',
    baseXp: 120,
    description: 'Класс Counter с методами inc() (++), dec() (--), value() — текущее значение. Начальное 0.',
    starter: 'class Counter:\n    ',
    hint: 'class Counter:\n    def __init__(self):\n        self.n = 0\n    def inc(self):\n        self.n += 1\n    def dec(self):\n        self.n -= 1\n    def value(self):\n        return self.n',
    flavor: 'Постройся в боевой класс агента.',
    tests: [
      { call: '(lambda: (c := Counter(), c.inc(), c.inc(), c.inc(), c.dec(), c.value())[-1])()', expect: '2', label: '+3, -1 → 2' },
      { call: 'Counter().value()', expect: '0', label: 'start = 0' },
    ],
  },
  {
    id: 'd_func_1',
    type: 'debug',
    topic: 'functions',
    difficulty: 'medium',
    baseXp: 75,
    description: 'Функция должна возвращать максимум из списка. Сейчас падает на пустом списке. Почини.',
    brokenCode: 'def safe_max(lst):\n    return max(lst)',
    hint: 'if not lst: return None\nreturn max(lst)',
    flavor: 'Защита от пустого ввода — основа выживания.',
    tests: [
      { call: 'safe_max([3, 1, 4])', expect: '4' },
      { call: 'safe_max([])', expect: 'None' },
      { call: 'safe_max([-5])', expect: '-5' },
    ],
  },
  {
    id: 'p_func_1',
    type: 'predict',
    topic: 'functions',
    difficulty: 'hard',
    baseXp: 90,
    hint: 'Аргументы по умолчанию — это ловушка.',
    flavor: 'Враг знает про мутабельные дефолты. А ты?',
    code: 'def add(x, lst=[]):\n    lst.append(x)\n    return lst\nadd(1)\nadd(2)\nprint(add(3))',
    expectedOutput: '[1, 2, 3]',
  },

  // ─── ГЛАВА 4: ОБРАБОТКА (errors / modules) ──────────────────────────────

  {
    id: 'w_err_1',
    type: 'write',
    topic: 'errors',
    difficulty: 'medium',
    baseXp: 75,
    description: 'safe_div(a, b) — возвращает a/b или строку "div by zero" если b == 0',
    starter: 'def safe_div(a, b):\n    ',
    hint: 'try:\n    return a / b\nexcept ZeroDivisionError:\n    return "div by zero"',
    flavor: 'Не позволь врагу уронить твой процесс.',
    tests: [
      { call: 'safe_div(10, 2)', expect: '5.0' },
      { call: 'safe_div(5, 0)', expect: "'div by zero'" },
      { call: 'safe_div(0, 5)', expect: '0.0' },
    ],
  },
  {
    id: 'c_err_1',
    type: 'complete',
    topic: 'errors',
    difficulty: 'medium',
    baseXp: 70,
    description: 'Допиши обработку ошибки: вернуть -1 если в строке нет числа',
    template: 'def parse_or_default(s):\n    try:\n        return int(s)\n    except ___PLAYER___:\n        return -1',
    hint: 'ValueError',
    flavor: 'Защити агента от мусорного ввода.',
    tests: [
      { call: 'parse_or_default("42")', expect: '42' },
      { call: 'parse_or_default("abc")', expect: '-1' },
      { call: 'parse_or_default("0")', expect: '0' },
    ],
  },

  // ─── ГЛАВА 5: ВЫСШИЙ КОД (decorators / async) ───────────────────────────

  {
    id: 'w_dec_1',
    type: 'write',
    topic: 'decorators',
    difficulty: 'elite',
    baseXp: 180,
    description: 'Декоратор @double который удваивает результат функции',
    starter: 'def double(fn):\n    ',
    hint: 'def double(fn):\n    def wrapper(*a, **kw):\n        return fn(*a, **kw) * 2\n    return wrapper',
    flavor: 'Финальный приём — обёртка реальности.',
    tests: [
      { call: '(double(lambda x: x + 1))(5)', expect: '12', label: 'double(+1)(5) = 12' },
      { call: '(double(lambda: 10))()', expect: '20', label: 'double(=>10)() = 20' },
    ],
  },
  {
    id: 'r_oop_1',
    type: 'refactor',
    topic: 'oop',
    difficulty: 'elite',
    baseXp: 200,
    description: 'Сократи класс Point: используй dataclass или короткий __init__. Меньше 80 символов.',
    originalCode: 'class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n    def total(self):\n        return self.x + self.y',
    maxLength: 80,
    hint: 'class Point:\n    def __init__(s,x,y): s.x,s.y=x,y\n    def total(s): return s.x+s.y',
    flavor: 'Боссу нужна компактная атака. Урежь жирок.',
    tests: [
      { call: 'Point(3, 4).total()', expect: '7' },
      { call: 'Point(0, 0).total()', expect: '0' },
      { call: 'Point(-1, 1).total()', expect: '0' },
    ],
  },
];

// ═════════════════ ВЫБОР ЗАДАЧ ПО ВРАГУ ═════════════════

export function pickTasksForEnemy(enemyTopics: TaskTopic[], enemyDifficulty: TaskDiff, count = 4): CombatTask[] {
  // Сложность врага → допустимые сложности задач
  const diffMap: Record<TaskDiff, TaskDiff[]> = {
    trivial: ['trivial', 'easy'],
    easy:    ['trivial', 'easy', 'medium'],
    medium:  ['easy', 'medium', 'hard'],
    hard:    ['medium', 'hard', 'elite'],
    elite:   ['hard', 'elite'],
  };
  const allowed = diffMap[enemyDifficulty];

  const pool = COMBAT_TASKS.filter(t =>
    enemyTopics.includes(t.topic) && allowed.includes(t.difficulty)
  );
  // Если пул маленький — добавим из соседних тем
  const fallback = COMBAT_TASKS.filter(t => allowed.includes(t.difficulty));
  const chosen = (pool.length >= count ? pool : [...pool, ...fallback])
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
  return chosen;
}

// ═════════════════ ФОРМУЛА УРОНА (SKILL > STATS, но статы важны) ═══════

export interface DamageContext {
  /** % пройденных тестов 0..1 */
  testPassRate: number;
  /** Время в секундах до сдачи (0 = мгновенно, 60+ = долго). */
  timeSec: number;
  /** Лимит времени в секундах. */
  timeLimit: number;
  /** Использовал ли подсказку. */
  usedHint: boolean;
  /** Текущая серия правильных ответов подряд. */
  combo: number;
  /** Стат intelligence игрока (база 10, прокачивается). */
  intelligence: number;
  /** Базовый XP задачи — используется как базовый урон. */
  taskBaseXp: number;
  /** Сложность задачи. */
  difficulty: TaskDiff;
  /** Тип задачи — REFACTOR/DEBUG бьют больнее. */
  taskType: TaskType;
}

export interface DamageResult {
  damage: number;
  components: {
    base: number;
    accuracy: number;
    timeBonus: number;
    eleganceBonus: number;
    statBonus: number;
    comboMult: number;
    typeMult: number;
  };
  /** Был ли крит. */
  critical: boolean;
}

const DIFFICULTY_MULT: Record<TaskDiff, number> = {
  trivial: 0.8, easy: 1.0, medium: 1.3, hard: 1.7, elite: 2.2,
};
const TASK_TYPE_MULT: Record<TaskType, number> = {
  predict: 0.9,
  write:    1.0,
  complete: 0.85,
  debug:    1.15,
  refactor: 1.25,
};

export function calculateDamage(ctx: DamageContext): DamageResult {
  // База от задачи + сложности
  const base = ctx.taskBaseXp * DIFFICULTY_MULT[ctx.difficulty];

  // Точность тестов: всё-или-ничего штраф для < 50%
  const accuracy = ctx.testPassRate < 0.5 ? ctx.testPassRate * 0.4 : ctx.testPassRate;

  // Бонус скорости: 0..0.5 (быстрее половины таймера → +50%)
  const timeRatio = Math.min(1, ctx.timeSec / ctx.timeLimit);
  const timeBonus = Math.max(0, 1 - timeRatio) * 0.5;

  // Бонус элегантности: подсказка убирает +20%
  const eleganceBonus = ctx.usedHint ? 0 : 0.2;

  // СТАТ: до 2× к финальному урону (intelligence 10 = +0%, intelligence 60 = +100%)
  // По выбору пользователя: «среднее влияние — до двухразного»
  const statBonus = Math.max(0, (ctx.intelligence - 10) * 0.02);

  // Комбо: 3+ подряд = +20%/шт до +100%
  const comboMult = 1 + Math.min(1.0, Math.max(0, ctx.combo - 2) * 0.2);

  // Тип задачи
  const typeMult = TASK_TYPE_MULT[ctx.taskType];

  // Итог
  const raw = base * accuracy * (1 + timeBonus) * (1 + eleganceBonus) * (1 + statBonus) * comboMult * typeMult;

  // Крит: идеально + быстро + без подсказки + комбо ≥ 3
  const critical = ctx.testPassRate === 1 && timeBonus > 0.3 && !ctx.usedHint && ctx.combo >= 3;
  const damage = Math.round(critical ? raw * 1.5 : raw);

  return {
    damage: Math.max(1, damage),
    critical,
    components: {
      base: Math.round(base),
      accuracy: Math.round(accuracy * 100) / 100,
      timeBonus: Math.round(timeBonus * 100) / 100,
      eleganceBonus,
      statBonus: Math.round(statBonus * 100) / 100,
      comboMult: Math.round(comboMult * 100) / 100,
      typeMult,
    },
  };
}
