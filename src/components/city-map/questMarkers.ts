// ─── Маркеры квестов на карте ────────────────────────────────────────────────
// Связывает невыполненные цели квестов с районами города.

import { QUESTS, checkObjective, Quest, QuestObjective } from '@/components/QuestLog';
import type { ProgressState } from '@/lib/progressStore';

/** Какому району соответствует цель квеста (по типу проверки) */
export function objectiveDistrictId(obj: QuestObjective): string | null {
  const c = obj.check;
  if (!c) return null;

  switch (c.type) {
    // Уроки → Syntax Street (базовые) / Function Factory (продвинутые)
    case 'lesson_id':
      return c.id <= 5 ? 'syntax_street' : 'function_factory';
    case 'lessons':
      return c.count <= 5 ? 'syntax_street' : 'function_factory';

    // Бои → Loop Arena
    case 'battles':
    case 'battles_streak':
    case 'daily_battles':
      return 'loop_arena';

    // Подземелья → конкретный данж
    case 'dungeon':
      return c.id; // совпадает с district id (nexus_alpha, archive_vault, …)
    case 'dungeons':
      return 'nexus_alpha'; // ближайший данж

    // NPC → где живёт NPC
    case 'npc':
      return npcDistrict(c.id);

    // Daily lessons / dungeons — общая привязка
    case 'daily_lessons':
      return 'syntax_street';
    case 'daily_dungeons':
      return 'nexus_alpha';

    // Level — нет конкретного района
    case 'level':
      return null;
  }
  return null;
}

/** Где живёт NPC */
function npcDistrict(npcId: string): string {
  const NPC_LOCATIONS: Record<string, string> = {
    pyth0n: 'undernet_hub',
    k4i: 'archive_vault',
    void_trader: 'black_market',
    vera: 'function_factory',
    echo: 'syntax_street',
    sigma: 'data_docks',
    brother_lambda: 'order_temple',
  };
  return NPC_LOCATIONS[npcId] || 'undernet_hub';
}

export interface DistrictQuestInfo {
  /** Сколько незавершённых целей привязано к этому району */
  pendingCount: number;
  /** Названия активных квестов с целями в районе */
  quests: { id: string; title: string; color: string; type: Quest['type'] }[];
  /** Есть ли сюжетный квест среди них */
  hasStory: boolean;
}

/**
 * Для каждого района собирает информацию о связанных активных квестах.
 * Возвращает Map: district_id → DistrictQuestInfo
 */
export function buildQuestMarkers(
  prog: ProgressState,
  character: { level: number } | null,
  claimedQuests: Set<string>,
): Map<string, DistrictQuestInfo> {
  const result = new Map<string, DistrictQuestInfo>();

  for (const quest of QUESTS) {
    if (quest.status !== 'active') continue;
    if (claimedQuests.has(quest.id)) continue;

    // Проверяем не выполнен ли уже квест целиком
    const allDone = quest.objectives.every(obj => checkObjective(obj, prog, character));
    if (allDone) continue;

    // Для каждой невыполненной цели — добавляем маркер на соответствующий район
    const touchedDistricts = new Set<string>();
    for (const obj of quest.objectives) {
      if (checkObjective(obj, prog, character)) continue;
      const districtId = objectiveDistrictId(obj);
      if (!districtId) continue;
      touchedDistricts.add(districtId);
    }

    for (const districtId of touchedDistricts) {
      const existing = result.get(districtId) || {
        pendingCount: 0,
        quests: [],
        hasStory: false,
      };
      existing.pendingCount += 1;
      existing.quests.push({
        id: quest.id,
        title: quest.title,
        color: quest.factionColor,
        type: quest.type,
      });
      if (quest.type === 'story') existing.hasStory = true;
      result.set(districtId, existing);
    }
  }

  return result;
}

/** Загрузить заклеймленные квесты из localStorage */
export function loadClaimedQuests(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem('claimed_quests') || '[]'));
  } catch {
    return new Set();
  }
}
