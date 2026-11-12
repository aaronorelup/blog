// The classic-RAG part: the question is embedded, every chunk of the blog is scored against it, and the nearest k go to
// the model, nothing else. Pick a question for its ranked chunks, figures, answer and grade. The k slider is live: it
// moves the cut through the run's own 25 nearest chunks and works out the window and the map for that k (the recorded
// answer is always the one made from the top k the run used).
import { h } from '../../../_lib/dom.js';
import { answer, blogMap, est, eyebrow, fmt, foot, grade, meter, picker, secs, stats, usd } from './ui.js';

const linkOf = (c) => `/ledger/${c.slug}/${c.mark.includes('.N') ? 'notes/' : ''}`;

function hits(top, k) {
  const hi = top[0].score;
  const lo = top.at(-1).score;
  return top.map((c, i) => h('li', { class: `gl-hit${i < k ? ' is-in' : ''}` },
    h('span', { class: 'gl-score' }, h('i', { class: 'gl-score-bar' }), c.score.toFixed(3)),
    h('span', { class: 'gl-hit-main' },
      h('a', { href: linkOf(c), class: 'gl-hit-post', text: c.title }),
      h('span', { class: 'gl-hit-where', text: ` ${c.heading} · ${c.date}` }),
      h('details', { class: 'gl-chunk' }, h('summary', { text: `Read the chunk (${fmt(c.text.length)} characters)` }), h('p', { text: c.text }))),
  )).map((li, i) => {
    li.querySelector('.gl-score-bar').style.width = `${20 + ((top[i].score - lo) / Math.max(1e-9, hi - lo)) * 80}%`;
    return li;
  });
}

export function draw(host, blog, data) {
  const m = meter(blog.window);
  const map = blogMap(blog);
  const body = h('div', { class: 'gl-run' });
  const list = h('ol', { class: 'gl-hits' });
  const kOut = h('b');
  const kNote = h('p', { class: 'gl-note', 'aria-live': 'polite' });
  const range = h('input', { type: 'range', min: '1', max: '25', step: '1', value: String(blog.ragK), class: 'gl-range',
    'aria-label': 'How many chunks go to the model' });
  let run = null;

  const cut = () => {
    const k = Number(range.value);
    const search = run.steps.find((s) => s.kind === 'search');
    const top = search.top;
    kOut.textContent = String(k);
    list.querySelectorAll('.gl-hit').forEach((li, i) => li.classList.toggle('is-in', i < k));
    const chars = (n) => top.slice(0, n).reduce((t, c) => t + c.text.length + c.title.length + c.heading.length + 24, 0);
    const tokens = Math.max(1, run.stats.in + est(chars(k) - chars(search.k)));
    const seen = new Map();
    for (const c of top.slice(0, k)) seen.set(c.slug, (seen.get(c.slug) ?? 0) + c.text.length);
    m.set(tokens, 0, k === search.k ? 'The run\'s own prompt' : `About this many with ${k}, worked out from the chunks`);
    map.shade(seen);
    kNote.textContent = k === search.k ? `The answer below was made from these ${k}.`
      : `The answer below was made from the top ${search.k}. With ${k} the model would read about ${fmt(tokens)} tokens.`;
  };
  range.addEventListener('input', cut);

  const pick = (i) => {
    run = data.runs[i];
    const s = run.stats;
    const [e, search, a] = ['embed', 'search', 'answer'].map((k) => run.steps.find((x) => x.kind === k));
    list.replaceChildren(...hits(search.top, Number(range.value)));
    body.replaceChildren(
      stats([['Read', `${fmt(s.in)} tokens`], ['Wrote', `${fmt(s.out)} tokens`], ['First words', secs(s.firstMs)], ['Done', secs(s.ms)], ['Cost', usd(s.usd)]]),
      answer(run.answer), grade(run));
    steps.replaceChildren(
      h('li', {}, h('b', { text: 'The question becomes numbers. ' }), `An embedding model turns it into 1,024 numbers that stand for its meaning, in ${secs(e.ms)} (a round trip to Cloudflare from the test machine).`),
      h('li', {}, h('b', { text: 'Every chunk is scored. ' }), `The ${fmt(search.of)} chunks of the blog were embedded the same way ahead of time. Comparing all of them took ${fmt(search.ms)} ms. Closest first:`, hitbox),
      h('li', {}, h('b', { text: 'One call answers from the top ones. ' }), `The model sees only those chunks and the question. First words after ${secs(a.firstMs)} of that call.`));
    range.value = String(search.k);
    cut();
  };
  const steps = h('ol', { class: 'gl-steps' });
  const kBox = h('div', { class: 'gl-k' }, h('label', { class: 'gl-grow-label' }, 'Chunks given to the model: ', kOut), range, kNote);
  const hitbox = h('div', { class: 'gl-hitbox' }, kBox, list);
  const root = h('div', { class: 'gl gl-rag' }, eyebrow('rag'), picker(data.runs, pick), steps, m.el, map.el, body, foot(blog));
  pick(0);
  host.replaceChildren(root);
  return () => root.remove();
}
