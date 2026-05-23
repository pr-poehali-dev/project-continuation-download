CREATE TABLE IF NOT EXISTS t_p99057007_project_continuation.player_progress (
    character_id INTEGER NOT NULL,
    progress_key VARCHAR(64) NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (character_id, progress_key)
);

CREATE INDEX IF NOT EXISTS idx_player_progress_character
  ON t_p99057007_project_continuation.player_progress (character_id);
