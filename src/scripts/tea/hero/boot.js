// The tea room hero's entry (Stage.astro): after first paint and a moment of idle, and only with WebGL, no reduced
// motion, no Save-Data and a device that can carry it, it imports the 3D chunk (stage.js, three.js inside it).
// Anything that stops it leaves the poster, with the reason in the section's data-3d-off. ?hero=on skips the device
// checks (not WebGL or reduced motion); ?hero=off keeps the poster.
const section = document.querySelector('[data-tea-hero]');
const stage = section && section.querySelector('[data-tea-stage]');

function webgl() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
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

function start() {
  const no = why();
  if (no) { off(no); return; }
  import('./stage.js')
    .then((m) => m.mount(section, stage))
    .catch(() => off('failed'));
}

if (stage) {
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 200));
  requestAnimationFrame(() => requestAnimationFrame(() => idle(start, { timeout: 1500 })));
}
