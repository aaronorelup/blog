// The synthid demo's shared pieces of page: buttons, the + and − chips, number wording, the checker's score panel,
// the shaded text and a token's detail. Read by the parts.
import { h } from '../../../_lib/dom.js';
import { clamp, FLAG_Z, IS_INVISIBLE, KEYS, M, ones, TOKEN_SD } from './model.js';

export const btn = (label, onclick, extra = {}) => h('button', { type: 'button', class: 'sid-btn', onclick, ...extra }, label);
export function segmented(options, value, onchange, label) {
  const row = h('div', { class: 'sid-row', role: 'group', 'aria-label': label });
  const buttons = options.map(([v, text]) =>
    btn(text, () => {
      buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(options[i][0] === v)));
      onchange(v);
    }, { 'aria-pressed': String(v === value) }),
  );
  row.append(...buttons);
  return row;
}
// Round assignments as chips: a gold "+" or a hollow "−".
export const chip = (on, cls = '') => h('i', { class: 'sid-sign ' + (on ? 'plus ' : 'minus ') + cls, 'aria-label': on ? 'plus' : 'minus' }, on ? '+' : '−');
export const chips = (g, n = M, cls = '') => h('span', { class: 'sid-signs ' + cls }, Array.from({ length: n }, (_, l) => chip(g[l])));
export const lede = (...kids) => h('p', { class: 'sid-lede' }, ...kids);
export const pct = (x) => {
  if (x >= 0.9999995) return '100%';
  if (x < 0.000005) return x <= 0 ? '0%' : 'under 0.001%';
  // Near-certain odds keep digits until the first one that isn't a 9: 99.950%, 99.99987%.
  if (x > 0.99) return (x * 100).toFixed(clamp(Math.ceil(-Math.log10(1 - x)) - 1, 2, 6)) + '%';
  if (x >= 0.1) return (x * 100).toFixed(0) + '%';
  if (x >= 0.01) return (x * 100).toFixed(1) + '%';
  if (x >= 0.0001) return (x * 100).toFixed(2) + '%';
  return (x * 100).toFixed(3) + '%';
};
export const share = (x) => (x * 100).toFixed(1) + '%';
const oneIn = (p) => {
  if (p <= 0 || 1 / p > 1e12) return 'less than once in a trillion tries';
  const n = 1 / p;
  if (n < 1.5) return 'most of the time';
  return 'about 1 time in ' + Math.round(n).toLocaleString('en-US');
};
export const fmt = (x) => x.toLocaleString('en-US');

// The checker's readout, shared by the detect and edit parts.
export function scorePanel() {
  const el = h('div', { class: 'sid-score', 'aria-live': 'polite' });
  const verdict = h('div', { class: 'sid-verdict' });
  const big = h('p', { class: 'sid-big' });
  const gauge = h('div', { class: 'sid-gauge', 'aria-hidden': 'true' });
  const band = h('span', { class: 'sid-gauge-band' });
  const flag = h('span', { class: 'sid-gauge-flag' });
  const dot = h('span', { class: 'sid-gauge-dot' });
  gauge.append(band, flag, dot);
  const axis = h('div', { class: 'sid-gauge-axis', 'aria-hidden': 'true' });
  const line = h('p', { class: 'sid-score-line' });
  el.append(verdict, big, gauge, axis, line);
  return {
    el,
    update(r) {
      const sd = TOKEN_SD / Math.sqrt(Math.max(1, r.n));
      // The axis is in percent of +, scaled to this length: chance sits in the middle third.
      const lo = 0.5 - 4 * sd, hi = 0.5 + 8 * sd;
      const at = (x) => ((clamp(x, lo, hi) - lo) / (hi - lo)) * 100 + '%';
      const flagAt = 0.5 + FLAG_Z * sd;
      band.style.left = at(0.5 - 1.96 * sd);
      band.style.width = `calc(${at(0.5 + 1.96 * sd)} - ${at(0.5 - 1.96 * sd)})`;
      flag.style.left = at(flagAt);
      dot.style.left = at(r.score);
      axis.replaceChildren(
        h('span', { style: `left:${at(0.5)}` }, '50%'),
        h('span', { style: `left:${at(flagAt)}`, class: 'flag' }, 'flag line ' + share(flagAt)),
        h('span', { style: `left:${at(hi)}`, class: 'end' }, share(hi)),
      );
      el.dataset.state = r.n < 1 ? 'no' : r.z >= FLAG_Z ? 'yes' : r.z >= 1.28 ? 'maybe' : 'no';
      verdict.textContent = r.n < 1 ? 'Nothing to check' : r.z >= FLAG_Z ? 'Watermark found' : r.z >= 1.28 ? 'Not sure' : 'No watermark found';
      big.replaceChildren(h('b', null, share(r.score)), ` of the round assignments are + (${r.n} tokens checked × 30 rounds)`);
      line.replaceChildren(
        `Text without the watermark lands near 50%: at this length, between ${share(0.5 - 1.96 * sd)} and ${share(0.5 + 1.96 * sd)} 95% of the time (the shaded band). `,
        r.n < 1 ? '' : `It would score ${share(r.score)} or more ${oneIn(r.p)}. The checker flags a text past the dashed line, where an unwatermarked text lands only 1 time in 100.`,
      );
    },
  };
}

