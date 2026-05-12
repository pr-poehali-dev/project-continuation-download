// ─── База задач для Code Combat ───────────────────────────────────────────────
// Задачи сгруппированы по темам и сложности. При бое выбирается случайная задача
// из подходящего пула. После успешного выполнения — следующая задача из того же
// или более сложного пула.

export type TaskDifficulty = 'easy' | 'medium' | 'hard' | 'elite';
export type TaskTopic =
  | 'variables' | 'strings' | 'conditions' | 'loops' | 'functions'
  | 'lists' | 'dicts' | 'comprehension' | 'oop' | 'algorithms'
  | 'numpy' | 'pandas' | 'ml' | 'neural_net';

export interface BattleTask {
  id: string;
  topic: TaskTopic;
  difficulty: TaskDifficulty;
  description: string;
  keywords: string[];
  hint: string;
  /** Для классов Data Ghost и Neural Architect — специфичные задачи */
  classFilter?: ('cipher' | 'data_ghost' | 'neural_architect')[];
}

// ─── EASY — переменные, строки, простые условия ────────────────────────────
const EASY_TASKS: BattleTask[] = [
  {
    id: 'e001', topic: 'variables', difficulty: 'easy',
    description: 'Создай переменную agent_id и присвой ей строку со своим именем',
    keywords: ['agent_id', '=', '"'], hint: 'agent_id = "Nova_7"',
  },
  {
    id: 'e002', topic: 'variables', difficulty: 'easy',
    description: 'Создай переменную level = 7 и выведи её через print()',
    keywords: ['level', '=', '7', 'print'], hint: 'level = 7\nprint(level)',
  },
  {
    id: 'e003', topic: 'variables', difficulty: 'easy',
    description: 'Объяви переменные x = 10, y = 5 и выведи их сумму',
    keywords: ['x', '=', '10', 'y', '=', '5', 'print', '+'], hint: 'x = 10\ny = 5\nprint(x + y)',
  },
  {
    id: 'e004', topic: 'strings', difficulty: 'easy',
    description: 'Создай f-строку: переменная name = "Nova", выведи "Агент: Nova"',
    keywords: ['name', '=', 'f"', 'print'], hint: 'name = "Nova"\nprint(f"Агент: {name}")',
  },
  {
    id: 'e005', topic: 'strings', difficulty: 'easy',
    description: 'Выведи длину строки "CodeGrid-9" через len()',
    keywords: ['len', '"CodeGrid-9"', 'print'], hint: 'print(len("CodeGrid-9"))',
  },
  {
    id: 'e006', topic: 'strings', difficulty: 'easy',
    description: 'Преобразуй строку "nexus" в верхний регистр через .upper()',
    keywords: ['upper()', 'print'], hint: 'print("nexus".upper())',
  },
  {
    id: 'e007', topic: 'conditions', difficulty: 'easy',
    description: 'Если threat_level = 8, напиши if/else: >= 5 → "DANGER", иначе "SAFE"',
    keywords: ['if', 'threat_level', '>=', '5', 'else'], hint: 'threat_level = 8\nif threat_level >= 5:\n    print("DANGER")\nelse:\n    print("SAFE")',
  },
  {
    id: 'e008', topic: 'conditions', difficulty: 'easy',
    description: 'Проверь: если x = 42 чётное (x % 2 == 0), выведи "EVEN"',
    keywords: ['x', '=', '42', '%', '2', '==', '0', 'print'], hint: 'x = 42\nif x % 2 == 0:\n    print("EVEN")',
  },
  {
    id: 'e009', topic: 'variables', difficulty: 'easy',
    description: 'Объяви boolean is_hacker = True и выведи его тип через type()',
    keywords: ['is_hacker', '=', 'True', 'type', 'print'], hint: 'is_hacker = True\nprint(type(is_hacker))',
  },
  {
    id: 'e010', topic: 'strings', difficulty: 'easy',
    description: 'Раздели строку "NEXUS:ALPHA:ZONE" по ":" через .split(":")',
    keywords: ['split', '":", print'], hint: 'print("NEXUS:ALPHA:ZONE".split(":"))',
  },
];

