// The story clock (SPEC 4.3) and the page's easing. Native scroll, never hijacked: `s` is the scroll position
// in screens, eased toward the real one, and every section owns a range of it with a local t from 0 to 1.
// Sections are read from the DOM (main > section), so a package adds one by adding its markup.
export const clamp01 = (v) => Math.min(1, Math.max(0, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (v) => { const t = clamp01(v); return t * t * (3 - 2 * t); };
export const easeIO = (v) => { const t = clamp01(v); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const easeOut = (v) => 1 - Math.pow(1 - clamp01(v), 3);
export const backOut = (v, k = 1.2) => { const t = clamp01(v) - 1; return 1 + (k + 1) * t * t * t + k * t * t; };
// 1 inside [a, b], with soft shoulders f wide
export const win = (p, a, b, f = 0.2) => smooth((p - a) / f) * (1 - smooth((p - b) / f));
// 0 to 1 while p crosses [a, b]
export const span = (p, a, b) => clamp01((p - a) / (b - a));
// frame-rate independent approach: about 1/rate seconds to cover 63 percent of the way
export const damp = (a, b, rate, dt) => a + (b - a) * (1 - Math.exp(-rate * dt));

export function createClock({ touch = false, reduced = false } = {}) {
  const clock = { s: 0, target: 0, vh: 1, max: 1, top: 0, sections: [], current: null, reduced, moving: false };

  // Give every section its length in screens and read where it starts. Call again on resize.
  clock.measure = () => {
    const els = [...document.querySelectorAll('main > section[data-screens]')];
    const probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;top:0;height:100svh;width:0;visibility:hidden';
    document.body.appendChild(probe);
    clock.vh = probe.offsetHeight || window.innerHeight;
    document.body.removeChild(probe);
    let at = 0;
    clock.sections = els.map((el, index) => {
      const screens = Number(el.dataset.screens) || 1;
      el.style.height = `${(screens * clock.vh).toFixed(1)}px`;
      const sec = clock.sections.find((x) => x.el === el) || { el, id: el.id, name: el.dataset.sec || el.id };
      Object.assign(sec, { index, screens, s0: at, s1: at + screens });
      at += screens;
      return sec;
    });
    clock.max = Math.max(at, 0.001);
    clock.top = els.length ? els[0].getBoundingClientRect().top + window.scrollY : 0;
  };

  clock.at = (s) => clock.sections.find((x) => s >= x.s0 && s < x.s1) || clock.sections[s < 0 ? 0 : clock.sections.length - 1] || null;
  // Where a story position sits on the page, in pixels, so a link or a key can scroll there.
  clock.pixels = (s) => clock.top + s * clock.vh;
  clock.jump = () => { clock.s = clock.target; };

  clock.update = (dt) => {
    clock.target = Math.min(clock.max, Math.max(0, (window.scrollY - clock.top) / clock.vh));
    const before = clock.s;
    clock.s = reduced ? clock.target : damp(clock.s, clock.target, touch ? 7 : 4.5, dt);
    if (Math.abs(clock.target - clock.s) < 0.0004) clock.s = clock.target;
    clock.current = clock.at(clock.s);
    clock.moving = Math.abs(clock.s - before) > 0.00005;
    for (const sec of clock.sections) {
      sec.u = Math.min(sec.screens, Math.max(0, clock.s - sec.s0));     // screens into the section
      sec.t = sec.u / sec.screens;                                      // 0 to 1
      sec.near = clock.s > sec.s0 - 1.5 && clock.s < sec.s1 + 1.5;
      sec.far = clock.s < sec.s0 - 3 || clock.s > sec.s1 + 3;
    }
  };
  return clock;
}
