// /ask/manifest.json: RAG Goobie's map of /ask/*.txt (src/lib/ask/manifest.js), which worker/ask/corpus.js reads.
import { askBuild } from '../../lib/ask/build.js';

export async function GET() {
  return new Response(JSON.stringify((await askBuild()).manifest), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
