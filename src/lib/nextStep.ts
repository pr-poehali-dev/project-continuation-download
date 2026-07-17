/**
 * nextStep — единый «мозг» рекомендаций «Что делать дальше?».
 *
 * Используется и виджетом на главной (NextStepWidget), и сквозной
 * плавающей кнопкой (NextStepFAB). Логика в одном месте — чтобы обе
 * точки входа всегда советовали одно и то же.
 *
 * Принцип Core Loop для новичка:
 *   урок → бой → награда → апгрейд → следующая цель.
 * Поэтому порядок проверок повторяет естественную петлю обучения.
 */
import type { ProgressState } from './progressStore';

export interface NextStep {
  section: string;
  icon: string;
  title: string;
  reason: string;   // почему рекомендую (простыми словами)
  cta: string;      // что делать (текст кнопки)
  color: string;
  urgency: number;  // 0..100 приоритет
}

/** Подобрать самый осмысленный следующий шаг по прогрессу игрока. */
export function pickNextStep(prog: ProgressState, charLevel: number): NextStep {
  const lessonsCount = prog.lessonsCompleted.length;
  const battles = prog.battlesWon;
  const dungeons = prog.dungeonsCompleted.length;
  const flashcards = prog.flashcardsLearned.length;
  const stories = prog.storiesCompleted.length;
  const builders = prog.buildersSolved.length;
  const implants = prog.implantsCrafted.length;

  // 1. Совсем новичок — иди в уроки
  if (lessonsCount === 0) {
    return {
      section: 'lessons', icon: '📚', title: 'Начни с первого урока',
      reason: 'Ты ещё не открыл ни одного урока Python. Это займёт 8 минут.',
      cta: 'ОТКРЫТЬ УРОКИ', color: '#00ff41', urgency: 100,
    };
  }

  // 2. Прошёл 1 урок — закрепи карточками (быстрая победа)
  if (lessonsCount >= 1 && flashcards < 5) {
    return {
      section: 'flashcards', icon: '🎴', title: 'Закрепи термины на карточках',
      reason: `Ты прошёл ${lessonsCount} урок(ов), но выучил ${flashcards} карточек. 3 минуты — и термины осядут.`,
      cta: 'УЧИТЬ КАРТОЧКИ', color: '#00ff41', urgency: 85,
    };
  }

  // 3. Есть уроки, но не собирал код в конструкторе
  if (lessonsCount >= 2 && builders === 0) {
    return {
      section: 'builder', icon: '🧩', title: 'Собери первую программу',
      reason: 'Конструктор учит логике кода без печати — попробуй, это просто.',
      cta: 'СОБРАТЬ КОД', color: '#ff00ff', urgency: 80,
    };
  }

  // 4. Есть база — попробуй истории
  if (lessonsCount >= 3 && stories === 0) {
    return {
      section: 'stories', icon: '📖', title: 'Пройди первую историю',
      reason: 'Код-сториз показывают, как Python работает в реальной миссии.',
      cta: 'ОТКРЫТЬ ИСТОРИИ', color: '#00aaff', urgency: 75,
    };
  }

  // 5. Первый бой — ключевой момент петли
  if (lessonsCount >= 3 && battles === 0) {
    return {
      section: 'battle', icon: '⚔️', title: 'Проверь себя в первом бою',
      reason: 'У тебя есть знания — пора применить их. Первые враги простые: только читать код.',
      cta: 'НА АРЕНУ', color: '#ff00ff', urgency: 90,
    };
  }

  // 6. Воевал, но не был в данже
  if (battles >= 2 && lessonsCount >= 5 && dungeons === 0) {
    return {
      section: 'dungeon', icon: '🏰', title: 'Зайди в первое подземелье',
      reason: 'Тесты в данже проверяют теорию глубже, чем уроки.',
      cta: 'В ПОДЗЕМЕЛЬЕ', color: '#ffaa00', urgency: 75,
    };
  }

  // 7. Прошёл данж, но не собирал импланты
  if (dungeons >= 1 && implants === 0) {
    return {
      section: 'workshop', icon: '🔨', title: 'Собери первый имплант',
      reason: 'Мастерская превращает твой код в постоянные бонусы к урону и XP.',
      cta: 'В МАСТЕРСКУЮ', color: '#aa00ff', urgency: 70,
    };
  }

  // 8. Импланты собраны, но не надеты — важный апгрейд!
  if (implants >= 1 && prog.implantsEquipped.length === 0) {
    return {
      section: 'workshop', icon: '⚙️', title: 'Надень имплант',
      reason: `Ты собрал ${implants} имплант(ов), но ни одного не активировал. Они дадут +XP и +урон.`,
      cta: 'АКТИВИРОВАТЬ', color: '#aa00ff', urgency: 95,
    };
  }

  // 9. 5+ уровень — открылся крафт ресурсами
  if (charLevel >= 5 && prog.itemsCrafted === 0) {
    return {
      section: 'crafting', icon: '🧰', title: 'Крафти из ресурсов',
      reason: 'У тебя 5+ уровень — открылся крафт предметов из материалов.',
      cta: 'В КРАФТ', color: '#ffaa00', urgency: 60,
    };
  }

  // 10. Дейлики — держим ритм возвращения
  if (prog.dailyLessons === 0) {
    return {
      section: 'lessons', icon: '📚', title: 'Дневная цель: пройди урок',
      reason: 'Ежедневное задание — пройди 1 урок и держи серию.',
      cta: 'УРОК', color: '#00ff41', urgency: 65,
    };
  }
  if (prog.dailyBattles === 0 && battles > 0) {
    return {
      section: 'battle', icon: '⚔️', title: 'Дневная цель: выиграй бой',
      reason: 'Ежедневное задание — выиграй 1 бой.',
      cta: 'БОЙ', color: '#ff00ff', urgency: 65,
    };
  }
  if (prog.dailyDungeons === 0 && dungeons > 0) {
    return {
      section: 'dungeon', icon: '🏰', title: 'Дневная цель: пройди данж',
      reason: 'Ежедневное задание — пройди 1 подземелье.',
      cta: 'ДАНЖ', color: '#ffaa00', urgency: 60,
    };
  }

  // 11. Дефолт — продолжай прокачку боями
  return {
    section: 'battle', icon: '⚔️', title: 'Продолжай прокачку',
    reason: 'Все базовые режимы открыты — закрепляй знания боями и данжами.',
    cta: 'В БОЙ', color: '#ff00ff', urgency: 40,
  };
}
