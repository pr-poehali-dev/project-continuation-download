"""
Admin API — только для владельца (is_admin=TRUE в users).
Аутентификация: ADMIN_SECRET из env + токен сессии пользователя.
Действия: stats, players, player_detail, items, item_create, item_update, item_delete,
          player_edit, player_ban, player_reset_xp, announcements.
"""
import json
import os
import psycopg2
from datetime import datetime

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p99057007_project_continuation")
ADMIN_SECRET = os.environ.get("ADMIN_SECRET", "")

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def cors():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Authorization, X-Admin-Secret",
    }

def resp(data, status=200):
    return {
        "statusCode": status,
        "headers": {**cors(), "Content-Type": "application/json"},
        "body": json.dumps(data, ensure_ascii=False, default=str),
    }

def err(msg, status=400):
    return resp({"error": msg}, status)

def check_admin(event) -> tuple[bool, str]:
    """Проверяем: секрет совпадает + пользователь is_admin."""
    headers = event.get("headers") or {}
    secret = headers.get("X-Admin-Secret", "")
    token = headers.get("X-Authorization", "").replace("Bearer ", "")

    if not ADMIN_SECRET or secret != ADMIN_SECRET:
        return False, "Неверный секрет администратора"

    if not token:
        return False, "Требуется токен сессии"

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"SELECT u.is_admin FROM {SCHEMA}.sessions s "
        f"JOIN {SCHEMA}.users u ON u.id=s.user_id "
        f"WHERE s.token=%s AND s.expires_at>NOW()",
        (token,)
    )
    row = cur.fetchone()
    conn.close()

    if not row:
        return False, "Сессия не найдена или истекла"
    if not row[0]:
        return False, "Нет прав администратора"
    return True, ""


