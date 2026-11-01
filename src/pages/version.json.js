// Which build is live: the commit and branch it was built from, when, and the newest listed post.
// On 2026-10-08 a branch cut from August was deployed over the site and nothing on the site said
// so; the only tell was that the pages looked old. Now one request answers it:
//   curl -s https://aaronorelup.com/version.json
// and the commit should be the one you just pushed to main. Workers Builds sets WORKERS_CI_*;
// a local build reads git instead, and says "local" (both from lib/build.js).
import { COMMIT, BRANCH } from '../lib/build.js';
import { listedPosts, slugOf } from '../lib/content.js';
import { isoDay } from '../lib/dates.js';

export async function GET() {
  const posts = (await listedPosts())
    .sort((a, b) => b.data.id.localeCompare(a.data.id, 'en', { numeric: true }));
  const newest = posts[0];
  const body = {
    commit: COMMIT,
    branch: BRANCH,
    built: new Date().toISOString().replace(/\.\d+Z$/, 'Z'),
    posts: posts.length,
    newest: newest ? { id: newest.data.id, slug: slugOf(newest), date: isoDay(newest.data.date) } : null,
  };
  return new Response(JSON.stringify(body, null, 2) + '\n', {
    headers: { 'Content-Type': 'application/json' },
  });
}
