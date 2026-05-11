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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cyber-dark/90 backdrop-blur-sm border-b border-cyber-cyan/20">
      <div className="container mx-auto px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <button onClick={() => onNavigate('home')} className="flex items-center gap-2">
          <span className="font-orbitron text-cyber-cyan text-xl font-black tracking-wider">
            CODE<span className="text-cyber-magenta">RPG</span>
          </span>
        </button>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-orbitron tracking-wider transition-all ${
                activeSection === item.id
                  ? 'text-cyber-cyan border-b-2 border-cyber-cyan'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon name={item.icon as any} size={12} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Player mini-info */}
          <div className="hidden sm:flex items-center gap-2 border border-cyber-cyan/20 px-3 py-1">
            <span className="text-cyber-cyan font-mono text-xs">NOVA-7</span>
            <span className="text-gray-500 font-mono text-xs">LVL 7</span>
            <div className="w-1 h-1 rounded-full bg-cyber-green animate-pulse" />
          </div>
          <button className="cyber-btn py-1.5 px-4 text-xs hidden sm:block">
            ВОЙТИ
          </button>

          {/* Mobile menu */}
          <div className="md:hidden flex gap-1">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`p-2 transition-colors ${
                  activeSection === item.id ? 'text-cyber-cyan' : 'text-gray-500'
                }`}
              >
                <Icon name={item.icon as any} size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Animated bottom line */}
      <div className="h-px bg-gradient-to-r from-transparent via-cyber-cyan/50 to-transparent" />
    </nav>
  );
}
