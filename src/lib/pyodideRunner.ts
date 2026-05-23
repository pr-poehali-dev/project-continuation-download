/**
 * pyodideRunner — реальное исполнение Python в браузере (Pyodide / WASM).
 *
 * Используется боевой системой Code = Атака:
 *  - WRITE     : запускаем код игрока и гоняем юнит-тесты
 *  - PREDICT   : считаем эталонный вывод
 *  - DEBUG     : запускаем исправленный код игрока
 *  - REFACTOR  : проверяем что результат прежний + считаем длину
 *  - COMPLETE  : подставляем код игрока в шаблон и исполняем
 *
 * Pyodide ~10MB, грузится один раз с CDN, кешируется браузером.
 * Загрузка ленивая — стартует только когда игрок начал бой.
 */

declare global {
  interface Window {
    loadPyodide?: (config?: { indexURL?: string }) => Promise<PyodideAPI>;
    pyodide?: PyodideAPI;
  }
}

interface PyodideAPI {
  runPython: (code: string) => unknown;
  runPythonAsync: (code: string) => Promise<unknown>;
  globals: { get: (k: string) => unknown; set: (k: string, v: unknown) => void };
  setStdout: (cfg: { batched: (s: string) => void }) => void;
  setStderr: (cfg: { batched: (s: string) => void }) => void;
}

const CDN_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';

let pyodide: PyodideAPI | null = null;
let loadPromise: Promise<PyodideAPI> | null = null;
let loadingProgress: 'idle' | 'loading' | 'ready' | 'error' = 'idle';

/** Грузим Pyodide один раз, кешируем глобально. */
export function loadPyodideRuntime(): Promise<PyodideAPI> {
  if (pyodide) return Promise.resolve(pyodide);
  if (loadPromise) return loadPromise;

  loadingProgress = 'loading';

  loadPromise = new Promise((resolve, reject) => {
    // Грузим скрипт CDN
    const existing = document.querySelector('script[data-pyodide]');
    if (!existing) {
      const script = document.createElement('script');
      script.src = `${CDN_URL}pyodide.js`;
      script.setAttribute('data-pyodide', '1');
      script.async = true;
      script.onload = () => initPyodide().then(resolve).catch(reject);
      script.onerror = () => {
        loadingProgress = 'error';
        reject(new Error('Не удалось загрузить Pyodide'));
      };
      document.head.appendChild(script);
    } else {
      initPyodide().then(resolve).catch(reject);
    }
  });

  return loadPromise;
}

async function initPyodide(): Promise<PyodideAPI> {
  if (!window.loadPyodide) {
    throw new Error('Pyodide script не подключился');
  }
  const py = await window.loadPyodide({ indexURL: CDN_URL });
  pyodide = py;
  window.pyodide = py;
  loadingProgress = 'ready';
  return py;
}

export function getLoadingState() {
  return loadingProgress;
}

// ───────────────────────────────────────────────────────────────────────────
// Запуск кода
// ───────────────────────────────────────────────────────────────────────────

export interface RunResult {
  ok: boolean;
  stdout: string;
  stderr: string;
  /** Тип ошибки если упало (SyntaxError / NameError / ...) */
  errorType?: string;
  /** Сколько миллисекунд исполнялось */
  durationMs: number;
}

/**
 * Безопасно запускает Python код игрока. Перехватывает stdout/stderr,
 * никогда не бросает наружу — всё в RunResult.
 */
export async function runPython(code: string, timeoutMs = 5000): Promise<RunResult> {
  const t0 = performance.now();
  const result: RunResult = { ok: false, stdout: '', stderr: '', durationMs: 0 };

  try {
    const py = await loadPyodideRuntime();
    let out = '';
    let err = '';
    py.setStdout({ batched: (s: string) => { out += s; } });
    py.setStderr({ batched: (s: string) => { err += s; } });

    // Race с таймаутом — на случай while True игрока
    await Promise.race([
      py.runPythonAsync(code),
      new Promise((_, rej) => setTimeout(() => rej(new Error('TIMEOUT')), timeoutMs)),
    ]);

    result.ok = !err;
    result.stdout = out.trim();
    result.stderr = err.trim();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    result.stderr = msg;
    // Извлекаем тип ошибки Python из traceback
    const match = msg.match(/(\w+Error|\w+Exception):/);
    if (match) result.errorType = match[1];
    if (msg === 'TIMEOUT') result.errorType = 'TimeoutError';
  }

  result.durationMs = Math.round(performance.now() - t0);
  return result;
}

