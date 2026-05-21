import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { useGame } from '@/lib/GameContext';
import { pushNotif } from '../Notifications';

export const PROLOGUE_KEY = 'coderp_prologue_done';
export const PROLOGUE_STEP_KEY = 'coderp_prologue_step';

export type PrologueStep =
  | 'awakening'        // Шаг 2 — монолог Ghost
  | 'first_code'       // Шаг 3 — мини-урок print()
  | 'first_battle'     // Шаг 6 — первый бой (юзер уходит в Battle)
  | 'lore_factions'    // Шаг 7 — Ghost рассказывает про фракции
  | 'open_world';      // Шаг 8 — открытие карты

interface Props {
  step: PrologueStep;
  onAdvance: (nextStep: PrologueStep | 'finish') => void;
  onOpenSection: (section: string) => void;
}

const GHOST_COLOR = '#00ff41';

export default function PrologueFlow({ step, onAdvance, onOpenSection }: Props) {
  const { character } = useGame();

  if (step === 'awakening') return <Awakening onNext={() => onAdvance('first_code')} />;
  if (step === 'first_code') return <FirstCode onNext={() => onAdvance('first_battle')} />;
  if (step === 'first_battle') return <FirstBattlePrompt onGo={() => { onOpenSection('battle'); }} agentName={character?.name ?? 'Agent'} />;
  if (step === 'lore_factions') return <LoreFactions onNext={() => onAdvance('open_world')} />;
  if (step === 'open_world') return <OpenWorld onGo={() => { onAdvance('finish'); onOpenSection('map'); }} />;
  return null;
}

// ─── Шаг 2: Пробуждение ──────────────────────────────────────────────────────

function Awakening({ onNext }: { onNext: () => void }) {
  const lines = [
    'Если ты это видишь — значит, мой запрос прошёл фильтры NEXUS.',
    'Я Ghost. Десять лет назад я был таким же, как ты — мусорщиком данных в нижних секторах.',
    'Сейчас NEXUS контролирует всё: воду, кредиты, память.',
    'Но у них есть слабость. Они не понимают синтаксис. А мы — понимаем.',
    'Добро пожаловать в The Archive, агент. Пора учиться стрелять кодом.',
  ];
  const [shown, setShown] = useState(0);
  const [skipReady, setSkipReady] = useState(false);

  useEffect(() => {
    if (shown >= lines.length) { setSkipReady(true); return; }
    const t = setTimeout(() => setShown(s => s + 1), 1400);
    return () => clearTimeout(t);
  }, [shown]);

  const skip = () => setShown(lines.length);

  return (
    <Overlay color={GHOST_COLOR} chapter="ПРОЛОГ · I · ПРОБУЖДЕНИЕ">
      <NpcHeader name="GHOST" tagline="Связной The Archive" color={GHOST_COLOR} />

      <div className="space-y-3 my-6 min-h-[200px]">
        {lines.slice(0, shown).map((line, i) => (
          <p key={i} className="font-rajdhani text-base text-gray-200 leading-relaxed animate-fade-in-up">
            «{line}»
          </p>
        ))}
        {shown < lines.length && (
          <div className="font-mono text-xs text-gray-700 animate-pulse">▮ передача...</div>
        )}
      </div>

      <div className="flex gap-2">
        {!skipReady && (
          <button onClick={skip}
            className="flex-1 py-3 font-mono text-xs text-gray-500 border border-white/10 hover:border-white/30 transition-all">
            пропустить речь
          </button>
        )}
        {skipReady && (
          <CyberButton color={GHOST_COLOR} onClick={onNext}>
            [ ПОДОЙТИ БЛИЖЕ ]
          </CyberButton>
        )}
      </div>
    </Overlay>
  );
}

// ─── Шаг 3: Первый код ───────────────────────────────────────────────────────

