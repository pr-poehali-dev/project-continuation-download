import { useState } from 'react';
import { progress as progressStore } from '@/lib/progressStore';
import { pushNotif } from '@/components/Notifications';
import { applyXpBonus } from '@/lib/implants';
import { useGainXp } from '@/lib/useGainXp';

interface Block {
  id: string;       // уникальный (для перетаскивания)
  type: string;     // тип блока
  label: string;    // что показывать
  color: string;
  indent?: number;  // уровень вложенности (для отступов)
}

interface Puzzle {
  id: string;
  title: string;
  desc: string;
  difficulty: 'easy' | 'medium' | 'hard';
  xp: number;
  // Палитра доступных блоков
  palette: Omit<Block, 'id'>[];
  // Правильный порядок (по type)
  solution: string[];
}

const PUZZLES: Puzzle[] = [
  {
    id: 'p1',
    title: 'Привет, агент',
    desc: 'Собери программу, которая выведет "Привет, Nova!"',
    difficulty: 'easy',
    xp: 60,
    palette: [
      { type: 'name=Nova', label: 'name = "Nova"', color: '#00ff41' },
      { type: 'print-hi', label: 'print(f"Привет, {name}!")', color: '#00aaff' },
    ],
    solution: ['name=Nova', 'print-hi'],
  },
  {
    id: 'p2',
    title: 'Проверка доступа',
    desc: 'Если age >= 18 — вывести "Доступ разрешён"',
    difficulty: 'easy',
    xp: 80,
    palette: [
      { type: 'age', label: 'age = 18', color: '#00ff41' },
      { type: 'if', label: 'if age >= 18:', color: '#ffaa00' },
      { type: 'print-ok', label: 'print("Доступ разрешён")', color: '#00aaff', indent: 1 },
    ],
    solution: ['age', 'if', 'print-ok'],
  },
  {
    id: 'p3',
    title: 'Чётные числа',
    desc: 'Перебери числа от 0 до 9 и выведи только чётные',
    difficulty: 'medium',
    xp: 120,
    palette: [
      { type: 'for', label: 'for i in range(10):', color: '#ffaa00' },
      { type: 'if-even', label: 'if i % 2 == 0:', color: '#ff00ff', indent: 1 },
      { type: 'print-i', label: 'print(i)', color: '#00aaff', indent: 2 },
    ],
    solution: ['for', 'if-even', 'print-i'],
  },
  {
    id: 'p4',
    title: 'Список агентов',
    desc: 'Создай список из 3 агентов и выведи длину',
    difficulty: 'medium',
    xp: 110,
    palette: [
      { type: 'list', label: 'agents = ["Nova", "K4I", "VOID"]', color: '#00ff41' },
      { type: 'len', label: 'print(len(agents))', color: '#00aaff' },
    ],
    solution: ['list', 'len'],
  },
  {
    id: 'p5',
    title: 'Класс Agent',
    desc: 'Создай класс с конструктором, потом объект и выведи имя',
    difficulty: 'hard',
    xp: 200,
    palette: [
      { type: 'class', label: 'class Agent:', color: '#ff4060' },
      { type: 'init', label: 'def __init__(self, name):', color: '#aa00ff', indent: 1 },
      { type: 'assign', label: 'self.name = name', color: '#00ff41', indent: 2 },
      { type: 'create', label: 'nova = Agent("Nova")' , color: '#00aaff' },
      { type: 'print', label: 'print(nova.name)', color: '#00aaff' },
    ],
    solution: ['class', 'init', 'assign', 'create', 'print'],
  },
];

const DIFF_META: Record<Puzzle['difficulty'], { label: string; color: string }> = {
  easy:   { label: 'Лёгкий', color: '#00ff41' },
  medium: { label: 'Средний', color: '#ffaa00' },
  hard:   { label: 'Сложный', color: '#ff4060' },
};

