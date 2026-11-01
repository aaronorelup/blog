// The staging tool (backtick on the homepage): fly the camera and place the floor lamp, then copy the numbers into
// WAYPOINTS and the andon. A tool for Aaron, loaded only when asked for; it builds its own panel. While it is on,
// the frame loop runs s.staging.step instead of the walk.
import { Vector3 } from 'three';
import { WAYPOINTS } from '../scene/camera.js';

const BTN = 'padding:6px 0;border:2px solid #3A3A42;border-radius:8px;background:#FBF3E8;font:inherit;cursor:pointer;flex:1';
const PANEL = `
  <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px">
    <strong style="font-size:12px;letter-spacing:0.06em">STAGING</strong>
    <span id="staging-target" style="padding:2px 8px;border-radius:999px;background:#3A3A42;color:#FBF3E8;font-size:10px">CAMERA</span>
  </div>
  <div style="display:flex;gap:8px;margin-bottom:10px">
    <button type="button" data-stage="cam" style="${BTN}">Camera (1)</button>
    <button type="button" data-stage="lamp" style="${BTN}">Lamp (2)</button>
  </div>
  <div style="color:#6B5E52;margin-bottom:10px">WASD move · Q/E down/up · ←→ turn · ↑↓ pitch · [ ] fov · drag to look · Shift = fast<br>Press 2 for the lamp: WASD slides it, Q/E raises it, ←→ or drag spins it</div>
  <pre id="staging-readout" style="margin:0 0 10px;white-space:pre-wrap;word-break:break-all;background:#F3E7D2;border-radius:8px;padding:8px"></pre>
  <button type="button" id="staging-copy" style="width:100%;padding:8px 0;border:2px solid #3A3A42;border-radius:8px;background:#F7C9D4;font:inherit;font-weight:700;cursor:pointer">Copy values</button>`;

let box = null;

function panel() {
  if (box) return box;
  box = document.createElement('div');
  box.id = 'staging-panel';
  box.style.cssText = 'display:none;position:fixed;left:16px;top:16px;z-index:40;width:290px;background:rgba(251,243,232,0.96);' +
    'border:2px solid #3A3A42;border-radius:14px;padding:14px 16px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;' +
    'font-size:11px;line-height:1.6;color:#3A3A42;box-shadow:0 10px 30px rgba(58,58,66,0.2)';
  box.innerHTML = PANEL;
  document.getElementById('scene-wrap').append(box);
  return box;
}

export function toggle(s) {
  if (s.staging) s.staging.off();
  else on(s);
}

