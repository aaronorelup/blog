// The television (bible 4: CRT set). The film's title character: a brand-less walnut set of the 1960s or 70s on
// the room's low cabinet. OWNER: tv-look.
//
//   const tv = createTV({ THREE, programmeTexture, anchors });   // anchors = ROOM from shots.js
//   scene.add(tv.group);
//   tv.update(S, shot, camera)   // after the camera is placed for this frame
//   tv.screen                    // the tube's mesh (the room aims its light from it)
//
// The set: a walnut case with rounded edges on four small turned feet; the 4:3 tube behind a dark bezel mask with
// rounded corners; beside it a control panel with two knobs and a speaker grille of woven cloth in a thin brass trim.
// The tube is exactly the anchor's screen quad (its centre and size; the glass bulges toward the viewer from it), and
// the case stands on the cabinet top at anchors.tv.y, as deep as anchors.tv.d with its front at anchors.tv.z + d/2.
// The control panel needs room beside the tube, so the case runs further to the right of the tube than to its left
// (it is wider than anchors.tv.w; it still sits well inside the cabinet).
//
// The glow: the tube lights its own bezel, case front, knobs and grille (a term added to those materials: the
// programme canvas's mean colour, which is the last level of the canvas texture's mip chain, falling off with
// distance from the tube's edge), plus three additive decals in one draw: a faint haze round the tube, the halo on
// the wall behind the set (tight round the case's outline over a broad soft glow) and the spill on the cabinet top
// round the set's feet. All of it reads only the canvas, so the room's light and this glow agree: the set is where
// the room's light comes from. The decals carry the film's static dither (src/post.js), so they do not band.
//
// Textures (walnut, grille cloth) are made once at load from fixed seeds (hash01). Nothing here keeps state between
// frames: update() sets uniforms from this frame's camera and S only. It also writes S.frame on group.userData.frame
// (group.name 'qh-tv'), where src/post.js reads the grain seed if film.js does not pass the frame.

import { hash01 } from '../rng.js';
import { createScreenMaterial } from './screen.js';
import '../post.js';                                   // the qh_dither shader chunk the glows include

const SEED = { walnut: 8101, grain: 8102, cloth: 8201 };

// ---- procedural textures (once, at load) -----------------------------------------------------------------------
function valueNoise(seed, period) {
  // a periodic lattice of hashes, smoothly interpolated; x, y in lattice cells
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const h = (i, j) => hash01(seed, ((i % period) + period) % period, ((j % period) + period) % period, 0);
    const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1);
    return (a + (b - a) * sx) + ((c + (d - c) * sx) - (a + (b - a) * sx)) * sy;
  };
}