// The text, each checked token shaded by how many of its assignments are +.
export function tokenView(onPick) {
  const el = h('div', { class: 'sid-text', tabindex: '0', 'aria-label': 'The text, shaded by how many of each token’s round assignments are plus' });
  el.addEventListener('click', (e) => {
    const s = e.target.closest('[data-i]');
    if (s) onPick?.(Number(s.dataset.i));
  });
  return {
    el,
    render(r, broken) {
      const frag = document.createDocumentFragment();
      let last = 0;
      r.toks.forEach((x, i) => {
        if (x.at > last) frag.append(r.src.slice(last, x.at));
        last = x.at + x.t.length;
        const invisible = IS_INVISIBLE.test(x.t);
        const span = h('span', { class: 'sid-tok ' + x.state + (invisible ? ' zw' : ''), 'data-i': String(i) }, invisible ? '' : x.t);
        if (x.state === 'scored') {
          span.style.setProperty('--a', String(clamp((x.s - 0.5) / 0.22, 0, 1) * 0.62));
          if (broken && !broken.has([...x.ctx, x.t].join('\u0002'))) span.classList.add('broken');
        }
        frag.append(span);
      });
      if (last < r.src.length) frag.append(r.src.slice(last));
      el.replaceChildren(frag);
    },
  };
}
export function legend(withBroken) {
  return h('div', { class: 'sid-key-row' },
    h('span', null, h('i', { class: 'sw gold' }), 'mostly + (evidence)'),
    h('span', null, h('i', { class: 'sw plain' }), 'about half +'),
    h('span', null, h('i', { class: 'sw grey' }), 'not checked'),
    withBroken ? h('span', null, h('i', { class: 'sw wavy' }), 'previous tokens changed: evidence gone') : null);
}
export function tokenDetail(r, i, key) {
  const x = r.toks[i];
  if (!x) return '';
  if (x.state !== 'scored') {
    const why = {
      edge: 'it doesn’t have four tokens before it yet',
      repeat: 'the same four previous tokens already appeared earlier, and the checker skips repeats (so does the watermark)',
      beyond: 'it is past the length being checked',
    }[x.state];
    return h('span', null, h('b', null, `“${x.t || '·'}”`), ` isn’t checked: ${why}.`);
  }
  return h('span', null,
    h('b', null, `“${x.t}”`), ', after the four previous tokens ', h('i', null, x.ctx.map((c) => (IS_INVISIBLE.test(c) ? '·' : c)).join(' ')),
    `: ${ones(x.g)} of its 30 round assignments are + under ${key === KEYS.claude ? 'Claude’s' : 'this'} key. `,
    chips(x.g, M, 'small'));
}
