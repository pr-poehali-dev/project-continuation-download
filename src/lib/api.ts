const URLS = {
  auth: "https://functions.poehali.dev/10a16760-9840-4c2a-9b07-65ac9a7c5113",
  character: "https://functions.poehali.dev/91df215e-5498-4720-8707-c53506997589",
  shop: "https://functions.poehali.dev/369b1247-fa90-4446-9c74-2b3373bf9c62",
  battle: "https://functions.poehali.dev/87c8743c-6ec8-4e87-9447-b63d585ef0a2",
  quest: "https://functions.poehali.dev/74ef1783-327c-4071-9393-e56320709565",
};

function getToken(): string {
  return localStorage.getItem("coderp_token") || "";
}

async function call(url: string, body: Record<string, unknown>) {
  const token = getToken();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "X-Authorization": `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

// AUTH
export const api = {
  auth: {
    register: (username: string, email: string, password: string) =>
      call(URLS.auth, { action: "register", username, email, password }),
    login: (login: string, password: string) =>
      call(URLS.auth, { action: "login", login, password }),
    me: () => call(URLS.auth, { action: "me" }),
    logout: () => call(URLS.auth, { action: "logout" }),
  },

  character: {
    get: () => call(URLS.character, { action: "get" }),
    create: (name: string, charClass: string) =>
      call(URLS.character, { action: "create", name, class: charClass }),
    equip: (item_id: number) =>
      call(URLS.character, { action: "equip", item_id }),
    unequip: (slot: string) =>
      call(URLS.character, { action: "unequip", slot }),
    inventory: () => call(URLS.character, { action: "inventory" }),
  },

  shop: {
    items: () => call(URLS.shop, { action: "items" }),
    buy: (item_id: number) => call(URLS.shop, { action: "buy", item_id }),
    lootbox: (type: "basic" | "advanced" | "legendary") =>
      call(URLS.shop, { action: "lootbox", type }),
  },

  battle: {
    enemies: () => call(URLS.battle, { action: "enemies" }),
    attack: (enemy_id: string, code_correct: boolean, enemy_hp: number) =>
      call(URLS.battle, { action: "attack", enemy_id, code_correct, enemy_hp }),
  },

  quest: {
    current: () => call(URLS.quest, { action: "current" }),
    advance: (next_step: number, action?: string) =>
      call(URLS.quest, { action: "advance", next_step, ...(action ? { action_name: action } : {}) }),
  },
};
