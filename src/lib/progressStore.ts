/**
 * progressStore — localStorage-хранилище игрового прогресса.
 * Все компоненты пишут сюда события (урок пройден, бой выигран и т.д.)
 * QuestLog и Achievements читают отсюда для отображения реального прогресса.
 */

const KEY = 'coderp_progress_v1';

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
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT };
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return { ...DEFAULT, ...parsed };
  } catch {
    return { ...DEFAULT };
  }
}

function save(state: ProgressState) {
  localStorage.setItem(KEY, JSON.stringify(state));
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

  /** Подтянуть прогресс с сервера и смержить с локальным */
  mergeFromServer(server: {
    lessons_completed?: number[];
    battles_won?: number;
    battles_streak_best?: number;
    dungeons_completed?: string[];
    dungeons_scores?: Record<string, number>;
  }) {
    const s = load();
    const lessons = new Set<number>([...s.lessonsCompleted, ...(server.lessons_completed || [])]);
    s.lessonsCompleted = Array.from(lessons);

    const dungeons = new Set<string>([...s.dungeonsCompleted, ...(server.dungeons_completed || [])]);
    s.dungeonsCompleted = Array.from(dungeons);

    const scores = { ...s.dungeonsScores };
    for (const [d, sc] of Object.entries(server.dungeons_scores || {})) {
      scores[d] = Math.max(scores[d] ?? 0, sc);
    }
    s.dungeonsScores = scores;

    s.battlesWon         = Math.max(s.battlesWon, server.battles_won ?? 0);
    s.battlesStreakBest  = Math.max(s.battlesStreakBest, server.battles_streak_best ?? 0);

    save(s);
    _emit();
  },
};

// ─── Event bus для реактивности ──────────────────────────────────────────────
type Listener = () => void;
const listeners = new Set<Listener>();

function _emit() {
  invalidateSnapshot();
  listeners.forEach(fn => fn());
}

export function subscribeProgress(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}