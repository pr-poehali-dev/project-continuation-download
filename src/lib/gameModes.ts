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
  // 1. Уроки — основа, открыты сразу
  {
    id: 'lessons', section: 'lessons',
    title: 'Уроки Python', desc: 'Теория и практика — 15 шагов',
    icon: '📚', color: '#00ff41', order: 1,
    requirement: 'Открыто с начала',
    check: () => true,
  },
  // 2. NPC — наставники, открыты сразу
  {
    id: 'npc', section: 'npc',
    title: 'Агенты', desc: 'PYTH-0N и K4I подскажут путь',
    icon: '💬', color: '#00aaff', order: 2,
    requirement: 'Открыто с начала',
    check: () => true,
  },
  // 3. Карточки — лёгкое запоминание после первого урока
  {
    id: 'flashcards', section: 'flashcards',
    title: 'Карточки', desc: 'Запоминай термины через ассоциации',
    icon: '🎴', color: '#00ff41', order: 3,
    requirement: 'Пройди 1 урок',
    check: prog => prog.lessonsCompleted.length >= 1,
  },
  // 4. Конструктор — собирать программы без печати
  {
    id: 'builder', section: 'builder',
    title: 'Конструктор', desc: 'Собирай код из блоков',
    icon: '🧩', color: '#ff00ff', order: 4,
    requirement: 'Пройди 2 урока',
    check: prog => prog.lessonsCompleted.length >= 2,
  },
  // 5. Сториз — обучение через сюжет
  {
    id: 'stories', section: 'stories',
    title: 'Код-Сториз', desc: 'Учись через истории и диалоги',
    icon: '📖', color: '#00aaff', order: 5,
    requirement: 'Пройди 3 урока',
    check: prog => prog.lessonsCompleted.length >= 3,
  },
  // 6. Battle — практика под давлением
  {
    id: 'battle', section: 'battle',
    title: 'Code Combat', desc: 'Пиши код — побеждай врагов',
    icon: '⚔️', color: '#ff00ff', order: 6,
    requirement: 'Пройди 3 урока',
    check: prog => prog.lessonsCompleted.length >= 3,
  },
  // 7. Магазин — после первой победы
  {
    id: 'shop', section: 'shop',
    title: 'Магазин', desc: 'Лутбоксы и экипировка',
    icon: '🌑', color: '#aa00ff', order: 7,
    requirement: 'Выиграй 1 бой',
    check: prog => prog.battlesWon >= 1,
  },
  // 8. Подземелья — испытания
  {
    id: 'dungeon', section: 'dungeon',
    title: 'Подземелья', desc: 'Тесты на знание Python',
    icon: '🏰', color: '#ffaa00', order: 8,
    requirement: 'Пройди 5 уроков и 2 боя',
    check: prog => prog.lessonsCompleted.length >= 5 && prog.battlesWon >= 2,
  },
  // 9. Мастерская — код-крафт имплантов
  {
    id: 'workshop', section: 'workshop',
    title: 'Мастерская', desc: 'Пиши функции — собирай импланты',
    icon: '🔨', color: '#aa00ff', order: 9,
    requirement: 'Пройди 1 подземелье',
    check: prog => prog.dungeonsCompleted.length >= 1,
  },
  // 10. Крафт ресурсами — финальный режим
  {
    id: 'crafting', section: 'crafting',
    title: 'Крафт ресурсами', desc: 'Создавай предметы из материалов',
    icon: '🧰', color: '#ffaa00', order: 10,
    requirement: 'Достигни 5 уровня',
    check: (_prog, ch) => (ch?.level ?? 0) >= 5,
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