// /ledger/previews.json: the text of every hover card, in one file. src/scripts/cards/data.js fetches it once:
// while the browser is idle on a device that can hover, so a card never waits on the network, or when a search
// or an answer needs titles and icons. PREVIEWS.md is the spec. icon: the 96 px file, shown when there's no still.
// Listed posts only (isListed): an unlisted post must not surface in a card any more than in a list. Every listed
// post has a preview (src/schemas/post.ts); its media files are checked before the build, by scripts/check/assets.mjs.
import { listedPosts, slugOf, textOf } from '../../lib/content.js';
import { cardOf } from '../../lib/cards.js';
import { iconFor } from '../../lib/icons.js';
import { readingMinutes } from '../../lib/text/minutes.js';

export async function GET() {
  const out = {};

  for (const post of await listedPosts()) {
    const { id, title, ...face } = cardOf(post);
    const icon = iconFor(post)?.s96;
    const mins = readingMinutes((await textOf(post))?.words);
    out[slugOf(post)] = { id, title, topic: post.data.topic, mins, ...(icon && { icon }), ...face };
  }

  return new Response(JSON.stringify({ posts: out }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

