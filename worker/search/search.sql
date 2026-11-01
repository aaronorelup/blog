-- Search (worker/search/), in the D1 database blog-reads, beside flags and usage_day (lib/flags.sql).
-- search_state: k 'v' is the manifest v the index last fully matched (sync.js), which keys serve.js's cache.
-- search_docs: each embedded doc, its vector id prefix (AO-045, or AO-045n for notes), hash and chunk count.
-- searches: anonymous counts, normalised, scrubbed query text only (counts.js); cleanup.js drops them at 180 days.
CREATE TABLE IF NOT EXISTS search_state (k TEXT PRIMARY KEY, v TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS search_docs (doc TEXT PRIMARY KEY, id TEXT NOT NULL, hash TEXT NOT NULL,
  n INTEGER NOT NULL) WITHOUT ROWID;
CREATE TABLE IF NOT EXISTS searches (day TEXT NOT NULL, mode TEXT NOT NULL, q TEXT NOT NULL, n INTEGER NOT NULL,
  PRIMARY KEY (day, mode, q)) WITHOUT ROWID;
