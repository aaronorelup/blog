// The grid, drawn after janus's diagram in the Tea House palette.
// Columns = positions (inputs along the bottom, predicted next tokens along the top),
// rows = layers (layer 1 at the bottom). One SVG, rebuilt on resize or config change,
// repainted (classes only) on every state change.
import { key } from './model.js';

const NS = 'http://www.w3.org/2000/svg';
const MARKERS = ['res', 'kv', 'att', 'mlp', 'route', 'tok', 'quiet'];

function mk(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
const f = (n) => Math.round(n * 10) / 10;
// corner radius for a cell-sized rect: round on roomy cells, nearly square on dense grids
const crx = (c) => f(Math.min(10, c.ch * 0.22, c.cw * 0.22));

export class Grid {
  constructor(host, opts = {}) {
    this.host = host;
    this.opts = opts;
    this.el = new Map();
    this.cfg = null;
    this.cursor = null;
    this.svg = mk('svg', { class: 'g-root', role: 'application', tabindex: '0', 'aria-roledescription': 'grid of layers and positions' });
    host.appendChild(this.svg);
    this.svg.addEventListener('pointermove', (e) => this._move(e));
    this.svg.addEventListener('pointerleave', () => { this._hover = null; this.opts.onHover?.(null); });
    this.svg.addEventListener('click', (e) => this._click(e));
    this.svg.addEventListener('keydown', (e) => this._key(e));
    this.svg.addEventListener('focus', () => { if (!this.cursor && this.cfg) this.cursor = { l: 1, p: 0 }; this._drawCursor(); this.opts.onFocusCell?.(this.cursor); });
    this.svg.addEventListener('blur', () => this._drawCursor());
    this.ro = new ResizeObserver(() => this._resized());
    this.ro.observe(host);
  }

  configure(cfg) {
    this.cfg = { detail: 'auto', ...cfg };
    if (this.cursor && (this.cursor.l > cfg.L || this.cursor.p >= cfg.P)) this.cursor = { l: 1, p: 0 };
    this.build();
  }

  _resized() {
    const w = this.host.clientWidth, h = this.host.clientHeight;
    if (!w || !h || (!this._dirty && w === this._w && h === this._h)) return;
    this.build();
  }

  // ---------------------------------------------------------------- geometry
  _geom() {
    const { L, P } = this.cfg;
    const W = this.host.clientWidth, H = this.host.clientHeight;
    this._w = W; this._h = H;
    const fs = Math.max(11, Math.min(15, Math.min(W / 46, H / 26)));
    const gl = fs * 2.6, gr = fs * 0.6, gt = fs * 2.3 + (this.cfg.chipRoom ?? 26), gb = fs * 2.3;
    let cw = (W - gl - gr) / P, ch = (H - gt - gb) / L;
    cw = Math.min(cw, 230); ch = Math.min(ch, 170);
    // keep cells from getting absurdly tall or wide
    if (ch > cw * 1.25) ch = cw * 1.25;
    if (cw > ch * 2.1) cw = ch * 2.1;
    const gw = cw * P, gh = ch * L;
    const ox = gl + Math.max(0, (W - gl - gr - gw) / 2);
    const oy = gt + Math.max(0, (H - gt - gb - gh) / 2);
    const detailOk = cw >= 62 && ch >= 50;
    const want = this.cfg.detail;
    const detail = want === 'off' ? false : detailOk && (want === 'on' || (L * P <= 48 && P <= 8));
    return { W, H, fs, cw, ch, ox, oy, gw, gh, detail, detailOk };
  }

  cell(l, p) {
    const g = this.g;
    return { x0: g.ox + p * g.cw, y0: g.oy + (this.cfg.L - l) * g.ch, cw: g.cw, ch: g.ch };
  }
  // detailed anchors
  rx(l, p) { const c = this.cell(l, p); return c.x0 + c.cw * 0.64; }
  kvPt(l, p) {
    const c = this.cell(l, p);
    if (!this.g.detail) { const s = this.sq(l, p); return { x: s.x + s.s * 0.18, y: s.y + s.s * 0.82, r: Math.max(2.5, s.s * 0.1) }; }
    return { x: c.x0 + c.cw * 0.34, y: c.y0 + c.ch * 0.8, r: Math.max(3.5, Math.min(9, Math.min(c.cw, c.ch) * 0.055)) };
  }
  att(l, p) {
    const c = this.cell(l, p);
    if (!this.g.detail) { const s = this.sq(l, p); return { cx: s.x + s.s / 2, cy: s.y + s.s / 2, w: s.s, h: s.s }; }
    return { cx: c.x0 + c.cw * 0.34, cy: c.y0 + c.ch * 0.55, w: c.cw * 0.27, h: Math.max(8, c.ch * 0.15) };
  }
  mlp(l, p) {
    const c = this.cell(l, p);
    return { cx: c.x0 + c.cw * 0.34, cy: c.y0 + c.ch * 0.24, w: c.cw * 0.3, h: Math.max(8, c.ch * 0.15) };
  }
  sq(l, p) {
    const c = this.cell(l, p);
    const s = Math.max(8, Math.min(c.cw, c.ch) * 0.44);
    return { x: c.x0 + (c.cw - s) / 2, y: c.y0 + (c.ch - s) / 2, s };
  }
  colX(p) { return this.g.detail ? this.rx(1, p) : this.g.ox + (p + 0.5) * this.g.cw; }
  topY() { return this.g.oy - this.g.fs * 0.55; }
  botY() { return this.g.oy + this.g.gh + this.g.fs * 0.55; }

  // ---------------------------------------------------------------- path builders
  arcD(l, q, p) {
    if (this.g.detail) {
      const a = this.kvPt(l, q), b = this.att(l, p), c = this.cell(l, q);
      if (q === p) return `M${f(a.x)},${f(a.y - a.r)} L${f(a.x)},${f(b.cy + b.h / 2 + 1)}`;
      const d = p - q, P = this.cfg.P;
      const dip = c.ch * (0.06 + 0.11 * (d - 1) / Math.max(1, P - 2));
      const yd = Math.min(a.y + dip, c.y0 + c.ch * 0.985);
      const ex = b.cx - b.w * 0.3, ey = b.cy + b.h / 2 + 1;
      const sx = a.x + a.r * 0.8, sy = a.y + a.r * 0.6;
      const span = ex - sx;
      return `M${f(sx)},${f(sy)} C${f(sx + span * 0.12)},${f(yd)} ${f(sx + span * 0.3)},${f(yd)} ${f(sx + span * 0.55)},${f(yd)} S${f(ex - c.cw * 0.12)},${f(yd)} ${f(ex)},${f(ey)}`;
    }
    if (q === p) return null;
    const a = this.sq(l, q), b = this.sq(l, p), c = this.cell(l, q);
    const d = p - q, P = this.cfg.P;
    const base = a.y + a.s;
    const room = c.y0 + c.ch * 0.98 - base;
    const yd = base + room * (0.3 + 0.7 * (d - 1) / Math.max(1, P - 2));
    const sx = a.x + a.s * 0.82, ex = b.x + b.s * 0.18;
    return `M${f(sx)},${f(base)} C${f(sx + 4)},${f(yd)} ${f(ex - 4)},${f(yd)} ${f(ex)},${f(base + 1)}`;
  }
  kvBranchD(l, p) { // residual entering layer l -> K/V dot
    const c = this.cell(l, p), k = this.kvPt(l, p), x = this.rx(l, p);
    const y = c.y0 + c.ch * 0.985;
    return `M${f(x)},${f(y)} C${f(x)},${f(k.y + (y - k.y) * 0.2)} ${f(k.x + k.r * 3)},${f(k.y)} ${f(k.x + k.r)},${f(k.y)}`;
  }
  qBranchD(l, p) { // residual -> attention (the query)
    const c = this.cell(l, p), a = this.att(l, p), x = this.rx(l, p);
    const y = c.y0 + c.ch * 0.76, ey = a.cy + a.h / 2;
    const ex = a.cx + a.w * 0.3;
    return `M${f(x)},${f(y)} C${f(x - c.cw * 0.06)},${f(y - 2)} ${f(ex)},${f(y)} ${f(ex)},${f(ey + 1)}`;
  }
  aoD(l, p) { // attention output -> joins the residual
    const a = this.att(l, p), x = this.rx(l, p);
    return `M${f(a.cx + a.w / 2)},${f(a.cy)} L${f(x - 1.5)},${f(a.cy)}`;
  }
  mrD(l, p) { // residual (now residual + attention) -> MLP
    const c = this.cell(l, p), m = this.mlp(l, p), x = this.rx(l, p);
    const y = c.y0 + c.ch * 0.44, ex = m.cx + m.w * 0.32, ey = m.cy + m.h / 2;
    return `M${f(x)},${f(y)} C${f(x - c.cw * 0.06)},${f(y - 2)} ${f(ex)},${f(y)} ${f(ex)},${f(ey + 1)}`;
  }
  moD(l, p) { // MLP output -> added to the residual
    const c = this.cell(l, p), m = this.mlp(l, p), x = this.rx(l, p);
    const sx = m.cx, sy = m.cy - m.h / 2, ey = c.y0 + c.ch * 0.05;
    return `M${f(sx)},${f(sy)} C${f(sx)},${f(ey + (sy - ey) * 0.3)} ${f(x - c.cw * 0.08)},${f(ey)} ${f(x - 1.5)},${f(ey)}`;
  }
  resD(l, p, upper) {
    const c = this.cell(l, p), L = this.cfg.L;
    if (this.g.detail) {
      const x = this.rx(l, p), a = this.att(l, p);
      if (!upper) return `M${f(x)},${f(l === 1 ? this.botY() : c.y0 + c.ch)} L${f(x)},${f(a.cy)}`;
      return `M${f(x)},${f(a.cy)} L${f(x)},${f(l === L ? this.topY() : c.y0)}`;
    }
    const s = this.sq(l, p), x = s.x + s.s / 2;
    if (!upper) {
      const from = l === 1 ? this.botY() : this.sq(l - 1, p).y;
      return `M${f(x)},${f(from)} L${f(x)},${f(s.y + s.s + 1)}`;
    }
    return `M${f(x)},${f(s.y)} L${f(x)},${f(this.topY())}`; // only used for the top stub
  }
  _tokGeom(p) {
    const x1 = this.colX(p), x2 = this.colX(p + 1);
    const xg = this.g.ox + (p + 1) * this.g.cw + this.g.cw * (this.g.detail ? 0.05 : 0.0);
    const yt = this.g.oy - this.g.fs * 0.15, yb = this.g.oy + this.g.gh + this.g.fs * 0.15;
    const r = Math.min(10, this.g.cw * 0.1);
    return { x1, x2, xg, yt, yb, r };
  }
  tokD(p) { // the sampled token: top of column p -> bottom of column p+1 (one path, for routes)
    const { x1, x2, xg, yt, yb, r } = this._tokGeom(p);
    return `M${f(x1 + 3)},${f(yt)} L${f(xg - r)},${f(yt)} Q${f(xg)},${f(yt)} ${f(xg)},${f(yt + r)} L${f(xg)},${f(yb - r)} Q${f(xg)},${f(yb)} ${f(xg + r)},${f(yb)} L${f(x2 - 4)},${f(yb)}`;
  }
  // the same arrow in three pieces, so the long drop between columns can rest faint and thin
  tokParts(p) {
    const { x1, x2, xg, yt, yb, r } = this._tokGeom(p);
    return {
      top: `M${f(x1 + 3)},${f(yt)} L${f(xg - r)},${f(yt)} Q${f(xg)},${f(yt)} ${f(xg)},${f(yt + r)}`,
      drop: `M${f(xg)},${f(yt + r)} L${f(xg)},${f(yb - r)}`,
      bot: `M${f(xg)},${f(yb - r)} Q${f(xg)},${f(yb)} ${f(xg + r)},${f(yb)} L${f(x2 - 4)},${f(yb)}`,
    };
  }
  // route pieces
  segD(s) {
    const g = this.g;
    if (s.t === 'hop') return this.arcD(s.l, s.from, s.to);
    if (s.t === 'rise' || s.t === 'top') {
      const l = s.l, p = s.p;
      if (g.detail) {
        const a = this.att(l, p), x = this.rx(l, p);
        let d = `M${f(a.cx + a.w / 2)},${f(a.cy)} L${f(x)},${f(a.cy)}`;
        if (s.t === 'top') return d + ` L${f(x)},${f(this.topY())}`;
        const c2 = this.cell(l + 1, p), k = this.kvPt(l + 1, p), y = c2.y0 + c2.ch * 0.985;
        return d + ` L${f(x)},${f(y)} C${f(x)},${f(k.y + (y - k.y) * 0.2)} ${f(k.x + k.r * 3)},${f(k.y)} ${f(k.x + k.r)},${f(k.y)}`;
      }
      const a = this.sq(l, p), x = a.x + a.s / 2;
      if (s.t === 'top') return `M${f(x)},${f(a.y)} L${f(x)},${f(this.topY())}`;
      const b = this.sq(l + 1, p);
      return `M${f(x)},${f(a.y)} L${f(x)},${f(b.y + b.s)}`;
    }
    if (s.t === 'tok') return this.tokD(s.p);
    if (s.t === 'in') { // input token -> K/V at layer 1
      if (g.detail) {
        const x = this.rx(1, s.p), c = this.cell(1, s.p);
        return `M${f(x)},${f(this.botY())} L${f(x)},${f(c.y0 + c.ch * 0.985)} ` + this.kvBranchD(1, s.p).replace(/^M[^ ]+ /, '');
      }
      const a = this.sq(1, s.p), x = a.x + a.s / 2;
      return `M${f(x)},${f(this.botY())} L${f(x)},${f(a.y + a.s)}`;
    }
    return null;
  }

  // ---------------------------------------------------------------- build
  build() {
    if (!this.cfg) return;
    const W = this.host.clientWidth, H = this.host.clientHeight;
    if (!W || !H) { this._dirty = true; return; }
    this._dirty = false;
    const g = (this.g = this._geom());
    const { L, P, inputs, outputs } = this.cfg;
    const svg = this.svg;
    svg.replaceChildren();
    this.el.clear();
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    svg.setAttribute('aria-label', `${L} layers by ${P} positions. Inputs: ${inputs.join(' ')}. Arrow keys move between cells; Enter selects.`);
    svg.classList.toggle('detail', g.detail);
    svg.style.setProperty('--fs', g.fs + 'px');

    const defs = mk('defs', {}, svg);
    for (const m of MARKERS) {
      const mm = mk('marker', { id: 'mk-' + m, viewBox: '0 0 10 10', refX: '7', refY: '5', markerWidth: '5', markerHeight: '5', orient: 'auto-start-reverse', class: 'mk mk-' + m }, defs);
      mk('path', { d: 'M1,1 L9,5 L1,9 Z' }, mm);
    }
    // gold hatching = "linked through a sampled token" (over the past / future wash)
    for (const side of ['past', 'fut']) {
      const pt = mk('pattern', { id: 'hatch-' + side, patternUnits: 'userSpaceOnUse', width: 7, height: 7, patternTransform: 'rotate(45)' }, defs);
      mk('rect', { width: 7, height: 7, class: 'hb ' + side }, pt);
      mk('line', { x1: 1, y1: 0, x2: 1, y2: 7, class: 'hl' }, pt);
    }

    const L0 = (n) => mk('g', { class: n }, svg);
    const gWash = L0('l-wash'), gTok = L0('l-tok'), gArc = L0('l-arc'), gRes = L0('l-res'),
      gBox = L0('l-box'), gStep = L0('l-step'), gRoute = L0('l-route'), gPulse = L0('l-pulse'), gMark = L0('l-mark'),
      gLab = L0('l-lab'), gCur = L0('l-cur');
    Object.assign(this, { gWash, gTok, gArc, gRes, gBox, gStep, gRoute, gPulse, gMark, gLab, gCur });

    const reg = (k, e) => { e.dataset.k = k; this.el.set(k, e); return e; };
    const path = (parent, k, d, cls, marker) => {
      if (!d) return null;
      return reg(k, mk('path', { d, class: 'el ' + cls, 'marker-end': marker ? `url(#mk-${marker})` : null }, parent));
    };

    // washes
    for (let l = 1; l <= L; l++) for (let p = 0; p < P; p++) {
      const c = this.cell(l, p);
      reg('wash:' + key(l, p), mk('rect', { x: f(c.x0 + 2), y: f(c.y0 + 2), width: f(c.cw - 4), height: f(c.ch - 4), rx: crx(c), class: 'wash' }, gWash));
    }
    // sampled-token arrows (shown only when generating)
    for (let p = 0; p < P - 1; p++) {
      const t = this.tokParts(p);
      const gt = reg('tok:' + p, mk('g', { class: 'el tok' }, gTok));
      mk('path', { d: t.top, class: 'tok-h' }, gt);
      mk('path', { d: t.drop, class: 'tok-v' }, gt);
      mk('path', { d: t.bot, class: 'tok-h', 'marker-end': 'url(#mk-tok)' }, gt);
    }

    for (let l = 1; l <= L; l++) {
      for (let p = 0; p < P; p++) {
        // K/V arcs from (l, q) into attention at (l, p)
        for (let q = 0; q <= p; q++) path(gArc, `arc:${l}:${q}:${p}`, this.arcD(l, q, p), 'kvs' + (q === p ? ' self' : ''), 'kv');
        if (g.detail) {
          path(gRes, `res:${l}:${p}`, this.resD(l, p, false), 'res');
          path(gRes, `resU:${l}:${p}`, this.resD(l, p, true), 'res', l === L ? 'res' : null);
          path(gRes, `kvb:${l}:${p}`, this.kvBranchD(l, p), 'res thin');
          path(gRes, `q:${l}:${p}`, this.qBranchD(l, p), 'res thin', 'res');
          path(gRes, `mr:${l}:${p}`, this.mrD(l, p), 'res thin', 'res');
          path(gRes, `ao:${l}:${p}`, this.aoD(l, p), 'attc', 'att');
          path(gRes, `mo:${l}:${p}`, this.moD(l, p), 'mlpc', 'mlp');
          const a = this.att(l, p), m = this.mlp(l, p), k = this.kvPt(l, p);
          reg(`mlp:${l}:${p}`, mk('rect', { x: f(m.cx - m.w / 2), y: f(m.cy - m.h / 2), width: f(m.w), height: f(m.h), rx: 3, class: 'el box mlp' }, gBox));
          reg(`att:${l}:${p}`, mk('rect', { x: f(a.cx - a.w / 2), y: f(a.cy - a.h / 2), width: f(a.w), height: f(a.h), rx: 3, class: 'el box att' }, gBox));
          reg(`kv:${l}:${p}`, mk('circle', { cx: f(k.x), cy: f(k.y), r: f(k.r), class: 'el kv' }, gBox));
        } else {
          const r = path(gRes, `res:${l}:${p}`, this.resD(l, p, false), 'res', 'res');
          if (l === L) path(gRes, `resU:${l}:${p}`, this.resD(l, p, true), 'res', 'res');
          const s = this.sq(l, p), k = this.kvPt(l, p);
          const sq = reg(`sq:${l}:${p}`, mk('rect', { x: f(s.x), y: f(s.y), width: f(s.s), height: f(s.s), rx: Math.min(4, s.s * 0.12), class: 'el box sq' }, gBox));
          this.el.set(`att:${l}:${p}`, sq); this.el.set(`mlp:${l}:${p}`, sq);
          reg(`kv:${l}:${p}`, mk('circle', { cx: f(k.x), cy: f(k.y), r: f(k.r), class: 'el kv' }, gBox));
        }
      }
    }
    if (!g.detail) for (let l = 1; l < L; l++) for (let p = 0; p < P; p++) this.el.set(`resU:${l}:${p}`, this.el.get(`res:${l + 1}:${p}`));

    // labels
    const tokFs = Math.max(10.5, Math.min(g.fs, g.cw / 5.2));
    const fit = (t) => { const max = Math.max(3, Math.floor(g.cw / (tokFs * 0.62))); return t.length > max ? t.slice(0, max - 1) + '…' : t; };
    for (let p = 0; p < P; p++) {
      const x = g.ox + (p + 0.5) * g.cw;
      const ti = reg('in:' + p, mk('text', { x: f(x), y: f(g.oy + g.gh + g.fs * 1.55), class: 'tokl in', 'font-size': f(tokFs), 'text-anchor': 'middle' }, gLab));
      ti.textContent = fit(inputs[p]);
      mk('title', {}, ti).textContent = `input ${p + 1}: ${inputs[p]}`;
      const to = reg('out:' + p, mk('text', { x: f(x), y: f(g.oy - g.fs * 1.05), class: 'tokl out', 'font-size': f(tokFs), 'text-anchor': 'middle' }, gLab));
      to.textContent = fit(outputs[p]);
      mk('title', {}, to).textContent = `predicted next token at position ${p + 1}: ${outputs[p]}`;
    }
    for (let l = 1; l <= L; l++) {
      const c = this.cell(l, 0);
      const t = mk('text', { x: f(g.ox - g.fs * 0.7), y: f(c.y0 + c.ch / 2 + g.fs * 0.35), class: 'layl', 'font-size': f(g.fs * 0.85), 'text-anchor': 'end' }, gLab);
      t.textContent = 'L' + l;
    }
    const cap = (y, txt) => { const t = mk('text', { x: f(g.ox - g.fs * 0.7), y: f(y), class: 'capl', 'font-size': f(g.fs * 0.72), 'text-anchor': 'end' }, gLab); t.textContent = txt; };
    cap(g.oy - g.fs * 1.05, 'out');
    cap(g.oy + g.gh + g.fs * 1.55, 'in');

    this._drawCursor();
    if (this._last) this.paint(this._last);
    this.opts.onBuild?.(this);
  }

  // ---------------------------------------------------------------- paint
  paint(o = {}) {
    this._last = o;
    if (!this.g) return;
    const svg = this.svg;
    svg.classList.toggle('dimmed', !!o.dim);
    svg.classList.toggle('no-res', o.showRes === false);
    svg.classList.toggle('no-kv', o.showKv === false);
    svg.classList.toggle('show-tok', !!o.tokens);
    svg.classList.toggle('quiet-arcs', !!o.quietArcs);
    for (const e of this.svg.querySelectorAll('.on, .on2, .w-on, [data-c]')) {
      e.classList.remove('on', 'on2', 'w-on');
      if (e.dataset.c) { for (const c of e.dataset.c.split(' ')) e.classList.remove(c); delete e.dataset.c; }
    }
    const add = (k, c) => {
      const e = this.el.get(k); if (!e) return;
      e.classList.add(c);
      if (c !== 'on' && c !== 'on2') e.dataset.c = ((e.dataset.c || '') + ' ' + c).trim();
    };
    for (const k of o.on || []) add(k, 'on');
    for (const k of o.on2 || []) add(k, 'on2');
    if (o.cls) for (const [k, c] of o.cls) for (const cc of c.split(' ')) add(k, cc);
    if (o.wash) for (const [k, c] of o.wash) for (const cc of c.split(' ')) add('wash:' + k, 'w-' + cc);
    // routes drawn over the gold hatching get a page-coloured halo so they stay readable
    svg.classList.toggle('hatched', !!o.wash && [...o.wash.values()].some((c) => /-tok\b/.test(c)));

    // steps
    this.gStep.replaceChildren();
    if (o.steps) for (const [k, txt] of o.steps) {
      const [l, p] = k.split(',').map(Number), c = this.cell(l, p);
      const t = mk('text', { x: f(c.x0 + c.cw - 7), y: f(c.y0 + this.g.fs + 3), class: 'stepl', 'font-size': f(this.g.fs * 0.86), 'text-anchor': 'end' }, this.gStep);
      t.textContent = txt;
    }
    // routes: each route is drawn as runs of same-kind segments (route / sampled token).
    // Three passes (glows, halos, lines) so no route's halo cuts through another route's line.
    this.gRoute.replaceChildren();
    const gGlow = mk('g', {}, this.gRoute), gHalo = mk('g', {}, this.gRoute), gLine = mk('g', {}, this.gRoute);
    for (const r of o.routes || []) {
      const runs = [];
      for (const s of r.segs) {
        const d = this.segD(s); if (!d) continue;
        const tok = s.t === 'tok';
        const last = runs[runs.length - 1];
        if (last && last.tok === tok && !r.split) last.d += ' ' + d; else runs.push({ tok, d });
      }
      const w = r.width ? `stroke-width:${f(r.width)}px` : null;
      for (const run of runs) mk('path', { d: run.d, class: 'route-glow' + (run.tok ? ' tokr' : ''), style: r.width ? `stroke-width:${f(r.width + 7)}px` : null }, gGlow);
      const halos = runs.map((run) => mk('path', { d: run.d, class: 'route-halo', style: r.width ? `stroke-width:${f(r.width + 4)}px` : null }, gHalo));
      const els = runs.map((run, i) => mk('path', { d: run.d, class: 'route ' + (r.cls || '') + (run.tok ? ' tokr' : ''),
        'marker-end': r.arrows === false || (i < runs.length - 1 && !run.tok) ? null : `url(#mk-${run.tok ? 'tok' : 'route'})`, style: w }, gLine));
      if (r.draw) {
        const lens = els.map((e) => e.getTotalLength());
        const tot = lens.reduce((a, b) => a + b, 0) || 1;
        const dur = Math.min(1.4, 0.45 + tot / 900);
        let acc = 0;
        els.forEach((e, i) => {
          if (e.classList.contains('tokr')) { acc += lens[i]; return; }
          for (const x of [e, halos[i]]) {
            x.style.setProperty('--len', lens[i]);
            x.style.animationDuration = (dur * lens[i] / tot).toFixed(3) + 's';
            x.style.animationDelay = (dur * acc / tot).toFixed(3) + 's';
            x.classList.add('draw');
          }
          acc += lens[i];
        });
      }
    }
    // marks (A / B / from / to)
    this.gMark.replaceChildren();
    for (const m of o.marks || []) this._mark(m);
  }

  _mark(m) {
    const g = this.g;
    let x, y, ring;
    if (m.at === 'kv') { const k = this.kvPt(m.l, m.p); x = k.x; y = k.y; ring = Math.max(k.r + 4, g.detail ? 8 : 6); }
    else if (m.at === 'att') { const a = this.att(m.l, m.p); x = a.cx; y = a.cy; ring = Math.max(a.w, a.h) / 2 + 5; }
    else { const c = this.cell(m.l, m.p); x = c.x0 + c.cw / 2; y = c.y0 + c.ch / 2; ring = 0; }
    if (ring) mk('circle', { cx: f(x), cy: f(y), r: f(ring), class: 'mark-ring ' + (m.cls || '') }, this.gMark);
    else if (m.col) { // the whole column: top cell to bottom cell
      const t = this.cell(this.cfg.L, m.p), b = this.cell(1, m.p);
      mk('rect', { x: f(t.x0 + 4), y: f(t.y0 + 4), width: f(t.cw - 8), height: f(b.y0 + b.ch - t.y0 - 8), rx: crx(t), class: 'mark-cell ' + (m.cls || '') }, this.gMark);
    }
    else { const c = this.cell(m.l, m.p); mk('rect', { x: f(c.x0 + 4), y: f(c.y0 + 4), width: f(c.cw - 8), height: f(c.ch - 8), rx: crx(c), class: 'mark-cell ' + (m.cls || '') }, this.gMark); }
    if (m.text && m.at) {
      const t = mk('text', { x: f(x - ring - 3), y: f(y + g.fs * 0.35), class: 'mark-t ' + (m.cls || ''), 'font-size': f(g.fs * 1.15), 'text-anchor': 'end' }, this.gMark);
      t.textContent = m.text;
    } else if (m.text) {
      // FROM / TO: a small chip on the frame's top edge, on the page colour, so the label never
      // sits on a box or a wash
      const c = this.cell(m.l, m.p);
      const fz = Math.max(10.5, g.fs * 0.88), px = 4, py = 2.5, hh = fz + py * 2;
      const x0 = c.x0 + 4 + Math.max(8, crx(c) + 2), yTop = c.y0 + 4 - hh / 2;
      const chip = mk('rect', { x: f(x0), y: f(yTop), height: f(hh), rx: 3, class: 'mark-chip ' + (m.cls || '') }, this.gMark);
      // inline size: the label's CSS font shorthand would otherwise set it to 1em
      const t = mk('text', { x: f(x0 + px), y: f(yTop + py + fz * 0.8), class: 'mark-t ' + (m.cls || ''), style: `font-size:${f(fz)}px` }, this.gMark);
      t.textContent = m.text;
      let tw = 0;
      try { tw = t.getComputedTextLength(); } catch (e) { /* not rendered */ }
      chip.setAttribute('width', f((tw || m.text.length * fz * 0.72) + px * 2));
    }
  }

  // ---------------------------------------------------------------- input
  hit(e) {
    if (!this.g) return null;
    const r = this.svg.getBoundingClientRect();
    // the page may be CSS-zoomed on large screens: map client px back to SVG units
    const sx = r.width ? this._w / r.width : 1, sy = r.height ? this._h / r.height : 1;
    const x = (e.clientX - r.left) * sx, y = (e.clientY - r.top) * sy;
    const { ox, oy, cw, ch } = this.g, { L, P } = this.cfg;
    const p = Math.floor((x - ox) / cw), row = Math.floor((y - oy) / ch);
    if (p < 0 || p >= P || row < 0 || row >= L) return null;
    const l = L - row;
    let part = null;
    const k = this.kvPt(l, p), a = this.att(l, p);
    if (Math.hypot(x - k.x, y - k.y) <= k.r + 7) part = 'kv';
    else if (this.g.detail && Math.abs(x - a.cx) <= a.w / 2 + 4 && Math.abs(y - a.cy) <= a.h / 2 + 4) part = 'att';
    return { l, p, part };
  }
  _move(e) {
    const h = this.hit(e);
    const k = h ? key(h.l, h.p) + (h.part || '') : null;
    if (k === this._hover) return;
    this._hover = k;
    this.svg.style.cursor = h && this.opts.clickable?.(h) !== false ? 'pointer' : 'default';
    this.opts.onHover?.(h, e);
  }
  _click(e) {
    const h = this.hit(e);
    if (!h) return;
    this.cursor = { l: h.l, p: h.p };
    this._drawCursor();
    this.opts.onClick?.(h, e);
  }
  _key(e) {
    if (!this.cfg) return;
    const { L, P } = this.cfg;
    let c = this.cursor || { l: 1, p: 0 };
    const mv = { ArrowUp: [1, 0], ArrowDown: [-1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key];
    if (mv) {
      e.preventDefault();
      c = { l: Math.min(L, Math.max(1, c.l + mv[0])), p: Math.min(P - 1, Math.max(0, c.p + mv[1])) };
      this.cursor = c;
      this._drawCursor();
      this.opts.onFocusCell?.(c);
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.opts.onClick?.({ ...c, part: null, keyboard: true }, e);
      return;
    }
    this.opts.onKey?.(e, c);
  }
  _drawCursor() {
    if (!this.gCur) return;
    this.gCur.replaceChildren();
    if (!this.cursor || document.activeElement !== this.svg || !this.svg.matches(':focus-visible')) return;
    const c = this.cell(this.cursor.l, this.cursor.p);
    mk('rect', { x: f(c.x0 + 1.5), y: f(c.y0 + 1.5), width: f(c.cw - 3), height: f(c.ch - 3), rx: crx(c), class: 'cursor' }, this.gCur);
  }
  setCursor(c) { this.cursor = c; this._drawCursor(); }

  // pulse helpers for the play animation
  pathEl(k) { const e = this.el.get(k); return e && e.tagName === 'path' ? e : null; }
  dot(cls) { return mk('circle', { r: Math.max(3, this.g.fs * 0.3), class: 'pulse ' + cls }, this.gPulse); }
  clearPulses() { this.gPulse?.replaceChildren(); }
  shake(l, p) {
    const e = this.el.get('wash:' + key(l, p)); if (!e) return;
    e.classList.remove('shake'); void e.getBBox(); e.classList.add('shake');
    setTimeout(() => e.classList.remove('shake'), 420);
  }
}
