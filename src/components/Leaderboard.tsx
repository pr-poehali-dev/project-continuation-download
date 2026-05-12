import { useState } from 'react';
import Icon from '@/components/ui/icon';

// GDD фракции: The Archive, Black Syntax, Order of Clean Code, соло
const ALL_PLAYERS = [
  { rank: 1, name: 'Х4CK3R_PR1M3', level: 42, xp: 48200, guild: 'The Archive', badge: '🔥', change: 'up' as const, cls: 'Hacker' },
  { rank: 2, name: 'NOVA_7', level: 38, xp: 41800, guild: 'The Archive', badge: '⚡', change: 'same' as const, isMe: true, cls: 'Python-Junior' },
  { rank: 3, name: 'CyberWitch', level: 35, xp: 38100, guild: 'Black Syntax', badge: '🌙', change: 'up' as const, cls: 'Hacker' },
  { rank: 4, name: 'QuantumByte', level: 31, xp: 32700, guild: 'Order of Clean Code', badge: '💎', change: 'down' as const, cls: 'Python-Backend' },
  { rank: 5, name: 'VOID_CODER', level: 28, xp: 29900, guild: 'Соло', badge: '🤖', change: 'up' as const, cls: 'Python-Backend' },
  { rank: 6, name: 'Neon_Ghost', level: 25, xp: 26400, guild: 'Black Syntax', badge: '👻', change: 'down' as const, cls: 'Python-Junior' },
  { rank: 7, name: 'DataPunk_X', level: 22, xp: 22100, guild: 'Order of Clean Code', badge: '🎭', change: 'same' as const, cls: 'Hacker' },
  { rank: 8, name: 'BinaryKing', level: 19, xp: 18600, guild: 'The Archive', badge: '👑', change: 'up' as const, cls: 'Python-Junior' },
];

const GUILDS = ['Все', 'The Archive', 'Black Syntax', 'Order of Clean Code', 'Соло'];
const FACTION_COLORS: Record<string, string> = {
  'The Archive': '#00ff41',
  'Black Syntax': '#aa00ff',
  'Order of Clean Code': '#00aaff',
  'Соло': '#666',
};

const RANK_STYLES = [
  { border: 'border-cyber-yellow/50', text: 'text-cyber-yellow', glow: '#ffff00' },
  { border: 'border-gray-400/40', text: 'text-gray-300', glow: '#aaaaaa' },
  { border: 'border-orange-400/50', text: 'text-orange-400', glow: '#fb923c' },
];

