import { useRef, useCallback, useState } from 'react';
import Icon from '@/components/ui/icon';
import { useGame } from '@/lib/GameContext';
import { DISTRICTS, CONNECTIONS, TYPE_META, District, center, getConnection } from './data';

interface Props {
  selected: District | null;
  filteredIds: Set<string>;
  isUnlocked: (d: District) => boolean;
  onDistrictClick: (d: District, didDrag: boolean) => void;
}

const MAP_W = 1400;
const MAP_H = 1000;
const MIN_ZOOM = 0.35;
const MAX_ZOOM = 2.0;

export default function MapCanvas({ selected, filteredIds, isUnlocked, onDistrictClick }: Props) {
  const { character } = useGame();

  // Pan & zoom state
  const [pan, setPan] = useState({ x: -220, y: -80 });
  const [zoom, setZoom] = useState(0.72);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const didDrag = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // ── Mouse pan ────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    didDrag.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    e.preventDefault();
  }, [pan]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag.current = true;
    setPan({ x: dragStart.current.panX + dx, y: dragStart.current.panY + dy });
  }, []);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // ── Wheel zoom ───────────────────────────────────────────────
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * delta)));
  }, []);

  // ── Reset view ───────────────────────────────────────────────
  const resetView = () => { setPan({ x: -220, y: -80 }); setZoom(0.72); };
  const zoomIn = () => setZoom(z => Math.min(MAX_ZOOM, z * 1.2));
  const zoomOut = () => setZoom(z => Math.max(MIN_ZOOM, z / 1.2));

  return (
    <div className="flex-1 min-w-0 relative">
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1">
        <button onClick={zoomIn}
          className="w-8 h-8 border border-white/20 bg-black/80 text-white font-orbitron text-sm flex items-center justify-center hover:border-cyber-cyan/50 transition-all">
          +
        </button>
        <button onClick={zoomOut}
          className="w-8 h-8 border border-white/20 bg-black/80 text-white font-orbitron text-sm flex items-center justify-center hover:border-cyber-cyan/50 transition-all">
          −
        </button>
        <button onClick={resetView}
          className="w-8 h-8 border border-white/20 bg-black/80 text-gray-500 hover:text-white flex items-center justify-center hover:border-cyber-cyan/50 transition-all"
          title="Сбросить вид">
          <Icon name="Maximize2" size={12} />
        </button>
      </div>

      {/* Map wrapper */}
      <div
        className="border border-cyber-cyan/15 bg-black/70 relative overflow-hidden"
        style={{ height: '540px', cursor: isDragging.current ? 'grabbing' : 'grab' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
      >
        <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none" />

        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          style={{ display: 'block', userSelect: 'none' }}
        >
          <defs>
            <filter id="glow-green">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glow-red">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* ── Atmospheric background ── */}
            <rect x={0} y={0} width={MAP_W} height={MAP_H} fill="transparent" />
            <circle cx={630} cy={450} r={350} fill="#00ffff03" />
            <circle cx={630} cy={450} r={200} fill="#00ffff04" />

            {/* ── Connections ── */}
            {CONNECTIONS.map(([aId, bId], i) => {
              const a = DISTRICTS.find(d => d.id === aId);
              const b = DISTRICTS.find(d => d.id === bId);
              if (!a || !b) return null;
              const { x1, y1, x2, y2 } = getConnection(a, b);
              const bothVisible = filteredIds.has(aId) && filteredIds.has(bId);
              return (
                <line key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={bothVisible ? '#00ffff18' : '#00ffff06'}
                  strokeWidth="2"
                  strokeDasharray="10,6"
                />
              );
            })}

            {/* ── Districts ── */}
            {DISTRICTS.map(d => {
              const unlocked = isUnlocked(d);
              const isSelected = selected?.id === d.id;
              const dimmed = !filteredIds.has(d.id);
              const meta = TYPE_META[d.type];
              const { cx, cy } = center(d);

              const fillColor = dimmed ? '#050a0e' : unlocked
                ? isSelected ? d.factionColor + '28' : d.factionColor + '14'
                : '#0c0c0c';
              const strokeColor = dimmed ? '#1a1a1a' : unlocked
                ? isSelected ? d.factionColor : d.factionColor + '70'
                : '#2a2a2a';
              const strokeW = isSelected ? 3 : 1.5;

              return (
                <g key={d.id}
                  style={{ opacity: dimmed ? 0.15 : 1, cursor: 'pointer' }}
                  onClick={e => { e.stopPropagation(); onDistrictClick(d, didDrag.current); }}
                >
                  {/* Outer glow for selected */}
                  {isSelected && (
                    <rect
                      x={d.x - 6} y={d.y - 6}
                      width={d.w + 12} height={d.h + 12}
                      rx={4} fill="none"
                      stroke={d.factionColor}
                      strokeWidth={1}
                      opacity={0.3}
                    >
                      <animate attributeName="opacity" values="0.3;0.05;0.3" dur="1.8s" repeatCount="indefinite" />
                    </rect>
                  )}

                  {/* Main block */}
                  <rect
                    x={d.x} y={d.y}
                    width={d.w} height={d.h}
                    rx={3}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeW}
                  />

                  {/* Corner accent top-left */}
                  {unlocked && (
                    <polyline
                      points={`${d.x},${d.y + 16} ${d.x},${d.y} ${d.x + 16},${d.y}`}
                      fill="none"
                      stroke={d.factionColor}
                      strokeWidth={2}
                      opacity={0.6}
                    />
                  )}
                  {/* Corner accent bottom-right */}
                  {unlocked && (
                    <polyline
                      points={`${d.x + d.w},${d.y + d.h - 16} ${d.x + d.w},${d.y + d.h} ${d.x + d.w - 16},${d.y + d.h}`}
                      fill="none"
                      stroke={d.factionColor}
                      strokeWidth={2}
                      opacity={0.6}
                    />
                  )}

                  {/* Dark overlay for locked */}
                  {!unlocked && (
                    <rect x={d.x} y={d.y} width={d.w} height={d.h} rx={3} fill="rgba(0,0,0,0.65)" />
                  )}

                  {/* Icon top-left */}
                  <text x={d.x + 10} y={d.y + 22} fontSize={18} opacity={unlocked ? 0.9 : 0.3}>
                    {unlocked ? meta.icon : '🔒'}
                  </text>

                  {/* Faction label top-right */}
                  <text
                    x={d.x + d.w - 8} y={d.y + 16}
                    textAnchor="end"
                    fontSize={8}
                    fill={unlocked ? d.factionColor + 'aa' : '#333'}
                    fontFamily="monospace"
                    style={{ userSelect: 'none' }}>
                    {d.faction}
                  </text>

                  {/* Main name — centered */}
                  <text
                    x={cx} y={cy - 6}
                    textAnchor="middle"
                    fontSize={13}
                    fontWeight="bold"
                    fill={unlocked ? '#ffffff' : '#444'}
                    fontFamily="'Orbitron', monospace"
                    style={{ userSelect: 'none' }}>
                    {d.name}
                  </text>

                  {/* Subtitle */}
                  <text
                    x={cx} y={cy + 12}
                    textAnchor="middle"
                    fontSize={9}
                    fill={unlocked ? '#888' : '#333'}
                    fontFamily="monospace"
                    style={{ userSelect: 'none' }}>
                    {d.subtitle}
                  </text>

                  {/* Type badge bottom */}
                  {unlocked ? (
                    <text
                      x={cx} y={d.y + d.h - 10}
                      textAnchor="middle"
                      fontSize={8}
                      fill={meta.color}
                      fontFamily="monospace"
                      style={{ userSelect: 'none' }}>
                      {meta.label.toUpperCase()}
                    </text>
                  ) : (
                    <text
                      x={cx} y={d.y + d.h - 10}
                      textAnchor="middle"
                      fontSize={8}
                      fill="#444"
                      fontFamily="monospace"
                      style={{ userSelect: 'none' }}>
                      ОТКРОЕТСЯ LVL {d.unlockLevel}
                    </text>
                  )}
                </g>
              );
            })}

            {/* ── Player position dot ── */}
            {character && (() => {
              const hub = DISTRICTS.find(d => d.id === 'undernet_hub')!;
              const { cx, cy } = center(hub);
              return (
                <g>
                  <circle cx={cx} cy={cy - 28} r={8} fill="#00ffff" opacity={0.15}>
                    <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={cx} cy={cy - 28} r={5} fill="#00ffff" opacity={0.8} />
                  <text x={cx + 8} y={cy - 24} fontSize={9} fill="#00ffff" fontFamily="monospace">YOU</text>
                </g>
              );
            })()}
          </g>
        </svg>

        {/* Mini compass */}
        <div className="absolute bottom-3 left-3 font-mono text-[9px] text-gray-700 border border-gray-800 px-2 py-1 bg-black/90 pointer-events-none">
          ↑ NEXUS · ← ARCHIVE · → SYNTAX · ↓ ORDER
        </div>

        {/* Zoom indicator */}
        <div className="absolute bottom-3 right-12 font-mono text-[10px] text-gray-700 pointer-events-none">
          {Math.round(zoom * 100)}%
        </div>
      </div>
    </div>
  );
}
