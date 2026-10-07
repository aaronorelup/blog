// Mode 5 — Inside one cell: real attention weights, V's and logit-lens guesses from GPT-2 small,
// precomputed offline (tools-src/info-flow/gen_cell_data.py) and shipped as JSON in data/.
import { h, esc, radios, switchEl, pct } from '../dom.js';

const SENTENCES = [
  { id: 'absolutely', text: 'You are absolutely correct' },
  { id: 'pronoun', text: 'Sarah lent Tom her bike because he' },
  { id: 'repeat', text: 'The cat sat on the mat. The cat sat on the' },
  { id: 'names', text: 'When Mary and John went to the store, John gave a drink to' },
];
const MODEL = 'GPT-2 small (124M, 2019): 12 layers, 12 heads, 768-wide residual stream';
const MODEL_SHORT = 'GPT-2 small (124M, 2019) · 12 layers · 12 heads · 768 wide'; // the embed's short frame
const modelEl = () => h('p', { class: 'eyebrow cv-model' }, h('span', { class: 'm-long' }, MODEL), h('span', { class: 'm-short' }, MODEL_SHORT));

const tokH = (t) => {
  const s = String(t).replace(/\n/g, '⏎');
  return s.startsWith(' ') ? `<span class="sp" aria-hidden="true">␣</span>${esc(s.slice(1))}` : esc(s);
};
const tokPlain = (t) => String(t).trim() || '(space)';