export default function Leaderboard() {
  const [filterGuild, setFilterGuild] = useState('Все');
  const [refreshing, setRefreshing] = useState(false);

  const players = filterGuild === 'Все'
    ? ALL_PLAYERS
    : ALL_PLAYERS.filter(p => p.guild === filterGuild);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <section className="py-16 px-6 bg-cyber-dark/30">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 animate-fade-in-up">
          <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-1">// SYNTAX COLOSSEUM · SEASON 1</div>
          <h2 className="font-orbitron text-2xl text-white">
            ТОП <span className="text-cyber-yellow">ХАКЕРОВ</span>
          </h2>
          <div className="font-mono text-[10px] text-gray-700 mt-0.5">CodeGrid-9 · Глобальный рейтинг · 2087</div>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-in-up">
          {[ALL_PLAYERS[1], ALL_PLAYERS[0], ALL_PLAYERS[2]].map((player, idx) => {
            const podiumRank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
            const style = RANK_STYLES[podiumRank - 1];
            const heights = ['mt-6', 'mt-0', 'mt-8'];
            return (
              <div
                key={player.rank}
                className={`cyber-panel p-5 text-center border ${style.border} ${heights[idx]} transition-all duration-300 hover:scale-105`}
                style={{ boxShadow: `0 0 25px ${style.glow}20` }}
              >
                <div className="text-3xl mb-2">{player.badge}</div>
                <div className={`font-orbitron text-3xl font-black ${style.text}`} style={{ textShadow: `0 0 15px ${style.glow}` }}>
                  #{podiumRank}
                </div>
                <div className={`font-mono text-white text-xs mt-2 ${player.isMe ? 'text-cyber-cyan' : ''}`}>
                  {player.name}
                  {player.isMe && <span className="text-cyber-cyan/50 ml-1">(Вы)</span>}
                </div>
                <div className={`font-orbitron text-xs mt-1 ${style.text}`}>LVL {player.level}</div>
                <div className="text-gray-500 text-xs font-mono mt-1">{(player.xp / 1000).toFixed(1)}K XP</div>
              </div>
            );
          })}
        </div>

        {/* Filters + Refresh */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 animate-fade-in-up delay-200">
          <div className="flex flex-wrap gap-2">
            {GUILDS.map(guild => (
              <button
                key={guild}
                onClick={() => setFilterGuild(guild)}
                className={`text-xs font-mono px-3 py-1.5 border transition-all duration-200 ${
                  filterGuild === guild
                    ? 'border-cyber-cyan text-cyber-cyan bg-cyber-cyan/10'
                    : 'border-cyber-cyan/15 text-gray-500 hover:border-cyber-cyan/40 hover:text-gray-300'
                }`}
              >
                {guild}
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            className={`cyber-btn py-1.5 px-3 text-xs ${refreshing ? 'opacity-50' : ''}`}
          >
            <Icon name="RefreshCw" size={12} className={`inline mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'ОБНОВЛЕНИЕ...' : 'ОБНОВИТЬ'}
          </button>
        </div>

        {/* Table */}
        <div className="cyber-panel animate-fade-in-up delay-300">
          <div className="p-3 border-b border-cyber-cyan/15 grid grid-cols-[40px_1fr_auto_80px_24px] gap-2 items-center">
            <div className="font-orbitron text-xs text-gray-600">#</div>
            <div className="font-orbitron text-xs text-gray-600">ИГРОК</div>
            <div className="font-orbitron text-xs text-gray-600 hidden sm:block">ГИЛЬДИЯ</div>
            <div className="font-orbitron text-xs text-gray-600 text-right">XP</div>
            <div />
          </div>

          {players.map((player, idx) => (
            <div
              key={player.rank}
              className={`p-3 grid grid-cols-[40px_1fr_auto_80px_24px] gap-2 items-center border-b border-cyber-cyan/8 transition-all duration-200 hover:bg-white/[0.02] ${
                player.isMe ? 'bg-cyber-cyan/[0.04] border-l-2 border-l-cyber-cyan' : ''
              }`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              {/* Rank */}
              <div className="text-center">
                {player.rank <= 3 ? (
                  <span className={`font-orbitron text-sm ${RANK_STYLES[player.rank - 1].text}`}>
                    #{player.rank}
                  </span>
                ) : (
                  <span className="font-mono text-xs text-gray-600">#{player.rank}</span>
                )}
              </div>

              {/* Badge + Name */}
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base flex-shrink-0">{player.badge}</span>
                <div className="min-w-0">
                  <div className={`font-mono text-sm truncate ${player.isMe ? 'text-cyber-cyan' : 'text-white'}`}>
                    {player.name}
                    {player.isMe && <span className="text-cyber-cyan/40 text-xs ml-1.5">★ Вы</span>}
                  </div>
                  <div className="text-gray-600 text-xs font-mono">LVL {player.level}</div>
                </div>
              </div>

              {/* Guild */}
              <div className="hidden sm:block">
                <span className="font-mono text-[10px]" style={{ color: FACTION_COLORS[player.guild] || '#666' }}>
                  {player.guild}
                </span>
                <div className="text-gray-700 font-mono text-[9px]">{player.cls}</div>
              </div>

              {/* XP */}
              <div className="font-orbitron text-sm text-cyber-yellow text-right">
                {(player.xp / 1000).toFixed(1)}K
              </div>

              {/* Change */}
              <div className="flex justify-center">
                {player.change === 'up' && <Icon name="TrendingUp" size={12} className="text-cyber-green" />}
                {player.change === 'down' && <Icon name="TrendingDown" size={12} className="text-red-500" />}
                {player.change === 'same' && <span className="text-gray-700 text-xs font-mono">—</span>}
              </div>
            </div>
          ))}

          {players.length === 0 && (
            <div className="p-8 text-center text-gray-600 font-mono text-sm">
              В этой гильдии пока нет игроков
            </div>
          )}
        </div>

        {/* My stats */}
        <div className="mt-4 cyber-panel p-4 border-cyber-cyan/30 animate-fade-in-up delay-400">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <div>
                <div className="font-orbitron text-cyber-cyan text-sm">NOVA-7 (Вы)</div>
                <div className="text-gray-500 text-xs font-mono">Призраки Кода · LVL 38</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-orbitron text-cyber-cyan">#2</div>
              <div className="text-gray-500 text-xs font-mono">из 1,337</div>
            </div>
          </div>
          <div className="xp-bar">
            <div className="xp-bar-fill" style={{ width: '87%' }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-gray-600 text-xs font-mono">41,800 XP</span>
            <span className="text-cyber-yellow text-xs font-mono">До #1: 6,400 XP</span>
          </div>
        </div>
      </div>
    </section>
  );
}