import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface Props {
  onBack: () => void;
  onRegister: () => void;
}

const STEPS = [
  {
    id: 1,
    title: 'Добро пожаловать в CodeRPG',
    icon: '🌆',
    color: '#00ffff',
    content: `2087 год. Мегаполис CodeGrid-9. Корпорация NEXUS запретила Python и взяла под контроль всю цифровую инфраструктуру города.

Организация The Archive ведёт подпольную борьбу. Их оружие — знание запрещённого языка программирования.

Ты — новый агент. Твоя задача: научиться программировать на Python и бороться с системой.`,
    tip: 'CodeRPG — это RPG-игра, где обучение Python — часть геймплея.',
  },
  {
    id: 2,
    title: 'Выбор класса',
    icon: '⚡',
    color: '#00ff41',
    content: `При создании персонажа ты выбираешь один из трёх классов:

🟢 HACKER — агрессивный стиль, скрипты и автоматизация. Быстрые атаки, дебаффы, контроль врага. Цвет: зелёный неон.

🟣 PYTHON-JUNIOR — универсал. Баланс атаки и защиты, быстро учится новому. Цвет: розовый неон.

🔵 PYTHON-BACKEND — стратег. Высокий урон, AoE-атаки, долгосрочные эффекты. Архитектура и серверы. Цвет: фиолетовый.`,
    tip: 'Классы влияют на визуал интерфейса и доступные способности в бою.',
  },
  {
    id: 3,
    title: 'Библиотека знаний',
    icon: '📚',
    color: '#00aaff',
    content: `В разделе «УРОКИ» находится библиотека — основной инструмент обучения.

Каждая тема содержит:
• Теорию: объяснение концепции простым языком
• Примеры кода: как это работает на практике
• Практику: задание, которое нужно выполнить
• Терминал: пиши код прямо здесь и запускай

Уроки разбиты по Актам сюжета. В АКТ I — основы Python. Позднее откроются продвинутые темы.`,
    tip: 'Читай теорию → смотри пример → выполняй задание. Так запоминается лучше.',
  },
  {
    id: 4,
    title: 'Code Combat — бой кодом',
    icon: '⚔️',
    color: '#ff00ff',
    content: `Code Combat — боевая система, где ты сражаешься с агентами NEXUS, пишя Python-код.

Как работает бой:
1. Выбираешь врага (NEXUS-Drone → CorpGuard → Sentinel → Elite)
2. Читаешь задание: что нужно написать
3. Пишешь код в редакторе (12 секунд — Action Phase)
4. Нажимаешь «АТАКОВАТЬ» — код проверяется
5. Правильный код = урон врагу. Неправильный = враг бьёт тебя

Используй способности класса для преимущества!`,
    tip: 'Не знаешь ответ? Используй способность Data Breach / Function Call для подсказки.',
  },
  {
    id: 5,
    title: 'Подземелья',
    icon: '🏰',
    color: '#ffaa00',
    content: `Подземелья — это испытания с вопросами по Python в виде теста с выбором ответов.

В данже тебя ждут:
• 5-10 вопросов по изученным темам
• Несколько вариантов ответа
• Ловушки-комнаты: пропустить или принять вызов
• Финальный босс-вопрос

За прохождение данжа: опыт, монеты Creds и редкий лут — Glitch Box или Neon Core.

Чем сложнее подземелье — тем лучше награда!`,
    tip: 'Проходи подземелья после уроков — они проверяют именно то, что ты учил.',
  },
  {
    id: 6,
    title: 'Квесты и прогресс',
    icon: '📜',
    color: '#aa00ff',
    content: `Система квестов даёт тебе цели и ведёт по сюжету CodeGrid-9.

Типы квестов:
• Сюжетные — продвигают историю, открывают новые фракции
• Обучающие — закрепляют знания конкретной темы
• Ежедневные — небольшие задания для постоянного прогресса
• Репутационные — влияют на отношения с фракциями

Выполняй квесты → получай XP → повышай уровень → открывай новые способности.`,
    tip: 'Квесты всегда показывают что делать дальше. Проверяй Журнал квестов регулярно.',
  },
  {
    id: 7,
    title: 'Экономика и магазин',
    icon: '💰',
    color: '#ffff00',
    content: `Валюта в игре:
⚡ Creds — основная валюта, зарабатывается в боях и квестах
◈ NeuroShards — премиум, за особые достижения

На Чёрном Рынке (Black Market) продаётся:
• Экипировка — шлемы, броня, оружие, импланты
• Лутбоксы — Glitch Box, Neon Core, Void Relic

Лутбоксы дают случайные предметы. Void Relic — самый редкий, шанс Legendary и Mythic.

Нельзя купить преимущество в обучении — только косметика и ускорение!`,
    tip: 'Открывай лутбоксы после подземелий — там накапливаются Creds.',
  },
  {
    id: 8,
    title: 'Готов к игре!',
    icon: '🚀',
    color: '#00ff41',
    content: `Теперь ты знаешь основы CodeRPG.

Твой первый путь:
1. Зарегистрируйся и создай персонажа
2. Прочитай первый урок: «Переменные и типы»
3. Пройди данж «NEXUS-Alpha» для новичков
4. Выполни первый квест от The Archive
5. Вступи в свой первый Code Combat бой

Помни: каждая строка Python — это удар по системе NEXUS.

THE ARCHIVE ЖДЁТ ТЕБЯ.`,
    tip: 'Не торопись. Читай теорию, не прыгай вперёд — база важнее скорости.',
  },
];

