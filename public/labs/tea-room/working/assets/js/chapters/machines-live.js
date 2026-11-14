// One machine's own teardown page, alive in a frame, worked from outside (machines.js). The page is the lab's live
// notebook (AO-073): nothing of it is copied or changed on disk. While it runs in the frame (same site), this file
// adds one style element to hide its console, and works it as a reader could, plus one look over its shoulder:
//   - window.SIM_SHOWN (set after the first drawn frame) and window.LIVE.takeOver() (stops the self-running tour)
//   - window.LIVE[machine.stage].frame(state, camera, look): the page hands every frame's camera to it. This file
//     wraps it and sets the camera's bearing (and for some machines its height and distance) itself, so the scroll,
//     a slow sway and the mouse turn the camera round the machine at once, and nothing of the page's own slow drift
//     (its views turn a little more every second they are held) carries the machine out of the picture. The state
//     it is handed (the task's progress) is read, never changed.
//   - the console's buttons, div.bt, found by their words (the view, CUT, ISOLATE, the parts); a pressed one is drawn
//     in a colour, an unpressed one near white
//   - the console's first slider strip, div.hit (its timeline, pressed with a pointer at a place along it: this sets
//     the task's time and pauses it) and, on a page whose task plays on from there, the space key (plays it)
// The machine's work is a loop of its own task, as its film would loop, never a restart of the page's tour: the
// part, the mode and the view stay what the scroll asked for.
//   - job.play: the timeline is pressed at job.from (a fraction of the task), then space plays it; once its progress
//     passes job.to it is pressed back to job.from (DRAY: the crane's work at the module; the rover stands still).
//   - job.speed: the timeline is held paused and pressed every frame along a window job.from..job.to of the task, at
//     job.speed times its own clock (MOLE-1: one load dug at the face; its camera then follows the machine itself).
// Anything missing, slow or broken: the frame is thrown away and the machine stays on its still and its film.

const READY_TIMEOUT = 45000;
const D2R = Math.PI / 180;

