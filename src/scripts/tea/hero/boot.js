// The tea room hero's entry (Stage.astro): after first paint and a moment of idle, and only with WebGL, no reduced
// motion, no Save-Data and a device that can carry it, it imports the 3D chunk (stage.js, three.js inside it).
// Anything that stops it leaves the poster, with the reason in the section's data-3d-off. ?hero=on skips the device
// checks (not WebGL or reduced motion); ?hero=off keeps the poster.
const section = document.querySelector('[data-tea-hero]');
const stage = section && section.querySelector('[data-tea-stage]');

function webgl() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    const ext = gl && gl.getExtension('WEBGL_lose_context');
    if (ext) ext.loseContext();   // only a probe: its context is let go at once, not left for the collector
    return !!gl;
  } catch { return false; }
}

function why() {
  const q = new URLSearchParams(location.search).get('hero');
  if (q === 'off') return 'asked';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return 'reduced motion';
  if (q !== 'on') {
    const c = navigator.connection;
    if (c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || ''))) return 'save data';
    if ((navigator.deviceMemory || 8) < 2 || (navigator.hardwareConcurrency || 8) < 3) return 'small device';
  }
  if (!webgl()) return 'no webgl';
  return '';
}

// Kept off: the reason, and the hero is settled (data-hero-settled: it will change no layout by itself, which the 3D
// path says once the section is pinned and its first frame is up). Tests wait on it.
function off(reason) {
  section.dataset['3dOff'] = reason;
  section.dataset.heroSettled = '';
}

// Leaving the page while the scene loads (leave, passed to mount): from pagehide the scene starts no load and reports
// none it loses. Only pagehide: a beforeunload may not lead anywhere (a mailto link fires it in some browsers, and the
// page stays), and a beforeunload listener keeps Firefox from caching the page for the way back. WebKit cuts a page's
// loads at beforeunload already, before pagehide: a model picture lost in between is reported only if it is still
// missing once a leave would have shown (actors.js).
function start() {
  const no = why();
  if (no) { off(no); return; }
  const leave = new AbortController();
  const stop = () => leave.abort();
  addEventListener('pagehide', stop);
  const loaded = () => { removeEventListener('pagehide', stop); };
  import('./stage.js')
    .then((m) => m.mount(section, stage, { signal: leave.signal, loaded }))
    .then(loaded, () => { loaded(); off('failed'); });
}

if (stage) {
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 200));
  requestAnimationFrame(() => requestAnimationFrame(() => idle(start, { timeout: 1500 })));
}
