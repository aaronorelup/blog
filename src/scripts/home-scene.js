const WAYPOINTS = [
  { name: 'garden',    pos: [0, 3.1, 19],    target: [0, 2.3, 3],     fov: 46, range: [0.00, 0.15],
    portrait: { pos: [0, 3.4, 21], target: [0, 2.8, 3], fov: 60 } },
  { name: 'threshold', pos: [0.2, 2.0, 8.6], target: [0, 1.7, -1],    fov: 44,  range: [0.185, 0.215],
    portrait: { pos: [0.2, 2.2, 10], target: [0, 1.9, -1], fov: 58 } },
  { name: 'alcove',    pos: [-1.4, 1.85, 2.4], target: [5.82, 1.8, -2.52], fov: 46, range: [0.25, 0.43],
    portrait: { pos: [-1.0, 2.0, 3.0], target: [5.9, 1.85, -1.6], fov: 60 } },
  { name: 'desk',      pos: [-2.43, 2.44, 1.93], target: [-4.76, 1.52, 1.92], fov: 70, range: [0.465, 0.645],
    portrait: { pos: [-2.2, 2.5, 2.0], target: [-4.7, 1.5, 1.95], fov: 78 } },
  { name: 'tea room',  pos: [1.1, 1.6, 1.4], target: [-2.48, 1.35, -4.63], fov: 46, range: [0.68, 0.825],
    portrait: { pos: [1.4, 1.8, 2.4], target: [-3.2, 1.5, -4.6], fov: 60 } },
  { name: 'gate',      pos: [0.6, 1.6, -1.2],target: [0, 2.4, 22],    fov: 48,  range: [0.86, 1.00],
    portrait: { pos: [0.6, 1.8, -1.2], target: [0, 2.6, 22], fov: 62 } }
];

// the lamp-side-up back door on the avatar coin (see bindAvatar)
const HQ_URL = 'https://hq.soul-orelup.workers.dev';
const LANTERN_FLIPS = 5;
const LANTERN_GAP = 3000;

const P = {
  cream: 0xFBF3E8, skyTop: 0x6FB4E8, skyLow: 0xCDE9F7, cloud: 0xFFFFFF, cloudLow: 0xE4EEF6,
  wall: 0xF0A6B8, wallDeep: 0xE8909F, shoji: 0xF6DFA8, shojiLit: 0xFCEFC4,
  wood: 0xC4874F, woodDark: 0x9A5F36, beam: 0xB2703F, tatami: 0xE8C98A,
  grass: 0x9DB863, grassDark: 0x7E9A4A, leaf: 0x8FAE55, leafDark: 0x6E8B3D,
  trunk: 0xB4643C, stone: 0xCBC0AE, clay: 0x7A5B52, tea: 0xE08A5F,
  vermilion: 0xC2603F, ink: 0x3A3A42, petal: 0xF7B7C8, paper: 0xF3E7D2,
  hillNear: 0x8FA96E, hillMid: 0x9BB07A, hillFar: 0xA8BA86, hillBack: 0x6E8B3D,
  roof: 0x9BA1B8, roofRidge: 0x848AA3, cushion: 0x6E7A9B, tataki: 0x9C8B78,
  mtnNear: 0x5C6B8A, mtnFar: 0x7B89A6,
  lampPaper: 0xEFE2C2, lampGlow: 0xF4EAD0, flame: 0xE9DCB4,
  shojiEmis: 0x000000, shojiLitEmis: 0x000000
};

const DAY_PALETTE = Object.assign({}, P);

// night: moonlit outside, lantern-lit paper inside — the shoji become the light source
const NIGHT_PALETTE = {
  cream: 0x151726, skyTop: 0x0B1030, skyLow: 0x2A3157, cloud: 0x39406B, cloudLow: 0x272E52,
  wall: 0x6B4453, wallDeep: 0x573746, shoji: 0x424A66, shojiLit: 0x4E5678,
  wood: 0x5B3A26, woodDark: 0x3F2918, beam: 0x4E3120, tatami: 0x7C6647,
  grass: 0x31453C, grassDark: 0x25352D, leaf: 0x3B4E38, leafDark: 0x2C3B29,
  trunk: 0x492E20, stone: 0x565B63, clay: 0x3A2C29, tea: 0x8B4C34,
  vermilion: 0x803D2C, ink: 0x0E1019, petal: 0xCE8CA4, paper: 0xC7B28D,
  // hills are unlit basic material, so they need their own night values or they glow
  hillNear: 0x243043, hillMid: 0x2A3550, hillFar: 0x33405E, hillBack: 0x1C2637,
  roof: 0x363E56, roofRidge: 0x2C3346, cushion: 0x39425F, tataki: 0x4A4038,
  mtnNear: 0x39435C, mtnFar: 0x4A5670,
  lampPaper: 0xFFD892, lampGlow: 0xFFF0C8, flame: 0xFFE6A8,
  shojiEmis: 0x8A5E28, shojiLitEmis: 0xA0703A
};

// straight channel lerp between two packed hex colours
const lerpHex = (a, b, t) => {
  const r = Math.round(((a >> 16) & 255) + (((b >> 16) & 255) - ((a >> 16) & 255)) * t);
  const g = Math.round(((a >> 8) & 255) + (((b >> 8) & 255) - ((a >> 8) & 255)) * t);
  const l = Math.round((a & 255) + ((b & 255) - (a & 255)) * t);
  return (r << 16) | (g << 8) | l;
};
const lerpN = (a, b, t) => a + (b - a) * t;
const mixRGB = (a, b, t, alpha) => {
  const c = [0, 1, 2].map(i => Math.round(lerpN(a[i], b[i], t)));
  const al = alpha === undefined ? lerpN(a[3] === undefined ? 1 : a[3], b[3] === undefined ? 1 : b[3], t) : alpha;
  return al >= 1 ? 'rgb(' + c.join(',') + ')' : 'rgba(' + c.join(',') + ',' + al.toFixed(3) + ')';
};

// card + copy colors for the two modes, applied to the DOM so the template stays literal
const UI = {
  day: { card: [251, 243, 232, 0.9], shadow: [58, 58, 66, 0.12], head: [190, 122, 16],
         body: [74, 74, 80], quiet: [107, 94, 82], btnBg: [251, 243, 232, 1], btnLine: [58, 58, 66],
         btnText: [58, 58, 66], page: [251, 243, 232], dot: [58, 58, 66], flash: [255, 255, 255],
         coin: [247, 201, 212], coinRim: [58, 58, 66], shadowSize: '0 14px 40px' },
  night: { card: [21, 23, 38, 0.86], shadow: [0, 0, 0, 0.45], head: [240, 192, 106],
           body: [198, 194, 212], quiet: [143, 138, 163], btnBg: [240, 192, 106, 0.10], btnLine: [198, 194, 212],
           btnText: [242, 236, 223], page: [16, 18, 32], dot: [198, 194, 212], flash: [12, 14, 24],
           coin: [59, 46, 68], coinRim: [90, 84, 112], shadowSize: '0 18px 50px' }
};

// the expanding panel's own palette: same two moods as the scene, its own roles
const PANELUI = {
  day: { bg: [251,243,232,0.97], head: [190,122,16], strong: [58,58,66], body: [74,74,80],
         quiet: [122,108,93], soft: [107,94,82], line: [226,213,192], line2: [208,190,163],
         accent: [168,94,43], gold: [176,138,46], tile: [243,231,210], hover: [244,233,216],
         code: [240,229,210], scrim: [251,243,232,0.34] },
  night: { bg: [21,23,38,0.96], head: [240,192,106], strong: [242,231,213], body: [201,188,169],
           quiet: [142,131,117], soft: [156,145,127], line: [48,46,62], line2: [74,68,90],
           accent: [226,121,92], gold: [201,162,39], tile: [32,31,44], hover: [34,33,48],
           code: [34,33,48], scrim: [8,9,18,0.44] }
};

const PANEL_TRANS = 'left 560ms cubic-bezier(.4,0,.2,1),top 560ms cubic-bezier(.4,0,.2,1),width 560ms cubic-bezier(.4,0,.2,1),height 560ms cubic-bezier(.4,0,.2,1),opacity 380ms ease';

// The scene and the overlay panel it opens. Ported from the Claude Design artifact:
// the design ran this as a React component, but nothing here needs React — the panel's
// content is server-rendered by Astro, so the class only ever shows and hides it.
// The scene is cheap in draw calls (25) and triangles (37k) but pays per pixel,
// per light, and per frame. Those are the three dials, in the order it is worth
// giving them up: petals decide whether we redraw *at all* when the visitor is
// still, lamps decide how many lights every fragment shader loops over, and dpr
// decides how many fragments there are. Below the bottom rung the scene stops
// being worth its cost and the page falls back to the flat document.
const QUALITY = [
  // 'static' keeps the tea house on screen but stops animating it: the page
  // scrolls like an ordinary document and the scene cuts to the frame for
  // whichever section you are next to. Losing the ride is a far smaller loss
  // than losing the art, so this rung comes before giving up altogether.
  { name: 'static', dpr: 1.0,  petals: 0,    lamps: 0, reduced: true },
  { name: 'low',    dpr: 1.0,  petals: 0,    lamps: 0 },
  { name: 'medium', dpr: 1.25, petals: 0.45, lamps: 3 },
  { name: 'high',   dpr: 1.5,  petals: 1,    lamps: 99 },
];

// The day and night rigs used to be six lights cross-faded against each other,
// all six resident and all six evaluated by every fragment shader even when
// half of them sat at zero intensity. They are one rig now, lerped in place.
const RIG = {
  amb:  { day: { c: 0xFFFFFF, i: 1.5 },  night: { c: 0xA8B4E4, i: 0.34 } },
  hemi: { day: { c: 0xFFF6EA, g: 0xF2DFC6, i: 1.1 }, night: { c: 0x8C9FDC, g: 0x232839, i: 0.42 } },
  dir:  { day: { c: 0xFFF4E4, i: 0.35, p: [6, 12, 9] }, night: { c: 0xD8E2FF, i: 0.3, p: [-7, 14, 8] } },
};

// Panel routes: /ledger (and its posts), /projects, /about and /courses open as views of the
// overlay panel. Only /courses itself is a view; a course page (/courses/<course>/) and its
// lessons are real pages, so they navigate normally.
const PANEL_ROUTE = /^\/(?:(?:ledger|projects|about)(?:\/|$)|courses\/?$)/;
const viewForPath = (p) => (/^\/projects\/?$/.test(p) ? 'projects' : /^\/about\/?$/.test(p) ? 'about' : /^\/courses\/?$/.test(p) ? 'courses' : 'ledger');
const pathForView = (v) => (v === 'projects' ? '/projects' : v === 'about' ? '/about' : v === 'courses' ? '/courses' : '/ledger');

export class HomeScene {
  constructor(opts) {
    this.opts = Object.assign(
      { nightMode: true, stagingMode: false, showStats: false, forceReducedMotion: false },
      opts,
    );
    // What the panel is showing. `view` is one of ledger/courses/projects/about; `reader` is a
    // post slug when an entry is open on top of the ledger.
    this.view = 'ledger';
    this.reader = null;
    this.panelOpen = false;
  }

  // visitor's own choice beats the default, and it survives reloads
  resolveNight() {
    if (this.override !== undefined) return this.override;
    try {
      const s = localStorage.getItem('scene-mode');
      if (s === 'night' || s === 'day') return s === 'night';
    } catch (_) {}
    return !!this.opts.nightMode;
  }

  bindModeToggle() {
    const btn = document.getElementById('mode-toggle');
    if (!btn) return;
    this.paintModeToggle();
    if (btn._bound) return;                 // the button survives a rebuild; bind it once
    btn._bound = true;
    btn.addEventListener('click', () => this.switchMode());
  }

  paintModeToggle() {
    const btn = document.getElementById('mode-toggle'),
          knob = document.getElementById('mode-knob');
    if (!btn) return;
    const SUN = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FBF3E8" stroke-width="2.1" stroke-linecap="round" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="4.4" fill="#FBF3E8" stroke="none"></circle>' +
      '<path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7"></path></svg>';
    const MOON = '<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M20.2 14.6A8.6 8.6 0 1 1 9.4 3.8a6.9 6.9 0 0 0 10.8 10.8Z" fill="#151726"></path></svg>';
    btn.setAttribute('aria-pressed', this.night ? 'true' : 'false');
    if (this.night) {
      btn.style.background = 'rgba(21,23,38,0.86)';
      btn.style.borderColor = '#4A4560';
      if (knob) {
        knob.style.transform = 'translateX(36px)';
        knob.style.background = '#F0C06A';
        knob.style.boxShadow = '0 0 12px rgba(240,192,106,0.7)';
        if (knob.dataset.icon !== 'moon') { knob.dataset.icon = 'moon'; knob.innerHTML = MOON; }
      }
    } else {
      btn.style.background = 'rgba(251,243,232,0.92)';
      btn.style.borderColor = '#3A3A42';
      if (knob) {
        knob.style.transform = 'translateX(0)';
        knob.style.background = '#BE7A10';
        knob.style.boxShadow = 'none';
        if (knob.dataset.icon !== 'sun') { knob.dataset.icon = 'sun'; knob.innerHTML = SUN; }
      }
    }
  }

  // sunset / sunrise in fast-forward: no rebuild, no veil — the world just changes time
  switchMode() {
    const next = !this.night;
    this.night = next;
    this.override = next;
    try { localStorage.setItem('scene-mode', next ? 'night' : 'day'); } catch (_) {}
    this.paintModeToggle();
    this.tweenMix(next ? 1 : 0, 2600);
  }

  tweenMix(to, dur) {
    const from = this.mix === undefined ? (this.night ? 1 : 0) : this.mix;
    if (from === to) { this.applyMix(to); return; }
    const t0 = performance.now();
    cancelAnimationFrame(this._mixRaf);
    const step = () => {
      const p = Math.min(1, (performance.now() - t0) / dur);
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;   // ease in-out
      this.applyMix(from + (to - from) * e);
      if (p < 1) this._mixRaf = requestAnimationFrame(step);
    };
    step();
  }

  // day/night swaps every material colour, so rebuild the world rather than patch it
  async reboot() {
    const t = this.t, idx = this.stopIdx;
    this.teardown();
    if (this.canvas) this.canvas.style.display = 'block';
    await this.boot();
    // teardown() strips the document-level bindings too — put them back
    this.bindLedger();
    this.bindAvatar();
    this.bindModeToggle();
    this.onPop = () => this.syncRoute(false);
    window.addEventListener('popstate', this.onPop);
    if (!this.alive) return;
    this.t = this.tTarget = t; this.stopIdx = idx; this.lastRendered = -1;
    this.syncRail();
  }

  nightLamp(light) {
    light.userData.base = light.intensity;
    (this.nightLights = this.nightLights || []).push(light);
    (this.lampLights = this.lampLights || []).push(light);
  }

