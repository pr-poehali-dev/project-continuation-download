import { useState } from 'react';
import Icon from '@/components/ui/icon';

const ENEMIES = [
  {
    id: 1,
    name: 'Корп-Дрон',
    level: 3,
    hp: 100,
    maxHp: 100,
    reward: '150 XP',
    difficulty: 'Лёгкий',
    color: '#00ff41',
    task: {
      description: 'Создай переменную "name" и присвой ей своё имя',
      example: 'name = "Nova"',
      hint: 'Используй = для присвоения значения',
    },
  },
  {
    id: 2,
    name: 'Нейро-Страж',
    level: 7,
    hp: 250,
    maxHp: 250,
    reward: '400 XP',
    difficulty: 'Средний',
    color: '#ffaa00',
    task: {
      description: 'Напиши функцию, которая возвращает сумму двух чисел',
      example: 'def add(a, b):\n    return a + b',
      hint: 'Используй ключевое слово def',
    },
  },
  {
    id: 3,
    name: 'ИИ-Корпорант',
    level: 15,
    hp: 600,
    maxHp: 600,
    reward: '1200 XP',
    difficulty: 'Тяжёлый',
    color: '#ff00ff',
    task: {
      description: 'Найди все чётные числа от 1 до 20 через list comprehension',
      example: 'evens = [x for x in range(1,21) if x%2==0]',
      hint: 'List comprehension: [выражение for элемент in список if условие]',
    },
  },
];

