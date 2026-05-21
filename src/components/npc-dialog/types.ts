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

  // ─── VERA ─────────────────────────────────────────────────────
  {
    id: 'vera',
    name: 'VERA',
    title: 'Инженер The Archive',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    icon: '👩‍🔧',
    portrait: '👩‍🔧',
    location: 'Function Factory',
    desc: 'Главный инженер Archive. Знает каждый сервер и каждый протокол. Без неё Undernet не работает.',
    unlockLevel: 3,
    dialog: [
      {
        id: 'start',
        lines: [
          { speaker: 'npc', text: 'А, новенький. Ghost мне о тебе рассказывал. Говорил — толковый.' },
          { speaker: 'npc', text: 'Я VERA. Инженер. Пока остальные машут кодом как мечом — я строю мосты, по которым этот код бежит.' },
          { speaker: 'player', text: 'Чем ты занимаешься?' },
          { speaker: 'npc', text: 'Поддерживаю инфраструктуру. Сервера, прокси, шифрование. Если завтра NEXUS вырубит наш канал — это я подниму резервный за 3 минуты.' },
        ],
        choices: [
          { text: 'Расскажи про функции', nextId: 'about_functions' },
          { text: 'Как стать инженером?', nextId: 'how_engineer' },
          { text: 'Чем я могу помочь?', nextId: 'help' },
        ],
      },
      {
        id: 'about_functions',
        lines: [
          { speaker: 'npc', text: 'Функция — это контракт. Ты даёшь ей данные на вход — она обещает что-то вернуть. И всё.' },
          { speaker: 'npc', text: 'Хорошая функция делает ОДНО дело. Если у тебя в def на 50 строк — это не функция, это монолог. Разрежь.' },
          { speaker: 'player', text: 'А когда писать функции?' },
          { speaker: 'npc', text: 'Если копипастишь код второй раз — пора. Если третий — ты уже опоздала. То есть опоздал. // VERA не очень умеет в гендеры.' },
        ],
        choices: [
          { text: 'Понял. Пойду пробовать.', nextId: 'farewell', reward: { xp: 80 } },
          { text: 'Чем я могу помочь?', nextId: 'help' },
        ],
      },
      {
        id: 'how_engineer',
        lines: [
          { speaker: 'npc', text: 'Хочешь как я? Учись думать ленью. Лучший код — тот, который ты не написал.' },
          { speaker: 'npc', text: 'Изучи: функции, модули, файлы, исключения. Потом — try/except, with, декораторы. Это инструменты, без которых ты — кодер, но не инженер.' },
        ],
        choices: [
          { text: 'Дай мне задание', nextId: 'help' },
          { text: 'Я учусь.', nextId: 'farewell', reward: { xp: 60 } },
        ],
      },
      {
        id: 'help',
        lines: [
          { speaker: 'npc', text: 'Хорошо. Нужно перехватить сигнал на Function Factory. Пройди подземелье, выбей у NEXUS-инженера схему.' },
          { speaker: 'npc', text: 'Когда принесёшь — я научу тебя писать декораторы. Это контракты к контрактам. Метакод.' },
          { speaker: 'player', text: 'Звучит интересно. Я в деле.' },
        ],
        choices: [
          { text: 'Принято. Иду на задание.', nextId: 'farewell', reward: { xp: 150, creds: 75 } },
        ],
      },
      {
        id: 'farewell',
        lines: [{ speaker: 'npc', text: 'Удачи. И помни — `import this`. // VERA вернулась к консоли' }],
        end: true,
      },
    ],
  },

  // ─── ECHO ─────────────────────────────────────────────────────
  {
    id: 'echo',
    name: 'ECHO',
    title: 'Юный хакер',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    icon: '🎧',
    portrait: '🎧',
    location: 'Syntax Street',
    desc: 'Сирота из трущоб, попала к Archive в 14. Лучший аналитик данных в своём поколении. Считает Python первым языком, который её понял.',
    unlockLevel: 5,
    dialog: [
      {
        id: 'start',
        lines: [
          { speaker: 'npc', text: 'Эй! Тс-с, не так громко. Я тут отлаживаю один скрипт, NEXUS снифит трафик.' },
          { speaker: 'npc', text: 'Я ECHO. Аналитик. Те, кто старше — таскают пушки и пишут эксплойты. А я смотрю на данные и говорю им, КУДА стрелять.' },
        ],
        choices: [
          { text: 'Чем занимаешься?', nextId: 'what_do' },
          { text: 'Расскажи о данных', nextId: 'data_talk' },
          { text: 'Дай совет новичку', nextId: 'advice' },
        ],
      },
      {
        id: 'what_do',
        lines: [
          { speaker: 'npc', text: 'Анализирую перехваты NEXUS. Логины, маршруты дронов, расписания патрулей.' },
          { speaker: 'npc', text: 'Каждое число — кусок паззла. Сам по себе бесполезен. Но сложи 10000 — и увидишь как у корпорации болит спина.' },
          { speaker: 'player', text: 'Это python?' },
          { speaker: 'npc', text: 'Конечно. pandas, numpy, чуть-чуть matplotlib для отчётов. Если тебе нравятся данные — приходи учиться. Я не кусаюсь.' },
        ],
        choices: [
          { text: 'Может быть, позже.', nextId: 'farewell', reward: { xp: 50 } },
          { text: 'Расскажи про структуры данных', nextId: 'data_talk' },
        ],
      },
      {
        id: 'data_talk',
        lines: [
          { speaker: 'npc', text: 'Список — это коробка. Словарь — каталог. Множество — фильтр. Кортеж — печать.' },
          { speaker: 'npc', text: 'Запомни: выбираешь не "что красивее", а "что подходит задаче". Нужна скорость поиска — set. Связи ключ-значение — dict. Порядок и доступ по индексу — list.' },
          { speaker: 'player', text: 'А кортеж?' },
          { speaker: 'npc', text: 'Когда хочешь сказать: "это НЕ должно меняться". Например, координаты, RGB-цвет, ключи словаря.' },
        ],
        choices: [
          { text: 'Спасибо, ECHO!', nextId: 'farewell', reward: { xp: 100 } },
        ],
      },
      {
        id: 'advice',
        lines: [
          { speaker: 'npc', text: 'Совет? Окей, слушай. Никогда не пиши код, в котором не уверен. Если сомневаешься — открой repl, попробуй.' },
          { speaker: 'npc', text: 'Python прощает многое. NEXUS — не прощает ничего. Так что лучше ошибаться у себя на машине, чем в продакшене у The Archive.' },
        ],
        choices: [
          { text: 'Принято.', nextId: 'farewell', reward: { xp: 75 } },
        ],
      },
      {
        id: 'farewell',
        lines: [{ speaker: 'npc', text: 'Удачи. И береги свой стек. // ECHO в наушниках' }],
        end: true,
      },
    ],
  },

  // ─── SIGMA ────────────────────────────────────────────────────
  {
    id: 'sigma',
    name: 'SIGMA',
    title: 'Наёмница Black Syntax',
    faction: 'BLACK SYNTAX',
    factionColor: '#aa00ff',
    icon: '🕷️',
    portrait: '🕷️',
    location: 'Data Docks',
    desc: 'Лучшая наёмница Black Syntax. Не верит в идеалы — только в контракты и деньги. Уважает тех, кто пишет лаконичный код.',
    unlockLevel: 8,
    dialog: [
      {
        id: 'start',
        lines: [
          { speaker: 'npc', text: 'Стой. Ты пахнешь Archive — за версту чую. Расслабься, я не убиваю гостей. Это плохо для бизнеса.' },
          { speaker: 'npc', text: 'SIGMA. Black Syntax. Мне всё равно во что ты веришь — пока ты платишь и не предаёшь.' },
        ],
        choices: [
          { text: 'У вас есть контракты?', nextId: 'contracts' },
          { text: 'Что Black Syntax думает про Archive?', nextId: 'about_archive' },
          { text: 'Расскажи о boj-стиле кода', nextId: 'code_style' },
        ],
      },
      {
        id: 'contracts',
        lines: [
          { speaker: 'npc', text: 'Есть. Перехват грузового конвоя NEXUS. Награда — 200 Creds + дроп. Условия: тихо, быстро, без свидетелей.' },
          { speaker: 'npc', text: 'Можешь отказаться. Archive не одобрит, но Black Syntax платит лучше идеалов.' },
          { speaker: 'player', text: 'Я подумаю.' },
        ],
        choices: [
          { text: 'Беру контракт.', nextId: 'farewell', reward: { xp: 200, creds: 100 } },
          { text: 'Не сейчас.', nextId: 'about_archive' },
        ],
      },
      {
        id: 'about_archive',
        lines: [
          { speaker: 'npc', text: 'Archive? Романтики. Верят, что свобода кода = свобода всех. Наивно.' },
          { speaker: 'npc', text: 'Мы реалисты. Если NEXUS падёт — кто-то займёт их место. Лучше пусть это будем мы — те, кто умеет монетизировать хаос.' },
          { speaker: 'player', text: 'Жёстко.' },
          { speaker: 'npc', text: 'Жизнь жёстче. Но мы тоже не любим NEXUS — они монополисты, а монополии давят рынок. Так что иногда наши интересы совпадают.' },
        ],
        choices: [
          { text: 'Понял позицию.', nextId: 'farewell', reward: { xp: 80 } },
        ],
      },
      {
        id: 'code_style',
        lines: [
          { speaker: 'npc', text: 'Black Syntax уважает короткий код. Lambda, comprehensions, magic methods.' },
          { speaker: 'npc', text: 'Если задачу можно решить в одну строку — решай в одну. Длинный код — это лишний риск. NEXUS-сканеры читают паттерны: чем больше строк, тем выше шанс палева.' },
          { speaker: 'player', text: 'А читаемость?' },
          { speaker: 'npc', text: 'Читаемость для тех, кто планирует жить долго. У нас другая профессия.' },
        ],
        choices: [
          { text: 'Любопытная философия.', nextId: 'farewell', reward: { xp: 100 } },
        ],
      },
      {
        id: 'farewell',
        lines: [{ speaker: 'npc', text: 'Если передумаешь — найди меня здесь. Контракты не ждут. // SIGMA отключилась' }],
        end: true,
      },
    ],
  },

  // ─── BROTHER LAMBDA ───────────────────────────────────────────
  {
    id: 'brother_lambda',
    name: 'Брат Лямбда',
    title: 'Монах Order of Clean Code',
    faction: 'ORDER OF CLEAN CODE',
    factionColor: '#00aaff',
    icon: '🧘',
    portrait: '🧘',
    location: 'Temple of Clean Code',
    desc: 'Старейший монах Ордена. Верит, что Python — священный язык, ниспосланный людям. Категорически осуждает спагетти-код.',
    unlockLevel: 12,
    dialog: [
      {
        id: 'start',
        lines: [
          { speaker: 'npc', text: 'Мир тебе, путник. Ты вошёл в храм. Сними обувь, не сними — это иллюзия. Главное — сними плохие привычки.' },
          { speaker: 'npc', text: 'Я брат Лямбда. Учитель здесь. Учу одному: код должен быть прекрасен. Прекрасен — значит понятен. Понятен — значит правильный.' },
        ],
        choices: [
          { text: 'Что такое "чистый код"?', nextId: 'clean_code' },
          { text: 'Расскажи об ООП', nextId: 'oop_lecture' },
          { text: 'Дай мне испытание', nextId: 'trial' },
        ],
      },
      {
        id: 'clean_code',
        lines: [
          { speaker: 'npc', text: 'Чистый код — это код, который ты понимаешь через год. Без комментариев. Без объяснений.' },
          { speaker: 'npc', text: 'Имена переменных рассказывают историю. Функции делают одно дело. Классы инкапсулируют смысл. Это не правила — это путь.' },
          { speaker: 'player', text: 'А если код работает, но некрасив?' },
          { speaker: 'npc', text: 'Тогда он работает временно. Любой код, который ты не можешь прочесть — это бомба замедленного действия. И она взорвётся в самый неудобный момент.' },
        ],
        choices: [
          { text: 'Я понял путь.', nextId: 'farewell', reward: { xp: 120 } },
          { text: 'Расскажи об ООП', nextId: 'oop_lecture' },
        ],
      },
      {
        id: 'oop_lecture',
        lines: [
          { speaker: 'npc', text: 'ООП — это способ моделировать реальность. Объект — это сущность с состоянием и поведением.' },
          { speaker: 'npc', text: 'Четыре столпа: инкапсуляция, наследование, полиморфизм, абстракция. Каждый — урок. Каждый — путь.' },
          { speaker: 'player', text: 'А когда НЕ использовать ООП?' },
          { speaker: 'npc', text: 'Когда задача — это просто функция. Не каждая программа должна быть собором. Иногда хижины достаточно. // Брат Лямбда улыбается.' },
        ],
        choices: [
          { text: 'Мудро. Спасибо.', nextId: 'farewell', reward: { xp: 150 } },
        ],
      },
      {
        id: 'trial',
        lines: [
          { speaker: 'npc', text: 'Хорошо. Испытание простое: возьми любую свою функцию длиннее 20 строк. Разбей её на три меньших. Каждая — одно дело.' },
          { speaker: 'npc', text: 'Когда сделаешь — вернись. Я научу тебя @property и магическим методам. Это танец между формой и сутью.' },
        ],
        choices: [
          { text: 'Принимаю испытание.', nextId: 'farewell', reward: { xp: 200, creds: 50 } },
        ],
      },
      {
        id: 'farewell',
        lines: [{ speaker: 'npc', text: '`import this`. Дзен внутри. // Брат Лямбда возвращается к медитации' }],
        end: true,
      },
    ],
  },
];