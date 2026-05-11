import { useState } from 'react';
import Icon from '@/components/ui/icon';

const LESSONS = [
  {
    id: 1,
    title: 'Переменные и типы',
    chapter: 'Глава 1',
    xp: 100,
    completed: true,
    locked: false,
    icon: '📦',
    description: 'Научись хранить данные в переменных. Первый шаг хакера.',
    tasks: 5,
    duration: '15 мин',
    task: {
      description: 'Создай переменную hero_name и присвой ей своё игровое имя строкой.',
      keywords: ['hero_name', '=', '"'],
      example: 'hero_name = "Nova"',
      output: '> hero_name = "Nova"\n✅ Переменная создана!',
    },
  },
  {
    id: 2,
    title: 'Условия и ветвления',
    chapter: 'Глава 1',
    xp: 150,
    completed: true,
    locked: false,
    icon: '⚡',
    description: 'if/else — логика принятия решений как у настоящего ИИ.',
    tasks: 6,
    duration: '20 мин',
    task: {
      description: 'Напиши if/else: если уровень >= 5, выведи "Мастер", иначе "Новичок".',
      keywords: ['if', 'else', '>=', 'level'],
      example: 'if level >= 5:\n    print("Мастер")\nelse:\n    print("Новичок")',
      output: '> Мастер\n✅ Условие работает!',
    },
  },
  {
    id: 3,
    title: 'Циклы: while и for',
    chapter: 'Глава 2',
    xp: 200,
    completed: false,
    locked: false,
    icon: '🔄',
    description: 'Автоматизируй повторяющиеся операции. Сила цикла.',
    tasks: 7,
    duration: '25 мин',
    task: {
      description: 'Используй for и range чтобы вывести числа от 1 до 5.',
      keywords: ['for', 'in', 'range', 'print'],
      example: 'for i in range(1, 6):\n    print(i)',
      output: '> 1\n> 2\n> 3\n> 4\n> 5\n✅ Цикл работает!',
    },
  },
  {
    id: 4,
    title: 'Функции и модули',
    chapter: 'Глава 2',
    xp: 300,
    completed: false,
    locked: false,
    icon: '🔧',
    description: 'Создавай переиспользуемый код — оружие опытного кодера.',
    tasks: 8,
    duration: '30 мин',
    task: {
      description: 'Напиши функцию greet(name) которая возвращает "Привет, {name}!"',
      keywords: ['def', 'greet', 'return', 'name'],
      example: 'def greet(name):\n    return f"Привет, {name}!"',
      output: '> Привет, Nova!\n✅ Функция работает!',
    },
  },
  {
    id: 5,
    title: 'Списки и словари',
    chapter: 'Глава 3',
    xp: 350,
    completed: false,
    locked: true,
    icon: '🗂️',
    description: 'Структуры данных — основа корпоративных систем.',
    tasks: 9,
    duration: '35 мин',
    task: {
      description: 'Создай список из трёх предметов экипировки.',
      keywords: ['=', '[', ']'],
      example: 'items = ["шлем", "броня", "меч"]',
      output: '> ["шлем", "броня", "меч"]\n✅ Список создан!',
    },
  },
  {
    id: 6,
    title: 'ООП: Классы',
    chapter: 'Глава 4',
    xp: 500,
    completed: false,
    locked: true,
    icon: '🤖',
    description: 'Создавай объекты как настоящий архитектор систем.',
    tasks: 12,
    duration: '45 мин',
    task: {
      description: 'Создай класс Hero с атрибутами name и level.',
      keywords: ['class', 'Hero', 'def', '__init__', 'self'],
      example: 'class Hero:\n    def __init__(self, name, level):\n        self.name = name\n        self.level = level',
      output: '> Hero("Nova", 7)\n✅ Класс создан!',
    },
  },
];

