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
    theory: `Переменная — это коробка с именем, в которой мы храним данные.

Представь стикер на коробке: на стикере написано имя, а внутри коробки лежит значение.

В Python не нужно говорить какого типа коробка — Python сам определит:

  x = 10           # целое число
  name = "Nova"    # строка (текст)
  pi = 3.14        # дробное число
  active = True    # правда / ложь

Правила имени переменной:
• Только буквы, цифры и подчёркивание _
• Не начинай с цифры
• Регистр важен: name и Name — это разные коробки
• Принято писать snake_case: agent_name`,
    example: `# Кладём разные данные в коробки с именами
name = "Nova"
level = 7
health = 100.0
is_online = True

# Выводим содержимое коробок
print(name)       # Nova
print(level)      # 7
print(health)     # 100.0
print(is_online)  # True

# Меняем значение в коробке
level = 8
print(level)      # 8`,
    note: 'Совет: имена переменных пиши осмысленно. agent_name понятнее, чем x или a1.',
  },
  {
    id: 'strings',
    title: 'Строки и f-строки',
    category: 'Основы',
    color: '#00aaff',
    theory: `Строка — это текст в кавычках.

Можно использовать любые кавычки:
  s1 = "Привет"       # двойные
  s2 = 'Мир'          # одинарные — то же самое

Чтобы соединить переменную и текст — используй f-строку.
Поставь букву f перед кавычками и пиши {имя_переменной} внутри:

  name = "Nova"
  level = 7
  print(f"Агент {name}, уровень {level}")
  # Выведет: Агент Nova, уровень 7

Полезные команды:
  text.upper()   — ВСЁ В ВЕРХНИЙ РЕГИСТР
  text.lower()   — всё в нижний
  text.strip()   — убрать пробелы по краям
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
    title: 'Условия if / else',
    category: 'Основы',
    color: '#ffaa00',
    theory: `Условия учат программу принимать решения.

Простое условие:
  if возраст >= 18:
      print("Доступ разрешён")
  else:
      print("Закрыто")

Если вариантов больше — добавь elif (иначе если):
  if score >= 90:
      print("Отлично")
  elif score >= 70:
      print("Хорошо")
  else:
      print("Учи дальше")

Знаки сравнения:
  ==   равно             !=   не равно
  >    больше            <    меньше
  >=   больше или равно  <=   меньше или равно

Соединяем условия:
  and  — оба должны быть верны
  or   — достаточно одного
  not  — наоборот

ВАЖНО: в Python отступы (4 пробела) — часть синтаксиса. Без них код не запустится.`,
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
    theory: `Цикл позволяет повторять действие много раз — без копипасты.

FOR — повторяет по списку значений или по числам:
  for i in range(5):        # 0, 1, 2, 3, 4
  for i in range(1, 6):     # 1, 2, 3, 4, 5
  for name in ["A","B","C"]: # по списку

  range(5) — это 5 чисел от 0 до 4.
  range(1, 6) — это 1, 2, 3, 4, 5. Второе число не включается.

WHILE — повторяет пока условие верно:
  hp = 100
  while hp > 0:
      hp -= 25

Полезные команды внутри цикла:
  break     — выйти из цикла раньше времени
  continue  — пропустить шаг и идти к следующему

Когда что использовать:
  for   — когда знаешь сколько раз повторить
  while — когда не знаешь и условие проверяется на лету`,
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
    theory: `Функция — это твоя собственная команда. Один раз написал — много раз вызываешь.

Создание функции:
  def greet(name):           # объявляем
      return f"Привет, {name}!"

  result = greet("Nova")     # вызываем
  print(result)              # Привет, Nova!

Разберём:
  • def — ключевое слово "определить функцию"
  • greet — имя (выбираешь сам)
  • name — параметр (то, что функция получает)
  • return — что функция отдаёт обратно

Параметр со значением по умолчанию:
  def greet(name, title="Агент"):
      return f"{title} {name}"

  greet("Nova")           # Агент Nova
  greet("K4I", "Босс")    # Босс K4I

Зачем функции:
• Не повторять один и тот же код
• Делать программу понятнее
• Тестировать кусочки по отдельности`,
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
    theory: `Список (list) — хранит много значений в одной переменной.

Создание списка:
  names = ["Nova", "Phantom", "K4I"]
  numbers = [1, 2, 3, 4, 5]
  empty = []

Доступ по индексу (нумерация с 0!):
  names[0]   → "Nova"      (первый)
  names[1]   → "Phantom"   (второй)
  names[-1]  → "K4I"       (последний)

Полезные команды:
  names.append("VOID")  — добавить в конец
  names.remove("Nova")  — убрать значение
  names.pop()           — убрать последний
  len(names)            — посчитать сколько элементов
  "Nova" in names       — проверить есть ли (True/False)

Перебор списка через for:
  for name in names:
      print(name)`,
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
    theory: `Словарь — это пары "ключ : значение". Похоже на настоящий словарь: ищешь по слову — получаешь определение.

Создание:
  agent = {
      "name": "Nova",
      "level": 7,
      "class": "Cipher"
  }

Достать значение по ключу:
  agent["name"]      → "Nova"
  agent["level"]     → 7

Изменить или добавить:
  agent["level"] = 8                  — изменить
  agent["faction"] = "The Archive"    — добавить новое

Когда использовать словарь:
  • Когда у объекта много свойств (имя + уровень + класс…)
  • Когда хочешь быстро искать по ключу

Перебор через цикл:
  for key, value in agent.items():
      print(f"{key}: {value}")`,
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
    theory: `Класс — это шаблон. Объект — то, что мы создаём по шаблону.

Например, "Агент" — класс. "Nova уровня 7" — конкретный объект.

Простейший класс:
  class Agent:
      def __init__(self, name, level):
          self.name = name
          self.level = level

Что тут происходит:
  • class Agent — создаём шаблон с именем Agent
  • __init__ — это специальный метод, который запускается когда мы создаём объект
  • self — это сам объект (Python подставит его автоматически)
  • self.name = name — сохраняем имя внутри объекта

Создаём объекты по шаблону:
  nova = Agent("Nova", 7)
  k4i  = Agent("K4I", 99)

  print(nova.name)   # Nova
  print(k4i.level)   # 99

Метод — функция внутри класса:
  class Agent:
      def __init__(self, name, level):
          self.name = name
          self.level = level

      def status(self):
          return f"[{self.level}] {self.name}"

  nova = Agent("Nova", 7)
  print(nova.status())   # [7] Nova

Зачем ООП:
  • Удобно описывать сложные объекты с поведением
  • Можно создавать множество похожих объектов
  • Код становится понятным и переиспользуемым`,
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

// ─── 15 уроков базы Python: от первой переменной до ООП ──────────────────────
// Курс рассчитан на абсолютного новичка. Каждый урок — маленький шаг.
// Описания и задачи написаны простым языком, без жаргона.

const LESSONS: Lesson[] = [
  // ═══════════════ АКТ I · ПЕРВЫЕ ШАГИ (1-5) ═══════════════
  {
    id: 1, title: 'Первый вывод: print()', chapter: 'АКТ I · М1', act: 1,
    xp: 80, completed: false, locked: false, icon: '👋',
    desc: 'Самая первая команда — научимся выводить текст на экран.',
    task: {
      desc: 'Используй print() чтобы вывести фразу: Привет, Python!',
      keywords: ['print', '"', 'Привет'],
      example: 'print("Привет, Python!")',
      output: '> Привет, Python!\n[OK] Первый print() работает',
    },
  },
  {
    id: 2, title: 'Переменные', chapter: 'АКТ I · М2', act: 1,
    xp: 100, completed: false, locked: false, icon: '📦',
    desc: 'Переменная — это коробка с именем, в которой ты хранишь данные.',
    task: {
      desc: 'Создай переменную name со значением "Агент" и выведи её через print(name)',
      keywords: ['name', '=', '"', 'print'],
      example: 'name = "Агент"\nprint(name)',
      output: '> Агент\n[OK] Переменная создана',
    },
  },
  {
    id: 3, title: 'Числа и арифметика', chapter: 'АКТ I · М3', act: 1,
    xp: 110, completed: false, locked: false, icon: '➕',
    desc: 'Python умеет считать как калькулятор. Складывает, умножает, делит.',
    task: {
      desc: 'Создай две переменные a=10 и b=3, выведи их сумму через print(a + b)',
      keywords: ['a', 'b', '=', '+', 'print'],
      example: 'a = 10\nb = 3\nprint(a + b)',
      output: '> 13\n[OK] Калькулятор работает',
    },
  },
  {
    id: 4, title: 'Строки и f-строки', chapter: 'АКТ I · М4', act: 1,
    xp: 130, completed: false, locked: false, icon: '🔤',
    desc: 'Текст — это строка. f-строки удобны: можно вставлять переменные прямо в текст.',
    task: {
      desc: 'Создай name="Nova" и level=7. Выведи через f-строку: "Агент Nova, уровень 7"',
      keywords: ['name', 'level', 'f"', '{name}', '{level}', 'print'],
      example: 'name = "Nova"\nlevel = 7\nprint(f"Агент {name}, уровень {level}")',
      output: '> Агент Nova, уровень 7\n[OK] f-строка работает',
    },
  },
  {
    id: 5, title: 'Ввод от пользователя', chapter: 'АКТ I · М5', act: 1,
    xp: 140, completed: false, locked: false, icon: '⌨️',
    desc: 'Команда input() читает то, что ввёл пользователь.',
    task: {
      desc: 'Прочитай имя через input(), сохрани в name, поприветствуй через print(f"Привет, {name}!")',
      keywords: ['name', 'input', 'print', 'f"', '{name}'],
      example: 'name = input("Как тебя зовут? ")\nprint(f"Привет, {name}!")',
      output: '> Как тебя зовут? Nova\n> Привет, Nova!\n[OK] Диалог работает',
    },
  },

  // ═══════════════ АКТ II · ЛОГИКА И ПОВТОР (6-10) ═══════════════
  {
    id: 6, title: 'Условия if / else', chapter: 'АКТ II · М1', act: 2,
    xp: 160, completed: false, locked: false, icon: '🔀',
    desc: 'Учим программу принимать решения: если что-то — делай одно, иначе — другое.',
    task: {
      desc: 'Создай переменную age=18. Если age >= 18 выведи "Доступ разрешён", иначе "Закрыто"',
      keywords: ['age', 'if', 'else', '>=', '18', 'print'],
      example: 'age = 18\nif age >= 18:\n    print("Доступ разрешён")\nelse:\n    print("Закрыто")',
      output: '> Доступ разрешён\n[OK] Логика работает',
    },
  },
  {
    id: 7, title: 'Несколько условий: elif', chapter: 'АКТ II · М2', act: 2,
    xp: 180, completed: false, locked: false, icon: '🎚️',
    desc: 'elif — это "иначе если". Помогает проверить несколько вариантов подряд.',
    task: {
      desc: 'Дано score=75. Если >=90 → "A", если >=70 → "B", иначе → "C". Выведи результат.',
      keywords: ['score', 'if', 'elif', 'else', '>=', 'print'],
      example: 'score = 75\nif score >= 90:\n    print("A")\nelif score >= 70:\n    print("B")\nelse:\n    print("C")',
      output: '> B\n[OK] Оценка вычислена',
    },
  },
  {
    id: 8, title: 'Цикл for и range()', chapter: 'АКТ II · М3', act: 2,
    xp: 200, completed: false, locked: false, icon: '🔄',
    desc: 'Цикл for повторяет действие много раз. range(n) — числа от 0 до n-1.',
    task: {
      desc: 'С помощью for и range выведи числа от 1 до 5 (каждое с новой строки)',
      keywords: ['for', 'in', 'range', 'print'],
      example: 'for i in range(1, 6):\n    print(i)',
      output: '> 1\n> 2\n> 3\n> 4\n> 5\n[OK] Цикл активирован',
    },
  },
  {
    id: 9, title: 'Цикл while', chapter: 'АКТ II · М4', act: 2,
    xp: 200, completed: false, locked: false, icon: '⏱️',
    desc: 'while — повторяет, пока условие истинно. Полезно когда не знаешь сколько раз.',
    task: {
      desc: 'Создай hp=100. В цикле while hp > 0: уменьшай hp на 25 и выводи hp. Цикл закончится сам.',
      keywords: ['hp', 'while', '>', '-=', 'print'],
      example: 'hp = 100\nwhile hp > 0:\n    hp -= 25\n    print(hp)',
      output: '> 75\n> 50\n> 25\n> 0\n[OK] while сработал',
    },
  },
  {
    id: 10, title: 'break и continue', chapter: 'АКТ II · М5', act: 2,
    xp: 190, completed: false, locked: false, icon: '⏩',
    desc: 'break — выйти из цикла. continue — пропустить шаг и идти дальше.',
    task: {
      desc: 'В цикле for i in range(10): пропусти 3 через continue, останови на 7 через break, остальное напечатай',
      keywords: ['for', 'range', '10', 'continue', 'break', 'print'],
      example: 'for i in range(10):\n    if i == 3:\n        continue\n    if i == 7:\n        break\n    print(i)',
      output: '> 0\n> 1\n> 2\n> 4\n> 5\n> 6\n[OK] Управление потоком',
    },
  },

  // ═══════════════ АКТ III · КОЛЛЕКЦИИ И ФУНКЦИИ (11-13) ═══════════════
  {
    id: 11, title: 'Функции — свои команды', chapter: 'АКТ III · М1', act: 3,
    xp: 260, completed: false, locked: false, icon: '🔧',
    desc: 'Функция — это блок кода с именем. Один раз написал — много раз вызывай.',
    task: {
      desc: 'Напиши функцию greet(name), которая возвращает "Привет, {name}!". Вызови greet("Nova") и распечатай результат.',
      keywords: ['def', 'greet', 'name', 'return', 'f"', 'print'],
      example: 'def greet(name):\n    return f"Привет, {name}!"\n\nprint(greet("Nova"))',
      output: '> Привет, Nova!\n[OK] Функция работает',
    },
  },
  {
    id: 12, title: 'Списки — много значений', chapter: 'АКТ III · М2', act: 3,
    xp: 280, completed: false, locked: false, icon: '🗂️',
    desc: 'Список хранит много значений в одной переменной. Удобно для коллекций.',
    task: {
      desc: 'Создай список names = ["Nova","Phantom","K4I"], добавь "VOID" через append, выведи длину списка через len(names)',
      keywords: ['names', '=', '[', ']', 'append', 'len', 'print'],
      example: 'names = ["Nova", "Phantom", "K4I"]\nnames.append("VOID")\nprint(len(names))',
      output: '> 4\n[OK] Список расширен',
    },
  },
  {
    id: 13, title: 'Словари — ключ-значение', chapter: 'АКТ III · М3', act: 3,
    xp: 300, completed: false, locked: false, icon: '📖',
    desc: 'Словарь — это пары "ключ: значение". Как настоящий словарь: ищешь по слову — получаешь определение.',
    task: {
      desc: 'Создай agent = {"name":"Nova","level":7}. Выведи agent["name"], потом измени level на 8 и снова выведи agent',
      keywords: ['agent', '=', '{', '"name"', '"level"', 'print'],
      example: 'agent = {"name": "Nova", "level": 7}\nprint(agent["name"])\nagent["level"] = 8\nprint(agent)',
      output: '> Nova\n> {\'name\': \'Nova\', \'level\': 8}\n[OK] Словарь работает',
    },
  },

  // ═══════════════ АКТ IV · ООП (14-15) ═══════════════
  {
    id: 14, title: 'Классы — свои объекты', chapter: 'АКТ IV · М1', act: 3,
    xp: 400, completed: false, locked: false, icon: '🏗️',
    desc: 'Класс — это шаблон. Объект — то, что создано по шаблону. __init__ запускается при создании.',
    task: {
      desc: 'Создай класс Agent с __init__(self, name, level). Создай объект nova = Agent("Nova", 7) и выведи nova.name',
      keywords: ['class', 'Agent', 'def', '__init__', 'self', 'name', 'level', 'nova', 'print'],
      example: 'class Agent:\n    def __init__(self, name, level):\n        self.name = name\n        self.level = level\n\nnova = Agent("Nova", 7)\nprint(nova.name)',
      output: '> Nova\n[OK] Объект создан',
    },
  },
  {
    id: 15, title: 'Методы и финал курса', chapter: 'АКТ IV · М2', act: 3,
    xp: 500, completed: false, locked: false, icon: '🎓',
    desc: 'Методы — это функции внутри класса. Они умеют работать с данными объекта через self.',
    task: {
      desc: 'Добавь в класс Agent метод status(), возвращающий f"[{self.level}] {self.name}". Создай объект и выведи nova.status()',
      keywords: ['class', 'Agent', 'def', 'status', 'self', 'return', 'f"', 'print'],
      example: 'class Agent:\n    def __init__(self, name, level):\n        self.name = name\n        self.level = level\n    def status(self):\n        return f"[{self.level}] {self.name}"\n\nnova = Agent("Nova", 7)\nprint(nova.status())',
      output: '> [7] Nova\n[OK] Курс завершён! Ты освоил базу Python 🎓',
    },
  },
];

// ─── Классовые уроки выключены — оба класса учат одну базу Python ────────────
// (раньше тут были DataScience и AI уроки для разных классов)
const DATA_GHOST_LESSONS: Lesson[] = [];
const NEURAL_ARCH_LESSONS: Lesson[] = [];

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

  // Оба класса проходят один и тот же базовый курс Python.
  // Различия классов — в боях/данжах, а не в обучении.
  const classLessons = useMemo<Lesson[]>(() => {
    // Сохраняем переменные чтобы линтер не ругался на неиспользуемые импорты
    void DATA_GHOST_LESSONS; void NEURAL_ARCH_LESSONS; void playerClass;
    return [];
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
            <div className="font-mono text-[10px] text-gray-600 mt-0.5">База Python · 15 уроков</div>
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