import { useState, useCallback, useEffect } from 'react';
import { useGame } from '@/lib/GameContext';
import { api } from '@/lib/api';
import { pushNotif } from './Notifications';
import { DISTRICTS, FACTIONS, TYPE_META, District } from './city-map/data';
import FactionHud from './city-map/FactionHud';
import MapCanvas from './city-map/MapCanvas';
import InfoPanel from './city-map/InfoPanel';

// ─── Главный компонент ───────────────────────────────────────────────────────

export default function CityMap({ onNavigate }: { onNavigate?: (s: string) => void }) {
  const { character } = useGame();
  const playerLevel = character?.level || 1;

  const [selected, setSelected] = useState<District | null>(null);
  const [filter, setFilter] = useState<District['type'] | 'all'>('all');

  // ── Фракции: моя репутация + глобальное влияние ─────────────
  const [reputation, setReputation] = useState<Record<string, number>>({ archive: 0, black_syntax: 0, order: 0 });
  const [influence, setInfluence]   = useState<Record<string, number>>({ archive: 1000, black_syntax: 800, order: 700 });
  const [factionLoading, setFactionLoading] = useState<string | null>(null);

  const loadFactions = useCallback(async () => {
    const res = await api.factionState();
    if (res && !res.error) {
      setReputation(res.reputation || {});
      setInfluence(res.influence || {});
    }
  }, []);

  useEffect(() => { loadFactions(); }, [loadFactions]);

  const totalInfluence = Math.max(1, Object.values(influence).reduce((a, b) => a + b, 0));

  const supportFaction = async (factionId: string) => {
    setFactionLoading(factionId);
    const res = await api.factionGain(factionId, 25);
    setFactionLoading(null);
    if (res && !res.error) {
      const f = FACTIONS.find(x => x.id === factionId);
      pushNotif({
        type: 'quest',
        title: `+25 репутации`,
        body: `${f?.short ?? factionId} ценит твой вклад`,
        icon: f?.emoji ?? '⭐',
        color: f?.color ?? '#00ff41',
      });
      loadFactions();
    }
  };

  const isUnlocked = (d: District) => playerLevel >= d.unlockLevel;

  // ── District click (only if didn't drag) ─────────────────────
  const handleDistrictClick = useCallback((d: District, didDrag: boolean) => {
    if (didDrag) return;
    if (!isUnlocked(d)) { setSelected(d); return; }
    setSelected(d);
  }, [isUnlocked]);

  const goTo = () => {
    if (selected?.section && onNavigate) onNavigate(selected.section);
  };

  const filteredIds = new Set(
    filter === 'all' ? DISTRICTS.map(d => d.id) : DISTRICTS.filter(d => d.type === filter).map(d => d.id)
  );

  return (
    <section className="py-6 px-3 lg:px-6 min-h-screen relative">
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
      <div className="max-w-[1600px] mx-auto relative z-10">

        {/* Header */}
        <div className="mb-4 flex items-end justify-between flex-wrap gap-3">
          <div>
            <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-1">
              // КАРТА ГОРОДА · CODEGRID-9 · 2087
            </div>
            <h2 className="font-orbitron text-2xl lg:text-3xl text-white">
              КАРТА <span className="text-cyber-cyan">CODEGRID-9</span>
            </h2>
            <p className="text-gray-600 font-mono text-xs mt-0.5">
              LVL <span className="text-cyber-green">{playerLevel}</span>
              {' · '}
              <span className="text-gray-700">
                {DISTRICTS.filter(d => isUnlocked(d)).length}/{DISTRICTS.length} районов открыто
              </span>
            </p>
          </div>
          {/* Filters */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <button onClick={() => setFilter('all')}
              className="font-mono text-[10px] px-2.5 py-1 border transition-all"
              style={{ borderColor: filter === 'all' ? '#00ffff' : '#ffffff12', color: filter === 'all' ? '#00ffff' : '#555', backgroundColor: filter === 'all' ? '#00ffff10' : 'transparent' }}>
              ВСЕ
            </button>
            {(Object.keys(TYPE_META) as District['type'][]).map(t => (
              <button key={t} onClick={() => setFilter(t)}
                className="font-mono text-[10px] px-2.5 py-1 border transition-all"
                title={TYPE_META[t].label}
                style={{ borderColor: filter === t ? TYPE_META[t].color : '#ffffff12', color: filter === t ? TYPE_META[t].color : '#555', backgroundColor: filter === t ? TYPE_META[t].color + '10' : 'transparent' }}>
                {TYPE_META[t].icon}
              </button>
            ))}
          </div>
        </div>

        {/* ── FACTION HUD ── */}
        <FactionHud
          reputation={reputation}
          influence={influence}
          totalInfluence={totalInfluence}
          factionLoading={factionLoading}
          onReload={loadFactions}
          onSupport={supportFaction}
        />

        <div className="flex flex-col lg:flex-row gap-4">
          {/* ── MAP CANVAS ── */}
          <MapCanvas
            selected={selected}
            filteredIds={filteredIds}
            isUnlocked={isUnlocked}
            onDistrictClick={handleDistrictClick}
          />

          {/* ── INFO PANEL ── */}
          <InfoPanel
            selected={selected}
            playerLevel={playerLevel}
            reputation={reputation}
            factionLoading={factionLoading}
            isUnlocked={isUnlocked}
            onSupport={supportFaction}
            onGoTo={goTo}
            onClose={() => setSelected(null)}
          />
        </div>

        {/* Mobile list */}
        <div className="mt-5 lg:hidden">
          <div className="font-mono text-[10px] text-gray-600 mb-3 tracking-widest">// СПИСОК РАЙОНОВ</div>
          <div className="grid grid-cols-2 gap-2">
            {DISTRICTS.filter(d => filter === 'all' || d.type === filter).map(d => {
              const unlocked = isUnlocked(d);
              return (
                <button key={d.id} onClick={() => setSelected(d)}
                  className="p-3 border text-left transition-all"
                  style={{ borderColor: unlocked ? d.factionColor + '40' : '#ffffff08', opacity: unlocked ? 1 : 0.5 }}>
                  <div className="text-lg mb-1">{unlocked ? TYPE_META[d.type].icon : '🔒'}</div>
                  <div className="font-orbitron text-[10px] font-bold leading-tight" style={{ color: unlocked ? d.factionColor : '#555' }}>
                    {d.name}
                  </div>
                  <div className="font-mono text-[9px] mt-0.5" style={{ color: unlocked ? '#666' : '#333' }}>
                    {unlocked ? d.subtitle : `LVL ${d.unlockLevel}`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}