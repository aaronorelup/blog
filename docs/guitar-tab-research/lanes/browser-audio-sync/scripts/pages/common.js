// Shared helpers for the trial pages (plain ES module, no build step).

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function finish(result) { window.__result = result; window.__done = true; }

export function fail(e, partial = {}) {
  console.error(String(e && e.stack || e));
  finish({ ...partial, error: String(e && e.message || e), stack: String(e && e.stack || '') });
}

// WAV writer: Float32 channels -> 32-bit float WAV (format 3) or 16-bit PCM.
export function encodeWav(channels, sampleRate, { float = true } = {}) {
  const n = channels[0].length, ch = channels.length, bps = float ? 4 : 2;
  const buf = new ArrayBuffer(44 + n * ch * bps), v = new DataView(buf);
  const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); v.setUint32(4, 36 + n * ch * bps, true); w(8, 'WAVE'); w(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, float ? 3 : 1, true); v.setUint16(22, ch, true);
  v.setUint32(24, sampleRate, true); v.setUint32(28, sampleRate * ch * bps, true); v.setUint16(32, ch * bps, true);
  v.setUint16(34, bps * 8, true); w(36, 'data'); v.setUint32(40, n * ch * bps, true);
  let o = 44;
  for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) {
    const s = channels[c][i];
    if (float) { v.setFloat32(o, s, true); o += 4; } else { v.setInt16(o, Math.max(-1, Math.min(1, s)) * 32767, true); o += 2; }
  }
  return buf;
}

export async function upload(tool, name, data) {
  const r = await fetch(`/upload/${tool}/${name}`, { method: 'POST', body: data });
  if (!r.ok) throw new Error(`upload ${name}: ${r.status}`);
  return `/home/user/gtr/lanes/browser-audio-sync/out/${tool}/${name}`;
}

// AudioWorklet recorder: records its input (all channels) into big chunks and posts them to the main thread.
// The first message carries currentFrame of the first recorded render quantum, so every recorded sample can be
// mapped back to the AudioContext's frame timeline.
export const RECORDER_SRC = `
class Rec extends AudioWorkletProcessor {
  constructor(o) { super(); this.ch = o.processorOptions.channels; this.chunk = o.processorOptions.chunk;
    this.bufs = Array.from({length: this.ch}, () => new Float32Array(this.chunk)); this.pos = 0; this.first = -1;
    this.on = true; this.port.onmessage = (e) => { if (e.data === 'stop') { this.flush(); this.on = false; this.port.postMessage({done: true}); } }; }
  flush() { if (this.pos > 0) { const out = this.bufs.map((b) => b.slice(0, this.pos)); this.port.postMessage({frames: out}, out.map((b) => b.buffer)); }
    this.bufs = Array.from({length: this.ch}, () => new Float32Array(this.chunk)); this.pos = 0; }
  process(inputs) {
    if (!this.on) return false;
    if (this.first < 0) { this.first = currentFrame; this.expected = currentFrame; this.port.postMessage({firstFrame: currentFrame}); }
    if (currentFrame !== this.expected) {   // process() was not called for some render quanta: keep the timeline, fill zeros
      const gap = currentFrame - this.expected;
      // gap > 0: quanta skipped, write zeros. gap < 0: currentFrame repeated an earlier value (seen once, in r0199):
      // step back so the samples land at the frame index process() reports (if that position is still in memory).
      let handled = true;
      if (gap < 0) { if (-gap <= this.pos) this.pos += gap; else handled = false; }
      this.port.postMessage({gap: {atFrame: this.expected, frames: gap, handled}});
      let left = gap > 0 ? gap : 0;
      while (left > 0) { const k = Math.min(left, this.chunk - this.pos); this.pos += k; left -= k; if (this.pos >= this.chunk) this.flush(); }
    }
    const inp = inputs[0]; const n = 128;
    for (let c = 0; c < this.ch; c++) { const src = inp[c] || inp[0]; const dst = this.bufs[c];
      if (src) dst.set(src, this.pos); }
    this.pos += n; this.expected = currentFrame + n;
    if (this.pos >= this.chunk) this.flush();
    return true;
  }
}
registerProcessor('rec', Rec);`;

export async function addModuleFromSource(ctx, src) {
  const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
  await ctx.audioWorklet.addModule(url);
}

export async function makeRecorder(ctx, channels = 1, chunkSeconds = 1) {
  if (!makeRecorder.loaded) makeRecorder.loaded = new WeakSet();
  if (!makeRecorder.loaded.has(ctx)) { await addModuleFromSource(ctx, RECORDER_SRC); makeRecorder.loaded.add(ctx); }
  const chunk = Math.ceil(ctx.sampleRate * chunkSeconds / 128) * 128;
  const node = new AudioWorkletNode(ctx, 'rec', { numberOfInputs: 1, numberOfOutputs: 1, channelCount: channels,
    channelCountMode: 'explicit', channelInterpretation: 'discrete', processorOptions: { channels, chunk } });
  const chunks = []; const gaps = []; let firstFrame = null; let resolveDone;
  const done = new Promise((r) => (resolveDone = r));
  node.port.onmessage = (e) => {
    if (e.data.firstFrame !== undefined) firstFrame = e.data.firstFrame;
    else if (e.data.gap) gaps.push(e.data.gap);
    else if (e.data.frames) chunks.push(e.data.frames);
    else if (e.data.done) resolveDone();
  };
  // keep the recorder pulled by the graph: connect to a silent gain to the destination
  const mute = new GainNode(ctx, { gain: 0 }); node.connect(mute).connect(ctx.destination);
  return {
    node,
    async stop() {
      node.port.postMessage('stop'); await done;
      const total = chunks.reduce((s, c) => s + c[0].length, 0);
      const out = Array.from({ length: channels }, () => new Float32Array(total));
      let o = 0; for (const c of chunks) { for (let k = 0; k < channels; k++) out[k].set(c[k], o); o += c[0].length; }
      return { firstFrame, channels: out, gaps };
    },
  };
}

// Onsets of clicks in a clean (noise-free) signal: first sample whose |x| exceeds thr after at least
// minGap samples whose |x| stayed below thr. Returns sample indices.
export function clickOnsets(x, thr, minGap) {
  const on = []; let quiet = minGap;
  for (let i = 0; i < x.length; i++) {
    if (Math.abs(x[i]) > thr) { if (quiet >= minGap) on.push(i); quiet = 0; } else quiet++;
  }
  return on;
}

export function stats(arr) {
  if (!arr.length) return { n: 0 };
  const a = Array.from(arr); const n = a.length; const mean = a.reduce((s, v) => s + v, 0) / n;
  const abs = a.map(Math.abs); const sd = Math.sqrt(a.reduce((s, v) => s + (v - mean) ** 2, 0) / n);
  const sorted = abs.slice().sort((p, q) => p - q);
  return { n, mean, mean_abs: abs.reduce((s, v) => s + v, 0) / n, sd, max_abs: sorted[n - 1],
    p95_abs: sorted[Math.min(n - 1, Math.floor(0.95 * (n - 1)))], min: Math.min(...a), max: Math.max(...a) };
}

export async function fetchArrayBuffer(u) { const r = await fetch(u); if (!r.ok) throw new Error(`${u}: ${r.status}`); return r.arrayBuffer(); }
export async function fetchText(u) { const r = await fetch(u); if (!r.ok) throw new Error(`${u}: ${r.status}`); return r.text(); }
