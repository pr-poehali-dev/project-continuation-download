import { useState, useMemo, useEffect } from 'react';
import { progress as progressStore } from '@/lib/progressStore';
import { pushNotif } from '@/components/Notifications';
import { applyXpBonus } from '@/lib/implants';

interface Card {
  id: string;
  term: string;
  meaning: string;
  example?: string;
  emoji: string;
  color: string;
  deck: DeckId;
}

type DeckId = 'basics' | 'loops' | 'data' | 'oop';

const DECKS: Record<DeckId, { title: string; desc: string; color: string; icon: string }> = {
  basics: { title: 'Основы', desc: 'Переменные, типы, print, input', color: '#00ff41', icon: '📦' },
  loops:  { title: 'Логика и циклы', desc: 'if/else, for, while', color: '#ffaa00', icon: '🔁' },
  data:   { title: 'Структуры данных', desc: 'Списки, словари, кортежи', color: '#00aaff', icon: '🗂️' },
  oop:    { title: 'ООП', desc: 'Классы, методы, self', color: '#ff4060', icon: '🤖' },
};

const CARDS: Card[] = [
  // basics
  { id: 'b1', deck: 'basics', term: 'print()', meaning: 'Выводит текст на экран', example: 'print("Привет")', emoji: '📢', color: '#00ff41' },
  { id: 'b2', deck: 'basics', term: 'переменная', meaning: 'Коробка с именем для хранения значения', example: 'name = "Nova"', emoji: '📦', color: '#00ff41' },
  { id: 'b3', deck: 'basics', term: 'int', meaning: 'Целое число (без точки)', example: 'age = 18', emoji: '🔢', color: '#00ff41' },
  { id: 'b4', deck: 'basics', term: 'float', meaning: 'Дробное число (с точкой)', example: 'pi = 3.14', emoji: '🌊', color: '#00ff41' },
  { id: 'b5', deck: 'basics', term: 'str', meaning: 'Строка — текст в кавычках', example: 's = "hello"', emoji: '🔤', color: '#00ff41' },
  { id: 'b6', deck: 'basics', term: 'bool', meaning: 'Правда или ложь: True / False', example: 'ok = True', emoji: '🚦', color: '#00ff41' },
  { id: 'b7', deck: 'basics', term: 'input()', meaning: 'Читает то, что ввёл пользователь', example: 'n = input("Имя: ")', emoji: '⌨️', color: '#00ff41' },
  { id: 'b8', deck: 'basics', term: 'f-строка', meaning: 'Строка со вставкой переменных через {}', example: 'f"Имя {name}"', emoji: '✨', color: '#00ff41' },

  // loops
  { id: 'l1', deck: 'loops', term: 'if', meaning: 'Если условие — выполни код', example: 'if x > 0:', emoji: '❓', color: '#ffaa00' },
  { id: 'l2', deck: 'loops', term: 'else', meaning: 'Иначе — другой код', example: 'else:\n    ...', emoji: '↔️', color: '#ffaa00' },
  { id: 'l3', deck: 'loops', term: 'elif', meaning: 'Иначе если — следующее условие', example: 'elif x == 0:', emoji: '🎚️', color: '#ffaa00' },
  { id: 'l4', deck: 'loops', term: 'for', meaning: 'Повтори для каждого элемента', example: 'for i in range(5):', emoji: '🔄', color: '#ffaa00' },
  { id: 'l5', deck: 'loops', term: 'while', meaning: 'Повторяй пока условие верно', example: 'while hp > 0:', emoji: '⏱️', color: '#ffaa00' },
  { id: 'l6', deck: 'loops', term: 'range(n)', meaning: 'Числа от 0 до n-1', example: 'range(5) → 0..4', emoji: '📏', color: '#ffaa00' },
  { id: 'l7', deck: 'loops', term: 'break', meaning: 'Выйти из цикла досрочно', example: 'if x==7: break', emoji: '🛑', color: '#ffaa00' },
  { id: 'l8', deck: 'loops', term: 'continue', meaning: 'Пропустить шаг, идти дальше', example: 'if x==3: continue', emoji: '⏩', color: '#ffaa00' },

  // data
  { id: 'd1', deck: 'data', term: 'list', meaning: 'Список — много значений по порядку', example: '[1, 2, 3]', emoji: '📋', color: '#00aaff' },
  { id: 'd2', deck: 'data', term: 'dict', meaning: 'Словарь — пары "ключ: значение"', example: '{"name": "Nova"}', emoji: '📖', color: '#00aaff' },
  { id: 'd3', deck: 'data', term: 'append()', meaning: 'Добавить элемент в конец списка', example: 'lst.append(5)', emoji: '➕', color: '#00aaff' },
  { id: 'd4', deck: 'data', term: 'len()', meaning: 'Узнать длину коллекции', example: 'len([1,2,3]) → 3', emoji: '📏', color: '#00aaff' },
  { id: 'd5', deck: 'data', term: 'index', meaning: 'Номер элемента, начиная с 0', example: 'lst[0] — первый', emoji: '🔢', color: '#00aaff' },
  { id: 'd6', deck: 'data', term: 'tuple', meaning: 'Кортеж — список, который нельзя менять', example: '(1, 2, 3)', emoji: '🔒', color: '#00aaff' },
  { id: 'd7', deck: 'data', term: 'in', meaning: 'Проверка: есть ли элемент', example: '"a" in lst', emoji: '🔍', color: '#00aaff' },
  { id: 'd8', deck: 'data', term: 'set', meaning: 'Множество — без повторов', example: '{1, 2, 3}', emoji: '🎯', color: '#00aaff' },

  // oop
  { id: 'o1', deck: 'oop', term: 'class', meaning: 'Шаблон для создания объектов', example: 'class Agent:', emoji: '🏗️', color: '#ff4060' },
  { id: 'o2', deck: 'oop', term: '__init__', meaning: 'Конструктор — запускается при создании', example: 'def __init__(self):', emoji: '🚀', color: '#ff4060' },
  { id: 'o3', deck: 'oop', term: 'self', meaning: 'Сам объект — всегда первый параметр', example: 'self.name = name', emoji: '👤', color: '#ff4060' },
  { id: 'o4', deck: 'oop', term: 'метод', meaning: 'Функция внутри класса', example: 'def status(self):', emoji: '⚙️', color: '#ff4060' },
  { id: 'o5', deck: 'oop', term: 'объект', meaning: 'То, что создано по классу', example: 'nova = Agent(...)', emoji: '🤖', color: '#ff4060' },
  { id: 'o6', deck: 'oop', term: 'атрибут', meaning: 'Свойство объекта', example: 'nova.name', emoji: '🏷️', color: '#ff4060' },
];

