// The watermark maths of the synthid demo: SynthID-Text as published (Dathathri et al., Nature 634, 2024, and
// google-deepmind/synthid-text): g-values from a hash of the key, the previous H tokens and the candidate, m layers of
// the tournament update, repeated-context masking and the mean score. The hash is ours; the model is a hand-written
// letter of word choices, and a token is a word or one punctuation mark. Read by ui.js and every part.

export const H = 4; // context tokens hashed with the key (the paper's H; ngram_len = 5 in the code)
export const M = 30; // tournament layers (the paper's m)

// One token's share of + is 0.5 on average without a watermark; this is its spread. (The paper
// also has a weighted mean that counts early rounds more; the plain share is easier to explain
// and still flags the demo letter.)
export const TOKEN_SD = 0.5 / Math.sqrt(M);
export const FLAG_Z = 2.326; // one-sided, 1% false positives: the paper's operating point

// Keys are arbitrary integers. The toy's letters all share their fixed words, so each key gives
// unwatermarked letters a small constant offset; "claude" is the first small integer whose
// unwatermarked letters average a share of + of 50% (key 3: mean z -0.08 over 200 letters).
export const KEYS = { claude: 3, other: 0x0ddba110 };

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
export function gvals(key, ctx, tok) {
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
export const tokScore = (g) => {
  let s = 0;
  for (let l = 0; l < M; l++) s += g[l];
  return s / M;
};
export const ones = (g, n = M) => {
  let c = 0;
  for (let l = 0; l < n; l++) c += g[l];
  return c;
};

// The tournament, all m layers at once: synthid-text's update_scores. Each layer moves
// probability toward the candidates whose coin is 1, by exactly as much as it takes from the
// ones whose coin is 0, so the total stays 1. This is the exact distribution of the winner of
// a 2^m-candidate knockout, without drawing 2^m candidates.
export function tilt(p, rows, depth = M) {
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
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function pick(p, r) {
  const x = r();
  let acc = 0;
  for (let i = 0; i < p.length; i++) {
    acc += p[i];
    if (x < acc) return i;
  }
  return p.length - 1;
}
// Upper tail of the standard normal.
export function upper(z) {
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
export const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

// ------------------------------------------------------------------------------------------
// Tokens. A word (letters, digits, apostrophes) or any single other character, so an
// invisible character inserted between words becomes a token of its own, as it would in a
// real tokenizer.
const TOKEN_RE = /[\p{L}\p{N}][\p{L}\p{N}'’]*|[^\s\p{L}\p{N}]/gu;
const INVISIBLE_RE = /\p{Cf}/gu;
export const IS_INVISIBLE = /^\p{Cf}$/u;
export const isWord = (t) => /^[\p{L}\p{N}]/u.test(t);
export function tokenize(text) {
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
export const SYNONYMS = new Map();
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
export function generate({ key = KEYS.claude, watermark = true, seed = null, junk = null } = {}) {
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
export function detect(text, { key = KEYS.claude, strip = true, limitWords = Infinity } = {}) {
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
export const ngrams = (text) => {
  const t = tokenize(text).map((x) => x.t);
  const set = new Set();
  for (let i = H; i < t.length; i++) set.add(t.slice(i - H, i + 1).join('\u0002'));
  return set;
};

// The letter every part starts from, so the post can talk about one text.
const SEED = 2026;
export const LETTER_CLAUDE = generate({ seed: SEED }).text;
export const LETTER_PLAIN = generate({ seed: SEED, watermark: false }).text;
