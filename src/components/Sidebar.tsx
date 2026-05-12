import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { useGame } from '@/lib/GameContext';

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  onCollapse?: (collapsed: boolean) => void;
}

const NAV_ITEMS = [
  { id: 'home',          label: 'Главная',     icon: 'Home',        color: '#00ffff' },
  { id: 'map',           label: 'Карта',       icon: 'Map',         color: '#00ffff' },
  { id: 'profile',       label: 'Профиль',     icon: 'User',        color: '#00ffff' },
  { id: 'lessons',       label: 'Уроки',       icon: 'BookOpen',    color: '#00ff41' },
  { id: 'npc',           label: 'Агенты',      icon: 'MessageCircle', color: '#00ff41' },
  { id: 'quests',        label: 'Квесты',      icon: 'Scroll',      color: '#00aaff' },
  { id: 'achievements',  label: 'Достижения',  icon: 'Award',       color: '#ffff00' },
  { id: 'battle',        label: 'Code Combat', icon: 'Sword',       color: '#ff00ff' },
  { id: 'dungeon',       label: 'Подземелья',  icon: 'Castle',      color: '#ffaa00' },
  { id: 'crafting',      label: 'Крафт',       icon: 'Hammer',      color: '#aa00ff' },
  { id: 'shop',          label: 'Магазин',     icon: 'ShoppingBag', color: '#aa00ff' },
  { id: 'notifications', label: 'Входящие',    icon: 'Bell',        color: '#555' },
  { id: 'leaderboard',   label: 'Рейтинг',     icon: 'Trophy',      color: '#ffff00' },
];

// Классы — новые имена + обратная совместимость
const CLASS_EMOJI: Record<string, string> = {
  cipher: '💀', data_ghost: '👁️', neural_architect: '🧠',
  hacker: '💀', netrunner: '🕶️', street_samurai: '⚡',
};
const CLASS_COLOR: Record<string, string> = {
  cipher: '#00ff41', data_ghost: '#00aaff', neural_architect: '#aa00ff',
  hacker: '#00ff41', netrunner: '#00aaff', street_samurai: '#aa00ff',
};
const CLASS_LABEL: Record<string, string> = {
  cipher: 'CIPHER', data_ghost: 'DATA GHOST', neural_architect: 'NEURAL ARCHITECT',
  hacker: 'CIPHER', netrunner: 'DATA GHOST', street_samurai: 'NEURAL ARCHITECT',
};

