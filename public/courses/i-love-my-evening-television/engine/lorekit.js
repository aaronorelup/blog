/* I Love My Evening Television: lorekit.js (course C-02)
   The lore course's layer over the Hidden Curriculum's kit (kit.js and runtime.js are C-01's, verbatim).
     1. re-skins the kit: dark glass, the #FFC870 cursor warmth, each episode's own palette (course.json)
     2. L  reads the lore at draw time: window.LORE (the published lore) and window.COURSE_CFG (course.json)
     3. tier drawing: marks, lines and chips in each tier's style; shape and line style carry the tier, never colour alone
     4. LS scene templates: title, tiers, timeline, lifeline, sheet, episode, egg, eggatlas, thread, questions, steel, end.
        A template draws from the lore when the frame is drawn, so a changed fact redraws the picture with no new
        narration; only the spoken words are fixed (cues.js). The claim being spoken lights what it cites, and a claim
        whose tier moved since it was voiced is shown as moved ("now Steel, was Open") instead of silently disagreeing.
   Same contract as kit.js: every frame is a pure function of time (no Date.now, no Math.random, no carried state;
   layouts that do not depend on time are computed once and reused).
   Legibility: the canvas is 1920x1080 and is watched on phones. Words meant to be read are 30 px or more; sources and
   years 24 px; nothing that matters is under 22 px. y 940-1080 is the caption band: keep it clear. */
