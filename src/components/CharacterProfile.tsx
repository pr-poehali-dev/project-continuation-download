import { useState } from 'react';
import Icon from '@/components/ui/icon';

const EQUIPMENT_SLOTS = [
  { id: 'head', label: 'Шлем', icon: 'Crown', item: 'Нейро-обруч Mk.I', rarity: 'common' },
  { id: 'body', label: 'Броня', icon: 'Shield', item: 'Тактический жакет', rarity: 'uncommon' },
  { id: 'weapon', label: 'Оружие', icon: 'Zap', item: 'Код-клинок v2.0', rarity: 'rare' },
  { id: 'gloves', label: 'Перчатки', icon: 'Hand', item: 'Кибер-перчатки', rarity: 'common' },
  { id: 'boots', label: 'Обувь', icon: 'Footprints', item: 'Магнит-сапоги', rarity: 'uncommon' },
  { id: 'implant', label: 'Имплант', icon: 'Cpu', item: 'Нейро-чип Python', rarity: 'epic' },
];

const RARITY_COLORS: Record<string, string> = {
  common: '#aaaaaa',
  uncommon: '#00ff41',
  rare: '#00aaff',
  epic: '#aa00ff',
  legendary: '#ffaa00',
};

const SKILLS = [
  { name: 'Переменные', level: 5, max: 5, color: '#00ffff' },
  { name: 'Функции', level: 3, max: 5, color: '#ff00ff' },
  { name: 'Классы', level: 2, max: 5, color: '#ffff00' },
  { name: 'Алгоритмы', level: 1, max: 5, color: '#00ff41' },
];

