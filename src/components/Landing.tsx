import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';

// ─── Демо: «живой» терминал на главной ────────────────────────────────────────
const DEMO_STEPS = [
  { code: 'name = "Агент"', output: '' },
  { code: 'print(f"Привет, {name}!")', output: 'Привет, Агент!' },
  { code: 'for i in range(3):', output: '' },
  { code: '    print(f"Урок {i+1}")', output: 'Урок 1\nУрок 2\nУрок 3' },
];

// ─── Что узнаешь — модули курса ───────────────────────────────────────────────
const COURSE_MODULES = [
  { num: '01', title: 'Переменные и типы', desc: 'Что такое числа, строки, булевы — основа любого кода',           icon: 'Box',     color: '#00ff41' },
  { num: '02', title: 'Условия if / else',  desc: 'Учим программу принимать решения',                                icon: 'GitBranch', color: '#00ff41' },
  { num: '03', title: 'Циклы for / while',  desc: 'Повторяющиеся действия — основа автоматизации',                   icon: 'RotateCw', color: '#00aaff' },
  { num: '04', title: 'Функции',            desc: 'Свои собственные команды, которые можно вызывать',                 icon: 'Code',    color: '#00aaff' },
  { num: '05', title: 'Списки и словари',   desc: 'Как хранить и обрабатывать много данных',                          icon: 'Database', color: '#aa00ff' },
  { num: '06', title: 'Классы и ООП',       desc: 'Создание своих объектов — финальный шаг к настоящему разработчику', icon: 'Layers', color: '#ffaa00' },
];

// ─── Почему именно так ────────────────────────────────────────────────────────
const WHY_FEATURES = [
  { icon: 'Gamepad2',   title: 'Учишься играя',    desc: 'Не скучные курсы — а квесты, бои, подземелья. Прокачка персонажа от каждого пройденного урока.',         color: '#00ffff' },
  { icon: 'PenLine',    title: 'Сразу пишешь код', desc: 'Каждый урок — теория и тут же редактор с настоящим Python. Без установки. Прямо в браузере.',           color: '#00ff41' },
  { icon: 'BookOpen',   title: 'Для новичков',     desc: 'Никаких сложных терминов. Объяснения простым языком с примерами из жизни. Начинай с нуля.',             color: '#aa00ff' },
  { icon: 'Trophy',     title: 'Видишь прогресс',  desc: 'Уровень, опыт, достижения, рейтинг. Каждое действие в игре приближает к цели — выучить Python.',         color: '#ffaa00' },
];

// ─── Кому подойдёт ────────────────────────────────────────────────────────────
const AUDIENCE = [
  { icon: '🎓', title: 'Школьникам и студентам', desc: 'Если хочешь начать программировать, но скучные учебники — не твоё.' },
  { icon: '💼', title: 'Тем, кто меняет профессию', desc: 'Python — самый востребованный язык. Освой базу за пару недель.' },
  { icon: '🎮', title: 'Геймерам',                desc: 'Прокачка персонажа + обучение языку в одном флаконе.' },
  { icon: '🤔', title: 'Просто любопытным',       desc: 'Хотел попробовать программирование? Самое время — это бесплатно.' },
];

// ─── 3 шага «как начать» ──────────────────────────────────────────────────────
const STEPS = [
  { num: '1', title: 'Создай агента',          desc: 'Выбери один из двух классов, придумай имя.' },
  { num: '2', title: 'Открой первый урок',     desc: 'Прочитай теорию, посмотри пример, реши задачу.' },
  { num: '3', title: 'Получай XP и прокачивай', desc: 'Растёшь сам — растёт персонаж. Дальше — квесты, бои, друзья.' },
];

interface Props {
  onLogin:    () => void;
  onRegister: () => void;
  onTutorial: () => void;
}

