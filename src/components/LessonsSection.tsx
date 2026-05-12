import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import Icon from '@/components/ui/icon';
import { useGame } from '@/lib/GameContext';

// GDD: уроки по актам
const ACT_META: Record<number, { color: string; label: string; icon: string }> = {
  1: { color: '#00ff41', label: 'АКТ I · Пробуждение', icon: 'BookOpen' },
  2: { color: '#00aaff', label: 'АКТ II · Подполье', icon: 'Code' },
  3: { color: '#aa00ff', label: 'АКТ III · Восстание', icon: 'Cpu' },
};

interface LessonTask { desc: string; keywords: string[]; example: string; output: string; }
interface Lesson {
  id: number; title: string; chapter: string; act: 1 | 2 | 3;
  xp: number; completed: boolean; locked: boolean; icon: string; desc: string; task: LessonTask;
}

const LESSONS: Lesson[] = [
  {
    id: 1, title: 'Переменные и типы', chapter: 'АКТ I · Миссия 1', act: 1, xp: 100, completed: true, locked: false,
    icon: '📦', desc: 'Базовый синтаксис агента. Храни данные в переменных — первый шаг нетраннера подполья.',
    task: { desc: 'Создай переменную agent_id и присвой строку со своим именем', keywords: ['agent_id', '=', '"'], example: 'agent_id = "Nova_7"', output: '> agent_id = "Nova_7"\n[OK] Переменная загружена в память' },
  },
  {
    id: 2, title: 'Условия и ветвления', chapter: 'АКТ I · Миссия 2', act: 1, xp: 150, completed: true, locked: false,
    icon: '⚡', desc: 'if/else — логика принятия решений. Основа любого ИИ корпорации NEXUS.',
    task: { desc: 'Напиши if/else: если threat_level >= 5 выведи "DANGER", иначе "CLEAR"', keywords: ['if', 'else', '>=', 'threat_level'], example: 'if threat_level >= 5:\n    print("DANGER")\nelse:\n    print("CLEAR")', output: '> DANGER\n[OK] Условие скомпилировано' },
  },
  {
    id: 3, title: 'Циклы: while и for', chapter: 'АКТ I · Миссия 3', act: 1, xp: 200, completed: false, locked: false,
    icon: '🔄', desc: 'Автоматизируй атаки. Цикл — бесконечный поток данных против систем NEXUS.',
    task: { desc: 'Используй for и range чтобы вывести числа 1 до 5', keywords: ['for', 'in', 'range', 'print'], example: 'for i in range(1, 6):\n    print(i)', output: '> 1\n> 2\n> 3\n> 4\n> 5\n[OK] Цикл активирован' },
  },
  {
    id: 4, title: 'Функции и модули', chapter: 'АКТ II · Миссия 1', act: 2, xp: 300, completed: false, locked: false,
    icon: '🔧', desc: 'Создавай переиспользуемые модули атак. Архитектура настоящего хакера The Archive.',
    task: { desc: 'Напиши функцию hack(target) которая возвращает f"Взлом: {target}"', keywords: ['def', 'hack', 'return', 'target'], example: 'def hack(target):\n    return f"Взлом: {target}"', output: '> Взлом: NEXUS_Server\n[OK] Функция скомпилирована' },
  },
  {
    id: 5, title: 'Списки и словари', chapter: 'АКТ II · Миссия 2', act: 2, xp: 350, completed: false, locked: true,
    icon: '🗂️', desc: 'Структуры данных — базы данных подполья The Archive. Хранилище агентов.',
    task: { desc: 'Создай список из трёх агентов Archive', keywords: ['=', '[', ']'], example: 'agents = ["Nova", "Phantom", "VOID"]', output: '> ["Nova", "Phantom", "VOID"]\n[OK] База данных загружена' },
  },
  {
    id: 6, title: 'ООП: Классы', chapter: 'АКТ III · Миссия 1', act: 3, xp: 500, completed: false, locked: true,
    icon: '🤖', desc: 'Создай своего ИИ-агента. Синтаксис мастера-архитектора кода.',
    task: { desc: 'Создай класс Agent с __init__(self, name, clearance_level)', keywords: ['class', 'Agent', 'def', '__init__', 'self'], example: 'class Agent:\n    def __init__(self, name, clearance_level):\n        self.name = name\n        self.clearance_level = clearance_level', output: '> Agent("Nova", 7)\n[OK] Агент создан' },
  },
];

