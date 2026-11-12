// The page's GLSL. Three ideas carry the look: cast glass with five states (SPEC 3.4), a studio ground that
// works out coloured shadows and reflections analytically (no shadow maps, no post), and one iris test that
// every material shares, so a world opens out of the studio with no render target (SPEC 4.4).
// materials.js owns the uniforms these read.

// Shared by every fragment shader: the iris, lights out, and a dither for soft edges on opaque things.
export const COMMON = /* glsl */ `
uniform vec4 uIris;      // xy centre in buffer pixels, z radius (0 closed, 9 and over fully open), w 1 / half the buffer height
uniform vec3 uIrisTint;  // the world's colour: the bright band at the iris edge
uniform float uTime;
uniform vec4 uDark;      // x lights-out sweep 0..1, y world x of the room, z glow radius, w glow amount
uniform vec3 uGlowPos;
uniform vec3 uGlowCol;
float ign(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  float a = fract(sin(dot(i, vec2(127.1, 311.7))) * 43758.5453), b = fract(sin(dot(i + vec2(1.0, 0.0), vec2(127.1, 311.7))) * 43758.5453);
  float c = fract(sin(dot(i + vec2(0.0, 1.0), vec2(127.1, 311.7))) * 43758.5453), d = fract(sin(dot(i + vec2(1.0, 1.0), vec2(127.1, 311.7))) * 43758.5453);
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
// x: 1 inside the iris, 0 outside, soft over about eight pixels. y: the thin bright band on its edge.
vec2 irisAt() {
  if (uIris.z <= 0.0) return vec2(0.0);
  if (uIris.z >= 9.0) return vec2(1.0, 0.0);
  vec2 q = (gl_FragCoord.xy - uIris.xy) * uIris.w;
  float r = length(q) / 1.2 + 0.12 * vnoise(q * 3.0 - uTime * 0.05);
  float w = 6.0 * uIris.w;
  float inside = 1.0 - smoothstep(uIris.z - w, uIris.z + w, r);
  float band = smoothstep(uIris.z - 0.045, uIris.z - 0.012, r) * inside;
  return vec2(inside, band);
}
// side 1: drawn only inside the iris. side -1: only outside. side 0: always. Returns what to keep, 0..1.
float irisKeep(float side, out float band) {
  band = 0.0;
  if (abs(side) < 0.5) return 1.0;
  vec2 ib = irisAt();
  band = side > 0.0 ? ib.y : 0.0;
  return side > 0.0 ? ib.x : 1.0 - ib.x;
}
// lights out: a falloff that sweeps the room from left to right, then colour blooming from one point
float darkAt(vec3 w) { return uDark.x <= 0.0 ? 0.0 : smoothstep(0.0, 1.0, (uDark.x * 84.0 - (clamp(w.x - uDark.y, -34.0, 42.0) + 34.0)) / 8.0); }
vec3 glowAt(vec3 w) {
  float r = max(uDark.z, 0.001), d = distance(w, uGlowPos);
  return uGlowCol * uDark.w / (1.0 + (d * d) / (r * r) * 2.0);
}
`;

export const worldVert = /* glsl */ `
varying vec3 vN; varying vec3 vW; varying vec3 vO; varying vec2 vUv;
void main() {
  vO = position; vUv = uv;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

// Cast glass. uHatch, uFrost and uAlpha make the five states with the outline that stack.js draws.
export const glassFrag = /* glsl */ `${COMMON}
uniform vec3 uColor; uniform vec3 uRim; uniform vec3 uHot; uniform vec3 uPaper; uniform vec3 uLight;
uniform vec4 uHatchCol;  // the second tone of the hatching. a 0: the gap is see-through. a 1: it is painted
uniform vec3 uP0; uniform vec3 uP1; uniform vec3 uP2; uniform vec3 uP3;
uniform float uAlpha; uniform float uHatch; uniform float uFrost; uniform float uPulse; uniform float uDim;
uniform float uHalfH; uniform float uSide; uniform float uPrism; uniform float uShow;
varying vec3 vN; varying vec3 vW; varying vec3 vO;

