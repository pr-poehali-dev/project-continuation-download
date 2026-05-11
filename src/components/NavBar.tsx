import Icon from '@/components/ui/icon';

interface NavBarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

const NAV_ITEMS = [
  { id: 'home', label: 'ГЛАВНАЯ', icon: 'Home' },
  { id: 'profile', label: 'ПРОФИЛЬ', icon: 'User' },
  { id: 'lessons', label: 'УРОКИ', icon: 'BookOpen' },
  { id: 'battle', label: 'БОЙ', icon: 'Sword' },
  { id: 'leaderboard', label: 'РЕЙТИНГ', icon: 'Trophy' },
];

export default function NavBar({ activeSection, onNavigate }: NavBarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cyber-dark/95 backdrop-blur-md border-b border-cyber-cyan/15">
      <div className="container mx-auto px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 group"
        >
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
                {/* Active indicator */}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyber-cyan"
                    style={{ boxShadow: '0 0 8px #00ffff' }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Player mini-info */}
          <div className="hidden sm:flex items-center gap-2 border border-cyber-cyan/20 px-3 py-1.5 hover:border-cyber-cyan/50 transition-all duration-200 cursor-pointer group">
            <span className="text-sm">🧑‍💻</span>
            <div>
              <div className="text-cyber-cyan font-mono text-xs leading-none">NOVA-7</div>
              <div className="text-gray-600 font-mono text-[10px] leading-none mt-0.5">LVL 7 · 2,450 XP</div>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse ml-1" />
          </div>

          <button
            onClick={() => onNavigate('profile')}
            className="cyber-btn py-1.5 px-4 text-xs hidden sm:block"
          >
            ПРОФИЛЬ
          </button>

          {/* Mobile icons */}
          <div className="md:hidden flex gap-0.5">
            {NAV_ITEMS.map(item => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`p-2.5 rounded transition-all duration-200 relative ${
                    isActive ? 'text-cyber-cyan' : 'text-gray-500'
                  }`}
                  style={{
                    backgroundColor: isActive ? '#00ffff10' : 'transparent',
                  }}
                >
                  <Icon name={item.icon as 'Home'} size={17} />
                  {isActive && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyber-cyan" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Animated scan line */}
      <div className="h-px bg-gradient-to-r from-transparent via-cyber-cyan/40 to-transparent" />
    </nav>
  );
}
