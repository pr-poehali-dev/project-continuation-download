import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { useGame } from '@/lib/GameContext';

// ─── Районы города ────────────────────────────────────────────────────────────

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
  section?: string; // куда вести при клике
  // SVG позиция и размер на карте
  x: number;
  y: number;
  w: number;
  h: number;
  shape?: 'hex' | 'rect' | 'diamond';
}

const DISTRICTS: District[] = [
  // ── ЦЕНТР (открыт с 1) ──────────────────────────────────────
  {
    id: 'undernet_hub',
    name: 'Undernet Hub',
    subtitle: 'База The Archive',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    type: 'safe',
    unlockLevel: 1,
    lore: 'Штаб сопротивления. Здесь начинается твой путь. Безопасная зона — NEXUS не достаёт сюда.',
    rewards: 'Стартовые квесты · Магазин Archive',
    section: 'home',
    x: 340, y: 260, w: 120, h: 80,
  },
  {
    id: 'syntax_street',
    name: 'Syntax Street',
    subtitle: 'Учебный квартал',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    type: 'learning',
    unlockLevel: 1,
    lore: 'Уличные школы нетраннеров. Здесь учат базовому Python — переменные, условия, циклы.',
    rewards: '+100-200 XP · Уроки АКТ I',
    section: 'lessons',
    x: 200, y: 200, w: 110, h: 70,
  },
  {
    id: 'loop_district',
    name: 'Loop District',
    subtitle: 'Тренировочная арена',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    type: 'battle',
    unlockLevel: 2,
    lore: 'Арена для отработки кода в бою. Базовые дроны NEXUS патрулируют периметр.',
    rewards: '+150-400 XP · Creds · Лут',
    section: 'battle',
    x: 480, y: 200, w: 110, h: 70,
  },
  {
    id: 'black_market',
    name: 'Black Market',
    subtitle: 'Нелегальная торговля',
    faction: 'BLACK SYNTAX',
    factionColor: '#aa00ff',
    type: 'safe',
    unlockLevel: 1,
    lore: 'Торговцы имплантами, лутбоксами и запрещёнными данными. Подозрительные личности.',
    rewards: 'Glitch Box · Neon Core · Void Relic',
    section: 'shop',
    x: 340, y: 370, w: 120, h: 70,
  },

  // ── БЛИЖНИЙ ПОЯС (LVL 5-10) ──────────────────────────────────
  {
    id: 'nexus_alpha_zone',
    name: 'NEXUS-Alpha Zone',
    subtitle: 'Корпоративный патруль',
    faction: 'NEXUS',
    factionColor: '#ff4060',
    type: 'dungeon',
    unlockLevel: 5,
    lore: 'Первые корпоративные кварталы. Охранники NEXUS патрулируют с тестами на лояльность.',
    rewards: '+200 XP · 150 Creds · Glitch Box',
    section: 'dungeon',
    x: 140, y: 300, w: 100, h: 65,
  },
  {
    id: 'function_factory',
    name: 'Function Factory',
    subtitle: 'Подземная лаборатория',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    type: 'learning',
    unlockLevel: 5,
    lore: 'Заброшенный завод, переоборудованный под лабораторию функций и модулей Python.',
    rewards: '+300 XP · Уроки АКТ II',
    section: 'lessons',
    x: 560, y: 300, w: 100, h: 65,
  },
  {
    id: 'data_docks',
    name: 'Data Docks',
    subtitle: 'Порт данных',
    faction: 'BLACK SYNTAX',
    factionColor: '#aa00ff',
    type: 'battle',
    unlockLevel: 7,
    lore: 'Порт для передачи нелегальных данных. Здесь можно наняться на грязную работу против NEXUS.',
    rewards: '+400 XP · 200 Creds',
    section: 'battle',
    x: 340, y: 450, w: 120, h: 65,
  },
  {
    id: 'order_temple',
    name: 'Temple of Clean Code',
    subtitle: 'Святилище Order',
    faction: 'ORDER OF CLEAN CODE',
    factionColor: '#00aaff',
    type: 'learning',
    unlockLevel: 8,
    lore: 'Сакральное место секты чистого кода. Здесь учат ООП, структурам данных и элегантности.',
    rewards: '+350-500 XP · Уроки ООП',
    section: 'lessons',
    x: 200, y: 390, w: 100, h: 65,
  },
  {
    id: 'colosseum',
    name: 'Syntax Colosseum',
    subtitle: 'Арена рейтинга',
    faction: 'NEXUS',
    factionColor: '#ff4060',
    type: 'battle',
    unlockLevel: 10,
    lore: 'Корпорация NEXUS устраивает публичные турниры. Победи — получи место в рейтинге.',
    rewards: 'Рейтинг · Сезонные награды',
    section: 'leaderboard',
    x: 560, y: 390, w: 100, h: 65,
  },

  // ── СРЕДНИЙ ПОЯС (LVL 15-25) ──────────────────────────────────
  {
    id: 'nexus_beta_zone',
    name: 'NEXUS-Beta Zone',
    subtitle: 'Корп. квартал',
    faction: 'NEXUS',
    factionColor: '#ff4060',
    type: 'dungeon',
    unlockLevel: 15,
    lore: 'Главные офисы корпорации. Усиленная охрана. Проверки знания циклов и условий.',
    rewards: '+500 XP · 350 Creds · Neon Core',
    section: 'dungeon',
    x: 100, y: 180, w: 90, h: 60,
  },
  {
    id: 'archive_vault',
    name: 'Archive Vault',
    subtitle: 'Хранилище знаний',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    type: 'dungeon',
    unlockLevel: 15,
    lore: 'Секретное хранилище The Archive. Только прошедшие испытания могут войти.',
    rewards: '+1200 XP · 800 Creds · Void Relic',
    section: 'dungeon',
    x: 690, y: 180, w: 90, h: 60,
  },
  {
    id: 'syntax_slums',
    name: 'Syntax Slums',
    subtitle: 'Трущобы нетраннеров',
    faction: 'BLACK SYNTAX',
    factionColor: '#aa00ff',
    type: 'battle',
    unlockLevel: 18,
    lore: 'Криминальные кварталы. Здесь правит Black Syntax. Опасно, но прибыльно.',
    rewards: '+600 XP · 400 Creds',
    section: 'battle',
    x: 80, y: 370, w: 90, h: 60,
  },
  {
    id: 'server_farm',
    name: 'Server Farm Omega',
    subtitle: 'Серверный кластер',
    faction: 'NEXUS',
    factionColor: '#ff4060',
    type: 'battle',
    unlockLevel: 20,
    lore: 'Центральный узел обработки данных NEXUS. Охраняется элитными ИИ-агентами.',
    rewards: '+800 XP · 500 Creds · Rare Drop',
    section: 'battle',
    x: 700, y: 370, w: 90, h: 60,
  },

  // ── ВНЕШНИЙ ПОЯС — БОССЫ (LVL 30+) ──────────────────────────
  {
    id: 'nexus_prime',
    name: 'NEXUS-Prime Tower',
    subtitle: 'Штаб-квартира NEXUS',
    faction: 'NEXUS',
    factionColor: '#ff4060',
    type: 'boss',
    unlockLevel: 30,
    lore: 'Сердце корпорации. Финальный данж. Здесь хранится ключ от глобальной нейросети.',
    rewards: '+3000 XP · 2000 Creds · Mythic',
    section: 'dungeon',
    x: 340, y: 80, w: 120, h: 70,
  },
  {
    id: 'void_sector',
    name: 'Void Sector',
    subtitle: '???',
    faction: '???',
    factionColor: '#666',
    type: 'hidden',
    unlockLevel: 40,
    lore: 'Зашифрованный сектор. Никто не знает что там. Даже The Archive.',
    rewards: '???',
    section: undefined,
    x: 80, y: 80, w: 90, h: 60,
  },
  {
    id: 'neural_core',
    name: 'Neural Core',
    subtitle: 'Глобальная нейросеть',
    faction: '???',
    factionColor: '#ffff00',
    type: 'hidden',
    unlockLevel: 50,
    lore: 'АКТ IV. Перезагрузка. Контроль над нейросетью изменит CodeGrid-9 навсегда.',
    rewards: 'Финал игры',
    section: undefined,
    x: 700, y: 80, w: 90, h: 60,
  },
];

