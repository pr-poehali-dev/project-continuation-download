/**
 * CombatTutorial — пошаговый онбординг боевой системы.
 * Показывается один раз при первом заходе в раздел «Бой».
 *
 * 4 слайда:
 *  1. Что вообще тут происходит
 *  2. Как читается код Python (PREDICT)
 *  3. Как вставлять кусок кода (COMPLETE)
 *  4. Тренировочный режим + кнопка «Покажи решение»
 */
import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface Props {
  onClose: () => void;
  themeColor: string;
}

interface Slide {
  title: string;
  body: React.ReactNode;
  codeExample?: string;
  codeCaption?: string;
}

export default function CombatTutorial({ onClose, themeColor }: Props) {
  const [step, setStep] = useState(0);

  const slides: Slide[] = [
    {
      title: 'Что такое COMBAT CODE',
      body: (
        <div className="space-y-2 text-sm font-rajdhani text-gray-200">
          <p>В этом мире код — это оружие. Каждый враг даёт тебе задачу на Python, и от того, как ты её решишь, зависит — ты бьёшь или бьют тебя.</p>
          <p className="text-cyan-300">Не нужно быть программистом!</p>
          <p>Первые враги задают только две простые штуки:</p>
          <ul className="list-none space-y-1 pl-2 text-[13px]">
            <li>· <span className="text-green-400">PREDICT</span> — прочитать код и угадать что он напечатает</li>
            <li>· <span className="text-yellow-400">COMPLETE</span> — вставить одно слово в пропуск</li>
          </ul>
          <p className="text-gray-400 text-xs">Писать функции с нуля придётся только начиная с босса главы 1.</p>
        </div>
      ),
    },
    {
      title: 'Тип 1: PREDICT — читаем код',
      body: (
        <div className="space-y-2 text-sm font-rajdhani text-gray-200">
          <p>Враг бросает тебе короткий код. Твоя задача — прочитать его строка за строкой и сказать, что напечатается.</p>
          <p>Например, вот код:</p>
        </div>
      ),
      codeExample: 'a = 5\nb = 3\nprint(a + b)',
      codeCaption: 'Разбираем построчно: переменная a получает 5, b получает 3, потом print печатает их сумму. Ответ: 8',
    },
    {
      title: 'Тип 2: COMPLETE — вставляем слово',
      body: (
        <div className="space-y-2 text-sm font-rajdhani text-gray-200">
          <p>Ты видишь почти готовый код с пропуском <code className="text-yellow-400 bg-black/40 px-1">___</code>. Нужно вписать одну строку, чтобы всё заработало.</p>
          <p>Например, нужна сумма всех чисел в списке:</p>
        </div>
      ),
      codeExample: 'def sum_all(lst):\n    total = 0\n    for x in lst:\n        ___\n    return total',
      codeCaption: 'В пропуск нужно вставить: total += x — это сокращение для total = total + x. На каждом шаге к total прибавляется текущее x.',
    },
    {
      title: 'Тренировка и подсказки',
      body: (
        <div className="space-y-2 text-sm font-rajdhani text-gray-200">
          <p>Не уверен в себе? Сначала зайди в <span className="text-cyan-300">режим Тренировка</span> (кнопка рядом с боем):</p>
          <ul className="list-none space-y-1 pl-2 text-[13px]">
            <li>· Те же задачи, но <span className="text-green-400">без HP, без таймера, без проигрыша</span></li>
            <li>· Есть кнопка <span className="text-yellow-400">«💡 Подсказка»</span> — короткий совет</li>
            <li>· И кнопка <span className="text-purple-400">«📖 Покажи решение»</span> — готовый код с разбором каждой строки</li>
          </ul>
          <p className="text-gray-400 text-xs pt-1">Когда станет легко — переключайся в боевой режим за наградами.</p>
        </div>
      ),
    },
  ];

  const slide = slides[step];
  const isLast = step === slides.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-xl w-full border bg-black/90 relative"
        style={{ borderColor: themeColor + '60', boxShadow: `0 0 40px ${themeColor}30` }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Icon name="GraduationCap" size={16} style={{ color: themeColor }} />
            <span className="font-orbitron text-xs tracking-widest" style={{ color: themeColor }}>
              ОБУЧЕНИЕ · ШАГ {step + 1}/{slides.length}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <Icon name="X" size={16} />
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-1 px-4 pt-3">
          {slides.map((_, i) => (
            <div key={i} className="h-0.5 flex-1 transition-all"
              style={{ backgroundColor: i <= step ? themeColor : '#ffffff15' }} />
          ))}
        </div>

        {/* Body */}
        <div className="p-5 min-h-[280px]">
          <h3 className="font-orbitron text-lg text-white mb-3">{slide.title}</h3>
          {slide.body}

          {slide.codeExample && (
            <div className="mt-3 border border-cyan-500/30 bg-black/60">
              <div className="px-3 py-1.5 border-b border-white/5 font-mono text-[10px] text-gray-500">
                example.py
              </div>
              <pre className="p-3 font-mono text-[12px] text-cyber-cyan whitespace-pre overflow-x-auto">
{slide.codeExample}
              </pre>
            </div>
          )}

          {slide.codeCaption && (
            <div className="mt-2 text-[12px] font-rajdhani text-gray-300 leading-relaxed">
              {slide.codeCaption}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
          <button onClick={onClose} className="font-mono text-[11px] text-gray-500 hover:text-white">
            Пропустить
          </button>

          <div className="flex gap-2">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="font-orbitron text-xs px-4 py-2 border border-white/20 text-gray-300 hover:bg-white/5">
                Назад
              </button>
            )}
            {!isLast ? (
              <button onClick={() => setStep(s => s + 1)}
                className="font-orbitron text-xs px-4 py-2 border transition-all"
                style={{ borderColor: themeColor, color: themeColor, backgroundColor: themeColor + '15' }}>
                Далее →
              </button>
            ) : (
              <button onClick={onClose}
                className="font-orbitron text-xs px-4 py-2 border transition-all"
                style={{ borderColor: themeColor, color: themeColor, backgroundColor: themeColor + '20' }}>
                В БОЙ ⚔️
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
