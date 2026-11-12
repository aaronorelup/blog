// The tea room's picks (src/data/tea-picks.json): what the page's own reader (src/lib/tea-picks.js) refuses fails
// here, at deploy level, in about a second; a shelf showing the live notebook or a machine gone from the lab only
// warns. A repo without the file has nothing to check.
import path from 'node:path';
import { TEA_CHAPTERS } from '../../src/data/tea-chapters.js';
import { PICKS_FILE, readPicks } from '../../src/lib/tea-picks.js';

export default function teaPicks(repo, report) {
  if (!repo.exists(PICKS_FILE)) return;
  let doc;
  try {
    doc = JSON.parse(repo.read(PICKS_FILE));
  } catch (error) {
    report(PICKS_FILE, null, `this isn't valid JSON: ${error.message}`, 'deploy');
    return;
  }
  const site = {
    posts: repo.posts.filter((p) => !p.yamlError).map((p) => ({ id: p.slug, data: p.data })),
    projects: new Set(repo.projects.map((p) => path.basename(p.file, '.yaml'))),
    hasMachine: (name) => repo.exists(`public/labs/teardown/${name}`),
  };
  try {
    const { warnings } = readPicks(doc, TEA_CHAPTERS, site);
    for (const w of warnings) report(PICKS_FILE, null, w, 'warn');
  } catch (error) {
    if (!error.reason) throw error;
    report(PICKS_FILE, null, `${error.reason} (the page could not be built from it)`, 'deploy');
  }
}
