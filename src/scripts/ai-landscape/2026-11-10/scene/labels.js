// HTML pinned to 3D points (SPEC 2.4, 4.7). Text stays HTML: crisp, selectable, read by a screen reader. The
// scene only says where each label sits. pin() holds one element on a point. callouts() lays a stack's nine
// rows in a column beside it with leader lines. On a phone nothing is pinned over a stack: CSS lists the rows.
import { Vector3 } from 'three';
import { smooth } from '../core/clock.js';

const NS = 'http://www.w3.org/2000/svg';

export function createLabels(ctx) {
  const svg = document.getElementById('ail-leaders');
  const v = new Vector3();
  const size = { w: window.innerWidth, h: window.innerHeight };
  const pins = new Set();

  const labels = {
    resize(w, h) { size.w = w; size.h = h; },
    // A world point in CSS pixels. `behind` is true when it is behind the camera.
    project(p) {
      v.copy(p).project(ctx.camera);
      return { x: (v.x * 0.5 + 0.5) * size.w, y: (-v.y * 0.5 + 0.5) * size.h, behind: v.z > 1 };
    },
    // Hold `el` on a point. at: a Vector3, or a function that returns one (or { x, y } in pixels).
    // align: where the point touches the element, as fractions of its box (0 0 top left, 0.5 0.5 centre).
    pin(el, at, { dx = 0, dy = 0, ax = 0, ay = 0.5 } = {}) {
      el.classList.add('ail-pin');
      const pin = { el, at, dx, dy, ax, ay, on: true, drop() { pins.delete(pin); el.classList.remove('ail-pin'); el.style.transform = ''; } };
      pins.add(pin);
      return pin;
    },
    // A leader line in the overlay. set(x1, y1, x2, y2, opacity). kind: '', 'dash' or 'dot'.
    line(kind = '') {
      const node = document.createElementNS(NS, 'line');
      if (kind) node.setAttribute('class', `is-${kind}`);
      svg.appendChild(node);
      return {
        node,
        set(x1, y1, x2, y2, o = 1) {
          node.setAttribute('x1', x1.toFixed(1)); node.setAttribute('y1', y1.toFixed(1));
          node.setAttribute('x2', x2.toFixed(1)); node.setAttribute('y2', y2.toFixed(1));
          node.style.opacity = o.toFixed(3);
        },
        drop() { node.remove(); },
      };
    },

    // The nine rows of `list` (an .ail-stack) as callouts beside `tower`. update(amount, lit) every frame:
    // amount 0..1 brings them in from the top, lit is the floor index that shows as active (or -1).
    callouts(tower, list) {
      const rows = [...list.querySelectorAll(':scope > .ail-floor')];
      const lines = ctx.phone ? [] : rows.map((row) => labels.line(row.dataset.state === 'solid' || row.dataset.state === 'hatch' ? '' : 'dash'));
      let column = 0;
      const set = {
        rows, anchors: [], column: 0,
        update(amount, lit = -1) {
          rows.forEach((row, i) => row.classList.toggle('is-lit', i === lit));
          if (ctx.phone) return;
          if (amount < 0.01) {
            rows.forEach((row) => { row.classList.remove('is-on'); row.style.opacity = '0'; });
            lines.forEach((l) => { l.node.style.opacity = '0'; });
            return;
          }
          const anchors = rows.map((_, i) => tower.anchor(i, 1, labels.project));
          const target = Math.min(size.w - 420, Math.max(...anchors.map((a) => a.x)) + 46);
          column = column ? column + (target - column) * 0.35 : target;
          set.anchors = anchors; set.column = column;
          const compact = list.classList.contains('is-compact');
          rows.forEach((row, i) => {
            const o = smooth(amount * 2.1 - i * 0.11);
            row.classList.toggle('is-on', o > 0.01);
            row.style.opacity = o.toFixed(3);
            row.style.transform = `translate3d(${column.toFixed(1)}px,${anchors[i].y.toFixed(1)}px,0) translateY(-50%)`;
            const hidden = compact && i !== lit && !row.classList.contains('is-open');
            lines[i].set(anchors[i].x + 5, anchors[i].y, column - 8, anchors[i].y, hidden ? 0 : o * 0.5);
          });
        },
        drop() { lines.forEach((l) => l.drop()); rows.forEach((row) => { row.classList.remove('is-on', 'is-lit'); row.style.opacity = ''; row.style.transform = ''; }); },
      };
      return set;
    },

    update() {
      for (const pin of pins) {
        if (!pin.on) continue;
        const at = typeof pin.at === 'function' ? pin.at() : pin.at;
        if (!at) continue;
        const p = at.isVector3 ? labels.project(at) : at;
        pin.el.style.transform = `translate3d(${(p.x + pin.dx).toFixed(1)}px,${(p.y + pin.dy).toFixed(1)}px,0) translate(${-pin.ax * 100}%,${-pin.ay * 100}%)`;
      }
    },
  };
  return labels;
}
