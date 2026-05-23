import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import Icon from '@/components/ui/icon';
import { useGame, XpResult } from '@/lib/GameContext';
import { api } from '@/lib/api';
import { pushNotif } from '@/components/Notifications';
import { progress } from '@/lib/progressStore';
import { applyXpBonus } from '@/lib/implants';
import { ENEMIES, getAvailableEnemies, type CombatEnemy } from '@/lib/combatEnemies';
import {
  pickTasksForEnemy,
  calculateDamage,
  type CombatTask,
  type TaskType,
} from '@/lib/combatTasks';
import {
  loadPyodideRuntime,
  runTests,
  computeExpectedOutput,
  comparePredict,
  getLoadingState,
} from '@/lib/pyodideRunner';
import { useOnboarding } from '@/lib/useOnboarding';
import CombatTutorial from '@/components/combat/CombatTutorial';
import TaskTypeIntro from '@/components/combat/TaskTypeIntro';

// ─── Тема по классу ──────────────────────────────────────────────────────────
const CLASS_THEME: Record<string, { primary: string; secondary: string; label: string }> = {
  cipher:           { primary: '#00ff41', secondary: '#003310', label: 'CIPHER' },
  data_ghost:       { primary: '#00aaff', secondary: '#001a33', label: 'DATA GHOST' },
  neural_architect: { primary: '#aa00ff', secondary: '#1a0044', label: 'NEURAL ARCHITECT' },
  hacker:           { primary: '#00ff41', secondary: '#003310', label: 'CIPHER' },
  netrunner:        { primary: '#00aaff', secondary: '#001a33', label: 'DATA GHOST' },
  street_samurai:   { primary: '#aa00ff', secondary: '#1a0044', label: 'NEURAL ARCHITECT' },
};

type BattleState = 'idle' | 'loading' | 'fighting' | 'enemy_turn' | 'win' | 'lose';
type LogEntry = { text: string; type: 'success' | 'error' | 'info' | 'win' | 'lose' | 'ability' | 'system' | 'enemy' };

const LOG_COLORS: Record<string, string> = {
  success: '#00ff41', error: '#ff4060', info: '#888', win: '#ffff00',
  lose: '#ff2040', ability: '#aa00ff', system: '#00ffff', enemy: '#ff8800',
};

const TIMER_MAX = 60;
const PLAYER_MAX_HP = 200;

