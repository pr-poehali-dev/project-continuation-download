import { useState, useRef, useCallback } from 'react';

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  globals: { get: (key: string) => unknown };
}

interface RunResult {
  output: string;
  error: string | null;
  success: boolean;
}

// Глобальный singleton — загружаем один раз
let pyodidePromise: Promise<PyodideInterface> | null = null;

function loadPyodideOnce(): Promise<PyodideInterface> {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      // Загружаем Pyodide через CDN (не из npm, чтобы избежать проблем с wasm bundling)
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js';
      document.head.appendChild(script);

      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Pyodide'));
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const py = await (window as any).loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/',
      });
      return py;
    })();
  }
  return pyodidePromise;
}

export function usePyodide() {
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const pyRef = useRef<PyodideInterface | null>(null);

  const ensureLoaded = useCallback(async () => {
    if (pyRef.current) return true;
    setLoading(true);
    try {
      pyRef.current = await loadPyodideOnce();
      setReady(true);
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const runCode = useCallback(async (code: string, timeoutMs = 5000): Promise<RunResult> => {
    const ok = await ensureLoaded();
    if (!ok || !pyRef.current) {
      return { output: '', error: 'Pyodide не загружен', success: false };
    }

    const py = pyRef.current;
    let output = '';

    // Перехватываем stdout
    const captureSetup = `
import sys
import io
_stdout_capture = io.StringIO()
sys.stdout = _stdout_capture
`;
    const captureRead = `
sys.stdout = sys.__stdout__
_stdout_capture.getvalue()
`;

    try {
      // Устанавливаем таймаут
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('⏱ Превышено время выполнения (5 сек)')), timeoutMs)
      );

      await Promise.race([py.runPythonAsync(captureSetup), timeoutPromise]);
      await Promise.race([py.runPythonAsync(code), timeoutPromise]);
      output = String(await py.runPythonAsync(captureRead) ?? '');

      return { output: output.trim(), error: null, success: true };
    } catch (err) {
      // Восстанавливаем stdout при ошибке
      try { await py.runPythonAsync('import sys; sys.stdout = sys.__stdout__'); } catch { /* ignore */ }
      const msg = err instanceof Error ? err.message : String(err);
      // Убираем длинный traceback — оставляем последнюю строку
      const short = msg.split('\n').filter(Boolean).pop() ?? msg;
      return { output: '', error: short, success: false };
    }
  }, [ensureLoaded]);

  return { runCode, loading, ready, ensureLoaded };
}