function on(s) {
  const st = { focus: 'cam', keys: {}, fov: s.camera.fov, yaw: 0, pitch: 0 };
  const el = panel();
  const readout = el.querySelector('#staging-readout');
  el.style.display = 'block';
  s.canvas.style.pointerEvents = 'auto';
  s.canvas.style.cursor = 'grab';

  // start from the current waypoint so you are always adjusting, never starting blind
  const wp = WAYPOINTS[s.cards[s.stopIdx].wp];
  s.camera.position.set(wp.pos[0], wp.pos[1], wp.pos[2]);
  s.camera.lookAt(new Vector3(wp.target[0], wp.target[1], wp.target[2]));
  s.camera.rotation.order = 'YXZ';
  st.yaw = s.camera.rotation.y;
  st.pitch = s.camera.rotation.x;
  st.fov = wp.fov;

  const focus = (f) => {
    st.focus = f;
    el.querySelector('#staging-target').textContent = f === 'cam' ? 'CAMERA' : 'LAMP';
  };
  const onKey = (e) => {
    if (e.key === '1') focus('cam');
    else if (e.key === '2') focus('lamp');
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    st.keys[k] = e.type === 'keydown';
    if (['w','a','s','d','q','e','[',']','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(k) >= 0) e.preventDefault();
  };
  let drag = null;
  const onDown = (e) => { drag = { x: e.clientX, y: e.clientY }; s.canvas.style.cursor = 'grabbing'; };
  const onMove = (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag = { x: e.clientX, y: e.clientY };
    if (st.focus === 'cam') {
      st.yaw -= dx * 0.004;
      st.pitch = Math.max(-1.4, Math.min(1.4, st.pitch - dy * 0.004));
    } else {
      s.lampGroup.rotation.y -= dx * 0.006;
    }
  };
  const onUp = () => { drag = null; s.canvas.style.cursor = 'grab'; };
  const onClick = (e) => {
    const b = e.target.closest('[data-stage]');
    if (b) focus(b.dataset.stage);
    if (e.target.id === 'staging-copy') {
      if (navigator.clipboard) navigator.clipboard.writeText(values(s));
      e.target.textContent = 'Copied. Paste it to me';
      setTimeout(() => { e.target.textContent = 'Copy values'; }, 1600);
    }
  };
  addEventListener('keydown', onKey, true);
  addEventListener('keyup', onKey, true);
  s.canvas.addEventListener('pointerdown', onDown);
  addEventListener('pointermove', onMove);
  addEventListener('pointerup', onUp);
  el.addEventListener('click', onClick);

  let readAt = 0;
  st.step = (dt) => {
    step(s, st, dt);
    if (performance.now() - readAt > 120) {
      readAt = performance.now();
      readout.textContent = values(s);
    }
  };
  st.off = () => {
    removeEventListener('keydown', onKey, true);
    removeEventListener('keyup', onKey, true);
    s.canvas.removeEventListener('pointerdown', onDown);
    removeEventListener('pointermove', onMove);
    removeEventListener('pointerup', onUp);
    el.removeEventListener('click', onClick);
    el.style.display = 'none';
    s.canvas.style.pointerEvents = 'none';
    s.staging = null;
    s.lastProgress = -9;
  };
  s.staging = st;
}

function values(s) {
  const n = (v) => (Math.round(v * 100) / 100).toFixed(2);
  const dir = new Vector3();
  s.camera.getWorldDirection(dir);
  const t = s.camera.position.clone().add(dir.multiplyScalar(2.5));
  const d = s.lampGroup;
  return 'camera pos [' + n(s.camera.position.x) + ', ' + n(s.camera.position.y) + ', ' + n(s.camera.position.z) + ']' +
    '\ncamera target [' + n(t.x) + ', ' + n(t.y) + ', ' + n(t.z) + ']' +
    '\nfov ' + Math.round(s.camera.fov) +
    '\nlamp andon(' + n(d.position.x) + ', ' + n(d.position.z) + ')  y ' + n(d.position.y) +
    '\nlamp rotY ' + n(d.rotation.y);
}

function step(s, st, dt) {
  const k = st.keys;
  const fast = k['Shift'] ? 4 : 1;
  const sp = 2.4 * dt * fast, rot = 1.1 * dt * fast;
  const f = (a) => k[a] ? 1 : 0;
  const mx = f('d') - f('a'), mz = f('w') - f('s'), my = f('e') - f('q');

  if (st.focus === 'cam') {
    st.yaw += (f('ArrowLeft') - f('ArrowRight')) * rot;
    st.pitch = Math.max(-1.4, Math.min(1.4, st.pitch + (f('ArrowUp') - f('ArrowDown')) * rot));
    st.fov = Math.max(20, Math.min(90, st.fov + (f(']') - f('[')) * 24 * dt));
    const sin = Math.sin(st.yaw), cos = Math.cos(st.yaw);
    s.camera.position.x += (-sin * mz + cos * mx) * sp;
    s.camera.position.z += (-cos * mz - sin * mx) * sp;
    s.camera.position.y += my * sp;
  } else {
    const d = s.lampGroup;
    d.position.x += mx * sp;
    d.position.z += -mz * sp;
    d.position.y += my * sp;
    d.rotation.y += (f('ArrowLeft') - f('ArrowRight')) * rot;
    s.lampLight.position.set(d.position.x, d.position.y + 0.69, d.position.z);
  }

  s.camera.rotation.order = 'YXZ';
  s.camera.rotation.set(st.pitch, st.yaw, 0);
  s.camera.fov = st.fov;
  s.camera.updateProjectionMatrix();
}
