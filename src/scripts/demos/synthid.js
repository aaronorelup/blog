// SynthID-Text, small enough to watch. Mounted by <ao-demo name="synthid" part="…"> in
// AO-040 (claude-text-watermark.md); one module, five parts:
//
//   tournament  how one token is picked: contestants drawn from the odds, a + or − per round
//               (the round assignments) from the key and the four previous tokens, + beats −
//   certain     why a token with one right answer ("Paris" for France's capital) comes out the same
//   detect      the checker: recreate each token's assignments and count the +
//   edit        what edits, rewording and tricks do to that count
//   book        expected detection for a long text after you edit it
//
// The post calls the paper's g-values "round assignments" (1 = +, 0 = −) and its layers "rounds".
//
// The watermark is the published algorithm (Dathathri et al., Nature 634, 2024, and
// google-deepmind/synthid-text): Bernoulli(0.5) g-values from a hash of the key, the previous
// H = 4 tokens and the candidate, one per tournament layer; m = 30 layers applied to the
// probabilities with the paper's vectorised update; repeated-context masking; the paper's
// mean score (the share of + across every round of every checked token). The hash is ours, so nothing here can check real Claude or Gemini text.
// What is NOT real is the model: a hand-written menu of word choices stands in for Claude,
// and a token is a whole word or a single punctuation mark.
import '../../styles/demos/synthid.css';

const H = 4; // context tokens hashed with the key (the paper's H; ngram_len = 5 in the code)
const M = 30; // tournament layers (the paper's m)

// One token's share of + is 0.5 on average without a watermark; this is its spread. (The paper
// also has a weighted mean that counts early rounds more; the plain share is easier to explain
// and still flags the demo letter.)
const TOKEN_SD = 0.5 / Math.sqrt(M);
const FLAG_Z = 2.326; // one-sided, 1% false positives: the paper's operating point

