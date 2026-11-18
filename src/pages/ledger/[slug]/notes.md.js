// /ledger/<slug>/notes.md: a notes page as Markdown, for agents (lib/agent-text.js notesTwin), only beside a post that
// has a twin itself: listed, and no live notebook.
import { listedPosts, notesBySlug } from '../../../lib/content.js';
import { notesTwin, twinNotes } from '../../../lib/agent-text.js';

export async function getStaticPaths() {
  return twinNotes(await listedPosts(), await notesBySlug())
    .map(([post, note]) => ({ params: { slug: post.id }, props: { post, note } }));
}

export function GET({ props: { post, note } }) {
  return new Response(notesTwin(note, post), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
