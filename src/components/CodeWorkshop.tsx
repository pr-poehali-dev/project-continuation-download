import { useState, useEffect } from 'react';
import { progress as progressStore } from '@/lib/progressStore';
import { useProgress } from '@/lib/useProgress';
import { pushNotif } from '@/components/Notifications';
import { applyXpBonus } from '@/lib/implants';
import { checkStructure, type StructureCheck } from '@/lib/codeCheck';
import { IMPLANTS as IMPLANT_DEFS } from '@/lib/implants';

interface ImplantTask {
  spec: string;
  template: string;
  example: string;
  check: StructureCheck;
}

const TASKS: Record<string, ImplantTask> = {
  speed_chip: {
    spec: 'Напиши функцию boost(stat), которая возвращает stat умноженный на 2',
    template: 'def boost(stat):\n    # твой код тут\n    pass\n\nprint(boost(5))  # должно быть 10',
    example: 'def boost(stat):\n    return stat * 2\n\nprint(boost(5))',
    check: {
      defName: 'boost',
      needsReturn: true,
      patterns: [
        { re: /return\s+stat\s*\*\s*2/, hint: 'return stat * 2' },
      ],
    },
  },
  shield_mod: {
    spec: 'Функция heal(current, max_hp) возвращает max_hp (полное лечение)',
    template: 'def heal(current, max_hp):\n    # верни max_hp\n    pass\n\nprint(heal(20, 100))  # должно быть 100',
    example: 'def heal(current, max_hp):\n    return max_hp\n\nprint(heal(20, 100))',
    check: {
      defName: 'heal',
      needsReturn: true,
      patterns: [
        { re: /return\s+max_hp/, hint: 'return max_hp' },
      ],
    },
  },
  xp_doubler: {
    spec: 'Функция double_all(xps) принимает список и возвращает новый список где каждое число удвоено',
    template: 'def double_all(xps):\n    # цикл или list comprehension\n    pass\n\nprint(double_all([10, 20, 30]))  # [20, 40, 60]',
    example: 'def double_all(xps):\n    return [x * 2 for x in xps]\n\nprint(double_all([10, 20, 30]))',
    check: {
      defName: 'double_all',
      needsReturn: true,
      patterns: [
        { re: /for\s+\w+\s+in\s+xps/, hint: 'for x in xps' },
        { re: /\*\s*2/, hint: '* 2' },
      ],
    },
  },
  guard_filter: {
    spec: 'Функция filter_threats(levels, min_lvl) возвращает список тех, что >= min_lvl',
    template: 'def filter_threats(levels, min_lvl):\n    # верни элементы где число >= min_lvl\n    pass\n\nprint(filter_threats([1, 5, 10, 3, 8], 5))  # [5, 10, 8]',
    example: 'def filter_threats(levels, min_lvl):\n    return [x for x in levels if x >= min_lvl]\n\nprint(filter_threats([1, 5, 10, 3, 8], 5))',
    check: {
      defName: 'filter_threats',
      needsReturn: true,
      patterns: [
        { re: /for\s+\w+\s+in\s+levels/, hint: 'for x in levels' },
        { re: />=\s*min_lvl/, hint: '>= min_lvl' },
      ],
    },
  },
  agent_core: {
    spec: 'Класс Agent с __init__(self, name, level) и методом status() возвращающим f"[{level}] {name}"',
    template: 'class Agent:\n    # твой код тут\n    pass\n\nnova = Agent("Nova", 7)\nprint(nova.status())  # [7] Nova',
    example: 'class Agent:\n    def __init__(self, name, level):\n        self.name = name\n        self.level = level\n    def status(self):\n        return f"[{self.level}] {self.name}"\n\nnova = Agent("Nova", 7)\nprint(nova.status())',
    check: {
      needsReturn: true,
      patterns: [
        { re: /class\s+agent\s*:/, hint: 'class Agent:' },
        { re: /def\s+__init__\s*\(self\s*,\s*name\s*,\s*level\)/, hint: 'def __init__(self, name, level)' },
        { re: /self\.name\s*=\s*name/, hint: 'self.name = name' },
        { re: /self\.level\s*=\s*level/, hint: 'self.level = level' },
        { re: /def\s+status\s*\(self\)/, hint: 'def status(self)' },
        { re: /return\s+f["']\[/, hint: 'return f"[...]..."' },
      ],
    },
  },
};

const RARITY_META = {
  common: { label: 'Обычный',   color: '#888'    },
  rare:   { label: 'Редкий',    color: '#00aaff' },
  epic:   { label: 'Эпический', color: '#aa00ff' },
};

const MAX_SLOTS = 3;

export default function CodeWorkshop() {
  const prog = useProgress();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [showExample, setShowExample] = useState(false);
  const [showEquipped, setShowEquipped] = useState(false);

  const implant = selectedId ? IMPLANT_DEFS.find(i => i.id === selectedId) : null;
  const task = selectedId ? TASKS[selectedId] : null;

  useEffect(() => {
    setFeedback(null);
    setShowExample(false);
    if (task) setCode(task.template);
  }, [selectedId, task]);

  const tryCraft = () => {
    if (!implant || !task) return;
    const res = checkStructure(code, task.check);
    if (!res.ok) {
      const miss = res.missing.slice(0, 3).join(' · ');
      setFeedback({ type: 'err', text: `Не хватает: ${miss}` });
      return;
    }
    if (!prog.implantsCrafted.includes(implant.id)) {
      progressStore.recordImplantCrafted(implant.id);
      const finalXp = applyXpBonus(implant.xp, prog.implantsEquipped);
      progressStore.recordXp(finalXp);
      pushNotif({
        type: 'system',
        title: `Имплант "${implant.name}" создан!`,
        body: `${implant.bonus} · +${finalXp} XP`,
        icon: implant.icon,
        color: implant.color,
      });
    }
    setFeedback({ type: 'ok', text: `Имплант "${implant.name}" собран! Надень его на вкладке "Слоты".` });
  };

  const toggleEquip = (id: string) => {
    const res = progressStore.toggleImplantEquipped(id, MAX_SLOTS);
    if (!res.ok) {
      pushNotif({ type: 'system', title: 'Слоты заняты', body: res.reason || '', icon: '⚠️', color: '#ffaa00' });
    }
  };

  // ─── Витрина имплантов ───
  if (!implant) {
    return (
      <section className="py-8 px-4 lg:px-6 min-h-screen relative">
        <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-1">// WORKSHOP · CODE-FORGED IMPLANTS</div>
              <h2 className="font-orbitron text-2xl text-white">МАСТЕРСКАЯ <span className="text-cyber-magenta">КОДА</span></h2>
              <p className="font-mono text-xs text-gray-500 mt-1">Напиши функцию по ТЗ — получи имплант. Активируй до {MAX_SLOTS} штук для бонусов.</p>
            </div>
            <button onClick={() => setShowEquipped(s => !s)}
              className="font-orbitron text-xs px-4 py-2 border border-cyber-magenta text-cyber-magenta hover:bg-cyber-magenta/10 whitespace-nowrap">
              СЛОТЫ {prog.implantsEquipped.length}/{MAX_SLOTS}
            </button>
          </div>

          {/* Equipped panel */}
          {showEquipped && (
            <div className="mb-6 p-4 border-2 border-cyber-magenta/40 bg-cyber-magenta/5">
              <div className="font-mono text-[10px] text-gray-500 tracking-widest mb-3">// АКТИВНЫЕ ИМПЛАНТЫ</div>
              {prog.implantsCrafted.length === 0 && (
                <div className="font-mono text-xs text-gray-600">Сначала собери хотя бы один имплант ниже.</div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {prog.implantsCrafted.map(id => {
                  const imp = IMPLANT_DEFS.find(i => i.id === id);
                  if (!imp) return null;
                  const isEq = prog.implantsEquipped.includes(id);
                  return (
                    <button key={id} onClick={() => toggleEquip(id)}
                      className="flex items-center gap-2 p-2 border text-left transition-all"
                      style={{
                        borderColor: isEq ? imp.color : imp.color + '30',
                        backgroundColor: isEq ? imp.color + '15' : 'transparent',
                      }}>
                      <span className="text-2xl">{imp.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-orbitron text-xs font-black text-white truncate">{imp.name}</div>
                        <div className="font-mono text-[9px]" style={{ color: imp.color }}>{imp.bonus}</div>
                      </div>
                      <div className="font-mono text-[10px]" style={{ color: isEq ? '#00ff41' : '#666' }}>
                        {isEq ? '● ON' : '○ OFF'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {IMPLANT_DEFS.map(imp => {
              const done = prog.implantsCrafted.includes(imp.id);
              const equipped = prog.implantsEquipped.includes(imp.id);
              const rar = RARITY_META[imp.rarity];
              return (
                <div key={imp.id} className="relative">
                  <button onClick={() => setSelectedId(imp.id)}
                    className="w-full text-left p-4 border transition-all hover:-translate-y-0.5"
                    style={{ borderColor: equipped ? imp.color : done ? '#00ff4140' : imp.color + '30', backgroundColor: imp.color + '06' }}>
                    <div className="flex items-start gap-3">
                      <div className="text-3xl flex-shrink-0">{imp.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-orbitron text-sm font-black text-white truncate">{imp.name}</div>
                          {equipped && <div className="font-mono text-[9px] text-cyber-magenta">● ON</div>}
                          {!equipped && done && <div className="font-mono text-[9px] text-cyber-green">✓</div>}
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
                  {done && (
                    <button onClick={() => toggleEquip(imp.id)}
                      className="absolute bottom-2 right-2 font-mono text-[10px] px-2 py-1 border"
                      style={{
                        color: equipped ? imp.color : '#888',
                        borderColor: equipped ? imp.color : '#444',
                        backgroundColor: '#000a',
                      }}>
                      {equipped ? 'СНЯТЬ' : 'НАДЕТЬ'}
                    </button>
                  )}
                </div>
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

        <div className="p-4 border border-white/10 bg-black/30 mb-4">
          <div className="font-mono text-[10px] text-gray-500 tracking-widest mb-2">// ТЕХЗАДАНИЕ</div>
          <p className="font-rajdhani text-base text-white">{task?.spec}</p>
        </div>

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
{task?.example}
            </pre>
          ) : (
            <textarea value={code} onChange={e => setCode(e.target.value)}
              spellCheck={false}
              className="w-full p-4 font-mono text-sm text-white bg-black/60 outline-none resize-y min-h-[180px]" />
          )}
        </div>

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

        <button onClick={tryCraft}
          className="w-full font-orbitron text-sm py-3 border-2 transition-all hover:bg-white/5"
          style={{ borderColor: implant.color, color: implant.color }}>
          🔨 СОБРАТЬ ИМПЛАНТ
        </button>
      </div>
    </section>
  );
}