function FirstCode({ onNext }: { onNext: () => void }) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'wrong' | 'ok'>('idle');
  const [output, setOutput] = useState<string[]>([]);

  const check = () => {
    // Терпимая проверка: print("Hello, Archive") в любых кавычках
    const normalized = code.replace(/\s+/g, '').toLowerCase();
    const ok = /^print\(["']hello,?\s*archive["']\)$/i.test(code.trim()) ||
               normalized === 'print("hello,archive")' ||
               normalized === "print('hello,archive')";
    if (ok) {
      setStatus('ok');
      setOutput(['> Hello, Archive', '> signal received · +25 XP']);
      setTimeout(() => onNext(), 1800);
    } else {
      setStatus('wrong');
    }
  };

  return (
    <Overlay color={GHOST_COLOR} chapter="ПРОЛОГ · II · ПЕРВЫЙ СИГНАЛ">
      <NpcHeader name="GHOST" tagline="Связной The Archive" color={GHOST_COLOR} />

      <p className="font-rajdhani text-base text-gray-200 leading-relaxed my-4">
        «Прежде чем дам тебе оружие — проверим, что ты не бот NEXUS.
        Боты не умеют говорить. Поздоровайся с сетью.»
      </p>

      <div className="border border-white/10 bg-black/60 p-3 mb-3">
        <div className="font-mono text-[10px] text-gray-600 mb-2">// напиши ровно это:</div>
        <code className="font-mono text-sm" style={{ color: GHOST_COLOR }}>
          print("Hello, Archive")
        </code>
      </div>

      <div className="border bg-black/80 mb-3" style={{ borderColor: status === 'ok' ? GHOST_COLOR : status === 'wrong' ? '#ff406050' : '#ffffff20' }}>
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5 font-mono text-[10px] text-gray-600">
          <span>archive.terminal</span>
          <span style={{ color: GHOST_COLOR }}>● ONLINE</span>
        </div>
        <textarea
          value={code}
          onChange={e => { setCode(e.target.value); setStatus('idle'); }}
          rows={2}
          placeholder='print("...")'
          spellCheck={false}
          className="w-full bg-transparent px-3 py-2 font-mono text-sm text-white outline-none resize-none"
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) check(); }}
        />
        {output.length > 0 && (
          <div className="px-3 py-2 border-t border-white/5 font-mono text-xs space-y-1">
            {output.map((l, i) => (
              <div key={i} style={{ color: GHOST_COLOR }}>{l}</div>
            ))}
          </div>
        )}
      </div>

      {status === 'wrong' && (
        <div className="font-mono text-xs text-red-400 mb-3">
          ⚠ Ghost: «Проверь кавычки и скобки. NEXUS такое заметит.»
        </div>
      )}

      <CyberButton color={GHOST_COLOR} onClick={check} disabled={status === 'ok' || code.trim().length === 0}>
        {status === 'ok' ? '✓ СИГНАЛ ОТПРАВЛЕН' : '[ ВЫПОЛНИТЬ ]'}
      </CyberButton>

      <div className="text-center mt-2 font-mono text-[10px] text-gray-700">
        попыток не ограничено · подсказка: используй `print()`
      </div>
    </Overlay>
  );
}

// ─── Шаг 6: Призыв к бою ─────────────────────────────────────────────────────

function FirstBattlePrompt({ onGo, agentName }: { onGo: () => void; agentName: string }) {
  return (
    <Overlay color="#ff00ff" chapter="ПРОЛОГ · III · БРАНДМАУЭР ДРОНА">
      <NpcHeader name="GHOST" tagline="Сирена · NEXUS-Drone сканирует узел" color="#ff4060" alert />

      <p className="font-rajdhani text-base text-gray-200 leading-relaxed my-4">
        «Поздно, {agentName}. NEXUS-Drone сканирует наш узел.
        Не убежишь — переписывай. Чтобы пробить его щит — выведи его сигнатуру.
        Используй `print()`. Это сломает его аутентификацию.»
      </p>

      <div className="border border-red-500/30 bg-red-500/5 p-3 mb-4 font-mono text-xs">
        <div className="text-red-400 mb-1">⚠ ТРЕВОГА</div>
        <div className="text-gray-400">Цель: NEXUS-Drone · HP 30 · слабая защита</div>
        <div className="text-gray-400">Награда: первое оружие · +150 XP</div>
      </div>

      <CyberButton color="#ff00ff" onClick={onGo}>
        ⚔️ В БОЙ
      </CyberButton>
    </Overlay>
  );
}

