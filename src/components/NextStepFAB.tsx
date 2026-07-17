/**
 * NextStepFAB — сквозная плавающая кнопка «Что дальше?».
 *
 * Видна поверх любого раздела (кроме главного экрана, где уже есть
 * большой виджет-рекомендация). Клик раскрывает мини-панель с советом
 * следующего шага; кнопка внутри ведёт в нужный раздел.
 *
 * Цель (Design Pillar): у новичка ВСЕГДА есть понятный «план действий».
 */
import { useState, useMemo } from 'react';
import Icon from '@/components/ui/icon';
import { useProgress } from '@/lib/useProgress';
import { useGame } from '@/lib/GameContext';
import { pickNextStep } from '@/lib/nextStep';

interface Props {
  /** Текущий активный раздел — чтобы не советовать «иди туда, где ты уже есть». */
  currentSection: string;
  onNavigate: (section: string) => void;
}

export default function NextStepFAB({ currentSection, onNavigate }: Props) {
  const prog = useProgress();
  const { character } = useGame();
  const [open, setOpen] = useState(false);

  const step = useMemo(
    () => pickNextStep(prog, character?.level ?? 1),
    [prog, character?.level],
  );

  // На главном экране виджет уже есть — FAB не нужен
  if (currentSection === 'home') return null;

  // Если совет ведёт в текущий раздел — игрок уже здесь, прячем
  const sameSection = step.section === currentSection;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {/* Раскрытая панель с рекомендацией */}
      {open && (
        <div
          className="w-72 border-2 p-4"
          style={{
            borderColor: step.color + '80',
            background: `linear-gradient(135deg, ${step.color}18 0%, #050a0e 70%)`,
            boxShadow: `0 0 40px ${step.color}30`,
          }}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="font-mono text-[9px] text-gray-500 tracking-widest">
              // ПЛАН ДЕЙСТВИЙ
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-white -mt-1">
              <Icon name="X" size={14} />
            </button>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-3xl flex-shrink-0">{step.icon}</div>
            <div className="min-w-0">
              <div className="font-orbitron text-sm font-black text-white leading-tight">
                {step.title}
              </div>
              <p className="font-rajdhani text-xs text-gray-300 mt-1">{step.reason}</p>
            </div>
          </div>

          {sameSection ? (
            <div className="mt-3 text-center font-mono text-[10px] text-gray-500 border border-white/10 py-2">
              Ты уже здесь — действуй ↑
            </div>
          ) : (
            <button
              onClick={() => { onNavigate(step.section); setOpen(false); }}
              className="mt-3 w-full py-2 border font-orbitron text-xs transition-all hover:brightness-125"
              style={{ color: step.color, borderColor: step.color, backgroundColor: step.color + '15' }}
            >
              {step.cta} →
            </button>
          )}
        </div>
      )}

      {/* Кнопка-триггер */}
      <button
        onClick={() => setOpen(o => !o)}
        className="group relative flex items-center gap-2 pl-3 pr-4 py-3 border-2 font-orbitron text-xs transition-all hover:-translate-y-0.5"
        style={{
          borderColor: step.color,
          backgroundColor: '#050a0e',
          boxShadow: `0 0 24px ${step.color}40`,
        }}
        title="Что делать дальше?"
      >
        {/* Пульс-точка привлекает внимание */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
            style={{ backgroundColor: step.color }} />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: step.color }} />
        </span>
        <span className="hidden sm:inline" style={{ color: step.color }}>ЧТО ДАЛЬШЕ?</span>
        <span className="sm:hidden text-lg">{step.icon}</span>
      </button>
    </div>
  );
}