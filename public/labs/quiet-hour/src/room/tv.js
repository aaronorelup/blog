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
// The glow, so the eye finds the set as the room's light source at once: the tube lights its own bezel, case front,
// knobs and grille (a term added to those materials, falling off with distance from the tube's edge), and three small
// baked meshes carry its light into the room: a veil of haze round the tube, a pool on the cabinet top with a band
// along the top's front edge, and the light on the wall behind the set, which is multiplied into the wall so its own
// colour and stripes brighten. All of it is the programme canvas's mean colour (the last level of the canvas
// texture's mip chain) times a fixed falloff, so the room's light and this glow agree and nothing here has a clock.
//
// Textures (walnut, grille cloth) are made once at load from fixed seeds (hash01). Nothing here keeps state between
// frames: update() sets uniforms from this frame's camera and S only. It also writes S.frame on group.userData.frame
// (group.name 'qh-tv'), where src/post.js reads the grain seed if film.js does not pass the frame.

import { hash01 } from '../rng.js';
import { createScreenMaterial } from './screen.js';

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
  const parts = { walnut: [], dark: [], brass: [], cloth: [], flat: [] };
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _one = new THREE.Vector3(1, 1, 1);
  const part = (bucket, geo, { x = 0, y = 0, z = 0, rx = 0, rz = 0, color = null } = {}) => {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    g.applyMatrix4(_m.compose(_v.set(x, y, z), _q.setFromEuler(_e.set(rx, 0, rz)), _one));
    g.userData = { color };
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
    const pos = new Float32Array(n * 3), nrm = new Float32Array(n * 3), uv = new Float32Array(n * 2), col = new Float32Array(n * 3);
    let o = 0;
    for (const g of list) {
      const c = g.attributes.position.count;
      pos.set(g.attributes.position.array, o * 3);
      if (g.attributes.normal) nrm.set(g.attributes.normal.array, o * 3);
      if (g.attributes.uv) uv.set(g.attributes.uv.array, o * 2);
      const cc = new THREE.Color(g.userData.color ?? 0xffffff);
      for (let i = 0; i < c; i++) { col[(o + i) * 3] = cc.r; col[(o + i) * 3 + 1] = cc.g; col[(o + i) * 3 + 2] = cc.b; }
      o += c; g.dispose();
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
    out.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); out.setAttribute('color', new THREE.BufferAttribute(col, 3));
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

  // ---- glow: the set as the room's light source (all of it coloured by the canvas mean, all of it baked) -----------
  // Three layers, each a small mesh whose falloff is worked out per vertex at load (attribute ga), so a fragment
  // costs nothing but a blend:
  //   veil   additive, a ring round the tube just in front of the set: a tight haze on the bezel and a wide, faint
  //          one over whatever is behind it (halation). No fragments over the picture;
  //   top    additive, on the cabinet top: a pool round the set's base, strongest at the front, none under the set,
  //          and a band along the top's front edge, brightest under the tube (the varnished edge catching it);
  //   wall   multiplied in (the frame times 1 + glow), on the wall behind the set, falling off from the set's
  //          outline: the wall's own colour and stripes get brighter, as a lit wall does. It stops short of the
  //          doorway and the window.
  // Smooth light added to an 8-bit frame bands, so the additive layers dither themselves with qhRand (src/post.js).
  const GLOW = {
    veilTight: 0.10, veilWide: 0.11, veilScale: 0.14, veilReach: 0.5,     // additive strengths (x canvas mean), metres
    top: 0.44, topScale: 0.10, edge: 0.42, edgeScale: 0.22, wood: [1.0, 0.86, 0.70],   // wood: the varnished walnut's tint
    wall: 5.0, wallScale: 0.24, wallReach: 0.75,                          // the wall is multiplied by 1 + wall x mean x a
  };
  const sstep = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
  const sdBox = (px, py, hx, hy, r) => {                                 // signed distance to a rounded box
    const qx = Math.abs(px) - hx + r, qy = Math.abs(py) - hy + r;
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
  };
  const glowGeo = (list) => {                                            // [{ pos, ga, idx, tint? }] -> one geometry
    const pos = [], ga = [], idx = [];
    for (const g of list) {
      const o = pos.length / 3, t = g.tint ?? [1, 1, 1];                 // tint: the lit surface's own colour
      pos.push(...g.pos); for (const a of g.ga) ga.push(a * t[0], a * t[1], a * t[2]); for (const i of g.idx) idx.push(i + o);
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
    out.setAttribute('ga', new THREE.BufferAttribute(new Float32Array(ga), 3));
    out.setIndex(idx); out.computeBoundingSphere();
    return out;
  };
  const gridPart = (nx, ny, at) => {                                     // at(u, v) -> [x, y, z, a]
    const pos = [], ga = [], idx = [];
    for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) { const v = at(i / nx, j / ny); pos.push(v[0], v[1], v[2]); ga.push(v[3]); }
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const q = j * (nx + 1) + i; idx.push(q, q + 1, q + nx + 2, q, q + nx + 2, q + nx + 1); }
    return { pos, ga, idx };
  };
  // the veil: strips round the tube's rounded outline, at these distances from its edge
  const veilPart = (() => {
    const hw = S0.w / 2, hh = S0.h / 2, r = 0.03, z = zFront + 0.04, per = [];   // per: [px, py, nx, ny] round the outline
    const corner = (cxx, cyy, a0) => { for (let k = 0; k <= 8; k++) { const a = a0 + k / 8 * Math.PI / 2, c = Math.cos(a), sn = Math.sin(a); per.push([cxx + r * c, cyy + r * sn, c, sn]); } };
    const edge = (x0, y0, x1, y1, nx, ny) => { for (let k = 1; k < 8; k++) per.push([x0 + (x1 - x0) * k / 8, y0 + (y1 - y0) * k / 8, nx, ny]); };
    corner(hw - r, hh - r, 0); edge(hw - r, hh, -hw + r, hh, 0, 1);
    corner(-hw + r, hh - r, Math.PI / 2); edge(-hw, hh - r, -hw, -hh + r, -1, 0);
    corner(-hw + r, -hh + r, Math.PI); edge(-hw + r, -hh, hw - r, -hh, 0, -1);
    corner(hw - r, -hh + r, Math.PI * 1.5); edge(hw, -hh + r, hw, hh - r, 1, 0);
    const offs = [0, 0.002, 0.004, 0.008, 0.014, 0.022, 0.034, 0.05, 0.075, 0.11, 0.16, 0.23, 0.31, 0.40, GLOW.veilReach];
    const alpha = (d) => GLOW.veilTight * Math.exp(-d / 0.022) * sstep(0, 0.004, d) * (1 - sstep(0.08, 0.12, d))
      + GLOW.veilWide * Math.exp(-d / GLOW.veilScale) * sstep(0, 0.02, d) * (1 - sstep(0.6 * GLOW.veilReach, GLOW.veilReach, d));
    const pos = [], ga = [], idx = [], n = per.length;
    for (const d of offs) for (const [px, py, nx, ny] of per) { pos.push(S0.x + px + nx * d, S0.y + py + ny * d, z); ga.push(alpha(d)); }
    for (let k = 0; k + 1 < offs.length; k++) for (let i = 0; i < n; i++) {
      const a0 = k * n + i, a1 = k * n + (i + 1) % n, b0 = a0 + n, b1 = a1 + n;
      idx.push(a0, a1, b1, a0, b1, b0);
    }
    return { pos, ga, idx };
  })();
  // the pool on the cabinet top
  const topPart = (() => {
    const C = anchors.cabinet;
    if (!C) return null;
    const x0 = C.x - C.w / 2 + 0.012, x1 = C.x + C.w / 2 - 0.012, z0 = C.z - C.d / 2 + 0.012, z1 = C.z + C.d / 2 - 0.012, y = C.h + 0.0012;
    const fcx = (xL + xR) / 2, fcz = (zBack + zFront) / 2, fhx = (xR - xL) / 2, fhz = (zFront - zBack) / 2;
    const part = gridPart(64, 22, (u, v) => {
      const x = x0 + (x1 - x0) * u, z = z0 + (z1 - z0) * v;
      const d = sdBox(x - fcx, z - fcz, fhx, fhz, 0.02);                // from the set's footprint: under it, d < 0
      const a = Math.exp(-Math.max(d, 0) / GLOW.topScale) * sstep(-0.03, 0.004, d) * (0.4 + 0.6 * sstep(zBack, zFront, z))
        * sstep(-0.012, 0.012, Math.min(x - x0, x1 - x, z - z0, z1 - z));   // eases off toward the top's rounded edges
      return [x, y, z, GLOW.top * a];
    });
    return { ...part, tint: GLOW.wood };
  })();
  // the top's front edge: a band on a plane a hair in front of the cabinet, from the top surface down 3 cm
  const edgePart = (() => {
    const C = anchors.cabinet;
    if (!C) return null;
    const x0 = C.x - C.w / 2 + 0.008, x1 = C.x + C.w / 2 - 0.008, y1 = C.h - 0.0005, y0 = C.h - 0.034, z = C.z + C.d / 2 + 0.004;
    const part = gridPart(70, 6, (u, v) => {
      const x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * v;
      const dx = Math.max(Math.abs(x - S0.x) - S0.w / 2, 0);            // sideways from under the tube
      const a = sstep(y0, C.h - 0.012, y) * Math.exp(-dx / GLOW.edgeScale) * sstep(0, 0.03, Math.min(x - x0, x1 - x));
      return [x, y, z, GLOW.edge * a];
    });
    return { ...part, tint: GLOW.wood };
  })();
  // the light on the wall behind the set
  const wallPart = (() => {
    const zW = (anchors.backWallZ ?? -3) + 0.004, R = GLOW.wallReach;
    const D = anchors.doorway, Wn = anchors.window, H = anchors.size?.h ?? 2.5;
    const xLim0 = D ? D.x + D.w / 2 + 0.03 : xL - R - 1, xLim1 = Wn ? Wn.x - Wn.w / 2 - 0.03 : xR + R + 1;   // the wall's own ends
    const x0 = Math.max(xL - R, xLim0), x1 = Math.min(xR + R, xLim1), y0 = Math.max(T.y - 0.4, 0.12), y1 = Math.min(yTop + R, H - 0.03);
    const ccx = (xL + xR) / 2, ccy = (T.y + yTop) / 2, chx = (xR - xL) / 2, chy = (yTop - T.y) / 2;
    return gridPart(Math.ceil((x1 - x0) / 0.035), Math.ceil((y1 - y0) / 0.035), (u, v) => {
      const x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * v;
      const d = Math.max(sdBox(x - ccx, y - ccy, chx, chy, 0.04), 0);    // from the set's outline
      const a = Math.exp(-d / GLOW.wallScale) * (1 - sstep(0.55 * R, R, d))
        * sstep(xLim0, xLim0 + 0.14, x) * sstep(xLim1, xLim1 - 0.14, x) * sstep(y0, y0 + 0.1, y) * sstep(y1, y1 - 0.1, y);
      return [x, y, zW, a];
    });
  })();
  const glowVert = /* glsl */`
    attribute vec3 ga; uniform sampler2D uProg; uniform float uGain; varying vec3 vC;
    void main() {
      vC = textureLod(uProg, vec2(0.5), 12.0).rgb * (ga * uGain);       // the canvas mean (last mip level) x falloff
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`;
  const glowBase = { transparent: true, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 };
  const addMat = new THREE.ShaderMaterial({
    ...glowBase, uniforms: { uProg: glow.uProg, uGain: { value: 1 } }, blending: THREE.AdditiveBlending, vertexShader: glowVert,
    fragmentShader: /* glsl */`
      varying vec3 vC;
      void main() {
        vec3 c = vC;
        #ifdef QH_GRADE
        c = floor(c * 255.0 + qhRand()) / 255.0;                         // whole code values, rounded up or down by chance
        #endif
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  const mulMat = new THREE.ShaderMaterial({
    ...glowBase, uniforms: { uProg: glow.uProg, uGain: { value: GLOW.wall } }, vertexShader: glowVert, toneMapped: false,
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.DstColorFactor, blendDst: THREE.OneFactor,
    blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor,      // frame x (1 + glow); alpha untouched
    // no dither of its own: it multiplies a wall that the grade has already dithered, which breaks its steps up too
    fragmentShader: 'varying vec3 vC; void main() { gl_FragColor = vec4(clamp(vC, 0.0, 1.0), 1.0); }',
  });
  const glowMesh = (parts2, mat, name) => {
    const m = new THREE.Mesh(glowGeo(parts2.filter(Boolean)), mat);
    m.castShadow = false; m.receiveShadow = false; m.renderOrder = 2; m.name = name;
    group.add(m); return m;
  };

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
  glowMesh([wallPart], mulMat, 'qh-tv-wall-light');
  glowMesh([topPart, edgePart, veilPart], addMat, 'qh-tv-glow');

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