  // Cross-fading two lights is just adding their contributions, so one light can
  // stand in for the pair exactly: sum the (intensity x colour) vectors and split
  // the result back into an intensity and a unit colour. Ambient and hemisphere
  // are exact at every value of m. The key light is exact at m=0 and m=1 and
  // merely swings across the sky in between, which is the only place the two
  // directions could ever have disagreed.
  applyRig(m) {
    if (!this.rig) return;
    const T = this.T, C = (hex) => new T.Color(hex);
    const split = (light, vecs) => {
      let i = 0;
      for (const v of vecs) i = Math.max(i, v.r, v.g, v.b);
      light.intensity = i;
      const inv = i > 1e-6 ? 1 / i : 0;
      return inv;
    };
    const mixVec = (dayHex, dayI, nightHex, nightI) => {
      const a = C(dayHex).multiplyScalar(dayI * (1 - m));
      const b = C(nightHex).multiplyScalar(nightI * m);
      return a.add(b);
    };

    const av = mixVec(RIG.amb.day.c, RIG.amb.day.i, RIG.amb.night.c, RIG.amb.night.i);
    let inv = split(this.rig.amb, [av]);
    this.rig.amb.color.setRGB(av.r * inv, av.g * inv, av.b * inv);

    const hs = mixVec(RIG.hemi.day.c, RIG.hemi.day.i, RIG.hemi.night.c, RIG.hemi.night.i);
    const hg = mixVec(RIG.hemi.day.g, RIG.hemi.day.i, RIG.hemi.night.g, RIG.hemi.night.i);
    inv = split(this.rig.hemi, [hs, hg]);
    this.rig.hemi.color.setRGB(hs.r * inv, hs.g * inv, hs.b * inv);
    this.rig.hemi.groundColor.setRGB(hg.r * inv, hg.g * inv, hg.b * inv);

    const dv = mixVec(RIG.dir.day.c, RIG.dir.day.i, RIG.dir.night.c, RIG.dir.night.i);
    inv = split(this.rig.dir, [dv]);
    this.rig.dir.color.setRGB(dv.r * inv, dv.g * inv, dv.b * inv);
    const dp = RIG.dir.day.p, np = RIG.dir.night.p;
    this.rig.dir.position.set(
      dp[0] + (np[0] - dp[0]) * m,
      dp[1] + (np[1] - dp[1]) * m,
      dp[2] + (np[2] - dp[2]) * m,
    );
  }

  // Adding or removing a light recompiles every material, so this only touches
  // the graph when the wanted count actually changes — never per frame.
  syncLamps() {
    const pool = this.lampLights || [];
    if (!pool.length) return;
    const budget = QUALITY[this.tier == null ? QUALITY.length - 1 : this.tier].lamps;
    // in daylight every lamp sits at zero intensity, so pulling them is free
    const want = (this.mix || 0) > 0.02 ? Math.min(budget, pool.length) : 0;
    if (want === this._lampsOn) return;
    this._lampsOn = want;
    pool.forEach((l, i) => {
      const on = i < want;
      if (on && !l.parent && l.userData.home) l.userData.home.add(l);
      else if (!on && l.parent) l.parent.remove(l);
    });
  }

  setPetalDensity(f) {
    const max = this.petalMax || 0;
    const n = Math.max(0, Math.round(max * f));
    this.petalCount = n;
    if (this.petalMesh) { this.petalMesh.count = n; this.petalMesh.visible = n > 0; }
  }

  pixelRatio() {
    const cap = QUALITY[this.tier == null ? QUALITY.length - 1 : this.tier].dpr;
    return Math.min(window.devicePixelRatio || 1, cap);
  }

  applyTier() {
    const q = QUALITY[this.tier];
    this.quality = q.name;
    if (this.renderer) {
      this.renderer.setPixelRatio(this.pixelRatio());
      this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    }
    this.setPetalDensity(q.petals);
    this._lampsOn = undefined;      // force syncLamps to re-evaluate the budget
    this.syncLamps();
    if (q.reduced && !this.reduced) this.enterReduced();
    this.lastRendered = -1;
  }

  // Hand the page back to the browser: native scrolling, every section in flow
  // and fully visible, no per-frame card cross-fade. The canvas stays, and the
  // frame loop keeps cutting it to whichever section you are beside.
  enterReduced() {
    this.reduced = true;
    this.unbindInput();
    this.disableStage();
    this.cards.forEach(c => this.cardState(c.el, 1, 0, 0));
    this.measureCards();
    this.lastProgress = undefined;
  }

  // Reduced mode used to read getBoundingClientRect for every card on every
  // frame, which is a forced layout per card per frame even when nothing moved.
  // The offsets only change on resize, so they are cached here instead.
  measureCards() {
    this._cardTops = this.cards.map(c => c.el.getBoundingClientRect().top + window.scrollY);
  }

  // Only frames that actually drew are sampled: at the bottom tier the petals are
  // gone, so a still visitor renders nothing and the rAF gap would otherwise read
  // as a healthy 16ms forever. What matters is how fast the scene moves *when it
  // is moving*, which is exactly when the visitor is looking at it.
  sampleQuality(nowMs) {
    if (this._pinned) return;
    const prev = this._lastDrawTs;
    this._lastDrawTs = nowMs;
    if (!prev || nowMs - prev > 200) return;        // a gap means it was idle, not slow
    const s = (this._fts = this._fts || []);
    s.push(nowMs - prev);
    if (s.length < 45) return;
    const med = s.slice().sort((a, b) => a - b)[s.length >> 1];
    s.length = 0;
    if (med > 45 && this.tier === 0) { this.bail('below 22fps even as a static frame'); return; }
    if (med > 22 && this.tier > 0) {
      this._tierFloor = Math.min(this._tierFloor == null ? Infinity : this._tierFloor, this.tier);
      this.tier--;
      this.applyTier();
    } else if (med < 13 && this.tier < QUALITY.length - 1
               && this.tier + 1 < (this._tierFloor == null ? Infinity : this._tierFloor)) {
      this.tier++;
      this.applyTier();
    }
  }

  // ?diag — measure this machine rather than guess at it. Drives the camera along
  // the real curve at each rung and reports the frame pacing the visitor would
  // actually get, plus what is doing the drawing. A scene this small running slowly
  // usually means it is not being drawn by a GPU at all, and no amount of tuning
  // the scene can fix that, so the renderer string is the first thing reported.
  async runDiagnostic() {
    const lines = [];
    const say = (k, v) => lines.push(String(k).padEnd(12) + v);

    let vendor = 'unknown', device = 'unknown';
    const gl = this.renderer && this.renderer.getContext();
    if (gl) {
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      if (dbg) {
        vendor = gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) || vendor;
        device = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || device;
      }
    }
    const software = /swiftshader|llvmpipe|softpipe|software|basic render/i.test(device);

    say('renderer', device);
    say('vendor', vendor);
    say('accel', software ? 'SOFTWARE (no GPU!)' : 'hardware');
    say('screen', `${window.innerWidth}x${window.innerHeight} @dpr ${window.devicePixelRatio || 1}`);
    say('scene', `${this.renderer.info.render.calls} draws, ${(this.renderer.info.render.triangles / 1000).toFixed(0)}k tris`);

    const wasPinned = this._pinned, wasTier = this.tier, wasReduced = this.reduced;
    this._pinned = true;

    for (let i = QUALITY.length - 1; i >= 0; i--) {
      this.tier = i;
      this.reduced = false;                     // measure the ride, not the fallback
      this.applyTier();
      this.reduced = false;
      const gaps = await this._spin(1200);
      if (!gaps.length) { say(QUALITY[i].name, 'not measured'); continue; }
      gaps.sort((a, b) => a - b);
      const med = gaps[gaps.length >> 1];
      const p95 = gaps[Math.min(gaps.length - 1, Math.floor(gaps.length * 0.95))];
      say(QUALITY[i].name, `${(1000 / med).toFixed(0)} fps  (median ${med.toFixed(1)}ms, worst ${p95.toFixed(1)}ms)`);
    }

    this.tier = wasTier; this.reduced = wasReduced; this._pinned = wasPinned;
    this.applyTier();

