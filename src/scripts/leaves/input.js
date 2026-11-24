// The guest's hands in the room: drag round the cup (mouse or finger) or press Left and Right to stir, tap or press
// Space to sip, hover or tap a leaf to name it, Esc to leave. The offscreen list of leaves is the keyboard's way to
// them: Up and Down move through it and light the leaf in the cup. Nothing here is stored.
import { FAN, WORD } from './leaves.js';
import { lengthPx } from './paint-leaves.js';

export function bindInput(root, cv, room, act) {
  const st = { dragging: false, used: false, moved: 0, prev: 0, id: -1, active: -1 };
  const toCup = (e) => ({ x: (e.clientX - room.L.cx) / room.L.R, y: (e.clientY - room.L.cy) / room.L.R });
  // in the order they are drawn: the entries, then the word-leaf on top
  const named = () => [...room.s.leaves.slice(1).filter((p) => p.kind !== FAN && p.landed), ...(room.s.leaves[0].landed ? [room.s.leaves[0]] : [])];

  // The top leaf under a point: those afloat first, then sinking, then on the bottom; the last drawn on top.
  function hit(e) {
    const { x, y } = toCup(e), tol = 7 / room.L.R;
    const order = [(p) => !p.sunk && p.z <= 0.02, (p) => !p.sunk && p.z > 0.02, (p) => p.sunk];
    for (const test of order) {
      const list = named().filter(test);
      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i], len = lengthPx(p, 1);
        const dx = x - p.x, dy = y - p.y, c = Math.cos(p.a), s = Math.sin(p.a);
        const lx = dx * c + dy * s, ly = -dx * s + dy * c;
        if (Math.abs(lx) < len / 2 + tol && Math.abs(ly) < len * 0.2 + tol) return p;
      }
    }
    return null;
  }
  const at = (p) => ({ x: room.L.cx + p.x * room.L.R, y: room.L.cy + p.y * room.L.R });
  const name = (p) => { if (p) { const q = at(p); act.label(p, q.x, q.y); } else act.label(null); };
  const touchBlock = (e) => { if (st.dragging) e.preventDefault(); };
  cv.addEventListener('touchmove', touchBlock, { passive: false });

  cv.addEventListener('pointerdown', (e) => {
    act.gesture();
    const { x, y } = toCup(e);
    st.id = e.pointerId; st.moved = 0; st.prev = Math.atan2(y, x); st.down = { x: e.clientX, y: e.clientY };
    st.dragging = Math.hypot(x, y) < 1.15;
    if (st.dragging) cv.setPointerCapture?.(e.pointerId);
  });
  cv.addEventListener('pointermove', (e) => {
    if (st.dragging && e.pointerId === st.id) {
      const { x, y } = toCup(e), a = Math.atan2(y, x);
      let d = a - st.prev;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      st.prev = a;
      st.moved += Math.hypot(e.movementX || 0, e.movementY || 0) || Math.abs(d) * room.L.R;
      if (st.moved > 8) {
        st.used = true;
        act.stir(d, Math.min(1, Math.max(0.2, Math.hypot(x, y))), x, y);
      }
      return;
    }
    if (e.pointerType === 'mouse' && !e.buttons) name(hit(e));
  });
  const up = (e) => {
    if (e.pointerId !== st.id) return;
    const wasDrag = st.dragging && st.moved > 8;
    st.dragging = false; st.id = -1;
    if (wasDrag || e.type === 'pointercancel') return;
    const p = hit(e);
    if (p) { name(p); return; }
    const { x, y } = toCup(e);
    if (Math.hypot(x, y) < 1.1) { st.used = true; act.poke(x, y); act.sip(); }
    name(null);
  };
  cv.addEventListener('pointerup', up);
  cv.addEventListener('pointercancel', up);
  cv.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') name(null); });

  addEventListener('keydown', (e) => {
    act.gesture();
    const inButton = e.target instanceof HTMLButtonElement;
    if (e.key === 'Escape') { e.preventDefault(); act.leave(); return; }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault(); st.used = true;
      act.stir((e.key === 'ArrowRight' ? 1 : -1) * 0.4, 0.6);
      return;
    }
    if ((e.key === ' ' || e.code === 'Space') && !inButton) { e.preventDefault(); st.used = true; act.sip(); }
  });

  // the list: a listbox the keyboard reads, one option per leaf, the word-leaf first
  const list = root.querySelector('.lv-list');
  const options = [...list.querySelectorAll('[role=option]')];
  const leafFor = (i) => room.s.leaves.find((p) => (i === 0 ? p.kind === WORD : p.idx === i - 1 && p.kind !== WORD && p.kind !== FAN));
  const activate = (i) => {
    st.active = Math.max(0, Math.min(options.length - 1, i));
    options.forEach((o, k) => o.setAttribute('aria-selected', String(k === st.active)));
    list.setAttribute('aria-activedescendant', options[st.active].id);
    const p = leafFor(st.active);
    name(p && p.landed ? p : null);
  };
  list.addEventListener('focus', () => activate(st.active < 0 ? 0 : st.active));
  list.addEventListener('blur', () => name(null));
  list.addEventListener('keydown', (e) => {
    const moves = { ArrowDown: 1, ArrowUp: -1, Home: -1e6, End: 1e6 };
    if (e.key in moves) { e.preventDefault(); activate(st.active + moves[e.key]); }
  });
  return st;
}
