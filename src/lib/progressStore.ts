/**
 * progressStore — хранилище игрового прогресса.
 *
 * Архитектура:
 *  - КАЖДЫЙ пользователь имеет свой собственный прогресс (ключ зависит от username).
 *  - localStorage играет роль КЕША — данные пишутся туда мгновенно.
 *  - При логине прогресс ПОДТЯГИВАЕТСЯ из БД (progress_sync.extra) — синхронизация.
 *  - При важных событиях (бой/урок/крафт/...) сохраняется в БД через api.progressSave.
 *  - Это позволяет открыть игру на другом устройстве и продолжить с того же места.
 *
 * Источник правды — БД. localStorage только для скорости и offline.
 */

import { userKey } from './userStorage';

// Динамический ключ для текущего пользователя.
// У каждого аккаунта свой собственный прогресс.
function storageKey(): string {
  return userKey('progress_v1');
}

export interface ProgressState {
  lessonsCompleted: number[];    // id пройденных уроков
  battlesWon: number;            // всего побед в боях
  battlesStreak: number;         // текущая серия побед
  battlesStreakBest: number;     // лучшая серия
  dungeonsCompleted: string[];   // id пройденных данжей
  dungeonsScores: Record<string, number>; // лучший % для данжа
  npcsSpoken: string[];          // id NPC с кем говорил
  itemsCrafted: number;
  lootboxesOpened: number;
  shopBuys: number;
  dailyDate: string;             // дата последнего сброса daily
  dailyLessons: number;          // уроков сегодня
  dailyBattles: number;          // боёв сегодня
  dailyDungeons: number;         // данжей сегодня
  questObjectives: Record<string, boolean[]>; // вручную отмеченные галочки
  totalXpEarned: number;
  sessionsCount: number;
  // ─── Новые режимы обучения ───
  flashcardsLearned: string[];        // id освоенных карточек
  storiesCompleted: string[];         // id пройденных историй
  buildersSolved: string[];           // id решённых задач конструктора
  implantsCrafted: string[];          // id собранных имплантов
  implantsEquipped: string[];         // активные импланты (макс 3)
}

const DEFAULT: ProgressState = {
  lessonsCompleted: [],
  battlesWon: 0,
  battlesStreak: 0,
  battlesStreakBest: 0,
  dungeonsCompleted: [],
  dungeonsScores: {},
  npcsSpoken: [],
  itemsCrafted: 0,
  lootboxesOpened: 0,
  shopBuys: 0,
  dailyDate: '',
  dailyLessons: 0,
  dailyBattles: 0,
  dailyDungeons: 0,
  questObjectives: {},
  totalXpEarned: 0,
  sessionsCount: 0,
  flashcardsLearned: [],
  storiesCompleted: [],
  buildersSolved: [],
  implantsCrafted: [],
  implantsEquipped: [],
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return { ...DEFAULT };
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return { ...DEFAULT, ...parsed };
  } catch {
    return { ...DEFAULT };
  }
}

function save(state: ProgressState) {
  localStorage.setItem(storageKey(), JSON.stringify(state));
}

// ─── Синхронизация с БД ───────────────────────────────────────────────────
// Дебаунс — не дёргаем API при каждом изменении, копим пачкой.
let _syncTimer: ReturnType<typeof setTimeout> | null = null;
let _syncPending = false;

/** Запланировать запись на сервер (дебаунс 1.5с). */
function scheduleServerSync() {
  _syncPending = true;
  if (_syncTimer) clearTimeout(_syncTimer);
  _syncTimer = setTimeout(() => {
    _syncTimer = null;
    flushToServer();
  }, 1500);
}

async function flushToServer() {
  if (!_syncPending) return;
  _syncPending = false;
  const s = load();
  // Берём только то, чего нет в основных таблицах БД.
  // Lessons/battles/dungeons — уже в БД через свои endpoints.
  const entries = {
    stories_completed:    { ids: s.storiesCompleted },
    builders_solved:      { ids: s.buildersSolved },
    implants_crafted:     { ids: s.implantsCrafted },
    implants_equipped:    { ids: s.implantsEquipped },
    flashcards_learned:   { ids: s.flashcardsLearned },
    npcs_spoken:          { ids: s.npcsSpoken },
    quest_objectives:     s.questObjectives,
    counters: {
      items_crafted:   s.itemsCrafted,
      lootboxes_opened: s.lootboxesOpened,
      shop_buys:       s.shopBuys,
      total_xp_earned: s.totalXpEarned,
      sessions_count:  s.sessionsCount,
    },
  };
  try {
    // Динамический импорт чтобы не было циклической зависимости с api.ts
    const { api } = await import('./api');
    await api.progressSave?.(entries);
  } catch {
    // Не критично — данные останутся в localStorage и отправятся в следующий раз
  }
}

