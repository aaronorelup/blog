// The costume rack: visitors that look like a browser, but one more than a year out of date.
// People do run old browsers; not this many, this often. Each label carries its age as text
// ("from 2019 · 7 years"), worked out from the browser's release cadence in core/browser.js,
// so "Safari on iOS 13" means something to someone who has never counted iOS versions.
import { h, clear, prose } from './dom.js';
import { rankRows } from './rows.js';
import { staleRows } from './model.js';

export function createOld(root, api, tab) {
  const { fmt } = api;
  let rows = null;

  const yearsOld = (age) => {
    const y = age.yearsOld;
    if (!(y > 0)) return null;
    try { return fmt.yearsWord(y); } catch (e) { return Math.round(y) + ' years'; }
  };

  function render(view) {
    clear(root);
    root.append(h('p', { class: 'st-mach-eyebrow' }, tab.eyebrow));
    const pages = view.pages.stale || 0;
    // with pages, the list ends in "Other old browsers" for whatever the labels don't hold, so the
    // rows (and the table twin) add up to the sentence's number
    const list = staleRows(view.stale, pages).map((r) => ({ ...r, age: r.folded ? null : api.ageOf(r.label) }));
    if (!pages && !list.length) {
      root.append(prose('st-mach-sent', [`No out-of-date browsers ${view.phrase.long}. Either the costumes got better or the bots took a day off.`]));
      rows = null;
      return;
    }
    const parts = [`${fmt.num(pages)} ${pages === 1 ? 'page' : 'pages'} went to browsers more than a year out of date.`];
    const top = list.find((r) => !r.folded);
    if (top) {
      parts.push(' The biggest was ', { b: top.label });
      const yw = top.age && yearsOld(top.age);
      if (top.age && yw) parts.push(`, from about ${top.age.year}: ${yw} old.`);
      else if (top.age) parts.push(`, from about ${top.age.year}.`);
      else parts.push(`, with ${fmt.num(top.n)} ${top.n === 1 ? 'page' : 'pages'}.`);
    }
    root.append(prose('st-mach-sent', parts));
    root.append(prose('st-mach-note', ['People do run old browsers; not this many, this often. Most of these are probably bots wearing an old browser’s name.']));

    const host = h('div', { class: 'st-mach-book' });
    root.append(host);
    rows = rankRows(host, {
      rows: list.map((r) => ({ key: r.key, label: r.label, value: r.n, folded: r.folded, meta: r.n === 1 ? 'page' : 'pages', tag: r.age ? r.age.tag : null })),
      color: 'var(--st-stale)', unit: 'pages', label: 'Out-of-date browsers, by pages', num: api.num, top: 10,
      reduced: api.reduced, ranked: api.ranked,
    });

    const tools = h('div', { class: 'st-mach-figtools' });
    root.append(tools);
    api.tools(tools, `Out-of-date browsers ${view.phrase.long}, by pages`, [
      { key: 'browser', label: 'Browser' }, { key: 'pages', label: 'Pages', num: true }, { key: 'from', label: 'Released about' },
    ], list.map((r) => ({ browser: r.label, pages: r.n, from: r.age ? r.age.text.replace(/^from /, '') : '' })), null);
  }

  return { render, go() {}, shown() { rows && rows.grow(); }, destroy() { clear(root); } };
}
