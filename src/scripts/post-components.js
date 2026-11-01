// Custom elements that posts can use from plain Markdown (raw HTML is allowed there).
// A post reaches readers two ways: its own /ledger/<slug>/ page, and the homepage panel,
// where openPost() copies the article in with innerHTML. Scripts inside that HTML never run,
// so behaviour lives here as custom elements: PostView loads this module on the standalone
// page and openPost() imports it on the homepage, and the browser upgrades the tags either way.
// The stylesheet is imported by this module, so it reaches both surfaces with it.
//
//   <ao-shots> <video …></video> <ol><li data-t="0:05.4"><img …>Label</li></ol> <figcaption>…
//   <ao-demo name="synthid" part="tournament"> fallback text </ao-demo>
//   <ao-series avg="7"> <table>day, then one column per series</table> <ol><li data-d="2026-09-30">…</li></ol> <figcaption>…
//   <ao-funnel unit="pages"> <ol><li><b>Label</b> <data value="-1634">−1,634</data> note <ul>…</ul></li></ol> <figcaption>…
//   <ao-ask> <details data-via="Connection" data-tool="tool"><summary>Question</summary><pre>call</pre><p>answer</p></details> …
//
// Two behaviours need no tag at all and apply to every post: one player at a time and the image viewer (every
// picture in a post opens full size, zooms and pages through the post's other pictures). They live in
// src/elements/_core/, and enhance() in src/elements/enhance.js; the elements below move to src/elements/ one by one.
// Usage notes: docs/COMPONENTS.md.
import '../styles/post-components.css';
import { AO_LISTEN_PLAY, claim } from '../elements/_core/player.js';
import { openViewer } from '../elements/_core/viewer.js';
import { fmtTime } from '../elements/_lib/time.js';
import { enhance } from '../elements/enhance.js';

// The standalone page runs it by itself; the homepage calls it after it swaps a post in.
export { enhance };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => enhance());
else enhance();

// ---------------------------------------------------------------------------------------
// <ao-ask>: questions put to an AI agent, each with the tool call it became and what came back,
// so a reader sees what a connection can answer and can take the question for their own. Each
// is a <details data-via="Connection" data-tool="tool_name"> holding a <summary> (the question as
// asked), then whatever shows the call (<pre>) and the answer (<p>, <ul>). With JS: a filter per
// connection, a Copy button on each question, and one question open at a time. Without JS: the
// details, which already open and close.
let askGroups = 0;
class AoAsk extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const items = [...this.querySelectorAll(':scope > details')];
    if (!items.length) return;
    this._ready = true;
    const group = 'ao-ask-' + ++askGroups;
    const vias = [];
    for (const d of items) {
      const via = d.dataset.via || '';
      if (via && !vias.includes(via)) vias.push(via);
      const sum = d.querySelector(':scope > summary');
      if (!sum) continue;
      const question = sum.textContent.trim();
      d.setAttribute('name', group); // one open at a time, natively where supported
      d.addEventListener('toggle', () => {
        if (d.open) for (const o of items) if (o !== d && o.open) o.open = false;
      });
      const q = document.createElement('span');
      q.className = 'ao-ask-q';
      q.append(...sum.childNodes);
      sum.append(q);
      if (via || d.dataset.tool) {
        const tag = document.createElement('span');
        tag.className = 'ao-ask-tag';
        if (via) tag.append(via);
        if (d.dataset.tool) {
          const code = document.createElement('code');
          code.textContent = d.dataset.tool;
          tag.append(code);
        }
        sum.append(tag);
      }
      const copy = document.createElement('button');
      copy.type = 'button';
      copy.className = 'ao-ask-copy';
      copy.textContent = 'Copy the question';
      copy.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(question);
          copy.textContent = 'Copied';
        } catch (e) {
          copy.textContent = 'Copy failed: select it instead';
        }
        setTimeout(() => { copy.textContent = 'Copy the question'; }, 1800);
      });
      sum.after(copy);
    }
    if (vias.length > 1) {
      const bar = document.createElement('div');
      bar.className = 'ao-ask-filter';
      bar.setAttribute('role', 'group');
      bar.setAttribute('aria-label', 'Show questions for');
      const pick = (via) => {
        for (const b of bar.children) b.setAttribute('aria-pressed', String(b.dataset.via === via));
        for (const d of items) d.hidden = !!via && d.dataset.via !== via;
      };
      for (const via of ['', ...vias]) {
        const b = document.createElement('button');
        b.type = 'button';
        b.dataset.via = via;
        const count = via ? items.filter((d) => d.dataset.via === via).length : items.length;
        b.textContent = (via || 'All') + ' · ' + count;
        b.addEventListener('click', () => pick(via));
        bar.append(b);
      }
      pick('');
      this.prepend(bar);
    }
    this.classList.add('ao-ask-ready');
  }
}

