/**
 * Implants — данные и бонусы имплантов из Мастерской.
 * Centralized чтобы и CodeWorkshop, и профиль, и боевая система видели одно.
 */

export interface ImplantDef {
  id: string;
  name: string;
  icon: string;
  desc: string;
  bonus: string;
  color: string;
  rarity: 'common' | 'rare' | 'epic';
  xp: number;
  effects: ImplantEffects;
}

export interface ImplantEffects {
  xpMultiplier?: number;       // умножает XP за бой/урок/etc
  hpBonus?: number;            // прибавка к max HP
  damageBonus?: number;        // % к урону в бою
  hintDiscount?: number;       // снижает штраф за подсказку (0..1)
  shopDiscount?: number;       // % скидки в магазине (0..1)
}

export const IMPLANTS: ImplantDef[] = [
  {
    id: 'speed_chip', name: 'Чип скорости', icon: '⚡',
    desc: 'Удваивает любой стат агента', bonus: '+10% урон',
    color: '#00ff41', rarity: 'common', xp: 80,
    effects: { damageBonus: 0.10 },
  },
  {
    id: 'shield_mod', name: 'Модуль щита', icon: '🛡️',
    desc: 'Восстанавливает HP до максимума', bonus: '+20 HP',
    color: '#00aaff', rarity: 'common', xp: 100,
    effects: { hpBonus: 20 },
  },
  {
    id: 'xp_doubler', name: 'Удвоитель XP', icon: '💎',
    desc: 'Принимает список XP и возвращает удвоенный', bonus: '+25% XP',
    color: '#ffaa00', rarity: 'rare', xp: 160,
    effects: { xpMultiplier: 1.25 },
  },
  {
    id: 'guard_filter', name: 'Фильтр угроз', icon: '🔍',
    desc: 'Отбирает врагов выше определённого уровня', bonus: '−50% штраф за подсказку',
    color: '#ff00ff', rarity: 'rare', xp: 180,
    effects: { hintDiscount: 0.5 },
  },
  {
    id: 'agent_core', name: 'Ядро Агента', icon: '🤖',
    desc: 'Класс с конструктором и методом', bonus: '+15% XP, +15% урон, +30 HP',
    color: '#aa00ff', rarity: 'epic', xp: 300,
    effects: { xpMultiplier: 1.15, damageBonus: 0.15, hpBonus: 30 },
  },
];

export function getImplant(id: string): ImplantDef | undefined {
  return IMPLANTS.find(i => i.id === id);
}

/** Суммарные эффекты от всех надетых имплантов */
export function computeBonuses(equippedIds: string[]): Required<ImplantEffects> {
  const total: Required<ImplantEffects> = {
    xpMultiplier: 1,
    hpBonus: 0,
    damageBonus: 0,
    hintDiscount: 0,
    shopDiscount: 0,
  };
  for (const id of equippedIds) {
    const imp = getImplant(id);
    if (!imp) continue;
    const e = imp.effects;
    if (e.xpMultiplier) total.xpMultiplier *= e.xpMultiplier;
    if (e.hpBonus) total.hpBonus += e.hpBonus;
    if (e.damageBonus) total.damageBonus += e.damageBonus;
    if (e.hintDiscount) total.hintDiscount = Math.max(total.hintDiscount, e.hintDiscount);
    if (e.shopDiscount) total.shopDiscount = Math.max(total.shopDiscount, e.shopDiscount);
  }
  return total;
}

/** Применяет XP-множитель имплантов */
export function applyXpBonus(baseXp: number, equippedIds: string[]): number {
  const { xpMultiplier } = computeBonuses(equippedIds);
  return Math.round(baseXp * xpMultiplier);
}