export default function Tutorial({ onBack, onRegister }: Props) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  return (
    <div className="min-h-screen bg-cyber-dark relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none" />
      <div className="absolute inset-0 scanlines pointer-events-none" />
      <div
        className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-1000"
        style={{ backgroundColor: current.color + '06' }}
      />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-5 lg:px-10 py-4 border-b border-white/5 flex-shrink-0">
        <button onClick={onBack} className="flex items-center gap-2 font-mono text-xs text-gray-500 hover:text-white transition-colors">
          <Icon name="ChevronLeft" size={14} />
          НА ГЛАВНУЮ
        </button>
        <div className="font-orbitron text-lg font-black">
          <span className="text-cyber-cyan">CODE</span><span className="text-cyber-magenta">RPG</span>
        </div>
        <button
          onClick={onRegister}
          className="font-orbitron text-xs px-4 py-2 border border-cyber-cyan/50 text-cyber-cyan hover:bg-cyber-cyan/10 transition-all"
        >
          НАЧАТЬ ИГРУ
        </button>
      </header>

      {/* Progress bar */}
      <div className="relative z-10 h-0.5 bg-black/60">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%`, backgroundColor: current.color, boxShadow: `0 0 8px ${current.color}` }}
        />
      </div>

      {/* Body */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row gap-6 px-5 lg:px-16 py-10 max-w-5xl mx-auto w-full">
        {/* Step list — desktop sidebar */}
        <div className="hidden lg:flex flex-col w-52 flex-shrink-0 gap-1">
          <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-3">// ОГЛАВЛЕНИЕ</div>
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStep(i)}
              className="flex items-center gap-3 p-2 text-left transition-all border"
              style={{
                borderColor: i === step ? s.color + '50' : 'transparent',
                backgroundColor: i === step ? s.color + '08' : 'transparent',
              }}
            >
              <span className={`font-mono text-[10px] ${i <= step ? '' : 'opacity-30'}`}
                style={{ color: i === step ? s.color : i < step ? '#555' : '#333' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className={`font-rajdhani text-xs ${i === step ? 'text-white' : i < step ? 'text-gray-600' : 'text-gray-700'}`}>
                {s.title}
              </span>
              {i < step && <Icon name="Check" size={10} className="ml-auto text-gray-600 flex-shrink-0" />}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Step indicator mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-4">
            {STEPS.map((_, i) => (
              <div key={i} className="h-1 flex-1 transition-all"
                style={{ backgroundColor: i <= step ? current.color : '#222' }} />
            ))}
          </div>

          <div
            className="border p-6 lg:p-8 mb-5 transition-all duration-500"
            style={{ borderColor: current.color + '30', backgroundColor: current.color + '04' }}
          >
            {/* Step header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="text-5xl">{current.icon}</div>
              <div>
                <div className="font-mono text-[10px] mb-1" style={{ color: current.color + '80' }}>
                  ШАГ {step + 1} ИЗ {STEPS.length}
                </div>
                <h2 className="font-orbitron text-xl lg:text-2xl font-black text-white">
                  {current.title}
                </h2>
              </div>
            </div>

            {/* Content */}
            <div className="font-rajdhani text-gray-300 text-base leading-relaxed whitespace-pre-line mb-6">
              {current.content}
            </div>

            {/* Tip */}
            <div
              className="flex items-start gap-3 border p-3"
              style={{ borderColor: current.color + '40', backgroundColor: current.color + '08' }}
            >
              <Icon name="Lightbulb" size={14} style={{ color: current.color }} className="mt-0.5 flex-shrink-0" />
              <div className="font-mono text-xs leading-relaxed" style={{ color: current.color + 'cc' }}>
                {current.tip}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={isFirst}
              className="flex items-center gap-2 font-orbitron text-xs px-5 py-3 border border-white/10 text-gray-500 hover:text-white hover:border-white/30 transition-all disabled:opacity-30"
            >
              <Icon name="ChevronLeft" size={14} />
              НАЗАД
            </button>

            <div className="font-mono text-[10px] text-gray-700">
              {step + 1} / {STEPS.length}
            </div>

            {isLast ? (
              <button
                onClick={onRegister}
                className="flex items-center gap-2 font-orbitron text-sm px-8 py-3 border-2 border-cyber-cyan text-cyber-cyan bg-cyber-cyan/15 hover:bg-cyber-cyan/25 transition-all"
                style={{ boxShadow: '0 0 25px #00ffff20' }}
              >
                <Icon name="Zap" size={14} />
                НАЧАТЬ ИГРУ!
              </button>
            ) : (
              <button
                onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
                className="flex items-center gap-2 font-orbitron text-xs px-5 py-3 border transition-all"
                style={{ borderColor: current.color, color: current.color, backgroundColor: current.color + '12' }}
              >
                ДАЛЕЕ
                <Icon name="ChevronRight" size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
