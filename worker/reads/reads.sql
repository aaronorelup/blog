-- The live reader counter's one table, in the D1 database blog-reads (binding DB). Created
-- 2026-10-17 through the Cloudflare Developer Platform connection; for a local `wrangler dev`, run
--   npx wrangler d1 execute blog-reads --local --file worker/reads.sql
-- One row per post, day (UTC) and country, holding a count. Nothing else is kept: no IP address,
-- no browser, no cookie, no time of day.
CREATE TABLE IF NOT EXISTS reads (
  slug TEXT NOT NULL,
  day TEXT NOT NULL,
  country TEXT NOT NULL,
  n INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (slug, day, country)
) WITHOUT ROWID;
