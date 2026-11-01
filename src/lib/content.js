// The only importer of astro:content (with content.config.ts and src/schemas/). Collections come back
// sorted by slug, because Astro 5 returns them in no fixed order. entry.id is the file name: the URL slug.
import { getCollection, render } from 'astro:content';
import { isLive } from '../data/exempt.js';
import { isListed } from './posts.js';

const bySlug = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
const sorted = async (name) => (await getCollection(name)).sort(bySlug);

export const slugOf = (entry) => entry.id;
// Astro only logs a Markdown file that fails to render (an unknown <ao-*> tag, say) and builds its page blank. That
// fails the build, except in a live notebook, whose page builds blank on Astro's logged error alone.
export const renderEntry = (entry) => {
  if (!entry.rendered && !isLive(entry.id)) {
    throw new Error(`${entry.filePath} did not render. Astro logged why when it read the file; a cached build `
      + 'skips that log, so rm -rf node_modules/.astro to see it again');
  }
  return render(entry);
};
// The one extraction's output for an entry (scripts/build/rehype-post-text.mjs): words, headings, sections, read
// blocks, elements, links. Undefined only for a live notebook that failed to render.
export const textOf = async (entry) => (await renderEntry(entry)).remarkPluginFrontmatter.text;

export const allPosts = () => sorted('posts');                    // drafts included
export const listedPosts = async () => (await allPosts()).filter((p) => isListed(p.data));
export const research = () => sorted('research');
export const projects = () => sorted('projects');

// Notes by their post's slug. A note's file name is its post's slug, and the post must build.
export async function notesBySlug() {
  const built = new Set((await allPosts()).filter((p) => !p.data.draft).map(slugOf));
  const notes = await sorted('notes');
  for (const n of notes) {
    if (n.data.post !== n.id) throw new Error(`src/content/notes/${n.id}.md: post is "${n.data.post}", not its file name`);
    if (!built.has(n.id)) throw new Error(`src/content/notes/${n.id}.md: no post builds /ledger/${n.id}/`);
  }
  return new Map(notes.map((n) => [n.id, n]));
}
