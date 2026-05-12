import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { useGame } from '@/lib/GameContext';
import { pushNotif } from './Notifications';

interface Step {
  id: string;
  title: string;
  desc: string;
  action: string;
  actionLabel: string;
  icon: string;
  color: string;
  section?: string;
}

const STEPS: Step[] = [
  {
    id: 'welcome',
    title: 'Добро пожаловать в The Archive',
    desc: 'Ты в подполье CodeGrid-9, 2087 год. NEXUS запретила Python — но здесь он живёт. Твоя задача: научиться программировать и помочь сопротивлению.',
    action: 'next',
    actionLabel: 'Понял, продолжить →',
    icon: '🌆',
    color: '#00ffff',
  },
  {
    id: 'meet_pyth0n',
    title: 'Познакомься с PYTH-0N',
    desc: 'PYTH-0N — запрещённый ИИ, хранящий знания Python. Поговори с ним — он объяснит как устроена игра и даст первое задание.',
    action: 'navigate',
    actionLabel: '💬 Поговорить с PYTH-0N',
    icon: '🤖',
    color: '#00ff41',
    section: 'npc',
  },
  {
    id: 'first_lesson',
    title: 'Пройди первый урок',
    desc: 'В разделе «Уроки» найди тему «Переменные и типы». Читай теорию, смотри пример кода и выполни задание. XP сохраняется!',
    action: 'navigate',
    actionLabel: '📡 Перейти к урокам',
    icon: '📦',
    color: '#00ff41',
    section: 'lessons',
  },
  {
    id: 'first_battle',
    title: 'Вступи в бой',
    desc: 'Code Combat — ты пишешь Python код, чтобы атаковать врагов NEXUS. Правильный код = урон. Ошибки = враг бьёт тебя. 12 секунд на атаку!',
    action: 'navigate',
    actionLabel: '⚔️ Первый бой',
    icon: '⚡',
    color: '#ff00ff',
    section: 'battle',
  },
  {
    id: 'city_map',
    title: 'Изучи карту города',
    desc: 'CodeGrid-9 — большой город. Кликай на районы чтобы узнать что там: обучение, подземелья, боссы. С ростом уровня открываются новые зоны.',
    action: 'navigate',
    actionLabel: '🗺️ Открыть карту',
    icon: '🌆',
    color: '#00aaff',
    section: 'map',
  },
  {
    id: 'done',
    title: 'Ты готов, агент!',
    desc: 'Основы изучены. Дальше — твой путь. Выполняй квесты, прокачивай персонажа, побеждай NEXUS. The Archive ждёт героя.',
    action: 'complete',
    actionLabel: '🚀 Начать игру!',
    icon: '🏆',
    color: '#ffaa00',
  },
];

const STORAGE_KEY = 'coderp_onboarding_done';

interface Props {
  onNavigate: (section: string) => void;
  onClose: () => void;
}

export default function Onboarding({ onNavigate, onClose }: Props) {
  const { character } = useGame();
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  const handleAction = () => {
    if (current.action === 'navigate' && current.section) {
      onNavigate(current.section);
      setStep(s => Math.min(STEPS.length - 1, s + 1));
    } else if (current.action === 'complete') {
      localStorage.setItem(STORAGE_KEY, '1');
      pushNotif({
        type: 'achievement',
        title: 'Добро пожаловать в The Archive!',
        body: `Агент ${character?.name ?? ''} прошёл обучение. The Archive ждёт.`,
        icon: '🏆',
        color: '#ffaa00',
      });
      onClose();
    } else {
      setStep(s => Math.min(STEPS.length - 1, s + 1));
    }
  };

  const skip = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9998] bg-black/80 flex items-end lg:items-center justify-center p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-lg border animate-fade-in-up"
        style={{ borderColor: current.color + '50', backgroundColor: '#050a0efa', boxShadow: `0 0 60px ${current.color}20` }}
      >
        {/* Progress */}
        <div className="h-0.5 bg-black/60">
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%`, backgroundColor: current.color }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <div className="font-mono text-[10px] text-gray-600">
            ШАГ {step + 1} / {STEPS.length} · ТУТОРИАЛ
          </div>
          <button onClick={skip} className="font-mono text-[10px] text-gray-700 hover:text-gray-400 transition-colors">
            ПРОПУСТИТЬ
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-5">
            <div
              className="text-4xl w-16 h-16 flex items-center justify-center border flex-shrink-0"
              style={{ borderColor: current.color + '50', backgroundColor: current.color + '10' }}
            >
              {current.icon}
            </div>
            <div>
              <div className="font-orbitron text-lg font-black text-white leading-tight">{current.title}</div>
              <div className="font-mono text-[10px] mt-0.5" style={{ color: current.color + '80' }}>
                THE ARCHIVE · CODEGRID-9
              </div>
            </div>
          </div>

          <p className="font-rajdhani text-gray-300 text-base leading-relaxed mb-6">
            {current.desc}
          </p>

          {/* Step dots */}
          <div className="flex gap-1.5 mb-5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 transition-all"
                style={{ backgroundColor: i <= step ? current.color : '#222' }}
              />
            ))}
          </div>

          {/* Action */}
          <button
            onClick={handleAction}
            className="w-full py-4 font-orbitron text-sm border-2 transition-all flex items-center justify-center gap-2 active:scale-95"
            style={{
              borderColor: current.color,
              color: current.color,
              backgroundColor: current.color + '18',
              boxShadow: `0 0 25px ${current.color}25`,
            }}
          >
            {current.actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Хук: показывать онбординг только новым игрокам (первый вход) */
export function useOnboarding() {
  const [show, setShow] = useState(false);
  const { character } = useGame();

  useEffect(() => {
    if (!character) return;
    const done = localStorage.getItem(STORAGE_KEY);
    // Показываем онбординг если персонаж первого уровня и не проходил
    if (!done && character.level <= 1 && character.xp === 0) {
      const t = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(t);
    }
  }, [character]);

  return { show, setShow };
}
