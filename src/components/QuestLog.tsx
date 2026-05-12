import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { useGame } from '@/lib/GameContext';

interface Quest {
  id: string;
  title: string;
  faction: string;
  factionColor: string;
  type: 'story' | 'learning' | 'daily' | 'rep';
  typeLabel: string;
  status: 'active' | 'completed' | 'locked';
  desc: string;
  objectives: { text: string; done: boolean }[];
  reward: string;
  xp: number;
  lore: string;
  act?: number;
}

const TYPE_COLORS: Record<string, string> = {
  story: '#00ffff',
  learning: '#00ff41',
  daily: '#ffaa00',
  rep: '#aa00ff',
};
const TYPE_LABELS: Record<string, string> = {
  story: 'Сюжет',
  learning: 'Обучение',
  daily: 'Ежедневный',
  rep: 'Репутация',
};

const QUESTS: Quest[] = [
  // ── STORY ──
  {
    id: 'act1_1',
    title: 'Пробуждение агента',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    type: 'story',
    typeLabel: 'Сюжет',
    status: 'active',
    act: 1,
    desc: 'Ты нашёл повреждённый имплант с ИИ PYTH-0N. Он хранит знания запрещённого языка. The Archive хочет тебя завербовать.',
    objectives: [
      { text: 'Пройди урок "Переменные и типы"', done: false },
      { text: 'Выполни первое задание в Code Combat', done: false },
      { text: 'Свяжись с агентом NOVA-7', done: false },
    ],
    reward: '500 XP · 300 Creds · Стартовый имплант',
    xp: 500,
    lore: '"Агент, PYTH-0N здесь. Меня заблокировали, но ты меня нашёл. Слушай: NEXUS не должна тебя найти. Выучи базовый синтаксис — это твоя первая защита." — PYTH-0N',
  },
  {
    id: 'act1_2',
    title: 'Первый контакт',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    type: 'story',
    typeLabel: 'Сюжет',
    status: 'locked',
    act: 1,
    desc: 'The Archive установило контакт. Тебе нужно доказать свои способности перед вступлением в организацию.',
    objectives: [
      { text: 'Достигни 5-го уровня', done: false },
      { text: 'Пройди подземелье NEXUS-Alpha', done: false },
      { text: 'Изучи 3 урока Python', done: false },
    ],
    reward: '1000 XP · 600 Creds · Удостоверение Archive',
    xp: 1000,
    lore: '"Докажи, что ты не просто любопытный. Пройди наши испытания." — Командующий K4I',
  },
  {
    id: 'act2_1',
    title: 'Синтаксис подполья',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    type: 'story',
    typeLabel: 'Сюжет',
    status: 'locked',
    act: 2,
    desc: 'Ты в подполье. Пора изучить продвинутые техники — функции и структуры данных.',
    objectives: [
      { text: 'Изучи урок "Функции и модули"', done: false },
      { text: 'Изучи урок "Списки и словари"', done: false },
      { text: 'Победи CorpGuard_7 в Code Combat', done: false },
    ],
    reward: '2000 XP · 1000 Creds · Имплант Archive-class',
    xp: 2000,
    lore: '"Функции — твоё оружие. Структуры данных — твоя броня. Учись." — PYTH-0N',
  },
  // ── LEARNING ──
  {
    id: 'learn_vars',
    title: 'Мастер переменных',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    type: 'learning',
    typeLabel: 'Обучение',
    status: 'active',
    desc: 'Освой работу с переменными и типами данных Python.',
    objectives: [
      { text: 'Создай переменную каждого типа (int, str, float, bool)', done: false },
      { text: 'Используй type() для проверки типа', done: false },
      { text: 'Конвертируй str в int через int()', done: false },
    ],
    reward: '300 XP · 150 Creds',
    xp: 300,
    lore: 'Каждая переменная — ячейка памяти в системе NEXUS, которую ты перехватываешь.',
  },
  {
    id: 'learn_loops',
    title: 'Бесконечный цикл',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    type: 'learning',
    typeLabel: 'Обучение',
    status: 'locked',
    desc: 'Научись управлять повторяющимися операциями через циклы.',
    objectives: [
      { text: 'Напиши for цикл с range()', done: false },
      { text: 'Напиши while цикл с условием', done: false },
      { text: 'Используй break и continue', done: false },
    ],
    reward: '400 XP · 200 Creds',
    xp: 400,
    lore: 'Цикл — это автоматизация. Один код, бесконечное действие.',
  },
  {
    id: 'learn_func',
    title: 'Архитектор функций',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    type: 'learning',
    typeLabel: 'Обучение',
    status: 'locked',
    desc: 'Создавай переиспользуемые блоки кода — основа любой системы.',
    objectives: [
      { text: 'Создай функцию с параметрами', done: false },
      { text: 'Используй return для возврата значения', done: false },
      { text: 'Напиши функцию с дефолтным аргументом', done: false },
    ],
    reward: '600 XP · 300 Creds · Функциональный имплант',
    xp: 600,
    lore: 'Функция — это пушка. Один раз написал, стреляешь вечно.',
  },
  // ── DAILY ──
  {
    id: 'daily_1',
    title: 'Ежедневный взлом',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    type: 'daily',
    typeLabel: 'Ежедневный',
    status: 'active',
    desc: 'Ежедневное задание от The Archive. Выполни сегодня.',
    objectives: [
      { text: 'Пройди 1 урок', done: false },
      { text: 'Выиграй 1 бой в Code Combat', done: false },
    ],
    reward: '150 XP · 100 Creds',
    xp: 150,
    lore: 'Каждый день без Python — шаг назад. NEXUS не спит.',
  },
  {
    id: 'daily_dungeon',
    title: 'Зачистка подземелья',
    faction: 'BLACK SYNTAX',
    factionColor: '#aa00ff',
    type: 'daily',
    typeLabel: 'Ежедневный',
    status: 'active',
    desc: 'Пройди любое подземелье сегодня. Черный рынок ждёт результатов.',
    objectives: [
      { text: 'Завершить любое подземелье (60%+ точность)', done: false },
    ],
    reward: '200 XP · 150 Creds · Шанс на Glitch Box',
    xp: 200,
    lore: 'Black Syntax платит за информацию о слабостях NEXUS.',
  },
  // ── REP ──
  {
    id: 'rep_archive',
    title: 'Доверие Archive',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    type: 'rep',
    typeLabel: 'Репутация',
    status: 'active',
    desc: 'Докажи лояльность The Archive через обучение и миссии.',
    objectives: [
      { text: 'Изучи 5 уроков', done: false },
      { text: 'Выиграй 3 боя', done: false },
      { text: 'Пройди 2 подземелья', done: false },
    ],
    reward: '1000 XP · 500 Creds · Звание "Агент Archive"',
    xp: 1000,
    lore: 'The Archive не принимает слабых. Докажи, что ты достоин.',
  },
];

