// ?stats and ?diag on the homepage, so a slow machine can be diagnosed on the machine that is slow; loaded only then.
// ?stats: a live readout, bottom left (waypoint, draws, triangles, frame gap, petals, dpr, tier). ?diag: drive the
// camera along the real path at each rung and report the frame pacing the visitor would actually get, and what does
// the drawing. A scene this small running slowly usually means it is not drawn by a GPU at all, and no tuning of the
// scene can fix that, so the renderer string comes first. The report also goes to the console and window.__diagText.
import { WAYPOINTS } from '../scene/camera.js';
import { QUALITY, applyTier } from '../scene/quality.js';
import { updatePetals } from '../scene/world/petals.js';

export function start(s, query) {
  const el = document.createElement('div');
  el.id = 'scene-stats';
  el.setAttribute('aria-hidden', 'true');
  el.style.cssText = 'position:absolute;left:14px;bottom:14px;display:none;font-family:ui-monospace,SFMono-Regular,Menlo,' +
    'monospace;font-size:11px;line-height:1.5;color:#4A4A50;background:rgba(251,243,232,0.92);border:1px solid #D8CBB8;' +
    'border-radius:10px;padding:8px 12px;white-space:pre';
  document.getElementById('scene-viewport').append(el);
  if (query.has('stats')) {
    el.style.display = 'block';
    let ft = 16, last = 0, at = 0;
    s.readout = (progress) => {
      const now = performance.now();
      ft = last ? ft * 0.9 + (now - last) * 0.1 : 16;
      last = now;
      if (now - at < 400) return;
      at = now;
      const info = s.renderer.info.render, end = WAYPOINTS.length - 1;
      el.textContent =
        'waypoint  ' + WAYPOINTS[Math.max(0, Math.min(end, Math.round(progress)))].name +
        '\nt         ' + (progress / end).toFixed(3) +
        '\ndraw      ' + info.calls +
        '\ntris      ' + (info.triangles / 1000).toFixed(1) + 'k' +
        '\nrAF gap   ' + ft.toFixed(1) + ' ms' +
        '\npetals    ' + s.petalCount +
        '\ndpr       ' + s.renderer.getPixelRatio() +
        '\ntier      ' + s.quality + (s.pinned ? ' (pinned)' : '');
    };
    s.lastProgress = -9;                  // draw a frame now, so a still scene shows its numbers too
  }
  if (query.has('diag')) setTimeout(() => diagnose(s, el), 600);   // let the first frames settle
}

async function diagnose(s, el) {
  const lines = [];
  const say = (k, v) => lines.push(String(k).padEnd(12) + v);

  let vendor = 'unknown', device = 'unknown';
  const gl = s.renderer.getContext();
  const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  if (dbg) {
    vendor = gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) || vendor;
    device = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || device;
  }
  const software = /swiftshader|llvmpipe|softpipe|software|basic render/i.test(device);

  say('renderer', device);
  say('vendor', vendor);
  say('accel', software ? 'SOFTWARE (no GPU!)' : 'hardware');
  say('screen', `${innerWidth}x${innerHeight} @dpr ${devicePixelRatio || 1}`);
  say('scene', `${s.renderer.info.render.calls} draws, ${(s.renderer.info.render.triangles / 1000).toFixed(0)}k tris`);

  const wasPinned = s.pinned, wasTier = s.tier, wasReduced = s.reduced;
  s.pinned = true;
  for (let i = QUALITY.length - 1; i >= 0; i--) {
    s.tier = i;
    s.reduced = false;                     // measure the ride, not the fallback
    applyTier(s);
    s.reduced = false;
    const gaps = await spin(s, 1200);
    if (!gaps.length) { say(QUALITY[i].name, 'not measured'); continue; }
    gaps.sort((a, b) => a - b);
    const med = gaps[gaps.length >> 1];
    const p95 = gaps[Math.min(gaps.length - 1, Math.floor(gaps.length * 0.95))];
    say(QUALITY[i].name, `${(1000 / med).toFixed(0)} fps  (median ${med.toFixed(1)}ms, worst ${p95.toFixed(1)}ms)`);
  }
  s.tier = wasTier; s.reduced = wasReduced; s.pinned = wasPinned;
  applyTier(s);

  const text = lines.join('\n');
  window.__diagText = text;
  console.log('%c[tea house diagnostic]\n' + text, 'font-family:monospace');
  el.style.display = 'block';
  el.textContent = text + '\n\n(copy this and send it over)';
}

// spin the camera along the real curve for `ms`, returning the frame gaps
function spin(s, ms) {
  return new Promise((resolve) => {
    const gaps = [];
    const t0 = performance.now();
    let last = t0;
    // if rAF never fires (a hidden tab) give up fast rather than stalling the report
    let started = false;
    const bail = setTimeout(() => { if (!started) resolve(gaps); }, 600);
    const hard = setTimeout(() => resolve(gaps), ms + 1500);
    const step = () => {
      started = true;
      const now = performance.now();
      const u = ((now - t0) / 2500) % 1;
      s.posCurve.getPoint(u, s._p);
      s.tgtCurve.getPoint(u, s._q);
      s.camera.position.copy(s._p);
      s.camera.lookAt(s._q);
      s.camera.updateProjectionMatrix();
      if (s.petalCount > 0) updatePetals(s, now / 1000);
      s.renderer.render(s.scene, s.camera);
      if (now - t0 > 250) gaps.push(now - last);   // ignore the warm-up frames
      last = now;
      if (now - t0 < ms) requestAnimationFrame(step);
      else { clearTimeout(bail); clearTimeout(hard); resolve(gaps); }
    };
    requestAnimationFrame(step);
  });
}
