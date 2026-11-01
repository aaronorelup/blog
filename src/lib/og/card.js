// A post's share card (og:image): 1200×630 JPEG on the night ground, its icon (or its topic's glyph) on the left; its
// id and topic, the title (Zen Maru Gothic 700 through sharp's Pango text input, word-wrapped) and the verdict stamped
// on the right. Build time only; lib/og/image.js decides when to draw one. The colours are tokens.css's night values.
import sharp from 'sharp';
import { OG } from '../../data/limits.js';
import { GLYPHS } from '../glyphs.js';

const { width: W, height: H } = OG;
const PAD = 80, ICON = 256, GAP = 56;
const COL = PAD + ICON + GAP;                 // the text column's left edge
const TEXT_W = W - COL - PAD + 16;            // 760 px
const C = { bg: '#151726', tile: '#201F2C', head: '#F0C06A', gold: '#C9A227', accent: '#E2795C', quiet: '#8E8375' };
const ROUND = `<svg width="${ICON}" height="${ICON}"><rect width="${ICON}" height="${ICON}" rx="28"/></svg>`;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// One run of text as an RGBA PNG; height given: the size that fits it.
async function text(fontfile, markup, size, height) {
  const { data, info } = await sharp({
    text: { text: markup, fontfile, font: `Zen Maru Gothic ${size}`, width: TEXT_W, wrap: 'word-char', rgba: true,
      ...(height ? { height } : { dpi: 72 }) },
  }).png().toBuffer({ resolveWithObject: true });
  return { input: data, w: info.width, h: info.height };
}

async function title(fontfile, s) {
  const markup = `<span foreground="${C.head}">${esc(s)}</span>`;
  const t = await text(fontfile, markup, s.length <= 45 ? 64 : s.length <= 70 ? 54 : 46);
  return t.h <= 300 ? t : text(fontfile, markup, 46, 300);
}

async function stamp(fontfile, s) {
  const t = await text(fontfile, `<span foreground="${C.accent}" letter_spacing="2400">${esc(s.toUpperCase())}</span>`, 22);
  const w = t.w + 36, h = t.h + 18;
  const box = `<svg width="${w}" height="${h}"><rect x="1.5" y="1.5" width="${w - 3}" height="${h - 3}" rx="8" fill="none"
    stroke="${C.accent}" stroke-width="3"/></svg>`;
  return { w, h, layers: [{ input: Buffer.from(box), left: 0, top: 0 }, { input: t.input, left: 18, top: 10 }] };
}

const glyph = (name) => Buffer.from(`<svg width="${ICON}" height="${ICON}" viewBox="0 0 ${ICON} ${ICON}">
  <rect width="${ICON}" height="${ICON}" rx="28" fill="${C.tile}"/>
  <g transform="translate(64 64) scale(8)" fill="none" stroke="${C.gold}" stroke-width="1.1" stroke-linecap="round"
    stroke-linejoin="round"><path d="${GLYPHS[name]}"/></g></svg>`);

// card: { fontfile, eyebrow, title, verdict?, icon? (a 256 px image's bytes), glyph (a GLYPHS name) } → JPEG bytes.
export async function renderCard(card) {
  const { fontfile } = card;
  const eyebrow = await text(fontfile, `<span foreground="${C.gold}" letter_spacing="3000">${esc(card.eyebrow.toUpperCase())}</span>`, 22);
  const head = await title(fontfile, card.title);
  const verdict = card.verdict && await stamp(fontfile, card.verdict);
  const blockH = eyebrow.h + 22 + head.h + (verdict ? 30 + verdict.h : 0);
  let y = Math.round((H - blockH) / 2);
  const layers = [{ input: eyebrow.input, left: COL, top: y }, { input: head.input, left: COL, top: (y += eyebrow.h + 22) }];
  if (verdict) for (const l of verdict.layers) layers.push({ ...l, left: COL + l.left, top: y + head.h + 30 + l.top });
  const icon = card.icon
    ? await sharp(card.icon).resize(ICON, ICON).composite([{ input: Buffer.from(ROUND), blend: 'dest-in' }]).png().toBuffer()
    : glyph(card.glyph);
  const site = await text(fontfile, `<span foreground="${C.quiet}">aaronorelup.com</span>`, 20);
  layers.push({ input: icon, left: PAD, top: (H - ICON) / 2 }, { input: site.input, left: W - PAD - site.w, top: H - 56 - Math.round(site.h / 2) });
  return sharp({ create: { width: W, height: H, channels: 3, background: C.bg } })
    .composite(layers).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
}
