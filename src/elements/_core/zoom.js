// The viewer's zoom and gestures, mixed into its object (viewer-ui.js): the picture fitted to the stage, zoom around
// a point (wheel, keys, buttons, a click, a double tap, a pinch), pan by dragging, and a swipe that pages or closes.
export const zoom = {
  // Fit the picture into the space between the toolbar and the caption, never past its own
  // pixels. keep=true leaves the zoom where it is (a larger file arrived, or the window moved).
  layout(keep) {
    const r = this.stage.getBoundingClientRect();
    const scale = Math.min(r.width / this.nat.w, r.height / this.nat.h, 1);
    const prev = this.fit.w;
    this.fit = { w: Math.max(1, this.nat.w * scale), h: Math.max(1, this.nat.h * scale) };
    this.img.style.width = this.fit.w + 'px';
    this.img.style.height = this.fit.h + 'px';
    if (keep && prev) {
      const k = prev / this.fit.w;
      this.s *= k;
    } else {
      this.s = 1; this.tx = 0; this.ty = 0;
    }
    this.apply();
  },
  actual() { return Math.max(2, this.nat.w / this.fit.w); },
  max() { return Math.max(4, (this.nat.w / this.fit.w) * 3); },
  zoomTo(s) {
    const r = this.stage.getBoundingClientRect();
    this.zoomAt(r.left + r.width / 2, r.top + r.height / 2, s);
  },
  // Zoom so the point under (x, y) stays under it.
  zoomAt(x, y, s) {
    const r = this.stage.getBoundingClientRect();
    const next = Math.min(this.max(), Math.max(1, s));
    const cx = r.left + r.width / 2 + this.tx;
    const cy = r.top + r.height / 2 + this.ty;
    const k = next / this.s;
    this.tx = x - (x - cx) * k - (r.left + r.width / 2);
    this.ty = y - (y - cy) * k - (r.top + r.height / 2);
    this.s = next;
    this.apply();
  },
  apply(drag) {
    const r = this.stage.getBoundingClientRect();
    const w = this.fit.w * this.s;
    const h = this.fit.h * this.s;
    // Keep the picture over the stage: centred on an axis where it fits, edge to edge where not.
    const mx = Math.max(0, (w - r.width) / 2);
    const my = Math.max(0, (h - r.height) / 2);
    if (this.s <= 1.001) { this.s = 1; if (!drag) { this.tx = 0; this.ty = 0; } }
    else { this.tx = Math.min(mx, Math.max(-mx, this.tx)); this.ty = Math.min(my, Math.max(-my, this.ty)); }
    this.img.style.transform = `translate(-50%, -50%) translate(${this.tx}px, ${this.ty}px) scale(${this.s})`;
    this.dlg.classList.toggle('ao-lb-zoomed', this.s > 1.01);
    const z = this.dlg.querySelector('.ao-lb-zoom');
    z.textContent = this.s > 1.01 ? Math.round((this.s * this.fit.w / this.nat.w) * 100) + '%' : 'fit';
    z.setAttribute('aria-label', this.s > 1.01 ? 'Zoomed to ' + z.textContent + '; fit to screen' : 'Show at full size');
  },
  // Mouse: click the picture to zoom in there, click again to fit; drag to pan when zoomed;
  // click the dark around it to close. Touch: double-tap zooms, pinch zooms, one finger pans
  // when zoomed and swipes to the next picture (or down, to close) when not.
  pointers() {
    const pts = new Map();
    let start = null; // gesture start: pointer positions, zoom, pan
    let lastTap = 0;
    const st = this.stage;
    const mid = () => {
      const v = [...pts.values()];
      return { x: (v[0].x + v[1].x) / 2, y: (v[0].y + v[1].y) / 2, d: Math.hypot(v[0].x - v[1].x, v[0].y - v[1].y) || 1 };
    };
    st.addEventListener('pointerdown', (e) => {
      if (e.button > 0) return;
      st.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      start = { x: e.clientX, y: e.clientY, s: this.s, tx: this.tx, ty: this.ty, moved: false, onImg: e.target === this.img, type: e.pointerType, two: pts.size === 2 ? mid() : null };
      this.dlg.classList.add('ao-lb-active');
    });
    st.addEventListener('pointermove', (e) => {
      if (!pts.has(e.pointerId) || !start) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) {
        const m = mid();
        if (!start.two) start = { ...start, two: m, s: this.s, tx: this.tx, ty: this.ty };
        start.moved = true;
        const r = st.getBoundingClientRect();
        // Pinch: scale about the starting midpoint, then follow the midpoint as it moves.
        const k = Math.min(this.max(), Math.max(1, start.s * (m.d / start.two.d))) / start.s;
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        this.s = start.s * k;
        this.tx = start.two.x - (start.two.x - (cx + start.tx)) * k - cx + (m.x - start.two.x);
        this.ty = start.two.y - (start.two.y - (cy + start.ty)) * k - cy + (m.y - start.two.y);
        this.apply(true);
        return;
      }
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (Math.hypot(dx, dy) > 6) start.moved = true;
      if (!start.moved) return;
      if (this.s > 1.01) { this.tx = start.tx + dx; this.ty = start.ty + dy; this.apply(); }
      else if (start.type !== 'mouse') {
        // Swipe preview: the picture follows the finger.
        this.img.style.transform = `translate(-50%, -50%) translate(${Math.abs(dx) > Math.abs(dy) ? dx : 0}px, ${Math.abs(dy) > Math.abs(dx) ? Math.max(0, dy) : 0}px)`;
      }
    });
    const end = (e) => {
      if (!pts.has(e.pointerId)) return;
      const was = pts.get(e.pointerId);
      pts.delete(e.pointerId);
      if (pts.size) { start = { ...start, x: [...pts.values()][0].x, y: [...pts.values()][0].y, s: this.s, tx: this.tx, ty: this.ty, two: null }; return; }
      this.dlg.classList.remove('ao-lb-active');
      const g = start;
      start = null;
      if (!g || e.type === 'pointercancel') { this.apply(); return; }
      const dx = was.x - g.x;
      const dy = was.y - g.y;
      if (g.moved) {
        if (g.two || this.s > 1.01 || g.type === 'mouse') { this.apply(); return; }
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.3) { this.go(dx < 0 ? 1 : -1); return; }
        if (dy > 90 && dy > Math.abs(dx) * 1.3) { this.close(); return; }
        this.apply();
        return;
      }
      // A tap or a click.
      if (g.type === 'mouse') {
        if (!g.onImg) { if (this.s <= 1.01) this.close(); return; }
        if (this.s > 1.01) this.zoomTo(1);
        else this.zoomAt(g.x, g.y, this.actual());
        return;
      }
      const now = performance.now();
      if (now - lastTap < 320) {
        lastTap = 0;
        if (this.s > 1.01) this.zoomTo(1); else this.zoomAt(g.x, g.y, Math.max(2.5, this.actual()));
        return;
      }
      lastTap = now;
      if (!g.onImg && this.s <= 1.01) setTimeout(() => { if (lastTap === now) this.close(); }, 330);
    };
    st.addEventListener('pointerup', end);
    st.addEventListener('pointercancel', end);
  },
};
