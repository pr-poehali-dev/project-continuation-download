"""
Боевая система: расчёт урона по статам персонажа, сохранение результата, дроп предметов.
"""
import json
import os
import psycopg2
import random
import math

SCHEMA = "t_p99057007_project_continuation"

ENEMIES = {
    # ─── Глава 1: Пробуждение ─────────────────────────────────
    "syntax_ghost":    {"name": "SyntaxGhost",     "level": 2,  "max_hp": 100,   "xp": 80,    "coins": 40,    "base_damage": 8,  "defense": 3,  "drop_rarity": ["common"]},
    "name_error":      {"name": "NameError-α",     "level": 4,  "max_hp": 160,   "xp": 140,   "coins": 70,    "base_damage": 12, "defense": 5,  "drop_rarity": ["common"]},
    "type_error":      {"name": "TypeError-β",     "level": 6,  "max_hp": 220,   "xp": 220,   "coins": 110,   "base_damage": 16, "defense": 7,  "drop_rarity": ["common", "uncommon"]},
    "indent_demon":    {"name": "IndentDemon",     "level": 8,  "max_hp": 320,   "xp": 380,   "coins": 190,   "base_damage": 22, "defense": 10, "drop_rarity": ["uncommon"]},

    # ─── Глава 2: Сеть данных ────────────────────────────────
    "list_wraith":     {"name": "ListWraith",      "level": 10, "max_hp": 420,   "xp": 500,   "coins": 250,   "base_damage": 28, "defense": 12, "drop_rarity": ["uncommon"]},
    "dict_phantom":    {"name": "DictPhantom",     "level": 12, "max_hp": 530,   "xp": 650,   "coins": 320,   "base_damage": 32, "defense": 14, "drop_rarity": ["uncommon", "rare"]},
    "loop_serpent":    {"name": "LoopSerpent",     "level": 14, "max_hp": 680,   "xp": 850,   "coins": 425,   "base_damage": 36, "defense": 16, "drop_rarity": ["rare"]},
    "data_overseer":   {"name": "DataOverseer",    "level": 17, "max_hp": 1100,  "xp": 1500,  "coins": 750,   "base_damage": 44, "defense": 20, "drop_rarity": ["rare", "epic"]},

    # ─── Глава 3: Функции силы ───────────────────────────────
    "func_phantom":    {"name": "FuncPhantom",     "level": 19, "max_hp": 1000,  "xp": 1200,  "coins": 600,   "base_damage": 48, "defense": 22, "drop_rarity": ["rare"]},
    "class_titan":     {"name": "ClassTitan",      "level": 22, "max_hp": 1400,  "xp": 1700,  "coins": 850,   "base_damage": 56, "defense": 26, "drop_rarity": ["rare", "epic"]},
    "oop_demon":       {"name": "OopDemon",        "level": 24, "max_hp": 1700,  "xp": 2000,  "coins": 1000,  "base_damage": 62, "defense": 28, "drop_rarity": ["epic"]},
    "order_judge":     {"name": "OrderJudge",      "level": 26, "max_hp": 2300,  "xp": 2200,  "coins": 1100,  "base_damage": 70, "defense": 32, "drop_rarity": ["epic"]},

    # ─── Глава 4: Глубже в код ───────────────────────────────
    "except_wraith":   {"name": "ExceptWraith",    "level": 27, "max_hp": 1900,  "xp": 2500,  "coins": 1250,  "base_damage": 72, "defense": 34, "drop_rarity": ["epic"]},
    "module_titan":    {"name": "ModuleTitan",     "level": 29, "max_hp": 2200,  "xp": 3000,  "coins": 1500,  "base_damage": 78, "defense": 36, "drop_rarity": ["epic"]},
    "recursion_lord":  {"name": "RecursionLord",   "level": 31, "max_hp": 2600,  "xp": 3500,  "coins": 1750,  "base_damage": 84, "defense": 38, "drop_rarity": ["epic"]},
    "nexus_architect": {"name": "NEXUS-Architect", "level": 35, "max_hp": 3500,  "xp": 5000,  "coins": 2500,  "base_damage": 95, "defense": 42, "drop_rarity": ["epic", "legendary"]},

    # ─── Глава 5: Восхождение ────────────────────────────────
    "async_specter":     {"name": "AsyncSpecter",      "level": 38, "max_hp": 4500,  "xp": 6000,  "coins": 3000,  "base_damage": 105, "defense": 46, "drop_rarity": ["legendary"]},
    "decorator_overlord":{"name": "DecoratorOverlord", "level": 41, "max_hp": 5500,  "xp": 7500,  "coins": 3750,  "base_damage": 118, "defense": 50, "drop_rarity": ["legendary"]},
    "metaclass_ancient": {"name": "MetaclassAncient",  "level": 45, "max_hp": 7000,  "xp": 10000, "coins": 5000,  "base_damage": 132, "defense": 56, "drop_rarity": ["legendary"]},
    "pyth_0n":           {"name": "PYTH-0N",           "level": 50, "max_hp": 12000, "xp": 25000, "coins": 10000, "base_damage": 160, "defense": 64, "drop_rarity": ["legendary"]},

    # ─── Обратная совместимость со старыми id ────────────────
    "corp_drone":     {"name": "Корп-Дрон",        "level": 3,  "max_hp": 120,  "xp": 80,   "coins": 20,  "base_damage": 12, "defense": 5,  "drop_rarity": ["common"]},
    "neuro_guard":    {"name": "Нейро-Страж",      "level": 7,  "max_hp": 280,  "xp": 200,  "coins": 50,  "base_damage": 22, "defense": 10, "drop_rarity": ["common", "uncommon"]},
    "ai_corporant":   {"name": "ИИ-Корпорант",     "level": 15, "max_hp": 650,  "xp": 450,  "coins": 120, "base_damage": 40, "defense": 18, "drop_rarity": ["uncommon", "rare"]},
    "zero_corp_boss": {"name": "Босс: Директор",   "level": 25, "max_hp": 1500, "xp": 1200, "coins": 400, "base_damage": 70, "defense": 30, "drop_rarity": ["rare", "epic"]},
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Authorization",
    }

