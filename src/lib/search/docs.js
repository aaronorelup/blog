// The search docs of this build, once per build: every listed post, then its notes page if it has one, chunked by
// chunks.js from the one text extraction. Read by src/pages/search/ (the manifest and one file per doc).
import { cardOf } from '../cards.js';
import { listedPosts, notesBySlug, renderEntry, slugOf } from '../content.js';
import { docOf, shortVersion } from './chunks.js';

const textOf = async (entry) => (await renderEntry(entry)).remarkPluginFrontmatter.text;
let docs = null;

export function searchDocs() {
  docs ??= (async () => {
    const notes = await notesBySlug();
    const out = [];
    for (const post of await listedPosts()) {
      const slug = slugOf(post);
      const { id, title, summary, voice } = post.data;
      const lead = shortVersion(summary, cardOf(post));
      out.push(docOf({ kind: 'post', id, slug, title, voice, lead, text: await textOf(post) }));
      const note = notes.get(slug);
      if (note) {
        const top = { anchor: '', heading: '', text: note.data.summary };
        out.push(docOf({
          kind: 'notes', id, slug, title: note.data.title, voice: note.data.voice, lead: top, text: await textOf(note),
        }));
      }
    }
    return out;
  })();
  return docs;
}
