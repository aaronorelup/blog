// What the box writes into [data-search-out]: search results, and the ledger-style rows of Goobie's related posts,
// drawn from the card data (cards/data.js: title, icon, topic, minutes). A result links to its passage,
// /ledger/<slug>/?hl=<the query's words>&hs=<the passage's first 8 words>#<heading>, which post/highlight.js marks.
import { TOPICS } from '../../data/taxonomy.js';
import { GLYPHS } from '../../lib/glyphs.js';
import { load } from '../cards/data.js';
import { termsOf } from './terms.js';

const SLUG = /^\/ledger\/([^/]+)\/(notes\/)?/;
const SVG = 'http://www.w3.org/2000/svg';

export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, v);
  el.append(...kids);
  return el;
}

// A passage's address on its post (anchor '' is the top of the page).
export function deepLink(path, anchor, q, passage = '') {
  const params = new URLSearchParams();
  const terms = termsOf(q).join(' ');
  if (terms) params.set('hl', terms);
  if (passage) params.set('hs', passage.split(/\s+/).filter(Boolean).slice(0, 8).join(' '));
  const query = String(params);   // not params.size: Safari before 17 has none, and every link would lose its query
  return `${path}${query ? `?${query}` : ''}${anchor ? `#${anchor}` : ''}`;
}

function icon(card) {
  if (card.icon) return h('img', { class: 'row-icon', src: card.icon, width: 40, height: 40, alt: '', decoding: 'async' });
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('class', 'glyph');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(SVG, 'path');
  path.setAttribute('d', GLYPHS[TOPICS[card.topic].glyph]);
  svg.append(path);
  return h('span', { class: 'row-icon is-glyph' }, svg);
}

// A Pagefind excerpt is escaped text with <mark>s: kept as text and marks, nothing else.
function excerpt(html) {
  const body = new DOMParser().parseFromString(html, 'text/html').body;
  const parts = [...body.childNodes].map((n) => (n.nodeName === 'MARK' ? h('mark', {}, n.textContent) : n.textContent));
  return { parts, text: body.textContent };
}

// One related post, as a ledger row: icon, title, topic and minutes.
export function relatedRow(slug, card) {
  return h('li', { class: 'row' }, icon(card), h('a', { class: 'row-link', href: `/ledger/${slug}/` }, card.title),
    h('p', { class: 'row-meta' }, `${TOPICS[card.topic].label} · ${card.mins} min`));
}

export async function showResults(out, hits, q) {
  const cards = await load();
  if (!cards) return;
  const rows = hits.filter((hit) => cards[hit.path.match(SLUG)[1]]).map((hit) => {
    const [, slug, notes] = hit.path.match(SLUG);
    const card = cards[slug];
    const { parts, text } = hit.html ? excerpt(hit.html) : { parts: [hit.text], text: hit.text };
    const where = [hit.heading && `in: ${hit.heading}`, notes && 'the full making-of'].filter(Boolean).join(' · ');
    return h('li', { class: 'row result' }, icon(card),
      h('a', { class: 'row-link', href: deepLink(hit.path, hit.anchor, q, text) }, card.title),
      where ? h('p', { class: 'row-meta' }, where) : '',
      h('p', { class: 'result-text' }, ...parts));
  });
  out.replaceChildren(rows.length
    ? h('ol', { class: 'rows results', 'aria-label': `Results for ${q}` }, ...rows)
    : h('p', { class: 'search-none' }, 'Nothing in the ledger matches that yet.'));
  performance.mark('search:results');
}
