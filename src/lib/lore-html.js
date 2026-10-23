// HTML for the pieces every lore page repeats thousands of times (a line, its tier chip, an episode chip), as
// plain strings: a sheet like Rosie's has 160 lines and the egg atlas over a thousand, so they are written once
// here and set with set:html rather than rendered as one Astro component each. Every value is escaped.
import {
  TIERS, TIER_ORDER, md, esc, editHref, bulletHref, urlOf, titleOf, epVars, entity, UNRELEASED, epNumber, isEpisodeCode,
} from './lore.js';

/** The tier mark: one <svg> using the page's symbol (#tm-<tier>, defined once by LorePage). */
export const mark = (tier, cls = 'tm') => `<svg class="${cls} t-${tier}" aria-hidden="true" focusable="false"><use href="#tm-${tier}"></use></svg>`;

/** The tier chip: shape + label. */
export const chip = (tier, { big = false, label, title = true } = {}) =>
  `<span class="tc t-${tier}${big ? ' is-big' : ''}"${title ? ` title="${esc(TIERS[tier]?.name || tier)}: ${esc(TIERS[tier]?.what || '')}"` : ''}>${mark(tier)}${esc(label || TIERS[tier]?.label || tier)}</span>`;

/** An episode chip, in the episode's colour; an unreleased one is dashed and says so. */
export function epChip(code, { big = false, cls = '', link = true } = {}) {
  if (!isEpisodeCode(code)) return '';
  const e = entity(code);
  const un = UNRELEASED.has(code);
  const title = `Episode ${epNumber(code)}${e ? `: ${e.title}` : ''}${un ? ' (not released yet)' : ''}`;
  const tag = link ? 'a' : 'span';
  return `<${tag} class="epc${un ? ' is-unrel' : ''}${big ? ' is-big' : ''}${cls ? ' ' + cls : ''}"${link ? ` href="${urlOf(code)}"` : ''} style="${epVars(code)}" title="${esc(title)}">${esc(code)}</${tag}>`;
}

/**
 * One lore line.
 *  showEp:   lead with its episode code (off when the list is already grouped by episode)
 *  showYear: lead with its year
 *  on:       name the entity it belongs to ("on Rosie"), for lists that gather lines from many files
 *  anchor:   give it its #L<line> id (only where the line is shown on its own file's page)
 *  link:     make the source link to the line's own page (for gathered lists)
 */
export function bulletHtml(b, { showEp = true, showYear = true, on = null, anchor = true, link = false, extraClass = '', attrs = '' } = {}) {
  const lead = [];
  if (showEp && b.ep) lead.push(epChip(b.ep));
  if (showYear && b.year) lead.push(`<span class="lb-lead">${esc(b.year.text)}</span>`);
  const src = b.src ? `<span class="src">{${esc(b.src)}}</span>` : '';
  const onHtml = on ? ` <span class="on">on <a href="${link ? bulletHref(b) : urlOf(on) || bulletHref(b)}">${esc(titleOf(on))}</a></span>` : '';
  const self = link && !on ? ` <a class="ed" href="${bulletHref(b)}">open</a>` : '';
  const edit = `<a class="ed" href="${editHref(b)}" rel="nofollow">edit</a>`;
  const eps = b.ep ? ` data-ep="${esc(b.ep)}"` : '';
  return (
    `<li class="lb t-${b.tier}${extraClass ? ' ' + extraClass : ''}"${anchor ? ` id="L${b.line}"` : ''}${eps}${attrs ? ' ' + attrs : ''}>` +
    chip(b.tier, { title: false }) +
    `<span class="lb-b">${lead.join(' ')}${lead.length ? ' ' : ''}${md(b.text)} <span class="lb-m">${src}${onHtml}${self} ${edit}</span></span>` +
    `</li>`
  );
}

export const listHtml = (bullets, opts) => bullets.map((b) => bulletHtml(b, opts)).join('');

/** A tier bar: one segment per tier, its width the share of lines. */
export function tierBar(counts, { big = false } = {}) {
  const total = TIER_ORDER.reduce((n, t) => n + (counts[t] || 0), 0);
  if (!total) return '';
  const title = TIER_ORDER.filter((t) => counts[t]).map((t) => `${counts[t]} ${TIERS[t].label.toLowerCase()}`).join(' · ');
  return (
    `<span class="tbar${big ? ' is-big' : ''}" role="img" aria-label="${esc(title)}" title="${esc(title)}">` +
    TIER_ORDER.filter((t) => counts[t]).map((t) => `<i class="t-${t}" style="flex:${counts[t]}"></i>`).join('') +
    `</span>`
  );
}
export const zeroTiers = (counts) => TIER_ORDER.filter((t) => !counts[t]).join(' ');

/** An image's status badge. */
export function badge(status) {
  const label = { used: 'Used', steel: 'Steel', placeholder: 'Placeholder' }[status] || 'Untagged';
  return `<span class="ibadge is-${esc(status || 'none')}">${label}</span>`;
}

/** The marks of a list of lines, one per line, strongest tier first (for matrices and swimlanes). */
export function marks(bullets, max = 12) {
  const order = { steel: 0, fact: 1, egg: 2, running: 3, idea: 4, open: 5 };
  const sorted = [...bullets].sort((a, b) => order[a.tier] - order[b.tier]);
  return sorted.slice(0, max).map((b) => mark(b.tier, 'mk')).join('');
}