const TYPE_STYLES: Record<District['type'], { icon: string; label: string; color: string }> = {
  safe:     { icon: '🏠', label: 'Безопасная зона',  color: '#00ff41' },
  learning: { icon: '📡', label: 'Обучение',          color: '#00aaff' },
  battle:   { icon: '⚔️', label: 'Бой',              color: '#ff00ff' },
  dungeon:  { icon: '🏰', label: 'Подземелье',        color: '#ffaa00' },
  boss:     { icon: '💀', label: 'Босс',              color: '#ff4060' },
  hidden:   { icon: '❓', label: 'Засекречено',       color: '#555' },
};

// Декоративные дороги между районами (SVG lines)
const ROADS = [
  { x1: 340, y1: 300, x2: 310, y2: 270 }, // hub → syntax_street
  { x1: 460, y1: 300, x2: 480, y2: 270 }, // hub → loop
  { x1: 340, y1: 340, x2: 340, y2: 370 }, // hub → black_market
  { x1: 200, y1: 265, x2: 200, y2: 300 }, // syntax → nexus_alpha
  { x1: 560, y1: 265, x2: 560, y2: 300 }, // loop → function
  { x1: 240, y1: 300, x2: 280, y2: 340 }, // nexus_alpha → ?
  { x1: 340, y1: 420, x2: 340, y2: 450 }, // black_market → data_docks
  { x1: 200, y1: 365, x2: 200, y2: 390 }, // nexus_alpha → order_temple
  { x1: 560, y1: 365, x2: 560, y2: 390 }, // function → colosseum
];

