import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface HeroSectionProps {
  onStart: () => void;
}

const TYPING_TEXTS = [
  'print("Hello, World!")',
  'def hack_the_matrix():',
  'import neural_network',
  'while True: learn()',
];

export default function HeroSection({ onStart }: HeroSectionProps) {
  const [typedText, setTypedText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = TYPING_TEXTS[textIndex];
    const speed = isDeleting ? 40 : 80;

    const timer = setTimeout(() => {
      if (!isDeleting && charIndex < current.length) {
        setTypedText(current.slice(0, charIndex + 1));
        setCharIndex(c => c + 1);
      } else if (isDeleting && charIndex > 0) {
        setTypedText(current.slice(0, charIndex - 1));
        setCharIndex(c => c - 1);
      } else if (!isDeleting && charIndex === current.length) {
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setTextIndex(i => (i + 1) % TYPING_TEXTS.length);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, textIndex]);

  return (
    <section className="relative min-h-screen flex items-center cyber-grid scanlines overflow-hidden">
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyber-dark via-transparent to-cyber-dark z-0" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-magenta to-transparent" />

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-cyber-cyan opacity-60 animate-float"
          style={{
            left: `${10 + i * 12}%`,
            top: `${20 + (i % 3) * 25}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${3 + i * 0.5}s`,
          }}
        />
      ))}

      <div className="relative z-10 container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Text */}
        <div className="space-y-8">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-cyber-cyan/40 text-cyber-cyan text-xs font-mono mb-4">
              <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
              СИСТЕМА ОНЛАЙН · ВЕРСИЯ 1.0
            </div>
            <h1 className="font-orbitron text-5xl lg:text-7xl font-black leading-none">
              <span className="text-white">CODE</span>
              <br />
              <span className="text-cyber-cyan glitch-text animate-flicker">RPG</span>
            </h1>
            <p className="text-cyber-magenta font-orbitron text-sm tracking-widest mt-2">
              УЧИСЬ PYTHON · ПОБЕЖДАЙ ВРАГОВ
            </p>
          </div>

          <div className="animate-fade-in-up delay-200">
            <p className="text-gray-300 font-rajdhani text-xl leading-relaxed max-w-lg">
              Добро пожаловать в мегаполис, где знание кода — это сила.
              Прокачивай персонажа, решай задачи на Python и сражайся
              с корпоративными ИИ в мире киберпанка.
            </p>
          </div>

          {/* Typing effect */}
          <div className="animate-fade-in-up delay-300 cyber-panel p-4 max-w-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-gray-500 text-xs font-mono ml-2">terminal.py</span>
            </div>
            <div className="font-mono text-cyber-green text-sm">
              <span className="text-cyber-magenta">{'> '}</span>
              {typedText}
              <span className="animate-pulse text-cyber-cyan">█</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="animate-fade-in-up delay-400 flex gap-6">
            {[
              { value: '50+', label: 'Уроков' },
              { value: '20+', label: 'Боссов' },
              { value: '∞', label: 'Прогресса' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="font-orbitron text-2xl font-bold text-cyber-cyan">{stat.value}</div>
                <div className="text-gray-400 text-xs font-mono">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="animate-fade-in-up delay-500 flex flex-wrap gap-4">
            <button onClick={onStart} className="cyber-btn text-sm px-8 py-3 animate-pulse-glow">
              НАЧАТЬ ИГРУ
            </button>
            <button className="cyber-btn cyber-btn-magenta text-sm px-8 py-3">
              КАК ЭТО РАБОТАЕТ?
            </button>
          </div>
        </div>

        {/* Right: Hero Image */}
        <div className="relative flex justify-center animate-fade-in-up delay-300">
          <div className="relative animate-float">
            <div className="absolute inset-0 bg-cyber-cyan/10 blur-3xl rounded-full scale-75" />
            <img
              src="https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/f55d91c1-7259-4e87-a724-646937adde3d.jpg"
              alt="Code RPG Hero"
              className="relative z-10 w-full max-w-md rounded-sm neon-border-cyan object-cover"
              style={{ clipPath: 'polygon(0 0, 95% 0, 100% 5%, 100% 100%, 5% 100%, 0 95%)' }}
            />
            {/* Corner decorations */}
            <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-cyber-cyan" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-cyber-magenta" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-cyber-magenta" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-cyber-cyan" />

            {/* Level badge */}
            <div className="absolute top-4 right-4 bg-cyber-dark/90 border border-cyber-yellow px-3 py-1 font-orbitron text-cyber-yellow text-xs">
              LVL 1
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cyber-cyan/50">
        <span className="font-mono text-xs">SCROLL</span>
        <Icon name="ChevronDown" size={16} className="animate-bounce" />
      </div>
    </section>
  );
}
