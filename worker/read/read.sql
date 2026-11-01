-- Read-aloud (read/step.js): one row a post, its recording's state at the hash /read/index.json names. state is
-- partial (sections still to voice), failed (tries counts the failed runs at this hash; 3 and it is skipped) or done.
CREATE TABLE IF NOT EXISTS read_state (slug TEXT PRIMARY KEY, hash TEXT NOT NULL, state TEXT NOT NULL,
  tries INTEGER NOT NULL DEFAULT 0, at TEXT NOT NULL) WITHOUT ROWID;
