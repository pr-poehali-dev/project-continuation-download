/**
 * TaskTypeIntro — короткий экран (30-60 сек), показывается перед первой задачей
 * данного типа в карьере игрока. Объясняет правила и даёт пример.
 *
 * Показывается ОДИН раз для каждого типа, сохраняется через useOnboarding('type:write' и т.п.).
 */
import Icon from '@/components/ui/icon';
import type { TaskType } from '@/lib/combatTasks';

interface Props {
  type: TaskType;
  onClose: () => void;
  themeColor: string;
}

interface Intro {
  title: string;
  short: string;
  rules: string[];
  exampleCode: string;
  exampleNote: string;
}

const INTROS: Record<TaskType, Intro> = {
  predict: {
    title: 'PREDICT — Угадай вывод',
    short: 'Прочитай код и впиши, что он напечатает.',
    rules: [
      'Не нужно ничего писать самому',
      'Просто читай код сверху вниз',
      'Думай: какое число / строка / список попадёт в print()?',
    ],
    exampleCode: 'x = [1, 2, 3]\nprint(x[-1])',
    exampleNote: 'x[-1] — последний элемент списка. Ответ: 3',
  },
  complete: {
    title: 'COMPLETE — Вставь пропуск',
    short: 'В коде есть дырка ___. Впиши туда одну строку.',
    rules: [
      'Меняй только пропуск, не трогай остальной код',
      'Подсказка о размере: обычно нужно одно выражение или присваивание',
      'Если не понимаешь — открой подсказку (💡) или решение (📖) в тренировке',
    ],
    exampleCode: 'def double(n):\n    return ___',
    exampleNote: 'Нужно умножить n на 2. Ответ: n * 2',
  },
  write: {
    title: 'WRITE — Напиши функцию',
    short: 'Самый сложный тип: нужно написать функцию с нуля.',
    rules: [
      'Тебе дают шаблон вроде def my_func(x): и описание',
      'Заверши функцию так, чтобы все тесты прошли',
      'Структура: def имя(аргументы): затем строки с отступом 4 пробела, в конце return',
    ],
    exampleCode: 'def add(a, b):\n    return a + b',
    exampleNote: 'Функция add получает 2 числа и возвращает их сумму. add(2, 3) даст 5.',
  },
  debug: {
    title: 'DEBUG — Найди ошибку',
    short: 'Код почти рабочий, но в нём баг. Исправь.',
    rules: [
      'Меняй минимум — обычно нужно поменять 1-2 символа или строку',
      'Часто баги: range(n) вместо range(n+1), == вместо =, неправильный отступ',
      'Запусти код после правки — все тесты должны загореться зелёным',
    ],
    exampleCode: 'def half(x):\n    return x / 0  # ← ошибка тут',
    exampleNote: 'Делить на 0 нельзя. Должно быть x / 2.',
  },
  refactor: {
    title: 'REFACTOR — Сократи код',
    short: 'Код рабочий, но длинный. Перепиши его короче.',
    rules: [
      'Тесты должны продолжать проходить',
      'Длина кода (без пробелов) должна быть меньше указанного предела',
      'Главные приёмы: list comprehension вместо цикла, объединение строк, удаление лишних переменных',
    ],
    exampleCode: '# Было:\nout = []\nfor x in lst:\n    out.append(x*2)\n# Стало:\nout = [x*2 for x in lst]',
    exampleNote: 'List comprehension — компактная форма цикла, который собирает список.',
  },
};

export default function TaskTypeIntro({ type, onClose, themeColor }: Props) {
  const intro = INTROS[type];

  return (
    <div className="fixed inset-0 z-40 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-md w-full border bg-black/95"
        style={{ borderColor: themeColor + '60', boxShadow: `0 0 30px ${themeColor}30` }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Icon name="BookOpen" size={14} style={{ color: themeColor }} />
            <span className="font-orbitron text-[11px] tracking-widest" style={{ color: themeColor }}>
              НОВЫЙ ТИП ЗАДАЧИ
            </span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <Icon name="X" size={14} />
          </button>
        </div>

        <div className="p-5">
          <h3 className="font-orbitron text-lg text-white mb-1">{intro.title}</h3>
          <p className="text-sm font-rajdhani text-gray-300 mb-3">{intro.short}</p>

          <div className="space-y-1.5 mb-4">
            {intro.rules.map((rule, i) => (
              <div key={i} className="flex items-start gap-2 text-[12px] font-rajdhani text-gray-300">
                <span style={{ color: themeColor }}>›</span>
                <span>{rule}</span>
              </div>
            ))}
          </div>

          <div className="border border-cyan-500/30 bg-black/60">
            <div className="px-3 py-1 border-b border-white/5 font-mono text-[10px] text-gray-500">
              пример
            </div>
            <pre className="p-3 font-mono text-[11px] text-cyber-cyan whitespace-pre overflow-x-auto">
{intro.exampleCode}
            </pre>
          </div>
          <div className="mt-2 text-[12px] font-rajdhani text-gray-400 leading-relaxed">
            {intro.exampleNote}
          </div>
        </div>

        <div className="flex justify-end px-4 py-3 border-t border-white/10">
          <button onClick={onClose}
            className="font-orbitron text-xs px-5 py-2 border transition-all"
            style={{ borderColor: themeColor, color: themeColor, backgroundColor: themeColor + '20' }}>
            Понятно, поехали!
          </button>
        </div>
      </div>
    </div>
  );
}
