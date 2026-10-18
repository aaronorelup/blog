// What opens under the gate when a pile is picked: a short, honest look inside that pile for the
// current range, and a link to the chapter that goes deeper. Each drawer is plain DOM (screen
// readers get all of it), counted from the RangeView the rest of the page uses, so the drawer
// and the chapter below can never disagree.
import { num, countryIn, list, plural } from '../core/fmt.js';
import { KINDS, DEVICE_LABELS, purposeOf, programBlurb, probeFamily } from '../core/words.js';
import { browserAge } from '../core/browser.js';
import { splitBar } from '../ui/split.js';
import { rankedBars } from '../ui/bars.js';
import { tableTwin, figureTools } from '../ui/table.js';
import { glyphSVG, arrowSVG } from '../ui/glyph.js';
// The machines chapter's own grouping, so a drawer's rows and its "Other …" line add up to the
// pile exactly as the chapter's tabs do, and the two places never print different numbers.
import { ownersFor, staleRows } from '../machines/model.js';

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

// A sentence with a bold lead: the bold part alone carries the point (the brand's "skimmable by
// bold" rule).
function lead(bold, rest) {
  const p = el('p', 'st-gate-dlead');
  const b = el('strong', null, bold);
  p.append(b);
  if (rest) p.append(' ' + rest);
  return p;
}

function moreLink(label, href, dir = 'down') {
  const a = el('a', 'st-gate-dmore');
  a.href = href;
  a.append(el('span', null, label), arrowSVG(dir));
  return a;
}

function shell(kind, title) {
  const wrap = el('div', 'st-gate-drawer');
  wrap.dataset.kind = kind;
  const head = el('div', 'st-gate-dhead');
  const eb = el('p', 'st-gate-deb');
  eb.append(glyphSVG(kind, { size: 11 }), ' ' + KINDS[kind].eyebrow);
  const h = el('h3', 'st-gate-dtitle', title);
  head.append(eb, h);
  wrap.append(head);
  return wrap;
}

function tools(wrap, ctx, kind, spec) {
  const t = tableTwin(spec);
  figureTools(wrap, { table: t, route: { ch: 'top', sub: kind, item: null }, router: ctx.router, csv: false });
}

// Every bar value carries its unit. The pile above counts pages, while these rows count pages,
// files (programs) or knocks (scanners), and a bare "2,731" under a pile of 1,973 reads as
// bigger than the whole pile.
const withUnit = (n, one, many) => `${num(n)} ${plural(n, one, many)}`;

const foldTop = (rows, n) => {
  const sorted = [...rows].filter((r) => r.n > 0).sort((a, b) => b.n - a.n);
  const keep = sorted.slice(0, n);
  const rest = sorted.slice(n).reduce((s, r) => s + r.n, 0);
  return rest > 0 ? [...keep, { key: 'other', n: rest }] : keep;
};

// The place a person page is, in a sentence: "the homepage", "the list of posts", a post's title.
const SITE_WORDS = { '/': 'the homepage', '/ledger/': 'the list of posts', '/courses/': 'the courses page', '/projects/': 'the projects page', '/about/': 'the about page', '/stats/': 'this page' };
function placeNode(row) {
  if (row.kind === 'post') {
    // A post is named by its ledger number with its title in quotes, so the title (often a
    // sentence in Aaron's voice) never reads as this page's own narration.
    const a = el('a', 'st-gate-dlink', row.id ? `${row.id}, “${row.label}”` : `“${row.label}”`);
    a.href = row.href;           // ledger-preview.js gives it the site's hover card on desktop
    return a;
  }
  const word = row.kind === 'site' ? SITE_WORDS[row.href] || SITE_WORDS[row.path] : null;
  if (word) return document.createTextNode(word);
  if (row.kind === 'other') return el('code', 'st-gate-dpath', row.path);
  const a = el('a', 'st-gate-dlink', row.label);
  a.href = row.href;
  return a;
}

