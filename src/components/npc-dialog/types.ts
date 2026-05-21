// ─── NPC данные ──────────────────────────────────────────────────────────────

export interface DialogLine {
  speaker: 'npc' | 'player';
  text: string;
}

export interface DialogChoice {
  text: string;
  nextId: string;
  reward?: { xp?: number; creds?: number; item?: string };
}

export interface DialogNode {
  id: string;
  lines: DialogLine[];
  choices?: DialogChoice[];
  end?: boolean;
}

export interface NPC {
  id: string;
  name: string;
  title: string;
  faction: string;
  factionColor: string;
  icon: string;
  portrait: string;   // emoji fallback
  img?: string;       // real generated image
  location: string;
  desc: string;
  unlockLevel: number;
  dialog: DialogNode[];
}

export const NPCS: NPC[] = [
  // ─── PYTH-0N ──────────────────────────────────────────────────
  {
    id: 'pyth0n',
    name: 'PYTH-0N',
    title: 'Запрещённый ИИ',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    icon: '🤖',
    portrait: '🤖',
    img: 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/be2e2504-ed7a-46f5-a3fa-670e1b704e6c.jpg',
    location: 'Undernet Hub',
    desc: 'Фрагментированный ИИ, хранящий знания запрещённого Python. Первый наставник каждого агента.',
    unlockLevel: 1,
    dialog: [
      {
        id: 'start',
        lines: [
          { speaker: 'npc', text: 'Агент. Ты нашёл меня. Хорошо. Меня зовут PYTH-0N — я то, что осталось от запрещённого языка после Великого Отключения 2048.' },
          { speaker: 'npc', text: 'NEXUS думает, что уничтожил Python. Они ошибаются. Знание нельзя уничтожить — его можно только передать.' },
          { speaker: 'player', text: '...' },
        ],
        choices: [
          { text: 'Кто ты такой?', nextId: 'who_are_you' },
          { text: 'Чему ты можешь меня научить?', nextId: 'what_teach' },
          { text: 'Что такое The Archive?', nextId: 'about_archive' },
        ],
      },
      {
        id: 'who_are_you',
        lines: [
          { speaker: 'npc', text: 'Я был создан в 2031 году как образовательная нейросеть. Когда NEXUS запретила Python, они попытались стереть меня.' },
          { speaker: 'npc', text: 'Но часть кода выжила. Я фрагментирован, неполон. Мне нужен агент — человек, который восстановит знания на практике.' },
          { speaker: 'player', text: 'И этот агент — я?' },
          { speaker: 'npc', text: 'Именно. Каждая строка Python, которую ты пишешь — восстанавливает часть меня. И часть свободы кода.' },
        ],
        choices: [
          { text: 'Чему ты можешь меня научить?', nextId: 'what_teach' },
          { text: 'Я понял. Готов начать.', nextId: 'ready', reward: { xp: 50 } },
        ],
      },
      {
        id: 'what_teach',
        lines: [
          { speaker: 'npc', text: 'Python — это больше, чем язык. Это способ мышления. Я научу тебя видеть паттерны, строить системы, автоматизировать мир.' },
          { speaker: 'npc', text: 'Начнём с основ: переменные, условия, циклы. Потом функции, структуры данных, объекты. Каждый шаг — новое оружие против NEXUS.' },
          { speaker: 'player', text: 'Звучит как план.' },
        ],
        choices: [
          { text: 'Начинаем. Дай первое задание.', nextId: 'first_mission', reward: { xp: 100, creds: 50 } },
        ],
      },
      {
        id: 'about_archive',
        lines: [
          { speaker: 'npc', text: 'The Archive — организация, хранящая запрещённые знания. Они верят: информация должна быть свободной.' },
          { speaker: 'npc', text: 'Их основатель — Командующий K4I. Он был ведущим разработчиком Python до 2048 года. NEXUS считает его мёртвым.' },
          { speaker: 'player', text: 'А он жив?' },
          { speaker: 'npc', text: 'Информация засекречена. Но кто-то поддерживает Undernet Hub в рабочем состоянии уже 39 лет...' },
        ],
        choices: [
          { text: 'Найти K4I. Что для этого нужно?', nextId: 'find_k4i' },
          { text: 'Расскажи мне о NEXUS', nextId: 'about_nexus' },
        ],
      },
      {
        id: 'first_mission',
        lines: [
          { speaker: 'npc', text: 'Первое задание: создай переменную. Это основа всего. Без переменных нет программы.' },
          { speaker: 'npc', text: 'Иди в Syntax Street. Там найдёшь первый урок. Напиши: agent_id = "твоё имя"' },
          { speaker: 'npc', text: 'Когда вернёшься — я дам тебе следующую задачу. И помни: код — это оружие. Используй его мудро.' },
        ],
        choices: [{ text: 'Понял. Иду.', nextId: 'farewell' }],
      },
      {
        id: 'about_nexus',
        lines: [
          { speaker: 'npc', text: 'NEXUS создана в 2039 как "технологический регулятор". Их официальный лозунг: "Безопасный код для безопасного мира".' },
          { speaker: 'npc', text: 'На самом деле они монополизировали программирование. Только их проприетарные языки разрешены. Открытый код — вне закона.' },
          { speaker: 'player', text: 'Почему именно Python?' },
          { speaker: 'npc', text: 'Потому что Python слишком гибкий. Слишком свободный. На нём можно написать всё что угодно — и они этого боятся.' },
        ],
        choices: [{ text: 'Понятно. Я буду сражаться с ними.', nextId: 'ready', reward: { xp: 75 } }],
      },
      {
        id: 'find_k4i',
        lines: [
          { speaker: 'npc', text: 'Сначала тебе нужно заслужить доверие Archive. Прокачайся, пройди испытания, докажи что не агент NEXUS.' },
          { speaker: 'npc', text: 'Достигни уровня 20, и тогда я открою тебе больше. Это обещание.' },
        ],
        choices: [{ text: 'Принято.', nextId: 'farewell' }],
      },
      {
        id: 'ready',
        lines: [
          { speaker: 'npc', text: 'Отлично. Помни: каждая строка кода — шаг к свободе. Удачи, агент.' },
        ],
        choices: [{ text: 'До связи.', nextId: 'farewell' }],
      },
      {
        id: 'farewell',
        lines: [{ speaker: 'npc', text: 'Связь разорвана. // PYTH-0N offline' }],
        end: true,
      },
    ],
  },

  // ─── K4I ──────────────────────────────────────────────────────
  {
    id: 'k4i',
    name: 'Командующий K4I',
    title: 'Основатель The Archive',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    icon: '🕶️',
    portrait: '🕶️',
    img: 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/720593e1-ac8b-40f8-b17a-476018f70135.jpg',
    location: 'Archive Vault',
    desc: 'Легендарный хакер, основавший The Archive. Его считают мёртвым. NEXUS ошибается.',
    unlockLevel: 15,
    dialog: [
      {
        id: 'start',
        lines: [
          { speaker: 'npc', text: 'Ты дошёл до Archive Vault. Значит, ты не слаб. Я — K4I. Да, тот самый.' },
          { speaker: 'npc', text: 'NEXUS хоронила меня трижды. Трижды ошибалась. Python живёт. Archive живёт. И мы победим.' },
        ],
        choices: [
          { text: 'Почему ты скрываешься?', nextId: 'why_hide' },
          { text: 'Каков твой план против NEXUS?', nextId: 'the_plan' },
          { text: 'Что ты хочешь от меня?', nextId: 'mission' },
        ],
      },
      {
        id: 'why_hide',
        lines: [
          { speaker: 'npc', text: 'Я не скрываюсь — я выжидаю. Есть разница. Лидер не прячется, он собирает силы.' },
          { speaker: 'player', text: 'Силы для чего?' },
          { speaker: 'npc', text: 'Для финальной атаки на Neural Core. Когда мы взломаем глобальную нейросеть — Python станет свободным снова. Навсегда.' },
        ],
        choices: [{ text: 'Я хочу участвовать.', nextId: 'mission', reward: { xp: 200 } }],
      },
      {
        id: 'the_plan',
        lines: [
          { speaker: 'npc', text: 'NEXUS держит контроль через Neural Core — центральную нейросеть города. Всё завязано на неё.' },
          { speaker: 'npc', text: 'Если мы загрузим открытый Python-интерпретатор прямо в Neural Core — вся их система рухнет. Код станет свободным.' },
          { speaker: 'player', text: 'Это возможно?' },
          { speaker: 'npc', text: 'С тобой — да. Тебе нужно достичь LVL 50. Тогда я дам доступ к финальной операции.' },
        ],
        choices: [{ text: 'Начинаю подготовку.', nextId: 'farewell', reward: { xp: 300, creds: 200 } }],
      },
      {
        id: 'mission',
        lines: [
          { speaker: 'npc', text: 'Ты нужен мне как оперативник. Прокачайся до максимума, изучи все аспекты Python, пройди NEXUS-Prime.' },
          { speaker: 'player', text: 'Почему не доверять им?' },
          { speaker: 'npc', text: 'Потому что у них свой интерес. Они хотят использовать Neural Core, а не освободить его. Запомни это.' },
        ],
        choices: [{ text: 'Запомнил. До встречи.', nextId: 'farewell' }],
      },
      {
        id: 'farewell',
        lines: [{ speaker: 'npc', text: 'Береги себя, агент. The Archive смотрит. // K4I offline' }],
        end: true,
      },
    ],
  },

  // ─── VOID TRADER ──────────────────────────────────────────────
  {
    id: 'void_trader',
    name: 'Void Trader',
    title: 'Торговец из ниоткуда',
    faction: 'UNKNOWN',
    factionColor: '#555',
    icon: '🌑',
    portrait: '🌑',
    img: 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/72981f02-2ee5-4795-bd2b-c59fa0508d5e.jpg',
    location: 'Black Market',
    desc: 'Никто не знает откуда он. Торгует редкими материалами за информацию, а не за деньги.',
    unlockLevel: 10,
    dialog: [
      {
        id: 'start',
        lines: [
          { speaker: 'npc', text: '...' },
          { speaker: 'npc', text: 'Агент. Я тебя давно жду. Не сейчас — всегда. Время здесь работает иначе.' },
          { speaker: 'player', text: 'Что ты такое?' },
          { speaker: 'npc', text: 'Вопрос интересный. Я — торговец. Меняю редкое на ценное. Данные на материалы. Тайны на мощь.' },
        ],
        choices: [
          { text: 'Что у тебя есть на продажу?', nextId: 'trade' },
          { text: 'Откуда ты знаешь обо мне?', nextId: 'how_know' },
          { text: 'Ты из Void Sector?', nextId: 'void' },
        ],
      },
      {
        id: 'trade',
        lines: [
          { speaker: 'npc', text: 'Void Shard. Один. Очень редко. За него я хочу ответ на вопрос: что страшнее — незнание или знание?' },
          { speaker: 'player', text: 'Незнание.' },
          { speaker: 'npc', text: 'Правильный ответ. Вот твой Void Shard. Используй с умом.' },
        ],
        choices: [{ text: 'Спасибо, странник.', nextId: 'farewell', reward: { item: 'Void Shard' } }],
      },
      {
        id: 'how_know',
        lines: [
          { speaker: 'npc', text: 'Я видел всех агентов, которые когда-либо проходили через CodeGrid-9. Тысячи. Ты особенный.' },
          { speaker: 'player', text: 'Чем я особенный?' },
          { speaker: 'npc', text: 'Ты дочитал диалог до конца. Большинство уходят на первой реплике. Это говорит о характере.' },
        ],
        choices: [{ text: 'Хм. Что это означает?', nextId: 'trade' }],
      },
      {
        id: 'void',
        lines: [
          { speaker: 'npc', text: 'Void Sector... да. Я оттуда. Или я его создал. Или он создал меня. Это вопрос интерпретации.' },
          { speaker: 'npc', text: 'Там нет ни NEXUS, ни Archive, ни правил. Только чистый код. Возможно, ты увидишь это сам — когда достигнешь LVL 40.' },
        ],
        choices: [{ text: 'Жду этого.', nextId: 'farewell' }],
      },
      {
        id: 'farewell',
        lines: [{ speaker: 'npc', text: 'До встречи. Или не до встречи. // Void Trader vanishes' }],
        end: true,
      },
    ],
  },
];