    const text = lines.join('\n');
    window.__diagText = text;
    console.log('%c[tea house diagnostic]\n' + text, 'font-family:monospace');
    if (this.statsEl) {
      this.statsEl.style.display = 'block';
      this.statsEl.textContent = text + '\n\n(copy this and send it over)';
    }
    return text;
  }

  // spin the camera along the real curve for `ms`, returning the frame gaps
  _spin(ms) {
    return new Promise((resolve) => {
      const gaps = [];
      const t0 = performance.now();
      let last = t0;
      // rAF is paused in a hidden tab; do not hang the report waiting for it
      // if rAF never fires (hidden tab) give up fast rather than stalling the report
      let started = false;
      const bail = setTimeout(() => { if (!started) resolve(gaps); }, 600);
      const hard = setTimeout(() => resolve(gaps), ms + 1500);
      const step = () => {
        started = true;
        const now = performance.now();
        const u = ((now - t0) / 2500) % 1;
        this.posCurve.getPoint(u, this._p);
        this.tgtCurve.getPoint(u, this._q);
        this.camera.position.copy(this._p);
        this.camera.lookAt(this._q);
        this.camera.updateProjectionMatrix();
        if (this.petalCount > 0) this.updatePetals(now / 1000);
        this.renderer.render(this.scene, this.camera);
        if (now - t0 > 250) gaps.push(now - last);   // ignore the warm-up frames
        last = now;
        if (now - t0 < ms) requestAnimationFrame(step);
        else { clearTimeout(bail); clearTimeout(hard); resolve(gaps); }
      };
      requestAnimationFrame(step);
    });
  }

  // the whole look is one number: 0 = midday, 1 = night. Everything reads off it.
  applyMix(mix) {
    this.mix = Math.max(0, Math.min(1, mix));
    const m = this.mix, T = this.T;
    Object.keys(DAY_PALETTE).forEach(k => { P[k] = lerpHex(DAY_PALETTE[k], NIGHT_PALETTE[k], m); });
    (this.reg || []).forEach(({ mat, key, prop }) => {
      const target = mat[prop];
      if (target && target.setHex) target.setHex(P[key]);
    });
    if (this.ink) this.ink.uniforms.uC.value.setHex(P.ink);
    if (this.renderer) this.renderer.setClearColor(P.cream, 1);
    this.updateSky();
    (this.dayLights || []).forEach(l => { l.intensity = l.userData.base * (1 - m); });
    (this.nightLights || []).forEach(l => { l.intensity = l.userData.base * m; });
    this.applyRig(m);
    this.syncLamps();
    this.applyMode(m);
    this.lastRendered = -1;                 // force the next frame to redraw
  }

  updateSky() {
    if (!this.skyGeo) return;
    const T = this.T, pos = this.skyGeo.attributes.position, col = this.skyGeo.attributes.color;
    const top = new T.Color(P.skyTop), low = new T.Color(P.skyLow), c = new T.Color();
    for (let i = 0; i < pos.count; i++) {
      const y = Math.max(0, Math.min(1, (pos.getY(i) / 180) * 0.5 + 0.5));
      c.copy(low).lerp(top, Math.pow(y, 0.7));
      col.setXYZ(i, c.r, c.g, c.b);
    }
    col.needsUpdate = true;
  }

  // cards, copy and page colours, lerped by the same mix as the world
  applyMode(m) {
    if (m === undefined) m = this.mix !== undefined ? this.mix : (this.night ? 1 : 0);
    const d = UI.day, n = UI.night, mixed = (k, a) => mixRGB(d[k], n[k], m, a);
    const head = mixed('head'), body = mixed('body'), quiet = mixed('quiet'), dot = mixed('dot');
    document.body.style.background = mixed('page');
    const flash = document.getElementById('scene-flash');
    if (flash) flash.style.background = mixed('flash');
    (this.cards || []).forEach(({ el }) => {
      const card = el.firstElementChild;
      if (!card) return;
      card.style.background = mixed('card');
      card.style.boxShadow = (m < 0.5 ? d.shadowSize : n.shadowSize) + ' ' + mixed('shadow');
      card.querySelectorAll('h1, h2').forEach(h => { h.style.color = head; });
      card.querySelectorAll('p').forEach(p => {
        p.style.color = /0\.14em/.test(p.getAttribute('style') || '') ? quiet : body;
      });
      card.querySelectorAll('a').forEach(a => {
        const s = a.getAttribute('style') || '';
        if (/border-radius:\s*999px/.test(s)) {
          a.style.background = mixed('btnBg'); a.style.borderColor = mixed('btnLine'); a.style.color = mixed('btnText');
        } else { a.style.color = head; }
      });
    });
    const img = document.querySelector('#avatar-spin img');
    const face = img && img.parentElement;
    if (face) { face.style.background = mixed('coin'); face.style.borderColor = mixed('coinRim'); }
    // reverse of the coin: bonsai by day, lit andon after dark
    const back = document.getElementById('coin-back');
    const backNight = document.getElementById('coin-back-night');
    if (back) { back.style.background = mixRGB([246, 223, 168], [33, 31, 51], m); back.style.borderColor = mixed('coinRim'); }
    if (backNight) backNight.style.opacity = m.toFixed(3);
    this.applyPanelTheme(m);
    this.railDot = dot;
    if (this.rail) Array.from(this.rail.children).forEach(b => { b.style.borderColor = dot; });
    this.syncRail && this.syncRail();
  }

  applyPanelTheme(m) {
    const el = document.getElementById('panel-screen');
    if (!el) return;
    if (m === undefined) m = this.mix !== undefined ? this.mix : (this.night ? 1 : 0);
    const d = PANELUI.day, n = PANELUI.night;
    Object.keys(d).forEach(k => el.style.setProperty('--pc-' + k, mixRGB(d[k], n[k], m)));
    el.style.setProperty('--pc-shadow', m < 0.5 ? '0 30px 90px rgba(58,58,66,0.22)' : '0 34px 100px rgba(0,0,0,0.6)');
    // Syntax highlighting can't be tweened: Shiki ships both themes as custom
    // properties and CSS picks one off :root[data-mode]. Flip it at the same
    // midpoint --pc-shadow uses, so code blocks turn with the rest of the room.
    if (m < 0.5) document.documentElement.dataset.mode = 'day';
    else delete document.documentElement.dataset.mode;
  }

  // nearly full screen, with a consistent margin on every side
  panelRect() {
    const mx = Math.max(14, Math.min(48, window.innerWidth * 0.025));
    const my = Math.max(14, Math.min(34, window.innerHeight * 0.03));
    return { left: mx + 'px', top: my + 'px',
             width: (window.innerWidth - mx * 2) + 'px', height: (window.innerHeight - my * 2) + 'px' };
  }

  // Astro server-renders all three views into the panel; showing one is a display swap.
  // The reader sits on top of the ledger, so an open post hides the list but keeps
  // "Ledger" lit in the nav.
  applyView() {
    const r = this.reader;
    const shown = r ? 'reader' : this.view;
    ['ledger', 'courses', 'projects', 'about', 'reader'].forEach((name) => {
      const el = document.querySelector('[data-view="' + name + '"]');
      if (el) el.style.display = name === shown ? '' : 'none';
    });
    const lit = r ? 'ledger' : this.view;
    document.querySelectorAll('[data-nav]').forEach((a) => {
      a.style.color = a.dataset.nav === lit ? 'var(--pc-head)' : 'var(--pc-quiet)';
    });
  }

  // The panel's geometry lives in this.panelGeom so open/close/resize all drive it
  // through one place.
  applyPanelVisibility() {
   try {
    const wrap = document.getElementById('panel-screen'), c = document.getElementById('panel-card');
    if (!wrap) return;
    const on = this.panelOpen;
    wrap.style.pointerEvents = on ? 'auto' : 'none';
    wrap.style.visibility = (on || this._panelClosing) ? 'visible' : 'hidden';
    wrap.setAttribute('aria-hidden', on ? 'false' : 'true');
    if (c && this.panelGeom) {
      const g = this.panelGeom;
      c.style.transition = g.transition;
      c.style.left = g.left; c.style.top = g.top;
      c.style.width = g.width; c.style.height = g.height; c.style.opacity = g.opacity;
    }
    const inner = document.getElementById('panel-inner');
    if (inner) inner.style.opacity = this.panelInner || '0';
    const scrim = document.getElementById('panel-scrim');
    if (scrim) scrim.style.opacity = (on && !this._panelClosing) ? '1' : '0';
    if (this.rail) {
      this.rail.style.transition = 'opacity 260ms ease';
      this.rail.style.opacity = on ? '0' : '1';
      this.rail.style.pointerEvents = on ? 'none' : 'auto';
    }
    this.applyPanelTheme();
   } catch (err) { console.error('[panel]', err); }
  }

  // the card the visitor clicked grows into the page; the scene keeps running behind it
  openPanel(view, srcEl) {
    const path = pathForView(view);
    if (this.panelOpen) { this.navTo(path, { view, reader: null }); return; }
    this.panelSrcEl = srcEl || null;
    const r = srcEl ? srcEl.getBoundingClientRect() : null;
    this.unbindInput();                       // scrolling no longer walks the scene
    this.locked = true;
    history.pushState({}, '', path);
    this.panelGeom = r
      ? { transition: 'none', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', opacity: '0.55' }
      : Object.assign({ transition: 'none' }, this.panelRect(), { opacity: '0' });
    this.panelInner = '0';
    this.view = view; this.reader = null; this.panelOpen = true;
    this.applyView();
    this.applyPanelVisibility();
    const sc0 = document.getElementById('panel-scroll');
    if (sc0) sc0.scrollTop = 0;
    clearTimeout(this._panelOpenT); clearTimeout(this._panelInnerT);
    this._panelOpenT = setTimeout(() => {
      this.panelGeom = Object.assign({ transition: PANEL_TRANS }, this.panelRect(), { opacity: '1' });
      this.applyPanelVisibility();
    }, 40);
    this._panelInnerT = setTimeout(() => {
      this.panelInner = '1';
      const inner = document.getElementById('panel-inner');
      if (inner) inner.style.opacity = '1';
    }, 300);
  }

  closePanel(push) {
    if (!this.panelOpen) return;
    if (push !== false) history.pushState({}, '', '/');
    const el = this.panelSrcEl, r = el ? el.getBoundingClientRect() : null;
    this.panelInner = '0';
    this._panelClosing = true;
    this.panelGeom = r
      ? { transition: PANEL_TRANS, left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', opacity: '0' }
      : Object.assign({}, this.panelGeom, { transition: PANEL_TRANS, opacity: '0' });
    this.applyPanelVisibility();
    clearTimeout(this._panelCloseT);
    this._panelCloseT = setTimeout(() => {
      this._panelClosing = false;
      this.locked = false;
      if (!this.reduced) { this.unbindInput(); this.bindInput(); }
      this.panelOpen = false; this.reader = null;
      this.applyView();
      setTimeout(() => this.applyPanelVisibility(), 16);
    }, 540);
  }

  mount() {
    this.boot(); this.bindAvatar(); this.bindLedger(); this.bindModeToggle(); this.bindFeedCopy();
    this.applyView();
    this.warmPanelImages();
    this.onPanelKey = (e) => {
      if (e.key === 'Escape' && this.panelOpen) { e.preventDefault(); this.closePanel(); }
    };
    window.addEventListener('keydown', this.onPanelKey);
    this.onPanelResize = () => {
      if (!this.panelOpen || this._panelClosing) return;
      this.panelGeom = Object.assign({ transition: 'none' }, this.panelRect(), { opacity: '1' });
      this.applyPanelVisibility();
    };
    window.addEventListener('resize', this.onPanelResize);
    this.onPop = () => this.syncRoute();
    window.addEventListener('popstate', this.onPop);
    // deep link: /ledger, /courses, /projects, /about or /ledger/<slug>/ opens straight into the
    // panel, no flight. Astro serves each of those as a real page too, so this only
    // runs when the visitor is already on the homepage document.
    if (PANEL_ROUTE.test(location.pathname)) {
      this.syncRoute();
      setTimeout(() => this.openLedgerInstant(), 0);
    }
  }

  destroy() {
    window.removeEventListener('keydown', this.onPanelKey);
    window.removeEventListener('resize', this.onPanelResize);
    window.removeEventListener('popstate', this.onPop);
    clearTimeout(this._panelOpenT); clearTimeout(this._panelInnerT); clearTimeout(this._panelCloseT);
    this.teardown();
  }

  // The project screenshots ship with loading="lazy", which is right on the standalone
  // /projects page but never resolves here: the panel's views start display:none, so the
  // images never enter the viewport, and showing the view later does not re-trigger the
  // fetch — the tiles stay empty for the whole visit. Flipping loading to eager does
  // start the fetch even while hidden, so warm them once the browser is idle. That keeps
  // them off the scene's critical path and still has them cached before anyone can
  // scroll to a card and click it.
  warmPanelImages() {
    const warm = () => {
      document.querySelectorAll('#panel-screen img[loading="lazy"]').forEach((img) => {
        img.loading = 'eager';
      });
    };
    if (typeof requestIdleCallback === 'function') requestIdleCallback(warm, { timeout: 3000 });
    else setTimeout(warm, 1200);
  }

  // the feed URL is a build-time constant, but the copy button needs a live handler
  bindFeedCopy() {
    const btn = document.getElementById('feed-copy');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const url = location.origin + '/rss.xml';
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => {
        btn.textContent = 'copied';
        clearTimeout(this.copyTimer);
        this.copyTimer = setTimeout(() => { btn.textContent = 'copy'; }, 1800);
      }).catch(() => {});
    });
  }

  openLedgerInstant() {
    this.unbindInput();
    this.locked = true;
    this.panelSrcEl = null;
    this.panelGeom = Object.assign({ transition: 'none' }, this.panelRect(), { opacity: '1' });
    this.panelInner = '1';
    this.panelOpen = true;
    this.applyView();
    setTimeout(() => {
      this.applyPanelVisibility();
      setTimeout(() => { if (this.panelGeom) this.panelGeom.transition = PANEL_TRANS; }, 32);
    }, 16);
  }

  // Post bodies aren't inlined into the homepage — there's one real page per post and
  // this pulls the article out of it, so the markdown has exactly one renderer.
  async openPost(slug, push) {
    if (push !== false) history.pushState({ slug }, '', '/ledger/' + slug + '/');
    this.reader = slug;
    this.applyView();
    this.scrollPanelTop();
    const host = document.querySelector('[data-view="reader"]');
    if (!host) return;
    if (host.dataset.slug === slug) return;          // already loaded
    this.postCache = this.postCache || {};
    try {
      if (!this.postCache[slug]) {
        const res = await fetch('/ledger/' + slug + '/', { headers: { Accept: 'text/html' } });
        if (!res.ok) throw new Error(res.status);
        const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
        const art = doc.querySelector('[data-post-article]');
        if (!art) throw new Error('no article');
        this.postCache[slug] = art.innerHTML;
      }
      if (this.reader !== slug) return;              // visitor moved on while it loaded
      host.innerHTML = this.postCache[slug];
      host.dataset.slug = slug;
      // Scripts in the copied HTML never run, so the post's custom elements come from here.
      if (host.querySelector('ao-compare, ao-model, ao-timeline, ao-game, ao-slider, ao-frames, ao-diff')) import('./post-components.js');
      this.scrollPanelTop();
    } catch (_) {
      location.href = '/ledger/' + slug + '/';       // the real page always works
    }
  }

  scrollPanelTop() {
    setTimeout(() => {
      const sc = document.getElementById('panel-scroll');
      if (sc) sc.scrollTop = 0;
    }, 16);
  }

  returnToScene() { this.closePanel(); }

  syncRoute() {
    const path = location.pathname;
    if (!PANEL_ROUTE.test(path)) {
      if (this.panelOpen) this.closePanel(false);
      return;
    }
    const m = path.match(/^\/ledger\/([^/]+)\/?$/);
    const slug = m ? decodeURIComponent(m[1]) : null;
    this.view = viewForPath(path);
    if (slug) { this.openPost(slug, false); }
    else { this.reader = null; this.applyView(); }
    // Going forward into a panel route after backing out of it has to bring the panel
    // with it, or the address bar says /projects while the visitor is looking at the garden.
    if (!this.panelOpen) this.openLedgerInstant();
  }

  navTo(path, patch) {
    history.pushState({}, '', path);
    if (patch && patch.view) this.view = patch.view;
    if (patch && 'reader' in patch) this.reader = patch.reader;
    this.applyView();
    this.scrollPanelTop();
  }

  // any ledger/courses/projects/about link grows its card into the full page
  bindLedger() {
    this.onLedgerClick = (e) => {
      if (e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const t = e.target.closest ? e.target : null;
      if (!t) return;

      // "Back to the tea house" — collapse the panel instead of navigating
      if (t.closest('[data-panel-home]')) { e.preventDefault(); this.closePanel(); return; }

      // a ledger row inside the panel: swap in the post without leaving the page
      const entry = t.closest('[data-ledger-entry]');
      if (entry && this.panelOpen) {
        e.preventDefault();
        this.openPost(entry.getAttribute('data-ledger-entry'));
        return;
      }

      // "← LEDGER" out of an open post
      if (t.closest('[data-close-reader]')) {
        e.preventDefault();
        this.navTo('/ledger', { view: 'ledger', reader: null });
        return;
      }

      // a post linking to another post from inside its own body: stay in the reader
      const cross = t.closest('a[href^="/ledger/"]');
      if (cross && this.panelOpen) {
        const m = (cross.getAttribute('href') || '').match(/^\/ledger\/([^/?#]+)\/?$/);
        if (m) {
          e.preventDefault();
          this.openPost(decodeURIComponent(m[1]));
          return;
        }
      }

      const a = t.closest('a[href="/ledger"], a[href="/courses"], a[href="/projects"], a[href="/about"], [data-ledger-link]');
      if (!a) return;
      e.preventDefault();
      const href = a.getAttribute('href') || '/ledger';
      const view = viewForPath(href);
      // already open: this is the panel's own nav, so cross-fade rather than re-grow
      if (this.panelOpen) { this.navTo(href, { view, reader: null }); return; }
      const sec = a.closest('section[data-wp]');
      this.openPanel(view, sec ? sec.firstElementChild : null);
    };
    this.onOutboundClick = (e) => {
      if (e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a || !this.renderer || this.reduced) return;
      const href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || /^(mailto:|tel:|javascript:)/i.test(href)) return;
      if (a.hasAttribute('data-ledger-entry') || a.hasAttribute('data-no-fly')) return;
      if (PANEL_ROUTE.test(href)) return;   // these open a card instead
      if (this.mode === 'exit') { e.preventDefault(); return; }
      e.preventDefault();
      this.flyToLink(a.href, a.target === '_blank');
    };
    document.addEventListener('click', this.onOutboundClick);
    document.addEventListener('click', this.onLedgerClick);
  }

  // hover breathes, click tosses it up and spins it like a flipped coin
  bindAvatar() {
    const btn = document.getElementById('avatar'),
          toss = document.getElementById('avatar-toss'),
          spin = document.getElementById('avatar-spin'),
          rim = document.getElementById('coin-rim');
    if (!btn || !toss || !spin) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // stacked discs between the two faces read as milled edge when the coin turns edge-on
    if (rim) {
      for (let i = -6; i <= 6; i++) {
        const d = document.createElement('span');
        const inset = Math.abs(i) > 4 ? 2 : 0;
        d.style.cssText = 'position:absolute;inset:' + inset + 'px;border-radius:50%;background:' +
          (i % 2 ? '#4A4A50' : '#3A3A42') + ';transform:translateZ(' + i + 'px)';
        rim.appendChild(d);
      }
    }

    btn.addEventListener('pointerenter', () => {
      if (btn.dataset.busy || reduce) return;
      toss.style.animation = 'avatar-bob 1.6s ease-in-out infinite';
    });
    btn.addEventListener('pointerleave', () => {
      if (!btn.dataset.busy) toss.style.animation = '';
    });

    // the card's backdrop-filter flattens the 3D context, so backface-visibility and
    // depth sorting can't be trusted — drive the turn and swap the faces by hand
    const faces = Array.from(spin.children).filter(c => c.id !== 'coin-rim');
    const front = faces[0], back = faces[1];
    const show = (deg) => {
      const facing = Math.cos(deg * Math.PI / 180);
      const edge = Math.abs(facing) < 0.06;
      front.style.opacity = (!edge && facing > 0) ? '1' : '0';
      back.style.opacity = (!edge && facing < 0) ? '1' : '0';
    };
    this.coinTurn = 0;
    show(0);

    // After dark the coin's reverse is a lit andon, and the command centre's lamp is an
    // andon too. Flip it LANTERN_FLIPS times running (each toss within LANTERN_GAP of the
    // last one landing) and the last toss is rigged to land lamp-up, the lamp flares, and
    // the door opens onto HQ. Not a lock — HQ has its own passphrase — just a back door
    // only one person needs, so it stays out of the way of everyone else.
    this.lanternRun = 0; this.lanternLanded = 0;

    btn.addEventListener('click', () => {
      if (btn.dataset.busy) return;
      btn.dataset.busy = '1';
      const now0 = performance.now();
      this.lanternRun = (this.night && now0 - this.lanternLanded < LANTERN_GAP) ? this.lanternRun + 1 : (this.night ? 1 : 0);
      const lit = this.lanternRun >= LANTERN_FLIPS;
      let half = 3 + Math.floor(Math.random() * 5);     // odd counts land on the bonsai
      if (lit && Math.round((this.coinTurn + half * 180) / 180) % 2 === 0) half++;
      const dur = reduce ? 420 : 1150;
      const from = this.coinTurn, to = from + half * 180;
      toss.style.animation = '';
      void toss.offsetWidth;                            // restart cleanly on repeat clicks
      if (!reduce) toss.style.animation = 'avatar-hop ' + dur + 'ms cubic-bezier(.32,.05,.36,1)';

      const t0 = performance.now();
      const ease = (x) => 1 - Math.pow(1 - x, 2.6);     // fast off the thumb, slows as it lands
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        const deg = from + (to - from) * ease(p);
        spin.style.transform = 'rotateY(' + deg + 'deg)';
        show(deg);
        if (p < 1) { requestAnimationFrame(tick); return; }
        this.coinTurn = to % 360;
        toss.style.animation = '';
        this.lanternLanded = performance.now();
        if (lit) {
          this.lanternRun = 0;
          back.style.transition = 'box-shadow 700ms ease-out';
          back.style.boxShadow = '0 0 0 3px #FFD892, 0 0 42px 16px rgba(255,216,146,0.8)';
          // coming Back restores this page from bfcache mid-glow, so put the lamp out then
          window.addEventListener('pageshow', () => { back.style.boxShadow = ''; delete btn.dataset.busy; }, { once: true });
          setTimeout(() => { location.href = HQ_URL; }, 900);
          return;                                       // stays busy: we're leaving
        }
        delete btn.dataset.busy;
      };
      requestAnimationFrame(tick);
    });
  }


  /* ---------- bootstrap ---------- */

  async boot() {
    this.canvas = document.getElementById('home-scene-canvas');
    this.wrap = document.getElementById('scene-wrap');
    this.statsEl = document.getElementById('scene-stats');
    this.sections = Array.from(document.querySelectorAll('[data-wp]'));
    this.main = document.getElementById('content');
    this.rail = document.getElementById('stop-rail');
    this.spacer = this.sections.find(el => el.dataset.wp === '1');
    this.cards = this.sections.filter(el => el.dataset.wp !== '1').map(el => ({ el, wp: +el.dataset.wp }));
    if (!this.canvas || !this.wrap || !this.main) return;
    if (this.statsEl) this.statsEl.style.display = this.opts.showStats ? 'block' : 'none';

    // ?stats shows the live readout, ?tier=low|medium|high pins a rung — both
    // exist so a slow machine can be diagnosed on the machine that is slow.
    const q = new URLSearchParams(location.search);
    if (q.has('stats')) {
      this.opts.showStats = true;
      // the display was already set from opts a few lines up, before we read the URL
      if (this.statsEl) this.statsEl.style.display = 'block';
    }
    this.tier = QUALITY.length - 1;
    const pin = q.get('tier');
    if (pin) {
      const i = QUALITY.findIndex(t => t.name === pin);
      if (i >= 0) { this.tier = i; this._pinned = true; }
    }
    this.quality = QUALITY[this.tier].name;

    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || !!this.opts.forceReducedMotion;
    this.night = this.resolveNight();
    this.mix = this.night ? 1 : 0;
    Object.keys(DAY_PALETTE).forEach(k => { P[k] = this.night ? NIGHT_PALETTE[k] : DAY_PALETTE[k]; });
    this.t = 0; this.tTarget = 0; this.lastRendered = -1; this.alive = true;

    if (!this.hasWebGL()) { this.bail('no webgl'); return; }
    try {
      this.T = await import('three');
    } catch (e) { this.bail('three failed to load'); return; }
    if (!this.alive) return;
    this.initRenderer();
    this.buildWorld();
    this.buildCurves();
    this.applyTier();
    if (new URLSearchParams(location.search).has('diag')) {
      setTimeout(() => this.runDiagnostic(), 600);   // let the first frames settle
    }
    this.mode = 'idle'; this.stopIdx = 0; this.nudge = 0;
    this.onResize = () => this.resize();
    window.addEventListener('resize', this.onResize);
    if (!this.reduced) { this.enableStage(); this.bindInput(); }
    if (this.opts.stagingMode) this.enableStaging();
    // backtick toggles the staging tool, in case the Tweaks entry isn't handy
    this.onStageHotkey = (e) => {
      if (e.key !== '`' && e.key !== '~') return;
      e.preventDefault();
      this.staging ? this.disableStaging() : this.enableStaging();
    };
    window.addEventListener('keydown', this.onStageHotkey);
    this.canvas.addEventListener('webglcontextlost', this.onLost = (e) => { e.preventDefault(); this.bail('context lost'); });
    this.resize();
    this.settleMode();
    window.__homeScene = this;
    this.loop = (ts) => this.frame(ts);
    this.raf = requestAnimationFrame(this.loop);
  }

  hasWebGL() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }

  bail(why) {
    console.warn('[home-scene] static fallback:', why);
    this.unbindInput();
    if (this.onStageHotkey) window.removeEventListener('keydown', this.onStageHotkey);
    if (this.staging) {
      window.removeEventListener('keydown', this.sKey, true);
      window.removeEventListener('keyup', this.sKey, true);
      window.removeEventListener('pointermove', this.sMove);
      window.removeEventListener('pointerup', this.sUp);
      this.staging = null;
    }
    this.disableStage();
    // stop the loop and hand the GPU back — a bail that keeps rendering into a
    // hidden canvas is the one thing worse than the scene we just gave up on
    this.alive = false;
    if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; }
    if (this.onResize) { window.removeEventListener('resize', this.onResize); this.onResize = null; }
    if (this.renderer) {
      try { this.renderer.dispose(); } catch (e) { /* already gone */ }
      this.renderer = null;
    }
    if (this.canvas) this.canvas.style.display = 'none';
    this.sections.forEach(s => {
      s.style.opacity = '1'; s.style.transform = 'none'; s.style.pointerEvents = 'auto';
      s.inert = false; s._off = false; s.removeAttribute('aria-hidden');
    });
  }

  teardown() {
    this.alive = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.onResize) window.removeEventListener('resize', this.onResize);
    this.unbindInput();
    if (this.onStageHotkey) window.removeEventListener('keydown', this.onStageHotkey);
    if (this.onLedgerClick) document.removeEventListener('click', this.onLedgerClick);
    if (this.onOutboundClick) document.removeEventListener('click', this.onOutboundClick);
    if (this.onPanelKey) window.removeEventListener('keydown', this.onPanelKey);
    if (this.onPanelResize) window.removeEventListener('resize', this.onPanelResize);
    if (this.onPop) window.removeEventListener('popstate', this.onPop);
    if (this.staging) {
      window.removeEventListener('keydown', this.sKey, true);
      window.removeEventListener('keyup', this.sKey, true);
      window.removeEventListener('pointermove', this.sMove);
      window.removeEventListener('pointerup', this.sUp);
      this.staging = null;
    }
    this.disableStage();
    if (this.renderer) { this.renderer.dispose(); this.renderer = null; }
    if (this.scene) { this.scene.traverse(o => { if (o.geometry) o.geometry.dispose(); }); this.scene = null; }
  }

  /* ---------- renderer ---------- */

  initRenderer() {
    const T = this.T;
    this.renderer = new T.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(this.pixelRatio());
    this.renderer.setClearColor(P.cream, 1);
    this.scene = new T.Scene();
    this.camera = new T.PerspectiveCamera(46, 1, 0.1, 400);
  }

  resize() {
    if (this._cardTops) this.measureCards();
    if (!this.renderer) return;
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setPixelRatio(this.pixelRatio());
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.portrait = (w / h) < 0.9;
    this.buildCurves();
    this.stops = null;
    this.lastProgress = -9;
  }

  // called once the world exists, so cards and rail pick up the current time of day
  settleMode() { this.applyMix(this.night ? 1 : 0); }

  /* ---------- world ---------- */

  buildWorld() {
    const T = this.T, S = this.scene;
    const lam = (c, o) => new T.MeshLambertMaterial(Object.assign({ color: c }, o || {}));
    const bas = (c, o) => new T.MeshBasicMaterial(Object.assign({ color: c }, o || {}));
    // outline = backfaced shell pushed along the normal in world units, so line
    // weight stays even on walls and on small props alike
    const ow = 0.035;
    this.ink = new T.ShaderMaterial({
      side: T.BackSide,
      uniforms: { uW: { value: ow }, uC: { value: new T.Color(P.ink) } },
      vertexShader: 'uniform float uW;\nvoid main(){ vec3 p = position + normalize(normal) * uW; gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0); }',
      fragmentShader: 'uniform vec3 uC;\nvoid main(){ gl_FragColor = vec4(uC,1.0); }'
    });

    // every mode-aware material is registered so the time-lapse can lerp its colour live
    const reg = this.reg = [];
    const R = (mat, key, prop) => { reg.push({ mat, key, prop: prop || 'color' }); return mat; };
    const L = (key, o) => R(lam(P[key], o), key);
    const B = (key, o) => R(bas(P[key], o), key);

    const M = {
      grass: L('grass'), grassDark: L('grassDark'), leaf: L('leaf'), leafDark: L('leafDark'),
      trunk: L('trunk'), stone: L('stone'), wood: L('wood'), woodDark: L('woodDark'),
      beam: L('beam'), wall: L('wall'), wallDeep: L('wallDeep'),
      // paper is translucent: DoubleSide lets it take light from either face, and the warm
      // emissive (night only) stands in for lamplight scattering through from inside
      shoji: R(L('shoji', { side: T.DoubleSide, emissive: P.shojiEmis }), 'shojiEmis', 'emissive'),
      shojiLit: R(L('shojiLit', { side: T.DoubleSide, emissive: P.shojiLitEmis }), 'shojiLitEmis', 'emissive'),
      tatami: L('tatami'),
      lampPaper: B('lampPaper'), lampGlow: B('lampGlow'), flame: B('flame'),
      clay: L('clay'), tea: B('tea'), verm: L('vermilion'), paper: L('paper'), cream: L('cream'),
      roof: L('roof'), roofRidge: L('roofRidge'),
      cushion: L('cushion'), tataki: L('tataki'), mtnNear: L('mtnNear'), mtnFar: L('mtnFar')
    };
    this.M = M;

    // The shell is pushed along the vertex normal, and a box corner has three different
    // normals at the same point — so the shell tears open there. Welding coincident
    // vertices to one averaged normal sends the corner out along its diagonal instead,
    // and the three outline faces stay joined.
    this.hullGeo = (geo) => {
      if (geo.userData.hull) return geo.userData.hull;
      const h = geo.index ? geo.toNonIndexed() : geo.clone();
      const pa = h.attributes.position, na = h.attributes.normal;
      if (!na) { geo.userData.hull = h; return h; }
      const bins = new Map();
      for (let i = 0; i < pa.count; i++) {
        const k = Math.round(pa.getX(i) * 2048) + ',' + Math.round(pa.getY(i) * 2048) + ',' + Math.round(pa.getZ(i) * 2048);
        let b = bins.get(k);
        if (!b) { b = { x: 0, y: 0, z: 0, at: [] }; bins.set(k, b); }
        b.x += na.getX(i); b.y += na.getY(i); b.z += na.getZ(i); b.at.push(i);
      }
      bins.forEach(b => {
        const len = Math.sqrt(b.x * b.x + b.y * b.y + b.z * b.z);
        if (len < 1e-4) return;                       // opposed faces cancel: leave them be
        b.at.forEach(i => na.setXYZ(i, b.x / len, b.y / len, b.z / len));
      });
      na.needsUpdate = true;
      geo.userData.hull = h;
      return h;
    };

    // part(): mesh + backfaced expanded shell = the confident outline
    const part = (geo, material, pos, rot, noOutline) => {
      const g = new T.Group();
      g.add(new T.Mesh(geo, material));
      if (noOutline !== 0) g.add(new T.Mesh(this.hullGeo(geo), this.ink));
      if (pos) g.position.set(pos[0], pos[1], pos[2]);
      if (rot) g.rotation.set(rot[0], rot[1], rot[2]);
      return g;
    };
    this.part = part;

    // hand-rolled static merge: keeps repeated props (stones, mullions) to one draw call
    this.merge = (items, material, noOutline) => {
      const m4 = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler();
      let pos = [], nor = [], total = 0;
      items.forEach(it => {
        const g = (it.geo.index ? it.geo.toNonIndexed() : it.geo.clone());
        const p = it.pos || [0, 0, 0], r = it.rot || [0, 0, 0], s = it.scale || 1;
        e.set(r[0], r[1], r[2]);
        m4.compose(new T.Vector3(p[0], p[1], p[2]), q.setFromEuler(e), new T.Vector3(s, s, s));
        g.applyMatrix4(m4);
        pos = pos.concat(Array.from(g.attributes.position.array));
        nor = nor.concat(Array.from(g.attributes.normal.array));
        total += g.attributes.position.count;
        g.dispose();
        if (!it.geo.userData.hull) it.geo.dispose();
      });
      const out = new T.BufferGeometry();
      out.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
      out.setAttribute('normal', new T.Float32BufferAttribute(nor, 3));
      const grp = new T.Group();
      grp.add(new T.Mesh(out, material));
      if (noOutline !== 0) grp.add(new T.Mesh(this.hullGeo(out), this.ink));
      return grp;
    };

    // sky dome — vertical gradient, no texture
    const skyGeo = new T.SphereGeometry(180, 20, 14);
    const col = [], pos = skyGeo.attributes.position;
    const top = new T.Color(P.skyTop), low = new T.Color(P.skyLow), c = new T.Color();
    for (let i = 0; i < pos.count; i++) {
      const y = Math.max(0, Math.min(1, (pos.getY(i) / 180) * 0.5 + 0.5));
      c.copy(low).lerp(top, Math.pow(y, 0.7));
      col.push(c.r, c.g, c.b);
    }
    skyGeo.setAttribute('color', new T.Float32BufferAttribute(col, 3));
    this.skyGeo = skyGeo;
    S.add(new T.Mesh(skyGeo, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false })));
    S.add(this.buildClouds());

    // one rig, lerped between the day and night values by applyRig(). Flat,
    // bright, illustrated: mostly ambient with a soft key so pastels stay pastel.
    this.dayLights = []; this.nightLights = []; this.lampLights = [];
    this.rig = {
      amb: new T.AmbientLight(0xFFFFFF, 1.5),
      hemi: new T.HemisphereLight(0xFFF6EA, 0xF2DFC6, 1.1),
      dir: new T.DirectionalLight(0xFFF4E4, 0.35),
    };
    this.rig.dir.position.set(6, 12, 9);
    S.add(this.rig.amb, this.rig.hemi, this.rig.dir);
    // the lamps themselves are added by buildNightLamps
    S.add(this.buildNightLamps());
    // remember where each lamp light belongs so the ladder can pull it out of
    // the graph entirely — three bakes light *counts* into every shader, so a
    // zero-intensity light still costs the same as a lit one.
    this.lampLights.forEach(l => { l.userData.home = l.parent; });
    this.applyRig(this.mix || 0);

    // ground
    S.add(part(new T.CircleGeometry(70, 40), M.grass, [0, -0.02, 4], [-Math.PI / 2, 0, 0], 0));

    S.add(this.buildGarden());
    S.add(this.buildHouse());
    S.add(this.buildInterior());
    S.add(this.buildPetals());
    this.optimizeStatics(S);
  }

  // everything in this scene is static, so collapse it to one mesh per material —
  // all the ink outline shells end up as a single draw call
  optimizeStatics(root) {
    const T = this.T, groups = new Map(), doomed = [];
    root.updateMatrixWorld(true);
    root.traverse(o => {
      if (!o.isMesh || o.isInstancedMesh) return;
      const g = o.geometry;
      if (!g || !g.attributes.position || g.attributes.color) return;   // leave the sky dome alone
      for (let a = o; a; a = a.parent) if (a.userData && a.userData.dynamic) return;   // things that still move
      const key = o.material.uuid;
      if (!groups.has(key)) groups.set(key, { material: o.material, meshes: [] });
      groups.get(key).meshes.push(o);
    });
    groups.forEach(({ material, meshes }) => {
      if (meshes.length < 2) return;
      let pos = [], nor = [];
      const nm = new T.Matrix3();
      meshes.forEach(m => {
        const src = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry;
        const p = src.attributes.position, n = src.attributes.normal;
        nm.getNormalMatrix(m.matrixWorld);
        const v = new T.Vector3();
        for (let i = 0; i < p.count; i++) {
          v.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld);
          pos.push(v.x, v.y, v.z);
          v.fromBufferAttribute(n, i).applyMatrix3(nm).normalize();
          nor.push(v.x, v.y, v.z);
        }
        if (src !== m.geometry) src.dispose();
        doomed.push(m);
      });
      const geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
      geo.setAttribute('normal', new T.Float32BufferAttribute(nor, 3));
      const merged = new T.Mesh(geo, material);
      merged.frustumCulled = false;   // one mesh spans the whole set, so culling it is all-or-nothing
      root.add(merged);
    });
    doomed.forEach(m => { if (m.parent) m.parent.remove(m); m.geometry.dispose(); });
  }

  buildGarden() {
    const T = this.T, M = this.M, g = new T.Group();

    // one bucket per material for the whole garden + court, so each becomes a single
    // merged fill + a single ink shell rather than a draw call per prop
    const stone = [], grassDark = [], trunk = [], petal = [], leaf = [],
          verm = [], cream = [], roof = [], ridge = [], beam = [];

    for (let i = 0; i < 9; i++) {
      stone.push({ geo: new T.CylinderGeometry(0.55, 0.55, 0.14, 8), pos: [Math.sin(i * 0.8) * 0.5, 0.06, 6.5 + i * 1.9], rot: [0, i * 0.4, 0] });
    }
    for (let i = 0; i < 7; i++) {
      const a = i * 1.4, r = 6 + (i % 3) * 2.2;
      let mx = Math.cos(a) * r * 1.3, mz = 8 + Math.sin(a) * r;
      if (Math.abs(mx) < 9 && mz < 8) mz = 8 + Math.abs(mz - 8);   // never inside the house
      grassDark.push({ geo: new T.SphereGeometry(1.1 + (i % 2) * 0.5, 10, 7), pos: [mx, -0.5, mz] });
    }

    // every tree in the scene: front garden sakura, one green tree, five in the court
    const sakura = [
      this.treeSpec(-5.4, 10.5, 1.0), this.treeSpec(5.8, 13.0, 1.2),
      this.treeSpec(-14.4, 6.6, 1.3), this.treeSpec(-16.8, -1.6, 1.15),
      this.treeSpec(-10.6, -9.4, 1.05), this.treeSpec(-16.0, 11.0, 1.2),
      this.treeSpec(-11.4, 12.6, 1.0)
    ];
    const green = this.treeSpec(-8.5, 17.5, 0.9);
    sakura.forEach(t => { trunk.push(...t.wood); petal.push(...t.leaves); });
    trunk.push(...green.wood);
    leaf.push(...green.leaves);

    // two stone lanterns, offsets baked in so they share the stone bucket
    const lantern = (x, z, s) => {
      stone.push({ geo: new T.CylinderGeometry(0.26 * s, 0.34 * s, 0.9 * s, 7), pos: [x, 0.45 * s, z] });
      stone.push({ geo: new T.BoxGeometry(0.7 * s, 0.5 * s, 0.7 * s), pos: [x, 1.15 * s, z] });
      stone.push({ geo: new T.ConeGeometry(0.72 * s, 0.42 * s, 4), pos: [x, 1.6 * s, z], rot: [0, Math.PI / 4, 0] });
    };
    lantern(3.2, 8.2, 1);
    lantern(-9.6, 5.4, 0.88);

    // torii at the garden mouth
    verm.push(
      { geo: new T.CylinderGeometry(0.22, 0.27, 4.6, 10), pos: [-2.4, 2.3, 22] },
      { geo: new T.CylinderGeometry(0.22, 0.27, 4.6, 10), pos: [2.4, 2.3, 22] },
      { geo: new T.BoxGeometry(6.4, 0.34, 0.5), pos: [0, 4.5, 22] },
      { geo: new T.BoxGeometry(7.2, 0.3, 0.62), pos: [0, 4.95, 22], rot: [0, 0, 0.02] }
    );

    // walled court on the west side — what you see through the ledger window
    const wallH = 2.7, wx = -20.5;
    for (let z = -20; z <= 20; z += 4) {
      cream.push({ geo: new T.BoxGeometry(0.34, wallH, 4.0), pos: [wx, wallH / 2, z] });
      roof.push({ geo: new T.BoxGeometry(0.72, 0.2, 4.06), pos: [wx, wallH + 0.1, z] });
      roof.push({ geo: new T.BoxGeometry(0.62, 0.16, 0.24), pos: [wx, wallH + 0.28, z - 1.9] });
    }
    for (let i = 0; i < 4; i++) {   // returns, so the court reads as enclosed
      [-22, 22].forEach(z => {
        cream.push({ geo: new T.BoxGeometry(4.0, wallH, 0.34), pos: [wx + 2 + i * 4, wallH / 2, z] });
        roof.push({ geo: new T.BoxGeometry(4.06, 0.2, 0.72), pos: [wx + 2 + i * 4, wallH + 0.1, z] });
      });
    }
    // the court gate stands clear of the wall face instead of intersecting it
    const gx = wx + 0.62;
    beam.push(
      { geo: new T.BoxGeometry(0.5, 3.3, 0.5), pos: [gx, 1.65, -9.6] },
      { geo: new T.BoxGeometry(0.5, 3.3, 0.5), pos: [gx, 1.65, -6.4] },
      { geo: new T.BoxGeometry(0.62, 0.3, 3.9), pos: [gx, 3.35, -8.0] }
    );

    // clipped shrubs along the court path
    [[-9.4, 9.6, 0.9], [-12.4, -5.0, 0.7], [-10.2, -1.8, 0.8], [-15.6, 6.4, 0.65], [-9.6, -6.6, 0.75], [-17.8, 1.0, 0.8]]
      .forEach(([x, z, r]) => grassDark.push({ geo: new T.SphereGeometry(r, 9, 7), pos: [x, r * 0.55, z] }));

    // neighbouring rooftops beyond the wall — mass, roof, ridge, no detail
    [[-48, -16, 8.0, 3.4, 0.5], [-56, 8, 9.5, 4.0, -0.35], [-44, 26, 7.0, 3.0, 0.2],
     [-68, -4, 11.0, 4.6, 0.15], [-62, -34, 8.5, 3.6, -0.5], [-52, 44, 8.0, 3.4, 0.4]]
      .forEach(([x, z, w, hgt, ry]) => {
        cream.push({ geo: new T.BoxGeometry(w, hgt, w * 0.7), pos: [x, hgt / 2, z], rot: [0, ry, 0] });
        // solid four-sided hip, so the roof never gaps or self-intersects at the ridge
        roof.push({ geo: new T.ConeGeometry(w * 0.86, w * 0.52, 4), pos: [x, hgt + w * 0.25, z], rot: [0, ry + Math.PI / 4, 0] });
        ridge.push({ geo: new T.BoxGeometry(w * 0.3, 0.3, 0.46), pos: [x, hgt + w * 0.5, z], rot: [0, ry, 0] });
      });

    g.add(this.merge(stone, M.stone));
    g.add(this.merge(grassDark, M.grassDark));
    g.add(this.merge(trunk, M.trunk));
    g.add(this.merge(petal, new T.MeshLambertMaterial({ color: P.petal })));
    g.add(this.merge(leaf, M.leaf));
    g.add(this.merge(verm, M.verm));
    g.add(this.merge(cream, M.cream));
    g.add(this.merge(roof, M.roof));
    g.add(this.merge(ridge, M.roofRidge));
    g.add(this.merge(beam, M.beam));

    // distant hills as painted half-discs, one merged mesh per colour
    const hills = {};
    const hill = (x, z, w, ht, key) => {
      const geo = new T.CircleGeometry(w, 14, 0, Math.PI);
      geo.scale(1, ht / w, 1);
      (hills[key] = hills[key] || []).push({ geo, pos: [x, 0, z] });
    };
    hill(-22, -48, 26, 12, 'hillBack');
    hill(-78, -30, 40, 18, 'hillBack');
    hill(-62, 4, 34, 14, 'hillNear');
    hill(18, -56, 32, 15, 'hillMid');
    hill(-4, 62, 40, 16, 'hillFar');
    Object.keys(hills).forEach(k => {
      const mat = new T.MeshBasicMaterial({ color: P[k] });
      this.reg.push({ mat, key: k, prop: 'color' });
      g.add(this.merge(hills[k], mat, 0));
    });
    return g;
  }

  treeSpec(x, z, s) {
    const T = this.T;
    const at = (p) => [x + p[0] * s, p[1] * s, z + p[2] * s];
    return {
      wood: [
        { geo: new T.CylinderGeometry(0.18, 0.42, 2.6, 7), pos: at([0, 1.3, 0]), scale: s },
        { geo: new T.CylinderGeometry(0.1, 0.16, 1.4, 6), pos: at([-0.5, 2.4, 0.1]), rot: [0, 0, 0.6], scale: s }
      ],
      leaves: [
        { geo: new T.SphereGeometry(1.5, 12, 9), pos: at([0, 3.4, 0]), scale: s },
        { geo: new T.SphereGeometry(1.0, 10, 8), pos: at([-1.4, 2.9, 0.4]), scale: s },
        { geo: new T.SphereGeometry(0.9, 10, 8), pos: at([1.3, 3.1, -0.3]), scale: s }
      ]
    };
  }

  buildHouse() {
    const T = this.T, M = this.M, part = this.part, g = new T.Group();
    const W = 6.4, D = 5.2, H = 3.1;

    // raised floor platform, notched at the front bay to leave a sunken genkan
    const PX = W + 0.6, PZ = D + 0.7;          // platform half-extents
    const GX = 2.4, GZ = 3.3;                  // genkan mouth: |x| < GX, z > GZ
    g.add(this.merge([
      { geo: new T.BoxGeometry(PX - GX, 0.5, PZ * 2), pos: [-(GX + PX) / 2, 0.05, 0] },
      { geo: new T.BoxGeometry(PX - GX, 0.5, PZ * 2), pos: [(GX + PX) / 2, 0.05, 0] },
      { geo: new T.BoxGeometry(GX * 2, 0.5, PZ + GZ), pos: [0, 0.05, (GZ - PZ) / 2] }
    ], M.wood));

    // tatami, notched to match
    const TX = W - 0.1, TZ = D - 0.1;
    g.add(this.merge([
      { geo: new T.BoxGeometry(TX - GX, 0.06, TZ * 2), pos: [-(GX + TX) / 2, 0.33, 0] },
      { geo: new T.BoxGeometry(TX - GX, 0.06, TZ * 2), pos: [(GX + TX) / 2, 0.33, 0] },
      { geo: new T.BoxGeometry(GX * 2, 0.06, TZ + GZ), pos: [0, 0.33, (GZ - TZ) / 2] }
    ], M.tatami, 0));
    const slats = [];
    for (let i = -2; i <= 2; i++) {
      const x = i * (W / 2.6), clear = Math.abs(x) > GX;
      slats.push({ geo: new T.BoxGeometry(0.05, 0.02, clear ? TZ * 2 : TZ + GZ), pos: [x, 0.37, clear ? 0 : (GZ - TZ) / 2] });
    }
    g.add(this.merge(slats, M.woodDark, 0));

    // genkan: packed-earth landing at ground level, stepped down from the room
    const tataki = M.tataki;
    g.add(part(new T.BoxGeometry(GX * 2, 0.1, PZ - GZ), tataki, [0, 0.05, (GZ + PZ) / 2], null, 0));
    // kamachi — the step edge you sit on to unlace
    g.add(this.merge([
      { geo: new T.BoxGeometry(GX * 2 + 0.3, 0.42, 0.26), pos: [0, 0.21, GZ] },
      { geo: new T.BoxGeometry(0.26, 0.42, PZ - GZ), pos: [-GX - 0.02, 0.21, (GZ + PZ) / 2] },
      { geo: new T.BoxGeometry(0.26, 0.42, PZ - GZ), pos: [GX + 0.02, 0.21, (GZ + PZ) / 2] }
    ], M.beam));

    // a pair of shoes below the step, turned to face back out at the garden
    const shoe = (x, z, ry) => {
      const s = new T.Group();
      s.add(part(new T.BoxGeometry(0.24, 0.07, 0.56), M.clay, [0, 0.135, 0], null, 0));
      s.add(part(new T.BoxGeometry(0.26, 0.14, 0.24), M.clay, [0, 0.2, -0.14]));
      s.position.set(x, 0, z); s.rotation.y = ry;
      return s;
    };
    g.add(shoe(-1.46, 4.42, 0.12));
    g.add(shoe(-1.10, 4.48, -0.08));

    // getabako — shoe cabinet against the side of the landing
    g.add(this.merge([
      { geo: new T.BoxGeometry(0.92, 0.86, 0.42), pos: [1.72, 0.53, 4.5] },
      { geo: new T.BoxGeometry(1.02, 0.08, 0.5), pos: [1.72, 1.0, 4.5] }
    ], M.wood));
    g.add(this.merge([
      { geo: new T.BoxGeometry(0.82, 0.03, 0.44), pos: [1.72, 0.72, 4.5] },
      { geo: new T.BoxGeometry(0.82, 0.03, 0.44), pos: [1.72, 0.4, 4.5] }
    ], M.woodDark, 0));
    g.add(part(new T.CylinderGeometry(0.14, 0.17, 0.2, 10), M.clay, [1.72, 1.14, 4.5]));
    g.add(part(new T.SphereGeometry(0.22, 10, 8), M.leafDark, [1.72, 1.4, 4.5]));

    // back + side walls: pink plaster, merged to one draw pair
    g.add(this.merge([
      { geo: new T.BoxGeometry(W * 2, 1.5, 0.18), pos: [0, 1.05, -D] },
      { geo: new T.BoxGeometry(D * 2, 1.5, 0.18), pos: [-W, 1.05, 0], rot: [0, Math.PI / 2, 0] },
      { geo: new T.BoxGeometry(3.55, 1.5, 0.18), pos: [W, 1.05, -3.425], rot: [0, Math.PI / 2, 0] },
      { geo: new T.BoxGeometry(3.55, 1.5, 0.18), pos: [W, 1.05, 3.425], rot: [0, Math.PI / 2, 0] }
      // nothing above the alcove opening: the otoshigake and the frieze already close it
    ], M.wall));

    // shoji as real sliding windows: each run is a track of leaves, some slid open to the garden
    const boards = [], bars = [], rails = [];
    const run = (cx, cy, cz, ry, len, ph, n, open) => {
      const s = Math.sin(ry), c = Math.cos(ry);
      const at = (lx, ly, dz) => [cx + lx * c + dz * s, cy + ly, cz - lx * s + dz * c];
      const pw = len / n;
      for (let i = 0; i < n; i++) {
        if (open.indexOf(i) >= 0) continue;
        const lx = -len / 2 + pw * (i + 0.5);
        // a leaf beside an opening has been slid into the outer track
        const dz = (open.indexOf(i + 1) >= 0 || open.indexOf(i - 1) >= 0) ? 0.075 : -0.045;
        const lw = pw + 0.12;   // leaves overlap so no daylight slips between them
        boards.push({ geo: new T.BoxGeometry(lw, ph, 0.05), pos: at(lx, 0, dz), rot: [0, ry, 0] });
        // stiles overhang the leaf edge a hair, so the wood wins the edge instead of z-fighting
        bars.push({ geo: new T.BoxGeometry(0.09, ph + 0.004, 0.11), pos: at(lx - lw / 2 + 0.039, 0, dz), rot: [0, ry, 0] });
        bars.push({ geo: new T.BoxGeometry(0.09, ph + 0.004, 0.11), pos: at(lx + lw / 2 - 0.039, 0, dz), rot: [0, ry, 0] });
        const cols = Math.max(2, Math.round(lw / 0.5)), rows = Math.max(2, Math.round(ph / 0.45));
        for (let j = 1; j < cols; j++) bars.push({ geo: new T.BoxGeometry(0.05, ph, 0.1), pos: at(lx - lw / 2 + j * (lw / cols), 0, dz), rot: [0, ry, 0] });
        for (let k = 1; k < rows; k++) bars.push({ geo: new T.BoxGeometry(lw + 0.012, 0.05, 0.1), pos: at(lx, -ph / 2 + k * (ph / rows), dz), rot: [0, ry, 0] });
      }
      rails.push({ geo: new T.BoxGeometry(len, 0.17, 0.3), pos: at(0, ph / 2 + 0.085, 0), rot: [0, ry, 0] });
      rails.push({ geo: new T.BoxGeometry(len, 0.15, 0.3), pos: at(0, -ph / 2 - 0.075, 0), rot: [0, ry, 0] });
    };
    run(0, 2.55, -D, 0, W * 2, 1.5, 6, [1, 4]);                    // back wall: two windows open
    run(-W, 2.55, 0, Math.PI / 2, D * 2, 1.5, 5, [1, 3]);          // left wall: two open
    run(W, 2.55, -3.425, Math.PI / 2, 3.4, 1.5, 2, []);            // right wall, flanking the alcove
    run(W, 2.55, 3.425, Math.PI / 2, 3.4, 1.5, 2, []);
    run(-4.4, 1.805, D, 0, 3.6, 2.94, 2, []);                      // front, either side of the open bay
    run(4.4, 1.805, D, 0, 3.6, 2.94, 2, []);
    g.add(this.merge(boards, M.shoji));
    g.add(this.merge(bars, M.woodDark, 0));
    g.add(this.merge(rails, M.beam));

    // posts + head beam
    g.add(this.merge([[-W, -D], [W, -D], [-W, D], [W, D], [-2.4, D], [2.4, D]].map(p =>
      ({ geo: new T.BoxGeometry(0.34, H + 0.5, 0.34), pos: [p[0], (H + 0.5) / 2, p[1]] })), M.beam));
    g.add(this.merge([
      { geo: new T.BoxGeometry(W * 2 + 0.9, 0.4, 0.4), pos: [0, H + 0.55, D] },
      { geo: new T.BoxGeometry(W * 2 + 0.9, 0.4, 0.4), pos: [0, H + 0.55, -D] }
    ], M.beam));

    // frieze closing the gap between the shoji band and the ceiling — no sky leaks in
    g.add(this.merge([
      { geo: new T.BoxGeometry(W * 2, 0.69, 0.22), pos: [0, 3.645, -D] },
      { geo: new T.BoxGeometry(D * 2, 0.69, 0.22), pos: [-W, 3.645, 0], rot: [0, Math.PI / 2, 0] },
      { geo: new T.BoxGeometry(D * 2, 0.69, 0.22), pos: [W, 3.645, 0], rot: [0, Math.PI / 2, 0] },
      { geo: new T.BoxGeometry(3.6, 0.69, 0.22), pos: [-4.4, 3.645, D] },
      { geo: new T.BoxGeometry(3.6, 0.69, 0.22), pos: [4.4, 3.645, D] }
    ], M.beam));

    // pale ceiling so interior views don't read as a brown lid
    g.add(part(new T.BoxGeometry(W * 2 + 1.0, 0.12, D * 2 + 1.0), M.paper, [0, 4.06, 0]));

    // one solid hipped roof, overhanging the plan on all four sides
    const rw = W * 2 + 3.2, rd = D * 2 + 3.2, rh = 3.1, ry0 = H + 0.80;
    g.add(part(this.hipRoof(rw, rd, rh), M.roof, [0, ry0, 0]));
    g.add(part(new T.BoxGeometry(rw - rd + 0.5, 0.34, 0.6), M.roofRidge, [0, ry0 + rh + 0.04, 0]));
    return g;
  }

  // proper hip: rectangular eaves, a ridge along X, four sloping faces that meet exactly
  hipRoof(w, d, h) {
    const T = this.T;
    const x = w / 2, z = d / 2, r = Math.max(0.2, x - z);
    const v = [
      [-x, 0, z], [x, 0, z], [x, 0, -z], [-x, 0, -z],   // eave corners
      [-r, h, 0], [r, h, 0]                              // ridge ends
    ];
    const tri = [
      [0, 1, 5], [0, 5, 4],   // front slope
      [2, 3, 4], [2, 4, 5],   // back slope
      [3, 0, 4],              // left hip
      [1, 2, 5],              // right hip
      [0, 3, 2], [0, 2, 1]    // soffit, so the solid is closed
    ];
    const pos = [];
    tri.forEach(t => t.forEach(i => pos.push(v[i][0], v[i][1], v[i][2])));
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    geo.computeVertexNormals();
    return geo;
  }

  // Night lighting, the way a tea house is actually lit: andon (paper floor lanterns),
  // chōchin (hanging paper lanterns) under the eaves, a shokudai candle in the tokonoma,
  // and the garden tōrō. Every fixture is a glowing paper shade plus its own point light.
  buildNightLamps() {
    const T = this.T, M = this.M, part = this.part, g = new T.Group();

    // andon: slim wood frame, paper on four sides, warm core inside
    const andon = (x, z, s, intensity) => {
      const a = new T.Group();
      const w = 0.44 * s, h = 0.78 * s;
      a.add(part(new T.BoxGeometry(w, h, w), M.lampPaper, [0, h / 2 + 0.34 * s, 0], null, 0));
      a.add(part(new T.SphereGeometry(0.1 * s, 8, 6), M.lampGlow, [0, h / 2 + 0.34 * s, 0], null, 0));
      a.add(this.merge([
        { geo: new T.BoxGeometry(w + 0.09 * s, 0.07 * s, w + 0.09 * s), pos: [0, 0.34 * s, 0] },
        { geo: new T.BoxGeometry(w + 0.11 * s, 0.08 * s, w + 0.11 * s), pos: [0, h + 0.34 * s, 0] },
        { geo: new T.BoxGeometry(w + 0.16 * s, 0.05 * s, w + 0.16 * s), pos: [0, 0.06 * s, 0] }
      ], M.woodDark));
      a.position.set(x, 0.44, z);
      a.userData.dynamic = true;        // exempt from the static collapse
      this.lampGroup = a;                // staging tool moves this whole lantern
      this.lampLight = null;
      g.add(a);
      const pl = new T.PointLight(0xFFC072, intensity * 2.4, 34 * s, 1.35);
      pl.position.set(x, 1.13 * s, z);
      pl.userData.dynamic = true;
      this.lampLight = pl;               // follows the lantern when it is dragged
      this.nightLamp(pl); g.add(pl);
    };
    andon(-5.42, 4.26, 1, 5.5);         // tucked into the corner beside the writing desk

    // soft warm bounce off the paper ceiling, so the room reads lit rather than spotlit
    const bounce = new T.PointLight(0xFFC98A, 2.6, 34, 1.4);
    bounce.position.set(-1.0, 3.3, -1.0);
    this.nightLamp(bounce); g.add(bounce);

    // chōchin: round paper lanterns strung under the front eaves
    const chochin = (x, z, s, y) => {
      const c = new T.Group();
      const body = part(new T.SphereGeometry(0.3 * s, 12, 9), M.lampPaper, [0, 0, 0], null, 0);
      body.scale.set(1, 0.82, 1);
      c.add(body);
      c.add(this.merge([
        { geo: new T.CylinderGeometry(0.13 * s, 0.13 * s, 0.05 * s, 8), pos: [0, 0.25 * s, 0] },
        { geo: new T.CylinderGeometry(0.11 * s, 0.11 * s, 0.05 * s, 8), pos: [0, -0.25 * s, 0] },
        { geo: new T.CylinderGeometry(0.012, 0.012, 1.1 * s, 4), pos: [0, 0.82 * s, 0] }
      ], M.woodDark));
      c.position.set(x, y, z);
      g.add(c);
      const pl = new T.PointLight(0xFFB765, 5.5, 34 * s, 1.35);
      pl.position.set(x, y - 0.12, z);
      this.nightLamp(pl); g.add(pl);
    };
    chochin(0, 0, 1.0, 3.25);            // centred in the room
// the pair that used to hang under the front eaves read as floating blobs from the garden

    // shokudai: a single candle on the tokonoma floor board, lighting the scroll
    const candle = new T.Group();
    candle.add(part(new T.CylinderGeometry(0.16, 0.2, 0.05, 8), M.woodDark, [0, 0.03, 0]));
    candle.add(part(new T.CylinderGeometry(0.035, 0.035, 0.34, 6), M.paper, [0, 0.22, 0], null, 0));
    candle.add(part(new T.ConeGeometry(0.05, 0.16, 6), M.flame, [0, 0.47, 0], null, 0));
    candle.position.set(6.9, 0.54, 1.15);
    g.add(candle);
    const cl = new T.PointLight(0xFFCE86, 1.8, 9, 2);
    cl.position.set(6.7, 1.15, 1.15);
    this.nightLamp(cl); g.add(cl);

    // garden tōrō: light the existing stone lanterns from inside their boxes
    [[3.2, 8.2, 1], [-9.6, 5.4, 0.88]].forEach(([x, z, s]) => {
      const y = 1.15 * s, d = 0.40 * s, w = 0.5 * s, h = 0.32 * s;
      // paper windows sit just outside the stone box's four faces, so they actually show
      const win = [
        { geo: new T.PlaneGeometry(w, h), pos: [x, y, z + d], rot: [0, 0, 0] },
        { geo: new T.PlaneGeometry(w, h), pos: [x, y, z - d], rot: [0, Math.PI, 0] },
        { geo: new T.PlaneGeometry(w, h), pos: [x + d, y, z], rot: [0, Math.PI / 2, 0] },
        { geo: new T.PlaneGeometry(w, h), pos: [x - d, y, z], rot: [0, -Math.PI / 2, 0] }
      ];
      g.add(this.merge(win, M.lampPaper, 0));
      const pl = new T.PointLight(0xFFB25C, 2.6, 11, 2);
      pl.position.set(x, y + 0.45 * s, z);
      this.nightLamp(pl); g.add(pl);
    });

    return g;
  }

  buildInterior() {
    const T = this.T, M = this.M, part = this.part, g = new T.Group();

    // low tea table with runner, kettle and cups
    const table = new T.Group();
    table.add(part(new T.BoxGeometry(2.5, 0.16, 1.7), M.wood, [0, 0.72, 0], null, 1.015));
    table.add(this.merge([[-1.05, -0.65], [1.05, -0.65], [-1.05, 0.65], [1.05, 0.65]].map(p =>
      ({ geo: new T.BoxGeometry(0.2, 0.72, 0.2), pos: [p[0], 0.36, p[1]] })), M.woodDark));
    table.add(part(new T.BoxGeometry(1.5, 0.02, 1.0), M.paper, [0.15, 0.81, 0], null, 0));
    table.add(this.merge([
      { geo: new T.SphereGeometry(0.3, 12, 9), pos: [0.3, 1.06, 0] },
      { geo: new T.TorusGeometry(0.22, 0.035, 6, 12), pos: [0.3, 1.36, 0] },
      { geo: new T.CylinderGeometry(0.03, 0.06, 0.42, 6), pos: [0.72, 1.16, 0], rot: [0, 0, -1.0] },
      { geo: new T.CylinderGeometry(0.15, 0.11, 0.16, 10), pos: [-0.62, 0.9, -0.3] },
      { geo: new T.CylinderGeometry(0.15, 0.11, 0.16, 10), pos: [-0.78, 0.9, 0.22] }
    ], M.clay));
    table.add(this.merge([
      { geo: new T.CircleGeometry(0.13, 10), pos: [-0.62, 0.985, -0.3], rot: [-Math.PI / 2, 0, 0] },
      { geo: new T.CircleGeometry(0.13, 10), pos: [-0.78, 0.985, 0.22], rot: [-Math.PI / 2, 0, 0] }
    ], M.tea, 0));
    table.position.set(-4.1, 0.36, -3.3);
    g.add(table);

    // zabuton cushions — rounded corners and a soft bevelled edge, like stuffed cotton
    const zabuton = (w, t, r) => {
      const sh = new T.Shape(), a = -w / 2, b = a + w;
      sh.moveTo(a + r, a);
      sh.lineTo(b - r, a); sh.quadraticCurveTo(b, a, b, a + r);
      sh.lineTo(b, b - r); sh.quadraticCurveTo(b, b, b - r, b);
      sh.lineTo(a + r, b); sh.quadraticCurveTo(a, b, a, b - r);
      sh.lineTo(a, a + r); sh.quadraticCurveTo(a, a, a + r, a);
      const d = t - 0.09;
      const geo = new T.ExtrudeGeometry(sh, { depth: d, bevelEnabled: true, bevelThickness: 0.045,
                                              bevelSize: 0.045, bevelOffset: 0, bevelSegments: 2, curveSegments: 5 });
      geo.translate(0, 0, -d / 2);
      return geo;
    };
    g.add(this.merge([
      { geo: zabuton(1.1, 0.22, 0.17), pos: [-4.1, 0.47, -1.7], rot: [-Math.PI / 2, 0, 0.2] },
      { geo: zabuton(1.1, 0.22, 0.17), pos: [-4.1, 0.47, -4.35], rot: [-Math.PI / 2, 0, -0.15] }
    ], M.cushion));

    // tokonoma: a recess cut into the right-hand wall, centred on it.
    // The shell is driven by head height and half-width, while everything hung or
    // stood inside keeps its own size and is simply re-placed to suit.
    const al = new T.Group();
    const aH = 3.3;                                 // centre height of the otoshigake
    const aW = 1.55;                                // half-width of the opening, along z
    const kz = aW / 1.73;                           // how far the contents move in or out
    const aTop = aH - 0.15;                         // top of the recess shell
    const aMid = (0.72 + aH - 0.17) / 2;            // centre of the opening
    const aInner = aTop - 0.42;                     // shell height, sill board up to the ceiling
    al.add(this.merge([
      { geo: new T.BoxGeometry(0.09, aInner, aW * 2 - 0.26), pos: [7.32, (0.42 + aTop) / 2, 0] },   // back of the recess
      // jambs overlap the wall in both axes so no faces sit coplanar (z-fighting)
      { geo: new T.BoxGeometry(1.2, aInner, 0.32), pos: [6.75, (0.42 + aTop) / 2, -aW] },
      { geo: new T.BoxGeometry(1.2, aInner, 0.32), pos: [6.75, (0.42 + aTop) / 2, aW] },
      { geo: new T.BoxGeometry(1.2, 0.08, aW * 2 + 0.04), pos: [6.75, aH - 0.19, 0] }               // recess ceiling
    ], M.cream));
    al.add(part(new T.BoxGeometry(1.06, 0.12, aW * 2 - 0.26), M.wood, [6.83, 0.48, 0]));            // raised floor board
    al.add(this.merge([
      // head, sill and posts share one x-depth and one z-extent so the frame mitres cleanly
      { geo: new T.BoxGeometry(0.36, 0.34, aW * 2 + 0.36), pos: [6.26, aH, 0] },                    // otoshigake
      { geo: new T.BoxGeometry(0.36, 0.34, aW * 2 + 0.36), pos: [6.26, 0.55, 0] },                  // sill
      { geo: new T.BoxGeometry(0.36, aH - 0.89, 0.36), pos: [6.26, aMid, -aW] },                    // posts
      { geo: new T.BoxGeometry(0.36, aH - 0.89, 0.36), pos: [6.26, aMid, aW] }
    ], M.beam));

    // hanging painting: mounted paper, sumi mountain, vermilion sun.
    // dy/kz re-hang it inside the new opening; the geometry itself is untouched
    const dy = aMid - 1.80;
    al.add(part(new T.BoxGeometry(0.07, 1.62, 2.0), M.woodDark, [7.24, 1.9 + dy, 0.1 * kz]));
    al.add(part(new T.BoxGeometry(0.04, 1.4, 1.78), M.paper, [7.19, 1.9 + dy, 0.1 * kz], null, 0));
    al.add(part(new T.ConeGeometry(0.58, 0.72, 4), M.mtnNear, [7.06, 1.62 + dy, 0.16 * kz], [0, Math.PI / 4, 0]));
    al.add(part(new T.ConeGeometry(0.34, 0.44, 4), M.mtnFar, [7.06, 1.48 + dy, 0.82 * kz], [0, Math.PI / 4, 0]));
    al.add(part(new T.CircleGeometry(0.2, 12), M.verm, [7.15, 2.3 + dy, -0.42 * kz], [0, -Math.PI / 2, 0]));

    // vase and single bloom on the alcove floor
    al.add(part(new T.CylinderGeometry(0.16, 0.22, 0.5, 10), M.clay, [6.85, 0.79, -1.0 * kz]));
    al.add(part(new T.CylinderGeometry(0.02, 0.02, 0.5, 5), M.leafDark, [6.85, 1.04, -1.0 * kz], null, 0));
    al.add(part(new T.SphereGeometry(0.13, 8, 6), new T.MeshLambertMaterial({ color: P.petal }), [6.85, 1.16, -1.0 * kz]));
    g.add(al);

    // writing desk: the ledger
    const desk = new T.Group();
    desk.add(part(new T.BoxGeometry(1.9, 0.14, 1.0), M.woodDark, [0, 0.5, 0], null, 1.02));
    desk.add(this.merge([-0.78, 0.78].map(x => ({ geo: new T.BoxGeometry(0.16, 0.5, 0.85), pos: [x, 0.25, 0] })), M.wood));
    desk.add(part(new T.BoxGeometry(0.72, 0.1, 0.52), M.paper, [-0.2, 0.62, 0.05], [0, 0.12, 0], 1.03));
    desk.add(part(new T.BoxGeometry(0.78, 0.06, 0.56), M.wall, [-0.2, 0.68, 0.05], [0, 0.12, 0], 1.03));
    desk.add(part(new T.CylinderGeometry(0.02, 0.025, 0.42, 6), M.trunk, [0.45, 0.62, -0.1], [0.1, 0, 1.35]));
    desk.add(part(new T.CylinderGeometry(0.13, 0.15, 0.12, 10), M.clay, [0.6, 0.62, 0.22]));
    desk.position.set(-4.14, 0.56, 2.14);
    desk.rotation.y = 1.57;
    desk.userData.dynamic = true;   // exempt from the static collapse
    this.deskGroup = desk;          // staging tool moves this whole group
    g.add(desk);

    // bonsai on a stand, right side
    const b = new T.Group();
    b.add(part(new T.BoxGeometry(0.9, 0.7, 0.9), M.wood, [0, 0.35, 0], null, 1.02));
    b.add(part(new T.CylinderGeometry(0.28, 0.34, 0.26, 10), M.cream, [0, 0.83, 0]));
    b.add(part(new T.CylinderGeometry(0.06, 0.1, 0.6, 6), M.trunk, [0, 1.2, 0], [0, 0, 0.25]));
    b.add(this.merge([
      { geo: new T.SphereGeometry(0.42, 10, 7), pos: [0.18, 1.6, 0] },
      { geo: new T.SphereGeometry(0.3, 9, 7), pos: [-0.35, 1.42, 0.1] }
    ], M.leafDark));
    b.position.set(5.3, 0.36, 4.3);
    g.add(b);
    return g;
  }

  // puffy clouds: clustered spheres, merged per cloud, unlit so they stay paper-white
  buildClouds() {
    const T = this.T, g = new T.Group();
    const body = new T.MeshBasicMaterial({ color: P.cloud });
    const shade = new T.MeshBasicMaterial({ color: P.cloudLow });
    this.reg.push({ mat: body, key: 'cloud', prop: 'color' }, { mat: shade, key: 'cloudLow', prop: 'color' });
    // ring of separated puffs, far enough back to sit in the sky rather than crowd the frame
    const specs = [
      [-70, 26, -125, 2.4], [58, 30, -140, 2.8], [-16, 48, -175, 3.0],
      [-115, 40, -95, 2.6], [110, 46, -120, 2.7], [8, 62, -200, 3.2],
      [135, 28, -55, 2.2], [-145, 42, 40, 2.5], [40, 32, 130, 2.3],
      [-60, 46, 150, 2.6], [155, 34, 95, 2.2],
      // low bank due west, sitting in the strip of sky the ledger window frames
      [-104, 13, -14, 2.1], [-118, 15, 26, 2.4], [-92, 11, 44, 1.9],
      [-132, 17, -46, 2.5], [-88, 12, -52, 2.0], [-124, 12, 62, 2.2]
    ];
    const tops = [], unders = [];
    specs.forEach(([x, y, z, s], n) => {
      const puffs = [[0, 0, 0, 1], [1.5, -0.25, 0.2, 0.78], [-1.55, -0.3, -0.15, 0.72],
                     [0.7, 0.55, -0.3, 0.66], [-0.75, 0.4, 0.3, 0.6], [2.6, -0.5, 0, 0.5], [-2.7, -0.45, 0.1, 0.46]];
      puffs.forEach(([px, py, pz, ps], i) => {
        const r = ps * s * 3.2;
        const pos = [x + px * s * 3.1, y + py * s * 2.4 + Math.sin(n) * 1.2, z + pz * s * 3.1];
        tops.push({ geo: new T.SphereGeometry(r, 9, 7), pos });
        if (i < 3) unders.push({ geo: new T.SphereGeometry(r * 0.82, 8, 6), pos: [pos[0], pos[1] - r * 0.5, pos[2]] });
      });
    });
    g.add(this.merge(unders, shade, 0));
    g.add(this.merge(tops, body, 0));
    return g;
  }

  buildPetals() {
    const T = this.T;
    const small = window.innerWidth < 640;
    this.petalMax = small ? 70 : 240;
    this.petalCount = this.petalMax;
    const geo = new T.CircleGeometry(0.05, 5);
    const petalMat = new T.MeshBasicMaterial({ color: P.petal, side: T.DoubleSide });
    this.reg.push({ mat: petalMat, key: 'petal', prop: 'color' });
    const mesh = new T.InstancedMesh(geo, petalMat, Math.max(1, this.petalMax));
    mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
    mesh.frustumCulled = false;
    this.petalSeeds = [];
    for (let i = 0; i < this.petalCount; i++) {
      // keep petals outdoors — they fall past the open bay, not through the ceiling
      let px = -15 + Math.random() * 30, pz = -6 + Math.random() * 32;
      if (Math.abs(px) < 7.5 && pz < 6) pz = 6.5 + Math.random() * 18;
      this.petalSeeds.push({
        x: px, z: pz,
        y: Math.random() * 11, fall: 0.22 + Math.random() * 0.3,
        sway: 0.4 + Math.random() * 1.1, phase: Math.random() * 6.28, spin: 0.4 + Math.random() * 1.2
      });
    }
    this.petalDummy = new T.Object3D();
    this.petalMesh = mesh;
    if (this.petalCount === 0) mesh.visible = false;
    return mesh;
  }

  /* ---------- camera path ---------- */

  buildCurves() {
    const T = this.T;
    if (!T) return;
    const key = (w) => (this.portrait && w.portrait) ? w.portrait : w;
    const v = (a) => new T.Vector3(a[0], a[1], a[2]);
    this.posCurve = new T.CatmullRomCurve3(WAYPOINTS.map(w => v(key(w).pos)), false, 'catmullrom', 0.4);
    this.tgtCurve = new T.CatmullRomCurve3(WAYPOINTS.map(w => v(key(w).target)), false, 'catmullrom', 0.4);
    this.fovs = WAYPOINTS.map(w => key(w).fov);
    this._p = new T.Vector3(); this._q = new T.Vector3();
  }

  /* ---------- staged navigation: no scrollbar, one gesture per stop ---------- */

  enableStage() {
    const html = document.documentElement, body = document.body;
    this._restore = { h: html.style.overflow, b: body.style.overflow, m: this.main.getAttribute('style') };
    window.scrollTo(0, 0);
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    this.main.style.cssText = 'position:fixed;inset:0;margin:0;z-index:1;display:block';
    this.cards.forEach(c => {
      // remember the document-flow styling; disableStage() has to put it back or
      // the flat fallback stacks every section on top of the first one
      if (c.el._stage0 === undefined) c.el._stage0 = c.el.getAttribute('style');
      c.el.style.position = 'absolute';
      c.el.style.inset = '0';
      c.el.style.minHeight = '0';
    });
    if (this.spacer) this.spacer.style.display = 'none';
    if (this.rail) this.rail.style.display = 'flex';
    this.stopIdx = 0;
    this.cards.forEach((c, i) => this.cardState(c.el, i === 0 ? 1 : 0, 0, 0));
    this.syncRail();
  }

  disableStage() {
    if (!this._restore) return;
    document.documentElement.style.overflow = this._restore.h;
    document.body.style.overflow = this._restore.b;
    if (this._restore.m) this.main.setAttribute('style', this._restore.m);
    this.cards.forEach(c => {
      if (c.el._stage0 === undefined) return;
      if (c.el._stage0 === null) c.el.removeAttribute('style');
      else c.el.setAttribute('style', c.el._stage0);
      c.el._stage0 = undefined;
      c.el._o = c.el._s = undefined;     // cardState's cache is now stale
    });
    if (this.spacer) this.spacer.style.display = '';
    if (this.rail) this.rail.style.display = 'none';
    this._restore = null;
  }

  syncRail() {
    if (!this.rail) return;
    Array.from(this.rail.children).forEach((b, i) => {
      b.style.background = i === this.stopIdx ? (this.railDot || '#3A3A42') : 'transparent';
      b.setAttribute('aria-current', i === this.stopIdx ? 'true' : 'false');
    });
  }

  bindInput() {
    const gate = (dir) => {
      const now = performance.now();
      const streaming = now - (this.lastInputAt || 0) < 170;
      this.lastInputAt = now;
      if (this.mode === 'exit') return;
      if (this.mode === 'auto' || (this.locked && streaming)) { this.bump(dir); return; }
      this.locked = false;
      this.step(dir);
    };
    this.onWheel = (e) => {
      e.preventDefault();
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      if (Math.abs(dy) < 2) return;
      gate(dy > 0 ? 1 : -1);
    };
    this.onKey = (e) => {
      const k = e.key;
      if (k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !e.shiftKey)) { e.preventDefault(); gate(1); }
      else if (k === 'ArrowUp' || k === 'PageUp' || (k === ' ' && e.shiftKey)) { e.preventDefault(); gate(-1); }
      else if (k === 'Home') { e.preventDefault(); this.goTo(0); }
      else if (k === 'End') { e.preventDefault(); this.goTo(this.cards.length - 1); }
    };
    this.onTouchStart = (e) => { this.touchY = e.touches[0].clientY; this.touchAt = performance.now(); };
    this.onTouchMove = (e) => { e.preventDefault(); };
    this.onTouchEnd = (e) => {
      if (this.touchY == null) return;
      const dy = this.touchY - (e.changedTouches[0] ? e.changedTouches[0].clientY : this.touchY);
      this.touchY = null;
      if (Math.abs(dy) > 34) gate(dy > 0 ? 1 : -1);
    };
    window.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('keydown', this.onKey);
    window.addEventListener('touchstart', this.onTouchStart, { passive: true });
    window.addEventListener('touchmove', this.onTouchMove, { passive: false });
    window.addEventListener('touchend', this.onTouchEnd);
    if (this.rail) {
      this.onRail = (e) => {
        const b = e.target.closest('[data-goto]');
        if (b) this.goTo(+b.dataset.goto);
      };
      this.rail.addEventListener('click', this.onRail);
    }
  }

  unbindInput() {
    if (!this.onWheel) return;
    window.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('keydown', this.onKey);
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);
    if (this.rail && this.onRail) this.rail.removeEventListener('click', this.onRail);
    this.onWheel = null;                    // cleared so bindInput() can re-arm on return
  }

  step(dir) {
    const to = this.stopIdx + dir;
    if (to >= this.cards.length) { this.startExit(); return; }   // scroll past the last card: leave
    if (to < 0) { this.bump(dir); return; }
    this.locked = true;
    this.goTo(to);
  }

  goTo(to) {
    if (this.mode === 'auto' || to === this.stopIdx || !this.cards[to]) return;
    const from = this.stopIdx;
    const dWp = Math.abs(this.cards[to].wp - this.cards[from].wp);
    this.auto = { from, to, t0: performance.now(), dur: 620 + 280 * dWp };
    this.mode = 'auto';
    this.stopIdx = to;
    this.syncRail();
  }

  // leaving for somewhere else: fly out through the torii, then hand over to the link
  flyToLink(url, newTab) {
    this.linkOut = { url, newTab };
    if (this.panelOpen) {
      this.closePanel();
      clearTimeout(this._flyT);
      this._flyT = setTimeout(() => this.startExit('link'), 560);
      return;
    }
    this.startExit('link');
  }

  // white is at full when the link opens; a new tab leaves the scene where it stood
  completeLink() {
    const out = this.linkOut;
    this.linkOut = null;
    this.mode = 'idle';
    this.exit = null;
    if (!out) { this.finishExit(); return; }
    if (!out.newTab) {
      if (this.flash) { this.flash.style.transition = 'none'; this.flash.style.opacity = '1'; }
      location.href = out.url;
      return;
    }
    window.open(out.url, '_blank', 'noopener,noreferrer');
    this.nudge = 0;
    this.locked = false;
    this.lastProgress = -9;
    this.t = this.tTarget = this.cardT ? this.cardT(this.stopIdx) : this.t;
    this.cards.forEach((c, i) => this.cardState(c.el, i === this.stopIdx ? 1 : 0, 0, 0));
    this.syncRail();
    setTimeout(() => {
      if (!this.flash) return;
      this.flash.style.transition = 'opacity 900ms ease';
      this.flash.style.opacity = '0';
    }, 120);
  }

  // past the last card the camera leaves through the torii and the page starts over
  startExit(dest) {
    if (this.mode === 'exit' || this.mode === 'landed') return;
    this.mode = 'exit';
    this.exitDest = dest || 'restart';
    this.locked = true;
    // leave from wherever the camera actually is, so a click mid-scene doesn't cut
    const pos = this.camera.position, tgt = this._q;
    this.exit = {
      t0: performance.now(), dur: this.exitDest === 'link' ? 1500 : this.exitDest === 'ledger' ? 1700 : 2100,
      from: [pos.x, pos.y, pos.z], target: [tgt.x, tgt.y, tgt.z], fov: this.camera.fov,
      to: [0, 2.6, 62]                      // always turn to face the torii on the way out
    };
    this.flash = this.flash || document.getElementById('scene-flash');
    if (this.flash) { this.flash.style.transition = 'none'; this.flash.style.opacity = '0'; }
    if (!this.raf) { this.lastTs = 0; this.raf = requestAnimationFrame(this.loop); }
    // safety: never strand the user mid-flight if the render loop stalls
    clearTimeout(this.exitGuard);
    this.exitGuard = setTimeout(() => {
      if (this.mode === 'exit') { this.endExit(); }
    }, this.exit.dur + 500);
  }

  exitStep(ts) {
    const e = this.exit;
    const p = Math.min(1, (ts - e.t0) / e.dur);
    const acc = p * p;                      // holds, then gathers speed through the gate
    const lerp = (a, b) => a + (b - a) * acc;

    this.camera.position.set(lerp(e.from[0], 0), lerp(e.from[1], 2.9), lerp(e.from[2], 40));
    this._q.set(lerp(e.target[0], e.to[0]), lerp(e.target[1], e.to[1]), lerp(e.target[2], e.to[2]));
    this.camera.lookAt(this._q);
    this.camera.fov = e.fov + acc * 14;
    this.camera.updateProjectionMatrix();

    const fade = Math.max(0, 1 - p / 0.22);
    this.cards.forEach((c, i) => this.cardState(c.el, i === this.stopIdx ? fade : 0, 0, 0));
    if (this.flash) this.flash.style.opacity = Math.max(0, Math.min(1, (p - 0.62) / 0.34)).toFixed(3);

    if (!document.hidden) {
      if (!this.reduced && this.petalCount > 0) this.updatePetals(ts / 1000);
      this.renderer.render(this.scene, this.camera);
    }
    if (p >= 1) { this.endExit(); }
  }

  endExit() {
    if (this.exitDest === 'link') { this.completeLink(); return; }
    this.exitDest === 'ledger' ? this.landLedger() : this.finishExit();
  }

  landLedger() { this.finishExit(); }      // the pages no longer take over the screen

  finishExit() {
    this.mode = 'idle';
    this.exit = null;
    this.nudge = 0;
    this.locked = false;
    this.stopIdx = 0;
    this.lastProgress = -9;
    this.cards.forEach((c, i) => this.cardState(c.el, i === 0 ? 1 : 0, 0, 0));
    this.syncRail();
    // let the reset frame render underneath before the white lifts
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!this.flash) return;
      this.flash.style.transition = 'opacity 900ms ease';
      this.flash.style.opacity = '0';
    }));
  }

  // refused input still answers: a short elastic shove in the direction you pushed
  bump(dir) { this.nudge = Math.max(-1, Math.min(1, (this.nudge || 0) + dir * 0.5)); }

  // overshoot-and-settle: the view springs past its mark, then eases back
  static bounce(x) { const c1 = 1.15, c3 = c1 + 1, u = x - 1; return 1 + c3 * u * u * u + c1 * u * u; }

  cardState(el, opacity, shift, squash) {
    const o = Math.max(0, Math.min(1, opacity)).toFixed(3);
    if (el._o !== o || el._s !== shift) {
      el._o = o; el._s = shift;
      el.style.opacity = o;
      el.style.transform = 'translate3d(0,' + shift.toFixed(1) + 'px,0) scale(' + (1 - (squash || 0)).toFixed(4) + ')';
      el.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
      // an unseen card must also leave the tab order — there is no scrolling to it
      const off = opacity <= 0.5;
      if (el._off !== off) {
        el._off = off;
        el.inert = off;
        if (off) el.setAttribute('aria-hidden', 'true');
        else el.removeAttribute('aria-hidden');
      }
    }
  }

  /* ---------- TEMPORARY staging tool: fly the camera, place the floor lamp ---------- */

  enableStaging() {
    const T = this.T;
    this.staging = { focus: 'cam', keys: {}, fov: this.camera.fov, yaw: 0, pitch: 0 };
    this.panel = document.getElementById('staging-panel');
    this.readout = document.getElementById('staging-readout');
    if (this.panel) this.panel.style.display = 'block';
    this.canvas.style.pointerEvents = 'auto';
    this.canvas.style.cursor = 'grab';

    // start from the current waypoint so you are always adjusting, never starting blind
    const wp = WAYPOINTS[this.cards[this.stopIdx].wp];
    this.camera.position.set(wp.pos[0], wp.pos[1], wp.pos[2]);
    this.camera.lookAt(new T.Vector3(wp.target[0], wp.target[1], wp.target[2]));
    this.camera.rotation.order = 'YXZ';
    this.staging.yaw = this.camera.rotation.y;
    this.staging.pitch = this.camera.rotation.x;
    this.staging.fov = wp.fov;

    this.sKey = (e) => {
      if (e.key === '1') this.setStagingFocus('cam');
      else if (e.key === '2') this.setStagingFocus('lamp');
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      this.staging.keys[k] = e.type === 'keydown';
      if (['w','a','s','d','q','e','[',']','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(k) >= 0) e.preventDefault();
    };
    window.addEventListener('keydown', this.sKey, true);
    window.addEventListener('keyup', this.sKey, true);

    this.sDown = (e) => { this.drag = { x: e.clientX, y: e.clientY }; this.canvas.style.cursor = 'grabbing'; };
    this.sMove = (e) => {
      if (!this.drag) return;
      const dx = e.clientX - this.drag.x, dy = e.clientY - this.drag.y;
      this.drag = { x: e.clientX, y: e.clientY };
      if (this.staging.focus === 'cam') {
        this.staging.yaw -= dx * 0.004;
        this.staging.pitch = Math.max(-1.4, Math.min(1.4, this.staging.pitch - dy * 0.004));
      } else if (this.lampGroup) {
        this.lampGroup.rotation.y -= dx * 0.006;
      }
    };
    this.sUp = () => { this.drag = null; this.canvas.style.cursor = 'grab'; };
    this.canvas.addEventListener('pointerdown', this.sDown);
    window.addEventListener('pointermove', this.sMove);
    window.addEventListener('pointerup', this.sUp);

    if (this.panel) {
      this.sClick = (e) => {
        const b = e.target.closest('[data-stage]');
        if (b) this.setStagingFocus(b.dataset.stage);
        if (e.target.id === 'staging-copy') {
          const txt = this.stagingValues();
          if (navigator.clipboard) navigator.clipboard.writeText(txt);
          e.target.textContent = 'Copied — paste it to me';
          setTimeout(() => { e.target.textContent = 'Copy values'; }, 1600);
        }
      };
      this.panel.addEventListener('click', this.sClick);
    }
  }

  disableStaging() {
    if (!this.staging) return;
    window.removeEventListener('keydown', this.sKey, true);
    window.removeEventListener('keyup', this.sKey, true);
    window.removeEventListener('pointermove', this.sMove);
    window.removeEventListener('pointerup', this.sUp);
    if (this.panel) { this.panel.style.display = 'none'; if (this.sClick) this.panel.removeEventListener('click', this.sClick); }
    this.canvas.style.pointerEvents = 'none';
    this.staging = null;
    this.lastProgress = -9;
  }

  setStagingFocus(f) {
    this.staging.focus = f;
    const tag = document.getElementById('staging-target');
    if (tag) tag.textContent = f === 'cam' ? 'CAMERA' : 'LAMP';
  }

  stagingValues() {
    const T = this.T, n = (v) => (Math.round(v * 100) / 100).toFixed(2);
    const dir = new T.Vector3();
    this.camera.getWorldDirection(dir);
    const t = this.camera.position.clone().add(dir.multiplyScalar(2.5));
    const d = this.lampGroup;
    return 'camera pos [' + n(this.camera.position.x) + ', ' + n(this.camera.position.y) + ', ' + n(this.camera.position.z) + ']' +
      '\ncamera target [' + n(t.x) + ', ' + n(t.y) + ', ' + n(t.z) + ']' +
      '\nfov ' + Math.round(this.camera.fov) +
      (d ? '\nlamp andon(' + n(d.position.x) + ', ' + n(d.position.z) + ')  y ' + n(d.position.y) +
           '\nlamp rotY ' + n(d.rotation.y) : '');
  }

  stagingStep(dt) {
    const T = this.T, s = this.staging, k = s.keys;
    const fast = k['Shift'] ? 4 : 1;
    const sp = 2.4 * dt * fast, rot = 1.1 * dt * fast;
    const f = (a) => k[a] ? 1 : 0;
    const mx = f('d') - f('a'), mz = f('w') - f('s'), my = f('e') - f('q');

    if (s.focus === 'cam') {
      s.yaw += (f('ArrowLeft') - f('ArrowRight')) * rot;
      s.pitch = Math.max(-1.4, Math.min(1.4, s.pitch + (f('ArrowUp') - f('ArrowDown')) * rot));
      s.fov = Math.max(20, Math.min(90, s.fov + (f(']') - f('[')) * 24 * dt));
      const sin = Math.sin(s.yaw), cos = Math.cos(s.yaw);
      this.camera.position.x += (-sin * mz + cos * mx) * sp;
      this.camera.position.z += (-cos * mz - sin * mx) * sp;
      this.camera.position.y += my * sp;
    } else if (this.lampGroup) {
      const d = this.lampGroup;
      d.position.x += mx * sp;
      d.position.z += -mz * sp;
      d.position.y += my * sp;
      d.rotation.y += (f('ArrowLeft') - f('ArrowRight')) * rot;
      if (this.lampLight) {
        this.lampLight.position.set(d.position.x, d.position.y + 0.69, d.position.z);
      }
    }

    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.set(s.pitch, s.yaw, 0);
    this.camera.fov = s.fov;
    this.camera.updateProjectionMatrix();
    if (this.readout && performance.now() - (this._roAt || 0) > 120) {
      this._roAt = performance.now();
      this.readout.textContent = this.stagingValues();
    }
  }

  frame(ts) {
    if (!this.alive || !this.renderer) return;
    if (this.mode === 'landed') { this.raf = null; return; }
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, (ts - (this.lastTs || ts)) / 1000);
    this.lastTs = ts;

    if (this.staging) {
      this.stagingStep(dt);
      if (!document.hidden) {
        if (this.petalCount > 0) this.updatePetals(ts / 1000);
        this.renderer.render(this.scene, this.camera);
      }
      return;
    }

    if (this.mode === 'exit') { this.exitStep(ts); return; }

    const last = WAYPOINTS.length - 1;
    let progress;

    if (this.reduced) {
      // static composed frame per section; the page scrolls normally
      if (!this._cardTops) this.measureCards();
      const y = window.scrollY;
      let best = 0, dist = Infinity;
      for (let i = 0; i < this._cardTops.length; i++) {
        const d = Math.abs(y - this._cardTops[i]);
        if (d < dist) { dist = d; best = i; }
      }
      this.stopIdx = best;
      progress = this.cards[best].wp;
      // cardState short-circuits when nothing changed, so this is free once settled
      this.cards.forEach(c => this.cardState(c.el, 1, 0, 0));
    } else if (this.mode === 'auto') {
      const a = this.auto;
      const p = Math.max(0, Math.min(1, (ts - a.t0) / a.dur));
      const e = HomeScene.bounce(p);
      const wpFrom = this.cards[a.from].wp, wpTo = this.cards[a.to].wp;
      progress = wpFrom + (wpTo - wpFrom) * e;
      const dir = a.to > a.from ? 1 : -1;
      const f = Math.max(0, Math.min(1, (p - 0.12) / 0.62));
      const g = f * f * (3 - 2 * f);
      this.cardState(this.cards[a.from].el, 1 - g, -dir * g * 64, g * 0.05);
      this.cardState(this.cards[a.to].el, g, dir * (1 - g) * 64, (1 - g) * 0.05);
      if (p >= 1) { this.mode = 'idle'; this.auto = null; }
    } else {
      const n = this.nudge || 0;
      progress = this.cards[this.stopIdx].wp + n * 0.06;
      this.cards.forEach((c, i) => i === this.stopIdx
        ? this.cardState(c.el, 1 - Math.abs(n) * 0.12, -n * 12, Math.abs(n) * 0.012)
        : this.cardState(c.el, 0, 0, 0));
      if (n) {
        this.nudge = Math.abs(n) < 0.004 ? 0 : n * Math.pow(0.86, dt * 60);
      }
    }

    if (document.hidden) return;

    const moved = Math.abs(progress - (this.lastProgress ?? -9)) > 0.0002;
    const petalsLive = !this.reduced && this.petalCount > 0;
    if (!moved && !petalsLive) return;
    this.lastProgress = progress;
    this.t = progress / last;

    const u = Math.max(0, Math.min(1, progress / last));
    this.posCurve.getPoint(u, this._p);
    this.tgtCurve.getPoint(u, this._q);
    this.camera.position.copy(this._p);
    this.camera.lookAt(this._q);
    const i0 = Math.max(0, Math.min(last, Math.floor(progress))), i1 = Math.min(last, i0 + 1);
    this.camera.fov = this.fovs[i0] + (this.fovs[i1] - this.fovs[i0]) * (progress - i0);
    this.camera.updateProjectionMatrix();

    if (petalsLive) this.updatePetals(ts / 1000);
    this.renderer.render(this.scene, this.camera);
    this.sampleQuality(ts);
    if (this.opts.showStats) this.writeStats({ i: Math.max(0, Math.min(last, Math.round(progress))) });
  }

  updatePetals(time) {
    const d = this.petalDummy, mesh = this.petalMesh;
    for (let i = 0; i < this.petalCount; i++) {
      const s = this.petalSeeds[i];
      const y = 11 - ((s.y + time * s.fall * 2.2) % 11);
      d.position.set(s.x + Math.sin(time * 0.6 + s.phase) * s.sway, y, s.z + Math.cos(time * 0.4 + s.phase) * s.sway * 0.6);
      d.rotation.set(time * s.spin, time * s.spin * 0.7 + s.phase, s.phase);
      d.updateMatrix();
      mesh.setMatrixAt(i, d.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  writeStats(m) {
    const info = this.renderer.info.render;
    const now = performance.now();
    this._ft = this._ft ? this._ft * 0.9 + (now - (this._last || now)) * 0.1 : 16;
    this._last = now;
    if (now - (this._statAt || 0) < 400) return;
    this._statAt = now;
    this.statsEl.textContent =
      'waypoint  ' + WAYPOINTS[m.i].name +
      '\nt         ' + this.t.toFixed(3) +
      '\ndraw      ' + info.calls +
      '\ntris      ' + (info.triangles / 1000).toFixed(1) + 'k' +
      '\nrAF gap   ' + this._ft.toFixed(1) + ' ms' +
      '\npetals    ' + this.petalCount +
      '\ndpr       ' + this.renderer.getPixelRatio() +
      '\ntier      ' + this.quality + (this._pinned ? ' (pinned)' : '');
  }

}
