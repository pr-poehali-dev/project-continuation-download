import Icon from '@/components/ui/icon';

const PLAYERS = [
  { rank: 1, name: 'Х4CK3R_PR1M3', level: 42, xp: 48200, guild: 'Корпорация Ноль', badge: '🔥', change: 'up' },
  { rank: 2, name: 'NOVA_7', level: 38, xp: 41800, guild: 'Призраки Кода', badge: '⚡', change: 'same' },
  { rank: 3, name: 'CyberWitch', level: 35, xp: 38100, guild: 'Нейро-клан', badge: '🌙', change: 'up' },
  { rank: 4, name: 'QuantumByte', level: 31, xp: 32700, guild: 'Байт-форс', badge: '💎', change: 'down' },
  { rank: 5, name: 'VOID_CODER', level: 28, xp: 29900, guild: 'Соло', badge: '🤖', change: 'up' },
  { rank: 6, name: 'Neon_Ghost', level: 25, xp: 26400, guild: 'Призраки Кода', badge: '👻', change: 'down' },
  { rank: 7, name: 'DataPunk_X', level: 22, xp: 22100, guild: 'Корпорация Ноль', badge: '🎭', change: 'same' },
  { rank: 8, name: 'BinaryKing', level: 19, xp: 18600, guild: 'Байт-форс', badge: '👑', change: 'up' },
];

const RANK_STYLES = [
  { bg: 'bg-cyber-yellow/10', border: 'border-cyber-yellow/60', text: 'text-cyber-yellow', glow: '#ffff00' },
  { bg: 'bg-gray-400/10', border: 'border-gray-400/60', text: 'text-gray-300', glow: '#aaaaaa' },
  { bg: 'bg-orange-400/10', border: 'border-orange-400/60', text: 'text-orange-400', glow: '#fb923c' },
];

export default function Leaderboard() {
  return (
    <section className="py-16 px-6 bg-cyber-dark/30">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="text-cyber-yellow font-mono text-xs tracking-widest mb-2">// РЕЙТИНГ</div>
          <h2 className="font-orbitron text-3xl text-white">ТОП ХАКЕРОВ</h2>
          <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-cyber-yellow to-transparent mx-auto mt-3" />
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-in-up">
          {[PLAYERS[1], PLAYERS[0], PLAYERS[2]].map((player, idx) => {
            const podiumRank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
            const style = RANK_STYLES[podiumRank - 1];
            return (
              <div
                key={player.rank}
                className={`cyber-panel p-4 text-center ${style.bg} border ${style.border} ${idx === 1 ? 'order-first lg:order-none' : ''}`}
                style={{ boxShadow: `0 0 20px ${style.glow}30`, marginTop: idx === 1 ? 0 : '1.5rem' }}
              >
                <div className="text-2xl mb-2">{player.badge}</div>
                <div className={`font-orbitron text-2xl font-black ${style.text}`}>#{podiumRank}</div>
                <div className="font-mono text-white text-xs mt-2 truncate">{player.name}</div>
                <div className={`font-orbitron text-xs mt-1 ${style.text}`}>LVL {player.level}</div>
                <div className="text-gray-400 text-xs font-mono mt-1">{player.xp.toLocaleString()} XP</div>
              </div>
            );
          })}
        </div>

        {/* Full Table */}
        <div className="cyber-panel animate-fade-in-up delay-200">
          <div className="p-4 border-b border-cyber-cyan/20 flex items-center gap-4">
            <div className="font-orbitron text-xs text-gray-400">ПОЗИЦИЯ</div>
            <div className="flex-1 font-orbitron text-xs text-gray-400">ИГРОК</div>
            <div className="font-orbitron text-xs text-gray-400 hidden sm:block">ГИЛЬДИЯ</div>
            <div className="font-orbitron text-xs text-gray-400 w-16 text-right">XP</div>
          </div>

          {PLAYERS.map((player, idx) => (
            <div
              key={player.rank}
              className={`p-4 flex items-center gap-4 border-b border-cyber-cyan/10 hover:bg-cyber-cyan/5 transition-all ${
                player.name === 'NOVA_7' ? 'bg-cyber-cyan/5 border-l-2 border-l-cyber-cyan' : ''
              }`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              {/* Rank */}
              <div className="w-8 text-center">
                {player.rank <= 3 ? (
                  <span className={`font-orbitron text-sm ${RANK_STYLES[player.rank - 1].text}`}>
                    #{player.rank}
                  </span>
                ) : (
                  <span className="font-mono text-xs text-gray-500">#{player.rank}</span>
                )}
              </div>

              {/* Badge + Name */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-lg">{player.badge}</span>
                <div>
                  <div className={`font-mono text-sm ${player.name === 'NOVA_7' ? 'text-cyber-cyan' : 'text-white'}`}>
                    {player.name}
                    {player.name === 'NOVA_7' && (
                      <span className="text-cyber-cyan/50 text-xs ml-2">(Вы)</span>
                    )}
                  </div>
                  <div className="text-gray-500 text-xs font-mono">LVL {player.level}</div>
                </div>
              </div>

              {/* Guild */}
              <div className="text-gray-400 text-xs font-mono hidden sm:block text-center flex-shrink-0">
                {player.guild}
              </div>

              {/* XP + Change */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-orbitron text-sm text-cyber-yellow w-16 text-right">
                  {(player.xp / 1000).toFixed(1)}K
                </span>
                <div className="w-4">
                  {player.change === 'up' && <Icon name="TrendingUp" size={12} className="text-cyber-green" />}
                  {player.change === 'down' && <Icon name="TrendingDown" size={12} className="text-cyber-red" />}
                  {player.change === 'same' && <span className="text-gray-600 text-xs font-mono">—</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* My position */}
        <div className="mt-4 cyber-panel p-4 border-cyber-cyan/40 animate-fade-in-up delay-300">
          <div className="flex items-center justify-between">
            <div className="text-cyber-cyan font-mono text-xs">ВАШ ТЕКУЩИЙ РЕЙТИНГ</div>
            <div className="font-orbitron text-cyber-cyan">#2 из 1,337 игроков</div>
          </div>
          <div className="mt-2 xp-bar">
            <div className="xp-bar-fill" style={{ width: '87%' }} />
          </div>
          <div className="text-xs font-mono text-gray-400 mt-1">До #1: 6,400 XP</div>
        </div>
      </div>
    </section>
  );
}
