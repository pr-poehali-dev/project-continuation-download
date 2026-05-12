import { useState } from 'react';
import { useGame } from '@/lib/GameContext';
import { api } from '@/lib/api';
import Icon from '@/components/ui/icon';

// ─── 3 класса с новым лором и направлениями ──────────────────────────────────
// CLASS 1: CIPHER — изучает Python от А до Я (чистый код, скрипты, автоматизация)
// CLASS 2: DATA GHOST — Python + Data Science (аналитика, ML, визуализация)
// CLASS 3: NEURAL ARCHITECT — Python + AI/NN (нейросети, создание своего ИИ)

const CLASSES = [
  {
    id: 'cipher',
    name: 'CIPHER',
    codename: 'Шифровщик',
    subtitle: '// Python · Scripting · Automation',
    focus: 'Полный Python от основ до архитектуры',
    lore: 'Хранители чистого кода. Cipher-агенты — фундамент The Archive. Они знают Python лучше самого создателя языка. Каждый скрипт — оружие. Каждая функция — удар по NEXUS. Их учат с нуля: переменные, структуры данных, ООП, алгоритмы, декораторы, asyncio.',
    desc: 'Универсальный Python-мастер. Изучает язык полностью — от Hello World до продвинутых паттернов. Лучший старт для тех, кто хочет освоить программирование без ограничений.',
    imgMale:   'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/ab60e642-3eb1-4491-a0d5-fc580d0d09f2.jpg',
    imgFemale: 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/aaadee3b-ebb4-4fcd-9a7e-f82a044e9338.jpg',
    stats: { strength: 10, agility: 12, intelligence: 14, defense: 9, luck: 10 },
    color: '#00ff41',
    perks: ['Lambda Strike', 'Infinite Loop Trap', 'Data Breach'],
    path: ['Синтаксис', 'ООП', 'Алгоритмы', 'Asyncio', 'Архитектура'],
    strengths: ['⚡ Универсальность', '📚 Глубокие знания', '🔧 Чистый код'],
    factionQuote: '"Знаешь Python — знаешь всё остальное" — Командующий K4I',
  },
  {
    id: 'data_ghost',
    name: 'DATA GHOST',
    codename: 'Призрак данных',
    subtitle: '// Python · Data Science · ML',
    focus: 'Python + аналитика данных и машинное обучение',
    lore: 'Data Ghost-агенты — аналитики подполья. Пока другие воюют, они читают данные. Они видят паттерны в хаосе, находят уязвимости NEXUS в потоках информации. Их оружие — pandas, numpy, sklearn. Их бои — не в коридорах, а в датасетах.',
    desc: 'Аналитик данных и специалист по ML. Учит Python через призму Data Science: работа с данными, визуализация, алгоритмы машинного обучения. Для тех кто хочет работать с данными.',
    imgMale:   'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/1b0d5c41-5e94-4d1a-acb8-284f7932d90a.jpg',
    imgFemale: 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/51824707-ba1b-49e7-92eb-66cb595882b2.jpg',
    stats: { strength: 8, agility: 10, intelligence: 17, defense: 8, luck: 12 },
    color: '#00aaff',
    perks: ['Data Breach', 'Pattern Recognition', 'Predictive Strike'],
    path: ['NumPy', 'Pandas', 'Matplotlib', 'Scikit-learn', 'ML Модели'],
    strengths: ['🔍 Аналитика', '📊 Визуализация данных', '🤖 ML модели'],
    factionQuote: '"Данные не лгут. NEXUS лжёт. Я работаю с данными." — VERA, инженер Archive',
  },
  {
    id: 'neural_architect',
    name: 'NEURAL ARCHITECT',
    codename: 'Архитектор нейросетей',
    subtitle: '// Python · Deep Learning · AI',
    focus: 'Создание искусственного интеллекта',
    lore: 'Neural Architect-агенты — создатели нового разума. NEXUS контролирует ИИ-инфраструктуру города. Но Archive строит своих агентов. Те, кто освоил TensorFlow и PyTorch, могут создать ИИ который освободит CodeGrid-9 от алгоритмической тирании.',
    desc: 'Создатель искусственного интеллекта. Изучает нейронные сети, deep learning, PyTorch/TensorFlow. Финальная цель — создать собственный ИИ-агент. Самый сложный путь, самые мощные способности.',
    imgMale:   'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/a36ed9fa-ba2d-4c24-967a-4716846cf3b1.jpg',
    imgFemale: 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/4e75dd39-a1a7-4c74-a594-2154ba16128c.jpg',
    stats: { strength: 7, agility: 8, intelligence: 20, defense: 9, luck: 8 },
    color: '#aa00ff',
    perks: ['Neural Overload', 'Backprop Strike', 'Model Summon'],
    path: ['Линейная алгебра', 'PyTorch', 'CNN/RNN', 'Трансформеры', 'AGI'],
    strengths: ['💥 Максимальный интеллект', '🧠 AI-способности', '🌊 AoE атаки'],
    factionQuote: '"Создай ИИ. Освободи город." — PYTH-0N',
  },
];