def json_response(data, status=200):
    return {
        "statusCode": status,
        "headers": {**cors_headers(), "Content-Type": "application/json"},
        "body": json.dumps(data, ensure_ascii=False, default=str),
    }

def get_char(cur, token):
    cur.execute(f"""
        SELECT c.id, c.level, c.hp, c.max_hp, c.coins,
               c.stat_strength, c.stat_agility, c.stat_intelligence, c.stat_defense, c.stat_luck,
               c.xp, c.xp_to_next,
               COALESCE((SELECT SUM((i.stat_bonus->>'strength')::int) FROM {SCHEMA}.items i
                WHERE i.id IN (c.equip_head, c.equip_body, c.equip_weapon, c.equip_gloves, c.equip_boots, c.equip_implant)), 0) as bonus_str,
               COALESCE((SELECT SUM((i.stat_bonus->>'defense')::int) FROM {SCHEMA}.items i
                WHERE i.id IN (c.equip_head, c.equip_body, c.equip_weapon, c.equip_gloves, c.equip_boots, c.equip_implant)), 0) as bonus_def,
               COALESCE((SELECT SUM((i.stat_bonus->>'intelligence')::int) FROM {SCHEMA}.items i
                WHERE i.id IN (c.equip_head, c.equip_body, c.equip_weapon, c.equip_gloves, c.equip_boots, c.equip_implant)), 0) as bonus_int,
               COALESCE((SELECT SUM((i.stat_bonus->>'luck')::int) FROM {SCHEMA}.items i
                WHERE i.id IN (c.equip_head, c.equip_body, c.equip_weapon, c.equip_gloves, c.equip_boots, c.equip_implant)), 0) as bonus_luck
        FROM {SCHEMA}.characters c
        JOIN {SCHEMA}.sessions s ON s.user_id = c.user_id
        WHERE s.token=%s AND s.expires_at > NOW()
    """, (token,))
    return cur.fetchone()

def calc_player_damage(char_row, code_correct: bool) -> int:
    """Урон = (сила + интеллект/2 + бонус) * коэффициент кода."""
    strength = char_row[5] + char_row[12]  # base + bonus
    intelligence = char_row[7] + char_row[14]
    base = strength + intelligence // 2
    multiplier = random.uniform(0.85, 1.15)
    code_bonus = 1.5 if code_correct else 0.3
    return max(1, int(base * multiplier * code_bonus))

def calc_enemy_damage(enemy: dict, char_row) -> int:
    """Урон врага уменьшается защитой персонажа."""
    defense = char_row[8] + char_row[13]  # base + bonus
    raw = enemy["base_damage"] * random.uniform(0.8, 1.2)
    reduced = raw * (1 - min(defense / (defense + 50), 0.8))
    return max(1, int(reduced))

def check_drop(cur, char_row, enemy: dict) -> dict | None:
    """Проверка и выдача дропа по удаче."""
    luck = char_row[9] + char_row[15]
    drop_chance = min(0.1 + luck * 0.01, 0.6)
    if random.random() > drop_chance:
        return None

    rarities = enemy["drop_rarity"]
    chosen = random.choice(rarities)
    cur.execute(
        f"SELECT id, name, type, rarity, stat_bonus FROM {SCHEMA}.items WHERE rarity=%s ORDER BY RANDOM() LIMIT 1",
        (chosen,)
    )
    item = cur.fetchone()
    if not item:
        return None
    return {"id": item[0], "name": item[1], "type": item[2], "rarity": item[3]}

