ALTER TABLE t_p99057007_project_continuation.characters
ADD COLUMN gender VARCHAR(10) NOT NULL DEFAULT 'male';

COMMENT ON COLUMN t_p99057007_project_continuation.characters.gender
IS 'Пол персонажа: male | female. Используется для выбора аватара.';