// ─── Шаг 7: Лор и фракции ────────────────────────────────────────────────────

function LoreFactions({ onNext }: { onNext: () => void }) {
  return (
    <Overlay color={GHOST_COLOR} chapter="ПРОЛОГ · IV · ТРИ ВОЙНЫ">
      <NpcHeader name="GHOST" tagline="Связной The Archive" color={GHOST_COLOR} />

      <p className="font-rajdhani text-base text-gray-200 leading-relaxed my-4">
        «Ты прошёл первый фильтр. Теперь слушай внимательно.
        CodeGrid-9 — это не один город. Это <span style={{ color: GHOST_COLOR }}>три войны</span> одновременно.»
      </p>

      <div className="space-y-2 mb-4">
        <FactionRow emoji="📚" name="THE ARCHIVE" color="#00ff41" desc="Мы. Учителя. Свобода через знания." />
        <FactionRow emoji="🕶️" name="BLACK SYNTAX" color="#aa00ff" desc="Хакеры-наёмники. Платят за результат." />
        <FactionRow emoji="⚖️" name="ORDER OF CLEAN CODE" color="#00aaff" desc="Фанатики ООП. Чтят паттерны." />
      </div>

      <p className="font-rajdhani text-sm text-gray-400 italic mb-4 leading-relaxed">
        «Все хотят свалить NEXUS, но способами, которые не совместимы.
        Сегодня ты с нами. Завтра — выбирай сам.»
      </p>

      <CyberButton color={GHOST_COLOR} onClick={onNext}>
        [ ПОНЯЛ ]
      </CyberButton>
    </Overlay>
  );
}

function FactionRow({ emoji, name, color, desc }: { emoji: string; name: string; color: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 p-2 border" style={{ borderColor: color + '30', backgroundColor: color + '06' }}>
      <span className="text-2xl">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="font-orbitron text-xs font-bold" style={{ color }}>{name}</div>
        <div className="font-mono text-[10px] text-gray-500">{desc}</div>
      </div>
    </div>
  );
}

// ─── Шаг 8: Открытие мира ────────────────────────────────────────────────────

function OpenWorld({ onGo }: { onGo: () => void }) {
  return (
    <Overlay color="#00aaff" chapter="ПРОЛОГ · V · ВЫХОД В МИР">
      <NpcHeader name="GHOST" tagline="Связной The Archive · последний инструктаж" color={GHOST_COLOR} />

      <p className="font-rajdhani text-base text-gray-200 leading-relaxed my-4">
        «Дальше — сам. Твоя точка возврата — этот хаб, Undernet Hub.
        Каждый район города учит чему-то новому. Syntax Street — переменные.
        Loop Arena — циклы. Не лезь туда, куда не дорос: NEXUS убивает за каждую недописанную строку.»
      </p>

      <div className="border border-cyber-cyan/20 bg-cyber-cyan/5 p-3 mb-4 space-y-1.5 font-mono text-[11px]">
        <div className="text-cyber-cyan flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" /> 🟢 — район открыт, иди
        </div>
        <div className="text-gray-500">🔒 — заблокировано, нужен уровень</div>
        <div className="text-gray-500">🖱 Тяни карту · крути колесо для зума</div>
      </div>

      <p className="font-rajdhani text-sm italic text-gray-500 mb-4">
        «Удачи, агент. И помни — синтаксис нас спасёт.»
      </p>

      <CyberButton color="#00aaff" onClick={() => {
        pushNotif({
          type: 'achievement',
          title: 'ПРОЛОГ ЗАВЕРШЁН',
          body: 'Добро пожаловать в CodeGrid-9. Город ждёт.',
          icon: '🏆',
          color: '#ffaa00',
        });
        onGo();
      }}>
        🗺️ ОТКРЫТЬ КАРТУ ГОРОДА
      </CyberButton>
    </Overlay>
  );
}

