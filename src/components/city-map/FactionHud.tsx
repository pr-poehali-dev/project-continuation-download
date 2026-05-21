import Icon from '@/components/ui/icon';
import { FACTIONS } from './data';

interface Props {
  reputation: Record<string, number>;
  influence: Record<string, number>;
  totalInfluence: number;
  factionLoading: string | null;
  onReload: () => void;
  onSupport: (factionId: string) => void;
}

export default function FactionHud({
  reputation,
  influence,
  totalInfluence,
  factionLoading,
  onReload,
  onSupport,
}: Props) {
  return (
    <div className="mb-4 border border-white/8 bg-black/40 p-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <div className="font-mono text-[10px] text-gray-600 tracking-widest">// КОРПОРАЦИИ ГОРОДА · РЕПУТАЦИЯ И ВЛИЯНИЕ</div>
          <div className="font-mono text-[9px] text-gray-700 mt-0.5">
            Помогай фракции — её влияние растёт, открывается больше квестов и скидок
          </div>
        </div>
        <button onClick={onReload}
          className="font-mono text-[10px] px-2 py-1 border border-white/10 text-gray-500 hover:text-white transition-all">
          <Icon name="RefreshCw" size={10} className="inline mr-1" />
          обновить
        </button>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        {FACTIONS.map(f => {
          const rep = reputation[f.id] ?? 0;
          const inf = influence[f.id]   ?? 0;
          const sharePct = Math.round((inf / totalInfluence) * 100);
          const repLabel = f.rep_label(rep);
          const repColor = f.rep_color(rep);
          return (
            <div key={f.id} className="border p-3 transition-all hover:translate-y-[-2px]"
              style={{ borderColor: f.color + '40', backgroundColor: f.color + '06' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{f.emoji}</span>
                <div className="min-w-0">
                  <div className="font-orbitron text-xs font-bold" style={{ color: f.color }}>{f.name}</div>
                  <div className="font-mono text-[9px] text-gray-600 italic truncate">{f.motto}</div>
                </div>
              </div>
              {/* Моя репутация */}
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] text-gray-500">Моя репутация</span>
                <span className="font-orbitron text-xs font-black" style={{ color: repColor }}>
                  {rep > 0 ? '+' : ''}{rep} · {repLabel}
                </span>
              </div>
              <div className="h-1 bg-black/60 mb-3 overflow-hidden">
                <div className="h-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.abs(rep) / 10)}%`, backgroundColor: repColor }} />
              </div>
              {/* Глобальное влияние */}
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] text-gray-500">Контроль города</span>
                <span className="font-mono text-[10px]" style={{ color: f.color }}>{sharePct}%</span>
              </div>
              <div className="h-1.5 bg-black/60 overflow-hidden mb-3">
                <div className="h-full transition-all duration-700"
                  style={{ width: `${sharePct}%`, backgroundColor: f.color, boxShadow: `0 0 6px ${f.color}80` }} />
              </div>
              <button
                onClick={() => onSupport(f.id)}
                disabled={factionLoading === f.id}
                className="w-full font-mono text-[10px] py-1.5 border transition-all disabled:opacity-50"
                style={{ borderColor: f.color + '50', color: f.color, backgroundColor: f.color + '08' }}>
                {factionLoading === f.id ? '...' : `+ ПОДДЕРЖАТЬ ${f.short.toUpperCase()}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
