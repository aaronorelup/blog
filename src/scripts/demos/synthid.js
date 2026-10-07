// SynthID-Text, small enough to watch. Mounted by <ao-demo name="synthid" part="…"> in
// AO-040 (claude-text-watermark.md); one module, five parts:
//
//   tournament  how one word is picked: coins hashed from a key and the last 4 tokens
//   certain     why a near-certain token ("Paris", a URL) comes out the same
//   detect      scoring a text for the watermark, and why only the key holder can
//   edit        what edits, rewording and tricks do to the score
//   book        expected detection for a long text after you edit it
//
// The watermark is the published algorithm (Dathathri et al., Nature 634, 2024, and
// google-deepmind/synthid-text): Bernoulli(0.5) g-values from a hash of the key, the previous
// H = 4 tokens and the candidate, one per tournament layer; m = 30 layers applied to the
// probabilities with the paper's vectorised update; repeated-context masking; the weighted
// mean score. The hash is ours, so nothing here can check real Claude or Gemini text.
// What is NOT real is the model: a hand-written menu of word choices stands in for Claude,
// and a token is a whole word or a single punctuation mark.
import '../../styles/demos/synthid.css';

const H = 4; // context tokens hashed with the key (the paper's H; ngram_len = 5 in the code)
const M = 30; // tournament layers (the paper's m)

// detector_mean.py's weighted mean: linspace(10, 1, m), rescaled to sum to m, so early layers,
// which carry most of the signal, count most.
const W = (() => {
  const raw = Array.from({ length: M }, (_, i) => 10 - (9 * i) / (M - 1));
  const sum = raw.reduce((a, b) => a + b, 0);
  return raw.map((x) => (x * M) / sum);
})();
// One token's score is 0.5 on average without a watermark; this is its spread.
const TOKEN_SD = (0.5 * Math.sqrt(W.reduce((a, w) => a + w * w, 0))) / M;
const FLAG_Z = 2.326; // one-sided, 1% false positives: the paper's operating point

// Keys are arbitrary integers. The toy's letters all share their fixed words, so each key gives
// unwatermarked letters a small constant offset; "claude" is the first small integer whose
// unwatermarked letters average a score of 0.500 (key 3: mean z -0.05 over 120 letters).
const KEYS = { claude: 3, other: 0x0ddba110 };

// ------------------------------------------------------------------------------------------
// Hashing. FNV-1a over the n-gram, then a murmur finaliser per layer.
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
function mix(h) {
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}
const SALT = Array.from({ length: M }, (_, l) => mix(Math.imul(l + 1, 0x9e3779b9)));
const gCache = new Map();
// The 30 coins for one candidate token in one context, under one key.
function gvals(key, ctx, tok) {
  const id = key + '\u0001' + ctx.join('\u0002') + '\u0003' + tok;
  let g = gCache.get(id);
  if (g) return g;
  const base = fnv1a(id);
  g = new Uint8Array(M);
  for (let l = 0; l < M; l++) g[l] = mix(base ^ SALT[l]) >>> 31;
  if (gCache.size > 250000) gCache.clear();
  gCache.set(id, g);
  return g;
}
const tokScore = (g) => {
  let s = 0;
  for (let l = 0; l < M; l++) s += W[l] * g[l];
  return s / M;
};
const ones = (g, n = M) => {
  let c = 0;
  for (let l = 0; l < n; l++) c += g[l];
  return c;
};

// The tournament, all m layers at once: synthid-text's update_scores. Each layer moves
// probability toward the candidates whose coin is 1, by exactly as much as it takes from the
// ones whose coin is 0, so the total stays 1. This is the exact distribution of the winner of
// a 2^m-candidate knockout, without drawing 2^m candidates.
function tilt(p, rows) {
  const q = Float64Array.from(p);
  for (let l = 0; l < M; l++) {
    let mass = 0;
    for (let i = 0; i < q.length; i++) mass += q[i] * rows[i][l];
    for (let i = 0; i < q.length; i++) q[i] *= 1 + rows[i][l] - mass;
  }
  return q;
}

// ------------------------------------------------------------------------------------------
// Randomness and small maths.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pick(p, r) {
  const x = r();
  let acc = 0;
  for (let i = 0; i < p.length; i++) {
    acc += p[i];
    if (x < acc) return i;
  }
  return p.length - 1;
}
// Upper tail of the standard normal.
function upper(z) {
  if (z <= 0) return 1 - upper(-z);
  if (z > 3) {
    const z2 = z * z;
    return (Math.exp(-z2 / 2) / (z * Math.sqrt(2 * Math.PI))) * (1 - 1 / z2 + 3 / (z2 * z2) - 15 / (z2 * z2 * z2));
  }
  const x = z / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const erfc = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-x * x);
  return erfc / 2;
}
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