(function () {
  'use strict';
  const K = window.K, C = K.C, F = K.F, W = K.W, H = K.H;
  const CFG = window.COURSE_CFG || { tiers: {}, episodes: {} };
  const D = window.LORE || { episodes: [], characters: [], things: [], world: [], timeline_docs: [], timeline: [], eggs: [], threads: [], questions: [] };

  // ---------- 1. the series' look ----------
  Object.assign(C, {
    page: '#0A0B10', panel: '#11131B', tile: '#151823', hover: '#1B1F2C', code: '#10121A',
    head: '#FFC870', strong: '#F2E7D5', body: '#C9C3B6', soft: '#9A978F', quiet: '#6F6D68',
    line: '#232733', line2: '#363B4A', accent: '#FFC870', gold: '#FFC870',
  });
  // Georgia's metrics, everywhere: Gelasio is metric-compatible with Georgia and loads as a web font, so a phone, a
  // laptop and the headless renderer set every title on the same widths
  F.head = 'Gelasio, Georgia, "Times New Roman", serif';
  F.read = 'Gelasio, Georgia, "Times New Roman", serif';
  const baseFonts = K.fontsReady;
  K.fontsReady = async () => {
    const faces = ['400 40px Gelasio', '500 40px Gelasio', '600 40px Gelasio', 'italic 400 40px Gelasio'];
    try { await Promise.race([Promise.all(faces.map((f) => document.fonts.load(f))), new Promise((r) => setTimeout(r, 8000))]); } catch (e) { /* system serif */ }
    await baseFonts();
  };
  const g = () => K.ctx();

  // ---------- 2. the lore ----------
  const L = {};
  const DOC_TITLES = { eggs: 'Easter eggs', threads: 'Threads', questions: 'Open questions' };
  const docs = ['eggs', 'threads', 'questions'].filter((k) => (D[k] || []).length).map((k) => ({
    id: k, title: DOC_TITLES[k], group: k, episodes: [], images: [], file: (D[k].flatMap((s) => s.bullets)[0] || {}).file, line: 1,
    sections: D[k].map((s) => ({ title: s.title, bullets: s.bullets })),
  }));
  const ents = [...D.episodes, ...D.characters, ...D.things, ...(D.world || []), ...(D.timeline_docs || []), ...docs];
  const byId = Object.fromEntries(ents.filter((e) => e.id).map((e) => [e.id, e]));
  const RANK = { steel: 0, fact: 1, egg: 2, running: 3, idea: 4, open: 5 };
  const TIER_ORDER = ['steel', 'fact', 'egg', 'running', 'idea', 'open'];
  L.data = D;
  L.get = (id) => byId[id];
  L.bullets = (e) => (e ? e.sections.flatMap((s) => s.bullets) : []);
  L.tier = (t) => CFG.tiers[t] || { label: t || '', color: C.soft, line: 'solid' };
  L.weakest = (...ts) => ts.filter(Boolean).sort((a, b) => (RANK[b] ?? 9) - (RANK[a] ?? 9))[0];
  L.strongest = (...ts) => ts.filter(Boolean).sort((a, b) => (RANK[a] ?? 9) - (RANK[b] ?? 9))[0];
  L.ep = (code) => byId[code];
  L.eps = () => D.episodes.filter((e) => /^E\d+$/.test(e.id));
  L.epc = (code, k = 'accent') => (CFG.episodes[code] || {})[k] || C.soft;
  L.released = (code) => { const e = byId[code]; return !e || e.released !== false; };
  L.key = (b) => (b ? `${b.file}:${b.line}` : '');
  /** the episode a bullet belongs to: its own code, else the first one its source names */
  L.bep = (b) => (b && (b.ep || ((/\bE\d+\b/.exec(b.src || '') || [])[0]))) || null;
  /** lore text for the screen: @ids become names, code marks and emphasis marks go */
  L.plain = (s) => String(s || '').replace(/@([A-Za-z0-9][A-Za-z0-9-]*)\s*\(([^()]*)\)/g, (m, id, p) => (byId[id] && (p.includes(byId[id].title) || byId[id].title.includes(p)) ? `@${id}` : m))
    .replace(/@([A-Za-z0-9][A-Za-z0-9-]*)/g, (m, id) => (byId[id] ? byId[id].title : id)).replace(/`/g, '').replace(/\*([^*]+)\*/g, '$1')
    .replace(/"([^"]*)"/g, '\u201C$1\u201D').replace(/(\w)'(\w)/g, '$1\u2019$2').replace(/\s+/g, ' ').trim();
  /** a citation {id, q} -> what it points at in the CURRENT lore: {entity, tier, text, src, year, refs, file, line} */
  L.resolve = (cite) => {
    const e = byId[cite.id];
    if (!e) return null;
    if (cite.q && ['year', 'born', 'died'].includes(cite.q)) {
      const d = e[cite.q];
      return d ? { entity: e, key: cite.q, tier: d.tier, text: `${e.title}: ${cite.q} ${d.year ? d.year.text : ''}`, src: d.src, year: d.year, refs: [], file: e.file, line: (e.header_lines || {})[cite.q] || e.line } : null;
    }
    if (!cite.q) return { entity: e, tier: null, text: e.title, src: null, refs: [], file: e.file, line: e.line };
    const q = cite.q.toLowerCase();
    const hits = L.bullets(e).filter((b) => b.text.toLowerCase().includes(q));
    return hits.length === 1 ? { entity: e, ...hits[0] } : null;
  };
  /** the claims of the section being drawn, each resolved against the current lore */
  const claimCache = new Map();
  L.claims = (S) => {
    if (claimCache.has(S.n)) return claimCache.get(S.n);
    const sec = ((window.__timeline || {}).sections || []).find((s) => s.n === S.n) || {};
    const out = (sec.claims || []).map((c) => {
      const b = L.resolve(c.cite);
      const tier = b ? b.tier : null;
      return { ...c, b, tier, moved: !!(b && c.voicedTier && tier !== c.voicedTier), local: c.start - sec.start, localEnd: c.end - sec.start };
    });
    claimCache.set(S.n, out);
    return out;
  };
  /** the claim being spoken at local time t (or null) */
  L.now = (S, t) => L.claims(S).filter((c) => t >= c.local - 0.15 && t < c.localEnd + 0.6).pop() || null;
  /** 0..1: is bullet b being spoken now (an envelope around its clause) */
  L.lit = (S, t, b) => {
    if (!b) return 0;
    const k = L.key(b);
    return L.claims(S).reduce((m, c) => (c.b && L.key(c.b) === k ? Math.max(m, K.env(t, c.local - 0.15, c.localEnd + 0.5, 0.3)) : m), 0);
  };
  /** local time bullet b is first spoken in this scene, or Infinity */
  L.saidAt = (S, b) => { const k = L.key(b); const c = L.claims(S).find((x) => x.b && L.key(x.b) === k); return c ? c.local : Infinity; };
  L.cited = (S) => L.claims(S).filter((c) => c.b && c.b.line != null);
  /** age of a person at an episode: {min, max, tier}. Its tier is the weakest of the two dates it is computed from,
   *  except that a birth on screen plus an on-screen line of the person's own dated exactly at that night (Rosie:
   *  born Y-9, and "Y0 [fact] her brother paints along...") makes the age on screen too */
  L.age = (person, epCode) => {
    const b = person && person.born, e = L.ep(epCode);
    if (!b || !b.year || !e || !e.year || !e.year.year) return null;
    const both = [b.tier, e.year.tier];
    let tier = both.every((x) => x === 'steel' || x === 'fact') && both.includes('steel') ? 'steel' : L.weakest(...both);
    const ey = e.year.year;
    if (RANK[b.tier] <= 1 && ey.min === ey.max && L.bullets(person).some((x) => x.year && x.year.min === ey.min && x.year.max === ey.max && !x.year.approx && RANK[x.tier] <= 1)) tier = L.strongest(tier, 'fact');
    return { min: ey.min - b.year.max, max: ey.max - b.year.min, approx: b.year.approx || ey.approx, tier };
  };
  L.ageText = (a) => (!a ? '' : a.min === a.max ? `${a.approx ? 'about ' : ''}${a.min}` : `${a.min}–${a.max}`);
  L.stamp = () => (window.LORE_STAMP ? `drawn from the lore of ${window.LORE_STAMP.date} · ${window.LORE_STAMP.hash}` : '');
  /** how many lines of each tier an entity (or a list of bullets) holds */
  L.counts = (bs) => { const n = Object.fromEntries(TIER_ORDER.map((t) => [t, 0])); bs.forEach((b) => { if (n[b.tier] != null) n[b.tier]++; }); return n; };
  /** the picture of an image ref, if loaded */
  L.pic = (im) => (im ? K.img[im.ref.replace(/^media\//, '').replace(/\.\w+$/, '')] : null);
  L.pics = (e) => (e ? e.images.filter((im) => L.pic(im)) : []);
  const memo = (fn) => { let v; let done = false; return () => (done ? v : (v = fn(), done = true, v)); };

  // ---------- 3. tiers on the canvas ----------
  const dashOf = (style, w) => ({ dashed: [w * 4, w * 3], dotted: [w * 0.8, w * 2.6] }[style] || []);
  /** a line in a tier's style; k = 0..1 draws it from (x1,y1) towards (x2,y2) */
  L.tline = (x1, y1, x2, y2, tier, o = {}) => {
    const T = L.tier(tier), w = o.w || 4, k = o.k ?? 1;
    if (k <= 0) return;
    const xe = x1 + (x2 - x1) * k, ye = y1 + (y2 - y1) * k, c = g();
    c.save(); c.globalAlpha *= o.alpha ?? 1; c.strokeStyle = o.color || T.color; c.lineCap = 'round'; c.lineWidth = w;
    if (T.line === 'double') {
      const dx = x2 - x1, dy = y2 - y1, n = Math.hypot(dx, dy) || 1, ox = (-dy / n) * w * 0.9, oy = (dx / n) * w * 0.9;
      c.lineWidth = w * 0.55;
      [1, -1].forEach((s) => { c.beginPath(); c.moveTo(x1 + ox * s, y1 + oy * s); c.lineTo(xe + ox * s, ye + oy * s); c.stroke(); });
    } else {
      c.setLineDash(dashOf(T.line === 'hollow' || T.line === 'egg' ? 'dashed' : T.line, w));
      c.beginPath(); c.moveTo(x1, y1); c.lineTo(xe, ye); c.stroke();
    }
    c.restore();
  };
  /** a mark in a tier's style: steel = ringed solid, fact = solid, egg = an egg, running = dashed ring,
   *  idea = dotted ring, open = hollow ring with a question mark */
  L.tdot = (x, y, r, tier, o = {}) => {
    const T = L.tier(tier), c = g(), col = o.color || T.color;
    c.save(); c.globalAlpha *= o.alpha ?? 1; c.lineWidth = Math.max(2, r * 0.22); c.strokeStyle = col; c.fillStyle = col;
    if (o.glow) { c.shadowColor = K.rgba(col, 0.8 * o.glow); c.shadowBlur = r * 2.4; }
    const ring = (dash, fill) => { c.setLineDash(dash); c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); if (fill) { c.fillStyle = fill; c.fill(); } c.stroke(); };
    if (T.line === 'double') { c.beginPath(); c.arc(x, y, r * 0.58, 0, Math.PI * 2); c.fill(); ring([], null); }
    else if (T.line === 'solid') { c.beginPath(); c.arc(x, y, r * 0.8, 0, Math.PI * 2); c.fill(); }
    else if (T.line === 'egg') { c.beginPath(); c.ellipse(x, y + r * 0.08, r * 0.62, r * 0.84, 0, 0, Math.PI * 2); c.fill(); }
    else if (T.line === 'dashed') ring([r * 0.5, r * 0.36], K.rgba(col, 0.18));
    else if (T.line === 'dotted') ring([r * 0.12, r * 0.42], K.rgba(col, 0.12));
    else { ring([], K.rgba(C.page, 0.9)); c.shadowBlur = 0; K.text('?', x, y + r * 0.42, { font: 'mono', size: r * 1.2, weight: 700, color: col, align: 'center' }); }
    c.restore();
  };
  /** a tier chip: [mark LABEL] then the source in mono; returns its width. o.align left|center|right */
  L.chip = (tier, x, y, o = {}) => {
    if (!tier) return 0;
    const T = L.tier(tier), size = o.size || 24, label = (o.label || T.label).toUpperCase();
    const lw = K.measure(label, { font: 'ui', weight: 700, size, tracking: 2.2 });
    let src = o.src ? String(o.src) : '';
    if (src.length > (o.maxSrc || 34)) src = src.slice(0, (o.maxSrc || 34) - 1).trimEnd() + '…';
    const sw = src ? K.measure(src, { font: 'mono', size: size * 0.92 }) + size * 0.9 : 0;
    const h = size * 1.75, w = size * 2.1 + lw + size * 0.9 + sw;
    const x0 = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
    if (o.measure) return w;
    K.layer(o.alpha ?? 1, () => {
      K.card(x0, y - h / 2, w, h, { r: h / 2, fill: 'rgba(10,11,16,.86)', stroke: K.rgba(T.color, 0.7), shadow: false, lw: 1.8, glow: o.glow });
      L.tdot(x0 + size * 1.0, y, size * 0.42, tier);
      K.text(label, x0 + size * 1.75, y + size * 0.36, { font: 'ui', weight: 700, size, tracking: 2.2, color: T.color });
      if (src) K.text(src, x0 + size * 1.75 + lw + size * 0.8, y + size * 0.34, { font: 'mono', size: size * 0.92, color: C.soft });
    });
    return w;
  };
  /** the six tiers in one row */
  L.legend = (x, y, o = {}) => {
    const size = o.size || 18, ws = TIER_ORDER.map((t) => L.chip(t, 0, 0, { size, measure: true }));
    let cx = o.align === 'right' ? x - ws.reduce((a, b) => a + b + 10, -10) : o.align === 'center' ? x - ws.reduce((a, b) => a + b + 10, -10) / 2 : x;
    TIER_ORDER.forEach((t, i) => {
      const a = (o.alpha ?? 1) * (o.t != null ? K.stagger(o.t, o.at || 0, i, 0.08) : 1);
      cx += L.chip(t, cx, y, { size, alpha: a * (o.dim && o.dim !== t ? 0.4 : 1) }) + 10;
    });
  };
  /** dark glass: the ground, a warm window glow, a sheen and faint scanlines (broadcast texture) */
  L.bg = (t, o = {}) => {
    K.bg({ fill: o.ground || C.page, glowX: o.glowX ?? W * 0.16, glowY: o.glowY ?? H * 0.05, glow: o.glow ?? 0.075, grain: 0.05 });
    const c = g();
    c.save();
    if (o.tint) { c.fillStyle = K.rgba(o.tint, o.tintA ?? 0.06); c.fillRect(0, 0, W, H); }
    const sh = c.createLinearGradient(0, 0, W, H);
    sh.addColorStop(0, 'rgba(255,255,255,0.035)'); sh.addColorStop(0.42, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(255,255,255,0.015)');
    c.fillStyle = sh; c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(0,0,0,0.13)';
    for (let y = 0; y < H; y += 4) c.fillRect(0, y, W, 1);
    c.restore();
  };
  /** the cursor: a #FFC870 block blinking at 530 ms (Episode 3's), the course's "someone is in there" mark */
  L.cursor = (x, y, t, o = {}) => {
    const on = Math.floor(t / 0.53) % 2 === 0 || o.solid;
    if (!on) return;
    const c = g(); c.save(); c.globalAlpha *= o.alpha ?? 1; c.shadowColor = 'rgba(255,200,112,.75)'; c.shadowBlur = 18;
    c.fillStyle = '#FFC870'; c.fillRect(x, y - (o.h || 34), o.w || 16, o.h || 34); c.restore();
  };
  /** wrapped text, at most o.max lines (the last one ends in … when cut); returns the height used */
  L.textBox = (s, x, y, w, o = {}) => {
    const size = o.size || 30, lh = o.lh || Math.round(size * 1.3), font = { font: o.font || 'ui', size, weight: o.weight, italic: o.italic, tracking: o.tracking };
    let lines = K.wrap(L.plain(s), w, font);
    if (o.max && lines.length > o.max) {
      lines = lines.slice(0, o.max);
      let last = lines[o.max - 1];
      while (last.length > 1 && K.measure(last + '…', font) > w) last = last.slice(0, -1).trimEnd();
      lines[o.max - 1] = last.replace(/[,;:.]$/, '') + '…';
    }
    if (!o.measure) lines.forEach((ln, i) => K.text(ln, x, y + i * lh, { ...font, color: o.color || C.body, alpha: o.alpha, align: o.align }));
    return lines.length * lh;
  };
  L.lines = (s, w, o = {}) => K.wrap(L.plain(s), w, { font: o.font || 'ui', size: o.size || 30, weight: o.weight, italic: o.italic });
  /** an episode chip "E2 Earthlight" in its palette; returns the width */
  L.epChip = (code, x, y, o = {}) => {
    const e = L.ep(code); if (!e) return 0;
    const size = o.size || 24, label = o.short ? code : `${code}  ${e.title}`;
    const w = K.measure(label, { font: 'ui', weight: 700, size }) + size * 1.4 + (e.released === false && !o.short ? K.measure(' · not released', { font: 'ui', size: size * 0.8 }) : 0);
    if (o.measure) return w;
    const col = L.epc(code), h = size * 1.7;
    K.layer(o.alpha ?? 1, () => {
      K.card(x, y - h / 2, w, h, { r: h / 2, fill: K.rgba(L.epc(code, 'ground'), 0.95), stroke: K.rgba(col, 0.55 + 0.45 * (o.hl || 0)), shadow: false, lw: 1.6, glow: o.hl });
      const tw = K.text(label, x + size * 0.7, y + size * 0.36, { font: 'ui', weight: 700, size, color: col });
      if (e.released === false && !o.short) K.text(' · not released', x + size * 0.7 + tw, y + size * 0.34, { font: 'ui', size: size * 0.8, color: C.soft });
    });
    return w;
  };
  /** an evidence card: a picture from the lore ([used] on screen, [steel] canon, [placeholder]) with its badge and source */
  L.card = (im, x, y, w, h, o = {}) => {
    const pic = L.pic(im);
    if (!pic) return;
    const a = o.alpha ?? 1;
    if (a <= 0) return;
    K.layer(a, () => K.at(x + w / 2, y + h / 2, o.scale ?? 1, o.rot || 0, () => {
      g().translate(-x - w / 2, -y - h / 2);
      const capH = o.caption === false ? 0 : 58;
      K.card(x - 10, y - 10, w + 20, h + 20 + capH, { r: 16, fill: 'rgba(14,16,23,.94)', stroke: K.rgba(o.color || C.strong, 0.2 + 0.5 * (o.hl || 0)), glow: o.hl });
      const c = g(); c.save(); K.rr(x, y, w, h, 8); c.clip();
      const s = o.contain ? Math.min(w / pic.width, h / pic.height) : Math.max(w / pic.width, h / pic.height);
      if (o.contain) { c.fillStyle = '#05060A'; c.fillRect(x, y, w, h); }
      c.drawImage(pic, x + (w - pic.width * s) / 2, y + (h - pic.height * s) / 2, pic.width * s, pic.height * s); c.restore();
      if (o.caption !== false) {
        const tag = im.status === 'used' ? 'fact' : im.status === 'steel' ? 'steel' : 'idea';
        L.chip(tag, x, y + h + 34, { size: 20, label: im.status === 'used' ? 'on screen' : im.status === 'steel' ? 'steel' : 'placeholder', src: im.src || '', maxSrc: Math.max(8, Math.floor((w - 150) / 12)) });
      }
      if (im.status === 'placeholder') {
        K.card(x + 12, y + 12, 210, 38, { r: 8, fill: 'rgba(185,163,227,.92)', stroke: false, shadow: false });
        K.text('PLACEHOLDER', x + 117, y + 39, { font: 'ui', weight: 700, size: 20, tracking: 2, color: '#0A0B10', align: 'center' });
      }
      const ep = (/E\d+/.exec(im.src || '') || [])[0];
      if (ep && !L.released(ep)) {
        const tw = K.measure('NOT RELEASED YET', { font: 'ui', weight: 700, size: 18, tracking: 2 }) + 24;
        K.card(x + w - tw - 10, y + 10, tw, 34, { r: 8, fill: K.rgba(L.epc(ep), 0.92), stroke: false, shadow: false });
        K.text('NOT RELEASED YET', x + w - tw / 2 - 10, y + 33, { font: 'ui', weight: 700, size: 18, tracking: 2, color: '#0A0B10', align: 'center' });
      }
    }));
  };
  /** the box of a picture fitted inside (w, h) keeping its shape */
  L.fit = (im, w, h) => { const p = L.pic(im); if (!p) return [w, h]; const s = Math.min(w / p.width, h / p.height); return [Math.round(p.width * s), Math.round(p.height * s)]; };

  /** scene furniture shared by every template: eyebrow + title (with the cursor) top left, the claim being spoken top
   *  right, the legend and the lore stamp at the very bottom */
  L.head = (t, S, o = {}) => {
    const a = K.io(t, (o.at ?? -0.3), 0.7, 'out');
    K.layer(a, () => {
      const y0 = o.y ?? 228;
      if (o.eyebrow) K.eyebrow(o.eyebrow, 80, y0 - 80, { color: o.eyeColor || C.soft, size: 24, tracking: 4 });
      const size = o.size || 68, title = o.title ?? S.title;
      const tw = K.text(title, 78, y0, { font: 'head', size, weight: 400, color: C.strong, tracking: -0.5, maxW: o.maxW });
      if (o.cursor !== false) L.cursor(86 + Math.min(tw, o.maxW || 1e9), y0, t, { h: size * 0.72, w: size * 0.3 });
    });
  };
  L.foot = (t, S, o = {}) => {
    const cur = L.now(S, t);
    // the line being spoken, when the scene has nowhere to light it (S.placed: the lines the template drew)
    if (cur && cur.b && cur.b.line != null && S.placed && !S.placed.has(L.key(cur.b)) && o.callout !== false) {
      const a = K.env(t, cur.local - 0.15, cur.localEnd + 0.5, 0.3), [cx, cy, cw] = o.calloutAt || [360, 806, 1200];
      K.layer(a, () => {
        const h = L.lineCard(cur.b, 0, 0, cw, { measure: true, size: 30, max: 3 });
        K.card(cx - 24, cy - 24, cw + 48, h + 48, { r: 26, fill: 'rgba(6,7,12,.78)', stroke: false, shadow: true });
        L.lineCard(cur.b, cx, cy, cw, { hl: 1, size: 30, max: 3 });
      });
    }
    if (cur && cur.tier && o.chip !== false) {
      const a = K.env(t, cur.local - 0.15, cur.localEnd + 0.6, 0.25);
      L.chip(cur.tier, W - 60, 66, { size: 26, align: 'right', maxSrc: 30, src: cur.b && cur.b.src, alpha: a, glow: cur.moved ? 1 : 0,
        label: cur.moved ? `now ${L.tier(cur.tier).label} (was ${L.tier(cur.voicedTier).label})` : undefined });
    }
    if (o.legend !== false) L.legend(W - 60, 1046, { t, at: 0.4, size: 16, dim: cur && cur.tier, align: 'right', alpha: 0.85 });
    K.text(L.stamp(), 80, 1052, { font: 'mono', size: 15, color: C.quiet });
  };

  /** a warped axis through the given years: an empty stretch longer than maxGap years is drawn as `cap` years with a
   *  break, so sixty quiet years don't squeeze four episodes into one corner */
  L.axis = (years, X0, X1, o = {}) => {
    const maxGap = o.maxGap ?? 12, cap = o.cap ?? 7, pad = o.pad ?? 4;
    const ks = [...new Set(years.filter((y) => Number.isFinite(y)))].sort((a, b) => a - b);
    const lo = ks[0] - pad, hi = ks[ks.length - 1] + pad, keys = [lo, ...ks, hi];
    const segs = [], breaks = [];
    let acc = 0;
    for (let i = 0; i + 1 < keys.length; i++) {
      const d = keys[i + 1] - keys[i], w = d > maxGap ? cap : d;
      if (d > maxGap) breaks.push([keys[i], keys[i + 1]]);
      segs.push({ a: keys[i], b: keys[i + 1], from: acc, w }); acc += w;
    }
    const x = (y) => {
      const s = segs.find((q) => y >= q.a && y <= q.b) || (y < lo ? segs[0] : segs[segs.length - 1]);
      return X0 + ((s.from + ((y - s.a) / (s.b - s.a || 1)) * s.w) / acc) * (X1 - X0);
    };
    const ticks = [];
    ks.forEach((y) => { if (!ticks.length || x(y) - x(ticks[ticks.length - 1]) > (o.tickGap || 90) || y === 0) ticks.push(y); });
    return { x, lo, hi, X0, X1, breaks, ticks };
  };
  L.drawAxis = (ax, AY, t, o = {}) => {
    const ka = K.io(t, o.at ?? 0, 1.4, 'io');
    L.tline(ax.X0 - 30, AY, ax.X1 + 30, AY, 'fact', { w: 2.5, color: C.line2, k: ka });
    ax.breaks.forEach(([a0, a1]) => K.layer(K.io(t, (o.at ?? 0) + 1.0, 0.5), () => {
      const xm = (ax.x(a0) + ax.x(a1)) / 2, c = g();
      c.save(); c.fillStyle = C.page; c.fillRect(xm - 16, AY - 14, 32, 28); c.strokeStyle = C.soft; c.lineWidth = 2.5;
      [-8, 8].forEach((d) => { c.beginPath(); c.moveTo(xm + d - 6, AY + 13); c.lineTo(xm + d + 6, AY - 13); c.stroke(); }); c.restore();
      K.text(`${a1 - a0} years`, xm, AY + (o.breakBelow ? 44 : -24), { font: 'mono', size: 20, color: C.soft, align: 'center' });
    }));
    ax.ticks.forEach((y) => {
      const a = K.io(t, (o.at ?? 0) + 0.2 + ((ax.x(y) - ax.X0) / (ax.X1 - ax.X0)) * 1.2, 0.5);
      K.layer(a, () => {
        g().fillStyle = C.line2; g().fillRect(ax.x(y) - 1.5, AY - 9, 3, 18);
        const lab = y === 0 ? 'Y0' : `Y${y > 0 ? '+' : ''}${y}`;
        K.text(lab, ax.x(y), AY + (o.tickY ?? 42), { font: 'mono', size: 24, weight: y === 0 ? 700 : 400, color: y === 0 ? C.strong : C.soft, align: 'center' });
      });
    });
  };
  /** 1-D label layout: items {x (wanted centre), w}; returns centres that keep `gap` between labels inside [min, max] */
  L.spread = (items, min, max, gap = 12) => {
    const n = items.length, c = items.map((it) => it.x);
    for (let pass = 0; pass < 80; pass++) {
      let moved = false;
      for (let i = 0; i + 1 < n; i++) {
        const need = (items[i].w + items[i + 1].w) / 2 + gap, have = c[i + 1] - c[i];
        if (have < need - 0.5) { const d = (need - have) / 2; c[i] -= d; c[i + 1] += d; moved = true; }
      }
      for (let i = 0; i < n; i++) {
        const lo = min + items[i].w / 2, hi = max - items[i].w / 2;
        if (c[i] < lo) { c[i] = lo; moved = true; } if (c[i] > hi) { c[i] = hi; moved = true; }
      }
      if (!moved) break;
    }
    return c;
  };
  /** a lore line as a small card: tier mark, text (wrapped), source; returns its height. o.hl lights it, o.dim greys it */
  L.lineCard = (b, x, y, w, o = {}) => {
    const size = o.size || 28, max = o.max || 2, hl = o.hl || 0, pad = 18;
    const font = { font: o.font || 'ui', size, weight: o.weight };
    const lines = (() => { let ls = K.wrap(L.plain(b.text), w - 64 - pad, font); if (ls.length > max) { ls = ls.slice(0, max); let l = ls[max - 1]; while (l.length > 1 && K.measure(l + '…', font) > w - 64 - pad) l = l.slice(0, -1).trimEnd(); ls[max - 1] = l + '…'; } return ls; })();
    const lh = Math.round(size * 1.28), srcH = o.src === false || !b.src ? 0 : 30;
    const h = pad * 2 + lines.length * lh - (lh - size) + srcH + 6;
    if (o.measure) return h;
    const col = L.tier(b.tier).color;
    K.layer((o.alpha ?? 1) * (o.dim ? 0.5 : 1), () => {
      K.card(x, y, w, h, { r: 14, fill: hl ? K.rgba(C.hover, 0.98) : 'rgba(17,19,27,.9)', stroke: K.rgba(col, 0.25 + 0.65 * hl), shadow: false, lw: 1.5 + hl, glow: hl * 0.8 });
      if (b.tier === 'steel') { const c = g(); c.save(); c.fillStyle = K.rgba(col, 0.75); c.fillRect(x + 1, y + 10, 4, h - 20); c.fillRect(x + 8, y + 10, 2, h - 20); c.restore(); }
      L.tdot(x + 32, y + pad + size * 0.42, size * 0.42, b.tier, { glow: hl });
      lines.forEach((ln, i) => K.text(ln, x + 60, y + pad + size * 0.82 + i * lh, { ...font, color: hl ? C.strong : C.body }));
      if (srcH) K.text(`{${b.src.length > 48 ? b.src.slice(0, 47) + '…' : b.src}}`, x + 60, y + pad + lines.length * lh - (lh - size) + 30, { font: 'mono', size: 20, color: C.soft });
    });
    return h;
  };

  // ---------- 4. scene templates ----------
  const LS = {};
  const mentionsEp = (text) => { const m = /\bEpisode (\d+)\b|\b(E\d+)\b/.exec(text || ''); return m ? (m[2] || `E${m[1]}`) : null; };
  const notFound = (t, what) => { L.bg(t); K.text(`no ${what} in the lore`, 120, 540, { font: 'mono', size: 34, color: C.accent }); };

  /** title: the lesson's card. [scene: title @focus] (the focus's pictures fan in on the right; its episodes as chips) */
  LS.title = (o) => (t, S) => {
    const DEF = window.__lesson || {};
    const P = o.focus ? L.get(o.focus) : null;
    L.bg(t, { glow: 0.1 });
    // four nights: a thin light for each episode down the right edge, in its own colour
    L.eps().forEach((e, i) => K.layer(K.io(t, -0.4 + i * 0.15, 1.2) * 0.9, () => {
      const x = 1180 + i * 180, c = g(); c.save();
      const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, K.rgba(L.epc(e.id), 0)); gr.addColorStop(0.45, K.rgba(L.epc(e.id), 0.16)); gr.addColorStop(1, K.rgba(L.epc(e.id), 0));
      c.fillStyle = gr; c.fillRect(x, 0, 120, H); c.restore();
    }));
    K.rise(t, -0.2, () => {
      K.eyebrow(`${CFG.code || 'C-02'} · ${CFG.title || 'I Love My Evening Television'}`, 80, 250, { color: C.soft, size: 26, tracking: 4 });
      K.text(`Lesson ${DEF.id || ''}`, 80, 330, { font: 'mono', size: 40, weight: 600, color: C.head });
    });
    K.rise(t, 0.1, () => {
      const size = (DEF.title || '').length > 22 ? 104 : 132;
      const tw = K.text(DEF.title || S.title, 74, 330 + size * 1.05, { font: 'head', size, weight: 400, color: C.strong, tracking: -1.5, maxW: 1060 });
      L.cursor(86 + Math.min(tw, 1060), 330 + size * 1.05, t, { h: size * 0.7, w: size * 0.28 });
    });
    K.layer(K.io(t, 0.6, 0.8), () => L.textBox(DEF.summary || '', 80, 590, 1020, { size: 33, lh: 44, max: 4, color: C.body, font: 'read' }));
    // how the focus appears: each of its names (aka) with the episodes it is in; else the lesson's episodes
    const names = P && P.aka ? P.aka.split(';').map((x) => { const m = /^(.*?)\s*\(((?:E\d+(?:,\s*)?)+)\)\s*$/.exec(x.trim()); return m ? { name: m[1].trim(), eps: m[2].split(/,\s*/) } : null; }).filter(Boolean)
      .sort((a, b) => Number(a.eps[0].slice(1)) - Number(b.eps[0].slice(1))) : [];
    if (names.length) {
      const first = L.claims(S)[0], t0 = first ? first.local : 1.0, span = first ? Math.max(2, first.localEnd - first.local) : 4;
      let cx = 80;
      names.forEach((nm, i) => {
        const label = L.plain(nm.name), w = Math.max(K.measure(label, { font: 'mono', size: 30, weight: 600 }) + 40, nm.eps.length * 66 + 30);
        if (cx + w > 1120) return;
        const at = t0 + (i / names.length) * span, hl = K.env(t, at, at + span / names.length, 0.3);
        K.layer(K.io(t, Math.min(at, 1.2 + i * 0.2), 0.6, 'out'), () => {
          K.card(cx, 790, w, 116, { r: 16, fill: 'rgba(17,19,27,.94)', stroke: K.rgba(C.head, 0.25 + 0.6 * hl), shadow: false, glow: hl * 0.7 });
          K.text(label, cx + 20, 838, { font: 'mono', size: 30, weight: 600, color: hl ? C.strong : C.body });
          let ex = cx + 20;
          nm.eps.forEach((c) => { ex += L.epChip(c, ex, 876, { size: 20, short: true }) + 8; });
        });
        cx += w + 16;
      });
    } else {
      const eps = (DEF.eps && DEF.eps.length ? DEF.eps : P ? P.episodes : []).filter((c) => L.ep(c));
      const full = eps.reduce((a, c) => a + L.epChip(c, 0, 0, { measure: true, size: 24 }) + 14, 0) <= 1080;
      let cx = 80;
      eps.forEach((c, i) => { cx += L.epChip(c, cx, 830, { size: 24, short: !full, alpha: K.stagger(t, 1.0, i, 0.15) }) + 14; });
    }
    // the focus's pictures, stacked down the right-hand side (each keeps its shape)
    if (P) {
      const ims = L.pics(P).filter((im) => im.status !== 'placeholder').slice(0, 3);
      const boxH = Math.min(300, (800 - ims.length * 78) / Math.max(1, ims.length));
      let y = 128;
      ims.forEach((im, i) => {
        const [w, h] = L.fit(im, 600, boxH), k = K.io(t, 0.5 + i * 0.35, 0.9, 'out');
        L.card(im, 1830 - w, y, w, h, { alpha: k, scale: 0.96 + 0.04 * k + 0.02 * K.seg(t, 0, 40), caption: true });
        y += h + 78;
      });
    }
    L.foot(t, S, { legend: !!names.length });
    if (!names.length) K.layer(K.io(t, 1.4, 0.8), () => L.legend(80, 910, { size: 19 }));
  };

  /** tiers: the six marks, each with one real line from the lore. [scene: tiers @focus] picks the examples from the
   *  focus (else from the whole lore); a cited line becomes its tier's example while it is spoken */
  LS.tiers = (o) => {
    const examples = memo(() => {
      const pool = o.focus && L.get(o.focus) ? L.bullets(L.get(o.focus)) : ents.flatMap((e) => L.bullets(e));
      return Object.fromEntries(TIER_ORDER.map((tr) => [tr, pool.filter((b) => b.tier === tr && b.text.length > 30 && b.text.length < 150)[0] || pool.find((b) => b.tier === tr)]));
    });
    const totals = memo(() => L.counts(ents.flatMap((e) => L.bullets(e))));
    return (t, S) => {
      L.bg(t);
      L.head(t, S, { eyebrow: 'Every line wears one of six tiers' });
      const cited = L.cited(S), cur = L.now(S, t);
      TIER_ORDER.forEach((tr, i) => {
        const col = i % 3, row = Math.floor(i / 3), x = 80 + col * 594, y = 282 + row * 318, w = 560, h = 296;
        const T = L.tier(tr), mine = cited.filter((c) => c.tier === tr && t >= c.local - 0.15).pop();
        const b = mine ? mine.b : examples()[tr], hl = cur && cur.tier === tr ? K.env(t, cur.local - 0.15, cur.localEnd + 0.6, 0.3) : 0;
        const a = K.stagger(t, 0.2, i, 0.25, 0.7);
        K.layer(a, () => {
          K.card(x, y, w, h, { r: 22, fill: 'rgba(17,19,27,.92)', stroke: K.rgba(T.color, 0.3 + 0.6 * hl), glow: hl * 0.9, shadow: false, lw: 2 });
          L.tdot(x + 52, y + 56, 24, tr, { glow: hl });
          K.text(T.label, x + 92, y + 68, { font: 'ui', weight: 700, size: 36, color: T.color });
          K.text(String(totals()[tr]), x + w - 30, y + 68, { font: 'mono', size: 26, color: C.soft, align: 'right' });
          L.textBox(T.long, x + 30, y + 118, w - 60, { size: 24, max: 1, color: C.soft });
          if (b) {
            L.textBox(`“${b.text}”`, x + 30, y + 170, w - 60, { size: 27, lh: 36, max: 3, color: hl ? C.strong : C.body, font: 'read' });
            if (b.src) K.text(`{${b.src.length > 36 ? b.src.slice(0, 35) + '…' : b.src}}`, x + 30, y + h - 22, { font: 'mono', size: 20, color: C.quiet });
          }
        });
      });
      L.foot(t, S, { legend: false });
    };
  };

  /** timeline: the whole series on one warped axis: every episode in the tier of its placement, every dated line as a
   *  mark. [scene: timeline @focus tier=steel,fact eps=E1,E2] filters the marks */
  LS.timeline = (o) => {
    const data = memo(() => {
      let bs = (D.timeline || []).slice();
      if (o.focus) { const P = L.get(o.focus); const nm = P ? new RegExp(`\\b${P.title.split(' ')[0]}\\b`, 'i') : null; bs = bs.filter((b) => b.entity === o.focus || (b.refs || []).includes(o.focus) || (nm && nm.test(b.text))); }
      if (o.tier) bs = bs.filter((b) => [].concat(o.tier).includes(b.tier));
      if (o.eps) bs = bs.filter((b) => [].concat(o.eps).includes(L.bep(b)));
      const eps = L.eps().filter((e) => e.year && e.year.year);
      const ax = L.axis([0, ...eps.flatMap((e) => [e.year.year.min, e.year.year.max]), ...bs.map((b) => b.year.min), ...bs.map((b) => b.year.max)], 170, 1750, { maxGap: 10, cap: 6, tickGap: 80 });
      // a stack of marks per year: the stronger tiers nearest the axis
      const stacks = {};
      bs.slice().sort((a, b) => (RANK[a.tier] - RANK[b.tier])).forEach((b) => { const k = Math.round(ax.x((b.year.min + b.year.max) / 2) / 26); (stacks[k] = stacks[k] || []).push(b); });
      const pos = new Map();
      Object.values(stacks).forEach((st) => st.forEach((b, i) => pos.set(L.key(b), { x: ax.x((b.year.min + b.year.max) / 2), i })));
      return { bs, eps, ax, pos };
    });
    return (t, S) => {
      const { bs, eps, ax, pos } = data();
      L.bg(t);
      L.head(t, S, { eyebrow: o.focus && L.get(o.focus) ? `${L.get(o.focus).title} on the axis` : 'Every night on one axis' });
      const AY = 668, cur = L.now(S, t);
      L.drawAxis(ax, AY, t, { at: 0.1 });
      // episodes: a point or a span in their placement's tier, label above
      const lab = L.spread(eps.map((e) => ({ x: ax.x((e.year.year.min + e.year.year.max) / 2), w: Math.max(K.measure(`${e.id} ${e.title}`, { font: 'ui', weight: 700, size: 30 }), K.measure(`${e.year.year.text}${e.released === false ? ' · not released' : ''}`, { font: 'mono', size: 21 })) + 56 })), 60, W - 60, 18);
      eps.forEach((e, i) => {
        const y0 = e.year.year.min, y1 = e.year.year.max, x0 = ax.x(y0), x1 = ax.x(y1), cx = (x0 + x1) / 2, col = L.epc(e.id);
        const hl = cur && cur.b && cur.b.entity === e && cur.b.key === 'year' ? K.env(t, cur.local - 0.15, cur.localEnd + 0.6, 0.3) : 0;
        K.layer(K.io(t, 0.8 + i * 0.2, 0.6, 'out'), () => {
          if (y1 > y0) { const c = g(); c.save(); c.fillStyle = K.rgba(col, 0.14 + 0.2 * hl); c.fillRect(x0, AY - 26, x1 - x0, 52); c.strokeStyle = K.rgba(col, 0.75); c.setLineDash([6, 6]); c.lineWidth = 2; c.strokeRect(x0, AY - 26, x1 - x0, 52); c.restore(); }
          L.tline(lab[i], 408, cx, AY - 18, e.year.tier, { w: 2.5, color: col, alpha: 0.85 });
          L.tdot(cx, AY, 15 + 5 * hl, e.year.tier, { color: col, glow: hl });
          const lw = Math.max(K.measure(`${e.id} ${e.title}`, { font: 'ui', weight: 700, size: 30 }), K.measure(`${e.year.year.text}${e.released === false ? ' · not released' : ''}`, { font: 'mono', size: 21 })) + 40;
          K.card(lab[i] - lw / 2, 328, lw, 80, { r: 18, fill: K.rgba(L.epc(e.id, 'ground'), 0.95), stroke: K.rgba(col, 0.5 + 0.5 * hl), shadow: false, glow: hl });
          K.text(`${e.id} ${e.title}`, lab[i], 364, { font: 'ui', weight: 700, size: 30, color: col, align: 'center' });
          K.text(`${e.year.year.text}${e.released === false ? ' · not released' : ''}`, lab[i], 394, { font: 'mono', size: 21, color: L.tier(e.year.tier).color, align: 'center' });
        });
      });
      // the dated lines, stacked under the axis by year
      bs.forEach((b) => {
        const p = pos.get(L.key(b)); if (!p) return;
        const hl = L.lit(S, t, b), y = AY + 84 + p.i * 24;
        if (y > 900) return;
        K.layer(K.io(t, 1.4 + (p.x - 170) / 1580 * 1.6, 0.4), () => L.tdot(p.x, y, 9 + 6 * hl, b.tier, { glow: hl }));
      });
      K.layer(K.io(t, 2.4, 0.6), () => K.text(`${bs.length} dated lines · Y0 = the night of Episode 1`, 80, 930, { font: 'ui', size: 24, color: C.soft }));
      // the line being spoken, as a callout
      if (cur && cur.b && cur.b.year && cur.b.line != null) {
        const a = K.env(t, cur.local - 0.15, cur.localEnd + 0.6, 0.3), x = Math.min(1180, Math.max(80, ax.x(cur.b.year.min) - 360));
        K.layer(a, () => L.lineCard(cur.b, x, 456, 760, { hl: 1, size: 28, max: 2 }));
      }
      L.foot(t, S);
    };
  };

  /** lifeline: one person on the warped axis with every episode, ages computed from the lore (each with the weakest
   *  tier of its dates), family ties, dated events and evidence pictures. [scene: lifeline @rosie family=@amara,@noor] */
  LS.lifeline = (o) => (t, S) => {
    const P = L.get(o.focus);
    if (!P) return notFound(t, `@${o.focus}`);
    const famIds = [].concat(o.family || []);
    const fam = famIds.map(L.get).filter(Boolean);
    const eps = L.eps().filter((e) => e.year && e.year.year);
    const claims = L.claims(S);
    const tail = S.dur + 0.4;
    claims.forEach((c) => {
      const b = c.b, eid = c.cite.id;
      if (!b) c.target = 'none';
      else if (b.key === 'year' && /^E\d+$/.test(b.entity.id)) c.target = `ep:${b.entity.id}`;
      else if (b.key === 'born') c.target = 'born';
      else if (b.year) c.target = `year:${b.year.min}`;
      else if ((b.refs || []).some((r) => famIds.includes(r)) || /grandmother|mother|daughter|father|brother|sister/i.test(b.text)) c.target = 'family';
      else if (/ages?:|\bages\b/i.test(b.text)) c.target = 'ages';
      else if (eid !== o.focus && L.get(eid) && L.pics(L.get(eid)).length) c.target = `card:${eid}`;
      else if (mentionsEp(b.text) || mentionsEp(b.src)) c.target = `age:${mentionsEp(b.text) || mentionsEp(b.src)}`;
      else c.target = 'focus';
    });
    const when = (target, fallback) => { const c = claims.find((x) => x.target === target); return c ? c.local : fallback; };
    const lit = (target) => claims.reduce((m, c) => (c.target === target ? Math.max(m, K.env(t, c.local - 0.1, c.localEnd + 0.6, 0.35)) : m), 0);
    const born = P.born && P.born.year;
    const nm = new RegExp(`\\b${P.title.split(' ')[0]}\\b`, 'i');
    const evs = (D.timeline || []).filter((b) => (b.entity === P.id || (b.refs || []).includes(P.id) || nm.test(b.text)) && ['steel', 'fact', 'egg'].includes(b.tier))
      .filter((b) => !eps.some((e) => e.year.year.min === b.year.min && e.year.year.max === b.year.max))
      .filter((b) => b.year.min !== (born ? born.min : NaN) && b.year.max - b.year.min < 4);
    const evYears = [...new Set(evs.map((b) => b.year.min))];
    const yrs = [0, ...eps.flatMap((e) => [e.year.year.min, e.year.year.max]), ...evYears,
      ...[P, ...fam].flatMap((pp) => (pp.born && pp.born.year ? [pp.born.year.min] : []))];
    const ax = L.axis(yrs, 300, 1740, { tickGap: 96 });
    const AY = 520, xOf = ax.x;
    L.bg(t);
    eps.forEach((e, i) => {
      const a = K.io(t, 1.0 + i * 0.15, 1.2) * (0.45 + 0.55 * Math.max(lit(`ep:${e.id}`), lit(`age:${e.id}`), lit('ages')));
      const x0 = xOf(e.year.year.min), x1 = xOf(e.year.year.max), cx = (x0 + x1) / 2, rw = Math.max(80, (x1 - x0) / 2 + 60);
      const c = g(); c.save(); c.globalAlpha = 0.17 * a;
      const gr = c.createRadialGradient(cx, AY, 0, cx, AY, rw * 2.6);
      gr.addColorStop(0, L.epc(e.id)); gr.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = gr; c.fillRect(cx - rw * 3, 0, rw * 6, H); c.restore();
    });
    L.head(t, S, { eyebrow: S.title, title: P.title, size: 72, maxW: 900 });
    L.drawAxis(ax, AY, t, { at: 0.5, breakBelow: true });
    // episodes above the axis, in the tier of their placement (a span for a range)
    const order = eps.slice().sort((a, b) => (a.year.year.min + a.year.year.max) - (b.year.year.min + b.year.year.max));
    const labW = (e) => Math.max(K.measure(`${e.id} ${e.title}`, { font: 'ui', weight: 700, size: 28 }), K.measure(`${e.year.year.text}${e.released === false ? ' · not released' : ''}`, { font: 'mono', size: 21 })) + 40;
    const spots = L.spread(order.map((e) => ({ x: xOf((e.year.year.min + e.year.year.max) / 2), w: labW(e) })), 300, W - 50, 16);
    order.forEach((e, i) => {
      const y0 = e.year.year.min, y1 = e.year.year.max, x0 = xOf(y0), x1 = xOf(y1), cx = (x0 + x1) / 2, lx = spots[i];
      const ly = AY - 132, a = K.io(t, 1.2 + i * 0.18, 0.6, 'out'), hl = Math.max(lit(`ep:${e.id}`), lit(`age:${e.id}`));
      const tier = e.year.tier, col = L.epc(e.id);
      K.layer(a, () => {
        if (y1 > y0) {
          const c = g(); c.save(); c.fillStyle = K.rgba(col, 0.13 + 0.22 * hl); c.fillRect(x0, AY - 24, x1 - x0, 48);
          c.strokeStyle = K.rgba(col, 0.75); c.setLineDash([6, 6]); c.lineWidth = 2; c.strokeRect(x0, AY - 24, x1 - x0, 48); c.restore();
        }
        L.tline(lx, ly + 42, cx, AY - 14, tier, { w: 2.5, color: col, alpha: 0.85 });
        L.tdot(cx, AY, 11 + 5 * hl, tier, { color: col, glow: hl });
        const lw = labW(e);
        K.card(lx - lw / 2, ly - 36, lw, 78, { r: 18, fill: K.rgba(L.epc(e.id, 'ground'), 0.95), stroke: K.rgba(col, 0.5 + 0.5 * hl), shadow: false, glow: hl });
        K.text(`${e.id} ${e.title}`, lx, ly - 2, { font: 'ui', weight: 700, size: 28, color: col, align: 'center' });
        K.text(`${e.year.year.text}${e.released === false ? ' · not released' : ''}`, lx, ly + 28, { font: 'mono', size: 21, color: L.tier(tier).color, align: 'center' });
      });
    });
    // lifelines: the focus, then the family below it
    const rows = [P, ...fam];
    const RY = (ri) => 680 + ri * 80;
    rows.forEach((pp, ri) => {
      const ry = RY(ri), isFocus = ri === 0;
      const pb = pp.born && pp.born.year;
      const myEps = eps.filter((e) => (pp.episodes || []).includes(e.id));
      const lastY = Math.max(...myEps.map((e) => e.year.year.max), pb ? pb.max : -1e9);
      const start = pb ? pb.min : myEps.length ? Math.min(...myEps.map((e) => e.year.year.min)) : null;
      if (start == null) return;
      const appear = isFocus ? Math.min(when('born', 1e9), when('age:E1', 1e9), when('ages', 1e9), 1.6) - 0.3 : Math.min(when('family', tail), tail);
      const a = K.io(t, appear, 0.6, 'out');
      if (a <= 0) return;
      K.layer(a, () => {
        K.text(pp.title.replace(/^Dr\. /, ''), 80, ry + 10, { font: 'ui', weight: 700, size: isFocus ? 34 : 28, color: isFocus ? C.strong : C.body });
        const bt = pp.born ? pp.born.tier : 'open';
        K.text(pb ? `born ${pb.text}` : 'born: not in the lore', 80, ry + 40, { font: 'mono', size: 20, color: L.tier(bt).color });
        const xA = xOf(start);
        if (isFocus && pb) {
          // the life drawn piece by piece: birth to each night in the tier of the age there (an open night is skipped)
          const stops = myEps.map((e) => ({ e, ag: L.age(pp, e.id) })).filter((x) => x.ag && x.ag.tier !== 'open')
            .sort((a, b) => (a.e.year.year.min + a.e.year.year.max) - (b.e.year.year.min + b.e.year.year.max));
          let xPrev = xA, tPrev = appear;
          stops.forEach((st, i) => {
            const xS = xOf((st.e.year.year.min + st.e.year.year.max) / 2);
            const at = i === 0 ? appear : Math.min(when(`age:${st.e.id}`, 1e9), when('ages', 1e9) + i * 0.6, tail) - 0.2;
            L.tline(xPrev, ry, xS, ry, st.ag.tier, { w: st.ag.tier === 'fact' || st.ag.tier === 'steel' ? 7 : 6, k: K.io(t, Math.max(tPrev, at), 1.0, 'io') });
            xPrev = xS; tPrev = at;
          });
        } else {
          const tierLine = L.weakest(bt, ...myEps.map((e) => e.year.tier).filter((x) => x !== 'open'), 'running');
          L.tline(xA, ry, xOf(lastY), ry, tierLine, { w: 5, k: K.io(t, appear, 1.6) });
        }
        L.tdot(xA, ry, 12, bt, { alpha: K.io(t, appear + 0.2, 0.4), glow: isFocus ? lit('born') : 0 });
        // ages at each of the person's episodes, computed (tier = weakest of birth and episode dates)
        const ageEps = isFocus ? myEps.filter((e) => L.age(pp, e.id)) : [];
        const ageTxt = (ag) => `${L.ageText(ag)}${ag.min !== ag.max ? '?' : ''}`;
        const ageSpots = L.spread(ageEps.map((e) => ({ x: xOf((e.year.year.min + e.year.year.max) / 2), w: K.measure(ageTxt(L.age(pp, e.id)), { font: 'mono', weight: 700, size: 34 }) + 26 })), 300, W - 40, 10);
        if (isFocus) K.layer(K.io(t, appear + 0.4, 0.6), () => K.text('age', 80, ry - 56, { font: 'ui', size: 22, color: C.soft }));
        ageEps.forEach((e, i) => {
          const ag = L.age(pp, e.id);
          const at = Math.min(when(`age:${e.id}`, 1e9), when(`ep:${e.id}`, 1e9), when('ages', 1e9) + i * 0.6, tail + 0.4 + i * 0.35);
          const k = K.io(t, at, 0.5, 'out'), hl = Math.max(lit(`age:${e.id}`), lit(`ep:${e.id}`), lit('ages') * 0.6);
          const x = xOf((e.year.year.min + e.year.year.max) / 2);
          K.layer(k, () => {
            L.tdot(x, ry, 15 + 5 * hl, ag.tier, { glow: hl });
            if (Math.abs(ageSpots[i] - x) > 4) L.tline(ageSpots[i], ry - 52, x, ry - 18, ag.tier, { w: 2, alpha: 0.6 });
            K.text(ageTxt(ag), ageSpots[i], ry - 56, { font: 'mono', weight: 700, size: 32 + 4 * hl, color: L.tier(ag.tier).color, align: 'center' });
          });
        });
      });
    });
    // family ties, drawn in the tier of the line that states them
    if (fam.length) {
      const ties = L.bullets(P).filter((b) => (b.refs || []).some((r) => famIds.includes(r))).sort((a, b) => (RANK[a.tier] - RANK[b.tier]) || (a.text.length - b.text.length));
      const tie = ties[0];
      const tier = tie ? tie.tier : 'open', at = Math.min(when('family', tail), tail), a = K.io(t, at, 0.6), hl = lit('family');
      K.layer(a, () => {
        for (let i = 0; i < fam.length; i++) L.tline(48, RY(i), 48, RY(i + 1), tier, { w: 4, k: K.io(t, at + i * 0.25, 0.5) });
        L.tdot(48, RY(0), 9, tier); fam.forEach((_, i) => L.tdot(48, RY(i + 1), 9, tier));
        const y = RY(fam.length) + 70;
        if (tie && y < 935) {
          const w = L.chip(tier, 300, y, { size: 22, src: tie.src, maxSrc: 26, glow: hl });
          L.textBox(tie.text, 300 + w + 16, y + 9, W - 380 - w, { size: 26, max: 1, color: hl ? C.strong : C.body });
        }
      });
    }
    // the focus's own dated events from the timeline
    evs.forEach((b, i) => {
      const hl = Math.max(lit(`year:${b.year.min}`), lit('ages'));
      const at = Math.min(when(`year:${b.year.min}`, 1e9), when('ages', 1e9), tail + 1.4 + i * 0.4), x = xOf((b.year.min + b.year.max) / 2);
      K.layer(K.io(t, at, 0.5), () => {
        L.tdot(x, RY(0), 10 + 4 * hl, b.tier, { glow: hl });
        if (born && i === evs.findIndex((z) => z.year.min === b.year.min)) {
          const ag = b.year.min - born.max, txt = `${b.year.approx || born.approx ? 'about ' : ''}${ag}`;
          K.text(txt, x, RY(0) + 44, { font: 'mono', weight: 700, size: 26 + 4 * hl, color: L.tier(L.weakest(b.tier, P.born.tier, b.year.approx ? 'running' : null)).color, align: 'center' });
        }
      });
    });
    S.placed = new Set(claims.filter((c) => c.b && !['focus', 'none'].includes(c.target)).map((c) => L.key(c.b)));
    // evidence, one slot top right: each cited thing's picture while its clause is spoken, then the focus's own
    const seq = [];
    claims.filter((c) => c.target.startsWith('card:')).forEach((c) => { const e = L.get(c.cite.id), im = L.pics(e).find((x) => x.status === 'used') || L.pics(e)[0]; if (im) seq.push({ im, from: c.local - 0.2 }); });
    L.pics(P).filter((x) => x.status !== 'placeholder').forEach((im, i) => seq.push({ im, from: tail + 0.4 + i * 2.6 }));
    seq.forEach((c, i) => {
      const to = i + 1 < seq.length ? seq[i + 1].from : 1e9;
      const [w, h] = L.fit(c.im, 560, 230);
      const k = K.io(t, c.from, 0.6, 'out') * (1 - K.io(t, to - 0.2, 0.4));
      L.card(c.im, 1840 - w, 118, w, h, { alpha: k, scale: 0.95 + 0.05 * k });
    });
    L.foot(t, S, { calloutAt: [960, 128, 880] });
  };

  /** sheet: a character (or thing) as a broadcast card: picture, name, aka, born, episodes, how many lines of each tier
   *  the lore holds, then what is set in steel, on screen and running; a cited line lights while it is spoken.
   *  [scene: sheet @rosie] */
  LS.sheet = (o) => {
    const P = L.get(o.focus);
    const pick = memo(() => {
      if (!P) return [];
      const all = L.bullets(P), steel = all.filter((b) => b.tier === 'steel');
      const uniq = (bs) => { const seen = new Set(); return bs.filter((b) => { const k = L.plain(b.text).toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }); };
      return uniq(steel);
    });
    return (t, S) => {
      if (!P) return notFound(t, `@${o.focus}`);
      L.bg(t);
      const cur = L.now(S, t), cited = L.cited(S);
      // left: the identity card
      K.layer(K.io(t, -0.3, 0.7, 'out'), () => {
        K.card(60, 120, 640, 800, { r: 26, fill: 'rgba(17,19,27,.94)', stroke: C.line2, shadow: false });
        K.eyebrow(P.kind ? `${P.kind} · character sheet` : 'sheet', 96, 182, { color: C.soft, size: 22 });
        const nw = K.text(P.title, 94, 256, { font: 'head', size: 64, weight: 400, color: C.strong, maxW: 560 });
        L.cursor(102 + Math.min(nw, 560), 256, t, { h: 44, w: 18 });
        let y = 300;
        const aka = P.aka || (P.header && P.header.aka);
        if (aka) y += L.textBox(`aka ${aka.replace(/\s*\((E\d+(, E\d+)*)\)/g, '')}`, 96, y + 12, 570, { size: 22, lh: 30, max: 2, font: 'mono', color: C.soft });
        const area = (x) => { const [w, h] = L.fit(x, 568, 290); return w * h * (x.status === 'placeholder' ? 0.3 : 1); };
        const im = L.pics(P).slice().sort((a, b) => area(b) - area(a))[0];
        if (im) { const [w, h] = L.fit(im, 568, 236); L.card(im, 96 + (568 - w) / 2, y + 30, w, h, { hl: 0, caption: true }); y += h + 112; }
        if (P.born && P.born.year) { L.chip(P.born.tier, 96, y + 8, { size: 22, label: `born ${P.born.year.text} · ${L.tier(P.born.tier).label}`, src: '' }); y += 52; }
        let cx = 96;
        (P.episodes || []).forEach((c) => { if (cx < 600) cx += L.epChip(c, cx, y + 12, { size: 22, short: true }) + 10; });
        // the sheet at a glance: lines per tier
        const n = L.counts(L.bullets(P));
        const y2 = Math.max(y + 110, 862);
        K.text(`${L.bullets(P).length} lines in the lore`, 96, y2 - 40, { font: 'ui', size: 22, color: C.soft });
        let bx = 96;
        TIER_ORDER.forEach((tr) => { if (!n[tr]) return; L.tdot(bx + 12, y2, 11, tr); bx += 30; bx += K.text(String(n[tr]), bx, y2 + 9, { font: 'mono', size: 24, weight: 600, color: L.tier(tr).color }) + 24; });
      });
      // right: the lines. Steel first (Aaron's), then each line the narration cites, in the order it is spoken
      const X = 760, Wd = 1100;
      const citedKeys = new Set(cited.map((c) => L.key(c.b)));
      const shown = [];
      pick().forEach((b) => shown.push({ b, at: Math.min(-0.2, L.saidAt(S, b) - 0.2), cited: citedKeys.has(L.key(b)) }));
      cited.forEach((c) => { if (!shown.some((s) => L.key(s.b) === L.key(c.b))) shown.push({ b: c.b, at: c.local - 0.2, cited: true }); });
      // keep what fits (770 px): drop uncited steel lines from the bottom first, then the oldest cited ones
      const hOf = (s) => L.lineCard(s.b, 0, 0, Wd, { measure: true, size: 28, max: 2 }) + 14;
      const keep = shown.filter((s) => t >= s.at);
      const total = () => keep.reduce((a, s) => a + hOf(s), 0);
      while (total() > 770 && keep.some((s) => !s.cited)) keep.splice(keep.map((s) => !s.cited).lastIndexOf(true), 1);
      while (total() > 770 && keep.length > 1) keep.shift();
      S.placed = new Set(keep.map((s) => L.key(s.b)));
      K.layer(K.io(t, -0.1, 0.6), () => K.eyebrow('In the lore today', X, 168, { color: C.soft, size: 22 }));
      let y = 194;
      keep.forEach((s) => {
        const hl = L.lit(S, t, s.b), a = K.io(t, s.at, 0.5, 'out');
        y += L.lineCard(s.b, X, y + (1 - a) * 16, Wd, { size: 28, max: 2, hl, alpha: a }) + 14;
      });
      L.foot(t, S);
    };
  };

  /** episode: the 30:20 strip: the programme, its chapters from the Structure lines, the turn at 20:00, the black tail;
   *  title, logline, placement and release state. [scene: episode E2] */
  LS.episode = (o) => {
    const code = o.ep || o.focus || o.name;
    const E = L.get(code);
    const parse = memo(() => {
      if (!E) return { segs: [], turn: [] };
      const sec = E.sections.find((s) => /structure/i.test(s.title));
      const ts = (x) => { const p = x.split(':').map(Number); return p.length === 2 ? p[0] * 60 + p[1] : p[0] * 3600 + p[1] * 60 + p[2]; };
      const segs = ((sec && sec.bullets) || []).map((b) => {
        const m = /^(\d{1,2}:\d{2}(?:\.\d+)?)\s*[-–]\s*(\d{1,2}:\d{2}(?:\.\d+)?)\s+(?:(S\d+\w*)\s+)?([^:.;]+)/.exec(b.text);
        return m ? { b, a: ts(m[1]), z: ts(m[2]), id: m[3] || '', name: m[4].trim() } : null;
      }).filter(Boolean);
      const turn = ((E.sections.find((s) => /the turn/i.test(s.title)) || {}).bullets) || [];
      return { segs, turn };
    });
    return (t, S) => {
      if (!E) return notFound(t, code);
      const { segs, turn } = parse(), col = L.epc(code), ground = L.epc(code, 'ground');
      L.bg(t, { ground, glow: 0.06, tint: col, tintA: 0.03 });
      const cur = L.now(S, t);
      K.rise(t, -0.3, () => {
        K.eyebrow(`Episode ${code.slice(1)}${E.released === false ? ' · not released yet' : ''}`, 80, 160, { color: col, size: 26, tracking: 4 });
        const tw = K.text(E.title, 76, 250, { font: 'head', size: 88, weight: 400, color: C.strong, tracking: -1 });
        L.cursor(88 + tw, 250, t, { h: 62, w: 26 });
      });
      if (E.year) K.layer(K.io(t, 0.3, 0.6), () => L.chip(E.year.tier, 80, 310, { size: 24, label: `${E.year.year ? E.year.year.text : ''} · ${L.tier(E.year.tier).label}`, src: E.year.src, maxSrc: 40 }));
      K.layer(K.io(t, 0.5, 0.7), () => L.textBox(E.logline || E.summary || '', 80, 384, 1040, { size: 30, lh: 40, max: 5, font: 'read', color: C.body }));
      const im = L.pics(E)[0];
      if (im) { const [w, h] = L.fit(im, 620, 360); L.card(im, 1830 - w, 128, w, h, { alpha: K.io(t, 0.6, 0.7) }); }
      // the strip
      const X0 = 80, X1 = 1840, Y = 690, total = 30 * 60 + 20, xs = (s) => X0 + (s / total) * (X1 - X0);
      K.layer(K.io(t, 0.4, 0.8), () => {
        K.card(X0, Y - 34, X1 - X0, 68, { r: 10, fill: 'rgba(8,9,14,.9)', stroke: C.line2, shadow: false });
        segs.forEach((s, i) => {
          const hl = L.lit(S, t, s.b), c = g();
          c.save(); c.fillStyle = K.rgba(i % 2 ? col : L.epc(code, 'second'), (s.a >= 1200 ? 0.34 : 0.2) + 0.5 * hl); c.fillRect(xs(s.a) + 1, Y - 30, Math.max(2, xs(s.z) - xs(s.a) - 2), 60); c.restore();
        });
        const c = g(); c.save(); c.fillStyle = '#000'; c.fillRect(xs(1800), Y - 30, xs(total) - xs(1800), 60); c.restore();
        [0, 300, 600, 900, 1200, 1500, 1800].forEach((s) => K.text(`${s / 60}:00`, xs(s), Y + 66, { font: 'mono', size: 22, color: s === 1200 ? col : C.soft, align: s === 0 ? 'left' : 'center' }));
        const thl = turn.reduce((m, b) => Math.max(m, L.lit(S, t, b)), 0);
        L.tline(xs(1200), Y - 70, xs(1200), Y + 40, 'fact', { w: 4 + 3 * thl, color: col });
        K.text('THE TURN · 20:00', xs(1200), Y - 84, { font: 'ui', weight: 700, size: 24, tracking: 2, color: col, align: 'center' });
      });
      // the chapter being spoken (or the turn), as a callout under the strip
      if (cur && cur.b && cur.b.line != null) {
        const a = K.env(t, cur.local - 0.15, cur.localEnd + 0.6, 0.3), sg = segs.find((s) => L.key(s.b) === L.key(cur.b));
        const cx = sg ? Math.min(1080, Math.max(80, xs((sg.a + sg.z) / 2) - 380)) : 80;
        K.layer(a, () => L.lineCard(cur.b, cx, 790, 780, { hl: 1, size: 27, max: 2 }));
      }
      L.foot(t, S);
    };
  };

  /** egg: one planted thing across the episodes: a column per episode with its pictures and its lines there, the
   *  cited one lit; what it points at underneath. [scene: egg @pizza-box-painting] */
  LS.egg = (o) => {
    const P = L.get(o.focus);
    const cols = memo(() => {
      if (!P) return [];
      const codes = L.eps().map((e) => e.id).filter((c) => (P.episodes || []).includes(c) || L.bullets(P).some((b) => L.bep(b) === c));
      return codes.map((c) => ({
        code: c,
        ims: L.pics(P).filter((im) => (/E\d+/.exec(im.src || '') || [])[0] === c),
        bs: L.bullets(P).filter((b) => L.bep(b) === c && ['fact', 'egg', 'steel'].includes(b.tier)),
      }));
    });
    return (t, S) => {
      if (!P) return notFound(t, `@${o.focus}`);
      L.bg(t);
      L.head(t, S, { eyebrow: `An egg: ${P.title}` });
      const cs = cols(), n = cs.length || 1, gap = 30, cw = (1760 - gap * (n - 1)) / n, cur = L.now(S, t);
      S.placed = new Set();
      cs.forEach((c, i) => {
        const x = 80 + i * (cw + gap), a = K.stagger(t, 0.1, i, 0.3, 0.7);
        const said = L.cited(S).filter((k) => c.bs.some((b) => L.key(b) === L.key(k.b)));
        const active = cur && c.bs.some((b) => L.key(b) === L.key(cur.b)) ? K.env(t, cur.local - 0.15, cur.localEnd + 0.6, 0.3) : 0;
        K.layer(a * (0.6 + 0.4 * Math.max(active, said.some((k) => t >= k.local) ? 1 : 0)), () => {
          const col = L.epc(c.code);
          L.epChip(c.code, x, 300, { size: 24, hl: active });
          let y = 336;
          const im = c.ims[0];
          if (im) { const [w, h] = L.fit(im, cw - 20, 300); L.card(im, x + 10 + (cw - 20 - w) / 2, y + 10, w, h, { hl: active, caption: false }); y += h + 40; }
          else {
            const qb = c.bs.find((b) => /["“]/.test(b.text)) || c.bs[0];
            const qt = qb ? L.plain(qb.text).replace(/^[^“]*“/, '“').replace(/”[^”]*$/, '”') : '';
            const qh = qb ? L.textBox(qt, 0, 0, cw - 60, { measure: true, size: 30, lh: 40, max: 5, font: 'read', italic: true }) : 60;
            K.card(x, y + 10, cw, qh + 56, { r: 14, fill: K.rgba(L.epc(c.code, 'ground'), 0.9), stroke: K.rgba(col, 0.35 + 0.5 * active), shadow: false, glow: active });
            if (qb) L.textBox(qt, x + 30, y + 58, cw - 60, { size: 30, lh: 40, max: 5, font: 'read', italic: true, color: C.strong });
            y += qh + 86;
          }
          // its lines here: the cited ones first, then the strongest
          const quoted = im ? null : (c.bs.find((b) => /["“]/.test(b.text)) || c.bs[0]);
          if (quoted) S.placed.add(L.key(quoted));
          const order = [...said.map((k) => c.bs.find((b) => L.key(b) === L.key(k.b))), ...c.bs].filter((b, j, arr) => b && b !== quoted && arr.indexOf(b) === j);
          for (const b of order) {
            const h = L.lineCard(b, 0, 0, cw, { measure: true, size: 24, max: 3 });
            if (y + h > 930) break;
            const hl = L.lit(S, t, b);
            S.placed.add(L.key(b));
            y += L.lineCard(b, x, y, cw, { size: 24, max: 3, hl, src: false, dim: !hl && t < L.saidAt(S, b) && said.length > 0 }) + 10;
          }
        });
      });
      L.foot(t, S);
    };
  };

  /** eggatlas: the egg families (eggs.md's sections) by episode: each family a row, a mark in each episode it appears in
   *  (its strongest tier there, with a count). [scene: eggatlas top=12] or [scene: eggatlas @rosie] */
  LS.eggatlas = (o) => {
    const rows = memo(() => {
      const codes = L.eps().map((e) => e.id);
      let fams = (D.eggs || []).filter((s) => s.title && s.bullets.some((b) => L.bep(b)) && !/rules|decisions|contradictions|never quoted|threads across|inside one episode/i.test(s.title));
      if (o.focus && L.get(o.focus)) { const P = L.get(o.focus), nm = new RegExp(P.title.split(' ')[0], 'i'); fams = fams.filter((s) => nm.test(s.title) || s.bullets.some((b) => (b.refs || []).includes(o.focus) || nm.test(b.text))); }
      if (o.name) fams = fams.filter((s) => s.title.toLowerCase().includes(String(o.name).toLowerCase()));
      const rowsAll = fams.map((s) => ({ s, cells: codes.map((c) => { const bs = s.bullets.filter((b) => L.bep(b) === c); return { c, n: bs.length, tier: L.strongest(...bs.map((b) => b.tier)), bs }; }) }));
      rowsAll.forEach((r) => { r.span = r.cells.filter((x) => x.n).length; r.total = r.cells.reduce((a, x) => a + x.n, 0); });
      rowsAll.sort((a, b) => b.span - a.span || b.total - a.total);
      return { codes, rows: rowsAll.slice(0, o.top || 11), all: rowsAll.length };
    });
    return (t, S) => {
      const { codes, rows: rs, all } = rows();
      L.bg(t);
      L.head(t, S, { eyebrow: `The egg atlas · ${all} families` });
      const X0 = 760, cw = (1820 - X0) / codes.length, Y0 = 318, rh = Math.min(58, 560 / Math.max(1, rs.length)), cur = L.now(S, t);
      codes.forEach((c, i) => K.layer(K.io(t, 0.2 + i * 0.1, 0.5), () => L.epChip(c, X0 + i * cw + cw / 2 - L.epChip(c, 0, 0, { measure: true, size: 24, short: true }) / 2, Y0 - 20, { size: 24, short: true })));
      rs.forEach((r, ri) => {
        const y = Y0 + 40 + ri * rh, a = K.stagger(t, 0.5, ri, 0.12, 0.5);
        const hl = cur && cur.b && r.s.bullets.some((b) => L.key(b) === L.key(cur.b)) ? K.env(t, cur.local - 0.15, cur.localEnd + 0.6, 0.3) : 0;
        K.layer(a, () => {
          if (hl) K.card(70, y - rh / 2 + 4, 1770, rh - 4, { r: 10, fill: K.rgba(C.head, 0.08 * hl), stroke: K.rgba(C.head, 0.5 * hl), shadow: false });
          L.textBox(r.s.title, 90, y + 10, 640, { size: 26, max: 1, color: hl ? C.strong : C.body });
          r.cells.forEach((cell, ci) => {
            if (!cell.n) { g().fillStyle = C.line; g().fillRect(X0 + ci * cw + cw / 2 - 12, y, 24, 2); return; }
            const x = X0 + ci * cw + cw / 2;
            L.tline(X0 + ci * cw + 20, y, X0 + (ci + 1) * cw - 20, y, cell.tier, { w: 1.5, alpha: 0.25 });
            L.tdot(x - 18, y, 13 + 3 * hl, cell.tier, { color: cell.tier === 'fact' ? L.epc(cell.c) : undefined, glow: hl });
            K.text(`×${cell.n}`, x + 4, y + 9, { font: 'mono', size: 22, color: C.soft });
          });
        });
      });
      if (cur && cur.b && cur.b.line != null) K.layer(K.env(t, cur.local - 0.15, cur.localEnd + 0.6, 0.3), () => L.lineCard(cur.b, 760, 860 - 0, 1080, { hl: 1, size: 24, max: 1 }));
      L.foot(t, S);
    };
  };

  /** thread: a thread (threads.md) across the episodes: a column per episode with its lines, the series-wide lines
   *  (Aaron's steel first) in a band underneath, the entities it carries as chips. [scene: thread name="Rosie's life"] */
  LS.thread = (o) => {
    const T = memo(() => {
      const want = String(o.name || '').toLowerCase();
      const s = (D.threads || []).find((x) => x.title.toLowerCase() === want) || (D.threads || []).find((x) => x.title.toLowerCase().includes(want));
      if (!s) return null;
      const codes = L.eps().map((e) => e.id).filter((c) => s.bullets.some((b) => b.ep === c));
      const carries = s.bullets.find((b) => /^Carries\b/.test(b.text));
      const series = s.bullets.filter((b) => !b.ep && b !== carries).sort((a, b) => RANK[a.tier] - RANK[b.tier]);
      return { s, codes, carries, series, by: Object.fromEntries(codes.map((c) => [c, s.bullets.filter((b) => b.ep === c)])) };
    });
    return (t, S) => {
      const th = T();
      if (!th) return notFound(t, `thread "${o.name}"`);
      L.bg(t);
      L.head(t, S, { eyebrow: `A thread: ${th.s.title}` });
      const cur = L.now(S, t), cited = L.cited(S);
      S.placed = new Set();
      // the entities it carries
      if (th.carries) {
        let cx = 80;
        (th.carries.refs || []).slice(0, 9).forEach((id, i) => {
          const e = L.get(id); if (!e) return;
          const w = K.measure(e.title, { font: 'ui', size: 22, weight: 600 }) + 30;
          if (cx + w > 1840) return;
          const hl = cur && cur.b && (cur.b.refs || []).includes(id) ? 1 : 0;
          K.layer(K.stagger(t, 0.2, i, 0.06), () => { K.card(cx, 262, w, 40, { r: 20, fill: 'rgba(17,19,27,.9)', stroke: K.rgba(C.head, 0.25 + 0.6 * hl), shadow: false }); K.text(e.title, cx + 15, 289, { font: 'ui', size: 22, weight: 600, color: hl ? C.strong : C.soft }); });
          cx += w + 10;
        });
      }
      const n = th.codes.length || 1, gap = 24, cw = (1760 - gap * (n - 1)) / n;
      th.codes.forEach((c, i) => {
        const x = 80 + i * (cw + gap), bs = th.by[c];
        const active = cur && bs.some((b) => L.key(b) === L.key(cur.b)) ? K.env(t, cur.local - 0.15, cur.localEnd + 0.6, 0.3) : 0;
        K.layer(K.stagger(t, 0.3, i, 0.25, 0.6), () => {
          L.epChip(c, x, 348, { size: 22, hl: active });
          g().fillStyle = K.rgba(L.epc(c), 0.35 + 0.5 * active); g().fillRect(x, 374, cw, 3);
          // cited lines first (as they are spoken), then on-screen lines, as many as fit
          const saidHere = cited.filter((k) => bs.some((b) => L.key(b) === L.key(k.b)));
          const order = [...saidHere.filter((k) => t >= k.local - 0.2).map((k) => k.b), ...bs.filter((b) => b.tier === 'fact' || b.tier === 'egg'), ...bs].filter((b, j, arr) => arr.findIndex((z) => L.key(z) === L.key(b)) === j);
          let y = 392;
          for (const b of order) {
            const h = L.lineCard(b, 0, 0, cw, { measure: true, size: 23, max: 3, src: false });
            if (y + h > 812) break;
            const hl = L.lit(S, t, b);
            S.placed.add(L.key(b));
            y += L.lineCard(b, x, y, cw, { size: 23, max: 3, hl, src: false, dim: saidHere.length && !hl && t < L.saidAt(S, b) }) + 10;
          }
        });
      });
      // series-wide lines: Aaron's steel first
      const band = th.series.slice(0, 2);
      band.forEach((b, i) => { S.placed.add(L.key(b)); K.layer(K.io(t, 1.0 + i * 0.3, 0.6), () => L.lineCard(b, 80 + i * 890, 828, 870, { size: 23, max: 2, hl: L.lit(S, t, b), src: false })); });
      L.foot(t, S);
    };
  };

  /** questions: open questions and the answers on the table. [scene: questions @rosie] takes the focus's own [open]
   *  lines (each with the [idea]/[running] lines under it); [scene: questions name="Rosie's family"] takes a section of
   *  questions.md. A cited question comes forward while it is spoken */
  LS.questions = (o) => {
    const Q = memo(() => {
      let bs = [];
      if (o.name) { const s = (D.questions || []).find((x) => x.title.toLowerCase().includes(String(o.name).toLowerCase())); bs = s ? s.bullets : []; }
      else if (o.focus && L.get(o.focus)) { const sec = L.get(o.focus).sections.find((s) => /^open/i.test(s.title)); bs = sec ? sec.bullets : L.bullets(L.get(o.focus)).filter((b) => b.tier === 'open'); }
      const qs = [];
      bs.forEach((b) => { if (b.tier === 'open') qs.push({ q: b, answers: [] }); else if (qs.length) qs[qs.length - 1].answers.push(b); });
      return qs;
    });
    return (t, S) => {
      L.bg(t);
      L.head(t, S, { eyebrow: o.name ? `Open questions: ${o.name}` : 'Still open' });
      const qs = Q(), cited = L.cited(S), cur = L.now(S, t);
      S.placed = new Set(qs.flatMap((q) => [q.q, ...q.answers]).map(L.key));
      // the questions this scene speaks about, in the order spoken, else the first ones
      const said = cited.map((c) => qs.find((q) => L.key(q.q) === L.key(c.b) || q.answers.some((a) => L.key(a) === L.key(c.b)))).filter(Boolean);
      const order = [...said, ...qs].filter((q, i, arr) => arr.indexOf(q) === i).slice(0, o.max || 4);
      let y = 280;
      order.forEach((q, i) => {
        const first = Math.min(L.saidAt(S, q.q), ...q.answers.map((a) => L.saidAt(S, a)));
        const at = Number.isFinite(first) ? first - 0.3 : (said.length ? (S.dur || 0) + 0.4 + i * 0.3 : 0.3 + i * 0.3);
        const hl = Math.max(L.lit(S, t, q.q), ...q.answers.map((a) => L.lit(S, t, a)));
        const a = K.io(t, at, 0.6, 'out');
        const qh = L.textBox(q.q.text, 0, 0, 1560, { measure: true, size: 34, max: 2 });
        const ans = q.answers.filter((x) => x.tier !== 'open').slice(0, 2);
        const ah = ans.reduce((s, x) => s + L.lineCard(x, 0, 0, 1560, { measure: true, size: 24, max: 1, src: false }) + 8, 0);
        const h = 44 + qh + (ans.length ? 18 + ah : 0) + 10;
        if (y + h > 930) return;
        K.layer(a * (cur && !hl && said.length ? 0.55 : 1), () => {
          K.card(80, y, 1760, h, { r: 20, fill: 'rgba(17,19,27,.92)', stroke: K.rgba(L.tier('open').color, 0.3 + 0.6 * hl), glow: hl * 0.8, shadow: false, lw: 2 });
          L.tdot(130, y + 50, 22, 'open', { glow: hl });
          L.textBox(q.q.text, 180, y + 60, 1560, { size: 34, max: 2, color: hl ? C.strong : C.body });
          let ay = y + 44 + qh + 18;
          ans.forEach((x) => { ay += L.lineCard(x, 180, ay - 26, 1620, { size: 24, max: 1, src: false, hl: L.lit(S, t, x) }) + 8; });
        });
        y += h + 18;
      });
      L.foot(t, S);
    };
  };

  /** steel: everything Aaron has set in steel, newest first by the date in its source, as a slowly moving ledger; the
   *  cited ones stop and light. [scene: steel] or [scene: steel @rosie] */
  LS.steel = (o) => {
    const rows = memo(() => {
      const pool = (o.focus && L.get(o.focus) ? [L.get(o.focus)] : ents).flatMap((e) => L.bullets(e).map((b) => ({ b, e })));
      const seen = new Set();
      const out = pool.filter(({ b }) => b.tier === 'steel').filter(({ b }) => { const k = L.plain(b.text).toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
      const dateOf = (b) => ((/\b(20\d\d-\d\d-\d\d)\b/.exec(b.src || '') || [])[1]) || '';
      out.forEach((r) => { r.date = dateOf(r.b); });
      out.sort((a, z) => (z.date > a.date ? 1 : z.date < a.date ? -1 : 0));
      return out;
    });
    return (t, S) => {
      const rs = rows();
      L.bg(t);
      L.head(t, S, { eyebrow: `${rs.length} lines set in steel` });
      const cur = L.now(S, t), rowH = 76, top = 282, viewH = 620;
      const span = Math.max(0, rs.length * rowH - viewH), dur = Math.max(4, S.out || S.dur || 10);
      const ci = cur && cur.b ? rs.findIndex((r) => L.key(r.b) === L.key(cur.b)) : -1;
      let off = span * K.clamp(t / dur);
      if (ci >= 0) off = K.lerp(off, K.clamp(ci * rowH - viewH / 3, 0, span), K.env(t, cur.local - 0.4, cur.localEnd + 0.6, 0.4));
      const c = g(); c.save(); c.beginPath(); c.rect(60, top - 10, 1800, viewH + 20); c.clip();
      rs.forEach((r, i) => {
        const y = top + i * rowH - off;
        if (y < top - rowH || y > top + viewH) return;
        const hl = L.lit(S, t, r.b);
        K.layer(K.io(t, 0.2 + Math.min(i, 8) * 0.06, 0.5), () => {
          K.card(80, y, 1760, rowH - 10, { r: 12, fill: hl ? K.rgba(C.hover, 0.98) : 'rgba(17,19,27,.86)', stroke: K.rgba(L.tier('steel').color, 0.2 + 0.7 * hl), shadow: false, glow: hl * 0.7 });
          L.tdot(116, y + 33, 14, 'steel', { glow: hl });
          K.text(L.plain(r.e.title), 150, y + 43, { font: 'ui', weight: 700, size: 24, color: C.soft, maxW: 260 });
          L.textBox(r.b.text, 430, y + 43, 1180, { size: 27, max: 1, color: hl ? C.strong : C.body });
          K.text(r.date, 1820, y + 43, { font: 'mono', size: 21, color: C.quiet, align: 'right' });
        });
      });
      c.restore();
      const fade = (y0, y1) => { const gr = c.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, K.rgba(C.page, y0 < y1 ? 0.9 : 0)); gr.addColorStop(1, K.rgba(C.page, y0 < y1 ? 0 : 0.9)); c.fillStyle = gr; c.fillRect(60, Math.min(y0, y1), 1800, Math.abs(y1 - y0)); };
      fade(top - 10, top + 40); fade(top + viewH - 40, top + viewH + 10);
      L.foot(t, S);
    };
  };

  /** end: what to keep (the lesson's keep: lines), what the lesson was built on (its claims by tier, as the lore has
   *  them now), the stamp, the next lesson. [scene: end] */
  LS.end = (o) => (t, S) => {
    const DEF = window.__lesson || {};
    L.bg(t, { glow: 0.1 });
    L.head(t, S, { eyebrow: `Lesson ${DEF.id || ''} · ${DEF.title || ''}`, title: S.title || 'What to keep' });
    const keep = DEF.keep || [];
    let y = 290;
    keep.slice(0, 3).forEach((k, i) => {
      const a = K.stagger(t, 0.4, i, 0.5, 0.7);
      const bh = L.textBox(k[1] || '', 0, 0, 1060, { measure: true, size: 30, max: 3 });
      K.layer(a, () => {
        K.card(80, y, 1120, bh + 96, { r: 20, fill: 'rgba(17,19,27,.92)', stroke: K.rgba(C.head, 0.35), shadow: false });
        K.text(k[0], 110, y + 52, { font: 'head', size: 36, weight: 400, color: C.head });
        L.textBox(k[1] || '', 110, y + 100, 1060, { size: 30, max: 3, color: C.body });
      });
      y += bh + 116;
    });
    // built on: every claim of the lesson, counted by its tier today
    const allc = ((window.__timeline || {}).sections || []).flatMap((s) => s.claims || []);
    const seen = new Set(), n = Object.fromEntries(TIER_ORDER.map((x) => [x, 0]));
    let moved = 0;
    allc.forEach((c) => { const b = L.resolve(c.cite); const k = `${c.cite.id}|${c.cite.q}`; if (!b || seen.has(k)) return; seen.add(k); if (n[b.tier] != null) n[b.tier]++; if (c.voicedTier && c.voicedTier !== b.tier) moved++; });
    K.layer(K.io(t, 1.2, 0.8), () => {
      K.card(1260, 290, 580, 470, { r: 20, fill: 'rgba(17,19,27,.92)', stroke: C.line2, shadow: false });
      K.eyebrow('Built on the lore', 1296, 346, { color: C.soft, size: 22 });
      K.text(`${seen.size} lines`, 1294, 410, { font: 'head', size: 52, weight: 400, color: C.strong });
      let yy = 470;
      TIER_ORDER.forEach((tr) => { if (!n[tr]) return; L.tdot(1312, yy - 9, 13, tr); K.text(`${n[tr]}`, 1342, yy, { font: 'mono', size: 28, weight: 600, color: L.tier(tr).color }); K.text(L.tier(tr).label, 1400, yy, { font: 'ui', size: 26, color: C.body }); yy += 44; });
      if (moved) K.text(`${moved} moved since voiced`, 1296, yy + 6, { font: 'ui', size: 22, color: L.tier('open').color });
    });
    if (DEF.next) K.layer(K.io(t, 2.0, 0.8), () => {
      K.text('Next', 1296, 800, { font: 'ui', size: 22, weight: 700, color: C.soft, tracking: 3, upper: true });
      L.textBox(`${DEF.next.n} ${DEF.next.title}`, 1296, 846, 540, { size: 32, max: 2, color: C.strong, font: 'head' });
    });
    K.layer(K.io(t, 2.4, 0.8), () => K.text(`aaronorelup.com/courses/${CFG.slug || ''}`, 80, 912, { font: 'mono', size: 24, color: C.soft }));
    L.foot(t, S);
  };

  window.L = L;
  window.LS = LS;
})();
