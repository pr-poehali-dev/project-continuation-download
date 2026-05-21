import { useEffect, useState } from 'react';

interface Props {
  onComplete: () => void;
}

const LINES = [
  { text: '> CodeGrid-9 // UNDERNET PROTOCOL v2.087', delay: 250, color: '#00ff41' },
  { text: '> Searching for signal...', delay: 600, color: '#00ffff' },
  { text: '> Signal found. Encrypted handshake...', delay: 700, color: '#00ffff' },
  { text: '> 7 hops · TOR routing · cipher: AES-256', delay: 500, color: '#888' },
  { text: '> [ARCHIVE.NODE_47] Кто там?', delay: 900, color: '#00ff41' },
];

export default function BootSequence({ onComplete }: Props) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let total = 0;
    LINES.forEach((line, idx) => {
      total += line.delay;
      setTimeout(() => {
        if (cancelled) return;
        setVisibleLines(idx + 1);
        if (idx === LINES.length - 1) {
          setTimeout(() => !cancelled && setDone(true), 600);
        }
      }, total);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
      <div className="absolute inset-0 scanlines pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl px-6 font-mono text-sm">
        {LINES.slice(0, visibleLines).map((line, i) => (
          <div
            key={i}
            className="mb-1.5 leading-relaxed"
            style={{ color: line.color, textShadow: `0 0 8px ${line.color}40` }}
          >
            {line.text}
            {i === visibleLines - 1 && !done && <span className="animate-pulse">█</span>}
          </div>
        ))}

        {done && (
          <div className="mt-8 animate-fade-in-up">
            <button
              onClick={onComplete}
              className="w-full py-4 font-orbitron text-sm tracking-[0.3em] border-2 transition-all hover:scale-[1.01] active:scale-95"
              style={{
                borderColor: '#00ff41',
                color: '#00ff41',
                backgroundColor: '#00ff4112',
                boxShadow: '0 0 30px #00ff4130',
              }}
            >
              [ ВОЙТИ В СЕТЬ ]
            </button>
            <div className="text-center mt-3 font-mono text-[10px] text-gray-700">
              THE ARCHIVE · CODEGRID-9 · 2087
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
