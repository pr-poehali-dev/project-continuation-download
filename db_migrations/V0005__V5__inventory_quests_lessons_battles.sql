CREATE TABLE t_p99057007_project_continuation.inventory (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES t_p99057007_project_continuation.characters(id),
    item_id INTEGER REFERENCES t_p99057007_project_continuation.items(id),
    obtained_at TIMESTAMP DEFAULT NOW(),
    source VARCHAR(32) DEFAULT 'drop'
);

CREATE TABLE t_p99057007_project_continuation.quest_progress (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES t_p99057007_project_continuation.characters(id),
    quest_id VARCHAR(64) NOT NULL,
    chapter INTEGER NOT NULL,
    status VARCHAR(16) DEFAULT 'active',
    dialog_step INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    UNIQUE(character_id, quest_id)
);

CREATE TABLE t_p99057007_project_continuation.lesson_progress (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES t_p99057007_project_continuation.characters(id),
    lesson_id INTEGER NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    UNIQUE(character_id, lesson_id)
);

CREATE TABLE t_p99057007_project_continuation.battles (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES t_p99057007_project_continuation.characters(id),
    enemy_id VARCHAR(64) NOT NULL,
    result VARCHAR(16) NOT NULL,
    xp_earned INTEGER DEFAULT 0,
    coins_earned INTEGER DEFAULT 0,
    item_dropped INTEGER REFERENCES t_p99057007_project_continuation.items(id),
    played_at TIMESTAMP DEFAULT NOW()
)
