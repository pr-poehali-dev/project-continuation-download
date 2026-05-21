// ─── Карточки Python для режима Flashcards ──────────────────────────────────
// 7 колод по темам: basics, control, data, functions, oop, files, advanced

export type DeckId = 'basics' | 'control' | 'data' | 'functions' | 'oop' | 'files' | 'advanced';

export interface Card {
  id: string;
  term: string;
  meaning: string;
  example?: string;
  emoji: string;
  color: string;
  deck: DeckId;
  /** Сложность 1–3 для Spaced Repetition и Duel mode */
  difficulty: 1 | 2 | 3;
  /** Неправильные варианты для режима Duel */
  decoys: string[];
}

export interface Deck {
  id: DeckId;
  title: string;
  desc: string;
  color: string;
  icon: string;
  /** Минимальный уровень игрока для разблокировки */
  unlockLevel: number;
}

export const DECKS: Deck[] = [
  { id: 'basics',    title: 'Основы',           desc: 'Переменные, типы, print, input',     color: '#00ff41', icon: '📦', unlockLevel: 1 },
  { id: 'control',   title: 'Управление',       desc: 'if/else, циклы, операторы',          color: '#ffaa00', icon: '🔁', unlockLevel: 1 },
  { id: 'data',      title: 'Структуры данных', desc: 'Списки, словари, кортежи, set',       color: '#00aaff', icon: '🗂️', unlockLevel: 2 },
  { id: 'functions', title: 'Функции',          desc: 'def, return, args, lambda',          color: '#ff00ff', icon: '⚙️', unlockLevel: 3 },
  { id: 'oop',       title: 'ООП',              desc: 'class, self, наследование',          color: '#ff4060', icon: '🤖', unlockLevel: 4 },
  { id: 'files',     title: 'Файлы и I/O',      desc: 'open, with, json, модули',           color: '#00ddff', icon: '📁', unlockLevel: 5 },
  { id: 'advanced',  title: 'Продвинутое',      desc: 'Декораторы, генераторы, исключения', color: '#aa00ff', icon: '🧠', unlockLevel: 7 },
];

