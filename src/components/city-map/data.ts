// ─── Корпорации (3 фракции с балансом сил) ───────────────────────────────────
export interface FactionMeta {
  id: string;
  name: string;
  short: string;
  color: string;
  emoji: string;
  motto: string;
  desc: string;
  rep_label: (rep: number) => string;
  rep_color: (rep: number) => string;
}

export const FACTIONS: FactionMeta[] = [
  {
    id: 'archive',
    name: 'THE ARCHIVE',
    short: 'Archive',
    color: '#00ff41',
    emoji: '📚',
    motto: '"Знания — это свобода"',
    desc: 'Подпольная академия. Учат Python, чтобы освободить город от NEXUS. Тебя сюда позвали с самого начала.',
    rep_label: r => r >= 1000 ? 'ГЕРОЙ' : r >= 500 ? 'Союзник' : r >= 100 ? 'Друг' : r > 0 ? 'Новобранец' : r < 0 ? 'Враг' : 'Нейтрал',
    rep_color: r => r >= 500 ? '#00ff41' : r > 0 ? '#88ff88' : r < 0 ? '#ff4060' : '#888',
  },
  {
    id: 'black_syntax',
    name: 'BLACK SYNTAX',
    short: 'Black Syntax',
    color: '#aa00ff',
    emoji: '🕶️',
    motto: '"Код решает всё"',
    desc: 'Хакерский синдикат. Прагматики: важны не идеалы, а результат. Платят за рейды и взломы.',
    rep_label: r => r >= 1000 ? 'ЛЕГЕНДА' : r >= 500 ? 'Свой' : r >= 100 ? 'Контакт' : r > 0 ? 'Знакомый' : r < 0 ? 'Цель' : 'Нейтрал',
    rep_color: r => r >= 500 ? '#aa00ff' : r > 0 ? '#cc88ff' : r < 0 ? '#ff4060' : '#888',
  },
  {
    id: 'order',
    name: 'ORDER OF CLEAN CODE',
    short: 'Order',
    color: '#00aaff',
    emoji: '⚖️',
    motto: '"Элегантность — путь"',
    desc: 'Секта чистого кода. Чтят паттерны и ООП. Помогают только тем, кто пишет красиво.',
    rep_label: r => r >= 1000 ? 'МАСТЕР' : r >= 500 ? 'Ученик' : r >= 100 ? 'Новиций' : r > 0 ? 'Адепт' : r < 0 ? 'Еретик' : 'Нейтрал',
    rep_color: r => r >= 500 ? '#00aaff' : r > 0 ? '#88ccff' : r < 0 ? '#ff4060' : '#888',
  },
];

export const FACTION_BY_NAME: Record<string, string> = {
  'THE ARCHIVE': 'archive',
  'BLACK SYNTAX': 'black_syntax',
  'ORDER OF CLEAN CODE': 'order',
};

// ─── Типы ────────────────────────────────────────────────────────────────────