// ─── MEDIUM — циклы, функции, списки ──────────────────────────────────────
const MEDIUM_TASKS: BattleTask[] = [
  {
    id: 'm001', topic: 'loops', difficulty: 'medium',
    description: 'Используй for и range(1, 6) чтобы вывести числа 1 до 5',
    keywords: ['for', 'i', 'in', 'range', '1', '6', 'print'], hint: 'for i in range(1, 6):\n    print(i)',
  },
  {
    id: 'm002', topic: 'loops', difficulty: 'medium',
    description: 'Посчитай сумму чисел от 1 до 10 через цикл while',
    keywords: ['while', '<=', '10', '+=', 'print'], hint: 's = 0\ni = 1\nwhile i <= 10:\n    s += i\n    i += 1\nprint(s)',
  },
  {
    id: 'm003', topic: 'loops', difficulty: 'medium',
    description: 'Выведи все элементы списка ["NEXUS", "Archive", "Syntax"] через for',
    keywords: ['for', 'in', '[', ']', 'print'], hint: 'for item in ["NEXUS", "Archive", "Syntax"]:\n    print(item)',
  },
  {
    id: 'm004', topic: 'functions', difficulty: 'medium',
    description: 'Напиши функцию multiply(a, b) которая возвращает a * b',
    keywords: ['def', 'multiply', 'return', '*'], hint: 'def multiply(a, b):\n    return a * b',
  },
  {
    id: 'm005', topic: 'functions', difficulty: 'medium',
    description: 'Напиши функцию is_even(n) → True если чётное, False если нечётное',
    keywords: ['def', 'is_even', 'return', '%', '2', '=='], hint: 'def is_even(n):\n    return n % 2 == 0',
  },
  {
    id: 'm006', topic: 'functions', difficulty: 'medium',
    description: 'Создай функцию greet(name, title="Агент") → f"{title} {name} онлайн"',
    keywords: ['def', 'greet', 'return', 'f"', 'title', 'name'], hint: 'def greet(name, title="Агент"):\n    return f"{title} {name} онлайн"',
  },
  {
    id: 'm007', topic: 'lists', difficulty: 'medium',
    description: 'Создай список agents из 3 имён и добавь "K4I" через .append()',
    keywords: ['agents', '=', '[', ']', 'append', '"K4I"'], hint: 'agents = ["Nova", "Phantom", "VOID"]\nagents.append("K4I")',
  },
  {
    id: 'm008', topic: 'lists', difficulty: 'medium',
    description: 'Найди максимальный элемент списка [3, 18, 7, 42, 11] через max()',
    keywords: ['max', '[', '3', '18', '7', '42', '11', 'print'], hint: 'print(max([3, 18, 7, 42, 11]))',
  },
  {
    id: 'm009', topic: 'lists', difficulty: 'medium',
    description: 'Отсортируй список [5, 2, 9, 1, 7] через .sort() и выведи его',
    keywords: ['sort()', '[', '5', '2', '9', '1', '7', 'print'], hint: 'lst = [5, 2, 9, 1, 7]\nlst.sort()\nprint(lst)',
  },
  {
    id: 'm010', topic: 'dicts', difficulty: 'medium',
    description: 'Создай словарь agent = {"name": "Nova", "level": 7} и выведи agent["name"]',
    keywords: ['agent', '=', '{', '"name"', '"level"', '}', 'print', 'agent['], hint: 'agent = {"name": "Nova", "level": 7}\nprint(agent["name"])',
  },
  {
    id: 'm011', topic: 'dicts', difficulty: 'medium',
    description: 'Добавь ключ "faction" = "Archive" в словарь и выведи все ключи',
    keywords: ['faction', '=', '"Archive"', 'keys()', 'print'], hint: 'd = {}\nd["faction"] = "Archive"\nprint(d.keys())',
  },
  {
    id: 'm012', topic: 'loops', difficulty: 'medium',
    description: 'Напиши цикл для range(10), пропусти 5 через continue, выйди на 8 через break',
    keywords: ['for', 'range', '10', 'continue', 'break', 'print'], hint: 'for i in range(10):\n    if i == 5: continue\n    if i == 8: break\n    print(i)',
  },
];

