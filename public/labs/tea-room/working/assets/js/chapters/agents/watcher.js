// The watcher: a soft clay night guard in a cap, back to us, in a felt cubicle lit by one desk lamp, watching one
// small monitor and drinking coffee. He does none of the work. Modelled new for this page from plain shapes; he moves
// on twos, as hand-moved clay does. The feed he watches is this chapter's own: the crew's usage meter.
import * as THREE from 'three';
import { PAL, canvasTex, glowSprite, glow, box, lit, flat, twelve, hash, clamp, ss } from './kit.js';
import { STICKY } from './data.js';

// The meter from the clock post, as its own chart draws it: time across, per cent used up.
const METER = [[0, 0], [0.1, 6], [0.2, 13], [0.27, 27], [0.37, 51], [0.385, 1], [0.5, 14], [0.62, 33], [0.75, 52], [0.9, 68], [1, 75]];

export function makeWatcher() {
  const group = new THREE.Group();
  const felt = lit(PAL.felt), wood = lit(PAL.desk), dark = lit(0x17181f), clay = lit(0x56648c, { emissive: 0x141a2c }), capM = lit(0x2c3550, { emissive: 0x0a0d18 });
  // the floor of the cubicle and its two felt walls
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.2), lit(0x22222b)); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0.012, -0.05);
  const back = box(3.6, 1.55, 0.09, felt); back.position.set(0, 0.775, -1.6);
  const left = box(0.09, 1.55, 3.2, felt); left.position.set(-1.8, 0.775, -0.05);
  const cap1 = box(3.7, 0.05, 0.13, dark); cap1.position.set(0, 1.57, -1.6);
  const cap2 = box(0.13, 0.05, 3.2, dark); cap2.position.set(-1.8, 1.57, -0.05);
  group.add(floor, back, left, cap1, cap2);
  // the desk
  const top = box(2.5, 0.06, 0.95, wood); top.position.set(-0.3, 0.75, -1.02);
  group.add(top);
  [[-1.45, -1.4], [0.85, -1.4], [-1.45, -0.62], [0.85, -0.62]].forEach(([x, z]) => { const l = box(0.06, 0.72, 0.06, dark); l.position.set(x, 0.36, z); group.add(l); });
  // the monitor and its feed
  const feed = canvasTex(320, 200, () => {}, { aniso: 8 });
  const g = feed.image.getContext('2d');
  function drawFeed(t) {
    const w = 320, h = 200;
    g.fillStyle = '#0b1220'; g.fillRect(0, 0, w, h);
    g.font = '700 17px "JetBrains Mono", monospace'; g.textBaseline = 'top';
    g.fillStyle = '#c9d6f0'; g.fillText('FEED 3', 12, 9);
    const on = Math.floor(t * 1.2) % 2 === 0;
    g.fillStyle = on ? '#ff6a4a' : '#6a3328'; g.beginPath(); g.arc(250, 18, 5, 0, 6.283); g.fill();
    g.fillStyle = '#ffb49a'; g.fillText('LIVE', 262, 9);
    const x0 = 22, x1 = 300, y0 = 172, y1 = 46;
    g.strokeStyle = 'rgba(255,120,100,0.75)'; g.setLineDash([6, 5]); g.lineWidth = 1.5; g.beginPath(); g.moveTo(x0, y1); g.lineTo(x1, y1); g.stroke(); g.setLineDash([]);
    g.strokeStyle = 'rgba(150,170,210,0.28)'; g.lineWidth = 1;
    for (let k = 1; k < 4; k++) { const y = y0 + (y1 - y0) * k / 4; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); }
    // the gold line draws itself over twelve seconds, rests, and starts again
    const u = clamp(((t % 15) / 12));
    g.strokeStyle = '#ffc870'; g.lineWidth = 3; g.lineJoin = 'round'; g.beginPath();
    let px = x0, py = y0;
    for (let i = 0; i < METER.length; i++) {
      const [a, v] = METER[i]; if (a > u && i > 0) { const [a0, v0] = METER[i - 1], f = (u - a0) / (a - a0); px = x0 + (x1 - x0) * u; py = y0 + (y1 - y0) * (v0 + (v - v0) * f) / 100; g.lineTo(px, py); break; }
      px = x0 + (x1 - x0) * a; py = y0 + (y1 - y0) * v / 100; if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.stroke();
    g.fillStyle = '#fff3d6'; g.beginPath(); g.arc(px, py, 4.5, 0, 6.283); g.fill();
    g.font = '500 13px "JetBrains Mono", monospace'; g.fillStyle = '#8fa3c8'; g.fillText('5-hour limit', 12, 180);
    g.fillStyle = '#ffc870'; g.textAlign = 'right'; g.fillText(Math.round((y0 - py) / (y0 - y1) * 100) + '%', 308, 180); g.textAlign = 'left';
    feed.needsUpdate = true;
  }
  const mon = box(0.86, 0.56, 0.06, dark); mon.position.set(-0.05, 1.2, -1.36);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.49), flat(0xffffff, { map: feed })); screen.position.set(-0.05, 1.2, -1.325);
  const stand = box(0.08, 0.2, 0.06, dark); stand.position.set(-0.05, 0.86, -1.36);
  const foot = box(0.34, 0.02, 0.2, dark); foot.position.set(-0.05, 0.79, -1.34);
  group.add(mon, screen, stand, foot);
  const cold = glowSprite(PAL.cold, 1.7, 0.2); cold.position.set(-0.05, 1.2, -1.2); group.add(cold);
  const coldLight = new THREE.PointLight(0x9cc0ff, 1.6, 3.2, 1.6); coldLight.position.set(-0.05, 1.2, -0.9); group.add(coldLight);
  // the yellow note on the monitor's corner
  const note = canvasTex(160, 160, (c) => {
    c.fillStyle = '#f2d24a'; c.fillRect(0, 0, 160, 160);
    c.fillStyle = '#3a3320'; c.font = '700 21px "JetBrains Mono", monospace'; c.textBaseline = 'top';
    STICKY.forEach((s, i) => c.fillText(s, 10, 30 + i * 34));
  });
  const sticky = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.24), flat(0xdddddd, { map: note })); sticky.position.set(-0.52, 1.5, -1.318); sticky.rotation.z = 0.07;
  group.add(sticky);
  // the desk lamp: a bent arm, a shade, its pool of light on the desk
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.03, 14), dark); base.position.set(-1.25, 0.795, -1.2);
  const arm1 = box(0.03, 0.5, 0.03, dark); arm1.position.set(-1.2, 1.03, -1.2); arm1.rotation.z = -0.22;
  const arm2 = box(0.03, 0.4, 0.03, dark); arm2.position.set(-1.0, 1.32, -1.2); arm2.rotation.z = -1.05;
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.2, 14, 1, true), lit(0x2a2c36, { side: THREE.DoubleSide, emissive: 0x3a2a14 })); shade.position.set(-0.8, 1.36, -1.2); shade.rotation.z = 0.5;
  const bulb = glowSprite(0xffd9a0, 0.5, 0.95); bulb.position.set(-0.77, 1.3, -1.17);
  const poolM = new THREE.MeshBasicMaterial({ map: glow(), color: 0xffc98a, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.3), poolM); pool.rotation.x = -Math.PI / 2; pool.position.set(-0.7, 0.785, -1.02); pool.renderOrder = 2;
  group.add(base, arm1, arm2, shade, bulb, pool);
  // a to-do list pinned to the back wall, and the mug
  const list = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.56), flat(0xcfc6b0, {
    map: canvasTex(128, 170, (c) => { c.fillStyle = '#d9d0ba'; c.fillRect(0, 0, 128, 170); c.fillStyle = 'rgba(40,36,30,0.55)'; for (let y = 16; y < 160; y += 13) { c.fillRect(12, y, 8, 8); c.fillRect(26, y + 2, 40 + ((y * 13) % 52), 3); } }),
  })); list.position.set(0.9, 1.12, -1.55); group.add(list);
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.11, 12), lit(0xb9b2a4)); mug.position.set(0.52, 0.835, -0.88);
  group.add(mug);
  // the chair and the guard
  const seat = box(0.52, 0.07, 0.5, dark); seat.position.set(0.02, 0.5, -0.2);
  const chairBack = box(0.5, 0.56, 0.06, dark); chairBack.position.set(0.02, 0.86, 0.06);
  const pole = box(0.06, 0.45, 0.06, dark); pole.position.set(0.02, 0.26, -0.2);
  const star = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 5), dark); star.position.set(0.02, 0.03, -0.2);
  group.add(seat, chairBack, pole, star);
  const guard = new THREE.Group(); guard.position.set(0.02, 0.54, -0.24);
  const torso = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), clay); torso.scale.set(0.3, 0.4, 0.25); torso.position.y = 0.36;
  const headG = new THREE.Group(); headG.position.y = 0.86;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.175, 16, 12), clay);
  const capTop = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.18, 0.1, 16), capM); capTop.position.y = 0.14;
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.02, 16, 1, false, Math.PI * 0.5, Math.PI), capM); brim.position.set(0, 0.095, -0.12); brim.rotation.y = Math.PI / 2;
  const eyeM = flat(0x0c0d12);
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), eyeM); eyeL.position.set(-0.06, 0.02, -0.165);
  const eyeR = eyeL.clone(); eyeR.position.x = 0.06;
  headG.add(head, capTop, brim, eyeL, eyeR);
  const armGeo = new THREE.CapsuleGeometry(0.075, 0.34, 4, 10);
  const armL = new THREE.Mesh(armGeo, clay); armL.position.set(-0.3, 0.42, -0.2); armL.rotation.x = -1.15; armL.rotation.z = 0.25;
  const armR = new THREE.Group(); armR.position.set(0.3, 0.6, -0.02);
  const armRm = new THREE.Mesh(armGeo, clay); armRm.position.set(0, -0.14, -0.2); armRm.rotation.x = -1.15;
  armR.add(armRm);
  guard.add(torso, headG, armL, armR);
  group.add(guard);
  drawFeed(7.3);
  let fedAt = -1;
  return {
    group, lamp: new THREE.Vector3(-1.1, 2.9, 0.9), tris: 0,
    redraw() { note.userData.redraw(); fedAt = -1; },
    // glance: 0 he watches the feed, 1 he has turned to look back at the reader
    update(t, glance, live) {
      const s = twelve(t) , step = Math.floor(t * 12);
      if (live) { const f = Math.floor(t * 6); if (f !== fedAt) { fedAt = f; drawFeed(t); } } else if (fedAt !== -2) { fedAt = -2; drawFeed(7.3); }
      // a sip of coffee every eighteen seconds or so
      const c = (s % 18) / 18, sip = ss(0.62, 0.68, c) * (1 - ss(0.76, 0.82, c));
      armR.rotation.x = -sip * 1.25; armR.rotation.z = -sip * 0.3;
      if (sip > 0.05) { mug.position.set(0.3 - sip * 0.16, 0.835 + sip * 0.72, -0.6 + sip * 0.12); mug.rotation.x = sip * 0.5; } else { mug.position.set(0.52, 0.835, -0.88); mug.rotation.x = 0; }
      // he nods off a little, and breathes
      const nod = Math.max(0, Math.sin(s * 0.42)) ** 6 * 0.22 * (1 - glance);
      headG.rotation.set(nod + sip * -0.2, -glance * 2.0, (hash(step) - 0.5) * 0.012);
      torso.scale.set(0.3 + (hash(step * 1.3) - 0.5) * 0.004, 0.4 + Math.sin(s * 1.3) * 0.006, 0.25);
      guard.rotation.y = -glance * 0.35;
    },
  };
}
