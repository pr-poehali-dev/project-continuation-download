import { useMemo } from 'react';
import { useProgress } from '@/lib/useProgress';
import { useGame } from '@/lib/GameContext';
import { pickNextStep } from '@/lib/nextStep';

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