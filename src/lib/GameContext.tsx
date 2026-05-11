import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from './api';

export interface Equipment {
  id: number;
  name: string;
  rarity: string;
  stat_bonus: Record<string, number>;
  type: string;
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
  rarity: string;
  stat_bonus: Record<string, number>;
  description: string;
  price: number;
  source: string;
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
  setCharacter: (c: Character) => void;
}

const GameContext = createContext<GameState | null>(null);

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
    } else {
      setAuthLoading(false);
    }
  }, [token]);

  async function refreshCharacter() {
    if (!token) return;
    const data = await api.character.get();
    if (!data.error) {
      setCharacter(data);
    } else if (data.no_character) {
      setCharacter(null);
    }
  }

  async function refreshInventory() {
    if (!token) return;
    const data = await api.character.inventory();
    if (!data.error) {
      setInventory(data.items || []);
    }
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

  return (
    <GameContext.Provider value={{
      token, username, character, inventory, loading, authLoading,
      login, register, logout, refreshCharacter, refreshInventory, setCharacter,
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
