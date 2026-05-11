import { useState } from 'react';
import NavBar from '@/components/NavBar';
import HeroSection from '@/components/HeroSection';
import CharacterProfile from '@/components/CharacterProfile';
import LessonsSection from '@/components/LessonsSection';
import BattleSystem from '@/components/BattleSystem';
import Leaderboard from '@/components/Leaderboard';

type Section = 'home' | 'profile' | 'lessons' | 'battle' | 'leaderboard';

export default function Index() {
  const [activeSection, setActiveSection] = useState<Section>('home');

  const navigate = (section: string) => {
    setActiveSection(section as Section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-cyber-dark">
      <NavBar activeSection={activeSection} onNavigate={navigate} />

      <main className="pt-14">
        {activeSection === 'home' && (
          <>
            <HeroSection onStart={() => navigate('lessons')} />

            {/* Features section */}
            <section className="py-16 px-6">
              <div className="container mx-auto max-w-5xl">
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
                      className="cyber-panel p-6 text-center animate-fade-in-up group hover:scale-105 transition-transform"
                      style={{ animationDelay: `${idx * 0.15}s`, borderColor: feature.color + '30' }}
                    >
                      <div className="text-5xl mb-4">{feature.icon}</div>
                      <h3 className="font-orbitron text-white text-lg mb-2">{feature.title}</h3>
                      <p className="text-gray-400 font-rajdhani text-sm mb-4">{feature.desc}</p>
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
                      <div className="text-cyber-magenta font-mono text-xs tracking-widest mb-2">// GAME DESIGN</div>
                      <h3 className="font-orbitron text-2xl text-white mb-4">КАК ЭТО РАБОТАЕТ?</h3>
                      <div className="space-y-3">
                        {[
                          { step: '01', text: 'Создаёшь персонажа и выбираешь имя хакера' },
                          { step: '02', text: 'Проходишь уроки Python и получаешь XP и предметы' },
                          { step: '03', text: 'В бою пишешь код — правильный ответ наносит урон врагу' },
                          { step: '04', text: 'За победы открываешь экипировку, которая меняется на персонаже' },
                        ].map(item => (
                          <div key={item.step} className="flex gap-3 items-start">
                            <span className="font-orbitron text-cyber-cyan text-sm flex-shrink-0">{item.step}</span>
                            <span className="text-gray-300 font-rajdhani">{item.text}</span>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => navigate('lessons')} className="cyber-btn mt-6">
                        НАЧАТЬ ПРЯМО СЕЙЧАС
                      </button>
                    </div>
                    <div className="relative">
                      <div className="cyber-panel p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full bg-cyber-red" />
                          <div className="w-2 h-2 rounded-full bg-cyber-yellow" />
                          <div className="w-2 h-2 rounded-full bg-cyber-green" />
                          <span className="text-gray-500 text-xs font-mono">example.py</span>
                        </div>
                        <pre className="font-mono text-sm leading-relaxed">
                          <span className="text-cyber-magenta">def </span>
                          <span className="text-cyber-yellow">attack_enemy</span>
                          <span className="text-white">(power):</span>{'\n'}
                          <span className="text-white">    </span>
                          <span className="text-cyber-magenta">return </span>
                          <span className="text-white">power * </span>
                          <span className="text-cyber-cyan">2</span>{'\n'}
                          {'\n'}
                          <span className="text-gray-500"># Враг получает урон!</span>{'\n'}
                          <span className="text-cyber-green">damage = attack_enemy(50)</span>{'\n'}
                          <span className="text-cyber-cyan">print</span>
                          <span className="text-white">(</span>
                          <span className="text-cyber-yellow">"💥 Урон: "</span>
                          <span className="text-white">, damage)</span>
                        </pre>
                        <div className="mt-3 border-t border-cyber-green/20 pt-3">
                          <div className="text-cyber-green font-mono text-xs">▶ 💥 Урон:  100</div>
                          <div className="text-cyber-yellow font-mono text-xs mt-1">✅ +200 XP получено!</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-cyber-cyan/10 py-8 px-6">
              <div className="container mx-auto text-center">
                <div className="font-orbitron text-cyber-cyan text-lg mb-2">
                  CODE<span className="text-cyber-magenta">RPG</span>
                </div>
                <p className="text-gray-600 font-mono text-xs">
                  © 2025 · PYTHON · CYBERPUNK · RPG · LEARN TO HACK THE MATRIX
                </p>
              </div>
            </footer>
          </>
        )}

        {activeSection === 'profile' && <CharacterProfile />}
        {activeSection === 'lessons' && <LessonsSection />}
        {activeSection === 'battle' && <BattleSystem />}
        {activeSection === 'leaderboard' && <Leaderboard />}
      </main>
    </div>
  );
}