void main() {
  float band;
  float keep = irisKeep(uSide, band) * uShow;
  if (keep < 0.004) discard;
  vec3 N = normalize(vN);
  bool front = gl_FrontFacing;
  if (!front) N = -N;
  vec3 V = normalize(cameraPosition - vW);
  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);
  float top = smoothstep(0.75, 0.97, N.y);
  float chamfer = smoothstep(0.35, 0.6, abs(N.y)) * (1.0 - smoothstep(0.8, 0.95, abs(N.y)));

  vec3 base = uColor;
  if (uPrism > 0.5) {
    float t = clamp(vO.x / 2.4 + 0.5 + vO.z * 0.06, 0.0, 1.0) * 3.0;
    base = t < 1.0 ? mix(uP0, uP1, t) : t < 2.0 ? mix(uP1, uP2, t - 1.0) : mix(uP2, uP3, t - 2.0);
  }
  // light passes through the block, so faces turned from the lamp still glow
  float wrap = dot(N, normalize(uLight)) * 0.5 + 0.5;
  vec3 col = mix(base * vec3(0.58, 0.6, 0.66), base, smoothstep(0.1, 0.9, wrap));
  col = mix(col, mix(base, vec3(1.0), 0.1), top);
  float e = min(abs(vO.y) / uHalfH, 1.0);
  col += base * pow(e, 10.0) * 0.3 * (1.0 - top);

  vec3 R = reflect(-V, N);
  float strip = (1.0 - smoothstep(0.0, 0.16, abs(R.x + 0.22 + R.z * 0.2))) * (1.0 - top);
  float sky = smoothstep(0.2, 0.9, R.y) * (1.0 - top);
  float edge = clamp(fres * 0.55 + chamfer * 0.6, 0.0, 1.0);
  float a = uAlpha;
  if (front) {
    col = mix(col, uRim, edge * 0.8);             // the rim carries the edge: white on black glass, ink on milk glass
    col += vec3(1.0) * (strip * 0.2 + sky * 0.08) * (1.0 - uFrost) * (0.35 + 0.65 * dot(uRim, vec3(0.333)));
    a = mix(a, 1.0, clamp(fres * 0.8 + chamfer * 0.5, 0.0, 1.0));
  } else {
    col = mix(base * 0.55, base, 0.25 + 0.25 * top);
    a *= 0.62;
  }

  // hatched glass: preview or announced. Bands at 45 degrees, the gaps in a second tone
  float s = fract((vO.x + vO.y * 1.15 + vO.z) * 4.6);
  float gap = (1.0 - smoothstep(0.0, 0.07, s) * (1.0 - smoothstep(0.5, 0.57, s))) * uHatch;
  col = mix(col, uHatchCol.rgb, gap * uHatchCol.a);
  a *= mix(1.0, mix(0.14, 0.92, uHatchCol.a), gap);

  // frosted glass: it exists and the maker has not said what it is. Milky, matte, nothing shows through
  vec3 milk = mix(base, uPaper * 1.04 + 0.02, 0.7) + (ign(gl_FragCoord.xy) - 0.5) * 0.04;
  col = mix(col, milk * mix(0.84, 1.0, wrap) + chamfer * 0.05, uFrost);
  a = mix(a, 0.97, uFrost);

  float n = darkAt(vW);
  if (n > 0.0) {
    vec3 g = glowAt(vW);
    // in the dark a stack is its rim and whatever the room's colour catches on it. A frosted floor glows through
    vec3 night = base * 0.05 + uRim * (fres * fres * 0.35 + chamfer * 0.55 + pow(e, 8.0) * 0.16) * (1.0 - top * 0.8) + g * (0.03 + 0.08 * top + fres * 0.25);
    night = mix(night, uGlowCol * uDark.w * 0.85 + vec3(0.04), uFrost * 0.85);
    col = mix(col, night, n);
    a = mix(a, max(a, 0.92), n);
  }
  // a request passing through lights the floor. Dimmed floors fade toward the paper behind them
  col = mix(col, uHot, uPulse * 0.75);
  a = mix(a, 1.0, uPulse * 0.7);
  col = mix(col, mix(uPaper * 0.97, uPaper * 1.6 + 0.02, n), uDim * 0.9);
  a *= mix(1.0, 0.5, uDim);
  col += uIrisTint * band * 1.5;
  gl_FragColor = vec4(col, a * keep);
  #include <colorspace_fragment>
}`;

// Solid things inside the glass: model cores, lamps. uHatch 1 hatches it (announced). uFade under 1 makes it a
// ghost seen through frosted glass (the material is then blended and drawn over the floor).
export const coreFrag = /* glsl */ `${COMMON}
uniform vec3 uColor; uniform vec3 uRim; uniform vec3 uLight;
uniform float uActive; uniform float uShow; uniform float uSide; uniform float uHatch; uniform float uFade;
varying vec3 vN; varying vec3 vW; varying vec3 vO;
void main() {
  float band;
  float keep = irisKeep(uSide, band) * uShow;
  if (keep < 0.02) discard;
  vec3 N = normalize(vN);
  vec3 V = normalize(cameraPosition - vW);
  float wrap = dot(N, normalize(uLight)) * 0.5 + 0.5;
  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 2.5);
  vec3 col = uColor * mix(0.62, 1.05, wrap) + uRim * fres * 0.4;
  float s = fract((vO.x + vO.y + vO.z) * 14.0);
  if (uHatch > 0.5 && s > 0.5) col = mix(col, vec3(0.93), 0.82);
  vec3 hot = mix(uColor, uRim, 0.3) * 1.25 + 0.08;
  col = mix(col, hot, uActive);
  float n = darkAt(vW);
  vec3 night = uColor * (0.3 + uActive * 1.5) + uRim * fres * (0.5 + uActive) + vec3(0.02);
  col = mix(col, night, n);
  gl_FragColor = vec4(col, uFade * min(1.0, keep * 1.5));
  #include <colorspace_fragment>
}`;

// Paper: the plate, the portrait, props and cut-out characters. Unlit, and lit only by lights out.
// uMode 1 reads the texture as an ink mask (titles, glyphs) and prints it in uTint.
export const paperFrag = /* glsl */ `${COMMON}
uniform sampler2D uMap; uniform vec3 uTint; uniform vec3 uGround;
uniform float uSide; uniform float uOpacity; uniform float uFade; uniform float uMode; uniform float uDither;
varying vec3 vW; varying vec2 vUv;
void main() {
  float band;
  float keep = irisKeep(uSide, band);
  vec4 t = texture2D(uMap, vUv);
  float a = (uMode > 0.5 ? t.r : t.a) * uOpacity;
  vec3 col = uMode > 0.5 ? uTint : t.rgb * uTint;
  // opaque paper is alpha tested and dithers at the iris edge. Blended paper (cut-outs, type) keeps soft edges
  if (uDither > 0.5) { if (a < 0.2 || keep < ign(gl_FragCoord.xy) * 0.98 + 0.01) discard; a = 1.0; }
  else { a *= keep; if (a < 0.004) discard; }
  col = mix(col, uGround, uFade);
  float n = darkAt(vW);
  if (n > 0.0) col = mix(col, col * (vec3(0.03, 0.034, 0.044) + glowAt(vW) * 1.05), n);
  col += uIrisTint * band * 1.5;
  gl_FragColor = vec4(col, a);
  #include <colorspace_fragment>
}`;

// The studio floor. Each caster throws a coloured shadow along the lamp direction, softer the further it falls
// and cut into stripes when the floors are pulled apart, and is mirrored faintly in the polish.
export const groundFrag = /* glsl */ `${COMMON}
#define N_T 8
uniform vec3 uNear; uniform vec3 uFar; uniform vec3 uInkColor; uniform vec3 uLight; uniform vec3 uWorld;
uniform sampler2D uInk; uniform vec4 uInkRect; uniform float uInkAmt; uniform float uFloorH; uniform float uHalf;
uniform vec2 uTPos[N_T]; uniform vec3 uTCol[N_T]; uniform float uTH[N_T]; uniform float uTGap[N_T];
uniform float uTAmt[N_T]; uniform float uTIn[N_T];
varying vec3 vW;
void main() {
  vec2 P = vW.xz;
  vec2 ib = irisAt();
  float dist = length(P - cameraPosition.xz * 0.15);
  vec3 base = mix(mix(uNear, uFar, smoothstep(4.0, 34.0, dist)), uWorld, ib.x);
  vec3 lit = vec3(1.0);
  vec2 S = -uLight.xz / max(uLight.y, 0.1);
  vec3 Vd = normalize(vW - cameraPosition);
  vec3 Rr = reflect(Vd, vec3(0.0, 1.0, 0.0));
  float F = 0.05 + 0.5 * pow(1.0 - clamp(Rr.y, 0.0, 1.0), 4.0);
  vec3 refl = vec3(0.0); float reflA = 0.0;
  for (int i = 0; i < N_T; i++) {
    float amt = uTAmt[i] * mix(1.0, uTIn[i], ib.x);
    if (amt < 0.004) continue;
    vec2 T = uTPos[i];
    vec2 Sv = S * uTH[i];
    float t = clamp(dot(P - T, Sv) / max(dot(Sv, Sv), 1e-4), 0.0, 1.0);
    float d = length(P - (T + Sv * t));
    float pen = mix(0.1, 0.9, t);
    float I = 1.0 - smoothstep(uHalf - pen * 0.4, uHalf + pen, d);
    float cell = uFloorH + uTGap[i];
    float f = mod(t * uTH[i], cell);
    float edge = mix(0.03, 0.14, t);
    float slab = smoothstep(0.0, edge, f) * (1.0 - smoothstep(uFloorH - edge, uFloorH, f));
    float gapVis = smoothstep(0.05, 0.2, uTGap[i]);
    I *= mix(1.0, slab, gapVis) * amt * (1.0 - t * 0.4);
    lit *= mix(vec3(1.0), uTCol[i] * 0.9 + 0.06, I * 0.86);
    lit *= 1.0 - (1.0 - smoothstep(uHalf * 0.7, uHalf * 1.9, length(P - T))) * 0.14 * amt;
    // a polished floor: mirror the view ray and see whether it meets this caster
    vec2 o = P - T;
    float tb = -dot(o, Rr.xz) / max(dot(Rr.xz, Rr.xz), 1e-5);
    float hy = Rr.y * tb;
    float m = (1.0 - smoothstep(uHalf * 0.72, uHalf * 1.08, length(o + Rr.xz * tb))) * step(0.0, tb) * (1.0 - smoothstep(uTH[i] * 0.55, uTH[i], hy));
    float fy = mod(hy, cell);
    m *= mix(1.0, smoothstep(0.0, 0.05, fy) * (1.0 - smoothstep(uFloorH - 0.05, uFloorH, fy)), gapVis);
    refl += (uTCol[i] * 0.85 + 0.1) * m * amt;
    reflA += m * amt;
  }
  vec3 day = base * lit;
  day = mix(day, refl / max(reflA, 1e-3), clamp(reflA, 0.0, 1.0) * F);
  vec2 uv = (P - uInkRect.xy) / uInkRect.zw;
  float ink = 0.0;
  if (uInkAmt > 0.0 && uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0) ink = texture2D(uInk, uv, -0.8).r * (1.0 - ib.x);
  day = mix(day, uInkColor * (lit * 0.6 + 0.4), ink * uInkAmt);
  float n = darkAt(vW);
  vec3 night = vec3(0.0030, 0.0036, 0.0050) + glowAt(vW) * (base * 0.75 + 0.05) + refl * F * 0.4 * (0.2 + dot(glowAt(vW), vec3(0.4)));
  vec3 col = mix(day, night, n) + uIrisTint * ib.y * 1.5;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
  // a grain of noise so the long studio gradient never bands
  gl_FragColor.rgb += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0 * 1.6;
}`;

// The cyclorama: the paper wall the ground curves up into, with 3 percent grain.
export const cycFrag = /* glsl */ `${COMMON}
uniform vec3 uFar; uniform vec3 uTop; uniform vec3 uWorld;
varying vec3 vW;
void main() {
  vec2 ib = irisAt();
  vec3 col = mix(mix(uFar, uTop, smoothstep(0.0, 26.0, vW.y)), uWorld * 0.985, ib.x);
  col *= 1.0 + (ign(gl_FragCoord.xy) - 0.5) * 0.03;
  float n = darkAt(vW);
  col = mix(col, vec3(0.0030, 0.0036, 0.0050) + glowAt(vW) * col * 0.5, n);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

// The glossy sphere with two eye slits (the xAI character). uLook is where the eyes point, in its own space.
export const orbVert = /* glsl */ `
varying vec3 vN; varying vec3 vW; varying vec3 vL;
void main() {
  vL = normalize(position);
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
}`;
export const orbFrag = /* glsl */ `${COMMON}
uniform vec3 uLook; uniform vec3 uLight; uniform vec3 uBody; uniform float uBlink; uniform float uSide;
varying vec3 vN; varying vec3 vW; varying vec3 vL;
float slit(vec2 q, float len) {      // the distance to an eye slit of half length len
  q = vec2(q.x * 0.993 + q.y * 0.12, q.y * 0.993 - q.x * 0.12);
  q.y = max(abs(q.y) - len, 0.0);
  return length(q);
}
void main() {
  float band;
  float keep = irisKeep(uSide, band);
  if (keep < ign(gl_FragCoord.xy) * 0.98 + 0.01) discard;
  vec3 N = normalize(vN);
  vec3 V = normalize(cameraPosition - vW);
  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 2.6);
  vec3 R = reflect(-V, N);
  vec3 f = normalize(uLook);
  vec3 r = normalize(cross(vec3(0.0, 1.0, 0.0), f));
  vec3 u = cross(f, r);
  vec3 n = normalize(vL);
  vec2 p = vec2(dot(n, r), dot(n, u));
  float front = step(0.0, dot(n, f));
  float d = min(slit(p - vec2(-0.2, 0.1), 0.115 * uBlink), slit(p - vec2(0.2, 0.1), 0.115 * uBlink));
  float eyes = (1.0 - smoothstep(0.046, 0.058, d)) * front;
  // the gloss sits high on the sphere and keeps off the eyes wherever they look: white on white reads as a smudge
  float clear = mix(1.0, smoothstep(0.07, 0.2, d), front);
  float key = smoothstep(0.95, 0.995, dot(R, normalize(uLight + vec3(-0.35, 1.5, 0.0)))) * clear;
  float soft = smoothstep(0.3, 1.0, dot(R, normalize(uLight))) * 0.06;
  float strip = (1.0 - smoothstep(0.0, 0.07, abs(R.y - 0.5 + R.x * 0.25))) * smoothstep(0.1, 0.7, -R.x) * 0.2 * clear;
  vec3 col = uBody + vec3(1.0) * (key * 0.9 + soft + strip + fres * 0.34);
  col = mix(col, vec3(0.97), clamp(eyes, 0.0, 1.0));
  float dk = darkAt(vW);
  vec3 night = vec3(0.004) + vec3(1.0) * fres * 0.85 + glowAt(vW) * (0.02 + fres * 0.5) + vec3(0.97) * clamp(eyes, 0.0, 1.0);
  col = mix(col, night, dk);
  gl_FragColor = vec4(col + uIrisTint * band, 1.0);
  #include <colorspace_fragment>
}`;

// Dust: a few hundred slow motes in the world's light colour.
export const dustVert = /* glsl */ `
attribute float aPh; uniform float uTime; uniform float uPx; uniform float uDrift;
varying float vA;
void main() {
  vec3 p = position;
  p.x += sin(uTime * 0.11 + aPh * 3.0) * 0.9 * uDrift;
  p.y += sin(uTime * 0.17 + aPh) * 0.6 * uDrift;
  p.z += cos(uTime * 0.09 + aPh * 2.0) * 0.7 * uDrift;
  vec4 mv = viewMatrix * modelMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  vA = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(uTime * (0.6 + fract(aPh) * 1.3) + aPh * 9.0), 3.0);
  gl_PointSize = uPx * (0.6 + fract(aPh * 7.0)) / max(-mv.z, 0.5);
}`;
export const dustFrag = /* glsl */ `${COMMON}
uniform vec3 uColor; uniform float uOpacity;
varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  float keep = irisAt().x;
  gl_FragColor = vec4(uColor, a * a * vA * uOpacity * keep * (1.0 - uDark.x * 0.6));
  #include <colorspace_fragment>
}`;
