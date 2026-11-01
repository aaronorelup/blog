// Part book: expected detection for a long text after you edit it. Mounted by index.js.
import { h } from '../../../_lib/dom.js';
import { clamp, detect, FLAG_Z, generate, TOKEN_SD, upper } from './model.js';
import { lede, pct, segmented } from './ui.js';

// ------------------------------------------------------------------------------------------
// Part: book. Expected detection after editing, from the letter's own evidence per word.
export function partBook(root) {
  // Average evidence per word over many fresh letters, so the chart doesn't hang on one lucky draw.
  let ev = 0;
  let n = 0;
  let words = 0;
  for (let i = 0; i < 40; i++) {
    const r = detect(generate({ seed: 900 + i }).text);
    ev += (r.score - 0.5) * r.n;
    n += r.n;
    words += r.words;
  }
  // z gained per sqrt(word): the evidence a word brings, over the noise of its tokens.
  const perWord = ev / words / (TOKEN_SD * Math.sqrt(n / words));
  const LENGTHS = [
    { id: 'email', label: 'A 300-word email', n: 300, cls: 'l1' },
    { id: 'essay', label: 'A 3,000-word essay', n: 3000, cls: 'l2' },
    { id: 'novel', label: 'A 90,000-word novel', n: 90000, cls: 'l3' },
  ];
  let mine = 1;
  const flagged = (len, r) => 1 - upper(perWord * mine * Math.sqrt(len) * Math.pow(1 - r, 5) - FLAG_Z);
  const evenAt = (len) => {
    if (flagged(len, 0) < 0.5) return null;
    let r = 0;
    while (r < 0.95 && flagged(len, r) >= 0.5) r += 0.0025;
    return r;
  };

  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs) => {
    const el = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs || {})) el.setAttribute(k, v);
    return el;
  };
  const Wd = 640;
  const Ht = 300;
  const pad = { l: 46, r: 96, t: 16, b: 40 };
  const X = (r) => pad.l + (r / 0.6) * (Wd - pad.l - pad.r);
  const Y = (p) => pad.t + (1 - p) * (Ht - pad.t - pad.b);
  const svg = svgEl('svg', { viewBox: `0 0 ${Wd} ${Ht}`, class: 'sid-chart', role: 'img', 'aria-label': 'Chance the checker flags the text against the share of words edited, for three lengths' });
  const tip = h('div', { class: 'sid-tip', hidden: true });
  const wrap = h('div', { class: 'sid-chart-wrap' }, svg, tip);
  const table = h('table', { class: 'sid-table' });
  const say = h('p', { class: 'sid-note' });

  function draw() {
    svg.replaceChildren();
    for (const p of [0, 0.25, 0.5, 0.75, 1]) {
      svg.append(svgEl('line', { x1: pad.l, x2: Wd - pad.r, y1: Y(p), y2: Y(p), class: 'grid' }));
      const t = svgEl('text', { x: pad.l - 8, y: Y(p) + 4, class: 'tick', 'text-anchor': 'end' });
      t.textContent = p * 100 + '%';
      svg.append(t);
    }
    for (const r of [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6]) {
      const t = svgEl('text', { x: X(r), y: Ht - pad.b + 18, class: 'tick', 'text-anchor': 'middle' });
      t.textContent = Math.round(r * 100) + '%';
      svg.append(t);
    }
    const xl = svgEl('text', { x: pad.l + (Wd - pad.l - pad.r) / 2, y: Ht - 4, class: 'axis', 'text-anchor': 'middle' });
    xl.textContent = 'Share of words you change afterwards';
    svg.append(xl);
    const labels = [];
    for (const L of LENGTHS) {
      let d = '';
      for (let i = 0; i <= 120; i++) {
        const r = (i / 120) * 0.6;
        d += (i ? 'L' : 'M') + X(r).toFixed(1) + ' ' + Y(flagged(L.n, r)).toFixed(1);
      }
      svg.append(svgEl('path', { d, class: 'line ' + L.cls }));
      // Label each line where it crosses even odds; a line that never gets there is labelled
      // where it starts.
      const p0 = flagged(L.n, 0);
      let x = X(0);
      let y = Y(p0);
      if (p0 >= 0.5) {
        let r = 0;
        while (r < 0.6 && flagged(L.n, r) >= 0.5) r += 0.0025;
        x = X(r);
        y = Y(0.5);
      }
      labels.push({ L, x: x + 7, y: y - 7 });
    }
    labels.sort((a, b) => b.y - a.y);
    for (let i = 1; i < labels.length; i++) {
      if (Math.abs(labels[i].x - labels[i - 1].x) < 90 && labels[i - 1].y - labels[i].y < 15) labels[i].y = labels[i - 1].y - 15;
    }
    for (const { L, x, y } of labels) {
      const t = svgEl('text', { x, y, class: 'lab ' + L.cls });
      t.textContent = L.label.replace(/^A /, '');
      svg.append(t);
    }
    svg.append(svgEl('line', { class: 'cross', x1: 0, x2: 0, y1: pad.t, y2: Ht - pad.b, visibility: 'hidden' }));
    table.replaceChildren(
      h('caption', null, 'Chance the checker flags it, by share of words edited'),
      h('tr', null, h('th', null, 'Edited'), ...LENGTHS.map((L) => h('th', null, L.label.replace(/^A /, '')))),
      ...[0, 0.1, 0.2, 0.3, 0.4, 0.5].map((r) => h('tr', null, h('td', null, Math.round(r * 100) + '%'), ...LENGTHS.map((L) => h('td', null, pct(flagged(L.n, r)))))),
    );
    const novel = evenAt(90000);
    const email = flagged(300, 0);
    say.textContent = (novel == null
      ? `With this little of the wording Claude’s, even an untouched novel is flagged only ${pct(flagged(90000, 0))} of the time. `
      : `With this much of the wording Claude’s, you’d have to change about ${Math.round(novel * 100)}% of a novel’s words before it’s a coin flip whether the checker flags it. `)
      + `An untouched 300-word email is flagged ${pct(email)} of the time.`;
  }
  function hover(e) {
    const box = svg.getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * Wd;
    const r = clamp(((px - pad.l) / (Wd - pad.l - pad.r)) * 0.6, 0, 0.6);
    const cross = svg.querySelector('.cross');
    cross.setAttribute('x1', X(r));
    cross.setAttribute('x2', X(r));
    cross.setAttribute('visibility', 'visible');
    tip.hidden = false;
    tip.replaceChildren(h('b', null, `You change ${Math.round(r * 100)}% of the words`), ...LENGTHS.map((L) => h('span', null, `${L.label.replace(/^A /, '')}: flagged ${pct(flagged(L.n, r))}`)));
    const left = (X(r) / Wd) * box.width;
    tip.style.left = Math.min(box.width - 190, Math.max(0, left + 12)) + 'px';
  }
  svg.addEventListener('pointermove', hover);
  svg.addEventListener('pointerleave', () => {
    tip.hidden = true;
    svg.querySelector('.cross')?.setAttribute('visibility', 'hidden');
  });

  root.append(
    h('div', { class: 'sid-eyebrow' }, 'Demo 5 · a book, after your edits'),
    lede('How likely the checker is to flag a text after you’ve edited it, for three lengths. Pick how much of the wording Claude chose in the first place.'),
    segmented([[1, 'All of it (Claude wrote or rewrote it)'], [0.5, 'About half'], [0.1, 'A tenth'], [0.02, 'A light proofread']], mine, (v) => { mine = v; draw(); }, 'Share of the wording Claude chose'),
    h('div', { class: 'sid-legend', 'aria-hidden': 'true' },
      h('span', { class: 'sid-legend-y' }, 'Up: chance the checker flags it'),
      ...LENGTHS.map((L) => h('span', { class: 'sid-key ' + L.cls }, h('i'), L.label.replace(/^A /, '')))),
    wrap,
    say,
    h('details', { class: 'sid-more' }, h('summary', null, 'The same numbers as a table'), table),
    h('p', { class: 'sid-caption' },
      'Assumes every word Claude chose carries as much evidence as a word in the letter above, and that your edits land on words at random. Edits aimed at word choices remove evidence faster (demo 4); edits bunched into one sentence break fewer neighbours. Real tokens are smaller than words and real checkers are better than this one, so read the shape, not the decimals.'),
  );
  draw();
  return {};
}
