import { useState } from 'react';
import { useGame } from '@/lib/GameContext';
import { api } from '@/lib/api';
import Icon from '@/components/ui/icon';

const CLASSES = [
  {
    id: 'hacker',
    name: 'Хакер',
    title: 'Мастер кода',
    desc: 'Взламывает системы силой интеллекта. Высокий урон от заклинаний кода, средняя защита.',
    img: 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/c57f7ff6-a3a7-4783-8f10-0d9d80a09f23.jpg',
    stats: { strength: 8, agility: 10, intelligence: 15, defense: 7, luck: 10 },
    color: '#00ffff',
    bgGlow: '#00ffff',
    strengths: ['🔵 Высокий интеллект', '🟡 Хорошая удача', '🟢 Быстрое обучение'],
  },
  {
    id: 'netrunner',
    name: 'Нетраннер',
    title: 'Дух Сети',
    desc: 'Существо киберпространства. Максимальный интеллект, молниеносная агилити, слабое тело.',
    img: 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/2fd8ffba-85dd-4b30-aba1-ceb9dd168a5e.jpg',
    stats: { strength: 6, agility: 12, intelligence: 18, defense: 6, luck: 8 },
    color: '#ff00ff',
    bgGlow: '#ff00ff',
    strengths: ['🔵 Макс. интеллект', '🟡 Высокая ловкость', '🔴 Слабая защита'],
  },
  {
    id: 'street_samurai',
    name: 'Самурай',
    title: 'Уличный воин',
    desc: 'Сила и броня. Бьёт твёрдо, держит удар. Меньше кода — больше ударов кулаком.',
    img: 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/ba390b4d-c17b-4e41-933f-463af7aa414a.jpg',
    stats: { strength: 16, agility: 14, intelligence: 7, defense: 13, luck: 5 },
    color: '#ffff00',
    bgGlow: '#ffff00',
    strengths: ['🔴 Высокая сила', '🟢 Хорошая защита', '🔵 Низкий интеллект'],
  },
];

const STAT_LABELS: Record<string, string> = {
  strength: 'Сила', agility: 'Ловкость', intelligence: 'Интеллект', defense: 'Защита', luck: 'Удача',
};
const STAT_COLORS: Record<string, string> = {
  strength: '#ff4060', agility: '#ffff00', intelligence: '#00ffff', defense: '#00ff41', luck: '#aa00ff',
};

