import { useState } from 'react';
import { progress as progressStore } from '@/lib/progressStore';
import { pushNotif } from '@/components/Notifications';
import { checkSingleLine } from '@/lib/codeCheck';
import { applyXpBonus } from '@/lib/implants';
import { useGainXp } from '@/lib/useGainXp';

interface Scene {
  speaker: string;
  speakerColor: string;
  text: string;
  /** Если есть — это сцена с кодом-задачей */
  task?: {
    prompt: string;
    template: string;     // код с пропуском, ___ — где вставить
    answers: string[];    // принимаемые ответы (lowercased)
    hint: string;
  };
}

interface Story {
  id: string;
  title: string;
  intro: string;
  topic: string;
  bg: string;
  reward: number;
  scenes: Scene[];
}

const STORIES: Story[] = [
  {
    id: 'leak',
    title: 'Утечка в Archive',
    intro: 'Кто-то сливает данные. Помоги PYTH-0N проверить систему.',
    topic: 'if / else',
    bg: 'linear-gradient(135deg, #001a14 0%, #003322 100%)',
    reward: 80,
    scenes: [
      { speaker: 'PYTH-0N', speakerColor: '#00ff41', text: 'Агент. У нас аномалия. Уровень угрозы скачет каждые 5 секунд.' },
      { speaker: 'PYTH-0N', speakerColor: '#00ff41', text: 'Открой консоль. Допиши условие — если threat >= 7, выведи "ОПАСНО".' },
      {
        speaker: 'СИСТЕМА', speakerColor: '#888', text: 'Допиши пропущенную строку:',
        task: {
          prompt: 'Условие: если threat >= 7 → вывести "ОПАСНО"',
          template: 'threat = 8\n___\n    print("ОПАСНО")',
          answers: ['if threat >= 7:', 'if threat>=7:'],
          hint: 'Используй if + сравнение + двоеточие',
        },
      },
      { speaker: 'PYTH-0N', speakerColor: '#00ff41', text: 'Чисто. Теперь добавь else — для безопасной зоны.' },
      {
        speaker: 'СИСТЕМА', speakerColor: '#888', text: 'Добавь блок else:',
        task: {
          prompt: 'Если условие не сработало — выведи "Зона чиста"',
          template: 'if threat >= 7:\n    print("ОПАСНО")\n___\n    print("Зона чиста")',
          answers: ['else:'],
          hint: 'else: — без условия, просто двоеточие',
        },
      },
      { speaker: 'PYTH-0N', speakerColor: '#00ff41', text: 'Идеально. Источник утечки — изолирован. Хорошая работа, агент.' },
    ],
  },
  {
    id: 'patrol',
    title: 'Патруль дронов',
    intro: 'NEXUS отправил 10 дронов. Их нужно перебрать и обезвредить.',
    topic: 'циклы for',
    bg: 'linear-gradient(135deg, #1a0a00 0%, #332211 100%)',
    reward: 100,
    scenes: [
      { speaker: 'K4I', speakerColor: '#00aaff', text: 'Слышишь жужжание? Это патрульные дроны NEXUS. Их 10 штук.' },
      { speaker: 'K4I', speakerColor: '#00aaff', text: 'Нужно пройтись по каждому. Цикл for + range — твой друг.' },
      {
        speaker: 'СИСТЕМА', speakerColor: '#888', text: 'Напиши цикл по 10 дронам:',
        task: {
          prompt: 'Цикл for от 0 до 9 (всего 10 шагов)',
          template: '___\n    print(f"Дрон {i} обезврежен")',
          answers: ['for i in range(10):', 'for i in range(0,10):', 'for i in range(0, 10):'],
          hint: 'for i in range(10):',
        },
      },
      { speaker: 'K4I', speakerColor: '#00aaff', text: 'Хорошо. Но один дрон — особый. Седьмой. Пропусти его.' },
      {
        speaker: 'СИСТЕМА', speakerColor: '#888', text: 'Добавь пропуск через continue:',
        task: {
          prompt: 'Если i == 7 — пропустить шаг',
          template: 'for i in range(10):\n    if i == 7:\n        ___\n    print(f"Дрон {i}")',
          answers: ['continue'],
          hint: 'continue — пропуск шага цикла',
        },
      },
      { speaker: 'K4I', speakerColor: '#00aaff', text: 'Готово. Седьмого я заберу сам — он мой агент под прикрытием.' },
    ],
  },
  {
    id: 'database',
    title: 'База агентов',
    intro: 'Нужно создать досье на нового агента. Используем словарь.',
    topic: 'словари',
    bg: 'linear-gradient(135deg, #001a2e 0%, #002244 100%)',
    reward: 120,
    scenes: [
      { speaker: 'ARCHIVE', speakerColor: '#00aaff', text: 'Новый агент — Nova_7. Запиши его в базу данных.' },
      {
        speaker: 'СИСТЕМА', speakerColor: '#888', text: 'Создай словарь agent:',
        task: {
          prompt: 'Словарь с name="Nova" и level=7',
          template: 'agent = ___',
          answers: ['{"name": "nova", "level": 7}', '{"name":"nova","level":7}', '{"name": "nova","level": 7}'],
          hint: '{"name": "Nova", "level": 7} — пары через двоеточие',
        },
      },
      { speaker: 'ARCHIVE', speakerColor: '#00aaff', text: 'Хорошо. Теперь выведи имя из словаря.' },
      {
        speaker: 'СИСТЕМА', speakerColor: '#888', text: 'Достань значение по ключу:',
        task: {
          prompt: 'Выведи имя через print()',
          template: 'print(___)',
          answers: ['agent["name"]', 'agent[\'name\']'],
          hint: 'agent["name"] — доступ по ключу в квадратных скобках',
        },
      },
      { speaker: 'ARCHIVE', speakerColor: '#00aaff', text: 'Досье готово. Добро пожаловать в Archive, Nova_7.' },
    ],
  },
];

