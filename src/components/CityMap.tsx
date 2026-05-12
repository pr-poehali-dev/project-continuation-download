import { useState, useRef, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { useGame } from '@/lib/GameContext';

// ─── Типы ────────────────────────────────────────────────────────────────────

interface District {
  id: string;
  name: string;
  subtitle: string;
  faction: string;
  factionColor: string;
  type: 'safe' | 'learning' | 'battle' | 'dungeon' | 'boss' | 'hidden';
  unlockLevel: number;
  lore: string;
  rewards: string;
  section?: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

// ─── Районы города CodeGrid-9 ────────────────────────────────────────────────
// Карта 1400×1000px — крупные блоки, много пространства

const DISTRICTS: District[] = [
  // ── ЦЕНТР (LVL 1) ─────────────────────────────────────────────
  {
    id: 'undernet_hub',
    name: 'Undernet Hub',
    subtitle: 'База The Archive',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    type: 'safe',
    unlockLevel: 1,
    lore: 'Штаб сопротивления в CodeGrid-9. Безопасная зона — NEXUS сюда не добирается. Отсюда начинается путь каждого агента.',
    rewards: 'Стартовые квесты · Магазин Archive',
    section: 'home',
    x: 530, y: 380, w: 200, h: 130,
  },
  // ── БЛИЖНИЙ ПОЯС (LVL 1-5) ────────────────────────────────────
  {
    id: 'syntax_street',
    name: 'Syntax Street',
    subtitle: 'Учебный квартал',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    type: 'learning',
    unlockLevel: 1,
    lore: 'Уличные академии нетраннеров. Здесь учат базовому Python: переменные, условия, циклы. Первая остановка каждого агента.',
    rewards: '+100–200 XP · Уроки АКТ I',
    section: 'lessons',
    x: 250, y: 280, w: 190, h: 120,
  },
  {
    id: 'loop_arena',
    name: 'Loop Arena',
    subtitle: 'Тренировочный данж',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    type: 'battle',
    unlockLevel: 2,
    lore: 'Тренировочная арена для Code Combat. Базовые дроны NEXUS — идеальные противники для новичков.',
    rewards: '+150–400 XP · 80–200 Creds',
    section: 'battle',
    x: 840, y: 280, w: 190, h: 120,
  },
  {
    id: 'black_market',
    name: 'Black Market',
    subtitle: 'Нелегальная торговля',
    faction: 'BLACK SYNTAX',
    factionColor: '#aa00ff',
    type: 'safe',
    unlockLevel: 1,
    lore: 'Подпольный рынок имплантов, лутбоксов и запрещённых данных. Продавцы не задают вопросов.',
    rewards: 'Glitch Box · Neon Core · Void Relic',
    section: 'shop',
    x: 530, y: 560, w: 200, h: 120,
  },
  // ── СРЕДНИЙ ПОЯС (LVL 5-15) ───────────────────────────────────
  {
    id: 'nexus_alpha',
    name: 'NEXUS-Alpha Zone',
    subtitle: 'Корпоративный патруль',
    faction: 'NEXUS',
    factionColor: '#ff4060',
    type: 'dungeon',
    unlockLevel: 5,
    lore: 'Первый корпоративный сектор NEXUS. Дроны патрулируют периметр и проверяют знание базового синтаксиса.',
    rewards: '+200 XP · 150 Creds · Glitch Box',
    section: 'dungeon',
    x: 100, y: 380, w: 190, h: 120,
  },
  {
    id: 'function_factory',
    name: 'Function Factory',
    subtitle: 'Подземная лаборатория',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    type: 'learning',
    unlockLevel: 5,
    lore: 'Заброшенный завод, перестроенный под лабораторию функций и модулей. The Archive проводит здесь продвинутые курсы.',
    rewards: '+300 XP · Уроки АКТ II',
    section: 'lessons',
    x: 990, y: 380, w: 190, h: 120,
  },
  {
    id: 'data_docks',
    name: 'Data Docks',
    subtitle: 'Порт данных',
    faction: 'BLACK SYNTAX',
    factionColor: '#aa00ff',
    type: 'battle',
    unlockLevel: 7,
    lore: 'Подпольный порт для передачи запрещённых данных. Black Syntax нанимает агентов для рейдов против NEXUS-конвоев.',
    rewards: '+400 XP · 200 Creds',
    section: 'battle',
    x: 530, y: 730, w: 200, h: 120,
  },
  {
    id: 'order_temple',
    name: 'Temple of Clean Code',
    subtitle: 'Святилище Order',
    faction: 'ORDER OF CLEAN CODE',
    factionColor: '#00aaff',
    type: 'learning',
    unlockLevel: 8,
    lore: 'Сакральное место Order of the Clean Code. Здесь почитают ООП, паттерны и элегантную архитектуру кода.',
    rewards: '+350–500 XP · Уроки АКТ III',
    section: 'lessons',
    x: 100, y: 560, w: 190, h: 120,
  },
  {
    id: 'syntax_colosseum',
    name: 'Syntax Colosseum',
    subtitle: 'Арена рейтинга',
    faction: 'NEXUS',
    factionColor: '#ff4060',
    type: 'battle',
    unlockLevel: 10,
    lore: 'NEXUS устраивает публичные кодовые турниры для контроля населения. The Archive использует это как прикрытие.',
    rewards: 'Рейтинг · Сезонные награды',
    section: 'leaderboard',
    x: 990, y: 560, w: 190, h: 120,
  },
  // ── ДАЛЬНИЙ ПОЯС (LVL 15-30) ──────────────────────────────────
  {
    id: 'nexus_beta',
    name: 'NEXUS-Beta Zone',
    subtitle: 'Корпоративный квартал',
    faction: 'NEXUS',
    factionColor: '#ff4060',
    type: 'dungeon',
    unlockLevel: 15,
    lore: 'Крупные офисы NEXUS. Усиленная охрана с алгоритмической проверкой. Знание циклов и функций обязательно.',
    rewards: '+500 XP · 350 Creds · Neon Core',
    section: 'dungeon',
    x: 100, y: 160, w: 190, h: 110,
  },
  {
    id: 'archive_vault',
    name: 'Archive Vault',
    subtitle: 'Хранилище знаний',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    type: 'dungeon',
    unlockLevel: 15,
    lore: 'Секретное хранилище The Archive. Только лучшие агенты допускаются к знаниям уровня Ω.',
    rewards: '+1200 XP · 800 Creds · Void Relic',
    section: 'dungeon',
    x: 990, y: 160, w: 190, h: 110,
  },
  {
    id: 'syntax_slums',
    name: 'Syntax Slums',
    subtitle: 'Трущобы нетраннеров',
    faction: 'BLACK SYNTAX',
    factionColor: '#aa00ff',
    type: 'battle',
    unlockLevel: 18,
    lore: 'Опасные кварталы под контролем Black Syntax. Высокая прибыль, высокий риск.',
    rewards: '+600 XP · 400 Creds',
    section: 'battle',
    x: 100, y: 730, w: 190, h: 110,
  },
  {
    id: 'server_farm',
    name: 'Server Farm Omega',
    subtitle: 'Серверный кластер',
    faction: 'NEXUS',
    factionColor: '#ff4060',
    type: 'battle',
    unlockLevel: 20,
    lore: 'Центральный узел обработки данных NEXUS. Охраняется элитными ИИ-агентами класса Sentinel.',
    rewards: '+800 XP · 500 Creds · Rare Drop',
    section: 'battle',
    x: 990, y: 730, w: 190, h: 110,
  },
  // ── БОССЫ (LVL 30+) ───────────────────────────────────────────
  {
    id: 'nexus_prime',
    name: 'NEXUS-Prime Tower',
    subtitle: 'Штаб-квартира NEXUS',
    faction: 'NEXUS',
    factionColor: '#ff4060',
    type: 'boss',
    unlockLevel: 30,
    lore: 'Сердце корпорации. Финальный данж Акта III. Здесь хранится ключ от глобальной нейросети CodeGrid-9.',
    rewards: '+3000 XP · 2000 Creds · Mythic Item',
    section: 'dungeon',
    x: 530, y: 80, w: 200, h: 130,
  },
  // ── ЗАСЕКРЕЧЕННЫЕ (LVL 40-50) ─────────────────────────────────
  {
    id: 'void_sector',
    name: 'Void Sector',
    subtitle: '??? · АКТ IV',
    faction: '???',
    factionColor: '#555',
    type: 'hidden',
    unlockLevel: 40,
    lore: 'Засекреченный сектор. Сигнал идёт из ниоткуда. Даже The Archive не знает что там.',
    rewards: '???',
    section: undefined,
    x: 250, y: 80, w: 190, h: 110,
  },
  {
    id: 'neural_core',
    name: 'Neural Core',
    subtitle: 'Глобальная нейросеть',
    faction: 'СИСТЕМА',
    factionColor: '#ffff00',
    type: 'hidden',
    unlockLevel: 50,
    lore: 'АКТ IV — Перезагрузка. Контроль над нейросетью изменит CodeGrid-9 и весь мир навсегда.',
    rewards: 'Финал игры · True Ending',
    section: undefined,
    x: 840, y: 80, w: 190, h: 110,
  },
];

// ─── Соединения между районами ───────────────────────────────────────────────

const CONNECTIONS = [
  // centre connections
  ['undernet_hub', 'syntax_street'],
  ['undernet_hub', 'loop_arena'],
  ['undernet_hub', 'black_market'],
  // mid ring
  ['syntax_street', 'nexus_alpha'],
  ['syntax_street', 'order_temple'],
  ['loop_arena', 'function_factory'],
  ['loop_arena', 'syntax_colosseum'],
  ['black_market', 'data_docks'],
  ['nexus_alpha', 'nexus_beta'],
  ['function_factory', 'archive_vault'],
  ['data_docks', 'syntax_slums'],
  ['data_docks', 'server_farm'],
  // outer ring → bosses
  ['nexus_beta', 'nexus_prime'],
  ['archive_vault', 'nexus_prime'],
  ['nexus_prime', 'void_sector'],
  ['nexus_prime', 'neural_core'],
];

// ─── Иконки типов ────────────────────────────────────────────────────────────

const TYPE_META: Record<District['type'], { icon: string; label: string; color: string }> = {
  safe:     { icon: '🏠', label: 'Безопасная зона',  color: '#00ff41' },
  learning: { icon: '📡', label: 'Обучение',          color: '#00aaff' },
  battle:   { icon: '⚔️', label: 'Бой',              color: '#ff00ff' },
  dungeon:  { icon: '🏰', label: 'Подземелье',        color: '#ffaa00' },
  boss:     { icon: '💀', label: 'Босс',              color: '#ff4060' },
  hidden:   { icon: '❓', label: 'Засекречено',       color: '#444' },
};

// ─── Центры блоков ───────────────────────────────────────────────────────────

function center(d: District) {
  return { cx: d.x + d.w / 2, cy: d.y + d.h / 2 };
}

function getConnection(a: District, b: District) {
  const ca = center(a);
  const cb = center(b);
  return { x1: ca.cx, y1: ca.cy, x2: cb.cx, y2: cb.cy };
}

// ─── Главный компонент ───────────────────────────────────────────────────────

export default function CityMap({ onNavigate }: { onNavigate?: (s: string) => void }) {
  const { character } = useGame();
  const playerLevel = character?.level || 1;

  const [selected, setSelected] = useState<District | null>(null);
  const [filter, setFilter] = useState<District['type'] | 'all'>('all');

  // Pan & zoom state
  const [pan, setPan] = useState({ x: -220, y: -80 });
  const [zoom, setZoom] = useState(0.72);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const didDrag = useRef(false); // различаем drag от click
  const svgRef = useRef<SVGSVGElement>(null);

  const MAP_W = 1400;
  const MAP_H = 1000;
  const MIN_ZOOM = 0.35;
  const MAX_ZOOM = 2.0;

  const isUnlocked = (d: District) => playerLevel >= d.unlockLevel;

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

  // ── District click (only if didn't drag) ─────────────────────
  const handleDistrictClick = useCallback((d: District) => {
    if (didDrag.current) return;
    if (!isUnlocked(d)) { setSelected(d); return; }
    setSelected(d);
  }, [isUnlocked]);

  const goTo = () => {
    if (selected?.section && onNavigate) onNavigate(selected.section);
  };

  // ── Reset view ───────────────────────────────────────────────
  const resetView = () => { setPan({ x: -220, y: -80 }); setZoom(0.72); };
  const zoomIn = () => setZoom(z => Math.min(MAX_ZOOM, z * 1.2));
  const zoomOut = () => setZoom(z => Math.max(MIN_ZOOM, z / 1.2));

  const filteredIds = new Set(
    filter === 'all' ? DISTRICTS.map(d => d.id) : DISTRICTS.filter(d => d.type === filter).map(d => d.id)
  );

  return (
    <section className="py-8 px-4 lg:px-6 min-h-screen relative">
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <div className="mb-4 flex items-end justify-between flex-wrap gap-3">
          <div>
            <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-1">
              // КАРТА ГОРОДА · CODEGRID-9 · 2087
            </div>
            <h2 className="font-orbitron text-2xl text-white">
              КАРТА <span className="text-cyber-cyan">CODEGRID-9</span>
            </h2>
            <p className="text-gray-600 font-mono text-xs mt-0.5">
              LVL <span className="text-cyber-green">{playerLevel}</span>
              {' · '}
              <span className="text-gray-700">
                {DISTRICTS.filter(d => isUnlocked(d)).length}/{DISTRICTS.length} районов
              </span>
              {' · '}
              <span className="text-gray-700 text-[10px]">Перетащи карту · Колесо мыши — зум</span>
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

        <div className="flex flex-col lg:flex-row gap-4">
          {/* ── MAP CANVAS ── */}
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
                        onClick={e => { e.stopPropagation(); handleDistrictClick(d); }}
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

          {/* ── INFO PANEL ── */}
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

                {/* Rewards */}
                <div className="border border-cyber-yellow/20 bg-cyber-yellow/5 p-3">
                  <div className="font-mono text-[10px] text-gray-600 mb-1">// НАГРАДЫ</div>
                  <div className="font-mono text-xs text-cyber-yellow">{selected.rewards}</div>
                </div>

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
                  <button onClick={goTo}
                    className="w-full py-3 font-orbitron text-sm border-2 transition-all flex items-center justify-center gap-2 active:scale-95"
                    style={{ borderColor: selected.factionColor, color: selected.factionColor, backgroundColor: selected.factionColor + '18', boxShadow: `0 0 20px ${selected.factionColor}20` }}>
                    <Icon name="MapPin" size={14} />
                    ПЕРЕЙТИ В РАЙОН
                  </button>
                )}

                <button onClick={() => setSelected(null)}
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
                  <div className="font-mono text-[10px] text-gray-600 mb-2 tracking-widest">// ФРАКЦИИ</div>
                  <div className="space-y-2">
                    {[
                      { name: 'THE ARCHIVE', color: '#00ff41', role: 'Сопротивление' },
                      { name: 'NEXUS', color: '#ff4060', role: 'Корпорация' },
                      { name: 'BLACK SYNTAX', color: '#aa00ff', role: 'Синдикат' },
                      { name: 'ORDER OF CLEAN CODE', color: '#00aaff', role: 'Секта' },
                    ].map(f => (
                      <div key={f.name} className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[9px] leading-tight" style={{ color: f.color }}>{f.name}</span>
                        <span className="font-mono text-[9px] text-gray-700 flex-shrink-0">{f.role}</span>
                      </div>
                    ))}
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
