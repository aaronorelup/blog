// Mini Loom live model, running in a module worker so the page never freezes and a failed
// WebGPU start can be thrown away whole (a fresh worker then tries WebAssembly).
// We call the model's forward pass ourselves, so the page does its own temperature / top-p
// sampling and records each token's log-probability and top alternatives, exactly like the
// pre-grown trees.

const TJS = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1/+esm';
let T = null, tok = null, model = null, eos = new Set([0]), special = [], stopReq = null;
const post = (m) => self.postMessage(m);
// Hand the event loop one turn, so a 'stop' message from the page can land between tokens.
// On WebAssembly each forward pass resolves through microtasks only, and without this the
// worker would not read its messages until the whole grow had finished. A MessageChannel
// turn avoids setTimeout's 4 ms clamp.
const yieldNow = () => new Promise((r) => { const ch = new MessageChannel(); ch.port1.onmessage = () => { ch.port1.close(); r(); }; ch.port2.postMessage(0); });

function halfToFloat(h) {
  const s = (h & 0x8000) ? -1 : 1, e = (h >> 10) & 0x1f, f = h & 0x3ff;
  if (e === 0) return s * Math.pow(2, -14) * (f / 1024);
  if (e === 31) return f ? NaN : s * Infinity;
  return s * Math.pow(2, e - 15) * (1 + f / 1024);
}
const errText = (e) => (e && (e.message || e.name)) ? String(e.message || e.name) : (typeof e === 'number' ? `runtime error ${e}` : String(e));

async function load(plan, lowPower) {
  T = await import(TJS);
  T.env.allowLocalModels = false;
  try { T.env.useBrowserCache = true; } catch (e) {}
  try { if (lowPower) T.env.backends.onnx.webgpu.powerPreference = 'low-power'; } catch (e) {}
  const files = Object.create(null);
  let last = 0;
  const cb = (p) => {
    if (!p || !p.file) return;
    if (p.status === 'initiate' || p.status === 'download') files[p.file] = files[p.file] || { loaded: 0, total: 0 };
    if (p.status === 'progress') files[p.file] = { loaded: p.loaded || 0, total: p.total || 0 };
    if (p.status === 'done' && files[p.file]) files[p.file].loaded = files[p.file].total;
    const now = Date.now();
    if (p.status === 'progress' && now - last < 120) return;
    last = now;
    let loaded = 0, total = 0;
    for (const k in files) { loaded += files[k].loaded; total += files[k].total; }
    post({ type: 'progress', phase: 'download', loaded, total });
  };
  tok = await T.AutoTokenizer.from_pretrained(plan.id, { progress_callback: cb });
  model = await T.AutoModelForCausalLM.from_pretrained(plan.id, { device: plan.device, dtype: plan.dtype, progress_callback: cb });
  const e = tok.eos_token_id ?? model.config?.eos_token_id ?? 0;
  eos = new Set([].concat(e).map(Number));
  // Control tokens (<|im_start|>, <repo_name>, …) are taken out before the softmax, as the
  // grower did for the pre-grown trees; end-of-text stays, so a branch can still end.
  let ids = [];
  try { ids = Array.from(tok.all_special_ids || []); } catch (err) {}
  if (!ids.length) {
    try { ids = (tok.special_tokens || tok.all_special_tokens || []).map((t) => tok.model.tokens_to_ids.get(t)); } catch (err) {}
  }
  special = ids.map(Number).filter((i) => Number.isInteger(i) && i >= 0 && !eos.has(i));
  post({ type: 'progress', phase: 'warmup' });
  // compiles the kernels once, and checks the numbers: some GPU and model combinations return
  // all-zero or NaN logits, and then the page should fall back to the processor
  const r = await forward([0].concat(encode('The weaver')), null, 0);
  dispose(r.past);
  let mx = -Infinity, mn = Infinity, bad = 0;
  for (const v of r.logits) { if (!Number.isFinite(v)) bad++; else { if (v > mx) mx = v; if (v < mn) mn = v; } }
  if (bad > 0 || !(mx - mn > 1e-3)) throw new Error('the model returned empty numbers on this device');
}

function encode(text) {
  const r = tok.encode(text);
  return Array.isArray(r) ? r : Array.from(r.input_ids ?? r.ids ?? r);
}
const decode = (ids) => tok.decode(ids, { skip_special_tokens: true });