function walnutCanvas() {
  // long grain along x; tiles in x and y
  const W = 1024, H = 256, cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d'), img = ctx.createImageData(W, H), px = img.data;
  const n1 = valueNoise(SEED.walnut, 8), n2 = valueNoise(SEED.walnut + 1, 32);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const u = x / W, v = y / H;
      // figure: slow waves that bend the grain lines
      const warp = (n1(u * 8, v * 2) - 0.5) * 1.4 + (n2(u * 32, v * 4) - 0.5) * 0.35;
      const t = v * 22 + warp;
      const f = t - Math.floor(t);
      const line = Math.pow(Math.abs(f - 0.5) * 2, 6);                 // dark late-wood lines
      const pore = 1 - 0.14 * Math.max(0, hash01(SEED.grain, x >> 2, y >> 1, 0) - 0.8) / 0.2;   // open pores, long              // flecks of open pore
      const band = 0.82 + 0.36 * n1(u * 8 + 3.7, v * 2 + 1.3);         // lighter and darker boards
      const k = band * (1 - 0.42 * line) * pore;
      // walnut: warm brown with a little purple-grey in the dark lines
      const i = (y * W + x) * 4;
      px[i] = Math.min(255, 118 * k + 14 * line);
      px[i + 1] = Math.min(255, 72 * k + 4 * line);
      px[i + 2] = Math.min(255, 44 * k + 10 * line);
      px[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return cv;
}

function clothCanvas() {
  // plain weave: warp and weft threads with slubs; a gold thread every eighth
  const W = 256, H = 256, T = 4, cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d'), img = ctx.createImageData(W, H), px = img.data;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const cx = Math.floor(x / T), cy = Math.floor(y / T), fx = (x % T + 0.5) / T, fy = (y % T + 0.5) / T;
      const over = (cx + cy) % 2 === 0;                                 // warp over weft, or under
      const across = over ? fy : fx;                                    // across the visible thread
      const shade = Math.sin(Math.PI * across);                         // round thread
      const slub = 0.88 + 0.24 * hash01(SEED.cloth, over ? cx : cy, over ? 1 : 2, Math.floor((over ? y : x) / 24));
      const gold = (over ? cx : cy) % 8 === 3;
      const k = (0.30 + 0.70 * shade) * slub;
      const base = gold ? [214, 172, 104] : [176, 152, 118];             // oatmeal cloth, a brassy thread
      const i = (y * W + x) * 4;
      px[i] = base[0] * k; px[i + 1] = base[1] * k; px[i + 2] = base[2] * k; px[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return cv;
}

// ---- geometry helpers ----------------------------------------------------------------------------------------------
function roundedRect(THREE, shapeOrPath, x0, y0, w, h, r) {
  const s = shapeOrPath;
  s.moveTo(x0 + r, y0);
  s.lineTo(x0 + w - r, y0); s.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r);
  s.lineTo(x0 + w, y0 + h - r); s.quadraticCurveTo(x0 + w, y0 + h, x0 + w - r, y0 + h);
  s.lineTo(x0 + r, y0 + h); s.quadraticCurveTo(x0, y0 + h, x0, y0 + h - r);
  s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0);
  return s;
}

/** A rounded slab: outline w x h (bevel included), depth d (bevel included), its back face at z = 0. */
function slab(THREE, w, h, d, r, bevel, holes = []) {
  const s = roundedRect(THREE, new THREE.Shape(), -w / 2 + bevel, -h / 2 + bevel, w - 2 * bevel, h - 2 * bevel, Math.max(0.001, r - bevel));
  for (const [hx, hy, hw, hh, hr] of holes) s.holes.push(roundedRect(THREE, new THREE.Path(), hx - hw / 2 - bevel, hy - hh / 2 - bevel, hw + 2 * bevel, hh + 2 * bevel, hr + bevel));
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.0005, d - 2 * bevel), bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 8 });
  g.translate(0, 0, bevel);
  return g;
}

// ---- the tube's light on the set: injected into Lambert materials -------------------------------------------------
function litByTube(THREE, mat, glow, { sheen = 0, spill = 1, wrap = 0 } = {}) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uProg = glow.uProg; sh.uniforms.uTube = glow.uTube; sh.uniforms.uSpill = glow.uSpill;
    sh.uniforms.uSheen = { value: sheen }; sh.uniforms.uMine = { value: new THREE.Vector2(spill, wrap) };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vTvW;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvTvW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
        varying vec3 vTvW; uniform sampler2D uProg; uniform vec4 uTube; uniform vec2 uSpill; uniform float uSheen; uniform vec2 uMine;
        float tvSdRR(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }`)
      .replace('#include <opaque_fragment>', `{
        vec3 avg = textureLod(uProg, vec2(0.5), 12.0).rgb;             // the canvas mean (last mip level)
        vec3 nW = normalize(inverseTransformDirection(normal, viewMatrix));
        vec2 rel = vTvW.xy - uTube.xy;
        vec2 near = clamp(rel, -uTube.zw, uTube.zw);                      // nearest point of the tube's face
        vec3 src = vec3(uTube.xy + near, uSpill.y);
        vec3 L = src - vTvW; float dist = length(L); L /= max(dist, 1e-4);
        float edge = max(tvSdRR(rel, uTube.zw, 0.03), 0.0);
        float spill = max((dot(nW, L) + uMine.y) / (1.0 + uMine.y), 0.0) / (1.0 + pow(edge / 0.055, 2.0));
        outgoingLight += diffuseColor.rgb * avg * spill * uSpill.x * uMine.x;
        float fr = pow(1.0 - abs(dot(normal, normalize(vViewPosition))), 5.0);
        outgoingLight += vec3(0.55, 0.62, 0.78) * fr * uSheen;          // varnish: a glint on the rounded edges
      }
      #include <opaque_fragment>`);
  };
  mat.customProgramCacheKey = () => 'qh-tv-lit';
  return mat;
}

