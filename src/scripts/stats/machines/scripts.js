// The workshop: programs that fetch pages without a browser window. Counted in files, because
// that's what a program asks for: curl checking one address, an agent pulling a page and its
// pictures. Names nobody recognises (and that turned up too rarely to be worth naming) are
// folded into "Other programs" by the view, so a made-up name never prints.
import { h, clear, prose } from './dom.js';
import { rankRows } from './rows.js';
import { programRows, programSaid } from './model.js';

export function createScripts(root, api, tab) {
  const { fmt, words } = api;
  let rows = null;

  const blurbOf = (label) => {
    try { return words.programBlurb(label) || 'A program, not a browser.'; } catch (e) { return 'A program, not a browser.'; }
  };

  function render(view) {
    clear(root);
    root.append(h('p', { class: 'st-mach-eyebrow' }, tab.eyebrow));
    const files = view.files.agent || 0;
    const pages = view.pages.agent || 0;
    const list = programRows(view.agents);
    if (!files && !list.length) {
      root.append(prose('st-mach-sent', [`No scripts ${view.phrase.long}.`]));
      rows = null;
      return;
    }
    const named = list.filter((r) => !r.folded).slice(0, 3);
    const parts = [`Programs without a browser window asked for ${fmt.num(files)} files (${fmt.num(pages)} ${pages === 1 ? 'page' : 'pages'}).`];
    if (named.length) {
      parts.push(' The busiest was ', { b: programSaid(named[0].label) }, ` (${fmt.num(named[0].n)})`);
      if (named.length === 2) parts.push(`, then ${programSaid(named[1].label)} (${fmt.num(named[1].n)})`);
      if (named.length === 3) parts.push(`, then ${programSaid(named[1].label)} (${fmt.num(named[1].n)}) and ${programSaid(named[2].label)} (${fmt.num(named[2].n)})`);
      parts.push('.');
    }
    root.append(prose('st-mach-sent', parts));
    root.append(prose('st-mach-note', ['Many of these are Aaron’s own agents checking that a post went live.']));

    const host = h('div', { class: 'st-mach-book' });
    root.append(host);
    rows = rankRows(host, {
      rows: list.map((r) => ({ key: r.key, label: r.label, value: r.n, folded: r.folded, meta: 'files', sub: blurbOf(r.label) })),
      color: 'var(--st-agent)', unit: 'files', label: 'Programs, by files asked for', num: api.num, top: 10,
      reduced: api.reduced, ranked: api.ranked,
    });

    const tools = h('div', { class: 'st-mach-figtools' });
    root.append(tools);
    api.tools(tools, `Programs ${view.phrase.long}, by files asked for`, [
      { key: 'program', label: 'Program' }, { key: 'files', label: 'Files', num: true }, { key: 'what', label: 'What it is' },
    ], list.map((r) => ({ program: r.label, files: r.n, what: blurbOf(r.label) })), null);
  }

  return { render, go() {}, shown() { rows && rows.grow(); }, destroy() { clear(root); } };
}
