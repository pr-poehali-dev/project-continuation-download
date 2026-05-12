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

// ─── Public API ──────────────────────────────────────────────────────────────

export const progress = {
  get(): ProgressState {
    return resetDailyIfNeeded(load());
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
};

// ─── Event bus для реактивности ──────────────────────────────────────────────
type Listener = () => void;
const listeners = new Set<Listener>();

function _emit() {
  listeners.forEach(fn => fn());
}

export function subscribeProgress(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
