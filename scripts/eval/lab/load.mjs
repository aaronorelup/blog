// The Goobie lab's inputs from the last build's dist/: the corpus (src/lib/goobie-lab/corpus.js, from the same three
// files the page fetches), the in-context pack (every post in full, with its date) and the classic-RAG chunks (each
// section cut by the site's own search chunker, src/lib/search/chunks.js). Never a draft, an unlisted post or a live
// notebook: the Ask build lists only listed posts, and corpusOf() drops the live ones.
import fs from 'node:fs';
import { corpusOf, packFiles, sectionName, unfragment } from '../../../src/lib/goobie-lab/corpus.js';
import { docOf } from '../../../src/lib/search/chunks.js';

const DIST = new URL('../../../dist/', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p.replace(/^\//, ''), DIST), 'utf8');

export function loadCorpus() {
  const manifest = JSON.parse(read('/ask/manifest.json'));
  const packs = packFiles(manifest).map((f) => unfragment(read(f)));
  const corpus = corpusOf({ manifest, packs, rss: read('/rss.xml') });
  return { ...corpus, manifest, built: JSON.parse(read('/version.json')) };
}

const attr = (s) => String(s).replace(/"/g, '&quot;');

// In-context: every post as a <doc> with its id, date, topic, projects and author, each section under its mark.
export function packText(corpus) {
  const docs = corpus.posts.map((p) => {
    const out = [`<doc id="${p.id}" date="${p.date}" url="${p.url}" title="${attr(p.title)}" topic="${p.topic}"`
      + `${p.projects.length ? ` projects="${p.projects.join(' ')}"` : ''} by="${p.by}">`];
    let notes = false;
    for (const s of p.sections) {
      if (s.kind === 'notes' && !notes) {
        notes = true;
        out.push(`<notes url="${p.url}notes/" title="${attr(p.notesTitle ?? '')}">`);
      }
      out.push(`[${s.mark}] ${sectionName(s)}\n${s.text}`);
    }
    if (notes) out.push('</notes>');
    out.push('</doc>');
    return out.join('\n\n');
  });
  return `<documents>\n${docs.join('\n\n')}\n</documents>`;
}

// Classic RAG: every section in chunks of at most 1,500 characters (the live search index's own cut), each chunk
// carrying its post, date and section mark, and the text it is embedded as ("<title>. <heading>\n<text>", as
// worker/search/sync.js embeds the live index).
export function chunksOf(corpus) {
  return corpus.posts.flatMap((p) => {
    const [lead, ...rest] = p.sections.map((s) => ({ anchor: s.mark, heading: sectionName(s), text: s.text }));
    return docOf({ kind: 'post', id: p.id, slug: p.slug, title: p.title, lead, text: { sections: rest } }).chunks
      .map((c, i) => ({ id: `${p.id}:${i}`, slug: p.slug, title: p.title, date: p.date, mark: c.anchor,
        heading: c.heading, text: c.text, embedText: `${[p.title, c.heading].filter(Boolean).join('. ')}\n${c.text}` }));
  });
}