export interface District {
  id: string;
  name: string;
  subtitle: string;
  faction: string;
  factionColor: string;
  type: 'safe' | 'learning' | 'battle' | 'dungeon' | 'boss' | 'hidden';
  unlockLevel: number;
  lore: string;
  rewards: string;
  section?: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

// ─── Районы города CodeGrid-9 ────────────────────────────────────────────────
// Карта 1800×1300px — упорядоченная сетка 6 колонок × 5 рядов.
// Размер ячейки 220×160 с зазором 40-60px между блоками (зазоры зашиты в координаты).
// COL: 60, 320, 580, 840, 1100, 1360, 1620 (шаг 260)
// ROW: 80, 290, 500, 710, 920, 1100 (шаг 210)

export const DISTRICTS: District[] = [
  // ═══ РЯД 0 (LVL 30+) — БОССЫ И ЗАСЕКРЕЧЕННОЕ ═══════════════════
  {
    id: 'void_sector',
    name: 'Void Sector',
    subtitle: '??? · АКТ IV',
    faction: '???',
    factionColor: '#555',
    type: 'hidden',
    unlockLevel: 40,
    lore: 'Засекреченный сектор. Сигнал идёт из ниоткуда. Даже The Archive не знает что там.',
    rewards: '???',
    section: undefined,
    x: 320, y: 80, w: 220, h: 160,
  },
  {
    id: 'nexus_prime',
    name: 'NEXUS-Prime Tower',
    subtitle: 'Штаб-квартира NEXUS',
    faction: 'NEXUS',
    factionColor: '#ff4060',
    type: 'boss',
    unlockLevel: 30,
    lore: 'Сердце корпорации. Финальный данж Акта III. Здесь хранится ключ от глобальной нейросети CodeGrid-9.',
    rewards: '+3000 XP · 2000 Creds · Mythic Item',
    section: 'dungeon',
    x: 840, y: 80, w: 220, h: 160,
  },
  {
    id: 'neural_core',
    name: 'Neural Core',
    subtitle: 'Глобальная нейросеть',
    faction: 'СИСТЕМА',
    factionColor: '#ffff00',
    type: 'hidden',
    unlockLevel: 50,
    lore: 'АКТ IV — Перезагрузка. Контроль над нейросетью изменит CodeGrid-9 и весь мир навсегда.',
    rewards: 'Финал игры · True Ending',
    section: undefined,
    x: 1360, y: 80, w: 220, h: 160,
  },

  // ═══ РЯД 1 (LVL 15+) — ДАЛЬНИЙ ПОЯС ════════════════════════════
  {
    id: 'nexus_beta',
    name: 'NEXUS-Beta Zone',
    subtitle: 'Корпоративный квартал',
    faction: 'NEXUS',
    factionColor: '#ff4060',
    type: 'dungeon',
    unlockLevel: 15,
    lore: 'Крупные офисы NEXUS. Усиленная охрана с алгоритмической проверкой. Знание циклов и функций обязательно.',
    rewards: '+500 XP · 350 Creds · Neon Core',
    section: 'dungeon',
    x: 60, y: 290, w: 220, h: 160,
  },
  {
    id: 'nexus_alpha',
    name: 'NEXUS-Alpha Zone',
    subtitle: 'Корпоративный патруль',
    faction: 'NEXUS',
    factionColor: '#ff4060',
    type: 'dungeon',
    unlockLevel: 5,
    lore: 'Первый корпоративный сектор NEXUS. Дроны патрулируют периметр и проверяют знание базового синтаксиса.',
    rewards: '+200 XP · 150 Creds · Glitch Box',
    section: 'dungeon',
    x: 320, y: 290, w: 220, h: 160,
  },
  {
    id: 'archive_vault',
    name: 'Archive Vault',
    subtitle: 'Хранилище знаний',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    type: 'dungeon',
    unlockLevel: 15,
    lore: 'Секретное хранилище The Archive. Только лучшие агенты допускаются к знаниям уровня Ω.',
    rewards: '+1200 XP · 800 Creds · Void Relic',
    section: 'dungeon',
    x: 1100, y: 290, w: 220, h: 160,
  },
  {
    id: 'archive_arena',
    name: 'Archive Arena',
    subtitle: 'Турнир кодеров',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    type: 'battle',
    unlockLevel: 5,
    lore: 'Сезонный рейтинг агентов. Здесь сравнивают чистоту кода, скорость и доминирование над NEXUS.',
    rewards: 'Рейтинг · Сезонные награды',
    section: 'leaderboard',
    x: 1360, y: 290, w: 220, h: 160,
  },
  {
    id: 'memory_cache',
    name: 'Memory Cache',
    subtitle: 'Карточки и повторение',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    type: 'learning',
    unlockLevel: 1,
    lore: 'Нейроинтерфейс для быстрого запоминания терминов Python. 4 режима: классика, на время, дуэль и spaced repetition.',
    rewards: '+10–20 XP за карту · 7 колод',
    section: 'flashcards',
    x: 580, y: 290, w: 220, h: 160,
  },
  {
    id: 'loop_arena',
    name: 'Loop Arena',
    subtitle: 'Тренировочный данж',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    type: 'battle',
    unlockLevel: 2,
    lore: 'Тренировочная арена для Code Combat. Базовые дроны NEXUS — идеальные противники для новичков.',
    rewards: '+150–400 XP · 80–200 Creds',
    section: 'battle',
    x: 840, y: 290, w: 220, h: 160,
  },

  // ═══ РЯД 2 (LVL 1-8) — ЦЕНТР, ХАБ ══════════════════════════════
  {
    id: 'syntax_street',
    name: 'Syntax Street',
    subtitle: 'Учебный квартал',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    type: 'learning',
    unlockLevel: 1,
    lore: 'Уличные академии нетраннеров. Здесь учат базовому Python: переменные, условия, циклы. Первая остановка каждого агента.',
    rewards: '+100–200 XP · Уроки АКТ I',
    section: 'lessons',
    x: 60, y: 500, w: 220, h: 160,
  },
  {
    id: 'function_factory',
    name: 'Function Factory',
    subtitle: 'Лаборатория функций',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    type: 'learning',
    unlockLevel: 5,
    lore: 'Заброшенный завод, перестроенный под лабораторию функций и модулей. The Archive проводит здесь продвинутые курсы.',
    rewards: '+300 XP · Уроки АКТ II',
    section: 'lessons',
    x: 320, y: 500, w: 220, h: 160,
  },
  {
    id: 'undernet_hub',
    name: 'Undernet Hub',
    subtitle: 'База The Archive',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    type: 'safe',
    unlockLevel: 1,
    lore: 'Штаб сопротивления в CodeGrid-9. Безопасная зона — NEXUS сюда не добирается. Отсюда начинается путь каждого агента. Здесь живут NPC и хранятся квесты.',
    rewards: 'NPC · Квесты · Достижения',
    section: 'npc',
    x: 580, y: 500, w: 220, h: 160,
  },
  {
    id: 'block_atelier',
    name: 'Block Atelier',
    subtitle: 'Конструктор кода',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    type: 'learning',
    unlockLevel: 2,
    lore: 'Мастерская, где код собирают из готовых блоков. Идеально для первых программ без печати на клавиатуре.',
    rewards: '+50–100 XP за сборку',
    section: 'builder',
    x: 840, y: 500, w: 220, h: 160,
  },
  {
    id: 'order_temple',
    name: 'Temple of Clean Code',
    subtitle: 'Святилище Order',
    faction: 'ORDER OF CLEAN CODE',
    factionColor: '#00aaff',
    type: 'learning',
    unlockLevel: 8,
    lore: 'Сакральное место Order of the Clean Code. Здесь почитают ООП, паттерны и элегантную архитектуру кода.',
    rewards: '+350–500 XP · Уроки АКТ III',
    section: 'lessons',
    x: 1100, y: 500, w: 220, h: 160,
  },
  {
    id: 'engineers_bay',
    name: 'Engineers Bay',
    subtitle: 'Мастерская функций',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    type: 'learning',
    unlockLevel: 6,
    lore: 'Лаборатория VERA. Здесь агенты пишут функции, которые превращаются в импланты — постоянные бонусы к статам.',
    rewards: 'Импланты · Постоянные бонусы',
    section: 'workshop',
    x: 1360, y: 500, w: 220, h: 160,
  },

  // ═══ РЯД 3 (LVL 1-7) — ТОРГОВЫЙ ПОЯС ═══════════════════════════
  {
    id: 'crafting_lab',
    name: 'Crafting Lab',
    subtitle: 'Алхимия материалов',
    faction: 'BLACK SYNTAX',
    factionColor: '#aa00ff',
    type: 'safe',
    unlockLevel: 5,
    lore: 'Подпольная мастерская крафта. Из обломков NEXUS-дронов и обрывков кода собирают редкие предметы.',
    rewards: 'Уникальная экипировка',
    section: 'crafting',
    x: 60, y: 710, w: 220, h: 160,
  },
  {
    id: 'black_market',
    name: 'Black Market',
    subtitle: 'Нелегальная торговля',
    faction: 'BLACK SYNTAX',
    factionColor: '#aa00ff',
    type: 'safe',
    unlockLevel: 1,
    lore: 'Подпольный рынок имплантов, лутбоксов и запрещённых данных. Продавцы не задают вопросов.',
    rewards: 'Glitch Box · Neon Core · Void Relic',
    section: 'shop',
    x: 580, y: 710, w: 220, h: 160,
  },
  {
    id: 'story_lounge',
    name: 'Story Lounge',
    subtitle: 'Код-Сториз',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    type: 'learning',
    unlockLevel: 3,
    lore: 'Подпольный кинотеатр, где Python показывают через короткие истории и интерактивные диалоги.',
    rewards: '+80–150 XP · Лор',
    section: 'stories',
    x: 840, y: 710, w: 220, h: 160,
  },
  {
    id: 'data_docks',
    name: 'Data Docks',
    subtitle: 'Порт данных',
    faction: 'BLACK SYNTAX',
    factionColor: '#aa00ff',
    type: 'battle',
    unlockLevel: 7,
    lore: 'Подпольный порт для передачи запрещённых данных. Black Syntax нанимает агентов для рейдов против NEXUS-конвоев.',
    rewards: '+400 XP · 200 Creds',
    section: 'battle',
    x: 1100, y: 710, w: 220, h: 160,
  },
  {
    id: 'syntax_colosseum',
    name: 'Syntax Colosseum',
    subtitle: 'Арена рейтинга',
    faction: 'NEXUS',
    factionColor: '#ff4060',
    type: 'battle',
    unlockLevel: 10,
    lore: 'NEXUS устраивает публичные кодовые турниры для контроля населения. The Archive использует это как прикрытие.',
    rewards: 'Рейтинг · Сезонные награды',
    section: 'leaderboard',
    x: 1360, y: 710, w: 220, h: 160,
  },

  // ═══ РЯД 4 (LVL 15-25) — ТРУЩОБЫ И ФРОНТ ═══════════════════════
  {
    id: 'syntax_slums',
    name: 'Syntax Slums',
    subtitle: 'Трущобы нетраннеров',
    faction: 'BLACK SYNTAX',
    factionColor: '#aa00ff',
    type: 'battle',
    unlockLevel: 18,
    lore: 'Опасные кварталы под контролем Black Syntax. Высокая прибыль, высокий риск.',
    rewards: '+600 XP · 400 Creds',
    section: 'battle',
    x: 320, y: 920, w: 220, h: 160,
  },
  {
    id: 'server_farm',
    name: 'Server Farm Omega',
    subtitle: 'Серверный кластер',
    faction: 'NEXUS',
    factionColor: '#ff4060',
    type: 'battle',
    unlockLevel: 20,
    lore: 'Центральный узел обработки данных NEXUS. Охраняется элитными ИИ-агентами класса Sentinel.',
    rewards: '+800 XP · 500 Creds · Rare Drop',
    section: 'battle',
    x: 1100, y: 920, w: 220, h: 160,
  },
];

// ─── Соединения между районами ───────────────────────────────────────────────

export const CONNECTIONS = [
  // ── Хаб и соседи (горизонталь) ─────────────────────────────────
  ['undernet_hub', 'function_factory'],
  ['undernet_hub', 'block_atelier'],
  ['function_factory', 'syntax_street'],
  ['block_atelier', 'order_temple'],
  ['order_temple', 'engineers_bay'],

  // ── Хаб → север (карты/уроки/бои) ──────────────────────────────
  ['undernet_hub', 'memory_cache'],
  ['memory_cache', 'loop_arena'],
  ['memory_cache', 'nexus_alpha'],
  ['loop_arena', 'archive_vault'],
  ['archive_vault', 'archive_arena'],
  ['nexus_alpha', 'nexus_beta'],

  // ── Хаб → юг (магазин/сториз) ──────────────────────────────────
  ['undernet_hub', 'black_market'],
  ['black_market', 'story_lounge'],
  ['black_market', 'crafting_lab'],
  ['story_lounge', 'data_docks'],
  ['data_docks', 'syntax_colosseum'],

  // ── Глубокий юг — фронтовые бои ────────────────────────────────
  ['crafting_lab', 'syntax_slums'],
  ['syntax_slums', 'data_docks'],
  ['data_docks', 'server_farm'],

  // ── К боссам и засекреченному ──────────────────────────────────
  ['nexus_beta', 'void_sector'],
  ['nexus_alpha', 'nexus_prime'],
  ['archive_arena', 'neural_core'],
  ['nexus_prime', 'neural_core'],
];

// ─── Иконки типов ────────────────────────────────────────────────────────────

export const TYPE_META: Record<District['type'], { icon: string; label: string; color: string }> = {
  safe:     { icon: '🏠', label: 'Безопасная зона',  color: '#00ff41' },
  learning: { icon: '📡', label: 'Обучение',          color: '#00aaff' },
  battle:   { icon: '⚔️', label: 'Бой',              color: '#ff00ff' },
  dungeon:  { icon: '🏰', label: 'Подземелье',        color: '#ffaa00' },
  boss:     { icon: '💀', label: 'Босс',              color: '#ff4060' },
  hidden:   { icon: '❓', label: 'Засекречено',       color: '#444' },
};

// ─── Центры блоков ───────────────────────────────────────────────────────────

export function center(d: District) {
  return { cx: d.x + d.w / 2, cy: d.y + d.h / 2 };
}

export function getConnection(a: District, b: District) {
  const ca = center(a);
  const cb = center(b);
  return { x1: ca.cx, y1: ca.cy, x2: cb.cx, y2: cb.cy };
}