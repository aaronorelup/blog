// The Ask build, pure: docs (docs.js) -> numbered and cut (corpus.js) -> blocks -> packs -> the files under /ask/
// and /ask/manifest.json, the Worker's map of them (docs/ASK.md "The build"). File names carry the first 8 hex of
// their sha256, so a file never changes under its name. v hashes every stable file and the listed set, and only the
// live notebooks' keys, so a fleet push never moves it. scripts/eval/scale.mjs runs this same code on 1,000 posts.
import { TOPICS, TOPIC_KEYS } from '../../data/taxonomy.js';
import { sha256hex, short } from '../text/hash.js';
import { catalogText, docBlock, documents, fragment } from './blocks.js';
import * as CAPS from './caps.js';
import { numbered, sized } from './corpus.js';
import { packsOf } from './packs.js';
import { worst } from './price.js';

const PLAN_OUT = 300;
const ANSWER_OUT = 600;

export function countsOf(docs) {
  const topics = {};
  for (const d of docs) topics[d.topic] = (topics[d.topic] ?? 0) + 1;
  return { posts: docs.length, notes: docs.filter((d) => d.notes).length, claude: docs.filter((d) => d.by === 'Claude').length,
    topics: Object.fromEntries(TOPIC_KEYS.filter((k) => topics[k]).sort((a, b) => topics[b] - topics[a]).map((k) => [k, topics[k]])) };
}

// docs: askDocs()'s, in AO order. pins: src/data/ask-packs.json's starts. search: searchDocs(), for the chunk maps.
// caps: { WHOLE_CAP, PACK_CAP } to override (the split-mode drill's knobs).
export function assemble(docs, { pins, search = [], caps = {} }) {
  const c = { WHOLE_CAP: CAPS.WHOLE_CAP, PACK_CAP: CAPS.PACK_CAP, ...caps };
  const liveCap = CAPS.LIVE_CAP / Math.max(1, docs.filter((d) => d.live).length);
  const all = docs.map(numbered);
  const given = all.map((d) => sized(d, liveCap));
  const counts = countsOf(docs);
  const catalog = catalogText(docs, { ...counts, topics: Object.entries(counts.topics).map(([k, n]) => [k, TOPICS[k].label, n]) });
  const layout = packsOf(given.filter((d) => !d.live), { pins, whole: c.WHOLE_CAP, pack: c.PACK_CAP,
    catalogTokens: CAPS.est(catalog.length) });

  const files = new Map();
  const put = (prefix, text) => {
    const body = fragment(text);
    const hash = short(sha256hex(body));
    const file = `${prefix}-${hash}.txt`;
    files.set(file, body);
    return { file, bytes: Buffer.byteLength(body), tokens: CAPS.est(text.length), hash };
  };
  const byN = new Map(given.map((d) => [d.n, d]));
  const docFiles = new Map(given.map((d) => [d.n, put(`doc-${d.n}`, docBlock(d))]));
  const packs = layout.packs.map((ns, i) => ({ ...put(`pack-${i}`, documents(ns.map((n) => docBlock(byN.get(n))))), docs: ns }));
  const cat = put('catalog', catalog);
  const packOf = new Map(packs.flatMap((p, i) => p.docs.map((n) => [n, i])));
  const live = Object.fromEntries(given.filter((d) => d.live).map((d) => [d.n, docFiles.get(d.n).hash]));
  const v = short(sha256hex(JSON.stringify([packs.map((p) => p.hash), cat.hash,
    given.filter((d) => !d.live).map((d) => [d.n, docFiles.get(d.n).hash]), given.filter((d) => d.live).map((d) => [d.n, d.slug]),
    docs.map((d) => d.slug)])));

  const chunkMaps = chunksOf(all, search);
  const manifest = {
    v, mode: layout.mode,
    caps: { budget: CAPS.BUDGET, whole: c.WHOLE_CAP, pack: c.PACK_CAP, doc: CAPS.DOC_CAP, live: CAPS.LIVE_CAP,
      catalog: CAPS.CATALOG_CAP },
    reserve: reserveOf(layout.mode, packs, cat, given.filter((d) => d.live).map((d) => docFiles.get(d.n))),
    counts, pins, starts: layout.starts,
    catalog: strip(cat), packs: packs.map(({ hash, ...p }) => p), live,
    docs: Object.fromEntries(all.map((d) => [d.n, {
      slug: d.slug, title: d.title, ...(d.notes && { notesTitle: d.notes.title }), by: d.by, topic: d.topic,
      ...strip(docFiles.get(d.n)), pack: packOf.get(d.n) ?? null, ...(d.live && { live: true }),
      ...(byN.get(d.n).cut && { cut: byN.get(d.n).cut }),
      sections: d.parts.map((p) => [p.s, p.kind, p.anchor, p.heading]),
      ...(chunkMaps.has(d.n) && { chunks: chunkMaps.get(d.n) }),
    }])),
  };
  manifest.reserve_usd = (manifest.reserve.plan + manifest.reserve.answer) / 1e6;
  return { manifest, files };
}
const strip = ({ hash, ...f }) => f;

// The worst case of a question, in micro-dollars, held before any call and settled to the reported usage: the planner
// (rules, catalog, question) and the largest answer prompt this layout can send (whole: everything; split: the budget).
function reserveOf(mode, packs, cat, live) {
  const answer = mode === 'whole'
    ? CAPS.RULES_TOKENS + packs[0].tokens + cat.tokens + live.reduce((t, f) => t + f.tokens, 0) + CAPS.USER_TOKENS
    : CAPS.BUDGET;
  return { plan: worst(cat.tokens + CAPS.USER_TOKENS, PLAN_OUT), answer: worst(answer, ANSWER_OUT) };
}

// Search's chunk i of a doc (AO-0nn:i, AO-0nnn:i) -> the Ask section it lies in, by page and anchor.
function chunksOf(all, search) {
  const out = new Map();
  for (const d of all) {
    const at = new Map(d.parts.map((p) => [`${p.kind}|${p.anchor}`, p.s]));
    const maps = {};
    for (const s of search.filter((x) => x.slug === d.slug)) {
      maps[s.kind] = s.chunks.map((ch) => at.get(`${s.kind}|${ch.anchor}`) ?? (s.kind === 'notes' ? 'N0' : '0'));
    }
    if (Object.keys(maps).length) out.set(d.n, maps);
  }
  return out;
}
