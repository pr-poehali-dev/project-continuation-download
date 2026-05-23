/**
 * useOnboarding — отслеживает «видел ли игрок туториал/микро-урок».
 * Всё хранится в localStorage, ключи изолированы префиксом.
 *
 * Используем для:
 *  - boot:battle — главный туториал боя (показываем 1 раз)
 *  - type:write / type:debug / type:refactor — микро-уроки перед типом задачи
 *  - training:done — игрок прошёл хотя бы одну тренировку
 */
import { useState, useEffect, useCallback } from 'react';

const PREFIX = 'cg9_onb:';

function readSeen(key: string): boolean {
  try {
    return localStorage.getItem(PREFIX + key) === '1';
  } catch {
    return false;
  }
}

function writeSeen(key: string, value: boolean) {
  try {
    if (value) localStorage.setItem(PREFIX + key, '1');
    else localStorage.removeItem(PREFIX + key);
  } catch { /* SSR / privacy mode */ }
}

export function useOnboarding(key: string) {
  const [seen, setSeen] = useState<boolean>(() => readSeen(key));

  useEffect(() => {
    setSeen(readSeen(key));
  }, [key]);

  const markSeen = useCallback(() => {
    writeSeen(key, true);
    setSeen(true);
  }, [key]);

  const reset = useCallback(() => {
    writeSeen(key, false);
    setSeen(false);
  }, [key]);

  return { seen, markSeen, reset };
}

/** Прочитать список ключей онбординга (для отладки / админ-режима). */
export function getAllOnboardingKeys(): string[] {
  const out: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) out.push(k.slice(PREFIX.length));
    }
  } catch { /* ignore */ }
  return out;
}

export function resetAllOnboarding() {
  try {
    const keys = getAllOnboardingKeys();
    keys.forEach(k => localStorage.removeItem(PREFIX + k));
  } catch { /* ignore */ }
}