// ───────────────────────────────────────────────────────────────────────────
// Тесты для WRITE-задач
// ───────────────────────────────────────────────────────────────────────────

export interface TestCase {
  /** Что вызвать. Например: 'add(2, 3)' или 'is_even(10)' */
  call: string;
  /** Ожидаемый Python-литерал. Например: '5' / "'hello'" / '[1, 2, 3]' */
  expect: string;
  /** Видимое имя в UI. */
  label?: string;
  /** Скрыт ли тест от игрока (для боссов: видишь только итог). */
  hidden?: boolean;
}

export interface TestRunResult {
  passed: number;
  total: number;
  details: { label: string; pass: boolean; got: string; expect: string; hidden: boolean }[];
  /** Краткое сообщение об ошибке для UI. */
  errorSummary?: string;
  durationMs: number;
}

/**
 * Берёт код игрока + тесты + опционально импорт (например для DEBUG),
 * исполняет всё и возвращает прохождение каждого теста.
 */
export async function runTests(
  userCode: string,
  tests: TestCase[],
  preludeCode = '',
): Promise<TestRunResult> {
  const t0 = performance.now();

  // Соберём один скрипт: prelude + код игрока + блок тестов с print результатов
  const testCalls = tests
    .map((t, i) => `try:\n    __r = repr(${t.call})\nexcept Exception as e:\n    __r = "__ERR__: " + type(e).__name__ + ": " + str(e)\nprint(f"__T${i}__|" + __r)`)
    .join('\n');

  const fullCode = `${preludeCode}\n${userCode}\n\n${testCalls}`;
  const run = await runPython(fullCode);

  const details: TestRunResult['details'] = [];
  let passed = 0;

  // Если упал ещё до тестов — все провалены
  if (run.stderr && !run.stdout.includes('__T0__|')) {
    return {
      passed: 0,
      total: tests.length,
      details: tests.map(t => ({
        label: t.label || t.call,
        pass: false,
        got: 'не выполнилось',
        expect: t.expect,
        hidden: !!t.hidden,
      })),
      errorSummary: run.errorType ? `${run.errorType}: ${run.stderr.split('\n').pop()}` : run.stderr,
      durationMs: Math.round(performance.now() - t0),
    };
  }

  // Парсим результаты тестов из stdout
  const lines = run.stdout.split('\n');
  tests.forEach((t, i) => {
    const line = lines.find(l => l.startsWith(`__T${i}__|`));
    const got = line ? line.slice(`__T${i}__|`.length) : 'нет вывода';
    // Нормализуем — repr добавляет кавычки и пробелы, эталон тоже
    const pass = got === t.expect.trim() && !got.startsWith('__ERR__');
    if (pass) passed++;
    details.push({
      label: t.label || t.call,
      pass,
      got,
      expect: t.expect,
      hidden: !!t.hidden,
    });
  });

  return {
    passed,
    total: tests.length,
    details,
    durationMs: Math.round(performance.now() - t0),
  };
}

// ───────────────────────────────────────────────────────────────────────────
// PREDICT: считаем что напечатает чужой код
// ───────────────────────────────────────────────────────────────────────────

export async function computeExpectedOutput(code: string): Promise<string> {
  const res = await runPython(code);
  return res.stdout;
}

/**
 * Сравниваем ответ игрока с реальным выводом.
 * Игнорируем регистр, кавычки и хвостовые пробелы — чтобы '5' и 5 совпадали,
 * "Hello" и 'Hello' тоже.
 */
export function comparePredict(userAnswer: string, expected: string): boolean {
  const norm = (s: string) => s.trim().replace(/^['"]|['"]$/g, '').toLowerCase();
  return norm(userAnswer) === norm(expected);
}
