/* The shaders of the Storm Bell backdrop. They are the game's own (the Godot sources ship inside
   /games/storm-bell/index.pck: stage_layer, stage_floor, toon, outline, emissive, rain), carried over to WebGL
   line for line where that was possible, so the arena is drawn here the way the game draws it. */

// Shared: colour curves, the game's tonemap (filmic, exposure 1.05, white 6, contrast 1.06) and its hash noise.
export const COMMON = /* glsl */ `
vec3 s2l(vec3 c) {
  return mix(pow((c + vec3(0.055)) * (1.0 / 1.055), vec3(2.4)), c * (1.0 / 12.92), vec3(lessThan(c, vec3(0.04045))));
}
vec3 l2s(vec3 c) {
  c = max(c, vec3(0.0));
  return mix(vec3(1.055) * pow(c, vec3(1.0 / 2.4)) - vec3(0.055), c * 12.92, vec3(lessThan(c, vec3(0.0031308))));
}
vec3 filmic(vec3 color) {
  const float A = 0.88, B = 0.60, C = 0.10, D = 0.20, E = 0.01, F = 0.30, W = 6.0;
  vec3 t = ((color * (A * color + C * B) + D * E) / (color * (A * color + B) + D * F)) - E / F;
  float w = ((W * (A * W + C * B) + D * E) / (W * (A * W + B) + D * F)) - E / F;
  return t / w;
}
// scene-linear colour to the screen, as the game's environment does it
vec3 gameOut(vec3 lin) {
  vec3 c = l2s(filmic(max(lin, vec3(0.0)) * 1.05));
  return clamp(mix(vec3(0.5), c, 1.06), 0.0, 1.0);
}
float shash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(shash(i), shash(i + vec2(1.0, 0.0)), u.x), mix(shash(i + vec2(0.0, 1.0)), shash(i + vec2(1.0, 1.0)), u.x), u.y);
}
// World position on a layer's plane to the picture's uv (rect: x_left, y_top, width, height).
vec2 rectUv(vec4 rect, vec2 xy) { return vec2((xy.x - rect.x) / rect.z, (rect.y - xy.y) / rect.w); }
// Past the picture's left or right edge: mirror it (sky, city) or report "outside" (dome, wire).
vec2 wrapU(vec2 uv, float mirror, out float inside) {
  inside = 1.0;
  if (mirror > 0.5) {
    float u = uv.x;
    u = u < 0.0 ? -u : u;
    u = u > 1.0 ? 2.0 - u : u;
    uv.x = clamp(u, 0.0, 1.0);
  } else {
    inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
  }
  return uv;
}
// Lightning on a painted layer: a cool lift, stronger on the bright parts.
vec3 stageFlash(vec3 c, float flash, vec2 fp) {
  float lum = dot(c, vec3(0.299, 0.587, 0.114));
  return c + vec3(0.86, 0.9, 1.0) * flash * (fp.x + fp.y * lum);
}
// A picture stored cropped: whole-picture uv to the stored texture's uv, and whether it falls inside the crop.
vec4 cropTex(sampler2D tex, vec4 crop, vec2 uv, vec2 dx, vec2 dy) {
  vec2 t = (uv - crop.xy) / crop.zw;
  float inC = step(0.0, t.x) * step(t.x, 1.0) * step(0.0, t.y) * step(t.y, 1.0);
  vec4 c = textureGrad(tex, clamp(t, 0.0, 1.0), dx / crop.zw, dy / crop.zw);
  c.rgb = c.a > 0.003 ? c.rgb / c.a : c.rgb;      // stored premultiplied
  c.a *= inC;
  return c;
}
`;

