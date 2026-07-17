const URLS = {
  auth: "https://functions.poehali.dev/9e1a9124-1398-4fa0-aabf-cfbb0f8037da",
  character: "https://functions.poehali.dev/3d3307ba-1872-414f-bdd7-6387a5fed809",
  shop: "https://functions.poehali.dev/724b5290-0610-4194-9c66-13f6da573293",
  battle: "https://functions.poehali.dev/8f7f4fdc-a2cd-4efb-b8df-8a57fbac93d9",
  quest: "https://functions.poehali.dev/8ef4d3f5-e84b-4fef-ba75-733790fbc571",
  admin: "https://functions.poehali.dev/756e5ef1-2f8c-4a68-b35c-325df6426ea3",
};

function getToken(): string {
  return localStorage.getItem("coderp_token") || "";
}

async function call(url: string, body: Record<string, unknown>) {
  const token = getToken();
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "X-Authorization": `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    return res.json();
  } catch (e) {
    console.error("Fetch error:", e, "for", url);
    return { error: "network_error" };
  }
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
    create: (name: string, charClass: string, gender: "male" | "female" = "male") =>
      call(URLS.character, { action: "create", name, class: charClass, gender }),
    setGender: (gender: "male" | "female") =>
      call(URLS.character, { action: "set_gender", gender }),
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
    advance: (next_step: number, questAction?: string) =>
      call(URLS.quest, { action: "advance", next_step, ...(questAction ? { action_name: questAction } : {}) }),
  },

  // Прогресс уроков: сохранить завершение + получить XP
  lesson: {
    complete: (lesson_id: number, xp: number, coins: number) =>
      call(URLS.quest, { action: "lesson_complete", lesson_id, xp, coins }),
    // Получить список пройденных уроков (опционально)
    list: () => call(URLS.quest, { action: "lesson_list" }),
  },

  // Прогресс данжей: сохранить результат + получить XP
  dungeon: {
    complete: (dungeon_id: string, score_pct: number, xp: number, coins: number) =>
      call(URLS.quest, { action: "dungeon_complete", dungeon_id, score_pct, xp, coins }),
  },

  // Награды NPC и квестов
  npcReward: (npc_id: string, xp: number, coins: number) =>
    call(URLS.quest, { action: "npc_reward", npc_id, xp, coins }),

  questClaim: (xp: number, coins: number) =>
    call(URLS.quest, { action: "quest_claim", xp, coins }),

  /** Универсальная награда XP+Creds — для режимов без своего обработчика
   *  (карточки, конструктор, сториз, мастерская, крафт). */
  gainXp: (reason: string, xp: number, coins: number = 0) =>
    call(URLS.quest, { action: "gain_xp", reason, xp, coins }),

  leaderboard: () => call(URLS.quest, { action: "leaderboard" }),

  progressSync: () => call(URLS.quest, { action: "progress_sync" }),

  /** Сохранить набор универсальных ключей прогресса в БД (player_progress). */
  progressSave: (entries: Record<string, unknown>) =>
    call(URLS.quest, { action: "progress_save", entries }),

  // Фракции
  factionState: () => call(URLS.quest, { action: "faction_state" }),
  factionGain: (faction_id: string, amount: number) =>
    call(URLS.quest, { action: "faction_gain", faction_id, amount }),
};

// ─── Admin API (отдельная функция с двойной аутентификацией) ─────────────────
function adminCall(secret: string, body: Record<string, unknown>) {
  const token = getToken();
  return fetch(URLS.admin, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Secret": secret,
      ...(token ? { "X-Authorization": `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  }).then(r => r.json()).catch(() => ({ error: "network_error" }));
}

function adminGet(secret: string, action: string, params: Record<string, string> = {}) {
  const token = getToken();
  const qs = new URLSearchParams({ action, ...params }).toString();
  return fetch(`${URLS.admin}?${qs}`, {
    headers: {
      "X-Admin-Secret": secret,
      ...(token ? { "X-Authorization": `Bearer ${token}` } : {}),
    },
  }).then(r => r.json()).catch(() => ({ error: "network_error" }));
}

export const adminApi = {
  stats:        (secret: string) => adminGet(secret, "stats"),
  players:      (secret: string, params?: { search?: string; limit?: number; offset?: number }) =>
    adminGet(secret, "players", {
      ...(params?.search  ? { search: params.search }          : {}),
      ...(params?.limit   ? { limit: String(params.limit) }    : {}),
      ...(params?.offset  ? { offset: String(params.offset) }  : {}),
    }),
  playerDetail: (secret: string, user_id: number) => adminGet(secret, "player_detail", { user_id: String(user_id) }),
  playerEdit:   (secret: string, user_id: number, fields: Record<string, unknown>) =>
    adminCall(secret, { action: "player_edit", user_id, ...fields }),
  playerBan:    (secret: string, user_id: number) => adminCall(secret, { action: "player_ban", user_id }),
  items:        (secret: string) => adminGet(secret, "items"),
  itemCreate:   (secret: string, data: Record<string, unknown>) => adminCall(secret, { action: "item_create", ...data }),
  itemUpdate:   (secret: string, data: Record<string, unknown>) => adminCall(secret, { action: "item_update", ...data }),
  itemDelete:   (secret: string, id: number) => adminCall(secret, { action: "item_delete", id }),
};