// One machine's own teardown page, alive in a frame, worked from outside.
//
// The page is the lab's live notebook (AO-073): nothing of it is copied or changed on disk. While it runs in the
// frame (same site), this file adds one style element to hide its console, and presses its own controls. What it
// relies on, and nothing else:
//   - window.SIM_SHOWN (set after the first drawn frame) and window.LIVE.takeOver() (stops the self-running tour)
//   - window.LIVE.setG(g) on DRAY's page (its gravity)
//   - the console's buttons, div.bt, found by their words (CRANE, ISOLATE, CUT, HERO, SECTION, ...); a pressed one is
//     drawn in a colour, an unpressed one near white
//   - the console's slider strips, div.hit (pressed with a pointer at a place along them)
//   - the console's text in div.ui (read for the one number the slider changes)
//   - #gl, the canvas (turned by the reader's own pointer after "Turn it yourself")
// Anything missing, slow or broken: the frame is thrown away and the machine stays on its film and stills.

const READY_TIMEOUT = 45000;

export function createLive(machine, holder, { onReady, onFail, onWheel }) {
  const iframe = document.createElement('iframe');
  iframe.className = 'live';
  iframe.title = `${machine.name}, the machine itself (its teardown page)`;
  iframe.setAttribute('tabindex', '-1');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.loading = 'eager';
  let dead = false, ready = false, win = null, doc = null;
  let want = { view: machine.hero.view, part: null, mode: null };
  let applied = { view: null };
  let cool = 0, tick = null, keep = null, failTimer = null;
  let userHeld = false;
  let sliderValue = null, sliderSent = null, wantSetup = false;

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
  // after a press, wait until the page has drawn some frames of its own (its console repaints every frame or two)
  const press = (b) => {
    if (!b) return;
    b.click();
    cool = 1;
    let n = 0;
    const done = () => { cool = 0; };
    const t0 = performance.now();
    // its buttons ease between pressed and not over 0.7 s of its own time: wait that out
    const step = () => { if (dead) return; if (++n >= 14 && performance.now() - t0 > 850) done(); else win.requestAnimationFrame(step); };
    win.requestAnimationFrame(step);
    clearTimeout(press.t); press.t = setTimeout(done, 6000);
  };

  // one change per tick, then read the page again: its buttons repaint on its own next frame
  const reconcile = () => {
    if (dead || !ready || userHeld) return;
    if (cool > 0) return;
    try {
      const k = machine.kind;
      const partNames = machine.allParts || machine.parts.map((p) => p.button);
      if (k === 'hab') {
        const view = want.mode === 'cut' ? machine.cutView : want.view;
        if (applied.view !== view || !isOn(find(view, true))) { press(find(view, true)); applied.view = view; return; }
        for (const n of partNames) {
          const b = find(n);
          if (!b) continue;
          if (isOn(b) !== (n === want.part)) { press(b); return; }
        }
        return;
      }
      if (applied.view !== want.view) { press(find(want.view, true)); applied.view = want.view; return; }
      if (k === 'set') {
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

  const pressStrip = (index, f, padPx) => {
    const hit = doc.querySelectorAll('.hit')[index];
    if (!hit) return false;
    const r = hit.getBoundingClientRect();
    const pad = padPx * scaleOf();
    const x = r.left + pad + Math.max(0, Math.min(1, f)) * (r.width - 2 * pad);
    const y = r.top + r.height / 2;
    const P = win.PointerEvent || win.MouseEvent;
    const o = { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 1, isPrimary: true, button: 0, buttons: 1 };
    hit.dispatchEvent(new P('pointerdown', o));
    win.dispatchEvent(new P('pointerup', { ...o, buttons: 0 }));
    return true;
  };
  let setupDone = false;
  const setup = () => {
    const su = machine.breakIt.setup;
    if (!ready || !su || setupDone) return;
    setupDone = true;
    try { pressStrip(su.hit, su.at, 8); } catch (e) { /* fine */ }
  };

  const sendSlider = () => {
    if (!ready || sliderValue == null || sliderValue === sliderSent) return;
    sliderSent = sliderValue;
    const br = machine.breakIt;
    try {
      if (br.drive === 'setG' && win.LIVE && typeof win.LIVE.setG === 'function') { win.LIVE.setG(sliderValue); return; }
      pressStrip(br.hit, (sliderValue - br.min) / (br.max - br.min), br.hitPad ?? 8);
      if (br.pause) setTimeout(() => { try { const p = find(br.pause); if (p && !dead) p.click(); } catch (e) { /* fine */ } }, 60);
    } catch (e) { /* the slider is a nicety: the machine stays */ }
  };
  const scaleOf = () => {
    const app = doc.getElementById('app');
    const m = app && win.getComputedStyle(app).transform.match(/matrix\(([^,]+)/);
    return m ? parseFloat(m[1]) || 1 : 1;
  };

  const readLines = () => {
    const ui = doc.querySelector('.ui');
    return ui ? ui.innerText.split('\n').map((s) => s.trim()).filter(Boolean) : [];
  };
  const reading = () => {
    if (!ready) return null;
    try {
      const rd = machine.breakIt.readout;
      const lines = readLines();
      if (rd.after) {
        const i = lines.indexOf(rd.after);
        if (i < 0) return null;
        const got = lines.slice(i + 1, i + 1 + rd.take);
        return { big: got.slice(0, rd.big).join(' '), small: got.slice(rd.big).join(' ') };
      }
      const a = lines.find((l) => rd.find.test(l));
      const b = lines.find((l) => rd.also.test(l));
      return a || b ? { big: a ? a.split(' · ')[0] : '', small: [a && a.split(' · ').slice(1).join(' · '), b].filter(Boolean).join(' · ') } : null;
    } catch (e) { return null; }
  };

  // every control this chapter will press must be there, or the machine stays on its film and stills
  const controlsOk = () => {
    const br = machine.breakIt;
    const words = [machine.hero.view, ...machine.parts.map((p) => p.button), ...Object.values(machine.modes || {})];
    if (machine.cutView) words.push(machine.cutView);
    if (br.view) words.push(br.view);
    if (br.pause) words.push(br.pause);
    if (words.some((w) => !find(w))) return false;
    const hits = doc.querySelectorAll('.hit');
    if (br.drive === 'hit' && !hits[br.hit]) return false;
    if (br.setup && !hits[br.setup.hit]) return false;
    if (br.drive === 'setG' && typeof win.LIVE.setG !== 'function') return false;
    return true;
  };

  const prepare = () => { try { prepareNow(); } catch (e) { fail('prepare'); } };
  const prepareNow = () => {
    win = iframe.contentWindow; doc = iframe.contentDocument;
    if (!win || !doc || !win.LIVE || typeof win.LIVE.takeOver !== 'function' || !doc.getElementById('gl') || !doc.querySelector('.ui')) return fail('missing');
    if (!controlsOk()) return fail('controls');
    const st = doc.createElement('style');
    st.setAttribute('data-tea-bench', '');
    st.textContent = `.ui{opacity:0!important;pointer-events:none!important}.turn,.tourchip,.cur,.ring{display:none!important}
      html,body{cursor:default}#gl{cursor:grab}`;
    doc.head.appendChild(st);
    // the slider strips capture the pointer they are pressed with; a pressed-from-outside pointer has none to capture
    const proto = win.Element.prototype, cap = proto.setPointerCapture;
    for (const h of doc.querySelectorAll('.hit')) h.setPointerCapture = function (id) { try { cap.call(this, id); } catch (e) { /* none */ } };
    win.LIVE.takeOver();
    // any wheel over the frame scrolls the page, and hands the machine back
    win.addEventListener('wheel', (e) => {
      e.stopPropagation(); e.preventDefault();
      window.scrollBy(0, e.deltaY);
      onWheel && onWheel();
    }, { capture: true, passive: false });
    win.addEventListener('keydown', (e) => { if (!userHeld) { e.stopPropagation(); } }, { capture: true });
    ready = true;
    tick = setInterval(() => { reconcile(); if (wantSetup) setup(); sendSlider(); }, 140);
    keep = setInterval(() => { try { if (!userHeld) win.LIVE.takeOver(); } catch (e) { fail('gone'); } }, 4000);
    // give the first state a moment to land before showing the frame
    setTimeout(() => { if (!dead) { iframe.classList.add('on'); onReady && onReady(); } }, 900);
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
    clearInterval(tick); clearInterval(keep); clearTimeout(failTimer);
    try { iframe.src = 'about:blank'; } catch (e) { /* gone */ }
    iframe.remove();
  }

  return {
    get ready() { return ready; },
    get debug() { return { want, applied, cool, userHeld }; },
    set(state) { want = { ...want, ...state }; },
    slide(v) { sliderValue = v; },
    breakSetup(on) { wantSetup = on; if (!on) setupDone = false; },
    reading,
    hold(on) {
      userHeld = on;
      iframe.classList.toggle('held', on);
      if (on) { try { win.LIVE.takeOver(); iframe.focus(); } catch (e) { /* fine */ } }
      else { applied.view = null; applied.mode = null; try { iframe.blur(); } catch (e) { /* fine */ } }
    },
    dispose,
  };
}
