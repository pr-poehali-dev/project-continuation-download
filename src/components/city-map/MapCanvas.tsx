import { useRef, useCallback, useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { useGame } from '@/lib/GameContext';
import { DISTRICTS, CONNECTIONS, TYPE_META, District, center, getConnection } from './data';

interface Props {
  selected: District | null;
  filteredIds: Set<string>;
  isUnlocked: (d: District) => boolean;
  onDistrictClick: (d: District, didDrag: boolean) => void;
}

const MAP_W = 1800;
const MAP_H = 1300;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.2;

export default function MapCanvas({ selected, filteredIds, isUnlocked, onDistrictClick }: Props) {
  const { character } = useGame();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Pan & zoom state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.55);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const didDrag = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const [tick, setTick] = useState(0); // для анимации курсора

  // Подогнать вид по размеру контейнера
  useEffect(() => {
    if (!wrapperRef.current) return;
    const w = wrapperRef.current.clientWidth;
    const h = wrapperRef.current.clientHeight;
    const fitZoom = Math.min(w / MAP_W, h / MAP_H) * 0.95;
    setZoom(fitZoom);
    setPan({
      x: (w - MAP_W * fitZoom) / 2,
      y: (h - MAP_H * fitZoom) / 2,
    });
  }, []);

  // Pulsing tick for animations
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 100);
    return () => clearInterval(id);
  }, []);

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

  // ── Reset / zoom controls ────────────────────────────────────
  const resetView = () => {
    if (!wrapperRef.current) return;
    const w = wrapperRef.current.clientWidth;
    const h = wrapperRef.current.clientHeight;
    const fitZoom = Math.min(w / MAP_W, h / MAP_H) * 0.95;
    setZoom(fitZoom);
    setPan({ x: (w - MAP_W * fitZoom) / 2, y: (h - MAP_H * fitZoom) / 2 });
  };
  const zoomIn = () => setZoom(z => Math.min(MAX_ZOOM, z * 1.2));
  const zoomOut = () => setZoom(z => Math.max(MIN_ZOOM, z / 1.2));
  const fitDistrict = (d: District) => {
    if (!wrapperRef.current) return;
    const w = wrapperRef.current.clientWidth;
    const h = wrapperRef.current.clientHeight;
    const z = 0.9;
    setZoom(z);
    setPan({ x: w / 2 - (d.x + d.w / 2) * z, y: h / 2 - (d.y + d.h / 2) * z });
  };

  // Focus on selected district
  useEffect(() => {
    if (selected) fitDistrict(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  return (
    <div className="flex-1 min-w-0 relative">
      {/* ── Top controls ── */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1">
        <CtrlBtn onClick={zoomIn} title="Приблизить">+</CtrlBtn>
        <CtrlBtn onClick={zoomOut} title="Отдалить">−</CtrlBtn>
        <CtrlBtn onClick={resetView} title="Сбросить вид"><Icon name="Maximize2" size={12} /></CtrlBtn>
      </div>

      {/* ── Compass ── */}
      <div className="absolute top-3 left-3 z-20 px-3 py-2 border border-cyber-cyan/25 bg-black/80 backdrop-blur">
        <div className="font-mono text-[9px] text-cyber-cyan/80 tracking-widest">// CODEGRID-9 · MAP</div>
        <div className="font-orbitron text-[10px] text-gray-500 mt-0.5">
          ZOOM <span className="text-cyber-cyan">{Math.round(zoom * 100)}%</span>
        </div>
      </div>

      {/* ── Mini-legend ── */}
      <div className="absolute bottom-3 left-3 z-20 px-3 py-2 border border-white/10 bg-black/80 backdrop-blur hidden sm:block">
        <div className="font-mono text-[9px] text-gray-600 mb-1 tracking-widest">// ЛЕГЕНДА</div>
        <div className="flex gap-3 flex-wrap">
          {(Object.entries(TYPE_META) as [District['type'], typeof TYPE_META[District['type']]][]).map(([t, m]) => (
            <span key={t} className="font-mono text-[9px] flex items-center gap-1" style={{ color: m.color + 'cc' }}>
              <span>{m.icon}</span>
              <span className="hidden md:inline">{m.label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Map wrapper ── */}
      <div
        ref={wrapperRef}
        className="border border-cyber-cyan/15 relative overflow-hidden"
        style={{
          height: '720px',
          cursor: isDragging.current ? 'grabbing' : 'grab',
          background: 'radial-gradient(ellipse at center, #0a121a 0%, #050a0e 70%, #02050a 100%)',
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
      >
        {/* CSS-grid фон поверх SVG для глубины */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
        <div className="absolute inset-0 scanlines opacity-30 pointer-events-none" />

        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          style={{ display: 'block', userSelect: 'none' }}
        >
          <defs>
            {/* Glows by faction */}
            {['#00ff41', '#00aaff', '#aa00ff', '#ff4060', '#ffff00', '#555'].map(c => (
              <filter key={c} id={`glow-${c.slice(1)}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            ))}
            {/* Animated gradient for connections */}
            <linearGradient id="conn-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00ffff" stopOpacity="0" />
              <stop offset="50%" stopColor="#00ffff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#00ffff" stopOpacity="0" />
              <animateTransform attributeName="gradientTransform" type="translate" from="-1 0" to="1 0" dur="3s" repeatCount="indefinite" />
            </linearGradient>
            {/* District inner pattern (subtle) */}
            <pattern id="dist-pattern" patternUnits="userSpaceOnUse" width="20" height="20">
              <path d="M 0 10 L 20 10" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
              <path d="M 10 0 L 10 20" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
            </pattern>
          </defs>

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* ═══ DECORATIVE BACKGROUND ═══════════════════════════ */}
            {/* Halos around major zones */}
            <circle cx={900} cy={580} r={520} fill="#00ffff" opacity="0.02" />
            <circle cx={900} cy={580} r={320} fill="#00ff41" opacity="0.025" />
            <circle cx={420} cy={370} r={260} fill="#ff4060" opacity="0.025" />
            <circle cx={1470} cy={370} r={260} fill="#00ff41" opacity="0.02" />
            <circle cx={690} cy={1000} r={260} fill="#aa00ff" opacity="0.025" />

            {/* Distant skyline silhouettes */}
            <SkylineSilhouette />

            {/* Vertical highway lines */}
            {[170, 690, 1210, 1470].map((x, i) => (
              <line key={i} x1={x} y1={0} x2={x} y2={MAP_H}
                stroke="#00ffff" strokeOpacity="0.04" strokeWidth="1" strokeDasharray="40,20" />
            ))}
            {[400, 920, 1130].map((y, i) => (
              <line key={i} x1={0} y1={y} x2={MAP_W} y2={y}
                stroke="#00ffff" strokeOpacity="0.04" strokeWidth="1" strokeDasharray="40,20" />
            ))}

            {/* ═══ CONNECTIONS ═══════════════════════════════════ */}
            {CONNECTIONS.map(([aId, bId], i) => {
              const a = DISTRICTS.find(d => d.id === aId);
              const b = DISTRICTS.find(d => d.id === bId);
              if (!a || !b) return null;
              const { x1, y1, x2, y2 } = getConnection(a, b);
              const bothUnlocked = isUnlocked(a) && isUnlocked(b);
              const bothVisible = filteredIds.has(aId) && filteredIds.has(bId);
              const opacity = !bothVisible ? 0.06 : bothUnlocked ? 0.4 : 0.15;
              const color = bothUnlocked ? '#00ffff' : '#444';
              const isHighlight = selected && (selected.id === aId || selected.id === bId);

              return (
                <g key={i}>
                  {/* Base line */}
                  <line x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={color}
                    strokeOpacity={isHighlight ? 0.85 : opacity}
                    strokeWidth={isHighlight ? 3 : 2}
                    strokeDasharray={bothUnlocked ? undefined : '8,8'}
                  />
                  {/* Animated pulse for unlocked highlighted */}
                  {isHighlight && bothUnlocked && (
                    <circle r="4" fill={a.factionColor}>
                      <animateMotion dur="2s" repeatCount="indefinite"
                        path={`M ${x1} ${y1} L ${x2} ${y2}`} />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* ═══ DISTRICTS ═════════════════════════════════════ */}
            {DISTRICTS.map(d => {
              const unlocked = isUnlocked(d);
              const isSelected = selected?.id === d.id;
              const dimmed = !filteredIds.has(d.id);
              const meta = TYPE_META[d.type];

              return (
                <DistrictBlock
                  key={d.id}
                  d={d}
                  meta={meta}
                  unlocked={unlocked}
                  isSelected={isSelected}
                  dimmed={dimmed}
                  tick={tick}
                  onClick={() => onDistrictClick(d, didDrag.current)}
                />
              );
            })}

            {/* ═══ PLAYER MARKER на хабе ═══════════════════════════ */}
            {character && (() => {
              const hub = DISTRICTS.find(d => d.id === 'undernet_hub');
              if (!hub) return null;
              const { cx, cy } = center(hub);
              return (
                <g>
                  <circle cx={cx} cy={cy + 80} r={14} fill="#00ffff" opacity="0.3">
                    <animate attributeName="r" values="14;22;14" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={cx} cy={cy + 80} r={8} fill="#00ffff" />
                  <text x={cx} y={cy + 85} fontSize={11} fill="#000" fontWeight="900"
                    textAnchor="middle" fontFamily="monospace">YOU</text>
                </g>
              );
            })()}
          </g>
        </svg>

        {/* ── Hint ── */}
        <div className="absolute bottom-3 right-3 z-10 px-3 py-1.5 border border-white/10 bg-black/70 backdrop-blur">
          <span className="font-mono text-[9px] text-gray-600">
            тяни мышью · колесо = зум · клик = район
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Кнопка управления ─────────────────────────────────────────────────────

function CtrlBtn({ onClick, title, children }: { onClick: () => void; title?: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title}
      className="w-9 h-9 border border-cyber-cyan/25 bg-black/80 backdrop-blur text-cyber-cyan/80 hover:text-cyber-cyan hover:border-cyber-cyan font-orbitron text-sm flex items-center justify-center transition-all">
      {children}
    </button>
  );
}

// ─── Силуэты дальних небоскрёбов ───────────────────────────────────────────

function SkylineSilhouette() {
  return (
    <g opacity="0.4" pointerEvents="none">
      {/* Дальний горизонт сверху */}
      {[
        { x: 50, w: 60, h: 80 }, { x: 130, w: 40, h: 50 }, { x: 200, w: 80, h: 100 },
        { x: 320, w: 50, h: 70 }, { x: 400, w: 30, h: 40 }, { x: 460, w: 70, h: 90 },
        { x: 560, w: 40, h: 60 }, { x: 640, w: 60, h: 85 }, { x: 740, w: 50, h: 65 },
        { x: 830, w: 80, h: 110 }, { x: 950, w: 40, h: 55 }, { x: 1020, w: 60, h: 80 },
        { x: 1120, w: 50, h: 70 }, { x: 1200, w: 70, h: 95 }, { x: 1320, w: 40, h: 60 },
        { x: 1410, w: 55, h: 75 }, { x: 1500, w: 80, h: 105 }, { x: 1620, w: 50, h: 65 },
        { x: 1700, w: 60, h: 85 },
      ].map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={MAP_H - b.h - 1240} width={b.w} height={b.h}
            fill="#0a1218" stroke="#00ffff" strokeOpacity="0.06" />
          {/* Random windows */}
          {Array.from({ length: 4 }).map((_, j) => (
            <rect key={j}
              x={b.x + 8 + (j % 2) * 18}
              y={MAP_H - b.h - 1240 + 10 + Math.floor(j / 2) * 18}
              width={6} height={4}
              fill="#00ffff" fillOpacity={(i + j) % 3 === 0 ? 0.18 : 0.05} />
          ))}
        </g>
      ))}
    </g>
  );
}

// ─── Один район ─────────────────────────────────────────────────────────────

interface DistrictBlockProps {
  d: District;
  meta: typeof TYPE_META[District['type']];
  unlocked: boolean;
  isSelected: boolean;
  dimmed: boolean;
  tick: number;
  onClick: () => void;
}

function DistrictBlock({ d, meta, unlocked, isSelected, dimmed, onClick }: DistrictBlockProps) {
  const accent = d.factionColor;
  const fillBg = dimmed ? '#050a0e'
    : unlocked
      ? (isSelected ? accent + '24' : accent + '0e')
      : '#0c0f12';
  const strokeColor = dimmed ? '#1a1a1a'
    : unlocked ? (isSelected ? accent : accent + '80')
    : '#2a2f35';
  const strokeW = isSelected ? 3 : 1.8;

  // Угловые засечки (clip-path style)
  const cornerSize = 16;

  return (
    <g
      style={{ opacity: dimmed ? 0.15 : 1, cursor: 'pointer' }}
      onClick={e => { e.stopPropagation(); onClick(); }}
    >
      {/* Outer pulsing glow when selected */}
      {isSelected && (
        <>
          <rect x={d.x - 10} y={d.y - 10} width={d.w + 20} height={d.h + 20}
            fill="none" stroke={accent} strokeWidth={1} opacity={0.4}>
            <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
          </rect>
          <rect x={d.x - 20} y={d.y - 20} width={d.w + 40} height={d.h + 40}
            fill="none" stroke={accent} strokeWidth={0.5} opacity={0.2}>
            <animate attributeName="opacity" values="0.2;0;0.2" dur="2s" repeatCount="indefinite" />
          </rect>
        </>
      )}

      {/* Soft drop-shadow */}
      <rect x={d.x + 4} y={d.y + 4} width={d.w} height={d.h}
        fill="black" opacity={0.5} />

      {/* Main background */}
      <rect x={d.x} y={d.y} width={d.w} height={d.h}
        fill={fillBg}
        stroke="none"
      />

      {/* Inner subtle pattern */}
      {unlocked && <rect x={d.x} y={d.y} width={d.w} height={d.h} fill="url(#dist-pattern)" />}

      {/* Faction color top bar */}
      <rect x={d.x} y={d.y} width={d.w} height={4} fill={unlocked ? accent : '#222'} opacity={unlocked ? 1 : 0.4} />

      {/* Faction color glow line on top (subtle) */}
      {unlocked && (
        <rect x={d.x} y={d.y + 4} width={d.w} height={1} fill={accent} opacity={0.4} />
      )}

      {/* Main border */}
      <rect x={d.x} y={d.y} width={d.w} height={d.h}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeW}
      />

      {/* Corner accents (TL, TR, BL, BR) */}
      {unlocked && (
        <>
          {/* Top-left */}
          <polyline points={`${d.x},${d.y + cornerSize} ${d.x},${d.y} ${d.x + cornerSize},${d.y}`}
            fill="none" stroke={accent} strokeWidth={2.5} opacity={isSelected ? 1 : 0.75} />
          {/* Top-right */}
          <polyline points={`${d.x + d.w - cornerSize},${d.y} ${d.x + d.w},${d.y} ${d.x + d.w},${d.y + cornerSize}`}
            fill="none" stroke={accent} strokeWidth={2.5} opacity={isSelected ? 1 : 0.75} />
          {/* Bottom-left */}
          <polyline points={`${d.x},${d.y + d.h - cornerSize} ${d.x},${d.y + d.h} ${d.x + cornerSize},${d.y + d.h}`}
            fill="none" stroke={accent} strokeWidth={2.5} opacity={isSelected ? 1 : 0.75} />
          {/* Bottom-right */}
          <polyline points={`${d.x + d.w - cornerSize},${d.y + d.h} ${d.x + d.w},${d.y + d.h} ${d.x + d.w},${d.y + d.h - cornerSize}`}
            fill="none" stroke={accent} strokeWidth={2.5} opacity={isSelected ? 1 : 0.75} />
        </>
      )}

      {/* Locked overlay */}
      {!unlocked && (
        <>
          <rect x={d.x} y={d.y + 4} width={d.w} height={d.h - 4} fill="black" opacity={0.55} />
          {/* Diagonal stripes */}
          <pattern id={`lock-${d.id}`} patternUnits="userSpaceOnUse" width="14" height="14" patternTransform="rotate(45)">
            <rect width="14" height="14" fill="transparent" />
            <line x1="0" y1="0" x2="0" y2="14" stroke="#ffaa00" strokeOpacity="0.06" strokeWidth="6" />
          </pattern>
          <rect x={d.x} y={d.y + 4} width={d.w} height={d.h - 4} fill={`url(#lock-${d.id})`} />
        </>
      )}

      {/* Header: icon + faction tag */}
      <g>
        {/* Type icon, top-left */}
        <text x={d.x + 14} y={d.y + 36} fontSize={24} opacity={unlocked ? 1 : 0.35}>
          {unlocked ? meta.icon : '🔒'}
        </text>

        {/* LVL badge top-right */}
        <g>
          <rect x={d.x + d.w - 58} y={d.y + 14} width={48} height={18}
            fill="#000" fillOpacity={0.65}
            stroke={accent} strokeOpacity={unlocked ? 0.6 : 0.3} strokeWidth={1} />
          <text x={d.x + d.w - 34} y={d.y + 27}
            fontSize={10}
            fill={unlocked ? accent : '#666'}
            fontFamily="monospace" fontWeight="bold"
            textAnchor="middle">
            LVL {d.unlockLevel}
          </text>
        </g>
      </g>

      {/* District name (big) */}
      <text x={d.x + 14} y={d.y + 72}
        fontSize={15}
        fill={unlocked ? '#ffffff' : '#555'}
        fontFamily="Orbitron, monospace"
        fontWeight="900"
        style={{ letterSpacing: '0.5px' }}>
        {clipText(d.name, 18)}
      </text>

      {/* Subtitle */}
      <text x={d.x + 14} y={d.y + 92}
        fontSize={11}
        fill={unlocked ? accent + 'cc' : '#444'}
        fontFamily="monospace">
        {clipText(d.subtitle, 26)}
      </text>

      {/* Bottom info bar */}
      <line x1={d.x + 14} y1={d.y + d.h - 30} x2={d.x + d.w - 14} y2={d.y + d.h - 30}
        stroke={accent} strokeOpacity={unlocked ? 0.25 : 0.1} strokeWidth={1} />

      {/* Faction tag bottom */}
      <text x={d.x + 14} y={d.y + d.h - 14}
        fontSize={9}
        fill={unlocked ? accent + 'cc' : '#444'}
        fontFamily="monospace"
        fontWeight="bold">
        [{shortFaction(d.faction)}]
      </text>

      {/* Type label bottom-right */}
      <text x={d.x + d.w - 14} y={d.y + d.h - 14}
        fontSize={9}
        fill={unlocked ? '#888' : '#333'}
        fontFamily="monospace"
        textAnchor="end">
        {meta.label.toUpperCase()}
      </text>

      {/* Selected indicator (left bar) */}
      {isSelected && (
        <rect x={d.x - 4} y={d.y} width={3} height={d.h} fill={accent}>
          <animate attributeName="opacity" values="1;0.4;1" dur="1.2s" repeatCount="indefinite" />
        </rect>
      )}

      {/* Hidden type marker */}
      {d.type === 'hidden' && unlocked && (
        <text x={d.x + d.w / 2} y={d.y + d.h / 2 + 10}
          fontSize={32}
          fill={accent}
          opacity={0.15}
          textAnchor="middle"
          fontFamily="monospace">
          ???
        </text>
      )}
    </g>
  );
}

// ─── Утилиты ────────────────────────────────────────────────────────────────

function clipText(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

function shortFaction(f: string): string {
  if (f === 'THE ARCHIVE') return 'ARCHIVE';
  if (f === 'BLACK SYNTAX') return 'B.SYNTAX';
  if (f === 'ORDER OF CLEAN CODE') return 'ORDER';
  return f;
}
