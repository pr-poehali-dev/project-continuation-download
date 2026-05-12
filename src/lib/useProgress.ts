import { useState, useEffect } from 'react';
import { progress, subscribeProgress, ProgressState } from './progressStore';

/** Реактивный хук — перерисовывается при любом изменении прогресса */
export function useProgress(): ProgressState {
  const [state, setState] = useState<ProgressState>(() => progress.get());

  useEffect(() => {
    // Подписываемся на события прогресса
    const unsub = subscribeProgress(() => setState(progress.get()));
    return unsub;
  }, []);

  return state;
}