const STAT_LABELS: Record<string, string> = {
  strength: 'Сила', agility: 'Ловкость', intelligence: 'Интеллект', defense: 'Защита', luck: 'Удача',
};
const STAT_COLORS: Record<string, string> = {
  strength: '#ff4060', agility: '#ffff00', intelligence: '#00ffff', defense: '#00ff41', luck: '#aa00ff',
};
const STAT_MAX: Record<string, number> = {
  strength: 20, agility: 20, intelligence: 20, defense: 20, luck: 20,
};

type Gender = 'male' | 'female';

export default function CreateCharacter() {
  const { setCharacter, username } = useGame();
  const [name, setName] = useState(username || '');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [gender, setGender] = useState<Gender>('male');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cls = CLASSES[selectedIdx];
  const currentImg = gender === 'male' ? cls.imgMale : cls.imgFemale;

  const prev = () => setSelectedIdx(i => (i - 1 + CLASSES.length) % CLASSES.length);
  const next = () => setSelectedIdx(i => (i + 1) % CLASSES.length);

  const create = async () => {
    if (!name.trim() || name.length < 2) { setError('Имя минимум 2 символа'); return; }
    setLoading(true);
    const data = await api.character.create(name.trim(), cls.id);
    setLoading(false);
    if (data.error) setError(data.error);
    else setCharacter(data);
  };

  return (
    <div className="min-h-screen bg-cyber-dark relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="absolute inset-0 scanlines pointer-events-none" />
      <div className="absolute inset-0 transition-all duration-1000"
        style={{ background: `radial-gradient(ellipse at 30% 50%, ${cls.color}08 0%, transparent 60%)` }} />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 lg:px-12 py-4 border-b border-white/5">
        <div className="font-orbitron text-2xl font-black">
          <span className="text-cyber-cyan">CODE</span><span className="text-cyber-magenta">RPG</span>
        </div>
        <div className="font-mono text-xs text-gray-600 tracking-widest">// СОЗДАНИЕ АГЕНТА · CODEGRID-9</div>
      </header>

      <div className="relative z-10 flex flex-col lg:flex-row min-h-[calc(100vh-65px)]">
        {/* ── LEFT: Character Visual ── */}
        <div className="flex-1 flex flex-col items-center justify-center py-8 px-6 relative">
          <div className="absolute w-72 h-72 rounded-full blur-3xl opacity-10 transition-all duration-700 pointer-events-none"
            style={{ backgroundColor: cls.color }} />

          {/* Class carousel */}
          <div className="relative flex items-center gap-6 mb-6">
            <button onClick={prev} className="text-gray-600 hover:text-white transition-colors z-10 p-2">
              <Icon name="ChevronLeft" size={32} />
            </button>

            <div className="relative">
              <div
                className="w-52 h-68 lg:w-64 lg:h-80 overflow-hidden border-2 transition-all duration-500 relative"
                style={{
                  borderColor: cls.color,
                  boxShadow: `0 0 50px ${cls.color}30, inset 0 0 20px ${cls.color}06`,
                  clipPath: 'polygon(0 0, 92% 0, 100% 8%, 100% 100%, 8% 100%, 0 92%)',
                  height: '320px', width: '220px',
                }}
              >
                <img
                  key={`${cls.id}_${gender}`}
                  src={currentImg}
                  alt={cls.name}
                  className="w-full h-full object-cover object-top transition-all duration-700"
                />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(5,10,14,0.92) 0%, rgba(5,10,14,0.3) 45%, transparent 70%)` }} />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="font-orbitron text-xs font-black drop-shadow-lg" style={{ color: cls.color, textShadow: `0 0 12px ${cls.color}` }}>
                    {cls.name}
                  </div>
                  <div className="font-mono text-[9px] text-gray-300">{cls.codename}</div>
                </div>
              </div>

              {/* Class dots */}
              <div className="flex justify-center gap-2 mt-4">
                {CLASSES.map((c, i) => (
                  <button key={c.id} onClick={() => setSelectedIdx(i)}
                    className="w-2 h-2 rounded-full transition-all duration-300"
                    style={{ backgroundColor: i === selectedIdx ? c.color : '#333', boxShadow: i === selectedIdx ? `0 0 8px ${c.color}` : 'none' }}
                  />
                ))}
              </div>
            </div>

            <button onClick={next} className="text-gray-600 hover:text-white transition-colors z-10 p-2">
              <Icon name="ChevronRight" size={32} />
            </button>
          </div>

          {/* Gender selector */}
          <div className="flex gap-2 mb-5">
            {(['male', 'female'] as const).map(g => (
              <button key={g} onClick={() => setGender(g)}
                className="flex items-center gap-2 px-4 py-2 border font-mono text-xs transition-all"
                style={{
                  borderColor: gender === g ? cls.color : '#333',
                  color: gender === g ? cls.color : '#555',
                  backgroundColor: gender === g ? cls.color + '12' : 'transparent',
                }}>
                {g === 'male' ? '♂ МУЖСКОЙ' : '♀ ЖЕНСКИЙ'}
              </button>
            ))}
          </div>

          {/* Lore quote */}
          <div className="max-w-sm text-center border-l-2 pl-4 italic"
            style={{ borderColor: cls.color + '40' }}>
            <p className="text-gray-600 font-rajdhani text-xs leading-relaxed">{cls.factionQuote}</p>
          </div>
        </div>

        {/* ── RIGHT: Class info + Form ── */}
        <div className="w-full lg:w-[440px] flex flex-col justify-center p-6 lg:p-10 border-t lg:border-t-0 lg:border-l border-white/5 overflow-y-auto">
          {/* Class name + focus */}
          <div className="mb-5">
            <div className="font-mono text-[10px] mb-0.5" style={{ color: cls.color + '80' }}>{cls.subtitle}</div>
            <h2 className="font-orbitron text-xl font-black mb-1" style={{ color: cls.color }}>{cls.name}</h2>
            <div className="font-mono text-[10px] text-gray-500 mb-2">{cls.focus}</div>
            <p className="text-gray-500 font-rajdhani text-sm leading-relaxed mb-3">{cls.desc}</p>

            {/* Learning path */}
            <div className="flex flex-wrap gap-1 mb-3">
              {cls.path.map((p, i) => (
                <span key={p} className="flex items-center gap-1 font-mono text-[9px] px-2 py-0.5"
                  style={{ color: cls.color + 'cc', border: `1px solid ${cls.color}30`, backgroundColor: cls.color + '08' }}>
                  <span className="text-gray-700">{i + 1}.</span>{p}
                </span>
              ))}
            </div>

            {/* Perks */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {cls.perks.map(p => (
                <span key={p} className="font-mono text-[9px] px-2 py-0.5 border"
                  style={{ borderColor: cls.color + '40', color: cls.color + 'cc', backgroundColor: cls.color + '06' }}>
                  ⚡ {p}
                </span>
              ))}
            </div>

            {/* Strengths */}
            <div className="flex flex-wrap gap-2">
              {cls.strengths.map(s => (
                <span key={s} className="font-mono text-[10px] text-gray-600">{s}</span>
              ))}
            </div>
          </div>

          {/* Stats preview */}
          <div className="mb-5 space-y-1.5">
            <div className="font-mono text-[10px] text-gray-600 mb-2 tracking-widest">// СТАТЫ</div>
            {Object.entries(cls.stats).map(([key, val]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="font-mono text-[10px] w-20 text-gray-600">{STAT_LABELS[key]}</span>
                <div className="flex-1 h-1.5 bg-black/60">
                  <div className="h-full transition-all duration-500"
                    style={{ width: `${(val / STAT_MAX[key]) * 100}%`, backgroundColor: STAT_COLORS[key], boxShadow: `0 0 4px ${STAT_COLORS[key]}` }} />
                </div>
                <span className="font-orbitron text-xs w-6 text-right" style={{ color: STAT_COLORS[key] }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Name input */}
          <div className="mb-4">
            <div className="font-mono text-[10px] tracking-wider mb-2" style={{ color: cls.color + '80' }}>// ИМЯ АГЕНТА</div>
            <input
              type="text"
              placeholder="Nova_7"
              value={name}
              maxLength={20}
              onChange={e => { setName(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && create()}
              className="w-full bg-black/60 border px-4 py-3 font-mono text-sm text-white placeholder-gray-700 outline-none transition-all"
              style={{ borderColor: cls.color + '40' }}
              onFocus={e => { e.target.style.borderColor = cls.color + '90'; e.target.style.boxShadow = `0 0 15px ${cls.color}15`; }}
              onBlur={e => { e.target.style.borderColor = cls.color + '40'; e.target.style.boxShadow = 'none'; }}
            />
            {error && <div className="font-mono text-xs text-red-400 mt-1.5">⚠ {error}</div>}
          </div>

          {/* Create button */}
          <button onClick={create} disabled={loading}
            className="w-full py-4 font-orbitron text-sm tracking-widest border-2 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
            style={{
              borderColor: cls.color,
              color: cls.color,
              backgroundColor: cls.color + '15',
              boxShadow: `0 0 30px ${cls.color}20`,
            }}>
            {loading
              ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />ИНИЦИАЛИЗАЦИЯ...</>
              : <><Icon name="Zap" size={16} />СОЗДАТЬ АГЕНТА</>
            }
          </button>

          <div className="mt-3 text-center font-mono text-[10px] text-gray-700">
            CodeGrid-9 · 2087 · The Archive ждёт тебя
          </div>
        </div>
      </div>
    </div>
  );
}