// ---------------------------------------------------------------- the four painted layers
export const LAYER_VERT = /* glsl */ `
uniform vec4 layerRect;
varying vec2 wuv;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  wuv = vec2((wp.x - layerRect.x) / layerRect.z, (layerRect.y - wp.y) / layerRect.w);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

export const LAYER_FRAG = /* glsl */ `
uniform sampler2D map;
uniform vec4 crop;
uniform float mirror, edgeFade, topFade, flash, drift, time, gain, soft;
uniform vec2 flashResponse;
uniform vec3 zenith;
uniform vec4 haze;
varying vec2 wuv;
${COMMON}
const vec3 MOON = vec3(0.309, 0.255, 0.02);
const vec2 DRIFT_SPEED = vec2(0.006, 0.0012);
void main() {
  vec2 dx = dFdx(wuv), dy = dFdy(wuv);
  float inside;
  vec2 uv = wrapU(wuv, mirror, inside);
  // above the painting's top edge the storm goes on: the same clouds, turned over
  if (topFade > 0.5) { inside = 1.0; uv.y = clamp(abs(uv.y), 0.001, 0.999); }
  vec4 c = cropTex(map, crop, uv, dx * soft, dy * soft);
  c.rgb = mix(c.rgb * gain, haze.rgb, haze.a);
  if (drift > 0.0) {
    vec2 dm = (uv - MOON.xy) * vec2(3.5556, 1.0);
    float m = (1.0 - smoothstep(0.2, 0.32, uv.y)) * smoothstep(MOON.z, MOON.z * 2.4, length(dm)) * step(0.0, wuv.y);
    vec2 q = wuv * vec2(7.0, 2.2) - time * DRIFT_SPEED * vec2(7.0, 2.2);
    float n = vnoise(q) * 0.65 + vnoise(q * 2.3 + vec2(5.3, 1.7)) * 0.35;
    c.rgb *= 1.0 + drift * m * (n - 0.5) * 2.0;
  }
  c.rgb = stageFlash(c.rgb, flash, flashResponse);
  if (topFade > 0.5) c.rgb = mix(c.rgb, zenith, smoothstep(-0.16, -0.5, wuv.y));
  float a = c.a * inside;
  if (edgeFade > 0.0) a *= smoothstep(0.0, edgeFade, wuv.x) * smoothstep(1.0, 1.0 - edgeFade, wuv.x);
  vec3 o = gameOut(s2l(c.rgb));
  gl_FragColor = vec4(o * a, a);
}`;

// ---------------------------------------------------------------- the mud floor
export const FLOOR_VERT = /* glsl */ `
varying vec3 wpos;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  wpos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

