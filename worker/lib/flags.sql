-- Switches and caps (lib/flags.js), in the D1 database blog-reads. A row overrides the default in flags.js:
--   npx wrangler d1 execute blog-reads --remote --command "INSERT OR REPLACE INTO flags VALUES ('ask','off')"
-- usage_day holds each day's running totals (searches, asks, read-aloud credits) that the daily caps count.
CREATE TABLE IF NOT EXISTS flags (k TEXT PRIMARY KEY, v TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS usage_day (day TEXT NOT NULL, what TEXT NOT NULL, n INTEGER NOT NULL,
  PRIMARY KEY (day, what)) WITHOUT ROWID;
