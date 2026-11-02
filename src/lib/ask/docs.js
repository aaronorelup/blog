// The docs RAG Goobie reads: every listed post in AO order (never a draft or an unlisted page), each with its notes
// page, as plain values for corpus.js. The only file of src/lib/ask/ that reads astro:content (through content.js).
// A live notebook that failed to render keeps only its short version, with a build warning.
import { isLive } from '../../data/exempt.js';
import { cardOf } from '../cards.js';
import { listedPosts, notesBySlug, slugOf, textOf } from '../content.js';
import { shortVersion } from '../search/chunks.js';

const byOf = (voice) => (voice === 'claude' ? 'Claude' : 'Aaron');
const aoNumber = (id) => Number(id.slice(3));

export async function askDocs() {
  const notes = await notesBySlug();
  const out = [];
  for (const post of await listedPosts()) {
    const slug = slugOf(post);
    const { id, title, topic, summary, voice } = post.data;
    const card = cardOf(post);
    const text = await textOf(post);
    if (!text) console.warn(`[ask] ${slug} did not render: RAG Goobie reads only its short version`);
    const note = notes.get(slug);
    out.push({
      n: aoNumber(id), slug, url: `/ledger/${slug}/`, title, topic, by: byOf(voice), takeaway: card.takeaway,
      short: shortVersion(summary, card), sections: text?.full ?? [], live: isLive(slug),
      notes: note ? {
        title: note.data.title, url: `/ledger/${slug}/notes/`, by: byOf(note.data.voice), summary: note.data.summary,
        sections: (await textOf(note))?.full ?? [],
      } : null,
    });
  }
  return out.sort((a, b) => a.n - b.n);
}
