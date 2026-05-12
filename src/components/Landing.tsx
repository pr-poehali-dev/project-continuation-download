import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

const BOOT_LINES = [
  '> ИНИЦИАЛИЗАЦИЯ CODEGRID-9...',
  '> ШИФРОВАНИЕ КАНАЛА... [OK]',
  '> ОБХОД NEXUS-FIREWALL... [OK]',
  '> THE ARCHIVE ОНЛАЙН. ДОБРО ПОЖАЛОВАТЬ, АГЕНТ.',
];

const FEATURES = [
  {
    icon: '📡',
    title: 'Изучай Python',
    desc: 'Структурированные уроки от переменных до архитектуры. Читай теорию, смотри примеры, пиши код прямо в браузере.',
    color: '#00ff41',
  },
  {
    icon: '⚔️',
    title: 'Code Combat',
    desc: 'Сражайся с агентами NEXUS: пиши код — наноси урон. Action Phase, таймер, способности по классу.',
    color: '#ff00ff',
  },
  {
    icon: '🏰',
    title: 'Подземелья',
    desc: 'Данжи с вопросами на знание Python. Выбирай ответы, проходи уровни, получай редкий лут.',
    color: '#ffaa00',
  },
  {
    icon: '📜',
    title: 'Квесты',
    desc: 'Сюжетные задания от The Archive. Каждый квест — история и задача на программирование.',
    color: '#00aaff',
  },
  {
    icon: '🛠️',
    title: 'Крафт',
    desc: 'Создавай уникальные импланты из ресурсов. Чем лучше твой код — тем мощнее снаряжение.',
    color: '#aa00ff',
  },
  {
    icon: '🏆',
    title: 'Арена',
    desc: 'Syntax Colosseum — рейтинговые бои. Покажи, кто лучший хакер CodeGrid-9.',
    color: '#ffff00',
  },
];

const CLASSES = [
  {
    img: 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/7f113432-59e4-40e8-abfa-c189c7478bd7.jpg',
    name: 'Hacker',
    desc: 'Скрипты · Автоматизация · Глитч',
    color: '#00ff41',
    perks: ['Lambda Strike', 'Data Breach'],
  },
  {
    img: 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/2fd8ffba-85dd-4b30-aba1-ceb9dd168a5e.jpg',
    name: 'Python-Junior',
    desc: 'Универсал · Баланс · Адаптация',
    color: '#ff00ff',
    perks: ['For Loop Barrage', 'If-Else Defense'],
  },
  {
    img: 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/ba390b4d-c17b-4e41-933f-463af7aa414a.jpg',
    name: 'Py-Backend',
    desc: 'Архитектура · API · AoE',
    color: '#6644ff',
    perks: ['API Summon', 'Database Strike'],
  },
];

const FACTIONS = [
  { name: 'NEXUS', color: '#ff4060', role: 'Антагонист' },
  { name: 'THE ARCHIVE', color: '#00ff41', role: 'Сопротивление' },
  { name: 'BLACK SYNTAX', color: '#aa00ff', role: 'Синдикат' },
  { name: 'ORDER OF CLEAN CODE', color: '#00ffff', role: 'Секта' },
];

interface Props {
  onLogin: () => void;
  onRegister: () => void;
  onTutorial: () => void;
}

