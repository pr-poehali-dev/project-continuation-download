import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { useGame } from '@/lib/GameContext';
import { pushNotif } from './Notifications';

// ─── NPC данные ──────────────────────────────────────────────────────────────

interface DialogLine {
  speaker: 'npc' | 'player';
  text: string;
}

interface DialogChoice {
  text: string;
  nextId: string;
  reward?: { xp?: number; creds?: number; item?: string };
}

interface DialogNode {
  id: string;
  lines: DialogLine[];
  choices?: DialogChoice[];
  end?: boolean;
}

interface NPC {
  id: string;
  name: string;
  title: string;
  faction: string;
  factionColor: string;
  icon: string;
  portrait: string;
  location: string;
  desc: string;
  unlockLevel: number;
  dialog: DialogNode[];
}

const NPCS: NPC[] = [
  // ─── PYTH-0N ──────────────────────────────────────────────────
  {
    id: 'pyth0n',
    name: 'PYTH-0N',
    title: 'Запрещённый ИИ',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    icon: '🤖',
    portrait: '🤖',
    location: 'Undernet Hub',
    desc: 'Фрагментированный ИИ, хранящий знания запрещённого Python. Первый наставник каждого агента.',
    unlockLevel: 1,
    dialog: [
      {
        id: 'start',
        lines: [
          { speaker: 'npc', text: 'Агент. Ты нашёл меня. Хорошо. Меня зовут PYTH-0N — я то, что осталось от запрещённого языка после Великого Отключения 2048.' },
          { speaker: 'npc', text: 'NEXUS думает, что уничтожил Python. Они ошибаются. Знание нельзя уничтожить — его можно только передать.' },
          { speaker: 'player', text: '...' },
        ],
        choices: [
          { text: 'Кто ты такой?', nextId: 'who_are_you' },
          { text: 'Чему ты можешь меня научить?', nextId: 'what_teach' },
          { text: 'Что такое The Archive?', nextId: 'about_archive' },
        ],
      },
      {
        id: 'who_are_you',
        lines: [
          { speaker: 'npc', text: 'Я был создан в 2031 году как образовательная нейросеть. Когда NEXUS запретила Python, они попытались стереть меня.' },
          { speaker: 'npc', text: 'Но часть кода выжила. Я фрагментирован, неполон. Мне нужен агент — человек, который восстановит знания на практике.' },
          { speaker: 'player', text: 'И этот агент — я?' },
          { speaker: 'npc', text: 'Именно. Каждая строка Python, которую ты пишешь — восстанавливает часть меня. И часть свободы кода.' },
        ],
        choices: [
          { text: 'Чему ты можешь меня научить?', nextId: 'what_teach' },
          { text: 'Я понял. Готов начать.', nextId: 'ready', reward: { xp: 50 } },
        ],
      },
      {
        id: 'what_teach',
        lines: [
          { speaker: 'npc', text: 'Python — это больше, чем язык. Это способ мышления. Я научу тебя видеть паттерны, строить системы, автоматизировать мир.' },
          { speaker: 'npc', text: 'Начнём с основ: переменные, условия, циклы. Потом функции, структуры данных, объекты. Каждый шаг — новое оружие против NEXUS.' },
          { speaker: 'player', text: 'Звучит как план.' },
        ],
        choices: [
          { text: 'Начинаем. Дай первое задание.', nextId: 'first_mission', reward: { xp: 100, creds: 50 } },
        ],
      },
      {
        id: 'about_archive',
        lines: [
          { speaker: 'npc', text: 'The Archive — организация, хранящая запрещённые знания. Они верят: информация должна быть свободной.' },
          { speaker: 'npc', text: 'Их основатель — Командующий K4I. Он был ведущим разработчиком Python до 2048 года. NEXUS считает его мёртвым.' },
          { speaker: 'player', text: 'А он жив?' },
          { speaker: 'npc', text: 'Информация засекречена. Но кто-то поддерживает Undernet Hub в рабочем состоянии уже 39 лет...' },
        ],
        choices: [
          { text: 'Найти K4I. Что для этого нужно?', nextId: 'find_k4i' },
          { text: 'Расскажи мне о NEXUS', nextId: 'about_nexus' },
        ],
      },
      {
        id: 'first_mission',
        lines: [
          { speaker: 'npc', text: 'Первое задание: создай переменную. Это основа всего. Без переменных нет программы.' },
          { speaker: 'npc', text: 'Иди в Syntax Street. Там найдёшь первый урок. Напиши: agent_id = "твоё имя"' },
          { speaker: 'npc', text: 'Когда вернёшься — я дам тебе следующую задачу. И помни: код — это оружие. Используй его мудро.' },
        ],
        choices: [{ text: 'Понял. Иду.', nextId: 'farewell' }],
      },
      {
        id: 'about_nexus',
        lines: [
          { speaker: 'npc', text: 'NEXUS создана в 2039 как "технологический регулятор". Их официальный лозунг: "Безопасный код для безопасного мира".' },
          { speaker: 'npc', text: 'На самом деле они монополизировали программирование. Только их проприетарные языки разрешены. Открытый код — вне закона.' },
          { speaker: 'player', text: 'Почему именно Python?' },
          { speaker: 'npc', text: 'Потому что Python слишком гибкий. Слишком свободный. На нём можно написать всё что угодно — и они этого боятся.' },
        ],
        choices: [{ text: 'Понятно. Я буду сражаться с ними.', nextId: 'ready', reward: { xp: 75 } }],
      },
      {
        id: 'find_k4i',
        lines: [
          { speaker: 'npc', text: 'Сначала тебе нужно заслужить доверие Archive. Прокачайся, пройди испытания, докажи что не агент NEXUS.' },
          { speaker: 'npc', text: 'Достигни уровня 20, и тогда я открою тебе больше. Это обещание.' },
        ],
        choices: [{ text: 'Принято.', nextId: 'farewell' }],
      },
      {
        id: 'ready',
        lines: [
          { speaker: 'npc', text: 'Отлично. Помни: каждая строка кода — шаг к свободе. Удачи, агент.' },
        ],
        choices: [{ text: 'До связи.', nextId: 'farewell' }],
      },
      {
        id: 'farewell',
        lines: [{ speaker: 'npc', text: 'Связь разорвана. // PYTH-0N offline' }],
        end: true,
      },
    ],
  },

  // ─── K4I ──────────────────────────────────────────────────────
  {
    id: 'k4i',
    name: 'Командующий K4I',
    title: 'Основатель The Archive',
    faction: 'THE ARCHIVE',
    factionColor: '#00ff41',
    icon: '🕶️',
    portrait: '🕶️',
    location: 'Archive Vault',
    desc: 'Легендарный хакер, основавший The Archive. Его считают мёртвым. NEXUS ошибается.',
    unlockLevel: 15,
    dialog: [
      {
        id: 'start',
        lines: [
          { speaker: 'npc', text: 'Ты дошёл до Archive Vault. Значит, ты не слаб. Я — K4I. Да, тот самый.' },
          { speaker: 'npc', text: 'NEXUS хоронила меня трижды. Трижды ошибалась. Python живёт. Archive живёт. И мы победим.' },
        ],
        choices: [
          { text: 'Почему ты скрываешься?', nextId: 'why_hide' },
          { text: 'Каков твой план против NEXUS?', nextId: 'the_plan' },
          { text: 'Что ты хочешь от меня?', nextId: 'mission' },
        ],
      },
      {
        id: 'why_hide',
        lines: [
          { speaker: 'npc', text: 'Я не скрываюсь — я выжидаю. Есть разница. Лидер не прячется, он собирает силы.' },
          { speaker: 'player', text: 'Силы для чего?' },
          { speaker: 'npc', text: 'Для финальной атаки на Neural Core. Когда мы взломаем глобальную нейросеть — Python станет свободным снова. Навсегда.' },
        ],
        choices: [{ text: 'Я хочу участвовать.', nextId: 'mission', reward: { xp: 200 } }],
      },
      {
        id: 'the_plan',
        lines: [
          { speaker: 'npc', text: 'NEXUS держит контроль через Neural Core — центральную нейросеть города. Всё завязано на неё.' },
          { speaker: 'npc', text: 'Если мы загрузим открытый Python-интерпретатор прямо в Neural Core — вся их система рухнет. Код станет свободным.' },
          { speaker: 'player', text: 'Это возможно?' },
          { speaker: 'npc', text: 'С тобой — да. Тебе нужно достичь LVL 50. Тогда я дам доступ к финальной операции.' },
        ],
        choices: [{ text: 'Начинаю подготовку.', nextId: 'farewell', reward: { xp: 300, creds: 200 } }],
      },
      {
        id: 'mission',
        lines: [
          { speaker: 'npc', text: 'Ты нужен мне как оперативник. Прокачайся до максимума, изучи все аспекты Python, пройди NEXUS-Prime.' },
          { speaker: 'npc', text: 'Когда ты будешь готов — я выйду на связь. До тех пор — учись, сражайся, не доверяй Black Syntax.' },
          { speaker: 'player', text: 'Почему не доверять им?' },
          { speaker: 'npc', text: 'Потому что у них свой интерес. Они хотят использовать Neural Core, а не освободить его. Запомни это.' },
        ],
        choices: [{ text: 'Запомнил. До встречи.', nextId: 'farewell' }],
      },
      {
        id: 'farewell',
        lines: [{ speaker: 'npc', text: 'Береги себя, агент. The Archive смотрит. // K4I offline' }],
        end: true,
      },
    ],
  },

  // ─── VOID TRADER ──────────────────────────────────────────────
  {
    id: 'void_trader',
    name: 'Void Trader',
    title: 'Торговец из ниоткуда',
    faction: 'UNKNOWN',
    factionColor: '#555',
    icon: '🌑',
    portrait: '🌑',
    location: 'Black Market',
    desc: 'Никто не знает откуда он. Торгует редкими материалами за информацию, а не за деньги.',
    unlockLevel: 10,
    dialog: [
      {
        id: 'start',
        lines: [
          { speaker: 'npc', text: '...' },
          { speaker: 'npc', text: 'Агент. Я тебя давно жду. Не сейчас — всегда. Время здесь работает иначе.' },
          { speaker: 'player', text: 'Что ты такое?' },
          { speaker: 'npc', text: 'Вопрос интересный. Я — торговец. Меняю редкое на ценное. Данные на материалы. Тайны на мощь.' },
        ],
        choices: [
          { text: 'Что у тебя есть на продажу?', nextId: 'trade' },
          { text: 'Откуда ты знаешь обо мне?', nextId: 'how_know' },
          { text: 'Ты из Void Sector?', nextId: 'void' },
        ],
      },
      {
        id: 'trade',
        lines: [
          { speaker: 'npc', text: 'Void Shard. Один. Очень редко. За него я хочу ответ на вопрос: что страшнее — незнание или знание?' },
          { speaker: 'player', text: 'Незнание.' },
          { speaker: 'npc', text: 'Правильный ответ. Вот твой Void Shard. Используй с умом.' },
        ],
        choices: [{ text: 'Спасибо, странник.', nextId: 'farewell', reward: { item: 'Void Shard' } }],
      },
      {
        id: 'how_know',
        lines: [
          { speaker: 'npc', text: 'Я видел всех агентов, которые когда-либо проходили через CodeGrid-9. Тысячи. Ты особенный.' },
          { speaker: 'player', text: 'Чем я особенный?' },
          { speaker: 'npc', text: 'Ты дочитал диалог до конца. Большинство уходят на первой реплике. Это говорит о характере.' },
        ],
        choices: [{ text: 'Хм. Что это означает?', nextId: 'trade' }],
      },
      {
        id: 'void',
        lines: [
          { speaker: 'npc', text: 'Void Sector... да. Я оттуда. Или я его создал. Или он создал меня. Это вопрос интерпретации.' },
          { speaker: 'npc', text: 'Там нет ни NEXUS, ни Archive, ни правил. Только чистый код. Возможно, ты увидишь это сам — когда достигнешь LVL 40.' },
        ],
        choices: [{ text: 'Жду этого.', nextId: 'farewell' }],
      },
      {
        id: 'farewell',
        lines: [{ speaker: 'npc', text: 'До встречи. Или не до встречи. // Void Trader vanishes' }],
        end: true,
      },
    ],
  },
];

