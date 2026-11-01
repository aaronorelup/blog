// Part tournament: how one token is picked. Contestants are drawn from the odds, each gets a + or − per round from the
// key and the four previous tokens, and + beats −. Mounted by index.js.
import { h } from '../../../_lib/dom.js';
import { gvals, H, KEYS, M, ones, pick, tilt } from './model.js';
import { btn, chip, chips, lede, pct, segmented } from './ui.js';

// ------------------------------------------------------------------------------------------
// Part: tournament.
const SENTENCE = ['The', 'tea', 'house', 'sits', 'at', 'the', 'edge', 'of', 'the'];
const SWAPS = { 6: ['edge', 'end', 'foot'] };
const NEXT = [['garden', 0.34], ['river', 0.2], ['forest', 0.16], ['town', 0.12], ['sea', 0.1], ['world', 0.08]];
const ROUNDS = 3; // in the bracket; the real system plays M

export function partTournament(root) {
  const words = SENTENCE.slice();
  let key = KEYS.claude;
  let depth = ROUNDS;
  let rounds = [];
  let shown = 0;
  let timer = 0;
  const ctx = () => words.slice(-H);
  const g = (w) => gvals(key, ctx(), w);

  const sentence = h('p', { class: 'sid-sentence' });
  const table = h('div', { class: 'sid-grid' });
  const bracket = h('div', { class: 'sid-bracket', 'aria-live': 'polite' });
  const say = h('p', { class: 'sid-note' });
  const result = h('div', { class: 'sid-pairs' });
  const resultSay = h('p', { class: 'sid-note' });
  const playBtn = btn('Play the next round', () => step());
  const allBtn = btn('Play all rounds', () => playAll());

  function renderSentence() {
    const c0 = words.length - H;
    sentence.replaceChildren(
      ...words.map((w, i) => {
        const inCtx = i >= c0;
        const swaps = SWAPS[i];
        const node = swaps
          ? h('button', { type: 'button', class: 'sid-word swap ctx', title: 'Change this word', onclick: () => { words[i] = swaps[(swaps.indexOf(words[i]) + 1) % swaps.length]; reset(); } }, w)
          : h('span', { class: 'sid-word' + (inCtx ? ' ctx' : '') }, w);
        return [node, ' '];
      }).flat(),
      h('span', { class: 'sid-blank' }, '____'),
    );
  }
  function renderTable() {
    table.replaceChildren(
      h('span', { class: 'hd' }, 'Next word'), h('span', { class: 'hd' }, 'Model’s odds'), h('span', { class: 'hd' }, 'Round assignments: 1 · 2 · 3'),
      ...NEXT.map(([w, p]) => [h('span', { class: 'w' }, w), h('span', { class: 'n' }, pct(p)), chips(g(w), ROUNDS)]).flat(),
    );
  }
  function newDraw() {
    clearTimeout(timer);
    const p = NEXT.map((x) => x[1]);
    const draw = Array.from({ length: 8 }, () => NEXT[pick(p, Math.random)][0]);
    rounds = [draw.map((w) => ({ w }))];
    for (let l = 0; l < ROUNDS; l++) {
      const prev = rounds[l];
      const next = [];
      for (let i = 0; i < prev.length; i += 2) {
        const a = prev[i];
        const b = prev[i + 1];
        const ga = g(a.w)[l];
        const gb = g(b.w)[l];
        const tie = ga === gb;
        const win = tie ? (Math.random() < 0.5 ? a : b) : ga > gb ? a : b;
        next.push({ w: win.w, why: tie ? (a.w === b.w ? `${a.w} vs ${a.w}` : 'same sign: coin flip') : '+ beat −' });
      }
      rounds.push(next);
    }
    shown = 0;
    renderBracket();
  }
  function renderBracket() {
    const heads = ['8 contestants', 'After round 1', 'After round 2', 'Winner'];
    const cells = [];
    heads.forEach((t, c) => cells.push(h('div', { class: 'sid-bhead', style: `grid-column:${c + 1};grid-row:1` }, t)));
    rounds.forEach((round, c) => {
      if (c > shown) return;
      const span = 8 / round.length;
      round.forEach((x, i) => {
        const gv = g(x.w);
        cells.push(h('div', {
          class: 'sid-chip' + (c === ROUNDS ? ' won' : ''),
          style: `grid-column:${c + 1};grid-row:${2 + i * span} / span ${span}`,
        },
        h('span', { class: 'w' }, x.w),
        h('span', { class: 'sid-signs small' }, [0, 1, 2].map((l) => chip(gv[l], l === shown && c === shown && shown < ROUNDS ? 'now' : l < c ? 'used' : ''))),
        x.why ? h('span', { class: 'why' }, x.why) : null));
      });
    });
    bracket.replaceChildren(...cells);
    playBtn.disabled = shown >= ROUNDS;
    allBtn.disabled = shown >= ROUNDS;
    if (shown === 0) {
      const counts = {};
      for (const x of rounds[0]) counts[x.w] = (counts[x.w] || 0) + 1;
      const list = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([w, n]) => `${w} ×${n}`).join(', ');
      say.textContent = `Eight contestants drawn at random from the model’s odds: ${list}. Every copy of a word carries that word’s round assignments. The outlined sign is the one the next round compares.`;
    } else if (shown < ROUNDS) {
      say.textContent = `Round ${shown}: the contestants were paired off, and each pair compared its round-${shown} sign. A + beats a −; two of the same sign is a coin flip. Winners moved right.`;
    } else {
      say.textContent = `“${rounds[ROUNDS][0].w}” wins, so it becomes the next word. Every contestant was a word the model already wanted; the watermark only decided which of them won.`;
    }
  }
  function step() {
    if (shown < ROUNDS) shown++;
    renderBracket();
  }
  function playAll() {
    clearTimeout(timer);
    const go = () => {
      if (shown >= ROUNDS) return;
      step();
      timer = setTimeout(go, 700);
    };
    go();
  }
  function renderResult() {
    const p = NEXT.map((x) => x[1]);
    const q = tilt(p, NEXT.map((x) => g(x[0])), depth);
    let best = 0;
    q.forEach((v, i) => { if (v > q[best]) best = i; });
    result.replaceChildren(
      h('div', { class: 'sid-pairs-key' }, h('span', null, h('i', { class: 'sw outline' }), 'without the watermark'), h('span', null, h('i', { class: 'sw gold' }), `with it (${depth} rounds, these previous tokens, this key)`)),
      ...NEXT.map(([w, pw], i) => h('div', { class: 'sid-pair' },
        h('span', { class: 'w' }, w),
        h('div', { class: 'bars' }, h('span', { class: 'b0', style: `width:${pw * 100}%` }), h('span', { class: 'b1', style: `width:${q[i] * 100}%` })),
        h('span', { class: 'n' }, `${pct(pw)} → ${pct(q[i])}`))),
    );
    const w = NEXT[best][0];
    let up = 0;
    let down = 0;
    q.forEach((v, i) => {
      if (v / p[i] > q[up] / p[up]) up = i;
      if (v / p[i] < q[down] / p[down]) down = i;
    });
    const plusses = (i) => ones(g(NEXT[i][0]), depth);
    resultSay.textContent = depth === ROUNDS
      ? `Words with more + win more often. “${NEXT[up][0]}” (${plusses(up)} of 3 +) goes from ${pct(p[up])} to ${pct(q[up])}; “${NEXT[down][0]}” (${plusses(down)} of 3 +) drops from ${pct(p[down])} to ${pct(q[down])}. Change the previous tokens (click “edge”) or the key and the + and − are redrawn, so other words get the boost. Averaged over every possible set of previous tokens, each word wins exactly as often as the model wanted.`
      : `With 30 rounds, one word takes nearly all the odds in any one spot: here “${w}”, ${pct(q[best])}. Averaged over every possible set of previous tokens, each word still wins exactly as often as the model wanted.`;
  }
  function reset() {
    renderSentence();
    renderTable();
    newDraw();
    renderResult();
  }

  root.append(
    h('div', { class: 'sid-eyebrow' }, 'Demo 1 · one tournament'),
    lede('The model is finishing this sentence. Highlighted: the four previous tokens. Click “edge” to change one of them.'),
    sentence,
    h('div', { class: 'sid-row sid-keyrow' }, h('span', { class: 'sid-label' }, 'Secret key'),
      segmented([[KEYS.claude, 'Claude’s key'], [KEYS.other, 'A different key']], key, (v) => { key = v; reset(); }, 'Secret key')),
    h('div', { class: 'sid-sub' }, '1. Each possible next word gets a + or − per round'),
    table,
    h('p', { class: 'sid-note' }, 'These come from the secret key and the four previous tokens, used as a seed. Same key and same previous tokens give the same signs every time; change either and every sign is redrawn.'),
    h('div', { class: 'sid-sub' }, '2. The tournament'),
    h('div', { class: 'sid-rules' }, chip(true), ' beats ', chip(false), h('span', { class: 'sep' }, '·'), chip(true), chip(true), ' or ', chip(false), chip(false), ' : coin flip'),
    h('div', { class: 'sid-row sid-controls' }, btn('Draw 8 new contestants', () => newDraw()), playBtn, allBtn),
    bracket,
    say,
    h('div', { class: 'sid-sub' }, '3. If you ran this tournament many times'),
    segmented([[ROUNDS, '3 rounds, like the bracket'], [M, '30 rounds, like the real system']], depth, (v) => { depth = v; renderResult(); }, 'Rounds'),
    result,
    resultSay,
  );
  reset();
  return { destroy: () => clearTimeout(timer) };
}
