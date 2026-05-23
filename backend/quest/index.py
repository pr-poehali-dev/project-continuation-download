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

    # npc_reward — выдать XP/coins за диалог с NPC (вызывается из фронта)
    if action == "npc_reward":
        if not token:
            return json_response({"error": "Не авторизован"}, 401)

        xp_reward    = int(body.get("xp", 0))
        coins_reward = int(body.get("coins", 0))
        npc_id       = body.get("npc_id", "unknown")

        if xp_reward <= 0 and coins_reward <= 0:
            return json_response({"ok": True, "xp_gained": 0, "coins_gained": 0})

        conn = get_conn()
        cur  = conn.cursor()
        char = get_char(cur, token)
        if not char:
            conn.close()
            return json_response({"error": "Персонаж не найден"}, 404)

        char_id = char[0]
        result = award_xp(cur, char_id, xp_reward, coins_reward)
        conn.commit()
        conn.close()
        return json_response({**result, "ok": True, "npc_id": npc_id})

    # quest_claim — выдать награду за завершённый квест из QuestLog
    if action == "quest_claim":
        if not token:
            return json_response({"error": "Не авторизован"}, 401)

        xp_reward    = int(body.get("xp", 0))
        coins_reward = int(body.get("coins", 0))

        if xp_reward <= 0 and coins_reward <= 0:
            return json_response({"ok": True, "xp_gained": 0, "coins_gained": 0})

        conn = get_conn()
        cur  = conn.cursor()
        char = get_char(cur, token)
        if not char:
            conn.close()
            return json_response({"error": "Персонаж не найден"}, 404)

        char_id = char[0]
        result = award_xp(cur, char_id, xp_reward, coins_reward)
        conn.commit()
        conn.close()
        return json_response({**result, "ok": True})

    # leaderboard — топ игроков по XP
    if action == "leaderboard":
        conn = get_conn()
        cur  = conn.cursor()
        cur.execute(f"""
            SELECT u.username, c.level, c.xp, c.class, c.current_chapter,
                   u.id,
                   (SELECT COUNT(*) FROM {SCHEMA}.battles b WHERE b.character_id = c.id AND b.result = 'win') as wins
            FROM {SCHEMA}.users u
            JOIN {SCHEMA}.characters c ON c.user_id = u.id
            ORDER BY c.xp DESC, c.level DESC
            LIMIT 50
        """)
        rows = cur.fetchall()
        conn.close()

        leaders = []
        for i, r in enumerate(rows):
            leaders.append({
                "rank":    i + 1,
                "username": r[0],
                "level":   r[1],
                "xp":      r[2],
                "class":   r[3],
                "chapter": r[4],
                "user_id": r[5],
                "wins":    r[6] or 0,
            })
        return json_response({"leaderboard": leaders})

    # gain_xp — универсальный сейв XP/Creds для режимов без своего обработчика
    # (карточки, конструктор, сториз, мастерская, крафт)
    if action == "gain_xp":
        if not token:
            return json_response({"error": "Не авторизован"}, 401)

        xp_reward    = int(body.get("xp", 0))
        coins_reward = int(body.get("coins", 0))
        reason       = body.get("reason", "generic")

        # Защита от абуза: ограничиваем разумными пределами
        if xp_reward < 0 or coins_reward < 0:
            return json_response({"error": "Отрицательные значения недопустимы"}, 400)
        if xp_reward > 500 or coins_reward > 300:
            return json_response({"error": "Слишком большая награда"}, 400)
        if xp_reward == 0 and coins_reward == 0:
            return json_response({"ok": True, "xp_gained": 0, "coins_gained": 0})

        conn = get_conn()
        cur  = conn.cursor()
        char = get_char(cur, token)
        if not char:
            conn.close()
            return json_response({"error": "Персонаж не найден"}, 404)

        char_id = char[0]
        result = award_xp(cur, char_id, xp_reward, coins_reward)
        conn.commit()
        conn.close()
        return json_response({**result, "ok": True, "reason": reason})

    # progress_sync — подтянуть прогресс с сервера для синхронизации с localStorage
    if action == "progress_sync":
        if not token:
            return json_response({"error": "Не авторизован"}, 401)

        conn = get_conn()
        cur = conn.cursor()
        char = get_char(cur, token)
        if not char:
            conn.close()
            return json_response({"error": "Персонаж не найден"}, 404)

        char_id = char[0]

        # Пройденные уроки
        cur.execute(
            f"SELECT lesson_id FROM {SCHEMA}.lesson_progress "
            f"WHERE character_id=%s AND completed=true",
            (char_id,)
        )
        lessons_completed = [int(r[0]) for r in cur.fetchall()]

        # Пройденные данжи + лучшие результаты
        cur.execute(
            f"SELECT dungeon_id, best_score FROM {SCHEMA}.dungeon_progress "
            f"WHERE character_id=%s",
            (char_id,)
        )
        dungeons_data = cur.fetchall()
        dungeons_completed = [r[0] for r in dungeons_data]
        dungeons_scores = {r[0]: int(r[1] or 0) for r in dungeons_data}

        # Победы в боях + лучшая серия
        cur.execute(
            f"SELECT COUNT(*) FROM {SCHEMA}.battles "
            f"WHERE character_id=%s AND result='win'",
            (char_id,)
        )
        battles_won = int(cur.fetchone()[0] or 0)

        # Лучшая серия побед (последовательные win-ы)
        cur.execute(
            f"SELECT result FROM {SCHEMA}.battles "
            f"WHERE character_id=%s ORDER BY played_at ASC",
            (char_id,)
        )
        results = [r[0] for r in cur.fetchall()]
        best_streak = 0
        current_streak = 0
        for r in results:
            if r == 'win':
                current_streak += 1
                if current_streak > best_streak:
                    best_streak = current_streak
            else:
                current_streak = 0

        # Универсальный прогресс из player_progress
        cur.execute(
            f"SELECT progress_key, data FROM {SCHEMA}.player_progress WHERE character_id=%s",
            (char_id,)
        )
        extra = {row[0]: row[1] for row in cur.fetchall()}

        conn.close()

        return json_response({
            "lessons_completed":   lessons_completed,
            "battles_won":         battles_won,
            "battles_streak_best": best_streak,
            "dungeons_completed":  dungeons_completed,
            "dungeons_scores":     dungeons_scores,
            "extra":               extra,
        })

    # progress_save — сохранить любой набор ключей универсального прогресса в БД
    # body: { action: "progress_save", entries: { "stories_completed": {...}, "counters": {...} } }
    if action == "progress_save":
        if not token:
            return json_response({"error": "Не авторизован"}, 401)

        entries = body.get("entries") or {}
        if not isinstance(entries, dict) or not entries:
            return json_response({"error": "Нет данных"}, 400)

        conn = get_conn()
        cur = conn.cursor()
        char = get_char(cur, token)
        if not char:
            conn.close()
            return json_response({"error": "Персонаж не найден"}, 404)

        char_id = char[0]
        saved = []
        for key, value in entries.items():
            if not isinstance(key, str) or len(key) > 64:
                continue
            cur.execute(
                f"INSERT INTO {SCHEMA}.player_progress (character_id, progress_key, data, updated_at) "
                f"VALUES (%s, %s, %s, NOW()) "
                f"ON CONFLICT (character_id, progress_key) "
                f"DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()",
                (char_id, key, json.dumps(value))
            )
            saved.append(key)

        conn.commit()
        conn.close()
        return json_response({"ok": True, "saved": saved})

    # faction_state — репутация игрока + глобальное влияние фракций
    if action == "faction_state":
        if not token:
            return json_response({"error": "Не авторизован"}, 401)

        conn = get_conn()
        cur  = conn.cursor()
        char = get_char(cur, token)
        if not char:
            conn.close()
            return json_response({"error": "Персонаж не найден"}, 404)

        char_id = char[0]

        # репутация
        cur.execute(
            f"SELECT faction_id, reputation FROM {SCHEMA}.faction_reputation WHERE character_id=%s",
            (char_id,)
        )
        my_rep = {r[0]: r[1] for r in cur.fetchall()}

        # глобальное влияние
        cur.execute(f"SELECT faction_id, total_influence FROM {SCHEMA}.faction_influence")
        influence = {r[0]: r[1] for r in cur.fetchall()}

        conn.close()

        # три базовые фракции
        for f in ("archive", "black_syntax", "order"):
            my_rep.setdefault(f, 0)
            influence.setdefault(f, 0)

        return json_response({
            "reputation": my_rep,
            "influence":  influence,
        })

    # faction_gain — изменить репутацию игрока во фракции
    if action == "faction_gain":
        if not token:
            return json_response({"error": "Не авторизован"}, 401)

        faction_id = body.get("faction_id", "")
        amount     = int(body.get("amount", 0))

        if faction_id not in ("archive", "black_syntax", "order"):
            return json_response({"error": "Неверная фракция"}, 400)
        if amount == 0:
            return json_response({"ok": True, "delta": 0})

        conn = get_conn()
        cur  = conn.cursor()
        char = get_char(cur, token)
        if not char:
            conn.close()
            return json_response({"error": "Персонаж не найден"}, 404)

        char_id = char[0]

        cur.execute(
            f"INSERT INTO {SCHEMA}.faction_reputation (character_id, faction_id, reputation) "
            f"VALUES (%s,%s,%s) "
            f"ON CONFLICT (character_id, faction_id) "
            f"DO UPDATE SET reputation = {SCHEMA}.faction_reputation.reputation + %s, updated_at=NOW() "
            f"RETURNING reputation",
            (char_id, faction_id, amount, amount)
        )
        new_rep = cur.fetchone()[0]

        # обновляем глобальное влияние
        cur.execute(
            f"INSERT INTO {SCHEMA}.faction_influence (faction_id, total_influence) "
            f"VALUES (%s,%s) "
            f"ON CONFLICT (faction_id) "
            f"DO UPDATE SET total_influence = {SCHEMA}.faction_influence.total_influence + %s, updated_at=NOW()",
            (faction_id, amount, amount)
        )

        conn.commit()
        conn.close()

        return json_response({
            "ok": True,
            "faction_id": faction_id,
            "reputation": new_rep,
            "delta": amount,
        })

    return json_response({"error": "Not found"}, 404)