export default function cellMode(app) {
  const st = { s: 'absolutely', pos: 3, layer: 4, head: 11, hide: false, posSet: false, tab: 'att' };
  const cache = new Map();
  let ui = {};
  let view = null;
  let data = null;
  let loadSeq = 0;

  async function load(id) {
    if (cache.has(id)) return cache.get(id);
    const r = await fetch(`data/${id}.json`);
    if (!r.ok) throw new Error(`data/${id}.json: ${r.status}`);
    const d = await r.json();
    cache.set(id, d);
    return d;
  }
  async function select(id, keep) {
    const seq = ++loadSeq;
    st.s = id;
    data = cache.get(id) || null;
    if (!data) { renderView(); try { data = await load(id); } catch (e) { data = null; if (view) view.innerHTML = `<p class="read">Could not load the data for this sentence (${esc(e.message)}).</p>`; return; } }
    if (seq !== loadSeq) return;
    const T = data.tokens.length;
    if (!keep || st.pos >= T) st.pos = T - 1;
    renderAll();
  }

  const w = (l, hd, p, j) => data.attn[l][hd][(p * (p + 1)) / 2 + j];

  // ------------------------------------------------------------------ stage view
  function renderView() {
    if (!view) view = h('div', { class: 'cellview' });
    if (!data) { view.replaceChildren(modelEl(), h('p', { class: 'read' }, 'Loading the real numbers…')); return; }
    const { tokens } = data;
    const T = tokens.length, p = st.pos, l = st.layer, hd = st.head;
    // The view is rebuilt on every change, which would drop keyboard focus to the page while the
    // reader arrows through the position chips: note which group had it and give it back.
    const ae = document.activeElement;
    const refocus = ae && view.contains(ae) ? (ae.closest('.chips') ? '.chips' : ae.closest('.cv-switch') ? '.cv-switch' : null) : null;
    view.replaceChildren();
    view.append(modelEl());
    // position chips
    const chips = radios({ cls: 'chips', label: 'Position (token)', value: p,
      items: tokens.map((t, i) => ({ value: i, aria: `position ${i + 1}: ${tokPlain(t)}` })),
      render: (b, it) => { b.className = 'chip' + (it.value > p ? ' later' : ''); b.innerHTML = tokH(tokens[it.value]); },
      onChange: (v) => { st.pos = v; st.posSet = true; renderAll(); app.setHash(); app.say(`Position ${v + 1}, ${tokPlain(tokens[v])}.`); } });
    // In a short, narrow stage (the post's 16:9 embed) the two blocks would stack and the lens
    // would sit below the fold; CSS shows this switch there and one block at a time.
    view.dataset.tab = st.tab;
    const sw = radios({ cls: 'seg cv-switch', label: 'Show', value: st.tab,
      items: [{ value: 'att', label: 'Attention' }, { value: 'lens', label: 'Logit lens' }],
      onChange: (v) => { st.tab = v; view.dataset.tab = v; app.say(v === 'att' ? 'Showing attention.' : 'Showing the logit lens.'); } });
    view.append(h('div', { class: 'cv-top' }, chips, sw));
    const left = h('div', { class: 'cv-att' }), right = h('div', { class: 'cv-lens' });
    view.append(h('div', { class: 'cv-cols' }, left, right));
    left.append(h('h3', { class: 'cv-h', html: `Attention · layer ${l + 1}, head ${hd + 1}, at <span class="q">‘${tokH(tokens[p])}’</span>` }));
    left.append(h('p', { class: 'read', html: `The <span class="c-att">query</span> from ‘${tokH(tokens[p])}’ is compared with the <span class="c-kv">key</span> of this and every earlier position; a softmax turns the scores into these weights.${p < T - 1 ? ' Later positions (dimmed above) cannot be seen.' : ''}` }));

    // rows
    const rows = h('div', { class: 'att-rows', role: 'table', 'aria-label': `Attention weights at layer ${l + 1}, head ${hd + 1}` });
    rows.append(h('span', { class: 'hd', role: 'columnheader' }, 'Looks at'), h('span', { class: 'hd', role: 'columnheader' }, 'Weight'), h('span', { class: 'hd', role: 'columnheader' }, ''),
      h('span', { class: 'hd', role: 'columnheader', title: 'The first 8 of the 64 numbers in this head’s value vector at that position' }, 'V (8 of 64)'));
    const from = st.hide && p > 0 ? 1 : 0;
    let max = 0;
    for (let j = from; j <= p; j++) max = Math.max(max, w(l, hd, p, j));
    const V = data.v[l][hd];
    const res = new Array(data.v_dims).fill(0);
    for (let j = 0; j <= p; j++) for (let d = 0; d < data.v_dims; d++) res[d] += w(l, hd, p, j) * V[j][d];
    let vmax = 0;
    for (let j = 0; j <= p; j++) for (const x of V[j]) vmax = Math.max(vmax, Math.abs(x));
    for (const x of res) vmax = Math.max(vmax, Math.abs(x));
    const cells = (arr) => h('span', { class: 'vcells', role: 'cell' }, ...arr.map((x, d) => {
      const a = Math.min(100, Math.round((Math.abs(x) / (vmax || 1)) * 100));
      return h('i', { title: `V[${d + 1}] = ${x.toFixed(2)}`, style: { background: `color-mix(in srgb, ${x >= 0 ? 'var(--c-kv)' : 'var(--c-tok)'} ${a}%, var(--pc-hover))` } });
    }));
    if (from === 1) {
      rows.append(h('span', { class: 'hidden-row', style: { gridColumn: '1 / -1' }, html: `‘${tokH(tokens[0])}’ hidden: it takes ${pct(w(l, hd, p, 0))} of the weight. The bars below are rescaled to the rest.` }));
    }
    for (let j = from; j <= p; j++) {
      const x = w(l, hd, p, j);
      rows.append(
        h('span', { class: 't' + (j === p ? ' self' : ''), role: 'cell', html: tokH(tokens[j]) }),
        h('span', { class: 'bar', role: 'cell', title: x.toFixed(3) }, h('i', { style: { width: `${max ? (x / max) * 100 : 0}%` } })),
        h('span', { class: 'pct', role: 'cell' }, pct(x)),
        cells(V[j]));
    }
    rows.append(h('span', { class: 'sumlbl sum', style: { gridColumn: '1 / 4' } }, 'Result: the weighted sum of these V’s'), h('span', { class: 'sum' }, cells(res.map((x) => Math.round(x * 100) / 100))));
    left.append(rows);
    left.append(h('p', { class: 'small-print', html: `The result (all 64 numbers, of which 8 are shown; violet = positive, gold = negative) is joined with the other 11 heads' results and added to the residual stream at ‘${tokH(tokens[p])}’ before the MLP.${from === 1 ? ' The result includes the hidden first position.' : ''}` }));
    right.append(lensBlock());
    if (refocus) view.querySelector(`${refocus} [aria-checked="true"]`)?.focus({ preventScroll: true });
  }

  // ------------------------------------------------------------------ panel parts
  function lensBlock() {
    const p = st.pos, T = data.tokens[p];
    const box = h('div', { class: 'lens', role: 'list', 'aria-label': 'Logit lens: the top guess for the next token after each layer' });
    for (let k = 1; k <= 12; k++) {
      const top = data.lens[k][p];
      const [t0, p0] = top[0];
      const cls = 'lr' + (k === st.layer + 1 ? ' cur' : '') + (k === 12 ? ' final' : '');
      box.append(h('span', { class: 'll' }, 'L' + k),
        h('span', { class: cls, role: 'listitem', title: top.map(([t, pr]) => `${tokPlain(t)} ${pct(pr)}`).join(' · ') },
          h('span', { class: 'lt' }, h('span', { class: 'tk', html: tokH(t0) })),
          h('span', { class: 'lb' }, h('i', { style: { width: `${Math.round(p0 * 100)}%` } })),
          h('span', { class: 'lp' }, pct(p0)),
          h('span', { class: 'la', html: 'or ' + top.slice(1).map(([t]) => `<span class="tk">${tokH(t)}</span>`).join(' ') })));
    }
    return h('div', {},
      h('h3', { class: 'cv-h', html: `Logit lens · what ‘${tokH(T)}’ would predict` }),
      h('p', { class: 'read' }, 'If the model stopped after each layer, its top guess for the next token:'),
      box,
      h('p', { class: 'small-print' }, 'Each layer’s residual stream passed straight through the model’s final layer norm and unembedding. The bottom row (layer 12) is the model’s real prediction. The highlighted row is the layer picked for attention.'),
      h('p', { class: 'small-print' }, 'Early rows often just echo the current token: GPT-2 reads and writes tokens with the same embedding table, so a stream that has barely changed still looks like its own input.'));
  }
  function renderTries() {
    // rebuilt only when the sentence changes, so a pressed button keeps keyboard focus
    if (!ui.tries || !data || ui.tries._for === data) return;
    ui.tries._for = data;
    ui.tries.replaceChildren(...data.tries.map((t) => h('button', { type: 'button', html: `‘${tokH(data.tokens[t.pos])}’ · layer ${t.layer + 1} · head ${t.head + 1}: ${esc(t.note)}`,
      onclick: () => { st.pos = t.pos; st.layer = t.layer; st.head = t.head; st.hide = false; renderAll(); app.setHash(); } })));
  }
  function renderAll() {
    renderView();
    if (ui.layer) { ui.layer.set(st.layer); ui.head.set(st.head); ui.sents.set(st.s); ui.hide.input.checked = st.hide; }
    renderTries();
  }

  const M = {
    id: 'cell', label: 'Inside one cell', short: 'One cell',
    shows: 'Real attention weights and next-token guesses from GPT-2 small, for any position, layer and head you pick.',
    tryThis: 'In the second sentence, pick ‘he’, layer 5, head 4: where does it look?',
    altView() { if (!view) renderView(); return view; },
    enter(panel) {
      ui = {};
      ui.sents = radios({ cls: 'sents', label: 'Sentence', value: st.s, items: SENTENCES.map((s) => ({ value: s.id, label: s.text })),
        onChange: (v) => { select(v); app.setHash(); } });
      ui.layer = radios({ cls: 'sq-pick', label: 'Layer', value: st.layer, items: Array.from({ length: 12 }, (_, i) => ({ value: i, label: String(i + 1), aria: `Layer ${i + 1}` })),
        onChange: (v) => { st.layer = v; renderAll(); app.setHash(); } });
      ui.head = radios({ cls: 'sq-pick', label: 'Head', value: st.head, items: Array.from({ length: 12 }, (_, i) => ({ value: i, label: String(i + 1), aria: `Head ${i + 1}` })),
        onChange: (v) => { st.head = v; renderAll(); app.setHash(); } });
      ui.hide = switchEl({ label: 'Hide the first position', desc: 'Most GPT-2 heads put most of their weight on the first token (61–81% on average in these sentences). Its V is small, on average about a quarter the size of the others’, so that weight adds little. Hide it to rescale the rest.',
        checked: st.hide, onChange: (v) => { st.hide = v; renderView(); app.setHash(); } });
      ui.tries = h('div', { class: 'tries' });
      panel.append(
        h('div', { class: 'sec' }, h('h3', {}, 'Sentence'), ui.sents),
        h('div', { class: 'sec' }, h('h3', {}, 'Layer'), ui.layer, h('h3', { style: { marginTop: '10px' } }, 'Head'), ui.head,
          h('p', { class: 'small-print' }, 'Numbered from 1 here; research papers often count from 0, so layer 5, head 12 here is their 4.11.')),
        h('div', { class: 'sec' }, ui.hide),
        h('div', { class: 'sec' }, h('h3', {}, 'Try these'), ui.tries),
        h('div', { class: 'sec', html:
          '<h3>What Q, K and V answer</h3><ul class="qkv">' +
          '<li><b class="q">Q</b>What kind of keys in the past should I look at?</li>' +
          '<li><b>K</b>What kind of queries should look here?</li>' +
          '<li><b>V</b>What should a position that looks here receive?</li></ul>' +
          '<p class="small-print">janus’s framing of the three. Q comes from this position’s residual stream; K and V from this and every earlier position’s, at the same layer.</p>' }),
        h('p', { class: 'small-print' }, 'Tokens are GPT-2’s own pieces of text; ␣ marks the space a token starts with. Computed offline on a laptop CPU with the Hugging Face transformers library; weights rounded to three decimals.'));
      select(st.s, true);
    },
    gridChanged() {},
    toHash() { return { s: st.s, pos: st.pos + 1, layer: st.layer + 1, head: st.head + 1, hide: st.hide ? '1' : null }; },
    fromHash(p) {
      if (SENTENCES.some((s) => s.id === p.get('s'))) st.s = p.get('s');
      const pos = parseInt(p.get('pos'), 10), l = parseInt(p.get('layer'), 10), hd = parseInt(p.get('head'), 10);
      if (pos >= 1) st.pos = pos - 1;
      if (l >= 1 && l <= 12) st.layer = l - 1;
      if (hd >= 1 && hd <= 12) st.head = hd - 1;
      st.hide = p.get('hide') === '1';
    },
    paint() {},
  };
  return M;
}
