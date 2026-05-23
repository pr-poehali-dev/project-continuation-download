/**
 * userStorage — изоляция localStorage по пользователю.
 *
 * Каждый аккаунт хранит свой прогресс отдельно: ключи вида `coderp_u_<username>_<name>`.
 * Если username отсутствует (гость) — используется ключ `coderp_guest_<name>`.
 *
 * При смене аккаунта данные другого юзера остаются на диске (можно вернуться),
 * но НЕ читаются текущим юзером.
 */

const TOKEN_KEY = 'coderp_token';
const USERNAME_KEY = 'coderp_username';

/** Все ключи внутри юзерского неймспейса, которые нужно вычищать при logout/reset. */
const GAME_KEYS = [
  'progress_v1',
  'prologue_done',
  'prologue_step',
  'builder_solved',
  'stories_done',
  'claimed_quests',
  'flashcards_srs',
  'flashcards_known',
] as const;

function getUsername(): string {
  return localStorage.getItem(USERNAME_KEY) || 'guest';
}

/** Полный ключ для текущего пользователя. */
export function userKey(name: string): string {
  return `coderp_u_${getUsername()}_${name}`;
}

/** Удобный wrapper над localStorage с автоматической префиксацией. */
export const userStore = {
  get(name: string): string | null {
    return localStorage.getItem(userKey(name));
  },
  set(name: string, value: string) {
    localStorage.setItem(userKey(name), value);
  },
  remove(name: string) {
    localStorage.removeItem(userKey(name));
  },
  /** Очистить весь игровой стейт ТЕКУЩЕГО пользователя (для logout, reset). */
  clearCurrentUser() {
    const u = getUsername();
    for (const k of GAME_KEYS) {
      localStorage.removeItem(`coderp_u_${u}_${k}`);
    }
  },
};

export { TOKEN_KEY, USERNAME_KEY };
