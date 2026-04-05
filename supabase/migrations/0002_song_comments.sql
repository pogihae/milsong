-- Song comments: one table per song, anonymous nickname + content
CREATE TABLE song_comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id    UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  nickname   TEXT NOT NULL CHECK (char_length(nickname) BETWEEN 1 AND 30),
  content    TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX song_comments_song_id_idx ON song_comments (song_id, created_at DESC);

-- RLS: anyone can read; anyone can insert (anonymous)
ALTER TABLE song_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_read_comments"
  ON song_comments FOR SELECT
  USING (true);

CREATE POLICY "allow_insert_comments"
  ON song_comments FOR INSERT
  WITH CHECK (true);
