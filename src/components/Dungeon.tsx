import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { useGame, XpResult } from '@/lib/GameContext';
import { api } from '@/lib/api';
import { pushNotif } from '@/components/Notifications';
import { progress } from '@/lib/progressStore';
import { applyXpBonus } from '@/lib/implants';

// ─── Данные подземелий ───────────────────────────────────────────────────────

interface Question {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
  topic: string;
}

interface DungeonDef {
  id: string;
  name: string;
  subtitle: string;
  lore: string;
  difficulty: 'Новичок' | 'Средний' | 'Сложный' | 'Элита';
  diffColor: string;
  icon: string;
  color: string;
  locked: boolean;
  reward: string;
  rooms: number;
  questions: Question[];
}

const DUNGEONS: DungeonDef[] = [
  {
    id: 'nexus_alpha',
    name: 'NEXUS-Alpha',
    subtitle: 'Серверная комната',
    lore: 'Первый уровень защиты NEXUS. Дроны-охранники проверяют знание базового синтаксиса.',
    difficulty: 'Новичок',
    diffColor: '#00ff41',
    icon: '🏚️',
    color: '#00ff41',
    locked: false,
    reward: '200 XP · 150 Creds · Glitch Box',
    rooms: 5,
    questions: [
      {
        q: 'Как создать переменную x со значением 10?',
        options: ['x = 10', 'var x = 10', 'int x = 10', 'x := 10'],
        correct: 0,
        explanation: 'В Python переменные создаются простым присваиванием: x = 10. Не нужно указывать тип.',
        topic: 'Переменные',
      },
      {
        q: 'Что выведет: print(type(42))?',
        options: ["<class 'int'>", "<class 'str'>", "42", "int"],
        correct: 0,
        explanation: 'type() возвращает тип объекта. 42 — целое число, поэтому вернёт <class \'int\'>.',
        topic: 'Типы данных',
      },
      {
        q: 'Как написать строку в Python?',
        options: ['"Hello"', '<Hello>', 'Hello', '#Hello'],
        correct: 0,
        explanation: 'Строки в Python заключаются в одинарные или двойные кавычки: "Hello" или \'Hello\'.',
        topic: 'Строки',
      },
      {
        q: 'Что делает функция len("Python")?',
        options: ['Возвращает 6', 'Возвращает 5', 'Возвращает "Python"', 'Ошибка'],
        correct: 0,
        explanation: 'len() возвращает длину строки. "Python" содержит 6 символов.',
        topic: 'Строки',
      },
      {
        q: 'Как получить тип переменной name = "Nova"?',
        options: ['type(name)', 'typeof name', 'name.type()', 'gettype(name)'],
        correct: 0,
        explanation: 'В Python используется встроенная функция type(). type(name) вернёт <class \'str\'>.',
        topic: 'Типы данных',
      },
    ],
  },
  {
    id: 'nexus_beta',
    name: 'NEXUS-Beta',
    subtitle: 'Центр управления',
    lore: 'Алгоритмический центр NEXUS. ИИ-охрана использует условную логику и циклы.',
    difficulty: 'Средний',
    diffColor: '#ffaa00',
    icon: '🏭',
    color: '#ffaa00',
    locked: false,
    reward: '500 XP · 350 Creds · Neon Core',
    rooms: 7,
    questions: [
      {
        q: 'Что выведет: print(10 > 5)?',
        options: ['True', 'False', '10', 'Ошибка'],
        correct: 0,
        explanation: '10 > 5 — это сравнение, которое возвращает булево значение True.',
        topic: 'Условия',
      },
      {
        q: 'Какой цикл выполняется пока условие истинно?',
        options: ['while', 'for', 'loop', 'repeat'],
        correct: 0,
        explanation: 'while выполняет тело цикла пока условие истинно: while x > 0: ...',
        topic: 'Циклы',
      },
      {
        q: 'Что выведет: for i in range(3): print(i)?',
        options: ['0 1 2', '1 2 3', '0 1 2 3', '1 2'],
        correct: 0,
        explanation: 'range(3) генерирует числа от 0 до 2 включительно (3 не включается).',
        topic: 'Циклы',
      },
      {
        q: 'Как правильно написать условие: если x равно 5?',
        options: ['if x == 5:', 'if x = 5:', 'if x === 5:', 'when x == 5:'],
        correct: 0,
        explanation: 'В Python для сравнения используется == (два знака равно). Одно = это присваивание.',
        topic: 'Условия',
      },
      {
        q: 'Что выведет: x = 0; while x < 3: x += 1; print(x)?',
        options: ['3', '0', '1', 'Бесконечный цикл'],
        correct: 0,
        explanation: 'Цикл увеличивает x с 0 до 3. Когда x == 3, условие x < 3 становится False. print(x) выведет 3.',
        topic: 'Циклы',
      },
      {
        q: 'Что означает else в конструкции if/else?',
        options: ['Выполняется если условие False', 'Выполняется всегда', 'Выполняется если условие True', 'Завершает программу'],
        correct: 0,
        explanation: 'else выполняется когда условие в if оказалось False. Это ветка "иначе".',
        topic: 'Условия',
      },
      {
        q: 'Как досрочно выйти из цикла в Python?',
        options: ['break', 'exit', 'stop', 'return'],
        correct: 0,
        explanation: 'break немедленно прерывает выполнение цикла (for или while).',
        topic: 'Циклы',
      },
    ],
  },
  {
    id: 'archive_vault',
    name: 'The Archive Vault',
    subtitle: 'Хранилище знаний',
    lore: 'Хранилище запрещённых знаний The Archive. Только самые подготовленные агенты могут войти.',
    difficulty: 'Сложный',
    diffColor: '#ff00ff',
    icon: '🏛️',
    color: '#aa00ff',
    locked: false,
    reward: '1200 XP · 800 Creds · Void Relic',
    rooms: 8,
    questions: [
      {
        q: 'Как объявить функцию в Python?',
        options: ['def func():', 'function func():', 'func = ():', 'define func():'],
        correct: 0,
        explanation: 'Функции объявляются ключевым словом def, затем имя, скобки и двоеточие.',
        topic: 'Функции',
      },
      {
        q: 'Что делает ключевое слово return?',
        options: ['Возвращает значение из функции', 'Печатает значение', 'Завершает программу', 'Создаёт переменную'],
        correct: 0,
        explanation: 'return завершает выполнение функции и возвращает указанное значение вызывающему коду.',
        topic: 'Функции',
      },
      {
        q: 'Как создать список [1, 2, 3] в Python?',
        options: ['lst = [1, 2, 3]', 'lst = (1, 2, 3)', 'lst = {1, 2, 3}', 'lst = <1, 2, 3>'],
        correct: 0,
        explanation: 'Список создаётся квадратными скобками. Кортеж — круглыми, множество — фигурными.',
        topic: 'Списки',
      },
      {
        q: 'Что делает lst.append(4) если lst = [1, 2, 3]?',
        options: ['Добавляет 4 в конец', 'Добавляет 4 в начало', 'Удаляет 4', 'Возвращает длину'],
        correct: 0,
        explanation: 'append() добавляет элемент в конец списка. После вызова lst станет [1, 2, 3, 4].',
        topic: 'Списки',
      },
      {
        q: 'Как получить длину списка lst = [1, 2, 3]?',
        options: ['len(lst)', 'lst.length()', 'lst.size()', 'count(lst)'],
        correct: 0,
        explanation: 'Встроенная функция len() возвращает количество элементов в коллекции.',
        topic: 'Списки',
      },
      {
        q: 'Что такое словарь в Python?',
        options: ['Структура ключ-значение', 'Упорядоченный список', 'Математическое множество', 'Строковый тип'],
        correct: 0,
        explanation: 'Словарь (dict) — коллекция пар ключ:значение. Пример: {"name": "Nova", "level": 7}',
        topic: 'Словари',
      },
      {
        q: 'Что вернёт: d = {"x": 10}; d["x"]?',
        options: ['10', '"x"', 'None', 'Ошибка'],
        correct: 0,
        explanation: 'Доступ к значению словаря по ключу: d["x"] вернёт 10.',
        topic: 'Словари',
      },
      {
        q: 'Как создать список чётных чисел от 0 до 8 через list comprehension?',
        options: ['[x for x in range(10) if x%2==0]', '[x if x%2==0 in range(10)]', 'list(range(0,8,2))', 'Оба A и C верны'],
        correct: 3,
        explanation: 'Верны оба способа: list comprehension [x for x in range(10) if x%2==0] и list(range(0,8,2)).',
        topic: 'Списки',
      },
    ],
  },
  {
    id: 'nexus_prime',
    name: 'NEXUS-Prime Tower',
    subtitle: 'Штаб-квартира NEXUS',
    lore: 'Сердце корпорации. Элитная защита. Только лучшие агенты The Archive способны взломать это.',
    difficulty: 'Элита',
    diffColor: '#ff4060',
    icon: '🏙️',
    color: '#ff4060',
    locked: true,
    reward: '3000 XP · 2000 Creds · Mythic Item',
    rooms: 10,
    questions: [],
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

type Phase = 'select' | 'playing' | 'result';

interface RoomState {
  questionIdx: number;
  answered: number | null;
  correct: number;
  wrong: number;
  streak: number;
  log: { q: string; correct: boolean; explanation: string }[];
}

// XP по данжу
const DUNGEON_XP: Record<string, number> = {
  nexus_alpha:   200,
  nexus_beta:    500,
  archive_vault: 1200,
  nexus_prime:   3000,
};
const DUNGEON_COINS: Record<string, number> = {
  nexus_alpha:   150,
  nexus_beta:    350,
  archive_vault: 800,
  nexus_prime:   2000,
};

export default function Dungeon() {
  const { applyXpResult } = useGame();
  const [phase, setPhase] = useState<Phase>('select');
  const [dungeon, setDungeon] = useState<DungeonDef | null>(null);
  const [room, setRoom] = useState<RoomState>({
    questionIdx: 0, answered: null, correct: 0, wrong: 0, streak: 0, log: [],
  });
  const [showExplanation, setShowExplanation] = useState(false);
  const [dungeonReward, setDungeonReward] = useState<{ xp: number; levelUp: boolean; newLevel: number } | null>(null);
  const [savingResult, setSavingResult] = useState(false);

  const startDungeon = (d: DungeonDef) => {
    setDungeon(d);
    setRoom({ questionIdx: 0, answered: null, correct: 0, wrong: 0, streak: 0, log: [] });
    setShowExplanation(false);
    setPhase('playing');
  };

  const answer = (idx: number) => {
    if (!dungeon || room.answered !== null) return;
    const q = dungeon.questions[room.questionIdx];
    const isCorrect = idx === q.correct;
    setRoom(r => ({
      ...r,
      answered: idx,
      correct: isCorrect ? r.correct + 1 : r.correct,
      wrong: !isCorrect ? r.wrong + 1 : r.wrong,
      streak: isCorrect ? r.streak + 1 : 0,
    }));
    setShowExplanation(true);
  };

  const saveDungeonResult = async (dungeonId: string, correctCount: number, totalCount: number) => {
    if (!totalCount) return;
    setSavingResult(true);
    const scorePct = Math.round((correctCount / totalCount) * 100);
    // Записываем в localStorage для квестов/достижений
    progress.recordDungeonComplete(dungeonId, scorePct);
    const xp = DUNGEON_XP[dungeonId] ?? 200;
    const coins = DUNGEON_COINS[dungeonId] ?? 100;
    const res = await api.dungeon.complete(dungeonId, scorePct, xp, coins);
    setSavingResult(false);
    if (res && !res.error && res.xp_gained > 0) {
      applyXpResult(res as XpResult);
      progress.recordXp(applyXpBonus(res.xp_gained ?? 0, progress.get().implantsEquipped));
      setDungeonReward({ xp: res.xp_gained, levelUp: res.leveled_up ?? false, newLevel: res.new_level ?? 1 });
      if (res.leveled_up) {
        pushNotif({ type: 'level', title: `LEVEL UP! → LVL ${res.new_level}`, body: 'Статы персонажа улучшены', icon: '⚡', color: '#00ff41' });
      }
    }
  };

  const next = () => {
    if (!dungeon) return;
    const nextIdx = room.questionIdx + 1;
    if (nextIdx >= dungeon.questions.length) {
      const finalRoom = {
        ...room,
        log: [...room.log, {
          q: dungeon.questions[room.questionIdx].q,
          correct: room.answered === dungeon.questions[room.questionIdx].correct,
          explanation: dungeon.questions[room.questionIdx].explanation,
        }],
      };
      const finalCorrect = finalRoom.correct + (room.answered === dungeon.questions[room.questionIdx].correct ? 1 : 0);
      setRoom(finalRoom);
      setDungeonReward(null);
      setPhase('result');
      saveDungeonResult(dungeon.id, finalCorrect, dungeon.questions.length);
    } else {
      setRoom(r => ({
        ...r,
        log: [...r.log, {
          q: dungeon.questions[r.questionIdx].q,
          correct: r.answered === dungeon.questions[r.questionIdx].correct,
          explanation: dungeon.questions[r.questionIdx].explanation,
        }],
        questionIdx: nextIdx,
        answered: null,
      }));
      setShowExplanation(false);
    }
  };

  const q = dungeon?.questions[room.questionIdx];
  const progressPct = dungeon ? ((room.questionIdx + (room.answered !== null ? 1 : 0)) / dungeon.questions.length) * 100 : 0;
  const scorePercent = dungeon ? Math.round((room.correct / dungeon.questions.length) * 100) : 0;

  // ── SELECT ──
  if (phase === 'select') {
    return (
      <section className="py-8 px-4 lg:px-6 min-h-screen relative">
        <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="mb-6">
            <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-1">// DUNGEON SYSTEM · CODEGRID-9</div>
            <h2 className="font-orbitron text-2xl text-white">
              ПОДЗЕМЕЛЬЯ <span className="text-cyber-yellow">NEXUS</span>
            </h2>
            <p className="text-gray-600 font-rajdhani text-sm mt-1">
              Отвечай на вопросы по Python, побеждай охрану, получай лут.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {DUNGEONS.map(d => (
              <div
                key={d.id}
                className={`border p-5 transition-all duration-200 ${d.locked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:translate-y-[-2px]'}`}
                style={{ borderColor: d.color + '30', backgroundColor: d.color + '04' }}
                onMouseEnter={e => { if (!d.locked) (e.currentTarget as HTMLElement).style.borderColor = d.color + '70'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = d.color + '30'; }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{d.locked ? '🔒' : d.icon}</span>
                    <div>
                      <div className="font-orbitron text-sm font-bold text-white">{d.name}</div>
                      <div className="font-mono text-[10px] text-gray-600">{d.subtitle}</div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 border"
                    style={{ color: d.diffColor, borderColor: d.diffColor + '50' }}>
                    {d.difficulty}
                  </span>
                </div>

                <p className="text-gray-600 font-rajdhani text-sm leading-snug mb-4">{d.lore}</p>

                <div className="flex items-center justify-between">
                  <div className="font-mono text-[10px] text-gray-700">
                    {d.rooms} комнат · {d.questions.length} вопросов
                  </div>
                  <div className="font-mono text-[10px]" style={{ color: d.color + 'aa' }}>{d.reward}</div>
                </div>

                {!d.locked && (
                  <button
                    onClick={() => startDungeon(d)}
                    className="mt-4 w-full py-2.5 font-orbitron text-xs border transition-all"
                    style={{ borderColor: d.color, color: d.color, backgroundColor: d.color + '12' }}
                  >
                    <Icon name="Play" size={12} className="inline mr-1.5" />
                    ВОЙТИ В ПОДЗЕМЕЛЬЕ
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── PLAYING ──
  if (phase === 'playing' && dungeon && q) {
    return (
      <section className="py-8 px-4 lg:px-6 min-h-screen relative">
        <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="font-orbitron text-sm font-bold" style={{ color: dungeon.color }}>{dungeon.name}</div>
              <div className="font-mono text-[10px] text-gray-600">Комната {room.questionIdx + 1} из {dungeon.questions.length}</div>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="font-orbitron text-lg text-cyber-green">{room.correct}</div>
                <div className="font-mono text-[9px] text-gray-600">верно</div>
              </div>
              <div className="text-center">
                <div className="font-orbitron text-lg text-red-400">{room.wrong}</div>
                <div className="font-mono text-[9px] text-gray-600">ошибки</div>
              </div>
              {room.streak >= 2 && (
                <div className="text-center">
                  <div className="font-orbitron text-lg text-cyber-yellow">🔥{room.streak}</div>
                  <div className="font-mono text-[9px] text-gray-600">стрик</div>
                </div>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="h-1.5 bg-black/60 mb-6 border border-white/5">
            <div className="h-full transition-all duration-500"
              style={{ width: `${progressPct}%`, backgroundColor: dungeon.color, boxShadow: `0 0 6px ${dungeon.color}` }} />
          </div>

          {/* Question card */}
          <div className="border p-6 mb-4" style={{ borderColor: dungeon.color + '30', backgroundColor: dungeon.color + '05' }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-mono text-[10px] px-2 py-0.5 border"
                style={{ color: dungeon.color, borderColor: dungeon.color + '50' }}>
                {q.topic}
              </span>
              <span className="font-mono text-[10px] text-gray-700">[Вопрос {room.questionIdx + 1}]</span>
            </div>
            <p className="font-rajdhani text-lg text-white font-semibold leading-snug mb-6">{q.q}</p>

            <div className="grid sm:grid-cols-2 gap-3">
              {q.options.map((opt, i) => {
                const isAnswered = room.answered !== null;
                const isSelected = room.answered === i;
                const isCorrectOpt = i === q.correct;
                let borderColor = dungeon.color + '25';
                let bgColor = 'transparent';
                let textColor = 'text-gray-300';
                if (isAnswered) {
                  if (isCorrectOpt) { borderColor = '#00ff41'; bgColor = '#00ff4115'; textColor = 'text-cyber-green'; }
                  else if (isSelected) { borderColor = '#ff4060'; bgColor = '#ff406015'; textColor = 'text-red-400'; }
                  else { borderColor = '#333'; textColor = 'text-gray-700'; }
                }
                return (
                  <button
                    key={i}
                    onClick={() => answer(i)}
                    disabled={isAnswered}
                    className={`p-4 border text-left transition-all font-rajdhani text-sm ${textColor} ${!isAnswered ? 'hover:border-opacity-80 cursor-pointer' : 'cursor-default'}`}
                    style={{ borderColor, backgroundColor: bgColor }}
                    onMouseEnter={e => { if (!isAnswered) (e.currentTarget as HTMLElement).style.borderColor = dungeon.color + '80'; }}
                    onMouseLeave={e => { if (!isAnswered) (e.currentTarget as HTMLElement).style.borderColor = dungeon.color + '25'; }}
                  >
                    <span className="font-mono text-[10px] mr-2" style={{ color: dungeon.color + '60' }}>
                      {['A', 'B', 'C', 'D'][i]}
                    </span>
                    {opt}
                    {isAnswered && isCorrectOpt && <Icon name="Check" size={12} className="inline ml-2 text-cyber-green" />}
                    {isAnswered && isSelected && !isCorrectOpt && <Icon name="X" size={12} className="inline ml-2 text-red-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className={`border p-4 mb-4 font-rajdhani text-sm ${room.answered === q.correct ? 'border-cyber-green/40 bg-cyber-green/5 text-cyber-green' : 'border-red-500/40 bg-red-500/5 text-red-400'}`}>
              <div className="flex items-center gap-2 mb-1 font-orbitron text-xs">
                <Icon name={room.answered === q.correct ? 'Check' : 'X'} size={12} />
                {room.answered === q.correct ? 'ВЕРНО!' : 'НЕВЕРНО!'}
              </div>
              <p className="text-gray-300 leading-snug">{q.explanation}</p>
            </div>
          )}

          {room.answered !== null && (
            <button
              onClick={next}
              className="w-full py-3.5 font-orbitron text-sm border transition-all"
              style={{ borderColor: dungeon.color, color: dungeon.color, backgroundColor: dungeon.color + '15' }}
            >
              {room.questionIdx + 1 >= dungeon.questions.length ? 'ЗАВЕРШИТЬ ДАНЖ →' : 'СЛЕДУЮЩАЯ КОМНАТА →'}
            </button>
          )}
        </div>
      </section>
    );
  }

  // ── RESULT ──
  if (phase === 'result' && dungeon) {
    const isPerfect = room.correct === dungeon.questions.length;
    const isPass = scorePercent >= 60;
    const resultColor = isPerfect ? '#ffff00' : isPass ? '#00ff41' : '#ff4060';

    return (
      <section className="py-8 px-4 lg:px-6 min-h-screen relative">
        <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          {/* Result header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{isPerfect ? '🏆' : isPass ? '✅' : '💀'}</div>
            <div className="font-orbitron text-4xl font-black mb-2" style={{ color: resultColor }}>
              {isPerfect ? 'PERFECT RUN!' : isPass ? 'ПОБЕДА!' : 'ПОРАЖЕНИЕ'}
            </div>
            <div className="font-orbitron text-sm mb-1" style={{ color: dungeon.color }}>{dungeon.name}</div>
            <div className="font-mono text-2xl text-white">{scorePercent}%</div>
            <div className="font-mono text-[10px] text-gray-600">{room.correct} из {dungeon.questions.length} верно</div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Верно', val: room.correct, color: '#00ff41' },
              { label: 'Ошибки', val: room.wrong, color: '#ff4060' },
              { label: 'Макс стрик', val: room.streak, color: '#ffaa00' },
            ].map(s => (
              <div key={s.label} className="border border-white/8 p-4 text-center">
                <div className="font-orbitron text-2xl font-black" style={{ color: s.color }}>{s.val}</div>
                <div className="font-mono text-[10px] text-gray-600 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Reward — реальные данные с бэкенда */}
          {isPass && (
            <div className="border border-cyber-yellow/40 bg-cyber-yellow/5 p-4 mb-6 text-center">
              <div className="font-mono text-[10px] text-gray-600 mb-1">// НАГРАДА</div>
              {savingResult ? (
                <div className="flex items-center justify-center gap-2 font-mono text-xs text-gray-500">
                  <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                  Сохраняем результат...
                </div>
              ) : dungeonReward ? (
                <div className="space-y-1">
                  <div className="font-orbitron text-lg text-cyber-yellow">
                    +{dungeonReward.xp} XP
                  </div>
                  {dungeonReward.levelUp && (
                    <div className="font-orbitron text-cyber-green animate-pulse">
                      ⚡ LEVEL UP → LVL {dungeonReward.newLevel}!
                    </div>
                  )}
                </div>
              ) : (
                <div className="font-orbitron text-sm text-cyber-yellow">{dungeon.reward}</div>
              )}
            </div>
          )}

          {/* Log */}
          <div className="border border-white/8 mb-6">
            <div className="px-4 py-2 border-b border-white/5 font-mono text-[10px] text-gray-600">// LOG</div>
            <div className="divide-y divide-white/5 max-h-60 overflow-y-auto">
              {room.log.map((entry, i) => (
                <div key={i} className="px-4 py-3 flex items-start gap-3">
                  <Icon name={entry.correct ? 'Check' : 'X'} size={12}
                    className={`mt-0.5 flex-shrink-0 ${entry.correct ? 'text-cyber-green' : 'text-red-400'}`} />
                  <div>
                    <div className="text-gray-400 font-rajdhani text-xs">{entry.q}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => startDungeon(dungeon)}
              className="flex-1 py-3 font-orbitron text-xs border transition-all"
              style={{ borderColor: dungeon.color, color: dungeon.color, backgroundColor: dungeon.color + '12' }}
            >
              <Icon name="RefreshCw" size={12} className="inline mr-1.5" />
              ПРОЙТИ СНОВА
            </button>
            <button
              onClick={() => setPhase('select')}
              className="flex-1 py-3 font-orbitron text-xs border border-white/10 text-gray-500 hover:text-white hover:border-white/30 transition-all"
            >
              ВЫБРАТЬ ДРУГОЙ
            </button>
          </div>
        </div>
      </section>
    );
  }

  return null;
}