// ─── Общие компоненты ────────────────────────────────────────────────────────

function Overlay({ children, color, chapter }: { children: React.ReactNode; color: string; chapter: string }) {
  return (
    <div className="fixed inset-0 z-[9998] bg-black/85 backdrop-blur-sm flex items-end lg:items-center justify-center p-4 animate-fade-in">
      <div
        className="w-full max-w-lg border animate-fade-in-up"
        style={{ borderColor: color + '50', backgroundColor: '#050a0efa', boxShadow: `0 0 80px ${color}25` }}
      >
        <div className="h-0.5" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }} />
        <div className="flex items-center justify-between px-5 py-2 border-b border-white/5">
          <div className="font-mono text-[10px] tracking-widest" style={{ color: color + 'aa' }}>{chapter}</div>
          <div className="font-mono text-[10px] text-gray-700">CODEGRID-9 // 2087</div>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function NpcHeader({ name, tagline, color, alert }: { name: string; tagline: string; color: string; alert?: boolean }) {
  return (
    <div className="flex items-center gap-3 pb-3 border-b border-white/5">
      <div
        className="w-12 h-12 border flex items-center justify-center text-2xl flex-shrink-0"
        style={{ borderColor: color + '60', backgroundColor: color + '15' }}
      >
        {alert ? '⚠' : '👤'}
      </div>
      <div className="min-w-0">
        <div className="font-orbitron text-lg font-black" style={{ color }}>{name}</div>
        <div className="font-mono text-[10px] text-gray-500">{tagline}</div>
      </div>
      <div className="ml-auto flex items-center gap-1.5 font-mono text-[10px]" style={{ color }}>
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: color }} />
        LIVE
      </div>
    </div>
  );
}

function CyberButton({ children, onClick, color, disabled }: { children: React.ReactNode; onClick: () => void; color: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-4 font-orbitron text-sm tracking-widest border-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      style={{
        borderColor: color,
        color,
        backgroundColor: color + '15',
        boxShadow: `0 0 25px ${color}30`,
      }}
    >
      {children}
    </button>
  );
}

// ─── Хук: управление состоянием пролога ─────────────────────────────────────

export function usePrologue() {
  const { character } = useGame();
  const [step, setStep] = useState<PrologueStep | null>(null);

  useEffect(() => {
    if (!character) return;
    const done = localStorage.getItem(PROLOGUE_KEY);
    if (done) return;
    const isNew = character.level <= 1 && character.xp === 0;
    if (!isNew) {
      localStorage.setItem(PROLOGUE_KEY, '1');
      return;
    }
    const saved = localStorage.getItem(PROLOGUE_STEP_KEY) as PrologueStep | null;
    setTimeout(() => setStep(saved ?? 'awakening'), 600);
  }, [character?.id]);

  const advance = (next: PrologueStep | 'finish') => {
    if (next === 'finish') {
      localStorage.setItem(PROLOGUE_KEY, '1');
      localStorage.removeItem(PROLOGUE_STEP_KEY);
      setStep(null);
      return;
    }
    localStorage.setItem(PROLOGUE_STEP_KEY, next);
    setStep(next);
  };

  const skip = () => {
    localStorage.setItem(PROLOGUE_KEY, '1');
    localStorage.removeItem(PROLOGUE_STEP_KEY);
    setStep(null);
  };

  return { step, advance, skip, active: step !== null };
}