// ─── HARD — компрехеншны, ООП, алгоритмы ──────────────────────────────────
const HARD_TASKS: BattleTask[] = [
  {
    id: 'h001', topic: 'comprehension', difficulty: 'hard',
    description: 'Через list comprehension создай список чётных чисел от 0 до 20',
    keywords: ['for', 'in', 'range', 'if', '%', '2', '==', '0'], hint: 'evens = [x for x in range(21) if x%2==0]\nprint(evens)',
  },
  {
    id: 'h002', topic: 'comprehension', difficulty: 'hard',
    description: 'Создай список квадратов чисел от 1 до 10 через comprehension',
    keywords: ['for', 'in', 'range', '**', '2', 'print'], hint: 'squares = [x**2 for x in range(1, 11)]\nprint(squares)',
  },
  {
    id: 'h003', topic: 'comprehension', difficulty: 'hard',
    description: 'Создай dict comprehension: числа 1..5 как ключи, квадраты как значения',
    keywords: ['{', 'for', 'in', 'range', '**', ':'], hint: 'squares = {x: x**2 for x in range(1, 6)}\nprint(squares)',
  },
  {
    id: 'h004', topic: 'oop', difficulty: 'hard',
    description: 'Создай класс Agent с __init__(name, level) и методом status()',
    keywords: ['class', 'Agent', 'def', '__init__', 'self', 'status'], hint: 'class Agent:\n    def __init__(self, name, level):\n        self.name = name\n        self.level = level\n    def status(self):\n        return f"[{self.level}] {self.name}"',
  },
  {
    id: 'h005', topic: 'oop', difficulty: 'hard',
    description: 'Создай подкласс EliteAgent(Agent) с атрибутом clearance через super()',
    keywords: ['class', 'EliteAgent', 'Agent', 'super()', '__init__', 'self'], hint: 'class EliteAgent(Agent):\n    def __init__(self, name, level, clearance):\n        super().__init__(name, level)\n        self.clearance = clearance',
  },
  {
    id: 'h006', topic: 'algorithms', difficulty: 'hard',
    description: 'Напиши функцию factorial(n) — факториал через рекурсию',
    keywords: ['def', 'factorial', 'return', 'n', '*', 'if', 'else'], hint: 'def factorial(n):\n    if n <= 1: return 1\n    return n * factorial(n-1)',
  },
  {
    id: 'h007', topic: 'algorithms', difficulty: 'hard',
    description: 'Напиши функцию fibonacci(n) → n-й элемент последовательности Фибоначчи',
    keywords: ['def', 'fibonacci', 'return', 'if', 'n', '-', '1', '-', '2'], hint: 'def fibonacci(n):\n    if n <= 1: return n\n    return fibonacci(n-1) + fibonacci(n-2)',
  },
  {
    id: 'h008', topic: 'algorithms', difficulty: 'hard',
    description: 'Напиши бинарный поиск — функция binary_search(lst, target)',
    keywords: ['def', 'binary_search', 'left', 'right', 'mid', 'while', 'return'], hint: 'def binary_search(lst, target):\n    left, right = 0, len(lst)-1\n    while left <= right:\n        mid = (left + right) // 2\n        if lst[mid] == target: return mid\n        elif lst[mid] < target: left = mid + 1\n        else: right = mid - 1\n    return -1',
  },
  {
    id: 'h009', topic: 'functions', difficulty: 'hard',
    description: 'Создай декоратор @log_call который выводит имя функции при вызове',
    keywords: ['def', 'log_call', 'wrapper', 'func', 'functools', 'wraps'], hint: 'import functools\ndef log_call(func):\n    @functools.wraps(func)\n    def wrapper(*args, **kwargs):\n        print(f"Вызов: {func.__name__}")\n        return func(*args, **kwargs)\n    return wrapper',
  },
  {
    id: 'h010', topic: 'algorithms', difficulty: 'hard',
    description: 'Напиши функцию bubble_sort(lst) — сортировка пузырьком',
    keywords: ['def', 'bubble_sort', 'for', 'range', 'if', '>', 'swap'], hint: 'def bubble_sort(lst):\n    n = len(lst)\n    for i in range(n):\n        for j in range(n-i-1):\n            if lst[j] > lst[j+1]:\n                lst[j], lst[j+1] = lst[j+1], lst[j]\n    return lst',
  },
];

