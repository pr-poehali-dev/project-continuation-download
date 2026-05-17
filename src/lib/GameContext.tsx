import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from './api';
import { progress } from './progressStore';

export interface Equipment {
  id: number;
  name: string;
  rarity: string;
  /** Унифицированные бонусы статов (нормализованы из stat_bonus бекенда) */
  stats: Record<string, number>;
  /** Алиас для обратной совместимости со старым кодом */
  stat_bonus: Record<string, number>;
  type: string;
  /** Слот экипировки (head/body/weapon/...) */
  slot: string;
}

export interface Character {
  id: number;
  user_id: number;
  name: string;
  class: string;
  level: number;
  xp: number;
  xp_to_next: number;
  hp: number;
  max_hp: number;
  coins: number;
  base_stats: Record<string, number>;
  /** Алиас для обратной совместимости — равен effective_stats */
  stats: Record<string, number>;
  effective_stats: Record<string, number>;
  equipment_bonuses: Record<string, number>;
  equipment: Record<string, Equipment | null>;
  current_chapter: number;
  current_quest: string;
}

export interface InventoryItem {
  inv_id: number;
  item_id: number;
  name: string;
  type: string;
  /** Слот экипировки, вычисляется из type */
  slot: string;
  /** Алиас — equipment / armor / consumable */
  item_type: string;
  rarity: string;
  /** Унифицированные бонусы */
  stats: Record<string, number>;
  stat_bonus: Record<string, number>;
  description: string;
  price: number;
  source: string;
}

export interface XpResult {
  xp_gained: number;
  coins_gained: number;
  new_xp: number;
  xp_to_next: number;
  new_level: number;
  leveled_up: boolean;
  new_coins: number;
  already_completed?: boolean;
}

interface GameState {
  token: string | null;
  username: string | null;
  character: Character | null;
  inventory: InventoryItem[];
  loading: boolean;
  authLoading: boolean;

  login: (login: string, password: string) => Promise<{ error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
  refreshCharacter: () => Promise<void>;
  refreshInventory: () => Promise<void>;
  setCharacter: (c: Character | Record<string, unknown> | null) => void;
  /** Быстрое обновление XP/level/coins в контексте без повторного запроса к серверу */
  applyXpResult: (result: XpResult) => void;
}

const GameContext = createContext<GameState | null>(null);

/** Сопоставление type → slot для предметов экипировки */
const TYPE_TO_SLOT: Record<string, string> = {
  weapon: 'weapon',
  armor: 'body',
  body: 'body',
  head: 'head',
  helmet: 'head',
  gloves: 'gloves',
  boots: 'boots',
  implant: 'implant',
};

function normalizeCharacter(raw: Record<string, unknown> | null): Character | null {
  if (!raw || raw.error) return raw as unknown as Character | null;
  const effective = (raw.effective_stats || raw.base_stats || {}) as Record<string, number>;
  const equipment: Record<string, Equipment | null> = {};
  for (const [slot, item] of Object.entries((raw.equipment || {}) as Record<string, unknown>)) {
    if (item) {
      const it = item as Record<string, unknown>;
      const bonus = (it.stat_bonus || it.stats || {}) as Record<string, number>;
      equipment[slot] = {
        id: it.id,
        name: it.name,
        rarity: it.rarity,
        type: it.type,
        slot,
        stat_bonus: bonus,
        stats: bonus,
      };
    } else {
      equipment[slot] = null;
    }
  }
  return {
    ...raw,
    stats: effective,
    effective_stats: effective,
    equipment,
  } as unknown as Character;
}

function normalizeInventoryItem(raw: Record<string, unknown>): InventoryItem {
  const bonus = (raw.stat_bonus || raw.stats || {}) as Record<string, number>;
  const slot = TYPE_TO_SLOT[raw.type as string] || (raw.type as string);
  const isEquipment =
    raw.type === 'weapon' || raw.type === 'armor' || raw.type === 'body' ||
    raw.type === 'head' || raw.type === 'helmet' || raw.type === 'gloves' ||
    raw.type === 'boots' || raw.type === 'implant';
  return {
    ...raw,
    slot,
    stats: bonus,
    stat_bonus: bonus,
    item_type: isEquipment ? 'equipment' : raw.type,
  };
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('coderp_token'));
  const [username, setUsername] = useState<string | null>(localStorage.getItem('coderp_username'));
  const [character, setCharacter] = useState<Character | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (token) {
      refreshCharacter().finally(() => setAuthLoading(false));
      // Подтягиваем прогресс с сервера и мерджим с локалкой
      api.progressSync().then(res => {
        if (res && !res.error) progress.mergeFromServer(res);
      }).catch(() => {});
    } else {
      setAuthLoading(false);
    }
  }, [token]);

  async function refreshCharacter() {
    if (!token) return;
    const data = await api.character.get();
    if (!data.error) {
      setCharacter(normalizeCharacter(data));
    } else if (data.no_character) {
      setCharacter(null);
    }
  }

  async function refreshInventory() {
    if (!token) return;
    const data = await api.character.inventory();
    if (!data.error) {
      setInventory((data.items || []).map(normalizeInventoryItem));
    }
  }

  /** Обёртка над setCharacter — нормализует данные перед сохранением */
  function setCharacterSafe(c: Character | Record<string, unknown> | null) {
    if (!c) { setCharacter(null); return; }
    const normalized = normalizeCharacter(c as Record<string, unknown>);
    setCharacter(normalized);
  }

  async function login(loginVal: string, password: string) {
    setLoading(true);
    const data = await api.auth.login(loginVal, password);
    setLoading(false);
    if (data.error) return { error: data.error };
    localStorage.setItem('coderp_token', data.token);
    localStorage.setItem('coderp_username', data.username);
    setToken(data.token);
    setUsername(data.username);
    return {};
  }

  async function register(username: string, email: string, password: string) {
    setLoading(true);
    const data = await api.auth.register(username, email, password);
    setLoading(false);
    if (data.error) return { error: data.error };
    localStorage.setItem('coderp_token', data.token);
    localStorage.setItem('coderp_username', data.username);
    setToken(data.token);
    setUsername(data.username);
    return {};
  }

  function logout() {
    api.auth.logout();
    localStorage.removeItem('coderp_token');
    localStorage.removeItem('coderp_username');
    setToken(null);
    setUsername(null);
    setCharacter(null);
    setInventory([]);
  }

  /** Применяет результат XP/level от бэкенда прямо в state — без лишнего round-trip */
  function applyXpResult(result: XpResult) {
    setCharacter(prev => {
      if (!prev) return prev;
      const leveledUp = result.leveled_up;
      return {
        ...prev,
        xp: result.new_xp,
        xp_to_next: result.xp_to_next,
        level: result.new_level,
        coins: result.new_coins,
        // При level up бекенд даёт +5 max_hp и восстанавливает HP
        max_hp: leveledUp ? prev.max_hp + 5 : prev.max_hp,
        hp: leveledUp ? Math.min(prev.hp + 10, prev.max_hp + 5) : prev.hp,
      };
    });
    // После level up подтянем актуального персонажа со статами с сервера
    if (result.leveled_up) {
      setTimeout(() => refreshCharacter(), 500);
    }
  }

  return (
    <GameContext.Provider value={{
      token, username, character, inventory, loading, authLoading,
      login, register, logout, refreshCharacter, refreshInventory, setCharacter: setCharacterSafe,
      applyXpResult,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be inside GameProvider');
  return ctx;
}