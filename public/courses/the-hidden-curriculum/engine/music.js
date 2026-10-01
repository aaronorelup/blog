/* The Hidden Curriculum — music.js
   A quiet felt-piano and pad bed, synthesized with Web Audio so it is deterministic and
   licence-free. tools/mix.py pulls it with window.__music() and ducks it under the voice. */
(function () {
  'use strict';
  const K = window.K;

  // D major, a slow I – vi – IV – V; each lesson id reseeds the melody so episodes differ
  const PROG = [
    [146.83, 185.0, 220.0, 293.66], // D
    [123.47, 146.83, 185.0, 246.94], // Bm
    [98.0, 146.83, 196.0, 246.94],  // G
    [110.0, 138.59, 164.81, 220.0], // A
  ];
  const PENTA = [293.66, 329.63, 369.99, 440.0, 493.88, 587.33, 659.25, 739.99];

  async function renderMusic() {
    const TL = window.__timeline, DEF = window.__lesson || {};
    const dur = Math.max(4, TL ? TL.dur : 60), sr = 44100;
    const ac = new OfflineAudioContext(2, Math.ceil(sr * dur), sr);
    const seed = [...String(DEF.id || 'map')].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) % 100000;
    const r = K.rng(seed + 1);

    // gentle room: a decaying noise impulse (seeded, so the same every render)
    const conv = ac.createConvolver(), irLen = Math.floor(sr * 2.6), ir = ac.createBuffer(2, irLen, sr), rr = K.rng(99);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < irLen; i++) d[i] = (rr() * 2 - 1) * Math.pow(1 - i / irLen, 3.2); }
    conv.buffer = ir;
    const master = ac.createGain(); master.gain.value = 0.9;
    const wet = ac.createGain(); wet.gain.value = 0.32;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400;
    lp.connect(master); lp.connect(conv); conv.connect(wet); wet.connect(master); master.connect(ac.destination);
    // fade in and out
    master.gain.setValueAtTime(0, 0); master.gain.linearRampToValueAtTime(0.9, 2.5);
    master.gain.setValueAtTime(0.9, Math.max(2.6, dur - 3.5)); master.gain.linearRampToValueAtTime(0, dur);

    const piano = (f, t0, vol, len = 3.2) => {
      [[1, 1], [2, 0.32], [3, 0.1], [4.02, 0.05]].forEach(([mult, amp]) => {
        const o = ac.createOscillator(), gn = ac.createGain();
        o.type = 'sine'; o.frequency.value = f * mult;
        gn.gain.setValueAtTime(0, t0); gn.gain.linearRampToValueAtTime(vol * amp, t0 + 0.012);
        gn.gain.exponentialRampToValueAtTime(0.0001, t0 + len / mult);
        o.connect(gn).connect(lp); o.start(t0); o.stop(t0 + len / mult + 0.05);
      });
    };
    const pad = (freqs, t0, len, vol) => {
      freqs.forEach((f, i) => [-3, 3].forEach((det) => {
        const o = ac.createOscillator(), gn = ac.createGain(), f2 = ac.createBiquadFilter();
        o.type = 'triangle'; o.frequency.value = f; o.detune.value = det + i;
        f2.type = 'lowpass'; f2.frequency.value = 650;
        gn.gain.setValueAtTime(0, t0); gn.gain.linearRampToValueAtTime(vol, t0 + len * 0.35);
        gn.gain.linearRampToValueAtTime(0, t0 + len + 0.6);
        o.connect(f2).connect(gn).connect(lp); o.start(t0); o.stop(t0 + len + 0.7);
      }));
    };

    const beat = 60 / 64, bar = beat * 4;
    for (let b = 0, t = 0.4; t < dur; b++, t += bar) {
      const ch = PROG[b % 4];
      pad(ch, t, bar, 0.018);
      piano(ch[0] / 2, t, 0.05, 4.2);
      for (let k = 0; k < 4; k++) {
        if (r() < 0.55) piano(PENTA[Math.floor(r() * PENTA.length)], t + k * beat + (r() < 0.3 ? beat / 2 : 0), 0.028 + r() * 0.02);
      }
    }
    const buf = await ac.startRendering();
    return toWavB64(buf);
  }

  function toWavB64(buf) {
    const L = buf.getChannelData(0), R = buf.getChannelData(1), n = L.length, dv = new DataView(new ArrayBuffer(44 + n * 4));
    const ws = (o, s) => [...s].forEach((c, i) => dv.setUint8(o + i, c.charCodeAt(0)));
    ws(0, 'RIFF'); dv.setUint32(4, 36 + n * 4, true); ws(8, 'WAVEfmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 2, true);
    dv.setUint32(24, buf.sampleRate, true); dv.setUint32(28, buf.sampleRate * 4, true); dv.setUint16(32, 4, true); dv.setUint16(34, 16, true); ws(36, 'data'); dv.setUint32(40, n * 4, true);
    for (let i = 0; i < n; i++) { dv.setInt16(44 + i * 4, Math.max(-1, Math.min(1, L[i])) * 32767, true); dv.setInt16(46 + i * 4, Math.max(-1, Math.min(1, R[i])) * 32767, true); }
    let s = ''; const u8 = new Uint8Array(dv.buffer);
    for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    return btoa(s);
  }

  // the WAV is tens of MB of base64, so the caller pulls it in slices of window.__musicB64
  window.__music = async () => { window.__musicB64 = await renderMusic(); return window.__musicB64.length; };
})();