type OutputLine = { text: string; type: 'cmd' | 'ok' | 'err' | 'info' | 'dim' };
type RunState = 'idle' | 'running' | 'success' | 'error';

export default function LessonsSection() {
  const { character } = useGame();
  const [activeId, setActiveId] = useState<number | null>(1);
  const [code, setCode] = useState(LESSONS[0].task.example);
  const [outputLines, setOutputLines] = useState<OutputLine[]>([]);
  const [runState, setRunState] = useState<RunState>('idle');
  const [completedInSession, setCompletedInSession] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const lesson = LESSONS.find(l => l.id === activeId);

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [outputLines]);

  const selectLesson = (l: Lesson) => {
    if (l.locked) return;
    setActiveId(l.id);
    setCode(l.task.example);
    setOutputLines([]);
    setRunState('idle');
    setShowHint(false);
  };

  const checkCode = (src: string, kws: string[]): { pass: boolean; missing: string[] } => {
    const lower = src.toLowerCase();
    const missing = kws.filter(k => !lower.includes(k.toLowerCase()));
    const matched = kws.length - missing.length;
    return { pass: matched >= Math.ceil(kws.length * 0.7), missing };
  };

  const streamLines = (lines: OutputLine[]) => {
    lines.forEach((line, i) => {
      setTimeout(() => setOutputLines(prev => [...prev, line]), i * 120);
    });
  };

  const runCode = () => {
    if (!lesson || !code.trim() || runState === 'running') return;
    setRunState('running');
    setOutputLines([]);

    setTimeout(() => {
      const { pass, missing } = checkCode(code, lesson.task.keywords);
      const lines: OutputLine[] = [
        { text: `$ python battle.py`, type: 'cmd' },
      ];
      if (pass) {
        lesson.task.output.split('\n').forEach(l => {
          lines.push({ text: l.startsWith('[OK]') ? l : l, type: l.startsWith('[OK]') ? 'ok' : 'info' });
        });
        lines.push({ text: `[+${lesson.xp} XP] Миссия выполнена`, type: 'ok' });
        setRunState('success');
        if (!completedInSession.includes(lesson.id)) setCompletedInSession(prev => [...prev, lesson.id]);
      } else {
        lines.push({ text: `[ERROR] SyntaxError: неверный код`, type: 'err' });
        if (missing.length) lines.push({ text: `Не найдено: ${missing.slice(0, 4).join(', ')}`, type: 'dim' });
        lines.push({ text: `Используй подсказку ↓`, type: 'dim' });
        setRunState('error');
      }
      streamLines(lines);
    }, 400);
  };

  const completedCount = LESSONS.filter(l => l.completed || completedInSession.includes(l.id)).length;
  const progressPct = Math.round((completedCount / LESSONS.length) * 100);

  // Group lessons by act
  const byAct = [1, 2, 3].map(act => ({
    act: act as 1 | 2 | 3,
    lessons: LESSONS.filter(l => l.act === act),
  }));

  return (
    <section className="py-8 px-4 lg:px-6 min-h-screen relative">
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-5 flex items-end justify-between flex-wrap gap-3">
          <div>
            <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-1">// THE ARCHIVE · RESIST</div>
            <h2 className="font-orbitron text-2xl text-white">УРОКИ <span className="text-cyber-green">PYTHON</span></h2>
            <div className="font-mono text-[10px] text-gray-700 mt-0.5">CodeGrid-9 · 2087 · Python запрещён корпорацией NEXUS</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-orbitron text-cyber-green text-sm">{completedCount}/{LESSONS.length}</div>
              <div className="text-gray-600 font-mono text-[10px]">миссий</div>
            </div>
            <div className="w-24 h-1.5 bg-black/60 border border-cyber-green/20">
              <div className="h-full bg-cyber-green transition-all" style={{ width: `${progressPct}%`, boxShadow: '0 0 6px #00ff4160' }} />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left: lesson list */}
          <div className="w-full lg:w-[260px] flex-shrink-0 space-y-3">
            {byAct.map(({ act, lessons: actLessons }) => {
              const meta = ACT_META[act];
              return (
                <div key={act}>
                  <div className="flex items-center gap-2 mb-1.5 px-1">
                    <Icon name={meta.icon as 'BookOpen'} size={10} style={{ color: meta.color }} />
                    <span className="font-mono text-[10px] tracking-widest" style={{ color: meta.color + 'aa' }}>{meta.label}</span>
                  </div>
                  <div className="space-y-1">
                    {actLessons.map(l => {
                      const isDone = l.completed || completedInSession.includes(l.id);
                      const isActive = activeId === l.id;
                      return (
                        <button key={l.id} onClick={() => selectLesson(l)}
                          disabled={l.locked}
                          className="w-full text-left p-3 border transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                          style={{
                            borderColor: isActive ? meta.color + '60' : isDone ? meta.color + '20' : '#ffffff08',
                            backgroundColor: isActive ? meta.color + '08' : 'transparent',
                            borderLeftWidth: isActive ? '3px' : '1px',
                          }}>
                          <div className="flex items-center gap-2">
                            <span className="text-base flex-shrink-0">{l.locked ? '🔒' : isDone ? '✅' : l.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-rajdhani text-sm font-semibold text-white truncate">{l.title}</span>
                                <span className="font-mono text-[10px] flex-shrink-0" style={{ color: meta.color }}>+{l.xp}</span>
                              </div>
                              <div className="font-mono text-[10px] text-gray-600">{l.chapter}</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: editor panel */}
          {lesson && (
            <div className="flex-1 min-w-0 space-y-3">
              {/* Mission briefing */}
              <div className="border p-4" style={{ borderColor: ACT_META[lesson.act].color + '30', backgroundColor: ACT_META[lesson.act].color + '04' }}>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="font-mono text-[10px] px-2 py-0.5 border"
                    style={{ color: ACT_META[lesson.act].color, borderColor: ACT_META[lesson.act].color + '40', backgroundColor: ACT_META[lesson.act].color + '10' }}>
                    {lesson.chapter}
                  </span>
                  {(lesson.completed || completedInSession.includes(lesson.id)) && (
                    <span className="font-mono text-[10px] text-cyber-green">✅ ВЫПОЛНЕНО</span>
                  )}
                </div>
                <h3 className="font-orbitron text-base text-white mb-1">{lesson.icon} {lesson.title}</h3>
                <p className="text-gray-500 font-rajdhani text-sm leading-snug mb-3">{lesson.desc}</p>
                {/* Task */}
                <div className="border border-white/8 bg-black/40 p-3">
                  <div className="font-mono text-[10px] text-gray-600 mb-1.5">// ЗАДАНИЕ</div>
                  <p className="text-white font-rajdhani text-sm mb-3 leading-snug">{lesson.task.desc}</p>
                  {/* Keyword tracker */}
                  <div className="flex flex-wrap gap-1">
                    {lesson.task.keywords.map(kw => {
                      const found = code.toLowerCase().includes(kw.toLowerCase());
                      return (
                        <span key={kw} className="font-mono text-[10px] px-1.5 py-0.5 border transition-all"
                          style={{
                            color: found ? ACT_META[lesson.act].color : '#444',
                            borderColor: found ? ACT_META[lesson.act].color + '60' : '#333',
                            backgroundColor: found ? ACT_META[lesson.act].color + '10' : 'transparent',
                          }}>
                          {found ? '✓ ' : ''}{kw}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Monaco editor */}
              <div className="border" style={{ borderColor: ACT_META[lesson.act].color + '30' }}>
                <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 bg-black/50">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                  <span className="text-gray-600 font-mono text-[10px] ml-2">mission_{String(lesson.id).padStart(2,'0')}.py</span>
                  <div className="ml-auto flex items-center gap-2">
                    <button onClick={() => setShowHint(h => !h)}
                      className="font-mono text-[10px] px-2 py-0.5 border transition-all"
                      style={{
                        borderColor: ACT_META[lesson.act].color + '40',
                        color: showHint ? ACT_META[lesson.act].color : '#555',
                        backgroundColor: showHint ? ACT_META[lesson.act].color + '10' : 'transparent',
                      }}>
                      ПРИМЕР
                    </button>
                    <button onClick={() => { setCode(''); setOutputLines([]); setRunState('idle'); }}
                      className="font-mono text-[10px] px-2 py-0.5 border border-white/10 text-gray-600 hover:text-gray-400 transition-colors">
                      ОЧИСТИТЬ
                    </button>
                  </div>
                </div>
                {showHint && (
                  <div className="px-3 py-2 bg-black/60 border-b border-white/5 font-mono text-xs text-cyber-green/70">
                    <span className="text-gray-600 text-[10px]"># Пример: </span>{lesson.task.example.split('\n')[0]}
                  </div>
                )}
                <Editor
                  height="200px"
                  language="python"
                  theme="vs-dark"
                  value={code}
                  onChange={v => setCode(v || '')}
                  options={{
                    fontSize: 13,
                    minimap: { enabled: false },
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    padding: { top: 8, bottom: 8 },
                    fontFamily: 'Share Tech Mono, Consolas, monospace',
                    renderLineHighlight: 'line',
                    suggest: { showKeywords: true },
                  }}
                />
              </div>

              {/* Run button */}
              <div className="flex gap-2">
                <button onClick={runCode} disabled={runState === 'running'}
                  className="flex-1 py-3 font-orbitron text-sm tracking-wider border transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{
                    borderColor: ACT_META[lesson.act].color,
                    color: ACT_META[lesson.act].color,
                    backgroundColor: ACT_META[lesson.act].color + '15',
                  }}>
                  {runState === 'running'
                    ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />КОМПИЛЯЦИЯ...</>
                    : <><Icon name="Play" size={14} />ЗАПУСТИТЬ КОД</>
                  }
                </button>
              </div>

              {/* Output terminal */}
              <div className="border border-white/8 bg-black/80">
                <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/5">
                  <span className="font-mono text-[10px] text-gray-600">archive@codegrid9:~$</span>
                  <div className="ml-auto flex items-center gap-1.5">
                    {runState === 'success' && <span className="font-mono text-[10px] text-cyber-green">● PASS</span>}
                    {runState === 'error' && <span className="font-mono text-[10px] text-red-400">● FAIL</span>}
                    {runState === 'running' && <span className="font-mono text-[10px] text-yellow-400 animate-pulse">● RUN</span>}
                  </div>
                </div>
                <div ref={outputRef} className="p-3 space-y-0.5 font-mono text-xs"
                  style={{ height: '120px', overflowY: 'auto' }}>
                  {outputLines.length === 0 && runState === 'idle' && (
                    <span className="text-gray-700">// Запусти код чтобы увидеть результат</span>
                  )}
                  {outputLines.map((line, i) => (
                    <div key={i} style={{
                      color: line.type === 'ok' ? '#00ff41' : line.type === 'err' ? '#ff4060' : line.type === 'cmd' ? '#00ffff' : line.type === 'dim' ? '#444' : '#888',
                    }}>
                      {line.type === 'cmd' ? `${line.text}` : line.text}
                      {i === outputLines.length - 1 && runState === 'running' && <span className="animate-pulse">█</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Nav buttons */}
              <div className="flex justify-between">
                <button
                  onClick={() => { const prev = LESSONS.find(l => l.id === (lesson.id - 1)); if (prev && !prev.locked) selectLesson(prev); }}
                  disabled={lesson.id === 1}
                  className="font-orbitron text-xs px-4 py-2 border border-white/10 text-gray-600 hover:text-gray-400 disabled:opacity-30 transition-colors">
                  ← ПРЕДЫДУЩАЯ
                </button>
                <button
                  onClick={() => { const next = LESSONS.find(l => l.id === (lesson.id + 1)); if (next && !next.locked) selectLesson(next); }}
                  disabled={!LESSONS.find(l => l.id === lesson.id + 1) || LESSONS.find(l => l.id === lesson.id + 1)?.locked}
                  className="font-orbitron text-xs px-4 py-2 border border-white/10 text-gray-600 hover:text-gray-400 disabled:opacity-30 transition-colors">
                  СЛЕДУЮЩАЯ →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Lore footer */}
        <div className="mt-6 border-t border-white/5 pt-3 font-mono text-[10px] text-gray-800 flex items-center justify-between">
          <span>THE ARCHIVE — RESIST · CODEGRID-9 · 2087</span>
          <span className="text-cyber-green/30">PYTHON IS FORBIDDEN · BUT NOT HERE</span>
        </div>
      </div>
    </section>
  );
}