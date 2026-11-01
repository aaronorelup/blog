// /ask/<pack|doc|catalog>-<h8>.txt: one piece of RAG Goobie's prompt, a JSON string's body without its quotes
// (src/lib/ask/blocks.js fragment()), which worker/ask/body.js puts into DeepSeek's request as it is.
import { askBuild } from '../../lib/ask/build.js';

export async function getStaticPaths() {
  const { files } = await askBuild();
  return [...files].map(([file, body]) => ({ params: { file: file.slice(0, -4) }, props: { body } }));
}

export const GET = ({ props }) => new Response(props.body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