export default function CodeStories() {
  const [storyId, setStoryId] = useState<string | null>(null);
  const [completed, setCompleted] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('stories_done') || '[]'); } catch { return []; }
  });
  const [sceneIdx, setSceneIdx] = useState(0);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(false);
  const gainXp = useGainXp();

  const story = STORIES.find(s => s.id === storyId);

  const startStory = (id: string) => {
    setStoryId(id);
    setSceneIdx(0);
    setInput('');
    setError('');
    setShowHint(false);
  };

  const completeStory = () => {
    if (!story) return;
    if (!completed.includes(story.id)) {
      const next = [...completed, story.id];
      setCompleted(next);
      localStorage.setItem('stories_done', JSON.stringify(next));
      const equipped = progressStore.get().implantsEquipped;
      const finalXp = applyXpBonus(story.reward, equipped);
      gainXp('story', finalXp, Math.floor(finalXp / 4));
      progressStore.recordStoryComplete(story.id);
      pushNotif({
        type: 'system',
        title: `История "${story.title}" завершена!`,
        body: `+${finalXp} XP${finalXp !== story.reward ? ' (имплант)' : ''}`,
        icon: '📖',
        color: '#00aaff',
      });
    }
    setStoryId(null);
  };

  const next = () => {
    if (!story) return;
    const sc = story.scenes[sceneIdx];
    if (sc.task) {
      const ok = checkSingleLine(input, sc.task.answers);
      if (!ok) {
        setError('Не совсем. Проверь синтаксис или включи подсказку.');
        return;
      }
      setError('');
      setInput('');
      setShowHint(false);
    }
    if (sceneIdx + 1 >= story.scenes.length) {
      completeStory();
      return;
    }
    setSceneIdx(i => i + 1);
  };

  // ─── Выбор истории ───
  if (!story) {
    return (
      <section className="py-8 px-4 lg:px-6 min-h-screen relative">
        <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="mb-6">
            <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-1">// CHRONICLES · NARRATIVE MODE</div>
            <h2 className="font-orbitron text-2xl text-white">КОД-<span className="text-cyber-cyan">СТОРИЗ</span></h2>
            <p className="font-mono text-xs text-gray-500 mt-1">Учись через истории. Допиши код — двигай сюжет вперёд.</p>
          </div>

          <div className="space-y-3">
            {STORIES.map(s => {
              const done = completed.includes(s.id);
              return (
                <button key={s.id} onClick={() => startStory(s.id)}
                  className="w-full text-left p-5 border transition-all hover:-translate-y-0.5 relative overflow-hidden"
                  style={{ borderColor: done ? '#00ff4140' : '#ffffff15', background: s.bg }}>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-orbitron text-lg font-black text-white">{s.title}</div>
                        <div className="font-mono text-[10px] text-cyan-400 mt-0.5">тема: {s.topic} · {s.scenes.length} сцен</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {done && <div className="font-mono text-[10px] text-cyber-green mb-1">✓ ПРОЙДЕНО</div>}
                        <div className="font-orbitron text-sm text-cyber-magenta">+{s.reward} XP</div>
                      </div>
                    </div>
                    <p className="font-rajdhani text-sm text-gray-300">{s.intro}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // ─── Сцена ───
  const scene = story.scenes[sceneIdx];

  return (
    <section className="min-h-screen relative" style={{ background: story.bg }}>
      <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none" />
      <div className="absolute inset-0 scanlines pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setStoryId(null)} className="font-mono text-xs text-gray-400 hover:text-white">
            ← Выйти
          </button>
          <div className="font-orbitron text-sm text-white">{story.title}</div>
          <div className="font-mono text-xs text-gray-400">{sceneIdx + 1}/{story.scenes.length}</div>
        </div>

        {/* Progress */}
        <div className="h-1 bg-black/60 mb-8">
          <div className="h-full transition-all bg-cyan-400" style={{ width: `${((sceneIdx + 1) / story.scenes.length) * 100}%` }} />
        </div>

        {/* Dialog area */}
        <div className="flex-1 flex items-end pb-8">
          <div className="w-full">
            {/* Speaker tag */}
            <div className="mb-2 inline-block px-3 py-1 border font-orbitron text-xs"
              style={{ color: scene.speakerColor, borderColor: scene.speakerColor + '60', backgroundColor: scene.speakerColor + '12' }}>
              {scene.speaker}
            </div>

            {/* Text */}
            <div className="p-5 border-2 mb-4"
              style={{ borderColor: scene.speakerColor + '40', backgroundColor: '#000000aa', backdropFilter: 'blur(6px)' }}>
              <p className="font-rajdhani text-lg text-white leading-relaxed">{scene.text}</p>

              {/* Task */}
              {scene.task && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="font-mono text-xs text-cyan-300 mb-2">▸ {scene.task.prompt}</div>
                  <pre className="font-mono text-xs p-3 bg-black/60 border border-white/10 text-gray-300 mb-3 whitespace-pre-wrap">
{scene.task.template}
                  </pre>
                  <input value={input}
                    onChange={e => { setInput(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && next()}
                    placeholder="Вставь пропущенную строку..."
                    className="w-full font-mono text-sm p-3 bg-black/60 border border-white/15 text-white outline-none focus:border-cyan-400" />
                  {error && <div className="font-mono text-xs text-cyber-red mt-2">{error}</div>}
                  {showHint && <div className="font-mono text-xs text-yellow-300 mt-2">💡 {scene.task.hint}</div>}
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setShowHint(true)}
                      className="font-mono text-xs px-3 py-1.5 border border-yellow-400/40 text-yellow-300 hover:bg-yellow-400/10">
                      Подсказка
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={next}
              className="w-full font-orbitron text-sm py-3 border-2 text-white hover:bg-white/10 transition-all"
              style={{ borderColor: scene.speakerColor }}>
              {sceneIdx + 1 >= story.scenes.length ? 'ЗАВЕРШИТЬ ▶' : 'ДАЛЬШЕ ▶'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}