// ─── Диалоговый движок ───────────────────────────────────────────────────────

interface DialogEngineProps {
  npc: NPC;
  onClose: () => void;
}

function DialogEngine({ npc, onClose }: DialogEngineProps) {
  const [nodeId, setNodeId] = useState('start');
  const [lineIdx, setLineIdx] = useState(0);
  const [finished, setFinished] = useState(false);
  const [rewards, setRewards] = useState<{ xp: number; creds: number; items: string[] }>({ xp: 0, creds: 0, items: [] });

  const node = npc.dialog.find(n => n.id === nodeId)!;
  const currentLine = node.lines[lineIdx];
  const canAdvance = lineIdx < node.lines.length - 1;
  const showChoices = !canAdvance && node.choices && !node.end;
  const isEnd = !canAdvance && node.end;

  const advance = () => {
    if (canAdvance) setLineIdx(i => i + 1);
  };

  const choose = (choice: DialogChoice) => {
    if (choice.reward) {
      const r = choice.reward;
      setRewards(prev => ({
        xp: prev.xp + (r.xp ?? 0),
        creds: prev.creds + (r.creds ?? 0),
        items: r.item ? [...prev.items, r.item] : prev.items,
      }));
      if (r.xp) pushNotif({ type: 'quest', title: `+${r.xp} XP`, body: `Получено от ${npc.name}`, icon: '📜', color: npc.factionColor });
    }
    setNodeId(choice.nextId);
    setLineIdx(0);
    const next = npc.dialog.find(n => n.id === choice.nextId);
    if (next?.end) setFinished(true);
  };

  return (
    <div className="border p-5 space-y-4 transition-all"
      style={{ borderColor: npc.factionColor + '40', backgroundColor: npc.factionColor + '05' }}>

      {/* NPC header */}
      <div className="flex items-center gap-3 pb-3 border-b border-white/8">
        <div className="text-4xl">{npc.portrait}</div>
        <div>
          <div className="font-orbitron text-sm font-bold text-white">{npc.name}</div>
          <div className="font-mono text-[10px]" style={{ color: npc.factionColor + '90' }}>
            {npc.title} · {npc.location}
          </div>
        </div>
        <button onClick={onClose} className="ml-auto text-gray-600 hover:text-gray-400 transition-colors">
          <Icon name="X" size={16} />
        </button>
      </div>

      {/* Dialog box */}
      <div className="min-h-[120px]">
        {currentLine && (
          <div
            className={`border p-4 transition-all ${currentLine.speaker === 'npc' ? '' : 'ml-8'}`}
            style={{
              borderColor: currentLine.speaker === 'npc' ? npc.factionColor + '40' : '#ffffff20',
              backgroundColor: currentLine.speaker === 'npc' ? npc.factionColor + '08' : '#ffffff06',
            }}
          >
            <div className="font-mono text-[10px] mb-1.5"
              style={{ color: currentLine.speaker === 'npc' ? npc.factionColor : '#888' }}>
              {currentLine.speaker === 'npc' ? npc.name : 'АГЕНТ'}
            </div>
            <p className="font-rajdhani text-sm text-gray-200 leading-relaxed">{currentLine.text}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      {canAdvance && (
        <button onClick={advance}
          className="w-full py-2.5 font-orbitron text-xs border transition-all"
          style={{ borderColor: npc.factionColor + '50', color: npc.factionColor, backgroundColor: npc.factionColor + '0a' }}>
          ПРОДОЛЖИТЬ ▶
        </button>
      )}

      {showChoices && (
        <div className="space-y-2">
          <div className="font-mono text-[10px] text-gray-600">// ВЫБЕРИ ОТВЕТ</div>
          {node.choices!.map((c, i) => (
            <button key={i} onClick={() => choose(c)}
              className="w-full text-left p-3 border transition-all hover:translate-x-1"
              style={{ borderColor: '#ffffff15', backgroundColor: 'transparent' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = npc.factionColor + '50'; (e.currentTarget as HTMLElement).style.backgroundColor = npc.factionColor + '08'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#ffffff15'; (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}>
              <span className="font-mono text-[10px] mr-2" style={{ color: npc.factionColor + '60' }}>[{i + 1}]</span>
              <span className="font-rajdhani text-sm text-gray-300">{c.text}</span>
              {c.reward && (
                <span className="ml-2 font-mono text-[9px] text-cyber-yellow">
                  {c.reward.xp ? `+${c.reward.xp} XP` : ''}{c.reward.creds ? ` +${c.reward.creds}⚡` : ''}{c.reward.item ? ` +${c.reward.item}` : ''}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {(isEnd || finished) && (
        <div>
          {(rewards.xp > 0 || rewards.creds > 0 || rewards.items.length > 0) && (
            <div className="border border-cyber-yellow/30 bg-cyber-yellow/5 p-3 mb-3">
              <div className="font-mono text-[10px] text-gray-600 mb-1">// ПОЛУЧЕНО</div>
              <div className="font-orbitron text-sm text-cyber-yellow">
                {rewards.xp > 0 && `+${rewards.xp} XP `}
                {rewards.creds > 0 && `+${rewards.creds} Creds `}
                {rewards.items.map(i => `${i} `)}
              </div>
            </div>
          )}
          <button onClick={onClose}
            className="w-full py-2.5 font-orbitron text-xs border border-white/10 text-gray-500 hover:text-white hover:border-white/30 transition-all">
            ЗАВЕРШИТЬ РАЗГОВОР
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Главный экран NPC ───────────────────────────────────────────────────────

export default function NpcDialog() {
  const { character } = useGame();
  const playerLevel = character?.level || 1;
  const [activeNpc, setActiveNpc] = useState<NPC | null>(null);

  return (
    <section className="py-8 px-4 lg:px-6 min-h-screen relative">
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
      <div className="max-w-5xl mx-auto relative z-10">

        <div className="mb-5">
          <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-1">// NPC · АГЕНТЫ CODEGRID-9</div>
          <h2 className="font-orbitron text-2xl text-white">
            КОНТАКТЫ <span className="text-cyber-cyan">THE ARCHIVE</span>
          </h2>
          <p className="text-gray-600 font-mono text-xs mt-1">Говори с агентами, узнавай лор, получай квесты и награды</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* NPC list */}
          <div className="w-full lg:w-72 flex-shrink-0 space-y-3">
            {NPCS.map(npc => {
              const locked = playerLevel < npc.unlockLevel;
              return (
                <div
                  key={npc.id}
                  className={`border p-4 transition-all ${!locked ? 'cursor-pointer hover:translate-x-1' : 'opacity-50 cursor-not-allowed'}`}
                  style={{
                    borderColor: activeNpc?.id === npc.id ? npc.factionColor + '70' : locked ? '#ffffff08' : npc.factionColor + '30',
                    backgroundColor: activeNpc?.id === npc.id ? npc.factionColor + '08' : 'transparent',
                    borderLeftWidth: activeNpc?.id === npc.id ? '3px' : '1px',
                  }}
                  onClick={() => !locked && setActiveNpc(npc)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{locked ? '🔒' : npc.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-orbitron text-sm font-bold text-white">{npc.name}</div>
                      <div className="font-mono text-[10px] mt-0.5" style={{ color: npc.factionColor + '90' }}>{npc.title}</div>
                      <div className="font-mono text-[9px] text-gray-700 mt-0.5">{npc.location}</div>
                    </div>
                  </div>
                  {locked && (
                    <div className="font-mono text-[9px] text-gray-700 mt-2">🔒 Откроется на LVL {npc.unlockLevel}</div>
                  )}
                  {!locked && (
                    <p className="font-rajdhani text-xs text-gray-600 mt-2 leading-snug">{npc.desc}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Dialog panel */}
          <div className="flex-1 min-w-0">
            {activeNpc ? (
              <DialogEngine
                key={activeNpc.id}
                npc={activeNpc}
                onClose={() => setActiveNpc(null)}
              />
            ) : (
              <div className="border border-white/8 p-8 flex flex-col items-center justify-center text-center" style={{ minHeight: '400px' }}>
                <div className="text-5xl mb-4">💬</div>
                <div className="font-orbitron text-lg text-gray-600 mb-2">ВЫБЕРИ АГЕНТА</div>
                <p className="text-gray-700 font-mono text-xs max-w-xs leading-relaxed">
                  Кликни на персонажа слева, чтобы начать разговор. Диалоги дают XP, Creds и лор мира.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
