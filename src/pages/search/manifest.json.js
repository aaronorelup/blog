// /search/manifest.json: { v, model, live, docs: { '<kind>:<slug>': hash } } for every search doc of this build.
// worker/search/sync.js reads it every minute and re-embeds only the docs whose hash moved (src/lib/search/chunks.js).
import { manifestOf } from '../../lib/search/chunks.js';
import { searchDocs } from '../../lib/search/docs.js';

export async function GET() {
  return new Response(JSON.stringify(manifestOf(await searchDocs())), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
