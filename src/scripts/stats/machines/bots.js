// The library: bots that say who they are, and that Cloudflare has checked. Grouped by the
// company that runs them, because "OpenAI" means something to a newcomer and "OAI-SearchBot"
// doesn't yet. A purpose filter (AI, search engines, SEO tools, link previews) narrows the
// guest book; a company row opens into its bots, and each bot's name opens its card.
//
// Address: #/machines/bots[/ai|search|seo|preview|other|<company>]. A company slug opens that
// row and puts focus on it, so "Does ChatGPT visit?" lands on OpenAI already open.
import { h, clear, prose } from './dom.js';
import { rankRows } from './rows.js';
import {
  PURPOSES, PURPOSE_KEYS, PURPOSE_COLOR, PURPOSE_SHORT, hatch, ownersFor, topOwner, purposeTotalsFor,
  categoryTag, comparedTo, topPlaces, UNKNOWN_OWNER,
} from './model.js';

export function createBots(root, api, tab) {
  const { fmt, words } = api;
  let view = null;
  let filter = 'all';
  let rows = null;
  let split = null;
  let els = {};

  const plain = (category) => {
    try { const p = words.purposeOf(category); return (p && (p.plain || p.label)) || ''; } catch (e) { return ''; }
  };
  const blurb = (name, category) => {
    try { return words.botBlurb(name, category) || plain(category); } catch (e) { return plain(category); }
  };

  function render(v) {
    view = v;
    clear(root);
    els = {};
    root.append(h('p', { class: 'st-mach-eyebrow' }, tab.eyebrow));
    const total = view.pages.bot || 0;
    const anyBots = (view.bots || []).some((b) => b.pages > 0 || b.files > 0);
    if (!total && !anyBots) {
      root.append(prose('st-mach-sent', [`No bots introduced themselves ${view.phrase.long}. Unusual: they usually come every day.`]));
      rows = null; split = null;
      return;
    }
    const sums = totals();
    els.sent = sentence(sums);
    root.append(els.sent);

    // purpose pills: one row, wrapping, each with its count
    els.pills = h('div', { class: 'st-mach-pills', role: 'group', 'aria-label': 'Show bots by what they do' });
    for (const p of PURPOSES) {
      const n = p.key === 'all' ? total : sums[p.key].pages;
      if (p.key !== 'all' && !n) continue;
      els.pills.append(h('button', {
        type: 'button', class: 'st-pill st-mach-pill', 'aria-pressed': String(filter === p.key), dataset: { purpose: p.key },
        onclick: () => setFilter(p.key, true),
      }, p.label, ' ', h('span', { class: 'st-mach-pilln' }, fmt.num(n))));
    }
    root.append(els.pills);

    // the purpose split: one hue, stepped by strength, so it never adds a colour
    els.split = h('div', { class: 'st-mach-split' });
    root.append(els.split);
    const splitBar = api.ctx.ui.split && api.ctx.ui.split.splitBar;
    split = splitBar ? splitBar(els.split, { parts: splitParts(sums), unit: 'pages', other: false }) : null;

    // the guest book
    els.rows = h('div', { class: 'st-mach-book' });
    root.append(els.rows);
    rows = rankRows(els.rows, {
      ranked: api.ranked, rows: bookRows(), color: 'var(--st-bot)', unit: 'pages',
      label: 'Companies whose bots asked for pages', num: api.num, top: 10, reduced: api.reduced,
      open: openOwner,
      // an opened company is part of the address, so Copy link shares it open
      onOpen: (key) => api.replace(key || (filter === 'all' ? null : filter)),
    });

    // where they run from
    const places = topPlaces(view.botCountries);
    if (places.length) {
      const [a, ...rest] = places;
      root.append(prose('st-mach-where', [
        'They run in ', api.term('datacentre', 'data centres'), ', mostly in ', fmt.countryIn(a.code), ` (${fmt.num(a.n)} files)`,
        rest.length ? ', then ' + fmt.list(rest.map((r) => fmt.country(r.code))) : '', '. ',
        h('a', { class: 'st-mach-link', href: '#/where/bots' }, 'See them on the map →'),
      ]));
    }

    // the numbers, as a table
    const tableRows = [];
    for (const o of ownersFor(view.bots, 'all').owners) {
      for (const b of o.bots) tableRows.push({ company: o.label, bot: b.name, does: plain(b.category), pages: b.pages, files: b.files, days: b.daysSeen });
    }
    const other = otherPages();
    if (other > 0) tableRows.push({ company: 'Other named bots', bot: '', does: '', pages: other, files: '', days: '' });
    els.tools = h('div', { class: 'st-mach-figtools' });
    root.append(els.tools);
    api.tools(els.tools, `Named bots ${view.phrase.long}, by company`, [
      { key: 'company', label: 'Company' }, { key: 'bot', label: 'Bot' }, { key: 'does', label: 'What it does' },
      { key: 'pages', label: 'Pages', num: true }, { key: 'files', label: 'Files', num: true }, { key: 'days', label: 'Days seen', num: true },
    ], tableRows, filter === 'all' ? null : filter);
  }

  // The tab's first sentence follows the purpose filter. "Does AI read this site?" lands here with
  // AI on, and a sentence that still led with Exa (a search engine, and not in the list under it)
  // answered a question nobody asked. So a filter's sentence answers for that filter first, and
  // names the top company among the bots the list is showing.
  function sentence(sums) {
    const pages = (n) => `${fmt.num(n)} ${n === 1 ? 'page' : 'pages'}`;
    const ai = sums.ai.pages, search = sums.search.pages;
    const top = topOwner(ownersFor(view.bots, filter).owners);
    const most = () => (top
      ? [' ', { b: top.label }, ` sent the most: ${pages(top.pages)}, from ${fmt.list(top.bots.map((b) => b.name))}.`]
      : []);
    // "AI bots fetched 2,234 pages, nearly twice what search engines did (1,225)"
    const versus = (who, n, them, m) => {
      if (m > 0) {
        const said = comparedTo(n / m, fmt.times);
        return said ? `${who} fetched ${pages(n)}, ${said} ${them} did (${fmt.num(m)})` : `${who} fetched ${pages(n)}`;
      }
      return `${who} fetched ${pages(n)}; ${them} fetched none`;
    };
    let parts = [];
    if (filter === 'ai') {
      parts = ai > 0
        ? [`Yes. ${versus('AI bots', ai, 'search engines', search)}.`, ...most()]
        : [`No AI bot asked for a page ${view.phrase.long}.`];
    } else if (filter === 'search') {
      parts = search > 0
        ? [`${versus('Search engines', search, 'AI bots', ai)}.`, ...most()]
        : [`No search engine asked for a page ${view.phrase.long}.`];
    } else if (filter !== 'all') {
      const who = { seo: 'SEO tools', preview: 'Link-preview bots', other: 'Bots that do something else' }[filter];
      parts = [`${who} fetched ${pages(sums[filter].pages)} ${view.phrase.long}.`, ...most()];
    } else {
      if (top) parts.push(...most().slice(1));
      if (ai > 0) parts.push((parts.length ? ' ' : '') + versus('AI bots', ai, 'search engines', search) + '.');
    }
    return prose('st-mach-sent', parts.length ? parts : [`${pages(view.pages.bot)} went to named bots ${view.phrase.long}.`]);
  }

  // the purpose sums, with the bots the lists don't name counted under Other, so the pills add up
  // to All and the split's percentages are of the same total the pills show
  const totals = () => purposeTotalsFor(view.bots, view.pages.bot);

  function splitParts(sums) {
    return PURPOSE_KEYS.filter((k) => k !== 'all' && sums[k].pages > 0).map((k) => ({
      key: k, label: PURPOSE_SHORT[k], value: sums[k].pages, opacity: 1,
      color: filter === 'all' || filter === k ? PURPOSE_COLOR[k] : hatch(PURPOSE_COLOR[k]),
    }));
  }

  // pages.bot can hold bots the lists don't name (folded, or under a day's list); say how many
  function otherPages() {
    const { owners, hidden } = ownersFor(view.bots, 'all');
    const named = owners.reduce((s, o) => s + o.pages, 0);
    return Math.max(hidden.pages, (view.pages.bot || 0) - named);
  }

  function bookRows() {
    const { owners, hidden } = ownersFor(view.bots, filter);
    const out = owners.map((o) => ({
      key: o.slug || 'unknown', label: o.label, value: o.pages, owner: o,
      meta: `${o.pages === 1 ? 'page' : 'pages'} · ${fmt.num(o.files)} files`,
      sub: chips(o.bots),
    }));
    // under Other, the unnamed bots' pages join the hidden ones, as they do in the Other pill
    const other = filter === 'all' ? otherPages() : hidden.pages + (filter === 'other' ? totals().unlisted : 0);
    if (other > 0) out.push({ key: '__other', label: 'Other named bots', value: other, folded: true, meta: other === 1 ? 'page' : 'pages' });
    return out;
  }

  function chips(bots) {
    const box = h('span', { class: 'st-mach-chips' });
    bots.slice(0, 4).forEach((b) => box.append(h('span', { class: 'st-mach-chip' }, b.name, h('span', { class: 'st-mach-chipq' }, ' · ' + categoryTag(b.category)))));
    if (bots.length > 4) box.append(h('span', { class: 'st-mach-chip is-more' }, `+${bots.length - 4} more`));
    return box;
  }

  // a company, opened: one line per bot, each name a button for its card
  function openOwner(row) {
    const o = row.owner;
    const n = view.n || (view.days ? view.days.length : 0);
    const box = h('ul', { class: 'st-mach-bots', 'aria-label': `${o.label}: its bots` });
    for (const b of o.bots) {
      const name = h('button', { type: 'button', class: 'st-mach-botname', 'aria-haspopup': 'dialog' }, b.name);
      name.addEventListener('click', (e) => { e.stopPropagation(); botCard(name, b, o, n, e); });
      box.append(h('li', { class: 'st-mach-bot' },
        name,
        h('span', { class: 'st-mach-botwhat' }, plain(b.category)),
        h('span', { class: 'st-mach-botn' }, h('b', null, fmt.num(b.pages)), ' ' + (b.pages === 1 ? 'page' : 'pages')),
        h('span', { class: 'st-mach-botdays' }, n > 1 ? `seen on ${b.daysSeen} of ${n} days` : (b.daysSeen ? 'seen this day' : ''))));
    }
    return box;
  }

  function botCard(anchor, b, o, n, ev) {
    api.card(anchor, {
      title: b.name,
      body: [
        blurb(b.name, b.category),
        `${fmt.num(b.pages)} ${b.pages === 1 ? 'page' : 'pages'} and ${fmt.num(b.files)} files ${view.phrase.long}` +
          (n > 1 ? `, on ${b.daysSeen} of ${n} days.` : '.'),
      ],
      meta: (o.owner === UNKNOWN_OWNER ? 'Company not given' : o.owner) + ' · Cloudflare files it under ' + b.category,
    }, b.name, ev);
  }

  function setFilter(key, fromUser) {
    if (!PURPOSE_KEYS.includes(key)) key = 'all';
    if (key === filter && !fromUser) return;
    filter = key;
    if (!els.pills) return;
    els.pills.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.purpose === key)));
    if (els.sent) { const next = sentence(totals()); els.sent.replaceWith(next); els.sent = next; }
    if (split) split.update({ parts: splitParts(totals()), unit: 'pages', other: false });
    if (rows) rows.update({ rows: bookRows() }, { grow: true, keepOpen: false });
    if (fromUser) api.replace(key === 'all' ? null : key);
  }

  return {
    render,
    go(item) {
      if (!view) return;
      if (!item) { if (filter !== 'all') setFilter('all', false); return; }
      if (PURPOSE_KEYS.includes(item)) { setFilter(item, false); return; }
      // a company: show everyone, open its row, put focus on it and bring it into view
      if (filter !== 'all') setFilter('all', false);
      if (!rows || rows.openKey === item) return;
      const li = rows.open(item);
      if (li) requestAnimationFrame(() => api.reveal(li));
    },
    shown() { rows && rows.grow(); },
    destroy() { clear(root); },
  };
}