export default function BattleSystem() {
  const [selectedEnemy, setSelectedEnemy] = useState(ENEMIES[0]);
  const [code, setCode] = useState('');
  const [battleState, setBattleState] = useState<'idle' | 'fighting' | 'win' | 'lose'>('idle');
  const [playerHp, setPlayerHp] = useState(180);
  const [enemyHp, setEnemyHp] = useState(ENEMIES[0].maxHp);
  const [showHint, setShowHint] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);

  const startBattle = () => {
    setBattleState('fighting');
    setPlayerHp(180);
    setEnemyHp(selectedEnemy.maxHp);
    setBattleLog([`⚡ БОЙ НАЧАТ! Противник: ${selectedEnemy.name}`]);
    setCode('');
    setShowHint(false);
  };

  const submitCode = () => {
    const trimmed = code.trim();
    if (!trimmed) return;

    const isCorrect = trimmed.includes(selectedEnemy.task.example.split('\n')[0].trim().slice(0, 10));

    if (isCorrect) {
      const damage = Math.floor(Math.random() * 40) + 60;
      const newEnemyHp = Math.max(0, enemyHp - damage);
      setEnemyHp(newEnemyHp);
      setBattleLog(prev => [...prev, `✅ Код верный! Урон: ${damage} 🔥`, `❤️ HP врага: ${newEnemyHp}/${selectedEnemy.maxHp}`]);

      if (newEnemyHp <= 0) {
        setBattleState('win');
        setBattleLog(prev => [...prev, `🏆 ПОБЕДА! Получено ${selectedEnemy.reward}`]);
      }
    } else {
      const damage = Math.floor(Math.random() * 20) + 15;
      const newPlayerHp = Math.max(0, playerHp - damage);
      setPlayerHp(newPlayerHp);
      setBattleLog(prev => [...prev, `❌ Ошибка в коде! Враг атакует: -${damage} HP`, `💙 Ваш HP: ${newPlayerHp}/180`]);

      if (newPlayerHp <= 0) {
        setBattleState('lose');
        setBattleLog(prev => [...prev, '💀 ПОРАЖЕНИЕ! Перезапусти бой']);
      }
    }
    setCode('');
  };

  return (
    <section className="py-16 px-6 bg-cyber-dark/50">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="text-cyber-red font-mono text-xs tracking-widest mb-2">// БОЕВОЙ МОДУЛЬ</div>
          <h2 className="font-orbitron text-3xl text-white">БОЕВАЯ СИСТЕМА</h2>
          <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-cyber-red to-transparent mx-auto mt-3" />
        </div>

        {/* Enemy Selection */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {ENEMIES.map(enemy => (
            <button
              key={enemy.id}
              onClick={() => {
                setSelectedEnemy(enemy);
                setBattleState('idle');
                setEnemyHp(enemy.maxHp);
              }}
              className={`cyber-panel p-4 text-left transition-all ${
                selectedEnemy.id === enemy.id ? 'border-opacity-100' : 'opacity-60 hover:opacity-80'
              }`}
              style={{
                borderColor: selectedEnemy.id === enemy.id ? enemy.color : '#ffffff20',
                boxShadow: selectedEnemy.id === enemy.id ? `0 0 15px ${enemy.color}40` : 'none',
              }}
            >
              <div className="font-orbitron text-sm mb-1" style={{ color: enemy.color }}>
                {enemy.name}
              </div>
              <div className="text-gray-400 text-xs font-mono">LVL {enemy.level}</div>
              <div className="text-xs font-mono mt-1" style={{ color: enemy.color }}>
                {enemy.difficulty}
              </div>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Battle Arena */}
          <div className="cyber-panel p-6 animate-fade-in-up">
            <div className="font-orbitron text-xs text-gray-400 mb-4">// АРЕНА</div>

            {/* Enemy */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-orbitron text-sm" style={{ color: selectedEnemy.color }}>
                  {selectedEnemy.name}
                </span>
                <span className="font-mono text-xs text-gray-400">LVL {selectedEnemy.level}</span>
              </div>
              <div className="xp-bar mb-1">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${(enemyHp / selectedEnemy.maxHp) * 100}%`,
                    background: `linear-gradient(90deg, ${selectedEnemy.color}88, ${selectedEnemy.color})`,
                    boxShadow: `0 0 10px ${selectedEnemy.color}`,
                  }}
                />
              </div>
              <div className="text-xs font-mono" style={{ color: selectedEnemy.color }}>
                {enemyHp} / {selectedEnemy.maxHp} HP
              </div>
            </div>

            {/* VS divider */}
            <div className="text-center my-4">
              <span className="font-orbitron text-cyber-yellow text-2xl">⚔ VS ⚔</span>
            </div>

            {/* Player */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-orbitron text-sm text-cyber-cyan">NOVA-7</span>
                <span className="font-mono text-xs text-gray-400">LVL 7</span>
              </div>
              <div className="xp-bar mb-1">
                <div
                  className="hp-bar-fill h-full transition-all duration-500"
                  style={{ width: `${(playerHp / 180) * 100}%` }}
                />
              </div>
              <div className="text-xs font-mono text-red-400">{playerHp} / 180 HP</div>
            </div>

            {/* Battle log */}
            <div className="bg-black/50 border border-cyber-cyan/10 p-3 h-28 overflow-y-auto">
              {battleLog.length === 0 ? (
                <div className="text-gray-600 text-xs font-mono">Лог боя пуст...</div>
              ) : (
                battleLog.map((log, i) => (
                  <div key={i} className="text-xs font-mono text-gray-300 mb-1">{log}</div>
                ))
              )}
            </div>

            {/* Battle control */}
            <div className="mt-4">
              {battleState === 'idle' && (
                <button onClick={startBattle} className="cyber-btn w-full text-center">
                  НАЧАТЬ БОЙ
                </button>
              )}
              {(battleState === 'win' || battleState === 'lose') && (
                <button onClick={startBattle} className="cyber-btn cyber-btn-magenta w-full text-center">
                  {battleState === 'win' ? '▶ СЛЕДУЮЩИЙ БОЙ' : '↺ ПЕРЕЗАПУСК'}
                </button>
              )}
            </div>
          </div>

          {/* Code Challenge */}
          <div className="cyber-panel p-6 animate-fade-in-up delay-200">
            <div className="font-orbitron text-xs text-cyber-green mb-4">// КОД-АТАКА</div>

            {/* Task */}
            <div className="bg-black/30 border border-cyber-cyan/20 p-4 mb-4">
              <div className="text-cyber-cyan text-xs font-mono mb-2">ЗАДАНИЕ:</div>
              <p className="text-white text-sm font-rajdhani">{selectedEnemy.task.description}</p>
            </div>

            {/* Code editor */}
            <div className="relative mb-3">
              <div className="flex items-center gap-2 bg-black/50 px-3 py-2 border-b border-cyber-cyan/20">
                <div className="w-2 h-2 rounded-full bg-cyber-red" />
                <div className="w-2 h-2 rounded-full bg-cyber-yellow" />
                <div className="w-2 h-2 rounded-full bg-cyber-green" />
                <span className="text-gray-500 text-xs font-mono ml-2">attack.py</span>
              </div>
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                disabled={battleState !== 'fighting'}
                className="code-editor w-full p-4 min-h-32"
                placeholder={battleState === 'fighting' ? '# Введи свой код-атаку здесь...' : '# Сначала начни бой...'}
                onKeyDown={e => {
                  if (e.key === 'Tab') {
                    e.preventDefault();
                    setCode(c => c + '    ');
                  }
                }}
              />
            </div>

            {/* Hint */}
            {showHint && (
              <div className="bg-cyber-yellow/10 border border-cyber-yellow/30 p-3 mb-3">
                <div className="text-cyber-yellow text-xs font-mono">💡 {selectedEnemy.task.hint}</div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={submitCode}
                disabled={battleState !== 'fighting'}
                className="cyber-btn flex-1 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Icon name="Zap" size={14} className="inline mr-1" />
                АТАКОВАТЬ
              </button>
              <button
                onClick={() => setShowHint(!showHint)}
                className="cyber-btn cyber-btn-yellow px-3"
                title="Подсказка"
              >
                <Icon name="Lightbulb" size={14} />
              </button>
            </div>

            {/* Reward info */}
            <div className="mt-4 flex items-center gap-2 text-xs font-mono text-gray-500">
              <Icon name="Trophy" size={12} className="text-cyber-yellow" />
              <span>Награда за победу: <span className="text-cyber-yellow">{selectedEnemy.reward}</span></span>
            </div>
          </div>
        </div>

        {/* Battle scene image */}
        <div className="mt-8 relative overflow-hidden rounded-sm h-48 animate-fade-in-up delay-300">
          <img
            src="https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/b7deadd6-d6c6-4184-8376-6bdd3089e4fc.jpg"
            alt="Battle Scene"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cyber-dark via-transparent to-cyber-dark" />
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-orbitron text-cyber-cyan text-xl glitch-text">КОД — ЭТО ОРУЖИЕ</p>
          </div>
        </div>
      </div>
    </section>
  );
}
