// Mini Loom: the optional live model. Loaded only when the reader asks for it.
// The model itself runs in live-worker.js (transformers.js, WebGPU or WebAssembly), so the page
// stays responsive while it thinks, and a failed WebGPU start is thrown away with its worker.

// Test hooks: ?live=cpu forces the WebAssembly model; ?gpu=low-power asks for the integrated GPU.
const Q = new URLSearchParams(location.search);

// SmolLM2-360M's q4f16 build returned all-zero logits under WebGPU in testing (16-bit activations
// overflow), so the GPU plan uses q4: 4-bit weights, 32-bit activations, no shader-f16 needed.
// `mb` is the whole first download, measured: model, tokenizer, the ONNX runtime and
// transformers.js (cpu: 136.7 + 1.25 MB model, 0.64 tokenizer, 5.5 runtime; gpu: 386.5 MB model).
export const PLANS = {
  gpu: { id: 'onnx-community/SmolLM2-360M-ONNX', label: 'SmolLM2 360M', params: '360M', dtype: 'q4', device: 'webgpu', mb: 395, where: 'your graphics card (WebGPU)' },
  gpuSmall: { id: 'onnx-community/SmolLM2-135M-ONNX', label: 'SmolLM2 135M', params: '135M', dtype: 'q4f16', device: 'webgpu', mb: 125, where: 'your graphics card (WebGPU)' },
  gpuSmall32: { id: 'onnx-community/SmolLM2-135M-ONNX', label: 'SmolLM2 135M', params: '135M', dtype: 'q4', device: 'webgpu', mb: 190, where: 'your graphics card (WebGPU)' },
  cpu: { id: 'onnx-community/SmolLM2-135M-ONNX', label: 'SmolLM2 135M', params: '135M', dtype: 'q8', device: 'wasm', mb: 145, where: 'your processor (WebAssembly)' },
};

export async function detect() {
  let webgpu = false, f16 = false, why = '';
  try {
    if (Q.get('live') === 'cpu') why = 'switched off for this test';
    else if (navigator.gpu) {
      const a = await navigator.gpu.requestAdapter();
      if (a) { webgpu = true; f16 = a.features.has('shader-f16'); }
      else why = 'no GPU adapter';
    } else why = 'no WebGPU in this browser';
  } catch (e) { why = 'WebGPU error'; }
  const mem = navigator.deviceMemory || null;
  // Phones and small-memory devices get the 135M model by default (about 125 MB with shader-f16,
  // checked on WebGPU), not the 395 MB 360M one: mobile data and memory are both tight there.
  // The larger model stays one click away.
  const phone = matchMedia('(pointer: coarse)').matches || (mem != null && mem <= 4);
  if (!webgpu) return { webgpu, f16, why, mem, phone, plan: PLANS.cpu, alt: null };
  const small = f16 ? PLANS.gpuSmall : PLANS.gpuSmall32;
  return phone
    ? { webgpu, f16, why, mem, phone, plan: small, alt: PLANS.gpu, altLarger: true }
    : { webgpu, f16, why, mem, phone, plan: PLANS.gpu, alt: small, altLarger: false };
}

// Start a worker and load `plan` in it. onProgress({phase, loaded, total}).
// Returns { promise, cancel }: cancel() ends the worker, which stops the download at once,
// and rejects the promise with Error('cancelled'). Files already fetched stay in the cache.
export function load(plan, onProgress = () => {}) {
  let w = null, settled = false, rejectFn = null;
  const promise = new Promise((resolve, reject) => {
    rejectFn = reject;
    try { w = new Worker(new URL('./live-worker.js', import.meta.url), { type: 'module' }); }
    catch (e) { settled = true; reject(e); return; }
    const fail = (msg) => { if (settled) return; settled = true; try { w.terminate(); } catch (e) {} reject(new Error(msg)); };
    w.onerror = (e) => { e.preventDefault && e.preventDefault(); fail(e.message || 'the model worker stopped'); };
    w.onmessage = (e) => {
      const m = e.data;
      if (settled) return;
      if (m.type === 'progress') onProgress(m);
      else if (m.type === 'ready') { settled = true; onProgress({ phase: 'ready' }); w.onmessage = null; resolve(new Engine(w, plan)); }
      else if (m.type === 'error') fail(m.message);
    };
    w.postMessage({ type: 'load', plan, lowPower: Q.get('gpu') === 'low-power' });
  });
  const cancel = () => {
    if (settled) return false;
    settled = true;
    try { w && w.terminate(); } catch (e) {}
    rejectFn(new Error('cancelled'));
    return true;
  };
  return { promise, cancel };
}

class Engine {
  constructor(worker, plan) {
    this.w = worker; this.plan = plan; this.label = plan.label; this.params = plan.params; this.device = plan.device;
    this.req = 0; this.busy = false;
  }

  // Grow n branches from `context`. onUpdate(branch, tokens, text, done, cut) fires as tokens
  // arrive; `cut` is true on a branch's last call when Stop ended it before it finished.
  grow({ context, n = 4, maxTokens = 32, temperature = 1, topP = 0.95, stopAtSentence = true, minTokens = 12, onUpdate = () => {} }) {
    if (this.busy) return Promise.reject(new Error('busy'));
    this.busy = true;
    const req = ++this.req;
    const toks = Array.from({ length: n }, () => []);
    const texts = Array(n).fill('');
    return new Promise((resolve, reject) => {
      const done = (fn, v) => { this.busy = false; this.w.onmessage = null; this.w.onerror = null; fn(v); };
      this.w.onerror = (e) => { e.preventDefault && e.preventDefault(); done(reject, new Error(e.message || 'the model worker stopped')); };
      this.w.onmessage = (e) => {
        const m = e.data;
        if (m.req !== req) return;
        if (m.type === 'tok') { toks[m.b].push(m.tok); texts[m.b] = m.text; onUpdate(m.b, toks[m.b], m.text, false); }
        else if (m.type === 'branch') { texts[m.b] = m.text; onUpdate(m.b, toks[m.b], m.text, true, !!m.cut); }
        else if (m.type === 'grown') done(resolve, texts.map((t, i) => ({ text: t, tokens: toks[i] })));
        else if (m.type === 'error') done(reject, new Error(m.message));
      };
      this.w.postMessage({ type: 'grow', req, args: { context, n, maxTokens, temperature, topP, stopAtSentence, minTokens } });
    });
  }

  stop() { this.w.postMessage({ type: 'stop', req: this.req }); }
}
