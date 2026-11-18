// /llms.txt (llmstxt.org): the site's index for agents, every listed post, notes page and research document by its
// Markdown twin, and the machine endpoints (lib/agent-text.js llmsTxt). contracts.mjs checks every link resolves.
import { cardOf } from '../lib/cards.js';
import { listedPosts, notesBySlug, research } from '../lib/content.js';
import { llmsTxt } from '../lib/agent-text.js';

export async function GET() {
  const text = llmsTxt({ posts: await listedPosts(), notes: await notesBySlug(), research: await research(), cardOf });
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
