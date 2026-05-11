"""
Персонаж: создание, получение, экипировка предметов, инвентарь.
"""
import json
import os
import psycopg2
import random

SCHEMA = "t_p99057007_project_continuation"

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Authorization",
    }

def json_response(data, status=200):
    return {
        "statusCode": status,
        "headers": {**cors_headers(), "Content-Type": "application/json"},
        "body": json.dumps(data, ensure_ascii=False, default=str),
    }

def get_user_from_token(cur, token):
    cur.execute(
        f"SELECT s.user_id FROM {SCHEMA}.sessions s "
        f"WHERE s.token=%s AND s.expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    return row[0] if row else None

def get_character_full(cur, char_id):
    """Загружает персонажа с полными данными об экипировке."""
    cur.execute(f"""
        SELECT c.*,
            ih.name as head_name, ih.rarity as head_rarity, ih.stat_bonus as head_bonus, ih.type as head_type,
            ib.name as body_name, ib.rarity as body_rarity, ib.stat_bonus as body_bonus, ib.type as body_type,
            iw.name as weapon_name, iw.rarity as weapon_rarity, iw.stat_bonus as weapon_bonus, iw.type as weapon_type,
            ig.name as gloves_name, ig.rarity as gloves_rarity, ig.stat_bonus as gloves_bonus, ig.type as gloves_type,
            ibt.name as boots_name, ibt.rarity as boots_rarity, ibt.stat_bonus as boots_bonus, ibt.type as boots_type,
            ii.name as implant_name, ii.rarity as implant_rarity, ii.stat_bonus as implant_bonus, ii.type as implant_type
        FROM {SCHEMA}.characters c
        LEFT JOIN {SCHEMA}.items ih ON c.equip_head = ih.id
        LEFT JOIN {SCHEMA}.items ib ON c.equip_body = ib.id
        LEFT JOIN {SCHEMA}.items iw ON c.equip_weapon = iw.id
        LEFT JOIN {SCHEMA}.items ig ON c.equip_gloves = ig.id
        LEFT JOIN {SCHEMA}.items ibt ON c.equip_boots = ibt.id
        LEFT JOIN {SCHEMA}.items ii ON c.equip_implant = ii.id
        WHERE c.id = %s
    """, (char_id,))
    row = cur.fetchone()
    if not row:
        return None
    cols = [d[0] for d in cur.description]
    data = dict(zip(cols, row))

    # Считаем бонусы от экипировки
    total_bonuses = {"strength": 0, "agility": 0, "intelligence": 0, "defense": 0, "luck": 0}
    equipment = {}
    for slot in ["head", "body", "weapon", "gloves", "boots", "implant"]:
        equip_id = data.get(f"equip_{slot}")
        if equip_id:
            bonus = data.get(f"{slot}_bonus") or {}
            if isinstance(bonus, str):
                bonus = json.loads(bonus)
            for stat, val in bonus.items():
                if stat in total_bonuses:
                    total_bonuses[stat] += val
            equipment[slot] = {
                "id": equip_id,
                "name": data.get(f"{slot}_name"),
                "rarity": data.get(f"{slot}_rarity"),
                "stat_bonus": bonus,
                "type": data.get(f"{slot}_type"),
            }
        else:
            equipment[slot] = None

    # Итоговые статы (база + бонусы)
    effective_stats = {
        "strength": data["stat_strength"] + total_bonuses["strength"],
        "agility": data["stat_agility"] + total_bonuses["agility"],
        "intelligence": data["stat_intelligence"] + total_bonuses["intelligence"],
        "defense": data["stat_defense"] + total_bonuses["defense"],
        "luck": data["stat_luck"] + total_bonuses["luck"],
    }

    return {
        "id": data["id"],
        "user_id": data["user_id"],
        "name": data["name"],
        "class": data["class"],
        "level": data["level"],
        "xp": data["xp"],
        "xp_to_next": data["xp_to_next"],
        "hp": data["hp"],
        "max_hp": data["max_hp"],
        "coins": data["coins"],
        "base_stats": {
            "strength": data["stat_strength"],
            "agility": data["stat_agility"],
            "intelligence": data["stat_intelligence"],
            "defense": data["stat_defense"],
            "luck": data["stat_luck"],
        },
        "effective_stats": effective_stats,
        "equipment_bonuses": total_bonuses,
        "equipment": equipment,
        "current_chapter": data["current_chapter"],
        "current_quest": data["current_quest"],
        "created_at": str(data["created_at"]),
    }

def handler(event: dict, context) -> dict:
    """Управление персонажем: создание, получение, экипировка, инвентарь."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    qs = event.get("queryStringParameters") or {}
    action = body.get("action") or qs.get("action") or path.strip("/").split("/")[-1] or "get"
    token = (event.get("headers") or {}).get("X-Authorization", "").replace("Bearer ", "")

    conn = get_conn()
    cur = conn.cursor()

    user_id = get_user_from_token(cur, token) if token else None

    # GET / — получить персонажа текущего пользователя
    if (method == "GET" and (path.endswith("/character") or path.endswith("/"))) or action == "get":
        if not user_id:
            conn.close()
            return json_response({"error": "Не авторизован"}, 401)

        cur.execute(f"SELECT id FROM {SCHEMA}.characters WHERE user_id=%s", (user_id,))
        row = cur.fetchone()
        if not row:
            conn.close()
            return json_response({"error": "Персонаж не создан", "no_character": True}, 404)

        char = get_character_full(cur, row[0])
        conn.close()
        return json_response(char)

    # POST /create — создать персонажа
    if (method == "POST" and path.endswith("/create")) or action == "create":
        if not user_id:
            conn.close()
            return json_response({"error": "Не авторизован"}, 401)

        cur.execute(f"SELECT id FROM {SCHEMA}.characters WHERE user_id=%s", (user_id,))
        if cur.fetchone():
            conn.close()
            return json_response({"error": "Персонаж уже создан"}, 409)

        char_name = body.get("name", "").strip()
        char_class = body.get("class", "hacker")
        if not char_name or len(char_name) < 2:
            conn.close()
            return json_response({"error": "Имя минимум 2 символа"}, 400)

        # Базовые статы по классу
        class_stats = {
            "hacker": {"strength": 8, "agility": 10, "intelligence": 15, "defense": 7, "luck": 10},
            "netrunner": {"strength": 6, "agility": 12, "intelligence": 18, "defense": 6, "luck": 8},
            "street_samurai": {"strength": 16, "agility": 14, "intelligence": 7, "defense": 13, "luck": 5},
        }
        stats = class_stats.get(char_class, class_stats["hacker"])

        cur.execute(f"""
            INSERT INTO {SCHEMA}.characters
            (user_id, name, class, stat_strength, stat_agility, stat_intelligence, stat_defense, stat_luck)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
        """, (user_id, char_name, char_class,
              stats["strength"], stats["agility"], stats["intelligence"],
              stats["defense"], stats["luck"]))
        char_id = cur.fetchone()[0]

        # Стартовый предмет — обруч common
        cur.execute(f"SELECT id FROM {SCHEMA}.items WHERE type='weapon' AND rarity='common' LIMIT 1")
        starter = cur.fetchone()
        if starter:
            cur.execute(
                f"INSERT INTO {SCHEMA}.inventory (character_id, item_id, source) VALUES (%s, %s, 'start')",
                (char_id, starter[0])
            )

        conn.commit()
        char = get_character_full(cur, char_id)
        conn.close()
        return json_response(char)

    # POST /equip — надеть предмет
    if (method == "POST" and path.endswith("/equip")) or action == "equip":
        if not user_id:
            conn.close()
            return json_response({"error": "Не авторизован"}, 401)

        item_id = body.get("item_id")
        cur.execute(f"SELECT id FROM {SCHEMA}.characters WHERE user_id=%s", (user_id,))
        char_row = cur.fetchone()
        if not char_row:
            conn.close()
            return json_response({"error": "Персонаж не найден"}, 404)
        char_id = char_row[0]

        # Проверяем что предмет есть в инвентаре
        cur.execute(
            f"SELECT inv.id, i.type FROM {SCHEMA}.inventory inv JOIN {SCHEMA}.items i ON i.id=inv.item_id "
            f"WHERE inv.character_id=%s AND inv.item_id=%s LIMIT 1",
            (char_id, item_id)
        )
        row = cur.fetchone()
        if not row:
            conn.close()
            return json_response({"error": "Предмет не найден в инвентаре"}, 404)

        item_type = row[1]
        slot_map = {
            "head": "equip_head", "body": "equip_body", "weapon": "equip_weapon",
            "gloves": "equip_gloves", "boots": "equip_boots", "implant": "equip_implant"
        }
        slot = slot_map.get(item_type)
        if not slot:
            conn.close()
            return json_response({"error": "Неизвестный тип предмета"}, 400)

        cur.execute(f"UPDATE {SCHEMA}.characters SET {slot}=%s WHERE id=%s", (item_id, char_id))
        conn.commit()
        char = get_character_full(cur, char_id)
        conn.close()
        return json_response(char)

    # POST /unequip — снять предмет
    if (method == "POST" and path.endswith("/unequip")) or action == "unequip":
        if not user_id:
            conn.close()
            return json_response({"error": "Не авторизован"}, 401)

        slot = body.get("slot")
        slot_map = {"head": "equip_head", "body": "equip_body", "weapon": "equip_weapon",
                    "gloves": "equip_gloves", "boots": "equip_boots", "implant": "equip_implant"}
        if slot not in slot_map:
            conn.close()
            return json_response({"error": "Неверный слот"}, 400)

        cur.execute(f"SELECT id FROM {SCHEMA}.characters WHERE user_id=%s", (user_id,))
        char_row = cur.fetchone()
        if not char_row:
            conn.close()
            return json_response({"error": "Персонаж не найден"}, 404)

        cur.execute(f"UPDATE {SCHEMA}.characters SET {slot_map[slot]}=NULL WHERE id=%s", (char_row[0],))
        conn.commit()
        char = get_character_full(cur, char_row[0])
        conn.close()
        return json_response(char)

    # GET /inventory — инвентарь
    if (method == "GET" and path.endswith("/inventory")) or action == "inventory":
        if not user_id:
            conn.close()
            return json_response({"error": "Не авторизован"}, 401)

        cur.execute(f"SELECT id FROM {SCHEMA}.characters WHERE user_id=%s", (user_id,))
        char_row = cur.fetchone()
        if not char_row:
            conn.close()
            return json_response({"items": []})

        cur.execute(f"""
            SELECT inv.id, inv.item_id, inv.source, inv.obtained_at,
                   i.name, i.type, i.rarity, i.stat_bonus, i.description, i.price
            FROM {SCHEMA}.inventory inv
            JOIN {SCHEMA}.items i ON i.id = inv.item_id
            WHERE inv.character_id = %s
            ORDER BY inv.obtained_at DESC
        """, (char_row[0],))

        items = []
        for row in cur.fetchall():
            bonus = row[7]
            if isinstance(bonus, str):
                bonus = json.loads(bonus)
            items.append({
                "inv_id": row[0], "item_id": row[1], "source": row[2],
                "obtained_at": str(row[3]), "name": row[4], "type": row[5],
                "rarity": row[6], "stat_bonus": bonus, "description": row[8], "price": row[9],
            })
        conn.close()
        return json_response({"items": items})

    conn.close()
    return json_response({"error": "Not found"}, 404)