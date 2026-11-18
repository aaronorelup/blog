// The room's sound, synthesized with WebAudio and never played before a gesture: the context starts suspended
// unless the browser already allows it, and resumes on the first press in the room. Master at -18 dB into a gentle
// compressor. The pour sings the quarter-wave note of the air over the water, f = c / (4 (L + 0.6 r)), rising as the
// cup fills; leaves tick, the cup tocks on the wood, the stir swishes, the sips slurp. Nothing at the reveal.
const C = 343;                  // m/s
const CUP_R = 0.055, CUP_H = 0.075;

export function makeSound(cupPx) {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  let ctx;
  try { ctx = new AC(); } catch { return null; }
  const master = ctx.createGain(), comp = ctx.createDynamicsCompressor();
  master.gain.value = 0.126;                         // -18 dB
  comp.threshold.value = -20; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.2;
  master.connect(comp).connect(ctx.destination);
  // two seconds of pink noise (Paul Kellet's filter), shared by every voice
  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = buf.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
    b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
    d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
  }
  const noise = (dest, offset = Math.random() * 1.5) => {
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; src.connect(dest); src.start(ctx.currentTime, offset); return src;
  };
  const filter = (type, f, q = 1) => { const n = ctx.createBiquadFilter(); n.type = type; n.frequency.value = f; n.Q.value = q; return n; };
  const gain = (v = 0) => { const g = ctx.createGain(); g.gain.value = v; return g; };
  let pour = null, swish = null, on = true, lastTick = 0;

  const S = {
    ctx,
    get running() { return ctx.state === 'running'; },
    resume() { if (ctx.state === 'suspended') ctx.resume().catch(() => {}); },
    setOn(v) { on = v; master.gain.setTargetAtTime(v ? 0.126 : 0, ctx.currentTime, 0.04); },
    close() { try { ctx.close(); } catch { /* already closed */ } },
    // the pour: level is the water's fill, 0 to 1
    pour(level, flowing) {
      if (!flowing || ctx.state !== 'running') { if (pour) { pour.g.gain.setTargetAtTime(0, ctx.currentTime, 0.08); const p = pour; setTimeout(() => p.src.forEach((x) => x.stop()), 600); pour = null; } return; }
      if (!pour) {
        const bp = filter('bandpass', 700, 8), lp = filter('lowpass', 260, 0.7), g = gain(0), bg = gain(0.5);
        bp.connect(g); lp.connect(bg).connect(g); g.connect(master);
        pour = { bp, lp, g, src: [noise(bp), noise(lp)] };
        g.gain.setTargetAtTime(0.9, ctx.currentTime, 0.05);
      }
      const L = CUP_H * (1 - 0.82 * level), f = C / (4 * (L + 0.6 * CUP_R));
      pour.bp.frequency.setTargetAtTime(f, ctx.currentTime, 0.05);
      pour.lp.frequency.setTargetAtTime(180 + 160 * Math.random(), ctx.currentTime, 0.03);
    },
    tick(size = 0.06) {
      const now = ctx.currentTime;
      if (now - lastTick < 0.02 || !on || ctx.state !== 'running') return;
      lastTick = now;
      const src = ctx.createBufferSource(); src.buffer = buf;
      const hp = filter('highpass', 2600 + (0.09 - size) * 40000, 0.8), g = gain(0);
      src.connect(hp).connect(g).connect(master);
      g.gain.setValueAtTime(0.0001, now); g.gain.linearRampToValueAtTime(0.32, now + 0.001); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.006);
      src.start(now, Math.random() * 1.5, 0.01);
    },
    // the cup settling on wood: ceramic modes 1, 2.32, 4.25, 6.63, damped and dulled
    tock() {
      if (ctx.state !== 'running') return;
      const now = ctx.currentTime, f0 = 300 + 300 * Math.min(1, Math.max(0, (360 - cupPx) / 240));
      const lp = filter('lowpass', 1800, 0.5); lp.connect(master);
      [[1, 0.5, 0.16], [2.32, 0.25, 0.09], [4.25, 0.12, 0.05], [6.63, 0.06, 0.03]].forEach(([r, a, dec]) => {
        const o = ctx.createOscillator(), g = gain(0);
        o.frequency.value = f0 * r; o.connect(g).connect(lp);
        g.gain.setValueAtTime(0.0001, now); g.gain.linearRampToValueAtTime(a, now + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, now + dec * 3);
        o.start(now); o.stop(now + dec * 3 + 0.05);
      });
      const thud = ctx.createBufferSource(), tl = filter('lowpass', 220), tg = gain(0);
      thud.buffer = buf; thud.connect(tl).connect(tg).connect(master);
      tg.gain.setValueAtTime(0.6, now); tg.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
      thud.start(now, 0, 0.1);
    },
    // the swish follows the swirl while the guest stirs
    stir(strength) {
      if (ctx.state !== 'running') return;
      if (!swish) { const lp = filter('lowpass', 300, 0.9), g = gain(0); lp.connect(g).connect(master); swish = { lp, g, src: noise(lp) }; }
      const k = Math.min(1, Math.abs(strength) / 6);
      swish.g.gain.setTargetAtTime(k * 0.7, ctx.currentTime, 0.08);
      swish.lp.frequency.setTargetAtTime(240 + 900 * k, ctx.currentTime, 0.08);
    },
    sip(n) {
      if (ctx.state !== 'running') return;
      const now = ctx.currentTime, src = ctx.createBufferSource(), bp = filter('bandpass', 1800, 3), g = gain(0);
      src.buffer = buf; src.connect(bp).connect(g).connect(master);
      bp.frequency.setValueAtTime(1900 - n * 150, now); bp.frequency.exponentialRampToValueAtTime(520, now + 0.5);
      g.gain.setValueAtTime(0.0001, now); g.gain.linearRampToValueAtTime(0.5, now + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
      src.start(now, Math.random(), 0.6);
      // a small slurp at the end of it
      const s2 = ctx.createBufferSource(), b2 = filter('bandpass', 3200, 9), g2 = gain(0);
      s2.buffer = buf; s2.connect(b2).connect(g2).connect(master);
      g2.gain.setValueAtTime(0.0001, now + 0.42); g2.gain.linearRampToValueAtTime(0.25, now + 0.46); g2.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      b2.frequency.setValueAtTime(3400, now + 0.42); b2.frequency.linearRampToValueAtTime(2200, now + 0.6);
      s2.start(now + 0.42, Math.random(), 0.2);
    },
  };
  return S;
}
