// The tea room's picks (src/data/tea-picks.json): what the page's own reader (src/lib/tea-picks.js) refuses fails
// here, at deploy level, in about a second. More picks than a shelf shows is a warning; the live notebook on a shelf
// (shown, or left out because it can't be) and a machine gone from the lab only warn, even under --strict. A repo without the file has nothing to check. npm run tea:picks reads the same site.
import path from 'node:path';
import { TEA_CHAPTERS } from '../../src/data/tea-chapters.js';
import { PICKS_FILE, readPicks } from '../../src/lib/tea-picks.js';

// What readPicks() checks the picks against, from the files: every post (it keeps the listed ones), apart from those
// whose frontmatter the frontmatter rule refuses (no valid YAML, id or date: no ledger order holds them), the project
// files and their sections, the teardown lab's folders.
const readable = (p) => !p.yamlError && typeof p.data.id === 'string' && !Number.isNaN(new Date(p.data.date).getTime());
export const picksSite = (repo) => ({
  posts: repo.posts.filter(readable).map((p) => ({ id: p.slug, data: p.data })),
  unreadable: new Set(repo.posts.filter((p) => !readable(p)).map((p) => p.slug)),
  projects: new Map(repo.projects.map((p) => [path.basename(p.file, '.yaml'), p.data.section])),
  hasMachine: (name) => repo.exists(`public/labs/teardown/${name}`),
});

export default function teaPicks(repo, report) {
  if (!repo.exists(PICKS_FILE)) return;
  let doc;
  try {
    doc = JSON.parse(repo.read(PICKS_FILE));
  } catch (error) {
    report(PICKS_FILE, null, `this isn't valid JSON: ${error.message}`, 'deploy');
    return;
  }
  try {
    const { warnings } = readPicks(doc, TEA_CHAPTERS, picksSite(repo));
    for (const w of warnings) report(PICKS_FILE, null, w.text, w.live ? 'live' : 'warn');
  } catch (error) {
    if (!error.reason) throw error;
    report(PICKS_FILE, null, `${error.reason} (the page could not be built from it)`, 'deploy');
  }
}
