// The tea room's chapters from the real site: src/data/tea-picks.json over every post (lib/tea-chapters.js keeps
// only listed ones), the notes, the project cards and the teardown lab's folders. Build time only. A pick the page
// can't show stops the build with the picks' reason; a machine gone from the lab is a printed warning.
import picks from '../data/tea-picks.json';
import { TEA_CHAPTERS } from '../data/tea-chapters.js';
import { allPosts, notesBySlug, projects } from './content.js';
import { inPublic } from './paths.js';
import { isListed } from './posts.js';
import { projectsPage } from './projects.js';
import { resolveChapters } from './tea-chapters.js';

export async function teaChapters({ warn = (w) => console.warn(`[tea] ${w}`) } = {}) {
  const [posts, notes, entries] = await Promise.all([allPosts(), notesBySlug(), projects()]);
  const cards = projectsPage(entries, posts.filter((p) => isListed(p.data))).sections.flatMap((s) => s.cards);
  return resolveChapters(picks, TEA_CHAPTERS, {
    posts, notes, cards, warn, hasMachine: (name) => inPublic(`/labs/teardown/${name}/`),
  });
}
