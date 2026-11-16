// One machine's own teardown page, alive in a frame, worked from outside (machines.js). The page is the lab's live
// notebook (AO-073): nothing of it is copied or changed on disk. While it runs in the frame (same site), this file
// adds one style element to hide its console, and works it as a reader could, plus one look over its shoulder:
//   - window.SIM_SHOWN (set after the first drawn frame) and window.LIVE.takeOver() (stops the self-running tour)
//   - window.LIVE[machine.stage].frame(state, camera, look): the page hands every frame's camera to it. This file
//     wraps it and sets the camera's bearing (and for some machines its height, distance and aim) itself, so the
//     scroll, a slow sway and the mouse turn the camera round the machine at once, and nothing of the page's own slow
//     drift (its views turn a little more every second they are held) carries the machine out of the picture. The
//     state it is handed (the task's progress, the machine's place) is read, never changed.
//   - the console's buttons, div.bt, found by their words (the view, CUT, ISOLATE, the parts); a pressed one is drawn
//     in a colour, an unpressed one near white
//   - the console's first slider strip, div.hit (its timeline, pressed with a pointer at a place along it: this sets
//     the task's time and pauses it)
// The machine's work is a stretch of its own task, held paused and pressed along its timeline every frame, never a
// restart of the page's tour: the part, the mode and the view stay what the scroll asked for. A stretch has no cut:
//   - job.back (DRAY): pressed from job.from to job.to in job.seconds, a short rest, then back the same way, a rest:
//     the crane takes the bag down from its shelf, then puts it back. Both ends are the crane stowed and still, so
//     nothing jumps where it turns. (The page tints the system at work: both ends stay inside the crane's own phases,
//     or one frame of another tint would show.)
//   - job.speed (MOLE-1): pressed on from job.from at job.speed times its clock, and the stretch that is kept going
//     is the phase the page itself names job.phase (its state says which phase it is in and how far through): one
//     load dug at the face, from the arms' first bite to the hopper full, the body standing where it stood. A load
//     cannot be undug, so where it starts again a copy of the last picture is laid over the frame (the veil), the
//     timeline is pressed back under it, and the copy fades away: a dissolve, as a film loop would be joined.
// The page's own camera follows its machine a little behind (it eases toward it), which showed as the machine sliding
// into the picture after it was first shown and after each new start. machine.aim holds the camera on the machine
// itself: the view's own aim reckoned from the machine's place, set on every frame's camera.
// Waking costs: the page builds itself in one long task and then draws slowly until it has stepped its own quality
// down to what the computer can do. So:
//   - nap: the page may be woken early and unseen (machines.js, while the reader is still in the toy box), worked up
//     to a short run of smooth frames, and then put to sleep: its requestAnimationFrame is held, so it draws and costs
//     nothing until wake(). (Unseen it still draws beside whatever is on the screen, and two pictures halve the frame
//     rate of a small graphics chip: so it sleeps as soon as it can.)
//   - lite: on a computer that ended at the page's lowest quality before (or looks like one), the frame is small while
//     the page starts: the page reads its own size once, at its start, and begins at that quality without the slow
//     steps down. Then the frame takes its real size.
//   - it is shown only after a run of smooth frames with its camera at rest.
//   - every page is handed its frame times by this file (clock): a sleep is never a frame (handed the browser's own
//     time after a nap, the page took the nap for its longest frame and stepped its quality down for good).
//   - a lite page's clock is also calm: the page steps its quality down for good when its frames come slowly, and
//     the slow frames of its own waking, of this page's scroll and of the bench being set up are not the page's to
//     judge by (it came down a step on some visits and not on others, by what else was going on). So unseen, for
//     its first seconds on the bench, and for as long as frames are not slow for seconds on end, no frame counts as
//     longer than a quick one: a slow stretch (the scroll, the bench set down, a busy computer) only makes its work
//     wait a little. Where frames STAY slow (their mean over SLOW_MEAN for SLOW_FOR on end: a computer that cannot
//     draw the page at this quality even at rest), the page is handed the real times: it runs at its real speed and
//     judges its own quality, as it was built to. (Tried with a lower bar, the owner's own laptop went over it on a
//     busy afternoon and the machine was drawn a step coarser for its whole stay.)
// Anything missing, slow or broken: the frame is thrown away and the machine stays on its still and its film.