export default function CreateCharacter() {
  const { setCharacter, username } = useGame();
  const [name, setName] = useState(username || '');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cls = CLASSES[selectedIdx];

  const prev = () => setSelectedIdx(i => (i - 1 + CLASSES.length) % CLASSES.length);
  const next = () => setSelectedIdx(i => (i + 1) % CLASSES.length);

  const create = async () => {
    if (!name.trim() || name.length < 2) { setError('Имя минимум 2 символа'); return; }
    setLoading(true);
    const data = await api.character.create(name.trim(), cls.id);
    setLoading(false);
    if (data.error) setError(data.error);
    else setCharacter(data);
  };

  return (
    <div className="min-h-screen bg-cyber-dark relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="absolute inset-0 scanlines pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 lg:px-12 py-5 border-b border-cyber-cyan/10">
        <div className="font-orbitron text-2xl font-black">
          <span className="text-cyber-cyan">CODE</span><span className="text-cyber-magenta">RPG</span>
        </div>
        <div className="font-mono text-xs text-gray-600 tracking-widest">// СОЗДАНИЕ ПЕРСОНАЖА</div>
      </header>

      <div className="relative z-10 flex flex-col lg:flex-row min-h-[calc(100vh-73px)]">
        {/* Left — character showcase */}
        <div className="flex-1 flex flex-col items-center justify-center py-8 px-6 relative">
          {/* Glow behind character */}
          <div
            className="absolute w-64 h-64 rounded-full blur-3xl opacity-15 transition-all duration-700"
            style={{ backgroundColor: cls.bgGlow, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          />

          {/* Character carousel */}
          <div className="relative flex items-center gap-6">
            <button onClick={prev} className="text-gray-600 hover:text-white transition-colors z-10 p-2">
              <Icon name="ChevronLeft" size={32} />
            </button>

            <div className="relative">
              {/* Character image */}
              <div
                className="w-48 h-64 lg:w-64 lg:h-80 overflow-hidden border-2 transition-all duration-500 relative"
                style={{
                  borderColor: cls.color,
                  boxShadow: `0 0 40px ${cls.color}30, inset 0 0 20px ${cls.color}08`,
                  clipPath: 'polygon(0 0, 92% 0, 100% 8%, 100% 100%, 8% 100%, 0 92%)',
                }}
              >
                <img
                  src={cls.img}
                  alt={cls.name}
                  className="w-full h-full object-cover object-top transition-all duration-500"
                />
                {/* Color overlay tint */}
                <div className="absolute inset-0 opacity-10 mix-blend-color" style={{ backgroundColor: cls.color }} />
                {/* Bottom gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-cyber-dark/80 to-transparent" />
              </div>

              {/* Class name badge */}
              <div
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-1.5 font-orbitron text-sm font-black whitespace-nowrap"
                style={{
                  color: cls.color,
                  border: `1px solid ${cls.color}`,
                  backgroundColor: '#050a0e',
                  boxShadow: `0 0 16px ${cls.color}30`,
                }}
              >
                {cls.name.toUpperCase()}
              </div>
            </div>

            <button onClick={next} className="text-gray-600 hover:text-white transition-colors z-10 p-2">
              <Icon name="ChevronRight" size={32} />
            </button>
          </div>

          {/* Dots indicator */}
          <div className="flex gap-2 mt-8">
            {CLASSES.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setSelectedIdx(i)}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{ backgroundColor: i === selectedIdx ? c.color : '#333', boxShadow: i === selectedIdx ? `0 0 8px ${c.color}` : 'none' }}
              />
            ))}
          </div>

          {/* Class description */}
          <div className="mt-6 text-center max-w-sm">
            <div className="font-orbitron text-xs mb-1" style={{ color: cls.color }}>{cls.title}</div>
            <p className="text-gray-500 font-rajdhani text-sm leading-relaxed">{cls.desc}</p>
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {cls.strengths.map(s => (
                <span key={s} className="text-xs font-mono text-gray-500">{s}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div className="w-full lg:w-[420px] flex flex-col justify-center p-6 lg:p-12 border-t lg:border-t-0 lg:border-l border-white/5">
          <h1 className="font-orbitron text-2xl text-white mb-1">КЕМ ТЫ БУДЕШЬ?</h1>
          <div className="font-mono text-xs text-gray-600 mb-8">// выбери имя и класс персонажа</div>

          {/* Name */}
          <div className="mb-6">
            <label className="block font-mono text-xs tracking-widest mb-2" style={{ color: cls.color + 'aa' }}>
              ИМЯ ПЕРСОНАЖА
            </label>
            <input
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && create()}
              placeholder="Введи позывной..."
              className="w-full bg-black/50 border text-white font-orbitron text-base px-4 py-3
                focus:outline-none placeholder:text-gray-700 transition-all"
              style={{ borderColor: cls.color + '40' }}
              onFocus={e => { e.currentTarget.style.borderColor = cls.color + '90'; e.currentTarget.style.boxShadow = `0 0 12px ${cls.color}20`; }}
              onBlur={e => { e.currentTarget.style.borderColor = cls.color + '40'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Stats */}
          <div className="cyber-panel p-4 mb-6" style={{ borderColor: cls.color + '20' }}>
            <div className="font-mono text-[10px] text-gray-600 mb-3 tracking-widest">// НАЧАЛЬНЫЕ ХАРАКТЕРИСТИКИ</div>
            <div className="space-y-2">
              {Object.entries(cls.stats).map(([stat, val]) => (
                <div key={stat} className="flex items-center gap-2">
                  <span className="text-gray-600 font-mono text-xs w-24">{STAT_LABELS[stat]}</span>
                  <div className="flex-1 h-1.5 bg-black/50">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${(val / 20) * 100}%`,
                        backgroundColor: STAT_COLORS[stat],
                        boxShadow: `0 0 6px ${STAT_COLORS[stat]}60`,
                      }}
                    />
                  </div>
                  <span className="font-orbitron text-xs w-6 text-right" style={{ color: STAT_COLORS[stat] }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 border border-red-500/40 bg-red-500/8 p-3 text-red-400 font-mono text-xs">
              ⚠ {error}
            </div>
          )}

          <button
            onClick={create}
            disabled={loading}
            className="w-full py-4 font-orbitron text-sm tracking-wider border transition-all
              flex items-center justify-center gap-2 disabled:opacity-40"
            style={{
              borderColor: cls.color,
              color: cls.color,
              backgroundColor: cls.color + '18',
              boxShadow: `0 0 24px ${cls.color}20`,
            }}
          >
            {loading
              ? <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <><Icon name="Zap" size={16} />НАЧАТЬ КАК {cls.name.toUpperCase()}</>
            }
          </button>

          <div className="mt-4 text-center text-gray-700 font-mono text-xs">
            КЛАСС НЕЛЬЗЯ ИЗМЕНИТЬ ПОСЛЕ СОЗДАНИЯ
          </div>
        </div>
      </div>
    </div>
  );
}
