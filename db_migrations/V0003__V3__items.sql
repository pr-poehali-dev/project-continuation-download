CREATE TABLE t_p99057007_project_continuation.items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    description TEXT,
    type VARCHAR(32) NOT NULL,
    rarity VARCHAR(16) NOT NULL DEFAULT 'common',
    stat_bonus JSONB DEFAULT '{}',
    image_layer VARCHAR(256),
    price INTEGER DEFAULT 0,
    drop_weight INTEGER DEFAULT 100
)
