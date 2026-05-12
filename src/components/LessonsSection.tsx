import { useState, useRef, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import Icon from '@/components/ui/icon';
import { useGame, XpResult } from '@/lib/GameContext';
import { api } from '@/lib/api';
import { usePyodide } from '@/lib/usePyodide';
import { pushNotif } from '@/components/Notifications';
import { progress } from '@/lib/progressStore';

// ─── ТЕОРИЯ ──────────────────────────────────────────────────────────────────

interface Theory {
  id: string;
  title: string;
  category: string;
  color: string;
  theory: string;
  example: string;
  note: string;
}

const THEORY_LIBRARY: Theory[] = [
  {
    id: 'vars',
    title: 'Переменные и типы',
    category: 'Основы',
    color: '#00ff41',
    theory: `Переменная — это именованная ячейка памяти для хранения данных.

В Python не нужно указывать тип — он определяется автоматически:

  x = 10          # int (целое число)
  name = "Nova"   # str (строка)
  pi = 3.14       # float (дробное число)
  active = True   # bool (логический тип)

Правила именования:
• Только буквы, цифры и _ (нижнее подчёркивание)
• Нельзя начинать с цифры
• Регистр важен: Name ≠ name
• Использовать snake_case: agent_name, not AgentName`,
    example: `# Создаём переменные разных типов
agent_name = "Nova_7"
level = 42
health = 95.5
is_active = True

# Проверяем типы
print(type(agent_name))   # <class 'str'>
print(type(level))        # <class 'int'>
print(type(health))       # <class 'float'>

# Конвертация типов
score = "100"
score_int = int(score)     # str → int
print(score_int + 5)       # 105`,
    note: 'Python — язык с динамической типизацией. Тип переменной может меняться при переприсваивании.',
  },
  {
    id: 'strings',
    title: 'Строки',
    category: 'Основы',
    color: '#00aaff',
    theory: `Строка (str) — последовательность символов в кавычках.

Создание строк:
  s1 = "Hello"         # двойные кавычки
  s2 = 'World'         # одинарные кавычки
  s3 = """Многострочная
  строка"""            # тройные кавычки

f-строки (форматирование):
  name = "Nova"
  level = 7
  msg = f"Агент {name}, уровень {level}"

Основные методы:
  s.upper()      # В ВЕРХНИЙ РЕГИСТР
  s.lower()      # в нижний регистр
  s.strip()      # убрать пробелы по краям
  s.split(",")   # разбить на список
  s.replace(a,b) # заменить подстроку
  len(s)         # длина строки`,
    example: `name = "CodeGrid-9"
agent = "nova_7"

# Методы строк
print(name.upper())          # CODEGRID-9
print(len(name))             # 10

# f-строки
level = 42
msg = f"Агент {agent.upper()}, LVL {level}"
print(msg)

# Срезы
code = "Python"
print(code[0])     # P (первый символ)
print(code[-1])    # n (последний)
print(code[1:4])   # yth (срез 1..3)
print(code[::-1])  # nohtyP (реверс)`,
    note: 'f-строки (f"...") — самый современный и удобный способ форматирования. Используй их.',
  },
  {
    id: 'conditions',
    title: 'Условия if/else',
    category: 'Основы',
    color: '#ffaa00',
    theory: `Условный оператор позволяет выполнять код по условию.

Синтаксис:
  if условие:
      # код если True
  elif другое_условие:
      # иначе если
  else:
      # иначе

Операторы сравнения:
  ==  равно        !=  не равно
  >   больше       <   меньше
  >=  больше или равно
  <=  меньше или равно

Логические операторы:
  and  — оба условия True
  or   — хоть одно True
  not  — инверсия

Важно: в Python отступы (4 пробела) определяют блок кода!`,
    example: `threat_level = 7
hp = 45

# Простое условие
if threat_level >= 5:
    print("ОПАСНОСТЬ!")
else:
    print("Зона безопасна")

# Сложное условие с elif
if hp <= 0:
    print("Агент пал")
elif hp < 30:
    print("Критически низкий HP!")
elif hp < 70:
    print("Нужна медпомощь")
else:
    print("HP в норме")

# Логические операторы
armed = True
enemy_near = True
if armed and enemy_near:
    print("Готов к бою")`,
    note: 'Отступы в Python — часть синтаксиса, не стиль. Неправильные отступы = IndentationError.',
  },
  {
    id: 'loops',
    title: 'Циклы for и while',
    category: 'Основы',
    color: '#ff00ff',
    theory: `Циклы позволяют выполнять блок кода многократно.

FOR — цикл по последовательности:
  for элемент in последовательность:
      # тело цикла

  for i in range(5):        # 0, 1, 2, 3, 4
  for i in range(1, 6):     # 1, 2, 3, 4, 5
  for i in range(0, 10, 2): # 0, 2, 4, 6, 8

WHILE — цикл пока условие истинно:
  while условие:
      # тело цикла

Управление:
  break     — выйти из цикла
  continue  — к следующей итерации`,
    example: `# FOR цикл по списку
agents = ["Nova", "Phantom", "VOID"]
for agent in agents:
    print(f"Агент: {agent}")

# range() — генератор чисел
for i in range(1, 6):
    print(f"Шаг {i}")

# WHILE цикл
hp = 100
while hp > 0:
    hp -= 30
    print(f"HP: {max(0, hp)}")

# break и continue
for i in range(10):
    if i == 3:
        continue   # пропускаем 3
    if i == 7:
        break      # стоп на 7
    print(i)`,
    note: 'range(start, stop, step): stop НЕ включён. range(1, 6) = 1,2,3,4,5.',
  },
  {
    id: 'functions',
    title: 'Функции',
    category: 'Средний уровень',
    color: '#aa00ff',
    theory: `Функция — блок кода с именем, который можно вызвать повторно.

Объявление:
  def имя_функции(параметры):
      # тело
      return результат

Типы аргументов:
  def greet(name):           # обычный
  def greet(name="Агент"):   # с дефолтом
  def add(*args):            # произвольное кол-во
  def info(**kwargs):        # именованные

Область видимости:
  Переменные внутри функции — локальные.
  Не видны снаружи!`,
    example: `# Простая функция
def hack(target):
    return f"Взлом: {target}"

print(hack("NEXUS_Server"))

# С дефолтным аргументом
def greet(name, title="Агент"):
    return f"{title} {name} онлайн"

print(greet("Nova"))
print(greet("K4I", "Командующий"))

# Несколько return значений
def stats(hp, max_hp):
    percent = round(hp / max_hp * 100)
    status = "OK" if percent > 50 else "DANGER"
    return percent, status

pct, st = stats(45, 100)
print(f"HP: {pct}% — {st}")`,
    note: 'Хорошая функция делает одно дело. Называй функции глаголами: get_data(), calculate_damage().',
  },
  {
    id: 'lists',
    title: 'Списки',
    category: 'Средний уровень',
    color: '#00ff41',
    theory: `Список (list) — упорядоченная изменяемая коллекция элементов.

Создание:
  items = [1, 2, 3]
  names = ["Nova", "VOID"]

Доступ:
  items[0]   → первый (индексы с 0!)
  items[-1]  → последний
  items[1:3] → срез

Методы:
  lst.append(x)      # добавить в конец
  lst.remove(x)      # удалить элемент
  lst.pop()          # удалить последний
  lst.sort()         # сортировать
  len(lst)           # длина
  x in lst           # проверить наличие

List comprehension:
  [выражение for элемент in коллекция if условие]`,
    example: `agents = ["Nova", "Phantom", "VOID"]

# Доступ
print(agents[0])      # Nova
print(agents[-1])     # VOID
print(agents[0:2])    # ['Nova', 'Phantom']

# Изменение
agents.append("K4I")
agents.remove("VOID")
print(agents)

# Проверка
print("Nova" in agents)   # True
print(len(agents))        # 3

# List comprehension
levels = [1, 5, 12, 3, 8, 20]
high = [lvl for lvl in levels if lvl >= 8]
print(high)    # [12, 8, 20]

squared = [x**2 for x in range(1, 6)]
print(squared) # [1, 4, 9, 16, 25]`,
    note: 'List comprehension — питоновский способ создавать списки. Читается как: "взять x если условие".',
  },
  {
    id: 'dicts',
    title: 'Словари',
    category: 'Средний уровень',
    color: '#00aaff',
    theory: `Словарь (dict) — коллекция пар ключ:значение.

Создание:
  agent = {"name": "Nova", "level": 7}
  empty = {}

Доступ:
  agent["name"]               → "Nova"
  agent.get("name")           → "Nova"
  agent.get("missing", "N/A") → "N/A"

Изменение:
  agent["level"] = 8          # изменить
  agent["faction"] = "Archive" # добавить
  del agent["hp"]             # удалить

Итерация:
  for key in agent:
  for key, val in agent.items():
  for val in agent.values():`,
    example: `agent = {
    "name": "Nova_7",
    "class": "Hacker",
    "level": 42,
    "skills": ["Lambda Strike", "Data Breach"]
}

# Чтение
print(agent["name"])
print(agent.get("level"))

# Изменение
agent["level"] = 43
agent["faction"] = "The Archive"

# Итерация
for key, val in agent.items():
    print(f"  {key}: {val}")

# Вложенные словари
team = {
    "Nova_7": {"level": 42, "class": "Hacker"},
    "Phantom": {"level": 38, "class": "Backend"},
}
print(team["Nova_7"]["level"])   # 42`,
    note: 'dict.get(key, default) безопаснее чем dict[key] — не вызывает KeyError при отсутствии ключа.',
  },
  {
    id: 'oop',
    title: 'Классы и ООП',
    category: 'Продвинутый',
    color: '#ff4060',
    theory: `Класс — шаблон для создания объектов.

Синтаксис:
  class ИмяКласса:
      def __init__(self, параметры):
          self.атрибут = значение
      
      def метод(self):
          return что-то

  __init__ — конструктор, вызывается при создании
  self — ссылка на объект (всегда первый параметр)

Наследование:
  class Child(Parent):
      def __init__(self, ...):
          super().__init__(...)

4 принципа ООП:
  Инкапсуляция · Наследование
  Полиморфизм · Абстракция`,
    example: `class Agent:
    def __init__(self, name, cls, level=1):
        self.name = name
        self.cls = cls
        self.level = level
        self.hp = 100 + level * 10
        self.skills = []
    
    def learn_skill(self, skill):
        self.skills.append(skill)
        return f"{self.name} освоил: {skill}"
    
    def status(self):
        return f"[{self.cls}] {self.name} LVL {self.level}"
    
    def level_up(self):
        self.level += 1
        return f"{self.name} → LVL {self.level}!"


nova = Agent("Nova_7", "Hacker", 42)
phantom = Agent("Phantom", "Backend", 38)

print(nova.status())
print(nova.learn_skill("Lambda Strike"))
print(nova.level_up())


# Наследование
class EliteAgent(Agent):
    def __init__(self, name, cls, level, clearance):
        super().__init__(name, cls, level)
        self.clearance = clearance
    
    def status(self):
        return super().status() + f" | Допуск: {self.clearance}"

k4i = EliteAgent("K4I", "Hacker", 99, "ULTRA")
print(k4i.status())`,
    note: 'super().__init__() вызывает конструктор родителя. Классы — PascalCase: AgentProfile.',
  },
];

// ─── МИССИИ ──────────────────────────────────────────────────────────────────

interface Lesson {
  id: number; title: string; chapter: string; act: 1 | 2 | 3;
  xp: number; completed: boolean; locked: boolean; icon: string; desc: string;
  task: { desc: string; keywords: string[]; example: string; output: string };
}

const ACT_META: Record<number, { color: string; label: string }> = {
  1: { color: '#00ff41', label: 'АКТ I' },
  2: { color: '#00aaff', label: 'АКТ II' },
  3: { color: '#aa00ff', label: 'АКТ III' },
};

const LESSONS: Lesson[] = [
  { id: 1, title: 'Переменные и типы', chapter: 'АКТ I · М1', act: 1, xp: 100, completed: true, locked: false, icon: '📦', desc: 'Первый шаг нетраннера — научись хранить данные.',
    task: { desc: 'Создай переменную agent_id и присвой строку со своим именем', keywords: ['agent_id', '=', '"'], example: 'agent_id = "Nova_7"', output: '> agent_id = "Nova_7"\n[OK] Загружено' } },
  { id: 2, title: 'Строки', chapter: 'АКТ I · М2', act: 1, xp: 120, completed: true, locked: false, icon: '🔤', desc: 'Работа с текстом — основа коммуникации в подполье.',
    task: { desc: 'Создай f-строку message с переменными name и level', keywords: ['f"', 'name', 'level', '='], example: 'name = "Nova"\nlevel = 7\nmessage = f"Агент {name}, уровень {level}"', output: '> Агент Nova, уровень 7\n[OK] Сообщение создано' } },
  { id: 3, title: 'Условия if/else', chapter: 'АКТ I · М3', act: 1, xp: 150, completed: true, locked: false, icon: '⚡', desc: 'Логика принятия решений — основа любого ИИ.',
    task: { desc: 'Напиши if/else: если threat_level >= 5 выведи "DANGER", иначе "CLEAR"', keywords: ['if', 'else', '>=', 'threat_level'], example: 'if threat_level >= 5:\n    print("DANGER")\nelse:\n    print("CLEAR")', output: '> DANGER\n[OK] Скомпилировано' } },
  { id: 4, title: 'Циклы: for и while', chapter: 'АКТ I · М4', act: 1, xp: 200, completed: false, locked: false, icon: '🔄', desc: 'Автоматизируй атаки через повторяющиеся операции.',
    task: { desc: 'Используй for и range чтобы вывести числа 1 до 5', keywords: ['for', 'in', 'range', 'print'], example: 'for i in range(1, 6):\n    print(i)', output: '> 1\n> 2\n> 3\n> 4\n> 5\n[OK] Цикл активирован' } },
  { id: 5, title: 'Break и continue', chapter: 'АКТ I · М5', act: 1, xp: 180, completed: false, locked: false, icon: '⏩', desc: 'Управление потоком выполнения цикла.',
    task: { desc: 'Напиши for range(10), пропусти 5 через continue, стоп на 8 через break', keywords: ['for', 'range', 'continue', 'break'], example: 'for i in range(10):\n    if i == 5:\n        continue\n    if i == 8:\n        break\n    print(i)', output: '> 0 1 2 3 4 6 7\n[OK] Управление потоком' } },
  { id: 6, title: 'Функции', chapter: 'АКТ II · М1', act: 2, xp: 300, completed: false, locked: false, icon: '🔧', desc: 'Создавай переиспользуемые модули атак.',
    task: { desc: 'Напиши функцию hack(target) возвращающую f"Взлом: {target}"', keywords: ['def', 'hack', 'return', 'target'], example: 'def hack(target):\n    return f"Взлом: {target}"', output: '> Взлом: NEXUS_Server\n[OK] Скомпилировано' } },
  { id: 7, title: 'Аргументы функций', chapter: 'АКТ II · М2', act: 2, xp: 280, completed: false, locked: false, icon: '🎯', desc: 'Параметры по умолчанию.',
    task: { desc: 'Создай greet(name, title="Агент") возвращающую "{title} {name} онлайн"', keywords: ['def', 'greet', 'return', 'title'], example: 'def greet(name, title="Агент"):\n    return f"{title} {name} онлайн"', output: '> Агент Nova онлайн\n[OK] Функция создана' } },
  { id: 8, title: 'Списки', chapter: 'АКТ II · М3', act: 2, xp: 350, completed: false, locked: true, icon: '🗂️', desc: 'Базы данных подполья.',
    task: { desc: 'Создай список agents из трёх имён и выведи его длину через len()', keywords: ['agents', '=', '[', ']', 'len'], example: 'agents = ["Nova", "Phantom", "VOID"]\nprint(len(agents))', output: '> 3\n[OK] База данных загружена' } },
  { id: 9, title: 'List comprehension', chapter: 'АКТ II · М4', act: 2, xp: 400, completed: false, locked: true, icon: '⚡', desc: 'Питоновский способ создавать списки элегантно.',
    task: { desc: 'Через list comprehension создай список чётных чисел от 0 до 10', keywords: ['for', 'in', 'range', 'if', '%', '2', '==', '0'], example: 'evens = [x for x in range(11) if x%2==0]\nprint(evens)', output: '> [0, 2, 4, 6, 8, 10]\n[OK] Comprehension работает' } },
  { id: 10, title: 'Словари', chapter: 'АКТ II · М5', act: 2, xp: 380, completed: false, locked: true, icon: '📖', desc: 'Досье на каждого агента.',
    task: { desc: 'Создай словарь agent с ключами name и level, выведи agent["name"]', keywords: ['agent', '=', '{', 'name', 'level', '}'], example: 'agent = {"name": "Nova_7", "level": 42}\nprint(agent["name"])', output: '> Nova_7\n[OK] Досье загружено' } },
  { id: 11, title: 'Классы и ООП', chapter: 'АКТ III · М1', act: 3, xp: 500, completed: false, locked: true, icon: '🤖', desc: 'Создай своего ИИ-агента.',
    task: { desc: 'Создай класс Agent с __init__(self, name, level)', keywords: ['class', 'Agent', 'def', '__init__', 'self', 'name', 'level'], example: 'class Agent:\n    def __init__(self, name, level):\n        self.name = name\n        self.level = level', output: '> Agent создан\n[OK] Класс скомпилирован' } },
  { id: 12, title: 'Методы класса', chapter: 'АКТ III · М2', act: 3, xp: 480, completed: false, locked: true, icon: '⚙️', desc: 'Добавь поведение агенту через методы.',
    task: { desc: 'Добавь метод status() в класс Agent, возвращающий f"[{self.level}] {self.name}"', keywords: ['def', 'status', 'self', 'return', 'f"'], example: 'class Agent:\n    def __init__(self, name, level):\n        self.name = name\n        self.level = level\n    def status(self):\n        return f"[{self.level}] {self.name}"', output: '> [42] Nova_7\n[OK] Метод работает' } },
];

// ─── Классово-специфичные уроки ──────────────────────────────────────────────

const DATA_GHOST_LESSONS: Lesson[] = [
  { id: 101, title: 'NumPy: массивы', chapter: 'DS · М1', act: 1, xp: 250, completed: false, locked: false, icon: '🔢',
    desc: 'NumPy — основа научных вычислений. Быстрые массивы вместо списков.',
    task: { desc: 'Создай numpy массив из чисел 1..5 и вычисли его среднее через np.mean()', keywords: ['import numpy', 'np.array', 'np.mean', 'print'], example: 'import numpy as np\narr = np.array([1, 2, 3, 4, 5])\nprint(np.mean(arr))', output: '> 3.0\n[OK] NumPy работает' } },
  { id: 102, title: 'Pandas: DataFrame', chapter: 'DS · М2', act: 1, xp: 300, completed: false, locked: false, icon: '📊',
    desc: 'Pandas — инструмент анализа данных. DataFrame — таблица данных.',
    task: { desc: 'Создай DataFrame с колонками "agent" и "level", добавь 2 строки данных', keywords: ['import pandas', 'pd.DataFrame', '"agent"', '"level"', 'print'], example: 'import pandas as pd\ndf = pd.DataFrame({"agent": ["Nova", "Phantom"], "level": [42, 38]})\nprint(df)', output: '> agent  level\n> Nova   42\n> Phantom 38\n[OK] DataFrame создан' } },
  { id: 103, title: 'Pandas: фильтрация', chapter: 'DS · М3', act: 2, xp: 350, completed: false, locked: false, icon: '🔍',
    desc: 'Фильтрация данных — поиск агентов NEXUS по критериям.',
    task: { desc: 'Отфильтруй DataFrame: выведи только строки где level > 40', keywords: ['df[', '>', '40', 'print'], example: 'high_level = df[df["level"] > 40]\nprint(high_level)', output: '> agent  level\n> Nova   42\n[OK] Фильтрация работает' } },
  { id: 104, title: 'Matplotlib: графики', chapter: 'DS · М4', act: 2, xp: 400, completed: false, locked: true, icon: '📈',
    desc: 'Визуализация данных — рисуем графики угроз NEXUS.',
    task: { desc: 'Нарисуй линейный график через plt.plot([1,2,3], [1,4,9])', keywords: ['import matplotlib', 'plt.plot', '[1,2,3]', '[1,4,9]', 'plt.show'], example: 'import matplotlib.pyplot as plt\nplt.plot([1,2,3], [1,4,9])\nplt.show()', output: '> [График создан]\n[OK] Matplotlib работает' } },
  { id: 105, title: 'Sklearn: LinearRegression', chapter: 'DS · М5', act: 3, xp: 500, completed: false, locked: true, icon: '🤖',
    desc: 'Первая ML модель: линейная регрессия для предсказания угроз.',
    task: { desc: 'Создай LinearRegression из sklearn, обучи на X=[[1],[2],[3]], y=[1,4,9]', keywords: ['LinearRegression', 'fit(', '[[1]', '[2]', '[3]'], example: 'from sklearn.linear_model import LinearRegression\nmodel = LinearRegression()\nmodel.fit([[1],[2],[3]], [1,4,9])\nprint("Модель обучена")', output: '> Модель обучена\n[OK] sklearn работает' } },
];

const NEURAL_ARCH_LESSONS: Lesson[] = [
  { id: 201, title: 'Линейная алгебра', chapter: 'AI · М1', act: 1, xp: 300, completed: false, locked: false, icon: '🧮',
    desc: 'Матрицы — основа нейронных сетей. Умножение матриц = слой нейросети.',
    task: { desc: 'Создай матрицу 3x3 через np.zeros() и заполни главную диагональ через np.fill_diagonal()', keywords: ['np.zeros', '3', '3', 'fill_diagonal', 'print'], example: 'import numpy as np\nm = np.zeros((3,3))\nnp.fill_diagonal(m, 1)\nprint(m)', output: '> [[1. 0. 0.]\n>  [0. 1. 0.]\n>  [0. 0. 1.]]\n[OK] Матрица создана' } },
  { id: 202, title: 'Функции активации', chapter: 'AI · М2', act: 1, xp: 350, completed: false, locked: false, icon: '⚡',
    desc: 'Sigmoid и ReLU — ворота нейронов. Без них нет глубокого обучения.',
    task: { desc: 'Реализуй функцию sigmoid(x) = 1 / (1 + e^(-x)) через math.exp', keywords: ['def', 'sigmoid', 'return', '1', 'math.exp', 'import math'], example: 'import math\ndef sigmoid(x):\n    return 1 / (1 + math.exp(-x))\nprint(sigmoid(0))', output: '> 0.5\n[OK] Sigmoid работает' } },
  { id: 203, title: 'Нейрон с нуля', chapter: 'AI · М3', act: 2, xp: 500, completed: false, locked: false, icon: '🧠',
    desc: 'Создаём базовый нейрон: веса, смещение, функция активации.',
    task: { desc: 'Создай класс Neuron с методом forward(inputs) → dot product + bias', keywords: ['class', 'Neuron', 'def', 'forward', 'np.dot', 'bias'], example: 'import numpy as np\nclass Neuron:\n    def __init__(self, n_inputs):\n        self.weights = np.random.randn(n_inputs)\n        self.bias = 0\n    def forward(self, inputs):\n        return np.dot(self.weights, inputs) + self.bias', output: '> Neuron создан\n[OK] Класс работает' } },
  { id: 204, title: 'Backpropagation', chapter: 'AI · М4', act: 2, xp: 600, completed: false, locked: true, icon: '🔄',
    desc: 'Обратное распространение ошибки — как нейросеть обучается.',
    task: { desc: 'Реализуй функцию mse_loss(y_pred, y_true) → среднеквадратичная ошибка', keywords: ['def', 'mse_loss', 'return', 'np.mean', '**', '2'], example: 'import numpy as np\ndef mse_loss(y_pred, y_true):\n    return np.mean((y_pred - y_true) ** 2)\nprint(mse_loss([1,2,3],[1,3,5]))', output: '> 1.67\n[OK] Loss function работает' } },
  { id: 205, title: 'PyTorch: тензоры', chapter: 'AI · М5', act: 3, xp: 700, completed: false, locked: true, icon: '🔥',
    desc: 'PyTorch — фреймворк для deep learning. Тензор = GPU-ускоренный массив.',
    task: { desc: 'Создай тензор torch.tensor([1,2,3]) и вычисли его сумму через .sum()', keywords: ['import torch', 'torch.tensor', '[1,2,3]', '.sum()', 'print'], example: 'import torch\nt = torch.tensor([1.0, 2.0, 3.0])\nprint(t.sum())', output: '> tensor(6.)\n[OK] PyTorch работает' } },
];

// ─── Component ───────────────────────────────────────────────────────────────

type Tab = 'theory' | 'missions';
type OutputLine = { text: string; type: 'cmd' | 'ok' | 'err' | 'info' | 'dim' };
type RunState = 'idle' | 'running' | 'success' | 'error';

export default function LessonsSection() {
  const { applyXpResult, character } = useGame();
  const { runCode: pyRun, loading: pyLoading } = usePyodide();
  const playerClass = character?.class || 'cipher';

  const [tab, setTab] = useState<Tab>('theory');
  const [selectedTheory, setSelectedTheory] = useState<Theory>(THEORY_LIBRARY[0]);
  const [theoryFilter, setTheoryFilter] = useState('Все');

  const [activeId, setActiveId] = useState<number>(1);
  const [code, setCode] = useState(LESSONS[0].task.example);
  const [outputLines, setOutputLines] = useState<OutputLine[]>([]);
  const [runState, setRunState] = useState<RunState>('idle');
  const [completedInSession, setCompletedInSession] = useState<number[]>([]);
  const [xpResult, setXpResult] = useState<{ xp: number; levelUp: boolean; newLevel: number } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [realExec, setRealExec] = useState(false); // true = Pyodide

  // Классовые уроки — добавляем к общим
  const classLessons = useMemo(() => {
    const cls = playerClass;
    if (cls === 'data_ghost' || cls === 'netrunner') return DATA_GHOST_LESSONS;
    if (cls === 'neural_architect' || cls === 'street_samurai') return NEURAL_ARCH_LESSONS;
    return []; // CIPHER не имеет специальных — только базовые Python
  }, [playerClass]);

  const allLessons = useMemo(() => [...LESSONS, ...classLessons], [classLessons]);

  const outputRef = useRef<HTMLDivElement>(null);
  const lesson = allLessons.find(l => l.id === activeId) ?? LESSONS[0];

  const selectLesson = (l: Lesson) => {
    if (l.locked) return;
    setActiveId(l.id);
    setCode(l.task.example);
    setOutputLines([]);
    setRunState('idle');
    setShowHint(false);
    setXpResult(null);
  };

  const checkKeywords = (src: string, kws: string[]) => {
    const lower = src.toLowerCase();
    const missing = kws.filter(k => !lower.includes(k.toLowerCase()));
    return { pass: missing.length <= Math.floor(kws.length * 0.3), missing };
  };

  const streamLines = (lines: OutputLine[]) => {
    lines.forEach((line, i) => {
      setTimeout(() => {
        setOutputLines(prev => [...prev, line]);
        if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
      }, i * 80);
    });
  };

  const handleSaveComplete = async (lessonId: number, xp: number) => {
    // Записываем в localStorage для квестов/достижений
    progress.recordLessonComplete(lessonId);
    const res = await api.lesson.complete(lessonId, xp, Math.floor(xp * 0.2));
    if (res && !res.error) {
      if (!res.already_completed) {
        applyXpResult(res as XpResult);
        setXpResult({ xp: res.xp_gained ?? xp, levelUp: res.leveled_up ?? false, newLevel: res.new_level ?? 1 });
        progress.recordXp(res.xp_gained ?? xp);
        if (res.leveled_up) {
          pushNotif({ type: 'level', title: `LEVEL UP! → LVL ${res.new_level}`, body: '+5 HP, статы улучшены', icon: '⚡', color: '#00ff41' });
        }
      } else {
        setXpResult({ xp: 0, levelUp: false, newLevel: 0 });
      }
    }
  };

  const runCode = async () => {
    if (!lesson || !code.trim() || runState === 'running') return;
    setRunState('running');
    setOutputLines([]);
    setXpResult(null);

    streamLines([{ text: `$ python mission_${String(lesson.id).padStart(2, '0')}.py`, type: 'cmd' }]);

    if (realExec) {
      // Реальный Python через Pyodide
      const { output, error, success } = await pyRun(code);
      const lines: OutputLine[] = [];
      if (success) {
        output.split('\n').filter(Boolean).forEach(l => lines.push({ text: l, type: 'info' }));
        const { pass, missing } = checkKeywords(code, lesson.task.keywords);
        if (pass) {
          lines.push({ text: '[OK] Миссия выполнена!', type: 'ok' });
          setRunState('success');
          if (!completedInSession.includes(lesson.id)) {
            setCompletedInSession(prev => [...prev, lesson.id]);
            handleSaveComplete(lesson.id, lesson.xp);
          }
        } else {
          lines.push({ text: `[WARN] Код работает, но задача не решена`, type: 'dim' });
          lines.push({ text: `Не использовано: ${missing.slice(0, 3).join(', ')}`, type: 'dim' });
          setRunState('error');
        }
      } else {
        lines.push({ text: `[ERROR] ${error}`, type: 'err' });
        setRunState('error');
      }
      streamLines(lines);
    } else {
      // Быстрая проверка ключевых слов
      setTimeout(async () => {
        const { pass, missing } = checkKeywords(code, lesson.task.keywords);
        const lines: OutputLine[] = [];
        if (pass) {
          lesson.task.output.split('\n').forEach(l => lines.push({ text: l, type: l.startsWith('[OK]') ? 'ok' : 'info' }));
          setRunState('success');
          if (!completedInSession.includes(lesson.id)) {
            setCompletedInSession(prev => [...prev, lesson.id]);
            await handleSaveComplete(lesson.id, lesson.xp);
          }
        } else {
          lines.push({ text: `[ERROR] Не найдено: ${missing.slice(0, 4).join(', ')}`, type: 'err' });
          lines.push({ text: 'Нажми ПРИМЕР чтобы увидеть решение', type: 'dim' });
          setRunState('error');
        }
        streamLines(lines);
      }, 350);
    }
  };

  const completedCount = allLessons.filter(l => l.completed || completedInSession.includes(l.id)).length;
  const categories = ['Все', ...Array.from(new Set(THEORY_LIBRARY.map(t => t.category)))];
  const filteredTheory = theoryFilter === 'Все' ? THEORY_LIBRARY : THEORY_LIBRARY.filter(t => t.category === theoryFilter);

  return (
    <section className="py-8 px-4 lg:px-6 min-h-screen relative">
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <div className="mb-4 flex items-end justify-between flex-wrap gap-3">
          <div>
            <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-1">// THE ARCHIVE · RESIST</div>
            <h2 className="font-orbitron text-2xl text-white">УРОКИ <span className="text-cyber-green">PYTHON</span></h2>
          </div>
          <div className="text-right">
            <div className="font-mono text-xs text-cyber-green">{completedCount}/{allLessons.length} миссий</div>
            {classLessons.length > 0 && (
              <div className="font-mono text-[10px] text-gray-600 mt-0.5">
                +{classLessons.length} {playerClass === 'data_ghost' || playerClass === 'netrunner' ? 'DATA SCIENCE' : 'AI'} уроков
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mb-5 border-b border-white/8">
          {([['theory', '📚', 'ТЕОРИЯ'], ['missions', '⚔️', 'МИССИИ']] as const).map(([t, ico, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className="flex items-center gap-2 px-5 py-2.5 font-orbitron text-xs transition-all border-b-2"
              style={{
                color: tab === t ? '#00ff41' : '#555',
                borderBottomColor: tab === t ? '#00ff41' : 'transparent',
                backgroundColor: tab === t ? '#00ff4108' : 'transparent',
              }}>
              {ico} {label}
            </button>
          ))}
        </div>

        {/* ── THEORY ── */}
        {tab === 'theory' && (
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="w-full lg:w-60 flex-shrink-0">
              <div className="flex flex-wrap gap-1 mb-3">
                {categories.map(c => (
                  <button key={c} onClick={() => setTheoryFilter(c)}
                    className="font-mono text-[10px] px-2 py-1 border transition-all"
                    style={{
                      borderColor: theoryFilter === c ? '#00ff41' : '#ffffff12',
                      color: theoryFilter === c ? '#00ff41' : '#555',
                      backgroundColor: theoryFilter === c ? '#00ff4110' : 'transparent',
                    }}>
                    {c}
                  </button>
                ))}
              </div>
              <div className="space-y-1">
                {filteredTheory.map(t => (
                  <button key={t.id} onClick={() => setSelectedTheory(t)}
                    className="w-full text-left p-3 border transition-all"
                    style={{
                      borderColor: selectedTheory.id === t.id ? t.color + '60' : '#ffffff08',
                      backgroundColor: selectedTheory.id === t.id ? t.color + '08' : 'transparent',
                      borderLeftWidth: selectedTheory.id === t.id ? '3px' : '1px',
                    }}>
                    <div className="font-rajdhani text-sm font-semibold text-white">{t.title}</div>
                    <div className="font-mono text-[9px] mt-0.5" style={{ color: t.color + '80' }}>{t.category}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-4">
              <div className="border p-5" style={{ borderColor: selectedTheory.color + '30', backgroundColor: selectedTheory.color + '04' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-8 flex-shrink-0" style={{ backgroundColor: selectedTheory.color }} />
                  <div>
                    <div className="font-mono text-[10px] mb-0.5" style={{ color: selectedTheory.color + '80' }}>{selectedTheory.category}</div>
                    <h3 className="font-orbitron text-xl text-white">{selectedTheory.title}</h3>
                  </div>
                </div>
                <div className="font-rajdhani text-gray-300 text-sm leading-relaxed whitespace-pre-line">{selectedTheory.theory}</div>
              </div>

              <div className="border" style={{ borderColor: selectedTheory.color + '30' }}>
                <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 bg-black/40">
                  <div className="w-2 h-2 rounded-full bg-red-500/70" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500/70" />
                  <div className="w-2 h-2 rounded-full bg-green-500/70" />
                  <span className="font-mono text-[10px] text-gray-600 ml-2">example_{selectedTheory.id}.py</span>
                  <span className="ml-auto font-mono text-[10px]" style={{ color: selectedTheory.color + '60' }}>// Пример</span>
                </div>
                <Editor
                  height="260px"
                  language="python"
                  theme="vs-dark"
                  value={selectedTheory.example}
                  options={{
                    readOnly: true,
                    fontSize: 13,
                    minimap: { enabled: false },
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    padding: { top: 10, bottom: 10 },
                    fontFamily: 'Share Tech Mono, Consolas, monospace',
                    renderLineHighlight: 'none',
                  }}
                />
              </div>

              <div className="border p-4 flex items-start gap-3"
                style={{ borderColor: selectedTheory.color + '40', backgroundColor: selectedTheory.color + '06' }}>
                <Icon name="Lightbulb" size={14} style={{ color: selectedTheory.color }} className="mt-0.5 flex-shrink-0" />
                <div className="font-mono text-xs leading-relaxed" style={{ color: selectedTheory.color + 'cc' }}>{selectedTheory.note}</div>
              </div>

              <button
                onClick={() => setTab('missions')}
                className="flex items-center gap-2 font-orbitron text-xs px-5 py-3 border transition-all"
                style={{ borderColor: selectedTheory.color, color: selectedTheory.color, backgroundColor: selectedTheory.color + '10' }}>
                <Icon name="Play" size={13} />
                ПРАКТИКОВАТЬ ЭТУ ТЕМУ →
              </button>
            </div>
          </div>
        )}

        {/* ── MISSIONS ── */}
        {tab === 'missions' && (
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="w-full lg:w-60 flex-shrink-0 space-y-4">
              {([1, 2, 3] as const).map(act => {
                const actLessons = allLessons.filter(l => l.act === act);
                const meta = ACT_META[act];
                return (
                  <div key={act}>
                    <div className="font-mono text-[10px] font-bold px-1 mb-1.5" style={{ color: meta.color + 'aa' }}>{meta.label}</div>
                    <div className="space-y-1">
                      {actLessons.map(l => {
                        const isDone = l.completed || completedInSession.includes(l.id);
                        const isActive = activeId === l.id;
                        return (
                          <button key={l.id} onClick={() => selectLesson(l)} disabled={l.locked}
                            className="w-full text-left p-2.5 border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{
                              borderColor: isActive ? meta.color + '60' : isDone ? meta.color + '20' : '#ffffff08',
                              backgroundColor: isActive ? meta.color + '08' : 'transparent',
                              borderLeftWidth: isActive ? '3px' : '1px',
                            }}>
                            <div className="flex items-center gap-2">
                              <span className="text-sm flex-shrink-0">{l.locked ? '🔒' : isDone ? '✅' : l.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="font-rajdhani text-xs font-semibold text-white truncate">{l.title}</div>
                                <div className="flex justify-between">
                                  <span className="font-mono text-[9px] text-gray-700">{l.chapter}</span>
                                  <span className="font-mono text-[9px]" style={{ color: meta.color + '80' }}>+{l.xp}</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex-1 min-w-0 space-y-3">
              <div className="border p-4"
                style={{ borderColor: ACT_META[lesson.act].color + '30', backgroundColor: ACT_META[lesson.act].color + '04' }}>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="font-mono text-[10px] px-2 py-0.5 border"
                    style={{ color: ACT_META[lesson.act].color, borderColor: ACT_META[lesson.act].color + '40' }}>
                    {lesson.chapter}
                  </span>
                  {(lesson.completed || completedInSession.includes(lesson.id)) && (
                    <span className="font-mono text-[10px] text-cyber-green">✅ ВЫПОЛНЕНО</span>
                  )}
                </div>
                <h3 className="font-orbitron text-base text-white mb-1">{lesson.icon} {lesson.title}</h3>
                <p className="text-gray-500 font-rajdhani text-sm leading-snug mb-3">{lesson.desc}</p>
                <div className="border border-white/8 bg-black/40 p-3">
                  <div className="font-mono text-[10px] text-gray-600 mb-1.5">// ЗАДАНИЕ</div>
                  <p className="text-white font-rajdhani text-sm mb-3">{lesson.task.desc}</p>
                  <div className="flex flex-wrap gap-1">
                    {lesson.task.keywords.map(kw => {
                      const found = code.toLowerCase().includes(kw.toLowerCase());
                      return (
                        <span key={kw} className="font-mono text-[10px] px-1.5 py-0.5 border transition-all"
                          style={{
                            color: found ? ACT_META[lesson.act].color : '#444',
                            borderColor: found ? ACT_META[lesson.act].color + '60' : '#333',
                            backgroundColor: found ? ACT_META[lesson.act].color + '10' : 'transparent',
                          }}>
                          {found ? '✓ ' : ''}{kw}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="border" style={{ borderColor: ACT_META[lesson.act].color + '30' }}>
                <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 bg-black/50">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                  <span className="font-mono text-[10px] text-gray-600 ml-2">mission_{String(lesson.id).padStart(2, '0')}.py</span>
                  <div className="ml-auto flex items-center gap-2">
                    <button onClick={() => setShowHint(h => !h)}
                      className="font-mono text-[10px] px-2 py-0.5 border transition-all"
                      style={{ borderColor: ACT_META[lesson.act].color + '40', color: showHint ? ACT_META[lesson.act].color : '#555', backgroundColor: showHint ? ACT_META[lesson.act].color + '10' : 'transparent' }}>
                      ПРИМЕР
                    </button>
                    <button onClick={() => { setCode(''); setOutputLines([]); setRunState('idle'); }}
                      className="font-mono text-[10px] px-2 py-0.5 border border-white/10 text-gray-600 hover:text-gray-400 transition-colors">
                      ОЧИСТИТЬ
                    </button>
                  </div>
                </div>
                {showHint && (
                  <div className="px-3 py-2 bg-black/70 border-b border-white/5 font-mono text-xs" style={{ color: ACT_META[lesson.act].color + '80' }}>
                    # {lesson.task.example.split('\n')[0]}
                  </div>
                )}
                <Editor
                  height="200px"
                  language="python"
                  theme="vs-dark"
                  value={code}
                  onChange={v => setCode(v || '')}
                  options={{
                    fontSize: 13,
                    minimap: { enabled: false },
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    padding: { top: 8, bottom: 8 },
                    fontFamily: 'Share Tech Mono, Consolas, monospace',
                  }}
                />
              </div>

              {/* Toggle: реальный Python vs проверка ключевых слов */}
              <div className="flex items-center justify-between">
                <button
                  onClick={runCode}
                  disabled={runState === 'running' || (realExec && pyLoading)}
                  className="flex-1 py-3 font-orbitron text-sm border transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ borderColor: ACT_META[lesson.act].color, color: ACT_META[lesson.act].color, backgroundColor: ACT_META[lesson.act].color + '15' }}>
                  {(runState === 'running' || (realExec && pyLoading))
                    ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />{pyLoading ? 'ЗАГРУЗКА PYTHON...' : 'ВЫПОЛНЕНИЕ...'}</>
                    : <><Icon name="Play" size={14} />ЗАПУСТИТЬ КОД</>}
                </button>
                <button
                  onClick={() => setRealExec(v => !v)}
                  className="ml-2 px-3 py-3 border font-mono text-[10px] transition-all"
                  style={{
                    borderColor: realExec ? '#00ffff' : '#333',
                    color: realExec ? '#00ffff' : '#555',
                    backgroundColor: realExec ? '#00ffff10' : 'transparent',
                  }}
                  title={realExec ? 'Реальное выполнение Python (Pyodide)' : 'Проверка ключевых слов'}>
                  {realExec ? '🐍 REAL' : '🔑 KEYS'}
                </button>
              </div>

              {/* XP результат */}
              {xpResult && runState === 'success' && (
                <div className="border border-cyber-green/40 bg-cyber-green/5 p-3 text-center animate-fade-in-up">
                  {xpResult.xp > 0 ? (
                    <div className="space-y-0.5">
                      <div className="font-orbitron text-sm text-cyber-green">+{xpResult.xp} XP сохранено!</div>
                      {xpResult.levelUp && (
                        <div className="font-orbitron text-cyber-yellow animate-pulse">⚡ LEVEL UP → LVL {xpResult.newLevel}!</div>
                      )}
                    </div>
                  ) : (
                    <div className="font-mono text-[10px] text-gray-600">Урок уже засчитан ранее</div>
                  )}
                </div>
              )}

              <div className="border border-white/8 bg-black/80">
                <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/5">
                  <span className="font-mono text-[10px] text-gray-600">archive@codegrid9:~$</span>
                  <div className="ml-auto">
                    {runState === 'success' && <span className="font-mono text-[10px] text-cyber-green">● PASS</span>}
                    {runState === 'error' && <span className="font-mono text-[10px] text-red-400">● FAIL</span>}
                    {runState === 'running' && <span className="font-mono text-[10px] text-yellow-400 animate-pulse">● RUN</span>}
                  </div>
                </div>
                <div ref={outputRef} className="p-3 space-y-0.5 font-mono text-xs" style={{ height: '110px', overflowY: 'auto' }}>
                  {outputLines.length === 0 && <span className="text-gray-700">// Запусти код...</span>}
                  {outputLines.map((line, i) => (
                    <div key={i} style={{ color: line.type === 'ok' ? '#00ff41' : line.type === 'err' ? '#ff4060' : line.type === 'cmd' ? '#00ffff' : line.type === 'dim' ? '#444' : '#888' }}>
                      {line.text}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button onClick={() => { const p = allLessons.find(l => l.id === lesson.id - 1); if (p && !p.locked) selectLesson(p); }}
                  disabled={allLessons.findIndex(l => l.id === lesson.id) === 0}
                  className="font-orbitron text-xs px-4 py-2 border border-white/10 text-gray-600 hover:text-gray-400 disabled:opacity-30 transition-colors">
                  ← НАЗАД
                </button>
                <button onClick={() => { const n = allLessons.find(l => l.id === lesson.id + 1); if (n && !n.locked) selectLesson(n); }}
                  disabled={!allLessons.find(l => l.id === lesson.id + 1) || allLessons.find(l => l.id === lesson.id + 1)?.locked}
                  className="font-orbitron text-xs px-4 py-2 border border-white/10 text-gray-600 hover:text-gray-400 disabled:opacity-30 transition-colors">
                  ВПЕРЁД →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}