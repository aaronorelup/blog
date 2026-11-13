/* The toys: each model is loaded, stood on its feet at its toy size, given a few balls to be held up by in the
   physics, and a soft shadow on the painted floor. Models arrive one at a time, lightest first. */

import { GLTFLoader } from '../lib/loaders/GLTFLoader.js';
import { MeshoptDecoder } from '../lib/libs/meshopt_decoder.module.js';
import { Body } from './physics.js';

export function loadToys(THREE, renderer, scene, roster, onToy, onDone) {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const maxAniso = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  let i = 0, live = 0, done = 0;
  const next = () => {
    while (live < 3 && i < roster.length) {
      const def = roster[i++]; live++;
      loader.load(def.url, (gltf) => {
        try { onToy(build(THREE, scene, def, gltf, maxAniso)); } catch (e) { console.warn('toy skipped:', def.id, e); }
        live--; done++; if (done === roster.length) onDone(); else next();
      }, undefined, () => { console.warn('toy missing:', def.id); live--; done++; if (done === roster.length) onDone(); else next(); });
    }
  };
  next();
}

/* a pale edge on every toy, where its surface turns away from the eye: it keeps a dark Jefrie from sinking into
   the dark wall, the way the room's drawing keeps a line round everything */
function rim(m) {
  if (m.userData.rim || !m.isMeshStandardMaterial) return;
  m.userData.rim = true;
  m.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>',
      '#include <emissivemap_fragment>\n\tfloat toyRim = pow(1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0), 3.0);\n\ttotalEmissiveRadiance += vec3(0.62, 0.6, 0.86) * toyRim * 0.38;');
  };
  m.customProgramCacheKey = () => 'toyrim';
}

