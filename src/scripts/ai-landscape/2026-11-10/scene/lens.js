// The lens of the line-up (SPEC 4.7): a loupe 90 px in radius that follows the pointer at 9 a second over a stack
// and shows its inside, drawn flat like a cutaway: the nine floors in their five states, and every part of each
// floor as a bead in its owner's colour, the floor under the pointer lit. It never sits over type and closes over
// empty floor. grow() turns it into the iris when a click opens that stack's world.
import { Vector3 } from 'three';
import { owner } from '../worlds/index.js';
import { FLOOR } from './stack.js';

const R = 90;                 // radius, CSS pixels
const M = 2.3;                // magnification
const TAU = Math.PI * 2;
const PAPER = '#F8F9FB';
const INK = '#0C0D10';

export function createLens(ctx, node, towers) {
  const { row, labels, input } = ctx;
  const canvas = node.querySelector('canvas');
  const g = canvas.getContext('2d');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = canvas.height = Math.round(R * 2 * dpr);
  const st = { x: -1, y: -1, open: 0, want: 0, tower: null, i: -1, growing: 0 };
  let blocks = [];
  let seen = 0;

  // the words on screen this frame: the lens never covers them
  const overType = (x, y) => {
    if (performance.now() - seen > 250) {
      seen = performance.now();
      blocks = [...node.closest('.ail-stage').querySelectorAll('.ail-lu__say.is-on, .ail-lu__row.is-lit td, .ail-lu__th, .ail-lu__foot, .ail-lu__title')]
        .map((el) => el.getBoundingClientRect()).filter((r) => r.width > 0);
    }
    return blocks.some((r) => x >= r.left - 6 && x <= r.right + 6 && y >= r.top - 6 && y <= r.bottom + 6);
  };

  function slab(x, y, w, h, own, state, lit) {
    const r = Math.min(h * 0.32, 6);
    g.beginPath(); g.roundRect(x, y, w, h, r);
    const fill = own.prism ? (() => { const grad = g.createLinearGradient(x, 0, x + w, 0); own.prism.forEach((c, k) => grad.addColorStop(k / 3, c)); return grad; })() : own.glass;
    g.save();
    if (state === 'solid' || state === 'hatch') {
      g.globalAlpha = lit ? 1 : 0.86; g.fillStyle = fill; g.fill(); g.globalAlpha = 1;
      if (state === 'hatch') {
        g.clip();
        g.strokeStyle = own.glass === '#F3F3F3' || own.glass === '#FFFFFF' ? '#8C929C' : 'rgba(248,249,251,.9)';
        g.lineWidth = 2.2;
        for (let s = -h; s < w + h; s += 6.5) { g.beginPath(); g.moveTo(x + s, y + h); g.lineTo(x + s + h, y); g.stroke(); }
      }
    } else if (state === 'frost') {
      g.fillStyle = 'rgba(230,232,237,.92)'; g.fill();
      g.setLineDash([2, 3]); g.strokeStyle = '#4A4E57'; g.lineWidth = 1.2; g.stroke();
    } else {
      g.setLineDash(state === 'dotted' ? [1.5, 3.5] : []); g.lineCap = 'round';
      g.strokeStyle = state === 'dotted' ? 'rgba(12,13,16,.55)' : 'rgba(12,13,16,.7)'; g.lineWidth = 1.4; g.stroke();
    }
    g.restore();
    g.beginPath(); g.roundRect(x, y, w, h, r);
    g.strokeStyle = lit ? INK : own.rim === '#FFFFFF' || state !== 'solid' ? 'rgba(12,13,16,.18)' : own.rim;
    g.lineWidth = lit ? 1.6 : 1; if (state === 'solid' || state === 'hatch' || lit) g.stroke();
  }

  function bead(x, y, r, id, status, official) {
    const own = owner(id);
    g.beginPath(); g.arc(x, y, r, 0, TAU);
    g.fillStyle = own.prism ? own.prism[2] : own.glass; g.fill();
    if (status === 'preview' || status === 'announced') { g.save(); g.clip(); g.fillStyle = 'rgba(248,249,251,.75)'; g.fillRect(x, y - r, r, 2 * r); g.restore(); }
    g.setLineDash(official === 'no' ? [2, 2] : []);
    g.strokeStyle = own.glass === '#0A0A0A' ? '#FFFFFF' : INK; g.lineWidth = 1; g.stroke();
    g.setLineDash([]);
  }

  // A magnified elevation of `tower` around the pointer: each floor's projected box, scaled M times about it.
  function draw(tower, cells) {
    const own = tower.owner;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, R * 2, R * 2);
    g.save();
    g.beginPath(); g.arc(R, R, R - 0.5, 0, TAU); g.clip();
    g.fillStyle = PAPER; g.fillRect(0, 0, R * 2, R * 2);
    const map = (p) => ({ x: (p.x - st.x) * M + R, y: (p.y - st.y) * M + R });
    for (let i = 0; i < FLOOR.n; i++) {
      const y = tower.floors[i].y + tower.lift;
      const a = map(labels.project(pt(tower.x + tower.shift - FLOOR.w / 2, y + FLOOR.h / 2)));
      const b = map(labels.project(pt(tower.x + tower.shift + FLOOR.w / 2, y - FLOOR.h / 2)));
      const c = cells[i];
      slab(a.x, a.y, b.x - a.x, b.y - a.y, own, c.s, i === st.i);
      const parts = c.p.length ? c.p : [];
      const r = Math.max(3, Math.min(6, (b.y - a.y) * 0.24));
      parts.forEach(([id, status, official], k) => {
        const span = (b.x - a.x) * 0.7;
        const x = a.x + (b.x - a.x) * 0.15 + (parts.length === 1 ? span / 2 : (span * k) / (parts.length - 1));
        bead(x, (a.y + b.y) / 2, r, id, status, official);
      });
    }
    g.restore();
  }
  const v = new Vector3();
  const pt = (x, y) => v.set(x, y, 0);

  return {
    // active: the line-up is settled. data: the page's per-company structure (ctx.data.p)
    update(dt, active, data) {
      const hit = active && input.px >= 0 ? row.pick(input.px, input.py) : null;
      const free = hit && !overType(input.px, input.py) && !document.querySelector('.ail-lu details[open]');
      st.want = free ? 1 : 0;
      if (free) { st.tower = hit.tower; st.i = hit.i; }
      const k = 1 - Math.exp(-9 * dt);
      if (st.x < 0) { st.x = input.px; st.y = input.py; }
      st.x += (input.px - st.x) * k; st.y += (input.py - st.y) * k;
      st.open += (st.want - st.open) * (1 - Math.exp(-12 * dt));
      if (st.growing > 0) st.growing = Math.max(0, st.growing - dt);
      const on = st.open > 0.02 && st.tower;
      node.classList.toggle('is-on', !!on || st.growing > 0);
      if (!on) return;
      if (st.growing <= 0) node.style.transform = `translate3d(${(st.x - R).toFixed(1)}px,${(st.y - R).toFixed(1)}px,0) scale(${(0.6 + 0.4 * st.open).toFixed(3)})`;
      node.style.opacity = st.growing > 0 ? '' : st.open.toFixed(3);
      draw(st.tower, data[st.tower.id].stack);
    },
    grow() {
      if (st.open < 0.3) return;
      st.growing = 0.75;
      node.classList.add('is-iris');
      setTimeout(() => node.classList.remove('is-iris'), 760);
    },
    close(now) { st.want = 0; if (now) { st.open = 0; node.classList.remove('is-on', 'is-iris'); } },
    drop() { node.classList.remove('is-on', 'is-iris'); },
  };
}
