"""
Авторизация: register, login, logout, me.
Роутинг через поле action в body или query param.
"""
import json
import os
import hashlib
import secrets
import psycopg2
from datetime import datetime, timedelta

SCHEMA = "t_p99057007_project_continuation"

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def hash_pw(p: str) -> str:
    return hashlib.sha256(p.encode()).hexdigest()

def make_token() -> str:
    return secrets.token_hex(32)

def cors():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Authorization",
    }

def resp(data, status=200):
    return {"statusCode": status, "headers": {**cors(), "Content-Type": "application/json"},
            "body": json.dumps(data, ensure_ascii=False, default=str)}

def handler(event: dict, context) -> dict:
    """Регистрация, логин, логаут, проверка токена через action."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors(), "body": ""}

    body = json.loads(event["body"]) if event.get("body") else {}
    qs = event.get("queryStringParameters") or {}
    path = event.get("path", "/")
    action = body.get("action") or qs.get("action") or path.split("/")[-1]
    token = (event.get("headers") or {}).get("X-Authorization", "").replace("Bearer ", "")

    if action == "register":
        username = body.get("username", "").strip()
        email = body.get("email", "").strip().lower()
        password = body.get("password", "")
        if not username or not email or not password:
            return resp({"error": "Заполни все поля"}, 400)
        if len(username) < 3:
            return resp({"error": "Имя минимум 3 символа"}, 400)
        if len(password) < 6:
            return resp({"error": "Пароль минимум 6 символов"}, 400)
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE username=%s OR email=%s", (username, email))
        if cur.fetchone():
            conn.close()
            return resp({"error": "Пользователь уже существует"}, 409)
        cur.execute(
            f"INSERT INTO {SCHEMA}.users (username, email, password_hash) VALUES (%s,%s,%s) RETURNING id",
            (username, email, hash_pw(password))
        )
        user_id = cur.fetchone()[0]
        tok = make_token()
        cur.execute(
            f"INSERT INTO {SCHEMA}.sessions (user_id, token, expires_at) VALUES (%s,%s,%s)",
            (user_id, tok, datetime.utcnow() + timedelta(days=30))
        )
        conn.commit()
        conn.close()
        return resp({"token": tok, "user_id": user_id, "username": username})

    if action == "login":
        login = body.get("login", "").strip()
        password = body.get("password", "")
        if not login or not password:
            return resp({"error": "Заполни все поля"}, 400)
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT id, username FROM {SCHEMA}.users WHERE (username=%s OR email=%s) AND password_hash=%s",
            (login, login.lower(), hash_pw(password))
        )
        row = cur.fetchone()
        if not row:
            conn.close()
            return resp({"error": "Неверный логин или пароль"}, 401)
        user_id, username = row
        tok = make_token()
        cur.execute(
            f"INSERT INTO {SCHEMA}.sessions (user_id, token, expires_at) VALUES (%s,%s,%s)",
            (user_id, tok, datetime.utcnow() + timedelta(days=30))
        )
        conn.commit()
        conn.close()
        return resp({"token": tok, "user_id": user_id, "username": username})

    if action == "me":
        if not token:
            return resp({"error": "Не авторизован"}, 401)
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT s.user_id, u.username, u.email FROM {SCHEMA}.sessions s "
            f"JOIN {SCHEMA}.users u ON u.id=s.user_id WHERE s.token=%s AND s.expires_at>NOW()",
            (token,)
        )
        row = cur.fetchone()
        conn.close()
        if not row:
            return resp({"error": "Сессия истекла"}, 401)
        return resp({"user_id": row[0], "username": row[1], "email": row[2]})

    if action == "logout":
        if token:
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"UPDATE {SCHEMA}.sessions SET expires_at=NOW() WHERE token=%s", (token,))
            conn.commit()
            conn.close()
        return resp({"ok": True})

    return resp({"error": "Unknown action"}, 400)
