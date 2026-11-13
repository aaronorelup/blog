/* The toy box itself, made in code: planks, an inked outline like the room's drawing, brass corners, a lid on a
   springy hinge, a warm light inside, and the handful of paper stars that fly when it bursts. */

const BW = 0.58, BH = 0.3, BD = 0.4, TH = 0.024;
const OPEN = 2.02;   // how far back the lid falls, in radians

function wood(THREE, w, h, o) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  let seed = o.seed || 1; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const n = o.planks || 3, ph = h / n;
  for (let i = 0; i < n; i++) {
    const k = rnd() * 0.12 - 0.06;
    g.fillStyle = `rgb(${Math.round(150 * (1 + k))}, ${Math.round(98 * (1 + k))}, ${Math.round(62 * (1 + k))})`;
    g.fillRect(0, i * ph, w, ph + 1);
    // grain: a few long loose strokes, as the mats in the painting have
    g.strokeStyle = 'rgba(88, 50, 30, 0.5)'; g.lineWidth = 2; g.lineCap = 'round';
    for (let s = 0; s < 5; s++) {
      const x = rnd() * w * 0.8, y = i * ph + ph * (0.2 + rnd() * 0.6), l = w * (0.08 + rnd() * 0.2);
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y + (rnd() - 0.5) * 6, x + l, y + (rnd() - 0.5) * 3); g.stroke();
    }
    g.fillStyle = 'rgba(255, 214, 160, 0.16)'; g.fillRect(0, i * ph + 3, w, 4);
    if (i) { g.fillStyle = '#3a2218'; g.fillRect(0, i * ph - 2, w, 5); }
  }
  // the ink line round the panel
  g.strokeStyle = '#1d1219'; g.lineWidth = o.line || 12; g.strokeRect(0, 0, w, h);
  if (o.badge) {
    // a cream plate with a star, the box's only word
    const cx = w / 2, cy = h * 0.5, r = h * 0.2;
    g.fillStyle = '#1d1219'; g.beginPath(); g.arc(cx, cy, r + 7, 0, 7); g.fill();
    g.fillStyle = '#f6e7c8'; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill();
    g.fillStyle = '#e2795c'; g.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.3 : r * 0.68; g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
    g.closePath(); g.fill(); g.strokeStyle = '#1d1219'; g.lineWidth = 5; g.lineJoin = 'round'; g.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

export function makeBox(THREE, scene) {
  const g = new THREE.Group(); scene.add(g);
  const ink = new THREE.MeshBasicMaterial({ color: 0x1d1219, side: THREE.BackSide });
  const mat = (tex) => new THREE.MeshStandardMaterial({ map: tex, roughness: 0.78, metalness: 0, envMapIntensity: 0.5 });
  const front = mat(wood(THREE, 768, 384, { seed: 3, planks: 3, badge: true }));
  const side = mat(wood(THREE, 512, 384, { seed: 11, planks: 3 }));
  const back = mat(wood(THREE, 768, 384, { seed: 17, planks: 3 }));
  const top = mat(wood(THREE, 768, 512, { seed: 23, planks: 4 }));
  const inside = new THREE.MeshStandardMaterial({ color: 0x4a2a1c, roughness: 0.9, emissive: 0xff9a3c, emissiveIntensity: 0 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xd9a93a, roughness: 0.38, metalness: 0.75, envMapIntensity: 1.2 });

  const body = new THREE.Group(); g.add(body);
  const slab = (w, h, d, x, y, z, mats, parent) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats); m.position.set(x, y, z); (parent || body).add(m); return m;
  };
  // +x, -x, +y, -y, +z, -z
  slab(BW, BH, TH, 0, BH / 2, BD / 2 - TH / 2, [side, side, inside, side, front, inside]);
  slab(BW, BH, TH, 0, BH / 2, -BD / 2 + TH / 2, [side, side, inside, side, inside, back]);
  slab(TH, BH, BD - TH * 2, -BW / 2 + TH / 2, BH / 2, 0, [inside, side, inside, side, side, side]);
  slab(TH, BH, BD - TH * 2, BW / 2 - TH / 2, BH / 2, 0, [side, inside, inside, side, side, side]);
  slab(BW - TH * 2, TH, BD - TH * 2, 0, TH / 2, 0, [inside, inside, inside, side, inside, inside]);
  const hull = new THREE.Mesh(new THREE.BoxGeometry(BW + 0.014, BH + 0.008, BD + 0.014), ink); hull.position.y = BH / 2 - 0.002; body.add(hull);
  // brass on the corners and a latch
  for (const sx of [-1, 1]) for (const sy of [0, 1]) {
    const c = slab(0.05, 0.05, 0.012, sx * (BW / 2 - 0.022), sy ? BH - 0.022 : 0.026, BD / 2 + 0.003, brass);
    c.rotation.z = 0;
  }
  slab(0.07, 0.055, 0.014, 0, BH - 0.03, BD / 2 + 0.006, brass);

  // the lid, hinged along the back edge
  const hinge = new THREE.Group(); hinge.position.set(0, BH, -BD / 2); body.add(hinge);
  const LT = 0.045;
  slab(BW + 0.03, LT, BD + 0.03, 0, LT / 2, BD / 2, [side, side, top, inside, front, back], hinge).material[4] = side;
  const lhull = new THREE.Mesh(new THREE.BoxGeometry(BW + 0.044, LT + 0.012, BD + 0.044), ink); lhull.position.set(0, LT / 2, BD / 2); hinge.add(lhull);
  slab(0.07, 0.04, 0.014, 0, LT / 2 - 0.004, BD + 0.018, brass, hinge);

  // the light inside
  const glow = new THREE.PointLight(0xffb45a, 0, 3.2, 1.5); glow.position.set(0, BH + 0.1, 0); g.add(glow);
  const gc = document.createElement('canvas'); gc.width = gc.height = 128;
  const gx = gc.getContext('2d'), grd = gx.createRadialGradient(64, 64, 2, 64, 64, 62);
  grd.addColorStop(0, 'rgba(255, 226, 170, 1)'); grd.addColorStop(0.45, 'rgba(255, 170, 90, 0.55)'); grd.addColorStop(1, 'rgba(255, 140, 60, 0)');
  gx.fillStyle = grd; gx.fillRect(0, 0, 128, 128);
  const gtex = new THREE.CanvasTexture(gc); gtex.colorSpace = THREE.SRGBColorSpace;
  const bed = new THREE.Mesh(new THREE.PlaneGeometry(BW - TH * 2, BD - TH * 2), new THREE.MeshBasicMaterial({ map: gtex, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
  bed.rotation.x = -Math.PI / 2; bed.position.y = BH * 0.62; body.add(bed);

  // the light that spills out of it onto the mats
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: gtex, color: 0xffb060, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
  pool.rotation.x = -Math.PI / 2; pool.position.set(0, 0.003, 0.1); pool.renderOrder = -6; g.add(pool);

  // paper stars for the burst
  const N = 64;
  const conf = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.03, 0.03), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, toneMapped: false }), N);
  conf.frustumCulled = false; conf.visible = false; scene.add(conf);
  const pal = [0xf6e7c8, 0xf0c06a, 0xf0a6b8, 0xe2795c, 0xf6e7c8, 0xc9a227].map((c) => new THREE.Color(c));
  const P = []; for (let i = 0; i < N; i++) { P.push({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, a: 0, w: 0, life: 0, ax: 0 }); conf.setColorAt(i, pal[i % pal.length]); }
  let confT = -1;
  const dummy = new THREE.Object3D();

  let a = 0, va = 0, tgt = 0, jolt = 0, joltV = 0, scale = 1, seed = 99;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const api = {
    group: g, closeAt: 0,
    bounds: { x0: 0, x1: 0, y0: 0, y1: 0, z0: 0, z1: 0 },
    get open() { return a / OPEN; },
    setPlace(x, z, s) {
      scale = s; g.position.set(x, 0, z); g.scale.setScalar(s);
      Object.assign(api.bounds, { x0: x - BW * s / 2, x1: x + BW * s / 2, y0: 0, y1: BH * s, z0: z - BD * s / 2, z1: z + BD * s / 2 });
    },
    setOpen(v, now) { tgt = v; if (now) { a = v * OPEN; va = 0; hinge.rotation.x = -a; } },
    burst(T) {
      tgt = 1; va += 26; joltV = -3.2; confT = T; conf.visible = true; seed = 99;
      for (const p of P) {
        const an = rnd() * 6.283, sp = 0.5 + rnd() * 1.6;
        p.x = g.position.x + (rnd() - 0.5) * BW * 0.6 * scale; p.y = BH * scale; p.z = g.position.z + (rnd() - 0.5) * BD * 0.5 * scale;
        p.vx = Math.cos(an) * sp; p.vz = Math.sin(an) * sp * 0.7 + 0.3; p.vy = 2.4 + rnd() * 2.6;
        p.a = rnd() * 6.283; p.w = (rnd() - 0.5) * 22; p.ax = rnd() * 3; p.life = 1.5 + rnd() * 1.1;
      }
    },
    update(T, dt, state, rattle, ajar) {
      if (state === 'closed') tgt = 0; else if (state === 'returning') tgt = T >= api.closeAt - 0.12 ? 0 : 1; else tgt = 1;
      let busy = false;
      if (dt > 0) {
        const n = Math.max(1, Math.ceil(dt / 0.008)), h = dt / n;
        for (let i = 0; i < n; i++) {
          va += ((tgt * OPEN - a) * 130 - va * 7.5) * h; a += va * h;
          if (a < 0) { a = 0; va = Math.abs(va) * 0.35; }
          joltV += (-300 * jolt - 14 * joltV) * h; jolt += joltV * h;
        }
        busy = Math.abs(va) > 0.01 || Math.abs(tgt * OPEN - a) > 0.002 || Math.abs(jolt) > 0.001 || Math.abs(joltV) > 0.01;
      }
      let ra = 0, ry = 0, rz = 0;
      if (state === 'closed' && rattle > 0 && dt > 0) {
        // something inside wants out: it shakes in fits, harder the nearer the scroll is to the burst
        const env = Math.max(0, Math.sin(T * 2.3 + Math.sin(T * 0.7) * 1.3)) ** 2 * rattle;
        rz = Math.sin(T * 27) * 0.03 * env; ry = Math.abs(Math.sin(T * 13.5)) * 0.016 * env; ra = Math.max(0, Math.sin(T * 9)) * 0.11 * env;
        busy = true;
      }
      // scrolled close to the burst, the lid no longer shuts: a line of light shows under it
      const gap = state === 'closed' ? (ajar || 0) * 0.15 : 0;
      ra = Math.max(ra, gap);
      hinge.rotation.x = -(a + ra);
      body.rotation.z = rz; body.position.y = ry;
      body.scale.set(1 - jolt * 0.5, 1 + jolt, 1 - jolt * 0.5);
      const o = Math.min(1, (a + ra) / 0.9);
      // the burst itself is a flash that dies away in half a second
      const flash = confT >= 0 ? Math.exp(-(T - confT) * 4.2) : 0;
      if (flash > 0.004) busy = true;
      bed.material.opacity = o; inside.emissiveIntensity = 0.55 * o + flash; glow.intensity = (5.5 * o + 26 * flash) * scale;
      pool.material.opacity = Math.min(1, 0.34 * o + 0.6 * flash); pool.scale.setScalar(1.7 + 0.5 * o + 1.6 * flash);
      // the stars
      if (confT >= 0) {
        const age = T - confT;
        if (age > 2.8) { confT = -1; conf.visible = false; }
        else {
          busy = true;
          for (let i = 0; i < N; i++) {
            const p = P[i];
            if (dt > 0 && p.y > 0.004) {
              p.vy -= 5.2 * dt; const dr = Math.exp(-1.6 * dt); p.vx *= dr; p.vz *= dr; p.vy *= Math.exp(-0.9 * dt);
              p.x += (p.vx + Math.sin(age * 5 + p.ax) * 0.25) * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.a += p.w * dt;
              if (p.y <= 0.004) { p.y = 0.004; p.a = 0; }
            }
            const k = Math.max(0, Math.min(1, (p.life - age) / 0.4)) * Math.min(1, age / 0.06);
            dummy.position.set(p.x, p.y, p.z);
            if (p.y <= 0.004) dummy.rotation.set(-Math.PI / 2, 0, p.ax); else dummy.rotation.set(p.a, p.a * 0.7, p.ax);
            dummy.scale.setScalar(k * scale); dummy.updateMatrix(); conf.setMatrixAt(i, dummy.matrix);
          }
          conf.instanceMatrix.needsUpdate = true;
        }
      }
      return busy;
    },
    light() {},
  };
  api.setPlace(0, -2.4, 1);
  return api;
}
