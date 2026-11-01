// The build's map of RAG Goobie's files (/ask/manifest.json, src/lib/ask/manifest.js), read through ASSETS once per
// isolate, with the lookups worker/ask/ needs: a doc by number or slug, the doc a vector id belongs to, the section
// a cite mark names. Only listed posts are in it, so nothing here can reach an unlisted one.
import { buildJson } from '../lib/build-files.js';

export const MANIFEST = '/ask/manifest.json';
const ID = /^AO-0*(\d+)(n?):(\d+)$/;   // a search chunk's vector id: AO-063:4, AO-063n:4 (its notes page)
const indexes = new WeakMap();

export async function corpus(env) {
  const m = await buildJson(env, MANIFEST);
  if (!indexes.has(m)) indexes.set(m, indexOf(m));
  return indexes.get(m);
}

export function indexOf(m) {
  const bySlug = new Map(Object.entries(m.docs).map(([n, d]) => [d.slug, Number(n)]));
  const sections = new Map(Object.entries(m.docs).map(([n, d]) => [Number(n), new Map(d.sections.map((x) => [x[0], x]))]));
  const ofId = (id) => {
    const x = ID.exec(id);
    return x && m.docs[x[1]] ? Number(x[1]) : null;
  };
  return {
    m,
    order: [...bySlug.values()].sort((a, b) => a - b),
    live: Object.keys(m.live).map(Number),
    n: (slug) => bySlug.get(slug),
    doc: (n) => m.docs[n],
    ofId,
    // '55.3' for a chunk id, from the build's chunk maps (the gated hint marks).
    sectionOfChunk: (id) => {
      const [, n, notes, i] = ID.exec(id);
      const s = m.docs[Number(n)].chunks?.[notes ? 'notes' : 'post']?.[Number(i)];
      return s ? `${Number(n)}.${s}` : null;
    },
    // '45.2', '45.N3' or '45' -> { slug, kind, anchor, heading, title }, or null for a mark no listed section has.
    // within: the docs in this prompt (split mode), which a section mark must name; a bare [n] may name any post.
    resolve: (mark, within = null) => {
      const [n, s] = mark.split('.');
      const d = m.docs[n];
      if (!d) return null;
      if (s === undefined) return { slug: d.slug, kind: 'post', anchor: '', heading: '', title: d.title };
      const x = sections.get(Number(n)).get(s);
      if (!x || (within && !within.has(Number(n)))) return null;
      const [, kind, anchor, heading] = x;
      return { slug: d.slug, kind, anchor, heading, title: kind === 'notes' ? d.notesTitle : d.title };
    },
  };
}
