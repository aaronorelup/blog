/* The Hidden Curriculum — map.js
   The course map every lesson returns to, laid out from data: window.COURSE (engine/course.js, generated from
   curriculum.md by tools/course.py sync). Start, then 4 to 7 districts (each answering one question, each a run
   of up to 5 modules) on a U-shaped garden path, then the Finish, with the Lanterns (AI) strung over all of
   them. The Lanterns are NOT a district (COURSE.md): lessons about AI live in the district they belong to.
   It is the "shelf in your head": every lesson shows where its idea is stored.

   The hand-tuned six-district map the 12 legacy lessons were rendered with is frozen in engine/legacy/map-v1.js;
   legacy lesson pages load that file instead of this one, so their videos never change.
   The API is the same as v1's (draw, chipPos, district, districtOf, lantern, lanternAt, MODULES, DISTRICTS,
   LANTERNS, GATE, END, TYPE, ROW), plus intro() for the standard map section, use() to switch course data,
   resolve(), lesson(), here(), layout() and audit(). KIT.md "The map" documents it. */
(function () {
  'use strict';
  const K = window.K, C = K.C;

  // type sizes on the 1920 canvas (COURSE.md: 26 px for labels, 30+ for reading, 20 px only for eyebrows)
  const TYPE = { name: 38, q: 26, num: 22, mod: 26, aiEyebrow: 26, aiQ: 30, aiNum: 22, aiMod: 24, endLabel: 26 };
  // a district card's vertical rhythm, px below its top edge: the name's and the question's baselines, the first
  // module row's baseline, the row pitch and the padding under the last row. 'compact' is used only when the
  // two rows of cards would otherwise run past the safe area (many 5-module districts, wrapped labels).
  const RHYTHM = { std: { name: 70, q: 108, first: 150, pitch: 40, pad: 30 }, compact: { name: 64, q: 100, first: 140, pitch: 38, pad: 22 } };
  const LINE = { name: 44, q: 32, mod: 30 };          // extra line height when a name, question or label wraps
  const SAFE = { x0: 80, x1: 1840, y0: 130, y1: 930 };
  // the frame the map is drawn in: cards from x 250 (the Start/Finish circles sit at x 135) to x 1670, or up to
  // 1790 when a row's content needs it (the path's right side runs 50 px outside the cards); cards from y 258 to
  // y 920 (the web captions overlay the band below 930); the lantern string above them, clear of the badge (y < 110)
  const FRAME = { x0: 250, x1: 1670, x1max: 1790, gateX: 135, top: 258, bottom: 920, lanternY: 164, gap: 26, gapMin: 18, colGap: 25, maxW: 720 };
  const F_NAME = { font: 'head', weight: 700, size: TYPE.name, tracking: -1 };   // K.title's face
  const F_Q = { font: 'ui', size: TYPE.q };
  const F_MOD = { font: 'ui', size: TYPE.mod, weight: 600 };   // measured bold: a pinned row is drawn at 600
  const F_NUM = { font: 'mono', size: TYPE.num, weight: 600 };
  const MOD_X = 84, PIN_ROOM = 52;                         // label x inside a card; room kept clear for the pin (at w - 34)

  // the curriculum of 2026-10-01 (the v1 map), used when no window.COURSE is loaded
  const FALLBACK = {
    title: 'The Hidden Curriculum', format: 'builtin', lessons: [], lanterns: [],
    districts: [
      { id: 'orientation', kind: 'start', n: null, name: 'Orientation', question: 'what this course is, and the lantern you carry', modules: ['00'] },
      { id: 'machine', kind: 'district', n: 1, name: 'The Machine', question: "what's on your computer", modules: ['01', '02', '03'] },
      { id: 'code', kind: 'district', n: 2, name: 'The Code', question: 'what programs are made of', modules: ['04', '05', '06', '07'] },
      { id: 'history', kind: 'district', n: 3, name: 'The History', question: 'how work is saved & shared', modules: ['08'] },
      { id: 'network', kind: 'district', n: 4, name: 'The Network', question: 'how computers talk', modules: ['09', '10', '11', '12', '13'] },
      { id: 'trust', kind: 'district', n: 5, name: 'Trust', question: 'who may do what', modules: ['14', '15', '16'] },
      { id: 'shipping', kind: 'district', n: 6, name: 'Shipping', question: 'getting it to people', modules: ['17', '18', '19', '20'] },
      { id: 'capstone', kind: 'finish', n: null, name: 'Capstone', question: 'one small real project, from idea to running, using every district', modules: ['21'] },
    ],
    modules: [['00', 'Orientation'], ['01', 'Your computer'], ['02', 'The command line'], ['03', 'Dev environments'], ['04', 'Languages'],
      ['05', 'Packages'], ['06', 'Data'], ['07', 'Concurrency'], ['08', 'Git & GitHub'], ['09', 'Networking'], ['10', 'APIs, webhooks & MCP'],
      ['11', 'Websites'], ['12', 'Cloudflare'], ['13', 'Containers & cloud'], ['14', 'Identity & keys'], ['15', 'Secrets & security'],
      ['16', 'Running without you'], ['17', 'Applications'], ['18', 'Other platforms'], ['19', 'Payments & users'], ['20', 'Licenses'],
      ['21', 'Capstone']].map(([n, name]) => ({ n, name, full: name })),
  };

  let active = null;                       // course data in use (K.map.use); null = window.COURSE or FALLBACK
  const cache = new WeakMap();             // course object -> layout (kept only once the fonts are in)
  let scratch = null;

  const course = () => active || window.COURSE || FALLBACK;

  /** measure text even before a scene has set a context (layout can be asked for at any time) */
  function measuring(fn) {
    const prev = K.ctx();
    if (prev) return fn();
    if (!scratch) scratch = document.createElement('canvas').getContext('2d');
    K.use(scratch);
    try { return fn(); } finally { K.use(prev); }
  }
  function fontsOk() {
    try {
      const fam = new Set();
      document.fonts.forEach((f) => { if (f.status === 'loaded') fam.add(f.family.replace(/["']/g, '')); });
      return fam.has('Zen Maru Gothic') && fam.has('Karla');
    } catch (e) { return true; }
  }
  /** wrap into at most max lines no wider than w. Two lines are balanced (the break that makes the longer line
   *  shortest), and a line never ends on '&' or a small word ('and', 'the', 'of'...) when another break fits.
   *  Past max lines the rest joins the last line, which audit() then reports as too long. */
  const DANGLING = new Set(['&', 'and', 'or', 'the', 'a', 'an', 'of', 'to', 'in', 'on', 'for', 'with', 'at', 'by', 'from', 'your', 'you']);
  function wrapLines(s, w, f, max) {
    s = String(s);
    if (K.measure(s, f) <= w) return [s];
    const words = s.split(' ');
    if (max >= 2 && words.length > 1) {
      let best = null;
      for (let i = 1; i < words.length; i++) {
        const a = words.slice(0, i).join(' '), b = words.slice(i).join(' ');
        const wa = K.measure(a, f), wb = K.measure(b, f);
        if (wa > w || wb > w) continue;
        const score = Math.max(wa, wb) + (DANGLING.has(words[i - 1].toLowerCase()) ? w : 0);
        if (!best || score < best.score) best = { score, lines: [a, b] };
      }
      if (best) return best.lines;
    }
    const lines = K.wrap(s, w, f);
    if (lines.length <= max) return lines;
    return lines.slice(0, max - 1).concat([lines.slice(max - 1).join(' ')]);
  }

  // ------------------------------------------------------------------ layout
  function build(data) {
    const regs = (data.districts || []).map((r) => ({ ...r, q: r.question ?? r.q ?? '', mods: (r.modules || r.mods || []).map(String) }));
    const start = regs.find((r) => r.kind === 'start'), finish = regs.find((r) => r.kind === 'finish');
    const dists = regs.filter((r) => r.kind !== 'start' && r.kind !== 'finish');
    const MODULES = {}, FULL = {};
    (data.modules || []).forEach((m) => { MODULES[m.n] = m.name; FULL[m.n] = m.full || m.name; });
    regs.forEach((r) => r.mods.forEach((m) => { if (MODULES[m] == null) MODULES[m] = m; }));
    const N = dists.length;

    return measuring(() => {
      const need = (d) => Math.max(K.measure(d.name, F_NAME) + 72, K.measure(d.q, F_Q) + 72,
        MOD_X + PIN_ROOM + Math.max(0, ...d.mods.map((m) => K.measure(MODULES[m], F_MOD))));
      // widths of one row: equal when everything fits (capped at FRAME.maxW, the rest goes to the gaps); when a card
      // needs more than its share, it gets its need and the others share the rest equally; when the row cannot fit
      // every need, cards that need less than an equal share keep their need and the others share the rest equally
      // (they wrap their labels, and audit() reports any line that still does not fit)
      function widths(cards, x0, x1) {
        const n = cards.length; if (!n) return { ws: [], gap: 0, fits: true };
        const avail = x1 - x0 - FRAME.colGap * (n - 1), needs = cards.map((d) => Math.ceil(need(d)));
        let ws;
        if (needs.reduce((a, b) => a + b, 0) > avail) {
          const small = new Set(); let b = avail / n;
          for (let k = 0; k < n; k++) {
            const under = needs.map((v, i) => [v, i]).filter(([v, i]) => !small.has(i) && v < b);
            if (!under.length) break;
            under.forEach(([, i]) => small.add(i));
            const rest = avail - [...small].reduce((a, i) => a + needs[i], 0), left = n - small.size;
            b = left ? rest / left : 0;
          }
          ws = needs.map((v, i) => (small.has(i) ? v : b));
        } else {
          const fixed = new Set(); let b = avail / n;
          for (let k = 0; k < n; k++) {
            const over = needs.map((v, i) => [v, i]).filter(([v, i]) => !fixed.has(i) && v > b);
            if (!over.length) break;
            over.forEach(([, i]) => fixed.add(i));
            const rest = avail - [...fixed].reduce((a, i) => a + needs[i], 0), left = n - fixed.size;
            b = left ? rest / left : 0;
          }
          ws = needs.map((v, i) => (fixed.has(i) ? v : Math.min(b, FRAME.maxW)));
        }
        ws = ws.map(Math.floor);
        const gap = n > 1 ? (x1 - x0 - ws.reduce((a, b) => a + b, 0)) / (n - 1) : 0;
        return { ws, gap, fits: needs.every((v, i) => v <= ws[i] + 0.5) };
      }
      // card text for a rhythm
      function textOf(d, w, R) {
        const inner = w - 72, modW = w - MOD_X - PIN_ROOM;
        const name = wrapLines(d.name, inner, F_NAME, 2), q = d.q ? wrapLines(d.q, inner, F_Q, 2) : [];
        const dy = (name.length - 1) * LINE.name + (Math.max(1, q.length) - 1) * LINE.q;
        const rows = {}; let y = R.first + dy, prev = null, extra = name.length - 1 + Math.max(0, q.length - 1);
        d.mods.forEach((m) => {
          const lines = wrapLines(MODULES[m], modW, F_MOD, 2);
          if (prev) y += R.pitch + (prev.lines.length - 1) * LINE.mod;
          prev = rows[m] = { y, lines };
          extra += lines.length - 1;
        });
        const h = prev ? prev.y + (prev.lines.length - 1) * LINE.mod + R.pad : R.q + dy + R.pad;
        return { name, q, rows, dy, h, inner, modW, extra };
      }
      // one candidate layout: nTop cards on the top row, cards up to x1. Fit the two rows between y 258 and 920:
      // shrink the gap, then the padding, then use the compact rhythm.
      function plan(nTop, X1) {
        const rowsOf = [dists.slice(0, nTop), dists.slice(nTop).reverse()];   // positions left -> right; the bottom row is walked right -> left
        const rw = rowsOf.map((r) => widths(r, FRAME.x0, X1));
        const rowsFor = (R, pad) => rowsOf.map((row, ri) => {
          const texts = row.map((d, i) => textOf(d, rw[ri].ws[i], { ...R, pad }));
          return { texts, h: Math.max(0, ...texts.map((x) => x.h)) };
        });
        const budget = FRAME.bottom - FRAME.top;
        let R = RHYTHM.std, gap = FRAME.gap, pad = R.pad, rows = rowsFor(R, pad), compact = false;
        const total = () => rows[0].h + (rows[1].texts.length ? gap + rows[1].h : 0);
        if (total() > budget) gap = Math.max(FRAME.gapMin, gap - (total() - budget));
        while (total() > budget && pad > 20) { pad -= 2; rows = rowsFor(R, pad); }
        if (total() > budget) { R = RHYTHM.compact; pad = R.pad; compact = true; gap = FRAME.gapMin; rows = rowsFor(R, pad); }
        const over = Math.max(0, total() - budget);
        const wraps = rows.reduce((a, r) => a + r.texts.reduce((b, x) => b + x.extra, 0), 0);
        return { nTop, X1, rowsOf, rw, rows, R, pad, gap, compact, over, wraps, total: total(), budget };
      }
      // try both widths of the frame and, for an odd number of districts, both splits; keep the best:
      // nothing past the safe area, then the fewest wrapped lines, the standard rhythm, the narrower frame, the top-heavy split
      const splits = N % 2 ? [Math.ceil(N / 2), Math.floor(N / 2)] : [N / 2];
      const cands = [];
      splits.forEach((nt, si) => [FRAME.x1, FRAME.x1max].forEach((x1, xi) => cands.push({ p: plan(nt, x1), score: [0, 0, 0, xi, si] })));
      cands.forEach((c) => { c.score[0] = Math.ceil(c.p.over); c.score[1] = c.p.wraps; c.score[2] = c.p.compact ? 1 : 0; });
      cands.sort((a, b) => { for (let i = 0; i < a.score.length; i++) if (a.score[i] !== b.score[i]) return a.score[i] - b.score[i]; return 0; });
      const best = cands[0].p;
      const { rowsOf, rw, rows, R, pad, gap, compact, over, X1 } = best;
      const budget = best.budget;
      const off = Math.max(0, Math.round((budget - best.total) / 2));           // a smaller map sits in the middle
      const top = FRAME.top + off, bot = top + rows[0].h + gap;
      const ROW = { name: R.name, q: R.q, first: R.first, pitch: R.pitch };

      const DISTRICTS = [];
      rowsOf.forEach((row, ri) => {
        let x = FRAME.x0;
        row.forEach((d, i) => {
          const w = rw[ri].ws[i], tx = rows[ri].texts[i];
          const xx = row.length === 1 ? Math.round(FRAME.x0 + (X1 - FRAME.x0 - w) / 2) : Math.round(x);
          DISTRICTS.push({ id: d.id, name: d.name, q: d.q, n: d.n, kind: 'district', x: xx, y: ri ? bot : top, w, h: rows[ri].h, mods: d.mods.slice(),
            row: ri, lines: { name: tx.name, q: tx.q }, rows: tx.rows, dy: tx.dy, labelW: tx.modW });
          x += w + rw[ri].gap;
        });
      });
      // path order: the top row left -> right, then the bottom row right -> left (DISTRICTS keeps curriculum order)
      DISTRICTS.sort((a, b) => dists.findIndex((d) => d.id === a.id) - dists.findIndex((d) => d.id === b.id));
      const LY = FRAME.lanternY + off;
      const LANTERNS = { id: 'ai', name: 'The Lanterns', q: 'lights every district', mods: [], y: LY, n: Math.max(1, N), x0: FRAME.x0, x1: X1 };
      const gateY = top + rows[0].h / 2, endY = rows[1].texts.length ? bot + rows[1].h / 2 : gateY + 344;
      const GATE = { id: 'gate', alias: start ? start.id : 'orientation', mod: start && start.mods[0] || '00', mods: start ? start.mods.slice() : ['00'],
        x: FRAME.gateX, y: gateY, label: 'Start', name: start ? start.name : 'Start', q: start ? start.q : '', kind: 'start' };
      const lastMod = Object.keys(MODULES).sort().pop() || '21';
      const END = { id: 'end', alias: finish ? finish.id : 'capstone', mod: finish && finish.mods[0] || lastMod, mods: finish ? finish.mods.slice() : [lastMod],
        x: FRAME.gateX, y: endY, label: 'Finish', name: finish ? finish.name : 'Finish', q: finish ? finish.q : '', kind: 'finish' };
      const pathX = X1 + 50;
      const topRow = DISTRICTS.filter((d) => d.row === 0).sort((a, b) => a.x - b.x);
      const botRow = DISTRICTS.filter((d) => d.row === 1).sort((a, b) => b.x - a.x);
      const PATH = [[GATE.x, GATE.y], ...topRow.map((d) => [d.x + d.w / 2, GATE.y]), [pathX, GATE.y], [pathX, END.y],
        ...botRow.map((d) => [d.x + d.w / 2, END.y]), [END.x, END.y]];
      const lessons = data.lessons || [];
      return { data, MODULES, FULL, DISTRICTS, LANTERNS, GATE, END, PATH, ROW, R: { ...R, pad }, compact, gap, over, X1, top, bot, off,
        byId: Object.fromEntries(DISTRICTS.map((d) => [d.id, d])),
        lessonsByKey: Object.fromEntries(lessons.map((l) => [l.key, l])), lessonsById: Object.fromEntries(lessons.map((l) => [l.id, l])) };
    });
  }

  function lay() {
    const data = course();
    const hit = cache.get(data);
    if (hit) return hit;
    const L = build(data);
    if (fontsOk()) cache.set(data, L);
    return L;
  }

  // ------------------------------------------------------------------ lookups
  const lanternAt = (i) => {
    const L = lay(), A = L.LANTERNS, n = A.n, x0 = A.x0, x1 = A.x1, cx = (x0 + x1) / 2, hw = (x1 - x0) / 2;
    const x = n > 1 ? x0 + 80 + (i * (x1 - x0 - 160)) / (n - 1) : cx;
    return { x, y: A.y - 24 + Math.pow((x - cx) / hw, 2) * -22 + 22 };
  };

  /** the lesson being played (window.__lesson, from lesson.js) as COURSE knows it: by key, then by id */
  function lessonOf(ref) {
    const L = lay(); if (ref == null) return null;
    if (typeof ref === 'object') return ref;
    return L.lessonsByKey[ref] || L.lessonsById[ref] || null;
  }
  function here() {
    const D = window.__lesson; if (!D) return null;
    // a lesson with a key is found by its key only: IDs move, so a key the course no longer lists (a deleted lesson
    // whose page is still up) must not borrow whatever lesson holds its old ID now
    const hit = D.key ? lessonOf(D.key) : lessonOf(D.id);
    if (hit) return hit;
    // a lesson not in the curriculum (proof of concept, test, deleted): fall back to its module's full name
    const r = D.module != null ? resolve(D.module) : null;
    return r && r.mod ? { id: D.id, key: D.key, title: D.title, module: r.mod, district: (districtOf(r.mod) || {}).id } : null;
  }

  /** what a pin / focus / highlight value names: a module number ('15', 15), a module name or label, a district id or
   *  name, 'gate'/'start'/'end'/'finish' (or the Start/Finish region's id or name), 'ai', a lesson key or id, or 'lesson'
   *  (the lesson being played). Returns { type: 'module'|'district'|'gate'|'end'|'ai', id, mod } or null. */
  function resolve(x) {
    if (x == null || x === false || x === '') return null;
    const L = lay();
    if (typeof x === 'object' && x.type) return x;
    if (x === 'lesson') { const h = here(); return h ? resolve(h.module) : null; }
    let s = typeof x === 'number' ? String(x).padStart(2, '0') : String(x).trim();
    if (/^\d$/.test(s)) s = '0' + s;
    const low = s.toLowerCase(), bare = low.replace(/^the\s+/, '');
    const mod = (m) => {
      if (L.GATE.mods.includes(m)) return { type: 'gate', id: 'gate', mod: m };
      if (L.END.mods.includes(m)) return { type: 'end', id: 'end', mod: m };
      const d = L.DISTRICTS.find((dd) => dd.mods.includes(m));
      return d ? { type: 'module', id: d.id, mod: m } : null;
    };
    if (L.MODULES[s] != null) return mod(s);
    if (low === 'ai' || low === 'lanterns' || low === 'the lanterns') return { type: 'ai', id: 'ai' };
    if (low === 'gate' || low === 'start' || low === L.GATE.alias || bare === L.GATE.name.toLowerCase().replace(/^the\s+/, '')) return { type: 'gate', id: 'gate', mod: L.GATE.mod };
    if (low === 'end' || low === 'finish' || low === L.END.alias || bare === L.END.name.toLowerCase().replace(/^the\s+/, '')) return { type: 'end', id: 'end', mod: L.END.mod };
    if (L.byId[s]) return { type: 'district', id: s };
    const dn = L.DISTRICTS.find((d) => d.name.toLowerCase().replace(/^the\s+/, '') === bare);
    if (dn) return { type: 'district', id: dn.id };
    const mn = Object.keys(L.MODULES).find((m) => L.MODULES[m].toLowerCase() === low || (L.FULL[m] || '').toLowerCase() === low);
    if (mn) return mod(mn);
    const les = lessonOf(s);
    if (les) return mod(les.module);
    return null;
  }
  const modKey = (m) => { const r = resolve(m); return r && r.mod ? r.mod : String(m); };

  /** the district (or Start/Finish, or the Lanterns) a module belongs to (v1 API; also takes names) */
  function districtOf(mod) {
    const L = lay(), m = modKey(mod);
    return L.DISTRICTS.find((d) => d.mods.includes(m)) || (L.LANTERNS.mods.includes(m) ? L.LANTERNS : L.GATE.mods.includes(m) ? L.GATE : L.END.mods.includes(m) ? L.END : null);
  }
  /** district id (or name) -> its card {x, y, w, h, name, q, mods, lines, rows}; v1 API */
  function district(id) { const L = lay(); if (L.byId[id]) return L.byId[id]; const r = resolve(id); return r && r.type === 'district' ? L.byId[r.id] : undefined; }

  /** {x, y, w, d} of a module row: x/w the row's inner span, y the vertical middle of its text (v1 API) */
  function chipPos(mod) {
    const L = lay(), m = modKey(mod);
    const d = L.DISTRICTS.find((dd) => dd.mods.includes(m));
    if (d) { const r = d.rows[m]; return { x: d.x + 40, y: d.y + r.y - 9 + ((r.lines.length - 1) * LINE.mod) / 2, w: d.w - 80, d, lines: r.lines.length }; }
    if (L.GATE.mods.includes(m)) return { x: L.GATE.x, y: L.GATE.y, w: 0, d: L.GATE };
    if (L.END.mods.includes(m)) return { x: L.END.x, y: L.END.y, w: 0, d: L.END };
    return { x: K.W / 2, y: K.H / 2, w: 0 };
  }

  /** where the you-are-here pin's tip-anchor sits for a pin value (before bob/drop). o.pinSide 'left' puts a module
   *  pin at the row's left end instead of its right (intro() does this when the card sits left of the district);
   *  o.pinX sets its x outright */
  function pinAt(target, o = {}) {
    const L = lay(), r = resolve(target); if (!r) return null;
    if (r.type === 'gate' || r.type === 'end') { const p = r.type === 'gate' ? L.GATE : L.END; return { x: p.x + 58, y: p.y - 40, r }; }
    if (r.type === 'district') { const d = L.byId[r.id]; return { x: d.x + d.w - 34, y: d.y + L.ROW.name - 26, r }; }
    if (r.type === 'module') {
      const c = chipPos(r.mod);
      const x = o.pinX != null ? o.pinX : o.pinSide === 'left' && c.d ? c.d.x + 18 : c.x + c.w + 6;
      return { x, y: c.y - 4, r };
    }
    return null;
  }

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
   * draw the map. o (all optional; every v1 option still works):
   *  t0      — when the staggered reveal starts (omit: fully visible)
   *  focus   — what to light up (a district, a module, 'gate'/'end', 'ai', 'lesson', a name...: see resolve); others dim
   *  focusK  — 0..1 how far the focus has eased in (default 1)
   *  dim     — how far unfocused districts fade (0..1, default 0.7)
   *  pin     — what to mark "you are here" (a module, a district, 'gate'/'end', 'lesson'...)
   *  pinSize / pinColor / pinK / pinDrop / pinGlowK — the pin's size (44), colour (accent), alpha, drop-in 0..1, and
   *            0..1 for the pinned row's emphasis (wash, bright number, bold label; default 1)
   *  pinSide / pinX — a module pin at the row's 'left' end instead of its right, or at this x
   *  highlight — id | [ids] | { id: 0..1 } | (districtId) => 0..1: also lit (undimmed, gold outline), no glow
   *  path    — 0..1 progress of the dashed garden path (default 1)
   *  chips / modules — false hides the module rows
   *  questions — false | 0..1 | (districtId) => 0..1 fades the district questions (default 1)
   *  lanterns / lanternLabels / lanternSway / lanternDrop / lanternHide — as in v1 (one lantern per district)
   *  rowWash — { '14': { k, color }, ... } washes module rows (the pinned row's own wash wins on that row)
   *  districtK — 0..1 or (id) => 0..1: per-district visibility; ids are the district ids plus 'ai', 'gate', 'end'
   */
  function draw(t, o = {}) {
    const L = lay(), { DISTRICTS, LANTERNS, GATE, END, PATH, MODULES, ROW } = L;
    const N = DISTRICTS.length;
    const reveal = (i) => (o.t0 == null ? 1 : K.stagger(t, o.t0, i, 0.22, 0.7));
    const toD = (h) => { const r = resolve(h); return !r ? null : r.type === 'module' ? r.id : r.id; };
    const focusD = o.focus ? toD(o.focus) : null;
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
    const qk = (id) => K.clamp(o.questions === false ? 0 : typeof o.questions === 'function' ? +o.questions(id) || 0 : (o.questions ?? 1));
    const pinR = o.pin ? resolve(o.pin) : null;
    const pinMod = pinR && (pinR.type === 'module' || pinR.type === 'gate' || pinR.type === 'end') ? pinR.mod : null;
    const pinnedEnd = pinR && (pinR.type === 'gate' || pinR.type === 'end') ? pinR.type : null;

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

    // the lantern string across the top: AI hangs over every district (one lantern per district)
    const lanternK = (i) => K.clamp(typeof o.lanterns === 'function' ? o.lanterns(i) : (o.lanterns ?? 1));
    K.layer(reveal(0) * lit('ai') * dk('ai'), () => {
      const y = LANTERNS.y;
      let mean = 0; for (let i = 0; i < LANTERNS.n; i++) mean += lanternK(i) / LANTERNS.n;
      K.layer(0.2 + 0.8 * mean, () => {
        g.save(); g.strokeStyle = K.rgba(C.soft, 0.5); g.lineWidth = 1.5;
        g.beginPath(); g.moveTo(LANTERNS.x0, y - 40); g.quadraticCurveTo((LANTERNS.x0 + LANTERNS.x1) / 2, y + 4, LANTERNS.x1, y - 40); g.stroke(); g.restore();
      });
      const boost = focusD === 'ai' ? 1.8 : 1;
      for (let i = 0; i < LANTERNS.n; i++) {
        const sm = typeof o.lanternSway === 'function' ? o.lanternSway(i) : (o.lanternSway ?? 1);
        const ld = K.clamp(typeof o.lanternDrop === 'function' ? o.lanternDrop(i) : (o.lanternDrop ?? 1));
        const lh = K.clamp(typeof o.lanternHide === 'function' ? o.lanternHide(i) : (o.lanternHide ?? 0));
        const { y: y0 } = lanternAt(i);
        lantern(t, i, { y: y0 - (1 - ld) * 90, lit: lanternK(i), sway: sm, alpha: ld * (1 - lh), glowK: boost });
      }
      K.layer(o.lanternLabels ?? 1, () => {
        const eb = { size: TYPE.aiEyebrow, weight: 600, tracking: 3, upper: true };
        K.eyebrow(LANTERNS.name + ' · AI', LANTERNS.x0, y + 66, { ...eb, color: C.head });
        K.text(LANTERNS.q, LANTERNS.x0 + K.measure(LANTERNS.name + ' · AI', eb) + 24, y + 66, { size: TYPE.aiQ, color: C.body, font: 'ui' });
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
        K.card(d.x, d.y, d.w, d.h, { glow: isFocus ? (o.focusK ?? 1) : 0, stroke: isFocus ? K.mixColor(C.line2, C.head, K.clamp(o.focusK ?? 1)) : ((hk) => (hk >= 1 ? C.head : hk <= 0 ? C.line2 : K.mixColor(C.line2, C.head, hk)))(hiK(d.id)), fill: K.rgba(C.tile, 0.94) });
        d.lines.name.forEach((ln, j) => K.title(ln, d.x + 36, d.y + ROW.name + j * LINE.name, { size: TYPE.name, maxW: d.w - 72 }));
        const qy = d.y + ROW.q + (d.lines.name.length - 1) * LINE.name;
        if (qk(d.id) > 0) d.lines.q.forEach((ln, j) => K.text(ln, d.x + 36, qy + j * LINE.q, { size: TYPE.q, color: C.soft, font: 'ui', alpha: qk(d.id), maxW: d.w - 72 }));
        if (mods) d.mods.forEach((m) => {
          const r = d.rows[m], y = d.y + r.y, hh = 38 + (r.lines.length - 1) * LINE.mod;
          // the pinned row's emphasis (wash, bright number, bold label) follows pinGlowK, so it never shows before
          // the pin drops (intro holds pinGlowK at 0 until [[module]]); pinGlowK defaults to 1 for every other caller
          const pk = pinMod === m ? pg : 0;
          const rw = o.rowWash && o.rowWash[m];
          if (rw && !(pk > 0)) { const wk = K.clamp(rw.k ?? 1); if (wk > 0) { K.rr(d.x + 22, y - 28, d.w - 44, hh, 19); g.fillStyle = K.rgba(rw.color || C.head, 0.14 * wk); g.fill(); } }
          if (pk > 0) { K.rr(d.x + 22, y - 28, d.w - 44, hh, 19); g.fillStyle = K.rgba(C.head, 0.14 * pk); g.fill(); }
          K.text(m, d.x + 40, y, { font: 'mono', size: TYPE.num, color: pk > 0.5 ? C.head : C.gold, weight: 600 });
          r.lines.forEach((ln, j) => K.text(ln, d.x + MOD_X, y + j * LINE.mod, { size: TYPE.mod, color: pk >= 1 ? C.strong : pk > 0 ? K.mixColor(C.body, C.strong, pk) : C.body, weight: pk > 0.5 ? 600 : 400, maxW: d.labelW }));
        });
        g.restore();
      });
    });

    // the Start and the Finish
    [GATE, END].forEach((p, i) => {
      // a focused Start / Finish (focus '00' / '21' / 'gate' / 'end') stays lit; every other focus dims them a little
      const own = focusD === p.id;
      const pinned = pinnedEnd === (i === 0 ? 'gate' : 'end') ? pg : 0;
      K.layer(reveal(i === 0 ? 0 : N + 1) * dk(p.id) * (focusD && !own ? 1 - (o.dim ?? 0.7) * 0.6 : 1), () => {
        K.card(p.x - 50, p.y - 50, 100, 100, { r: 50, fill: C.tile, stroke: K.mixColor(C.line2, C.head, pinned), glow: 0.8 * pinned });
        K.text(p.mod, p.x, p.y + 10, { font: 'mono', size: 28, color: C.head, weight: 700, align: 'center' });
        K.text(p.label, p.x, p.y + 86, { size: TYPE.endLabel, color: C.soft, align: 'center', weight: 600 });
      });
    });

    // you-are-here pin
    if (pinR) {
      const at = pinAt(pinR, o);
      if (at) {
        const bob = K.wave(t, 2.4, 5), drop = (1 - K.clamp(o.pinDrop ?? 1)) * -90;
        const ps = o.pinSize ?? 44;   // the icon's tip sits 0.38 * size below its centre: keep the tip where the 44 px pin's is
        K.layer(o.pinK ?? 1, () => K.icon('pin', at.x, at.y + bob + drop - (ps - 44) * 0.38, ps, { color: o.pinColor || C.accent }));
      }
    }
  }

  // ------------------------------------------------------------------ the standard map section
  /** the "you are here" card: eyebrow + the lesson's short title (balanced over up to three lines). Returns {w, h}. */
  function hereCard(x, y, title, o = {}) {
    const w = o.w ?? cardW(title), lines = wrapLines(title, w - 64, { font: 'ui', size: 30, weight: 600 }, 3), h = 36 + 22 + 18 + lines.length * 38 + 14;
    if (o.measureOnly) return { w, h };
    K.layer(o.alpha ?? 1, () => {
      K.card(x, y, w, h, { fill: K.rgba(C.tile, 0.98), stroke: K.rgba(C.head, 0.6), r: 20, shadow: true });
      K.eyebrow(o.eyebrow || 'You are here', x + 32, y + 36 + 16, { size: 20, tracking: 3, color: C.head });
      lines.forEach((ln, i) => K.text(ln, x + 32, y + 36 + 22 + 18 + 26 + i * 38, { font: 'ui', size: 30, weight: 600, color: C.strong, maxW: w - 64 }));
    });
    return { w, h };
  }
  const cardW = (title) => K.clamp(K.measure(title, { font: 'ui', size: 30, weight: 600 }) + 64, 300, 460);

  /**
   * The standard "Where this sits on the map" scene: scenes/02.js is SCENE('02', (t, S) => K.map.intro(t, S)).
   * The map assembles; the lesson's district comes into focus as [[district]] is spoken (its question underlined;
   * for the Start / Finish a note with its name and question appears by the circle); the pin drops on the module
   * row at [[module]]; a "you are here" card with the lesson's short title sits by the pin; then everything rests.
   * Times come from S.cue('district') / S.cue('module') with fallbacks proportional to S.dur, so a draft without
   * narration still plays. o: lesson (key or id; default the lesson being played), title (card text; default
   * lesson.js short), pin (override what is pinned), tDistrict / tModule (override the beats), t0 (assembly start,
   * default -0.3), card: false (no card), map: {...} (extra K.map.draw options).
   */
  function intro(t, S, o = {}) {
    const L = lay();
    const D = window.__lesson || {};
    const les = o.lesson != null ? lessonOf(o.lesson) : here();
    const target = resolve(o.pin ?? (les ? les.module : null));
    const dur = (S && S.dur) || o.dur || 10;
    const cue = (n, fb) => (S && S.cue ? S.cue(n, fb) : fb);
    const tD = o.tDistrict ?? cue('district', K.clamp(dur * 0.22, 1.4, 4));
    const tM = o.tModule ?? cue('module', Math.max(tD + 1.6, dur * 0.6));
    const t0 = o.t0 ?? -0.3;
    const asm = K.clamp(tD - 0.3 - t0, 1.0, 2.4);
    const order = ['gate', ...L.DISTRICTS.map((d) => d.id), 'end'];
    const step = (asm * 0.55) / Math.max(1, order.length - 1);
    const districtK = (id) => (id === 'ai' ? K.io(t, t0 + asm * 0.3, asm * 0.5, 'out') : K.io(t, t0 + step * Math.max(0, order.indexOf(id)), asm * 0.45, 'out'));
    const lanterns = (i) => 0.15 + 0.85 * K.io(t, t0 + asm * 0.45 + (i * asm * 0.4) / L.LANTERNS.n, 0.5);
    const focusK = K.io(t, tD, 0.8);
    const where = target ? target.id : null;
    const isEnd = target && (target.type === 'gate' || target.type === 'end');
    const title = o.title ?? ((les && D.key && les.key === D.key) || (les && D.id && les.id === D.id) ? (D.short || D.title) : null) ?? (les && les.title) ?? D.short ?? D.title ?? '';
    const cardOn = o.card !== false && !!title;
    // where the card goes is settled before drawing, because it decides which end of the row the pin sits at
    const spot = target && !isEnd && cardOn ? placeCard(L, target, title) : null;

    K.bg();
    draw(t, {
      districtK, path: K.io(t, t0, asm + 0.4, 'io'), lanterns, lanternLabels: K.io(t, t0 + asm * 0.6, 0.6),
      focus: where, focusK, pin: target || undefined,
      pinK: K.io(t, tM - 0.05, 0.25), pinDrop: K.io(t, tM - 0.05, 0.7, 'back'), pinGlowK: K.io(t, tM + 0.15, 0.6),
      ...(spot && spot.pinSide ? { pinSide: spot.pinSide } : {}), ...(spot && spot.pinX != null ? { pinX: spot.pinX } : {}),
      ...(o.map || {}),
    });
    if (!target) return;
    const cardK = cardOn ? K.io(t, tM + 0.45, 0.5) : 0;

    if (!isEnd) {
      // the district's question, underlined as the district is named
      const d = L.byId[where];
      const qk = K.io(t, tD + 0.45, 0.8);
      if (d && qk > 0 && d.lines.q.length) {
        const qy = d.y + L.ROW.q + (d.lines.name.length - 1) * LINE.name;
        d.lines.q.forEach((ln, j) => K.mark(d.x + 36, qy + 8 + j * LINE.q, K.measure(ln, F_Q) + 6, K.clamp(qk * d.lines.q.length - j), { alpha: 0.8, w: 3 }));
      }
      if (cardK <= 0 || !spot) return;
      const { x, y, w, side } = spot;
      veil(spot, cardK, spot.d.id);
      K.layer(cardK, () => {
        if (spot.ax != null) {
          const bx = side === -1 ? x + w : x;
          if (Math.abs(bx - spot.ax) > 8) K.line(spot.ax, spot.ay, K.lerp(spot.ax, bx, K.io(t, tM + 0.45, 0.4)), spot.ay, { color: K.rgba(C.head, 0.7), w: 2 });
        }
        g2().save(); g2().translate((side === -1 ? 1 : side ? -1 : 0) * (1 - cardK) * 14, 0);
        hereCard(x, y, title, { w });
        g2().restore();
      });
      return;
    }
    // the Start / the Finish: a note by the circle names it and its question, then the card joins it
    const p = target.type === 'gate' ? L.GATE : L.END;
    const noteK = K.io(t, tD + 0.2, 0.5);
    if (noteK <= 0) return;
    // as wide as the district card beside the circle, so the note ends flush with the card it covers (and only that
    // card is veiled); at least 380 px
    const row = L.DISTRICTS.filter((d) => Math.abs(d.y + d.h / 2 - p.y) < d.h / 2).sort((a, b) => a.x - b.x)[0];
    const nx = p.x + 50 + 34, QF = { font: 'ui', size: 28 };
    let nw = row ? Math.max(380, row.x + row.w - nx) : 540;
    let ql = wrapLines(p.q, nw - 72, QF, 3);
    const noteH = (n) => 36 + 22 + 20 + n * 36 + 18;
    const cardH = (w) => (cardOn ? hereCard(0, 0, title, { measureOnly: true, w }).h : 0);
    const fullH = () => noteH(ql.length) + (cardOn ? 14 + cardH(nw) : 0);
    // taller than its row of cards (a narrow card, a long question): widen it, up to 720 px, until the question
    // takes two lines at most, so the note stays in its own row instead of spilling over the other one; when even
    // that is too tall, the card goes beside the note instead of under it
    let stacked = true;
    if (row && fullH() > row.h) {
      const nw0 = nw, ql0 = ql;
      while (ql.length > 2 && nw < 720) { nw = Math.min(720, nw + 20); ql = wrapLines(p.q, nw - 72, QF, 3); }
      if (fullH() > row.h && cardOn) { stacked = false; nw = nw0; ql = ql0; }
    }
    const eyebrow = `${p.label} · ${p.name}`;
    // beside the note, the card covers the next card of the row: its whole column, as for a district's card
    const nxt = !stacked && row ? L.DISTRICTS.filter((d) => d.row === row.row && d.x > row.x).sort((a, b) => a.x - b.x)[0] : null;
    const cw = stacked ? nw : nxt ? Math.min(460, Math.max(300, nxt.w)) : cardW(title);
    const nh = noteH(ql.length), ch = cardH(cw);
    const full = stacked ? nh + (ch ? 14 + ch : 0) : Math.max(nh, ch);
    let y = K.clamp(p.y - full / 2, SAFE.y0 + 4, SAFE.y1 - 6 - full);
    if (row && full <= row.h) y = K.clamp(p.y - full / 2, row.y, row.y + row.h - full);
    const ny = stacked ? y : y + (full - nh) / 2;
    const cx = stacked ? nx : nxt ? Math.max(nx + nw + 14, nxt.x) : nx + nw + 14, cy = stacked ? y + nh + 14 : y + (full - ch) / 2;
    veil({ x: nx, y, w: stacked ? nw : cx + cw - nx, h: full }, noteK, null);
    K.layer(noteK, () => {
      K.line(p.x + 52, p.y, nx - 4, p.y, { color: K.rgba(C.head, 0.7), w: 2, k: K.io(t, tD + 0.2, 0.4) });
      g2().save(); g2().translate((1 - noteK) * 14, 0);
      K.card(nx, ny, nw, nh, { fill: K.rgba(C.tile, 0.98), stroke: K.rgba(C.head, 0.55), r: 20, shadow: true });
      K.eyebrow(eyebrow, nx + 36, ny + 36 + 16, { size: 22, tracking: 3, color: C.head });
      ql.forEach((ln, i) => K.text(ln, nx + 36, ny + 36 + 22 + 20 + 22 + i * 36, { font: 'ui', size: 28, color: C.body, maxW: nw - 72 }));
      g2().restore();
    });
    if (cardK > 0 && ch) K.layer(cardK, () => {
      g2().save(); g2().translate(stacked ? 0 : (1 - cardK) * -14, stacked ? (1 - cardK) * 12 : 0);
      hereCard(cx, cy, title, { w: cw });
      g2().restore();
    });
  }

  /**
   * where intro() puts the "you are here" card for a module (or district) pin: { d, c, x, y, w, h, side, pinSide,
   * pinX, ax, ay }. side 1 = right of the district, over its neighbour; 2 = inside the district, right of its
   * labels; -1 = left of it, with a module pin moved to the row's left end so pin, leader and card stay together;
   * 0 = fallback over the district itself. Tried in that order. ax/ay: where the leader line starts (at the pin).
   * A card that would cover part of a neighbour is snapped to that neighbour's column (and widened to it, up to
   * 460 px), so no card is left half-covered with words cut off beside it.
   */
  function placeCard(L, target, title) {
    const d = L.byId[target.id]; if (!d) return null;
    const c = target.type === 'module' ? chipPos(target.mod) : { x: d.x + 40, y: d.y + L.ROW.name - 14, w: d.w - 80 };
    let { w, h } = hereCard(0, 0, title, { measureOnly: true });
    const others = L.DISTRICTS.filter((x) => x.row === d.row && x.id !== d.id);
    const right = others.filter((x) => x.x > d.x).sort((a, b) => a.x - b.x)[0];
    const left = others.filter((x) => x.x < d.x).sort((a, b) => b.x - a.x)[0];
    let x = d.x + d.w + 26, side = 1, pinSide = null, pinX = null, inside = null;
    if (x + w > SAFE.x1 - 4) {
      side = null;
      // inside the district, right of its longest module label, when the card and the pin both fit there
      if (target.type === 'module') {
        const labelEnd = measuring(() => Math.max(0, ...d.mods.map((m) => Math.max(0, ...d.rows[m].lines.map((ln) => K.measure(ln, F_MOD))))));
        if (d.w - (MOD_X + labelEnd + PIN_ROOM) >= w + 24) {
          const xi = d.x + d.w - 16 - w;
          // clear of the district's name and question when they reach that far right
          const textEnd = measuring(() => Math.max(0, ...d.lines.name.map((ln) => K.measure(ln, F_NAME)), ...d.lines.q.map((ln) => K.measure(ln, F_Q)))) + 36;
          const top = textEnd + 8 > xi - d.x ? d.y + L.ROW.q + (d.lines.name.length - 1) * LINE.name + (Math.max(1, d.lines.q.length) - 1) * LINE.q + 14 : d.y + 8;
          const lo = Math.max(SAFE.y0 + 4, top), hi = Math.min(SAFE.y1 - 6, d.y + d.h - 8) - h;
          const yi = K.clamp(c.y - h / 2, lo, hi);
          if (hi >= lo && c.y >= yi + 14 && c.y <= yi + h - 14) { x = xi; side = 2; pinX = xi - 34; inside = yi; }
        }
      }
      if (side == null) {
        x = d.x - 26 - w; side = -1; pinSide = target.type === 'module' ? 'left' : null;
        if (x < SAFE.x0) { x = K.clamp(d.x + d.w - w, SAFE.x0, SAFE.x1 - w); side = 0; pinSide = null; }
      }
    }
    // cover a neighbour's whole column, not half of it: the card takes the column's width (300 to 460 px; a longer
    // title wraps), so it neither leaves words cut off beside it nor spills a few px into the next column
    const nb = side === 1 ? right : side === -1 ? left : null;
    if (nb && x < nb.x + nb.w && x + w > nb.x) {
      const w2 = Math.min(460, Math.max(300, nb.w));
      if (w2 !== w) { w = w2; h = hereCard(0, 0, title, { measureOnly: true, w }).h; }
      x = side === 1 ? nb.x : nb.x + nb.w - w;
    }
    let y;
    if (inside != null) y = inside;
    else {
      // keep the card inside the band of its own row of districts when it fits (then it covers one neighbour, not
      // two rows), with the pinned row's height inside the card so the leader line meets it square
      const lo = Math.max(SAFE.y0 + 4, d.y + 4), hi = Math.min(SAFE.y1 - 6, d.y + d.h - 4) - h;
      y = K.clamp(c.y - h / 2, SAFE.y0 + 4, SAFE.y1 - 6 - h);
      if (hi >= lo) y = K.clamp(y, lo, hi);
      if (c.y < y + 14 || c.y > y + h - 14) y = K.clamp(c.y - h / 2, SAFE.y0 + 4, SAFE.y1 - 6 - h);
    }
    const pin = pinX != null ? pinX : pinSide === 'left' ? d.x + 18 : c.x + c.w + 6;
    const ax = side === 1 || side === 2 ? pin + 10 : side === -1 ? (pinSide === 'left' ? pin - 10 : d.x + 4) : null;
    return { d, c, x, y, w, h, side, pinSide, pinX, ax, ay: c.y };
  }
  const g2 = () => K.ctx();
  /** page-coloured veil over every district card a note or card covers (but not `keep`), so nothing half-covered
   *  peeks out from under it (k 0..1 eases it with the card) */
  function veil(r, k, keep) {
    if (k <= 0) return;
    const L = lay(), g = K.ctx();
    L.DISTRICTS.forEach((d) => {
      if (d.id === keep || !(d.x < r.x + r.w + 12 && r.x - 12 < d.x + d.w && d.y < r.y + r.h + 12 && r.y - 12 < d.y + d.h)) return;
      K.rr(d.x - 1, d.y - 1, d.w + 2, d.h + 2, 25); g.save(); g.fillStyle = K.rgba(C.page, 0.97 * k); g.fill(); g.restore();
    });
  }

  /** how long a one-line label may be, measured in this label's own characters, plus the longest leading run of its
   *  words that fits (not ending on '&', 'and'...), as a ready-made suggestion */
  function oneLineHint(label, w, width) {
    const per = width(label, F_MOD) / Math.max(1, label.length);
    const n = Math.floor(w / per);
    const words = label.split(' ');
    // prefer a cut at a phrase boundary (before '&' / 'and' / 'of'..., or after a comma), then any cut
    const cut = (k) => { const s = words.slice(0, k); while (s.length && DANGLING.has(s[s.length - 1].toLowerCase().replace(/,$/, ''))) s.pop(); return s.join(' ').replace(/,$/, ''); };
    const boundary = (k) => DANGLING.has(words[k].toLowerCase()) || /,$/.test(words[k - 1]);
    let fit = '';
    for (const strict of [true, false]) {
      for (let k = words.length - 1; k >= 1 && !fit; k--) {
        if (strict && !boundary(k)) continue;
        const cand = cut(k);
        if (cand && width(cand, F_MOD) <= w) fit = cand;
      }
      if (fit) break;
    }
    return `a <!-- map: ... --> label of at most ~${n} characters keeps it on one` + (fit ? ` (for example <!-- map: ${fit} -->)` : '');
  }

  // ------------------------------------------------------------------ audit (tools/course.py check runs this in a browser)
  /** lay the current course out and report what does not fit: { errors, warnings, wrapped, summary } */
  function audit() {
    const data = course();
    cache.delete(data);
    const L = lay();
    const errors = [], warnings = [], wrapped = [];
    if (!fontsOk()) warnings.push('the course fonts were not loaded, so the measurements used fallback faces');
    const width = (s, f) => measuring(() => K.measure(s, f));
    const N = L.DISTRICTS.length;
    if (N < 4 || N > 7) errors.push(`${N} districts: the map is laid out for 4 to 7`);
    // the Start and the Finish are one circle each, showing one module number
    (data.districts || []).filter((r) => r.kind === 'start' || r.kind === 'finish').forEach((r) => {
      const mods = r.modules || r.mods || [];
      if (mods.length !== 1) errors.push(`the ${r.kind} must hold exactly one module (the map draws one circle with one number); it holds ${mods.join(' ') || 'none'}`);
    });
    L.DISTRICTS.forEach((d) => {
      if (d.mods.length > 5) errors.push(`district "${d.name}" has ${d.mods.length} modules; at most 5 fit`);
      d.lines.name.forEach((ln) => { const w = width(ln, F_NAME); if (w > d.w - 72 + 0.5) errors.push(`district name "${d.name}" does not fit its card (${Math.ceil(w)} px of ${d.w - 72}); shorten the name`); });
      if (d.lines.name.length > 1) warnings.push(`district name "${d.name}" wraps to two lines`);
      d.lines.q.forEach((ln) => { const w = width(ln, F_Q); if (w > d.w - 72 + 0.5) errors.push(`the question of "${d.name}" ("${d.q}") is too long for its card; shorten it`); });
      if (d.lines.q.length > 1) wrapped.push(`question of ${d.name}`);
      d.mods.forEach((m) => {
        const r = d.rows[m];
        r.lines.forEach((ln) => {
          const w = width(ln, F_MOD);
          if (w > d.labelW + 0.5) errors.push(`module ${m} label "${L.MODULES[m]}" is too long for the map (${Math.ceil(w)} px of ${d.labelW} on a line); give it a short label: ## Module ${m} — ${L.FULL[m]} <!-- map: Short name -->`);
        });
        if (r.lines.length > 1) { wrapped.push(`module ${m}`); warnings.push(`module ${m} label "${L.MODULES[m]}" wraps to two lines on the map (${Math.ceil(width(L.MODULES[m], F_MOD))} px; a line holds ${Math.floor(d.labelW)}): ${oneLineHint(L.MODULES[m], d.labelW, width)}`); }
      });
      if (d.x < SAFE.x0 || d.x + d.w > SAFE.x1) errors.push(`district "${d.name}" runs outside the safe area horizontally`);
      if (d.y + d.h > FRAME.bottom + 0.5) errors.push(`district "${d.name}" runs below y ${FRAME.bottom} (bottom ${Math.round(d.y + d.h)}): too many wrapped lines or modules in its row`);
    });
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
      const a = L.DISTRICTS[i], b = L.DISTRICTS[j];
      if (a.x < b.x + b.w + 8 && b.x < a.x + a.w + 8 && a.y < b.y + b.h + 8 && b.y < a.y + a.h + 8) errors.push(`districts "${a.name}" and "${b.name}" overlap`);
    }
    const lw = width(L.LANTERNS.name + ' · AI', { size: TYPE.aiEyebrow, weight: 600, tracking: 3, upper: true, font: 'ui' }) + 24 + width(L.LANTERNS.q, { size: TYPE.aiQ, font: 'ui' });
    if (L.LANTERNS.x0 + lw > L.X1) errors.push('the Lanterns label row is wider than the map');
    if (L.LANTERNS.y - 40 < 110) errors.push('the lantern string reaches the badge band (y < 110)');
    [L.GATE, L.END].forEach((p) => { if (p.y + 86 > SAFE.y1) errors.push(`the ${p.label} label runs below y ${SAFE.y1}`); });
    if (Math.abs(L.END.y - L.GATE.y) < 140) errors.push('the Start and the Finish circles are too close');
    if (L.over > 0) errors.push(`the two rows of districts are ${Math.ceil(L.over)} px too tall for the safe area`);
    if (L.compact) warnings.push('the map uses its compact rhythm (tighter rows) to fit');
    return {
      errors, warnings, wrapped,
      summary: { districts: N, rows: [L.DISTRICTS.filter((d) => d.row === 0).length, L.DISTRICTS.filter((d) => d.row === 1).length],
        widths: L.DISTRICTS.map((d) => d.w), rowsY: [[L.top, L.DISTRICTS.find((d) => d.row === 0)?.h], [L.bot, L.DISTRICTS.find((d) => d.row === 1)?.h]],
        compact: L.compact, x1: L.X1, offset: L.off, gate: [L.GATE.x, Math.round(L.GATE.y)], end: [L.END.x, Math.round(L.END.y)] },
    };
  }

  // ------------------------------------------------------------------ the API (v1 names first)
  const api = {
    TYPE, draw, lantern, chipPos, districtOf, lanternAt, district,
    intro, hereCard, resolve, pinAt, audit,
    lesson: lessonOf, here,
    /** switch the course data the map draws (tests, scenes comparing two maps); returns K.map. use(null) = window.COURSE */
    use(data) { active = data || null; return api; },
    course,
    layout: () => lay(),
  };
  const live = { MODULES: 'MODULES', DISTRICTS: 'DISTRICTS', LANTERNS: 'LANTERNS', GATE: 'GATE', END: 'END', ROW: 'ROW', PATH: 'PATH' };
  Object.entries(live).forEach(([k, f]) => Object.defineProperty(api, k, { get: () => lay()[f], enumerable: true }));
  K.map = api;
})();
