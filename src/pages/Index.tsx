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
import EquipmentBadges from '@/components/EquipmentBadges';
import BetaBanner from '@/components/BetaBanner';
import QuestWatcher from '@/components/QuestWatcher';
import BootSequence from '@/components/prologue/BootSequence';
import PrologueFlow, { usePrologue } from '@/components/prologue/PrologueFlow';
import { GAME_MODES, getModeState, getUnlockedModes } from '@/lib/gameModes';
import { useGame } from '@/lib/GameContext';
import { pushNotif } from '@/components/Notifications';

type AppView = 'landing' | 'tutorial' | 'login' | 'register' | 'boot';
type Section = 'home' | 'profile' | 'lessons' | 'battle' | 'dungeon' | 'quests' | 'map' | 'leaderboard' | 'shop' | 'notifications' | 'crafting' | 'achievements' | 'npc' | 'flashcards' | 'stories' | 'builder' | 'workshop';

export default function Index() {
  const { token, character, authLoading } = useGame();
  const prog = useProgress();
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [visible, setVisible] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [appView, setAppView] = useState<AppView>('boot');
  const prologue = usePrologue();

  // Прогрессивное раскрытие интерфейса во время пролога
  const prologueUnlocked = (() => {
    if (!prologue.active) return undefined; // все секции открыты
    const base = new Set<string>();
    // Этапы 'awakening' и 'first_code' — игрок внутри оверлея, sidebar пуст
    if (prologue.step === 'first_battle') {
      // Игрок только что вышел в бой
      base.add('battle');
      base.add('profile');
    } else if (prologue.step === 'lore_factions') {
      base.add('battle');
      base.add('profile');
    } else if (prologue.step === 'open_world') {
      base.add('map');
      base.add('battle');
      base.add('profile');
    }
    return base;
  })();

  // Записываем сессию при входе
  useEffect(() => {
    if (token && character) progressStore.recordSession();
  }, [token, character?.id]);

  // Автопродвижение пролога: после первой победы (XP > 0) на шаге first_battle
  useEffect(() => {
    if (prologue.step === 'first_battle' && character && character.xp > 0) {
      const t = setTimeout(() => prologue.advance('lore_factions'), 1200);
      return () => clearTimeout(t);
    }
  }, [prologue.step, character?.xp]);

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

  // Not logged in — show boot / landing / tutorial / auth
  if (!token) {
    if (appView === 'boot') {
      return <BootSequence onComplete={() => setAppView('landing')} />;
    }
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
      <Sidebar
        activeSection={activeSection}
        onNavigate={navigate}
        onCollapse={setSidebarCollapsed}
        unlockedSections={prologueUnlocked}
      />

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
      {prologue.step && (
        <PrologueFlow
          step={prologue.step}
          onAdvance={prologue.advance}
          onOpenSection={(s) => {
            setActiveSection(s as Section);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
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

  // Прогрессия мини-игр: считаем сколько открыто (для бейджа на карте)
  const modeActions = GAME_MODES.map(mode => {
    const state = getModeState(mode, prog, { level: character.level });
    return { ...mode, unlocked: state.unlocked, nextHint: state.nextHint };
  });
  const unlockedCount = modeActions.filter(m => m.unlocked).length;

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
              <EquipmentBadges />
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

        {/* ═══ CITY MAP PROMO — главный портал в режимы ═══ */}
        <button onClick={() => onNavigate('map')}
          className="w-full mb-6 group relative overflow-hidden border-2 transition-all text-left hover:-translate-y-0.5"
          style={{
            borderColor: '#00aaff60',
            backgroundColor: '#00aaff08',
            boxShadow: '0 0 30px #00aaff15',
          }}>
          <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
          <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ backgroundColor: '#00aaff' }} />
          <div className="relative z-10 p-5 lg:p-6 flex items-center gap-5">
            <div className="text-5xl lg:text-6xl flex-shrink-0">🗺️</div>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[10px] text-cyan-300/60 tracking-widest mb-1">
                // ВЕСЬ ГОРОД · ВСЕ РЕЖИМЫ
              </div>
              <h2 className="font-orbitron text-xl lg:text-2xl font-black text-white mb-1">
                ОТКРЫТЬ <span className="text-cyber-cyan">КАРТУ CODEGRID-9</span>
              </h2>
              <p className="font-rajdhani text-sm text-gray-400 leading-snug max-w-xl">
                Уроки, бои, NPC, карточки, конструктор, подземелья — каждый режим живёт в своём районе.
                Кликай по карте чтобы перейти.
              </p>
              <div className="mt-2 flex items-center gap-3 font-mono text-[10px]">
                <span className="text-cyber-green">⬢ {unlockedCount}/{GAME_MODES.length} режимов открыто</span>
                <span className="text-gray-600">·</span>
                <span className="text-cyber-cyan">→ войти</span>
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-end gap-1 text-right">
              <div className="font-orbitron text-3xl font-black text-cyber-cyan">{unlockedCount}</div>
              <div className="font-mono text-[9px] text-gray-500">из {GAME_MODES.length} режимов</div>
            </div>
          </div>
        </button>

        {/* ═══ БЫСТРЫЕ ССЫЛКИ — только то, что не дублирует карту ═══ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { section: 'quests',       title: 'Квесты',      desc: 'Сюжет и побочки',  icon: '📜', color: '#00aaff' },
            { section: 'achievements', title: 'Достижения', desc: 'Ачивки с наградами', icon: '🏆', color: '#ffff00' },
            { section: 'shop',         title: 'Магазин',    desc: 'Лутбоксы, импланты', icon: '🌑', color: '#aa00ff' },
            { section: 'profile',      title: 'Профиль',    desc: 'Инвентарь, статы',   icon: '👤', color: '#00ff41' },
          ].map(item => (
            <button key={item.section} onClick={() => onNavigate(item.section)}
              className="group flex flex-col items-start gap-2 p-4 border transition-all hover:-translate-y-0.5 text-left"
              style={{ borderColor: item.color + '25' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = item.color + '60';
                (e.currentTarget as HTMLElement).style.backgroundColor = item.color + '08';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = item.color + '25';
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              }}>
              <span className="text-2xl">{item.icon}</span>
              <div>
                <div className="font-orbitron text-xs font-black text-white">{item.title}</div>
                <div className="font-mono text-[9px] text-gray-600 mt-0.5">{item.desc}</div>
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}