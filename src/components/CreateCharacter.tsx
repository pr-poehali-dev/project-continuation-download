import { useState } from 'react';
import { useGame } from '@/lib/GameContext';
import { api } from '@/lib/api';
import Icon from '@/components/ui/icon';

const CLASSES = [
  {
    id: 'hacker',
    name: 'Хакер',
    emoji: '🧑‍💻',
    desc: 'Мастер кода и взлома. Высокий интеллект, средняя защита.',
    stats: { strength: 8, agility: 10, intelligence: 15, defense: 7, luck: 10 },
    color: '#00ffff',
  },
  {
    id: 'netrunner',
    name: 'Нетраннер',
    emoji: '🕶️',
    desc: 'Дух киберпространства. Максимальный интеллект, но слабое тело.',
    stats: { strength: 6, agility: 12, intelligence: 18, defense: 6, luck: 8 },
    color: '#ff00ff',
  },
  {
    id: 'street_samurai',
    name: 'Уличный Самурай',
    emoji: '⚔️',
    desc: 'Сила и броня. Меньше кода, больше ударов. Высокая защита.',
    stats: { strength: 16, agility: 14, intelligence: 7, defense: 13, luck: 5 },
    color: '#ffff00',
  },
];

const STAT_LABELS: Record<string, string> = {
  strength: 'Сила', agility: 'Ловкость', intelligence: 'Интеллект',
  defense: 'Защита', luck: 'Удача',
};

export default function CreateCharacter() {
  const { setCharacter, username } = useGame();
  const [name, setName] = useState(username || '');
  const [selectedClass, setSelectedClass] = useState('hacker');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cls = CLASSES.find(c => c.id === selectedClass)!;

  const create = async () => {
    if (!name.trim() || name.length < 2) {
      setError('Имя минимум 2 символа');
      return;
    }
    setLoading(true);
    const data = await api.character.create(name.trim(), selectedClass);
    setLoading(false);
    if (data.error) {
      setError(data.error);
    } else {
      setCharacter(data);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-dark flex items-center justify-center relative overflow-hidden cyber-grid scanlines px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-cyber-dark via-transparent to-cyber-dark" />

      <div className="relative z-10 w-full max-w-2xl animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="text-cyber-magenta font-mono text-xs tracking-widest mb-2">// СОЗДАНИЕ ПЕРСОНАЖА</div>
          <h1 className="font-orbitron text-3xl text-white">КЕМ ТЫ БУДЕШЬ?</h1>
          <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-cyber-magenta to-transparent mx-auto mt-3" />
        </div>

        {/* Name input */}
        <div className="cyber-panel p-6 mb-4">
          <label className="block text-cyber-cyan font-mono text-xs mb-2 tracking-widest">ИМЯ ПЕРСОНАЖА</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Введи позывной..."
            className="w-full bg-black/50 border border-cyber-cyan/30 text-white font-orbitron text-lg px-4 py-3
              focus:outline-none focus:border-cyber-cyan focus:shadow-[0_0_12px_#00ffff30]
              placeholder:text-gray-700 transition-all"
          />
        </div>

        {/* Class selection */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {CLASSES.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedClass(c.id)}
              className={`cyber-panel p-4 text-left transition-all duration-200 ${
                selectedClass === c.id ? '' : 'opacity-60 hover:opacity-80'
              }`}
              style={{
                borderColor: selectedClass === c.id ? c.color : '#ffffff20',
                boxShadow: selectedClass === c.id ? `0 0 20px ${c.color}30` : 'none',
              }}
            >
              <div className="text-3xl mb-2">{c.emoji}</div>
              <div className="font-orbitron text-sm mb-1" style={{ color: c.color }}>{c.name}</div>
              <div className="text-gray-500 text-xs font-rajdhani leading-tight">{c.desc}</div>
            </button>
          ))}
        </div>

        {/* Stats preview */}
        <div className="cyber-panel p-4 mb-4">
          <div className="font-orbitron text-xs text-gray-400 mb-3 tracking-widest">// НАЧАЛЬНЫЕ ХАРАКТЕРИСТИКИ</div>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(cls.stats).map(([stat, val]) => (
              <div key={stat} className="text-center">
                <div className="font-orbitron text-lg font-bold" style={{ color: cls.color }}>{val}</div>
                <div className="text-gray-600 text-xs font-mono">{STAT_LABELS[stat]}</div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 border border-red-500/40 bg-red-500/10 p-3 text-red-400 font-mono text-xs">
            ⚠ {error}
          </div>
        )}

        <button
          onClick={create}
          disabled={loading}
          className="cyber-btn w-full py-4 text-base disabled:opacity-40 flex items-center justify-center gap-2"
          style={{ borderColor: cls.color, color: cls.color }}
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Icon name="Zap" size={18} />
              НАЧАТЬ КАК {cls.name.toUpperCase()}
            </>
          )}
        </button>

        <div className="text-center mt-4 text-gray-700 font-mono text-xs">
          ВЫБОР НЕЛЬЗЯ ИЗМЕНИТЬ · ВЫБИРАЙ МУДРО
        </div>
      </div>
    </div>
  );
}