// ---------------------------------------------------------------------------------------
// <ao-demo name="x" part="y">: an interactive demo written for one post. Its code lives in
// src/scripts/demos/<name>.js and is a separate chunk, fetched only when a post uses it, so
// one post's demo never weighs on the others. The module exports mount(host, part), which
// returns { destroy } or null; whatever the element held before is the no-JS fallback.
// ---------------------------------------------------------------------------------------
// <ao-pan>: a picture far wider than the page (a panorama, a long strip, a storyboard), shown
// at a readable height and panned across instead of shrunk to a sliver. Drag it, swipe it,
// use a trackpad, or focus it and use the arrow keys (Home/End jump to the ends); a minimap
// under it shows the whole picture and where the frame is, and a click on it jumps there.
//   views="A|B"            two or more <img>s become views of one place, one button each; the
//                          frame keeps its place as a fraction of the width, so pictures of
//                          different lengths (an 8:1 and a 12:1 strip) are compared at the
//                          same point of their story
//   stops="0.3:Bridge|…"   buttons that glide the frame's centre to a fraction of the width
//   height="360"           the frame's height in px on wide screens (phones get less)
// Adds Glide (a slow pan to the end; any touch stops it) and Full size (the image viewer).
// Without JS: the images and caption stack, at the page's width.
class AoPan extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const imgs = [...this.querySelectorAll(':scope > img')];
    if (!imgs.length) return;
    this._ready = true;
    this.imgs = imgs;
    const h = parseFloat(this.getAttribute('height') || '');
    if (h > 0) this.style.setProperty('--ao-pan-h', h + 'px');
    const views = (this.getAttribute('views') || '').split('|').map((v) => v.trim());
    imgs.forEach((img, i) => { img.dataset.label = views[i] || img.alt || 'View ' + (i + 1); });

    const stage = document.createElement('div');
    stage.className = 'ao-pan-stage';
    stage.tabIndex = 0;
    stage.setAttribute('role', 'region');
    stage.setAttribute('aria-label', 'Wide picture: drag, or use the arrow keys, to pan');
    const track = document.createElement('div');
    track.className = 'ao-pan-track';
    track.append(...imgs);
    stage.append(track);
    this.stage = stage;

    const mini = document.createElement('div');
    mini.className = 'ao-pan-mini';
    mini.setAttribute('aria-hidden', 'true');
    this.miniImg = document.createElement('img');
    this.miniImg.alt = '';
    this.miniImg.draggable = false;
    this.miniImg.setAttribute('data-no-zoom', '');
    this.win = document.createElement('span');
    this.win.className = 'ao-pan-win';
    mini.append(this.miniImg, this.win);

    const bar = document.createElement('div');
    bar.className = 'ao-pan-bar';
    const mk = (label, cls, fn, title) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ao-pan-btn' + (cls ? ' ' + cls : '');
      b.textContent = label;
      if (title) b.title = title;
      b.addEventListener('click', fn);
      bar.append(b);
      return b;
    };
    this.viewBtns = imgs.length > 1 ? imgs.map((img, i) => mk(img.dataset.label, 'ao-pan-view', () => this.show(i))) : [];
    for (const part of (this.getAttribute('stops') || '').split('|')) {
      const k = part.indexOf(':');
      const f = parseFloat(k < 0 ? part : part.slice(0, k));
      if (!isFinite(f)) continue;
      mk(k < 0 ? Math.round(f * 100) + '%' : part.slice(k + 1).trim(), 'ao-pan-stop', () => this.glideTo(f, 900), 'Pan to here');
    }
    this.glideBtn = mk('Glide', 'ao-pan-glide', () => (this.anim ? this.stop() : this.glide()), 'Pan slowly to the end');
    mk('Full size', 'ao-pan-zoom', () => openViewer(this.imgs[this.cur], this.imgs), 'Open the picture full size, to zoom in');

    const cap = this.querySelector(':scope > figcaption');
    this.insertBefore(bar, cap || null);
    this.insertBefore(mini, bar);
    this.insertBefore(stage, mini);

    // Mouse drag pans (touch and trackpads already scroll natively).
    let drag = null;
    stage.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      this.stop();
      drag = { x: e.clientX, left: stage.scrollLeft };
      stage.setPointerCapture(e.pointerId);
      stage.classList.add('ao-pan-dragging');
    });
    stage.addEventListener('pointermove', (e) => {
      if (drag) stage.scrollLeft = drag.left - (e.clientX - drag.x);
    });
    const end = () => { drag = null; stage.classList.remove('ao-pan-dragging'); };
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);
    stage.addEventListener('wheel', () => this.stop(), { passive: true });
    stage.addEventListener('touchstart', () => this.stop(), { passive: true });
    stage.addEventListener('keydown', (e) => {
      const step = stage.clientWidth * (e.shiftKey ? 0.9 : 0.25);
      const go = { ArrowRight: step, ArrowLeft: -step, End: Infinity, Home: -Infinity }[e.key];
      if (go === undefined) return;
      e.preventDefault();
      this.stop();
      const to = isFinite(go) ? stage.scrollLeft + go : go > 0 ? stage.scrollWidth : 0;
      stage.scrollTo({ left: to, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    stage.addEventListener('scroll', () => this.paint(), { passive: true });

    const jump = (e) => {
      const r = mini.getBoundingClientRect();
      this.stop();
      this.centreAt((e.clientX - r.left) / r.width);
    };
    let miniDrag = false;
    mini.addEventListener('pointerdown', (e) => { miniDrag = true; mini.setPointerCapture(e.pointerId); jump(e); });
    mini.addEventListener('pointermove', (e) => { if (miniDrag) jump(e); });
    mini.addEventListener('pointerup', () => { miniDrag = false; });

    for (const img of imgs) img.addEventListener('load', () => this.paint());
    this.ro = new ResizeObserver(() => this.paint());
    this.ro.observe(stage);
    this.onStop = () => this.stop();
    document.addEventListener('ao-stop', this.onStop);
    this.cur = 0;
    this.show(0);
    this.classList.add('ao-pan-ready');
  }

  disconnectedCallback() {
    this.stop();
    if (this.ro) this.ro.disconnect();
    if (this.onStop) document.removeEventListener('ao-stop', this.onStop);
  }

  // Where the frame's centre sits, as a fraction of the picture's width.
  frac() {
    const s = this.stage;
    return s.scrollWidth > 0 ? (s.scrollLeft + s.clientWidth / 2) / s.scrollWidth : 0;
  }

  centreAt(f) {
    const s = this.stage;
    s.scrollLeft = Math.max(0, Math.min(s.scrollWidth - s.clientWidth, f * s.scrollWidth - s.clientWidth / 2));
  }

  show(i) {
    const keep = this.frac();
    this.cur = i;
    this.imgs.forEach((img, k) => {
      const on = k === i;
      img.classList.toggle('ao-pan-off', !on);
      if (on) img.loading = 'eager';
    });
    this.viewBtns.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    const img = this.imgs[i];
    this.miniImg.src = img.currentSrc || img.src;
    const restore = () => {
      if (this._shown) this.centreAt(keep);
      this._shown = true;
      this.paint();
    };
    if (img.complete && img.naturalWidth) restore(); else img.addEventListener('load', restore, { once: true });
  }

  paint() {
    const s = this.stage;
    if (!s || !s.scrollWidth) return;
    this.win.style.left = (s.scrollLeft / s.scrollWidth) * 100 + '%';
    this.win.style.width = Math.min(100, (s.clientWidth / s.scrollWidth) * 100) + '%';
  }

  glideTo(f, ms) {
    this.stop();
    const s = this.stage;
    const to = Math.max(0, Math.min(s.scrollWidth - s.clientWidth, f * s.scrollWidth - s.clientWidth / 2));
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { s.scrollLeft = to; return; }
    this.run(s.scrollLeft, to, ms, (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2));
  }

  // About 30 seconds for the whole width, the pace of a scroll video.
  glide() {
    const s = this.stage;
    const max = s.scrollWidth - s.clientWidth;
    if (max <= 0) return;
    const from = s.scrollLeft >= max - 2 ? 0 : s.scrollLeft;
    this.run(from, max, 30000 * ((max - from) / max), (t) => t);
    this.glideBtn.textContent = 'Stop';
    this.glideBtn.setAttribute('aria-pressed', 'true');
  }

  run(from, to, ms, ease) {
    const s = this.stage;
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / Math.max(1, ms));
      s.scrollLeft = from + (to - from) * ease(t);
      if (t < 1) this.anim = requestAnimationFrame(step); else this.stop();
    };
    this.anim = requestAnimationFrame(step);
  }

  stop() {
    if (this.anim) cancelAnimationFrame(this.anim);
    this.anim = 0;
    if (this.glideBtn) {
      this.glideBtn.textContent = 'Glide';
      this.glideBtn.setAttribute('aria-pressed', 'false');
    }
  }
}