// ─── ELITE — Data Science / AI задачи ─────────────────────────────────────
const ELITE_TASKS: BattleTask[] = [
  {
    id: 'el001', topic: 'numpy', difficulty: 'elite',
    description: 'Создай numpy array из чисел 1..10 и вычисли среднее через np.mean()',
    keywords: ['import numpy', 'np.array', 'np.mean', 'print'], hint: 'import numpy as np\narr = np.array(range(1, 11))\nprint(np.mean(arr))',
    classFilter: ['data_ghost', 'neural_architect'],
  },
  {
    id: 'el002', topic: 'numpy', difficulty: 'elite',
    description: 'Создай матрицу 3x3 через np.zeros() и измени элемент [1][1] = 99',
    keywords: ['np.zeros', '3', '3', '[1][1]', '=', '99', 'print'], hint: 'import numpy as np\nm = np.zeros((3,3))\nm[1][1] = 99\nprint(m)',
    classFilter: ['data_ghost', 'neural_architect'],
  },
  {
    id: 'el003', topic: 'pandas', difficulty: 'elite',
    description: 'Создай DataFrame с колонками "agent" и "level", добавь 2 строки',
    keywords: ['import pandas', 'pd.DataFrame', '"agent"', '"level"', 'print'], hint: 'import pandas as pd\ndf = pd.DataFrame({"agent": ["Nova", "Phantom"], "level": [42, 38]})\nprint(df)',
    classFilter: ['data_ghost'],
  },
  {
    id: 'el004', topic: 'pandas', difficulty: 'elite',
    description: 'Через groupby посчитай среднее по колонке "level" в DataFrame',
    keywords: ['groupby', 'mean()', 'print'], hint: 'print(df.groupby("faction")["level"].mean())',
    classFilter: ['data_ghost'],
  },
  {
    id: 'el005', topic: 'ml', difficulty: 'elite',
    description: 'Создай LinearRegression из sklearn, обучи на X=[[1],[2],[3]], y=[1,4,9]',
    keywords: ['LinearRegression', 'fit(', '[[1]', '[2]', '[3]', '[1,4,9]'], hint: 'from sklearn.linear_model import LinearRegression\nmodel = LinearRegression()\nmodel.fit([[1],[2],[3]], [1,4,9])',
    classFilter: ['data_ghost', 'neural_architect'],
  },
  {
    id: 'el006', topic: 'neural_net', difficulty: 'elite',
    description: 'Создай простой нейрон: функция sigmoid(x) = 1 / (1 + e^(-x))',
    keywords: ['def', 'sigmoid', 'return', '1', '/', 'math.exp', 'import math'], hint: 'import math\ndef sigmoid(x):\n    return 1 / (1 + math.exp(-x))',
    classFilter: ['neural_architect'],
  },
  {
    id: 'el007', topic: 'neural_net', difficulty: 'elite',
    description: 'Реализуй функцию relu(x): возвращает max(0, x)',
    keywords: ['def', 'relu', 'return', 'max', '0', 'x'], hint: 'def relu(x):\n    return max(0, x)',
    classFilter: ['neural_architect'],
  },
  {
    id: 'el008', topic: 'algorithms', difficulty: 'elite',
    description: 'Напиши генератор fibonacci_gen() через yield для бесконечной последовательности',
    keywords: ['def', 'fibonacci_gen', 'yield', 'while', 'True'], hint: 'def fibonacci_gen():\n    a, b = 0, 1\n    while True:\n        yield a\n        a, b = b, a + b',
  },
  {
    id: 'el009', topic: 'functions', difficulty: 'elite',
    description: 'Используй map() чтобы возвести в квадрат все элементы [1,2,3,4,5]',
    keywords: ['map', 'lambda', 'x', '**', '2', '[1,2,3,4,5]', 'list'], hint: 'result = list(map(lambda x: x**2, [1,2,3,4,5]))\nprint(result)',
  },
  {
    id: 'el010', topic: 'algorithms', difficulty: 'elite',
    description: 'Создай класс Stack с методами push(), pop(), peek() на основе списка',
    keywords: ['class', 'Stack', 'def', 'push', 'pop', 'peek', 'self', 'append'], hint: 'class Stack:\n    def __init__(self): self.data = []\n    def push(self, x): self.data.append(x)\n    def pop(self): return self.data.pop()\n    def peek(self): return self.data[-1]',
  },
];

// ─── Все задачи ──────────────────────────────────────────────────────────────
export const ALL_TASKS: BattleTask[] = [
  ...EASY_TASKS,
  ...MEDIUM_TASKS,
  ...HARD_TASKS,
  ...ELITE_TASKS,
];

// ─── Функции выбора задач ─────────────────────────────────────────────────────

/** Выбрать случайную задачу подходящей сложности для класса */
export function pickTask(
  difficulty: TaskDifficulty,
  playerClass: string,
  excludeIds: string[] = [],
): BattleTask {
  const pool = ALL_TASKS.filter(t => {
    if (t.difficulty !== difficulty) return false;
    if (excludeIds.includes(t.id)) return false;
    // Если задача помечена для конкретных классов — проверяем
    if (t.classFilter && !t.classFilter.includes(playerClass as 'cipher' | 'data_ghost' | 'neural_architect')) {
      return false;
    }
    return true;
  });

  if (pool.length === 0) {
    // Fallback — любая задача той же сложности
    const fallback = ALL_TASKS.filter(t => t.difficulty === difficulty);
    return fallback[Math.floor(Math.random() * fallback.length)] ?? EASY_TASKS[0];
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

/** Сгенерировать цепочку задач для боя с врагом */
export function generateTaskChain(
  enemyLevel: number,
  playerClass: string,
  chainLength = 3,
): BattleTask[] {
  const difficulty: TaskDifficulty =
    enemyLevel <= 5  ? 'easy' :
    enemyLevel <= 12 ? 'medium' :
    enemyLevel <= 22 ? 'hard' : 'elite';

  const chain: BattleTask[] = [];
  const used: string[] = [];

  for (let i = 0; i < chainLength; i++) {
    // Каждые ~2 задачи — повышаем сложность для разнообразия
    let d = difficulty;
    if (i >= 2 && difficulty === 'easy') d = 'medium';
    if (i >= 2 && difficulty === 'medium') d = 'hard';

    const task = pickTask(d, playerClass, used);
    chain.push(task);
    used.push(task.id);
  }

  return chain;
}