export default function LessonsSection() {
  const [activeLesson, setActiveLesson] = useState<number | null>(null);
  const [code, setCode] = useState('');
  const [runResult, setRunResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [completedInSession, setCompletedInSession] = useState<number[]>([]);

  const lesson = LESSONS.find(l => l.id === activeLesson);

  const checkCode = (userCode: string, keywords: string[]): boolean => {
    const lower = userCode.toLowerCase();
    const matched = keywords.filter(kw => lower.includes(kw.toLowerCase()));
    return matched.length >= Math.ceil(keywords.length * 0.65);
  };

  const runCode = () => {
    if (!code.trim() || !lesson) return;
    setIsRunning(true);
    setRunResult(null);

    setTimeout(() => {
      const isCorrect = checkCode(code, lesson.task.keywords);
      if (isCorrect) {
        setRunResult({ success: true, message: lesson.task.output });
        if (!completedInSession.includes(lesson.id)) {
          setCompletedInSession(prev => [...prev, lesson.id]);
        }
      } else {
        const missing = lesson.task.keywords.filter(kw => !code.toLowerCase().includes(kw.toLowerCase()));
        setRunResult({
          success: false,
          message: `❌ Ошибка! Не хватает: ${missing.slice(0, 3).join(', ')}`,
        });
      }
      setIsRunning(false);
    }, 700);
  };

  const completedCount = LESSONS.filter(l => l.completed || completedInSession.includes(l.id)).length;

  return (
    <section className="py-16 px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="text-cyber-green font-mono text-xs tracking-widest mb-2">// ОБУЧЕНИЕ</div>
          <h2 className="font-orbitron text-3xl text-white">УРОКИ PYTHON</h2>
          <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-cyber-green to-transparent mx-auto mt-3" />
        </div>

        {/* Progress bar */}
        <div className="cyber-panel p-4 mb-6 animate-fade-in-up">
          <div className="flex justify-between items-center mb-2">
            <span className="font-orbitron text-xs text-gray-400">ПРОГРЕСС КУРСА</span>
            <span className="font-orbitron text-cyber-green text-sm">{completedCount} / {LESSONS.length}</span>
          </div>
          <div className="xp-bar">
            <div
              className="xp-bar-fill transition-all duration-700"
              style={{ width: `${(completedCount / LESSONS.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-gray-600 font-mono text-xs">0%</span>
            <span className="text-cyber-green font-mono text-xs">
              {Math.round((completedCount / LESSONS.length) * 100)}% завершено
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Lessons list */}
          <div className="space-y-2 animate-fade-in-up">
            {LESSONS.map((l, idx) => {
              const isDone = l.completed || completedInSession.includes(l.id);
              return (
                <div
                  key={l.id}
                  onClick={() => !l.locked && setActiveLesson(l.id)}
                  className={`cyber-panel p-4 transition-all duration-200 ${
                    l.locked
                      ? 'opacity-35 cursor-not-allowed'
                      : activeLesson === l.id
                      ? 'cursor-pointer'
                      : 'cursor-pointer hover:border-cyber-cyan/30'
                  }`}
                  style={{
                    animationDelay: `${idx * 0.08}s`,
                    borderColor: activeLesson === l.id ? '#00ffff60' : isDone ? '#00ff4130' : undefined,
                    boxShadow: activeLesson === l.id ? '0 0 15px #00ffff15' : undefined,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center text-xl border flex-shrink-0 transition-all duration-200"
                      style={{
                        borderColor: isDone ? '#00ff4150' : l.locked ? '#33333350' : '#00ffff20',
                        backgroundColor: isDone ? '#00ff4108' : 'transparent',
                      }}
                    >
                      {l.locked ? '🔒' : l.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-gray-500 text-xs font-mono">{l.chapter}</span>
                        {isDone && <span className="text-cyber-green text-xs font-mono">✓ ПРОЙДЕНО</span>}
                        {completedInSession.includes(l.id) && !l.completed && (
                          <span className="text-cyber-yellow text-xs font-mono animate-pulse">🆕 +{l.xp} XP</span>
                        )}
                      </div>
                      <div className={`font-rajdhani font-semibold text-sm ${l.locked ? 'text-gray-600' : isDone ? 'text-gray-300' : 'text-white'}`}>
                        {l.title}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 space-y-0.5">
                      <div className="text-cyber-yellow text-xs font-mono">+{l.xp} XP</div>
                      <div className="text-gray-600 text-xs font-mono">{l.duration}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Lesson Detail */}
          <div className="animate-fade-in-up delay-200">
            {lesson ? (
              <div className="cyber-panel flex flex-col">
                {/* Header */}
                <div className="p-5 border-b border-cyber-cyan/15">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{lesson.icon}</span>
                    <div>
                      <div className="text-cyber-cyan font-mono text-xs">{lesson.chapter}</div>
                      <div className="font-orbitron text-white text-base">{lesson.title}</div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm font-rajdhani mt-2">{lesson.description}</p>
                  <div className="flex gap-4 mt-2">
                    <span className="text-cyber-green text-xs font-mono">📝 {lesson.tasks} заданий</span>
                    <span className="text-cyber-yellow text-xs font-mono">⏱ {lesson.duration}</span>
                    <span className="text-cyber-cyan text-xs font-mono">+{lesson.xp} XP</span>
                  </div>
                </div>

                {/* Task */}
                <div className="p-4 bg-black/20 border-b border-cyber-cyan/10">
                  <div className="text-cyber-magenta text-xs font-mono mb-2">// ЗАДАНИЕ</div>
                  <p className="text-gray-200 text-sm font-rajdhani leading-relaxed">{lesson.task.description}</p>

                  {/* Keyword tracker */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {lesson.task.keywords.map(kw => {
                      const found = code.toLowerCase().includes(kw.toLowerCase());
                      return (
                        <span
                          key={kw}
                          className="text-xs font-mono px-2 py-0.5 border transition-all duration-300"
                          style={{
                            borderColor: found ? '#00ff41' : '#ffffff15',
                            color: found ? '#00ff41' : '#555',
                            backgroundColor: found ? '#00ff4112' : 'transparent',
                          }}
                        >
                          {kw}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Code editor */}
                <div className="flex flex-col p-4 gap-3">
                  <div>
                    <div className="flex items-center gap-2 bg-black/70 px-3 py-2 border-b border-cyber-green/15">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-gray-500 text-xs font-mono ml-2">lesson_{lesson.id}.py</span>
                    </div>
                    <textarea
                      value={code}
                      onChange={e => setCode(e.target.value)}
                      className="code-editor w-full p-4 h-28"
                      placeholder="# Пиши код здесь..."
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

                  {/* Result output */}
                  {runResult && (
                    <div
                      className="p-3 border font-mono text-xs whitespace-pre-line animate-fade-in-up"
                      style={{
                        borderColor: runResult.success ? '#00ff4140' : '#ff004040',
                        backgroundColor: runResult.success ? '#00ff4108' : '#ff004008',
                        color: runResult.success ? '#00ff41' : '#ff6060',
                      }}
                    >
                      {runResult.message}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={runCode}
                      disabled={isRunning || !code.trim()}
                      className="cyber-btn cyber-btn-yellow flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isRunning ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="animate-spin inline-block w-3 h-3 border border-cyber-yellow border-t-transparent rounded-full" />
                          ЗАПУСК...
                        </span>
                      ) : (
                        <>
                          <Icon name="Play" size={12} className="inline mr-1" />
                          ЗАПУСТИТЬ
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setCode(lesson.task.example);
                        setRunResult(null);
                      }}
                      className="cyber-btn px-4 text-xs"
                      title="Показать пример"
                    >
                      <Icon name="Lightbulb" size={13} />
                    </button>
                  </div>

                  <div className="text-gray-600 font-mono text-xs text-center">
                    TAB = 4 пробела · 💡 = показать пример
                  </div>
                </div>
              </div>
            ) : (
              <div className="cyber-panel h-full flex flex-col items-center justify-center p-10 text-center min-h-64">
                <div className="text-6xl mb-4 animate-float">🐍</div>
                <div className="font-orbitron text-cyber-cyan text-lg mb-2">ВЫБЕРИ УРОК</div>
                <p className="text-gray-500 font-rajdhani text-sm leading-relaxed">
                  Кликни на урок слева, чтобы начать обучение и зарабатывать XP
                </p>
                <div className="mt-6 flex gap-6">
                  <div className="text-center">
                    <div className="font-orbitron text-cyber-cyan text-2xl">{completedCount}/{LESSONS.length}</div>
                    <div className="text-gray-500 text-xs font-mono mt-1">Пройдено</div>
                  </div>
                  <div className="w-px bg-cyber-cyan/15" />
                  <div className="text-center">
                    <div className="font-orbitron text-cyber-yellow text-2xl">250</div>
                    <div className="text-gray-500 text-xs font-mono mt-1">Всего XP</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