export default function BattleSystem() {
  const { character, applyXpResult } = useGame();
  const playerClass = character?.class || 'cipher';
  const theme = CLASS_THEME[playerClass] || CLASS_THEME.cipher;
  const intelligence = character?.effective_stats?.intelligence ?? 10;
  const defense = character?.effective_stats?.defense ?? 10;
  const agility = character?.effective_stats?.agility ?? 10;

  // Доступные враги по главе игрока
  const availableEnemies = useMemo(() => {
    const ch = character?.current_chapter ?? 1;
    const list = getAvailableEnemies(Math.max(1, ch));
    return list.length ? list : ENEMIES.slice(0, 4);
  }, [character?.current_chapter]);

  const [selectedEnemy, setSelectedEnemy] = useState<CombatEnemy>(availableEnemies[0]);
  const [battleState, setBattleState] = useState<BattleState>('idle');
  const [playerHp, setPlayerHp] = useState(PLAYER_MAX_HP);
  const [enemyHp, setEnemyHp] = useState(selectedEnemy.hp);
  const [battleLog, setBattleLog] = useState<LogEntry[]>([]);
  const [shakeEnemy, setShakeEnemy] = useState(false);
  const [shakePlayer, setShakePlayer] = useState(false);
  const [flashEnemy, setFlashEnemy] = useState(false);
  const [floatDamage, setFloatDamage] = useState<{ value: number; type: 'enemy' | 'player'; crit?: boolean } | null>(null);
  const [winReward, setWinReward] = useState<XpResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_MAX);

  // Combat Code 2.0
  const [taskChain, setTaskChain] = useState<CombatTask[]>([]);
  const [taskIdx, setTaskIdx] = useState(0);
  const [code, setCode] = useState('');
  const [predictAnswer, setPredictAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [testResults, setTestResults] = useState<{ passed: number; total: number; details: { label: string; pass: boolean; got: string; expect: string }[]; error?: string } | null>(null);
  const [combo, setCombo] = useState(0);
  const [comboBest, setComboBest] = useState(0);
  const [pyodideLoading, setPyodideLoading] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(getLoadingState() === 'ready');

  // Онбординг + тренировка
  const [trainingMode, setTrainingMode] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const tutorialOnb = useOnboarding('boot:battle');
  const [showTutorial, setShowTutorial] = useState(false);
  const [typeIntroFor, setTypeIntroFor] = useState<TaskType | null>(null);
  const typeOnbWrite = useOnboarding('type:write');
  const typeOnbDebug = useOnboarding('type:debug');
  const typeOnbRefactor = useOnboarding('type:refactor');
  const typeOnbPredict = useOnboarding('type:predict');
  const typeOnbComplete = useOnboarding('type:complete');

  const typeSeenMap = useMemo(() => ({
    write: typeOnbWrite,
    debug: typeOnbDebug,
    refactor: typeOnbRefactor,
    predict: typeOnbPredict,
    complete: typeOnbComplete,
  } as const), [typeOnbWrite, typeOnbDebug, typeOnbRefactor, typeOnbPredict, typeOnbComplete]);

  // Открываем туториал при первом заходе (один раз)
  useEffect(() => {
    if (!tutorialOnb.seen) setShowTutorial(true);
  }, [tutorialOnb.seen]);

  const currentTask = taskChain[taskIdx];
  const totalTasks = taskChain.length || selectedEnemy.taskCount;
  const taskStartedAt = useRef<number>(Date.now());

  const logRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const battleStateRef = useRef(battleState);
  battleStateRef.current = battleState;

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [battleLog]);

  // Ленивая загрузка Pyodide при заходе в раздел
  useEffect(() => {
    if (!pyodideReady && !pyodideLoading) {
      setPyodideLoading(true);
      loadPyodideRuntime()
        .then(() => { setPyodideReady(true); setPyodideLoading(false); })
        .catch(() => { setPyodideLoading(false); });
    }
  }, [pyodideReady, pyodideLoading]);

  const addLog = (text: string, type: LogEntry['type'] = 'info') => {
    setBattleLog(prev => [...prev, { text, type }]);
  };

  const triggerShake = (target: 'enemy' | 'player') => {
    if (target === 'enemy') {
      setShakeEnemy(true); setFlashEnemy(true);
      setTimeout(() => setShakeEnemy(false), 500);
      setTimeout(() => setFlashEnemy(false), 300);
    } else {
      setShakePlayer(true);
      setTimeout(() => setShakePlayer(false), 500);
    }
  };

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const enemyAttack = useCallback(() => {
    // В тренировке враг не бьёт
    if (trainingMode) {
      addLog('🎓 Тренировка: попробуй ещё раз, штрафа нет.', 'info');
      return;
    }
    // Если у врага нет PREDICT-кода — обычная атака
    const attacks = selectedEnemy.enemyAttacks || [];
    const pick = attacks.length ? attacks[Math.floor(Math.random() * attacks.length)] : null;

    if (!pick) {
      const baseDmg = 15 + selectedEnemy.level * 2 + Math.floor(Math.random() * 10);
      const reduction = Math.min(0.5, defense * 0.015);
      const dmg = Math.max(1, Math.round(baseDmg * (1 - reduction)));
      setPlayerHp(hp => {
        const next = Math.max(0, hp - dmg);
        if (next <= 0) setBattleState('lose');
        return next;
      });
      setFloatDamage({ value: dmg, type: 'player' });
      setTimeout(() => setFloatDamage(null), 1200);
      triggerShake('player');
      addLog(`⚠ ${selectedEnemy.name} атакует: -${dmg} HP`, 'enemy');
      return;
    }

    addLog(`⚠ ${selectedEnemy.name} бросает код. Найди вывод ниже!`, 'enemy');
  }, [selectedEnemy, defense, trainingMode]);

  const startTimer = useCallback(() => {
    stopTimer();
    const bonus = Math.min(20, Math.floor(agility * 0.5));
    setTimeLeft(TIMER_MAX + bonus);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          stopTimer();
          if (battleStateRef.current === 'fighting') {
            addLog('⏱ ВРЕМЯ ВЫШЛО!', 'error');
            enemyAttack();
          }
          return TIMER_MAX;
        }
        return t - 1;
      });
    }, 1000);
  }, [stopTimer, enemyAttack, agility]);

  useEffect(() => {
    if (battleState === 'fighting' && !trainingMode) startTimer();
    else stopTimer();
    return stopTimer;
  }, [battleState, taskIdx, startTimer, stopTimer, trainingMode]);

  const startBattle = async (training = trainingMode) => {
    setTrainingMode(training);
    setBattleState('loading');
    setBattleLog([
      { text: training
          ? `🎓 ТРЕНИРОВКА // ${selectedEnemy.name} (без HP, без таймера)`
          : `⚡ БОЙ НАЧАТ // ${selectedEnemy.name} [${selectedEnemy.faction}] LVL ${selectedEnemy.level}`,
        type: 'system' },
    ]);
    if (selectedEnemy.taunt && !training) addLog(`💬 "${selectedEnemy.taunt}"`, 'enemy');

    // Подгружаем задачи — фильтруем по allowedTypes врага
    const chain = pickTasksForEnemy(
      selectedEnemy.topics,
      selectedEnemy.difficulty,
      selectedEnemy.taskCount,
      selectedEnemy.allowedTypes,
    );
    setTaskChain(chain);
    setTaskIdx(0);
    setCode(chain[0]?.type === 'write' ? chain[0].starter
            : chain[0]?.type === 'debug' ? chain[0].brokenCode
            : chain[0]?.type === 'refactor' ? chain[0].originalCode
            : chain[0]?.type === 'complete' ? chain[0].template
            : '');
    setPredictAnswer('');
    setShowHint(false);
    setTestResults(null);
    setCombo(0);
    setComboBest(0);
    setPlayerHp(character?.hp ?? PLAYER_MAX_HP);
    setEnemyHp(selectedEnemy.hp);
    setWinReward(null);
    taskStartedAt.current = Date.now();

    addLog(`📋 Цепочка: ${chain.length} задач`, 'info');
    if (chain[0]) {
      addLog(`🎯 [${chain[0].type.toUpperCase()}] ${chain[0].topic}`, 'system');
    }
    setBattleState('fighting');
  };

  // Загружаем стартовый код для новой задачи + показываем микро-урок (1 раз на тип)
  useEffect(() => {
    const t = taskChain[taskIdx];
    if (!t) return;
    if (t.type === 'write') setCode(t.starter);
    else if (t.type === 'debug') setCode(t.brokenCode);
    else if (t.type === 'refactor') setCode(t.originalCode);
    else if (t.type === 'complete') setCode(t.template);
    else setCode('');
    setPredictAnswer('');
    setShowHint(false);
    setShowSolution(false);
    setTestResults(null);

    // Микро-урок: показываем 1 раз на тип задачи (если ещё не видел)
    const seen = typeSeenMap[t.type]?.seen;
    if (!seen) setTypeIntroFor(t.type);
    taskStartedAt.current = Date.now();
  }, [taskIdx, taskChain]);

  // Сохранение победы (только не в тренировке)
  const saveBattleWin = useCallback(async () => {
    if (trainingMode) {
      addLog('🎓 Тренировка пройдена. Награды не сохраняются — это разминка.', 'info');
      return;
    }
    setSaving(true);
    const result = await api.battle.attack(selectedEnemy.id, true, 0);
    setSaving(false);
    progress.recordBattleWin();
    if (result && !result.error) {
      applyXpResult(result as XpResult);
      setWinReward(result as XpResult);
      progress.recordXp(applyXpBonus(result.xp_gained ?? 0, progress.get().implantsEquipped));
      if (result.leveled_up) {
        pushNotif({ type: 'level', title: `LEVEL UP! → ${result.new_level}`, body: 'Статы улучшены!', icon: '⚡', color: '#00ff41' });
      }
      if (result.dropped_item) {
        pushNotif({ type: 'item', title: `Дроп: ${result.dropped_item.name}`, body: `${result.dropped_item.rarity}`, icon: '💎', color: '#aa00ff' });
      }
    }
  }, [selectedEnemy, applyXpResult, trainingMode]);

  // Главная функция — атака кодом
  const attackWithCode = async () => {
    if (!currentTask || battleState !== 'fighting') return;
    if (!pyodideReady) {
      addLog('⏳ Python ещё грузится, подожди секунду...', 'info');
      return;
    }
    stopTimer();

    const timeSpent = Math.round((Date.now() - taskStartedAt.current) / 1000);
    let passRate = 0;
    let resultObj: typeof testResults = null;

    try {
      if (currentTask.type === 'predict') {
        const expected = currentTask.expectedOutput ?? await computeExpectedOutput(currentTask.code);
        const ok = comparePredict(predictAnswer, expected);
        passRate = ok ? 1 : 0;
        resultObj = {
          passed: ok ? 1 : 0,
          total: 1,
          details: [{ label: 'Ожидаемый вывод', pass: ok, got: predictAnswer || '(пусто)', expect: expected }],
        };
      } else {
        // WRITE / DEBUG / REFACTOR / COMPLETE — гоняем тесты
        let userCode = code;
        if (currentTask.type === 'complete') {
          userCode = currentTask.template.replace('___PLAYER___', code);
        }
        const r = await runTests(userCode, currentTask.tests);
        passRate = r.total > 0 ? r.passed / r.total : 0;
        resultObj = {
          passed: r.passed,
          total: r.total,
          details: r.details.filter(d => !d.hidden),
          error: r.errorSummary,
        };

        // REFACTOR: проверка длины
        if (currentTask.type === 'refactor' && passRate === 1) {
          const codeLen = code.replace(/\s/g, '').length;
          if (codeLen > currentTask.maxLength) {
            passRate = 0.6;
            resultObj.error = `Тесты прошли, но длина ${codeLen} > ${currentTask.maxLength}`;
          }
        }
      }
    } catch (e) {
      addLog(`💥 Ошибка выполнения: ${e instanceof Error ? e.message : String(e)}`, 'error');
      passRate = 0;
      resultObj = { passed: 0, total: 1, details: [], error: 'Runtime error' };
    }

    setTestResults(resultObj);

    // Считаем урон
    const dmgCtx = calculateDamage({
      testPassRate: passRate,
      timeSec: timeSpent,
      timeLimit: TIMER_MAX,
      usedHint: showHint,
      combo,
      intelligence,
      taskBaseXp: currentTask.baseXp,
      difficulty: currentTask.difficulty,
      taskType: currentTask.type,
    });

    if (passRate >= 0.5) {
      // Успех
      const newEnemyHp = Math.max(0, enemyHp - dmgCtx.damage);
      setEnemyHp(newEnemyHp);
      setFloatDamage({ value: dmgCtx.damage, type: 'enemy', crit: dmgCtx.critical });
      setTimeout(() => setFloatDamage(null), 1500);
      triggerShake('enemy');
      setCombo(c => {
        const next = c + 1;
        if (next > comboBest) setComboBest(next);
        return next;
      });

      const tag = dmgCtx.critical ? '💥 КРИТ! ' : '';
      addLog(`✅ ${tag}УРОН: ${dmgCtx.damage} (${Math.round(passRate * 100)}% тестов, комбо ×${combo + 1})`, 'success');
      addLog(`🔴 HP ${selectedEnemy.name}: ${newEnemyHp}/${selectedEnemy.hp}`, 'info');

      if (newEnemyHp <= 0) {
        setBattleState('win');
        addLog(`🏆 ПОБЕДА // Все ${taskIdx + 1} задач выполнены`, 'win');
        saveBattleWin();
        return;
      }

      // Следующая задача
      if (taskIdx + 1 < taskChain.length) {
        const next = taskIdx + 1;
        setTaskIdx(next);
        addLog(`🎯 [${taskChain[next].type.toUpperCase()}] ${taskChain[next].topic}`, 'system');
      } else {
        // Задачи закончились, но HP > 0 — финальный удар
        setEnemyHp(0);
        setBattleState('win');
        addLog(`🏆 ПОБЕДА // Цепочка пройдена`, 'win');
        saveBattleWin();
      }
    } else {
      // Провал — враг бьёт
      setCombo(0);
      addLog(`❌ Провал (${Math.round(passRate * 100)}%). Урон не нанесён.`, 'error');
      if (resultObj?.error) addLog(`💬 ${resultObj.error}`, 'error');
      enemyAttack();
      if (playerHp <= 0) {
        setBattleState('lose');
        progress.recordBattleLoss();
      }
    }
  };

  const useHint = () => {
    if (showHint) return;
    setShowHint(true);
    addLog(`💡 Подсказка использована (-20% к элегантности)`, 'info');
  };

  const timerPct = (timeLeft / TIMER_MAX) * 100;
  const timerColor = timeLeft > 30 ? '#00ff41' : timeLeft > 10 ? '#ffaa00' : '#ff4060';
  const playerHpPct = (playerHp / PLAYER_MAX_HP) * 100;
  const enemyHpPct = (enemyHp / selectedEnemy.hp) * 100;

  return (
    <section className="py-8 px-4 lg:px-6 min-h-screen relative">
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-6">
          <div className="font-mono text-xs tracking-widest mb-1" style={{ color: theme.primary + '99' }}>
            // КОД — ЭТО ОРУЖИЕ · COMBAT CODE 2.0
          </div>
          <h2 className="font-orbitron text-2xl text-white">
            CODE <span style={{ color: theme.primary }}>COMBAT</span>
          </h2>
          <div className="font-mono text-[10px] text-gray-700 mt-0.5">
            Реальный Python в браузере · 5 типов задач · Статы важны, но знания решают
          </div>
        </div>

        {/* Pyodide loader */}
        {pyodideLoading && !pyodideReady && (
          <div className="mb-4 border border-cyber-cyan/30 bg-cyber-cyan/5 p-3 font-mono text-xs flex items-center gap-3">
            <span className="w-4 h-4 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin" />
            <span className="text-cyber-cyan">Загружаем Python 3.11 в браузер (~10 MB, один раз)...</span>
          </div>
        )}

        {/* Enemy selection grid */}
        <div className="mb-5">
          <div className="font-mono text-[10px] text-gray-600 mb-2">// ДОСТУПНЫЕ ЦЕЛИ ({availableEnemies.length})</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[280px] overflow-y-auto pr-1">
            {availableEnemies.map(enemy => (
              <button key={enemy.id} onClick={() => {
                setSelectedEnemy(enemy);
                setBattleState('idle');
                setEnemyHp(enemy.hp);
                setBattleLog([]);
                setTaskChain([]);
                setTaskIdx(0);
              }}
                className="p-2.5 border transition-all text-left relative"
                style={{
                  borderColor: selectedEnemy.id === enemy.id ? enemy.color : '#ffffff12',
                  backgroundColor: selectedEnemy.id === enemy.id ? enemy.color + '12' : 'transparent',
                  boxShadow: selectedEnemy.id === enemy.id ? `0 0 14px ${enemy.color}25` : 'none',
                }}>
                {enemy.boss && (
                  <span className="absolute top-1 right-1 text-[8px] font-orbitron px-1 bg-red-500/20 text-red-400 border border-red-500/40">
                    БОСС
                  </span>
                )}
                <div className="text-2xl mb-1">{enemy.emoji}</div>
                <div className="font-orbitron text-[11px] font-bold leading-tight" style={{ color: enemy.color }}>
                  {enemy.name}
                </div>
                <div className="text-gray-600 font-mono text-[10px]">LVL {enemy.level} · CH {enemy.chapter}</div>
                <div className="font-mono text-[9px] mt-1 px-1 py-0.5 inline-block uppercase"
                  style={{ color: enemy.color, border: `1px solid ${enemy.color}40` }}>
                  {enemy.difficulty}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main battle grid */}
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-4">
          {/* Left: Arena */}
          <div className="space-y-3">
            {/* Enemy card */}
            <div className="border p-4" style={{ borderColor: selectedEnemy.color + '30', backgroundColor: selectedEnemy.color + '04' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`text-5xl transition-all ${shakeEnemy ? 'animate-shake' : ''}`}
                    style={{ filter: flashEnemy ? `drop-shadow(0 0 15px ${selectedEnemy.color})` : 'none' }}>
                    {selectedEnemy.emoji}
                  </div>
                  <div>
                    <div className="font-orbitron text-sm font-bold" style={{ color: selectedEnemy.color }}>
                      {selectedEnemy.name}
                    </div>
                    <div className="text-gray-600 font-mono text-xs">[{selectedEnemy.faction}] LVL {selectedEnemy.level}</div>
                    <div className="text-gray-700 font-mono text-[10px] mt-0.5 max-w-[220px] leading-tight">
                      {selectedEnemy.lore}
                    </div>
                  </div>
                </div>
                {floatDamage?.type === 'enemy' && (
                  <div className={`font-orbitron font-black animate-bounce ${floatDamage.crit ? 'text-2xl' : 'text-xl'}`}
                    style={{ color: floatDamage.crit ? '#ffff00' : theme.primary }}>
                    {floatDamage.crit && '💥 '}-{floatDamage.value}
                  </div>
                )}
              </div>

              <div className="flex justify-between text-xs font-mono mb-1" style={{ color: selectedEnemy.color }}>
                <span>HP</span><span>{enemyHp}/{selectedEnemy.hp}</span>
              </div>
              <div className="h-2.5 bg-black/60 border border-white/5">
                <div className="h-full transition-all duration-500"
                  style={{ width: `${enemyHpPct}%`, backgroundColor: selectedEnemy.color, boxShadow: `0 0 8px ${selectedEnemy.color}60` }} />
              </div>
            </div>

            {/* Player status */}
            <div className="border border-white/8 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-orbitron text-xs" style={{ color: theme.primary }}>
                  {character?.name || 'AGENT'} [{theme.label}]
                </span>
                <div className={`font-mono text-xs ${shakePlayer ? 'text-red-400' : 'text-red-500'}`}>
                  {playerHp}/{PLAYER_MAX_HP} HP
                  {floatDamage?.type === 'player' && (
                    <span className="ml-2 text-red-400 animate-bounce">-{floatDamage.value}</span>
                  )}
                </div>
              </div>
              <div className="h-2 bg-black/60 border border-red-500/15">
                <div className="h-full transition-all duration-500"
                  style={{ width: `${playerHpPct}%`, backgroundColor: '#ff4060', boxShadow: '0 0 6px #ff406060' }} />
              </div>

              {/* Статы */}
              <div className="grid grid-cols-3 gap-2 mt-3 text-[10px] font-mono">
                <div className="text-cyan-400">🧠 INT: {intelligence} <span className="text-gray-600">(урон +{Math.round((intelligence - 10) * 2)}%)</span></div>
                <div className="text-yellow-400">⚡ AGI: {agility} <span className="text-gray-600">(+{Math.min(20, Math.floor(agility * 0.5))}с)</span></div>
                <div className="text-green-400">🛡 DEF: {defense} <span className="text-gray-600">(-{Math.round(Math.min(50, defense * 1.5))}%)</span></div>
              </div>
            </div>

            {/* Combo + Tasks progress */}
            {battleState === 'fighting' && (
              <div className="grid grid-cols-2 gap-2">
                <div className="border border-purple-500/20 bg-purple-500/5 p-2">
                  <div className="font-mono text-[9px] text-gray-500">КОМБО</div>
                  <div className="font-orbitron text-lg font-black text-purple-400">×{combo}</div>
                  {combo >= 3 && <div className="font-mono text-[9px] text-purple-300">+{Math.min(100, (combo - 2) * 20)}%</div>}
                </div>
                <div className="border border-cyan-500/20 bg-cyan-500/5 p-2">
                  <div className="font-mono text-[9px] text-gray-500">ЗАДАЧИ</div>
                  <div className="font-orbitron text-lg font-black text-cyan-400">{taskIdx + 1}/{totalTasks}</div>
                  {comboBest > 0 && <div className="font-mono text-[9px] text-cyan-300">Лучшее комбо: ×{comboBest}</div>}
                </div>
              </div>
            )}

            {/* Battle log */}
            <div className="border border-white/8 bg-black/60" ref={logRef}
              style={{ height: '220px', overflowY: 'auto' }}>
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

          {/* Right: Task + editor */}
          <div className="space-y-3">
            {/* Timer (только в боевом режиме) */}
            {battleState === 'fighting' && currentTask && !trainingMode && (
              <div>
                <div className="flex justify-between font-mono text-xs mb-1" style={{ color: timerColor }}>
                  <span>⏱ ВРЕМЯ НА РЕШЕНИЕ</span><span>{timeLeft}с</span>
                </div>
                <div className="h-1.5 bg-black/60">
                  <div className="h-full transition-all duration-1000"
                    style={{ width: `${timerPct}%`, backgroundColor: timerColor, boxShadow: `0 0 6px ${timerColor}` }} />
                </div>
              </div>
            )}

            {/* Training banner */}
            {battleState === 'fighting' && trainingMode && (
              <div className="border border-purple-500/30 bg-purple-500/5 px-3 py-2 font-mono text-[11px] text-purple-300 flex items-center gap-2">
                <Icon name="GraduationCap" size={12} />
                Тренировка: без таймера, без HP. Подсказки и решение доступны.
              </div>
            )}

            {/* Current task card */}
            {battleState === 'fighting' && currentTask && (
              <div className="border p-3" style={{ borderColor: theme.primary + '30', backgroundColor: theme.primary + '03' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-orbitron text-[10px] px-2 py-0.5 border"
                      style={{ color: theme.primary, borderColor: theme.primary + '60' }}>
                      {currentTask.type.toUpperCase()}
                    </span>
                    <span className="font-mono text-[10px] text-gray-500">
                      {currentTask.topic} · {currentTask.difficulty}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={useHint} disabled={showHint}
                      className="font-mono text-[10px] px-2 py-0.5 border border-yellow-500/40 text-yellow-400 disabled:opacity-40">
                      💡 {showHint ? 'Открыта' : 'Подсказка'}
                    </button>
                    {trainingMode && currentTask.solution && (
                      <button onClick={() => setShowSolution(s => !s)}
                        className="font-mono text-[10px] px-2 py-0.5 border border-purple-500/40 text-purple-400">
                        📖 {showSolution ? 'Скрыть' : 'Решение'}
                      </button>
                    )}
                  </div>
                </div>

                {currentTask.flavor && (
                  <div className="font-rajdhani text-xs text-gray-400 mb-2 italic">"{currentTask.flavor}"</div>
                )}

                {currentTask.type === 'predict' ? (
                  <div>
                    <div className="font-mono text-[11px] text-gray-300 mb-2">
                      Угадай вывод этого кода:
                    </div>
                    <pre className="bg-black/60 border border-white/10 p-2 font-mono text-[11px] text-cyber-cyan overflow-x-auto">
{currentTask.code}
                    </pre>
                  </div>
                ) : (
                  <div className="font-rajdhani text-sm text-gray-200">{currentTask.description}</div>
                )}

                {showHint && (
                  <div className="mt-2 border border-yellow-500/30 bg-yellow-500/5 p-2">
                    <div className="font-mono text-[9px] text-yellow-500">// HINT</div>
                    <pre className="font-mono text-[11px] text-yellow-300 whitespace-pre-wrap">{currentTask.hint}</pre>
                  </div>
                )}

                {trainingMode && showSolution && currentTask.solution && (
                  <div className="mt-2 border border-purple-500/30 bg-purple-500/5 p-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-[9px] text-purple-400">// SOLUTION + EXPLANATION</div>
                      <button onClick={() => {
                        if (currentTask.solution) setCode(currentTask.solution);
                      }} className="font-mono text-[9px] text-purple-300 border border-purple-500/40 px-1.5 py-0.5">
                        ↓ вставить в редактор
                      </button>
                    </div>
                    <pre className="font-mono text-[11px] text-purple-200 whitespace-pre-wrap bg-black/30 p-2">{currentTask.solution}</pre>
                    {currentTask.explanation && (
                      <div className="font-rajdhani text-[12px] text-gray-300 leading-relaxed whitespace-pre-line">
                        {currentTask.explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* PREDICT input */}
            {battleState === 'fighting' && currentTask?.type === 'predict' && (
              <div className="border" style={{ borderColor: theme.primary + '30' }}>
                <div className="px-3 py-2 border-b border-white/5 bg-black/40 font-mono text-[10px] text-gray-500">
                  // Введи ожидаемый вывод
                </div>
                <input
                  type="text"
                  value={predictAnswer}
                  onChange={e => setPredictAnswer(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && attackWithCode()}
                  placeholder="Напечатается..."
                  autoFocus
                  className="w-full bg-black/40 text-white p-3 font-mono text-sm outline-none border-0"
                  style={{ caretColor: theme.primary }}
                />
              </div>
            )}

            {/* Code editor (WRITE/DEBUG/REFACTOR/COMPLETE) */}
            {battleState === 'fighting' && currentTask && currentTask.type !== 'predict' && (
              <div className="border" style={{ borderColor: theme.primary + '30' }}>
                <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 bg-black/40">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                  <span className="text-gray-600 font-mono text-[10px] ml-2">battle.py</span>
                  <span className="ml-auto font-mono text-[10px]" style={{ color: theme.primary + '80' }}>
                    Python 3.11 · {currentTask.type === 'refactor' ? `≤ ${currentTask.maxLength} симв` : ''}
                  </span>
                </div>
                <Editor
                  height="220px"
                  language="python"
                  theme="vs-dark"
                  value={code}
                  onChange={v => setCode(v || '')}
                  options={{
                    fontSize: 13,
                    minimap: { enabled: false },
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    padding: { top: 10, bottom: 10 },
                    fontFamily: 'Share Tech Mono, Consolas, monospace',
                    renderLineHighlight: 'none',
                    overviewRulerLanes: 0,
                  }}
                />
              </div>
            )}

            {/* Test results */}
            {testResults && (
              <div className="border border-white/10 bg-black/40 p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-[10px] text-gray-500">// РЕЗУЛЬТАТ</div>
                  <div className="font-orbitron text-sm" style={{ color: testResults.passed === testResults.total ? '#00ff41' : '#ff4060' }}>
                    {testResults.passed}/{testResults.total}
                  </div>
                </div>
                {testResults.error && (
                  <div className="font-mono text-[11px] text-red-400">⚠ {testResults.error}</div>
                )}
                {testResults.details.map((d, i) => (
                  <div key={i} className="font-mono text-[11px] flex items-start gap-2"
                    style={{ color: d.pass ? '#00ff41' : '#ff8888' }}>
                    <span>{d.pass ? '✓' : '✗'}</span>
                    <span className="flex-1">
                      <span className="text-gray-400">{d.label}</span>
                      {!d.pass && (
                        <div className="text-gray-500 text-[10px]">
                          ожидалось: <span className="text-yellow-400">{d.expect}</span> · получено: <span className="text-red-400">{d.got}</span>
                        </div>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Controls */}
            {battleState === 'idle' && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => startBattle(false)} disabled={pyodideLoading}
                    className="py-3.5 font-orbitron text-sm tracking-widest border transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ borderColor: theme.primary, color: theme.primary, backgroundColor: theme.primary + '15', boxShadow: `0 0 20px ${theme.primary}20` }}>
                    <Icon name="Zap" size={16} />
                    {pyodideLoading ? 'PYTHON...' : 'БОЙ'}
                  </button>
                  <button onClick={() => startBattle(true)} disabled={pyodideLoading}
                    className="py-3.5 font-orbitron text-sm tracking-widest border transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ borderColor: '#8888ff', color: '#aaaaff', backgroundColor: '#aaaaff15' }}>
                    <Icon name="GraduationCap" size={16} />
                    ТРЕНИРОВКА
                  </button>
                </div>
                <button onClick={() => setShowTutorial(true)}
                  className="w-full py-2 font-mono text-[11px] border border-white/15 text-gray-400 hover:bg-white/5 flex items-center justify-center gap-2">
                  <Icon name="BookOpen" size={12} />
                  Открыть обучение
                </button>
              </div>
            )}

            {battleState === 'fighting' && (
              <button onClick={attackWithCode}
                className="w-full py-3.5 font-orbitron text-sm tracking-widest border transition-all flex items-center justify-center gap-2 active:scale-95"
                style={{ borderColor: theme.primary, color: theme.primary, backgroundColor: theme.primary + '20' }}>
                <Icon name="Send" size={16} />
                ⚔️ АТАКОВАТЬ КОДОМ
              </button>
            )}

            {(battleState === 'win' || battleState === 'lose') && (
              <div className="text-center py-3">
                <div className="font-orbitron text-3xl font-black mb-3"
                  style={{ color: battleState === 'win' ? theme.primary : '#ff2040', textShadow: `0 0 20px ${battleState === 'win' ? theme.primary : '#ff2040'}60` }}>
                  {battleState === 'win' ? '// VICTORY' : '// DEFEATED'}
                </div>

                {battleState === 'win' && (
                  <div className="mb-3 space-y-1.5">
                    {saving ? (
                      <div className="flex items-center justify-center gap-2 font-mono text-xs text-gray-500">
                        <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                        Сохраняем результат...
                      </div>
                    ) : winReward ? (
                      <div className="border border-white/10 bg-black/40 p-3 space-y-1">
                        <div className="flex justify-center gap-6 font-orbitron text-sm">
                          <span style={{ color: theme.primary }}>+{winReward.xp_gained} XP</span>
                          <span className="text-yellow-400">+{winReward.coins_gained} Creds</span>
                        </div>
                        {winReward.leveled_up && (
                          <div className="font-orbitron text-cyber-yellow animate-pulse text-center">
                            ⚡ LEVEL UP! → {winReward.new_level}
                          </div>
                        )}
                        <div className="font-mono text-[10px] text-gray-600">
                          XP: {winReward.new_xp}/{winReward.xp_to_next} · Лучшее комбо ×{comboBest}
                        </div>
                      </div>
                    ) : (
                      <div className="font-mono text-xs text-gray-600">+{selectedEnemy.xpReward} XP · +{selectedEnemy.credsReward} Creds</div>
                    )}
                  </div>
                )}

                <button onClick={() => startBattle(trainingMode)}
                  className="font-orbitron text-xs px-6 py-2 border transition-all"
                  style={{ borderColor: theme.primary, color: theme.primary }}>
                  {battleState === 'win' ? 'СЛЕДУЮЩИЙ ВРАГ' : 'ПОПРОБОВАТЬ ЕЩЁ'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 border-t border-white/5 pt-3 font-mono text-[10px] text-gray-800 flex items-center justify-between">
          <span>COMBAT CODE 2.0 // Python в браузере через Pyodide</span>
          <span className="glitch-text" style={{ color: theme.primary + '40' }}>CODEGRID-9 // 2087</span>
        </div>
      </div>

      {/* Туториал боя — один раз при первом заходе или вручную */}
      {showTutorial && (
        <CombatTutorial
          themeColor={theme.primary}
          onClose={() => {
            tutorialOnb.markSeen();
            setShowTutorial(false);
          }}
        />
      )}

      {/* Микро-урок по типу задачи — один раз на тип */}
      {typeIntroFor && (
        <TaskTypeIntro
          type={typeIntroFor}
          themeColor={theme.primary}
          onClose={() => {
            typeSeenMap[typeIntroFor]?.markSeen();
            setTypeIntroFor(null);
          }}
        />
      )}
    </section>
  );
}