function build(THREE, scene, def, gltf, maxAniso) {
  const root = gltf.scene;
  let skinned = false;
  root.traverse((o) => {
    if (!o.isMesh) return;
    o.frustumCulled = false;
    if (o.isSkinnedMesh) skinned = true;
    for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
      if (m.map) m.map.anisotropy = maxAniso;
      if (m.metalness > 0.85 && !m.metalnessMap) m.metalness = 0.85;
      m.envMapIntensity = 1.0;
      if (def.tint) m.color.multiplyScalar(def.tint);
      rim(m);
    }
  });
  root.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(root, true);
  const size = bb.getSize(new THREE.Vector3()), mid = bb.getCenter(new THREE.Vector3());
  const k = def.h / size.y;                       // model units -> metres
  const face = (def.face || 0) * Math.PI / 180;
  // the feet: the middle of the model unless the roster says otherwise
  const fx = mid.x + (def.cx || 0) * size.x, fz = mid.z + (def.cz || 0) * size.z;
  const turn = new THREE.Group(); turn.rotation.y = face;
  root.position.set(-fx, -bb.min.y, -fz);
  const fit = new THREE.Group(); fit.add(root); fit.scale.setScalar(k);
  turn.add(fit);
  const holder = new THREE.Group(); holder.add(turn);   // sits so that the pivot is the centre of mass
  const pivot = new THREE.Group(); pivot.add(holder); pivot.visible = false; scene.add(pivot);

  const swap = Math.abs(Math.sin(face)) > 0.7;
  const w0 = (swap ? size.z : size.x) * k, d0 = (swap ? size.x : size.z) * k, h0 = def.h;
  // long tails, wings and scythes do not hold a toy up: the body is the narrow middle of it
  const w = Math.min(w0, h0 * (def.wide || 0.62)), d = Math.min(d0, h0 * (def.deep || 0.55));
  const toy = { def, pivot, body: null, tick: null, onDrop: null, w0, d0 };

  const shapeAt = (s) => {
    const h = h0 * s, ww = w * s, dd = d * s;
    const spheres = []; let com;
    if (def.shape === 'box') {
      const r = Math.min(ww, dd, h) / 2;
      const xs = ww / 2 - r > 0.01 ? [-(ww / 2 - r), ww / 2 - r] : [0];
      const ys = h - 2 * r > 0.02 ? [r, h - r] : [r];
      const zs = dd / 2 - r > 0.01 ? [-(dd / 2 - r), dd / 2 - r] : [0];
      com = h / 2;
      for (const x of xs) for (const y of ys) for (const z of zs) spheres.push({ x, y: y - com, z, r });
    } else if (def.shape === 'ball') {
      com = h * 0.5;
      spheres.push({ x: 0, y: 0, z: 0, r: h * 0.48 });
    } else {
      const r0 = Math.max(0.2 * h, Math.min(0.33 * h, Math.min(ww, dd) * 0.5));
      const r1 = r0 * 0.82;
      com = h * 0.42;
      spheres.push({ x: 0, y: r0 - com, z: 0, r: r0 });
      if (h - r1 > r0 * 1.3) spheres.push({ x: 0, y: h - r1 - com, z: 0, r: r1 });
    }
    let R = 0, foot = 0; for (const p of spheres) { R = Math.max(R, Math.hypot(p.x, p.y, p.z) + p.r); foot = Math.max(foot, Math.hypot(p.x, p.z) + p.r); }
    const m = Math.min(2.4, Math.max(0.4, (h / 0.34) ** 2.2));
    return { h, com, spheres, R, foot, m, I: 0.4 * m * (0.5 * Math.max(h, ww)) ** 2 * 1.2 };
  };
  let sh = shapeAt(1);
  const body = new Body({ id: def.id, h: sh.h, m: sh.m, I: sh.I, spheres: sh.spheres, com: sh.com, R: sh.R, yaw0: 0 });
  body.foot = sh.foot;
  toy.body = body;
  holder.position.y = -sh.com;
  toy.setScale = (s) => {
    sh = shapeAt(s);
    body.h = sh.h; body.com = sh.com; body.spheres = sh.spheres; body.R = sh.R; body.foot = sh.foot; body.m = sh.m; body.invM = 1 / sh.m; body.I = sh.I; body.invI = 1 / sh.I;
    body.wc = new Float64Array(sh.spheres.length * 3);
    holder.scale.setScalar(s); holder.position.y = -sh.com;
    toy.shadowR = Math.max(0.5 * Math.min(w0, d0 * 1.2) * s, 0.09) * 1.25;
  };
  toy.setScale(1);

  // the little television is on: its screen is its own piece, and it glows a cold blue that wavers a little
  if (def.id === 'tv') {
    let screen = null;
    root.traverse((o) => { if (o.isMesh && /screen/i.test(o.name + ' ' + (o.material.name || ''))) screen = o.material; });
    if (screen) {
      screen.emissive = new THREE.Color(0x4f74d6); screen.emissiveIntensity = 0.2; screen.emissiveMap = screen.map;   // its own picture, lit from behind
      let T = 0;
      toy.tick = (dt) => { T += dt; screen.emissiveIntensity = 0.2 + 0.035 * Math.sin(T * 9.1) * Math.sin(T * 2.3) + (Math.sin(T * 31) > 0.96 ? 0.05 : 0); return true; };
    }
  }

  // the ones that can move by themselves
  if (def.clips && gltf.animations.length) {
    const mixer = new THREE.AnimationMixer(root), clips = {};
    for (const c of gltf.animations) clips[c.name] = c;
    if (def.id === 'fighter') {
      const idle = mixer.clipAction(clips.idle); idle.play();
      const moves = ['light_1', 'heavy', 'taunt', 'special_n', 'light_2', 'win'].filter((n) => clips[n]);
      let cur = null, n = 0;
      mixer.addEventListener('finished', () => { if (cur) { idle.reset().fadeIn(0.2).play(); cur.fadeOut(0.2); cur = null; } });
      toy.onDrop = () => { toy.wantMove = 1.4; };
      toy.tick = (dt, b) => {
        // she shows a move once she is back on her feet
        if (toy.wantMove > 0 && !b.held && b.knock <= 0 && b.tilt < 0.25) {
          toy.wantMove -= dt;
          if (toy.wantMove <= 0.9 && !cur && moves.length) {
            cur = mixer.clipAction(clips[moves[n++ % moves.length]]); cur.reset(); cur.setLoop(THREE.LoopOnce, 1); cur.clampWhenFinished = true;
            cur.fadeIn(0.12).play(); idle.fadeOut(0.12); toy.wantMove = 0;
          }
        }
        mixer.update(dt);
        return true;
      };
      // one fixed pose, for a still picture: the first frame of her idle
      toy.calm = () => { if (cur) { cur.stop(); cur = null; } toy.wantMove = 0; idle.stop(); idle.reset().play(); mixer.setTime(0); };
      toy.calm();
    } else if (clips['wind-up-waddle']) {
      const wad = mixer.clipAction(clips['wind-up-waddle']); wad.play(); wad.paused = true;
      toy.tick = (dt, b) => {
        const going = !b.asleep && !b.held && b.knock <= 0 && b.rest === 0;
        if (going) { wad.paused = false; mixer.update(dt * 1.6); return true; }
        return false;
      };
      toy.calm = () => { wad.paused = false; mixer.setTime(0); wad.paused = true; };
    }
  }
  return toy;
}

