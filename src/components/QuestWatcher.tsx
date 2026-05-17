import { useEffect, useRef } from 'react';
import { useGame } from '@/lib/GameContext';
import { useProgress } from '@/lib/useProgress';
import { pushNotif } from './Notifications';

/**
 * Невидимый компонент — следит за прогрессом и шлёт уведомления
 * когда у игрока выполняется новая цель квеста или завершается квест целиком.
 */
export default function QuestWatcher() {
  const { character } = useGame();
  const prog = useProgress();
  const lastSnapshot = useRef<{
    lessons: number;
    battles: number;
    dungeons: number;
    npcs: number;
    level: number;
  }>({
    lessons: prog.lessonsCompleted.length,
    battles: prog.battlesWon,
    dungeons: prog.dungeonsCompleted.length,
    npcs: prog.npcsSpoken.length,
    level: character?.level ?? 0,
  });

  useEffect(() => {
    const prev = lastSnapshot.current;
    const curr = {
      lessons: prog.lessonsCompleted.length,
      battles: prog.battlesWon,
      dungeons: prog.dungeonsCompleted.length,
      npcs: prog.npcsSpoken.length,
      level: character?.level ?? 0,
    };

    // Какое-то событие произошло — даём подсказку про квесты
    const newLesson  = curr.lessons  > prev.lessons;
    const newBattle  = curr.battles  > prev.battles;
    const newDungeon = curr.dungeons > prev.dungeons;
    const newNpc     = curr.npcs     > prev.npcs;
    const newLevel   = curr.level    > prev.level;

    if (newLesson) {
      pushNotif({
        type: 'quest',
        title: 'Прогресс по квестам',
        body: `Урок засчитан — проверь Журнал миссий`,
        icon: '📜', color: '#00ff41',
      });
    }
    if (newBattle) {
      pushNotif({
        type: 'quest',
        title: 'Прогресс по квестам',
        body: `Победа засчитана — проверь Журнал миссий`,
        icon: '⚔️', color: '#aa00ff',
      });
    }
    if (newDungeon) {
      pushNotif({
        type: 'quest',
        title: 'Прогресс по квестам',
        body: `Данж засчитан — проверь Журнал миссий`,
        icon: '🏚️', color: '#ffaa00',
      });
    }
    if (newNpc) {
      pushNotif({
        type: 'quest',
        title: 'Прогресс по квестам',
        body: `Разговор засчитан — проверь Журнал миссий`,
        icon: '💬', color: '#00aaff',
      });
    }
    if (newLevel) {
      // Уровень — отдельный notif идёт из бекенда, тут только обновляем snapshot
    }

    lastSnapshot.current = curr;
  }, [
    prog.lessonsCompleted.length,
    prog.battlesWon,
    prog.dungeonsCompleted.length,
    prog.npcsSpoken.length,
    character?.level,
  ]);

  return null;
}
