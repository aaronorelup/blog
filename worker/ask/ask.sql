-- Ask Goobie's answers (serve.js), in the D1 database blog-reads. key: sha256 of the model and the messages (the
-- prompt, the excerpts, the question), so an answer goes stale only when those change. cleanup.js drops it at 7 days.
CREATE TABLE IF NOT EXISTS ask_cache (key TEXT PRIMARY KEY, body TEXT NOT NULL, at TEXT NOT NULL) WITHOUT ROWID;
