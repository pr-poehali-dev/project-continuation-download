import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';
import { useGame } from '@/lib/GameContext';

interface Leader {
  rank: number;
  username: string;
  level: number;
  xp: number;
  class: string;
  chapter: number;
  user_id: number;
  wins: number;
}

const CLASS_COLOR: Record<string, string> = {
  cipher: '#00ff41', data_ghost: '#00aaff', neural_architect: '#aa00ff',
  hacker: '#00ff41', netrunner: '#00aaff', street_samurai: '#aa00ff',
};

const CLASS_LABEL: Record<string, string> = {
  cipher: 'CIPHER', data_ghost: 'DATA GHOST', neural_architect: 'NEURAL ARCHITECT',
  hacker: 'CIPHER', netrunner: 'DATA GHOST', street_samurai: 'NEURAL ARCHITECT',
};

const RANK_STYLES = [
  { color: '#ffff00', label: '🥇' },
  { color: '#aaaaaa', label: '🥈' },
  { color: '#fb923c', label: '🥉' },
];

export default function Leaderboard() {
  const { character } = useGame();
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    const res = await api.leaderboard();
    setLoading(false);
    if (res?.error || !res?.leaderboard) {
      setError('Не удалось загрузить рейтинг');
      return;
    }
    setLeaders(res.leaderboard);
  };

  useEffect(() => { load(); }, []);

  const myUsername = character?.name ?? '';
  const myEntry = leaders.find(l => l.username === myUsername);

  const top3 = leaders.slice(0, 3);
  const rest  = leaders.slice(3);

  return (
    <section className="py-8 px-4 lg:px-6 min-h-screen relative">
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
      <div className="max-w-4xl mx-auto relative z-10">

        <div className="mb-6">
          <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-1">// SYNTAX COLOSSEUM · СЕЗОН 1</div>
          <h2 className="font-orbitron text-2xl text-white">
            ТОП <span className="text-cyber-yellow">ХАКЕРОВ</span>
          </h2>
          <div className="font-mono text-[10px] text-gray-700 mt-0.5">CodeGrid-9 · Глобальный рейтинг · 2087</div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-10 h-10 border-2 border-cyber-yellow border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="font-mono text-red-400 mb-4">{error}</div>
            <button onClick={load} className="font-orbitron text-xs border border-white/20 px-4 py-2 text-gray-400 hover:text-white transition-colors">
              ПОВТОРИТЬ
            </button>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {top3.length >= 3 && (
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[top3[1], top3[0], top3[2]].map((player, idx) => {
                  const podiumRank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
                  const style = RANK_STYLES[podiumRank - 1];
                  const heights = ['mt-6', 'mt-0', 'mt-8'];
                  const isMe = player.username === myUsername;
                  const col = CLASS_COLOR[player.class] || '#aaa';
                  return (
                    <div key={player.user_id}
                      className={`border p-4 text-center transition-all hover:scale-105 ${heights[idx]}`}
                      style={{ borderColor: style.color + '50', boxShadow: `0 0 25px ${style.color}18`, backgroundColor: style.color + '06' }}>
                      <div className="text-3xl mb-1">{style.label}</div>
                      <div className="font-orbitron text-2xl font-black mb-1" style={{ color: style.color }}>
                        #{podiumRank}
                      </div>
                      <div className="font-mono text-xs text-white truncate" style={{ color: isMe ? '#00ffff' : 'white' }}>
                        {player.username}
                        {isMe && <span className="text-cyber-cyan/50 ml-1">★</span>}
                      </div>
                      <div className="font-mono text-[10px] mt-0.5" style={{ color: col }}>{CLASS_LABEL[player.class] ?? player.class}</div>
                      <div className="font-orbitron text-xs mt-1" style={{ color: style.color }}>LVL {player.level}</div>
                      <div className="font-mono text-[9px] text-gray-600 mt-0.5">{(player.xp / 1000).toFixed(1)}K XP</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Refresh button */}
            <div className="flex justify-end mb-4">
              <button onClick={load}
                className="flex items-center gap-2 font-mono text-xs border border-white/10 px-3 py-1.5 text-gray-500 hover:text-white transition-colors">
                <Icon name="RefreshCw" size={12} />
                ОБНОВИТЬ
              </button>
            </div>

            {/* Full table */}
            <div className="border border-white/8">
              {/* Header */}
              <div className="grid grid-cols-[48px_1fr_100px_80px_60px] border-b border-white/8 px-3 py-2">
                {['#', 'ИГРОК', 'КЛАСС', 'XP', 'LVL'].map(h => (
                  <div key={h} className="font-mono text-[9px] text-gray-600 tracking-widest">{h}</div>
                ))}
              </div>

              {leaders.map((player, i) => {
                const isMe = player.username === myUsername;
                const col = CLASS_COLOR[player.class] || '#aaa';
                const rankStyle = player.rank <= 3 ? RANK_STYLES[player.rank - 1] : null;
                return (
                  <div key={player.user_id}
                    className="grid grid-cols-[48px_1fr_100px_80px_60px] px-3 py-2.5 border-b border-white/5 transition-all hover:bg-white/2"
                    style={{
                      backgroundColor: isMe ? '#00ffff06' : i % 2 === 0 ? 'transparent' : '#ffffff02',
                      borderLeft: isMe ? '2px solid #00ffff40' : undefined,
                    }}>

                    {/* Rank */}
                    <div className="flex items-center">
                      {rankStyle ? (
                        <span className="font-orbitron text-sm font-black" style={{ color: rankStyle.color }}>
                          #{player.rank}
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-gray-600">#{player.rank}</span>
                      )}
                    </div>

                    {/* Name */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="min-w-0">
                        <div className="font-mono text-sm truncate" style={{ color: isMe ? '#00ffff' : 'white' }}>
                          {player.username}
                          {isMe && <span className="text-cyber-cyan/40 text-xs ml-1.5">★ Вы</span>}
                        </div>
                        <div className="font-mono text-[9px] text-gray-700">Глава {player.chapter} · {player.wins} побед</div>
                      </div>
                    </div>

                    {/* Class */}
                    <div className="flex items-center">
                      <span className="font-mono text-[9px] truncate" style={{ color: col }}>
                        {CLASS_LABEL[player.class] ?? player.class}
                      </span>
                    </div>

                    {/* XP */}
                    <div className="flex items-center">
                      <span className="font-orbitron text-xs text-cyber-yellow">
                        {player.xp >= 1000 ? `${(player.xp / 1000).toFixed(1)}K` : player.xp}
                      </span>
                    </div>

                    {/* Level */}
                    <div className="flex items-center">
                      <span className="font-orbitron text-xs font-black" style={{ color: rankStyle?.color ?? '#555' }}>
                        {player.level}
                      </span>
                    </div>
                  </div>
                );
              })}

              {leaders.length === 0 && (
                <div className="text-center py-12 font-mono text-gray-600">
                  Пока нет игроков в рейтинге
                </div>
              )}
            </div>

            {/* My position if outside top */}
            {myEntry && myEntry.rank > 10 && (
              <div className="mt-4 border border-cyber-cyan/30 bg-cyber-cyan/5 px-4 py-3 flex items-center justify-between">
                <div className="font-mono text-xs text-cyber-cyan">Твоя позиция</div>
                <div className="flex items-center gap-4">
                  <span className="font-orbitron text-sm text-cyber-cyan">#{myEntry.rank}</span>
                  <span className="font-mono text-xs text-gray-400">LVL {myEntry.level} · {(myEntry.xp / 1000).toFixed(1)}K XP</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
