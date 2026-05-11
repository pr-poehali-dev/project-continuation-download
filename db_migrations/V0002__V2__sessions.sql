CREATE TABLE t_p99057007_project_continuation.sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES t_p99057007_project_continuation.users(id),
    token VARCHAR(128) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
)
