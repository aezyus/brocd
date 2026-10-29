BEGIN;
ALTER TABLE brocd_sessions ADD COLUMN IF NOT EXISTS user_id text;
CREATE INDEX IF NOT EXISTS brocd_sessions_user_date ON brocd_sessions(user_id,created_at DESC) WHERE user_id IS NOT NULL;
COMMIT;
