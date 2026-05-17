-- Репутация игрока во фракциях
CREATE TABLE IF NOT EXISTS t_p99057007_project_continuation.faction_reputation (
  id SERIAL PRIMARY KEY,
  character_id INT NOT NULL REFERENCES t_p99057007_project_continuation.characters(id),
  faction_id VARCHAR(32) NOT NULL,
  reputation INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(character_id, faction_id)
);

CREATE INDEX IF NOT EXISTS idx_faction_rep_char ON t_p99057007_project_continuation.faction_reputation(character_id);

-- Глобальное влияние фракций
CREATE TABLE IF NOT EXISTS t_p99057007_project_continuation.faction_influence (
  faction_id VARCHAR(32) PRIMARY KEY,
  total_influence INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO t_p99057007_project_continuation.faction_influence (faction_id, total_influence)
VALUES ('archive', 1000), ('black_syntax', 800), ('order', 700)
ON CONFLICT (faction_id) DO NOTHING;
