// One machine's own teardown page, alive in a frame, worked from outside (machines.js). The page is the lab's live
// notebook (AO-073): nothing of it is copied or changed on disk. While it runs in the frame (same site), this file
// adds one style element to hide its console, and works it only as a reader could. What it relies on, and nothing else:
//   - window.SIM_SHOWN (set after the first drawn frame), window.LIVE.takeOver() (stops the self-running tour) and, on
//     a page whose task plays once, window.LIVE.startTour() (taken over at once: its task from the start, playing)
//   - the console's buttons, div.bt, found by their words (HERO, CUT, ISOLATE, the parts, the speeds); a pressed one is
//     drawn in a colour, an unpressed one near white
//   - the console's first slider strip, div.hit (its scrub bar, pressed with a pointer at a place along it)
//   - #gl, the canvas, and the page's own drag on it: the camera is turned by a pointer dragged across it, as a reader
//     would (each page adds the drag to its view's own camera, and eases the camera there by itself)
// Anything missing, slow or broken: the frame is thrown away and the machine stays on its still and its film.

const READY_TIMEOUT = 45000;

export function createLive(machine, holder, { onReady, onFail }) {
  const iframe = document.createElement('iframe');
  iframe.className = 'live';
  iframe.title = `${machine.name}, the machine itself (its teardown page)`;
  iframe.setAttribute('tabindex', '-1');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.loading = 'eager';
  let dead = false, ready = false, win = null, doc = null, gl = null;
  let want = { part: null, mode: null };
  let applied = { view: null, mode: null };
  let cool = 0, tick = null, keep = null, failTimer = null;
  let jobOn = false, loopT0 = 0;
  // the camera's turn: what is wanted (degrees about the view's own camera) and what has been dragged in so far
  let aim = { az: 0, el: 0 }, sent = { az: 0, el: 0 };

  const fail = (why) => {
    if (dead) return;
    dispose();
    onFail && onFail(why);
  };

  const btns = () => [...doc.querySelectorAll('.bt')];
  const find = (word, last = false) => {
    const all = btns().filter((b) => b.textContent.trim() === word);
    return last ? all[all.length - 1] : all[0];
  };
  const isOn = (b) => {
    if (!b) return false;
    const c = win.getComputedStyle(b).backgroundColor.match(/\d+(\.\d+)?/g);
    if (!c) return false;
    const [r, g, bl] = c.map(Number);
    return (r + g + bl) / 3 < 236 || Math.max(r, g, bl) - Math.min(r, g, bl) > 30;
  };
  // after a press, wait until the page has drawn some frames of its own (its buttons ease over 0.7 s of its time)
  const press = (b) => {
    if (!b) return;
    b.click();
    cool = 1;
    let n = 0;
    const t0 = performance.now();
    const done = () => { cool = 0; };
    const step = () => { if (dead) return; if (++n >= 14 && performance.now() - t0 > 850) done(); else win.requestAnimationFrame(step); };
    win.requestAnimationFrame(step);
    clearTimeout(press.t); press.t = setTimeout(done, 6000);
  };
  const scaleOf = () => {
    const app = doc.getElementById('app');
    const m = app && win.getComputedStyle(app).transform.match(/matrix\(([^,]+)/);
    return m ? parseFloat(m[1]) || 1 : 1;
  };
  const P = () => win.PointerEvent || win.MouseEvent;
  const pressStrip = (index, f) => {
    const hit = doc.querySelectorAll('.hit')[index];
    if (!hit) return false;
    const r = hit.getBoundingClientRect(), pad = 8 * scaleOf();
    const x = r.left + pad + Math.max(0, Math.min(1, f)) * (r.width - 2 * pad), y = r.top + r.height / 2;
    const o = { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 1, isPrimary: true, button: 0, buttons: 1 };
    hit.dispatchEvent(new (P())('pointerdown', o));
    win.dispatchEvent(new (P())('pointerup', { ...o, buttons: 0 }));
    return true;
  };

  // the page's view: pressing it also sets its own drag back to nothing
  const setView = () => { press(find(machine.view, true)); applied.view = machine.view; sent = { az: 0, el: 0 }; };
  // the machine's work, kept going
  const startJob = () => {
    const j = machine.job;
    if (j.scrub == null) {
      win.LIVE.startTour(); win.LIVE.takeOver();
      loopT0 = win.LIVE.T;
      applied.view = null; applied.mode = null;               // (the tour's start set its own view and the drag back)
    } else {
      pressStrip(0, j.scrub);
      press(find(j.play));
      loopT0 = win.LIVE.T;
    }
    jobOn = true;
  };

  // one change per tick, then read the page again: its buttons repaint on its own next frame
  const reconcile = () => {
    if (dead || !ready || cool > 0) return;
    try {
      const j = machine.job;
      if (!jobOn || (j.loop && win.LIVE.T - loopT0 > j.loop)) { startJob(); return; }
      if (applied.view !== machine.view) { setView(); return; }
      const partNames = machine.allParts;
      if (machine.kind === 'set') {
        if (want.mode && applied.mode !== want.mode) { press(find(machine.modes[want.mode])); applied.mode = want.mode; return; }
        for (const n of partNames) {
          const b = find(n);
          if (b && isOn(b) !== (n === want.part)) { press(b); return; }
        }
        return;
      }
      // toggles: the part first, then the mode
      for (const n of partNames) {
        const b = find(n);
        if (b && isOn(b) && n !== want.part) { press(b); return; }
      }
      if (want.part && !isOn(find(want.part))) { press(find(want.part)); return; }
      // the wanted mode first (pressing it lets go of the others), then anything still pressed
      const wantMode = want.part && want.mode ? find(machine.modes[want.mode]) : null;
      if (wantMode && !isOn(wantMode)) { press(wantMode); return; }
      for (const [m, word] of Object.entries(machine.modes)) {
        const b = find(word);
        if (b && isOn(b) && !(m === want.mode && want.part)) { press(b); return; }
      }
    } catch (e) { fail('reconcile'); }
  };

  // the camera: drag across the canvas by what is still wanted (each page turns its camera 0.3 degree a pixel of its
  // own across, and tilts it 0.2 degree a pixel down, and eases it there by itself)
  const turn = () => {
    if (dead || !ready || !jobOn || applied.view !== machine.view) return;
    const dAz = aim.az - sent.az, dEl = aim.el - sent.el;
    if (Math.abs(dAz) < 0.08 && Math.abs(dEl) < 0.08) return;
    try {
      const u = scaleOf(), r = gl.getBoundingClientRect();
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      const o = { bubbles: true, cancelable: true, pointerId: 31, isPrimary: true, button: 0, buttons: 1, pointerType: 'mouse' };
      gl.dispatchEvent(new (P())('pointerdown', { ...o, clientX: x, clientY: y }));
      gl.dispatchEvent(new (P())('pointermove', { ...o, clientX: x + dAz * u / 0.3, clientY: y + dEl * u / 0.2 }));
      gl.dispatchEvent(new (P())('pointerup', { ...o, buttons: 0, clientX: x + dAz * u / 0.3, clientY: y + dEl * u / 0.2 }));
      sent = { az: aim.az, el: aim.el };
    } catch (e) { /* the turn is a nicety: the machine stays */ }
  };

  // every control this file will press must be there, or the machine stays on its still and film
  const controlsOk = () => {
    const words = [machine.view, ...Object.values(machine.modes)];
    machine.open.forEach((o) => { if (o.part) words.push(o.part); });
    if (machine.job.play) words.push(machine.job.play);
    if (words.some((w) => !find(w))) return false;
    if (machine.job.scrub != null && !doc.querySelectorAll('.hit')[0]) return false;
    if (machine.job.scrub == null && typeof win.LIVE.startTour !== 'function') return false;
    return !!gl;
  };

  const prepare = () => { try { prepareNow(); } catch (e) { fail('prepare'); } };
  const prepareNow = () => {
    win = iframe.contentWindow; doc = iframe.contentDocument;
    if (!win || !doc || !win.LIVE || typeof win.LIVE.takeOver !== 'function' || !doc.querySelector('.ui')) return fail('missing');
    gl = doc.getElementById('gl');
    if (!controlsOk()) return fail('controls');
    const st = doc.createElement('style');
    st.setAttribute('data-tea-bench', '');
    st.textContent = '.ui{opacity:0!important;pointer-events:none!important}.turn,.tourchip,.cur,.ring{display:none!important}';
    doc.head.appendChild(st);
    // the strip and the canvas capture the pointer they are pressed with; a pointer pressed from outside has none
    const cap = win.Element.prototype.setPointerCapture;
    for (const h of [gl, ...doc.querySelectorAll('.hit')]) h.setPointerCapture = function (id) { try { cap.call(this, id); } catch (e) { /* none */ } };
    win.LIVE.takeOver();
    ready = true;
    tick = setInterval(reconcile, 140);
    keep = setInterval(() => { try { win.LIVE.takeOver(); } catch (e) { fail('gone'); } }, 4000);
    (function spin() { if (dead) return; turn(); win.requestAnimationFrame(spin); })();
    // give the first state a moment to land before showing the frame
    setTimeout(() => { if (!dead) { iframe.classList.add('on'); onReady && onReady(); } }, 1200);
  };

  iframe.addEventListener('load', () => {
    if (dead) return;
    let waited = 0;
    const poll = () => {
      if (dead) return;
      let shown = false;
      try {
        const d = iframe.contentDocument;
        // not the machine's page (a missing page, an error page): give up at once
        if (d && d.readyState === 'complete' && !d.getElementById('app')) return fail('not-a-teardown');
        shown = !!iframe.contentWindow.SIM_SHOWN;
      } catch (e) { return fail('blocked'); }
      if (shown) { clearTimeout(failTimer); prepare(); return; }
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
    clearInterval(tick); clearInterval(keep); clearTimeout(failTimer); clearTimeout(press.t);
    try { iframe.src = 'about:blank'; } catch (e) { /* gone */ }
    iframe.remove();
  }

  return {
    get ready() { return ready; },
    get debug() { return { want, applied, cool, aim, sent, jobOn }; },
    set(state) { want = { part: state.part || null, mode: state.mode || null }; },
    orbit(az, el) { aim = { az, el }; },
    dispose,
  };
}
