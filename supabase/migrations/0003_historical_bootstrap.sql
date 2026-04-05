-- =============================================================
-- 0003_historical_bootstrap.sql
-- Support historical bootstrap imports and chunked backfills
-- =============================================================

CREATE TABLE IF NOT EXISTS historical_charts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source      TEXT        NOT NULL,
  chart_year  INTEGER     NOT NULL CHECK (chart_year >= 1900),
  rank        SMALLINT    NOT NULL CHECK (rank >= 1),
  song_id     TEXT        NOT NULL REFERENCES songs (id) ON DELETE CASCADE,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source, chart_year, rank)
);

CREATE INDEX IF NOT EXISTS historical_charts_year_idx
  ON historical_charts (chart_year, source);

CREATE TABLE IF NOT EXISTS historical_bootstrap_runs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source         TEXT        NOT NULL,
  started_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at    TIMESTAMPTZ,
  from_year      INTEGER     NOT NULL,
  to_year        INTEGER     NOT NULL,
  rows_imported  INTEGER     NOT NULL DEFAULT 0,
  status         TEXT        NOT NULL CHECK (status IN ('running', 'succeeded', 'failed')),
  message        TEXT
);

CREATE INDEX IF NOT EXISTS historical_bootstrap_runs_started_at_idx
  ON historical_bootstrap_runs (source, started_at DESC);