export default function CityMap({ onNavigate }: { onNavigate?: (s: string) => void }) {
  const { character } = useGame();
  const playerLevel = character?.level || 1;

  const [selected, setSelected] = useState<District | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [filter, setFilter] = useState<District['type'] | 'all'>('all');

  const isUnlocked = (d: District) => playerLevel >= d.unlockLevel;

  const handleClick = (d: District) => {
    if (!isUnlocked(d)) return;
    setSelected(d);
  };

  const goTo = () => {
    if (selected?.section && onNavigate) {
      onNavigate(selected.section);
    }
  };

  const filteredDistricts = filter === 'all' ? DISTRICTS : DISTRICTS.filter(d => d.type === filter);

  return (
    <section className="py-8 px-4 lg:px-6 min-h-screen relative">
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <div className="mb-5 flex items-end justify-between flex-wrap gap-3">
          <div>
            <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-1">
              // КАРТА ГОРОДА · CODEGRID-9 · 2087
            </div>
            <h2 className="font-orbitron text-2xl text-white">
              КАРТА <span className="text-cyber-cyan">CODEGRID-9</span>
            </h2>
            <p className="text-gray-600 font-mono text-xs mt-1">
              Уровень доступа: <span className="text-cyber-green">LVL {playerLevel}</span>
              {' · '}
              <span className="text-gray-700">{DISTRICTS.filter(d => isUnlocked(d)).length}/{DISTRICTS.length} районов открыто</span>
            </p>
          </div>
          {/* Filters */}
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setFilter('all')}
              className="font-mono text-[10px] px-2.5 py-1 border transition-all"
              style={{ borderColor: filter === 'all' ? '#00ffff' : '#ffffff12', color: filter === 'all' ? '#00ffff' : '#555', backgroundColor: filter === 'all' ? '#00ffff10' : 'transparent' }}>
              ВСЕ
            </button>
            {(Object.keys(TYPE_STYLES) as District['type'][]).map(t => (
              <button key={t} onClick={() => setFilter(t)}
                className="font-mono text-[10px] px-2.5 py-1 border transition-all"
                style={{ borderColor: filter === t ? TYPE_STYLES[t].color : '#ffffff12', color: filter === t ? TYPE_STYLES[t].color : '#555', backgroundColor: filter === t ? TYPE_STYLES[t].color + '10' : 'transparent' }}>
                {TYPE_STYLES[t].icon}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* ── SVG MAP ── */}
          <div className="flex-1 min-w-0 relative">
            <div
              className="border border-cyber-cyan/15 bg-black/60 relative overflow-hidden"
              style={{ aspectRatio: '4/3', maxHeight: '520px' }}
            >
              {/* Background scanlines / grid */}
              <div className="absolute inset-0 cyber-grid opacity-20" />
              {/* Atmospheric glows */}
              <div className="absolute top-1/4 left-1/3 w-40 h-40 bg-cyber-cyan/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-cyber-magenta/5 rounded-full blur-3xl pointer-events-none" />

              <svg
                viewBox="0 0 800 560"
                className="w-full h-full"
                style={{ display: 'block' }}
              >
                {/* Roads / connections */}
                {ROADS.map((r, i) => (
                  <line key={i}
                    x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
                    stroke="#00ffff15" strokeWidth="2" strokeDasharray="6,4"
                  />
                ))}

                {/* Districts */}
                {DISTRICTS.map(d => {
                  const unlocked = isUnlocked(d);
                  const isSelected = selected?.id === d.id;
                  const isHov = hovered === d.id;
                  const style = TYPE_STYLES[d.type];
                  const visible = filter === 'all' || d.type === filter;

                  const fillColor = unlocked
                    ? isSelected || isHov ? d.factionColor + '30' : d.factionColor + '12'
                    : '#0a0a0a';
                  const strokeColor = unlocked
                    ? isSelected ? d.factionColor : isHov ? d.factionColor + 'cc' : d.factionColor + '50'
                    : '#333';
                  const strokeWidth = isSelected ? 2.5 : isHov ? 2 : 1;
                  const opacity = visible ? 1 : 0.2;

                  return (
                    <g key={d.id} style={{ opacity, cursor: unlocked ? 'pointer' : 'default' }}
                      onClick={() => handleClick(d)}
                      onMouseEnter={() => unlocked && setHovered(d.id)}
                      onMouseLeave={() => setHovered(null)}>

                      {/* Glow under selected */}
                      {(isSelected || isHov) && unlocked && (
                        <rect
                          x={d.x - 4} y={d.y - 4} width={d.w + 8} height={d.h + 8}
                          fill="none"
                          stroke={d.factionColor}
                          strokeWidth="1"
                          opacity="0.2"
                          filter="url(#glow)"
                        />
                      )}

                      {/* Main block */}
                      <rect
                        x={d.x} y={d.y} width={d.w} height={d.h}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        rx="2"
                      />

                      {/* Locked overlay */}
                      {!unlocked && (
                        <rect
                          x={d.x} y={d.y} width={d.w} height={d.h}
                          fill="rgba(0,0,0,0.7)"
                          rx="2"
                        />
                      )}

                      {/* Type icon (top-left corner) */}
                      <text
                        x={d.x + 6} y={d.y + 16}
                        fontSize="12"
                        opacity={unlocked ? 0.8 : 0.4}>
                        {unlocked ? style.icon : '🔒'}
                      </text>

                      {/* Level badge (top-right) */}
                      {!unlocked && (
                        <text
                          x={d.x + d.w - 4} y={d.y + 14}
                          fontSize="9"
                          fill="#666"
                          textAnchor="end"
                          fontFamily="monospace">
                          LVL{d.unlockLevel}
                        </text>
                      )}

                      {/* District name */}
                      <text
                        x={d.x + d.w / 2} y={d.y + d.h / 2 + 2}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="bold"
                        fill={unlocked ? d.factionColor : '#555'}
                        fontFamily="orbitron, monospace"
                        style={{ userSelect: 'none' }}>
                        {d.name.length > 14 ? d.name.slice(0, 13) + '…' : d.name}
                      </text>

                      {/* Subtitle */}
                      <text
                        x={d.x + d.w / 2} y={d.y + d.h / 2 + 16}
                        textAnchor="middle"
                        fontSize="8"
                        fill={unlocked ? '#888' : '#444'}
                        fontFamily="monospace"
                        style={{ userSelect: 'none' }}>
                        {d.subtitle}
                      </text>

                      {/* Unlock level below locked */}
                      {!unlocked && (
                        <text
                          x={d.x + d.w / 2} y={d.y + d.h - 8}
                          textAnchor="middle"
                          fontSize="8"
                          fill="#444"
                          fontFamily="monospace">
                          Откроется на LVL {d.unlockLevel}
                        </text>
                      )}

                      {/* Animated pulse on selected */}
                      {isSelected && unlocked && (
                        <rect
                          x={d.x} y={d.y} width={d.w} height={d.h}
                          fill="none"
                          stroke={d.factionColor}
                          strokeWidth="2"
                          rx="2"
                          opacity="0.5">
                          <animate attributeName="opacity" values="0.5;0.1;0.5" dur="1.5s" repeatCount="indefinite" />
                          <animate attributeName="stroke-width" values="2;4;2" dur="1.5s" repeatCount="indefinite" />
                        </rect>
                      )}
                    </g>
                  );
                })}

                {/* Player position dot on Undernet Hub */}
                {character && (
                  <g>
                    <circle cx={400} cy={300} r="6" fill="#00ffff" opacity="0.9">
                      <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.9;0.4;0.9" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={400} cy={300} r="3" fill="#00ffff" />
                    <text x={404} y={290} fontSize="8" fill="#00ffff" fontFamily="monospace">YOU</text>
                  </g>
                )}

                {/* SVG filter for glow */}
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
              </svg>

              {/* Compass */}
              <div className="absolute bottom-3 right-3 font-mono text-[9px] text-gray-700 border border-gray-800 px-2 py-1 bg-black/80">
                NEXUS↑ · ARCHIVE← · SYNTAX→ · ORDER↓
              </div>

              {/* Level legend */}
              <div className="absolute top-3 left-3 space-y-0.5">
                {[
                  { color: '#00ff41', label: 'LVL 1-5' },
                  { color: '#ffaa00', label: 'LVL 5-15' },
                  { color: '#ff4060', label: 'LVL 15-30' },
                  { color: '#555',    label: 'Закрыто' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                    <span className="font-mono text-[8px]" style={{ color: l.color }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── INFO PANEL ── */}
          <div className="w-full lg:w-72 flex-shrink-0">
            {selected ? (
              <div
                className="border h-full p-5 space-y-4 transition-all duration-300"
                style={{ borderColor: selected.factionColor + '40', backgroundColor: selected.factionColor + '06' }}
              >
                {/* Header */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] px-2 py-0.5 border"
                      style={{ color: selected.factionColor, borderColor: selected.factionColor + '50' }}>
                      {TYPE_STYLES[selected.type].icon} {TYPE_STYLES[selected.type].label}
                    </span>
                    <span className="font-mono text-[10px]" style={{ color: selected.factionColor + '80' }}>
                      LVL {selected.unlockLevel}+
                    </span>
                  </div>
                  <h3 className="font-orbitron text-lg font-black text-white mt-2">{selected.name}</h3>
                  <div className="font-mono text-[10px] text-gray-600">{selected.subtitle}</div>
                  <div className="font-mono text-[10px] mt-1" style={{ color: selected.factionColor + '80' }}>
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

                {/* Unlock status */}
                {!isUnlocked(selected) && (
                  <div className="border border-red-500/30 bg-red-500/5 p-3">
                    <div className="font-mono text-xs text-red-400">
                      🔒 Откроется на LVL {selected.unlockLevel}
                    </div>
                    <div className="font-mono text-[10px] text-gray-600 mt-1">
                      Ещё {selected.unlockLevel - playerLevel} уровней
                    </div>
                    <div className="mt-2 h-1 bg-black/60">
                      <div className="h-full bg-red-500/50 transition-all"
                        style={{ width: `${Math.min(100, (playerLevel / selected.unlockLevel) * 100)}%` }} />
                    </div>
                  </div>
                )}

                {/* Go button */}
                {isUnlocked(selected) && selected.section && (
                  <button
                    onClick={goTo}
                    className="w-full py-3 font-orbitron text-sm border transition-all flex items-center justify-center gap-2"
                    style={{
                      borderColor: selected.factionColor,
                      color: selected.factionColor,
                      backgroundColor: selected.factionColor + '15',
                    }}
                  >
                    <Icon name="MapPin" size={14} />
                    ПЕРЕЙТИ В РАЙОН
                  </button>
                )}

                {/* Close */}
                <button onClick={() => setSelected(null)}
                  className="w-full font-mono text-[10px] text-gray-700 hover:text-gray-500 transition-colors">
                  [закрыть]
                </button>
              </div>
            ) : (
              /* Default — stats & legend */
              <div className="border border-white/8 p-5 space-y-4 h-full">
                <div>
                  <div className="font-mono text-[10px] text-gray-600 mb-3 tracking-widest">// СТАТУС АГЕНТА</div>
                  {character && (
                    <div className="space-y-2">
                      <div className="flex justify-between font-mono text-xs">
                        <span className="text-gray-600">Агент</span>
                        <span className="text-cyber-cyan">{character.name}</span>
                      </div>
                      <div className="flex justify-between font-mono text-xs">
                        <span className="text-gray-600">Уровень</span>
                        <span className="text-cyber-green">LVL {playerLevel}</span>
                      </div>
                      <div className="flex justify-between font-mono text-xs">
                        <span className="text-gray-600">Открыто районов</span>
                        <span className="text-cyber-yellow">{DISTRICTS.filter(d => isUnlocked(d)).length}/{DISTRICTS.length}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="font-mono text-[10px] text-gray-600 mb-2 tracking-widest">// ЛЕГЕНДА</div>
                  <div className="space-y-2">
                    {(Object.entries(TYPE_STYLES) as [District['type'], typeof TYPE_STYLES[District['type']]][]).map(([type, s]) => (
                      <div key={type} className="flex items-center gap-2">
                        <span className="text-sm">{s.icon}</span>
                        <span className="font-mono text-[10px]" style={{ color: s.color }}>{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="font-mono text-[10px] text-gray-600 mb-2 tracking-widest">// ФРАКЦИИ</div>
                  <div className="space-y-1.5">
                    {[
                      { name: 'THE ARCHIVE', color: '#00ff41', desc: 'Сопротивление' },
                      { name: 'NEXUS', color: '#ff4060', desc: 'Корпорация' },
                      { name: 'BLACK SYNTAX', color: '#aa00ff', desc: 'Синдикат' },
                      { name: 'ORDER OF CLEAN CODE', color: '#00aaff', desc: 'Секта' },
                    ].map(f => (
                      <div key={f.name} className="flex items-center justify-between">
                        <span className="font-mono text-[9px]" style={{ color: f.color }}>{f.name}</span>
                        <span className="font-mono text-[9px] text-gray-700">{f.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-cyber-cyan/15 p-3">
                  <div className="font-mono text-[10px] text-gray-600 mb-1">// ПОДСКАЗКА</div>
                  <p className="text-gray-600 font-mono text-[9px] leading-relaxed">
                    Кликай на районы для просмотра деталей. Закрытые районы откроются с повышением уровня.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Districts list below map on mobile */}
        <div className="mt-6 lg:hidden">
          <div className="font-mono text-[10px] text-gray-600 mb-3 tracking-widest">// СПИСОК РАЙОНОВ</div>
          <div className="grid grid-cols-2 gap-2">
            {filteredDistricts.map(d => {
              const unlocked = isUnlocked(d);
              return (
                <button key={d.id} onClick={() => setSelected(d)}
                  className="p-3 border text-left transition-all"
                  style={{
                    borderColor: unlocked ? d.factionColor + '30' : '#ffffff08',
                    opacity: unlocked ? 1 : 0.5,
                  }}>
                  <div className="text-lg mb-1">{unlocked ? TYPE_STYLES[d.type].icon : '🔒'}</div>
                  <div className="font-orbitron text-[10px] font-bold" style={{ color: unlocked ? d.factionColor : '#555' }}>
                    {d.name}
                  </div>
                  {!unlocked && <div className="font-mono text-[9px] text-gray-700">LVL {d.unlockLevel}</div>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
