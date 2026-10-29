BEGIN;
CREATE TABLE IF NOT EXISTS brocd_visitors (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 token_hash text UNIQUE NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS brocd_sessions (
 id uuid PRIMARY KEY,
 visitor_id uuid NOT NULL REFERENCES brocd_visitors(id) ON DELETE CASCADE,
 created_at timestamptz NOT NULL DEFAULT now(),
 duration_seconds integer NOT NULL CHECK (duration_seconds BETWEEN 0 AND 86400),
 theme text,
 sleep text CHECK (sleep IN ('Low', 'Okay', 'Rested')),
 caffeine text CHECK (caffeine IN ('None', 'Some', 'High')),
 environment text CHECK (environment IN ('Home', 'Work', 'Outside', 'In transit')),
 mood text CHECK (mood IN ('Tough', 'Uneasy', 'Okay', 'Good', 'Bright'))
);
CREATE INDEX IF NOT EXISTS brocd_sessions_visitor_date ON brocd_sessions(visitor_id,created_at DESC);
COMMIT;
