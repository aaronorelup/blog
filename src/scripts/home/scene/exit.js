// Leaving. A link out of the site, or to a page the overlay doesn't open, flies the camera out through the torii
// first and the white rises as it goes; the page opens with the white at full. A new tab leaves the scene where it
// stood. Past the last stop the same flight starts the visit over at the garden. With the overlay's panel up it
// closes first (closePanel), then the camera flies.
import { closePanel } from '../overlay/panel.js';
import { routeOf } from '../overlay/routes.js';
import { cardState } from './cards.js';
import { syncRail } from './rail.js';
import { updatePetals } from './world/petals.js';

// a link out of the site (or to a page outside the panel) flies out through the gate first
export function bindOutbound(s) {
  addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || !s.renderer || s.reduced) return;
    const href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || /^(mailto:|tel:|javascript:)/i.test(href)) return;
    if (a.hasAttribute('data-no-fly') || routeOf(a.href)) return;   // the panel's routes open there instead
    if (s.motion === 'exit') { e.preventDefault(); return; }
    e.preventDefault();
    flyToLink(s, a.href, a.target === '_blank');
  });
}

// leaving for somewhere else: fly out through the torii, then hand over to the link
function flyToLink(s, url, newTab) {
  s.linkOut = { url, newTab };
  if (s.panelUp) {
    closePanel();
    clearTimeout(s.flyT);
    s.flyT = setTimeout(() => startExit(s, 'link'), 560);
    return;
  }
  startExit(s, 'link');
}

// past the last card the camera leaves through the torii and the page starts over
export function startExit(s, dest = 'restart') {
  if (s.motion === 'exit') return;
  s.motion = 'exit';
  s.exitDest = dest;
  s.locked = true;
  // leave from wherever the camera actually is, so a click mid-scene doesn't cut
  const pos = s.camera.position, tgt = s._q;
  s.exit = {
    t0: performance.now(), dur: dest === 'link' ? 1500 : 2100,
    from: [pos.x, pos.y, pos.z], target: [tgt.x, tgt.y, tgt.z], fov: s.camera.fov,
    to: [0, 2.6, 62],                      // always turn to face the torii on the way out
  };
  s.flash.style.transition = 'none';
  s.flash.style.opacity = '0';
  if (!s.raf) { s.lastTs = 0; s.raf = requestAnimationFrame(s.loop); }
  // safety: never strand the user mid-flight if the render loop stalls
  clearTimeout(s.exitGuard);
  s.exitGuard = setTimeout(() => { if (s.motion === 'exit') endExit(s); }, s.exit.dur + 500);
}

export function exitStep(s, ts) {
  const e = s.exit;
  const p = Math.min(1, (ts - e.t0) / e.dur);
  const acc = p * p;                       // holds, then gathers speed through the gate
  const lerp = (a, b) => a + (b - a) * acc;

  s.camera.position.set(lerp(e.from[0], 0), lerp(e.from[1], 2.9), lerp(e.from[2], 40));
  s._q.set(lerp(e.target[0], e.to[0]), lerp(e.target[1], e.to[1]), lerp(e.target[2], e.to[2]));
  s.camera.lookAt(s._q);
  s.camera.fov = e.fov + acc * 14;
  s.camera.updateProjectionMatrix();

  const fade = Math.max(0, 1 - p / 0.22);
  s.cards.forEach((c, i) => cardState(c.el, i === s.stopIdx ? fade : 0, 0, 0));
  s.flash.style.opacity = Math.max(0, Math.min(1, (p - 0.62) / 0.34)).toFixed(3);

  if (!document.hidden) {
    if (!s.reduced && s.petalCount > 0) updatePetals(s, ts / 1000);
    s.renderer.render(s.scene, s.camera);
  }
  if (p >= 1) endExit(s);
}

function endExit(s) {
  if (s.exitDest === 'link') completeLink(s);
  else finishExit(s);
}

// white is at full when the link opens; a new tab leaves the scene where it stood
function completeLink(s) {
  const out = s.linkOut;
  s.linkOut = null;
  s.motion = 'idle';
  s.exit = null;
  if (!out.newTab) {
    s.flash.style.transition = 'none';
    s.flash.style.opacity = '1';
    location.href = out.url;
    return;
  }
  open(out.url, '_blank', 'noopener,noreferrer');
  s.nudge = 0;
  s.locked = false;
  s.lastProgress = -9;
  s.cards.forEach((c, i) => cardState(c.el, i === s.stopIdx ? 1 : 0, 0, 0));
  syncRail(s);
  setTimeout(() => {
    s.flash.style.transition = 'opacity 900ms ease';
    s.flash.style.opacity = '0';
  }, 120);
}

function finishExit(s) {
  s.motion = 'idle';
  s.exit = null;
  s.nudge = 0;
  s.locked = false;
  s.stopIdx = 0;
  s.lastProgress = -9;
  s.cards.forEach((c, i) => cardState(c.el, i === 0 ? 1 : 0, 0, 0));
  syncRail(s);
  // let the reset frame render underneath before the white lifts
  requestAnimationFrame(() => requestAnimationFrame(() => {
    s.flash.style.transition = 'opacity 900ms ease';
    s.flash.style.opacity = '0';
  }));
}
