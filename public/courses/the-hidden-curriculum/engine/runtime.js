/* The Hidden Curriculum — runtime.js
   Turns a lesson (scenes keyed by narration section) plus its word timings (cues.js)
   into one function of time. Exposes the renderer contract:
     window.__meta   {W, H, FPS, DUR}
     window.__seek(T) draw absolute time T
     window.__frame(T, q) draw and return a JPEG data URL
     window.__ready  promise; window.__readyDone flips true when fonts/images are in
     window.__music() base64 WAV of the score (engine/music.js) */
(function () {
  'use strict';
  const K = window.K;
  const XFADE = 0.6;
  let DEF = null, TL = null, canvas = null, ctx = null, bufA = null, bufB = null;

  window.LESSON = (def) => { DEF = def; };
  // scenes may also live in scenes/NN.js files (one per agent): SCENE('03', (t, S) => {...})
  window.__scenes = window.__scenes || {};
  window.SCENE = (n, fn) => { window.__scenes[n] = fn; };

  function buildTimeline() {
    const C = window.CUES;
    const keys = Object.keys(DEF.scenes).sort();
    if (C && C.sections && C.sections.length) {
      const secs = C.sections.map((s) => ({ ...s }));
      keys.forEach((n) => { if (!secs.find((s) => s.n === n)) console.warn('scene', n, 'has no narration section'); });
      return { narrated: true, lead: C.lead, tail: C.tail, dur: C.duration, sections: secs, captions: C.captions || [], voice: C.voice || null, guestVoice: C.guest_voice || null };
    }
    // not narrated yet: draft durations so scenes can be authored and previewed silently
    let t = 1.2; const sections = [];
    keys.forEach((n) => { const d = (DEF.draft && DEF.draft[n]) || 12; sections.push({ n, title: '', start: t, end: t + d, cues: {}, words: [] }); t += d + 0.8; });
    return { narrated: false, lead: 1.2, tail: 2.2, dur: t + 1.4, sections, captions: [] };
  }

  // scene i owns [bound_i, bound_{i+1}); bounds sit mid-gap between narration sections
  function bounds() {
    const s = TL.sections;
    return s.map((x, i) => (i === 0 ? 0 : (s[i - 1].end + x.start) / 2)).concat([TL.dur]);
  }

  function sceneApi(sec, i, B) {
    const warned = {};
    return {
      n: sec.n, title: sec.title, start: sec.start,
      dur: sec.end - sec.start,                 // narration length of this section
      out: B[i + 1] - sec.start,                // local time when this scene hands over
      words: sec.words || [],
      /** local time of a [[cue]] placed in script.md; fallback used until narrated */
      cue(name, fallback = 0) {
        if (sec.cues && sec.cues[name] != null) return sec.cues[name] - sec.start;
        if (!warned[name] && TL.narrated) { console.warn(`cue [[${name}]] missing in section ${sec.n}`); warned[name] = 1; }
        return fallback;
      },
      has: (name) => !!(sec.cues && sec.cues[name] != null),
      /** local time the i-th spoken word starts (handy for "on this word" sync) */
      word(idx) { const w = (sec.words || [])[idx]; return w ? w[1] - sec.start : 0; },
      /** local start time of the first spoken word matching re (nth occurrence). A string is a literal,
       *  case-insensitive prefix ('T.' matches only "T."; '.' is not a wildcard); pass a RegExp for patterns.
       *  opt.whole (strings only): match the whole word, so find('hid', 0, fb, { whole: true }) skips "hide";
       *  trailing sentence punctuation on the spoken word is ignored ("hid." still matches). */
      find(re, nth = 0, fallback = 0, opt = {}) {
        const whole = !(re instanceof RegExp) && !!(opt && opt.whole);
        const rx = re instanceof RegExp ? re
          : new RegExp('^' + String(re).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + (whole ? '$' : ''), 'i');
        const clean = (s) => s.replace(/[^\w'.-]/g, '');
        const hits = (sec.words || []).filter((w) => rx.test(clean(w[0])) || (whole && rx.test(clean(w[0]).replace(/[.'-]+$/, ''))));
        return hits[nth] ? hits[nth][1] - sec.start : fallback;
      },
    };
  }

  function drawScene(i, T, target) {
    const sec = TL.sections[i], B = bounds();
    const fn = DEF.scenes[sec.n]; if (!fn) return;
    K.use(target);
    target.save();
    target.clearRect(0, 0, K.W, K.H);
    const S = sceneApi(sec, i, B);
    try { fn(T - sec.start, S); } catch (e) {
      // a broken scene must not take the others down; show it loudly instead
      target.restore(); target.save(); K.bg();
      K.text(`scene ${sec.n} threw: ${e.message}`, 80, 540, { font: 'mono', size: 30, color: K.C.accent });
      if (!drawScene.warned) { console.error(`scene ${sec.n}:`, e); drawScene.warned = 1; }
    }
    if (DEF.badge !== false && !(DEF.noBadge || []).includes(sec.n)) {
      const ba = Math.min(K.io(T - sec.start, -0.2, 0.6, 'out'), 1);
      const bb = DEF.badgeBacking, backing = Array.isArray(bb) ? bb.includes(sec.n) : !!bb;
      K.badge(DEF.id, DEF.short || DEF.title, { alpha: 0.85 * ba, backing });
    }
    target.restore();
  }

  function captionAt(T) {
    const cs = TL.captions;
    for (let i = 0; i < cs.length; i++) if (T >= cs[i][1] && T < cs[i][2]) return cs[i][0];
    return '';
  }

  function drawCaptions(T) {
    const txt = captionAt(T); if (!txt) return;
    K.use(ctx);
    const size = 40, w = K.measure(txt, { font: 'ui', size, weight: 600 }) + 56;
    K.card(K.W / 2 - w / 2, K.H - 128, w, 68, { r: 14, fill: 'rgba(8,9,18,.78)', stroke: false, shadow: false });
    K.text(txt, K.W / 2, K.H - 81, { font: 'ui', size, weight: 600, color: K.C.strong, align: 'center' });
  }

  function seek(T) {
    if (!DEF) return;
    const B = bounds();
    let i = 0; while (i < TL.sections.length - 1 && T >= B[i + 1]) i++;
    const into = T - B[i];
    const tr = (DEF.transition && DEF.transition[TL.sections[i].n]) || 'fade';
    if (i > 0 && into < XFADE && tr !== 'cut') {
      drawScene(i - 1, T, bufA.getContext('2d'));
      drawScene(i, T, bufB.getContext('2d'));
      const k = K.ease.io(into / XFADE);
      ctx.save(); ctx.globalAlpha = 1; ctx.drawImage(bufA, 0, 0); ctx.globalAlpha = k; ctx.drawImage(bufB, 0, 0); ctx.restore();
    } else {
      drawScene(i, T, ctx);
    }
    if (window.__burnCaptions) drawCaptions(T);
    // fade from and to black at the very edges
    const edge = Math.min(K.seg(T, 0, 0.6), 1 - K.seg(T, TL.dur - 0.8, TL.dur));
    if (edge < 1) { ctx.save(); ctx.fillStyle = `rgba(6,7,14,${1 - edge})`; ctx.fillRect(0, 0, K.W, K.H); ctx.restore(); }
  }

  async function boot() {
    DEF.scenes = Object.assign({}, window.__scenes, DEF.scenes || {});
    canvas = document.getElementById('stage-canvas') || document.querySelector('canvas');
    ctx = canvas.getContext('2d');
    bufA = document.createElement('canvas'); bufA.width = K.W; bufA.height = K.H;
    bufB = document.createElement('canvas'); bufB.width = K.W; bufB.height = K.H;
    TL = buildTimeline();
    const params = new URLSearchParams(location.search);
    window.__burnCaptions = params.get('captions') === '1';
    window.__meta = { W: K.W, H: K.H, FPS: DEF.fps || 30, DUR: TL.dur };
    window.__timeline = TL;
    window.__lesson = DEF;
    window.__seek = seek;
    window.__frame = (T, q = 0.95) => { seek(T); return canvas.toDataURL('image/jpeg', q); };
    window.__png = (T) => { seek(T); return canvas.toDataURL('image/png'); };
    await K.fontsReady();
    await K.loadImages(DEF.images);
    if (DEF.setup) DEF.setup();
    seek(Math.min(DEF.poster ?? 2.5, TL.dur));
    window.__readyDone = true;
    window.dispatchEvent(new Event('lesson-ready'));
  }

  window.__ready = new Promise((res) => {
    const go = () => (DEF ? boot().then(res) : console.error('no LESSON() registered'));
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else setTimeout(go, 0);
  });
})();
