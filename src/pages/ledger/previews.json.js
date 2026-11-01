// /ledger/previews.json: the text of every hover card, in one file. src/scripts/cards/data.js fetches it once:
// while the browser is idle on a device that can hover, so a card never waits on the network, or when a search
// or an answer needs titles and icons. PREVIEWS.md is the spec. icon: the 96 px file, shown when there's no still.
//
// Listed posts only (isListed): an unlisted post must not surface in a card any more than in
// a list. A post without a `preview:` gets its opening lines instead, and the build says so.
// Its media files are checked before the build, by scripts/check/assets.mjs.
import { listedPosts, slugOf } from '../../lib/content.js';
import { cardOf } from '../../lib/cards.js';
import { iconFor } from '../../lib/icons.js';
import { plain, readingMinutes } from '../../lib/text/plain.js';

const EXCERPT_CHARS = 280;
let warned = false;

export async function GET() {
  const out = {};
  const missing = [];

  for (const post of await listedPosts()) {
    const { id, title, ...face } = cardOf(post);
    const icon = iconFor(post)?.s96;
    const card = { id, title, topic: post.data.topic, mins: readingMinutes(post.body), ...(icon && { icon }), ...face };
    if (!post.data.preview) {
      card.excerpt = excerpt(post.body);
      missing.push(id);
    }
    out[slugOf(post)] = card;
  }

  if (missing.length && !warned) {
    warned = true;
    console.warn(`[previews] ${missing.length} listed post(s) have no preview, so their card is just the opening lines: ` +
      `${missing.sort().join(', ')}. See PREVIEWS.md.`);
  }

  return new Response(JSON.stringify({ posts: out }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

// The fallback card: the post's first paragraphs of prose, cut at a sentence end.
function excerpt(body) {
  const paras = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p && !/^(<|#|>|!\[|\||```|-{3,}|\* |- |\d+\. )/.test(p))
    .map((p) => plain(p).replace(/\s+/g, ' ').trim())
    .filter((p) => p.length > 40);
  let text = '';
  for (const p of paras) {
    text = text ? `${text} ${p}` : p;
    if (text.length >= EXCERPT_CHARS * 0.6) break;
  }
  if (text.length <= EXCERPT_CHARS) return text;
  const cut = text.slice(0, EXCERPT_CHARS);
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '), cut.lastIndexOf('! '));
  return end > EXCERPT_CHARS * 0.5 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, '') + '…';
}