const READY_TIMEOUT = 45000;
const D2R = Math.PI / 180;
const SMOOTH_MS = 90, SMOOTH_RUN = 8;      // a run of frames with no long one among them, before it is shown
const SHOW_LATEST = 2500;                  // (a page that never draws smoothly is still shown in the end: alive, only slow)
const CALM_MS = 21, SLOW_MEAN = 36, SLOW_FOR = 3000;   // the calm clock: a frame's longest count; frames "stay slow": their mean step over this, for this long
const VEIL_TURN = 2.5;                     // degrees the camera may be turned under the veil before it is let go at once

export function createLive(machine, holder, { onReady, onFail, nap = false, lite = false }) {
  const iframe = document.createElement('iframe');
  iframe.className = 'live';
  iframe.title = `${machine.name}, the machine itself (its teardown page)`;
  iframe.setAttribute('tabindex', '-1');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.loading = 'eager';
  // the veil: a copy of the page's last picture, over the frame while its work starts again
  const veil = document.createElement('canvas');
  veil.className = 'veil';
  veil.setAttribute('aria-hidden', 'true');
  let vctx = null, veilOn = false, veilOff = 0, veilT = null, veilAim = null, veilWant = null, veilUntil = 0;

  let dead = false, ready = false, shown = false, win = null, doc = null, stage = null;
  let wanted = { part: null, mode: null };
  let applied = { view: null, mode: null };
  let cool = 0, coolT = 0, coolF = 0, tick = null, keep = null, failTimer = null, showTimer = null;
  let jobOn = false, loop = { T0: 0, T: 0, k: -1, pos: 0, from: null, in: false, skip: 0 }, map = null, last = null;
  // the camera: what is wanted (degrees about the machine's own bearing) and what is drawn (eased toward it)
  let aim = { az: 0, el: 0 }, cam = null, camT = 0, snap = true;
  // its frame: where machines.js wants it (place), small while a lite page starts
  let rect = null, small = lite, strip = null;
  // sleeping and waking; the run of smooth frames; the camera's own aim at rest
  let asleep = false, napping = nap, held = [], rafOwn = null, frames = 0, frameT = 0, smooth = 0, lookWas = null, lookStill = 0;
  let settledAt = 0, shownAt = 0, tierSeen = null, tierFirst = null;
  let clockReal = 0, clockOwn = 0, slept = false, stepMean = 16.7, slowSince = 0, realSteps = 0;
  const touch = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

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
  // (the view's own button eases nothing this file reads afterwards: a short wait is enough for it)
  const press = (b, quick) => {
    if (!b) return;
    b.click();
    cool = quick ? 0.2 : 0.85; coolT = win.LIVE.T; coolF = 0;
    clearTimeout(press.t); press.t = setTimeout(() => { cool = 0; }, 20000);
  };
  const cooling = () => {
    if (!cool) return false;
    if (win.LIVE.T - coolT > cool && coolF >= 4) { cool = 0; clearTimeout(press.t); return false; }
    return true;
  };
  const scaleOf = () => {
    const app = doc.getElementById('app');
    const m = app && win.getComputedStyle(app).transform.match(/matrix\(([^,]+)/);
    return m ? parseFloat(m[1]) || 1 : 1;
  };
  const P = () => win.PointerEvent || win.MouseEvent;
  // the timeline: pressed at a fraction f of it (a pointer's place need not be a whole pixel). Its place on the page
  // is read once, and again when the page is given another size: it is pressed every frame.
  const pressStrip = (f) => {
    if (!strip) {
      const hit = doc.querySelectorAll('.hit')[0];
      if (!hit) return false;
      const r = hit.getBoundingClientRect(), pad = 8 * scaleOf();
      strip = { hit, x: r.left + pad, w: r.width - 2 * pad, y: r.top + r.height / 2 };
    }
    const x = strip.x + Math.max(0, Math.min(1, f)) * strip.w, y = strip.y;
    const o = { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 1, isPrimary: true, button: 0, buttons: 1 };
    strip.hit.dispatchEvent(new (P())('pointerdown', o));
    win.dispatchEvent(new (P())('pointerup', { ...o, buttons: 0 }));
    return true;
  };

  // the page's view (pressing it also sets the page's own drag back to nothing)
  const setView = () => { press(find(machine.view, true), true); applied.view = machine.view; };
  // the machine's work, from the start of its stretch
  const startJob = () => {
    const j = machine.job;
    if (j.speed) {
      // the timeline's place for a time of the task: read off the page once (its two ends)
      pressStrip(0); const e0 = win.LIVE.E;
      pressStrip(1); const e1 = win.LIVE.E;
      if (!(typeof e0 === 'number' && e1 > e0)) return fail('timeline');
      map = { e0, e1 };
    }
    loop.T0 = loop.T = win.LIVE.T; loop.k = -1; loop.pos = j.from; loop.from = null; loop.in = false; loop.skip = 0;
    pressStrip(j.from);
    jobOn = true;
  };
  // every frame, after the page has drawn: the timeline pressed at the next place of the stretch
  const work = () => {
    if (!jobOn || dead || asleep) return;
    const j = machine.job, t = win.LIVE.T - loop.T0;
    if (j.speed) {
      // on along the timeline by the page's own clock. (The picture just drawn is of the place pressed last frame,
      // loop.pos as it stands; after a press back, a few frames pass before the page's state is of the new place.)
      const now = win.LIVE.T, dT = Math.max(0, now - loop.T); loop.T = now;
      let again = false;
      if (loop.skip > 0) loop.skip--;
      else if (last && last.phase === j.phase) {
        if (loop.from === null) loop.from = loop.pos;                 // the stretch begins where its phase begins
        loop.in = true;
        if (typeof last.u === 'number' && last.u >= 0.992) again = true;
      } else if (loop.in) again = true;                               // (it has left the phase)
      loop.pos += dT * j.speed / (map.e1 - map.e0);
      if (loop.pos >= j.to) again = true;
      // the start again: the picture just drawn (the stretch's end) is kept over the frame while the page goes back
      if (again) { if (shown) veilUp(); loop.pos = loop.from !== null ? loop.from : j.from; loop.in = false; loop.skip = 3; }
      loop.k = loop.pos;
      pressStrip(loop.pos);
    } else {
      // there and back: out in j.seconds, a rest, back the same way, a rest. Each way it comes up to speed and down
      // to rest over j.ease seconds (whatever of the machine is still moving where it turns, DRAY's lamp head, comes
      // to rest with it and is not stopped dead)
      const rest = j.rest || 0, lap = 2 * (j.seconds + rest), u = t % lap;
      const r = Math.min(0.45, (j.ease || 0) / j.seconds), top = 1 / (1 - r);
      const leg = (v) => !r ? v : v < r ? top * v * v / (2 * r) : v > 1 - r ? 1 - top * (1 - v) * (1 - v) / (2 * r) : top * (v - r / 2);
      const x = u < j.seconds ? leg(u / j.seconds) : u < j.seconds + rest ? 1 : u < lap - rest ? 1 - leg((u - j.seconds - rest) / j.seconds) : 0;
      loop.k = x;
      pressStrip(j.from + (j.to - j.from) * x);
    }
  };

  // ---- the veil
  const veilUp = () => {
    try {
      const gl = doc.getElementById('gl') || doc.querySelector('canvas');
      if (!gl || !gl.width || !rect) return;
      if (veil.width !== gl.width || veil.height !== gl.height) { veil.width = gl.width; veil.height = gl.height; vctx = null; }
      vctx = vctx || veil.getContext('2d');
      vctx.drawImage(gl, 0, 0);
      // (the picture's place in its page; the page is the frame's size)
      const r = gl.getBoundingClientRect();
      Object.assign(veil.style, { left: (rect.left + r.left) + 'px', top: (rect.top + r.top) + 'px', width: r.width + 'px', height: r.height + 'px', transition: 'none', opacity: '1' });
      veilOn = true; veilOff = frames + 3;            // (let go once the page has drawn its new start a few times)
      veilAim = { az: aim.az, el: aim.el }; veilWant = wanted; veilUntil = 0;
    } catch (e) { veilOn = false; veil.style.opacity = '0'; }
  };
  const veilDown = (ms) => {
    veilOn = false; veilUntil = performance.now() + ms + 80;
    veil.style.transition = `opacity ${ms}ms ease-in-out`;
    // (the transition starts from a drawn opacity of 1: asked for on the next frame)
    clearTimeout(veilT); veilT = setTimeout(() => { if (!dead) veil.style.opacity = '0'; }, 0);
  };
  // The veil is a still copy: it joins the two pictures only while the camera stands where it stood and the machine
  // is opened as it was. Turned by the scroll or the mouse, or opened, under the veil, the copy would stand a second
  // machine beside the live one: then it is let go at once (a short fade, not the long one).
  const veilTurned = () => !!veilAim && (Math.abs(aim.az - veilAim.az) + Math.abs(aim.el - veilAim.el) > VEIL_TURN ||
    wanted.part !== veilWant.part || wanted.mode !== veilWant.mode);
  const veilWatch = () => {
    if (veilOn || performance.now() >= veilUntil || !veilTurned()) return;
    veilGo(150);
  };
  const veilGo = (ms) => {
    veilOn = false; veilUntil = 0; clearTimeout(veilT);
    // (a fade already under way keeps its own length whatever is asked of it afterwards: so it is stopped where it
    // stands, and a new, short one started from there)
    const now = ms ? window.getComputedStyle(veil).opacity : '0';
    veil.style.transition = 'none'; veil.style.opacity = now;
    if (!ms) return;
    void veil.offsetWidth;
    veil.style.transition = `opacity ${ms}ms linear`;
    veil.style.opacity = '0';
  };

  // one change per tick, then read the page again: its buttons repaint on its own next frame
  const reconcile = () => {
    if (dead || !ready || asleep || cooling()) return;
    try {
      if (!jobOn) { startJob(); return; }
      if (applied.view !== machine.view) { setView(); return; }
      if (step()) { settledAt = 0; return; }
      // nothing left to change: it is shown after a run of smooth frames with its camera at rest, or put to sleep
      // until it is wanted
      if (!shown) {
        if (!settledAt) settledAt = performance.now();
        const late = performance.now() - settledAt > SHOW_LATEST;
        if ((smooth >= SMOOTH_RUN && lookAtRest()) || late) { if (napping) sleep(); else reveal(); }
      }
    } catch (e) { fail('reconcile'); }
  };
  const lookAtRest = () => typeof machine.aim === 'function' || lookStill >= 8;
  const step = () => {
    const partNames = machine.allParts, want = wanted;
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
    shown = true; shownAt = performance.now(); clearTimeout(showTimer);
    iframe.classList.add('on'); onReady && onReady();
  };

  // ---- asleep: the page's own requestAnimationFrame is held (its loop is nothing else), so it neither draws nor
  // counts time; this file's own frame work rides on the same call and sleeps with it
  const holdFrames = () => {
    if (rafOwn) return;
    rafOwn = win.requestAnimationFrame.bind(win);
    win.requestAnimationFrame = (cb) => {
      if (asleep && !dead) { held.push(cb); return 0; }
      return rafOwn((t) => cb(clock(t)));
    };
  };
  // the page's clock: the browser's frame time with every sleep taken out (a sleep counts as one quick frame); and
  // for a lite page calm, as said at the top: no frame longer than a quick one while it is unseen, for its first
  // seconds on the bench, and for as long as frames are quick on the whole
  const clock = (t) => {
    if (t !== clockReal) {
      if (!clockReal) clockOwn = t;                                   // (it goes on from the page's own time)
      else {
        let d = Math.max(0, t - clockReal);
        if (slept) { d = 16.7; slowSince = 0; }
        else { const c = Math.min(d, 60); stepMean += (c - stepMean) * Math.min(1, c / 1500); }   // (a long frame counts once, lightly)
        if (stepMean > SLOW_MEAN) { if (!slowSince) slowSince = t; } else slowSince = 0;
        if (lite) {
          if (!shown || performance.now() - shownAt < 6000 || !slowSince || t - slowSince < SLOW_FOR) d = Math.min(d, CALM_MS);
          else realSteps++;
        }
        clockOwn += d;
      }
      slept = false; clockReal = t;
    }
    return clockOwn;
  };
  const sleep = () => {
    if (asleep || dead || shown) return;
    asleep = true;
  };
  // (back to sleep: the reader has turned back above the bench, where it is unseen. It is kept, asleep, for the way
  // back; one not ready yet sleeps when it is.)
  const napAgain = () => {
    if (dead) return;
    napping = true;
    if (ready) asleep = true;
  };
  const wake = () => {
    napping = false;
    if (!asleep || dead) return;
    asleep = false; snap = true; smooth = 0; settledAt = 0; frameT = 0; slept = true;
    if (shown) shownAt = performance.now();           // (woken again onto a rising bench: its first seconds there, again)
    // (back through the page's requestAnimationFrame as this file left it, so a lite page is handed its calm clock
    // again: handed the browser's own time for one frame, it took that frame for its longest and stepped down)
    const q = held; held = [];
    q.forEach((cb) => win.requestAnimationFrame(cb));
    // a page woken before it was ready (see the ready clock below) is given its time from now
    if (!ready) armFail();
  };

  // the camera, set in the page's own frame: the bearing (and height, distance, framing) this machine is shown at,
  // turned by what machines.js asks, eased over a fraction of a second of real time (the same on any frame rate)
  const camera = (c, state) => {
    const v = machine.cam;
    const az = v.az + aim.az, el = (v.el != null ? v.el : c.el / D2R) + aim.el;
    const now = performance.now(), dt = Math.min(0.25, Math.max(0, (now - camT) / 1000)); camT = now;
    if (!cam) cam = { az: c.az / D2R, el: c.el / D2R, d: c.d };
    // (unseen, or just woken: straight to its place, nothing to ease from)
    const k = snap || !shown ? 1 : 1 - Math.exp(-dt / 0.35);
    cam.az += (az - cam.az) * k; cam.el += (el - cam.el) * k;
    if (v.d) cam.d += (v.d - cam.d) * k;
    snap = false;
    const o = { ...c, az: cam.az * D2R, el: Math.max(-15, Math.min(70, cam.el)) * D2R };
    if (v.d) o.d = cam.d;
    if (v.sy != null) o.sy = v.sy;
    if (v.sx != null) o.sx = v.sx;
    // the camera's aim held on the machine itself (the page's own aim comes after it, a little behind)
    const a = typeof machine.aim === 'function' && state && state.pose ? machine.aim(state.pose) : null;
    if (a && a.length === 3 && a.every(Number.isFinite)) { o.tx = a[0]; o.ty = a[1]; o.tz = a[2]; }
    return o;
  };
  const wrapFrame = () => {
    const orig = stage.frame;
    stage.frame = function (state, c, look) {
      coolF++; frames++;
      last = state;
      // the run of smooth frames; the page's own aim at rest
      const now = performance.now();
      if (frameT) smooth = now - frameT < SMOOTH_MS ? smooth + 1 : 0;
      frameT = now;
      if (c && typeof c.tx === 'number') {
        if (lookWas) lookStill = Math.abs(c.tx - lookWas[0]) + Math.abs(c.ty - lookWas[1]) + Math.abs(c.tz - lookWas[2]) < 0.004 ? lookStill + 1 : 0;
        lookWas = [c.tx, c.ty, c.tz];
      }
      if (!dead && jobOn && applied.view === machine.view && c && typeof c.az === 'number') {
        try { c = camera(c, state); } catch (e) { /* the page's own camera */ }
      }
      const out = orig.call(this, state, c, look);
      if (veilOn && frames >= veilOff) veilDown(veilTurned() ? 150 : machine.job.fade || 700);
      return out;
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
    win.addEventListener('resize', () => { strip = null; });
    win.LIVE.takeOver();
    tierFirst = typeof win.LIVE.tier === 'number' ? win.LIVE.tier : null;
    holdFrames();
    wrapFrame();
    ready = true;
    tick = setInterval(reconcile, 140);
    keep = setInterval(() => { if (asleep) return; try { win.LIVE.takeOver(); tierSeen = win.LIVE.tier; } catch (e) { fail('gone'); } }, 4000);
    (function spin() { if (dead) return; try { work(); } catch (e) { fail('work'); return; } win.requestAnimationFrame(spin); })();
    // (a page that never settles is still shown in the end: it is alive, only slow)
    showTimer = setTimeout(() => { if (!napping && !asleep) reveal(); }, 15000);
  };

  // the frame's size: what machines.js asks (place), but small while a lite page starts (the page reads it once)
  const size = () => {
    if (!rect) return;
    const s = small ? Math.min(1, 660 / rect.H) : 1;
    Object.assign(iframe.style, { left: rect.left + 'px', top: rect.top + 'px', width: (rect.W * s) + 'px', height: (rect.H * s) + 'px' });
  };
  const grown = () => { if (!small) return; small = false; strip = null; size(); };

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
        // (the page has started, at the quality its small frame gave it: now its real size)
        if (small && iframe.contentWindow.LIVE) grown();
        up = !!iframe.contentWindow.SIM_SHOWN && !!iframe.contentWindow.LIVE;
      } catch (e) { return fail('blocked'); }
      if (up) { clearTimeout(failTimer); grown(); prepare(); return; }
      // (a page woken early and unseen is not timed: a browser may give an unseen frame no frames to draw at all,
      // and it would be given up as slow before the reader ever reached it. Its time starts when it is woken.)
      if (!napping && !document.hidden) waited += 100;
      if (waited > READY_TIMEOUT) return fail('slow');
      setTimeout(poll, 100);
    };
    poll();
  });
  iframe.addEventListener('error', () => fail('error'));
  function armFail() {
    clearTimeout(failTimer);
    failTimer = setTimeout(() => {
      if (ready || napping || dead) return;
      if (document.hidden) armFail(); else fail('timeout');           // (a hidden tab draws nothing: not the page's fault)
    }, READY_TIMEOUT + 15000);
  }
  armFail();
  iframe.src = machine.page;
  holder.appendChild(iframe);
  holder.appendChild(veil);

  function dispose() {
    if (dead) return;
    dead = true; ready = false;
    clearInterval(tick); clearInterval(keep); clearTimeout(failTimer); clearTimeout(press.t); clearTimeout(showTimer); clearTimeout(veilT);
    held = [];
    try { iframe.src = 'about:blank'; } catch (e) { /* gone */ }
    iframe.remove(); veil.remove();
  }

  return {
    get ready() { return ready; },
    get shown() { return shown; },
    get napping() { return napping; },
    get asleep() { return asleep; },
    // (the page's own quality step, 0 the best, once it has run a while, and the one it started at: machines.js
    // remembers a low one the page came down to by itself)
    get tier() { return tierSeen; },
    get tier0() { return tierFirst; },
    get debug() { return { want: wanted, applied, cool, aim, cam, jobOn, shown, asleep, napping, lite, small, smooth, lookStill, frames, veil: veilOn, k: loop.k, tier: tierSeen, tier0: tierFirst, mean: +stepMean.toFixed(1), real: realSteps, s: last && last.s, E: last && last.E, phase: last && last.phase, T: win && win.LIVE && win.LIVE.T }; },
    set(state) { wanted = { part: state.part || null, mode: state.mode || null }; veilWatch(); },
    orbit(az, el) { aim = { az, el }; veilWatch(); },
    place(r) {
      // (a frame moved or given another size leaves the veil where it was: it goes at once)
      if (rect && (r.left !== rect.left || r.top !== rect.top || r.W !== rect.W || r.H !== rect.H) && (veilOn || performance.now() < veilUntil)) veilGo(0);
      rect = r; size();
    },
    nap: napAgain,
    wake,
    dispose,
  };
}
