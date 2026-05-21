import { useCallback } from 'react';
import { useGame, XpResult } from './GameContext';
import { api } from './api';
import { progress as progressStore } from './progressStore';

/**
 * Хук для единой точки начисления XP+Creds.
 * Используется во всех режимах, где раньше XP писался только в localStorage.
 *
 * Берёт на себя:
 *  1. Запрос на бекенд (action=gain_xp) — XP сохраняется в characters.xp
 *  2. applyXpResult — обновление character в GameContext (без round-trip)
 *  3. progressStore.recordXp — счётчик totalXpEarned для статы
 *
 * @example
 *   const gainXp = useGainXp();
 *   await gainXp('flashcard', 10, 0);
 */
export function useGainXp() {
  const { applyXpResult, token } = useGame();

  return useCallback(async (reason: string, xp: number, coins: number = 0) => {
    if (xp <= 0 && coins <= 0) return null;

    // Локальный счётчик прогресса — для статы и квестов
    progressStore.recordXp(xp);

    // Если игрок не залогинен — ничего не отправляем
    if (!token) return null;

    const res = await api.gainXp(reason, xp, coins);
    if (res && !res.error && typeof res.new_xp === 'number') {
      applyXpResult(res as XpResult);
      return res as XpResult;
    }
    return null;
  }, [applyXpResult, token]);
}
