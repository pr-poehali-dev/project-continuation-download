-- Добавляем поле is_admin в users
ALTER TABLE t_p99057007_project_continuation.users
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- Первый пользователь (id=2, mven) — владелец
UPDATE t_p99057007_project_continuation.users SET is_admin = TRUE WHERE id = 2;
