import Icon from '@/components/ui/icon';
import { useGame } from '@/lib/GameContext';

interface NavBarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

const NAV_ITEMS = [
  { id: 'home', label: 'ГЛАВНАЯ', icon: 'Home' },
  { id: 'profile', label: 'ПРОФИЛЬ', icon: 'User' },
  { id: 'lessons', label: 'УРОКИ', icon: 'BookOpen' },
  { id: 'battle', label: 'БОЙ', icon: 'Sword' },
  { id: 'shop', label: 'МАГАЗИН', icon: 'ShoppingBag' },
  { id: 'leaderboard', label: 'РЕЙТИНГ', icon: 'Trophy' },
];

const CLASS_EMOJI: Record<string, string> = {
  hacker: '🧑‍💻',
  netrunner: '🕶️',
  street_samurai: '⚔️',
};

export default function NavBar({ activeSection, onNavigate }: NavBarProps) {
  const { character, logout } = useGame();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cyber-dark/95 backdrop-blur-md border-b border-cyber-cyan/15">
      <div className="container mx-auto px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <button onClick={() => onNavigate('home')} className="flex items-center gap-2 group">
          <span className="font-orbitron text-xl font-black tracking-wider transition-all duration-300 group-hover:drop-shadow-[0_0_12px_#00ffff]">
            <span className="text-cyber-cyan">CODE</span>
            <span className="text-cyber-magenta">RPG</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(item => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative flex items-center gap-1.5 px-3 py-2 text-xs font-orbitron tracking-wider transition-all duration-200 ${
                  isActive ? 'text-cyber-cyan' : 'text-gray-500 hover:text-gray-200'
                }`}
              >
                <Icon name={item.icon as 'Home'} size={11} />
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyber-cyan" style={{ boxShadow: '0 0 8px #00ffff' }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {character && (
            <button
              onClick={() => onNavigate('profile')}
              className="hidden sm:flex items-center gap-2 border border-cyber-cyan/20 px-3 py-1.5 hover:border-cyber-cyan/50 transition-all duration-200 cursor-pointer"
            >
              <span className="text-sm">{CLASS_EMOJI[character.class] || '🧑‍💻'}</span>
              <div>
                <div className="text-cyber-cyan font-mono text-xs leading-none">{character.name}</div>
                <div className="text-gray-600 font-mono text-[10px] leading-none mt-0.5">
                  LVL {character.level} · {character.xp} XP · 🪙 {character.coins}
                </div>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse ml-1" />
            </button>
          )}

          <button
            onClick={logout}
            className="cyber-btn py-1.5 px-3 text-xs hidden sm:flex items-center gap-1 cyber-btn-magenta"
            title="Выход"
          >
            <Icon name="LogOut" size={12} />
          </button>

          {/* Mobile icons */}
          <div className="md:hidden flex gap-0.5">
            {NAV_ITEMS.map(item => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`p-2.5 rounded transition-all duration-200 relative ${isActive ? 'text-cyber-cyan' : 'text-gray-500'}`}
                  style={{ backgroundColor: isActive ? '#00ffff10' : 'transparent' }}
                >
                  <Icon name={item.icon as 'Home'} size={17} />
                  {isActive && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyber-cyan" />}
                </button>
              );
            })}
            <button onClick={logout} className="p-2.5 text-gray-600">
              <Icon name="LogOut" size={17} />
            </button>
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-cyber-cyan/40 to-transparent" />
    </nav>
  );
}