// A listed post's share card at build time: drawn once a build by lib/og/card.js, kept in node_modules/.astro/og/
// (Workers Builds restores that folder between builds when its build cache is on) and named /og/<slug>.jpg?v=<h8>,
// h8 the hash of everything drawn on it, so X fetches the card again when any of it changes. A card that fails to
// draw fails the build (STRICT, since a main build showed real cards), except a live notebook's, which logs and
// shares public/og/default.jpg.
// Read by pages/ledger/[slug].astro (the meta tag) and pages/og/[slug].jpg.js (the file).
import fs from 'node:fs';
import path from 'node:path';
import { isLive } from '../../data/exempt.js';
import { OG } from '../../data/limits.js';
import { TOPICS } from '../../data/taxonomy.js';
import { cardOf } from '../cards.js';
import { slugOf } from '../content.js';
import { iconFor } from '../icons.js';
import { PUBLIC_DIR, publicFile } from '../paths.js';
import { sha256hex, short } from '../text/hash.js';
import { renderCard } from './card.js';

const STRICT = true;
const V = 1;   // the card's design: bump it to redraw every card
const ROOT = path.dirname(path.resolve(PUBLIC_DIR));
const FONT = path.join(ROOT, 'src/assets/fonts/zen-maru-gothic-700-latin.ttf');
const CACHE = path.join(ROOT, 'node_modules/.astro/og');
const DEFAULT = '/og/default.jpg';
const drawn = new Map();

// → { path, jpg }: the card's address and bytes, or the default card's address and no bytes.
export function ogImage(post) {
  if (!drawn.has(post.id)) drawn.set(post.id, draw(post));
  return drawn.get(post.id);
}

async function draw(post) {
  const { id, title, topic } = post.data;
  const icon = iconFor(post);
  const card = { fontfile: FONT, eyebrow: `${id} · ${TOPICS[topic].label}`, title, verdict: cardOf(post).verdict,
    icon: icon && fs.readFileSync(publicFile(icon.s256)), glyph: TOPICS[topic].glyph };
  const h8 = short(sha256hex(JSON.stringify([V, card.eyebrow, title, card.verdict, card.glyph, card.icon && sha256hex(card.icon)])));
  const file = path.join(CACHE, `${h8}.jpg`);
  const named = (jpg) => ({ path: `/og/${slugOf(post)}.jpg?v=${h8}`, jpg });
  try {
    if (fs.existsSync(file)) return named(fs.readFileSync(file));
    const jpg = await renderCard(card);
    if (jpg.length > OG.cap) throw new Error(`${jpg.length} bytes, over the ${OG.cap}-byte cap`);
    fs.mkdirSync(CACHE, { recursive: true });
    fs.writeFileSync(file, jpg);
    return named(jpg);
  } catch (e) {
    if (STRICT && !isLive(id)) throw new Error(`the og image of ${id}: ${e.message}`);
    console.warn(`[og] ${id}: no card (${e.message}), so it shares ${DEFAULT}`);
    return { path: DEFAULT, jpg: null };
  }
}
