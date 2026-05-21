import { useState, useMemo, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { useGame } from '@/lib/GameContext';
import { progress as progressStore } from '@/lib/progressStore';
import { pushNotif } from '@/components/Notifications';
import { applyXpBonus } from '@/lib/implants';
import { CARDS, DECKS, type DeckId, type Card, getDuelOptions } from '@/data/flashcardsData';

type Mode = 'classic' | 'time' | 'duel' | 'srs';

interface ModeMeta {
  id: Mode;
  title: string;
  desc: string;
  icon: string;
  color: string;
  xpPerCard: number;
}

const MODES: ModeMeta[] = [
  { id: 'classic', title: 'Классика',   desc: 'Переверни карточку, оцени себя. +10 XP за карту',     icon: '🎴', color: '#00ff41', xpPerCard: 10 },
  { id: 'time',    title: 'На время',   desc: '10 сек на ответ, серия даёт мультипликатор XP',        icon: '⏱️', color: '#ffaa00', xpPerCard: 15 },
  { id: 'duel',    title: 'Дуэль кодом', desc: '4 варианта ответа. Ошибка = -10 HP. +20 XP за карту', icon: '⚔️', color: '#ff00ff', xpPerCard: 20 },
  { id: 'srs',     title: 'Повторение',  desc: 'Spaced Repetition: сложные карточки чаще',            icon: '🧠', color: '#aa00ff', xpPerCard: 12 },
];

// ─── Spaced Repetition Storage ──────────────────────────────────────────────

interface SrsState {
  /** card id → { ease, interval (days), dueAt (unix ms), reps } */
  [cardId: string]: { ease: number; interval: number; dueAt: number; reps: number };
}

const SRS_STORAGE_KEY = 'flashcards_srs_v1';
const KNOWN_STORAGE_KEY = 'flashcards_known';

function loadSrs(): SrsState {
  try { return JSON.parse(localStorage.getItem(SRS_STORAGE_KEY) || '{}'); }
  catch { return {}; }
}
function saveSrs(s: SrsState) { localStorage.setItem(SRS_STORAGE_KEY, JSON.stringify(s)); }

function loadKnown(): Set<string> {
  try {
    const raw = localStorage.getItem(KNOWN_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}
function saveKnown(set: Set<string>) {
  localStorage.setItem(KNOWN_STORAGE_KEY, JSON.stringify(Array.from(set)));
}

/**
 * Лёгкий SM-2 без даты: rating 0..3 (опять, тяжело, хорошо, легко)
 * 0: повтор сразу, ease ↓
 * 1: ease −, interval = max(1, interval/2)
 * 2: ease стабилен, interval *= ease
 * 3: ease +, interval *= ease * 1.3
 */
function updateSrs(prev: SrsState[string] | undefined, rating: 0 | 1 | 2 | 3): SrsState[string] {
  const ease = prev?.ease ?? 2.5;
  const reps = prev?.reps ?? 0;
  const interval = prev?.interval ?? 0;
  let newEase = ease;
  let newInterval = interval;
  if (rating === 0) {
    newEase = Math.max(1.3, ease - 0.2);
    newInterval = 0;
  } else if (rating === 1) {
    newEase = Math.max(1.3, ease - 0.15);
    newInterval = Math.max(1, Math.floor(interval / 2));
  } else if (rating === 2) {
    newInterval = Math.max(1, Math.round(interval * ease));
  } else {
    newEase = Math.min(2.8, ease + 0.1);
    newInterval = Math.max(1, Math.round(interval * ease * 1.3));
  }
  return {
    ease: newEase,
    interval: newInterval,
    dueAt: Date.now() + newInterval * 24 * 60 * 60 * 1000,
    reps: reps + 1,
  };
}

// ─── Главный компонент ──────────────────────────────────────────────────────

export default function Flashcards() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [deckId, setDeckId] = useState<DeckId | null>(null);
  const [known, setKnown] = useState<Set<string>>(loadKnown());
  const [srs, setSrs] = useState<SrsState>(loadSrs());

  useEffect(() => { saveKnown(known); }, [known]);
  useEffect(() => { saveSrs(srs); }, [srs]);

  // ── Выбор режима ──
  if (!mode) {
    return (
      <Section title="КАРТОЧКИ PYTHON" subtitle="Выбери режим тренировки. Прогресс синхронизируется между режимами.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {MODES.map(m => {
            const dueCount = m.id === 'srs' ? countDueCards(srs) : null;
            return (
              <button key={m.id} onClick={() => setMode(m.id)}
                className="text-left p-5 border transition-all hover:-translate-y-0.5"
                style={{ borderColor: m.color + '40', backgroundColor: m.color + '05' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-3xl">{m.icon}</div>
                  <div className="flex-1">
                    <div className="font-orbitron text-lg font-black" style={{ color: m.color }}>{m.title}</div>
                    <div className="font-mono text-[10px] text-gray-500">{m.desc}</div>
                  </div>
                </div>
                {dueCount !== null && dueCount > 0 && (
                  <div className="mt-3 font-mono text-[10px] flex items-center gap-2" style={{ color: m.color }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: m.color }} />
                    К повторению сегодня: {dueCount}
                  </div>
                )}
                <div className="mt-3 font-mono text-[9px] text-gray-600">
                  +{m.xpPerCard} XP за карточку · {CARDS.length} карточек в базе
                </div>
              </button>
            );
          })}
        </div>

        {/* Прогресс по колодам */}
        <div className="border border-white/5 p-4">
          <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-3">// ПРОГРЕСС ПО КОЛОДАМ</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DECKS.map(d => {
              const deckCards = CARDS.filter(c => c.deck === d.id);
              const learned = deckCards.filter(c => known.has(c.id)).length;
              const pct = Math.round((learned / Math.max(1, deckCards.length)) * 100);
              return (
                <div key={d.id} className="border p-2.5" style={{ borderColor: d.color + '25' }}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-base">{d.icon}</span>
                    <span className="font-orbitron text-[10px] font-bold" style={{ color: d.color }}>{d.title}</span>
                  </div>
                  <div className="h-1 bg-black/60 mb-1">
                    <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: d.color }} />
                  </div>
                  <div className="font-mono text-[9px] text-gray-600">{learned}/{deckCards.length} · {pct}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </Section>
    );
  }

  // ── Выбор колоды (для всех режимов кроме SRS — там автоматом due) ──
  if (mode !== 'srs' && !deckId) {
    return (
      <Section
        title={`${MODES.find(m => m.id === mode)!.title.toUpperCase()} · ВЫБОР КОЛОДЫ`}
        subtitle="Выбери тему для тренировки."
        onBack={() => setMode(null)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DECKS.map(d => {
            const cards = CARDS.filter(c => c.deck === d.id);
            const learned = cards.filter(c => known.has(c.id)).length;
            const pct = Math.round((learned / Math.max(1, cards.length)) * 100);
            return (
              <button key={d.id} onClick={() => setDeckId(d.id)}
                className="text-left p-4 border transition-all hover:-translate-y-0.5"
                style={{ borderColor: d.color + '30', backgroundColor: d.color + '04' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{d.icon}</span>
                  <div>
                    <div className="font-orbitron text-sm font-black text-white">{d.title}</div>
                    <div className="font-mono text-[9px] text-gray-500">{d.desc}</div>
                  </div>
                </div>
                <div className="h-1 bg-black/60 mb-1">
                  <div className="h-full" style={{ width: `${pct}%`, backgroundColor: d.color }} />
                </div>
                <div className="flex justify-between font-mono text-[9px]">
                  <span className="text-gray-600">{cards.length} карт</span>
                  <span style={{ color: d.color }}>{pct}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </Section>
    );
  }

  const handleFinish = (gained: number, right: number, wrong: number) => {
    pushNotif({
      type: 'system',
      title: 'Сессия завершена',
      body: `✓ ${right} · ✗ ${wrong} · +${gained} XP`,
      icon: '🎴',
      color: '#00ff41',
    });
    setDeckId(null);
    if (mode === 'srs') setMode(null);
  };

  if (mode === 'classic')
    return <ClassicMode deckId={deckId!} onExit={() => setDeckId(null)} known={known} setKnown={setKnown} onFinish={handleFinish} />;
  if (mode === 'time')
    return <TimeMode deckId={deckId!} onExit={() => setDeckId(null)} known={known} setKnown={setKnown} onFinish={handleFinish} />;
  if (mode === 'duel')
    return <DuelMode deckId={deckId!} onExit={() => setDeckId(null)} known={known} setKnown={setKnown} onFinish={handleFinish} />;
  if (mode === 'srs')
    return <SrsMode srs={srs} setSrs={setSrs} known={known} setKnown={setKnown} onExit={() => setMode(null)} onFinish={handleFinish} />;
  return null;
}

// ═════════════════ CLASSIC ═════════════════════════════════════════════════

function ClassicMode({ deckId, onExit, known, setKnown, onFinish }: {
  deckId: DeckId; onExit: () => void; known: Set<string>;
  setKnown: (s: Set<string>) => void; onFinish: (gained: number, r: number, w: number) => void;
}) {
  const deck = useMemo(() => CARDS.filter(c => c.deck === deckId), [deckId]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState({ right: 0, wrong: 0, xp: 0 });

  const card = deck[idx];
  if (!card) {
    return (
      <FinishScreen stats={stats} onContinue={() => onFinish(stats.xp, stats.right, stats.wrong)} onExit={onExit} />
    );
  }

  const xpFor = () => applyXpBonus(10, progressStore.get().implantsEquipped);

  const markKnow = () => {
    setKnown(new Set(known).add(card.id));
    const xp = xpFor();
    progressStore.recordXp(xp);
    progressStore.recordFlashcardLearned(card.id);
    setStats(s => ({ right: s.right + 1, wrong: s.wrong, xp: s.xp + xp }));
    setFlipped(false);
    setTimeout(() => setIdx(i => i + 1), 150);
  };
  const markDontKnow = () => {
    setStats(s => ({ right: s.right, wrong: s.wrong + 1, xp: s.xp }));
    setFlipped(false);
    setTimeout(() => setIdx(i => i + 1), 150);
  };

  return (
    <Section title="КЛАССИКА" subtitle={`${DECKS.find(d => d.id === deckId)?.title} · ${idx + 1}/${deck.length}`} onBack={onExit}>
      <ProgressBar current={idx} total={deck.length} color={card.color} />
      <CardView card={card} flipped={flipped} onFlip={() => setFlipped(v => !v)} />
      <div className="grid grid-cols-2 gap-3 mt-6">
        <ActionButton color="#ff4060" onClick={markDontKnow}>
          ✗ ПОВТОРИТЬ
        </ActionButton>
        <ActionButton color="#00ff41" onClick={markKnow}>
          ✓ ЗНАЮ · +{Math.round(xpFor())} XP
        </ActionButton>
      </div>
      <SessionStats stats={stats} />
    </Section>
  );
}

// ═════════════════ TIME MODE ════════════════════════════════════════════════

function TimeMode({ deckId, onExit, known, setKnown, onFinish }: {
  deckId: DeckId; onExit: () => void; known: Set<string>;
  setKnown: (s: Set<string>) => void; onFinish: (gained: number, r: number, w: number) => void;
}) {
  const deck = useMemo(() => shuffle(CARDS.filter(c => c.deck === deckId)), [deckId]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [streak, setStreak] = useState(0);
  const [stats, setStats] = useState({ right: 0, wrong: 0, xp: 0 });
  const [timeLeft, setTimeLeft] = useState(10);
  const card = deck[idx];

  // таймер
  useEffect(() => {
    if (!card) return;
    setTimeLeft(10);
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, card?.id]);

  if (!card) {
    return <FinishScreen stats={stats} onContinue={() => onFinish(stats.xp, stats.right, stats.wrong)} onExit={onExit} extraLine={`Лучшая серия: ×${streak}`} />;
  }

  const multiplier = 1 + Math.min(5, Math.floor(streak / 3)) * 0.2; // до x2

  const next = () => {
    setFlipped(false);
    setTimeout(() => setIdx(i => i + 1), 120);
  };

  const handleKnow = () => {
    const baseXp = applyXpBonus(15, progressStore.get().implantsEquipped);
    const xp = Math.round(baseXp * multiplier);
    progressStore.recordXp(xp);
    progressStore.recordFlashcardLearned(card.id);
    setKnown(new Set(known).add(card.id));
    setStreak(s => s + 1);
    setStats(s => ({ right: s.right + 1, wrong: s.wrong, xp: s.xp + xp }));
    next();
  };
  const handleMiss = () => {
    setStreak(0);
    setStats(s => ({ right: s.right, wrong: s.wrong + 1, xp: s.xp }));
    next();
  };
  const handleTimeout = () => {
    setStreak(0);
    setStats(s => ({ right: s.right, wrong: s.wrong + 1, xp: s.xp }));
    setFlipped(true);
    setTimeout(() => { setFlipped(false); setIdx(i => i + 1); }, 1500);
  };

  return (
    <Section title="НА ВРЕМЯ" subtitle={`${DECKS.find(d => d.id === deckId)?.title} · ${idx + 1}/${deck.length}`} onBack={onExit}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-gray-500">СЕРИЯ:</span>
          <span className="font-orbitron font-black" style={{ color: streak >= 3 ? '#ffaa00' : '#888' }}>×{streak}</span>
          {multiplier > 1 && (
            <span className="font-mono text-[10px] px-1.5 py-0.5 border" style={{ color: '#ffaa00', borderColor: '#ffaa0050' }}>
              XP ×{multiplier.toFixed(1)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-black/60 relative overflow-hidden">
            <div className="h-full transition-all"
              style={{ width: `${(timeLeft / 10) * 100}%`, backgroundColor: timeLeft <= 3 ? '#ff4060' : '#ffaa00' }} />
          </div>
          <span className="font-orbitron text-lg font-black" style={{ color: timeLeft <= 3 ? '#ff4060' : '#ffaa00' }}>
            {timeLeft}s
          </span>
        </div>
      </div>

      <ProgressBar current={idx} total={deck.length} color={card.color} />
      <CardView card={card} flipped={flipped} onFlip={() => setFlipped(v => !v)} />

      <div className="grid grid-cols-2 gap-3 mt-6">
        <ActionButton color="#ff4060" onClick={handleMiss}>✗ НЕ ЗНАЮ</ActionButton>
        <ActionButton color="#ffaa00" onClick={handleKnow}>✓ ЗНАЮ</ActionButton>
      </div>
      <SessionStats stats={stats} />
    </Section>
  );
}

// ═════════════════ DUEL MODE ═══════════════════════════════════════════════

function DuelMode({ deckId, onExit, known, setKnown, onFinish }: {
  deckId: DeckId; onExit: () => void; known: Set<string>;
  setKnown: (s: Set<string>) => void; onFinish: (gained: number, r: number, w: number) => void;
}) {
  const deck = useMemo(() => shuffle(CARDS.filter(c => c.deck === deckId)), [deckId]);
  const { character, refreshCharacter } = useGame();
  const [idx, setIdx] = useState(0);
  const [hp, setHp] = useState(character?.hp ?? 100);
  const [pickedIdx, setPickedIdx] = useState<number | null>(null);
  const [stats, setStats] = useState({ right: 0, wrong: 0, xp: 0 });
  const card = deck[idx];
  const options = useMemo(() => card ? getDuelOptions(card) : [], [card?.id]);

  if (!card || hp <= 0) {
    return (
      <FinishScreen
        stats={stats}
        onContinue={() => { refreshCharacter(); onFinish(stats.xp, stats.right, stats.wrong); }}
        onExit={onExit}
        extraLine={hp <= 0 ? `⚠ HP закончилось! Финальный HP: ${hp}` : `Финальный HP: ${hp}`}
      />
    );
  }

  const pick = (i: number) => {
    if (pickedIdx !== null) return;
    setPickedIdx(i);
    const correct = options[i].correct;
    if (correct) {
      const xp = applyXpBonus(20, progressStore.get().implantsEquipped);
      progressStore.recordXp(xp);
      progressStore.recordFlashcardLearned(card.id);
      setKnown(new Set(known).add(card.id));
      setStats(s => ({ right: s.right + 1, wrong: s.wrong, xp: s.xp + xp }));
    } else {
      const damage = card.difficulty * 5 + 5;
      setHp(h => Math.max(0, h - damage));
      setStats(s => ({ right: s.right, wrong: s.wrong + 1, xp: s.xp }));
    }
    setTimeout(() => {
      setPickedIdx(null);
      setIdx(i => i + 1);
    }, 1100);
  };

  return (
    <Section title="ДУЭЛЬ КОДОМ" subtitle={`${DECKS.find(d => d.id === deckId)?.title} · ${idx + 1}/${deck.length}`} onBack={onExit}>
      {/* HP bar */}
      <div className="mb-4 flex items-center gap-3">
        <span className="font-mono text-[10px] text-gray-500">HP</span>
        <div className="flex-1 h-2 bg-black/60">
          <div className="h-full transition-all"
            style={{ width: `${(hp / 100) * 100}%`, backgroundColor: hp < 30 ? '#ff4060' : '#00ff41' }} />
        </div>
        <span className="font-orbitron text-sm font-black" style={{ color: hp < 30 ? '#ff4060' : '#00ff41' }}>
          {hp}/100
        </span>
      </div>

      <ProgressBar current={idx} total={deck.length} color={card.color} />

      {/* Question */}
      <div className="border p-6 text-center mb-4"
        style={{ borderColor: card.color + '40', backgroundColor: card.color + '08' }}>
        <div className="text-5xl mb-3">{card.emoji}</div>
        <div className="font-mono text-[10px] text-gray-600 mb-1">// ЧТО ЭТО?</div>
        <div className="font-orbitron text-3xl font-black" style={{ color: card.color }}>{card.term}</div>
        {card.example && <div className="font-mono text-[11px] text-gray-500 mt-2">{card.example}</div>}
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt, i) => {
          const showResult = pickedIdx !== null;
          const isPicked = pickedIdx === i;
          const isCorrect = opt.correct;
          let bg = 'transparent';
          let border = '#222';
          let color = '#ddd';
          if (showResult) {
            if (isCorrect) { bg = '#00ff4115'; border = '#00ff41'; color = '#00ff41'; }
            else if (isPicked) { bg = '#ff406015'; border = '#ff4060'; color = '#ff4060'; }
            else { bg = 'transparent'; border = '#222'; color = '#555'; }
          }
          return (
            <button key={i} onClick={() => pick(i)} disabled={pickedIdx !== null}
              className="text-left p-4 border transition-all font-rajdhani text-sm disabled:cursor-not-allowed"
              style={{ borderColor: border, backgroundColor: bg, color }}>
              <span className="font-orbitron text-[10px] mr-2" style={{ color: showResult ? color : '#666' }}>
                {String.fromCharCode(65 + i)}
              </span>
              {opt.text}
            </button>
          );
        })}
      </div>

      <SessionStats stats={stats} />
    </Section>
  );
}

// ═════════════════ SRS MODE ════════════════════════════════════════════════

function SrsMode({ srs, setSrs, known, setKnown, onExit, onFinish }: {
  srs: SrsState; setSrs: (s: SrsState) => void; known: Set<string>;
  setKnown: (s: Set<string>) => void; onExit: () => void;
  onFinish: (gained: number, r: number, w: number) => void;
}) {
  const dueList = useMemo(() => buildDueList(srs), [srs]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState({ right: 0, wrong: 0, xp: 0 });

  const card = dueList[idx];
  if (!card) {
    return (
      <Section title="ПОВТОРЕНИЕ · SRS" subtitle="На сегодня всё готово." onBack={onExit}>
        <div className="border border-cyber-green/30 bg-cyber-green/5 p-8 text-center">
          <div className="text-5xl mb-3">🧠</div>
          <div className="font-orbitron text-xl font-black text-cyber-green mb-2">
            ВСЕ КАРТОЧКИ ПОВТОРЕНЫ
          </div>
          <p className="font-mono text-xs text-gray-500 mb-4">
            Алгоритм Spaced Repetition вернёт сложные карточки через 1–N дней.
          </p>
          {stats.right > 0 && (
            <div className="font-mono text-xs text-cyber-cyan">
              Сегодня: ✓ {stats.right} · ✗ {stats.wrong} · +{stats.xp} XP
            </div>
          )}
          <button onClick={onExit}
            className="mt-5 px-6 py-2.5 border-2 font-orbitron text-sm tracking-widest"
            style={{ borderColor: '#00ff41', color: '#00ff41', backgroundColor: '#00ff4115' }}>
            ВЫЙТИ
          </button>
        </div>
      </Section>
    );
  }

  const rate = (rating: 0 | 1 | 2 | 3) => {
    const updated = updateSrs(srs[card.id], rating);
    setSrs({ ...srs, [card.id]: updated });
    let xpGained = 0;
    if (rating >= 2) {
      xpGained = applyXpBonus(rating === 3 ? 15 : 10, progressStore.get().implantsEquipped);
      progressStore.recordXp(xpGained);
      progressStore.recordFlashcardLearned(card.id);
      setKnown(new Set(known).add(card.id));
      setStats(s => ({ right: s.right + 1, wrong: s.wrong, xp: s.xp + xpGained }));
    } else {
      setStats(s => ({ right: s.right, wrong: s.wrong + 1, xp: s.xp }));
    }
    setFlipped(false);
    setTimeout(() => setIdx(i => i + 1), 150);
  };

  return (
    <Section title="ПОВТОРЕНИЕ · SRS" subtitle={`К повторению сегодня: ${dueList.length - idx}`} onBack={() => { onFinish(stats.xp, stats.right, stats.wrong); onExit(); }}>
      <ProgressBar current={idx} total={dueList.length} color={card.color} />
      <CardView card={card} flipped={flipped} onFlip={() => setFlipped(v => !v)} />

      {!flipped && (
        <div className="mt-6 text-center font-mono text-xs text-gray-500">
          Тапни карточку чтобы увидеть ответ
        </div>
      )}

      {flipped && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <SrsButton color="#ff4060" label="ОПЯТЬ" desc="сразу" onClick={() => rate(0)} />
          <SrsButton color="#ffaa00" label="ТЯЖЕЛО" desc="< 1 день" onClick={() => rate(1)} />
          <SrsButton color="#00aaff" label="ХОРОШО" desc="дни" onClick={() => rate(2)} />
          <SrsButton color="#00ff41" label="ЛЕГКО" desc="недели" onClick={() => rate(3)} />
        </div>
      )}

      <SessionStats stats={stats} />
    </Section>
  );
}

// ═════════════════ Общие компоненты ════════════════════════════════════════

function Section({ title, subtitle, onBack, children }: { title: string; subtitle?: string; onBack?: () => void; children: React.ReactNode }) {
  return (
    <section className="py-8 px-4 lg:px-6 min-h-screen relative">
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-1">// MEMORY · NEURAL CACHE</div>
            <h2 className="font-orbitron text-2xl text-white">{title}</h2>
            {subtitle && <p className="font-mono text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {onBack && (
            <button onClick={onBack}
              className="font-mono text-xs px-3 py-1.5 border border-white/10 text-gray-500 hover:text-white hover:border-white/30 transition-all flex items-center gap-1.5">
              <Icon name="ChevronLeft" size={12} /> НАЗАД
            </button>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

function CardView({ card, flipped, onFlip }: { card: Card; flipped: boolean; onFlip: () => void }) {
  return (
    <button onClick={onFlip}
      className="w-full border p-8 sm:p-12 min-h-[280px] flex items-center justify-center text-center transition-all hover:scale-[1.005] active:scale-[0.995]"
      style={{
        borderColor: card.color + '50',
        backgroundColor: card.color + '08',
        boxShadow: `0 0 40px ${card.color}15, inset 0 0 30px ${card.color}05`,
      }}>
      <div>
        {!flipped ? (
          <>
            <div className="text-6xl mb-4">{card.emoji}</div>
            <div className="font-orbitron text-3xl sm:text-4xl font-black mb-2" style={{ color: card.color }}>
              {card.term}
            </div>
            {card.example && (
              <div className="font-mono text-xs text-gray-500 mt-3">{card.example}</div>
            )}
            <div className="mt-4 font-mono text-[10px] text-gray-600">// тапни чтобы перевернуть</div>
          </>
        ) : (
          <>
            <div className="font-mono text-[10px] text-gray-500 tracking-widest mb-2">// ОТВЕТ</div>
            <div className="font-rajdhani text-xl sm:text-2xl text-white leading-snug max-w-xl mx-auto">
              {card.meaning}
            </div>
            {card.example && (
              <code className="mt-4 block font-mono text-xs px-3 py-2 border" style={{ color: card.color, borderColor: card.color + '30' }}>
                {card.example}
              </code>
            )}
          </>
        )}
      </div>
    </button>
  );
}

function ActionButton({ color, onClick, children }: { color: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className="py-3.5 border-2 font-orbitron text-sm tracking-widest transition-all active:scale-95"
      style={{ borderColor: color, color, backgroundColor: color + '15', boxShadow: `0 0 20px ${color}20` }}>
      {children}
    </button>
  );
}

function SrsButton({ color, label, desc, onClick }: { color: string; label: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="py-3 border-2 font-orbitron transition-all active:scale-95 flex flex-col items-center"
      style={{ borderColor: color, color, backgroundColor: color + '12' }}>
      <span className="text-sm font-black">{label}</span>
      <span className="font-mono text-[9px] mt-0.5 opacity-70">{desc}</span>
    </button>
  );
}

function ProgressBar({ current, total, color }: { current: number; total: number; color: string }) {
  const pct = Math.min(100, Math.round((current / Math.max(1, total)) * 100));
  return (
    <div className="mb-4">
      <div className="flex justify-between font-mono text-[10px] text-gray-600 mb-1">
        <span>ПРОГРЕСС</span><span>{current}/{total} · {pct}%</span>
      </div>
      <div className="h-1 bg-black/60">
        <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
      </div>
    </div>
  );
}

function SessionStats({ stats }: { stats: { right: number; wrong: number; xp: number } }) {
  return (
    <div className="mt-5 flex items-center justify-between font-mono text-xs text-gray-500">
      <span>✓ <span className="text-cyber-green">{stats.right}</span></span>
      <span>✗ <span className="text-red-400">{stats.wrong}</span></span>
      <span>+<span className="text-cyber-cyan">{stats.xp}</span> XP</span>
    </div>
  );
}

function FinishScreen({ stats, onContinue, onExit, extraLine }: {
  stats: { right: number; wrong: number; xp: number };
  onContinue: () => void; onExit: () => void; extraLine?: string;
}) {
  return (
    <Section title="СЕССИЯ ЗАВЕРШЕНА" subtitle="Результаты тренировки">
      <div className="border border-cyber-green/30 bg-cyber-green/5 p-8 text-center">
        <div className="text-5xl mb-3">🏆</div>
        <div className="font-orbitron text-2xl text-cyber-green font-black mb-4">+{stats.xp} XP</div>
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-5">
          <div className="border border-cyber-green/30 p-3">
            <div className="font-mono text-[10px] text-gray-500">ЗНАЮ</div>
            <div className="font-orbitron text-2xl text-cyber-green">{stats.right}</div>
          </div>
          <div className="border border-red-500/30 p-3">
            <div className="font-mono text-[10px] text-gray-500">ПОВТОРИТЬ</div>
            <div className="font-orbitron text-2xl text-red-400">{stats.wrong}</div>
          </div>
        </div>
        {extraLine && <div className="font-mono text-xs text-gray-500 mb-4">{extraLine}</div>}
        <div className="flex gap-3 justify-center">
          <button onClick={onExit}
            className="px-5 py-2 border border-white/15 font-orbitron text-xs text-gray-400">
            ВЫЙТИ
          </button>
          <button onClick={onContinue}
            className="px-5 py-2 border-2 border-cyber-green text-cyber-green bg-cyber-green/10 font-orbitron text-xs">
            ОК
          </button>
        </div>
      </div>
    </Section>
  );
}

// ═════════════════ Утилиты ═════════════════════════════════════════════════

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function countDueCards(srs: SrsState): number {
  const now = Date.now();
  // карточки никогда не виденные считаем как due
  const seen = new Set(Object.keys(srs));
  const newCards = CARDS.filter(c => !seen.has(c.id)).length;
  const dueOld = Object.values(srs).filter(s => s.dueAt <= now).length;
  return Math.min(20, newCards + dueOld); // ограничим до 20 в сессии
}

function buildDueList(srs: SrsState): Card[] {
  const now = Date.now();
  const seen = new Set(Object.keys(srs));
  const newCards = CARDS.filter(c => !seen.has(c.id));
  const dueOld = CARDS.filter(c => seen.has(c.id) && srs[c.id].dueAt <= now);
  return shuffle([...dueOld, ...newCards]).slice(0, 20);
}