def handler(event: dict, context) -> dict:
    """Боевая механика: атака, результат боя с учётом статов персонажа."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    qs = event.get("queryStringParameters") or {}
    action = body.get("action") or qs.get("action") or path.strip("/").split("/")[-1] or "enemies"
    token = (event.get("headers") or {}).get("X-Authorization", "").replace("Bearer ", "")

    # enemies — список врагов
    if action == "enemies" or (method == "GET" and path.endswith("/enemies")):
        result = []
        for key, e in ENEMIES.items():
            result.append({
                "id": key, "name": e["name"], "level": e["level"],
                "max_hp": e["max_hp"], "xp": e["xp"], "coins": e["coins"],
                "defense": e["defense"],
            })
        return json_response({"enemies": result})

    conn = get_conn()
    cur = conn.cursor()

    # attack — атака врага
    if action == "attack" or (method == "POST" and path.endswith("/attack")):
        if not token:
            conn.close()
            return json_response({"error": "Не авторизован"}, 401)

        enemy_id = body.get("enemy_id", "corp_drone")
        code_correct = body.get("code_correct", False)
        current_enemy_hp = body.get("enemy_hp", None)

        enemy = ENEMIES.get(enemy_id)
        if not enemy:
            conn.close()
            return json_response({"error": "Враг не найден"}, 404)

        char_row = get_char(cur, token)
        if not char_row:
            conn.close()
            return json_response({"error": "Персонаж не найден"}, 404)

        char_id = char_row[0]
        enemy_max_hp = enemy["max_hp"]
        if current_enemy_hp is None:
            current_enemy_hp = enemy_max_hp

        player_damage = calc_player_damage(char_row, code_correct)
        enemy_damage = calc_enemy_damage(enemy, char_row) if not code_correct else calc_enemy_damage(enemy, char_row) // 3

        new_enemy_hp = max(0, current_enemy_hp - player_damage)
        new_player_hp = max(0, char_row[2] - (0 if code_correct else enemy_damage))

        battle_over = new_enemy_hp <= 0
        player_dead = new_player_hp <= 0
        dropped_item = None
        xp_gained = 0
        coins_gained = 0
        leveled_up = False

        if battle_over:
            xp_gained = enemy["xp"]
            coins_gained = enemy["coins"]
            dropped_item = check_drop(cur, char_row, enemy)

            new_xp = char_row[10] + xp_gained
            new_coins = char_row[4] + coins_gained
            xp_to_next = char_row[11]
            new_level = char_row[1]

            while new_xp >= xp_to_next:
                new_xp -= xp_to_next
                new_level += 1
                xp_to_next = int(xp_to_next * 1.4)
                leveled_up = True
                # При повышении уровня +5 HP и +1 к случайному стату
                cur.execute(f"""
                    UPDATE {SCHEMA}.characters
                    SET max_hp=max_hp+5, hp=LEAST(hp+10, max_hp+5),
                        stat_strength=stat_strength + CASE WHEN RANDOM()<0.2 THEN 1 ELSE 0 END,
                        stat_agility=stat_agility + CASE WHEN RANDOM()<0.2 THEN 1 ELSE 0 END,
                        stat_intelligence=stat_intelligence + CASE WHEN RANDOM()<0.2 THEN 1 ELSE 0 END,
                        stat_defense=stat_defense + CASE WHEN RANDOM()<0.2 THEN 1 ELSE 0 END,
                        stat_luck=stat_luck + CASE WHEN RANDOM()<0.2 THEN 1 ELSE 0 END
                    WHERE id=%s
                """, (char_id,))

            cur.execute(f"""
                UPDATE {SCHEMA}.characters
                SET xp=%s, xp_to_next=%s, level=%s, coins=%s
                WHERE id=%s
            """, (new_xp, xp_to_next, new_level, new_coins, char_id))

            if dropped_item:
                cur.execute(
                    f"INSERT INTO {SCHEMA}.inventory (character_id, item_id, source) VALUES (%s, %s, 'battle')",
                    (char_id, dropped_item["id"])
                )

            cur.execute(
                f"INSERT INTO {SCHEMA}.battles (character_id, enemy_id, result, xp_earned, coins_earned, item_dropped) "
                f"VALUES (%s, %s, 'win', %s, %s, %s)",
                (char_id, enemy_id, xp_gained, coins_gained, dropped_item["id"] if dropped_item else None)
            )

        elif player_dead:
            cur.execute(
                f"INSERT INTO {SCHEMA}.battles (character_id, enemy_id, result) VALUES (%s, %s, 'lose')",
                (char_id, enemy_id)
            )
            cur.execute(f"UPDATE {SCHEMA}.characters SET hp=20 WHERE id=%s", (char_id,))
        else:
            cur.execute(f"UPDATE {SCHEMA}.characters SET hp=%s WHERE id=%s", (new_player_hp, char_id))

        conn.commit()
        conn.close()

        return json_response({
            "player_damage": player_damage,
            "enemy_damage": enemy_damage if not code_correct else 0,
            "new_enemy_hp": new_enemy_hp,
            "new_player_hp": new_player_hp if not player_dead else 20,
            "battle_over": battle_over,
            "player_dead": player_dead,
            "xp_gained": xp_gained,
            "coins_gained": coins_gained,
            "dropped_item": dropped_item,
            "leveled_up": leveled_up,
            "code_correct": code_correct,
        })

    conn.close()
    return json_response({"error": "Not found"}, 404)