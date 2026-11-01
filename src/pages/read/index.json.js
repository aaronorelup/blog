// /read/index.json: { voice, model, format, settings, posts: { slug: { hash, chars, rank } } } for the listed posts,
// live notebooks left out (never recorded). Rank 0 is voiced first: Start here, then newest. worker/read/step.js reads
// the voice from here too, so the build and the cron can never disagree.
import { isLive } from '../../data/exempt.js';
import { START_HERE } from '../../data/picks.js';
import { VOICE } from '../../data/voice.js';
import { listedPosts, renderEntry, slugOf } from '../../lib/content.js';
import { ledgerOrder } from '../../lib/posts.js';
import { postHash, sectionsOf } from '../../lib/read/sections.js';

export async function GET() {
  const listed = ledgerOrder((await listedPosts()).filter((p) => !isLive(p.id)));
  const picked = (p) => (START_HERE.includes(slugOf(p)) ? START_HERE.indexOf(slugOf(p)) : START_HERE.length);
  const posts = {};
  for (const [rank, post] of listed.sort((a, b) => picked(a) - picked(b)).entries()) {
    const sections = sectionsOf(post.data, (await renderEntry(post)).remarkPluginFrontmatter.text);
    posts[slugOf(post)] = { hash: postHash(sections), chars: sections.reduce((n, s) => n + s.chars, 0), rank };
  }
  const { id: voice, model, format, settings } = VOICE;
  return new Response(JSON.stringify({ voice, model, format, settings, posts }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
