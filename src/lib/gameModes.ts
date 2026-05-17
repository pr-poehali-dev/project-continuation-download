/**
 * gameModes — описание мини-игр (режимов) и правил их разблокировки.
 * Игрок получает доступ к режимам последовательно — по мере прогресса.
 *
 * Каждый режим имеет:
 *  - id, section, title, desc, icon, color
 *  - requirement: что нужно чтобы открыть
 *  - check(progress, character): функция-валидатор
 */
import type { ProgressState } from './progressStore';

export interface GameMode {
  id: string;
  section: string;        // ключ навигации в Index.tsx
  title: string;
  desc: string;
  icon: string;
  color: string;
  order: number;          // последовательность разблокировки
  requirement: string;    // человекочитаемое описание
  /** Возвращает true если режим разблокирован */
  check: (
    prog: ProgressState,
    character: { level: number } | null,
  ) => boolean;
}

export const GAME_MODES: GameMode[] = [
  // 1. Уроки — открыты сразу (база обучения)
  {
    id: 'lessons',
    section: 'lessons',
    title: 'Уроки Python',
    desc: 'Теория, примеры, практика',
    icon: '📚',
    color: '#00ff41',
    order: 1,
    requirement: 'Открыто с начала',
    check: () => true,
  },

  // 2. NPC — открыты сразу (часть стартового сюжета)
  {
    id: 'npc',
    section: 'npc',
    title: 'Агенты',
    desc: 'Поговори с PYTH-0N и K4I',
    icon: '💬',
    color: '#00aaff',
    order: 2,
    requirement: 'Открыто с начала',
    check: () => true,
  },

  // 3. Code Combat — после первого урока
  {
    id: 'battle',
    section: 'battle',
    title: 'Code Combat',
    desc: 'Пиши код — побеждай врагов',
    icon: '⚔️',
    color: '#ff00ff',
    order: 3,
    requirement: 'Пройди 1 урок',
    check: prog => prog.lessonsCompleted.length >= 1,
  },

  // 4. Магазин — после первой победы (есть на что тратить)
  {
    id: 'shop',
    section: 'shop',
    title: 'Магазин',
    desc: 'Лутбоксы и экипировка',
    icon: '🌑',
    color: '#aa00ff',
    order: 4,
    requirement: 'Выиграй 1 бой',
    check: prog => prog.battlesWon >= 1,
  },

  // 5. Подземелья — после 3 уроков и 2 побед
  {
    id: 'dungeon',
    section: 'dungeon',
    title: 'Подземелья',
    desc: 'Тесты на знание Python',
    icon: '🏰',
    color: '#ffaa00',
    order: 5,
    requirement: 'Пройди 3 урока и 2 боя',
    check: prog => prog.lessonsCompleted.length >= 3 && prog.battlesWon >= 2,
  },

  // 6. Крафт — после первого данжа (нужны ресурсы)
  {
    id: 'crafting',
    section: 'crafting',
    title: 'Крафт',
    desc: 'Создавай импланты',
    icon: '🔨',
    color: '#aa00ff',
    order: 6,
    requirement: 'Пройди 1 подземелье',
    check: prog => prog.dungeonsCompleted.length >= 1,
  },
];

/** Узнать что разблокировано на текущий момент */
export function getUnlockedModes(
  prog: ProgressState,
  character: { level: number } | null,
): Set<string> {
  const unlocked = new Set<string>();
  for (const mode of GAME_MODES) {
    if (mode.check(prog, character)) unlocked.add(mode.id);
  }
  return unlocked;
}

/** Получить состояние режима */
export function getModeState(
  mode: GameMode,
  prog: ProgressState,
  character: { level: number } | null,
): { unlocked: boolean; nextHint?: string } {
  const unlocked = mode.check(prog, character);
  return { unlocked, nextHint: unlocked ? undefined : mode.requirement };
}