/* soft round shadows on the painted floor: one flat disc per toy, thrown away from the lamp */
export function makeShadows(THREE, scene, max) {
  const geo = new THREE.PlaneGeometry(1, 1); geo.rotateX(-Math.PI / 2);
  const op = new THREE.InstancedBufferAttribute(new Float32Array(max), 1); op.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('aOp', op);
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, toneMapped: false,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    vertexShader: 'attribute float aOp; varying vec2 vUv; varying float vOp; void main(){ vUv = uv; vOp = aOp; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0); }',
    fragmentShader: 'varying vec2 vUv; varying float vOp; void main(){ float r = length(vUv - 0.5) * 2.0; float a = smoothstep(1.0, 0.25, r); gl_FragColor = vec4(0.09, 0.05, 0.11, a * a * vOp); }',
  });
  const mesh = new THREE.InstancedMesh(geo, mat, max);
  mesh.frustumCulled = false; mesh.renderOrder = -5; mesh.count = 0; scene.add(mesh);
  return { mesh, op, m: new THREE.Matrix4(), q: new THREE.Quaternion(), p: new THREE.Vector3(), s: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0) };
}

export function placeShadows(S, toys, box, lamp) {
  let n = 0;
  const put = (x, z, h, r, strength) => {
    // away from the lamp, longer the further from it, fainter the higher the toy is
    let dx = x - lamp.x, dz = z - lamp.z; const dl = Math.hypot(dx, dz) || 1; dx /= dl; dz /= dl;
    const lift = 1 + h * 1.1, len = 1.25 + Math.min(dl, 3) * 0.1 + h * 0.3;
    S.q.setFromAxisAngle(S.up, Math.atan2(dx, dz));
    S.p.set(x + dx * (r * 0.3 + h * 0.35), 0.004, z + dz * (r * 0.3 + h * 0.35));
    S.s.set(r * 2 * lift, 1, r * 2 * lift * len);
    S.m.compose(S.p, S.q, S.s); S.mesh.setMatrixAt(n, S.m);
    S.op.array[n] = strength / (1 + h * 3 + h * h * 14); n++;   // a toy in the air hardly darkens the floor
  };
  const b = box.bounds;
  put((b.x0 + b.x1) / 2, (b.z0 + b.z1) / 2, 0, (b.x1 - b.x0) * 0.66, 0.85);
  for (const t of toys) {
    if (!t.pivot.visible) continue;
    const p = t.pivot.position, h = Math.max(0, p.y - t.body.com);
    put(p.x, p.z, h, t.shadowR * (t.pop || 1), 0.7);
    // and a small dark one right under its feet, so it stands on the mat and not above it
    if (h < 0.12) { const k = n; put(p.x, p.z, h * 4, t.shadowR * 0.55 * (t.pop || 1), 0.62); S.p.set(p.x, 0.005, p.z); S.s.set(t.shadowR * 1.15, 1, t.shadowR * 1.15); S.q.identity(); S.m.compose(S.p, S.q, S.s); S.mesh.setMatrixAt(k, S.m); }
  }
  S.mesh.count = n; S.mesh.instanceMatrix.needsUpdate = true; S.op.needsUpdate = true;
}
