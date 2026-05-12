import { useState, useEffect } from 'react';
import { useProgress } from '@/lib/useProgress';
import { progress as progressStore } from '@/lib/progressStore';
import Sidebar from '@/components/Sidebar';
import CharacterProfile from '@/components/CharacterProfile';
import LessonsSection from '@/components/LessonsSection';
import BattleSystem from '@/components/BattleSystem';
import Leaderboard from '@/components/Leaderboard';
import ShopSection from '@/components/ShopSection';
import AuthScreen from '@/components/AuthScreen';
import CreateCharacter from '@/components/CreateCharacter';
import Landing from '@/components/Landing';
import Tutorial from '@/components/Tutorial';
import Dungeon from '@/components/Dungeon';
import QuestLog from '@/components/QuestLog';
import CityMap from '@/components/CityMap';
import NotificationCenter, { ToastContainer } from '@/components/Notifications';
import Crafting from '@/components/Crafting';
import Achievements from '@/components/Achievements';
import NpcDialog from '@/components/NpcDialog';
import Onboarding, { useOnboarding } from '@/components/Onboarding';
import BetaBanner from '@/components/BetaBanner';
import { useGame } from '@/lib/GameContext';

type AppView = 'landing' | 'tutorial' | 'login' | 'register';
type Section = 'home' | 'profile' | 'lessons' | 'battle' | 'dungeon' | 'quests' | 'map' | 'leaderboard' | 'shop' | 'notifications' | 'crafting' | 'achievements' | 'npc';

