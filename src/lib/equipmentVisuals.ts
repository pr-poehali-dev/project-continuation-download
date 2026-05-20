/**
 * equipmentVisuals — визуальное представление экипировки на персонаже.
 *
 * Идея: к каждому предмету в магазине/инвентаре/мастерской подбираем
 * арт и позицию на CSS-силуэте. Если предмета нет в маппинге — используем
 * fallback по слоту (универсальный визор/броня/клинок).
 */

export type EquipmentSlot = 'head' | 'body' | 'weapon' | 'gloves' | 'boots' | 'implant';

export interface VisualLayer {
  /** URL изображения предмета на прозрачном/чёрном фоне */
  src: string;
  /** Позиция на персонаже в % от размера силуэта */
  top: string;          // например '5%'
  left: string;         // '50%'
  /** Размер слоя относительно ширины контейнера */
  width: string;        // '60%'
  /** mix-blend-mode чтобы фон сливался с силуэтом */
  blend?: 'screen' | 'lighten' | 'plus-lighter' | 'normal';
  /** Z-индекс слоя (выше = поверх) */
  z?: number;
  /** Цвет свечения вокруг предмета (соответствует редкости) */
  glow?: string;
  /** Поворот в градусах */
  rotate?: number;
}

// ─── Базовый силуэт ──────────────────────────────────────────────────────────

export const SILHOUETTE_SRC =
  'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/770eb023-6d64-486a-83d3-7c2e388daa67.jpg';

// ─── Арт предметов ───────────────────────────────────────────────────────────

const ART = {
  helmet_cyan:    'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/4df66a49-8ed2-46cc-a26e-2db32f55e78c.jpg',
  visor_green:    'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/4d6d966e-7172-4764-a968-a0b53d65f3f0.jpg',
  armor_magenta:  'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/eb863c43-f5c7-404e-a943-791459418f45.jpg',
  armor_purple:   'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/eac17953-214f-4ba4-a272-ea5f6190128a.jpg',
  blade_green:    'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/05d4424c-af40-42b3-9039-3f763817699f.jpg',
  blade_magenta:  'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/9fa14935-5e56-40e6-8607-999d428ac1c5.jpg',
  pistol_orange:  'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/a6cafe7b-c9b3-4b06-9164-adfd5488d630.jpg',
};

// ─── Позиции слоёв на силуэте ─────────────────────────────────────────────────

const SLOT_POSITIONS: Record<EquipmentSlot, Omit<VisualLayer, 'src' | 'glow'>> = {
  head:   { top: '3%',  left: '50%', width: '32%', blend: 'screen', z: 30 },
  body:   { top: '24%', left: '50%', width: '52%', blend: 'screen', z: 20 },
  weapon: { top: '32%', left: '88%', width: '28%', blend: 'screen', z: 25, rotate: 15 },
  gloves: { top: '42%', left: '15%', width: '18%', blend: 'screen', z: 22 },
  boots:  { top: '82%', left: '50%', width: '34%', blend: 'screen', z: 21 },
  implant:{ top: '14%', left: '64%', width: '14%', blend: 'plus-lighter', z: 28 },
};

// ─── Редкость → glow ─────────────────────────────────────────────────────────

const RARITY_GLOW: Record<string, string> = {
  common:    '#888',
  uncommon:  '#00ff41',
  rare:      '#00aaff',
  epic:      '#aa00ff',
  legendary: '#ffaa00',
};

// ─── Маппинг конкретных предметов → арт ───────────────────────────────────────
//
// Ключ — нормализованное имя предмета (lowercase). Если имя не найдено,
// используется fallback по слоту через `pickArtForSlot`.

const ITEM_ART_BY_NAME: Record<string, string> = {
  // head
  'нейро-обруч mk.i': ART.visor_green,
  'нейро обруч':       ART.visor_green,
  'хакерский визор':   ART.visor_green,
  'нейро-шлем x9':     ART.helmet_cyan,
  'нейро шлем':        ART.helmet_cyan,
  'корп-имплант apex': ART.helmet_cyan,
  'helmet of clean code': ART.helmet_cyan,

  // body
  'тактический жакет':  ART.armor_magenta,
  'кибер-экзоскелет':   ART.armor_purple,
  'нано-броня':          ART.armor_purple,
  'корп-доспех':         ART.armor_purple,
  'archive jacket':      ART.armor_magenta,

  // weapon
  'код-клинок v1.0':     ART.blade_green,
  'плазменный хак':       ART.pistol_orange,
  'нейро-вирус':           ART.blade_magenta,
  'легаси-код':            ART.blade_magenta,
  'lambda blade':          ART.blade_magenta,
};

// Фоллбек по слоту — что показывать если конкретного арта нет
const SLOT_FALLBACK: Record<EquipmentSlot, string | null> = {
  head:   ART.visor_green,
  body:   ART.armor_magenta,
  weapon: ART.blade_green,
  gloves: null,   // пока без отдельного арта
  boots:  null,
  implant: null,  // импланты-«ауры» рисуются эффектом, не картинкой
};

export function pickArtForSlot(itemName: string, slot: EquipmentSlot): string | null {
  const key = itemName.toLowerCase().trim();
  return ITEM_ART_BY_NAME[key] ?? SLOT_FALLBACK[slot];
}

export interface EquipmentItemRef {
  name: string;
  slot: EquipmentSlot;
  rarity?: string;
}

export function buildVisualLayer(item: EquipmentItemRef): VisualLayer | null {
  const src = pickArtForSlot(item.name, item.slot);
  if (!src) return null;
  const pos = SLOT_POSITIONS[item.slot];
  return {
    src,
    ...pos,
    glow: RARITY_GLOW[item.rarity ?? 'common'] ?? RARITY_GLOW.common,
  };
}

// ─── Импланты-ауры (из Мастерской) ────────────────────────────────────────────
//
// Импланты не рендерятся картинками — это эффект-аура вокруг персонажа.
// Каждый имплант добавляет свой цвет в общее свечение.

export interface ImplantAura {
  color: string;
  intensity: number;   // 0..1
  pulse: boolean;      // пульсирует ли
}

export const IMPLANT_AURAS: Record<string, ImplantAura> = {
  speed_chip:   { color: '#00ff41', intensity: 0.6, pulse: true  },
  shield_mod:   { color: '#00aaff', intensity: 0.7, pulse: false },
  xp_doubler:   { color: '#ffaa00', intensity: 0.8, pulse: true  },
  guard_filter: { color: '#ff00ff', intensity: 0.6, pulse: true  },
  agent_core:   { color: '#aa00ff', intensity: 1.0, pulse: true  },
};
