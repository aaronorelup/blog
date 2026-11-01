-- The reader counter's one table (reads/serve.js), in the D1 database blog-reads (binding DB), made by
-- lib/sql.js's ensure() on first use. One row per post, UTC day and country, holding a count. Nothing else is
-- kept: no IP address, no browser, no cookie, no time of day.
CREATE TABLE IF NOT EXISTS reads (
  slug TEXT NOT NULL,
  day TEXT NOT NULL,
  country TEXT NOT NULL,
  n INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (slug, day, country)
) WITHOUT ROWID;
