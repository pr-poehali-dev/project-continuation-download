import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import CharacterProfile from '@/components/CharacterProfile';
import LessonsSection from '@/components/LessonsSection';
import BattleSystem from '@/components/BattleSystem';
import Leaderboard from '@/components/Leaderboard';
import ShopSection from '@/components/ShopSection';
import AuthScreen from '@/components/AuthScreen';
import CreateCharacter from '@/components/CreateCharacter';
import { useGame } from '@/lib/GameContext';

type Section = 'home' | 'profile' | 'lessons' | 'battle' | 'leaderboard' | 'shop';

export default function Index() {
  const { token, character, authLoading } = useGame();
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [visible, setVisible] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navigate = (section: string) => {
    setVisible(false);
    setTimeout(() => {
      setActiveSection(section as Section);
      setVisible(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 180);
  };

  useEffect(() => { setVisible(true); }, []);

  // Loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-cyber-dark flex items-center justify-center cyber-grid">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="font-orbitron text-cyber-cyan text-sm tracking-widest">ПОДКЛЮЧЕНИЕ К СИСТЕМЕ...</div>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!token) return <AuthScreen />;

  // No character
  if (!character) return <CreateCharacter />;

  return (
    <div className="min-h-screen bg-cyber-dark flex">
      {/* Sidebar navigation */}
      <Sidebar activeSection={activeSection} onNavigate={navigate} onCollapse={setSidebarCollapsed} />

      {/* Main content — dynamic offset */}
      <main
        className="flex-1 min-h-screen transition-all duration-300 pt-14 lg:pt-0 overflow-x-hidden"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(10px)',
          paddingLeft: typeof window !== 'undefined' && window.innerWidth >= 1024
            ? sidebarCollapsed ? '64px' : '224px'
            : undefined,
        }}
        id="main-content"
      >
        {activeSection === 'home' && <HomeSection onNavigate={navigate} />}
        {activeSection === 'profile' && <CharacterProfile />}
        {activeSection === 'lessons' && <LessonsSection />}
        {activeSection === 'battle' && <BattleSystem />}
        {activeSection === 'leaderboard' && <Leaderboard />}
        {activeSection === 'shop' && <ShopSection />}
      </main>
    </div>
  );
}

function HomeSection({ onNavigate }: { onNavigate: (s: string) => void }) {
  const { character } = useGame();
  if (!character) return null;

  const classColor: Record<string, string> = { hacker: '#00ffff', netrunner: '#ff00ff', street_samurai: '#ffff00' };
  const charColor = classColor[character.class] || '#00ffff';

  const xpPct = Math.round((character.xp / character.xp_to_next) * 100);

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="absolute inset-0 scanlines pointer-events-none" />

      <div className="relative z-10 px-6 lg:px-10 py-10 max-w-5xl">
        {/* Welcome header */}
        <div className="mb-10 animate-fade-in-up">
          <div className="font-mono text-xs tracking-widest mb-2" style={{ color: charColor + '99' }}>
            // ДОБРО ПОЖАЛОВАТЬ
          </div>
          <h1 className="font-orbitron text-3xl lg:text-4xl text-white mb-1">
            ПРИВЕТ, <span style={{ color: charColor }}>{character.name}</span>
          </h1>
          <div className="font-mono text-sm text-gray-500">
            Уровень {character.level} · {character.class.replace('_', ' ')} · Глава {character.current_chapter}
          </div>
        </div>

        {/* Progress overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Уровень', value: character.level, color: charColor },
            { label: 'XP', value: `${character.xp}/${character.xp_to_next}`, color: '#00ffff', bar: xpPct },
            { label: 'HP', value: `${character.hp}/${character.max_hp}`, color: '#ff4060', bar: Math.round((character.hp / character.max_hp) * 100) },
            { label: 'Монеты', value: `🪙 ${character.coins}`, color: '#ffaa00' },
          ].map(stat => (
            <div key={stat.label} className="cyber-panel p-4 animate-fade-in-up" style={{ borderColor: stat.color + '20' }}>
              <div className="text-gray-600 font-mono text-xs mb-1">{stat.label}</div>
              <div className="font-orbitron text-xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
              {stat.bar !== undefined && (
                <div className="mt-2 h-1 bg-black/50">
                  <div className="h-full transition-all" style={{ width: `${stat.bar}%`, backgroundColor: stat.color, boxShadow: `0 0 4px ${stat.color}` }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mb-10">
          <div className="font-mono text-xs text-gray-600 mb-4 tracking-widest">// БЫСТРЫЕ ДЕЙСТВИЯ</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '📚', title: 'Уроки Python', desc: 'Продолжить обучение и зарабатывать XP', color: '#00ff41', section: 'lessons', btn: 'УЧИТЬСЯ' },
              { icon: '⚔️', title: 'В бой!', desc: 'Сразиться с врагами и получить лут', color: '#ff00ff', section: 'battle', btn: 'АТАКОВАТЬ' },
              { icon: '🛍️', title: 'Магазин', desc: 'Купить снаряжение или открыть лутбокс', color: '#ffaa00', section: 'shop', btn: 'ОТКРЫТЬ' },
            ].map(item => (
              <div key={item.section}
                className="cyber-panel p-5 cursor-pointer group hover:-translate-y-1 transition-all duration-200"
                style={{ borderColor: item.color + '20' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = item.color + '60'; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${item.color}15`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = item.color + '20'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{item.icon}</div>
                <div className="font-orbitron text-white text-base mb-1">{item.title}</div>
                <div className="text-gray-500 font-rajdhani text-sm mb-4 leading-snug">{item.desc}</div>
                <button
                  onClick={() => onNavigate(item.section)}
                  className="font-orbitron text-xs px-4 py-2 border transition-all"
                  style={{ borderColor: item.color, color: item.color, backgroundColor: item.color + '10' }}
                >
                  {item.btn}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Equipped gear preview */}
        {Object.values(character.equipment).some(Boolean) && (
          <div>
            <div className="font-mono text-xs text-gray-600 mb-4 tracking-widest">// ТЕКУЩАЯ ЭКИПИРОВКА</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(character.equipment).map(([slot, item]) => item && (
                <div key={slot}
                  className="border px-3 py-1.5 font-mono text-xs flex items-center gap-2"
                  style={{
                    borderColor: { common: '#aaa', uncommon: '#00ff41', rare: '#00aaff', epic: '#aa00ff', legendary: '#ffaa00' }[item.rarity] + '50',
                    color: { common: '#aaa', uncommon: '#00ff41', rare: '#00aaff', epic: '#aa00ff', legendary: '#ffaa00' }[item.rarity],
                  }}>
                  <span className="text-gray-600">{{ head: '🪖', body: '🛡️', weapon: '⚔️', gloves: '🔧', boots: '👟', implant: '🔩' }[slot]}</span>
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}