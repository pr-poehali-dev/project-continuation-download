// ─── 20 дополнительных уроков Python ────────────────────────────────────────
// Дополняют существующие 8 уроков LessonsSection.
// Структура совпадает с Theory из LessonsSection.tsx.

export interface ExtraLesson {
  id: string;
  title: string;
  category: string;
  color: string;
  theory: string;
  example: string;
  note: string;
}

export const EXTRA_LESSONS: ExtraLesson[] = [
  // ─── ОСНОВЫ (расширение) ────────────────────────────────────────
  {
    id: 'input_output',
    title: 'Ввод и вывод',
    category: 'Основы',
    color: '#00ff41',
    theory: `Программа становится живой, когда умеет общаться: получать данные и отвечать.

ВЫВОД на экран:
  print("Привет")
  print("HP:", hp, "MP:", mp)        # через запятую — добавит пробелы
  print("A", "B", sep="-")           # A-B
  print("loading", end="...")        # без перевода строки

ВВОД от пользователя:
  name = input("Имя: ")              # всегда возвращает строку!
  age = int(input("Возраст: "))      # преобразуем в число
  hp  = float(input("HP: "))         # дробное

ВАЖНО: input() возвращает строку. Если нужно число — оборачивай в int() или float().`,
    example: `name = input("Кто ты, агент? ")
age  = int(input("Возраст: "))
print(f"Привет, {name}! Через {65 - age} лет — пенсия.")

# Несколько значений в одной строке
a, b = input("Два числа через пробел: ").split()
a, b = int(a), int(b)
print(f"Сумма: {a + b}")`,
    note: 'Если забыл int() — Python сложит строки: "2" + "3" = "23", а не 5.',
  },

  {
    id: 'operators',
    title: 'Арифметика и операторы',
    category: 'Основы',
    color: '#00ff41',
    theory: `Python считает как калькулятор, но с особенностями.

Арифметика:
  +  сложение         5 + 3   → 8
  -  вычитание        5 - 3   → 2
  *  умножение        5 * 3   → 15
  /  деление          5 / 2   → 2.5     (всегда float!)
  // целочисленное    5 // 2  → 2
  %  остаток          5 % 2   → 1
  ** степень          2 ** 10 → 1024

Сокращённые операторы:
  x += 5     # то же что x = x + 5
  x -= 3
  x *= 2
  hp //= 2   # уполовинить HP

Приоритет — как в математике: () > ** > * / % // > + -`,
    example: `# Деление
print(10 / 3)    # 3.333...
print(10 // 3)   # 3 (целое)
print(10 % 3)    # 1 (остаток)
print(2 ** 8)    # 256

# Проверка чётности
n = 42
if n % 2 == 0:
    print("чётное")

# Расчёт урона
base = 50
crit = 2
dmg = base * crit * 1.15
print(f"Урон: {dmg:.1f}")`,
    note: 'Округление: round(x, 2) — до 2 знаков. f"{x:.2f}" — то же в строке.',
  },

  {
    id: 'type_conversion',
    title: 'Приведение типов',
    category: 'Основы',
    color: '#00aaff',
    theory: `Иногда Python нужно подсказать — какой тип нам нужен.

Главные конвертеры:
  int(x)    — в целое:    int("42") → 42,   int(3.9) → 3 (обрезает!)
  float(x)  — в дробное:  float("3.14") → 3.14
  str(x)    — в строку:   str(42) → "42"
  bool(x)   — в bool:     bool(0) → False, bool(1) → True
                          bool("") → False, bool("a") → True
                          bool([]) → False, bool([0]) → True

ПРОВЕРКА типа:
  type(x)              # <class 'int'>
  isinstance(x, int)   # True / False — предпочтительно

При неудачной конвертации — ValueError:
  int("hello")   # ValueError`,
    example: `# Из ввода
hp_str = "85"
hp = int(hp_str)
print(hp + 15)

# Безопасная конвертация
def to_int(s, default=0):
    try:
        return int(s)
    except ValueError:
        return default

print(to_int("42"))      # 42
print(to_int("xyz"))     # 0
print(to_int("xyz", -1)) # -1

# Проверка
x = 3.14
print(isinstance(x, float))  # True
print(isinstance(x, int))    # False`,
    note: 'int("3.5") вызовет ошибку. Сначала float("3.5"), потом int(3.5).',
  },

  // ─── СТРУКТУРЫ ДАННЫХ ───────────────────────────────────────────
  {
    id: 'sets',
    title: 'Множества (set)',
    category: 'Средний уровень',
    color: '#00aaff',
    theory: `Множество — это коллекция БЕЗ повторов и БЕЗ порядка.

Создание:
  s = {1, 2, 3, 2, 1}        # {1, 2, 3} — дубликаты исчезли
  empty = set()              # пустое — НЕ {}, иначе словарь

Операции:
  s.add(5)            # добавить
  s.remove(3)         # удалить (ошибка если нет)
  s.discard(99)       # удалить безопасно
  3 in s              # есть ли (быстро!)
  len(s)              # сколько уникальных

Математика множеств:
  a | b   объединение     {1,2} | {2,3}  → {1,2,3}
  a & b   пересечение     {1,2} & {2,3}  → {2}
  a - b   разность        {1,2} & {2,3}  → {1}
  a ^ b   симметричная    {1,2} ^ {2,3}  → {1,3}

Когда использовать: убрать дубликаты, быстрая проверка наличия.`,
    example: `agents = ["Nova", "Phantom", "Nova", "K4I", "Phantom"]
unique = set(agents)
print(unique)           # {'Nova', 'Phantom', 'K4I'}
print(len(unique))      # 3

# Какие навыки знают оба?
nova_skills = {"hack", "stealth", "code"}
k4i_skills  = {"hack", "lead", "code", "war"}

both = nova_skills & k4i_skills
print(both)             # {'hack', 'code'}

only_k4i = k4i_skills - nova_skills
print(only_k4i)         # {'lead', 'war'}`,
    note: 'Проверка x in set работает за O(1) — мгновенно. В списке — O(n).',
  },

  {
    id: 'tuples_ext',
    title: 'Кортежи и распаковка',
    category: 'Средний уровень',
    color: '#ffaa00',
    theory: `Кортеж (tuple) — как список, но неизменяемый.

Создание:
  point = (3, 5)
  rgb = 255, 100, 50    # скобки не обязательны
  single = (42,)        # внимание: запятая обязательна!

РАСПАКОВКА — главный приём:
  x, y = (3, 5)
  print(x, y)           # 3 5

  name, level, hp = "Nova", 7, 100

Обмен переменных без буфера:
  a, b = b, a           # питоновская магия

* — для остатка:
  first, *rest = [1, 2, 3, 4]
  # first = 1,  rest = [2, 3, 4]

  *head, last = [1, 2, 3, 4]
  # head = [1, 2, 3],  last = 4

Когда tuple вместо list:
  • когда значения не должны меняться
  • когда нужно вернуть несколько значений из функции
  • для координат, RGB-цветов, ключей словаря`,
    example: `# Возврат нескольких значений
def stats(hp, max_hp):
    pct = hp / max_hp * 100
    status = "OK" if pct > 50 else "DANGER"
    return pct, status

percent, st = stats(45, 100)
print(percent, st)

# Обмен
a, b = 10, 20
a, b = b, a
print(a, b)        # 20 10

# Перебор пар
points = [(0, 0), (3, 4), (6, 8)]
for x, y in points:
    print(f"({x}, {y})")

# Распаковка в *
first, *middle, last = [1, 2, 3, 4, 5]
print(first, middle, last)`,
    note: 'Tuple быстрее list и занимает меньше памяти. Если не меняешь — используй tuple.',
  },

  {
    id: 'string_methods',
    title: 'Работа со строками',
    category: 'Средний уровень',
    color: '#00aaff',
    theory: `Строки — это объекты с богатым набором методов.

Изменение регистра:
  s.upper()       "abc" → "ABC"
  s.lower()       "ABC" → "abc"
  s.title()       "hello world" → "Hello World"
  s.capitalize()  "hello" → "Hello"

Поиск и проверки:
  s.find("a")        # индекс или -1
  s.index("a")       # индекс или ошибка
  s.count("a")       # сколько раз встречается
  s.startswith("py") # начинается с
  s.endswith(".py")  # заканчивается на

Очистка и замена:
  s.strip()           # обрезать пробелы по краям
  s.lstrip() rstrip() # только слева / справа
  s.replace("a", "b") # заменить
  s.split(",")        # разбить на список
  ",".join(["a","b"]) # склеить → "a,b"

Проверка содержимого:
  s.isdigit()    # только цифры
  s.isalpha()    # только буквы
  s.isalnum()    # цифры и буквы`,
    example: `text = "  Hello, Archive!  "

clean = text.strip()
print(clean)               # "Hello, Archive!"
print(clean.lower())       # "hello, archive!"
print(clean.replace(",", ""))  # "Hello Archive!"

# Парсинг CSV-строки
row = "Nova,7,Cipher"
name, level, cls = row.split(",")
print(name, int(level), cls)

# Сборка
parts = ["agent", "id", "42"]
print("_".join(parts))     # agent_id_42

# Валидация
login = "nova_7"
if login.isalnum() or "_" in login:
    print("OK")`,
    note: 'Строки неизменяемы: s.upper() возвращает новую строку, не меняет исходную.',
  },

  // ─── ЛОГИКА И УПРАВЛЕНИЕ ────────────────────────────────────────
  {
    id: 'nested_loops',
    title: 'Вложенные циклы',
    category: 'Средний уровень',
    color: '#ff00ff',
    theory: `Цикл внутри цикла — внутренний пройдёт полностью для каждой итерации внешнего.

Простой пример (таблица):
  for i in range(3):
      for j in range(3):
          print(i, j)
  # 3 × 3 = 9 раз выведет

Перебор матрицы:
  grid = [
      [1, 2, 3],
      [4, 5, 6],
  ]
  for row in grid:
      for cell in row:
          print(cell, end=" ")
      print()       # перевод строки

break внутри: прерывает только ВНУТРЕННИЙ цикл.
continue: тоже только внутренний.

Чтобы выйти из обоих — используй флаг или вынеси в функцию с return.`,
    example: `# Таблица умножения
for i in range(1, 4):
    for j in range(1, 4):
        print(f"{i * j:3}", end=" ")
    print()

# Поиск в матрице
matrix = [
    ["A", "B", "C"],
    ["D", "X", "F"],
]
target = "X"
found = False
for row in matrix:
    for cell in row:
        if cell == target:
            found = True
            break
    if found:
        break
print(f"Найдено: {found}")

# enumerate в обоих
for i, row in enumerate(matrix):
    for j, cell in enumerate(row):
        if cell == "X":
            print(f"X на ({i},{j})")`,
    note: 'Глубоко вложенные циклы — признак что нужна структура данных получше или функция.',
  },

  {
    id: 'comprehensions',
    title: 'List/Dict Comprehensions',
    category: 'Средний уровень',
    color: '#ff00ff',
    theory: `Comprehensions — питоновский способ создавать коллекции в одну строку.

LIST comprehension:
  squares = [x ** 2 for x in range(5)]
  # [0, 1, 4, 9, 16]

С условием:
  even = [x for x in range(10) if x % 2 == 0]
  # [0, 2, 4, 6, 8]

Преобразование:
  names = ["nova", "k4i"]
  upper = [n.upper() for n in names]

DICT comprehension:
  squares = {x: x ** 2 for x in range(5)}
  # {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}

  agents = ["Nova", "K4I"]
  scores = {name: 0 for name in agents}

SET comprehension:
  unique_lengths = {len(name) for name in names}

Когда НЕ использовать: если логика сложная — обычный цикл понятнее.`,
    example: `# Из списка имён → словарь {имя: длина}
agents = ["Nova", "Phantom", "K4I"]
lens = {name: len(name) for name in agents}
print(lens)   # {'Nova': 4, 'Phantom': 7, 'K4I': 3}

# Только длинные имена в верхнем регистре
long_upper = [n.upper() for n in agents if len(n) > 3]
print(long_upper)

# Фильтр чисел
numbers = [3, -1, 5, -8, 0, 12]
positives = [n for n in numbers if n > 0]
print(positives)

# Транспонирование матрицы
matrix = [[1, 2, 3], [4, 5, 6]]
T = [[row[i] for row in matrix] for i in range(3)]
print(T)`,
    note: 'Правило: если comprehension не помещается в строку — лучше обычный for. Читаемость важнее.',
  },

  // ─── ФУНКЦИИ (углублённо) ──────────────────────────────────────
  {
    id: 'function_args',
    title: 'Аргументы *args и **kwargs',
    category: 'Средний уровень',
    color: '#aa00ff',
    theory: `Иногда не знаешь сколько аргументов придёт. Тогда — *args и **kwargs.

*args — все позиционные аргументы как кортеж:
  def total(*nums):
      return sum(nums)

  total(1, 2, 3)        # 6
  total(1, 2, 3, 4, 5)  # 15

**kwargs — все именованные как словарь:
  def make_agent(**data):
      return data

  make_agent(name="Nova", level=7)
  # {'name': 'Nova', 'level': 7}

Комбинация и порядок:
  def func(req, *args, default=10, **kwargs):
      ...
  # 1) обычные  2) *args  3) keyword-only  4) **kwargs

РАСПАКОВКА при вызове:
  nums = [1, 2, 3]
  print(sum(nums))         # обычный список
  print(*nums)             # 1 2 3 — распаковали

  info = {"sep": "-", "end": "!"}
  print("A", "B", **info)  # A-B!`,
    example: `def stats(*scores):
    return {
        "min": min(scores),
        "max": max(scores),
        "avg": sum(scores) / len(scores),
    }

print(stats(85, 92, 78, 100))

def log(level="INFO", **fields):
    parts = [f"[{level}]"]
    for k, v in fields.items():
        parts.append(f"{k}={v}")
    print(" ".join(parts))

log("WARN", agent="Nova", hp=12, threat="high")

# Передача словаря как kwargs
config = {"agent": "K4I", "hp": 100, "level": 99}
log(**config)`,
    note: 'Имена *args и **kwargs — соглашение, можно называть как угодно. Но лучше следуй традиции.',
  },

  {
    id: 'lambda',
    title: 'Lambda и функциональщина',
    category: 'Средний уровень',
    color: '#aa00ff',
    theory: `Lambda — это маленькая функция в одну строку, без имени.

Сравни:
  def square(x):
      return x ** 2

  square = lambda x: x ** 2     # то же самое

Lambda хороша для разовых функций — в map, filter, sorted.

map(func, items) — применить функцию к каждому:
  doubled = list(map(lambda x: x * 2, [1, 2, 3]))
  # [2, 4, 6]

filter(func, items) — оставить только те, где True:
  evens = list(filter(lambda x: x % 2 == 0, range(10)))
  # [0, 2, 4, 6, 8]

sorted(items, key=...) — сортировка по ключу:
  agents = [("Nova", 7), ("K4I", 99), ("Phantom", 38)]
  by_level = sorted(agents, key=lambda a: a[1])
  by_level_desc = sorted(agents, key=lambda a: -a[1])

Когда НЕ использовать lambda: если выражение длиннее одной строки — заведи обычную def.`,
    example: `# Сортировка словарей
agents = [
    {"name": "Nova", "level": 7, "hp": 80},
    {"name": "K4I", "level": 99, "hp": 95},
    {"name": "Phantom", "level": 38, "hp": 60},
]

# По уровню
by_lvl = sorted(agents, key=lambda a: a["level"])
# По HP (по убыванию)
by_hp = sorted(agents, key=lambda a: -a["hp"])

# Топ-2 по уровню
top = sorted(agents, key=lambda a: a["level"], reverse=True)[:2]
print([a["name"] for a in top])

# map + filter
prices = [100, 250, 80, 999, 50]
discounted = list(map(lambda p: p * 0.8, filter(lambda p: p > 100, prices)))
print(discounted)`,
    note: 'List comprehension — питонистее, чем map/filter. [x*2 for x in lst] вместо map(lambda x: x*2, lst).',
  },

  {
    id: 'recursion',
    title: 'Рекурсия',
    category: 'Продвинутый',
    color: '#aa00ff',
    theory: `Рекурсия — функция, которая вызывает сама себя.

Каждая рекурсивная функция должна иметь:
  1) БАЗОВЫЙ случай — когда останавливаемся
  2) Рекурсивный шаг — упрощаем задачу и зовём себя

Классика — факториал:
  def fact(n):
      if n <= 1:        # база
          return 1
      return n * fact(n - 1)   # шаг

  fact(5) = 5 * 4 * 3 * 2 * 1 = 120

Числа Фибоначчи:
  def fib(n):
      if n < 2:
          return n
      return fib(n - 1) + fib(n - 2)

ВАЖНО: без базового случая будет RecursionError (бесконечный вызов).
Python разрешает максимум ~1000 уровней.

Когда рекурсия хороша:
  • Дерево / иерархия
  • Задача естественно делится на меньшие задачи
  • Когда циклом неудобно`,
    example: `def fact(n):
    if n <= 1:
        return 1
    return n * fact(n - 1)

print(fact(6))    # 720

# Сумма цифр
def digit_sum(n):
    if n < 10:
        return n
    return n % 10 + digit_sum(n // 10)

print(digit_sum(1234))  # 10

# Обход вложенных списков
def deep_sum(items):
    total = 0
    for item in items:
        if isinstance(item, list):
            total += deep_sum(item)   # сама себя
        else:
            total += item
    return total

print(deep_sum([1, [2, [3, 4]], 5]))  # 15`,
    note: 'Рекурсия элегантна, но медленнее цикла. Для производительности — итеративный вариант.',
  },

  // ─── ООП (углублённо) ──────────────────────────────────────────
  {
    id: 'oop_inheritance',
    title: 'ООП: Наследование',
    category: 'Продвинутый',
    color: '#ff4060',
    theory: `Наследование — один класс наследует поведение другого.

Базовый класс:
  class Agent:
      def __init__(self, name, hp):
          self.name = name
          self.hp = hp

      def status(self):
          return f"{self.name}: {self.hp} HP"

Дочерний:
  class Hacker(Agent):
      def __init__(self, name, hp, skill):
          super().__init__(name, hp)    # вызов родителя
          self.skill = skill

      def hack(self):
          return f"{self.name} взломал систему ({self.skill})"

Hacker получает всё от Agent + добавляет своё.

ПЕРЕОПРЕДЕЛЕНИЕ метода:
  class Elite(Agent):
      def status(self):
          return f"⭐ ELITE {super().status()}"

super() — обращение к родителю.
isinstance(obj, ParentClass) — True для всех наследников.`,
    example: `class Agent:
    def __init__(self, name, hp=100):
        self.name = name
        self.hp = hp

    def attack(self, dmg=10):
        return f"{self.name} наносит {dmg} урона"

    def __repr__(self):
        return f"<{type(self).__name__} {self.name}>"


class Cipher(Agent):
    def hack(self):
        return f"{self.name} взламывает терминал"


class Elite(Cipher):
    def __init__(self, name, hp, clearance):
        super().__init__(name, hp)
        self.clearance = clearance

    def attack(self, dmg=25):           # переопределили
        boost = self.clearance * 5
        return super().attack(dmg + boost)


k4i = Elite("K4I", 200, "ULTRA-7")
print(k4i.attack())
print(k4i.hack())
print(isinstance(k4i, Agent))   # True`,
    note: 'Принцип: общее — в родителя, особенное — в детей. Избегай слишком глубоких иерархий.',
  },

  {
    id: 'oop_dunder',
    title: 'ООП: Магические методы',
    category: 'Продвинутый',
    color: '#ff4060',
    theory: `Методы с __двумя_подчёркиваниями__ — "магические" или "dunder" (double underscore).
Python вызывает их автоматически.

Главные dunder'ы:

__init__       создание объекта
__repr__       официальное представление (для отладки)
__str__        читаемое представление (для print)
__len__        len(obj)
__eq__         obj1 == obj2
__lt__         obj1 < obj2  (а ещё __gt__, __le__, __ge__)
__add__        obj1 + obj2
__getitem__    obj[key]
__contains__   x in obj
__iter__       for x in obj
__call__       obj()  — объект как функция

Пример:
  class Vec:
      def __init__(self, x, y):
          self.x, self.y = x, y

      def __add__(self, other):
          return Vec(self.x + other.x, self.y + other.y)

      def __repr__(self):
          return f"Vec({self.x}, {self.y})"

  print(Vec(1, 2) + Vec(3, 4))   # Vec(4, 6)`,
    example: `class Inventory:
    def __init__(self, items=None):
        self.items = items or []

    def __len__(self):
        return len(self.items)

    def __contains__(self, item):
        return item in self.items

    def __getitem__(self, i):
        return self.items[i]

    def __add__(self, other):
        return Inventory(self.items + other.items)

    def __repr__(self):
        return f"Inventory({self.items})"


bag1 = Inventory(["medkit", "ammo"])
bag2 = Inventory(["card", "key"])
loot = bag1 + bag2

print(len(loot))             # 4
print("ammo" in loot)        # True
print(loot[0])               # medkit
for item in loot.items:
    print("-", item)`,
    note: '__str__ — для пользователя (print). __repr__ — для разработчика (отладка, repl).',
  },

  {
    id: 'oop_property',
    title: 'ООП: @property и инкапсуляция',
    category: 'Продвинутый',
    color: '#ff4060',
    theory: `Иногда нужно: атрибут выглядит как поле, но при доступе работает функция.

Без @property:
  agent.hp_percent()   # некрасиво, скобки

С @property:
  class Agent:
      def __init__(self, hp, max_hp):
          self.hp = hp
          self.max_hp = max_hp

      @property
      def hp_percent(self):
          return self.hp / self.max_hp * 100

  agent.hp_percent     # без скобок!

Сеттер (с проверкой):
  @hp.setter
  def hp(self, value):
      if value < 0:
          raise ValueError("HP не может быть < 0")
      self._hp = value

ИНКАПСУЛЯЦИЯ (соглашение):
  self.name      — публичное
  self._hp       — protected (только своим)
  self.__secret  — приватное (mangling)

Python верит программисту. _hp можно прочитать, но "не принято".`,
    example: `class Agent:
    def __init__(self, name, hp=100, max_hp=100):
        self.name = name
        self._hp = hp
        self.max_hp = max_hp

    @property
    def hp(self):
        return self._hp

    @hp.setter
    def hp(self, value):
        self._hp = max(0, min(value, self.max_hp))

    @property
    def is_alive(self):
        return self._hp > 0

    @property
    def hp_bar(self):
        pct = int(self._hp / self.max_hp * 10)
        return "█" * pct + "░" * (10 - pct)


nova = Agent("Nova", 80, 100)
nova.hp = 500            # не сломается — обрежется
print(nova.hp)           # 100
print(nova.hp_bar)       # ██████████
print(nova.is_alive)     # True`,
    note: 'Не вешай @property на всё подряд. Используй когда есть логика: проверка, расчёт, кэш.',
  },

  // ─── ИСКЛЮЧЕНИЯ ─────────────────────────────────────────────────
  {
    id: 'exceptions',
    title: 'Исключения и try/except',
    category: 'Средний уровень',
    color: '#ff4060',
    theory: `Ошибки случаются. Python даёт способ их перехватить и не упасть.

Базовая конструкция:
  try:
      x = int(input("Число: "))
  except ValueError:
      print("Это не число")

Несколько типов ошибок:
  try:
      data = open("file.txt").read()
      num = int(data)
  except FileNotFoundError:
      print("Файла нет")
  except ValueError:
      print("Не число")
  except Exception as e:
      print(f"Другая ошибка: {e}")

Полная форма:
  try:
      ...                 # код который может упасть
  except ValueError:
      ...                 # обработка
  else:
      ...                 # если ошибок НЕ было
  finally:
      ...                 # выполнится ВСЕГДА (закрыть файл, освободить ресурс)

ВЫБРОСИТЬ свою ошибку:
  raise ValueError("Уровень должен быть >= 1")

Создать свой класс ошибки:
  class GameOverError(Exception):
      pass`,
    example: `def safe_div(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return None
    except TypeError:
        return None

print(safe_div(10, 2))   # 5.0
print(safe_div(10, 0))   # None
print(safe_div("a", 1))  # None

# Свой тип ошибки
class LowHpError(Exception):
    pass

def attack(target_hp, dmg):
    new = target_hp - dmg
    if new < 0:
        raise LowHpError(f"Перебор: {new} HP")
    return new

try:
    hp = attack(20, 50)
except LowHpError as e:
    print(f"⚠ {e}")
    hp = 0
print(f"Финальное HP: {hp}")`,
    note: 'Никогда не пиши голый "except:" — он поймает даже Ctrl+C. Указывай тип ошибки.',
  },

  // ─── ФАЙЛЫ И МОДУЛИ ─────────────────────────────────────────────
  {
    id: 'files',
    title: 'Работа с файлами',
    category: 'Средний уровень',
    color: '#00aaff',
    theory: `Файл — постоянное хранилище, в отличие от переменных в памяти.

ЧТЕНИЕ:
  with open("data.txt", "r", encoding="utf-8") as f:
      text = f.read()        # всё сразу
      # или
      lines = f.readlines()  # список строк
      # или
      for line in f:         # построчно (экономно по памяти)
          print(line.strip())

ЗАПИСЬ:
  with open("log.txt", "w", encoding="utf-8") as f:
      f.write("Запись\\n")
      f.writelines(["a\\n", "b\\n"])

  # "w" — перезапишет файл
  # "a" — добавит в конец
  # "x" — создать новый (ошибка если есть)

with — гарантирует закрытие файла даже при ошибке. Это правильный способ.

JSON:
  import json
  data = {"name": "Nova", "level": 7}
  with open("agent.json", "w") as f:
      json.dump(data, f)

  with open("agent.json") as f:
      loaded = json.load(f)`,
    example: `import json

# Запись JSON
agent = {
    "name": "Nova_7",
    "level": 42,
    "skills": ["Lambda", "Breach"],
}

with open("agent.json", "w", encoding="utf-8") as f:
    json.dump(agent, f, ensure_ascii=False, indent=2)

# Чтение и обновление
with open("agent.json", "r", encoding="utf-8") as f:
    data = json.load(f)

data["level"] += 1
print(data)

# Чтение текстового лога
with open("log.txt", "a", encoding="utf-8") as f:
    f.write(f"{agent['name']} вышел онлайн\\n")`,
    note: 'Всегда указывай encoding="utf-8" — иначе на Windows будут проблемы с русскими буквами.',
  },

  {
    id: 'modules',
    title: 'Модули и import',
    category: 'Средний уровень',
    color: '#00aaff',
    theory: `Модуль — это .py-файл с переиспользуемым кодом.
Python имеет огромную стандартную библиотеку.

ИМПОРТ:
  import math               # весь модуль
  print(math.pi)

  from math import pi, sqrt # конкретные имена
  print(pi)

  from math import *        # ВСЁ (не делай так в больших проектах)

  import math as m          # псевдоним
  print(m.pi)

Полезные модули из стандарта:
  math       — sqrt, sin, cos, pi, log
  random     — random(), randint(a,b), choice(list), shuffle(list)
  datetime   — now(), today(), timedelta
  os         — listdir(), path.join(), getenv()
  json       — dump, load
  re         — регулярки
  collections — Counter, defaultdict, deque
  itertools  — chain, combinations, product

Свой модуль:
  файл utils.py:
    def greet(name): return f"Hi {name}"

  файл main.py:
    from utils import greet
    print(greet("Nova"))`,
    example: `import random
from datetime import datetime, timedelta

# Случайный выбор
agents = ["Nova", "Phantom", "K4I"]
chosen = random.choice(agents)
print(f"Назначен: {chosen}")

# Случайные числа
roll = random.randint(1, 20)
print(f"Бросок: {roll}")

# Время и даты
now = datetime.now()
print(f"Сейчас: {now:%Y-%m-%d %H:%M}")

birthday = datetime(2087, 1, 1)
days_left = (birthday - now).days
print(f"До нового CodeGrid-9: {days_left} дней")

# Счётчик
from collections import Counter
log = ["hack", "battle", "hack", "trade", "battle", "hack"]
print(Counter(log).most_common(2))`,
    note: 'pip install — для внешних пакетов (requests, numpy, pandas). Стандартная библиотека уже встроена.',
  },

  // ─── ПРОДВИНУТОЕ ────────────────────────────────────────────────
  {
    id: 'generators',
    title: 'Генераторы и yield',
    category: 'Продвинутый',
    color: '#aa00ff',
    theory: `Генератор — функция, которая отдаёт значения по одному, а не сразу все.

Обычная функция:
  def squares(n):
      result = []
      for i in range(n):
          result.append(i ** 2)
      return result

  squares(1_000_000)    # построит ОГРОМНЫЙ список в памяти

Генератор:
  def squares(n):
      for i in range(n):
          yield i ** 2     # вернуть и заморозиться

  for sq in squares(1_000_000):
      print(sq)            # обрабатывается по одному — память не растёт

yield "приостанавливает" функцию. При следующем next() — продолжает с того же места.

Generator expression — как list comprehension, но в скобках:
  squares = (x ** 2 for x in range(100))
  next(squares)   # 0
  next(squares)   # 1

Когда нужны:
  • Большие данные (логи, файлы, потоки)
  • Бесконечные последовательности
  • Ленивые вычисления`,
    example: `def fibonacci():
    a, b = 0, 1
    while True:                # бесконечный!
        yield a
        a, b = b, a + b

# Берём первые 10
fib = fibonacci()
for _ in range(10):
    print(next(fib), end=" ")
print()

# Чтение большого файла без загрузки в память
def read_lines(path):
    with open(path, encoding="utf-8") as f:
        for line in f:
            yield line.strip()

# (раскомментируй если есть файл)
# for line in read_lines("huge.log"):
#     if "ERROR" in line:
#         print(line)

# Generator expression
total = sum(x * x for x in range(1000))
print(total)`,
    note: 'Генератор можно пройти ТОЛЬКО ОДИН РАЗ. После — он исчерпан, нужно создать заново.',
  },

  {
    id: 'decorators',
    title: 'Декораторы',
    category: 'Продвинутый',
    color: '#aa00ff',
    theory: `Декоратор — функция, которая модифицирует другую функцию.
Это надстройка без изменения исходного кода.

Простой декоратор:
  def log_calls(func):
      def wrapper(*args, **kwargs):
          print(f"→ вызов {func.__name__}")
          result = func(*args, **kwargs)
          print(f"← вернул {result}")
          return result
      return wrapper

  @log_calls
  def add(a, b):
      return a + b

  add(2, 3)
  # → вызов add
  # ← вернул 5

Что делает @log_calls:
  add = log_calls(add)   # эквивалент

Когда декораторы полезны:
  • Логирование
  • Замер времени работы
  • Проверка прав доступа
  • Кэширование

Стандартный декоратор для кэша:
  from functools import lru_cache

  @lru_cache(maxsize=128)
  def fib(n):
      if n < 2: return n
      return fib(n - 1) + fib(n - 2)`,
    example: `import time
from functools import wraps

def timed(func):
    @wraps(func)            # сохранит имя оригинала
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        ms = (time.time() - start) * 1000
        print(f"{func.__name__}: {ms:.1f} мс")
        return result
    return wrapper

@timed
def heavy_calc(n):
    return sum(i ** 2 for i in range(n))

heavy_calc(100_000)
heavy_calc(1_000_000)

# Кэширование рекурсии
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n-1) + fib(n-2)

print(fib(100))   # моментально благодаря кэшу`,
    note: 'Всегда оборачивай wrapper в @wraps(func) — иначе теряется имя и docstring оригинала.',
  },

  {
    id: 'context_managers',
    title: 'Контекстные менеджеры (with)',
    category: 'Продвинутый',
    color: '#aa00ff',
    theory: `Контекстный менеджер — объект, который автоматически захватывает и освобождает ресурс.

Самое известное применение — файлы:
  with open("f.txt") as f:
      data = f.read()
  # f.close() вызывается АВТОМАТИЧЕСКИ, даже при ошибке

Свой контекстный менеджер через класс:
  class Timer:
      def __enter__(self):
          self.start = time.time()
          return self

      def __exit__(self, exc_type, exc_val, exc_tb):
          self.elapsed = time.time() - self.start
          print(f"Заняло {self.elapsed:.2f}с")

  with Timer():
      time.sleep(1)

Через contextmanager — короче:
  from contextlib import contextmanager

  @contextmanager
  def timer():
      start = time.time()
      yield                       # код внутри with выполняется здесь
      print(time.time() - start)

Когда полезно:
  • Файлы, соединения с БД, блокировки
  • Замер времени
  • Временное изменение состояния (cwd, env)`,
    example: `import time
from contextlib import contextmanager

@contextmanager
def measure(label):
    start = time.time()
    yield                            # код внутри with
    print(f"[{label}] {time.time() - start:.3f}с")


with measure("вычисления"):
    s = sum(i ** 2 for i in range(1_000_000))
    print(f"Сумма квадратов: {s}")


# Несколько в одном with
with open("a.txt", "w") as a, open("b.txt", "w") as b:
    a.write("файл A")
    b.write("файл B")


# Свой через класс
class Section:
    def __init__(self, name):
        self.name = name
    def __enter__(self):
        print(f"┌─── {self.name} ───")
        return self
    def __exit__(self, *exc):
        print(f"└────────────────")

with Section("Инициализация"):
    print("шаг 1")
    print("шаг 2")`,
    note: 'with гарантирует освобождение ресурса даже если внутри блока возникла ошибка.',
  },
];
