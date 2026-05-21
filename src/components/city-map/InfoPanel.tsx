import Icon from '@/components/ui/icon';
import { useGame } from '@/lib/GameContext';
import { DISTRICTS, FACTIONS, FACTION_BY_NAME, TYPE_META, District } from './data';
import type { DistrictQuestInfo } from './questMarkers';

interface Props {
  selected: District | null;
  playerLevel: number;
  reputation: Record<string, number>;
  factionLoading: string | null;
  isUnlocked: (d: District) => boolean;
  onSupport: (factionId: string) => void;
  onGoTo: () => void;
  onClose: () => void;
  questMarkers?: Map<string, DistrictQuestInfo>;
}

export default function InfoPanel({
  selected,
  playerLevel,
  reputation,
  factionLoading,
  isUnlocked,
  onSupport,
  onGoTo,
  onClose,
  questMarkers,
}: Props) {
  const { character } = useGame();
  const districtQuests = selected ? questMarkers?.get(selected.id) : undefined;

  return (
    <div className="w-full lg:w-72 flex-shrink-0">
      {selected ? (
        <div
          className="border p-5 space-y-4 transition-all duration-200"
          style={{ borderColor: selected.factionColor + '50', backgroundColor: selected.factionColor + '06', minHeight: '400px' }}
        >
          {/* Badge row */}
          <div className="flex items-center justify-between flex-wrap gap-1">
            <span className="font-mono text-[10px] px-2 py-0.5 border"
              style={{ color: TYPE_META[selected.type].color, borderColor: TYPE_META[selected.type].color + '50', backgroundColor: TYPE_META[selected.type].color + '10' }}>
              {TYPE_META[selected.type].icon} {TYPE_META[selected.type].label}
            </span>
            <span className="font-mono text-[10px]" style={{ color: selected.factionColor + 'aa' }}>
              LVL {selected.unlockLevel}+
            </span>
          </div>

          {/* Title */}
          <div>
            <h3 className="font-orbitron text-lg font-black text-white leading-tight">{selected.name}</h3>
            <div className="font-mono text-[10px] text-gray-600 mt-0.5">{selected.subtitle}</div>
            <div className="font-mono text-[10px] mt-1" style={{ color: selected.factionColor + '90' }}>
              [{selected.faction}]
            </div>
          </div>

          {/* Lore */}
          <div className="border-l-2 pl-3" style={{ borderColor: selected.factionColor + '60' }}>
            <p className="text-gray-400 font-rajdhani text-sm leading-snug">{selected.lore}</p>
          </div>

          {/* Faction info */}
          {(() => {
            const fid = FACTION_BY_NAME[selected.faction];
            if (!fid) return null;
            const f = FACTIONS.find(x => x.id === fid)!;
            const rep = reputation[fid] ?? 0;
            return (
              <div className="border p-3" style={{ borderColor: f.color + '40', backgroundColor: f.color + '06' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span>{f.emoji}</span>
                  <div className="flex-1">
                    <div className="font-mono text-[9px] text-gray-500">// КОНТРОЛЬ РАЙОНА</div>
                    <div className="font-orbitron text-xs font-bold" style={{ color: f.color }}>{f.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[9px] text-gray-500">репутация</div>
                    <div className="font-orbitron text-sm font-black" style={{ color: f.rep_color(rep) }}>
                      {rep > 0 ? '+' : ''}{rep}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onSupport(fid)}
                  disabled={factionLoading === fid}
                  className="w-full font-mono text-[10px] py-1.5 border transition-all disabled:opacity-50"
                  style={{ borderColor: f.color + '50', color: f.color, backgroundColor: f.color + '10' }}>
                  {factionLoading === fid ? '...' : `+ ВЫПОЛНИТЬ ЗАДАНИЕ ${f.short.toUpperCase()}`}
                </button>
              </div>
            );
          })()}

          {/* Rewards */}
          <div className="border border-cyber-yellow/20 bg-cyber-yellow/5 p-3">
            <div className="font-mono text-[10px] text-gray-600 mb-1">// НАГРАДЫ</div>
            <div className="font-mono text-xs text-cyber-yellow">{selected.rewards}</div>
          </div>

          {/* ── Активные квесты в этом районе ── */}
          {districtQuests && districtQuests.quests.length > 0 && (
            <div className="border p-3"
              style={{ borderColor: '#ffaa0040', backgroundColor: '#ffaa0008' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="font-mono text-[10px] text-cyber-yellow tracking-widest flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-cyber-yellow text-black font-black text-[10px]">!</span>
                  АКТИВНЫЕ КВЕСТЫ
                </div>
                <span className="font-mono text-[10px] text-cyber-yellow">{districtQuests.pendingCount}</span>
              </div>
              <div className="space-y-1.5">
                {districtQuests.quests.slice(0, 4).map(q => (
                  <div key={q.id}
                    className="flex items-center gap-2 px-2 py-1 border"
                    style={{ borderColor: q.color + '30', backgroundColor: q.color + '06' }}>
                    <span className="font-mono text-[9px] uppercase shrink-0"
                      style={{ color: q.color + 'aa' }}>
                      {q.type === 'story' ? '★' : '·'}
                    </span>
                    <span className="font-rajdhani text-xs text-gray-300 truncate">{q.title}</span>
                  </div>
                ))}
                {districtQuests.quests.length > 4 && (
                  <div className="font-mono text-[9px] text-gray-600 px-2">
                    +{districtQuests.quests.length - 4} ещё
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Unlock progress */}
          {!isUnlocked(selected) && (
            <div className="border border-red-500/30 bg-red-500/5 p-3 space-y-2">
              <div className="font-mono text-xs text-red-400">
                🔒 Нужен LVL {selected.unlockLevel}
              </div>
              <div className="font-mono text-[10px] text-gray-600">
                Ещё {selected.unlockLevel - playerLevel} уровней
              </div>
              <div className="h-1.5 bg-black/60 rounded">
                <div className="h-full bg-red-500/60 rounded transition-all"
                  style={{ width: `${Math.min(100, (playerLevel / selected.unlockLevel) * 100)}%` }} />
              </div>
            </div>
          )}

          {/* Go button */}
          {isUnlocked(selected) && selected.section && (
            <button onClick={onGoTo}
              className="w-full py-3 font-orbitron text-sm border-2 transition-all flex items-center justify-center gap-2 active:scale-95"
              style={{ borderColor: selected.factionColor, color: selected.factionColor, backgroundColor: selected.factionColor + '18', boxShadow: `0 0 20px ${selected.factionColor}20` }}>
              <Icon name="MapPin" size={14} />
              ПЕРЕЙТИ В РАЙОН
            </button>
          )}

          <button onClick={onClose}
            className="w-full font-mono text-[10px] text-gray-700 hover:text-gray-400 transition-colors py-1">
            [закрыть]
          </button>
        </div>
      ) : (
        /* Default panel */
        <div className="border border-white/8 p-5 space-y-5" style={{ minHeight: '400px' }}>
          <div>
            <div className="font-mono text-[10px] text-gray-600 mb-3 tracking-widest">// СТАТУС АГЕНТА</div>
            {character && (
              <div className="space-y-2">
                {[
                  { label: 'Агент', val: character.name, color: '#00ffff' },
                  { label: 'Уровень', val: `LVL ${playerLevel}`, color: '#00ff41' },
                  { label: 'Открыто', val: `${DISTRICTS.filter(d => isUnlocked(d)).length}/${DISTRICTS.length}`, color: '#ffaa00' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between items-center border-b border-white/5 pb-1.5">
                    <span className="font-mono text-[10px] text-gray-600">{r.label}</span>
                    <span className="font-mono text-xs" style={{ color: r.color }}>{r.val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="font-mono text-[10px] text-gray-600 mb-2 tracking-widest">// ЛЕГЕНДА</div>
            <div className="space-y-2">
              {(Object.entries(TYPE_META) as [District['type'], typeof TYPE_META[District['type']]][]).map(([, m]) => (
                <div key={m.label} className="flex items-center gap-2">
                  <span className="text-sm w-5">{m.icon}</span>
                  <span className="font-mono text-[10px]" style={{ color: m.color }}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] text-gray-600 mb-2 tracking-widest">// КОРПОРАЦИИ</div>
            <div className="space-y-2">
              {FACTIONS.map(f => {
                const rep = reputation[f.id] ?? 0;
                return (
                  <div key={f.id} className="border p-2"
                    style={{ borderColor: f.color + '25', backgroundColor: f.color + '05' }}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-orbitron text-[10px]" style={{ color: f.color }}>
                        {f.emoji} {f.short}
                      </span>
                      <span className="font-mono text-[9px]" style={{ color: f.rep_color(rep) }}>
                        {rep > 0 ? '+' : ''}{rep} · {f.rep_label(rep)}
                      </span>
                    </div>
                    <div className="font-mono text-[9px] text-gray-600 mt-1 italic leading-snug">{f.motto}</div>
                  </div>
                );
              })}
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="font-mono text-[9px] leading-tight text-red-400">NEXUS</span>
                <span className="font-mono text-[9px] text-gray-700 flex-shrink-0">Антагонист</span>
              </div>
            </div>
          </div>

          <div className="border border-cyber-cyan/15 p-3">
            <div className="font-mono text-[10px] text-gray-600 mb-1.5">// УПРАВЛЕНИЕ</div>
            <div className="space-y-1">
              {[
                '🖱 Зажми и тяни — перемещение',
                '🖱 Колесо мыши — зум',
                '🖱 Клик на район — детали',
              ].map(t => (
                <div key={t} className="font-mono text-[9px] text-gray-700">{t}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}