// Keys are arbitrary integers. The toy's letters all share their fixed words, so each key gives
// unwatermarked letters a small constant offset; "claude" is the first small integer whose
// unwatermarked letters average a share of + of 50% (key 3: mean z -0.08 over 200 letters).
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
  for (let l = 0; l < M; l++) s += g[l];
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
function tilt(p, rows, depth = M) {
  const q = Float64Array.from(p);
  for (let l = 0; l < depth; l++) {
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
  if (z < 0) return 1 - upper(-z);
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
// Round assignments as chips: a gold "+" or a hollow "−".
const chip = (on, cls = '') => h('i', { class: 'sid-sign ' + (on ? 'plus ' : 'minus ') + cls, 'aria-label': on ? 'plus' : 'minus' }, on ? '+' : '−');
const chips = (g, n = M, cls = '') => h('span', { class: 'sid-signs ' + cls }, Array.from({ length: n }, (_, l) => chip(g[l])));
const lede = (...kids) => h('p', { class: 'sid-lede' }, ...kids);
const pct = (x) => {
  if (x >= 0.9999995) return '100%';
  if (x < 0.000005) return x <= 0 ? '0%' : 'under 0.001%';
  // Near-certain odds keep digits until the first one that isn't a 9: 99.950%, 99.99987%.
  if (x > 0.99) return (x * 100).toFixed(clamp(Math.ceil(-Math.log10(1 - x)) - 1, 2, 6)) + '%';
  if (x >= 0.1) return (x * 100).toFixed(0) + '%';
  if (x >= 0.01) return (x * 100).toFixed(1) + '%';
  if (x >= 0.0001) return (x * 100).toFixed(2) + '%';
  return (x * 100).toFixed(3) + '%';
};
const share = (x) => (x * 100).toFixed(1) + '%';
const oneIn = (p) => {
  if (p <= 0 || 1 / p > 1e12) return 'less than once in a trillion tries';
  const n = 1 / p;
  if (n < 1.5) return 'most of the time';
  return 'about 1 time in ' + Math.round(n).toLocaleString('en-US');
};
const fmt = (x) => x.toLocaleString('en-US');

// The checker's readout, shared by the detect and edit parts.
function scorePanel() {
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
function tokenView(onPick) {
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
function legend(withBroken) {
  return h('div', { class: 'sid-key-row' },
    h('span', null, h('i', { class: 'sw gold' }), 'mostly + (evidence)'),
    h('span', null, h('i', { class: 'sw plain' }), 'about half +'),
    h('span', null, h('i', { class: 'sw grey' }), 'not checked'),
    withBroken ? h('span', null, h('i', { class: 'sw wavy' }), 'previous tokens changed: evidence gone') : null);
}
function tokenDetail(r, i, key) {
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

// ------------------------------------------------------------------------------------------
// Part: tournament.
const SENTENCE = ['The', 'tea', 'house', 'sits', 'at', 'the', 'edge', 'of', 'the'];
const SWAPS = { 6: ['edge', 'end', 'foot'] };
const NEXT = [['garden', 0.34], ['river', 0.2], ['forest', 0.16], ['town', 0.12], ['sea', 0.1], ['world', 0.08]];
const ROUNDS = 3; // in the bracket; the real system plays M

function partTournament(root) {
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

function partCertain(root) {
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
    info.replaceChildren(picked >= 0 ? tokenDetail(r, picked, key()) : 'Click any word to see its 30 round assignments.');
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
    h('div', { class: 'sid-eyebrow' }, 'Demo 3 · the checker'),
    lede('A letter the toy model wrote. The checker reads it one token at a time: it takes the four previous tokens and the key, recreates that token’s 30 round assignments, and counts the +.'),
    segmented([['claude', 'Claude’s letter'], ['plain', 'A letter written without the watermark'], ['other', 'Claude’s letter, checked with a different key']], which, (v) => { which = v; picked = -1; render(); }, 'Text'),
    h('label', { class: 'sid-slider' }, h('span', null, 'Check only the first'), range, rangeOut),
    legend(false),
    view.el,
    info,
    panel.el,
  );
  render();
  return {};
}

// ------------------------------------------------------------------------------------------
// Part: edit.
function partEdit(root) {
  let refGrams = ngrams(LETTER_CLAUDE);
  let strip = true;
  let picked = -1;
  let r;
  const area = h('textarea', { class: 'sid-area', rows: '9', spellcheck: 'false', 'aria-label': 'The letter. Edit it and the checker updates.' });
  area.value = LETTER_CLAUDE;
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
    kept.textContent = `${intact} of ${scored.length} checked tokens still have the same four previous tokens Claude wrote them after.`;
    if (picked >= 0) info.replaceChildren(tokenDetail(r, picked, KEYS.claude));
  }
  function set(text, msg, newRef) {
    area.value = text;
    if (newRef) refGrams = ngrams(newRef);
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
    set(out, `Swapped ${want} of ${wordsN} words for a synonym. Each swap gives that word and the next four tokens new previous tokens, so their round assignments are redrawn at random.`);
  }
  function invisible() {
    let n = 0;
    const out = area.value.replace(/[\p{L}\p{N}][\p{L}\p{N}'’]*/gu, (w) => (++n % 4 === 0 ? w + '​' : w));
    set(out, `Added ${Math.floor(n / 4)} zero-width spaces, one after every fourth word. You can’t see them, but each is a token, so every set of four previous tokens now contains one. Untick “remove invisible characters” to see what a checker that doesn’t clean the text would make of it.`);
  }
  function emoji() {
    const g = generate({ junk: '🙂' });
    const preview = g.raw.split(/\s+/).slice(0, 9).join(' ');
    set(g.text, [h('b', null, 'What Claude wrote: '), preview + ' … ', h('b', null, 'After you delete the faces: '), 'the letter above. Every word was picked with a face among its four previous tokens. With the faces gone, the checker sees different previous tokens everywhere.'], g.text);
    refGrams = ngrams(g.raw);
    render();
  }

  area.addEventListener('input', () => {
    status.textContent = 'Your edits. Each changed token redraws its own round assignments and those of the next four tokens.';
    render();
  });
  const stripBox = h('input', { type: 'checkbox', checked: true, onchange: (e) => { strip = e.target.checked; render(); } });

  root.append(
    h('div', { class: 'sid-eyebrow' }, 'Demo 4 · edit it, or try to remove it'),
    lede('Claude’s letter again. Type into it, or press a button, and the checker below updates. A wavy underline marks a word whose four previous tokens changed: the checker now gives it new, random round assignments, so its evidence is gone.'),
    area,
    h('div', { class: 'sid-sub' }, 'Or let something else do the editing'),
    h('div', { class: 'sid-row sid-controls' },
      btn('Swap 1 word in 10 for a synonym', () => swap(0.1)),
      btn('Swap 1 word in 4', () => swap(0.25)),
      btn('Add an invisible character every 4 words', invisible),
      btn('Ask Claude to reword it', () => {
        const t = generate().text;
        set(t, 'Claude reworded the whole letter. It’s new text from the same model with the same key, so it carries a new watermark of its own.', t);
      }),
      btn('Reword it with a model that doesn’t have the key', () => set(generate({ watermark: false }).text, 'A model without the key reworded the letter. Every word was picked with ordinary randomness, so there is nothing for the checker to find.')),
      btn('The emoji trick', emoji),
      btn('Keep only the first 40 words', () => {
        let n = 0;
        let cut = area.value.length;
        for (const m of area.value.matchAll(/[\p{L}\p{N}][\p{L}\p{N}'’]*/gu)) if (++n === 40) { cut = m.index + m[0].length; break; }
        set(area.value.slice(0, cut), 'The same watermarked words, just fewer of them. Each word carries the same evidence as before; there’s less of it.');
      }),
      btn('Reset', () => set(LETTER_CLAUDE, 'Back to Claude’s original letter.', LETTER_CLAUDE))),
    h('label', { class: 'sid-check' }, stripBox, ' Checker removes invisible characters before checking'),
    status,
    legend(true),
    view.el,
    h('p', { class: 'sid-note' }, kept),
    info,
    panel.el,
    h('p', { class: 'sid-caption' }, 'The rewording buttons write a new letter from the same menu of word choices: a stand-in for a real paraphrase, which would change more than single words.'),
  );
  render();
  status.textContent = 'Claude’s letter, untouched.';
  return {};
}

// ------------------------------------------------------------------------------------------
// Part: book. Expected detection after editing, from the letter's own evidence per word.
function partBook(root) {
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
