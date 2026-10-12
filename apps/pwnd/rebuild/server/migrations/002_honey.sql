-- pwnd – Pond Strategy · Ruleset v1 · honey, the fifth and final resource.
-- Ponds created before this migration keep their balances and start with 0 honey.
ALTER TABLE ponds ADD COLUMN IF NOT EXISTS honey BIGINT NOT NULL DEFAULT 0;
