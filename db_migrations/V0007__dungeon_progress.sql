-- V0007: dungeon_progress table
CREATE TABLE IF NOT EXISTS t_p99057007_project_continuation.dungeon_progress (
    id               SERIAL PRIMARY KEY,
    character_id     INTEGER REFERENCES t_p99057007_project_continuation.characters(id),
    dungeon_id       VARCHAR(64) NOT NULL,
    best_score       INTEGER NOT NULL DEFAULT 0,
    attempts         INTEGER NOT NULL DEFAULT 0,
    last_completed_at TIMESTAMP,
    UNIQUE(character_id, dungeon_id)
);