export default function CharacterProfile() {
  const [activeTab, setActiveTab] = useState<'stats' | 'equipment' | 'skills'>('stats');

  const xpCurrent = 2450;
  const xpMax = 5000;
  const hpCurrent = 180;
  const hpMax = 200;
  const level = 7;

  return (
    <section className="py-16 px-6">
      <div className="container mx-auto max-w-5xl">
        {/* Section header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="text-cyber-magenta font-mono text-xs tracking-widest mb-2">// МОДУЛЬ</div>
          <h2 className="font-orbitron text-3xl text-white">ПРОФИЛЬ ПЕРСОНАЖА</h2>
          <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent mx-auto mt-3" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Character display */}
          <div className="cyber-panel p-6 flex flex-col items-center gap-4 animate-fade-in-up">
            <div className="relative">
              <img
                src="https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/f55d91c1-7259-4e87-a724-646937adde3d.jpg"
                alt="Character"
                className="w-40 h-48 object-cover object-top rounded-sm neon-border-magenta"
                style={{ clipPath: 'polygon(0 0, 90% 0, 100% 10%, 100% 100%, 10% 100%, 0 90%)' }}
              />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-cyber-dark border border-cyber-cyan px-4 py-1 font-orbitron text-cyber-cyan text-sm whitespace-nowrap">
                LVL {level}
              </div>
            </div>

            <div className="mt-4 text-center w-full">
              <div className="font-orbitron text-white text-lg">NOVA-7</div>
              <div className="text-cyber-cyan text-xs font-mono">Хакер · Кодер</div>
            </div>

            {/* HP Bar */}
            <div className="w-full">
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-red-400">HP</span>
                <span className="text-red-400">{hpCurrent}/{hpMax}</span>
              </div>
              <div className="xp-bar">
                <div
                  className="hp-bar-fill h-full transition-all duration-500"
                  style={{ width: `${(hpCurrent / hpMax) * 100}%` }}
                />
              </div>
            </div>

            {/* XP Bar */}
            <div className="w-full">
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-cyber-cyan">XP</span>
                <span className="text-cyber-cyan">{xpCurrent}/{xpMax}</span>
              </div>
              <div className="xp-bar">
                <div
                  className="xp-bar-fill"
                  style={{ width: `${(xpCurrent / xpMax) * 100}%` }}
                />
              </div>
            </div>

            {/* Badges */}
            <div className="flex gap-2 flex-wrap justify-center">
              {['🐍 Питон-мастер', '⚡ Кодер', '🔥 Огонь'].map(badge => (
                <span key={badge} className="text-xs px-2 py-1 border border-cyber-cyan/30 text-cyber-cyan/70 font-mono">
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Tabs + Content */}
          <div className="lg:col-span-2 animate-fade-in-up delay-200">
            {/* Tabs */}
            <div className="flex border-b border-cyber-cyan/20 mb-4">
              {[
                { id: 'stats', label: 'СТАТЫ' },
                { id: 'equipment', label: 'ЭКИПИРОВКА' },
                { id: 'skills', label: 'НАВЫКИ' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-4 py-2 font-orbitron text-xs tracking-wider transition-all ${
                    activeTab === tab.id
                      ? 'text-cyber-cyan border-b-2 border-cyber-cyan'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Интеллект', value: 87, icon: 'Brain', color: '#00ffff' },
                  { label: 'Сила кода', value: 72, icon: 'Zap', color: '#ff00ff' },
                  { label: 'Ловкость', value: 65, icon: 'Wind', color: '#ffff00' },
                  { label: 'Защита', value: 58, icon: 'Shield', color: '#00ff41' },
                  { label: 'Мана данных', value: 90, icon: 'Cpu', color: '#ff8800' },
                  { label: 'Удача', value: 45, icon: 'Star', color: '#aa00ff' },
                ].map(stat => (
                  <div key={stat.label} className="cyber-panel p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name={stat.icon as any} size={14} style={{ color: stat.color }} />
                      <span className="text-gray-400 text-xs font-mono">{stat.label}</span>
                      <span className="ml-auto font-orbitron text-sm" style={{ color: stat.color }}>{stat.value}</span>
                    </div>
                    <div className="xp-bar">
                      <div
                        className="h-full transition-all duration-700"
                        style={{
                          width: `${stat.value}%`,
                          background: `linear-gradient(90deg, ${stat.color}88, ${stat.color})`,
                          boxShadow: `0 0 8px ${stat.color}`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Equipment Tab */}
            {activeTab === 'equipment' && (
              <div className="grid grid-cols-2 gap-3">
                {EQUIPMENT_SLOTS.map(slot => (
                  <div key={slot.id} className="cyber-panel p-3 flex items-center gap-3 cursor-pointer hover:border-cyber-cyan/50 transition-all group">
                    <div
                      className="w-10 h-10 flex items-center justify-center border"
                      style={{ borderColor: RARITY_COLORS[slot.rarity] + '60', backgroundColor: RARITY_COLORS[slot.rarity] + '10' }}
                    >
                      <Icon name={slot.icon as any} size={18} style={{ color: RARITY_COLORS[slot.rarity] }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-400 text-xs font-mono">{slot.label}</div>
                      <div className="text-white text-sm truncate font-rajdhani" style={{ color: RARITY_COLORS[slot.rarity] }}>
                        {slot.item}
                      </div>
                    </div>
                    <Icon name="ChevronRight" size={14} className="text-gray-600 group-hover:text-cyber-cyan transition-colors" />
                  </div>
                ))}
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === 'skills' && (
              <div className="space-y-4">
                {SKILLS.map(skill => (
                  <div key={skill.name} className="cyber-panel p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-rajdhani text-base">{skill.name}</span>
                      <div className="flex gap-1">
                        {[...Array(skill.max)].map((_, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 border"
                            style={{
                              borderColor: skill.color,
                              backgroundColor: i < skill.level ? skill.color : 'transparent',
                              boxShadow: i < skill.level ? `0 0 6px ${skill.color}` : 'none',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-xs font-mono" style={{ color: skill.color }}>
                      Уровень {skill.level} / {skill.max}
                    </div>
                  </div>
                ))}
                <div className="cyber-panel p-4 border-dashed border-cyber-cyan/20 text-center">
                  <Icon name="Plus" size={20} className="text-cyber-cyan/40 mx-auto mb-1" />
                  <div className="text-gray-500 text-xs font-mono">Открой новые навыки в уроках</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
