// The Goobie lab's corpus (the three-ways demo, src/elements/ao-demo/demos/goobie-lab/): every listed post but the
// live notebooks, in full, with its date and projects, built from three files the build already writes for everyone
// (/ask/manifest.json, its packs, /rss.xml). The recorder (scripts/eval/lab/) reads them from dist/ and the page
// fetches them from the site, so both build the same corpus from the same bytes. Pure: the caller brings the files.
import { isLive } from '../../data/exempt.js';
import { PROJECTS } from '../../data/taxonomy.js';

const MARK_LINE = /^\[(\d+)\.(N?\d+)\] (.*)$/;
const ENDS = /^(<\/?(documents|doc|notes)\b|\(Sections .* are on its page\.\)$)/;
const ITEM = /<item>([\s\S]*?)<\/item>/g;
const ENTITY = { amp: '&', apos: "'", quot: '"', lt: '<', gt: '>' };
const decode = (s) => s.replace(/&(amp|apos|quot|lt|gt);/g, (_, k) => ENTITY[k]);
const PROJECT_OF = new Map(Object.entries(PROJECTS).map(([key, p]) => [p.label, key]));

export const unfragment = (s) => JSON.parse(`"${s}"`);   // an /ask/*.txt file: the body of a JSON string
export const idOf = (n) => `AO-${String(n).padStart(3, '0')}`;
export const packFiles = (manifest) => manifest.packs.map((p) => `/ask/${p.file}`);

// /rss.xml: every listed post's date (YYYY-MM-DD) and project keys, by slug.
export function datesOf(rss) {
  const out = new Map();
  for (const [, item] of rss.matchAll(ITEM)) {
    const slug = /\/ledger\/([^/<]+)\/<\/link>/.exec(item)?.[1];
    const date = /<pubDate>([^<]+)<\/pubDate>/.exec(item)?.[1];
    if (!slug || !date) continue;
    const labels = [...item.matchAll(/<category>([^<]*)<\/category>/g)].map((m) => decode(m[1]));
    out.set(slug, { date: new Date(date).toISOString().slice(0, 10), projects: labels.map((l) => PROJECT_OF.get(l)).filter(Boolean) });
  }
  return out;
}

// manifest: /ask/manifest.json. packs: the text of each of its packs (unfragmented). rss: /rss.xml.
// Returns { posts, bySlug, resolve }: posts in AO order, each { n, id, slug, title, date, topic, projects, by, url,
// tokens, notesTitle, sections: [{ mark, kind, anchor, heading, text }] }; resolve(mark) as the live Ask's cites.
export function corpusOf({ manifest, packs, rss }) {
  const meta = datesOf(rss);
  const texts = new Map();
  const notesTitles = new Map();
  for (const pack of packs) {
    let n = null;
    let cur = null;
    for (const line of pack.split('\n')) {
      const doc = /^<doc n="(\d+)"/.exec(line);
      const notes = /^<notes title="([^"]*)"/.exec(line);
      const x = MARK_LINE.exec(line);
      if (doc) { n = doc[1]; cur = null; continue; }
      if (notes && n) notesTitles.set(n, decode(notes[1]));
      if (x && x[1] === n) {
        cur = { s: x[2], lines: [] };
        if (!texts.has(n)) texts.set(n, []);
        texts.get(n).push(cur);
      } else if (ENDS.test(line)) cur = null;
      else if (cur) cur.lines.push(line);
    }
  }
  const posts = [];
  for (const [n, d] of Object.entries(manifest.docs)) {
    if (manifest.live[n] || isLive(d.slug) || !texts.has(n) || !meta.has(d.slug)) continue;
    const head = new Map(d.sections.map(([s, kind, anchor, heading]) => [s, { kind, anchor, heading }]));
    const sections = texts.get(n).filter((p) => head.has(p.s))
      .map((p) => ({ mark: `${n}.${p.s}`, ...head.get(p.s), text: p.lines.join('\n').trim() }));
    posts.push({ n: Number(n), id: idOf(n), slug: d.slug, title: d.title, ...meta.get(d.slug), topic: d.topic,
      by: d.by, url: `/ledger/${d.slug}/`, tokens: d.tokens, notesTitle: notesTitles.get(n) ?? null, sections });
  }
  posts.sort((a, b) => a.n - b.n);
  const bySlug = new Map(posts.map((p) => [p.slug, p]));
  const byN = new Map(posts.map((p) => [String(p.n), p]));
  const marks = new Map(posts.flatMap((p) => p.sections.map((s) => [s.mark, [p, s]])));
  // '55.2', '26.N3' or '55' -> { slug, kind, anchor, heading, title }, or null for anything outside this corpus.
  const resolve = (mark) => {
    if (!mark.includes('.')) {
      const p = byN.get(mark);
      return p ? { slug: p.slug, kind: 'post', anchor: '', heading: '', title: p.title } : null;
    }
    const hit = marks.get(mark);
    if (!hit) return null;
    const [p, s] = hit;
    return { slug: p.slug, kind: s.kind, anchor: s.anchor, heading: s.heading, title: s.kind === 'notes' ? p.notesTitle ?? p.title : p.title };
  };
  return { posts, bySlug, resolve };
}

// A section's name as a reader sees it: its heading, else the short version or the opening (of the notes page).
export const sectionName = (s) => s.heading || (s.anchor === 'short' ? 'The short version'
  : s.kind === 'notes' ? '(opening of the notes page)' : '(opening)');
