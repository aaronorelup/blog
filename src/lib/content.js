// The only importer of astro:content (with content.config.ts and src/schemas/). Collections come back
// sorted by slug, because Astro 5 returns them in no fixed order. entry.id is the file name: the URL slug.
import { getCollection, render } from 'astro:content';
import { isListed } from './posts.js';

const bySlug = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
const sorted = async (name) => (await getCollection(name)).sort(bySlug);

export const slugOf = (entry) => entry.id;
export const renderEntry = (entry) => render(entry);

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