function people(view, ctx) {
  const wrap = shell('person', 'Who are they?');
  const body = el('div', 'st-gate-dbody');
  const hi = view.pages.person;
  if (!hi) {
    body.append(lead('No pages went to people ' + view.phrase.long + '.'));
    wrap.append(body);
    return wrap;
  }
  const splits = el('div', 'st-gate-splits');
  const rows = [
    ['On', view.devices.map((r) => ({ key: r.key, label: DEVICE_LABELS[r.key] || r.key, value: r.n }))],
    ['Browser', foldTop(view.browsers, 4).map((r) => ({ key: r.key, label: r.key === 'other' ? 'Other' : r.key, value: r.n }))],
    ['System', foldTop(view.os, 5).map((r) => ({ key: r.key, label: r.key === 'other' ? 'Other' : r.key, value: r.n }))],
  ];
  for (const [label, parts] of rows) {
    if (!parts.length) continue;
    const row = el('div', 'st-gate-split');
    row.append(el('p', 'st-gate-splitlab', label));
    const host = el('div', 'st-gate-splitbar');
    row.append(host);
    splits.append(row);
    // splitBar measures its width, so it is drawn once the drawer is in the page
    requestAnimationFrame(() => splitBar(host, { parts, unit: 'pages', label, other: true }));
  }
  body.append(splits);

  const countries = view.countries.people.filter((r) => r.code !== 'XX' && r.code !== 'T1');
  if (countries.length) {
    const tot = view.countries.people.reduce((s, r) => s + r.n, 0);
    const top = countries.slice(0, 3).map((r) => countryIn(r.code));
    const lead1 = countries.length === 1 ? 'All from ' + top[0] + '.'
      : (countries[0].n / tot >= 0.5 ? 'Mostly from ' : 'Most often from ') + top[0] + ', then ' + list(top.slice(1)) + '.';
    body.append(el('p', 'st-gate-dtext', lead1));
  }
  const paths = view.paths.slice(0, 3);
  if (paths.length) {
    const p = el('p', 'st-gate-dtext');
    p.append('Most opened: ');
    paths.forEach((r, i) => {
      if (i) p.append(i === paths.length - 1 ? ', then ' : ', ');
      p.append(placeNode(r));
    });
    // a quoted title can end in its own full stop; don't add a second
    if (!/[.?!]”?$/.test(p.textContent.trim())) p.append('.');
    body.append(p);
  }
  body.append(el('p', 'st-gate-dhonest', "Aaron browsing his own site is in here; in October he was most of it. Telling him apart would mean looking at internet addresses, and this page never does."));
  const split = view.devices.reduce((s, r) => s + r.n, 0);
  if (view.peopleCoverage < 0.9) {
    body.append(el('p', 'st-gate-dnote', `These splits cover ${num(split)} of the ${num(hi)} pages; the rest weren't broken down.`));
  }
  wrap.append(body);
  const rowsT = [];
  for (const [g, parts] of rows) for (const pr of parts) rowsT.push({ what: `${g}: ${pr.label}`, n: pr.value });
  tools(wrap, ctx, 'person', { caption: `Pages to people ${view.phrase.long}, by device, browser and system`, cols: [{ key: 'what', label: 'Group' }, { key: 'n', label: 'Pages', num: true }], rows: rowsT });
  const links = el('p', 'st-gate-dlinks');
  links.append(moreLink('What they read', '#/read'), moreLink('Where they are', '#/where'), moreLink('When', '#/when'));
  wrap.append(links);
  return wrap;
}

