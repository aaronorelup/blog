// /ledger/previews.json: the text of every hover card, in one file. src/scripts/ledger-preview.js
// fetches it once, while the browser is idle and only on a device that can hover, so a card
// never waits on the network. PREVIEWS.md is the spec.
//
// Listed posts only (isListed): an unlisted post must not surface in a card any more than in
// a list. A post without a `preview:` gets its opening lines instead, and the build says so.
import fs from 'node:fs';
import path from 'node:path';
import { getCollection } from 'astro:content';
import { isListed } from '../../data/listed.js';
import { PREVIEW_MEDIA } from '../../data/preview-budget.js';

// Set by the integration in astro.config.mjs: the cwd is often the folder above the project.
const PUBLIC_DIR = typeof __PUBLIC_DIR__ === 'string' ? __PUBLIC_DIR__ : path.join(process.cwd(), 'public');
const WORDS_PER_MINUTE = 230;
const EXCERPT_CHARS = 280;
let warned = false;

export async function GET() {
  const posts = await getCollection('posts', ({ data }) => isListed(data));
  const out = {};
  const missing = [];

  for (const post of posts) {
    const { id, title, preview } = post.data;
    const card = { id, title, mins: readingMinutes(post.body) };
    if (preview) {
      if (preview.verdict) card.verdict = preview.verdict;
      card.takeaway = preview.takeaway;
      if (preview.points.length) card.points = preview.points;
      if (preview.image) {
        checkMedia(id, preview.image, PREVIEW_MEDIA.stillCap);
        card.image = preview.image;
        card.alt = preview.alt || '';
      }
      if (preview.loop) {
        checkMedia(id, preview.loop, PREVIEW_MEDIA.loopCap);
        card.loop = preview.loop;
      }
    } else {
      card.excerpt = excerpt(post.body);
      missing.push(id);
    }
    out[post.slug] = card;
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

// A missing file would be a broken picture in the card, and an oversized one is exactly the slow
// hover this budget exists to prevent. Both stop the build, like an undefined series key does.
function checkMedia(id, src, cap) {
  const file = path.join(PUBLIC_DIR, src);
  if (!fs.existsSync(file)) throw new Error(`${id}: preview media ${src} doesn't exist under public/`);
  const bytes = fs.statSync(file).size;
  if (bytes > cap) {
    throw new Error(`${id}: preview media ${src} is ${(bytes / 1024).toFixed(1)} KB, over the ` +
      `${cap / 1024} KB cap. Remake it with scripts/preview-media.mjs (PREVIEWS.md).`);
  }
}

// Markdown and HTML down to the words a reader reads. Component markup carries a lot of
// attribute text that nobody reads, so tags go entirely.
function plain(md) {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~]+/g, '')
    .replace(/&[a-z]+;|&#\d+;/g, ' ');
}

function readingMinutes(body) {
  const words = plain(body).split(/\s+/).filter((w) => /[a-z0-9]/i.test(w)).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
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
