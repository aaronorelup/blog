// /search/docs/<kind>-<slug>.json: one search doc, { id, kind, slug, title, voice?, chunks: [{ n, anchor, heading,
// text }] }, which worker/search/sync.js embeds when its hash in /search/manifest.json moves (src/lib/search/chunks.js).
import { docName } from '../../../lib/search/chunks.js';
import { searchDocs } from '../../../lib/search/docs.js';

export async function getStaticPaths() {
  return (await searchDocs()).map((doc) => ({ params: { doc: docName(doc) }, props: { doc } }));
}

export const GET = ({ props }) => new Response(JSON.stringify(props.doc), {
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
});
