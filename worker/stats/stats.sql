-- The traffic snapshot behind /api/stats (worker/stats.js), in the D1 database blog-reads (binding
-- DB), beside the reader counter's table (worker/reads.sql). For a local `wrangler dev`, run
--   npx wrangler d1 execute blog-reads --local --file worker/stats.sql
-- In production nothing needs running: the cron's first run finds the tables missing and creates
-- them (the same statements are SCHEMA in worker/stats.js; keep the two alike). Running this file
-- once with `--remote` instead does the same and is harmless.
--
-- What is kept: counts per day and class, bot and program names, browser and system names,
-- countries, public page paths. Nothing keyed on an IP address, and no person's user agent.

-- Small named values: the cron's lock and pause, the query count, the last error, the long-run
-- totals and vitals, and the finished snapshot (the text /api/stats returns).
CREATE TABLE IF NOT EXISTS stats_state (k TEXT PRIMARY KEY, v TEXT);

-- One finished day of the snapshot each, as the JSON text it appears as in "days".
CREATE TABLE IF NOT EXISTS stats_day (d TEXT PRIMARY KEY, body TEXT NOT NULL, at TEXT NOT NULL);

-- The pieces of a day still being gathered (step "core", then "w0/2", "w1/2" …), deleted once
-- the day is put together.
CREATE TABLE IF NOT EXISTS stats_part (d TEXT NOT NULL, step TEXT NOT NULL, body TEXT NOT NULL, PRIMARY KEY (d, step));
