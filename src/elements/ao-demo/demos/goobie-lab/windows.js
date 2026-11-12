// The overview part: the three ways side by side, one recorded run each, as what the model saw of the blog (the map),
// what it read in tokens, how long it took and what it cost, each row saying who decides what goes in, and when.
import { h } from '../../../_lib/dom.js';
import { blogMap, fmt, foot, NAMES, secs, seenBy, usd } from './ui.js';

const WHO = {
  context: 'You decide, once: every post goes in, on every question.',
  rag: 'A search decides, before the model starts: the 8 chunks closest in meaning to the question.',
  agent: 'The model decides, as it goes: it calls tools and reads what they return, turn after turn.',
};
// What the run let the model see of each post, in characters.
function seen(run, method) {
  const out = new Map();
  const add = (slug, n) => out.set(slug, (out.get(slug) ?? 0) + n);
  if (method === 'rag') {
    const s = run.steps.find((x) => x.kind === 'search');
    for (const c of s.top.slice(0, s.k)) add(c.slug, c.text.length);
  }
  if (method === 'agent') for (const c of run.steps.flatMap((s) => s.calls)) seenBy(c, out);
  return method === 'context' ? 'all' : out;
}

export function draw(host, blog, data) {
  const rows = ['context', 'rag', 'agent'].map((method) => {
    const run = data[method].runs[0];
    const map = blogMap(blog);
    map.shade(seen(run, method));
    const s = run.stats;
    return h('section', { class: `gl-way gl-way-${method}` },
      h('p', { class: 'gl-way-name' }, h('b', { text: NAMES[method] }), h('span', { text: ` · ${WHO[method]}` })),
      map.el,
      h('p', { class: 'gl-way-figs', text: `“${run.q}” · read ${fmt(s.in)} tokens · ${secs(s.ms)} · ${usd(s.usd)}` }));
  });
  const root = h('div', { class: 'gl gl-windows' }, h('p', { class: 'gl-eyebrow', text: 'What goes into the model, three ways' }), ...rows, foot(blog));
  host.replaceChildren(root);
  return () => root.remove();
}
