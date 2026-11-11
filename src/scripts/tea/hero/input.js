// What moves the hero besides time: the scroll progress through the pinned section (0 at the top, 1 when the pin
// lets go), the pointer (a mouse), the device's tilt where it needs no permission prompt, and on touch screens with
// no tilt a slow drift. All of it is eased in update(dt); set() and freeze() are the screenshot hooks.
const clamp1 = (v) => Math.max(-1, Math.min(1, v));
const turn = (d) => ((d + 540) % 360) - 180;   // an angle's difference, the short way round

export function createInput(section, spec) {
  const st = {
    raw: 0, p: 0, par: { x: 0, y: 0 }, aim: { x: 0, y: 0 }, mouse: false, tilt: null, tilted: false,
    forced: null, snap: false,
  };
  // a drag that leaves the window still reports the pointer: held to the window's edge, like the tilt
  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    st.mouse = true;
    st.aim.x = clamp1((e.clientX / innerWidth) * 2 - 1);
    st.aim.y = clamp1(-((e.clientY / innerHeight) * 2 - 1));
  };
  // Tilt, against a rest posture that follows the phone's own over a few seconds (so a new way of holding it drifts
  // back to the centre). Near upright (beta about 90) gamma swings as the phone passes vertical: x fades out there.
  const onTilt = (e) => {
    if (e.gamma == null || e.beta == null) return;
    const now = e.timeStamp || performance.now();
    const T = st.tilt || (st.tilt = { g: e.gamma, b: e.beta, t: now });
    const k = 1 - Math.exp(-Math.max(0, now - T.t) / 4000);
    T.t = now;
    T.g = turn(T.g + turn(e.gamma - T.g) * k);
    T.b = turn(T.b + turn(e.beta - T.b) * k);
    const steady = Math.max(0, Math.min(1, (80 - Math.abs(e.beta)) / 20));
    st.tilted = true;
    st.aim.x = clamp1(turn(e.gamma - T.g) / 20) * steady;
    st.aim.y = clamp1(turn(e.beta - T.b) / 20);
  };
  addEventListener('pointermove', onMove, { passive: true });
  // Android sends these without asking. iOS sends none until a page asks, and we never ask, so there the drift stays.
  // Chromium has DeviceOrientationEvent.requestPermission too, so its presence says nothing: listen, and tilt takes over
  // from the drift only once a real reading arrives.
  if (typeof DeviceOrientationEvent !== 'undefined' && matchMedia('(pointer: coarse)').matches) {
    addEventListener('deviceorientation', onTilt, { passive: true });
  }

  function read() {
    if (st.forced != null) return st.forced;
    const r = section.getBoundingClientRect();
    const run = r.height - innerHeight;
    return run > 0 ? Math.max(0, Math.min(1, -r.top / run)) : 0;
  }

  return {
    st,
    // dt in seconds; time drives the drift
    update(dt, time) {
      st.raw = read();
      const k = st.snap ? 1 : 1 - Math.exp(-dt * 5.5);
      st.p += (st.raw - st.p) * k;
      if (Math.abs(st.raw - st.p) < 1e-4) st.p = st.raw;
      if (!st.mouse && !st.tilted && st.forcedPar == null) {
        st.aim.x = Math.sin(time * 0.21) * spec.drift;
        st.aim.y = Math.sin(time * 0.13 + 1.1) * spec.drift * 0.6;
      }
      if (st.forcedPar) { st.aim.x = st.forcedPar[0]; st.aim.y = st.forcedPar[1]; }
      const e = st.snap ? 1 : 1 - Math.exp(-dt * spec.ease);
      st.par.x += (st.aim.x - st.par.x) * e;
      st.par.y += (st.aim.y - st.par.y) * e;
    },
    dispose() {
      removeEventListener('pointermove', onMove);
      removeEventListener('deviceorientation', onTilt);
    },
  };
}
