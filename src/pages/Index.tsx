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
import Flashcards from '@/components/Flashcards';
import CodeStories from '@/components/CodeStories';
import CodeBuilder from '@/components/CodeBuilder';
import CodeWorkshop from '@/components/CodeWorkshop';
import NextStepWidget from '@/components/NextStepWidget';
import Onboarding, { useOnboarding } from '@/components/Onboarding';
import BetaBanner from '@/components/BetaBanner';
import QuestWatcher from '@/components/QuestWatcher';
import { GAME_MODES, getModeState, getUnlockedModes } from '@/lib/gameModes';
import { useGame } from '@/lib/GameContext';
import { pushNotif } from '@/components/Notifications';

type AppView = 'landing' | 'tutorial' | 'login' | 'register';
type Section = 'home' | 'profile' | 'lessons' | 'battle' | 'dungeon' | 'quests' | 'map' | 'leaderboard' | 'shop' | 'notifications' | 'crafting' | 'achievements' | 'npc' | 'flashcards' | 'stories' | 'builder' | 'workshop';

export default function Index() {
  const { token, character, authLoading } = useGame();
  const prog = useProgress();
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
    // Проверка прогрессии: заблокированные мини-игры — недоступны
    const unlocked = getUnlockedModes(prog, character ? { level: character.level } : null);
    const mode = GAME_MODES.find(m => m.section === section);
    if (mode && !unlocked.has(mode.id)) {
      pushNotif({
        type: 'system',
        title: 'Режим заблокирован',
        body: `Чтобы открыть «${mode.title}» — ${mode.requirement.toLowerCase()}`,
        icon: '🔒',
        color: '#ffaa00',
      });
      return;
    }
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
        {activeSection === 'flashcards' && <Flashcards />}
        {activeSection === 'stories' && <CodeStories />}
        {activeSection === 'builder' && <CodeBuilder />}
        {activeSection === 'workshop' && <CodeWorkshop />}
      </main>
      <ToastContainer />
      <QuestWatcher />
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

const CLASS_IMG_HOME: Record<string, string> = {
  cipher:           'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/ab60e642-3eb1-4491-a0d5-fc580d0d09f2.jpg',
  data_ghost:       'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/1b0d5c41-5e94-4d1a-acb8-284f7932d90a.jpg',
  neural_architect: 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/a36ed9fa-ba2d-4c24-967a-4716846cf3b1.jpg',
  hacker:           'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/ab60e642-3eb1-4491-a0d5-fc580d0d09f2.jpg',
  netrunner:        'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/1b0d5c41-5e94-4d1a-acb8-284f7932d90a.jpg',
  street_samurai:   'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/a36ed9fa-ba2d-4c24-967a-4716846cf3b1.jpg',
};

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
  const charImg   = CLASS_IMG_HOME[character.class] || CLASS_IMG_HOME.cipher;
  const xpPct = Math.round((character.xp / character.xp_to_next) * 100);
  const hpPct = Math.round((character.hp / character.max_hp) * 100);

  const dailyTasks = [
    { label: 'Пройди урок', done: prog.dailyLessons >= 1, current: prog.dailyLessons, goal: 1, color: '#00ff41', section: 'lessons', icon: '📚' },
    { label: 'Выиграй бой',  done: prog.dailyBattles >= 1, current: prog.dailyBattles,  goal: 1, color: '#ff00ff', section: 'battle',  icon: '⚔️' },
    { label: 'Пройди данж', done: prog.dailyDungeons >= 1, current: prog.dailyDungeons, goal: 1, color: '#ffaa00', section: 'dungeon', icon: '🏰' },
  ];
  const dailyDone = dailyTasks.filter(t => t.done).length;

  // Прогрессия мини-игр: следующие открываются по мере прохождения
  const modeActions = GAME_MODES.map(mode => {
    const state = getModeState(mode, prog, { level: character.level });
    return { ...mode, unlocked: state.unlocked, nextHint: state.nextHint };
  });
  // Дополнительные секции (всегда доступны как навигация)
  const navActions = [
    { id: 'map', section: 'map', title: 'Карта', desc: 'Районы CodeGrid-9', icon: '🗺️', color: '#00ffff', unlocked: true, nextHint: undefined as string | undefined },
    { id: 'quests', section: 'quests', title: 'Квесты', desc: 'Миссии Archive', icon: '📜', color: '#00aaff', unlocked: true, nextHint: undefined },
    { id: 'achievements', section: 'achievements', title: 'Достижения', desc: 'Ачивки с наградами', icon: '🏆', color: '#ffff00', unlocked: true, nextHint: undefined },
  ];
  const ACTIONS = [...modeActions, ...navActions];

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background */}
      <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none" />
      <div className="absolute inset-0 scanlines pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 70% 20%, ${charColor}08 0%, transparent 55%)` }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 py-8 lg:py-10">

        {/* ═══ TOP HERO SECTION ═══ */}
        <div className="flex flex-col lg:flex-row items-stretch gap-6 mb-8">

          {/* Left: Character card */}
          <div className="relative flex-shrink-0 w-full lg:w-64">
            <div className="relative overflow-hidden border-2 w-full"
              style={{
                borderColor: charColor + '60',
                boxShadow: `0 0 60px ${charColor}15, 0 0 120px ${charColor}06`,
                clipPath: 'polygon(0 0, 92% 0, 100% 8%, 100% 100%, 8% 100%, 0 92%)',
                aspectRatio: '3/4',
                backgroundColor: '#050a0e',
              }}>
              <img src={charImg} alt={character.name}
                className="w-full h-full object-cover object-top" />
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(5,10,14,0.96) 0%, rgba(5,10,14,0.2) 40%, transparent 65%)' }} />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="font-orbitron text-xl font-black text-white drop-shadow-lg">{character.name}</div>
                <div className="font-mono text-xs mt-0.5" style={{ color: charColor }}>
                  {classLabel[character.class] ?? character.class.toUpperCase()}
                </div>
              </div>
              <div className="absolute top-3 left-3 px-2 py-0.5 font-orbitron text-xs border"
                style={{ color: charColor, borderColor: charColor + '80', backgroundColor: '#050a0ecc' }}>
                LVL {character.level}
              </div>
            </div>
          </div>

          {/* Right: Stats + Daily */}
          <div className="flex-1 flex flex-col gap-4">

            {/* Headline */}
            <div>
              <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-1">
                // UNDERNET HUB · CODEGRID-9 · 2087
              </div>
              <h1 className="font-orbitron text-2xl lg:text-3xl text-white font-black">
                АГЕНТ <span style={{ color: charColor }}>{character.name}</span>
              </h1>
              <div className="font-mono text-xs text-gray-600 mt-0.5">
                АКТ {character.current_chapter} · {prog.sessionsCount} сессий
              </div>
            </div>

            {/* 4 stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Уровень', value: character.level,   color: charColor,  icon: '⭐' },
                { label: 'XP',      value: `${character.xp}/${character.xp_to_next}`, color: '#00ffff', icon: '◆', bar: xpPct },
                { label: 'HP',      value: `${character.hp}/${character.max_hp}`,      color: '#ff4060', icon: '❤', bar: hpPct },
                { label: 'Creds',   value: character.coins,   color: '#ffaa00',  icon: '⚡' },
              ].map(s => (
                <div key={s.label} className="border p-3 transition-all"
                  style={{ borderColor: s.color + '25', backgroundColor: s.color + '05' }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs">{s.icon}</span>
                    <span className="font-mono text-[9px] text-gray-600">{s.label}</span>
                  </div>
                  <div className="font-orbitron text-lg font-black" style={{ color: s.color }}>{s.value}</div>
                  {'bar' in s && s.bar !== undefined && (
                    <div className="mt-1.5 h-1 bg-black/60">
                      <div className="h-full transition-all" style={{ width: `${s.bar}%`, backgroundColor: s.color, boxShadow: `0 0 4px ${s.color}` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Daily tasks */}
            <div className="border border-white/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-mono text-[10px] text-gray-600 tracking-widest">// СЕГОДНЯ</div>
                <div className="font-mono text-[10px]" style={{ color: dailyDone === 3 ? '#00ff41' : '#555' }}>
                  {dailyDone}/3 {dailyDone === 3 ? '✓ ВСЁ ГОТОВО' : 'выполнено'}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {dailyTasks.map(t => {
                  const mode = modeActions.find(m => m.section === t.section);
                  const locked = mode ? !mode.unlocked : false;
                  return (
                    <button key={t.label}
                      onClick={() => !locked && onNavigate(t.section)}
                      disabled={locked}
                      className="flex flex-col items-center gap-1.5 p-2.5 border transition-all"
                      style={{
                        borderColor: t.done ? t.color + '60' : '#1a1a1a',
                        backgroundColor: t.done ? t.color + '10' : 'transparent',
                        opacity: locked ? 0.5 : 1,
                        cursor: locked ? 'not-allowed' : 'pointer',
                      }}>
                      <span className="text-xl">{locked ? '🔒' : t.icon}</span>
                      <span className="font-mono text-[9px]" style={{ color: t.done ? t.color : '#444' }}>{t.label}</span>
                      <div className="w-full h-0.5 bg-black/60">
                        <div className="h-full transition-all" style={{ width: t.done ? '100%' : '0%', backgroundColor: t.color }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Global stats row */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Уроков',  value: prog.lessonsCompleted.length, icon: '📚', color: '#00ff41' },
                { label: 'Побед',   value: prog.battlesWon,              icon: '⚔️', color: '#ff00ff' },
                { label: 'Данжей',  value: prog.dungeonsCompleted.length, icon: '🏰', color: '#ffaa00' },
                { label: 'Серия',   value: prog.battlesStreak,           icon: '🔥', color: '#ff4060' },
              ].map(s => (
                <div key={s.label} className="border border-white/5 p-2.5 text-center hover:border-white/10 transition-all">
                  <div className="text-base mb-0.5">{s.icon}</div>
                  <div className="font-orbitron text-sm font-black" style={{ color: s.color }}>{s.value}</div>
                  <div className="font-mono text-[9px] text-gray-600">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ NEXT STEP WIDGET ═══ */}
        <div className="mb-6">
          <NextStepWidget onNavigate={onNavigate} />
        </div>

        {/* ═══ QUICK ACTIONS GRID ═══ */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-4">
            <div className="font-mono text-[10px] text-gray-600 tracking-widest">// РЕЖИМЫ ИГРЫ · ОТКРЫВАЮТСЯ ПО ПРОГРЕССУ</div>
            <div className="font-mono text-[10px] text-cyber-green">
              {modeActions.filter(m => m.unlocked).length}/{modeActions.length} открыто
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {ACTIONS.map(item => {
              const locked = !item.unlocked;
              return (
                <button key={item.section}
                  onClick={() => !locked && onNavigate(item.section)}
                  disabled={locked}
                  className="group flex flex-col items-start gap-2 p-4 border text-left transition-all relative"
                  style={{
                    borderColor: locked ? '#222' : item.color + '20',
                    backgroundColor: locked ? '#08090b' : 'transparent',
                    opacity: locked ? 0.55 : 1,
                    cursor: locked ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={e => {
                    if (locked) return;
                    (e.currentTarget as HTMLElement).style.borderColor = item.color + '60';
                    (e.currentTarget as HTMLElement).style.backgroundColor = item.color + '08';
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${item.color}12`;
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    if (locked) return;
                    (e.currentTarget as HTMLElement).style.borderColor = item.color + '20';
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }}>
                  <span className="text-2xl transition-transform" style={{ filter: locked ? 'grayscale(1)' : 'none' }}>
                    {locked ? '🔒' : item.icon}
                  </span>
                  <div>
                    <div className="font-orbitron text-xs font-black" style={{ color: locked ? '#666' : '#fff' }}>
                      {item.title}
                    </div>
                    <div className="font-mono text-[9px] text-gray-600 mt-0.5">{item.desc}</div>
                  </div>
                  <div className="mt-auto font-mono text-[9px]" style={{ color: locked ? '#555' : item.color + '90' }}>
                    {locked ? `▸ ${item.nextHint}` : '→ войти'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}