// /llms-full.txt: every listed post's Markdown twin in ledger order, each followed by its notes twin; a live
// notebook by its title, address and summary only (lib/agent-text.js llmsFullTxt).
import { cardOf } from '../lib/cards.js';
import { listedPosts, notesBySlug } from '../lib/content.js';
import { llmsFullTxt } from '../lib/agent-text.js';

export async function GET() {
  const text = llmsFullTxt({ posts: await listedPosts(), notes: await notesBySlug(), cardOf });
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