export default function Sidebar({ activeSection, onNavigate, onCollapse }: SidebarProps) {
  const { character, logout } = useGame();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const xpPct = character ? Math.round((character.xp / character.xp_to_next) * 100) : 0;
  const hpPct = character ? Math.round((character.hp / character.max_hp) * 100) : 0;

  const handleNav = (id: string) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-cyber-dark/98 border-b border-cyber-cyan/15 flex items-center justify-between px-4 h-14">
        <button onClick={() => handleNav('home')} className="font-orbitron text-xl font-black">
          <span className="text-cyber-cyan">CODE</span><span className="text-cyber-magenta">RPG</span>
        </button>
        {character && (
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <span>{CLASS_EMOJI[character.class]}</span>
            <span className="text-cyber-cyan">{character.name}</span>
            <span>LVL {character.level}</span>
          </div>
        )}
        <button onClick={() => setMobileOpen(v => !v)} className="text-gray-400 p-2">
          <Icon name={mobileOpen ? 'X' : 'Menu'} size={20} />
        </button>
      </div>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-cyber-dark/98 pt-14">
          <nav className="p-4 space-y-1">
            {NAV_ITEMS.map(item => {
              const isActive = activeSection === item.id;
              return (
                <button key={item.id} onClick={() => handleNav(item.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 font-orbitron text-sm tracking-wider transition-all"
                  style={{
                    color: isActive ? item.color : '#666',
                    backgroundColor: isActive ? item.color + '12' : 'transparent',
                    borderLeft: isActive ? `2px solid ${item.color}` : '2px solid transparent',
                  }}>
                  <Icon name={item.icon as 'Home'} size={18} />
                  {item.label}
                </button>
              );
            })}
            <button onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 font-orbitron text-sm text-gray-600 hover:text-red-400 transition-colors mt-4">
              <Icon name="LogOut" size={18} />
              Выйти
            </button>
          </nav>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 bg-cyber-dark border-r border-cyber-cyan/10 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-cyber-cyan/10 flex-shrink-0">
          {!collapsed && (
            <button onClick={() => handleNav('home')} className="font-orbitron text-lg font-black">
              <span className="text-cyber-cyan">CODE</span><span className="text-cyber-magenta">RPG</span>
            </button>
          )}
          <button
            onClick={() => { setCollapsed(v => { const next = !v; onCollapse?.(next); return next; }); }}
            className="text-gray-600 hover:text-cyber-cyan transition-colors p-1 ml-auto"
          >
            <Icon name={collapsed ? 'ChevronRight' : 'ChevronLeft'} size={16} />
          </button>
        </div>

        {/* Character mini card */}
        {character && !collapsed && (
          <div className="mx-3 mt-3 p-3 border flex-shrink-0"
            style={{ borderColor: (CLASS_COLOR[character.class] || '#00ffff') + '25', backgroundColor: (CLASS_COLOR[character.class] || '#00ffff') + '05' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{CLASS_EMOJI[character.class]}</span>
              <div className="min-w-0 flex-1">
                <div className="font-orbitron text-xs truncate" style={{ color: CLASS_COLOR[character.class] || '#00ffff' }}>{character.name}</div>
                <div className="text-gray-600 font-mono text-[10px]">{CLASS_LABEL[character.class]} · LVL {character.level}</div>
              </div>
            </div>
            {/* Creds + NeuroShards (Creds = coins по GDD) */}
            <div className="flex items-center justify-between mb-2">
              <div className="font-mono text-[10px] text-yellow-500/80">⚡ {character.coins} Creds</div>
              <div className="font-mono text-[10px] text-purple-400/60">◈ 0 NS</div>
            </div>
            {/* HP */}
            <div className="mb-1">
              <div className="flex justify-between text-[9px] font-mono text-gray-600 mb-0.5">
                <span>HP</span><span>{character.hp}/{character.max_hp}</span>
              </div>
              <div className="h-1 bg-black/50 w-full">
                <div className="h-full bg-red-500 transition-all" style={{ width: `${hpPct}%`, boxShadow: '0 0 4px #ff4060' }} />
              </div>
            </div>
            {/* XP */}
            <div>
              <div className="flex justify-between text-[9px] font-mono text-gray-600 mb-0.5">
                <span>XP</span><span>{xpPct}%</span>
              </div>
              <div className="h-1 bg-black/50 w-full">
                <div className="h-full bg-cyber-cyan transition-all" style={{ width: `${xpPct}%`, boxShadow: '0 0 4px #00ffff60' }} />
              </div>
            </div>
          </div>
        )}
        {character && collapsed && (
          <div className="flex justify-center py-3 flex-shrink-0">
            <span className="text-xl">{CLASS_EMOJI[character.class]}</span>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 py-2.5 transition-all duration-150 relative group ${
                  collapsed ? 'justify-center px-0' : 'px-4'
                }`}
                style={{
                  color: isActive ? item.color : '#555',
                  backgroundColor: isActive ? item.color + '12' : 'transparent',
                  borderLeft: !collapsed ? (isActive ? `2px solid ${item.color}` : '2px solid transparent') : 'none',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#aaa'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#555'; }}
              >
                {/* Active glow dot */}
                {isActive && collapsed && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6"
                    style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                )}
                <Icon name={item.icon as 'Home'} size={18} />
                {!collapsed && (
                  <span className="font-orbitron text-xs tracking-wider">{item.label}</span>
                )}
                {/* Tooltip for collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-cyber-dark border border-cyber-cyan/20
                    font-orbitron text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none
                    transition-opacity z-50" style={{ color: item.color }}>
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-cyber-cyan/10 p-2 flex-shrink-0">
          <button
            onClick={logout}
            title={collapsed ? 'Выйти' : undefined}
            className={`w-full flex items-center gap-3 py-2.5 text-gray-600 hover:text-red-400
              transition-colors ${collapsed ? 'justify-center' : 'px-4'}`}
          >
            <Icon name="LogOut" size={16} />
            {!collapsed && <span className="font-orbitron text-xs tracking-wider">ВЫЙТИ</span>}
          </button>
        </div>
      </aside>
    </>
  );
}