export const FLOOR_FRAG = /* glsl */ `
uniform sampler2D mudTex, wetTex, skyTex, cityTex, domeTex;
uniform vec4 skyRect, cityRect, domeRect, skyCrop, cityCrop, domeCrop;
uniform vec3 layerZ;
uniform vec4 domeHaze;
uniform float flash, time, detail;
uniform vec2 skyFlash, cityFlash, domeFlash;
uniform vec4 fireA, fireB, fireColor;
uniform vec2 fireFlicker;
uniform vec3 fogColor;
uniform vec4 fogParams;
uniform vec3 floorLight;
uniform vec4 blobA, blobB;       // xz of a standing figure, radius, strength: the soft contact shade under it
varying vec3 wpos;
${COMMON}
const float TILE_M = 3.2, MACRO_M = 13.7, MACRO_AMOUNT = 0.45, MUD_CONTRAST = 0.72, WET_DARKEN = 0.6, WET_REFLECT = 0.38;
const vec3 MUD_MEAN = vec3(0.207, 0.207, 0.209);
const float BLEND_NEAR = 6.0, BLEND_FAR = 16.0;

vec2 planeHit(vec3 cam, vec3 dir, float pz) {
  float t = (pz - cam.z) / min(dir.z, -0.0001);
  return (cam + dir * t).xy;
}
// Rain rings in the puddles: two offset grids of expanding, fading rings; a small xz normal tilt.
vec2 ripples(vec2 p, float t) {
  vec2 acc = vec2(0.0);
  for (int k = 0; k < 2; k++) {
    vec2 q = p * 2.4 + vec2(0.37, 0.71) * float(k);
    vec2 cell = floor(q), f = fract(q);
    float h = shash(cell + float(k) * 19.0);
    vec2 c = vec2(shash(cell + 3.1), shash(cell + 7.7)) * 0.5 + 0.25;
    float ph = fract(t * (0.8 + 0.4 * h) + h * 7.0);
    vec2 d = f - c;
    float r = length(d);
    float band = r - ph * 0.26;
    float ring = exp(-band * band * 1600.0) * (1.0 - ph) * (1.0 - ph);
    acc += (d / max(r, 0.001)) * ring * sin(band * 90.0);
  }
  return acc;
}
void main() {
  vec3 cam = cameraPosition;
  vec3 dir = normalize(wpos - cam);
  float w = smoothstep(BLEND_NEAR, BLEND_FAR, -wpos.z);

  // the far band: exactly what the painted layers show along this ray
  vec2 uv0 = rectUv(skyRect, planeHit(cam, dir, layerZ.x));
  vec2 uv1 = rectUv(cityRect, planeHit(cam, dir, layerZ.y));
  vec2 uv2 = rectUv(domeRect, planeHit(cam, dir, layerZ.z));
  vec2 d0x = dFdx(uv0), d0y = dFdy(uv0), d1x = dFdx(uv1), d1y = dFdy(uv1), d2x = dFdx(uv2), d2y = dFdy(uv2);
  vec3 farLin = vec3(0.0);
  if (w > 0.001) {
    float in0, in1, in2;
    vec2 u0 = wrapU(uv0, 1.0, in0), u1 = wrapU(uv1, 1.0, in1), u2 = wrapU(uv2, 0.0, in2);
    vec3 col = stageFlash(cropTex(skyTex, skyCrop, u0, d0x, d0y).rgb, flash, skyFlash);
    vec4 cc = cropTex(cityTex, cityCrop, u1, d1x, d1y);
    col = mix(col, stageFlash(cc.rgb, flash, cityFlash), cc.a);
    vec4 dc = cropTex(domeTex, domeCrop, clamp(u2, 0.0, 1.0), d2x, d2y);
    col = mix(col, stageFlash(mix(dc.rgb, domeHaze.rgb, domeHaze.a), flash, domeFlash), dc.a * in2);
    farLin = s2l(col);
  }

  // the mud
  vec3 albedoLin = vec3(0.0), emitLin = vec3(0.0);
  if (w < 0.999) {
    vec2 p = wpos.xz;
    vec2 uv = p / TILE_M;
    vec3 mud = mix(MUD_MEAN, texture2D(mudTex, uv).rgb, MUD_CONTRAST);
    vec2 uvm = mat2(0.8, 0.6, -0.6, 0.8) * p / MACRO_M + vec2(0.31, 0.77);
    float macro = dot(texture2D(mudTex, uvm).rgb, vec3(0.3333));
    mud *= mix(1.0, clamp(macro / 0.21, 0.55, 1.6), MACRO_AMOUNT);
    float wet = smoothstep(0.08, 0.6, texture2D(wetTex, uv).r);
    vec3 mudLin = s2l(mud);
    albedoLin = mudLin * mix(1.0, WET_DARKEN, wet);
    if (wet > 0.01) {
      vec3 n = vec3(0.0, 1.0, 0.0);
      vec3 reflLin;
      if (detail > 0.5) {
        vec2 rp = ripples(p, time);
        n = normalize(vec3(rp.x * 0.35, 1.0, rp.y * 0.35));
        vec3 r = reflect(dir, n);
        r.z = min(r.z, -0.02);
        vec2 ru0 = rectUv(skyRect, planeHit(wpos, r, layerZ.x));
        vec2 ru2 = rectUv(domeRect, planeHit(wpos, r, layerZ.z));
        float rin0, rin2;
        vec2 s0 = (wrapU(ru0, 1.0, rin0) - skyCrop.xy) / skyCrop.zw;
        vec3 rc = textureLod(skyTex, clamp(s0, 0.0, 1.0), 3.0).rgb;
        rc = stageFlash(rc, flash, skyFlash);
        vec2 s2 = (wrapU(ru2, 0.0, rin2) - domeCrop.xy) / domeCrop.zw;
        float inC = step(0.0, s2.x) * step(s2.x, 1.0) * step(0.0, s2.y) * step(s2.y, 1.0);
        vec4 rd = textureLod(domeTex, clamp(s2, 0.0, 1.0), 2.0);
        rd.rgb = rd.a > 0.003 ? rd.rgb / rd.a : rd.rgb;
        rc = mix(rc, stageFlash(mix(rd.rgb, domeHaze.rgb, domeHaze.a), flash, domeFlash), rd.a * rin2 * inC);
        reflLin = s2l(rc);
        reflLin += vec3(0.5) * length(rp) * 0.04;
      } else {
        reflLin = s2l(vec3(0.3, 0.3, 0.32) * (1.0 + flash * 1.5));
      }
      float fres = 0.04 + 0.96 * pow(1.0 - clamp(dot(n, -dir), 0.0, 1.0), 5.0);
      emitLin += reflLin * fres * WET_REFLECT * wet;
    }
    // the braziers' warm pools (a faked light)
    float fa = fireA.w > 0.0 ? 1.0 - clamp(length(wpos - fireA.xyz) / fireA.w, 0.0, 1.0) : 0.0;
    float fb = fireB.w > 0.0 ? 1.0 - clamp(length(wpos - fireB.xyz) / fireB.w, 0.0, 1.0) : 0.0;
    float pool = fa * fa * fireFlicker.x + fb * fb * fireFlicker.y;
    emitLin += fireColor.rgb * fireColor.a * pool * (mudLin * 3.0 + 0.004) * (1.0 + wet);
    // contact shade under each figure
    float sh = 1.0;
    sh *= 1.0 - blobA.w * (1.0 - smoothstep(0.0, blobA.z, length((wpos.xz - blobA.xy) * vec2(1.0, 1.9))));
    sh *= 1.0 - blobB.w * (1.0 - smoothstep(0.0, blobB.z, length((wpos.xz - blobB.xy) * vec2(1.0, 1.9))));
    albedoLin *= sh;
    emitLin *= mix(1.0, sh, 0.6);
  }
  float d = length(wpos - cam);
  float fog = fogParams.z * pow(smoothstep(fogParams.x, fogParams.y, d), fogParams.w);
  vec3 mudOut = mix(albedoLin * floorLight * (1.0 + flash * 0.9) + emitLin, fogColor, fog);
  vec3 lin = mudOut * (1.0 - w) + farLin * w;
  gl_FragColor = vec4(gameOut(lin), 1.0);
}`;

