// Part certain: why a token with one right answer ("Paris" for France's capital) comes out the same, watermark or
// not. Mounted by index.js.
import { h } from '../../../_lib/dom.js';
import { gvals, KEYS, M, rng, tilt, tokScore } from './model.js';
import { btn, fmt, lede, pct, segmented, share } from './ui.js';

// ------------------------------------------------------------------------------------------
// Part: certain.
const CASES = [
  { id: 'paris', label: 'Capital of France', lead: 'What is the capital of France? The capital of France is', ctx: ['capital', 'of', 'France', 'is'], c: [['Paris', 0.9995], ['Lyon', 0.0002], ['Marseille', 0.0002], ['the', 0.0001]] },
  { id: 'food', label: 'A city famous for its food', lead: 'Name a city famous for its food:', ctx: ['famous', 'for', 'its', 'food'], c: [['Paris', 0.3], ['Lyon', 0.2], ['Tokyo', 0.18], ['Naples', 0.12], ['Bangkok', 0.1], ['New Orleans', 0.1]] },
  { id: 'url', label: 'A URL', lead: 'The post is at aaronorelup.com/led', ctx: ['.', 'com', '/', 'led'], c: [['ger', 0.99995], ['ge', 0.00003], ['gers', 0.00002]] },
  { id: 'quote', label: 'A quote, word for word', lead: 'Copy it exactly: “The kettle remembers everyone…” → “The kettle remembers', ctx: ['“', 'The', 'kettle', 'remembers'], c: [['everyone', 0.9999], ['everybody', 0.00007], ['anyone', 0.00003]] },
  { id: 'custom', label: 'Set it yourself', lead: 'A question with one right answer, and three wrong ones the model gives a sliver of chance to.', ctx: ['your', 'own', 'test', 'case'], c: null },
];
function customCase(slider) {
  const wrong = 0.5 * Math.pow(10, -slider / 25);
  return [['right answer', 1 - wrong], ['wrong one', wrong * 0.6], ['wrong two', wrong * 0.25], ['wrong three', wrong * 0.15]];
}
function nucleus(c, topP) {
  if (!topP) return c;
  const keep = [];
  let acc = 0;
  for (const x of c) {
    keep.push(x);
    acc += x[1];
    if (acc >= topP) break;
  }
  return keep.map(([w, p]) => [w, p / acc]);
}
// Many different sets of previous tokens: the same odds, freshly drawn round assignments each time.
function sweep(p, n = 10000, seed = 11) {
  const r = rng(seed);
  const k = p.length;
  const rows = Array.from({ length: k }, () => new Uint8Array(M));
  const avg = new Float64Array(k);
  let ev = 0;
  let rarer = 0;
  let over1 = 0;
  let worst = 1;
  const wrong0 = 1 - p[0];
  for (let c = 0; c < n; c++) {
    for (const row of rows) for (let l = 0; l < M; l++) row[l] = r() < 0.5 ? 1 : 0;
    const q = k > 1 ? tilt(p, rows) : p;
    for (let i = 0; i < k; i++) {
      avg[i] += q[i] / n;
      ev += (q[i] * tokScore(rows[i])) / n;
    }
    const wrong = 1 - q[0];
    if (wrong < wrong0 - 1e-12) rarer++;
    if (wrong > 0.01) over1++;
    worst = Math.min(worst, q[0]);
  }
  return { avg, ev, rarer, over1, worst, n };
}

