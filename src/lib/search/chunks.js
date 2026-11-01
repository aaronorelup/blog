// Search's chunks: a listed post or its notes → one doc of chunks of at most MAX characters, which worker/search/
// sync.js embeds from /search/docs/<kind>-<slug>.json. Chunk 0 is the lead (a post's short version, anchor "short";
// a notes page's summary, at the top); then one per h2 section of the extraction, folded text kept, split at block
// boundaries. manifestOf() hashes each doc; its v leaves the live notebooks out, so their pushes keep the cache.
import { isLive } from '../../data/exempt.js';
import { sha256hex, short } from '../text/hash.js';

export const MODEL = '@cf/baai/bge-m3';
export const MAX = 1500;
const EMBED = `${MODEL} 1`; // bump the 1 when sync.js changes how a chunk is embedded: every doc re-embeds

// Parts joined by sep into runs of at most MAX characters. A word longer than that is cut every MAX characters.
const pack = (parts, sep) => parts.reduce((out, p) => {
  if (out.length && out.at(-1).length + sep.length + p.length <= MAX) out[out.length - 1] += sep + p;
  else out.push(p);
  return out;
}, []);
const cut = (w) => Array.from({ length: Math.ceil(w.length / MAX) }, (_, i) => w.slice(i * MAX, (i + 1) * MAX));
const words = (s) => (s.length <= MAX ? [s] : pack(s.split(' ').flatMap(cut), ' '));
const sentences = (block) => (block.length <= MAX ? [block] : pack(block.split(/(?<=[.!?])\s+/).flatMap(words), ' '));
const pieces = (text) => (text ? pack(text.split('\n\n').flatMap(sentences), '\n\n') : []);

// lead: { anchor, heading, text }. text: the extraction, which a live notebook that failed to render doesn't have.
export function docOf({ kind, id, slug, title, lead, text }) {
  const chunks = [lead, ...(text?.sections ?? [])]
    .flatMap(({ anchor, heading, text: t }) => pieces(t).map((piece) => ({ anchor, heading, text: piece })));
  return { id: kind === 'post' ? id : `${id}n`, kind, slug, title, chunks: chunks.map((c, n) => ({ n, ...c })) };
}

// A post's short version as one text: its summary and its card's verdict, takeaway and points.
export function shortVersion(summary, card) {
  const text = [summary, card.verdict, card.takeaway, ...(card.points ?? [])].filter(Boolean).join('\n\n');
  return { anchor: 'short', heading: 'The short version', text };
}

export const docKey = (doc) => `${doc.kind}:${doc.slug}`;           // its key in the manifest
export const docName = (doc) => `${doc.kind}-${doc.slug}`;          // its file: /search/docs/<name>.json
const hashOf = (doc) => short(sha256hex(EMBED + JSON.stringify(doc)));

// { v, model, live, docs: { 'post:<slug>': hash } }: v hashes every doc's hash but the live notebooks', which
// `live` names so sync.js checks those one by one.
export function manifestOf(docs) {
  const all = docs.map((d) => [docKey(d), hashOf(d)]);
  const live = docs.filter((d) => isLive(d.slug)).map(docKey);
  const steady = all.filter(([key]) => !live.includes(key));
  return { v: short(sha256hex(JSON.stringify(steady))), model: MODEL, live, docs: Object.fromEntries(all) };
}
