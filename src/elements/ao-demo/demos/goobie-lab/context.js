// The in-context part: every post goes into one prompt, every question. Pick a question for its window, map, figures,
// answer and grade; the cold box is the one measured call that missed the cache (the same prompt, so it is what any
// first question after a change pays); the growth slider works out, live, what the same prompt does as the blog grows,
// from this run's own size a post and the model's prices.
import { h } from '../../../_lib/dom.js';
import { answer, blogMap, eyebrow, fmt, foot, grade, meter, pct, picker, secs, stats, usd } from './ui.js';

const OFF = (blog) => blog.prices.off;

function grow(blog, run) {
  const posts = blog.posts.length;
  const per = (run.stats.in - 400) / posts;           // tokens a post, the rules and question taken off
  const out = h('p', { class: 'gl-grow-out', 'aria-live': 'polite' });
  const range = h('input', { type: 'range', min: String(posts), max: '600', step: '1', value: String(posts),
    'aria-label': 'Number of posts', class: 'gl-range' });
  const label = h('label', { class: 'gl-grow-label' }, 'If the blog had ', h('b', { class: 'gl-n' }), ' posts');
  const show = () => {
    const n = Number(range.value);
    const tokens = Math.round(400 + n * per);
    const p = OFF(blog);
    label.querySelector('.gl-n').textContent = String(n);
    out.textContent = tokens > blog.window
      ? `About ${fmt(tokens)} tokens: ${pct(tokens / blog.window)} of the window. It no longer fits in one prompt, so this way stops working.`
      : `About ${fmt(tokens)} tokens, ${pct(tokens / blog.window)} of the window. The first question after a change about ${usd((tokens * p.miss) / 1e6)}, each one after that about ${usd((tokens * p.hit + 250 * p.out) / 1e6)}.`;
  };
  range.addEventListener('input', show);
  show();
  return h('div', { class: 'gl-grow' }, h('p', { class: 'gl-label', text: 'Try it: a bigger blog, same prompt' }), label, range, out,
    h('p', { class: 'gl-note', text: `Worked out live from this run: about ${fmt(per)} tokens a post, at the model's off-peak prices (peak hours cost double).` }));
}

export function draw(host, blog, data) {
  const m = meter(blog.window);
  const map = blogMap(blog);
  const body = h('div', { class: 'gl-run' });
  const c = blog.cold;
  const coldBox = c ? h('div', { class: 'gl-cold' },
    h('p', { class: 'gl-label', text: 'The catch: the first question after a change' }),
    stats([['Read', `${fmt(c.in)} tokens, none from the cache`], ['First words', secs(c.firstMs)], ['Done', secs(c.ms)], ['Cost', usd(c.usd)]]),
    h('p', { class: 'gl-note', text: 'Measured once, on the first question asked. Every question starts with the same posts, so this is what the first one after a new post or an edited one pays. The ones after it read those tokens from the cache.' })) : null;
  let growBox = null;
  const pick = (i) => {
    const run = data.runs[i];
    const s = run.stats;
    m.set(s.in, s.hit, 'All of it is posts but the rules and the question');
    map.shade('all', `All ${blog.posts.length} posts, every word, ${fmt(blog.packChars)} characters`);
    body.replaceChildren(
      h('ol', { class: 'gl-steps' },
        h('li', {}, h('b', { text: 'Every post goes in. ' }), `All ${blog.posts.length}, in full, oldest first, with each post's date, topic and author, then the question.`),
        h('li', {}, h('b', { text: 'Most of it is already cached. ' }), `The model's provider had kept ${fmt(s.hit)} of the ${fmt(s.in)} tokens from the question before, so it read them at a fiftieth of the price.`),
        h('li', {}, h('b', { text: 'One call answers. ' }), `First words after ${secs(s.firstMs)}, done after ${secs(s.ms)}.`)),
      stats([['Read', `${fmt(s.in)} tokens`], ['From the cache', pct(s.hit / s.in)], ['Wrote', `${fmt(s.out)} tokens`],
        ['First words', secs(s.firstMs)], ['Done', secs(s.ms)], ['Cost', usd(s.usd)]]),
      answer(run.answer), grade(run));
    growBox ??= grow(blog, run);
  };
  const root = h('div', { class: 'gl gl-context' }, eyebrow('context'), picker(data.runs, pick), m.el, map.el, body);
  pick(0);
  root.append(...[coldBox, growBox, foot(blog)].filter(Boolean));
  host.replaceChildren(root);
  return () => root.remove();
}
