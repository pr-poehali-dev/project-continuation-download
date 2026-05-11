import { useState, useRef, useEffect } from 'react';
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
    emoji: '🤖',
    task: {
      description: 'Создай переменную name и присвой ей строку с любым именем',
      keywords: ['name', '=', '"'],
      hint: 'name = "Nova"  ← просто скопируй это',
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
    emoji: '👾',
    task: {
      description: 'Напиши функцию add(a, b) которая возвращает сумму двух чисел',
      keywords: ['def', 'add', 'return', 'a', 'b'],
      hint: 'def add(a, b):\n    return a + b',
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
    emoji: '💀',
    task: {
      description: 'Найди все чётные числа от 1 до 20 через list comprehension',
      keywords: ['for', 'in', 'range', 'if', '%', '2', '==', '0'],
      hint: 'evens = [x for x in range(1,21) if x%2==0]',
    },
  },
];

type BattleState = 'idle' | 'fighting' | 'win' | 'lose';

export default function BattleSystem() {
  const [selectedEnemy, setSelectedEnemy] = useState(ENEMIES[0]);
  const [code, setCode] = useState('');
  const [battleState, setBattleState] = useState<BattleState>('idle');
  const [playerHp, setPlayerHp] = useState(180);
  const [enemyHp, setEnemyHp] = useState(ENEMIES[0].maxHp);
  const [showHint, setShowHint] = useState(false);
  const [battleLog, setBattleLog] = useState<{ text: string; type: 'success' | 'error' | 'info' | 'win' | 'lose' }[]>([]);
  const [shakeEnemy, setShakeEnemy] = useState(false);
  const [shakePlayer, setShakePlayer] = useState(false);
  const [flashEnemy, setFlashEnemy] = useState(false);
  const [flashPlayer, setFlashPlayer] = useState(false);
  const [lastDamage, setLastDamage] = useState<{ value: number; type: 'player' | 'enemy' } | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [battleLog]);

  const checkCode = (userCode: string): boolean => {
    const lower = userCode.toLowerCase().replace(/\s+/g, ' ');
    const matched = selectedEnemy.task.keywords.filter(kw => lower.includes(kw.toLowerCase()));
    return matched.length >= Math.ceil(selectedEnemy.task.keywords.length * 0.7);
  };

  const triggerShake = (target: 'player' | 'enemy') => {
    if (target === 'enemy') {
      setShakeEnemy(true);
      setFlashEnemy(true);
      setTimeout(() => setShakeEnemy(false), 500);
      setTimeout(() => setFlashEnemy(false), 300);
    } else {
      setShakePlayer(true);
      setFlashPlayer(true);
      setTimeout(() => setShakePlayer(false), 500);
      setTimeout(() => setFlashPlayer(false), 300);
    }
  };

  const startBattle = () => {
    setBattleState('fighting');
    setPlayerHp(180);
    setEnemyHp(selectedEnemy.maxHp);
    setBattleLog([{ text: `⚡ БОЙ НАЧАТ! Противник: ${selectedEnemy.name} LVL ${selectedEnemy.level}`, type: 'info' }]);
    setCode('');
    setShowHint(false);
    setLastDamage(null);
  };

  const submitCode = () => {
    const trimmed = code.trim();
    if (!trimmed) return;

    const isCorrect = checkCode(trimmed);

    if (isCorrect) {
      const damage = Math.floor(Math.random() * 30) + 50 + selectedEnemy.level * 3;
      const newEnemyHp = Math.max(0, enemyHp - damage);
      setEnemyHp(newEnemyHp);
      setLastDamage({ value: damage, type: 'enemy' });
      triggerShake('enemy');
      setBattleLog(prev => [
        ...prev,
        { text: `✅ Код верный! Атака: ${damage} урона`, type: 'success' },
        { text: `🔴 HP ${selectedEnemy.name}: ${newEnemyHp}/${selectedEnemy.maxHp}`, type: 'info' },
      ]);

      if (newEnemyHp <= 0) {
        setBattleState('win');
        setBattleLog(prev => [...prev, { text: `🏆 ПОБЕДА! Получено ${selectedEnemy.reward}`, type: 'win' }]);
      }
    } else {
      const damage = Math.floor(Math.random() * 15) + 20;
      const newPlayerHp = Math.max(0, playerHp - damage);
      setPlayerHp(newPlayerHp);
      setLastDamage({ value: damage, type: 'player' });
      triggerShake('player');
      setBattleLog(prev => [
        ...prev,
        { text: `❌ Ошибка в коде! Враг контратакует: -${damage} HP`, type: 'error' },
        { text: `💙 Ваш HP: ${newPlayerHp}/180`, type: 'info' },
      ]);

      if (newPlayerHp <= 0) {
        setBattleState('lose');
        setBattleLog(prev => [...prev, { text: '💀 ПОРАЖЕНИЕ! Попробуй ещё раз', type: 'lose' }]);
      }
    }
    setCode('');
    setTimeout(() => setLastDamage(null), 1200);
  };

  const logColors: Record<string, string> = {
    success: 'text-cyber-green',
    error: 'text-red-400',
    info: 'text-gray-400',
    win: 'text-cyber-yellow font-bold',
    lose: 'text-red-500 font-bold',
  };

  return (
    <section className="py-16 px-6 bg-cyber-dark/50">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="text-red-400 font-mono text-xs tracking-widest mb-2">// БОЕВОЙ МОДУЛЬ</div>
          <h2 className="font-orbitron text-3xl text-white">БОЕВАЯ СИСТЕМА</h2>
          <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto mt-3" />
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
                setBattleLog([]);
              }}
              className={`cyber-panel p-4 text-left transition-all duration-300 ${
                selectedEnemy.id === enemy.id ? '' : 'opacity-50 hover:opacity-80'
              }`}
              style={{
                borderColor: selectedEnemy.id === enemy.id ? enemy.color : '#ffffff15',
                boxShadow: selectedEnemy.id === enemy.id ? `0 0 20px ${enemy.color}30` : 'none',
              }}
            >
              <div className="text-2xl mb-1">{enemy.emoji}</div>
              <div className="font-orbitron text-sm mb-0.5" style={{ color: enemy.color }}>{enemy.name}</div>
              <div className="text-gray-400 text-xs font-mono">LVL {enemy.level}</div>
              <div className="text-xs font-mono mt-1 px-1.5 py-0.5 inline-block" style={{
                color: enemy.color,
                border: `1px solid ${enemy.color}40`,
                backgroundColor: `${enemy.color}10`,
              }}>
                {enemy.difficulty}
              </div>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Battle Arena */}
          <div className="cyber-panel p-6 animate-fade-in-up">
            <div className="font-orbitron text-xs text-gray-400 mb-6 tracking-widest">// АРЕНА</div>

            {/* Enemy HP */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-3xl transition-transform duration-200 ${shakeEnemy ? 'animate-bounce' : ''}`}
                    style={{ filter: flashEnemy ? `drop-shadow(0 0 10px ${selectedEnemy.color})` : 'none' }}
                  >
                    {selectedEnemy.emoji}
                  </span>
                  <div>
                    <div className="font-orbitron text-sm" style={{ color: selectedEnemy.color }}>{selectedEnemy.name}</div>
                    <div className="text-gray-500 text-xs font-mono">LVL {selectedEnemy.level}</div>
                  </div>
                </div>
                <div className="font-mono text-xs" style={{ color: selectedEnemy.color }}>
                  {enemyHp}/{selectedEnemy.maxHp}
                </div>
              </div>
              <div className="xp-bar">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${(enemyHp / selectedEnemy.maxHp) * 100}%`,
                    background: `linear-gradient(90deg, ${selectedEnemy.color}60, ${selectedEnemy.color})`,
                    boxShadow: `0 0 12px ${selectedEnemy.color}80`,
                  }}
                />
              </div>
            </div>

            {/* VS */}
            <div className="relative text-center my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-cyber-cyan/20 to-transparent" />
              </div>
              <span className="relative font-orbitron text-cyber-yellow text-xl px-4 bg-cyber-panel">⚔ VS ⚔</span>

              {/* Floating damage number */}
              {lastDamage && (
                <div
                  className="absolute font-orbitron text-2xl font-black pointer-events-none animate-fade-in-up"
                  style={{
                    color: lastDamage.type === 'enemy' ? '#00ff41' : '#ff4060',
                    left: lastDamage.type === 'enemy' ? '20%' : '60%',
                    top: '-30px',
                    textShadow: `0 0 20px ${lastDamage.type === 'enemy' ? '#00ff41' : '#ff4060'}`,
                  }}
                >
                  {lastDamage.type === 'enemy' ? `-${lastDamage.value}` : `-${lastDamage.value} HP`}
                </div>
              )}
            </div>

            {/* Player HP */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-3xl transition-transform ${shakePlayer ? 'animate-bounce' : ''}`}
                    style={{ filter: flashPlayer ? 'drop-shadow(0 0 10px #ff4060)' : 'none' }}
                  >
                    🧑‍💻
                  </span>
                  <div>
                    <div className="font-orbitron text-sm text-cyber-cyan">NOVA-7</div>
                    <div className="text-gray-500 text-xs font-mono">LVL 7</div>
                  </div>
                </div>
                <div className="font-mono text-xs text-red-400">{playerHp}/180</div>
              </div>
              <div className="xp-bar">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${(playerHp / 180) * 100}%`,
                    background: `linear-gradient(90deg, #ff002060, #ff4060)`,
                    boxShadow: flashPlayer ? '0 0 20px #ff0040' : '0 0 8px #ff004080',
                  }}
                />
              </div>
            </div>

            {/* Battle log */}
            <div
              ref={logRef}
              className="bg-black/60 border border-cyber-cyan/10 p-3 h-36 overflow-y-auto space-y-1 mt-2"
            >
              {battleLog.length === 0 ? (
                <div className="text-gray-600 text-xs font-mono italic">Нажми "Начать бой" чтобы начать...</div>
              ) : (
                battleLog.map((log, i) => (
                  <div key={i} className={`text-xs font-mono ${logColors[log.type]}`}>{log.text}</div>
                ))
              )}
            </div>

            {/* Battle control */}
            <div className="mt-4">
              {battleState === 'idle' && (
                <button onClick={startBattle} className="cyber-btn w-full">
                  ▶ НАЧАТЬ БОЙ
                </button>
              )}
              {battleState === 'win' && (
                <button onClick={startBattle} className="cyber-btn w-full" style={{ borderColor: '#00ff41', color: '#00ff41' }}>
                  ▶ СЛЕДУЮЩИЙ БОЙ
                </button>
              )}
              {battleState === 'lose' && (
                <button onClick={startBattle} className="cyber-btn cyber-btn-magenta w-full">
                  ↺ ПЕРЕЗАПУСТИТЬ
                </button>
              )}
            </div>
          </div>

          {/* Code Challenge */}
          <div className="cyber-panel p-6 animate-fade-in-up delay-200">
            <div className="font-orbitron text-xs text-cyber-green mb-4 tracking-widest">// КОД-АТАКА</div>

            {/* Task */}
            <div className="bg-black/40 border-l-2 border-cyber-cyan p-4 mb-4">
              <div className="text-cyber-cyan text-xs font-mono mb-1">📋 ЗАДАНИЕ:</div>
              <p className="text-white text-sm font-rajdhani leading-relaxed">{selectedEnemy.task.description}</p>
            </div>

            {/* Keyword hints — сколько ключевых слов уже есть в коде */}
            <div className="flex flex-wrap gap-1 mb-3">
              {selectedEnemy.task.keywords.map(kw => {
                const found = code.toLowerCase().includes(kw.toLowerCase());
                return (
                  <span
                    key={kw}
                    className="text-xs font-mono px-2 py-0.5 border transition-all duration-300"
                    style={{
                      borderColor: found ? '#00ff41' : '#ffffff15',
                      color: found ? '#00ff41' : '#444',
                      backgroundColor: found ? '#00ff4110' : 'transparent',
                      boxShadow: found ? '0 0 6px #00ff4140' : 'none',
                    }}
                  >
                    {kw}
                  </span>
                );
              })}
            </div>

            {/* Code editor */}
            <div className="mb-3">
              <div className="flex items-center gap-2 bg-black/70 px-3 py-2 border-b border-cyber-green/20">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-gray-500 text-xs font-mono ml-2">attack.py</span>
              </div>
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                disabled={battleState !== 'fighting'}
                className="code-editor w-full p-4 h-32 disabled:opacity-40 disabled:cursor-not-allowed"
                placeholder={battleState === 'fighting' ? '# Введи свой код-атаку здесь...' : '# Сначала начни бой...'}
                onKeyDown={e => {
                  if (e.key === 'Tab') {
                    e.preventDefault();
                    const start = e.currentTarget.selectionStart;
                    const end = e.currentTarget.selectionEnd;
                    setCode(c => c.substring(0, start) + '    ' + c.substring(end));
                  }
                }}
              />
            </div>

            {/* Hint */}
            {showHint && (
              <div className="bg-cyber-yellow/5 border border-cyber-yellow/30 p-3 mb-3 animate-fade-in-up">
                <div className="text-cyber-yellow text-xs font-mono mb-1">💡 ПОДСКАЗКА:</div>
                <pre className="text-cyber-green text-xs font-mono">{selectedEnemy.task.hint}</pre>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={submitCode}
                disabled={battleState !== 'fighting' || !code.trim()}
                className="cyber-btn flex-1 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <Icon name="Zap" size={14} className="inline mr-1" />
                АТАКОВАТЬ
              </button>
              <button
                onClick={() => setShowHint(!showHint)}
                className={`cyber-btn px-4 transition-all ${showHint ? 'bg-cyber-yellow text-cyber-dark' : 'cyber-btn-yellow'}`}
                title="Подсказка (-50 XP)"
              >
                <Icon name="Lightbulb" size={14} />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs font-mono text-gray-600">
              <span>TAB = 4 пробела</span>
              <span className="text-cyber-yellow">🏆 {selectedEnemy.reward}</span>
            </div>
          </div>
        </div>

        {/* Battle scene image */}
        <div className="mt-8 relative overflow-hidden h-40 animate-fade-in-up delay-300">
          <img
            src="https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/b7deadd6-d6c6-4184-8376-6bdd3089e4fc.jpg"
            alt="Battle Scene"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cyber-dark via-cyber-dark/20 to-cyber-dark" />
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-orbitron text-2xl text-cyber-cyan glitch-text">КОД — ЭТО ОРУЖИЕ</p>
          </div>
        </div>
      </div>
    </section>
  );
}