// One forward pass over tokens not yet in the cache: last-position logits and the new cache.
// The cache is a plain object, so the prefix cache can be fed to every branch without being
// mutated or disposed by the library.
async function forward(ids, past, pastLen) {
  const n = ids.length, L = pastLen + n;
  const input_ids = new T.Tensor('int64', BigInt64Array.from(ids.map(BigInt)), [1, n]);
  const attention_mask = new T.Tensor('int64', new BigInt64Array(L).fill(1n), [1, L]);
  const out = await model.forward({ input_ids, attention_mask, past_key_values: past });
  const lg = out.logits, V = lg.dims[lg.dims.length - 1];
  const rows = lg.dims.length === 3 ? lg.dims[1] : 1;
  const data = lg.data, off = (rows - 1) * V;
  let last;
  if (data instanceof Float32Array) last = data.slice(off, off + V);
  else if (data instanceof Uint16Array) { last = new Float32Array(V); for (let i = 0; i < V; i++) last[i] = halfToFloat(data[off + i]); }
  else last = Float32Array.from(data.subarray(off, off + V));
  const next = {};
  for (const k in out) if (k.startsWith('present')) next[k.replace('present', 'past_key_values')] = out[k];
  try { lg.dispose && lg.dispose(); } catch (e) {}
  return { logits: last, past: next, len: L };
}
function dispose(past) {
  if (!past) return;
  for (const k in past) { try { past[k] && past[k].dispose && past[k].dispose(); } catch (e) {} }
}

// Raw log-softmax (temperature 1) for the record; temperature + top-p for the draw.
function sample(logits, temperature, topP) {
  const V = logits.length;
  for (const i of special) if (i < V) logits[i] = -Infinity;
  let mx = -Infinity;
  for (let i = 0; i < V; i++) if (logits[i] > mx) mx = logits[i];
  let z = 0;
  for (let i = 0; i < V; i++) z += Math.exp(logits[i] - mx);
  const lse = mx + Math.log(z);
  const top = [];
  for (let i = 0; i < V; i++) {
    const v = logits[i];
    if (top.length < 4 || v > top[top.length - 1][1]) { top.push([i, v]); top.sort((a, b) => b[1] - a[1]); if (top.length > 4) top.pop(); }
  }
  const tt = Math.max(0.05, temperature), cut = mx - 20 * tt, cand = [];
  let zs = 0;
  for (let i = 0; i < V; i++) if (logits[i] >= cut) { const w = Math.exp((logits[i] - mx) / tt); cand.push([i, w]); zs += w; }
  cand.sort((a, b) => b[1] - a[1]);
  let acc = 0, k = 0;
  for (; k < cand.length; k++) { acc += cand[k][1] / zs; if (acc >= topP) { k++; break; } }
  const nucleus = cand.slice(0, Math.max(1, k));
  let mass = 0; for (const c of nucleus) mass += c[1];
  let r = Math.random() * mass, pick = nucleus[0][0];
  for (const c of nucleus) { r -= c[1]; if (r <= 0) { pick = c[0]; break; } }
  return { id: pick, lp: logits[pick] - lse, top: top.map(([i, v]) => [decode([i]), Math.round((v - lse) * 1000) / 1000]) };
}

async function grow(req, { context, n, maxTokens, temperature, topP, stopAtSentence, minTokens }) {
  const ids = [0].concat(encode(context));   // id 0 is <|endoftext|>: "a new document starts here"
  const pre = await forward(ids, null, 0);
  for (let b = 0; b < n; b++) {
    await yieldNow();
    if (stopReq === req) break;   // skip the branches not started yet, without another forward pass
    let logits = pre.logits, past = pre.past, len = pre.len, shown = '';
    const gen = [];
    let count = 0, held = null, cut = false;
    for (let step = 0; step < maxTokens; step++) {
      await yieldNow();
      if (stopReq === req) { cut = step > 0; break; }   // stopped mid-branch: the page marks it
      const s = sample(logits, temperature, topP);
      if (eos.has(s.id)) break;
      gen.push(s.id); count++;
      const full = decode(gen);
      // A token that ends partway through a character decodes to '�'. Hold it and merge it into
      // the next one (texts joined, log-probs summed, the first position's alternatives kept),
      // the same rule the grower used, so every entry's text is real and they join into the node.
      if (full.endsWith('�')) {
        held = held ? { lp: held.lp + s.lp, top: held.top } : { lp: s.lp, top: s.top };
      } else {
        const piece = full.slice(shown.length); shown = full;
        const lp = held ? held.lp + s.lp : s.lp, top = held ? held.top : s.top;
        held = null;
        post({ type: 'tok', req, b, tok: [piece, Math.round(lp * 1000) / 1000, top], text: shown });
      }
      const minLen = minTokens || Math.max(4, Math.ceil(maxTokens / 2));
      if (stopAtSentence && step + 1 >= minLen && /[.!?]["'”’)\]]?\s*$|\n\s*$/.test(shown)) break;
      if (step + 1 >= maxTokens) break;
      const r = await forward([s.id], past, len);
      if (past !== pre.past) dispose(past);
      past = r.past; len = r.len; logits = r.logits;
    }
    if (past !== pre.past) dispose(past);
    post({ type: 'branch', req, b, text: shown, count, cut });
  }
  dispose(pre.past);
}

self.onmessage = async (e) => {
  const m = e.data || {};
  try {
    if (m.type === 'load') { await load(m.plan, m.lowPower); post({ type: 'ready' }); }
    else if (m.type === 'grow') { await grow(m.req, m.args); post({ type: 'grown', req: m.req }); }
    else if (m.type === 'stop') stopReq = m.req;
  } catch (err) {
    post({ type: 'error', req: m.req, where: m.type, message: errText(err) });
  }
};
