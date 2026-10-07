// Mode 6 — Puzzles on janus's example grid (4 layers; You · are · absolutely · correct).
// Each answer is checked against model.js, so the puzzles can never disagree with the other modes.
import { key, reach, canReach, routeCount, allRoutes, segmentUsage, schedules } from '../model.js';
import { h, revealIn } from '../dom.js';

const W = ['You', 'are', 'absolutely', 'correct'];
const T = (i) => `<span class="tk">${W[i]}</span>`;
const YES = 'Yes', NO = 'No', TOK = 'Only through a sampled token';

// Each puzzle: question, options, the answer, why, and what the grid shows before/after.
const PUZZLES = [
  { q: `While the model reads the prompt, can information at layer 1 of ${T(0)} reach layer 4 of ${T(3)}?`,
    opts: [YES, NO, TOK], from: [1, 0], to: [4, 3], gen: false, check: () => ({ yes: YES, no: NO, token: TOK })[canReach(4, 4, [1, 0], [4, 3], false)],
    why: `It only has to go up and to the right. For example, ${T(3)} reads the K/V of ${T(0)} at layer 2 in one hop, and the result rises to layer 4. That is one of many routes.`,
    show: { cone: true, route: [{ t: 'rise', l: 1, p: 0 }, { t: 'hop', l: 2, from: 0, to: 3 }, { t: 'rise', l: 2, p: 3 }, { t: 'hop', l: 3, from: 3, to: 3 }, { t: 'rise', l: 3, p: 3 }, { t: 'hop', l: 4, from: 3, to: 3 }] } },
  { q: `While reading the prompt, can information at layer 3 of ${T(2)} reach layer 2 of ${T(3)}?`,
    opts: [YES, NO, TOK], from: [3, 2], to: [2, 3], gen: false, check: () => ({ yes: YES, no: NO, token: TOK })[canReach(4, 4, [3, 2], [2, 3], false)],
    why: `Layer 2 is below layer 3, and nothing moves down while a prompt is read. The terracotta wash is everything layer 3 of ${T(2)} can reach; layer 2 of ${T(3)} is outside it.`,
    show: { cone: true } },
  { q: `Can anything computed at ${T(3)} ever influence ${T(1)}?`,
    opts: [YES, NO, TOK], from: [1, 3], to: [1, 1], gen: true, answer: NO,
    why: `${T(1)} comes earlier, and no position reads a later one: nothing moves left. Even while generating, a sampled token only feeds the next position. Here even the generating cone of ${T(3)} stays on its own side.`,
    show: { cone: true, column: 1, fromColumn: 3 } },
  { q: `While generating, can information at layer 4 of ${T(1)} reach layer 1 of ${T(3)}?`,
    opts: [YES, NO, TOK], from: [4, 1], to: [1, 3], gen: true, check: () => ({ yes: YES, no: NO, token: TOK })[canReach(4, 4, [4, 1], [1, 3], true)],
    why: `Layer 1 is below layer 4, so the one way is down, through a token. The top of ${T(1)} predicts ${T(2)}, which is fed in at the bottom of the next column; layer 1 of ${T(3)} then reads its K/V.`,
    show: { cone: true, route: [{ t: 'top', l: 4, p: 1 }, { t: 'tok', p: 1 }, { t: 'in', p: 2 }, { t: 'hop', l: 1, from: 2, to: 3 }] } },
  { q: `At layer 2, can attention at ${T(3)} read the K/V of ${T(0)} directly, in one hop?`,
    opts: [YES, NO, `Only by passing through ${W[1]} and ${W[2]}`], kv: [2, 0], att: [2, 3], answer: YES,
    why: `Attention at a position reads the K/V of every earlier position at the same layer, however far back, in a single hop.`,
    show: { route: [{ t: 'hop', l: 2, from: 0, to: 3 }] } },
  { q: `At layer 2, attention at ${T(1)} produces a result. Can attention at ${T(2)} read that result in the same layer?`,
    opts: ['Yes, in the same layer', 'No, not until layer 3', TOK], att0: [2, 1], att: [3, 2], answer: 'No, not until layer 3',
    why: `The result joins the residual stream of ${T(1)} after layer 2’s K/V were computed. It becomes part of the K/V of ${T(1)} at layer 3, and ${T(2)} can read it there. This is why several moves right inside one layer count as a single hop.`,
    show: { route: [{ t: 'rise', l: 2, p: 1 }, { t: 'hop', l: 3, from: 1, to: 2 }] } },
  { q: `How many routes run from the K/V at layer 1 of ${T(0)} to the attention input at layer 2 of ${T(2)}?`,
    opts: ['1', '2', '3', '6'], kv: [1, 0], att: [2, 2], check: () => String(routeCount({ l: 1, p: 0 }, { l: 2, p: 2 })),
    why: `janus’s example. One layer up and two positions right, in any order: <span class="mono">UP 1, RIGHT 2</span> · <span class="mono">RIGHT 1, UP 1, RIGHT 1</span> · <span class="mono">RIGHT 2, UP 1</span>. C(3, 1) = 3.`,
    show: { all: true } },
  { q: 'A prompt of 4 tokens, through 4 layers: what is the smallest number of time steps the computation can take?',
    opts: ['4', '7', '16'], answer: '4',
    why: 'Every position of a layer can run at once, so it takes one step per layer. 7 is the diagonal order; 16 is what generating needs, when each new column waits for a sampled token.',
    show: { steps: true } },
];

