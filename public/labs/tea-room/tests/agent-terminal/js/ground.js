// The terminal itself: a dark glass plane to the horizon, the log lying on it, the amber cursor, a little wind, and
// far off the lit window of the evening the reader has just left.
import * as THREE from 'three';
import { PAL, FOG, canvasTex, glow, glowSprite, decal, hash, twelve, rng } from './kit.js';
import { LOG } from './data.js';

const MAX_POOLS = 14;

// The glass. It takes the light of every lamp, fire and screen as soft pools, mirrors more the flatter you look
// across it, and fades into the night.
export function makePlane() {
  const uniforms = {
    uCam: { value: new THREE.Vector3() },
    uPool: { value: Array.from({ length: MAX_POOLS }, () => new THREE.Vector4(0, 0, 1, 0)) },
    uPoolC: { value: Array.from({ length: MAX_POOLS }, () => new THREE.Vector3(1, 0.8, 0.45)) },
    uFog: { value: FOG },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: true, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 12,
    vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `
      precision highp float;
      uniform vec3 uCam; uniform vec4 uPool[${MAX_POOLS}]; uniform vec3 uPoolC[${MAX_POOLS}]; uniform float uFog;
      varying vec3 vW;
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main(){
        vec3 v = uCam - vW; float d = length(v);
        float graze = pow(1.0 - clamp(v.y / d, 0.0, 1.0), 4.0);
        vec3 col = vec3(0.078, 0.082, 0.094);
        // the faintest rows, as on a terminal: one line every 0.6
        float row = smoothstep(0.47, 0.5, abs(fract(vW.z / 0.6) - 0.5)) * 0.012 * exp(-d * 0.06);
        col += row;
        for (int i = 0; i < ${MAX_POOLS}; i++) {
          vec2 e = (vW.xz - uPool[i].xy) / uPool[i].z;
          col += uPoolC[i] * uPool[i].w * exp(-dot(e, e) * 2.4);
        }
        col += vec3(0.030, 0.034, 0.048) * graze;
        col += (h(floor(vW.xz * 90.0)) - 0.5) * 0.006;
        float fog = 1.0 - exp(-pow(d * uFog, 2.0));
        col = mix(col, vec3(0.027, 0.031, 0.043), fog);
        float alpha = mix(0.93, 0.6, graze);
        alpha = mix(alpha, 1.0, smoothstep(0.25, 0.85, fog));
        gl_FragColor = vec4(col, alpha);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(520, 520, 40, 40), mat);
  mesh.rotation.x = -Math.PI / 2; mesh.renderOrder = -10; mesh.frustumCulled = false;
  let n = 0;
  return {
    mesh,
    begin(cam) { uniforms.uCam.value.copy(cam.position); n = 0; },
    // a pool of light on the glass: where, how wide, what colour, how strong
    pool(x, z, r, c, k) {
      if (k <= 0.002 || n >= MAX_POOLS) return;
      uniforms.uPool.value[n].set(x, z, r, k); uniforms.uPoolC.value[n].set(c[0], c[1], c[2]); n++;
    },
    end() { for (let i = n; i < MAX_POOLS; i++) uniforms.uPool.value[i].w = 0; },
  };
}

// The log: blocks of monospace lying on the glass, some on a faint panel, running off toward the horizon.
export function makeLog(spots) {
  const group = new THREE.Group();
  const texs = LOG.map((lines, i) => canvasTex(1024, 512, (g, w, h) => {
    const panel = i % 3 === 0;
    if (panel) {
      g.fillStyle = 'rgba(54, 70, 104, 0.34)'; g.strokeStyle = 'rgba(190, 205, 235, 0.3)'; g.lineWidth = 3;
      g.beginPath(); g.roundRect(8, 8, w - 16, h - 16, 18); g.fill(); g.stroke();
    }
    g.font = '500 44px "JetBrains Mono", ui-monospace, monospace'; g.textBaseline = 'middle';
    lines.forEach((s, k) => {
      const head = s.startsWith('•');
      g.fillStyle = head ? 'rgba(233, 228, 218, 0.95)' : 'rgba(170, 180, 200, 0.8)';
      g.fillText(s.length > 36 ? s.slice(0, 35) + '…' : s, 40, 74 + k * 84);
    });
  }));
  spots.forEach((s, i) => {
    const m = decal(s.w, s.w / 2, new THREE.MeshBasicMaterial({ map: texs[s.i % texs.length], transparent: true, opacity: s.o, depthWrite: false, fog: true }));
    m.position.set(s.x, 0.003, s.z); m.rotation.z = s.rot; m.renderOrder = -5;
    group.add(m);
  });
  return { group, redraw() { texs.forEach((t) => t.userData.redraw()); } };
}

// The cursor: the agent, and the reader's own place in this world. A block of amber light lying on the glass.
export function makeCursor() {
  const group = new THREE.Group();
  const block = decal(0.34, 0.6, new THREE.MeshBasicMaterial({ color: PAL.amber, transparent: true, fog: false }));
  block.position.y = 0.008; block.renderOrder = 4;
  const after = decal(1.5, 2.2, new THREE.MeshBasicMaterial({ map: glow(), color: PAL.amber, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
  after.position.y = 0.006; after.renderOrder = 3;
  const lift = glowSprite(PAL.amber, 1.6, 0.35); lift.position.y = 0.18;
  group.add(after, block, lift);
  return {
    group,
    update(t) {
      // it breathes; it never goes out
      const b = 0.82 + 0.18 * Math.sin(twelve(t) * 2.6);
      block.material.opacity = b; after.material.opacity = 0.42 * b; lift.material.opacity = 0.3 * b;
      return b;
    },
  };
}

// The evening left behind: the tea house's garden at night, seen as one small lit window standing far out on the
// glass. The picture is the site's own painted plate, by its own address.
export function makeEvening(onLoad) {
  const group = new THREE.Group();
  const tex = new THREE.TextureLoader().load('/tea/hero/poster-night.webp', onLoad);
  tex.colorSpace = THREE.SRGBColorSpace;
  const w = 15, h = w * 9 / 16;
  const pic = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, fog: false }));
  pic.position.y = h / 2 + 0.25;
  const frame = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.5, h + 0.5), new THREE.MeshBasicMaterial({ color: 0x241d1a, fog: false }));
  frame.position.set(0, h / 2 + 0.25, -0.05);
  const halo = glowSprite(0xffc890, 46, 0.22); halo.position.y = h / 2;
  group.add(frame, pic, halo);
  return { group, pic, halo };
}

// A little wind: faint streaks of air that cross the view, always about the camera.
export function makeWind(n = 46) {
  const pos = new Float32Array(n * 6);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0xaab4d0, transparent: true, opacity: 0.11, depthWrite: false }));
  lines.frustumCulled = false; lines.renderOrder = 6;
  const BOX = 44;
  return {
    lines,
    update(t, cam) {
      for (let i = 0; i < n; i++) {
        const sp = 2.2 + hash(i * 3.1) * 3.4, len = 0.5 + hash(i * 5.7) * 1.3;
        let x = hash(i) * BOX + t * sp, z = hash(i * 7.3) * BOX + t * sp * 0.22;
        x = ((x % BOX) + BOX) % BOX - BOX / 2 + cam.position.x; z = ((z % BOX) + BOX) % BOX - BOX / 2 + cam.position.z;
        const y = 0.25 + hash(i * 1.7) * 3.6 + Math.sin(t * 0.7 + i) * 0.12;
        pos[i * 6] = x; pos[i * 6 + 1] = y; pos[i * 6 + 2] = z;
        pos[i * 6 + 3] = x - len; pos[i * 6 + 4] = y - 0.02; pos[i * 6 + 5] = z - len * 0.22;
      }
      geo.attributes.position.needsUpdate = true;
    },
  };
}

// Far out, other work goes on: a scatter of small lights along the horizon, each a process someone left running.
export function makeFar(n = 320) {
  const R = rng(515), pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const a = R() * 6.283, r = 58 + R() * R() * 170, warm = R() < 0.62, k = 0.25 + R() * 0.75;
    pos.set([Math.sin(a) * r, 0.15 + R() * R() * 1.6, -Math.cos(a) * r], i * 3);
    col.set(warm ? [1 * k, 0.74 * k, 0.42 * k] : [0.55 * k, 0.68 * k, 1 * k], i * 3);
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 2.4, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.8, fog: false, depthWrite: false }));
  pts.frustumCulled = false;
  return pts;
}