export default function Landing({ onLogin, onRegister, onTutorial }: Props) {
  const [bootLine, setBootLine] = useState(0);
  const [activeClass, setActiveClass] = useState(0);

  useEffect(() => {
    if (bootLine < BOOT_LINES.length) {
      const t = setTimeout(() => setBootLine(l => l + 1), 350);
      return () => clearTimeout(t);
    }
  }, [bootLine]);

  useEffect(() => {
    const t = setInterval(() => setActiveClass(c => (c + 1) % CLASSES.length), 3500);
    return () => clearInterval(t);
  }, []);

  const cls = CLASSES[activeClass];

  return (
    <div className="min-h-screen bg-cyber-dark relative overflow-x-hidden">
      <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none" />
      <div className="absolute inset-0 scanlines pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyber-cyan/3 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyber-magenta/3 rounded-full blur-3xl pointer-events-none" />

      {/* ── HEADER ── */}
      <header className="relative z-30 flex items-center justify-between px-5 lg:px-12 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="font-orbitron text-2xl font-black">
            <span className="text-cyber-cyan">CODE</span><span className="text-cyber-magenta">RPG</span>
          </div>
          <span className="hidden lg:block font-mono text-[10px] text-gray-700 border border-gray-800 px-2 py-0.5">
            v2.087 · CodeGrid-9
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onTutorial}
            className="hidden sm:flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 border border-cyber-green/30 text-cyber-green/70 hover:border-cyber-green hover:text-cyber-green transition-all"
          >
            <Icon name="BookOpen" size={12} />
            ТУТОРИАЛ
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

      {/* ── HERO ── */}
      <section className="relative z-10 flex flex-col lg:flex-row items-center min-h-[90vh] px-6 lg:px-16 py-10 gap-10">
        {/* Left */}
        <div className="flex-1 max-w-2xl">
          {/* Boot terminal */}
          <div className="mb-6 font-mono text-xs space-y-0.5 h-16 overflow-hidden">
            {BOOT_LINES.slice(0, bootLine).map((line, i) => (
              <div key={i} className={i === bootLine - 1 ? 'text-cyber-cyan animate-pulse' : 'text-gray-700'}>
                {line}
              </div>
            ))}
          </div>

          <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-3">
            // 2087 · МЕГАПОЛИС CODEGRID-9 · PYTHON ВНЕ ЗАКОНА
          </div>

          <h1 className="font-orbitron text-4xl lg:text-6xl font-black text-white leading-tight mb-5">
            НАПИШИ КОД.<br />
            <span className="text-cyber-cyan">ИЗМЕНИ</span>{' '}
            <span className="text-cyber-magenta">СИСТЕМУ</span>.
          </h1>

          <p className="text-gray-400 font-rajdhani text-lg leading-relaxed mb-8 max-w-lg">
            Корпорация NEXUS запретила Python. The Archive сопротивляется.
            Стань нетраннером — учись программировать, побеждай врагов,
            меняй мир через код.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-3 mb-10">
            <button
              onClick={onRegister}
              className="font-orbitron text-sm px-8 py-4 border-2 border-cyber-cyan text-cyber-cyan bg-cyber-cyan/10 hover:bg-cyber-cyan/20 transition-all flex items-center gap-2"
              style={{ boxShadow: '0 0 30px #00ffff20' }}
            >
              <Icon name="Zap" size={16} />
              НАЧАТЬ ИГРУ — БЕСПЛАТНО
            </button>
            <button
              onClick={onTutorial}
              className="font-orbitron text-sm px-6 py-4 border border-cyber-green/50 text-cyber-green/80 hover:border-cyber-green hover:text-cyber-green transition-all flex items-center gap-2"
            >
              <Icon name="BookOpen" size={16} />
              КАК ИГРАТЬ?
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-8">
            {[
              { val: '50+', label: 'уроков Python' },
              { val: '4', label: 'акта сюжета' },
              { val: '3', label: 'класса' },
              { val: '100+', label: 'предметов' },
            ].map(s => (
              <div key={s.label}>
                <div className="font-orbitron text-xl text-cyber-cyan font-black">{s.val}</div>
                <div className="font-mono text-[10px] text-gray-600 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: class showcase */}
        <div className="flex-shrink-0 w-full lg:w-80 flex flex-col items-center">
          <div
            className="w-56 h-72 overflow-hidden border-2 transition-all duration-700 relative mb-4"
            style={{
              borderColor: cls.color,
              boxShadow: `0 0 50px ${cls.color}30, inset 0 0 20px ${cls.color}08`,
              clipPath: 'polygon(0 0, 92% 0, 100% 8%, 100% 100%, 8% 100%, 0 92%)',
            }}
          >
            <img src={cls.img} alt={cls.name} className="w-full h-full object-cover object-top transition-all duration-700" />
            {/* Тёмный градиент снизу — текст не сливается */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(5,10,14,0.92) 0%, rgba(5,10,14,0.4) 45%, transparent 70%)' }} />
            <div className="absolute bottom-3 left-3 right-3">
              <div className="font-orbitron text-sm font-black drop-shadow-lg" style={{ color: cls.color, textShadow: `0 0 12px ${cls.color}` }}>{cls.name}</div>
              <div className="font-mono text-[10px] text-gray-300">{cls.desc}</div>
            </div>
          </div>
          {/* Перки */}
          <div className="flex gap-2 mb-4">
            {cls.perks.map(p => (
              <span key={p} className="font-mono text-[10px] px-2 py-0.5 border"
                style={{ borderColor: cls.color + '50', color: cls.color }}>
                {p}
              </span>
            ))}
          </div>
          {/* Dots */}
          <div className="flex gap-2">
            {CLASSES.map((_, i) => (
              <button key={i} onClick={() => setActiveClass(i)}
                className="w-2 h-2 rounded-full transition-all"
                style={{ backgroundColor: i === activeClass ? CLASSES[i].color : '#333', boxShadow: i === activeClass ? `0 0 8px ${CLASSES[i].color}` : 'none' }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── FACTIONS ── */}
      <section className="relative z-10 px-6 lg:px-16 py-8 border-y border-white/5">
        <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start">
          <span className="font-mono text-[10px] text-gray-600 mr-2">ФРАКЦИИ:</span>
          {FACTIONS.map(f => (
            <div key={f.name} className="flex items-center gap-2 border px-3 py-1.5"
              style={{ borderColor: f.color + '40', backgroundColor: f.color + '06' }}>
              <span className="font-mono text-[10px] font-bold" style={{ color: f.color }}>{f.name}</span>
              <span className="text-gray-600 font-mono text-[9px]">{f.role}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative z-10 px-6 lg:px-16 py-16">
        <div className="text-center mb-12">
          <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-2">// ВОЗМОЖНОСТИ СИСТЕМЫ</div>
          <h2 className="font-orbitron text-2xl lg:text-3xl text-white">
            ЧТО ТЕБЯ <span className="text-cyber-cyan">ЖДЁТ</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {FEATURES.map(f => (
            <div key={f.title}
              className="border p-5 hover:translate-y-[-2px] transition-all duration-200 group cursor-default"
              style={{ borderColor: f.color + '20', backgroundColor: f.color + '04' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = f.color + '60'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = f.color + '20'; }}
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <div className="font-orbitron text-sm font-bold mb-2" style={{ color: f.color }}>{f.title}</div>
              <p className="text-gray-500 font-rajdhani text-sm leading-snug">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative z-10 px-6 lg:px-16 py-16 bg-black/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-2">// КАК ЭТО РАБОТАЕТ</div>
            <h2 className="font-orbitron text-2xl text-white">ПУТЬ <span className="text-cyber-green">НЕТРАННЕРА</span></h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Регистрируйся', desc: 'Создай аккаунт и выбери класс — Hacker, Python-Junior или Backend', color: '#00ff41' },
              { step: '02', title: 'Читай теорию', desc: 'Библиотека знаний: каждая тема с примерами, интерактивными блоками', color: '#00aaff' },
              { step: '03', title: 'Выполняй миссии', desc: 'Квесты, подземелья, Code Combat — применяй знания на практике', color: '#ff00ff' },
              { step: '04', title: 'Прокачивайся', desc: 'Опыт, уровни, экипировка, импланты — расти как хакер и программист', color: '#ffaa00' },
            ].map(item => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div className="font-orbitron text-4xl font-black mb-3" style={{ color: item.color + '40' }}>{item.step}</div>
                <div className="font-orbitron text-sm mb-2" style={{ color: item.color }}>{item.title}</div>
                <p className="text-gray-600 font-rajdhani text-sm leading-snug">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 px-6 lg:px-16 py-20 text-center">
        <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-4">// ПРИСОЕДИНЯЙСЯ К СОПРОТИВЛЕНИЮ</div>
        <h2 className="font-orbitron text-3xl lg:text-4xl font-black text-white mb-6">
          ГОТОВ СТАТЬ <span className="text-cyber-cyan">ХАКЕРОМ</span>?
        </h2>
        <p className="text-gray-500 font-rajdhani text-lg mb-8 max-w-md mx-auto">
          The Archive ждёт тебя. Python ждёт тебя. Бесплатно, навсегда.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={onRegister}
            className="font-orbitron text-base px-10 py-5 border-2 border-cyber-cyan text-cyber-cyan bg-cyber-cyan/10 hover:bg-cyber-cyan/20 transition-all"
            style={{ boxShadow: '0 0 40px #00ffff25' }}
          >
            СОЗДАТЬ ПЕРСОНАЖА
          </button>
          <button
            onClick={onLogin}
            className="font-orbitron text-base px-8 py-5 border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all"
          >
            УЖЕ ЕСТЬ АККАУНТ
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 px-6 lg:px-16 py-6 border-t border-white/5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="font-orbitron text-sm">
            <span className="text-cyber-cyan">CODE</span><span className="text-cyber-magenta">RPG</span>
          </div>
          <div className="font-mono text-[10px] text-gray-700">
            // КОД — ЭТО ОРУЖИЕ · CODEGRID-9 · 2087 · PYTHON IS FORBIDDEN · BUT NOT HERE
          </div>
        </div>
      </footer>
    </div>
  );
}