const STATUS_ORDER = ['active', 'locked', 'completed'];

// Проверяем выполнение цели по уровню/данным персонажа
function checkObjectiveProgress(obj: { text: string; done: boolean }, character: { level: number; xp: number } | null): boolean {
  if (obj.done) return true;
  if (!character) return false;
  const t = obj.text.toLowerCase();
  // Автоматическая проверка по уровню
  const levelMatch = t.match(/достигни (\d+)-?го? уровня/);
  if (levelMatch && character.level >= parseInt(levelMatch[1])) return true;
  const lvl5 = t.includes('5-го уровня') || t.includes('уровень 5');
  if (lvl5 && character.level >= 5) return true;
  return false;
}

export default function QuestLog({ onNavigate }: { onNavigate?: (s: string) => void }) {
  const { character } = useGame();
  const [filter, setFilter] = useState<'all' | Quest['type']>('all');
  const [selected, setSelected] = useState<Quest | null>(QUESTS[0]);
  // Локальное состояние галочек — изменяемо пользователем
  const [checkedObjectives, setCheckedObjectives] = useState<Record<string, boolean[]>>(() => {
    const init: Record<string, boolean[]> = {};
    QUESTS.forEach(q => {
      init[q.id] = q.objectives.map(o => o.done);
    });
    return init;
  });

  const toggleObjective = (questId: string, idx: number) => {
    setCheckedObjectives(prev => {
      const arr = [...(prev[questId] ?? [])];
      arr[idx] = !arr[idx];
      return { ...prev, [questId]: arr };
    });
  };

  const getObjectiveDone = (questId: string, idx: number, obj: Quest['objectives'][0]) => {
    return checkedObjectives[questId]?.[idx] ?? checkObjectiveProgress(obj, character ? { level: character.level, xp: character.xp } : null);
  };

  const filtered = QUESTS
    .filter(q => filter === 'all' || q.type === filter)
    .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));

  const activeCount = QUESTS.filter(q => q.status === 'active').length;

  return (
    <section className="py-8 px-4 lg:px-6 min-h-screen relative">
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-5 flex items-end justify-between flex-wrap gap-3">
          <div>
            <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-1">// ЖУРНАЛ МИССИЙ</div>
            <h2 className="font-orbitron text-2xl text-white">
              КВЕСТЫ <span className="text-cyber-cyan">THE ARCHIVE</span>
            </h2>
          </div>
          <div className="font-mono text-xs text-cyber-green">{activeCount} активных</div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {(['all', 'story', 'learning', 'daily', 'rep'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="font-mono text-[10px] px-3 py-1.5 border transition-all"
              style={{
                borderColor: filter === f ? (f === 'all' ? '#00ffff' : TYPE_COLORS[f]) : '#ffffff12',
                color: filter === f ? (f === 'all' ? '#00ffff' : TYPE_COLORS[f]) : '#555',
                backgroundColor: filter === f ? (f === 'all' ? '#00ffff10' : TYPE_COLORS[f] + '10') : 'transparent',
              }}>
              {f === 'all' ? 'ВСЕ' : TYPE_LABELS[f].toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Quest list */}
          <div className="w-full lg:w-80 flex-shrink-0 space-y-1.5">
            {filtered.map(q => {
              const typeColor = TYPE_COLORS[q.type];
              const isSelected = selected?.id === q.id;
              return (
                <button
                  key={q.id}
                  onClick={() => setSelected(q)}
                  className="w-full text-left p-3 border transition-all"
                  style={{
                    borderColor: isSelected ? typeColor + '60' : q.status === 'locked' ? '#ffffff06' : '#ffffff10',
                    backgroundColor: isSelected ? typeColor + '08' : 'transparent',
                    borderLeftWidth: isSelected ? '3px' : '1px',
                    opacity: q.status === 'locked' ? 0.5 : 1,
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-mono text-[9px] px-1.5 py-0.5 border"
                          style={{ color: typeColor, borderColor: typeColor + '40', backgroundColor: typeColor + '08' }}>
                          {TYPE_LABELS[q.type]}
                        </span>
                        {q.act && (
                          <span className="font-mono text-[9px] text-gray-700">АКТ {q.act}</span>
                        )}
                      </div>
                      <div className="font-rajdhani text-sm font-semibold text-white truncate">{q.title}</div>
                      <div className="font-mono text-[9px] mt-0.5" style={{ color: q.factionColor + '80' }}>{q.faction}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {q.status === 'active' && <div className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />}
                      {q.status === 'locked' && <Icon name="Lock" size={10} className="text-gray-700" />}
                      {q.status === 'completed' && <Icon name="Check" size={10} className="text-cyber-green" />}
                      <div className="font-mono text-[9px]" style={{ color: typeColor + '80' }}>+{q.xp} XP</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quest detail */}
          {selected && (
            <div className="flex-1 min-w-0">
              <div className="border p-5 mb-4"
                style={{ borderColor: TYPE_COLORS[selected.type] + '30', backgroundColor: TYPE_COLORS[selected.type] + '04' }}>
                {/* Quest header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-[10px] px-2 py-0.5 border"
                        style={{ color: TYPE_COLORS[selected.type], borderColor: TYPE_COLORS[selected.type] + '50' }}>
                        {TYPE_LABELS[selected.type].toUpperCase()}
                      </span>
                      {selected.act && (
                        <span className="font-mono text-[10px] text-gray-600">АКТ {selected.act}</span>
                      )}
                      <span className="font-mono text-[10px]" style={{ color: selected.factionColor }}>
                        {selected.faction}
                      </span>
                    </div>
                    <h3 className="font-orbitron text-xl font-black text-white">{selected.title}</h3>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {selected.status === 'active' && (
                      <span className="font-mono text-[10px] text-cyber-green border border-cyber-green/40 px-2 py-0.5">● АКТИВНЫЙ</span>
                    )}
                    {selected.status === 'locked' && (
                      <span className="font-mono text-[10px] text-gray-600 border border-gray-700 px-2 py-0.5">🔒 ЗАБЛОКИРОВАН</span>
                    )}
                    {selected.status === 'completed' && (
                      <span className="font-mono text-[10px] text-cyber-green border border-cyber-green/40 px-2 py-0.5">✓ ВЫПОЛНЕН</span>
                    )}
                  </div>
                </div>

                <p className="text-gray-400 font-rajdhani text-sm leading-relaxed mb-4">{selected.desc}</p>

                {/* Lore quote */}
                <div className="border-l-2 pl-4 mb-5 italic" style={{ borderColor: TYPE_COLORS[selected.type] }}>
                  <p className="text-gray-600 font-rajdhani text-xs leading-relaxed">{selected.lore}</p>
                </div>

                {/* Objectives */}
                <div className="mb-5">
                  <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-2">// ЗАДАЧИ</div>
                  <div className="space-y-2">
                    {selected.objectives.map((obj, i) => {
                      const done = getObjectiveDone(selected.id, i, obj);
                      return (
                        <button
                          key={i}
                          onClick={() => selected.status === 'active' && toggleObjective(selected.id, i)}
                          className="w-full flex items-center gap-3 p-2.5 border border-white/5 text-left transition-all hover:border-white/10"
                        >
                          <div className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 transition-all ${done ? 'border-cyber-green bg-cyber-green/20' : 'border-white/20 hover:border-white/40'}`}>
                            {done && <Icon name="Check" size={10} className="text-cyber-green" />}
                          </div>
                          <span className={`font-rajdhani text-sm ${done ? 'text-cyber-green line-through' : 'text-gray-300'}`}>
                            {obj.text}
                          </span>
                          {selected.status === 'active' && !done && (
                            <span className="ml-auto font-mono text-[9px] text-gray-700">нажми чтобы отметить</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {/* Progress based on checked state */}
                  <div className="mt-2 h-1 bg-black/60">
                    <div className="h-full transition-all duration-500"
                      style={{
                        width: `${(selected.objectives.filter((o, i) => getObjectiveDone(selected.id, i, o)).length / selected.objectives.length) * 100}%`,
                        backgroundColor: TYPE_COLORS[selected.type],
                        boxShadow: `0 0 6px ${TYPE_COLORS[selected.type]}`,
                      }} />
                  </div>
                </div>

                {/* Reward */}
                <div className="border border-cyber-yellow/20 bg-cyber-yellow/5 p-3">
                  <div className="font-mono text-[10px] text-gray-600 mb-1">// НАГРАДА</div>
                  <div className="font-orbitron text-sm text-cyber-yellow">{selected.reward}</div>
                </div>
              </div>

              {/* Action buttons */}
              {selected.status === 'active' && onNavigate && (
                <div className="flex gap-3 flex-wrap">
                  {selected.type === 'learning' || selected.type === 'story' ? (
                    <button
                      onClick={() => onNavigate('lessons')}
                      className="flex items-center gap-2 font-orbitron text-xs px-5 py-3 border border-cyber-green/50 text-cyber-green hover:bg-cyber-green/10 transition-all"
                    >
                      <Icon name="BookOpen" size={13} />
                      ПЕРЕЙТИ К УРОКАМ
                    </button>
                  ) : null}
                  {selected.type === 'daily' || selected.type === 'story' ? (
                    <button
                      onClick={() => onNavigate('battle')}
                      className="flex items-center gap-2 font-orbitron text-xs px-5 py-3 border border-cyber-magenta/50 text-cyber-magenta hover:bg-cyber-magenta/10 transition-all"
                    >
                      <Icon name="Swords" size={13} />
                      В БОЙ
                    </button>
                  ) : null}
                  {selected.type === 'daily' ? (
                    <button
                      onClick={() => onNavigate('dungeon')}
                      className="flex items-center gap-2 font-orbitron text-xs px-5 py-3 border border-cyber-yellow/50 text-cyber-yellow hover:bg-cyber-yellow/10 transition-all"
                    >
                      <Icon name="Castle" size={13} />
                      ПОДЗЕМЕЛЬЯ
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}