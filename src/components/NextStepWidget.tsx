import { useMemo } from 'react';
import { type ProgressState } from '@/lib/progressStore';
import { useProgress } from '@/lib/useProgress';
import { useGame } from '@/lib/GameContext';

interface NextStep {
  section: string;
  icon: string;
  title: string;
  reason: string;       // почему рекомендую
  cta: string;          // что делать
  color: string;
  urgency: number;      // приоритет 0..100
}

/** Подобрать самый осмысленный следующий шаг */
function pickNextStep(prog: ProgressState, charLevel: number): NextStep {
  const lessonsCount = prog.lessonsCompleted.length;
  const battles = prog.battlesWon;
  const dungeons = prog.dungeonsCompleted.length;
  const flashcards = prog.flashcardsLearned.length;
  const stories = prog.storiesCompleted.length;
  const builders = prog.buildersSolved.length;
  const implants = prog.implantsCrafted.length;

  // Совсем новичок — иди в уроки
  if (lessonsCount === 0) {
    return {
      section: 'lessons', icon: '📚', title: 'Начни с первого урока',
      reason: 'Ты ещё не открыл ни одного урока Python',
      cta: 'ОТКРЫТЬ УРОКИ', color: '#00ff41', urgency: 100,
    };
  }

  // Прошёл 1-2 урока, но не закрепил карточками
  if (lessonsCount >= 1 && flashcards < 5) {
    return {
      section: 'flashcards', icon: '🎴', title: 'Закрепи термины на карточках',
      reason: `Ты прошёл ${lessonsCount} уроков, но выучил ${flashcards} карточек. 3 минуты — и термины осядут`,
      cta: 'УЧИТЬ КАРТОЧКИ', color: '#00ff41', urgency: 85,
    };
  }

  // Есть уроки, но не решал конструктор
  if (lessonsCount >= 2 && builders === 0) {
    return {
      section: 'builder', icon: '🧩', title: 'Собери первую программу',
      reason: 'Конструктор учит логике без печати — попробуй',
      cta: 'СОБРАТЬ КОД', color: '#ff00ff', urgency: 80,
    };
  }

  // Есть уроки и карточки, но не пробовал сториз
  if (lessonsCount >= 3 && stories === 0) {
    return {
      section: 'stories', icon: '📖', title: 'Пройди первую историю',
      reason: 'Код-сториз показывают как Python работает в реальной миссии',
      cta: 'ОТКРЫТЬ ИСТОРИИ', color: '#00aaff', urgency: 75,
    };
  }

  // Не воевал — но уже знает базу
  if (lessonsCount >= 3 && battles === 0) {
    return {
      section: 'battle', icon: '⚔️', title: 'Проверь себя в бою',
      reason: 'У тебя есть знания — пора применить их под давлением',
      cta: 'НА АРЕНУ', color: '#ff00ff', urgency: 70,
    };
  }

  // Воевал, но не был в данже
  if (battles >= 2 && lessonsCount >= 5 && dungeons === 0) {
    return {
      section: 'dungeon', icon: '🏰', title: 'Зайди в первое подземелье',
      reason: 'Тесты в данже проверяют теорию глубже, чем уроки',
      cta: 'В ПОДЗЕМЕЛЬЕ', color: '#ffaa00', urgency: 75,
    };
  }

  // Прошёл данж, но не собирал импланты
  if (dungeons >= 1 && implants === 0) {
    return {
      section: 'workshop', icon: '🔨', title: 'Собери первый имплант',
      reason: 'Мастерская превращает код в постоянные бонусы',
      cta: 'В МАСТЕРСКУЮ', color: '#aa00ff', urgency: 70,
    };
  }

  // Импланты есть, но не надеты
  if (implants >= 1 && prog.implantsEquipped.length === 0) {
    return {
      section: 'workshop', icon: '⚙️', title: 'Надень имплант',
      reason: `Ты собрал ${implants} имплант(ов), но ни одного не активировал. Они дадут +XP и +урон`,
      cta: 'АКТИВИРОВАТЬ', color: '#aa00ff', urgency: 90,
    };
  }

  // Достиг 5+ уровня, не пробовал крафт ресурсами
  if (charLevel >= 5 && prog.itemsCrafted === 0) {
    return {
      section: 'crafting', icon: '🧰', title: 'Крафти из ресурсов',
      reason: 'У тебя 5+ уровень — открылся крафт из материалов',
      cta: 'В КРАФТ', color: '#ffaa00', urgency: 60,
    };
  }

  // Daily не закрыт
  if (prog.dailyLessons === 0) {
    return {
      section: 'lessons', icon: '📚', title: 'Сделай дейлик: урок',
      reason: 'Ежедневное задание — пройди 1 урок',
      cta: 'УРОК', color: '#00ff41', urgency: 65,
    };
  }
  if (prog.dailyBattles === 0 && battles > 0) {
    return {
      section: 'battle', icon: '⚔️', title: 'Сделай дейлик: бой',
      reason: 'Ежедневное задание — выиграй 1 бой',
      cta: 'БОЙ', color: '#ff00ff', urgency: 65,
    };
  }

  // Дефолт — продолжай прокачку боями
  return {
    section: 'battle', icon: '⚔️', title: 'Продолжай прокачку',
    reason: 'Все базовые режимы открыты — закрепляй знания боями и данжами',
    cta: 'В БОЙ', color: '#ff00ff', urgency: 40,
  };
}

export default function NextStepWidget({ onNavigate }: { onNavigate: (s: string) => void }) {
  const prog = useProgress();
  const { character } = useGame();
  const step = useMemo(() => pickNextStep(prog, character?.level ?? 1), [prog, character?.level]);

  return (
    <button onClick={() => onNavigate(step.section)}
      className="w-full text-left group relative overflow-hidden border-2 p-4 transition-all hover:-translate-y-0.5"
      style={{
        borderColor: step.color + '60',
        background: `linear-gradient(135deg, ${step.color}10 0%, transparent 70%)`,
        boxShadow: `0 0 30px ${step.color}15`,
      }}>
      {/* Pulse dot */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: step.color }} />
        <div className="font-mono text-[9px] tracking-widest" style={{ color: step.color }}>NEXT</div>
      </div>

      <div className="flex items-start gap-4">
        <div className="text-4xl flex-shrink-0 mt-1">{step.icon}</div>
        <div className="flex-1 min-w-0 pr-12">
          <div className="font-mono text-[10px] text-gray-500 tracking-widest mb-1">
            // РЕКОМЕНДАЦИЯ AI-НАСТАВНИКА
          </div>
          <div className="font-orbitron text-lg font-black text-white">{step.title}</div>
          <p className="font-rajdhani text-sm text-gray-300 mt-1">{step.reason}</p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 border font-orbitron text-xs"
            style={{ color: step.color, borderColor: step.color, backgroundColor: step.color + '12' }}>
            {step.cta} →
          </div>
        </div>
      </div>
    </button>
  );
}