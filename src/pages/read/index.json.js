// /read/index.json: { voice, model, format, settings, posts: { slug: { hash, chars, rank } } } for the posts read-aloud
// records (src/lib/read/posts.js: listed, never a live notebook). Rank 0 is voiced first. worker/read/step.js reads the
// voice from here too, so the build and the cron can never disagree.
import { VOICE } from '../../data/voice.js';
import { allPosts, slugOf, textOf } from '../../lib/content.js';
import { ranked } from '../../lib/read/posts.js';
import { postHash, sectionsOf } from '../../lib/read/sections.js';

export async function GET() {
  const posts = {};
  for (const [rank, post] of ranked(await allPosts()).entries()) {
    const sections = sectionsOf(post.data, await textOf(post));
    posts[slugOf(post)] = { hash: postHash(sections), chars: sections.reduce((n, s) => n + s.chars, 0), rank };
  }
  const { id: voice, model, format, settings } = VOICE;
  return new Response(JSON.stringify({ voice, model, format, settings, posts }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