export const CARDS: Card[] = [
  // ─── BASICS (12) ────────────────────────────────────────────────
  { id: 'b1', deck: 'basics', term: 'print()', meaning: 'Выводит данные на экран', example: 'print("Привет")', emoji: '📢', color: '#00ff41', difficulty: 1, decoys: ['Читает ввод', 'Создаёт переменную', 'Удаляет файл'] },
  { id: 'b2', deck: 'basics', term: 'input()', meaning: 'Читает строку от пользователя', example: 'n = input("Имя: ")', emoji: '⌨️', color: '#00ff41', difficulty: 1, decoys: ['Выводит текст', 'Возвращает число', 'Открывает файл'] },
  { id: 'b3', deck: 'basics', term: 'int', meaning: 'Целое число (без точки)', example: 'age = 18', emoji: '🔢', color: '#00ff41', difficulty: 1, decoys: ['Дробное число', 'Текст', 'True/False'] },
  { id: 'b4', deck: 'basics', term: 'float', meaning: 'Дробное число (с точкой)', example: 'pi = 3.14', emoji: '🌊', color: '#00ff41', difficulty: 1, decoys: ['Целое число', 'Список', 'Логическое значение'] },
  { id: 'b5', deck: 'basics', term: 'str', meaning: 'Строка — текст в кавычках', example: 's = "hello"', emoji: '🔤', color: '#00ff41', difficulty: 1, decoys: ['Целое число', 'Логическое', 'Множество'] },
  { id: 'b6', deck: 'basics', term: 'bool', meaning: 'Правда или ложь: True / False', example: 'ok = True', emoji: '🚦', color: '#00ff41', difficulty: 1, decoys: ['Текст', 'Список', 'Число'] },
  { id: 'b7', deck: 'basics', term: 'f-строка', meaning: 'Строка со вставкой переменных через {}', example: 'f"Имя {name}"', emoji: '✨', color: '#00ff41', difficulty: 2, decoys: ['Срез строки', 'Метод upper()', 'Простая строка'] },
  { id: 'b8', deck: 'basics', term: 'переменная', meaning: 'Имя для хранения значения', example: 'name = "Nova"', emoji: '📦', color: '#00ff41', difficulty: 1, decoys: ['Функция', 'Класс', 'Цикл'] },
  { id: 'b9', deck: 'basics', term: 'None', meaning: 'Отсутствие значения', example: 'result = None', emoji: '⚫', color: '#00ff41', difficulty: 2, decoys: ['Ноль', 'Пустая строка', 'False'] },
  { id: 'b10', deck: 'basics', term: 'type()', meaning: 'Узнать тип значения', example: 'type(42) → int', emoji: '🔍', color: '#00ff41', difficulty: 2, decoys: ['Длина значения', 'Печать', 'Конвертация'] },
  { id: 'b11', deck: 'basics', term: 'int(x)', meaning: 'Преобразовать в целое число', example: 'int("42") → 42', emoji: '🔄', color: '#00ff41', difficulty: 2, decoys: ['В строку', 'В дробное', 'В список'] },
  { id: 'b12', deck: 'basics', term: '# комментарий', meaning: 'Текст для людей, игнорируется Python', example: '# todo: написать код', emoji: '💬', color: '#00ff41', difficulty: 1, decoys: ['Вывод текста', 'Документация функции', 'Тип переменной'] },

  // ─── CONTROL FLOW (14) ──────────────────────────────────────────
  { id: 'c1', deck: 'control', term: 'if', meaning: 'Если условие истинно — выполни код', example: 'if x > 0:', emoji: '❓', color: '#ffaa00', difficulty: 1, decoys: ['Цикл', 'Функция', 'Объявление переменной'] },
  { id: 'c2', deck: 'control', term: 'else', meaning: 'Иначе — другой код', example: 'else: ...', emoji: '↔️', color: '#ffaa00', difficulty: 1, decoys: ['Условие', 'Конец цикла', 'Создание класса'] },
  { id: 'c3', deck: 'control', term: 'elif', meaning: 'Иначе если — следующее условие', example: 'elif x == 0:', emoji: '🎚️', color: '#ffaa00', difficulty: 2, decoys: ['Цикл', 'Импорт', 'Возврат значения'] },
  { id: 'c4', deck: 'control', term: 'for', meaning: 'Повтори для каждого элемента', example: 'for i in range(5):', emoji: '🔄', color: '#ffaa00', difficulty: 1, decoys: ['Условие', 'Функция', 'Класс'] },
  { id: 'c5', deck: 'control', term: 'while', meaning: 'Повторяй пока условие верно', example: 'while hp > 0:', emoji: '⏱️', color: '#ffaa00', difficulty: 2, decoys: ['Если условие', 'Один раз', 'Функция'] },
  { id: 'c6', deck: 'control', term: 'range(n)', meaning: 'Последовательность 0..n-1', example: 'range(5) → 0,1,2,3,4', emoji: '📏', color: '#ffaa00', difficulty: 2, decoys: ['Длина списка', 'Сумма чисел', 'Случайное число'] },
  { id: 'c7', deck: 'control', term: 'break', meaning: 'Выйти из цикла досрочно', example: 'if x==7: break', emoji: '🛑', color: '#ffaa00', difficulty: 2, decoys: ['Пропустить шаг', 'Конец функции', 'Удалить элемент'] },
  { id: 'c8', deck: 'control', term: 'continue', meaning: 'Пропустить шаг, идти дальше', example: 'if x==3: continue', emoji: '⏩', color: '#ffaa00', difficulty: 2, decoys: ['Выйти из цикла', 'Завершить функцию', 'Бросить ошибку'] },
  { id: 'c9', deck: 'control', term: 'and', meaning: 'Оба условия должны быть True', example: 'x > 0 and x < 10', emoji: '➕', color: '#ffaa00', difficulty: 2, decoys: ['Хотя бы одно', 'Отрицание', 'Сравнение'] },
  { id: 'c10', deck: 'control', term: 'or', meaning: 'Хотя бы одно условие True', example: 'x == 0 or y == 0', emoji: '🔀', color: '#ffaa00', difficulty: 2, decoys: ['Оба условия', 'Отрицание', 'Сравнение'] },
  { id: 'c11', deck: 'control', term: 'not', meaning: 'Противоположное значение', example: 'not True → False', emoji: '🚫', color: '#ffaa00', difficulty: 2, decoys: ['Сравнение', 'Сложение', 'Объединение'] },
  { id: 'c12', deck: 'control', term: '==', meaning: 'Равно (сравнение)', example: 'if x == 5:', emoji: '⚖️', color: '#ffaa00', difficulty: 1, decoys: ['Присваивание', 'Не равно', 'Больше'] },
  { id: 'c13', deck: 'control', term: '!=', meaning: 'Не равно', example: 'if x != 0:', emoji: '❗', color: '#ffaa00', difficulty: 1, decoys: ['Равно', 'Меньше', 'Больше или равно'] },
  { id: 'c14', deck: 'control', term: '%', meaning: 'Остаток от деления', example: '7 % 2 → 1', emoji: '➗', color: '#ffaa00', difficulty: 2, decoys: ['Деление', 'Степень', 'Умножение'] },

  // ─── DATA STRUCTURES (12) ───────────────────────────────────────
  { id: 'd1', deck: 'data', term: 'list', meaning: 'Список — изменяемая упорядоченная коллекция', example: '[1, 2, 3]', emoji: '📋', color: '#00aaff', difficulty: 1, decoys: ['Словарь', 'Множество', 'Кортеж'] },
  { id: 'd2', deck: 'data', term: 'dict', meaning: 'Словарь — пары ключ:значение', example: '{"name": "Nova"}', emoji: '📖', color: '#00aaff', difficulty: 1, decoys: ['Список', 'Множество', 'Кортеж'] },
  { id: 'd3', deck: 'data', term: 'tuple', meaning: 'Кортеж — неизменяемый список', example: '(1, 2, 3)', emoji: '🔒', color: '#00aaff', difficulty: 2, decoys: ['Изменяемый список', 'Словарь', 'Строка'] },
  { id: 'd4', deck: 'data', term: 'set', meaning: 'Множество — без повторов и без порядка', example: '{1, 2, 3}', emoji: '🎯', color: '#00aaff', difficulty: 2, decoys: ['Список', 'Словарь', 'Кортеж'] },
  { id: 'd5', deck: 'data', term: 'append()', meaning: 'Добавить элемент в конец списка', example: 'lst.append(5)', emoji: '➕', color: '#00aaff', difficulty: 2, decoys: ['Удалить', 'Сортировать', 'Перевернуть'] },
  { id: 'd6', deck: 'data', term: 'len()', meaning: 'Длина коллекции', example: 'len([1,2,3]) → 3', emoji: '📏', color: '#00aaff', difficulty: 1, decoys: ['Тип', 'Сумма', 'Максимум'] },
  { id: 'd7', deck: 'data', term: 'index', meaning: 'Номер элемента, начиная с 0', example: 'lst[0] — первый', emoji: '🔢', color: '#00aaff', difficulty: 1, decoys: ['Длина', 'Тип', 'Значение'] },
  { id: 'd8', deck: 'data', term: 'in', meaning: 'Проверка наличия элемента', example: '"a" in lst', emoji: '🔍', color: '#00aaff', difficulty: 2, decoys: ['Добавление', 'Удаление', 'Преобразование'] },
  { id: 'd9', deck: 'data', term: '.items()', meaning: 'Перебор пар ключ-значение словаря', example: 'for k, v in d.items():', emoji: '🗝️', color: '#00aaff', difficulty: 2, decoys: ['Только ключи', 'Только значения', 'Длина словаря'] },
  { id: 'd10', deck: 'data', term: '.keys()', meaning: 'Все ключи словаря', example: 'd.keys()', emoji: '🔑', color: '#00aaff', difficulty: 2, decoys: ['Все значения', 'Все пары', 'Размер'] },
  { id: 'd11', deck: 'data', term: 'list comp', meaning: 'Создание списка в одну строку', example: '[x*2 for x in nums]', emoji: '⚡', color: '#00aaff', difficulty: 3, decoys: ['Функция', 'Цикл for', 'Генератор'] },
  { id: 'd12', deck: 'data', term: 'sorted()', meaning: 'Вернуть отсортированный список', example: 'sorted([3,1,2])', emoji: '📊', color: '#00aaff', difficulty: 2, decoys: ['Перевернуть', 'Длина', 'Сумма'] },

  // ─── FUNCTIONS (10) ─────────────────────────────────────────────
  { id: 'f1', deck: 'functions', term: 'def', meaning: 'Объявление функции', example: 'def greet(name):', emoji: '🛠️', color: '#ff00ff', difficulty: 1, decoys: ['Класс', 'Переменная', 'Импорт'] },
  { id: 'f2', deck: 'functions', term: 'return', meaning: 'Вернуть значение из функции', example: 'return x * 2', emoji: '↩️', color: '#ff00ff', difficulty: 1, decoys: ['Вывести на экран', 'Прервать цикл', 'Импорт модуля'] },
  { id: 'f3', deck: 'functions', term: 'параметр', meaning: 'Переменная функции (в объявлении)', example: 'def f(x, y):', emoji: '📥', color: '#ff00ff', difficulty: 2, decoys: ['Возвращаемое значение', 'Глобальная переменная', 'Имя функции'] },
  { id: 'f4', deck: 'functions', term: 'аргумент', meaning: 'Значение, передаваемое в функцию', example: 'f(10, 20)', emoji: '📤', color: '#ff00ff', difficulty: 2, decoys: ['Параметр', 'Возврат', 'Тело функции'] },
  { id: 'f5', deck: 'functions', term: 'дефолтный аргумент', meaning: 'Значение по умолчанию', example: 'def f(x=10):', emoji: '🎁', color: '#ff00ff', difficulty: 2, decoys: ['Обязательный аргумент', 'Возврат', 'Глобальная'] },
  { id: 'f6', deck: 'functions', term: '*args', meaning: 'Любое число позиционных аргументов', example: 'def f(*nums):', emoji: '📦', color: '#ff00ff', difficulty: 3, decoys: ['Один аргумент', 'Словарь', 'Возврат списка'] },
  { id: 'f7', deck: 'functions', term: '**kwargs', meaning: 'Любое число именованных аргументов', example: 'def f(**opts):', emoji: '🗃️', color: '#ff00ff', difficulty: 3, decoys: ['Позиционные', 'Список', 'Возврат словаря'] },
  { id: 'f8', deck: 'functions', term: 'lambda', meaning: 'Безымянная функция в одну строку', example: 'lambda x: x*2', emoji: '⚡', color: '#ff00ff', difficulty: 3, decoys: ['Класс', 'Цикл', 'Условие'] },
  { id: 'f9', deck: 'functions', term: 'map()', meaning: 'Применить функцию к каждому элементу', example: 'map(str, [1,2,3])', emoji: '🗺️', color: '#ff00ff', difficulty: 3, decoys: ['Фильтр', 'Сортировка', 'Сумма'] },
  { id: 'f10', deck: 'functions', term: 'filter()', meaning: 'Оставить только подходящие элементы', example: 'filter(lambda x: x>0, lst)', emoji: '🔍', color: '#ff00ff', difficulty: 3, decoys: ['Применить ко всем', 'Сумма', 'Сортировка'] },

  // ─── OOP (10) ───────────────────────────────────────────────────
  { id: 'o1', deck: 'oop', term: 'class', meaning: 'Шаблон для создания объектов', example: 'class Agent:', emoji: '🏗️', color: '#ff4060', difficulty: 1, decoys: ['Функция', 'Переменная', 'Цикл'] },
  { id: 'o2', deck: 'oop', term: '__init__', meaning: 'Конструктор — запускается при создании', example: 'def __init__(self):', emoji: '🚀', color: '#ff4060', difficulty: 2, decoys: ['Метод вывода', 'Деструктор', 'Сравнение'] },
  { id: 'o3', deck: 'oop', term: 'self', meaning: 'Сам объект — первый параметр методов', example: 'self.name = name', emoji: '👤', color: '#ff4060', difficulty: 2, decoys: ['Класс', 'Глобальная переменная', 'Возврат'] },
  { id: 'o4', deck: 'oop', term: 'метод', meaning: 'Функция внутри класса', example: 'def status(self):', emoji: '⚙️', color: '#ff4060', difficulty: 1, decoys: ['Переменная класса', 'Импорт', 'Конструктор'] },
  { id: 'o5', deck: 'oop', term: 'объект', meaning: 'Конкретный экземпляр класса', example: 'nova = Agent(...)', emoji: '🤖', color: '#ff4060', difficulty: 1, decoys: ['Класс', 'Функция', 'Модуль'] },
  { id: 'o6', deck: 'oop', term: 'атрибут', meaning: 'Свойство объекта', example: 'nova.name', emoji: '🏷️', color: '#ff4060', difficulty: 2, decoys: ['Метод', 'Класс', 'Функция'] },
  { id: 'o7', deck: 'oop', term: 'наследование', meaning: 'Класс получает поведение родителя', example: 'class B(A):', emoji: '🧬', color: '#ff4060', difficulty: 3, decoys: ['Композиция', 'Полиморфизм', 'Инкапсуляция'] },
  { id: 'o8', deck: 'oop', term: 'super()', meaning: 'Доступ к методам родительского класса', example: 'super().__init__()', emoji: '⬆️', color: '#ff4060', difficulty: 3, decoys: ['Доступ к ребёнку', 'Себя', 'Глобальную область'] },
  { id: 'o9', deck: 'oop', term: '@property', meaning: 'Метод, работающий как атрибут', example: '@property\\ndef hp(self):', emoji: '💎', color: '#ff4060', difficulty: 3, decoys: ['Декоратор класса', 'Статический метод', 'Конструктор'] },
  { id: 'o10', deck: 'oop', term: '__str__', meaning: 'Читаемое представление для print', example: 'def __str__(self):', emoji: '📝', color: '#ff4060', difficulty: 3, decoys: ['Конструктор', 'Сравнение', 'Длина'] },

  // ─── FILES & I/O (8) ────────────────────────────────────────────
  { id: 'fi1', deck: 'files', term: 'open()', meaning: 'Открыть файл для чтения/записи', example: 'open("data.txt")', emoji: '📂', color: '#00ddff', difficulty: 2, decoys: ['Закрыть файл', 'Создать переменную', 'Импорт'] },
  { id: 'fi2', deck: 'files', term: 'with', meaning: 'Контекст: автоматически закрыть ресурс', example: 'with open(f) as x:', emoji: '🤝', color: '#00ddff', difficulty: 2, decoys: ['Условие if', 'Цикл while', 'Класс'] },
  { id: 'fi3', deck: 'files', term: '.read()', meaning: 'Прочитать весь файл целиком', example: 'f.read()', emoji: '📖', color: '#00ddff', difficulty: 2, decoys: ['Записать', 'Закрыть', 'Открыть'] },
  { id: 'fi4', deck: 'files', term: '.write()', meaning: 'Записать строку в файл', example: 'f.write("text")', emoji: '✍️', color: '#00ddff', difficulty: 2, decoys: ['Прочитать', 'Удалить файл', 'Открыть'] },
  { id: 'fi5', deck: 'files', term: 'import', meaning: 'Подключить модуль', example: 'import math', emoji: '📦', color: '#00ddff', difficulty: 1, decoys: ['Создать класс', 'Объявить функцию', 'Экспорт'] },
  { id: 'fi6', deck: 'files', term: 'json.dump', meaning: 'Записать данные в JSON-файл', example: 'json.dump(data, f)', emoji: '💾', color: '#00ddff', difficulty: 3, decoys: ['Прочитать JSON', 'Конвертировать в строку', 'Удалить'] },
  { id: 'fi7', deck: 'files', term: 'json.load', meaning: 'Прочитать JSON-файл в данные', example: 'data = json.load(f)', emoji: '📥', color: '#00ddff', difficulty: 3, decoys: ['Записать JSON', 'В строку', 'Парсить URL'] },
  { id: 'fi8', deck: 'files', term: 'os.path', meaning: 'Работа с путями файлов', example: 'os.path.join("a","b")', emoji: '🛣️', color: '#00ddff', difficulty: 3, decoys: ['Время', 'Случайные числа', 'Регулярки'] },

  // ─── ADVANCED (8) ───────────────────────────────────────────────
  { id: 'a1', deck: 'advanced', term: 'try / except', meaning: 'Перехват ошибок', example: 'try: ... except:', emoji: '🛡️', color: '#aa00ff', difficulty: 2, decoys: ['Условие if', 'Цикл for', 'Класс'] },
  { id: 'a2', deck: 'advanced', term: 'raise', meaning: 'Выбросить ошибку вручную', example: 'raise ValueError(..)', emoji: '⚠️', color: '#aa00ff', difficulty: 3, decoys: ['Поймать ошибку', 'Игнорировать', 'Return'] },
  { id: 'a3', deck: 'advanced', term: 'finally', meaning: 'Выполнится всегда — даже при ошибке', example: 'try: .. finally:', emoji: '🔒', color: '#aa00ff', difficulty: 3, decoys: ['Только при ошибке', 'Только без ошибки', 'Один раз'] },
  { id: 'a4', deck: 'advanced', term: 'yield', meaning: 'Отдать значение и продолжить позже (генератор)', example: 'yield x', emoji: '🔄', color: '#aa00ff', difficulty: 3, decoys: ['Return', 'Print', 'Break'] },
  { id: 'a5', deck: 'advanced', term: 'декоратор', meaning: 'Функция, изменяющая другую функцию', example: '@log\\ndef f(): ...', emoji: '🎀', color: '#aa00ff', difficulty: 3, decoys: ['Класс', 'Импорт', 'Цикл'] },
  { id: 'a6', deck: 'advanced', term: 'генератор', meaning: 'Функция с yield — отдаёт по одному', example: 'def gen(): yield 1', emoji: '⚡', color: '#aa00ff', difficulty: 3, decoys: ['Lambda', 'Класс', 'Список'] },
  { id: 'a7', deck: 'advanced', term: 'isinstance()', meaning: 'Проверка типа объекта', example: 'isinstance(x, int)', emoji: '🔬', color: '#aa00ff', difficulty: 3, decoys: ['Длина', 'Тип в строку', 'Сравнение значений'] },
  { id: 'a8', deck: 'advanced', term: 'recursion', meaning: 'Функция вызывает сама себя', example: 'def f(n): f(n-1)', emoji: '♾️', color: '#aa00ff', difficulty: 3, decoys: ['Цикл while', 'Декоратор', 'Класс'] },
];

/** Получить случайные decoys (без повторов с правильным) */
export function getDuelOptions(card: Card): { text: string; correct: boolean }[] {
  const options = [
    { text: card.meaning, correct: true },
    ...card.decoys.slice(0, 3).map(d => ({ text: d, correct: false })),
  ];
  // shuffle
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}