export default function Landing({ onLogin, onRegister, onTutorial }: Props) {
  const [step, setStep] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  // Прокручиваемый демо-терминал
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % DEMO_STEPS.length), 1800);
    return () => clearInterval(t);
  }, []);

  const visible = DEMO_STEPS.slice(0, step + 1);

  return (
    <div className="min-h-screen bg-cyber-dark text-white overflow-x-hidden relative">
      {/* Фон */}
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
      <div className="absolute top-0 left-1/3 w-[700px] h-[700px] bg-cyber-cyan/4 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-cyber-magenta/4 rounded-full blur-3xl pointer-events-none" />

      {/* ── HEADER ── */}
      <header className="relative z-30 flex items-center justify-between px-5 lg:px-12 py-4 border-b border-white/5 sticky top-0 bg-cyber-dark/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="font-orbitron text-2xl font-black">
            <span className="text-cyber-cyan">CODE</span><span className="text-cyber-magenta">RPG</span>
          </div>
          <span className="hidden lg:block font-mono text-[10px] text-gray-700 border border-gray-800 px-2 py-0.5">
            BETA · обучение Python
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onTutorial}
            className="hidden sm:flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 border border-white/10 text-gray-400 hover:border-cyber-green hover:text-cyber-green transition-all"
          >
            <Icon name="HelpCircle" size={12} />
            ЧТО ЭТО?
          </button>
          <button
            onClick={onLogin}
            className="font-orbitron text-xs px-4 py-2 border border-cyber-cyan/40 text-cyber-cyan hover:bg-cyber-cyan/10 transition-all"
          >
            ВОЙТИ
          </button>
          <button
            onClick={onRegister}
            className="font-orbitron text-xs px-4 py-2 border border-cyber-magenta bg-cyber-magenta/10 text-cyber-magenta hover:bg-cyber-magenta/20 transition-all"
          >
            НАЧАТЬ
          </button>
        </div>
      </header>

      {/* ─────────── HERO ─────────── */}
      <section ref={heroRef} className="relative z-10 px-6 lg:px-12 pt-12 lg:pt-16 pb-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 items-center">

          {/* Левая часть — оффер */}
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-[10px] text-cyber-green border border-cyber-green/30 bg-cyber-green/5 px-3 py-1 mb-5 tracking-widest">
              <span className="w-1.5 h-1.5 bg-cyber-green rounded-full animate-pulse" />
              ОНЛАЙН-ИГРА · УЧИТ PYTHON · БЕСПЛАТНО
            </div>

            <h1 className="font-orbitron text-4xl lg:text-6xl font-black leading-tight mb-5">
              Выучи <span className="text-cyber-cyan">Python</span>
              <br />играя в <span className="text-cyber-magenta">RPG</span>
            </h1>

            <p className="text-gray-300 font-rajdhani text-lg leading-relaxed mb-8 max-w-xl">
              Это не курс — это игра, в которой ты постепенно учишься программировать.
              Создаёшь персонажа, проходишь уроки, выполняешь квесты — и пишешь
              настоящий код прямо в браузере. Подойдёт даже если ты <b className="text-white">никогда раньше не программировал</b>.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <button
                onClick={onRegister}
                className="font-orbitron text-sm px-7 py-4 border-2 border-cyber-cyan text-cyber-cyan bg-cyber-cyan/10 hover:bg-cyber-cyan/20 transition-all flex items-center gap-2"
                style={{ boxShadow: '0 0 30px #00ffff25' }}
              >
                <Icon name="Zap" size={16} />
                НАЧАТЬ — БЕСПЛАТНО
              </button>
              <button
                onClick={onTutorial}
                className="font-orbitron text-sm px-6 py-4 border border-white/15 text-gray-300 hover:border-white/40 hover:text-white transition-all flex items-center gap-2"
              >
                <Icon name="PlayCircle" size={16} />
                ПОСМОТРЕТЬ ТУР
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4 max-w-md">
              {[
                { val: '15',   label: 'уроков' },
                { val: 'ООП',  label: 'и база' },
                { val: '2',    label: 'класса' },
                { val: '∞',    label: 'практики' },
              ].map(s => (
                <div key={s.label}>
                  <div className="font-orbitron text-xl font-black text-cyber-cyan">{s.val}</div>
                  <div className="font-mono text-[10px] text-gray-600 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Правая часть — живой терминал */}
          <div className="relative">
            <div className="border border-cyber-cyan/30 bg-black/60 backdrop-blur shadow-2xl"
              style={{ boxShadow: '0 0 60px #00ffff15' }}>
              {/* Окно */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-cyber-cyan/15 bg-black/40">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-cyber-green/60" />
                <span className="ml-3 font-mono text-[10px] text-gray-500">lesson_01.py — твой первый Python</span>
              </div>
              {/* Код */}
              <div className="p-5 font-mono text-sm min-h-[280px]">
                {visible.map((line, i) => (
                  <div key={i} className="mb-1">
                    <div className="flex items-start gap-3">
                      <span className="text-gray-700 select-none">{String(i + 1).padStart(2, '0')}</span>
                      <span className="text-cyber-cyan">{line.code}</span>
                    </div>
                    {line.output && (
                      <div className="ml-9 mt-1 text-cyber-green text-xs whitespace-pre">
                        {line.output}
                      </div>
                    )}
                  </div>
                ))}
                {step < DEMO_STEPS.length && <span className="text-cyber-cyan animate-pulse">█</span>}
              </div>
              {/* Plate */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-cyber-cyan/15 bg-black/40">
                <span className="font-mono text-[10px] text-gray-600">▸ Python 3.11</span>
                <span className="font-mono text-[10px] text-cyber-green">✓ выполнено</span>
              </div>
            </div>

            <div className="hidden lg:block absolute -bottom-6 -right-6 px-4 py-3 border border-cyber-magenta/40 bg-cyber-dark/90 backdrop-blur shadow-xl">
              <div className="flex items-center gap-2">
                <Icon name="Trophy" size={16} className="text-cyber-magenta" />
                <div>
                  <div className="font-orbitron text-xs text-cyber-magenta">+50 XP</div>
                  <div className="font-mono text-[9px] text-gray-500">первый print()</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── ЧТО ИЗУЧИШЬ ─────────── */}
      <section className="relative z-10 px-6 lg:px-12 py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-2">// ПРОГРАММА КУРСА</div>
            <h2 className="font-orbitron text-3xl lg:text-4xl font-black mb-3">
              Что ты узнаешь
            </h2>
            <p className="text-gray-400 font-rajdhani text-lg max-w-xl mx-auto">
              База Python + ООП. От первой переменной до собственных классов.
              Каждый модуль — теория, примеры и практика.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COURSE_MODULES.map(m => (
              <div key={m.num}
                className="border p-5 transition-all hover:translate-y-[-3px] group cursor-default"
                style={{ borderColor: m.color + '20', backgroundColor: m.color + '04' }}>
                <div className="flex items-start justify-between mb-3">
                  <span className="font-orbitron text-3xl font-black text-gray-800 group-hover:text-white transition-colors">
                    {m.num}
                  </span>
                  <Icon name={m.icon as 'Box'} size={20} style={{ color: m.color }} />
                </div>
                <h3 className="font-orbitron text-base font-bold mb-2" style={{ color: m.color }}>
                  {m.title}
                </h3>
                <p className="text-gray-500 font-rajdhani text-sm leading-snug">{m.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={onRegister}
              className="inline-flex items-center gap-2 font-orbitron text-sm px-6 py-3 border border-cyber-cyan/50 text-cyber-cyan hover:bg-cyber-cyan/10 transition-all"
            >
              Перейти к урокам
              <Icon name="ArrowRight" size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ─────────── ПОЧЕМУ ИМЕННО ТАК ─────────── */}
      <section className="relative z-10 px-6 lg:px-12 py-20 border-t border-white/5 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-2">// ПОЧЕМУ ИГРА</div>
            <h2 className="font-orbitron text-3xl lg:text-4xl font-black mb-3">
              Почему это работает
            </h2>
            <p className="text-gray-400 font-rajdhani text-lg max-w-2xl mx-auto">
              Скучные курсы бросают через неделю. Здесь обучение — внутри игры:
              новичок не замечает, как учится.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WHY_FEATURES.map(f => (
              <div key={f.title}
                className="border p-5 transition-all hover:translate-y-[-3px]"
                style={{ borderColor: f.color + '25', backgroundColor: f.color + '05' }}>
                <div className="w-10 h-10 mb-4 flex items-center justify-center border"
                  style={{ borderColor: f.color + '50', backgroundColor: f.color + '10' }}>
                  <Icon name={f.icon as 'Gamepad2'} size={18} style={{ color: f.color }} />
                </div>
                <h3 className="font-orbitron text-base font-bold mb-2 text-white">
                  {f.title}
                </h3>
                <p className="text-gray-500 font-rajdhani text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── КОМУ ПОДОЙДЁТ ─────────── */}
      <section className="relative z-10 px-6 lg:px-12 py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-2">// АУДИТОРИЯ</div>
            <h2 className="font-orbitron text-3xl lg:text-4xl font-black mb-3">
              Это для тебя, если…
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {AUDIENCE.map(a => (
              <div key={a.title}
                className="border border-white/8 p-5 hover:border-white/20 transition-all flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">{a.icon}</div>
                <div>
                  <h3 className="font-orbitron text-base font-bold mb-1.5 text-white">{a.title}</h3>
                  <p className="text-gray-500 font-rajdhani text-sm leading-snug">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── КАК НАЧАТЬ ─────────── */}
      <section className="relative z-10 px-6 lg:px-12 py-20 border-t border-white/5 bg-black/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-2">// 3 ШАГА</div>
            <h2 className="font-orbitron text-3xl lg:text-4xl font-black mb-3">
              Как начать
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {STEPS.map((s, i) => (
              <div key={s.num} className="border border-cyber-cyan/15 bg-cyber-cyan/3 p-6 relative">
                <div className="absolute -top-4 left-5 w-8 h-8 border border-cyber-cyan bg-cyber-dark flex items-center justify-center font-orbitron text-cyber-cyan font-black">
                  {s.num}
                </div>
                <h3 className="font-orbitron text-base font-bold mt-4 mb-2 text-cyber-cyan">{s.title}</h3>
                <p className="text-gray-400 font-rajdhani text-sm leading-snug">{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <Icon name="ChevronRight" size={20} className="hidden sm:block absolute right-[-22px] top-1/2 -translate-y-1/2 text-cyber-cyan/30" />
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={onRegister}
              className="font-orbitron text-sm px-8 py-4 border-2 border-cyber-magenta bg-cyber-magenta/10 text-cyber-magenta hover:bg-cyber-magenta/20 transition-all inline-flex items-center gap-2"
              style={{ boxShadow: '0 0 30px #ff00ff25' }}
            >
              <Icon name="Zap" size={16} />
              СОЗДАТЬ АККАУНТ
            </button>
            <div className="font-mono text-[10px] text-gray-600 mt-3">
              Без карты · без скрытых платежей · 2 минуты на регистрацию
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── FAQ ─────────── */}
      <section className="relative z-10 px-6 lg:px-12 py-20 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-2">// ЧАСТЫЕ ВОПРОСЫ</div>
            <h2 className="font-orbitron text-3xl font-black mb-3">FAQ</h2>
          </div>

          <div className="space-y-3">
            {[
              { q: 'Нужно что-то устанавливать?',     a: 'Нет. Python работает прямо в браузере — открыл сайт и пишешь код.' },
              { q: 'Это правда бесплатно?',           a: 'Да. Сейчас идёт бета-тестирование, весь функционал доступен бесплатно.' },
              { q: 'А если я совсем новичок?',        a: 'Курс рассчитан именно на новичков. Объяснения простым языком, маленькие задачи, плавный рост сложности.' },
              { q: 'Чему конкретно научусь?',         a: 'Python с нуля + ООП: переменные, типы, условия, циклы, функции, коллекции, классы. Этой базы хватает для любого направления — веб, аналитика, ML.' },
              { q: 'Сколько времени уйдёт?',          a: 'Зависит от темпа. Большинство проходят базу за 2-3 недели по 20-30 минут в день.' },
              { q: 'Что за «классы» при регистрации?', a: 'Это игровые классы персонажа (как в RPG). Программа обучения одинаковая для обоих — разные только бонусы в боях и данжах.' },
            ].map((item, i) => (
              <details key={i} className="border border-white/8 group">
                <summary className="cursor-pointer list-none flex items-center justify-between px-5 py-4 hover:bg-white/3 transition-all">
                  <span className="font-orbitron text-sm text-white">{item.q}</span>
                  <Icon name="ChevronDown" size={16} className="text-gray-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-4 text-gray-400 font-rajdhani text-sm leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── FINAL CTA ─────────── */}
      <section className="relative z-10 px-6 lg:px-12 py-20 border-t border-cyber-cyan/15">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-orbitron text-3xl lg:text-5xl font-black mb-5 leading-tight">
            Готов написать <span className="text-cyber-cyan">первый</span>{' '}
            <span className="text-cyber-magenta">print('Hello')</span>?
          </h2>
          <p className="text-gray-400 font-rajdhani text-lg mb-8 max-w-xl mx-auto">
            Регистрация занимает минуту. Первый урок открыт сразу — попробуй и реши сам, твоё это или нет.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={onRegister}
              className="font-orbitron text-sm px-8 py-4 border-2 border-cyber-cyan text-cyber-cyan bg-cyber-cyan/10 hover:bg-cyber-cyan/20 transition-all inline-flex items-center gap-2"
              style={{ boxShadow: '0 0 30px #00ffff30' }}
            >
              <Icon name="Zap" size={16} />
              НАЧАТЬ ИГРУ
            </button>
            <button
              onClick={onLogin}
              className="font-orbitron text-sm px-6 py-4 border border-white/20 text-gray-300 hover:border-white/50 hover:text-white transition-all inline-flex items-center gap-2"
            >
              У меня уже есть аккаунт
            </button>
          </div>
        </div>
      </section>

      {/* ─────────── FOOTER ─────────── */}
      <footer className="relative z-10 px-6 lg:px-12 py-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="font-orbitron text-sm font-black">
            <span className="text-cyber-cyan">CODE</span><span className="text-cyber-magenta">RPG</span>
            <span className="font-mono text-[10px] text-gray-700 ml-3">BETA · 2087 CodeGrid-9</span>
          </div>
          <div className="flex items-center gap-5 font-mono text-[10px] text-gray-600">
            <span>Python · ООП · игровое обучение</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