const STORAGE_KEY = 'flashcards_known';

function loadKnown(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch { return new Set(); }
}
function saveKnown(set: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
}

export default function Flashcards() {
  const [deckId, setDeckId] = useState<DeckId | null>(null);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<string>>(loadKnown());
  const [sessionStats, setSessionStats] = useState({ right: 0, wrong: 0 });

  const deck = useMemo(() => deckId ? CARDS.filter(c => c.deck === deckId) : [], [deckId]);
  const card = deck[idx];

  useEffect(() => { saveKnown(known); }, [known]);

  const next = () => {
    setFlipped(false);
    setTimeout(() => setIdx(i => i + 1), 150);
  };

  const markKnow = () => {
    if (!card) return;
    setKnown(prev => new Set(prev).add(card.id));
    setSessionStats(s => ({ ...s, right: s.right + 1 }));
    const equipped = progressStore.get().implantsEquipped;
    progressStore.recordXp(applyXpBonus(10, equipped));
    progressStore.recordFlashcardLearned(card.id);
    next();
  };

  const resetDeck = () => {
    if (!deckId) return;
    if (!confirm('Сбросить прогресс этой колоды? Карточки будут показаны заново.')) return;
    const deckCards = CARDS.filter(c => c.deck === deckId).map(c => c.id);
    setKnown(prev => {
      const n = new Set(prev);
      deckCards.forEach(id => n.delete(id));
      return n;
    });
    progressStore.resetFlashcards(deckCards);
    setIdx(0);
    setFlipped(false);
    pushNotif({ type: 'system', title: 'Колода сброшена', body: 'Прогресс обнулён, можно учить заново.', icon: '↻', color: '#00aaff' });
  };
  const markDontKnow = () => {
    setSessionStats(s => ({ ...s, wrong: s.wrong + 1 }));
    next();
  };

  const finishSession = () => {
    pushNotif({
      type: 'system',
      title: 'Сессия завершена!',
      body: `Знаешь: ${sessionStats.right} · Учить: ${sessionStats.wrong} · +${sessionStats.right * 10} XP`,
      icon: '🎴',
      color: '#00ff41',
    });
    setDeckId(null);
    setIdx(0);
    setSessionStats({ right: 0, wrong: 0 });
  };

  // ─── Выбор колоды ───
  if (!deckId) {
    return (
      <section className="py-8 px-4 lg:px-6 min-h-screen relative">
        <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="mb-6">
            <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-1">// MEMORY · NEURAL CACHE</div>
            <h2 className="font-orbitron text-2xl text-white">КАРТОЧКИ <span className="text-cyber-green">PYTHON</span></h2>
            <p className="font-mono text-xs text-gray-500 mt-1">Запоминай ключевые слова через ассоциации. 3-5 минут — и +XP в карман.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(Object.keys(DECKS) as DeckId[]).map(id => {
              const d = DECKS[id];
              const cards = CARDS.filter(c => c.deck === id);
              const learned = cards.filter(c => known.has(c.id)).length;
              const pct = Math.round((learned / cards.length) * 100);
              return (
                <button key={id} onClick={() => { setDeckId(id); setIdx(0); setFlipped(false); }}
                  className="text-left p-5 border transition-all hover:-translate-y-0.5"
                  style={{ borderColor: d.color + '30', backgroundColor: d.color + '05' }}>
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{d.icon}</div>
                    <div className="flex-1">
                      <div className="font-orbitron text-base font-black text-white">{d.title}</div>
                      <div className="font-mono text-[10px] text-gray-500 mt-1">{d.desc}</div>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-black/60">
                          <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: d.color }} />
                        </div>
                        <div className="font-mono text-[10px]" style={{ color: d.color }}>{learned}/{cards.length}</div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // ─── Конец колоды ───
  if (!card) {
    return (
      <section className="py-8 px-4 lg:px-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎴</div>
          <div className="font-orbitron text-2xl text-white mb-2">Колода пройдена!</div>
          <div className="font-mono text-sm text-gray-500 mb-6">
            Знаю: <span className="text-cyber-green">{sessionStats.right}</span> ·
            Учить: <span className="text-cyber-red">{sessionStats.wrong}</span> ·
            +{sessionStats.right * 10} XP
          </div>
          <button onClick={finishSession}
            className="font-orbitron text-sm px-6 py-3 border border-cyber-green text-cyber-green hover:bg-cyber-green/10">
            ВЕРНУТЬСЯ К КОЛОДАМ
          </button>
        </div>
      </section>
    );
  }

  // ─── Карточка ───
  const deckMeta = DECKS[deckId];
  return (
    <section className="py-8 px-4 lg:px-6 min-h-screen relative">
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setDeckId(null)} className="font-mono text-xs text-gray-500 hover:text-white">
            ← К колодам
          </button>
          <div className="font-mono text-xs" style={{ color: deckMeta.color }}>
            {deckMeta.icon} {deckMeta.title}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={resetDeck} className="font-mono text-[10px] text-yellow-400 hover:text-white" title="Сбросить прогресс колоды">↻ Сбросить</button>
            <div className="font-mono text-xs text-gray-500">{idx + 1}/{deck.length}</div>
          </div>
        </div>

        {/* Progress */}
        <div className="h-1 bg-black/60 mb-6">
          <div className="h-full transition-all" style={{ width: `${((idx + 1) / deck.length) * 100}%`, backgroundColor: deckMeta.color }} />
        </div>

        {/* Card */}
        <div onClick={() => setFlipped(f => !f)}
          className="relative cursor-pointer mb-6"
          style={{ perspective: '1200px' }}>
          <div className="relative transition-transform duration-500"
            style={{
              transformStyle: 'preserve-3d',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              minHeight: '320px',
            }}>
            {/* Front */}
            <div className="absolute inset-0 border-2 p-8 flex flex-col items-center justify-center"
              style={{
                borderColor: card.color + '60',
                backgroundColor: card.color + '08',
                backfaceVisibility: 'hidden',
                boxShadow: `0 0 60px ${card.color}20`,
              }}>
              <div className="text-7xl mb-6">{card.emoji}</div>
              <div className="font-orbitron text-3xl font-black" style={{ color: card.color }}>{card.term}</div>
              <div className="font-mono text-[10px] text-gray-500 mt-6">КЛИКНИ ЧТОБЫ УВИДЕТЬ ОТВЕТ</div>
            </div>
            {/* Back */}
            <div className="absolute inset-0 border-2 p-8 flex flex-col items-center justify-center text-center"
              style={{
                borderColor: card.color + '60',
                backgroundColor: '#0a0e12',
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}>
              <div className="font-rajdhani text-xl text-white mb-4">{card.meaning}</div>
              {card.example && (
                <pre className="font-mono text-xs px-4 py-3 border border-white/10 bg-black/40 mb-4" style={{ color: card.color }}>
{card.example}
                </pre>
              )}
              <div className="font-mono text-[10px] text-gray-500">КЛИКНИ ЧТОБЫ ПЕРЕВЕРНУТЬ</div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={markDontKnow}
            className="font-orbitron text-xs py-4 border border-cyber-red/40 text-cyber-red hover:bg-cyber-red/10 transition-all">
            ✗ ПОВТОРИТЬ
          </button>
          <button onClick={markKnow}
            className="font-orbitron text-xs py-4 border border-cyber-green/60 text-cyber-green hover:bg-cyber-green/10 transition-all">
            ✓ ЗНАЮ +10 XP
          </button>
        </div>

        {/* Session stats */}
        <div className="mt-4 flex justify-center gap-6 font-mono text-[10px] text-gray-500">
          <span>✓ {sessionStats.right}</span>
          <span>✗ {sessionStats.wrong}</span>
        </div>
      </div>
    </section>
  );
}