// ---------------------------------------------------------------- the fighters and props: the game's cel shading
export const TOON_VERT = /* glsl */ `
#include <common>
#include <skinning_pars_vertex>
uniform float vertexAlbedo;
varying vec3 vN, vW, vAlb;
varying vec2 vUv2;
varying float vRimMask;
void main() {
  #include <beginnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <begin_vertex>
  #include <skinning_vertex>
  vec4 wp = modelMatrix * vec4(transformed, 1.0);
  vW = wp.xyz;
  vN = normalize(mat3(modelMatrix) * objectNormal);
  vUv2 = uv;
  #ifdef USE_COLOR_ALPHA
    vRimMask = color.a;
    vAlb = mix(vec3(1.0), color.rgb, vertexAlbedo);
  #else
    vRimMask = 1.0;
    vAlb = vec3(1.0);
  #endif
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

export const TOON_FRAG = /* glsl */ `
uniform vec3 albedo;
uniform sampler2D map;
uniform float useMap;
uniform float bandMid, rimStrength, rimLightStrength, backLightDiffuse;
uniform float specStrength, specShininess, specThreshold;
uniform vec3 rimColor;
uniform vec3 lightDir[3];        // towards each light
uniform vec3 lightColor[3];      // linear colour times energy
uniform vec3 lightSpec;          // each light's share of specular
uniform vec3 ambient;
uniform vec4 firePos;            // xyz, range
uniform vec3 fireCol;            // linear colour times energy (flickered)
uniform float flash;             // lightning
varying vec3 vN, vW, vAlb;
varying vec2 vUv2;
varying float vRimMask;
${COMMON}
float band(float edge, float soft, float x) { return smoothstep(edge - soft, edge + soft, x); }
void shade(vec3 L, vec3 lc, float att, float specAmt, vec3 N, vec3 V, inout vec3 diff, inout vec3 spec) {
  float ndl = dot(N, L);
  float lit = ndl * att;
  float ramp = bandMid * band(0.02, 0.025, lit) + (1.0 - bandMid) * band(0.42, 0.025, lit);
  float backness = smoothstep(-0.25, 0.45, dot(L, -V));
  diff += lc * ramp * mix(1.0, backLightDiffuse, backness);
  if (specStrength > 0.0) {
    vec3 h = normalize(L + V);
    float sp = pow(max(dot(N, h), 0.0), specShininess);
    spec += lc * band(specThreshold, 0.03, sp) * step(0.0, ndl) * att * specAmt * specStrength;
  }
  float fres = 1.0 - clamp(dot(N, V), 0.0, 1.0);
  float rim = band(0.66 - 0.08, 0.035, fres) * smoothstep(-0.2, 0.25, ndl);
  spec += lc * rim * backness * rimLightStrength * vRimMask;
}
void main() {
  vec3 N = normalize(gl_FrontFacing ? vN : -vN);
  vec3 V = normalize(cameraPosition - vW);
  // the game multiplies colour, picture and vertex paint as authored (screen values), then lights the result
  vec3 baseS = l2s(albedo) * vAlb;
  if (useMap > 0.5) baseS *= texture2D(map, vUv2).rgb;
  vec3 base = s2l(baseS);
  vec3 diff = vec3(0.0), spec = vec3(0.0);
  for (int i = 0; i < 3; i++) shade(lightDir[i], lightColor[i], 1.0, lightSpec[i], N, V, diff, spec);
  // the brazier: an omni light with the game's range and falloff
  vec3 toF = firePos.xyz - vW;
  float fd = length(toF);
  float nd = fd / firePos.w; nd *= nd; nd *= nd; nd = max(1.0 - nd, 0.0); nd *= nd;
  shade(toF / max(fd, 0.001), fireCol, nd * pow(max(fd, 0.0001), -1.4), 0.5, N, V, diff, spec);
  // lightning: a cold wash from above
  shade(normalize(vec3(0.1, 0.85, -0.5)), vec3(0.69, 0.73, 0.82) * 2.4 * flash, 1.0, 0.0, N, V, diff, spec);
  float fres = 1.0 - clamp(dot(N, V), 0.0, 1.0);
  float rim = band(0.66, 0.035, fres);
  vec2 sn = (viewMatrix * vec4(N, 0.0)).xy;
  float sl = length(sn);
  float side = sl > 0.0001 ? (sn / sl).y : 0.0;
  float mask = mix(1.0, smoothstep(-0.15, 0.55, side), 0.55);
  vec3 glow = s2l(baseS * vec3(0.3, 0.3, 0.35) + rimColor * rim * mask * rimStrength * vRimMask);
  vec3 lin = base * (diff + ambient * (1.0 + flash * 2.0)) + spec + glow;
  gl_FragColor = vec4(gameOut(lin), 1.0);
}`;

// The inverted hull: the ink line round every figure, a fixed number of pixels wide.
export const OUTLINE_VERT = /* glsl */ `
#include <common>
#include <skinning_pars_vertex>
uniform float widthPx, viewH, maxWorld;
void main() {
  #include <beginnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <begin_vertex>
  #include <skinning_vertex>
  vec4 vp = modelViewMatrix * vec4(transformed, 1.0);
  vec3 vn = normalize(mat3(modelViewMatrix) * objectNormal);
  float px = widthPx * (viewH / 1080.0);
  float depth = max(-vp.z, 0.001);
  float worldPerPx = 2.0 * depth / (abs(projectionMatrix[1][1]) * viewH);
  float grow = min(px * worldPerPx, maxWorld);
  vp.xyz += vn * grow;
  vp.xyz += normalize(vp.xyz) * grow * 0.5;
  gl_Position = projectionMatrix * vp;
}`;

export const OUTLINE_FRAG = /* glsl */ `
uniform vec3 ink;
void main() { gl_FragColor = vec4(ink, 1.0); }`;

// Unshaded glow: eye embers, glowing blood, the fires.
export const EMIT_VERT = /* glsl */ `
#include <common>
#include <skinning_pars_vertex>
varying vec2 vUv2;
void main() {
  #include <begin_vertex>
  #include <skinbase_vertex>
  #include <skinning_vertex>
  vUv2 = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}`;

export const EMIT_FRAG = /* glsl */ `
uniform vec3 color;
uniform float energy, pulse, phase, time, flame;
varying vec2 vUv2;
${COMMON}
vec3 flameRamp(float t) {
  vec3 c = mix(vec3(0.227, 0.039, 0.047), vec3(0.431, 0.078, 0.125), smoothstep(0.0, 0.35, t));
  c = mix(c, vec3(0.690, 0.118, 0.180), smoothstep(0.35, 0.62, t));
  c = mix(c, vec3(1.0, 0.278, 0.341), smoothstep(0.62, 0.86, t));
  c = mix(c, vec3(0.929, 0.918, 0.894), smoothstep(0.95, 1.0, t));
  return s2l(c);
}
void main() {
  vec3 c = flame > 0.5 ? flameRamp(vUv2.y) : color;
  float breathe = 1.0 - pulse * (0.5 + 0.5 * sin(time * 2.2 + phase));
  gl_FragColor = vec4(gameOut(c * energy * breathe), 1.0);
}`;

// ---------------------------------------------------------------- the rain: slanted streaks on a sheet that rides with the camera
export const RAIN_VERT = /* glsl */ `
varying vec2 vUv2;
void main() { vUv2 = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

export const RAIN_FRAG = /* glsl */ `
uniform float phase, aspect, density, speed, wind, columns, streak, thicknessPx, alpha, seed;
uniform vec2 scroll;
uniform vec3 color;
varying vec2 vUv2;
float h2(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float rainLayer(vec2 uv, float cols, float spd, float len, float s) {
  vec2 grid = vec2(cols, cols * 0.28);
  vec2 g = uv * grid;
  g.x += g.y * wind * grid.x / grid.y;
  g.y -= phase * spd * grid.y;
  vec2 cell = floor(g), f = fract(g);
  float present = step(h2(cell + s), density);
  float x0 = 0.2 + 0.6 * h2(cell + s + 3.17);
  float y0 = h2(cell + s + 7.71);
  float px = fwidth(g.x) + 0.0001;
  float ax = 1.0 - smoothstep(thicknessPx * px * 0.5, thicknessPx * px, abs(f.x - x0));
  float dy = fract(f.y - y0);
  float ay = step(dy, len) * (0.35 + 0.65 * dy / len);
  return ax * ay * present;
}
void main() {
  vec2 uv = vec2(vUv2.x * aspect, 1.0 - vUv2.y) + scroll;
  float a = rainLayer(uv, columns, 1.9 * speed, streak, seed);
  a = max(a, 0.6 * rainLayer(uv * 1.7 + vec2(0.37, 0.11), columns, 1.4 * speed, streak * 0.8, seed + 19.0));
  a *= alpha;
  if (a < 0.004) discard;
  gl_FragColor = vec4(color * a, a);
}`;

// ---------------------------------------------------------------- the last sheet over everything: grain and a soft dark frame
export const GRADE_VERT = /* glsl */ `
varying vec2 vUv2;
void main() { vUv2 = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

export const GRADE_FRAG = /* glsl */ `
uniform float time, grain, vignette, aspect;
uniform vec2 res;
varying vec2 vUv2;
float h2(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
void main() {
  // drawn with a doubling multiply: 0.5 leaves the picture as it is
  vec2 px = floor(vUv2 * res);
  float t = floor(time * 24.0);
  float n = h2(px + vec2(t * 17.0, t * 29.0)) + h2(px * 1.7 + vec2(t * 7.0, -t * 13.0)) - 1.0;
  vec2 q = (vUv2 - 0.5) * vec2(min(aspect, 1.6) / 1.6, 1.0);
  float v = smoothstep(0.38, 0.95, length(q));
  float k = 0.5 + n * grain - v * vignette;
  gl_FragColor = vec4(vec3(k), 1.0);
}`;

// ---------------------------------------------------------------- shadows on the mud: each figure pressed flat along the moonlight
export const SHADOW_VERT = /* glsl */ `
#include <common>
#include <skinning_pars_vertex>
uniform vec3 lightTravel;
void main() {
  #include <begin_vertex>
  #include <skinbase_vertex>
  #include <skinning_vertex>
  vec4 wp = modelMatrix * vec4(transformed, 1.0);
  float k = max(wp.y, 0.0) / -lightTravel.y;
  wp.xz += lightTravel.xz * k;
  wp.y = 0.012;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

export const SHADOW_FRAG = /* glsl */ `
uniform float strength;
void main() { gl_FragColor = vec4(0.0, 0.0, 0.0, strength); }`;

// ---------------------------------------------------------------- lightning: the bolt and the glow at its head
export const BOLT_VERT = /* glsl */ `
attribute float side;
varying float vSide;
void main() { vSide = side; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

export const BOLT_FRAG = /* glsl */ `
uniform float level;
varying float vSide;
void main() {
  float core = 1.0 - smoothstep(0.0, 0.35, abs(vSide));
  float edge = 1.0 - smoothstep(0.3, 1.0, abs(vSide));
  vec3 c = mix(vec3(0.867, 0.886, 0.925), vec3(1.0, 0.973, 0.949), core);
  float a = edge * level;
  gl_FragColor = vec4(c * a, a * 0.7);
}`;

export const GLOW_VERT = /* glsl */ `
varying vec2 vUv2;
void main() {
  vUv2 = uv;
  vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  vec2 sc = vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
  mv.xy += position.xy * sc;
  gl_Position = projectionMatrix * mv;
}`;

export const GLOW_FRAG = /* glsl */ `
uniform vec3 color;
uniform float level, falloff, cover;
varying vec2 vUv2;
void main() {
  // cover 0: light added to the picture. cover towards 1: the colour laid over it, so that a red glow over grey
  // stays red and does not turn pink
  float r = length(vUv2 - 0.5) * 2.0;
  float g = pow(max(1.0 - r, 0.0), falloff) * level;
  gl_FragColor = vec4(color * g, g * cover);
}`;

// ---------------------------------------------------------------- rain meeting the mud: small crowns that open and fade
export const SPLASH_VERT = /* glsl */ `
attribute float seed;
uniform float time, pxPerM;
uniform vec3 centre, extent;
varying float vLife;
float h1(float n) { return fract(sin(n * 12.9898 + 4.1414) * 43758.5453); }
void main() {
  float life = 0.22 + 0.1 * h1(seed * 3.1);
  float u = time / life + seed * 17.0;
  float cyc = floor(u);
  vLife = fract(u);
  vec3 p = centre + vec3((h1(cyc * 0.731 + seed * 91.7) - 0.5) * 2.0 * extent.x, 0.02, (h1(cyc * 1.177 + seed * 47.3) - 0.5) * 2.0 * extent.z);
  vec4 mv = viewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float size = mix(0.05, 0.1, h1(seed * 7.7)) * mix(0.3, 1.15, sqrt(vLife));
  gl_PointSize = max(1.0, size * pxPerM / max(-mv.z, 0.1));
}`;

export const SPLASH_FRAG = /* glsl */ `
varying float vLife;
void main() {
  vec2 q = gl_PointCoord * 2.0 - 1.0;
  q.y = q.y * 2.6 + 1.0;                     // a flat crown, seen from the side: only its upper rim shows
  float r = length(q);
  float ring = smoothstep(0.45, 0.8, r) * (1.0 - smoothstep(0.8, 1.0, r)) * smoothstep(0.75, 0.2, q.y);
  float a = ring * 0.3 * (1.0 - vLife);
  if (a < 0.01) discard;
  gl_FragColor = vec4(vec3(0.93, 0.918, 0.894) * a, a);
}`;
