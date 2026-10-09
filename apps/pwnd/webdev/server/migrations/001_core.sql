-- pwnd – Pond Strategy · Ruleset v1 · core schema (MySQL/TiDB).
-- Times that drive game rules are stored as epoch milliseconds (BIGINT) from the server clock.

CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  open_id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NULL,
  email VARCHAR(320) NULL,
  login_method VARCHAR(64) NULL,
  role VARCHAR(16) NOT NULL DEFAULT 'user',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  last_signed_in DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_users_open_id (open_id)
);

CREATE TABLE IF NOT EXISTS ponds (
  user_id BIGINT NOT NULL PRIMARY KEY,
  display_name VARCHAR(64) NOT NULL,
  energy BIGINT NOT NULL,
  water BIGINT NOT NULL,
  air BIGINT NOT NULL,
  love BIGINT NOT NULL,
  honey BIGINT NOT NULL DEFAULT 0,
  last_tick_ms BIGINT NOT NULL,
  revision INT NOT NULL DEFAULT 0,
  unlocked JSON NOT NULL,
  upgrades JSON NOT NULL,
  troops JSON NOT NULL,
  skill_profile JSON NOT NULL,
  calibration DOUBLE NOT NULL DEFAULT 0,
  quiz_rating INT NOT NULL DEFAULT 1000,
  trophies INT NOT NULL DEFAULT 100,
  best_trophies INT NOT NULL DEFAULT 100,
  pond_level INT NOT NULL DEFAULT 1,
  shield_until_ms BIGINT NULL,
  ruleset_version INT NOT NULL DEFAULT 1,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  KEY idx_ponds_trophies (trophies)
);

CREATE TABLE IF NOT EXISTS pond_buildings (
  user_id BIGINT NOT NULL,
  type VARCHAR(32) NOT NULL,
  x TINYINT NOT NULL,
  y TINYINT NOT NULL,
  bank INT NOT NULL DEFAULT 0,
  carry DOUBLE NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, type)
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  mode VARCHAR(8) NOT NULL,
  topic_id VARCHAR(16) NULL,
  opponent_id VARCHAR(16) NOT NULL,
  status VARCHAR(12) NOT NULL DEFAULT 'active',
  total INT NOT NULL,
  state JSON NOT NULL,
  result JSON NULL,
  rewarded TINYINT NOT NULL DEFAULT 0,
  created_at_ms BIGINT NOT NULL,
  completed_at_ms BIGINT NULL,
  KEY idx_attempts_user (user_id, created_at_ms)
);

CREATE TABLE IF NOT EXISTS daily_counters (
  user_id BIGINT NOT NULL,
  day CHAR(10) NOT NULL,
  attacks_used INT NOT NULL DEFAULT 0,
  loot_taken INT NOT NULL DEFAULT 0,
  rotation_index INT NOT NULL DEFAULT 0,
  quiz_rewarded INT NOT NULL DEFAULT 0,
  questions_generated INT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);

CREATE TABLE IF NOT EXISTS battles (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  attacker_id BIGINT NOT NULL,
  defender_id BIGINT NULL,
  bot_id VARCHAR(16) NULL,
  attacker_name VARCHAR(64) NOT NULL,
  defender_name VARCHAR(64) NOT NULL,
  ruleset_version INT NOT NULL,
  seed BIGINT NOT NULL,
  snapshot JSON NOT NULL,
  deployment JSON NOT NULL,
  stars TINYINT NOT NULL,
  destruction TINYINT NOT NULL,
  core_destroyed TINYINT NOT NULL,
  loot JSON NOT NULL,
  attacker_trophies_before INT NOT NULL,
  attacker_trophy_delta INT NOT NULL,
  defender_trophies_before INT NOT NULL,
  defender_trophy_delta INT NOT NULL,
  shield_until_ms BIGINT NULL,
  replay_hash VARCHAR(32) NOT NULL,
  seen_by_defender TINYINT NOT NULL DEFAULT 0,
  created_at_ms BIGINT NOT NULL,
  KEY idx_battles_attacker (attacker_id, created_at_ms),
  KEY idx_battles_defender (defender_id, created_at_ms),
  KEY idx_battles_pair (attacker_id, defender_id, created_at_ms),
  KEY idx_battles_bot (attacker_id, bot_id, created_at_ms)
);
