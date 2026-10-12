/* The Hidden Curriculum — map.js
   The course map every lesson returns to: six districts, each answering one question, walked from the
   Start (00) to the Finish (21), with the Lanterns (AI) strung over all of them. The Lanterns are NOT a
   district (COURSE.md): lessons about AI live in the district they belong to.
   It is the "shelf in your head" — every lesson shows where its idea is stored.
   Mirrors curriculum.md's `# District` headings (the site draws the course page from those). */
(function () {
  'use strict';
  const K = window.K, C = K.C;

  // module numbers run in map order (2026-10-01 restructure): each district is one contiguous run
  const MODULES = {
    '00': 'Orientation', '01': 'Your computer', '02': 'The command line', '03': 'Dev environments',
    '04': 'Languages', '05': 'Packages', '06': 'Data', '07': 'Concurrency', '08': 'Git & GitHub',
    '09': 'Networking', '10': 'APIs, webhooks & MCP', '11': 'Websites', '12': 'Cloudflare',
    '13': 'Containers & cloud', '14': 'Identity & keys', '15': 'Secrets & security', '16': 'Running without you',
    '17': 'Applications', '18': 'Other platforms', '19': 'Payments & users', '20': 'Licenses', '21': 'Capstone',
  };

  // type sizes on the 1920 canvas (COURSE.md: 26 px for labels, 30+ for reading, 20 px only for eyebrows).
  // The Lanterns' label row is 26/30 (raised from 20/24 on 2026-10-01: reviewers found it too small at 1080p).
  const TYPE = { name: 38, q: 26, num: 22, mod: 26, aiEyebrow: 26, aiQ: 30, aiNum: 22, aiMod: 24, endLabel: 26 };
  // a district card's vertical rhythm, px below its top edge: the name's and the question's baselines,
  // the first module row's baseline, and the row pitch. A pinned row's wash spans baseline -28..+10
  // (38 px), so the 40 px pitch leaves a hairline between two pinned neighbours (01 and 02).
  const ROW = { name: 70, q: 108, first: 150, pitch: 40 };

  // world coordinates on the 1920x1080 stage; row A runs left→right, row B right→left (a U-shaped path).
  // Everything sits inside the course safe area (y 130–930): the web captions overlay the band below
  // y 930, so the bottom row ends at y 920 and the lantern string still clears the badge (y < 110).
  // Heights fit the fullest card of each row (The Code: 4 modules; The Network: 5) with ~20 px under
  // its last pinned row.
  const TOP = { y: 258, h: 300 }, BOT = { y: 584, h: 336 };
  const DISTRICTS = [
    { id: 'machine', name: 'The Machine', q: "what's on your computer", x: 250, ...TOP, w: 470, mods: ['01', '02', '03'] },
    { id: 'code', name: 'The Code', q: 'what programs are made of', x: 745, ...TOP, w: 430, mods: ['04', '05', '06', '07'] },
    { id: 'history', name: 'The History', q: 'how work is saved & shared', x: 1200, ...TOP, w: 470, mods: ['08'] },
    { id: 'network', name: 'The Network', q: 'how computers talk', x: 1200, ...BOT, w: 470, mods: ['09', '10', '11', '12', '13'] },
    { id: 'trust', name: 'Trust', q: 'who may do what', x: 745, ...BOT, w: 430, mods: ['14', '15', '16'] },
    { id: 'shipping', name: 'Shipping', q: 'getting it to people', x: 250, ...BOT, w: 470, mods: ['17', '18', '19', '20'] },
  ];
  // the Lanterns are AI: one lantern over each district, on a string across the top. No modules of their own.
  const LANTERNS = { id: 'ai', name: 'The Lanterns', q: 'lights every district', mods: [], y: 164, n: 6 };
  const lanternAt = (i) => { const x = 330 + i * 252; return { x, y: LANTERNS.y - 24 + Math.pow((x - 960) / 710, 2) * -22 + 22 }; };
  // the start and the finish sit on the garden path, level with the middle of their row of cards
  const GATE = { id: 'gate', mod: '00', x: 135, y: TOP.y + TOP.h / 2, label: 'Start' };     // y 408
  const END = { id: 'end', mod: '21', x: 135, y: BOT.y + BOT.h / 2, label: 'Finish' };     // y 752

  const byId = Object.fromEntries(DISTRICTS.map((d) => [d.id, d]));
  const districtOf = (mod) => (DISTRICTS.find((d) => d.mods.includes(mod)) || (LANTERNS.mods.includes(mod) ? LANTERNS : mod === GATE.mod ? GATE : mod === END.mod ? END : null));

  function chipPos(mod) {
    const d = DISTRICTS.find((dd) => dd.mods.includes(mod));
    // y is the vertical middle of the chip's text row
    if (d) { const i = d.mods.indexOf(mod); return { x: d.x + 40, y: d.y + ROW.first + i * ROW.pitch - 9, w: d.w - 80, d }; }
    if (LANTERNS.mods.includes(mod)) { const i = LANTERNS.mods.indexOf(mod); return { x: lanternChipX(i), y: LANTERNS.y + 55, w: lanternChipW(i) - 36, d: LANTERNS }; }
    if (mod === GATE.mod) return { x: GATE.x, y: GATE.y, w: 0, d: GATE };
    if (mod === END.mod) return { x: END.x, y: END.y, w: 0, d: END };
    return { x: K.W / 2, y: K.H / 2, w: 0 };
  }

  // right-aligned run of the AI module chips on the lantern line (number, name, 36 px between chips)
  const AI_NAME_X = 38;
  const lanternChipW = (i) => AI_NAME_X + K.measure(MODULES[LANTERNS.mods[i]], { size: TYPE.aiMod }) + 36;
  function lanternChipX(i) {
    const ws = LANTERNS.mods.map((m, k) => lanternChipW(k));
    let x = 1670 - ws.reduce((a, b) => a + b, 0) + 36;
    for (let k = 0; k < i; k++) x += ws[k];
    return x;
  }

  const PATH = [[GATE.x, GATE.y], [485, GATE.y], [960, GATE.y], [1435, GATE.y], [1720, GATE.y], [1720, END.y], [1435, END.y], [960, END.y], [485, END.y], [END.x, END.y]];

  /**
   * one lantern exactly as the map draws it (glow + swaying icon), so a scene can lift lantern i out of the map
   * (o.lanternHide) and carry it elsewhere with nothing jumping. o: x, y (default lanternAt(i)); lit 0..1 (as
   * o.lanterns, default 1); sway (multiplier, default 1); alpha 0..1 (default 1); glowK (glow multiplier, default 1;
   * the map uses 1.8 when focus is 'ai'); s (scale, default 1). The sway phase is per-index, so pass the same i.
   */
  function lantern(t, i, o = {}) {
    const p = lanternAt(i), x = o.x ?? p.x, y = o.y ?? p.y, s = o.s ?? 1;
    const lk = K.clamp(o.lit ?? 1), a = K.clamp(o.alpha ?? 1);
    if (a <= 0) return;
    const sway = K.wave(t, 1.1, 0.06 * (o.sway ?? 1), i * 1.7);
    if (lk > 0) K.glow(x, y + 16 * s, 60 * s, C.head, lk * a * 0.22 * (o.glowK ?? 1));
    K.layer((0.2 + 0.8 * lk) * a, () => K.at(x, y, s, sway, () => K.icon('lantern', 0, 16, 46, { color: C.head, w: 2.4 })));
  }

  /**
   * draw the map. o:
   *  t0      — when the staggered reveal starts (omit: fully visible)
   *  focus   — district id or module id to light up; others dim
   *  dim     — how far unfocused districts fade (0..1, default 0.7)
   *  pin     — module id to mark "you are here"
   *  pinSize — the pin icon's size (default 44; the tip stays on the same spot at any size)
   *  pinColor — the pin's colour (default C.accent)
   *  highlight — district id or module id, or an array of them: also lit (undimmed, gold outline) alongside focus (no glow).
   *              Or a map { id: 0..1 } / a function (districtId) => 0..1 to ease each district's outline and un-dimming in
   *  path    — 0..1 progress of the dashed garden path (default 1)
   *  chips   — show the module rows (default true); `modules: false` is the same switch
   *  lanterns      — 0..1 or (i) => 0..1: how lit the six lanterns are (default 1; 0 = bare ghost string)
   *  lanternLabels — 0..1 alpha of the Lanterns' label row (default 1)
   *  pinDrop — 0..1: the you-are-here pin falls into place from 90 px above (default 1 = in place; ease it yourself)
   *  pinGlowK — 0..1: how strongly the pinned row / Start / Finish is lit (wash, gold ring, glow; default 1)
   *  lanternSway — number or (i) => number: multiplies each lantern's idle sway (built-in amplitude 0.06 rad; default 1)
   *  lanternDrop — 0..1 or (i) => 0..1: each lantern drops onto the string from 90 px above, like pinDrop (default 1 = hung;
   *                ease it yourself, e.g. (i) => K.io(t, a + i * .15, .7, 'back'))
   *  lanternHide — 0..1 or (i) => 0..1: lifts a lantern out of the map in place (1 = gone, cord and labels stay; default 0).
   *                Redraw it yourself with K.map.lantern(t, i, {...}) to move it, so it keeps the map's sway and glow
   *  rowWash — { '14': { k, color }, ... }: washes any module row in a colour (k 0..1 eases it; colour default C.head),
   *            the same 38 px pill as the pinned row, drawn under the row's text so no overlay or text redraw is needed
   *  districtK — 0..1 or (id) => 0..1: per-district visibility, ids 'machine' … 'shipping', 'ai' (the lantern
   *              string), 'gate', 'end' (default 1). Multiplies the card AND its opaque footprint, so at 0 the
   *              district is gone and the garden path shows where it will stand — a staggered reveal you time
   *              yourself (e.g. (id) => K.io(t, at[id], .6)), without page-coloured veils.
   */
  function draw(t, o = {}) {
    const reveal = (i) => (o.t0 == null ? 1 : K.stagger(t, o.t0, i, 0.22, 0.7));
    const focusD = o.focus ? (byId[o.focus] ? o.focus : (districtOf(o.focus) || {}).id) : null;
    // highlight: id | [ids] (on = 1), { id: 0..1 } or (districtId) => 0..1; hiK(id) is each district's 0..1 highlight
    const toD = (h) => (byId[h] ? h : (districtOf(h) || {}).id);
    let hiK;
    if (typeof o.highlight === 'function') hiK = (id) => K.clamp(+o.highlight(id) || 0);
    else if (o.highlight && typeof o.highlight === 'object' && !Array.isArray(o.highlight)) {
      const hm = {};
      for (const [h, v] of Object.entries(o.highlight)) { const d = toD(h); if (d) hm[d] = Math.max(hm[d] || 0, K.clamp(+v || 0)); }
      hiK = (id) => hm[id] || 0;
    } else {
      const hiD = (Array.isArray(o.highlight) ? o.highlight : o.highlight ? [o.highlight] : []).map(toD).filter(Boolean);
      hiK = (id) => (hiD.includes(id) ? 1 : 0);
    }
    const lit = (id) => (!focusD || id === focusD ? 1 : 1 - (o.dim ?? 0.7) * (o.focusK ?? 1) * (1 - hiK(id)));
    const g = K.ctx();
    const mods = o.chips !== false && o.modules !== false;
    const pg = K.clamp(o.pinGlowK ?? 1);
    const dk = (id) => K.clamp(typeof o.districtK === 'function' ? o.districtK(id) : (o.districtK ?? 1));
    // questions: false | 0..1 | (districtId) => 0..1 fades each district's question line (default 1)
    const qk = (id) => K.clamp(o.questions === false ? 0 : typeof o.questions === 'function' ? +o.questions(id) || 0 : (o.questions ?? 1));

    // garden path
    const pk = o.t0 == null ? (o.path ?? 1) : K.io(t, o.t0, 2.2, 'io') * (o.path ?? 1);
    if (pk > 0) {
      g.save(); g.strokeStyle = K.rgba(C.head, 0.28); g.lineWidth = 3; g.setLineDash([2, 14]); g.lineCap = 'round';
      const segs = PATH.length - 1, upto = pk * segs;
      g.beginPath(); g.moveTo(PATH[0][0], PATH[0][1]);
      for (let i = 1; i <= segs; i++) {
        const u = K.clamp(upto - (i - 1)); if (u <= 0) break;
        g.lineTo(K.lerp(PATH[i - 1][0], PATH[i][0], u), K.lerp(PATH[i - 1][1], PATH[i][1], u));
      }
      g.stroke(); g.restore();
    }

    // lanterns string across the top — AI hangs over every district.
    // o.lanterns (0..1, or (i) => 0..1 per lantern, default 1): how lit each lantern is; at 0 it is a bare
    // 0.2-alpha ghost with no glow, and the cord follows the mean. o.lanternLabels (0..1, default 1): the
    // label row under the string. Both default to the fully lit map, so existing calls draw exactly as before.
    const lanternK = (i) => K.clamp(typeof o.lanterns === 'function' ? o.lanterns(i) : (o.lanterns ?? 1));
    K.layer(reveal(0) * lit('ai') * dk('ai'), () => {
      const y = LANTERNS.y;
      let mean = 0; for (let i = 0; i < LANTERNS.n; i++) mean += lanternK(i) / LANTERNS.n;
      K.layer(0.2 + 0.8 * mean, () => {
        g.save(); g.strokeStyle = K.rgba(C.soft, 0.5); g.lineWidth = 1.5;
        g.beginPath(); g.moveTo(250, y - 40); g.quadraticCurveTo(960, y + 4, 1670, y - 40); g.stroke(); g.restore();
      });
      const boost = o.focus === 'ai' || LANTERNS.mods.includes(o.focus) ? 1.8 : 1;
      for (let i = 0; i < LANTERNS.n; i++) {
        const sm = typeof o.lanternSway === 'function' ? o.lanternSway(i) : (o.lanternSway ?? 1);
        const ld = K.clamp(typeof o.lanternDrop === 'function' ? o.lanternDrop(i) : (o.lanternDrop ?? 1));
        const lh = K.clamp(typeof o.lanternHide === 'function' ? o.lanternHide(i) : (o.lanternHide ?? 0));
        const { y: y0 } = lanternAt(i);
        lantern(t, i, { y: y0 - (1 - ld) * 90, lit: lanternK(i), sway: sm, alpha: ld * (1 - lh), glowK: boost });
      }
      K.layer(o.lanternLabels ?? 1, () => {
        const eb = { size: TYPE.aiEyebrow, weight: 600, tracking: 3, upper: true };
        K.eyebrow(LANTERNS.name + ' · AI', 250, y + 66, { ...eb, color: C.head });
        K.text(LANTERNS.q, 250 + K.measure(LANTERNS.name + ' · AI', eb) + 24, y + 66, { size: TYPE.aiQ, color: C.body, font: 'ui' });
        if (mods) LANTERNS.mods.forEach((m, i) => {
          const x = lanternChipX(i), pinned = o.pin === m;
          K.text(m, x, y + 66, { font: 'mono', size: TYPE.aiNum, color: C.head, weight: 600 });
          K.text(MODULES[m], x + AI_NAME_X, y + 66, { size: TYPE.aiMod, color: pinned ? C.strong : C.body, weight: pinned ? 600 : 400 });
        });
      });
    });

    DISTRICTS.forEach((d, i) => {
      const a = reveal(i + 1) * lit(d.id) * dk(d.id);
      const isFocus = focusD === d.id;
      const rise = (1 - reveal(i + 1)) * 20;
      // opaque footprint first, so the garden path never shows through a dimmed district
      K.layer(reveal(i + 1) * dk(d.id), () => { K.rr(d.x, d.y + rise, d.w, d.h, 24); g.fillStyle = C.page; g.fill(); });
      K.layer(a, () => {
        g.save(); g.translate(0, rise);
        K.card(d.x, d.y, d.w, d.h, { glow: isFocus ? (o.focusK ?? 1) : 0, stroke: isFocus ? C.head : (hk => (hk >= 1 ? C.head : hk <= 0 ? C.line2 : K.mixColor(C.line2, C.head, hk)))(hiK(d.id)), fill: K.rgba(C.tile, 0.94) });
        K.title(d.name, d.x + 36, d.y + ROW.name, { size: TYPE.name });
        if (qk(d.id) > 0) K.text(d.q, d.x + 36, d.y + ROW.q, { size: TYPE.q, color: C.soft, font: 'ui', alpha: qk(d.id) });
        if (mods) d.mods.forEach((m, j) => {
          const y = d.y + ROW.first + j * ROW.pitch, pinned = o.pin === m;
          const rw = o.rowWash && o.rowWash[m];
          if (rw && !(pinned && pg > 0)) { const wk = K.clamp(rw.k ?? 1); if (wk > 0) { K.rr(d.x + 22, y - 28, d.w - 44, 38, 19); g.fillStyle = K.rgba(rw.color || C.head, 0.14 * wk); g.fill(); } }
          if (pinned && pg > 0) { K.rr(d.x + 22, y - 28, d.w - 44, 38, 19); g.fillStyle = K.rgba(C.head, 0.14 * pg); g.fill(); }
          K.text(m, d.x + 40, y, { font: 'mono', size: TYPE.num, color: pinned ? C.head : C.gold, weight: 600 });
          K.text(MODULES[m], d.x + 84, y, { size: TYPE.mod, color: pinned ? C.strong : C.body, weight: pinned ? 600 : 400 });
        });
        g.restore();
      });
    });

    // gate and end
    [GATE, END].forEach((p, i) => {
      // a focused Start / Finish (focus: '00' or '21') stays lit; every other focus dims them a little
      const own = focusD === p.id;
      const pinned = o.pin === p.mod ? pg : 0;
      K.layer(reveal(i === 0 ? 0 : 7) * dk(p.id) * (focusD && !own ? 1 - (o.dim ?? 0.7) * 0.6 : 1), () => {
        K.card(p.x - 50, p.y - 50, 100, 100, { r: 50, fill: C.tile, stroke: K.mixColor(C.line2, C.head, pinned), glow: 0.8 * pinned });
        K.text(p.mod, p.x, p.y + 10, { font: 'mono', size: 28, color: C.head, weight: 700, align: 'center' });
        K.text(p.label, p.x, p.y + 86, { size: TYPE.endLabel, color: C.soft, align: 'center', weight: 600 });
      });
    });

    // you-are-here pin
    if (o.pin) {
      const c = chipPos(o.pin), bob = K.wave(t, 2.4, 5);
      const ends = o.pin === GATE.mod || o.pin === END.mod;
      const drop = (1 - K.clamp(o.pinDrop ?? 1)) * -90;
      const px = ends ? c.x + 58 : c.x + c.w - 14, py = (ends ? c.y - 40 : c.y - 4) + bob + drop;
      const ps = o.pinSize ?? 44;   // the icon's tip sits 0.38 * size below its centre: keep the tip where the 44 px pin's is
      K.layer(o.pinK ?? 1, () => K.icon('pin', px, py - (ps - 44) * 0.38, ps, { color: o.pinColor || C.accent }));
    }
  }

  K.map = { MODULES, DISTRICTS, LANTERNS, GATE, END, TYPE, ROW, draw, lantern, chipPos, districtOf, lanternAt, district: (id) => byId[id] };
})();
