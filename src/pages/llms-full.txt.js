// /llms-full.txt: every listed post's Markdown twin in ledger order, each followed by its notes twin; a live
// notebook by its title, address and summary only (lib/agent-text.js llmsFullTxt, through lib/agent-corpus.js).
import { corpusText } from '../lib/agent-corpus.js';

export async function GET() {
  return new Response(await corpusText(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