function bots(view, ctx) {
  const wrap = shell('bot', 'Which bots?');
  const body = el('div', 'st-gate-dbody');
  if (!view.pages.bot) {
    body.append(lead('No named bots fetched a page ' + view.phrase.long + '.'));
    wrap.append(body);
    return wrap;
  }
  // The headline counts the bots the drawer can name (ones that fetched a page), so it matches
  // the rows under "Show the numbers". Bots too rare to name and the Worker's own "Other bots"
  // stay in the pile as one "Other named bots" row, never as names.
  const { owners: byOwner, hidden } = ownersFor(view.bots, 'all');
  const shown = byOwner.flatMap((o) => o.bots).filter((b) => b.pages > 0)
    .sort((a, b) => b.pages - a.pages || b.files - a.files || a.name.localeCompare(b.name));
  const named = shown.reduce((s, b) => s + b.pages, 0);
  const other = Math.max(hidden.pages, view.pages.bot - named);
  const owners = new Set(shown.filter((b) => b.owner && b.owner !== 'Unknown').map((b) => b.owner)).size;
  const ai = view.purposes.ai.pages, search = view.purposes.search.pages;
  body.append(lead(
    `${num(shown.length)} named ${plural(shown.length, 'bot', 'bots')}${owners ? ` from ${num(owners)} ${plural(owners, 'company', 'companies')}` : ''}.`,
    `AI bots fetched ${num(ai)} ${plural(ai, 'page', 'pages')}, search engines ${num(search)}.`,
  ));
  const host = el('div', 'st-gate-dbars');
  body.append(host);
  rankedBars(host, {
    rows: shown.slice(0, 5).map((b) => ({ key: b.name, label: b.name, sub: `${b.owner === 'Unknown' ? 'unknown company' : b.owner} · ${purposeOf(b.category).plain}`, value: b.pages, display: withUnit(b.pages, 'page', 'pages') })),
    color: 'var(--st-bot)', unit: 'pages', top: 5, max: shown[0]?.pages, label: 'The busiest named bots, by pages',
  });
  wrap.append(body);
  tools(wrap, ctx, 'bot', {
    caption: `Named bots ${view.phrase.long}, by pages`,
    cols: [{ key: 'name', label: 'Bot' }, { key: 'owner', label: 'Company' }, { key: 'pages', label: 'Pages', num: true }],
    rows: [...shown.map((b) => ({ name: b.name, owner: b.owner, pages: b.pages })),
      ...(other > 0 ? [{ name: 'Other named bots', owner: '', pages: other }] : [])],
  });
  const links = el('p', 'st-gate-dlinks');
  links.append(moreLink('Meet them all', '#/machines/bots'));
  wrap.append(links);
  return wrap;
}

function scanners(view, ctx) {
  const wrap = shell('scanner', 'What were they after?');
  const body = el('div', 'st-gate-dbody');
  const knocks = view.files.scanner;
  if (!knocks) {
    body.append(lead('No scanners knocked ' + view.phrase.long + '.'));
    wrap.append(body);
    return wrap;
  }
  const pr = view.probes;
  const status = new Map(view.probeStatus.map((r) => [String(r.code), r.n]));
  const n404 = status.get('404') || 0, n403 = status.get('403') || 0;
  const doors = pr.rows.length;
  const more = pr.rows.some((r) => r.partial) || pr.shown < pr.total ? '+' : '';
  const said = [n404 ? `${num(n404)} got 'not found'` : null, n403 ? `${num(n403)} 'forbidden'` : null].filter(Boolean);
  // A knock is a file request; the pile above counts pages. Say how the two meet (the Machines
  // tab's wording) so the pile's number shows up in the drawer's first lines.
  const pages = view.pages.scanner || 0;
  const asked = knocks === 1 ? (pages ? 'It asked for a page.' : 'It asked for a file, not a page.')
    : pages === knocks ? 'Every one of them asked for a page.'
    : pages ? `Only ${num(pages)} of them asked for a page; the rest asked for files.`
    : 'None of them asked for a page; they all asked for files.';
  body.append(lead(
    `${num(knocks)} ${plural(knocks, 'knock', 'knocks')} on ${num(doors)}${more} ${plural(doors, 'door', 'doors')} that don't exist.`,
    [asked, said.length ? said.join(', ') + '.' : ''].filter(Boolean).join(' '),
  ));
  const host = el('div', 'st-gate-dbars');
  body.append(host);
  rankedBars(host, {
    rows: pr.rows.slice(0, 5).map((r) => {
      const code = el('code', 'st-gate-dpath', r.path);
      return { key: r.path, label: code, sub: probeFamily(r.path).name, value: r.n, partial: r.partial, display: withUnit(r.n, 'knock', 'knocks') };
    }),
    color: 'var(--st-scanner)', unit: 'knocks', top: 5, label: 'The most-tried doors',
  });
  wrap.append(body);
  tools(wrap, ctx, 'scanner', {
    caption: `Doors scanners tried ${view.phrase.long}`,
    cols: [{ key: 'path', label: 'Address' }, { key: 'family', label: 'Kind' }, { key: 'n', label: 'Knocks', num: true }],
    rows: pr.rows.map((r) => ({ path: r.path, family: probeFamily(r.path).name, n: r.n })),
  });
  const links = el('p', 'st-gate-dlinks');
  links.append(moreLink('See the door wall', '#/machines/scanners'));
  wrap.append(links);
  return wrap;
}