export function createLive(machine, holder, { onReady, onFail }) {
  const iframe = document.createElement('iframe');
  iframe.className = 'live';
  iframe.title = `${machine.name}, the machine itself (its teardown page)`;
  iframe.setAttribute('tabindex', '-1');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.loading = 'eager';
  let dead = false, ready = false, shown = false, win = null, doc = null, stage = null;
  let want = { part: null, mode: null };
  let applied = { view: null, mode: null };
  let cool = 0, coolT = 0, coolF = 0, tick = null, keep = null, failTimer = null, showTimer = null;
  let jobOn = false, loop = { T0: 0, guard: false }, map = null, last = null;
  // the camera: what is wanted (degrees about the machine's own bearing) and what is drawn (eased toward it)
  let aim = { az: 0, el: 0 }, cam = null, camT = 0;

  const fail = (why) => {
    if (dead) return;
    dispose();
    onFail && onFail(why);
  };

  const btns = () => [...doc.querySelectorAll('.bt')];
  const find = (word, lastOne = false) => {
    const all = btns().filter((b) => b.textContent.trim() === word);
    return lastOne ? all[all.length - 1] : all[0];
  };
  const isOn = (b) => {
    if (!b) return false;
    const c = win.getComputedStyle(b).backgroundColor.match(/\d+(\.\d+)?/g);
    if (!c) return false;
    const [r, g, bl] = c.map(Number);
    return (r + g + bl) / 3 < 236 || Math.max(r, g, bl) - Math.min(r, g, bl) > 30;
  };
  // after a press, wait until the page's own clock has run the buttons' ease (0.7 s of its time) and a few frames:
  // on a slow frame a button read too soon is read half-eased and pressed back
  const press = (b) => {
    if (!b) return;
    b.click();
    cool = 1; coolT = win.LIVE.T; coolF = 0;
    clearTimeout(press.t); press.t = setTimeout(() => { cool = 0; }, 20000);
  };
  const cooling = () => {
    if (!cool) return false;
    if (win.LIVE.T - coolT > 0.85 && coolF >= 4) { cool = 0; clearTimeout(press.t); return false; }
    return true;
  };
  const scaleOf = () => {
    const app = doc.getElementById('app');
    const m = app && win.getComputedStyle(app).transform.match(/matrix\(([^,]+)/);
    return m ? parseFloat(m[1]) || 1 : 1;
  };
  const P = () => win.PointerEvent || win.MouseEvent;
  // the timeline: pressed at a fraction f of it (a pointer's place need not be a whole pixel)
  const pressStrip = (f) => {
    const hit = doc.querySelectorAll('.hit')[0];
    if (!hit) return false;
    const r = hit.getBoundingClientRect(), pad = 8 * scaleOf();
    const x = r.left + pad + Math.max(0, Math.min(1, f)) * (r.width - 2 * pad), y = r.top + r.height / 2;
    const o = { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 1, isPrimary: true, button: 0, buttons: 1 };
    hit.dispatchEvent(new (P())('pointerdown', o));
    win.dispatchEvent(new (P())('pointerup', { ...o, buttons: 0 }));
    return true;
  };
  const space = () => win.dispatchEvent(new win.KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true, cancelable: true }));

  // the page's view (pressing it also sets the page's own drag back to nothing)
  const setView = () => { press(find(machine.view, true)); applied.view = machine.view; };
  // the machine's work, from the start of its loop
  const startJob = () => {
    const j = machine.job;
    if (j.speed) {
      // the timeline's place for a time of the task: read off the page once (its two ends)
      pressStrip(0); const e0 = win.LIVE.E;
      pressStrip(1); const e1 = win.LIVE.E;
      if (!(typeof e0 === 'number' && e1 > e0)) return fail('timeline');
      map = { e0, e1 };
      loop.T0 = win.LIVE.T;
      pressStrip(j.from);
    } else {
      pressStrip(j.from); space();
      loop.guard = true;
    }
    jobOn = true;
  };
  // every frame: the work kept going (job.speed: the next place along the window; job.play: back to the start of
  // the window once its end is passed)
  const work = () => {
    if (!jobOn || dead) return;
    const j = machine.job;
    if (j.speed) {
      const span = (j.to - j.from) * (map.e1 - map.e0) / j.speed;     // the window's length in the page's seconds
      const k = ((win.LIVE.T - loop.T0) % span) / span;
      pressStrip(j.from + (j.to - j.from) * k);
    } else if (last && typeof last.s === 'number') {
      if (loop.guard) { if (last.s < j.to - 0.01) loop.guard = false; return; }
      if (last.s >= j.to) { pressStrip(j.from); space(); loop.guard = true; }
    }
  };

  // one change per tick, then read the page again: its buttons repaint on its own next frame
  const reconcile = () => {
    if (dead || !ready || cooling()) return;
    try {
      if (!jobOn) { startJob(); return; }
      if (applied.view !== machine.view) { setView(); return; }
      if (step()) return;
      // nothing left to change: the frame may be shown
      if (!shown) reveal();
    } catch (e) { fail('reconcile'); }
  };
  const step = () => {
    const partNames = machine.allParts;
    if (machine.kind === 'set') {
      if (want.mode && applied.mode !== want.mode) { press(find(machine.modes[want.mode])); applied.mode = want.mode; return true; }
      for (const n of partNames) {
        const b = find(n);
        if (b && isOn(b) !== (n === want.part)) { press(b); return true; }
      }
      return false;
    }
    // toggles: the part first, then the mode
    for (const n of partNames) {
      const b = find(n);
      if (b && isOn(b) && n !== want.part) { press(b); return true; }
    }
    if (want.part && !isOn(find(want.part))) { press(find(want.part)); return true; }
    // the wanted mode first (pressing it lets go of the others), then anything still pressed
    const wantMode = want.part && want.mode ? find(machine.modes[want.mode]) : null;
    if (wantMode && !isOn(wantMode)) { press(wantMode); return true; }
    for (const [m, word] of Object.entries(machine.modes)) {
      const b = find(word);
      if (b && isOn(b) && !(m === want.mode && want.part)) { press(b); return true; }
    }
    return false;
  };
  const reveal = () => {
    if (shown || dead) return;
    shown = true; clearTimeout(showTimer);
    iframe.classList.add('on'); onReady && onReady();
  };

  // the camera, set in the page's own frame: the bearing (and height, distance, framing) this machine is shown at,
  // turned by what machines.js asks, eased over a fraction of a second of real time (the same on any frame rate)
  const camera = (c) => {
    const v = machine.cam;
    const az = v.az + aim.az, el = (v.el != null ? v.el : c.el / D2R) + aim.el;
    const now = performance.now(), dt = Math.min(0.25, Math.max(0, (now - camT) / 1000)); camT = now;
    if (!cam) cam = { az: c.az / D2R, el: c.el / D2R, d: c.d };
    const k = 1 - Math.exp(-dt / 0.35);
    cam.az += (az - cam.az) * k; cam.el += (el - cam.el) * k;
    if (v.d) cam.d += (v.d - cam.d) * k;
    const o = { ...c, az: cam.az * D2R, el: Math.max(-15, Math.min(70, cam.el)) * D2R };
    if (v.d) o.d = cam.d;
    if (v.sy != null) o.sy = v.sy;
    return o;
  };
  const wrapFrame = () => {
    const orig = stage.frame;
    stage.frame = function (state, c, look) {
      coolF++;
      last = state;
      if (!dead && jobOn && applied.view === machine.view && c && typeof c.az === 'number') {
        try { c = camera(c); } catch (e) { /* the page's own camera */ }
      }
      return orig.call(this, state, c, look);
    };
  };

  // every control this file will press must be there, or the machine stays on its still and film
  const controlsOk = () => {
    const words = [machine.view, ...Object.values(machine.modes)];
    machine.open.forEach((o) => { if (o.part) words.push(o.part); });
    if (words.some((w) => !find(w))) return false;
    if (!doc.querySelectorAll('.hit')[0]) return false;
    return !!(stage && typeof stage.frame === 'function');
  };

  const prepare = () => { try { prepareNow(); } catch (e) { fail('prepare'); } };
  const prepareNow = () => {
    win = iframe.contentWindow; doc = iframe.contentDocument;
    if (!win || !doc || !win.LIVE || typeof win.LIVE.takeOver !== 'function' || !doc.querySelector('.ui')) return fail('missing');
    stage = win.LIVE[machine.stage];
    if (!controlsOk()) return fail('controls');
    const st = doc.createElement('style');
    st.setAttribute('data-tea-bench', '');
    st.textContent = '.ui{opacity:0!important;pointer-events:none!important}.turn,.tourchip,.cur,.ring{display:none!important}';
    doc.head.appendChild(st);
    // the strip captures the pointer it is pressed with; a pointer pressed from outside has none
    const cap = win.Element.prototype.setPointerCapture;
    for (const h of doc.querySelectorAll('.hit')) h.setPointerCapture = function (id) { try { cap.call(this, id); } catch (e) { /* none */ } };
    win.LIVE.takeOver();
    wrapFrame();
    ready = true;
    tick = setInterval(reconcile, 140);
    keep = setInterval(() => { try { win.LIVE.takeOver(); } catch (e) { fail('gone'); } }, 4000);
    (function spin() { if (dead) return; try { work(); } catch (e) { fail('work'); return; } win.requestAnimationFrame(spin); })();
    // (a page that never settles is still shown in the end: it is alive, only slow)
    showTimer = setTimeout(reveal, 15000);
  };

  iframe.addEventListener('load', () => {
    if (dead) return;
    let waited = 0;
    const poll = () => {
      if (dead) return;
      let up = false;
      try {
        const d = iframe.contentDocument;
        // not the machine's page (a missing page, an error page): give up at once
        if (d && d.readyState === 'complete' && !d.getElementById('app')) return fail('not-a-teardown');
        up = !!iframe.contentWindow.SIM_SHOWN && !!iframe.contentWindow.LIVE;
      } catch (e) { return fail('blocked'); }
      if (up) { clearTimeout(failTimer); prepare(); return; }
      waited += 250;
      if (waited > READY_TIMEOUT) return fail('slow');
      setTimeout(poll, 250);
    };
    poll();
  });
  iframe.addEventListener('error', () => fail('error'));
  failTimer = setTimeout(() => { if (!ready) fail('timeout'); }, READY_TIMEOUT + 15000);
  iframe.src = machine.page;
  holder.appendChild(iframe);

  function dispose() {
    if (dead) return;
    dead = true; ready = false;
    clearInterval(tick); clearInterval(keep); clearTimeout(failTimer); clearTimeout(press.t); clearTimeout(showTimer);
    try { iframe.src = 'about:blank'; } catch (e) { /* gone */ }
    iframe.remove();
  }

  return {
    get ready() { return ready; },
    get debug() { return { want, applied, cool, aim, cam, jobOn, shown, s: last && last.s, E: last && last.E, phase: last && last.phase, T: win && win.LIVE && win.LIVE.T }; },
    set(state) { want = { part: state.part || null, mode: state.mode || null }; },
    orbit(az, el) { aim = { az, el }; },
    dispose,
  };
}