/** Принудительно сохранить прогресс на сервере (например перед logout). */
export async function flushProgressNow() {
  if (_syncTimer) { clearTimeout(_syncTimer); _syncTimer = null; }
  await flushToServer();
}

function resetDailyIfNeeded(state: ProgressState): ProgressState {
  if (state.dailyDate !== today()) {
    return { ...state, dailyDate: today(), dailyLessons: 0, dailyBattles: 0, dailyDungeons: 0 };
  }
  return state;
}

// ─── Кэш снапшота для useSyncExternalStore ───
// Должен возвращать одинаковую ссылку до тех пор, пока не вызван _emit().
let _cachedSnapshot: ProgressState | null = null;
function getSnapshot(): ProgressState {
  if (!_cachedSnapshot) _cachedSnapshot = resetDailyIfNeeded(load());
  return _cachedSnapshot;
}
function invalidateSnapshot() {
  _cachedSnapshot = null;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export const progress = {
  get(): ProgressState {
    return getSnapshot();
  },

  recordLessonComplete(lessonId: number) {
    const s = resetDailyIfNeeded(load());
    if (!s.lessonsCompleted.includes(lessonId)) {
      s.lessonsCompleted.push(lessonId);
    }
    s.dailyLessons++;
    save(s);
    _emit();
  },

  recordBattleWin() {
    const s = resetDailyIfNeeded(load());
    s.battlesWon++;
    s.battlesStreak++;
    if (s.battlesStreak > s.battlesStreakBest) s.battlesStreakBest = s.battlesStreak;
    s.dailyBattles++;
    save(s);
    _emit();
  },

  recordBattleLoss() {
    const s = resetDailyIfNeeded(load());
    s.battlesStreak = 0;
    save(s);
    _emit();
  },

  recordDungeonComplete(dungeonId: string, scorePct: number) {
    const s = resetDailyIfNeeded(load());
    if (!s.dungeonsCompleted.includes(dungeonId)) {
      s.dungeonsCompleted.push(dungeonId);
    }
    s.dungeonsScores[dungeonId] = Math.max(s.dungeonsScores[dungeonId] ?? 0, scorePct);
    s.dailyDungeons++;
    save(s);
    _emit();
  },

  recordNpcSpoken(npcId: string) {
    const s = load();
    if (!s.npcsSpoken.includes(npcId)) {
      s.npcsSpoken.push(npcId);
      save(s);
      _emit();
    }
  },

  recordCraft() {
    const s = load();
    s.itemsCrafted++;
    save(s);
    _emit();
  },

  recordLootbox() {
    const s = load();
    s.lootboxesOpened++;
    save(s);
    _emit();
  },

  recordShopBuy() {
    const s = load();
    s.shopBuys++;
    save(s);
    _emit();
  },

  recordXp(amount: number) {
    const s = load();
    s.totalXpEarned += amount;
    save(s);
    _emit();
  },

  recordSession() {
    const s = load();
    s.sessionsCount++;
    save(s);
  },

  // ─── Новые режимы обучения ───
  recordFlashcardLearned(cardId: string) {
    const s = load();
    if (!s.flashcardsLearned.includes(cardId)) {
      s.flashcardsLearned.push(cardId);
      save(s);
      _emit();
    }
  },

  resetFlashcards(deckIds?: string[]) {
    const s = load();
    if (!deckIds) s.flashcardsLearned = [];
    else s.flashcardsLearned = s.flashcardsLearned.filter(id => !deckIds.some(d => id.startsWith(d)));
    save(s);
    _emit();
  },

  recordStoryComplete(storyId: string) {
    const s = load();
    if (!s.storiesCompleted.includes(storyId)) {
      s.storiesCompleted.push(storyId);
      save(s);
      _emit();
    }
  },

  recordBuilderSolved(puzzleId: string) {
    const s = load();
    if (!s.buildersSolved.includes(puzzleId)) {
      s.buildersSolved.push(puzzleId);
      save(s);
      _emit();
    }
  },

  recordImplantCrafted(implantId: string) {
    const s = load();
    if (!s.implantsCrafted.includes(implantId)) {
      s.implantsCrafted.push(implantId);
      save(s);
      _emit();
    }
  },

  toggleImplantEquipped(implantId: string, maxSlots = 3): { ok: boolean; reason?: string } {
    const s = load();
    const equipped = new Set(s.implantsEquipped);
    if (equipped.has(implantId)) {
      equipped.delete(implantId);
    } else {
      if (equipped.size >= maxSlots) {
        return { ok: false, reason: `Заняты все ${maxSlots} слота. Сначала сними имплант.` };
      }
      equipped.add(implantId);
    }
    s.implantsEquipped = Array.from(equipped);
    save(s);
    _emit();
    return { ok: true };
  },

  setQuestObjective(questId: string, idx: number, done: boolean) {
    const s = load();
    if (!s.questObjectives[questId]) s.questObjectives[questId] = [];
    s.questObjectives[questId][idx] = done;
    save(s);
    _emit();
  },

  getQuestObjective(questId: string, idx: number): boolean {
    const s = load();
    return s.questObjectives[questId]?.[idx] ?? false;
  },

  /** Подтянуть прогресс с сервера и смержить с локальным. БД — источник правды. */
  mergeFromServer(server: {
    lessons_completed?: number[];
    battles_won?: number;
    battles_streak_best?: number;
    dungeons_completed?: string[];
    dungeons_scores?: Record<string, number>;
    extra?: Record<string, unknown>;
  }) {
    const s = load();

    // Базовые системы — БЕРЁМ ИЗ БД (с лимитом по локальному значению на случай если БД пуста)
    if (Array.isArray(server.lessons_completed)) {
      const lessons = new Set<number>([...s.lessonsCompleted, ...server.lessons_completed]);
      s.lessonsCompleted = Array.from(lessons);
    }
    if (Array.isArray(server.dungeons_completed)) {
      const dungeons = new Set<string>([...s.dungeonsCompleted, ...server.dungeons_completed]);
      s.dungeonsCompleted = Array.from(dungeons);
    }
    if (server.dungeons_scores) {
      const scores = { ...s.dungeonsScores };
      for (const [d, sc] of Object.entries(server.dungeons_scores)) {
        scores[d] = Math.max(scores[d] ?? 0, sc);
      }
      s.dungeonsScores = scores;
    }
    if (typeof server.battles_won === 'number') {
      s.battlesWon = Math.max(s.battlesWon, server.battles_won);
    }
    if (typeof server.battles_streak_best === 'number') {
      s.battlesStreakBest = Math.max(s.battlesStreakBest, server.battles_streak_best);
    }

    // Расширенный прогресс из player_progress (универсальная таблица)
    const extra = server.extra || {};
    const getIds = (k: string): string[] => {
      const v = extra[k] as { ids?: string[] } | undefined;
      return Array.isArray(v?.ids) ? v.ids : [];
    };
    if (extra['stories_completed']) {
      s.storiesCompleted = Array.from(new Set([...s.storiesCompleted, ...getIds('stories_completed')]));
    }
    if (extra['builders_solved']) {
      s.buildersSolved = Array.from(new Set([...s.buildersSolved, ...getIds('builders_solved')]));
    }
    if (extra['implants_crafted']) {
      s.implantsCrafted = Array.from(new Set([...s.implantsCrafted, ...getIds('implants_crafted')]));
    }
    if (extra['implants_equipped']) {
      // Equipped — берём с сервера как авторитетный источник (только если есть)
      const ids = getIds('implants_equipped');
      if (ids.length) s.implantsEquipped = ids.slice(0, 3);
    }
    if (extra['flashcards_learned']) {
      s.flashcardsLearned = Array.from(new Set([...s.flashcardsLearned, ...getIds('flashcards_learned')]));
    }
    if (extra['npcs_spoken']) {
      s.npcsSpoken = Array.from(new Set([...s.npcsSpoken, ...getIds('npcs_spoken')]));
    }
    if (extra['quest_objectives'] && typeof extra['quest_objectives'] === 'object') {
      s.questObjectives = { ...s.questObjectives, ...(extra['quest_objectives'] as Record<string, boolean[]>) };
    }
    if (extra['counters'] && typeof extra['counters'] === 'object') {
      const c = extra['counters'] as Record<string, number>;
      s.itemsCrafted    = Math.max(s.itemsCrafted, c.items_crafted ?? 0);
      s.lootboxesOpened = Math.max(s.lootboxesOpened, c.lootboxes_opened ?? 0);
      s.shopBuys        = Math.max(s.shopBuys, c.shop_buys ?? 0);
      s.totalXpEarned   = Math.max(s.totalXpEarned, c.total_xp_earned ?? 0);
      s.sessionsCount   = Math.max(s.sessionsCount, c.sessions_count ?? 0);
    }

    save(s);
    _emit(false); // НЕ синкаем обратно — это просто загрузка с сервера
  },

  /** Сбросить прогресс ТЕКУЩЕГО пользователя (вызывается при logout/смене аккаунта). */
  clearLocalCache() {
    try { localStorage.removeItem(storageKey()); } catch { /* ignore */ }
    invalidateSnapshot();
    listeners.forEach(fn => fn());
  },
};

// ─── Event bus для реактивности ──────────────────────────────────────────────
type Listener = () => void;
const listeners = new Set<Listener>();

function _emit(syncServer = true) {
  invalidateSnapshot();
  listeners.forEach(fn => fn());
  if (syncServer) scheduleServerSync();
}

export function subscribeProgress(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}