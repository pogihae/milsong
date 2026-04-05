-- =============================================================
-- 0002_ingest_support.sql
-- Support periodic chart ingestion jobs
-- =============================================================

ALTER TABLE songs
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS source_song_id TEXT,
  ADD COLUMN IF NOT EXISTS source_artist_id TEXT,
  ADD COLUMN IF NOT EXISTS source_album_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS songs_source_song_unique_idx
  ON songs (source, source_song_id);

ALTER TABLE charts
  ALTER COLUMN source SET DEFAULT 'bugs';

UPDATE charts
SET source = 'bugs'
WHERE source IS NULL;

ALTER TABLE charts
  ALTER COLUMN source SET NOT NULL;

ALTER TABLE charts
  DROP CONSTRAINT IF EXISTS charts_chart_date_chart_type_rank_key;

CREATE UNIQUE INDEX IF NOT EXISTS charts_source_date_type_rank_unique_idx
  ON charts (source, chart_date, chart_type, rank);

CREATE TABLE IF NOT EXISTS sync_runs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source        TEXT        NOT NULL,
  job_type      TEXT        NOT NULL CHECK (job_type IN ('backfill', 'incremental')),
  chart_type    TEXT        NOT NULL CHECK (chart_type IN ('daily', 'weekly')),
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at   TIMESTAMPTZ,
  range_start   DATE,
  range_end     DATE,
  status        TEXT        NOT NULL CHECK (status IN ('running', 'succeeded', 'failed')),
  processed_days INTEGER    NOT NULL DEFAULT 0,
  rows_synced   INTEGER     NOT NULL DEFAULT 0,
  message       TEXT
);

CREATE INDEX IF NOT EXISTS sync_runs_source_started_at_idx
  ON sync_runs (source, started_at DESC);

CREATE TABLE IF NOT EXISTS sync_checkpoints (
  source         TEXT        NOT NULL,
  chart_type     TEXT        NOT NULL CHECK (chart_type IN ('daily', 'weekly')),
  last_synced_at DATE,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (source, chart_type)
);