def handler(event: dict, context) -> dict:
    """Admin API — управление игрой."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors(), "body": ""}

    ok, reason = check_admin(event)
    if not ok:
        return err(reason, 403)

    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    qs = event.get("queryStringParameters") or {}
    action = body.get("action") or qs.get("action") or ""

    # ──────────────────────────────────────────────
    # STATS — общая статистика проекта
    # ──────────────────────────────────────────────
    if action == "stats":
        conn = get_conn()
        cur = conn.cursor()

        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.users")
        total_users = cur.fetchone()[0]

        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.users WHERE created_at > NOW() - INTERVAL '24 hours'")
        new_today = cur.fetchone()[0]

        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.characters")
        total_chars = cur.fetchone()[0]

        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.sessions WHERE expires_at > NOW()")
        active_sessions = cur.fetchone()[0]

        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.battles WHERE created_at > NOW() - INTERVAL '24 hours'")
        battles_today = cur.fetchone()[0]

        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.lesson_progress")
        total_lessons_done = cur.fetchone()[0]

        cur.execute(f"SELECT class, COUNT(*) as cnt FROM {SCHEMA}.characters GROUP BY class ORDER BY cnt DESC")
        class_dist = [{"class": r[0], "count": r[1]} for r in cur.fetchall()]

        cur.execute(
            f"SELECT AVG(level), MAX(level), MIN(level) FROM {SCHEMA}.characters"
        )
        lvl_row = cur.fetchone()
        avg_level = round(float(lvl_row[0] or 0), 1)
        max_level = lvl_row[1] or 0
        min_level = lvl_row[2] or 0

        cur.execute(
            f"SELECT DATE(created_at), COUNT(*) FROM {SCHEMA}.users "
            f"WHERE created_at > NOW() - INTERVAL '7 days' "
            f"GROUP BY DATE(created_at) ORDER BY 1"
        )
        reg_chart = [{"date": str(r[0]), "count": r[1]} for r in cur.fetchall()]

        conn.close()
        return resp({
            "total_users": total_users,
            "new_today": new_today,
            "total_characters": total_chars,
            "active_sessions": active_sessions,
            "battles_today": battles_today,
            "total_lessons_done": total_lessons_done,
            "class_distribution": class_dist,
            "avg_level": avg_level,
            "max_level": max_level,
            "min_level": min_level,
            "registrations_7d": reg_chart,
        })

    # ──────────────────────────────────────────────
    # PLAYERS — список игроков
    # ──────────────────────────────────────────────
    if action == "players":
        limit = int(qs.get("limit", 50))
        offset = int(qs.get("offset", 0))
        search = qs.get("search", "").strip()

        conn = get_conn()
        cur = conn.cursor()

        where = ""
        params = []
        if search:
            where = "WHERE u.username ILIKE %s OR u.email ILIKE %s"
            params = [f"%{search}%", f"%{search}%"]

        cur.execute(
            f"""SELECT u.id, u.username, u.email, u.is_admin, u.created_at,
                       c.name, c.class, c.level, c.xp, c.coins, c.current_chapter
                FROM {SCHEMA}.users u
                LEFT JOIN {SCHEMA}.characters c ON c.user_id=u.id
                {where}
                ORDER BY u.id DESC
                LIMIT %s OFFSET %s""",
            params + [limit, offset]
        )
        rows = cur.fetchall()

        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.users u {where}", params)
        total = cur.fetchone()[0]
        conn.close()

        players = []
        for r in rows:
            players.append({
                "user_id": r[0], "username": r[1], "email": r[2],
                "is_admin": r[3], "created_at": str(r[4]),
                "char_name": r[5], "char_class": r[6], "char_level": r[7],
                "char_xp": r[8], "char_coins": r[9], "char_chapter": r[10],
            })
        return resp({"players": players, "total": total})

    # ──────────────────────────────────────────────
    # PLAYER_EDIT — редактировать персонажа
    # ──────────────────────────────────────────────
    if action == "player_edit":
        user_id = body.get("user_id")
        if not user_id:
            return err("user_id обязателен")

        fields = {}
        allowed = ["level", "xp", "coins", "hp", "max_hp", "current_chapter",
                   "stat_strength", "stat_agility", "stat_intelligence", "stat_defense", "stat_luck"]
        for f in allowed:
            if f in body:
                fields[f] = body[f]

        if not fields:
            return err("Нет полей для обновления")

        set_clause = ", ".join(f"{k}=%s" for k in fields)
        values = list(fields.values()) + [user_id]

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"UPDATE {SCHEMA}.characters SET {set_clause} WHERE user_id=%s RETURNING id",
            values
        )
        row = cur.fetchone()
        conn.commit()
        conn.close()
        if not row:
            return err("Персонаж не найден", 404)
        return resp({"ok": True, "updated": list(fields.keys())})

    # ──────────────────────────────────────────────
    # PLAYER_BAN — удалить сессии (мягкий бан)
    # ──────────────────────────────────────────────
    if action == "player_ban":
        user_id = body.get("user_id")
        if not user_id:
            return err("user_id обязателен")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"UPDATE {SCHEMA}.sessions SET expires_at=NOW() WHERE user_id=%s",
            (user_id,)
        )
        conn.commit()
        conn.close()
        return resp({"ok": True, "message": f"Сессии пользователя {user_id} завершены"})

    # ──────────────────────────────────────────────
    # PLAYER_DETAIL — детальная информация
    # ──────────────────────────────────────────────
    if action == "player_detail":
        user_id = qs.get("user_id") or body.get("user_id")
        if not user_id:
            return err("user_id обязателен")

        conn = get_conn()
        cur = conn.cursor()

        cur.execute(
            f"SELECT id, username, email, is_admin, created_at FROM {SCHEMA}.users WHERE id=%s",
            (user_id,)
        )
        u = cur.fetchone()
        if not u:
            conn.close()
            return err("Пользователь не найден", 404)

        cur.execute(
            f"SELECT name, class, level, xp, xp_to_next, hp, max_hp, coins, current_chapter, "
            f"stat_strength, stat_agility, stat_intelligence, stat_defense, stat_luck "
            f"FROM {SCHEMA}.characters WHERE user_id=%s",
            (user_id,)
        )
        c = cur.fetchone()

        cur.execute(
            f"SELECT COUNT(*) FROM {SCHEMA}.battles WHERE user_id=%s",
            (user_id,)
        )
        battles_count = cur.fetchone()[0]

        cur.execute(
            f"SELECT COUNT(*) FROM {SCHEMA}.lesson_progress WHERE user_id=%s",
            (user_id,)
        )
        lessons_count = cur.fetchone()[0]

        cur.execute(
            f"SELECT COUNT(*) FROM {SCHEMA}.sessions WHERE user_id=%s AND expires_at>NOW()",
            (user_id,)
        )
        active_sessions = cur.fetchone()[0]

        conn.close()
        return resp({
            "user": {
                "id": u[0], "username": u[1], "email": u[2],
                "is_admin": u[3], "created_at": str(u[4]),
            },
            "character": {
                "name": c[0], "class": c[1], "level": c[2], "xp": c[3],
                "xp_to_next": c[4], "hp": c[5], "max_hp": c[6], "coins": c[7],
                "current_chapter": c[8],
                "stats": {
                    "strength": c[9], "agility": c[10], "intelligence": c[11],
                    "defense": c[12], "luck": c[13],
                }
            } if c else None,
            "activity": {
                "battles": battles_count,
                "lessons": lessons_count,
                "active_sessions": active_sessions,
            }
        })

    # ──────────────────────────────────────────────
    # ITEMS — список предметов
    # ──────────────────────────────────────────────
    if action == "items":
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT id, name, description, type, rarity, stat_bonus, price, drop_weight "
            f"FROM {SCHEMA}.items ORDER BY id"
        )
        rows = cur.fetchall()
        conn.close()
        items = []
        for r in rows:
            items.append({
                "id": r[0], "name": r[1], "description": r[2],
                "type": r[3], "rarity": r[4], "stat_bonus": r[5],
                "price": r[6], "drop_weight": r[7],
            })
        return resp({"items": items})

    # ──────────────────────────────────────────────
    # ITEM_CREATE — создать предмет
    # ──────────────────────────────────────────────
    if action == "item_create":
        name = body.get("name", "").strip()
        item_type = body.get("type", "weapon")
        rarity = body.get("rarity", "common")
        description = body.get("description", "")
        price = int(body.get("price", 100))
        drop_weight = int(body.get("drop_weight", 100))
        stat_bonus = body.get("stat_bonus", {})

        if not name:
            return err("Название обязательно")
        if rarity not in ("common", "uncommon", "rare", "epic", "legendary"):
            return err("Неверная редкость")
        if item_type not in ("head", "body", "weapon", "gloves", "boots", "implant"):
            return err("Неверный тип слота")

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.items (name, description, type, rarity, stat_bonus, price, drop_weight) "
            f"VALUES (%s,%s,%s,%s,%s,%s,%s) RETURNING id",
            (name, description, item_type, rarity, json.dumps(stat_bonus), price, drop_weight)
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return resp({"ok": True, "id": new_id})

    # ──────────────────────────────────────────────
    # ITEM_UPDATE — обновить предмет
    # ──────────────────────────────────────────────
    if action == "item_update":
        item_id = body.get("id")
        if not item_id:
            return err("id предмета обязателен")

        allowed = ["name", "description", "type", "rarity", "price", "drop_weight"]
        fields = {}
        for f in allowed:
            if f in body:
                fields[f] = body[f]
        if "stat_bonus" in body:
            fields["stat_bonus"] = json.dumps(body["stat_bonus"])

        if not fields:
            return err("Нет полей для обновления")

        set_clause = ", ".join(f"{k}=%s" for k in fields)
        values = list(fields.values()) + [item_id]

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"UPDATE {SCHEMA}.items SET {set_clause} WHERE id=%s RETURNING id",
            values
        )
        row = cur.fetchone()
        conn.commit()
        conn.close()
        if not row:
            return err("Предмет не найден", 404)
        return resp({"ok": True})

    # ──────────────────────────────────────────────
    # ITEM_DELETE — удалить предмет
    # ──────────────────────────────────────────────
    if action == "item_delete":
        item_id = body.get("id")
        if not item_id:
            return err("id предмета обязателен")
        conn = get_conn()
        cur = conn.cursor()
        # Снимаем с персонажей перед удалением
        for slot in ("head", "body", "weapon", "gloves", "boots", "implant"):
            cur.execute(
                f"UPDATE {SCHEMA}.characters SET equip_{slot}=NULL WHERE equip_{slot}=%s",
                (item_id,)
            )
        cur.execute(f"DELETE FROM {SCHEMA}.items WHERE id=%s RETURNING id", (item_id,))
        row = cur.fetchone()
        conn.commit()
        conn.close()
        if not row:
            return err("Предмет не найден", 404)
        return resp({"ok": True})

    return err("Неизвестный action")
