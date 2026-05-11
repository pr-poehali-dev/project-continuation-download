import { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import HeroSection from '@/components/HeroSection';
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

  const navigate = (section: string) => {
    setVisible(false);
    setTimeout(() => {
      setActiveSection(section as Section);
      setVisible(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 220);
  };

  useEffect(() => {
    setVisible(true);
  }, []);

  // Loading spinner
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

  // Not logged in → auth screen
  if (!token) return <AuthScreen />;

  // No character → creation screen
  if (!character) return <CreateCharacter />;

  return (
    <div className="min-h-screen bg-cyber-dark">
      <NavBar activeSection={activeSection} onNavigate={navigate} />

      <main
        className="pt-14 transition-all duration-200"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)' }}
      >
        {activeSection === 'home' && (
          <>
            <HeroSection onStart={() => navigate('lessons')} />

            {/* Features section */}
            <section className="py-16 px-6">
              <div className="container mx-auto max-w-5xl">
                <div className="text-center mb-10">
                  <div className="text-cyber-cyan font-mono text-xs tracking-widest mb-2">// ВОЗМОЖНОСТИ</div>
                  <h2 className="font-orbitron text-3xl text-white">ЧТО ТЕБЯ ЖДЁТ</h2>
                  <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent mx-auto mt-3" />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      icon: '🐍',
                      title: 'Учись Python',
                      desc: 'Интерактивные уроки с живым редактором кода прямо в браузере',
                      color: '#00ff41',
                      btn: 'УРОКИ',
                      section: 'lessons',
                    },
                    {
                      icon: '⚔️',
                      title: 'Сражайся',
                      desc: 'Боевая система: правильный код = мощная атака по врагу',
                      color: '#ff00ff',
                      btn: 'В БОЙ',
                      section: 'battle',
                    },
                    {
                      icon: '🏆',
                      title: 'Соревнуйся',
                      desc: 'Рейтинг лучших хакеров мегаполиса. Докажи свой уровень',
                      color: '#ffff00',
                      btn: 'РЕЙТИНГ',
                      section: 'leaderboard',
                    },
                  ].map((feature, idx) => (
                    <div
                      key={feature.title}
                      className="cyber-panel p-6 text-center animate-fade-in-up cursor-pointer group"
                      style={{
                        animationDelay: `${idx * 0.15}s`,
                        borderColor: feature.color + '25',
                        transition: 'all 0.3s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = feature.color + '80';
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${feature.color}20`;
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = feature.color + '25';
                        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                      }}
                    >
                      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                      <h3 className="font-orbitron text-white text-lg mb-2">{feature.title}</h3>
                      <p className="text-gray-400 font-rajdhani text-sm mb-6 leading-relaxed">{feature.desc}</p>
                      <button
                        onClick={() => navigate(feature.section)}
                        className="cyber-btn text-xs w-full"
                        style={{ borderColor: feature.color, color: feature.color }}
                      >
                        {feature.btn}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Game design teaser */}
                <div className="mt-12 cyber-panel p-8 animate-fade-in-up delay-400">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <div className="text-cyber-magenta font-mono text-xs tracking-widest mb-2">// МЕХАНИКА</div>
                      <h3 className="font-orbitron text-2xl text-white mb-6">КАК ЭТО РАБОТАЕТ?</h3>
                      <div className="space-y-4">
                        {[
                          { step: '01', text: 'Создаёшь персонажа и выбираешь имя хакера', color: '#00ffff' },
                          { step: '02', text: 'Проходишь уроки Python и получаешь XP и предметы', color: '#ff00ff' },
                          { step: '03', text: 'В бою пишешь код — правильный ответ наносит урон врагу', color: '#ffff00' },
                          { step: '04', text: 'За победы открываешь экипировку, которая меняется на персонаже', color: '#00ff41' },
                        ].map(item => (
                          <div key={item.step} className="flex gap-4 items-start group">
                            <span
                              className="font-orbitron text-lg font-black flex-shrink-0 w-8"
                              style={{ color: item.color }}
                            >
                              {item.step}
                            </span>
                            <div className="flex-1 border-l pl-4 py-1" style={{ borderColor: item.color + '30' }}>
                              <span className="text-gray-200 font-rajdhani text-base">{item.text}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => navigate('lessons')} className="cyber-btn mt-8 px-8">
                        НАЧАТЬ ПРЯМО СЕЙЧАС
                      </button>
                    </div>
                    <div className="relative">
                      <div className="cyber-panel p-5">
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-cyber-green/10">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                          <span className="text-gray-500 text-xs font-mono ml-2">example.py</span>
                        </div>
                        <pre className="font-mono text-sm leading-loose">
                          <span className="text-cyber-magenta">def </span>
                          <span className="text-cyber-yellow">attack_enemy</span>
                          <span className="text-white">(power):</span>{'\n'}
                          <span className="text-white">    </span>
                          <span className="text-cyber-magenta">return </span>
                          <span className="text-white">power * </span>
                          <span className="text-cyber-cyan">2</span>{'\n\n'}
                          <span className="text-gray-500"># Враг получает урон!</span>{'\n'}
                          <span className="text-cyber-green">damage = attack_enemy(50)</span>{'\n'}
                          <span className="text-cyber-cyan">print</span>
                          <span className="text-white">(</span>
                          <span className="text-cyber-yellow">"💥 Урон: "</span>
                          <span className="text-white">, damage)</span>
                        </pre>
                        <div className="mt-4 border-t border-cyber-green/15 pt-3 space-y-1">
                          <div className="text-cyber-green font-mono text-xs">▶ 💥 Урон:  100</div>
                          <div className="text-cyber-yellow font-mono text-xs">✅ +200 XP получено!</div>
                          <div className="text-cyber-magenta font-mono text-xs">🎁 Предмет разблокирован: Код-Клинок v2.0</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="mt-8 grid grid-cols-4 gap-4 animate-fade-in-up delay-500">
                  {[
                    { value: '50+', label: 'Уроков Python', color: '#00ffff' },
                    { value: '20+', label: 'Врагов и боссов', color: '#ff00ff' },
                    { value: '100+', label: 'Предметов', color: '#ffff00' },
                    { value: '∞', label: 'Прогресса', color: '#00ff41' },
                  ].map(stat => (
                    <div key={stat.label} className="cyber-panel p-4 text-center">
                      <div className="font-orbitron text-3xl font-black mb-1" style={{ color: stat.color, textShadow: `0 0 20px ${stat.color}` }}>
                        {stat.value}
                      </div>
                      <div className="text-gray-500 text-xs font-mono">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-cyber-cyan/10 py-8 px-6 mt-4">
              <div className="container mx-auto text-center">
                <div className="font-orbitron text-cyber-cyan text-xl mb-2 glitch-text">
                  CODE<span className="text-cyber-magenta">RPG</span>
                </div>
                <p className="text-gray-600 font-mono text-xs tracking-widest">
                  © 2025 · PYTHON · CYBERPUNK · RPG
                </p>
              </div>
            </footer>
          </>
        )}

        {activeSection === 'profile' && <CharacterProfile />}
        {activeSection === 'lessons' && <LessonsSection />}
        {activeSection === 'battle' && <BattleSystem />}
        {activeSection === 'leaderboard' && <Leaderboard />}
        {activeSection === 'shop' && <ShopSection />}
      </main>
    </div>
  );
}