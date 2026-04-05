-- =============================================================
-- 0001_initial_schema.sql
-- 입대곡 추천 시스템 — Initial Schema
-- =============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------------------------------------------
-- songs: song metadata
-- -------------------------------------------------------------
CREATE TABLE songs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT        NOT NULL,
  artist       TEXT        NOT NULL,
  genre        TEXT        NOT NULL CHECK (genre IN ('dance', 'ballad', 'hip_hop', 'r_and_b', 'trot', 'other')),
  group_type   TEXT        NOT NULL CHECK (group_type IN ('female_group', 'male_group', 'male_solo', 'female_solo', 'mixed', 'other')),
  release_date DATE,                          -- nullable: missing release date is handled in application code
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------
-- charts: daily or weekly chart entries, rank 1–20
-- -------------------------------------------------------------
CREATE TABLE charts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chart_date  DATE        NOT NULL,
  rank        SMALLINT    NOT NULL CHECK (rank BETWEEN 1 AND 20),
  song_id     UUID        NOT NULL REFERENCES songs (id) ON DELETE CASCADE,
  chart_type  TEXT        NOT NULL CHECK (chart_type IN ('daily', 'weekly')),
  source      TEXT,                           -- e.g. 'gaon', 'melon', 'bugs'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (chart_date, chart_type, rank)       -- one rank per chart per day
);

CREATE INDEX charts_date_type_idx ON charts (chart_date, chart_type);
CREATE INDEX charts_song_id_idx   ON charts (song_id);

-- -------------------------------------------------------------
-- broadcast_wins: music broadcast 1st-place records
-- Channels: KBS (뮤직뱅크), MBC (쇼챔피언/음악중심), SBS (인기가요), Mnet (엠카운트다운)
-- -------------------------------------------------------------
CREATE TABLE broadcast_wins (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id        UUID        NOT NULL REFERENCES songs (id) ON DELETE CASCADE,
  broadcast_date DATE        NOT NULL,
  channel        TEXT        NOT NULL CHECK (channel IN ('KBS', 'MBC', 'SBS', 'Mnet')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX broadcast_wins_song_date_idx ON broadcast_wins (song_id, broadcast_date);
