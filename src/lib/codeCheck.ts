/**
 * codeCheck — мягкая проверка пользовательского Python-кода.
 * Не выполняет код, но устойчив к пробелам, регистру и порядку.
 */

/** Нормализует строку: убирает лишние пробелы, приводит кавычки */
export function normalize(code: string): string {
  return code
    .replace(/\r\n/g, '\n')
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/[ \t]+/g, ' ')   // повторные пробелы → 1
    .replace(/ ?: ?/g, ':')
    .replace(/ ?, ?/g, ',')
    .replace(/ ?= ?/g, '=')
    .replace(/ ?\( ?/g, '(')
    .replace(/ ?\) ?/g, ')')
    .replace(/ ?\[ ?/g, '[')
    .replace(/ ?\] ?/g, ']')
    .replace(/ ?\{ ?/g, '{')
    .replace(/ ?\} ?/g, '}')
    .trim()
    .toLowerCase();
}

/** Проверка: пользовательский ответ совпадает с одним из принимаемых */
export function checkSingleLine(userInput: string, accepted: string[]): boolean {
  const u = normalize(userInput);
  return accepted.some(a => {
    const n = normalize(a);
    // Допускаем эквивалентные кавычки и порядок ключей в словарях
    return u === n || matchDictEquivalent(u, n);
  });
}

/** Считает {"name":"x","level":7} равным {"level":7,"name":"x"} */
function matchDictEquivalent(a: string, b: string): boolean {
  const aDict = parseSimpleDict(a);
  const bDict = parseSimpleDict(b);
  if (!aDict || !bDict) return false;
  const aKeys = Object.keys(aDict).sort();
  const bKeys = Object.keys(bDict).sort();
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((k, i) => k === bKeys[i] && aDict[k] === bDict[k]);
}

function parseSimpleDict(s: string): Record<string, string> | null {
  // ловим конструкцию вида {...} в строке
  const m = s.match(/\{([^{}]*)\}/);
  if (!m) return null;
  const inner = m[1];
  const pairs: Record<string, string> = {};
  for (const part of inner.split(',')) {
    const [k, ...rest] = part.split(':');
    if (!k || rest.length === 0) return null;
    pairs[k.trim().replace(/['"]/g, '')] = rest.join(':').trim();
  }
  return pairs;
}

/** Структурная проверка для Мастерской — ищет паттерны, а не просто слова */
export interface StructureCheck {
  /** Имя функции которое должно быть определено */
  defName?: string;
  /** Должен быть return */
  needsReturn?: boolean;
  /** Регулярки которые должны сработать */
  patterns?: { re: RegExp; hint: string }[];
  /** Слова которые должны встретиться */
  keywords?: string[];
}

export interface CheckResult {
  ok: boolean;
  missing: string[];
  passRatio: number;
}

export function checkStructure(code: string, spec: StructureCheck): CheckResult {
  const norm = normalize(code);
  const missing: string[] = [];
  let total = 0;
  let passed = 0;

  if (spec.defName) {
    total++;
    const re = new RegExp(`def\\s+${spec.defName}\\s*\\(`);
    if (re.test(norm)) passed++;
    else missing.push(`def ${spec.defName}(...)`);
  }

  if (spec.needsReturn) {
    total++;
    if (/\breturn\b/.test(norm)) passed++;
    else missing.push('return');
  }

  for (const p of spec.patterns || []) {
    total++;
    if (p.re.test(norm)) passed++;
    else missing.push(p.hint);
  }

  for (const k of spec.keywords || []) {
    total++;
    if (norm.includes(k.toLowerCase())) passed++;
    else missing.push(k);
  }

  const passRatio = total === 0 ? 1 : passed / total;
  return { ok: passRatio >= 0.95, missing, passRatio };
}
