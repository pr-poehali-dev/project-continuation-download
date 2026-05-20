import { useState } from 'react';
import { progress as progressStore } from '@/lib/progressStore';
import { pushNotif } from '@/components/Notifications';

interface Implant {
  id: string;
  name: string;
  icon: string;
  desc: string;
  bonus: string;
  color: string;
  rarity: 'common' | 'rare' | 'epic';
  xp: number;
  task: {
    spec: string;          // ТЗ на функцию
    template: string;      // шаблон с заготовкой
    keywords: string[];    // что должно быть в коде
    example: string;       // правильный пример
  };
}

const RARITY_META = {
  common: { label: 'Обычный',   color: '#888'    },
  rare:   { label: 'Редкий',    color: '#00aaff' },
  epic:   { label: 'Эпический', color: '#aa00ff' },
};

const IMPLANTS: Implant[] = [
  {
    id: 'speed_chip',
    name: 'Чип скорости',
    icon: '⚡',
    desc: 'Удваивает любой стат агента',
    bonus: '+SPEED ×2',
    color: '#00ff41',
    rarity: 'common',
    xp: 80,
    task: {
      spec: 'Напиши функцию boost(stat), которая возвращает stat умноженный на 2',
      template: 'def boost(stat):\n    # твой код тут\n    pass\n\nprint(boost(5))  # должно быть 10',
      keywords: ['def', 'boost', 'stat', 'return', '*', '2'],
      example: 'def boost(stat):\n    return stat * 2\n\nprint(boost(5))',
    },
  },
  {
    id: 'shield_mod',
    name: 'Модуль щита',
    icon: '🛡️',
    desc: 'Восстанавливает HP до максимума',
    bonus: '+HEAL FULL',
    color: '#00aaff',
    rarity: 'common',
    xp: 100,
    task: {
      spec: 'Функция heal(current, max_hp) возвращает max_hp (полное лечение)',
      template: 'def heal(current, max_hp):\n    # верни max_hp\n    pass\n\nprint(heal(20, 100))  # должно быть 100',
      keywords: ['def', 'heal', 'current', 'max_hp', 'return'],
      example: 'def heal(current, max_hp):\n    return max_hp\n\nprint(heal(20, 100))',
    },
  },
  {
    id: 'xp_doubler',
    name: 'Удвоитель XP',
    icon: '💎',
    desc: 'Принимает список XP и возвращает удвоенный',
    bonus: '+XP ×2',
    color: '#ffaa00',
    rarity: 'rare',
    xp: 160,
    task: {
      spec: 'Функция double_all(xps) принимает список и возвращает новый список где каждое число удвоено',
      template: 'def double_all(xps):\n    # используй list comprehension или цикл\n    pass\n\nprint(double_all([10, 20, 30]))  # [20, 40, 60]',
      keywords: ['def', 'double_all', 'xps', 'return', 'for', '*', '2'],
      example: 'def double_all(xps):\n    return [x * 2 for x in xps]\n\nprint(double_all([10, 20, 30]))',
    },
  },
  {
    id: 'guard_filter',
    name: 'Фильтр угроз',
    icon: '🔍',
    desc: 'Отбирает врагов выше определённого уровня',
    bonus: '+THREAT SCAN',
    color: '#ff00ff',
    rarity: 'rare',
    xp: 180,
    task: {
      spec: 'Функция filter_threats(levels, min_lvl) возвращает список тех, что >= min_lvl',
      template: 'def filter_threats(levels, min_lvl):\n    # верни элементы где число >= min_lvl\n    pass\n\nprint(filter_threats([1, 5, 10, 3, 8], 5))  # [5, 10, 8]',
      keywords: ['def', 'filter_threats', 'levels', 'min_lvl', 'return', 'for', 'if', '>='],
      example: 'def filter_threats(levels, min_lvl):\n    return [x for x in levels if x >= min_lvl]\n\nprint(filter_threats([1, 5, 10, 3, 8], 5))',
    },
  },
  {
    id: 'agent_core',
    name: 'Ядро Агента',
    icon: '🤖',
    desc: 'Класс с конструктором и методом',
    bonus: '+ELITE STATUS',
    color: '#aa00ff',
    rarity: 'epic',
    xp: 300,
    task: {
      spec: 'Создай класс Agent с __init__(self, name, level) и методом status() возвращающим f"[{level}] {name}"',
      template: 'class Agent:\n    # твой код тут\n    pass\n\nnova = Agent("Nova", 7)\nprint(nova.status())  # [7] Nova',
      keywords: ['class', 'Agent', 'def', '__init__', 'self', 'name', 'level', 'status', 'return', 'f"'],
      example: 'class Agent:\n    def __init__(self, name, level):\n        self.name = name\n        self.level = level\n    def status(self):\n        return f"[{self.level}] {self.name}"\n\nnova = Agent("Nova", 7)\nprint(nova.status())',
    },
  },
];

const STORAGE_KEY = 'workshop_crafted';