export default function Index() {
  const { token, character, authLoading } = useGame();
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [visible, setVisible] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [appView, setAppView] = useState<AppView>('landing');
  const { show: showOnboarding, setShow: setShowOnboarding } = useOnboarding();

  // Записываем сессию при входе
  useEffect(() => {
    if (token && character) progressStore.recordSession();
  }, [token, character?.id]);

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

  // Not logged in — show landing / tutorial / auth
  if (!token) {
    if (appView === 'tutorial') {
      return (
        <Tutorial
          onBack={() => setAppView('landing')}
          onRegister={() => setAppView('register')}
        />
      );
    }
    if (appView === 'login' || appView === 'register') {
      return (
        <AuthScreen
          mode={appView}
          onSwitch={m => setAppView(m)}
          onBack={() => setAppView('landing')}
        />
      );
    }
    return (
      <Landing
        onLogin={() => setAppView('login')}
        onRegister={() => setAppView('register')}
        onTutorial={() => setAppView('tutorial')}
      />
    );
  }

  // No character
  if (!character) return <CreateCharacter />;

  return (
    <div className="min-h-screen bg-cyber-dark flex">
      {/* Sidebar navigation */}
      <Sidebar activeSection={activeSection} onNavigate={navigate} onCollapse={setSidebarCollapsed} />

      {/* Main content — dynamic offset */}
      <main
        className="flex-1 min-h-screen transition-all duration-300 pt-14 lg:pt-7 overflow-x-hidden"
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
        {activeSection === 'dungeon' && <Dungeon />}
        {activeSection === 'quests' && <QuestLog onNavigate={navigate} />}
        {activeSection === 'map' && <CityMap onNavigate={navigate} />}
        {activeSection === 'leaderboard' && <Leaderboard />}
        {activeSection === 'shop' && <ShopSection />}
        {activeSection === 'notifications' && <NotificationCenter />}
        {activeSection === 'crafting' && <Crafting />}
        {activeSection === 'achievements' && <Achievements />}
        {activeSection === 'npc' && <NpcDialog />}
      </main>
      <ToastContainer />
      <BetaBanner version="0.1.0-beta" />
      {showOnboarding && (
        <Onboarding
          onNavigate={section => { navigate(section); }}
          onClose={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
}

function HomeSection({ onNavigate }: { onNavigate: (s: string) => void }) {
  const { character } = useGame();
  const prog = useProgress();
  if (!character) return null;

  const classColor: Record<string, string> = {
    cipher: '#00ff41', data_ghost: '#00aaff', neural_architect: '#aa00ff',
    hacker: '#00ff41', netrunner: '#00aaff', street_samurai: '#aa00ff',
  };
  const classLabel: Record<string, string> = {
    cipher: 'CIPHER', data_ghost: 'DATA GHOST', neural_architect: 'NEURAL ARCHITECT',
    hacker: 'CIPHER', netrunner: 'DATA GHOST', street_samurai: 'NEURAL ARCHITECT',
  };
  const charColor = classColor[character.class] || '#00ff41';
  const xpPct = Math.round((character.xp / character.xp_to_next) * 100);

  // Дневные задачи
  const dailyTasks = [
    { label: 'Пройди 1 урок', done: prog.dailyLessons >= 1, current: prog.dailyLessons, goal: 1, color: '#00ff41' },
    { label: 'Выиграй 1 бой', done: prog.dailyBattles >= 1, current: prog.dailyBattles, goal: 1, color: '#ff00ff' },
    { label: 'Пройди 1 данж', done: prog.dailyDungeons >= 1, current: prog.dailyDungeons, goal: 1, color: '#ffaa00' },
  ];
  const dailyDone = dailyTasks.filter(t => t.done).length;

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="absolute inset-0 scanlines pointer-events-none" />

      <div className="relative z-10 px-6 lg:px-10 py-10 max-w-5xl">
        {/* Welcome header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="font-mono text-[10px] text-gray-700 tracking-widest mb-1">
            // UNDERNET HUB · CODEGRID-9 · 2087
          </div>
          <h1 className="font-orbitron text-3xl lg:text-4xl text-white mb-1">
            АГЕНТ <span style={{ color: charColor }}>{character.name}</span>
          </h1>
          <div className="flex items-center gap-3 flex-wrap mt-1">
            <span className="font-mono text-xs" style={{ color: charColor }}>
              {classLabel[character.class] ?? character.class.toUpperCase()}
            </span>
            <span className="text-gray-700 font-mono text-xs">·</span>
            <span className="text-gray-500 font-mono text-xs">LVL {character.level}</span>
            <span className="text-gray-700 font-mono text-xs">·</span>
            <span className="text-gray-500 font-mono text-xs">АКТ {character.current_chapter}</span>
          </div>
        </div>

        {/* Progress overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Уровень', value: character.level, color: charColor },
            { label: 'XP', value: `${character.xp}/${character.xp_to_next}`, color: '#00ffff', bar: xpPct },
            { label: 'HP', value: `${character.hp}/${character.max_hp}`, color: '#ff4060', bar: Math.round((character.hp / character.max_hp) * 100) },
            { label: 'Creds', value: `⚡ ${character.coins}`, color: '#ffaa00' },
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

        {/* Daily progress */}
        <div className="mb-8">
          <div className="font-mono text-xs text-gray-600 mb-3 tracking-widest">
            // ЕЖЕДНЕВНЫЕ ЗАДАЧИ · {dailyDone}/{dailyTasks.length} ВЫПОЛНЕНО
          </div>
          <div className="grid grid-cols-3 gap-3">
            {dailyTasks.map(task => (
              <div key={task.label}
                className="border p-3 transition-all"
                style={{
                  borderColor: task.done ? task.color + '60' : '#ffffff0a',
                  backgroundColor: task.done ? task.color + '08' : 'transparent',
                }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-4 h-4 border-2 flex items-center justify-center flex-shrink-0`}
                    style={{ borderColor: task.done ? task.color : '#333', backgroundColor: task.done ? task.color + '25' : 'transparent' }}>
                    {task.done && <span style={{ color: task.color, fontSize: '9px' }}>✓</span>}
                  </div>
                  <span className="font-mono text-[10px]" style={{ color: task.done ? task.color : '#555' }}>
                    {task.label}
                  </span>
                </div>
                <div className="h-1 bg-black/60">
                  <div className="h-full transition-all"
                    style={{ width: `${Math.min(100, (task.current / task.goal) * 100)}%`, backgroundColor: task.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global stats bar */}
        <div className="mb-8 grid grid-cols-4 gap-2">
          {[
            { label: 'Уроков', value: prog.lessonsCompleted.length, icon: '📚', color: '#00ff41' },
            { label: 'Побед', value: prog.battlesWon, icon: '⚔️', color: '#ff00ff' },
            { label: 'Данжей', value: prog.dungeonsCompleted.length, icon: '🏰', color: '#ffaa00' },
            { label: 'Серия', value: prog.battlesStreak, icon: '🔥', color: '#ff4060' },
          ].map(s => (
            <div key={s.label} className="border border-white/5 p-3 text-center">
              <div className="text-lg mb-0.5">{s.icon}</div>
              <div className="font-orbitron text-base font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="font-mono text-[9px] text-gray-600">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mb-10">
          <div className="font-mono text-xs text-gray-600 mb-4 tracking-widest">// БЫСТРЫЕ ДЕЙСТВИЯ</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '🗺️', title: 'Карта города', desc: 'CodeGrid-9 на карте — районы, фракции, миссии.', color: '#00ffff', section: 'map', btn: 'НА КАРТУ' },
              { icon: '📡', title: 'Уроки Python', desc: 'Теория + практика. Читай, смотри примеры, пиши код.', color: '#00ff41', section: 'lessons', btn: 'УЧИТЬСЯ' },
              { icon: '💬', title: 'Агенты Archive', desc: 'Диалоги с NPC: PYTH-0N, K4I, Void Trader. Лор + награды.', color: '#00ff41', section: 'npc', btn: 'ГОВОРИТЬ' },
              { icon: '📜', title: 'Квесты', desc: 'Сюжетные и обучающие задания от The Archive.', color: '#00aaff', section: 'quests', btn: 'МИССИИ' },
              { icon: '🏆', title: 'Достижения', desc: 'Python, бои, исследования — 18+ ачивок с наградами.', color: '#ffff00', section: 'achievements', btn: 'СМОТРЕТЬ' },
              { icon: '⚔️', title: 'Code Combat', desc: 'Сражайся с NEXUS кодом. Action Phase 12 секунд.', color: '#ff00ff', section: 'battle', btn: 'В БОЙ' },
              { icon: '🏰', title: 'Подземелья', desc: 'Тесты по Python с выбором ответов. Зарабатывай лут.', color: '#ffaa00', section: 'dungeon', btn: 'ВОЙТИ' },
              { icon: '🔨', title: 'Крафт', desc: 'Создавай уникальные импланты из ресурсов миссий.', color: '#aa00ff', section: 'crafting', btn: 'СОЗДАВАТЬ' },
              { icon: '🌑', title: 'Чёрный Рынок', desc: 'Void Relic, Neon Core, Glitch Box — имплант-лут.', color: '#aa00ff', section: 'shop', btn: 'ТОРГОВАТЬ' },
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