// ------------------------------------------------------------------------------------------
// Tokens. A word (letters, digits, apostrophes) or any single other character, so an
// invisible character inserted between words becomes a token of its own, as it would in a
// real tokenizer.
const TOKEN_RE = /[\p{L}\p{N}][\p{L}\p{N}'’]*|[^\s\p{L}\p{N}]/gu;
const INVISIBLE_RE = /\p{Cf}/gu;
const IS_INVISIBLE = /^\p{Cf}$/u;
const isWord = (t) => /^[\p{L}\p{N}]/u.test(t);
function tokenize(text) {
  const out = [];
  for (const m of text.matchAll(TOKEN_RE)) out.push({ t: m[0], at: m.index });
  return out;
}

// ------------------------------------------------------------------------------------------
// The toy model: a letter with a menu of interchangeable choices at each slot, weighted.
// Everything outside braces is fixed: the model is certain of it.
const LETTER = `{Dear:6|Hi:4|Hello:2} Mira,

The {train:6|ferry:3|bus:2|coach:1} from Paris {got in:5|arrived:5|pulled in:2|rolled in:1} {late:6|early:4|at noon:2|after dark:2} on Tuesday, and the {rain:6|fog:4|wind:3|drizzle:2} had {already:5|finally:4|mostly:2|just:2} {cleared:5|lifted:4|eased:3|stopped:2} by the time I {reached:5|found:4|got to:3|walked to:2} the tea house. It {sits:5|stands:4|waits:2|hides:2} at the {edge:6|end:3|far end:2|bottom:2} of a {small:4|narrow:3|quiet:3|steep:2|walled:1} garden, {behind:5|past:4|beyond:2|inside:1} a {gate:5|wall:3|hedge:3|fence:2} that nobody {seems to lock:4|ever locks:3|bothers to close:3|remembers to shut:2}. The {owner:5|keeper:3|old man:3|caretaker:2} {poured:5|made:4|brewed:3|served:2} two {cups:6|bowls:4|pots:2} of {green:5|barley:3|roasted:3|smoky:1} tea and asked {where I had come from:5|how far I had come:3|where I had travelled from:2|what brought me:2}.

I {showed:5|handed:4|read:2|gave:2} him the {address:6|note:4|card:2} you {sent:5|gave:4|wrote:2} me (14 Rue des Cerisiers, Paris), and he {laughed:5|smiled:4|nodded:3|grinned:2}. His {mother:5|grandmother:4|aunt:2|father:2} {grew up:5|lived:5|was born:2} {two:4|three:4|four:3|five:1} doors {down:6|away:3|along:2} from it. Above the {counter:5|door:4|stove:2|window:2} {hangs:5|sits:3|is:2} a {sign:5|board:4|scroll:3|plaque:2} with {one:5|a single:4|just one:2} line {painted:5|written:4|carved:3} on it, and he {read:5|recited:4|said:2} it to me {word for word:5|without looking:4|very slowly:3|twice:2}: "The kettle remembers everyone who waits for it."

I'm {staying:6|sleeping:4|living:2} {upstairs:6|in the back room:4|above the shop:3|in the attic:2} until Friday. The {window:6|room:4|balcony:2} {looks out:5|opens:4|faces out:2} {over:5|onto:4|across:2} the {garden:5|pond:3|cherry trees:3|rooftops:2}, and {every:5|each:4} {morning:6|evening:4|night:2} a {cat:5|heron:3|crow:3|fox:2} {comes:5|turns up:4|wanders in:2} to {inspect:4|watch:4|judge:3|ignore:2} me. {Write:5|Send word:4|Reply:2} {soon:6|when you can:4|this week:2}, and {bring:5|pack:4|send:2} the {notebook:5|manuscript:4|pages:2|draft:2}: the {second:5|third:4|last:2} chapter still {needs:6|wants:3|deserves:2} {work:5|your eyes:4|cutting:2}. The directions are at aaronorelup.com/ledger/ if you {lose:5|misplace:4|forget:2} this letter.

{Yours:5|Love:4|With love:3|Warmly:2},
A.`;

function compile(src) {
  const steps = [];
  let pending = '';
  const split = (raw) => {
    const toks = [];
    let last = 0;
    for (const m of raw.matchAll(TOKEN_RE)) {
      toks.push({ t: m[0], pre: raw.slice(last, m.index) });
      last = m.index + m[0].length;
    }
    return { toks, tail: raw.slice(last) };
  };
  for (const m of src.matchAll(/\{([^}]*)\}|([^{]+)/g)) {
    if (m[2] != null) {
      const { toks, tail } = split(m[2]);
      toks.forEach((x, i) => steps.push({ fixed: x.t, pre: (i === 0 ? pending : '') + x.pre }));
      pending = toks.length ? tail : pending + tail;
    } else {
      const opts = m[1].split('|').map((o) => {
        const [text, w] = o.split(':');
        const { toks } = split(text);
        return { toks: toks.map((x) => x.t), pres: toks.map((x) => x.pre), w: w ? Number(w) : 1 };
      });
      steps.push({ slot: opts, pre: pending });
      pending = '';
    }
  }
  return steps;
}
const STEPS = compile(LETTER);

// Synonyms for the swap attack: the single-word options that share a slot.
const SYNONYMS = new Map();
for (const s of STEPS) {
  if (!s.slot) continue;
  const words = s.slot.filter((o) => o.toks.length === 1).map((o) => o.toks[0]);
  for (const w of words) {
    const set = SYNONYMS.get(w) || new Set();
    for (const v of words) if (v !== w) set.add(v);
    if (set.size) SYNONYMS.set(w, set);
  }
}

// Write the letter one token at a time. `junk` makes the model put a token after every word
// (the emoji trick); those tokens are seen while generating but left out of the text.
function generate({ key = KEYS.claude, watermark = true, seed = null, junk = null } = {}) {
  const r = seed == null ? Math.random : rng(seed);
  const out = [];
  const seen = [];
  const used = new Set();
  const withJunk = [];
  const choose = (cands, probs) => {
    const ctx = [];
    for (let j = seen.length - H; j < seen.length; j++) ctx.push(j < 0 ? '<s>' : seen[j]);
    const id = ctx.join('\u0002');
    let p = probs;
    // Repeated-context masking: a context seen before in this text gets no watermark,
    // so a repeated phrase can't be pushed the same way twice.
    if (watermark && !used.has(id)) {
      used.add(id);
      if (cands.length > 1) p = tilt(probs, cands.map((c) => gvals(key, ctx, c)));
    }
    return cands.length > 1 ? cands[pick(p, r)] : cands[0];
  };
  const emit = (t, pre) => {
    out.push({ t, pre });
    seen.push(t);
    withJunk.push(pre + t);
    if (junk && isWord(t)) {
      const j = choose([junk], [1]);
      seen.push(j);
      withJunk.push(j);
    }
  };
  for (const s of STEPS) {
    if (s.fixed != null) {
      emit(choose([s.fixed], [1]), s.pre);
      continue;
    }
    let live = s.slot;
    let k = 0;
    while (live.length) {
      const w = new Map();
      for (const o of live) w.set(o.toks[k], (w.get(o.toks[k]) || 0) + o.w);
      const cands = [...w.keys()];
      const tot = cands.reduce((a, c) => a + w.get(c), 0);
      const t = choose(cands, cands.map((c) => w.get(c) / tot));
      const o = live.find((x) => x.toks[k] === t);
      emit(t, k === 0 ? s.pre : o.pres[k]);
      live = live.filter((x) => x.toks[k] === t && x.toks.length > k + 1);
      k++;
    }
  }
  return { text: out.map((x) => x.pre + x.t).join(''), raw: withJunk.join('') };
}

// The detector: score every token whose 4-token context is complete and new.
function detect(text, { key = KEYS.claude, strip = true, limitWords = Infinity } = {}) {
  const removed = strip ? (text.match(INVISIBLE_RE) || []).length : 0;
  const src = strip ? text.replace(INVISIBLE_RE, '') : text;
  const toks = tokenize(src);
  const seen = new Set();
  let sum = 0;
  let n = 0;
  let words = 0;
  for (let i = 0; i < toks.length; i++) {
    const x = toks[i];
    if (isWord(x.t)) words++;
    if (words > limitWords) {
      x.state = 'beyond';
      continue;
    }
    if (i < H) {
      x.state = 'edge';
      continue;
    }
    x.ctx = toks.slice(i - H, i).map((y) => y.t);
    const id = x.ctx.join('\u0002');
    if (seen.has(id)) {
      x.state = 'repeat';
      continue;
    }
    seen.add(id);
    x.g = gvals(key, x.ctx, x.t);
    x.s = tokScore(x.g);
    x.state = 'scored';
    sum += x.s;
    n++;
  }
  const score = n ? sum / n : 0.5;
  const z = n ? (score - 0.5) / (TOKEN_SD / Math.sqrt(n)) : 0;
  return { src, toks, n, score, z, p: upper(z), removed, words: Math.min(words, limitWords) };
}
const ngrams = (text) => {
  const t = tokenize(text).map((x) => x.t);
  const set = new Set();
  for (let i = H; i < t.length; i++) set.add(t.slice(i - H, i + 1).join('\u0002'));
  return set;
};

// The letter every part starts from, so the post can talk about one text.
const SEED = 2026;
const LETTER_CLAUDE = generate({ seed: SEED }).text;
const LETTER_PLAIN = generate({ seed: SEED, watermark: false }).text;

// ------------------------------------------------------------------------------------------
// DOM helpers.
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'style') el.style.cssText = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
  }
  for (const c of kids.flat()) if (c != null && c !== false) el.append(c);
  return el;
}
const btn = (label, onclick, extra = {}) => h('button', { type: 'button', class: 'sid-btn', onclick, ...extra }, label);
function segmented(options, value, onchange, label) {
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
const bits = (g, n = M, cls = '') => h('span', { class: 'sid-bits ' + cls, 'aria-hidden': 'true' }, Array.from({ length: n }, (_, l) => h('i', { class: g[l] ? 'on' : '' })));
const pct = (x) => {
  if (x >= 0.9999995) return '100%';
  if (x < 0.000005) return x <= 0 ? '0%' : '<0.001%';
  // Near-certain odds keep digits until the first one that isn't a 9: 99.950%, 99.99987%.
  if (x > 0.99) return (x * 100).toFixed(clamp(Math.ceil(-Math.log10(1 - x)) - 1, 2, 6)) + '%';
  if (x >= 0.1) return (x * 100).toFixed(0) + '%';
  if (x >= 0.01) return (x * 100).toFixed(1) + '%';
  if (x >= 0.0001) return (x * 100).toFixed(2) + '%';
  return (x * 100).toFixed(3) + '%';
};
const oneIn = (p) => {
  if (p <= 0 || 1 / p > 1e12) return 'less than once in a trillion';
  const n = 1 / p;
  if (n < 1.5) return 'most of the time';
  return 'about 1 time in ' + Math.round(n).toLocaleString('en-US');
};

// The score readout shared by the detect and edit parts.
function scorePanel() {
  const el = h('div', { class: 'sid-score', 'aria-live': 'polite' });
  const verdict = h('div', { class: 'sid-verdict' });
  const line = h('p', { class: 'sid-score-line' });
  const gauge = h('div', { class: 'sid-gauge', 'aria-hidden': 'true' });
  const band = h('span', { class: 'sid-gauge-band' });
  const flag = h('span', { class: 'sid-gauge-flag' });
  const dot = h('span', { class: 'sid-gauge-dot' });
  const lo = -3;
  const hi = 9;
  const at = (z) => ((clamp(z, lo, hi) - lo) / (hi - lo)) * 100 + '%';
  band.style.left = at(-2);
  band.style.width = `calc(${at(2)} - ${at(-2)})`;
  flag.style.left = at(FLAG_Z);
  gauge.append(band, flag, dot);
  const axis = h('div', { class: 'sid-gauge-axis', 'aria-hidden': 'true' },
    h('span', { style: `left:${at(0)}` }, 'chance'),
    h('span', { style: `left:${at(FLAG_Z)}` }, 'flag line'),
    h('span', { style: `left:${at(hi)}`, class: 'end' }, '9σ'));
  el.append(verdict, gauge, axis, line);
  return {
    el,
    update(r) {
      dot.style.left = at(r.z);
      el.dataset.state = r.z >= FLAG_Z ? 'yes' : r.z >= 1.28 ? 'maybe' : 'no';
      verdict.textContent = r.n < 1 ? 'Nothing to score' : r.z >= FLAG_Z ? 'Watermark found' : r.z >= 1.28 ? 'Uncertain' : 'No watermark found';
      const sd = TOKEN_SD / Math.sqrt(Math.max(1, r.n));
      line.replaceChildren(
        h('b', null, r.score.toFixed(3)),
        ` over ${r.n} scored tokens. Text without this watermark averages 0.500, give or take ${sd.toFixed(3)}; this is `,
        h('b', null, (r.z >= 0 ? '+' : '') + r.z.toFixed(1) + 'σ'),
        `. Unwatermarked text scores this high ${oneIn(r.p)}.`,
      );
    },
  };
}

// The text with each scored token shaded by how much evidence it carries.
function tokenView(onPick) {
  const el = h('div', { class: 'sid-text', tabindex: '0', 'aria-label': 'The text, shaded by watermark evidence per word' });
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
function tokenDetail(r, i, key) {
  const x = r.toks[i];
  if (!x) return '';
  if (x.state !== 'scored') {
    const why = { edge: 'it has fewer than 4 tokens before it', repeat: 'its 4-token context already appeared earlier, so it was masked', beyond: 'it is past the length being checked' }[x.state];
    return h('span', null, h('b', null, `“${x.t || '·'}”`), ` isn’t scored: ${why}.`);
  }
  return h('span', null,
    h('b', null, `“${x.t}”`), ' after ', h('i', null, x.ctx.map((c) => (IS_INVISIBLE.test(c) ? '·' : c)).join(' ')),
    `: ${ones(x.g)} of its 30 coins are 1 under ${key === KEYS.claude ? 'Claude’s' : 'this'} key (weighted score ${x.s.toFixed(2)}). `,
    bits(x.g, M, 'inline'));
}

// ------------------------------------------------------------------------------------------
// Part: tournament.
const SENTENCE = ['The', 'tea', 'house', 'sits', 'at', 'the', 'edge', 'of', 'the'];
const SWAPS = { 4: ['at', 'by'], 6: ['edge', 'end', 'foot'] };
const NEXT = [['garden', 0.34], ['river', 0.2], ['forest', 0.16], ['town', 0.12], ['sea', 0.1], ['world', 0.08]];

function partTournament(root) {
  const words = SENTENCE.slice();
  let key = KEYS.claude;
  let draw = [];
  let rounds = [];
  let shown = 0;
  let timer = 0;
  const ctx = () => words.slice(-H);
  const g = (w) => gvals(key, ctx(), w);

  const sentence = h('p', { class: 'sid-sentence' });
  const bracket = h('div', { class: 'sid-bracket', 'aria-live': 'polite' });
  const say = h('p', { class: 'sid-note' });
  const exact = h('div', { class: 'sid-bars' });
  const playBtn = btn('Play the next layer', () => step());
  const allBtn = btn('Play all three', () => playAll());

  function renderSentence() {
    const c0 = words.length - H;
    sentence.replaceChildren(
      ...words.map((w, i) => {
        const inCtx = i >= c0;
        const swaps = SWAPS[i];
        const node = swaps
          ? h('button', { type: 'button', class: 'sid-word swap' + (inCtx ? ' ctx' : ''), title: 'Change this word', onclick: () => { words[i] = swaps[(swaps.indexOf(words[i]) + 1) % swaps.length]; reset(); } }, w)
          : h('span', { class: 'sid-word' + (inCtx ? ' ctx' : '') }, w);
        return [node, ' '];
      }).flat(),
      h('span', { class: 'sid-blank' }, '____'),
    );
  }
  function newDraw() {
    clearTimeout(timer);
    const p = NEXT.map((x) => x[1]);
    draw = Array.from({ length: 8 }, () => NEXT[pick(p, Math.random)][0]);
    rounds = [draw.map((w) => ({ w }))];
    for (let l = 0; l < 3; l++) {
      const prev = rounds[l];
      const next = [];
      for (let i = 0; i < prev.length; i += 2) {
        const a = prev[i];
        const b = prev[i + 1];
        const ga = g(a.w)[l];
        const gb = g(b.w)[l];
        const tie = ga === gb;
        const win = tie ? (Math.random() < 0.5 ? a : b) : ga > gb ? a : b;
        next.push({ w: win.w, tie, from: [a.w, b.w] });
      }
      rounds.push(next);
    }
    shown = 0;
    renderBracket();
  }
  function renderBracket() {
    const heads = ['8 draws', 'Layer 1', 'Layer 2', 'Layer 3'];
    const cells = [];
    heads.forEach((t, c) => cells.push(h('div', { class: 'sid-bhead', style: `grid-column:${c + 1};grid-row:1` }, t)));
    rounds.forEach((round, c) => {
      if (c > shown) return;
      const span = 8 / round.length;
      round.forEach((x, i) => {
        const gv = g(x.w);
        const chip = h('div', {
          class: 'sid-chip' + (c === 3 ? ' won' : '') + (x.tie ? ' tie' : ''),
          style: `grid-column:${c + 1};grid-row:${2 + i * span} / span ${span}`,
        }, h('span', { class: 'w' }, x.w), h('span', { class: 'sid-bits small' }, [0, 1, 2].map((l) => h('i', { class: (gv[l] ? 'on' : '') + (l === shown && c === shown && shown < 3 ? ' now' : '') }))));
        cells.push(chip);
      });
    });
    bracket.replaceChildren(...cells);
    playBtn.disabled = shown >= 3;
    allBtn.disabled = shown >= 3;
    if (shown === 0) say.textContent = 'Eight candidates drawn from the model’s own odds, with repeats. Each carries three coins, one per layer, set by the key and the four highlighted words. A coin is 1 (filled) or 0, half and half.';
    else if (shown < 3) {
      const ties = rounds[shown].filter((x) => x.tie).length;
      say.textContent = `Layer ${shown}: each pair compares coin ${shown}. A 1 beats a 0` + (ties ? `; ${ties === 1 ? 'one match was a tie, settled' : ties + ' matches were ties, settled'} by a fair coin flip.` : '.');
    } else say.textContent = `“${rounds[3][0].w}” wins this three-layer bracket. Every candidate was a word the model already wanted; what changed is which of them won, and the winner tends to be one whose coins are 1. The real thing plays thirty layers (the bars below), so its favourite in this context can differ.`;
  }
  function step() {
    if (shown < 3) shown++;
    renderBracket();
  }
  function playAll() {
    clearTimeout(timer);
    const go = () => {
      if (shown >= 3) return;
      step();
      timer = setTimeout(go, 650);
    };
    go();
  }
  function renderExact() {
    const p = NEXT.map((x) => x[1]);
    const rows = NEXT.map((x) => g(x[0]));
    const q = tilt(p, rows);
    exact.replaceChildren(
      h('div', { class: 'sid-bars-head' }, h('span', null, 'Word'), h('span', null, 'Model alone → with the watermark, this context'), h('span', null, '')),
      ...NEXT.map(([w, pw], i) => [
        h('span', { class: 'sid-bar-label' }, w),
        h('div', { class: 'sid-bar' },
          h('span', { class: 'model', style: `width:${pw * 100}%` }),
          h('span', { class: 'wm', style: `width:${q[i] * 100}%` }),
          bits(rows[i], M, 'under')),
        h('span', { class: 'sid-bar-num' }, `${pct(pw)} → ${pct(q[i])}`),
      ]).flat(),
    );
  }
  function reset() {
    renderSentence();
    newDraw();
    renderExact();
  }

  root.append(
    h('div', { class: 'sid-eyebrow' }, 'Demo 1 · picking one word'),
    sentence,
    h('div', { class: 'sid-row sid-controls' },
      btn('Draw 8 new candidates', () => newDraw()),
      playBtn,
      allBtn,
      segmented([[KEYS.claude, 'Claude’s key'], [KEYS.other, 'Another key']], key, (v) => { key = v; reset(); }, 'Key')),
    bracket,
    say,
    h('div', { class: 'sid-sub' }, 'All 30 layers, computed exactly'),
    exact,
    h('p', { class: 'sid-caption' },
      h('b', null, 'How to read it. '),
      'The outline is how often the model alone picks each word; the gold bar is how often the watermarked tournament does, for this exact context and key. The 30 squares under each bar are that word’s coins, layer 1 on the left. Thirty layers nearly settle the choice: in any one context, one word takes almost all the odds. Click “edge” or “at” to change the context, or switch keys, and the coins reshuffle. Across many contexts each word still wins exactly as often as the model wanted; demo 2 shows that average.'),
  );
  reset();
  return { destroy: () => clearTimeout(timer) };
}

// ------------------------------------------------------------------------------------------
// Part: certain.
const CASES = [
  { id: 'paris', label: 'Capital of France', lead: 'What is the capital of France? → The capital of France is', ctx: ['capital', 'of', 'France', 'is'], c: [['Paris', 0.9995], ['Lyon', 0.0002], ['Marseille', 0.0002], ['the', 0.0001]] },
  { id: 'url', label: 'A URL', lead: 'The post is at aaronorelup.com/led', ctx: ['.', 'com', '/', 'led'], c: [['ger', 0.99995], ['ge', 0.00003], ['gers', 0.00002]] },
  { id: 'quote', label: 'A verbatim quote', lead: 'Copy it exactly: “The kettle remembers everyone…” → “The kettle remembers', ctx: ['“', 'The', 'kettle', 'remembers'], c: [['everyone', 0.9999], ['everybody', 0.00007], ['anyone', 0.00003]] },
  { id: 'poem', label: 'A line of a poem', lead: 'Write me a poem about rain. → The rain fell on the', ctx: ['rain', 'fell', 'on', 'the'], c: [['roof', 0.28], ['garden', 0.22], ['river', 0.16], ['window', 0.14], ['city', 0.1], ['sea', 0.1]] },
  { id: 'custom', label: 'Set it yourself', lead: 'A word the model is sure of, with three alternatives →', ctx: ['your', 'own', 'test', 'case'], c: null },
];
function customCase(slider) {
  const wrong = 0.5 * Math.pow(10, -slider / 25);
  return [['right', 1 - wrong], ['alt one', wrong * 0.6], ['alt two', wrong * 0.25], ['alt three', wrong * 0.15]];
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
// Ten thousand different contexts: the same odds, fresh coins each time.
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
  return { avg, ev: ev - 0.5, rarer, over1, worst, n };
}

function partCertain(root) {
  const N = 100000; // the rare contexts matter here, so sample enough of them to show up
  let which = 'paris';
  let slider = 75;
  let topP = 0;
  let ctxRoll = 0;
  let timer = 0;
  const cache = new Map();
  const sweepOf = (p) => {
    const id = p.join(',');
    if (!cache.has(id)) cache.set(id, sweep(p, N));
    return cache.get(id);
  };
  const lead = h('p', { class: 'sid-sentence' });
  const bars = h('div', { class: 'sid-bars' });
  const facts = h('ul', { class: 'sid-facts' });
  const sliderWrap = h('label', { class: 'sid-slider', hidden: true });
  const range = h('input', { type: 'range', min: '0', max: '150', value: String(slider), 'aria-label': 'How sure the model is' });
  const rangeOut = h('span', { class: 'sid-slider-out' });
  sliderWrap.append(h('span', null, 'How sure the model is'), range, rangeOut);
  range.addEventListener('input', () => {
    slider = Number(range.value);
    rangeOut.textContent = pct(customCase(slider)[0][1]);
    clearTimeout(timer);
    timer = setTimeout(render, 160);
  });
  const poemEv = sweep(CASES[3].c.map((x) => x[1]), 4000, 3).ev;
  const signed = (x) => (Math.abs(x) < 0.0005 ? '0.000' : (x > 0 ? '+' : '−') + Math.abs(x).toFixed(3));

  function render() {
    const cs = CASES.find((x) => x.id === which);
    const raw = cs.c || customCase(slider);
    const c = nucleus(raw, topP);
    sliderWrap.hidden = which !== 'custom';
    rangeOut.textContent = pct(raw[0][1]);
    lead.replaceChildren(h('span', { class: 'quiet' }, cs.lead + ' '), h('span', { class: 'sid-blank' }, '____'));
    const p = c.map((x) => x[1]);
    const ctx = ctxRoll ? [...cs.ctx.slice(1), '#' + ctxRoll] : cs.ctx;
    const q = c.length > 1 ? tilt(p, c.map((x) => gvals(KEYS.claude, ctx, x[0]))) : p;
    const s = sweepOf(p);
    bars.replaceChildren(
      h('div', { class: 'sid-bars-head' }, h('span', null, 'Word'), h('span', null, 'Model alone · this context · average of 100,000'), h('span', null, '')),
      ...raw.map(([w, pw]) => {
        const i = c.findIndex((x) => x[0] === w);
        const qi = i < 0 ? 0 : q[i];
        const ai = i < 0 ? 0 : s.avg[i];
        return [
          h('span', { class: 'sid-bar-label' + (i < 0 ? ' cut' : '') }, w),
          h('div', { class: 'sid-bar' },
            h('span', { class: 'model', style: `width:${pw * 100}%` }),
            h('span', { class: 'wm', style: `width:${qi * 100}%` }),
            h('span', { class: 'avg', style: `left:${ai * 100}%` })),
          h('span', { class: 'sid-bar-num' }, i < 0 ? 'trimmed' : `${pct(pw)} · ${pct(qi)} · ${pct(ai)}`),
        ];
      }).flat(),
    );
    const top = c[0][0];
    const wrong0 = 1 - p[0];
    const free = which === 'poem';
    const fmt = (x) => x.toLocaleString('en-US');
    facts.replaceChildren(
      h('li', null, h('b', null, free ? 'Same odds on average. ' : 'Same answer, on average. '),
        `Across ${fmt(N)} sampled contexts, “${top}” came out ${pct(s.avg[0])} of the time with the watermark; the model alone, ${pct(p[0])}. In theory the two are identical (the paper proves it); any difference in the last digit is sampling noise.`),
      h('li', null, h('b', null, `Evidence this word carries: ${signed(s.ev)}. `),
        free ? 'This is where the watermark lives: the model had real options, so the winner’s coins lean to 1.'
          : `A word in the poem carries +${poemEv.toFixed(3)}. This one carries nothing the detector can use.`),
      c.length === 1
        ? h('li', null, h('b', null, 'Nothing to tilt. '), 'After trimming, one candidate is left, so every context gives the same answer and the watermark has nothing to act on.')
        : h('li', null, h('b', null, 'Where the odds move. '),
          free
            ? 'In any one context the odds are reshuffled (the gold bar), but a word outside the model’s own list can never appear.'
            : `In ${fmt(s.rarer)} of ${fmt(N)} contexts the wrong answers got rarer than the model’s own ${pct(wrong0)}. ` +
              (s.over1
                ? `In ${fmt(s.over1)} (about 1 in ${fmt(Math.round(N / s.over1))}) they rose above 1%, and in the unluckiest one “${top}” fell to ${pct(s.worst)}. That is the published algorithm’s arithmetic, not a measurement of Claude: on average the watermark adds no errors, but it gathers the few there are into a few contexts.`
                : 'In none did they rise above 1%.')),
    );
  }

  root.append(
    h('div', { class: 'sid-eyebrow' }, 'Demo 2 · when there is one right answer'),
    segmented(CASES.map((x) => [x.id, x.label]), which, (v) => { which = v; ctxRoll = 0; render(); }, 'Example'),
    sliderWrap,
    lead,
    bars,
    h('div', { class: 'sid-row sid-controls' },
      btn('Try another context', () => { ctxRoll++; render(); }),
      h('label', { class: 'sid-check' }, h('input', { type: 'checkbox', onchange: (e) => { topP = e.target.checked ? 0.99 : 0; render(); } }), ' Trim the unlikely tail first (top-p 0.99)')),
    facts,
    h('p', { class: 'sid-caption' },
      h('b', null, 'How to read it. '),
      'Outline: the model alone. Gold bar: with the watermark, in one particular context. Tick: the watermark averaged over 100,000 contexts, which lands on the outline. The probabilities are illustrative, not measured from Claude.'),
  );
  render();
  return { destroy: () => clearTimeout(timer) };
}

// ------------------------------------------------------------------------------------------
// Part: detect.
function partDetect(root) {
  let which = 'claude';
  let limit = Infinity;
  let picked = -1;
  let r;
  const view = tokenView((i) => { picked = i; detail(); });
  const panel = scorePanel();
  const info = h('p', { class: 'sid-note sid-detail' });
  const totalWords = tokenize(LETTER_CLAUDE).filter((x) => isWord(x.t)).length;
  const range = h('input', { type: 'range', min: '10', max: String(totalWords), value: String(totalWords), 'aria-label': 'Words checked' });
  const rangeOut = h('span', { class: 'sid-slider-out' });
  range.addEventListener('input', () => { limit = Number(range.value); render(); });
  const key = () => (which === 'other' ? KEYS.other : KEYS.claude);
  function detail() {
    info.replaceChildren(picked >= 0 ? tokenDetail(r, picked, key()) : 'Click any word to see its 30 coins.');
  }
  function render() {
    const text = which === 'plain' ? LETTER_PLAIN : LETTER_CLAUDE;
    r = detect(text, { key: key(), limitWords: limit });
    rangeOut.textContent = `${Math.min(limit, totalWords)} of ${totalWords} words`;
    view.render(r);
    panel.update(r);
    detail();
  }
  root.append(
    h('div', { class: 'sid-eyebrow' }, 'Demo 3 · checking a text'),
    segmented([['claude', 'Claude’s letter'], ['plain', 'Same menu, no watermark'], ['other', 'Claude’s letter, wrong key']], which, (v) => { which = v; picked = -1; render(); }, 'Text'),
    h('label', { class: 'sid-slider' }, h('span', null, 'Check only the first'), range, rangeOut),
    view.el,
    info,
    panel.el,
    h('p', { class: 'sid-caption' },
      h('b', null, 'How to read it. '),
      'Gold behind a word means its coins came up mostly 1. Words the model had no choice over, like “Paris” or the address, light up at random too: that’s the noise the real evidence has to beat. Grey words aren’t scored: the first four have no full context, and a repeated context is masked. The detector never sees the model or the menu, only the words, the key and the hash. Scored with the paper’s weighted mean; Google’s production detector is a trained Bayesian scorer that does better on short text.'),
  );
  render();
  return {};
}

// ------------------------------------------------------------------------------------------
// Part: edit.
function partEdit(root) {
  let reference = LETTER_CLAUDE;
  let refGrams = ngrams(reference);
  let strip = true;
  let picked = -1;
  let r;
  const area = h('textarea', { class: 'sid-area', rows: '9', spellcheck: 'false', 'aria-label': 'The letter. Edit it and the score updates.' });
  area.value = reference;
  const view = tokenView((i) => { picked = i; info.replaceChildren(tokenDetail(r, i, KEYS.claude)); });
  const panel = scorePanel();
  const status = h('p', { class: 'sid-status', 'aria-live': 'polite' });
  const info = h('p', { class: 'sid-note sid-detail' });
  const kept = h('span', { class: 'sid-kept' });

  function render() {
    r = detect(area.value, { strip });
    view.render(r, refGrams);
    panel.update(r);
    const scored = r.toks.filter((x) => x.state === 'scored');
    const intact = scored.filter((x) => refGrams.has([...x.ctx, x.t].join('\u0002'))).length;
    kept.textContent = `${intact} of ${scored.length} scored tokens still have the 5-token window Claude wrote them in.`;
    if (picked >= 0) info.replaceChildren(tokenDetail(r, picked, KEYS.claude));
  }
  function set(text, msg, newRef) {
    area.value = text;
    if (newRef) {
      reference = newRef;
      refGrams = ngrams(newRef);
    }
    picked = -1;
    info.textContent = '';
    status.replaceChildren(...[msg].flat());
    render();
  }
  function swap(rate) {
    const text = area.value;
    const toks = tokenize(text);
    const wordsN = toks.filter((x) => isWord(x.t)).length;
    const cands = toks.filter((x) => SYNONYMS.has(x.t));
    const want = Math.min(cands.length, Math.round(wordsN * rate));
    for (let i = cands.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cands[i], cands[j]] = [cands[j], cands[i]];
    }
    const chosen = cands.slice(0, want).sort((a, b) => b.at - a.at);
    let out = text;
    for (const x of chosen) {
      const alts = [...SYNONYMS.get(x.t)];
      out = out.slice(0, x.at) + alts[Math.floor(Math.random() * alts.length)] + out.slice(x.at + x.t.length);
    }
    set(out, `Swapped ${want} of ${wordsN} words for a synonym. Each swap changes that word and the context of the next four tokens, so the wavy underlines spread past the word itself.`);
  }
  function invisible() {
    let n = 0;
    const out = area.value.replace(/[\p{L}\p{N}][\p{L}\p{N}'’]*/gu, (w) => (++n % 4 === 0 ? w + '​' : w));
    set(out, `Added ${Math.floor(n / 4)} zero-width spaces, one after every fourth word. They don’t show on screen, but each one is a token, so every 4-token window now contains one. Untick “strip invisible characters” to see what a naive detector would make of it.`);
  }
  function emoji() {
    const g = generate({ junk: '🙂' });
    const preview = g.raw.split(/\s+/).slice(0, 9).join(' ');
    set(g.text, [h('b', null, 'What Claude wrote: '), preview + ' … ', h('b', null, 'After you delete the faces: '), 'the letter above. The coins were tossed with a face in every window; with the faces gone, every window is new.'], g.text);
    refGrams = ngrams(g.raw);
    render();
  }

  area.addEventListener('input', () => {
    status.textContent = 'Your edits. Every changed token breaks its own window and the next four.';
    render();
  });
  const stripBox = h('input', { type: 'checkbox', checked: true, onchange: (e) => { strip = e.target.checked; render(); } });

  root.append(
    h('div', { class: 'sid-eyebrow' }, 'Demo 4 · edit it, or try to scrub it'),
    area,
    h('div', { class: 'sid-sub' }, 'Or let something else do the editing'),
    h('div', { class: 'sid-row sid-controls' },
      btn('Swap 1 word in 10', () => swap(0.1)),
      btn('Swap 1 word in 4', () => swap(0.25)),
      btn('Add an invisible character every 4 words', invisible),
      btn('Ask Claude to reword it', () => {
        const t = generate().text;
        set(t, 'Claude reworded the whole letter. It’s new text from the same model with the same key, so it carries a fresh watermark of its own.', t);
      }),
      btn('Reword it with an unwatermarked model', () => set(generate({ watermark: false }).text, 'A model without this key reworded the letter. Every word was chosen with ordinary randomness, so there is nothing for the detector to find.')),
      btn('The emoji trick', emoji),
      btn('Keep only the first 40 words', () => {
        let n = 0;
        let cut = area.value.length;
        for (const m of area.value.matchAll(/[\p{L}\p{N}][\p{L}\p{N}'’]*/gu)) if (++n === 40) { cut = m.index + m[0].length; break; }
        set(area.value.slice(0, cut), 'The same watermarked words, just fewer of them. The evidence per word hasn’t changed; there’s less of it.');
      }),
      btn('Reset', () => set(LETTER_CLAUDE, 'Back to Claude’s original letter.', LETTER_CLAUDE))),
    h('label', { class: 'sid-check' }, stripBox, ' Detector strips invisible characters before checking'),
    status,
    view.el,
    h('p', { class: 'sid-note' }, kept),
    info,
    panel.el,
    h('p', { class: 'sid-caption' },
      h('b', null, 'How to read it. '),
      'A wavy underline marks a scored token whose 5-token window (four tokens of context, plus itself) isn’t one Claude wrote, so its coins are fresh and carry no evidence. The rewording buttons draw a new letter from the same menu: a stand-in for a real paraphrase, which would change more than single words.'),
  );
  render();
  status.textContent = 'Claude’s letter, untouched. Type into it, or press a button.';
  return {};
}

// ------------------------------------------------------------------------------------------
// Part: book. Expected detection after editing, from the letter's own evidence per word.
function partBook(root) {
  // Average evidence per scored word over many fresh letters, so the chart doesn't hang on
  // one lucky draw.
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
  let share = 1;
  const flagged = (len, r) => 1 - upper(perWord * share * Math.sqrt(len) * Math.pow(1 - r, 5) - FLAG_Z);

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
  const svg = svgEl('svg', { viewBox: `0 0 ${Wd} ${Ht}`, class: 'sid-chart', role: 'img', 'aria-label': 'Chance of being flagged against the share of words edited, for three lengths' });
  const tip = h('div', { class: 'sid-tip', hidden: true });
  const wrap = h('div', { class: 'sid-chart-wrap' }, svg, tip);
  const table = h('table', { class: 'sid-table' });

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
    // Lines that never reach even odds can start at nearly the same height; push those apart.
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
      h('caption', null, 'Chance of being flagged, by share of words edited'),
      h('tr', null, h('th', null, 'Edited'), ...LENGTHS.map((L) => h('th', null, L.label.replace(/^A /, '')))),
      ...[0, 0.1, 0.2, 0.3, 0.4, 0.5].map((r) => h('tr', null, h('td', null, Math.round(r * 100) + '%'), ...LENGTHS.map((L) => h('td', null, pct(flagged(L.n, r)))))),
    );
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
    tip.replaceChildren(h('b', null, `You change ${Math.round(r * 100)}% of the words`), ...LENGTHS.map((L) => h('span', null, `${L.label.replace(/^A /, '')}: ${pct(flagged(L.n, r))} flagged`)));
    const left = (X(r) / Wd) * box.width;
    tip.style.left = Math.min(box.width - 190, Math.max(0, left + 12)) + 'px';
  }
  svg.addEventListener('pointermove', hover);
  svg.addEventListener('pointerleave', () => {
    tip.hidden = true;
    svg.querySelector('.cross')?.setAttribute('visibility', 'hidden');
  });

  root.append(
    h('div', { class: 'sid-eyebrow' }, 'Demo 5 · your book, after your edits'),
    h('div', { class: 'sid-sub' }, 'How much of the wording was Claude’s?'),
    segmented([[1, 'All of it (Claude wrote or rewrote it)'], [0.5, 'About half'], [0.1, 'A tenth'], [0.02, 'A light proofread']], share, (v) => { share = v; draw(); }, 'Share of the wording that was Claude’s'),
    h('div', { class: 'sid-legend', 'aria-hidden': 'true' },
      h('span', { class: 'sid-legend-y' }, 'Chance the detector flags it'),
      ...LENGTHS.map((L) => h('span', { class: 'sid-key ' + L.cls }, h('i'), L.label.replace(/^A /, '')))),
    wrap,
    h('details', { class: 'sid-more' }, h('summary', null, 'The same numbers as a table'), table),
    h('p', { class: 'sid-caption' },
      h('b', null, 'What this assumes. '),
      'Every word Claude chose carries as much evidence as a word in the letter above, and your edits land on words at random. Edits aimed at the free word choices remove evidence faster (demo 4); edits bunched into sentences break fewer neighbours than scattered ones. A flag means a score past the 1%-false-positive line. Real tokens are smaller than words and real detectors are better than this one, so read the shape, not the decimals.'),
  );
  draw();
  return {};
}

const PARTS = { tournament: partTournament, certain: partCertain, detect: partDetect, edit: partEdit, book: partBook };

export function mount(host, part) {
  const fn = PARTS[part];
  if (!fn) return null;
  const root = h('div', { class: 'sid' });
  host.replaceChildren(root);
  return fn(root) || {};
}

// For checking the numbers from a console.
export const _internals = { generate, detect, sweep, tilt, LETTER_CLAUDE, LETTER_PLAIN, TOKEN_SD };
