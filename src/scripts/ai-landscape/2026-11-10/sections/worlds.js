// One world section (SPEC 2.4): the same four beats for all five companies, driven by the scroll.
// a Enter 0 to 0.6: truck along the row, the iris opens. b Open 0.6 to 1.5: the stack pulls apart, callouts, doors.
// c Signature 1.5 to 2.5: the section holds and signatures/<name>.js plays. d The catch 2.5 to 3.0, then the iris shuts.
// Everything world-specific comes from worlds/<id>.js and the page's data: this file never names a company.
import { Vector3 } from 'three';
import { easeIO, lerp, smooth, span, win } from '../core/clock.js';
import { $, $$, announce, rove, setBeat, toggle } from '../core/dom.js';
import { HOURS } from '../scene/studio.js';
import { world } from '../worlds/index.js';

const BEATS = [['a', 0.6], ['b', 1.5], ['c', 2.5], ['d', 3.01]];
const MODEL = 4;

export function create(ctx, el, sec) {
  const { rig, row, studio, labels, prims, input } = ctx;
  const id = el.dataset.world;
  const cfg = world(id);
  const tower = row.tower(id);
  const data = ctx.data.p[id];
  const inst = ctx.worlds.mount(cfg, tower);
  const order = ctx.data.order;
  const first = order.indexOf(id) === 0;
  const last = order.indexOf(id) === order.length - 1;
  const before = first ? null : row.tower(order[order.indexOf(id) - 1]);
  const root = document.documentElement;
  const stage = $('.ail-stage', el);
  const head = $('.ail-world__head', el);
  const nameEl = $('.ail-world__name', el);
  const doorsEl = $('.ail-doors', el);
  const doors = $$('.ail-door', el).map((node, k) => ({ node, k, tab: $('summary', node), list: $('.ail-stack', node), card: $('.ail-door__card', node), info: data.doors[k] }));
  const agentDoor = Math.max(0, doors.findIndex((d) => d.info && d.info.id === data.agent));
  const catchFloor = Number(el.dataset.catch || cfg.catchFloor) - 1;
  const lamp = new Vector3();
  const hero = new Vector3(...HOURS.hero);
  const point = new Vector3();

  const st = { door: agentDoor, calls: null, cores: null, cardPin: null, pushed: -1, pushK: 0, hover: -1, beat: '', sig: null, sigAsked: false, played: false, u: 0, open: 0, rect: null, chrome: '' };
  const leaves = prims.doors(tower, doors.length, { side: 0 });
  leaves.show = 0; leaves.update();
  inst.setName(nameEl.textContent.trim());
  const measure = () => { st.rect = nameEl.getBoundingClientRect(); };

  // ---- doors: this company's products. Picking one relabels the nine callouts from that product's own stack
  function select(k, quiet = false) {
    const d = doors[k];
    if (!d) return;
    st.door = k;
    doors.forEach((x) => { x.node.open = x === d; x.tab.setAttribute('aria-expanded', String(x === d)); });
    if (st.calls) { st.calls.drop(); st.calls = null; }
    if (st.cores) { st.cores.dispose(); st.cores = null; }
    if (st.cardPin) { st.cardPin.drop(); st.cardPin = null; }
    closePush();
    if (d.info.stack) {
      tower.setCells(d.info.stack);
      st.calls = labels.callouts(tower, d.list);
    } else {
      // a product with no stack of its own: only the model floor is lit, with one core for each model it runs on
      tower.setCells(data.stack.map((c, i) => (i === MODEL ? { s: 'solid', g: [] } : { s: 'hollow', g: [] })));
      if (d.info.m.length) st.cores = prims.cores(tower, MODEL, d.info.m, { side: 0 });
      if (d.card && !ctx.phone) st.cardPin = labels.pin(d.card, () => tower.anchor(MODEL, 1, labels.project), { dx: 46, ay: 0.2 });
    }
    leaves.open = k;
    if (!quiet) announce(d.tab.textContent.trim());
  }
  const onTab = (e) => { const tab = e.target.closest('summary'); const d = tab && doors.find((x) => x.tab === tab); if (d) { e.preventDefault(); select(d.k); } };
  doorsEl.addEventListener('click', onTab);
  const unrove = rove(doorsEl, 'summary');

  // ---- push-in: tap a floor or its label, the camera flies to it and its card hangs under the label
  function closePush() {
    if (st.pushed < 0) return;
    const rows = st.calls ? st.calls.rows : [];
    if (rows[st.pushed]) rows[st.pushed].classList.remove('is-open');
    st.pushed = -1;
  }
  function push(i) {
    if (st.beat !== 'b' || !st.calls) return;
    const same = st.pushed === i;
    closePush();
    if (same) return;
    st.pushed = i;
    st.calls.rows[i].classList.add('is-open');
    tower.floors[i].pulse = 0.8;
  }
  const onRow = (e) => {
    const rowEl = e.target.closest('.ail-floor');
    if (!rowEl || !st.calls || e.target.closest('.ail-fact')) return;
    const i = st.calls.rows.indexOf(rowEl);
    if (i >= 0) push(i);
  };
  doorsEl.addEventListener('click', onRow);
  const onKey = (e) => { if (e.key === 'Escape' && sec === ctx.clock.current) { closePush(); $$('.ail-flag[open]', el).forEach((f) => { f.open = false; }); } };
  window.addEventListener('keydown', onKey);
  const onCanvas = (e) => {
    if (sec !== ctx.clock.current || st.beat !== 'b') return;
    const hit = row.pick(e.clientX, e.clientY, tower);
    if (hit) push(hit.i); else closePush();
  };
  ctx.canvas.addEventListener('click', onCanvas);

  // ---- the signature: loaded when the world is entered, plays once by itself, then waits for the visitor
  const api = { id, cfg, el, tower, inst, data, sec, ui: $('.ail-sig', el), calls: () => st.calls, button: (act) => $(`.ail-sig [data-act="${act}"]`, el), items: (k) => $$(`.ail-sig__list[data-list="${k}"] .ail-sig__item`, el) };
  function askSignature() {
    if (st.sigAsked) return;
    st.sigAsked = true;
    ctx.signature(cfg.signature).then((m) => { if (m && !st.gone) st.sig = m.create(ctx, api); });
  }

  function setChrome(mode, accent) {
    if (st.chrome === mode) return;
    st.chrome = mode;
    if (mode === 'dark') root.dataset.chrome = 'dark'; else delete root.dataset.chrome;
    el.toggleAttribute('data-dark', mode === 'dark' && accent);
  }

  select(agentDoor, true);

  return {
    stops: [0.14, 0.42, 0.66, 0.9],
    enter() { measure(); askSignature(); select(agentDoor, true); },
    leave() {
      setChrome('light'); closePush();
      leaves.show = 0; leaves.update();
      if (st.cores) { st.cores.show = 0; st.cores.update(); }
      if (st.sig) st.sig.reset();
      if (st.calls) st.calls.update(0);
      st.beat = ''; delete el.dataset.beatNow;
      $$('[data-beat]', el).forEach((n) => n.classList.remove('is-on'));
      toggle(head, false);
    },
    update(t, dt, u) {
      st.u = u;
      const beat = BEATS.find(([, end]) => u < end)[0];
      if (beat !== st.beat) {
        if (st.beat === 'c' && st.sig) st.sig.reset();
        if (beat !== 'b' && st.door !== agentDoor) select(agentDoor, true);
        if (beat !== 'b') closePush();
        st.beat = beat;
      }
      if (input.moved || !st.rect) measure();

      // camera: truck along the row to this stack, settle wider when it opens, hold. The last world pulls back out
      const from = before ? rig.world(before.x, 'open') : rig.stops.row;
      const near = rig.world(tower.x, 'enter');
      const wide = rig.world(tower.x, 'open');
      if (u < 0.25) rig.mix(from, near, easeIO(u / 0.25));
      else if (u < 0.6) rig.to(near);
      else if (u < 0.95) rig.mix(near, wide, easeIO((u - 0.6) / 0.35));
      else if (last && u > 2.78) rig.mix(wide, rig.stops.row, easeIO((u - 2.78) / 0.22));
      else rig.to(wide);
      rig.yaw = 0.05; rig.pitch = 0.02;
      if (beat === 'c') { rig.yaw *= 1.5; rig.pitch *= 1.5; }

      // the iris opens from the stack over 0.35 screens and shuts in the last 0.2
      const open = smooth(span(u, 0.25, 0.6)) * (1 - smooth(span(u, 2.8, 2.98)));
      st.open = open;
      setBeat(el, beat === 'a' && open < 0.4 ? '' : beat);             // the words of a world arrive with the world
      inst.open = open;
      for (const tw of row.towers) if (tw !== tower) tw.side = -1;
      studio.lamp.copy(hero).lerp(lamp.set(...cfg.hour.lamp), open);
      studio.warmth = cfg.hour.warmth * open;
      studio.roomX = tower.x;
      stage.style.setProperty('--sheet', open.toFixed(3));
      toggle(head, open > 0.35);
      inst.nameRect = st.rect;
      inst.nameShow = open * (1 - (ctx.phone ? 1 : 0.9) * smooth(span(u, 0.6, 0.92)));      // the name is the entrance. It steps back when the stack opens
      tower.lid.show = 1 - smooth(open * 2);

      // the stack pulls apart from the top. The character stands large beside it, then hops onto its floor
      tower.open = smooth(span(u, 0.6, 1.25)) * (1 - smooth(span(u, 2.72, 2.9)));
      const c = tower.char;
      if (u < 0.62) { c.from = 'floor'; c.to = 'beside'; c.t = smooth(span(u, 0.22, 0.52)); }
      else { c.from = 'beside'; c.to = 'floor'; c.t = easeIO(span(u, 0.62, 1.0)); }

      // callouts on leader lines, and the doors above them. A signature or the catch keeps only the lit floor's words
      const sig = st.sig;
      const amount = smooth(span(u, 0.85, 1.35)) * (1 - smooth(span(u, 2.74, 2.88)));
      const lit = beat === 'c' && sig ? sig.lit ?? -1 : beat === 'd' ? catchFloor : st.pushed >= 0 ? st.pushed : st.hover;
      const calls = st.calls;
      if (calls) {
        calls.rows[0].parentElement.classList.toggle('is-compact', beat === 'c' || beat === 'd');
        calls.update(amount, lit);
        if (!ctx.phone && calls.anchors.length && beat === 'b') { doorsEl.style.left = `${calls.column.toFixed(0)}px`; doorsEl.style.top = `${Math.max(64, calls.anchors[0].y - 78).toFixed(0)}px`; }
      } else if (!ctx.phone && beat === 'b') {
        const a0 = tower.anchor(0, 1, labels.project);
        doorsEl.style.left = `${(a0.x + 46).toFixed(0)}px`; doorsEl.style.top = `${Math.max(64, a0.y - 78).toFixed(0)}px`;
      }
      if (st.cardPin) st.cardPin.el.style.opacity = amount.toFixed(2);
      leaves.show = smooth(span(tower.open, 0.5, 0.9)); leaves.update(dt);

      // hover: that floor lights and the others fall back. A product with no stack keeps only its model floor
      if (beat === 'b' && !input.touch && input.moved) { const hit = row.pick(input.px, input.py, tower); st.hover = hit ? hit.i : -1; ctx.canvas.style.cursor = hit ? 'pointer' : ''; }
      if (beat !== 'b') st.hover = -1;
      const focus = beat === 'b' ? (st.pushed >= 0 ? st.pushed : st.hover) : -1;
      const bare = !doors[st.door].info.stack;
      tower.floors.forEach((f, i) => {
        if (focus >= 0) { if (i === focus) f.lit = 0.22; else f.dim = 0.3; }
        if (bare && i !== MODEL) f.dim = Math.max(f.dim, 0.5);
      });
      if (st.cores) { st.cores.spin = ctx.time * 0.25; st.cores.show = tower.open; st.cores.update(); tower.floors[MODEL].guestShow = 0; }
      st.pushK = Math.max(0, Math.min(1, st.pushK + (st.pushed >= 0 ? dt : -dt) / 0.7));
      if (st.pushK > 0.001) rig.push = { point: tower.point(st.pushed >= 0 ? st.pushed : (st.lastPush ?? MODEL), 0, point), k: st.pushK };
      if (st.pushed >= 0) st.lastPush = st.pushed;

      // c: the signature moment. It plays once by itself (never under reduced motion), then waits
      const inC = win(u, 1.5, 2.5, 0.08);
      let dark = false;
      if (sig) {
        if (beat === 'c' && !st.played && !ctx.reduced && u > 1.62 && u < 2.4 && Math.abs(ctx.clock.target - ctx.clock.s) < 0.02) { st.played = true; sig.play(); }
        if (beat === 'c' && ctx.reduced && !st.played) { st.played = true; if (sig.still) sig.still(); }
        if (sig.update) sig.update(dt, inC);
        dark = !!sig.dark && beat === 'c';
      }

      // d: the floor that carries the catch slides out and shows its state
      const out = smooth(span(u, 2.5, 2.68)) * (1 - smooth(span(u, 2.76, 2.9)));
      if (out > 0.001) {
        tower.floors[catchFloor].slide = out * (ctx.phone ? 0.55 : 0.95);
        tower.floors[catchFloor].lit = Math.max(tower.floors[catchFloor].lit, out * 0.18);
        if (sig && sig.catch) sig.catch(out);
      }
      setChrome(dark || (open > 0.5 && cfg.theme.chrome === 'dark') ? 'dark' : 'light', dark);
    },
    dispose() {
      st.gone = true;
      window.removeEventListener('keydown', onKey);
      ctx.canvas.removeEventListener('click', onCanvas);
      doorsEl.removeEventListener('click', onRow);
      doorsEl.removeEventListener('click', onTab);
      unrove();
      if (st.sig) st.sig.dispose();
      if (st.calls) st.calls.drop();
      if (st.cores) st.cores.dispose();
      if (st.cardPin) st.cardPin.drop();
      leaves.dispose();
      tower.setCells(data.stack, true);
      ctx.worlds.unmount(id);
    },
  };
}
