// /research/<slug>.md: a research document as raw Markdown, for agents (its page links it as `raw`). Written from
// the same file as the rendered page: a header from the frontmatter, then the body as it is.
import { research, slugOf } from '../../lib/content.js';

export async function getStaticPaths() {
  return (await research()).map((doc) => ({ params: { slug: slugOf(doc) }, props: { doc } }));
}

export function GET({ props: { doc } }) {
  const { title, summary, provenance } = doc.data;
  const url = `https://aaronorelup.com/research/${slugOf(doc)}/`;
  const head = `<!-- ${provenance ? `${provenance} ` : ''}Rendered version: ${url} -->\n\n# ${title}\n\n*${summary}*\n`;
  return new Response(`${head}\n${doc.body.replace(/\n?$/, '\n')}`, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