function loadCrafted(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function saveCrafted(arr: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

export default function CodeWorkshop() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [crafted, setCrafted] = useState<string[]>(loadCrafted());
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err' | 'hint'; text: string } | null>(null);
  const [showExample, setShowExample] = useState(false);

  const implant = IMPLANTS.find(i => i.id === selectedId);

  const startImplant = (id: string) => {
    const imp = IMPLANTS.find(i => i.id === id);
    if (!imp) return;
    setSelectedId(id);
    setCode(imp.task.template);
    setFeedback(null);
    setShowExample(false);
  };

  const tryCraft = () => {
    if (!implant) return;
    const lower = code.toLowerCase();
    const missing = implant.task.keywords.filter(k => !lower.includes(k.toLowerCase()));
    const passRatio = (implant.task.keywords.length - missing.length) / implant.task.keywords.length;

    if (passRatio < 0.8) {
      setFeedback({ type: 'err', text: `Не хватает: ${missing.slice(0, 3).join(', ')}` });
      return;
    }
    // Принят
    if (!crafted.includes(implant.id)) {
      const next = [...crafted, implant.id];
      setCrafted(next);
      saveCrafted(next);
      progressStore.recordXp(implant.xp);
      pushNotif({
        type: 'system',
        title: `Имплант "${implant.name}" создан!`,
        body: `${implant.bonus} · +${implant.xp} XP`,
        icon: implant.icon,
        color: implant.color,
      });
    }
    setFeedback({ type: 'ok', text: `Имплант "${implant.name}" собран! +${implant.xp} XP` });
  };

  // ─── Витрина ───
  if (!implant) {
    return (
      <section className="py-8 px-4 lg:px-6 min-h-screen relative">
        <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="mb-6">
            <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-1">// WORKSHOP · CODE-FORGED IMPLANTS</div>
            <h2 className="font-orbitron text-2xl text-white">МАСТЕРСКАЯ <span className="text-cyber-magenta">КОДА</span></h2>
            <p className="font-mono text-xs text-gray-500 mt-1">Напиши функцию по ТЗ — получи имплант. Знания превращаются в силу.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {IMPLANTS.map(imp => {
              const done = crafted.includes(imp.id);
              const rar = RARITY_META[imp.rarity];
              return (
                <button key={imp.id} onClick={() => startImplant(imp.id)}
                  className="text-left p-4 border transition-all hover:-translate-y-0.5 relative overflow-hidden"
                  style={{ borderColor: done ? '#00ff4140' : imp.color + '30', backgroundColor: imp.color + '06' }}>
                  <div className="flex items-start gap-3">
                    <div className="text-3xl flex-shrink-0" style={{ filter: done ? 'none' : 'grayscale(0.3)' }}>{imp.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-orbitron text-sm font-black text-white truncate">{imp.name}</div>
                        {done && <div className="font-mono text-[9px] text-cyber-green">✓</div>}
                      </div>
                      <div className="font-mono text-[9px] mt-0.5" style={{ color: rar.color }}>{rar.label}</div>
                      <div className="font-rajdhani text-xs text-gray-400 mt-1.5 line-clamp-2">{imp.desc}</div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="font-mono text-[10px]" style={{ color: imp.color }}>{imp.bonus}</div>
                        <div className="font-orbitron text-xs text-cyber-magenta">+{imp.xp} XP</div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // ─── Сборка импланта ───
  return (
    <section className="py-8 px-4 lg:px-6 min-h-screen relative">
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setSelectedId(null)} className="font-mono text-xs text-gray-500 hover:text-white">
            ← К имплантам
          </button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{implant.icon}</span>
            <div>
              <div className="font-orbitron text-base text-white">{implant.name}</div>
              <div className="font-mono text-[10px]" style={{ color: implant.color }}>{implant.bonus}</div>
            </div>
          </div>
          <div className="font-orbitron text-sm text-cyber-magenta">+{implant.xp} XP</div>
        </div>

        {/* ТЗ */}
        <div className="p-4 border border-white/10 bg-black/30 mb-4">
          <div className="font-mono text-[10px] text-gray-500 tracking-widest mb-2">// ТЕХЗАДАНИЕ</div>
          <p className="font-rajdhani text-base text-white">{implant.task.spec}</p>
        </div>

        {/* Редактор */}
        <div className="border-2 mb-3"
          style={{ borderColor: feedback?.type === 'ok' ? '#00ff41' : feedback?.type === 'err' ? '#ff4060' : implant.color + '40' }}>
          <div className="p-2 border-b border-white/10 bg-black/60 flex items-center justify-between">
            <div className="font-mono text-[10px] text-gray-500">implant.py</div>
            <button onClick={() => setShowExample(s => !s)} className="font-mono text-[10px] text-yellow-400 hover:text-white">
              {showExample ? 'СКРЫТЬ ПРИМЕР' : 'ПОКАЗАТЬ ПРИМЕР'}
            </button>
          </div>
          {showExample ? (
            <pre className="p-4 font-mono text-sm text-yellow-300 whitespace-pre-wrap bg-black/40 min-h-[180px]">
{implant.task.example}
            </pre>
          ) : (
            <textarea value={code} onChange={e => setCode(e.target.value)}
              spellCheck={false}
              className="w-full p-4 font-mono text-sm text-white bg-black/60 outline-none resize-y min-h-[180px]" />
          )}
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="p-3 border font-mono text-xs mb-3"
            style={{
              borderColor: feedback.type === 'ok' ? '#00ff4160' : '#ff406060',
              color: feedback.type === 'ok' ? '#00ff41' : '#ff4060',
              backgroundColor: feedback.type === 'ok' ? '#00ff4108' : '#ff406008',
            }}>
            {feedback.type === 'ok' ? '✓' : '✗'} {feedback.text}
          </div>
        )}

        {/* Action */}
        <button onClick={tryCraft}
          className="w-full font-orbitron text-sm py-3 border-2 transition-all hover:bg-white/5"
          style={{ borderColor: implant.color, color: implant.color }}>
          🔨 СОБРАТЬ ИМПЛАНТ
        </button>
      </div>
    </section>
  );
}
