// The minute cron's search step: keeps the Vectorize index blog-search in line with the build's
// /search/manifest.json (src/lib/search/chunks.js). Normally one small D1 read that finds nothing to do; after a
// deploy it re-embeds the docs whose hash moved, 10 a run, and drops removed docs (an unlisted post) with their
// vectors. indexVersion() is the manifest v the index last fully matched, which keys search's cache.
import { buildJson } from '../lib/build-files.js';
import { ensure } from '../lib/sql.js';
import { embed, MANIFEST } from './retrieve.js';
import SCHEMA from './search.sql';

const PER_RUN = 10;   // docs
const PER_CALL = 50;  // chunks embedded in one AI call
const PER_DELETE = 100; // Vectorize's most ids in one delete
const ids = (prefix, from, to) => Array.from({ length: Math.max(0, to - from) }, (_, i) => `${prefix}:${from + i}`);
const inList = 'SELECT value FROM json_each(?1)';
async function remove(env, list) {
  for (let i = 0; i < list.length; i += PER_DELETE) await env.SEARCH_INDEX.deleteByIds(list.slice(i, i + PER_DELETE));
}

export async function step(env) {
  const m = await buildJson(env, MANIFEST);
  await ensure(env.DB, SCHEMA);
  const [state, live] = await env.DB.batch([
    env.DB.prepare("SELECT v FROM search_state WHERE k = 'v'"),
    env.DB.prepare(`SELECT doc, hash FROM search_docs WHERE doc IN (${inList})`).bind(JSON.stringify(m.live)),
  ]);
  const liveHash = new Map(live.results.map((r) => [r.doc, r.hash]));
  if (state.results[0]?.v === m.v && m.live.every((d) => liveHash.get(d) === m.docs[d])) return 'idle';

  const { results: rows } = await env.DB.prepare('SELECT doc, id, hash, n FROM search_docs').all();
  const had = new Map(rows.map((r) => [r.doc, r]));
  // Removed docs first: a renamed post's new doc re-uses its vector ids.
  const gone = rows.filter((r) => !Object.hasOwn(m.docs, r.doc));
  if (gone.length) {
    await remove(env, gone.flatMap((r) => ids(r.id, 0, r.n)));
    await env.DB.prepare(`DELETE FROM search_docs WHERE doc IN (${inList})`).bind(JSON.stringify(gone.map((r) => r.doc))).run();
  }
  const changed = Object.keys(m.docs).filter((d) => had.get(d)?.hash !== m.docs[d]);
  for (const doc of changed.slice(0, PER_RUN)) await embedDoc(env, m, doc, had.get(doc));
  if (changed.length <= PER_RUN) await env.DB.prepare("INSERT OR REPLACE INTO search_state VALUES ('v', ?1)").bind(m.v).run();
  return `${Math.min(changed.length, PER_RUN)} embedded, ${gone.length} removed, ${Math.max(0, changed.length - PER_RUN)} left`;
}

// One doc's chunks embedded as "<title>. <heading>\n<text>" and upserted as <prefix>:<n>, with the metadata
// retrieve.js reads ({ s slug, k kind, a anchor, h heading, t text, T title }); its old vectors past the new count go.
async function embedDoc(env, m, doc, old) {
  const d = await buildJson(env, `/search/docs/${doc.replace(':', '-')}.json`);
  const vectors = [];
  for (let i = 0; i < d.chunks.length; i += PER_CALL) {
    const batch = d.chunks.slice(i, i + PER_CALL);
    const values = await embed(env, batch.map((c) => `${[d.title, c.heading].filter(Boolean).join('. ')}\n${c.text}`));
    batch.forEach((c, j) => vectors.push({
      id: `${d.id}:${c.n}`,
      values: values[j],
      metadata: { s: d.slug, k: d.kind, a: c.anchor, h: c.heading, t: c.text, T: d.title },
    }));
  }
  await env.SEARCH_INDEX.upsert(vectors);
  const stale = !old ? [] : old.id === d.id ? ids(old.id, d.chunks.length, old.n) : ids(old.id, 0, old.n);
  await remove(env, stale);
  await env.DB.prepare('INSERT OR REPLACE INTO search_docs (doc, id, hash, n) VALUES (?1, ?2, ?3, ?4)')
    .bind(doc, d.id, m.docs[doc], d.chunks.length).run();
}

// The manifest v the index last fully matched ('' before the first full sync), re-read at most every 30 s.
let version = null; // { at, read }
export function indexVersion(env, now = Date.now()) {
  if (!version || now - version.at >= 30e3) {
    const read = ensure(env.DB, SCHEMA)
      .then(() => env.DB.prepare("SELECT v FROM search_state WHERE k = 'v'").first('v'))
      .then((v) => v ?? '');
    read.catch(() => { if (version?.read === read) version = null; });
    version = { at: now, read };
  }
  return version.read;
}
