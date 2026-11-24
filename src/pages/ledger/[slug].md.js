// /ledger/<slug>.md: a listed post as Markdown, for agents (lib/agent-text.js postTwin): a header from its frontmatter
// and card, then its body without comments and with absolute links. Never an unlisted post, a draft or a live notebook.
import { cardOf } from '../../lib/cards.js';
import { listedPosts } from '../../lib/content.js';
import { postTwin, twinPosts } from '../../lib/agent-text.js';

export async function getStaticPaths() {
  return twinPosts(await listedPosts()).map((post) => ({ params: { slug: post.id }, props: { post } }));
}

export function GET({ props: { post } }) {
  return new Response(postTwin(post, cardOf(post)), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
