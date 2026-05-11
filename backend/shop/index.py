"""
Магазин и лутбоксы: покупка предметов, открытие лутбоксов.
"""
import json
import os
import psycopg2
import random

SCHEMA = "t_p99057007_project_continuation"

LOOTBOX_PRICES = {
    "basic": 100,
    "advanced": 300,
    "legendary": 800,
}

LOOTBOX_RARITY_WEIGHTS = {
    "basic":    {"common": 70, "uncommon": 25, "rare": 5, "epic": 0, "legendary": 0},
    "advanced": {"common": 30, "uncommon": 40, "rare": 20, "epic": 9, "legendary": 1},
    "legendary":{"common": 0,  "uncommon": 15, "rare": 40, "epic": 35, "legendary": 10},
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

def get_char_id(cur, token):
    cur.execute(
        f"SELECT c.id, c.coins FROM {SCHEMA}.characters c "
        f"JOIN {SCHEMA}.sessions s ON s.user_id = c.user_id "
        f"WHERE s.token=%s AND s.expires_at > NOW()",
        (token,)
    )
    return cur.fetchone()

def handler(event: dict, context) -> dict:
    """Магазин предметов и лутбоксы."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    qs = event.get("queryStringParameters") or {}
    action = body.get("action") or qs.get("action") or path.strip("/").split("/")[-1] or "items"
    token = (event.get("headers") or {}).get("X-Authorization", "").replace("Bearer ", "")

    conn = get_conn()
    cur = conn.cursor()

    # items — список предметов в магазине
    if action == "items" or (method == "GET" and path.endswith("/items")):
        cur.execute(f"""
            SELECT id, name, description, type, rarity, stat_bonus, price
            FROM {SCHEMA}.items WHERE price > 0
            ORDER BY price ASC
        """)
        items = []
        for row in cur.fetchall():
            bonus = row[5]
            if isinstance(bonus, str):
                bonus = json.loads(bonus)
            items.append({
                "id": row[0], "name": row[1], "description": row[2],
                "type": row[3], "rarity": row[4], "stat_bonus": bonus, "price": row[6],
            })
        conn.close()
        return json_response({"items": items})

    # buy — купить предмет
    if action == "buy" or (method == "POST" and path.endswith("/buy")):
        if not token:
            conn.close()
            return json_response({"error": "Не авторизован"}, 401)

        item_id = body.get("item_id")
        char_row = get_char_id(cur, token)
        if not char_row:
            conn.close()
            return json_response({"error": "Персонаж не найден"}, 404)
        char_id, coins = char_row

        cur.execute(f"SELECT id, name, price FROM {SCHEMA}.items WHERE id=%s", (item_id,))
        item = cur.fetchone()
        if not item:
            conn.close()
            return json_response({"error": "Предмет не найден"}, 404)

        if coins < item[2]:
            conn.close()
            return json_response({"error": f"Недостаточно монет. Нужно {item[2]}, у тебя {coins}"}, 400)

        cur.execute(f"UPDATE {SCHEMA}.characters SET coins=coins-%s WHERE id=%s", (item[2], char_id))
        cur.execute(
            f"INSERT INTO {SCHEMA}.inventory (character_id, item_id, source) VALUES (%s, %s, 'shop')",
            (char_id, item_id)
        )
        conn.commit()

        cur.execute(f"SELECT coins FROM {SCHEMA}.characters WHERE id=%s", (char_id,))
        new_coins = cur.fetchone()[0]
        conn.close()
        return json_response({"ok": True, "item_name": item[1], "coins_left": new_coins})

    # lootbox — открыть лутбокс
    if action == "lootbox" or (method == "POST" and path.endswith("/lootbox")):
        if not token:
            conn.close()
            return json_response({"error": "Не авторизован"}, 401)

        box_type = body.get("type", "basic")
        if box_type not in LOOTBOX_PRICES:
            conn.close()
            return json_response({"error": "Неверный тип лутбокса"}, 400)

        price = LOOTBOX_PRICES[box_type]
        char_row = get_char_id(cur, token)
        if not char_row:
            conn.close()
            return json_response({"error": "Персонаж не найден"}, 404)
        char_id, coins = char_row

        if coins < price:
            conn.close()
            return json_response({"error": f"Недостаточно монет. Нужно {price}, у тебя {coins}"}, 400)

        # Выбираем редкость по весам
        weights = LOOTBOX_RARITY_WEIGHTS[box_type]
        rarities = [r for r, w in weights.items() if w > 0]
        rarity_weights = [weights[r] for r in rarities]
        chosen_rarity = random.choices(rarities, weights=rarity_weights, k=1)[0]

        # Берём случайный предмет нужной редкости
        cur.execute(
            f"SELECT id, name, type, rarity, stat_bonus, description FROM {SCHEMA}.items "
            f"WHERE rarity=%s ORDER BY RANDOM() LIMIT 1",
            (chosen_rarity,)
        )
        item = cur.fetchone()
        if not item:
            conn.close()
            return json_response({"error": "Нет предметов"}, 500)

        cur.execute(f"UPDATE {SCHEMA}.characters SET coins=coins-%s WHERE id=%s", (price, char_id))
        cur.execute(
            f"INSERT INTO {SCHEMA}.inventory (character_id, item_id, source) VALUES (%s, %s, 'lootbox')",
            (char_id, item[0])
        )
        conn.commit()

        cur.execute(f"SELECT coins FROM {SCHEMA}.characters WHERE id=%s", (char_id,))
        new_coins = cur.fetchone()[0]

        bonus = item[4]
        if isinstance(bonus, str):
            bonus = json.loads(bonus)

        conn.close()
        return json_response({
            "ok": True,
            "box_type": box_type,
            "item": {
                "id": item[0], "name": item[1], "type": item[2],
                "rarity": item[3], "stat_bonus": bonus, "description": item[5],
            },
            "coins_left": new_coins,
        })

    conn.close()
    return json_response({"error": "Not found"}, 404)