export default function puzzlesMode(app) {
  const st = { i: 0, answers: new Array(PUZZLES.length).fill(null) };
  let ui = {};
  const answerOf = (pz) => pz.answer ?? pz.check();

  function render() {
    if (!ui.q) return;
    const pz = PUZZLES[st.i];
    const a = st.answers[st.i];
    const right = answerOf(pz);
    ui.dots.replaceChildren(...PUZZLES.map((p, i) => {
      const ans = st.answers[i];
      const b = h('button', { type: 'button', class: ans === null ? '' : ans === answerOf(p) ? 'ok' : 'no', 'aria-current': i === st.i ? 'true' : 'false',
        'aria-label': `Puzzle ${i + 1}${ans === null ? '' : ans === answerOf(p) ? ', right' : ', missed'}`, onclick: () => go(i) }, String(i + 1));
      return b;
    }));
    const done = st.answers.filter((x) => x !== null).length;
    const ok = st.answers.filter((x, i) => x !== null && x === answerOf(PUZZLES[i])).length;
    ui.score.textContent = done ? `${ok} of ${done} right so far` : `${PUZZLES.length} puzzles, no timer`;
    ui.q.innerHTML = `<span class="eyebrow pz-n">Puzzle ${st.i + 1} of ${PUZZLES.length}<br></span>${pz.q}`;
    ui.opts.replaceChildren(...pz.opts.map((o) => {
      const b = h('button', { type: 'button', disabled: a !== null, onclick: () => answer(o), html: o });
      if (a !== null) b.classList.add(o === right ? 'right' : o === a ? 'wrong' : 'dim');
      return b;
    }));
    if (a === null) { ui.fb.replaceChildren(); }
    else {
      ui.fb.replaceChildren(h('div', { class: 'card', tabindex: '-1', html:
        `<p class="verdict">${a === right ? 'Right.' : `Not quite: ${right.replace(/<[^>]+>/g, '')}.`}</p><p class="read">${pz.why}</p>` }));
    }
    ui.prev.disabled = st.i === 0;
    ui.next.textContent = st.i === PUZZLES.length - 1 ? 'See your score' : 'Next ›';
    if (done === PUZZLES.length && st.i === PUZZLES.length - 1 && a !== null) {
      ui.final.hidden = false;
      ui.final.innerHTML = `<p class="read"><b>You got ${ok} of ${PUZZLES.length}.</b> ${ok === PUZZLES.length ? 'Every one.' : 'Go back to any puzzle you missed: the grid shows why.'}</p>`;
    } else ui.final.hidden = true;
  }
  function answer(o) {
    if (st.answers[st.i] !== null) return;
    st.answers[st.i] = o;
    const right = o === answerOf(PUZZLES[st.i]);
    render(); M.paint();
    // The answer buttons are now disabled, so the focused one has dropped out of the tab order:
    // move focus to the verdict (a screen reader reads it there), and Tab goes on to Next.
    // Scroll only the panel to show it; never the page around the embed.
    const card = ui.fb.querySelector('.card');
    if (card) { card.focus({ preventScroll: true }); revealIn(document.getElementById('panel'), card, { smooth: !app.reduced }); }
    else app.say(right ? 'Right.' : 'Not quite.');
  }
  function go(i) { st.i = Math.max(0, Math.min(PUZZLES.length - 1, i)); render(); M.paint(); app.setHash(); }

  const M = {
    id: 'puzzles', label: 'Puzzles', short: 'Puzzles', lockedGrid: true,
    shows: 'Eight quick questions on janus’s example grid; after each answer the grid shows the route, or why there is none.',
    tryThis: 'Answer from the picture in your head first, then check the grid.',
    enter(panel) {
      ui = {};
      ui.dots = h('div', { class: 'dots', role: 'group', 'aria-label': 'Puzzles' });
      ui.score = h('p', { class: 'note' });
      ui.q = h('p', { class: 'puz-q', 'aria-live': 'polite' });
      ui.opts = h('div', { class: 'opts', role: 'group', 'aria-label': 'Answers' });
      ui.fb = h('div', { class: 'fb' });
      ui.prev = h('button', { type: 'button', class: 'pill ghost small', onclick: () => go(st.i - 1) }, '‹ Previous');
      ui.next = h('button', { type: 'button', class: 'pill small', onclick: () => {
        if (st.i === PUZZLES.length - 1) { render(); ui.final.hidden = false; const ok = st.answers.filter((x, i) => x !== null && x === answerOf(PUZZLES[i])).length; const done = st.answers.filter((x) => x !== null).length;
          ui.final.innerHTML = `<p class="read"><b>${ok} of ${done} right</b>${done < PUZZLES.length ? ` (${PUZZLES.length - done} not answered yet)` : ''}. ${ok === PUZZLES.length ? 'Every one.' : 'Go back to any puzzle you missed: the grid shows why.'}</p>`; }
        else go(st.i + 1); } }, 'Next ›');
      ui.final = h('div', { class: 'card', hidden: true });
      ui.again = h('button', { type: 'button', class: 'linkish', onclick: () => { st.answers.fill(null); go(0); } }, 'Start again');
      panel.append(h('div', { class: 'sec pz-top' }, ui.dots, ui.score), h('div', { class: 'sec' }, ui.q, ui.opts, ui.fb),
        h('div', { class: 'sec' }, h('div', { class: 'row' }, ui.prev, ui.next), ui.final, ui.again),
        h('p', { class: 'small-print', html: '“Layer 2 of <span class="tk">are</span>” means the cell at layer 2 in the column whose input is <span class="tk">are</span>.' }));
      render();
    },
    toHash() { return { q: st.i + 1 }; },
    fromHash(p) { const i = parseInt(p.get('q'), 10); if (i >= 1 && i <= PUZZLES.length) st.i = i - 1; },
    paint() {
      const pz = PUZZLES[st.i];
      const answered = st.answers[st.i] !== null;
      const marks = [], wash = new Map(), routes = [], steps = new Map(), on = [];
      let tokens = !!pz.gen;
      const fromCol = pz.show.fromColumn, toCol = pz.show.column;
      if (pz.from) {
        if (fromCol === undefined) marks.push({ l: pz.from[0], p: pz.from[1], text: 'FROM', cls: 'from' });
        if (toCol === undefined) marks.push({ l: pz.to[0], p: pz.to[1], text: 'TO', cls: 'to' });
      }
      if (pz.kv) marks.push({ at: 'kv', l: pz.kv[0], p: pz.kv[1], text: 'A' });
      if (pz.att0) marks.push({ at: 'att', l: pz.att0[0], p: pz.att0[1], text: 'A' });
      if (pz.att) marks.push({ at: 'att', l: pz.att[0], p: pz.att[1], text: 'B', cls: 'b' });
      // questions about a whole column ("anything computed at correct") mark the whole column
      for (const [col, text, cls] of [[fromCol, 'FROM', 'from'], [toCol, 'TO', 'to']]) {
        if (col === undefined) continue;
        for (let l = 1; l <= 4; l++) wash.set(key(l, col), 'soft');
        marks.push({ l: 4, p: col, text, cls, col: true });
      }
      if (answered) {
        const s = pz.show;
        if (s.cone) {
          const r = reach(4, 4, pz.from[0], pz.from[1], !!pz.gen);
          for (const k of r.future.full) wash.set(k, 'fut');
          for (const k of r.future.kv) wash.set(k, 'fut-kv');
          for (const k of r.future.both) wash.set(k, 'fut-kv fut-tok');
          for (const k of r.future.token) wash.set(k, 'fut-tok');
          wash.set(key(pz.from[0], pz.from[1]), 'self');
          // light the token that leaves FROM's column (its way down); the rest stay faint
          if (pz.gen && pz.from[1] < 3) on.push(`tok:${pz.from[1]}`);
        }
        if (s.route) routes.push({ segs: s.route, draw: !app.reduced });
        if (s.all) {
          const A = { l: pz.kv[0], p: pz.kv[1] }, B = { l: pz.att[0], p: pz.att[1] };
          const use = segmentUsage(A, B);
          let max = 1; for (const v of use.values()) max = Math.max(max, v);
          for (const [k, v] of use) {
            const [t, l, a, b] = k.split(':');
            routes.push({ segs: [t === 'hop' ? { t: 'hop', l: +l, from: +a, to: +b } : { t: 'rise', l: +l, p: +a }], width: 2 + 4 * (v / max), arrows: false });
          }
        }
        if (s.steps) for (let l = 1; l <= 4; l++) for (let p = 0; p < 4; p++) { wash.set(key(l, p), 'done'); steps.set(key(l, p), String(schedules.layer.step(l))); }
      }
      app.grid.paint({ marks, wash, routes, steps, on, tokens, dim: answered && routes.length > 0 });
    },
  };
  // sanity: every answer is one of its options
  for (const pz of PUZZLES) if (!pz.opts.includes(pz.answer ?? pz.check())) console.warn('puzzle answer not in options', pz.q);
  return M;
}