// ---------------------------------------------------------------------------------------
// <ao-treemap>: parts of a whole whose parts have parts, drawn as nested rectangles with
// areas in proportion. Written once as a plain <table>: first column = the groups (projects),
// every other column = a kind of part (languages), cells = amounts. Each group is a block, its
// parts tiles coloured by column. A second view (`views="By project|By language"`) turns it
// inside out: one block per column, the groups as its tiles. `top="6"` keeps the six largest
// columns and folds the rest into "Other". Pointing at a tile, or focusing the chart and using
// the arrow keys, reads it out. The table stays for screen readers; without JS it is the table.
function squarify(items, x, y, w, h) {
  // items: [{v}], sorted descending, v > 0. Returns the same items with x, y, w, h set.
  const out = [];
  let rest = items.slice();
  const total = rest.reduce((a, b) => a + b.v, 0);
  if (!total || w <= 0 || h <= 0) return out;
  const scale = (w * h) / total;
  const worst = (row, side) => {
    const s = row.reduce((a, b) => a + b.v * scale, 0);
    let mx = 0, mn = Infinity;
    for (const r of row) { mx = Math.max(mx, r.v * scale); mn = Math.min(mn, r.v * scale); }
    return Math.max((side * side * mx) / (s * s), (s * s) / (side * side * mn));
  };
  while (rest.length) {
    const side = Math.min(w, h);
    const row = [rest[0]];
    let i = 1;
    while (i < rest.length && worst([...row, rest[i]], side) <= worst(row, side)) row.push(rest[i++]);
    rest = rest.slice(i);
    const area = row.reduce((a, b) => a + b.v * scale, 0);
    if (w >= h) {
      const cw = area / h;
      let cy = y;
      for (const r of row) { const ch = (r.v * scale) / cw; out.push(Object.assign(r, { x, y: cy, w: cw, h: ch })); cy += ch; }
      x += cw; w -= cw;
    } else {
      const ch = area / w;
      let cx = x;
      for (const r of row) { const cw = (r.v * scale) / ch; out.push(Object.assign(r, { x: cx, y, w: cw, h: ch })); cx += cw; }
      y += ch; h -= ch;
    }
  }
  return out;
}
class AoTreemap extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const table = this.querySelector(':scope > table');
    if (!table) return;
    const head = [...table.querySelectorAll('thead th')].map((th) => th.textContent.trim());
    const num = (c) => { const n = parseFloat(String(c || '').replace(/[^0-9.\-]/g, '')); return Number.isFinite(n) && n > 0 ? n : 0; };
    let rows = [...table.querySelectorAll('tbody tr')].map((tr) => {
      const cells = [...tr.children];
      return { label: cells[0]?.textContent.trim() || '', values: cells.slice(1).map((c) => num(c.textContent)) };
    }).filter((r) => r.values.some((v) => v > 0));
    if (!rows.length) return;
    this._ready = true;
    let cols = head.slice(1);
    // Fold the smaller columns into "Other" when `top` asks for it.
    const top = parseInt(this.getAttribute('top'), 10);
    if (top > 0 && cols.length > top) {
      const sums = cols.map((_, k) => rows.reduce((a, r) => a + (r.values[k] || 0), 0));
      const keep = sums.map((s, k) => [s, k]).sort((a, b) => b[0] - a[0]).slice(0, top).map((p) => p[1]).sort((a, b) => a - b);
      rows = rows.map((r) => ({
        label: r.label,
        values: [...keep.map((k) => r.values[k] || 0), r.values.reduce((a, v, k) => a + (keep.includes(k) ? 0 : v), 0)],
      }));
      cols = [...keep.map((k) => cols[k]), 'Other'];
    }
    this.cols = cols;
    this.rows = rows;
    this.total = rows.reduce((a, r) => a + r.values.reduce((x, y) => x + y, 0), 0);
    this.unit = this.getAttribute('unit') || '';
    const aspect = this.getAttribute('aspect');
    if (aspect) this.style.setProperty('--ao-aspect', aspect);
    const views = (this.getAttribute('views') || '').split('|').map((v) => v.trim()).filter(Boolean);
    this.view = 0;

    const wrap = document.createElement('div');
    wrap.className = 'ao-tm';
    const bar = document.createElement('div');
    bar.className = 'ao-tm-bar';
    if (views.length > 1) {
      this.viewBtns = views.slice(0, 2).map((label, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = label;
        b.setAttribute('aria-pressed', String(i === 0));
        b.addEventListener('click', () => this.setView(i));
        bar.append(b);
        return b;
      });
    }
    const legend = document.createElement('div');
    legend.className = 'ao-tm-legend';
    cols.forEach((c, k) => {
      const key = document.createElement('span');
      key.className = 'ao-tm-key';
      key.style.setProperty('--tm', `var(--tm-${k % 8})`);
      key.textContent = c;
      legend.append(key);
    });
    bar.append(legend);
    this.stage = document.createElement('div');
    this.stage.className = 'ao-tm-stage';
    this.stage.tabIndex = 0;
    this.stage.setAttribute('role', 'img');
    this.stage.setAttribute('aria-label', 'Treemap; the table it is drawn from follows. Arrow keys read the tiles.');
    this.read = document.createElement('p');
    this.read.className = 'ao-tm-read';
    this.read.setAttribute('aria-live', 'polite');
    wrap.append(bar, this.stage, this.read);
    table.classList.add('ao-tm-table');
    table.before(wrap);

    this.cur = -1;
    this.stage.addEventListener('pointermove', (e) => {
      const t = e.target.closest('.ao-tm-tile');
      if (t) this.focusTile(+t.dataset.i, false);
    });
    this.stage.addEventListener('pointerleave', () => { if (document.activeElement !== this.stage) this.focusTile(-1, false); });
    this.stage.addEventListener('keydown', (e) => {
      const n = this.tiles?.length || 0;
      if (!n) return;
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (step) { e.preventDefault(); this.focusTile((this.cur + step + n) % n, true); }
      else if (e.key === 'Home') { e.preventDefault(); this.focusTile(0, true); }
      else if (e.key === 'End') { e.preventDefault(); this.focusTile(n - 1, true); }
    });
    this.stage.addEventListener('focus', () => { if (this.cur < 0) this.focusTile(0, true); });
    this.ro = new ResizeObserver(() => this.paint());
    this.ro.observe(this.stage);
    this.classList.add('ao-treemap-ready');
    this.paint();
  }
  disconnectedCallback() { this.ro?.disconnect(); }
  setView(i) {
    this.view = i;
    this.viewBtns?.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    this.cur = -1;
    this.paint();
    this.read.textContent = '';
  }
  groups() {
    // The outer blocks for the current view, each with its inner tiles, sorted descending.
    const { rows, cols } = this;
    const g = this.view === 0
      ? rows.map((r) => ({ label: r.label, parts: r.values.map((v, k) => ({ v, label: cols[k], k, group: r.label })) }))
      : cols.map((c, k) => ({ label: c, k, parts: rows.map((r) => ({ v: r.values[k] || 0, label: r.label, k, group: c })) }));
    for (const b of g) {
      b.parts = b.parts.filter((p) => p.v > 0).sort((a, b2) => b2.v - a.v);
      b.v = b.parts.reduce((a, p) => a + p.v, 0);
    }
    return g.filter((b) => b.v > 0).sort((a, b) => b.v - a.v);
  }
  fmt(v) { return v.toLocaleString('en-US') + (this.unit ? ' ' + this.unit : ''); }
  pct(v) { const p = (100 * v) / this.total; return (p >= 10 ? p.toFixed(0) : p.toFixed(1)) + '%'; }
  paint() {
    const W = this.stage.clientWidth, H = this.stage.clientHeight;
    if (!W || !H) return;
    const blocks = squarify(this.groups(), 0, 0, W, H);
    this.stage.textContent = '';
    this.tiles = [];
    const pad = 2, headH = 20;
    for (const b of blocks) {
      const el = document.createElement('div');
      el.className = 'ao-tm-block';
      Object.assign(el.style, { left: b.x + 'px', top: b.y + 'px', width: b.w + 'px', height: b.h + 'px' });
      const labelled = b.w > 64 && b.h > 44;
      const inner = { x: pad, y: labelled ? headH : pad, w: b.w - 2 * pad, h: b.h - (labelled ? headH : pad) - pad };
      if (labelled) {
        const name = document.createElement('span');
        name.className = 'ao-tm-name';
        name.textContent = b.label;
        el.append(name);
      }
      for (const p of squarify(b.parts.map((q) => ({ ...q })), inner.x, inner.y, inner.w, inner.h)) {
        const t = document.createElement('span');
        t.className = 'ao-tm-tile';
        t.dataset.i = String(this.tiles.length);
        t.style.setProperty('--tm', `var(--tm-${p.k % 8})`);
        Object.assign(t.style, { left: p.x + 'px', top: p.y + 'px', width: Math.max(0, p.w - 1) + 'px', height: Math.max(0, p.h - 1) + 'px' });
        if (p.w > 58 && p.h > 30) {
          const l = document.createElement('span');
          l.className = 'ao-tm-label';
          l.textContent = this.view === 0 && blocks.length > 1 && !labelled ? p.group : p.label;
          t.append(l);
        }
        el.append(t);
        this.tiles.push({ el: t, p, block: b });
      }
      this.stage.append(el);
    }
    if (this.cur >= 0 && this.tiles[this.cur]) this.focusTile(this.cur, false);
  }
  focusTile(i, keyed) {
    this.tiles?.forEach((t, k) => t.el.classList.toggle('ao-tm-on', k === i));
    this.cur = i;
    const t = this.tiles?.[i];
    if (!t) { this.read.textContent = ''; return; }
    const { p, block } = t;
    const outer = this.view === 0 ? p.group : p.label;
    const part = this.view === 0 ? p.label : p.group;
    this.read.textContent = `${outer} · ${part}: ${this.fmt(p.v)} (${this.pct(p.v)} of all). ${block.label} in all: ${this.fmt(block.v)} (${this.pct(block.v)}).`;
  }
}


