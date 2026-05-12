"""
Квесты и диалоги NPC: получение диалогов по главам, прогресс квестов.
"""
import json
import os
import psycopg2

SCHEMA = "t_p99057007_project_continuation"

# Сюжетная линия — диалоги NPC по главам
STORY = {
    "intro": {
        "chapter": 1,
        "npc": "GHOST",
        "npc_role": "Таинственный хакер",
        "npc_emoji": "👤",
        "dialogs": [
            {
                "step": 0,
                "text": "Очнулся? Хорошо. Меня зовут Ghost. Я вытащил тебя из Сети когда корпоративный ИИ пытался стереть твою личность.",
                "choices": [{"text": "Кто ты такой?", "next": 1}, {"text": "Где я нахожусь?", "next": 1}],
            },
            {
                "step": 1,
                "text": "Сейчас это неважно. Важно то, что Корпорация Ноль охотится за людьми, которые знают Python. Они боятся тех, кто может взломать их системы.",
                "choices": [{"text": "Я не знаю Python...", "next": 2}],
            },
            {
                "step": 2,
                "text": "Именно поэтому ты здесь. Я научу тебя. Каждая строчка кода, которую ты напишешь — это удар по Корпорации. Готов начать?",
                "choices": [{"text": "Готов. Покажи мне всё.", "next": 3, "action": "complete_quest"}],
            },
            {
                "step": 3,
                "text": "Отлично. Первый урок — переменные. Код — это язык силы. Освой его, и ни одна стена Корпорации не устоит.",
                "choices": [{"text": "Начать обучение", "next": None, "action": "go_lessons"}],
            },
        ],
        "reward": {"xp": 50, "coins": 30},
    },
    "after_lesson_1": {
        "chapter": 1,
        "npc": "GHOST",
        "npc_role": "Таинственный хакер",
        "npc_emoji": "👤",
        "dialogs": [
            {
                "step": 0,
                "text": "Переменные освоены. Ты быстро учишься. Корпорация засекла активность в этом секторе — скоро пришлют дронов.",
                "choices": [{"text": "Я готов к бою", "next": 1}],
            },
            {
                "step": 1,
                "text": "Помни: в бою твой код — это оружие. Правильно написанный код наносит урон врагу. Ошибки будут стоить тебе здоровья.",
                "choices": [{"text": "Понял. Иду сражаться.", "next": None, "action": "go_battle"}],
            },
        ],
        "reward": {"xp": 100, "coins": 50},
    },
    "chapter_2_intro": {
        "chapter": 2,
        "npc": "VERA",
        "npc_role": "Инженер Сопротивления",
        "npc_emoji": "👩‍💻",
        "dialogs": [
            {
                "step": 0,
                "text": "Ghost говорил о тебе. Я Вера, главный инженер Сопротивления. Нам нужна твоя помощь — взломать базу данных Корпорации Ноль.",
                "choices": [{"text": "Расскажи подробнее", "next": 1}, {"text": "Опасно?", "next": 1}],
            },
            {
                "step": 1,
                "text": "База защищена алгоритмами. Чтобы пробраться внутрь — нужно освоить циклы и функции. Без них ты далеко не уйдёшь.",
                "choices": [{"text": "Я изучу всё что нужно", "next": 2}],
            },
            {
                "step": 2,
                "text": "Хорошо. Но сначала — тест. Докажи что ты не агент Корпорации. Реши задачу и я дам тебе доступ к архивам Сопротивления.",
                "choices": [{"text": "Принять испытание", "next": None, "action": "complete_quest"}],
            },
        ],
        "reward": {"xp": 200, "coins": 100},
    },
    "boss_unlocked": {
        "chapter": 2,
        "npc": "GHOST",
        "npc_role": "Таинственный хакер",
        "npc_emoji": "👤",
        "dialogs": [
            {
                "step": 0,
                "text": "Директор Ноль — главный ИИ Корпорации. Он создал систему слежки за каждым жителем мегаполиса. Его нужно остановить.",
                "choices": [{"text": "Как его победить?", "next": 1}],
            },
            {
                "step": 1,
                "text": "У него три фазы защиты. Каждая требует знания Python на новом уровне. Если сдашься на полпути — система сотрёт тебя из Сети навсегда.",
                "choices": [{"text": "Я не сдамся", "next": None, "action": "go_battle"}],
            },
        ],
        "reward": {"xp": 0, "coins": 0},
    },
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
    cur.execute(
        f"SELECT c.id, c.current_quest, c.current_chapter, c.level, c.xp, c.coins "
        f"FROM {SCHEMA}.characters c "
        f"JOIN {SCHEMA}.sessions s ON s.user_id = c.user_id "
        f"WHERE s.token=%s AND s.expires_at > NOW()",
        (token,)
    )
    return cur.fetchone()

def award_xp(cur, char_id: int, xp_gain: int, coins_gain: int) -> dict:
    """Добавить XP и монеты персонажу, обработать level up. Возвращает результат."""
    cur.execute(
        f"SELECT level, xp, xp_to_next, coins, max_hp FROM {SCHEMA}.characters WHERE id=%s",
        (char_id,)
    )
    row = cur.fetchone()
    if not row:
        return {}
    level, xp, xp_to_next, coins, max_hp = row

    new_xp = xp + xp_gain
    new_coins = coins + coins_gain
    new_level = level
    leveled_up = False

    while new_xp >= xp_to_next:
        new_xp -= xp_to_next
        new_level += 1
        xp_to_next = int(xp_to_next * 1.4)
        leveled_up = True
        # При каждом level up: +5 max_hp, +1 к случайному стату
        cur.execute(f"""
            UPDATE {SCHEMA}.characters
            SET max_hp = max_hp + 5,
                hp = LEAST(hp + 10, max_hp + 5),
                stat_strength    = stat_strength    + CASE WHEN RANDOM() < 0.25 THEN 1 ELSE 0 END,
                stat_agility     = stat_agility     + CASE WHEN RANDOM() < 0.25 THEN 1 ELSE 0 END,
                stat_intelligence = stat_intelligence + CASE WHEN RANDOM() < 0.25 THEN 1 ELSE 0 END,
                stat_defense     = stat_defense     + CASE WHEN RANDOM() < 0.25 THEN 1 ELSE 0 END,
                stat_luck        = stat_luck        + CASE WHEN RANDOM() < 0.25 THEN 1 ELSE 0 END
            WHERE id = %s
        """, (char_id,))

    cur.execute(f"""
        UPDATE {SCHEMA}.characters
        SET xp=%s, xp_to_next=%s, level=%s, coins=%s
        WHERE id=%s
    """, (new_xp, xp_to_next, new_level, new_coins, char_id))

    return {
        "xp_gained": xp_gain,
        "coins_gained": coins_gain,
        "new_xp": new_xp,
        "xp_to_next": xp_to_next,
        "new_level": new_level,
        "leveled_up": leveled_up,
        "new_coins": new_coins,
    }


def handler(event: dict, context) -> dict:
    """Квесты, уроки, данжи — прогресс и XP."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    qs = event.get("queryStringParameters") or {}
    action = body.get("action") or qs.get("action") or path.strip("/").split("/")[-1] or "current"
    token = (event.get("headers") or {}).get("X-Authorization", "").replace("Bearer ", "")

    # current — текущий квест и диалог
    if action == "current" or (method == "GET" and path.endswith("/current")):
        if not token:
            return json_response({"error": "Не авторизован"}, 401)

        conn = get_conn()
        cur = conn.cursor()
        char = get_char(cur, token)
        if not char:
            conn.close()
            return json_response({"error": "Персонаж не найден"}, 404)

        char_id, quest_id, chapter, level, xp, coins = char

        # Достаём прогресс диалога
        cur.execute(
            f"SELECT dialog_step, status FROM {SCHEMA}.quest_progress WHERE character_id=%s AND quest_id=%s",
            (char_id, quest_id)
        )
        progress = cur.fetchone()
        dialog_step = progress[0] if progress else 0
        quest_status = progress[1] if progress else "active"

        conn.close()

        quest = STORY.get(quest_id)
        if not quest:
            return json_response({"quest": None, "quest_id": quest_id})

        return json_response({
            "quest_id": quest_id,
            "chapter": chapter,
            "npc": quest["npc"],
            "npc_role": quest["npc_role"],
            "npc_emoji": quest["npc_emoji"],
            "dialog": quest["dialogs"][min(dialog_step, len(quest["dialogs"]) - 1)],
            "total_steps": len(quest["dialogs"]),
            "current_step": dialog_step,
            "status": quest_status,
            "reward": quest.get("reward", {}),
        })

    # advance — продвинуть диалог
    if action == "advance" or (method == "POST" and path.endswith("/advance")):
        if not token:
            return json_response({"error": "Не авторизован"}, 401)

        next_step = body.get("next_step", 1)
        action = body.get("action")

        conn = get_conn()
        cur = conn.cursor()
        char = get_char(cur, token)
        if not char:
            conn.close()
            return json_response({"error": "Персонаж не найден"}, 404)

        char_id, quest_id, chapter, level, xp, coins = char
        quest = STORY.get(quest_id, {})

        # Обновить или создать прогресс
        cur.execute(
            f"SELECT id FROM {SCHEMA}.quest_progress WHERE character_id=%s AND quest_id=%s",
            (char_id, quest_id)
        )
        exists = cur.fetchone()

        new_status = "active"
        reward_given = {}

        if action == "complete_quest":
            new_status = "completed"
            reward = quest.get("reward", {})
            if reward:
                new_xp = xp + reward.get("xp", 0)
                new_coins = coins + reward.get("coins", 0)
                cur.execute(
                    f"UPDATE {SCHEMA}.characters SET xp=%s, coins=%s WHERE id=%s",
                    (new_xp, new_coins, char_id)
                )
                reward_given = reward

        if exists:
            cur.execute(
                f"UPDATE {SCHEMA}.quest_progress SET dialog_step=%s, status=%s WHERE character_id=%s AND quest_id=%s",
                (next_step, new_status, char_id, quest_id)
            )
        else:
            cur.execute(
                f"INSERT INTO {SCHEMA}.quest_progress (character_id, quest_id, chapter, dialog_step, status) "
                f"VALUES (%s, %s, %s, %s, %s)",
                (char_id, quest_id, chapter, next_step, new_status)
            )

        conn.commit()
        conn.close()

        return json_response({"ok": True, "action": action, "reward": reward_given})

    # lesson_complete — завершение урока с начислением XP
    if action == "lesson_complete":
        if not token:
            return json_response({"error": "Не авторизован"}, 401)

        lesson_id = body.get("lesson_id", "")
        xp_reward  = int(body.get("xp", 100))
        coins_reward = int(body.get("coins", 20))

        conn = get_conn()
        cur  = conn.cursor()
        char = get_char(cur, token)
        if not char:
            conn.close()
            return json_response({"error": "Персонаж не найден"}, 404)

        char_id = char[0]

        # lesson_id хранится как integer — пробуем привести, иначе используем как есть
        try:
            lesson_id_int = int(lesson_id)
        except (ValueError, TypeError):
            lesson_id_int = 0

        # Проверяем: не проходил ли уже этот урок
        cur.execute(
            f"SELECT id, completed FROM {SCHEMA}.lesson_progress "
            f"WHERE character_id=%s AND lesson_id=%s",
            (char_id, lesson_id_int)
        )
        existing_lesson = cur.fetchone()
        already_done = existing_lesson and existing_lesson[1]

        result = {"already_completed": bool(already_done)}

        if already_done:
            # Уже завершён — только обновляем attempts
            cur.execute(
                f"UPDATE {SCHEMA}.lesson_progress SET attempts=attempts+1 "
                f"WHERE character_id=%s AND lesson_id=%s",
                (char_id, lesson_id_int)
            )
        else:
            if existing_lesson:
                cur.execute(
                    f"UPDATE {SCHEMA}.lesson_progress "
                    f"SET completed=true, xp_earned=%s, attempts=attempts+1, completed_at=NOW() "
                    f"WHERE character_id=%s AND lesson_id=%s",
                    (xp_reward, char_id, lesson_id_int)
                )
            else:
                cur.execute(
                    f"INSERT INTO {SCHEMA}.lesson_progress "
                    f"(character_id, lesson_id, completed, xp_earned, attempts, completed_at) "
                    f"VALUES (%s, %s, true, %s, 1, NOW())",
                    (char_id, lesson_id_int, xp_reward)
                )
            result.update(award_xp(cur, char_id, xp_reward, coins_reward))

        conn.commit()
        conn.close()
        return json_response({**result, "ok": True})

    # dungeon_complete — завершение данжа
    if action == "dungeon_complete":
        if not token:
            return json_response({"error": "Не авторизован"}, 401)

        dungeon_id    = body.get("dungeon_id", "")
        score_pct     = int(body.get("score_pct", 0))    # % правильных ответов
        xp_reward     = int(body.get("xp", 200))
        coins_reward  = int(body.get("coins", 100))

        # Масштабируем награду по результату
        xp_reward    = int(xp_reward    * (score_pct / 100))
        coins_reward = int(coins_reward * (score_pct / 100))

        conn = get_conn()
        cur  = conn.cursor()
        char = get_char(cur, token)
        if not char:
            conn.close()
            return json_response({"error": "Персонаж не найден"}, 404)

        char_id = char[0]

        # Сохраняем результат (всегда, даже повторные — храним лучший)
        cur.execute(
            f"SELECT id, best_score FROM {SCHEMA}.dungeon_progress "
            f"WHERE character_id=%s AND dungeon_id=%s",
            (char_id, dungeon_id)
        )
        existing = cur.fetchone()
        is_new_best = not existing or score_pct > existing[1]

        if existing:
            cur.execute(
                f"UPDATE {SCHEMA}.dungeon_progress "
                f"SET attempts=attempts+1, best_score=GREATEST(best_score,%s), last_completed_at=NOW() "
                f"WHERE id=%s",
                (score_pct, existing[0])
            )
        else:
            cur.execute(
                f"INSERT INTO {SCHEMA}.dungeon_progress (character_id, dungeon_id, best_score, attempts, last_completed_at) "
                f"VALUES (%s,%s,%s,1,NOW())",
                (char_id, dungeon_id, score_pct)
            )

        # XP только за первое прохождение или новый рекорд
        award_result = {}
        if xp_reward > 0:
            award_result = award_xp(cur, char_id, xp_reward, coins_reward)

        conn.commit()
        conn.close()
        return json_response({**award_result, "ok": True, "is_new_best": is_new_best, "score_pct": score_pct})

    return json_response({"error": "Not found"}, 404)