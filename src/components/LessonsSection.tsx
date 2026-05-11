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
  },
];

export default function LessonsSection() {
  const [activeLesson, setActiveLesson] = useState<number | null>(null);
  const [code, setCode] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const lesson = LESSONS.find(l => l.id === activeLesson);

  const runCode = () => {
    if (!code.trim()) return;
    setResult('✅ Код выполнен успешно! +100 XP получено');
    setTimeout(() => setResult(null), 3000);
  };

  return (
    <section className="py-16 px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="text-cyber-green font-mono text-xs tracking-widest mb-2">// ОБУЧЕНИЕ</div>
          <h2 className="font-orbitron text-3xl text-white">УРОКИ PYTHON</h2>
          <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-cyber-green to-transparent mx-auto mt-3" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Lessons list */}
          <div className="space-y-3 animate-fade-in-up">
            {LESSONS.map((lesson, idx) => (
              <div
                key={lesson.id}
                onClick={() => !lesson.locked && setActiveLesson(lesson.id)}
                className={`cyber-panel p-4 transition-all ${
                  lesson.locked
                    ? 'opacity-40 cursor-not-allowed'
                    : 'cursor-pointer hover:border-cyber-cyan/40'
                } ${activeLesson === lesson.id ? 'border-cyber-cyan/60' : ''}`}
                style={{
                  animationDelay: `${idx * 0.1}s`,
                  borderColor: activeLesson === lesson.id ? 'var(--cyber-cyan)' : undefined,
                  boxShadow: activeLesson === lesson.id ? '0 0 15px #00ffff20' : undefined,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 flex items-center justify-center text-xl border flex-shrink-0"
                    style={{
                      borderColor: lesson.completed ? '#00ff41' : lesson.locked ? '#333' : '#00ffff40',
                      backgroundColor: lesson.completed ? '#00ff4110' : '#00ffff05',
                    }}
                  >
                    {lesson.locked ? '🔒' : lesson.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs font-mono">{lesson.chapter}</span>
                      {lesson.completed && (
                        <span className="text-cyber-green text-xs font-mono">✓ ПРОЙДЕНО</span>
                      )}
                    </div>
                    <div className={`font-rajdhani font-semibold ${lesson.locked ? 'text-gray-600' : 'text-white'}`}>
                      {lesson.title}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-cyber-yellow text-xs font-mono">+{lesson.xp} XP</div>
                    <div className="text-gray-500 text-xs font-mono">{lesson.duration}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Lesson Detail / Code Panel */}
          <div className="animate-fade-in-up delay-200">
            {lesson ? (
              <div className="cyber-panel h-full flex flex-col">
                {/* Lesson header */}
                <div className="p-4 border-b border-cyber-cyan/20">
                  <div className="text-cyber-cyan font-mono text-xs mb-1">{lesson.chapter}</div>
                  <div className="font-orbitron text-white text-lg">{lesson.title}</div>
                  <p className="text-gray-400 text-sm font-rajdhani mt-1">{lesson.description}</p>
                  <div className="flex gap-4 mt-2">
                    <span className="text-cyber-green text-xs font-mono">📝 {lesson.tasks} заданий</span>
                    <span className="text-cyber-yellow text-xs font-mono">⏱ {lesson.duration}</span>
                    <span className="text-cyber-cyan text-xs font-mono">+{lesson.xp} XP</span>
                  </div>
                </div>

                {/* Task */}
                <div className="p-4 bg-black/20">
                  <div className="text-cyber-magenta text-xs font-mono mb-2">// ЗАДАНИЕ 1</div>
                  <p className="text-gray-300 text-sm font-rajdhani">
                    Создай переменную <code className="text-cyber-cyan bg-black/30 px-1">hero_name</code> и
                    присвой ей своё игровое имя в виде строки.
                  </p>
                </div>

                {/* Code editor */}
                <div className="flex-1 flex flex-col p-4">
                  <div className="flex items-center gap-2 bg-black/50 px-3 py-2 border-b border-cyber-green/20 mb-0">
                    <div className="w-2 h-2 rounded-full bg-cyber-red" />
                    <div className="w-2 h-2 rounded-full bg-cyber-yellow" />
                    <div className="w-2 h-2 rounded-full bg-cyber-green" />
                    <span className="text-gray-500 text-xs font-mono ml-2">lesson.py</span>
                  </div>
                  <textarea
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="code-editor flex-1 p-4 min-h-32"
                    placeholder="# Пиши код здесь..."
                    onKeyDown={e => {
                      if (e.key === 'Tab') {
                        e.preventDefault();
                        setCode(c => c + '    ');
                      }
                    }}
                  />

                  {result && (
                    <div className="bg-cyber-green/10 border border-cyber-green/40 p-2 mt-2 text-cyber-green text-xs font-mono">
                      {result}
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    <button onClick={runCode} className="cyber-btn cyber-btn-yellow flex-1 text-center text-xs">
                      <Icon name="Play" size={12} className="inline mr-1" />
                      ЗАПУСТИТЬ
                    </button>
                    <button className="cyber-btn flex-1 text-center text-xs">
                      ПРОВЕРИТЬ
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="cyber-panel h-full flex flex-col items-center justify-center p-10 text-center">
                <div className="text-6xl mb-4">🐍</div>
                <div className="font-orbitron text-cyber-cyan text-lg mb-2">ВЫБЕРИ УРОК</div>
                <p className="text-gray-500 font-rajdhani text-sm">
                  Кликни на урок слева, чтобы начать обучение и получить XP
                </p>
                <div className="mt-6 flex gap-3">
                  <div className="text-center">
                    <div className="font-orbitron text-cyber-cyan text-xl">2/6</div>
                    <div className="text-gray-500 text-xs font-mono">Пройдено</div>
                  </div>
                  <div className="w-px bg-cyber-cyan/20" />
                  <div className="text-center">
                    <div className="font-orbitron text-cyber-yellow text-xl">250</div>
                    <div className="text-gray-500 text-xs font-mono">Всего XP</div>
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