// ---------------------------------------------------------------------------------------
// <ao-matrix>: one subject run through a grid of settings (a method per row, a target per
// column), every cell shown the same size, with buttons that switch every cell between views of
// the same output at once (textured / clay, before / after, front / back).
//   cols="A|B|C"     column headings, left to right
//   views="X|Y"      one button per view; a cell's nth <img> is its nth view (default: one view)
//   aspect="w/h"     the frame every picture is fitted into (default 1/1)
// Each child <div data-row="Label|note"> is a row of <figure>s; <figure class="none">text</figure>
// is an empty cell. Switching views on one matrix switches every matrix on the page that has the
// same views, so a reader comparing two subjects keeps one look. Without JS: the rows, every
// picture showing. Only the pictures in view open in the image viewer, and page through in order.
const MATRIX_VIEW = 'ao-matrix-view';
class AoMatrix extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const rows = [...this.querySelectorAll(':scope > div[data-row]')];
    if (!rows.length) return;
    this._ready = true;
    const cols = (this.getAttribute('cols') || '').split('|').map((c) => c.trim()).filter(Boolean);
    const n = Math.max(cols.length, ...rows.map((r) => r.querySelectorAll(':scope > figure').length));
    this.style.setProperty('--ao-cols', String(n));
    const aspect = this.getAttribute('aspect');
    if (aspect) this.style.setProperty('--ao-aspect', aspect);
    this.views = (this.getAttribute('views') || '').split('|').map((v) => v.trim()).filter(Boolean);

    const grid = document.createElement('div');
    grid.className = 'ao-matrix-grid';
    grid.setAttribute('role', 'table');
    const corner = document.createElement('span');
    corner.className = 'ao-matrix-corner';
    grid.append(corner);
    for (let i = 0; i < n; i++) {
      const h = document.createElement('span');
      h.className = 'ao-matrix-col';
      h.setAttribute('role', 'columnheader');
      h.textContent = cols[i] || '';
      grid.append(h);
    }
    for (const r of rows) {
      const [label, note] = r.getAttribute('data-row').split('|');
      const head = document.createElement('div');
      head.className = 'ao-matrix-row';
      head.setAttribute('role', 'rowheader');
      const b = document.createElement('b');
      b.textContent = label.trim();
      head.append(b);
      if (note) {
        const s = document.createElement('span');
        s.textContent = note.trim();
        head.append(s);
      }
      grid.append(head);
      const figs = [...r.querySelectorAll(':scope > figure')];
      for (let i = 0; i < n; i++) {
        const f = figs[i] || document.createElement('figure');
        if (!figs[i]) f.className = 'none';
        f.classList.add('ao-matrix-cell');
        // On a phone the column heading sits above the grid, out of sight: each cell says it.
        if (cols[i]) f.dataset.col = cols[i];
        grid.append(f);
      }
      r.remove();
    }
    this.cells = [...grid.querySelectorAll('figure:not(.none)')];

    if (this.views.length > 1) {
      const bar = document.createElement('div');
      bar.className = 'ao-matrix-bar';
      bar.setAttribute('role', 'group');
      bar.setAttribute('aria-label', 'Show every cell as');
      this.btns = this.views.map((v, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ao-matrix-btn';
        btn.textContent = v;
        btn.addEventListener('click', () => {
          this.show(i);
          document.dispatchEvent(new CustomEvent(MATRIX_VIEW, { detail: { from: this, views: this.views.join('|'), i } }));
        });
        bar.append(btn);
        return btn;
      });
      this.prepend(bar);
      this.onView = (e) => {
        if (e.detail.from !== this && e.detail.views === this.views.join('|')) this.show(e.detail.i);
      };
      document.addEventListener(MATRIX_VIEW, this.onView);
    }
    const cap = this.querySelector(':scope > figcaption');
    if (cap) this.insertBefore(grid, cap); else this.append(grid);
    this.show(0);
    this.classList.add('ao-matrix-ready');
  }

  disconnectedCallback() {
    if (this.onView) document.removeEventListener(MATRIX_VIEW, this.onView);
  }

  show(i) {
    for (const f of this.cells) {
      const imgs = [...f.querySelectorAll(':scope > img')];
      const k = Math.min(i, imgs.length - 1);
      imgs.forEach((img, j) => {
        img.classList.toggle('ao-matrix-off', j !== k);
        // A view only fetches its pictures once someone asks for it.
        if (j === k && img.loading === 'lazy' && i > 0) img.loading = 'eager';
      });
    }
    (this.btns || []).forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
  }
}

const DEMOS = {
  synthid: () => import('./demos/synthid.js'),
  cf: () => import('./demos/cf.js'),
};
class AoDemo extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const load = DEMOS[this.getAttribute('name')];
    if (!load) return;
    this._ready = true;
    load()
      .then((mod) => {
        if (this.isConnected) this._demo = mod.mount(this, this.getAttribute('part'));
      })
      .catch(() => { this._ready = false; });
  }

  disconnectedCallback() {
    // The homepage swaps posts in and out of one host; stop timers when this one leaves.
    this._demo?.destroy?.();
  }
}

if (!customElements.get('ao-demo')) customElements.define('ao-demo', AoDemo);
if (!customElements.get('ao-ask')) customElements.define('ao-ask', AoAsk);
if (!customElements.get('ao-matrix')) customElements.define('ao-matrix', AoMatrix);
if (!customElements.get('ao-pan')) customElements.define('ao-pan', AoPan);
if (!customElements.get('ao-treemap')) customElements.define('ao-treemap', AoTreemap);
