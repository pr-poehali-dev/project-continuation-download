import { useState, useRef, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import Icon from '@/components/ui/icon';
import { useGame } from '@/lib/GameContext';

// GDD Enemies
const ENEMIES = [
  {
    id: 1, name: 'NEXUS-Drone', level: 3, hp: 120, maxHp: 120,
    reward: '150 XP · 80 Creds', difficulty: 'Лёгкий', color: '#00ff41', emoji: '🤖',
    faction: 'NEXUS',
    task: {
      description: 'Создай переменную agent_id и присвой ей строку с любым именем',
      keywords: ['agent_id', '=', '"'],
      hint: 'agent_id = "Nova_7"',
      lore: 'Базовый дрон патрульного контура NEXUS-Alpha. Слабая защита.',
    },
  },
  {
    id: 2, name: 'CorpGuard_7', level: 7, hp: 280, maxHp: 280,
    reward: '400 XP · 200 Creds', difficulty: 'Средний', color: '#ffaa00', emoji: '👾',
    faction: 'NEXUS',
    task: {
      description: 'Напиши функцию add(a, b) которая возвращает сумму двух чисел',
      keywords: ['def', 'add', 'return', 'a', 'b'],
      hint: 'def add(a, b):\n    return a + b',
      lore: 'Усиленный охранник корпоративного периметра. Адаптивные алгоритмы защиты.',
    },
  },
  {
    id: 3, name: 'NEXUS-Sentinel', level: 15, hp: 650, maxHp: 650,
    reward: '1200 XP · 500 Creds', difficulty: 'Тяжёлый', color: '#ff00ff', emoji: '💀',
    faction: 'NEXUS',
    task: {
      description: 'Найди все чётные числа от 1 до 20 через list comprehension',
      keywords: ['for', 'in', 'range', 'if', '%', '2', '==', '0'],
      hint: 'evens = [x for x in range(1,21) if x%2==0]',
      lore: 'Элитный страж башни NEXUS-Prime. Нейронная защита 9-го уровня.',
    },
  },
  {
    id: 4, name: 'Archive_Rogue', level: 25, hp: 1200, maxHp: 1200,
    reward: '3000 XP · 1200 Creds', difficulty: 'Элита', color: '#aa00ff', emoji: '🕶️',
    faction: 'BLACK SYNTAX',
    task: {
      description: 'Создай класс Agent с __init__(self, name, clearance_level)',
      keywords: ['class', 'Agent', 'def', '__init__', 'self'],
      hint: 'class Agent:\n    def __init__(self, name, clearance_level):\n        self.name = name\n        self.clearance_level = clearance_level',
      lore: 'Перебежчик из The Archive. Знает все слабые места сопротивления.',
    },
  },
];

// GDD: способности по классам
const CLASS_ABILITIES: Record<string, { id: string; name: string; desc: string; icon: string; effect: string; cooldown: number; color: string }[]> = {
  hacker: [
    { id: 'lambda', name: 'Lambda Strike', desc: '+20% урон следующей атакой', icon: 'Zap', effect: 'damage_boost_20', cooldown: 2, color: '#00ff41' },
    { id: 'loop', name: 'Infinite Loop Trap', desc: 'Контратака: враг получает 40 урона', icon: 'RefreshCw', effect: 'counter', cooldown: 3, color: '#00ff41' },
    { id: 'breach', name: 'Data Breach', desc: 'Показывает одно ключевое слово', icon: 'Eye', effect: 'reveal', cooldown: 1, color: '#00ff41' },
  ],
  netrunner: [
    { id: 'forloop', name: 'For Loop Barrage', desc: '+15% урон следующей атакой', icon: 'Repeat', effect: 'damage_boost_15', cooldown: 2, color: '#ff00ff' },
    { id: 'ifelse', name: 'If-Else Defense', desc: '-35% входящего урона на 2 хода', icon: 'Shield', effect: 'defense', cooldown: 3, color: '#ff00ff' },
    { id: 'funcall', name: 'Function Call', desc: 'Показывает пример кода', icon: 'Code', effect: 'hint', cooldown: 1, color: '#ff00ff' },
  ],
  street_samurai: [
    { id: 'api', name: 'API Summon', desc: '+25% урон следующей атакой', icon: 'Globe', effect: 'damage_boost_25', cooldown: 2, color: '#6644ff' },
    { id: 'async', name: 'Async Overload', desc: 'AoE: +15% урон + дебафф врагу', icon: 'Cpu', effect: 'aoe', cooldown: 3, color: '#6644ff' },
    { id: 'db', name: 'Database Strike', desc: 'Критическая атака +60% урона', icon: 'Database', effect: 'crit', cooldown: 2, color: '#6644ff' },
  ],
};

const CLASS_THEME: Record<string, { primary: string; secondary: string; label: string }> = {
  hacker:         { primary: '#00ff41', secondary: '#003310', label: 'HACKER' },
  netrunner:      { primary: '#ff00ff', secondary: '#330033', label: 'PYTHON-JUNIOR' },
  street_samurai: { primary: '#6644ff', secondary: '#1a0044', label: 'PY-BACKEND' },
};

type BattleState = 'idle' | 'fighting' | 'win' | 'lose';
type LogEntry = { text: string; type: 'success' | 'error' | 'info' | 'win' | 'lose' | 'ability' | 'system' };

const LOG_COLORS: Record<string, string> = {
  success: '#00ff41', error: '#ff4060', info: '#666', win: '#ffff00', lose: '#ff2040', ability: '#aa00ff', system: '#00ffff',
};

const TIMER_MAX = 12;

export default function BattleSystem() {
  const { character } = useGame();
  const playerClass = character?.class || 'hacker';
  const theme = CLASS_THEME[playerClass] || CLASS_THEME.hacker;
  const abilities = CLASS_ABILITIES[playerClass] || CLASS_ABILITIES.hacker;

  const [selectedEnemy, setSelectedEnemy] = useState(ENEMIES[0]);
  const [code, setCode] = useState('');
  const [battleState, setBattleState] = useState<BattleState>('idle');
  const [playerHp, setPlayerHp] = useState(200);
  const [enemyHp, setEnemyHp] = useState(ENEMIES[0].maxHp);
  const [battleLog, setBattleLog] = useState<LogEntry[]>([]);
  const [shakeEnemy, setShakeEnemy] = useState(false);
  const [shakePlayer, setShakePlayer] = useState(false);
  const [flashEnemy, setFlashEnemy] = useState(false);
  const [pendingMultiplier, setPendingMultiplier] = useState(1);
  const [defenseActive, setDefenseActive] = useState(false);
  const [defenseHits, setDefenseHits] = useState(0);
  const [abilityCooldowns, setAbilityCooldowns] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(TIMER_MAX);
  const [revealedKeyword, setRevealedKeyword] = useState<string | null>(null);
  const [floatDamage, setFloatDamage] = useState<{ value: number; type: 'enemy' | 'player' } | null>(null);

  const logRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const battleStateRef = useRef(battleState);
  battleStateRef.current = battleState;

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [battleLog]);

  const addLog = (text: string, type: LogEntry['type'] = 'info') => {
    setBattleLog(prev => [...prev, { text, type }]);
  };

  const triggerShake = (target: 'enemy' | 'player') => {
    if (target === 'enemy') { setShakeEnemy(true); setFlashEnemy(true); setTimeout(() => setShakeEnemy(false), 500); setTimeout(() => setFlashEnemy(false), 300); }
    else { setShakePlayer(true); setTimeout(() => setShakePlayer(false), 500); }
  };

  const checkCode = (userCode: string): boolean => {
    const lower = userCode.toLowerCase().replace(/\s+/g, ' ');
    const matched = selectedEnemy.task.keywords.filter(kw => lower.includes(kw.toLowerCase()));
    return matched.length >= Math.ceil(selectedEnemy.task.keywords.length * 0.7);
  };

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    setTimeLeft(TIMER_MAX);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          stopTimer();
          if (battleStateRef.current === 'fighting') {
            // auto enemy attack on timeout
            setPlayerHp(hp => {
              const dmg = Math.floor(Math.random() * 20) + 25;
              const newHp = Math.max(0, hp - dmg);
              setBattleLog(prev => [...prev,
                { text: `⏱ ВРЕМЯ! Враг атакует: -${dmg} HP`, type: 'error' },
                { text: `💙 Ваш HP: ${newHp}/200`, type: 'info' },
              ]);
              setFloatDamage({ value: dmg, type: 'player' });
              setTimeout(() => setFloatDamage(null), 1200);
              triggerShake('player');
              if (newHp <= 0) setBattleState('lose');
              return newHp;
            });
          }
          return TIMER_MAX;
        }
        return t - 1;
      });
    }, 1000);
  }, [stopTimer]);

  useEffect(() => {
    if (battleState === 'fighting') startTimer();
    else stopTimer();
    return stopTimer;
  }, [battleState, startTimer, stopTimer]);

  const startBattle = () => {
    setBattleState('fighting');
    setPlayerHp(200);
    setEnemyHp(selectedEnemy.maxHp);
    setBattleLog([{ text: `⚡ БОЙ НАЧАТ // ${selectedEnemy.name} [${selectedEnemy.faction}] LVL ${selectedEnemy.level}`, type: 'system' }]);
    setCode('');
    setRevealedKeyword(null);
    setPendingMultiplier(1);
    setDefenseActive(false);
    setDefenseHits(0);
    setAbilityCooldowns({});
  };

  const submitCode = () => {
    if (!code.trim() || battleState !== 'fighting') return;
    const isCorrect = checkCode(code.trim());

    // Tick cooldowns
    setAbilityCooldowns(cd => {
      const next: Record<string, number> = {};
      Object.entries(cd).forEach(([k, v]) => { if (v > 1) next[k] = v - 1; });
      return next;
    });

    if (isCorrect) {
      const base = Math.floor(Math.random() * 35) + 55 + selectedEnemy.level * 3;
      const damage = Math.round(base * pendingMultiplier);
      const newEnemyHp = Math.max(0, enemyHp - damage);
      setEnemyHp(newEnemyHp);
      setPendingMultiplier(1);
      setFloatDamage({ value: damage, type: 'enemy' });
      setTimeout(() => setFloatDamage(null), 1200);
      triggerShake('enemy');
      addLog(`✅ КОД ПРИНЯТ → ${damage} урона ${pendingMultiplier > 1 ? `(×${pendingMultiplier.toFixed(1)})` : ''}`, 'success');
      addLog(`🔴 HP ${selectedEnemy.name}: ${newEnemyHp}/${selectedEnemy.maxHp}`, 'info');
      if (newEnemyHp <= 0) { setBattleState('win'); addLog(`🏆 ПОБЕДА // Получено: ${selectedEnemy.reward}`, 'win'); return; }
    } else {
      const dmgReduction = defenseActive && defenseHits > 0 ? 0.65 : 1;
      const base = Math.floor(Math.random() * 20) + 25;
      const damage = Math.round(base * dmgReduction);
      const newPlayerHp = Math.max(0, playerHp - damage);
      setPlayerHp(newPlayerHp);
      if (defenseActive && defenseHits > 0) { setDefenseHits(d => d - 1); if (defenseHits - 1 <= 0) setDefenseActive(false); }
      setFloatDamage({ value: damage, type: 'player' });
      setTimeout(() => setFloatDamage(null), 1200);
      triggerShake('player');
      addLog(`❌ ОШИБКА В КОДЕ → Враг атакует: -${damage} HP${dmgReduction < 1 ? ' [ЗАЩИТА]' : ''}`, 'error');
      addLog(`💙 Ваш HP: ${newPlayerHp}/200`, 'info');
      if (newPlayerHp <= 0) { setBattleState('lose'); addLog('💀 ПОРАЖЕНИЕ // GAME OVER', 'lose'); return; }
    }
    setCode('');
    startTimer();
  };

  const activateAbility = (ab: typeof abilities[0]) => {
    if (abilityCooldowns[ab.id] > 0 || battleState !== 'fighting') return;
    setAbilityCooldowns(cd => ({ ...cd, [ab.id]: ab.cooldown }));
    addLog(`💫 СПОСОБНОСТЬ: ${ab.name}`, 'ability');

    if (ab.effect.startsWith('damage_boost')) {
      const pct = parseInt(ab.effect.split('_')[2]);
      setPendingMultiplier(1 + pct / 100);
      addLog(`→ Следующая атака: +${pct}%`, 'ability');
    } else if (ab.effect === 'counter') {
      const dmg = 40;
      const newHp = Math.max(0, enemyHp - dmg);
      setEnemyHp(newHp);
      triggerShake('enemy');
      addLog(`→ Контратака: ${dmg} урона`, 'success');
      if (newHp <= 0) { setBattleState('win'); addLog(`🏆 ПОБЕДА // ${selectedEnemy.reward}`, 'win'); }
    } else if (ab.effect === 'reveal') {
      const missing = selectedEnemy.task.keywords.find(kw => !code.toLowerCase().includes(kw.toLowerCase()));
      if (missing) { setRevealedKeyword(missing); addLog(`→ Ключевое слово: "${missing}"`, 'ability'); }
      else addLog('→ Все ключевые слова уже использованы!', 'info');
    } else if (ab.effect === 'hint') {
      addLog(`→ Пример: ${selectedEnemy.task.hint.split('\n')[0]}`, 'ability');
    } else if (ab.effect === 'defense') {
      setDefenseActive(true);
      setDefenseHits(2);
      addLog('→ Защита активирована на 2 хода (-35% урона)', 'ability');
    } else if (ab.effect === 'aoe') {
      const dmg = Math.floor(Math.random() * 30) + 40;
      const newHp = Math.max(0, enemyHp - dmg);
      setEnemyHp(newHp);
      setPendingMultiplier(1.15);
      triggerShake('enemy');
      addLog(`→ AoE удар: ${dmg} урона + следующая атака +15%`, 'success');
      if (newHp <= 0) { setBattleState('win'); addLog(`🏆 ПОБЕДА // ${selectedEnemy.reward}`, 'win'); }
    } else if (ab.effect === 'crit') {
      setPendingMultiplier(1.6);
      addLog('→ КРИТ активирован: следующая атака +60%', 'ability');
    }
  };

  const timerPct = (timeLeft / TIMER_MAX) * 100;
  const timerColor = timeLeft > 7 ? '#00ff41' : timeLeft > 3 ? '#ffaa00' : '#ff4060';
  const playerHpPct = (playerHp / 200) * 100;
  const enemyHpPct = (enemyHp / selectedEnemy.maxHp) * 100;

  return (
    <section className="py-8 px-4 lg:px-6 min-h-screen relative">
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-6">
          <div className="font-mono text-xs tracking-widest mb-1" style={{ color: theme.primary + '99' }}>// КОД — ЭТО ОРУЖИЕ</div>
          <h2 className="font-orbitron text-2xl text-white">
            CODE <span style={{ color: theme.primary }}>COMBAT</span>
          </h2>
          <div className="font-mono text-[10px] text-gray-700 mt-0.5">CodeGrid-9 · 2087 · Python запрещён · Но не здесь</div>
        </div>

        {/* Enemy selection */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-5">
          {ENEMIES.map(enemy => (
            <button key={enemy.id} onClick={() => { setSelectedEnemy(enemy); setBattleState('idle'); setEnemyHp(enemy.maxHp); setBattleLog([]); setCode(''); }}
              className="p-3 border transition-all duration-200 text-left"
              style={{
                borderColor: selectedEnemy.id === enemy.id ? enemy.color : '#ffffff12',
                backgroundColor: selectedEnemy.id === enemy.id ? enemy.color + '10' : 'transparent',
                boxShadow: selectedEnemy.id === enemy.id ? `0 0 16px ${enemy.color}20` : 'none',
              }}>
              <div className="text-2xl mb-1">{enemy.emoji}</div>
              <div className="font-orbitron text-xs font-bold" style={{ color: enemy.color }}>{enemy.name}</div>
              <div className="text-gray-600 font-mono text-[10px]">LVL {enemy.level}</div>
              <div className="font-mono text-[10px] mt-1 px-1 py-0.5 inline-block"
                style={{ color: enemy.color, border: `1px solid ${enemy.color}40`, backgroundColor: enemy.color + '08' }}>
                {enemy.difficulty}
              </div>
            </button>
          ))}
        </div>

        {/* Main battle grid */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Left: Arena */}
          <div className="space-y-3">
            {/* Enemy card */}
            <div className="border p-4" style={{ borderColor: selectedEnemy.color + '30', backgroundColor: selectedEnemy.color + '04' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`text-5xl transition-all duration-300 ${shakeEnemy ? 'animate-shake' : ''}`}
                    style={{ filter: flashEnemy ? `drop-shadow(0 0 15px ${selectedEnemy.color})` : 'none' }}>
                    {selectedEnemy.emoji}
                  </div>
                  <div>
                    <div className="font-orbitron text-sm font-bold" style={{ color: selectedEnemy.color }}>{selectedEnemy.name}</div>
                    <div className="text-gray-600 font-mono text-xs">[{selectedEnemy.faction}] LVL {selectedEnemy.level}</div>
                    <div className="text-gray-700 font-mono text-[10px] mt-0.5 max-w-[200px] leading-tight">{selectedEnemy.task.lore}</div>
                  </div>
                </div>
                {floatDamage?.type === 'enemy' && (
                  <div className="font-orbitron text-xl font-black animate-bounce" style={{ color: theme.primary }}>
                    -{floatDamage.value}
                  </div>
                )}
              </div>
              {/* Enemy HP */}
              <div className="flex justify-between text-xs font-mono mb-1" style={{ color: selectedEnemy.color }}>
                <span>HP</span><span>{enemyHp}/{selectedEnemy.maxHp}</span>
              </div>
              <div className="h-2.5 bg-black/60 border border-white/5">
                <div className="h-full transition-all duration-500"
                  style={{ width: `${enemyHpPct}%`, backgroundColor: selectedEnemy.color, boxShadow: `0 0 8px ${selectedEnemy.color}60` }} />
              </div>
            </div>

            {/* Player HP */}
            <div className="border border-white/8 p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-orbitron text-xs" style={{ color: theme.primary }}>
                    {character?.name || 'AGENT'} [{theme.label}]
                  </span>
                  {defenseActive && <span className="font-mono text-[10px] text-blue-400">🛡 ЗАЩИТА ({defenseHits})</span>}
                </div>
                <div className={`font-mono text-xs ${shakePlayer ? 'text-red-400' : 'text-red-500'}`}>
                  {playerHp}/200 HP
                  {floatDamage?.type === 'player' && <span className="ml-2 text-red-400 animate-bounce">-{floatDamage.value}</span>}
                </div>
              </div>
              <div className="h-2 bg-black/60 border border-red-500/15">
                <div className="h-full transition-all duration-500"
                  style={{ width: `${playerHpPct}%`, backgroundColor: '#ff4060', boxShadow: '0 0 6px #ff406060' }} />
              </div>
            </div>

            {/* Mission briefing */}
            <div className="border border-white/8 p-4">
              <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-2">// ЗАДАНИЕ</div>
              <p className="text-white font-rajdhani text-sm leading-snug mb-3">{selectedEnemy.task.description}</p>
              {revealedKeyword && (
                <div className="font-mono text-xs text-cyber-cyan border border-cyber-cyan/30 bg-cyber-cyan/5 px-2 py-1 mb-2">
                  💡 Ключевое слово: <span className="font-bold">{revealedKeyword}</span>
                </div>
              )}
              <div className="flex flex-wrap gap-1">
                {selectedEnemy.task.keywords.map(kw => (
                  <span key={kw} className="font-mono text-[10px] px-1.5 py-0.5 border"
                    style={{
                      borderColor: code.toLowerCase().includes(kw.toLowerCase()) ? theme.primary + '60' : '#333',
                      color: code.toLowerCase().includes(kw.toLowerCase()) ? theme.primary : '#555',
                      backgroundColor: code.toLowerCase().includes(kw.toLowerCase()) ? theme.primary + '10' : 'transparent',
                    }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Abilities */}
            {battleState === 'fighting' && (
              <div>
                <div className="font-mono text-[10px] text-gray-600 mb-2 tracking-widest">// СПОСОБНОСТИ [{theme.label}]</div>
                <div className="grid grid-cols-3 gap-2">
                  {abilities.map(ab => {
                    const cd = abilityCooldowns[ab.id] || 0;
                    return (
                      <button key={ab.id} onClick={() => activateAbility(ab)} disabled={cd > 0}
                        className="border p-2 text-left transition-all relative disabled:opacity-50"
                        style={{ borderColor: cd > 0 ? '#333' : ab.color + '40', backgroundColor: cd > 0 ? 'transparent' : ab.color + '08' }}
                        title={ab.desc}>
                        {cd > 0 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 font-orbitron text-xl font-black"
                            style={{ color: ab.color }}>
                            {cd}
                          </div>
                        )}
                        <Icon name={ab.icon as 'Zap'} size={12} style={{ color: ab.color }} />
                        <div className="font-orbitron text-[9px] mt-0.5 leading-tight" style={{ color: ab.color }}>{ab.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: Monaco + controls */}
          <div className="space-y-3">
            {/* Timer */}
            {battleState === 'fighting' && (
              <div>
                <div className="flex justify-between font-mono text-xs mb-1" style={{ color: timerColor }}>
                  <span>ACTION PHASE</span><span>{timeLeft}с</span>
                </div>
                <div className="h-1.5 bg-black/60">
                  <div className="h-full transition-all duration-1000"
                    style={{ width: `${timerPct}%`, backgroundColor: timerColor, boxShadow: `0 0 6px ${timerColor}` }} />
                </div>
              </div>
            )}

            {/* Code editor */}
            <div className="border" style={{ borderColor: theme.primary + '30' }}>
              {/* Terminal header */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 bg-black/40">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                <span className="text-gray-600 font-mono text-[10px] ml-2">battle.py</span>
                <span className="ml-auto font-mono text-[10px]" style={{ color: theme.primary + '80' }}>Python 3.11</span>
              </div>
              <Editor
                height="180px"
                language="python"
                theme="vs-dark"
                value={code}
                onChange={v => setCode(v || '')}
                options={{
                  fontSize: 13,
                  minimap: { enabled: false },
                  lineNumbers: 'off',
                  scrollBeyondLastLine: false,
                  padding: { top: 10, bottom: 10 },
                  fontFamily: 'Share Tech Mono, Consolas, monospace',
                  suggest: { showKeywords: true },
                  renderLineHighlight: 'none',
                  overviewRulerLanes: 0,
                }}
              />
            </div>

            {/* Controls */}
            {battleState === 'idle' && (
              <button onClick={startBattle}
                className="w-full py-3.5 font-orbitron text-sm tracking-widest border transition-all flex items-center justify-center gap-2"
                style={{ borderColor: theme.primary, color: theme.primary, backgroundColor: theme.primary + '15', boxShadow: `0 0 20px ${theme.primary}20` }}>
                <Icon name="Zap" size={16} />
                НАЧАТЬ БОЙ
              </button>
            )}
            {battleState === 'fighting' && (
              <button onClick={submitCode}
                className="w-full py-3.5 font-orbitron text-sm tracking-widest border transition-all flex items-center justify-center gap-2 active:scale-95"
                style={{ borderColor: theme.primary, color: theme.primary, backgroundColor: theme.primary + '20' }}>
                <Icon name="Send" size={16} />
                АТАКОВАТЬ КОДОМ
              </button>
            )}
            {(battleState === 'win' || battleState === 'lose') && (
              <div className="text-center py-4">
                <div className="font-orbitron text-3xl font-black mb-2 glitch-text"
                  style={{ color: battleState === 'win' ? theme.primary : '#ff2040' }}>
                  {battleState === 'win' ? '// VICTORY' : '// DEFEATED'}
                </div>
                {battleState === 'win' && (
                  <div className="font-mono text-sm text-gray-400 mb-3">{selectedEnemy.reward}</div>
                )}
                <button onClick={startBattle}
                  className="font-orbitron text-xs px-6 py-2 border transition-all"
                  style={{ borderColor: theme.primary, color: theme.primary }}>
                  ПОПРОБОВАТЬ ЕЩЁ
                </button>
              </div>
            )}

            {/* Battle log */}
            <div className="border border-white/8 bg-black/60" ref={logRef}
              style={{ height: '160px', overflowY: 'auto' }}>
              <div className="px-3 py-2 border-b border-white/5 font-mono text-[10px] text-gray-600 sticky top-0 bg-black/80">
                battle_log.sh
              </div>
              <div className="p-3 space-y-0.5">
                {battleLog.length === 0 && (
                  <div className="font-mono text-[10px] text-gray-700">Выбери врага и начни бой...</div>
                )}
                {battleLog.map((entry, i) => (
                  <div key={i} className="font-mono text-[11px] leading-relaxed" style={{ color: LOG_COLORS[entry.type] }}>
                    {entry.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Lore footer */}
        <div className="mt-6 border-t border-white/5 pt-3 font-mono text-[10px] text-gray-800 flex items-center justify-between">
          <span>КОД — ЭТО ОРУЖИЕ // 2087</span>
          <span className="glitch-text" style={{ color: theme.primary + '40' }}>CODEGRID-9 // PYTHON IS FORBIDDEN</span>
        </div>
      </div>
    </section>
  );
}