function scripts(view, ctx) {
  const wrap = shell('agent', 'Which programs?');
  const body = el('div', 'st-gate-dbody');
  const files = view.files.agent;
  if (!files) {
    body.append(lead('No programs asked for anything ' + view.phrase.long + '.'));
    wrap.append(body);
    return wrap;
  }
  body.append(lead(`Programs asked for ${num(files)} ${plural(files, 'file', 'files')}.`, `${num(view.pages.agent)} of them were pages.`));
  const host = el('div', 'st-gate-dbars');
  body.append(host);
  const rows = view.agents.filter((r) => r.label !== 'Other programs').slice(0, 5);
  rankedBars(host, {
    rows: rows.map((r) => ({ key: r.label, label: r.label, sub: programBlurb(r.label), value: r.n, display: withUnit(r.n, 'file', 'files') })),
    color: 'var(--st-agent)', unit: 'files', top: 5, max: rows[0]?.n, label: 'The busiest programs, by files',
  });
  wrap.append(body);
  tools(wrap, ctx, 'agent', {
    caption: `Programs ${view.phrase.long}, by files`,
    cols: [{ key: 'label', label: 'Program' }, { key: 'n', label: 'Files', num: true }],
    rows: view.agents.map((r) => ({ label: r.label, n: r.n })),
  });
  const links = el('p', 'st-gate-dlinks');
  links.append(moreLink('Meet the programs', '#/machines/scripts'));
  wrap.append(links);
  return wrap;
}

function stale(view, ctx, through) {
  const wrap = shell('stale', 'Which old browsers?');
  const body = el('div', 'st-gate-dbody');
  const pages = view.pages.stale;
  if (!pages) {
    body.append(lead('No out-of-date browsers came ' + view.phrase.long + '.'));
    wrap.append(body);
    return wrap;
  }
  body.append(lead(`${num(pages)} ${plural(pages, 'page', 'pages')} to browsers over a year out of date.`, 'People do run old browsers; not this many, this often.'));
  const host = el('div', 'st-gate-dbars');
  body.append(host);
  // Labels by pages, ending in "Other old browsers" for whatever the labels don't hold, so the
  // table adds up to the headline.
  const all = staleRows(view.stale, pages);
  const rows = all.filter((r) => !r.folded).slice(0, 5);
  rankedBars(host, {
    rows: rows.map((r) => ({ key: r.label, label: r.label, sub: browserAge(r.label, through)?.tag || '', value: r.n, display: withUnit(r.n, 'page', 'pages') })),
    color: 'var(--st-stale)', unit: 'pages', top: 5, max: rows[0]?.n, label: 'The commonest old browsers, by pages',
  });
  wrap.append(body);
  tools(wrap, ctx, 'stale', {
    caption: `Out-of-date browsers ${view.phrase.long}, by pages`,
    cols: [{ key: 'label', label: 'Browser' }, { key: 'age', label: 'Age' }, { key: 'n', label: 'Pages', num: true }],
    rows: all.map((r) => ({ label: r.label, age: r.folded ? '' : browserAge(r.label, through)?.tag || '', n: r.n })),
  });
  const links = el('p', 'st-gate-dlinks');
  links.append(moreLink('See the costume rack', '#/machines/old'));
  wrap.append(links);
  return wrap;
}

/** Build the drawer for one pile. */
export function drawerFor(kind, view, ctx) {
  switch (kind) {
    case 'person': return people(view, ctx);
    case 'bot': return bots(view, ctx);
    case 'scanner': return scanners(view, ctx);
    case 'agent': return scripts(view, ctx);
    case 'stale': return stale(view, ctx, ctx.snap.through);
    default: return el('div');
  }
}