export function createTV({ THREE, programmeTexture, anchors }) {
  const group = new THREE.Group();
  group.name = 'qh-tv';
  const T = anchors.tv, S0 = anchors.screen;

  // the picture is mipmapped: the wide shots minify it 3x (no shimmer on the strip's fine lines), the glass blooms
  // from its low levels, and its last level (1x1) is the canvas mean that colours the set's glow
  programmeTexture.generateMipmaps = true;
  programmeTexture.minFilter = THREE.LinearMipmapLinearFilter;
  programmeTexture.magFilter = THREE.LinearFilter;
  programmeTexture.needsUpdate = true;

  // ---- dimensions (metres) -----------------------------------------------------------------------------------------
  const FEET = 0.03;
  const zFront = T.z + T.d / 2, zBack = T.z - T.d / 2;
  const yBot = T.y + FEET, yTop = T.y + T.h;
  const tubeL = S0.x - S0.w / 2, tubeR = S0.x + S0.w / 2;
  const BEZ = { w: S0.w + 0.085, h: S0.h + 0.075 };                  // the dark mask round the tube
  const xL = S0.x - BEZ.w / 2 - 0.028;                                // walnut margin left of the bezel
  const PANEL = { x0: tubeR + 0.055, w: 0.15 };                       // knobs and grille beside the tube
  const xR = PANEL.x0 + PANEL.w + 0.03;
  const W = xR - xL, H = yTop - yBot, cx = (xL + xR) / 2, cy = (yBot + yTop) / 2;
  const dims = { xL, xR, yBot, yTop, zFront, zBack, panel: PANEL };

  // ---- materials -----------------------------------------------------------------------------------------------------
  const glow = {
    uProg: { value: programmeTexture },
    uTube: { value: new THREE.Vector4(S0.x, S0.y, S0.w / 2, S0.h / 2) },
    uSpill: { value: new THREE.Vector2(2.2, S0.z + 0.03) },          // strength, the light's z (just off the glass)
  };
  const walnutTex = new THREE.CanvasTexture(walnutCanvas());
  walnutTex.colorSpace = THREE.SRGBColorSpace; walnutTex.wrapS = walnutTex.wrapT = THREE.RepeatWrapping;
  walnutTex.repeat.set(1 / 0.9, 1 / 0.45); walnutTex.anisotropy = 2;
  const clothTex = new THREE.CanvasTexture(clothCanvas());
  clothTex.colorSpace = THREE.SRGBColorSpace; clothTex.wrapS = clothTex.wrapT = THREE.RepeatWrapping;
  clothTex.repeat.set(1 / 0.07, 1 / 0.07);                            // a 256 px tile = 7 cm of cloth: threads about 1.1 mm
  clothTex.anisotropy = 2;

  const walnut = litByTube(THREE, new THREE.MeshLambertMaterial({ map: walnutTex, color: 0xffffff }), glow, { sheen: 0.025 });
  const darkMat = litByTube(THREE, new THREE.MeshLambertMaterial({ color: 0x1d1815 }), glow, { sheen: 0.09 });
  const clothMat = litByTube(THREE, new THREE.MeshLambertMaterial({ map: clothTex }), glow, { sheen: 0.0, spill: 1.5, wrap: 0.6 });
  const brass = litByTube(THREE, new THREE.MeshLambertMaterial({ color: 0xb08a4a }), glow, { sheen: 0.22 });
  const flatMat = new THREE.MeshBasicMaterial({ vertexColors: true });

  // Software WebGL pays for every draw call (tens of ms each at 1080p) and shades hidden fragments too, so the set is
  // baked at load into one mesh per material (7 draws in all, none casting shadows: the screen light stands in front
  // of the set's face, so nothing of the set is in its beam). Big flat faces that are never seen take the cheapest
  // material.
  const parts = { walnut: [], dark: [], brass: [], cloth: [], flat: [], glow: [] };
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _one = new THREE.Vector3(1, 1, 1);
  const part = (bucket, geo, { x = 0, y = 0, z = 0, rx = 0, rz = 0, color = null, kind = 0 } = {}) => {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    g.applyMatrix4(_m.compose(_v.set(x, y, z), _q.setFromEuler(_e.set(rx, 0, rz)), _one));
    g.userData = { color, kind };
    parts[bucket].push(g);
  };
  const groupOf = (geo, gi) => {                                        // one material group of a non-indexed geometry
    const { start, count } = geo.groups[gi], out = new THREE.BufferGeometry();
    for (const k of ['position', 'normal', 'uv']) {
      const at = geo.attributes[k]; if (!at) continue;
      out.setAttribute(k, new THREE.BufferAttribute(at.array.slice(start * at.itemSize, (start + count) * at.itemSize), at.itemSize));
    }
    return out;
  };
  const merged = (list) => {
    const n = list.reduce((a, g) => a + g.attributes.position.count, 0);
    const pos = new Float32Array(n * 3), nrm = new Float32Array(n * 3), uv = new Float32Array(n * 2), col = new Float32Array(n * 3), kind = new Float32Array(n);
    let o = 0;
    for (const g of list) {
      const c = g.attributes.position.count;
      pos.set(g.attributes.position.array, o * 3);
      if (g.attributes.normal) nrm.set(g.attributes.normal.array, o * 3);
      if (g.attributes.uv) uv.set(g.attributes.uv.array, o * 2);
      const cc = new THREE.Color(g.userData.color ?? 0xffffff);
      for (let i = 0; i < c; i++) { col[(o + i) * 3] = cc.r; col[(o + i) * 3 + 1] = cc.g; col[(o + i) * 3 + 2] = cc.b; kind[o + i] = g.userData.kind; }
      o += c; g.dispose();
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
    out.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); out.setAttribute('color', new THREE.BufferAttribute(col, 3));
    out.setAttribute('kind', new THREE.BufferAttribute(kind, 1));
    out.computeBoundingSphere();
    return out;
  };

  // ---- the case: a rounded walnut box -------------------------------------------------------------------------------
  // The extrusion's rounded sides and edges (group 1) are walnut; its flat caps (group 0, front and back) are never
  // seen (the front is covered by a thin walnut frame with the bezel's opening cut out of it), so they are flat dark.
  // UVs: the extrusion's world UVs are in metres; the texture repeat sets the scale.
  const CB = 0.014;
  {
    const caseGeo = slab(THREE, W, H, T.d, 0.04, CB);
    part('flat', groupOf(caseGeo, 0), { x: cx, y: cy, z: zBack, color: 0x0d0907 });
    part('walnut', groupOf(caseGeo, 1), { x: cx, y: cy, z: zBack });
    caseGeo.dispose();
    const fr = roundedRect(THREE, new THREE.Shape(), xL + CB, yBot + CB, W - 2 * CB, H - 2 * CB, 0.04 - CB);
    const o = 0.006;                                                  // the opening hides under the bezel's edge
    fr.holes.push(roundedRect(THREE, new THREE.Path(), S0.x - BEZ.w / 2 + o, S0.y - BEZ.h / 2 + o, BEZ.w - 2 * o, BEZ.h - 2 * o, 0.03 - o));
    part('walnut', new THREE.ShapeGeometry(fr, 8), { z: zFront + 0.0005 });
  }

  // ---- the bezel mask: a dark plate with the tube's rounded opening, a thin brass bead round it ---------------------
  const BZ_D = 0.016;                                                  // proud of the case front
  part('dark', slab(THREE, BEZ.w, BEZ.h, BZ_D, 0.03, 0.004, [[0, 0, S0.w - 0.006, S0.h - 0.006, 0.026]]), { x: S0.x, y: S0.y, z: zFront - 0.004 });
  part('brass', slab(THREE, BEZ.w + 0.008, BEZ.h + 0.008, 0.006, 0.034, 0.002, [[0, 0, BEZ.w - 0.004, BEZ.h - 0.004, 0.028]]),
    { x: S0.x, y: S0.y, z: zFront - 0.002 });
  // the tube's black surround behind the glass (seen past the glass's edge at an angle)
  part('flat', new THREE.PlaneGeometry(S0.w + 0.02, S0.h + 0.02), { x: S0.x, y: S0.y, z: S0.z - 0.004, color: 0x050505 });

  // ---- the tube ------------------------------------------------------------------------------------------------------
  const screenMat = createScreenMaterial({ THREE, programmeTexture });
  screenMat.uniforms.uHalf.value.set(S0.w / 2, S0.h / 2);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(S0.w, S0.h, 24, 18), screenMat);
  screen.position.set(S0.x, S0.y, S0.z); screen.renderOrder = -3; group.add(screen);

  // ---- the control panel: two knobs over a speaker grille -------------------------------------------------------------
  const P = PANEL, pcx = P.x0 + P.w / 2, ptop = S0.y + BEZ.h / 2, pbot = S0.y - BEZ.h / 2;
  part('dark', slab(THREE, P.w, ptop - pbot, 0.008, 0.012, 0.002), { x: pcx, y: (ptop + pbot) / 2, z: zFront - 0.002 });
  // knobs: a turned bakelite skirt and cap with a brass insert and a cream pointer line
  const knobProfile = [[0, 0], [0.026, 0], [0.027, 0.004], [0.022, 0.008], [0.020, 0.024], [0.017, 0.028], [0, 0.029]]
    .map(([r, h]) => new THREE.Vector2(r, h));
  const knobGeo = new THREE.LatheGeometry(knobProfile, 36);
  const capGeo = new THREE.CylinderGeometry(0.0115, 0.0115, 0.002, 32);
  const tickGeo = new THREE.BoxGeometry(0.0022, 0.009, 0.0012);
  const knobY = [ptop - 0.05, ptop - 0.125];
  knobY.forEach((ky, i) => {
    const z0 = zFront + 0.006, a = i === 0 ? 0.55 : -0.9;              // where the knobs were last left (AUTHORED)
    part('dark', knobGeo, { x: pcx, y: ky, z: z0, rx: Math.PI / 2 });
    part('brass', capGeo, { x: pcx, y: ky, z: z0 + 0.0295, rx: Math.PI / 2 });
    part('flat', tickGeo, { x: pcx + Math.sin(a) * 0.0155, y: ky + Math.cos(a) * 0.0155, z: z0 + 0.031, rz: -a, color: 0x8f8470 });
  });
  // the speaker grille: woven cloth in a thin brass frame
  const gTop = knobY[1] - 0.05, gBot = pbot + 0.022, gW = P.w - 0.026, gH = gTop - gBot;
  part('cloth', new THREE.PlaneGeometry(gW, gH), { x: pcx, y: (gTop + gBot) / 2, z: zFront + 0.0065 });
  part('brass', slab(THREE, gW + 0.008, gH + 0.008, 0.004, 0.004, 0.0012, [[0, 0, gW - 0.002, gH - 0.002, 0.002]]),
    { x: pcx, y: (gTop + gBot) / 2, z: zFront + 0.005 });

  // ---- feet: four small turned walnut feet with brass shoes ------------------------------------------------------------
  const footGeo = new THREE.CylinderGeometry(0.016, 0.011, FEET, 20);
  const shoeGeo = new THREE.CylinderGeometry(0.0115, 0.0115, 0.004, 20);
  for (const fx of [xL + 0.06, xR - 0.06]) for (const fz of [zFront - 0.06, zBack + 0.06]) {
    part('walnut', footGeo, { x: fx, y: T.y + FEET / 2, z: fz });
    part('brass', shoeGeo, { x: fx, y: T.y + 0.002, z: fz });
  }
  for (const g of [knobGeo, capGeo, tickGeo, footGeo, shoeGeo]) g.dispose();

  // ---- glow: the set as the room's light. Three additive decals, all coloured by the canvas mean (the same light the
  // room's spot takes) and all in the one glow mesh (one draw):
  //   kind 0: a faint haze ring round the tube (no fragments over the picture);
  //   kind 1: the halo on the wall behind the set: a tight glow hugging the case's outline (light escaping round
  //           it) over a broad soft one, a little higher than the set, so the eye finds the source at once;
  //   kind 2: the spill on the cabinet top: brightest along the set's front edge and feet, fading out along the top.
  // Each carries the static dither (src/post.js qh_dither, its own salt), so the long faint gradients do not band.
  const HZ = 0.12, zWall = (anchors.backWallZ ?? -3) + 0.004;
  const wall = { hw: 1.25, hh: 0.95, x: cx, y: cy + 0.16 };            // the halo's quad on the wall (it fades inside it)
  const C = anchors.cabinet;
  const top = C ? { x0: C.x - C.w / 2 + 0.008, x1: C.x + C.w / 2 - 0.008, z0: C.z - C.d / 2 + 0.008, z1: C.z + C.d / 2 - 0.008, y: (C.y ?? 0) + C.h + 0.0012 } : null;
  {
    const outer = roundedRect(THREE, new THREE.Shape(), -S0.w / 2 - HZ, -S0.h / 2 - HZ, S0.w + 2 * HZ, S0.h + 2 * HZ, 0.03 + HZ);
    outer.holes.push(roundedRect(THREE, new THREE.Path(), -S0.w / 2, -S0.h / 2, S0.w, S0.h, 0.03));
    part('glow', new THREE.ShapeGeometry(outer, 6), { x: S0.x, y: S0.y, z: zFront + 0.02, kind: 0 });
    part('glow', new THREE.PlaneGeometry(2 * wall.hw, 2 * wall.hh), { x: wall.x, y: wall.y, z: zWall, kind: 1 });
    if (top && top.x1 > top.x0 && top.z1 > top.z0) {
      part('glow', new THREE.PlaneGeometry(top.x1 - top.x0, top.z1 - top.z0), { x: (top.x0 + top.x1) / 2, y: top.y, z: (top.z0 + top.z1) / 2, rx: -Math.PI / 2, kind: 2 });
    }
  }
  const GLOW = { haze: 0.10, halo: 0.22, haloBroad: 0.075, spill: 0.30 };   // halo and spill on the curved mean (x1.38 at a mean of 0.45)
  const glowMat = new THREE.ShaderMaterial({
    uniforms: { uProg: glow.uProg, uTube: { value: new THREE.Vector2(S0.x, S0.y) }, uTubeHalf: { value: new THREE.Vector2(S0.w / 2, S0.h / 2) },
      uWall: { value: new THREE.Vector4(wall.x, wall.y, wall.hw, wall.hh) },
      uCase: { value: new THREE.Vector4(cx, cy, W / 2, H / 2) },
      uFoot: { value: new THREE.Vector4(xL, xR, zBack, zFront) },
      uStrength: { value: new THREE.Vector4(GLOW.haze, GLOW.halo, GLOW.haloBroad, GLOW.spill) } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    vertexShader: 'attribute float kind; varying vec3 vW; varying float vK; void main(){ vW = position; vK = kind; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `
      #include <qh_dither>
      uniform sampler2D uProg; uniform vec2 uTube, uTubeHalf; uniform vec4 uWall, uCase, uFoot, uStrength; varying vec3 vW; varying float vK;
      float sdRR(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
      void main() {
        vec3 avg = textureLod(uProg, vec2(0.5), 12.0).rgb;
        // the halo and the spill see the picture's mean through a gentle curve (luminance^0.6, same hue), so a dim
        // picture still reads as the room's source and a bright one does not flood the wall
        float lum = max(dot(avg, vec3(0.2126, 0.7152, 0.0722)), 1e-4);
        vec3 soft = avg * pow(lum, -0.4);
        float a; uint salt;
        if (vK < 0.5) {
          float d = sdRR(vW.xy - uTube, uTubeHalf, 0.03);
          a = exp(-max(d, 0.0) / 0.022) * smoothstep(0.0, 0.004, d) * (1.0 - smoothstep(0.08, 0.12, d)) * uStrength.x;
          salt = 1u;
        } else if (vK < 1.5) {
          // distance on the wall from the case's outline (seen straight on), and an edge fade inside the quad
          float d = max(sdRR(vW.xy - uCase.xy, uCase.zw, 0.04), 0.0);
          vec2 e = (vW.xy - uWall.xy) / uWall.zw;
          float fade = (1.0 - smoothstep(0.55, 1.0, abs(e.x))) * (1.0 - smoothstep(0.5, 1.0, abs(e.y)));
          float up = 1.0 + 0.35 * smoothstep(-0.2, 0.6, vW.y - uCase.y - uCase.w);   // light climbs the wall a little
          a = (uStrength.y * exp(-d / 0.13) + uStrength.z * exp(-d * d / 0.16)) * up * fade;
          salt = 2u;
        } else {
          // the cabinet top: distance from the set's footprint, brightest along its front edge
          vec2 q = vec2(vW.x - 0.5 * (uFoot.x + uFoot.y), vW.z - 0.5 * (uFoot.z + uFoot.w));
          float d = max(sdRR(q, vec2(0.5 * (uFoot.y - uFoot.x), 0.5 * (uFoot.w - uFoot.z)), 0.02), 0.0);
          float front = 0.35 + 0.65 * smoothstep(uFoot.z, uFoot.w + 0.01, vW.z);
          a = uStrength.w * exp(-d / 0.09) * front;
          salt = 3u;
        }
        vec3 col = (vK < 0.5 ? avg : soft) * a;
        float amp = (0.8 / 255.0) * smoothstep(1.0 / 255.0, 3.0 / 255.0, max(col.r, max(col.g, col.b)));
        gl_FragColor = vec4(max(col + qhDither(salt) * amp, 0.0), 1.0);
      }`,
  });

  // ---- one mesh per material ------------------------------------------------------------------------------------------
  const meshOf = (bucket, mat, order) => {
    const m = new THREE.Mesh(merged(parts[bucket]), mat);
    m.castShadow = false; m.receiveShadow = false; m.renderOrder = order; m.name = `qh-tv-${bucket}`;
    group.add(m); return m;
  };
  meshOf('flat', flatMat, -2);
  meshOf('dark', darkMat, -1);
  meshOf('walnut', walnut, 0);
  meshOf('brass', brass, 0);
  meshOf('cloth', clothMat, 0);
  meshOf('glow', glowMat, 2);

  // ---- per frame -----------------------------------------------------------------------------------------------------
  const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();
  function update(S, shot, camera) {
    group.userData.frame = S.frame;
    // scanlines fade out where a line would be under 2.5 output pixels (fully on from 3.5)
    const height = camera.userData.heightPx || 1080;
    tmpA.set(S0.x, S0.y + S0.h / 2, S0.z).project(camera); tmpB.set(S0.x, S0.y - S0.h / 2, S0.z).project(camera);
    const screenPx = Math.abs(tmpA.y - tmpB.y) / 2 * height, linePx = screenPx / screenMat.uniforms.uLines.value;
    screenMat.uniforms.uScan.value = Math.min(1, Math.max(0, (linePx - 2.5) / 1.0));
    // the camera in the glass's own frame (fresnel, the reflection's parallax)
    screen.updateMatrixWorld();
    screenMat.uniforms.uCam.value.copy(camera.position);
    screen.worldToLocal(screenMat.uniforms.uCam.value);
  }

  return { group, screen, update, dims };
}