export function partCertain(root) {
  const N = 100000; // the rare cases matter here, so sample enough of them to show up
  let which = 'paris';
  let slider = 75;
  let topP = 0;
  let roll = 0;
  let timer = 0;
  const cache = new Map();
  const sweepOf = (p) => {
    const id = p.join(',');
    if (!cache.has(id)) cache.set(id, sweep(p, N));
    return cache.get(id);
  };
  const question = h('p', { class: 'sid-sentence' });
  const pairs = h('div', { class: 'sid-pairs' });
  const facts = h('ul', { class: 'sid-facts' });
  const sliderWrap = h('label', { class: 'sid-slider', hidden: true });
  const range = h('input', { type: 'range', min: '0', max: '150', value: String(slider), 'aria-label': 'How sure the model is of the right answer' });
  const rangeOut = h('span', { class: 'sid-slider-out' });
  sliderWrap.append(h('span', null, 'How sure the model is of the right answer'), range, rangeOut);
  range.addEventListener('input', () => {
    slider = Number(range.value);
    rangeOut.textContent = pct(customCase(slider)[0][1]);
    clearTimeout(timer);
    timer = setTimeout(render, 160);
  });
  const foodShare = sweep(CASES[1].c.map((x) => x[1]), 4000, 3).ev;

  function render() {
    const cs = CASES.find((x) => x.id === which);
    const raw = cs.c || customCase(slider);
    const c = nucleus(raw, topP);
    sliderWrap.hidden = which !== 'custom';
    rangeOut.textContent = pct(raw[0][1]);
    question.replaceChildren(h('span', { class: 'quiet' }, cs.lead + ' '), h('span', { class: 'sid-blank' }, '____'));
    const p = c.map((x) => x[1]);
    const ctx = roll ? [...cs.ctx.slice(1), '#' + roll] : cs.ctx;
    const q = c.length > 1 ? tilt(p, c.map((x) => gvals(KEYS.claude, ctx, x[0]))) : p;
    const s = sweepOf(p);
    pairs.replaceChildren(
      h('div', { class: 'sid-pairs-key' }, h('span', null, h('i', { class: 'sw outline' }), 'without the watermark'), h('span', null, h('i', { class: 'sw gold' }), 'with it, for these previous tokens (30 rounds)')),
      ...raw.map(([w, pw]) => {
        const i = c.findIndex((x) => x[0] === w);
        const qi = i < 0 ? 0 : q[i];
        return h('div', { class: 'sid-pair' + (i < 0 ? ' cut' : '') },
          h('span', { class: 'w' }, w),
          h('div', { class: 'bars' }, h('span', { class: 'b0', style: `width:${pw * 100}%` }), h('span', { class: 'b1', style: `width:${qi * 100}%` })),
          h('span', { class: 'n' }, i < 0 ? 'removed' : `${pct(pw)} → ${pct(qi)}`));
      }),
    );
    const top = c[0][0];
    const wrong0 = 1 - p[0];
    const free = p[0] < 0.9;
    let best = 0;
    q.forEach((v, i) => { if (v > q[best]) best = i; });
    const items = [];
    if (c.length === 1) {
      items.push(h('li', null, h('b', null, 'Nothing to choose between. '), `After removing everything under 1%, “${top}” is the only word left, so every contestant is “${top}” and every tournament picks it.`));
    } else if (free) {
      items.push(h('li', null, h('b', null, 'Here: ' + (q[best] > 0.5 ? `“${c[best][0]}” takes most of the odds. ` : 'the odds are reshuffled. ')),
        `With these previous tokens, “${c[best][0]}” comes out ${pct(q[best])} of the time instead of ${pct(p[best])}: over 30 rounds its + and − beat the other cities’. Press “Try different previous tokens” and another city gets the boost.`));
      items.push(h('li', null, h('b', null, `Over ${fmt(N)} different previous tokens, the odds are the model’s own. `),
        c.slice(0, 4).map(([w], i) => `${w} ${pct(s.avg[i])} (model: ${pct(p[i])})`).join(', ') + '. The watermark picks which good answer wins each time; it doesn’t change how often each one wins overall.'));
      items.push(h('li', null, h('b', null, `The chosen city’s round assignments are ${share(s.ev)} + on average. `), 'More than the 50% that chance gives. That lean is what the checker looks for.'));
    } else {
      items.push(h('li', null, h('b', null, `Here: “${top}” comes out ${pct(q[0])} of the time. `),
        `Without the watermark: ${pct(p[0])}. Nearly every contestant is “${top}”, so whatever the round assignments say, “${top}” plays “${top}” and wins.`));
      items.push(h('li', null, h('b', null, `Over ${fmt(N)} different previous tokens: ${pct(s.avg[0])}. `),
        `Without the watermark: ${pct(p[0])}. On average the watermark doesn’t change the odds; any difference in the last digit is sampling noise.`));
      items.push(h('li', null, h('b', null, `The checker gets nothing from it. `),
        `The round assignments of “${top}” come out ${share(s.ev)} + on average, the same as chance. A city in the food question comes out ${share(foodShare)}.`));
      items.push(h('li', null, h('b', null, 'The rare exception. '),
        s.over1
          ? `In ${fmt(s.over1)} of the ${fmt(N)} (about 1 in ${fmt(Math.round(N / s.over1))}), a wrong answer’s chance rose above 1%, and in the unluckiest one “${top}” fell to ${pct(s.worst)}. In ${fmt(s.rarer)} the wrong answers got rarer than the model’s own ${pct(wrong0)}. So the watermark adds no mistakes on average, but it gathers the few there are into a few spots. That is the published algorithm’s arithmetic, not a measurement of Claude; removing very unlikely words first (the checkbox) avoids it.`
          : `Not one of the ${fmt(N)} pushed a wrong answer above 1%.`));
    }
    facts.replaceChildren(...items);
  }

  root.append(
    h('div', { class: 'sid-eyebrow' }, 'Demo 2 · when there is one right answer'),
    lede('Pick a question. Each row compares how often a word comes out without the watermark and with it. The odds are made up for illustration; the tournament is the real algorithm with 30 rounds.'),
    segmented(CASES.map((x) => [x.id, x.label]), which, (v) => { which = v; roll = 0; render(); }, 'Question'),
    sliderWrap,
    question,
    pairs,
    h('div', { class: 'sid-row sid-controls' },
      btn('Try different previous tokens', () => { roll++; render(); }),
      h('label', { class: 'sid-check' }, h('input', { type: 'checkbox', onchange: (e) => { topP = e.target.checked ? 0.99 : 0; render(); } }), ' Remove words under 1% before the tournament (top-p 0.99)')),
    facts,
  );
  render();
  return { destroy: () => clearTimeout(timer) };
}