export default function CodeBuilder() {
  const [puzzleId, setPuzzleId] = useState<string | null>(null);
  const [solved, setSolved] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('builder_solved') || '[]'); } catch { return []; }
  });
  const gainXp = useGainXp();

  const puzzle = PUZZLES.find(p => p.id === puzzleId);

  // Состояние сборки: блоки в палитре и в рабочей зоне
  const [paletteBlocks, setPaletteBlocks] = useState<Block[]>([]);
  const [workspace, setWorkspace] = useState<Block[]>([]);
  const [result, setResult] = useState<'idle' | 'ok' | 'fail'>('idle');

  const startPuzzle = (id: string) => {
    const p = PUZZLES.find(x => x.id === id);
    if (!p) return;
    setPuzzleId(id);
    // Перемешиваем палитру
    const shuffled = [...p.palette]
      .map((b, i) => ({ ...b, id: `${b.type}-${i}` }))
      .sort(() => Math.random() - 0.5);
    setPaletteBlocks(shuffled);
    setWorkspace([]);
    setResult('idle');
  };

  const moveToWorkspace = (block: Block) => {
    setPaletteBlocks(prev => prev.filter(b => b.id !== block.id));
    setWorkspace(prev => [...prev, block]);
  };
  const moveToPalette = (block: Block) => {
    setWorkspace(prev => prev.filter(b => b.id !== block.id));
    setPaletteBlocks(prev => [...prev, block]);
  };
  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setWorkspace(prev => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };
  const moveDown = (idx: number) => {
    setWorkspace(prev => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
      return next;
    });
  };

  const check = () => {
    if (!puzzle) return;
    const userOrder = workspace.map(b => b.type);
    const isOk = userOrder.length === puzzle.solution.length &&
                 userOrder.every((t, i) => t === puzzle.solution[i]);
    if (isOk) {
      setResult('ok');
      if (!solved.includes(puzzle.id)) {
        const next = [...solved, puzzle.id];
        setSolved(next);
        localStorage.setItem('builder_solved', JSON.stringify(next));
        const equipped = progressStore.get().implantsEquipped;
        const finalXp = applyXpBonus(puzzle.xp, equipped);
        gainXp('builder', finalXp, Math.floor(finalXp / 4));
        progressStore.recordBuilderSolved(puzzle.id);
        pushNotif({
          type: 'system',
          title: `Задача "${puzzle.title}" решена!`,
          body: `+${finalXp} XP${finalXp !== puzzle.xp ? ' (имплант)' : ''}`,
          icon: '🧩',
          color: '#00ff41',
        });
      }
    } else {
      setResult('fail');
    }
  };

  // ─── Выбор задачи ───
  if (!puzzle) {
    return (
      <section className="py-8 px-4 lg:px-6 min-h-screen relative">
        <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="mb-6">
            <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-1">// VISUAL CODE · BLOCK MODE</div>
            <h2 className="font-orbitron text-2xl text-white">КОНСТРУКТОР <span className="text-cyber-magenta">КОДА</span></h2>
            <p className="font-mono text-xs text-gray-500 mt-1">Собирай программы из блоков. Никакой клавиатуры — только логика.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PUZZLES.map(p => {
              const done = solved.includes(p.id);
              const diff = DIFF_META[p.difficulty];
              return (
                <button key={p.id} onClick={() => startPuzzle(p.id)}
                  className="text-left p-5 border transition-all hover:-translate-y-0.5"
                  style={{ borderColor: done ? '#00ff4140' : diff.color + '30', backgroundColor: diff.color + '05' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-orbitron text-base font-black text-white">{p.title}</div>
                      <div className="font-mono text-[10px] mt-1" style={{ color: diff.color }}>{diff.label} · {p.palette.length} блоков</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {done && <div className="font-mono text-[10px] text-cyber-green mb-1">✓</div>}
                      <div className="font-orbitron text-sm text-cyber-magenta">+{p.xp} XP</div>
                    </div>
                  </div>
                  <p className="font-rajdhani text-sm text-gray-400">{p.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // ─── Рабочая зона ───
  return (
    <section className="py-8 px-4 lg:px-6 min-h-screen relative">
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setPuzzleId(null)} className="font-mono text-xs text-gray-500 hover:text-white">
            ← К задачам
          </button>
          <div className="text-center">
            <div className="font-orbitron text-base text-white">{puzzle.title}</div>
            <div className="font-mono text-[10px] text-gray-500 mt-0.5">{puzzle.desc}</div>
          </div>
          <button onClick={() => startPuzzle(puzzle.id)} className="font-mono text-xs text-yellow-400 hover:text-white">
            ↻ Сброс
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Палитра */}
          <div className="border border-white/10 p-4 bg-black/40">
            <div className="font-mono text-[10px] text-gray-500 mb-3 tracking-widest">// ПАЛИТРА БЛОКОВ</div>
            <div className="space-y-2 min-h-[200px]">
              {paletteBlocks.length === 0 && (
                <div className="font-mono text-xs text-gray-700 text-center py-12">Все блоки в работе</div>
              )}
              {paletteBlocks.map(b => (
                <button key={b.id} onClick={() => moveToWorkspace(b)}
                  className="w-full text-left p-3 font-mono text-sm border transition-all hover:-translate-x-1"
                  style={{ color: b.color, borderColor: b.color + '40', backgroundColor: b.color + '08' }}>
                  ▸ {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Рабочая зона */}
          <div className="border-2 p-4"
            style={{ borderColor: result === 'ok' ? '#00ff41' : result === 'fail' ? '#ff4060' : '#ffffff20', backgroundColor: '#050a0e' }}>
            <div className="font-mono text-[10px] text-gray-500 mb-3 tracking-widest">// ТВОЯ ПРОГРАММА</div>
            <div className="space-y-2 min-h-[200px]">
              {workspace.length === 0 && (
                <div className="font-mono text-xs text-gray-700 text-center py-12">
                  Кликни блок из палитры, чтобы добавить
                </div>
              )}
              {workspace.map((b, idx) => (
                <div key={b.id}
                  className="flex items-center gap-2 p-3 font-mono text-sm border"
                  style={{ color: b.color, borderColor: b.color + '40', backgroundColor: b.color + '08', marginLeft: (b.indent || 0) * 20 }}>
                  <span className="flex-1 truncate">{b.label}</span>
                  <button onClick={() => moveUp(idx)} className="text-gray-500 hover:text-white px-1" title="Вверх">↑</button>
                  <button onClick={() => moveDown(idx)} className="text-gray-500 hover:text-white px-1" title="Вниз">↓</button>
                  <button onClick={() => moveToPalette(b)} className="text-gray-500 hover:text-cyber-red px-1" title="Убрать">✕</button>
                </div>
              ))}
            </div>

            {/* Result */}
            {result === 'ok' && (
              <div className="mt-4 p-3 border border-cyber-green/40 bg-cyber-green/10 font-mono text-xs text-cyber-green">
                ✓ Программа собрана правильно! +{puzzle.xp} XP
              </div>
            )}
            {result === 'fail' && (
              <div className="mt-4 p-3 border border-cyber-red/40 bg-cyber-red/10 font-mono text-xs text-cyber-red">
                ✗ Что-то не так. Проверь порядок блоков.
              </div>
            )}

            <button onClick={check}
              disabled={workspace.length === 0}
              className="w-full mt-4 font-orbitron text-sm py-3 border-2 border-cyber-magenta text-cyber-magenta hover:bg-cyber-magenta/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              ▶ ЗАПУСТИТЬ
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}