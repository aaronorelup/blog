// The homepage tea house's colours and light (copied from src/scripts/home/scene/palette.js, trimmed to what this
// page needs). P is the palette the world is built from, lerped in place between DAY (mix 0) and NIGHT (mix 1).
// This page builds the world once, at night.
import { AmbientLight, Color, DirectionalLight, HemisphereLight } from 'three';

export const P = {
  cream: 0xFBF3E8, skyTop: 0x6FB4E8, skyLow: 0xCDE9F7, cloud: 0xFFFFFF, cloudLow: 0xE4EEF6,
  wall: 0xF0A6B8, wallDeep: 0xE8909F, shoji: 0xF6DFA8, shojiLit: 0xFCEFC4,
  wood: 0xC4874F, woodDark: 0x9A5F36, beam: 0xB2703F, tatami: 0xE8C98A,
  grass: 0x9DB863, grassDark: 0x7E9A4A, leaf: 0x8FAE55, leafDark: 0x6E8B3D,
  trunk: 0xB4643C, stone: 0xCBC0AE, clay: 0x7A5B52, tea: 0xE08A5F,
  vermilion: 0xC2603F, ink: 0x3A3A42, petal: 0xF7B7C8, paper: 0xF3E7D2,
  hillNear: 0x8FA96E, hillMid: 0x9BB07A, hillFar: 0xA8BA86, hillBack: 0x6E8B3D,
  roof: 0x9BA1B8, roofRidge: 0x848AA3, cushion: 0x6E7A9B, tataki: 0x9C8B78,
  mtnNear: 0x5C6B8A, mtnFar: 0x7B89A6,
  lampPaper: 0xEFE2C2, lampGlow: 0xF4EAD0, flame: 0xE9DCB4,
  shojiEmis: 0x000000, shojiLitEmis: 0x000000,
};

const DAY = { ...P };

// night: moonlit outside, lantern-lit paper inside; the shoji become the light source
const NIGHT = {
  cream: 0x151726, skyTop: 0x0B1030, skyLow: 0x2A3157, cloud: 0x39406B, cloudLow: 0x272E52,
  wall: 0x6B4453, wallDeep: 0x573746, shoji: 0x424A66, shojiLit: 0x4E5678,
  wood: 0x5B3A26, woodDark: 0x3F2918, beam: 0x4E3120, tatami: 0x7C6647,
  grass: 0x31453C, grassDark: 0x25352D, leaf: 0x3B4E38, leafDark: 0x2C3B29,
  trunk: 0x492E20, stone: 0x565B63, clay: 0x3A2C29, tea: 0x8B4C34,
  vermilion: 0x803D2C, ink: 0x0E1019, petal: 0xCE8CA4, paper: 0xC7B28D,
  hillNear: 0x243043, hillMid: 0x2A3550, hillFar: 0x33405E, hillBack: 0x1C2637,
  roof: 0x363E56, roofRidge: 0x2C3346, cushion: 0x39425F, tataki: 0x4A4038,
  mtnNear: 0x39435C, mtnFar: 0x4A5670,
  lampPaper: 0xFFD892, lampGlow: 0xFFF0C8, flame: 0xFFE6A8,
  shojiEmis: 0x8A5E28, shojiLitEmis: 0xA0703A,
};

const RIG = {
  amb:  { day: { c: 0xFFFFFF, i: 1.5 },  night: { c: 0xA8B4E4, i: 0.34 } },
  hemi: { day: { c: 0xFFF6EA, g: 0xF2DFC6, i: 1.1 }, night: { c: 0x8C9FDC, g: 0x232839, i: 0.42 } },
  dir:  { day: { c: 0xFFF4E4, i: 0.35, p: [6, 12, 9] }, night: { c: 0xD8E2FF, i: 0.3, p: [-7, 14, 8] } },
};

const lerpHex = (a, b, t) => {
  const r = Math.round(((a >> 16) & 255) + (((b >> 16) & 255) - ((a >> 16) & 255)) * t);
  const g = Math.round(((a >> 8) & 255) + (((b >> 8) & 255) - ((a >> 8) & 255)) * t);
  const l = Math.round((a & 255) + ((b & 255) - (a & 255)) * t);
  return (r << 16) | (g << 8) | l;
};

// P at mix m: before the world is built from it.
export function setPalette(m) {
  for (const k of Object.keys(DAY)) P[k] = lerpHex(DAY[k], NIGHT[k], m);
}

// The one light rig (ambient, sky and ground, a soft key), set for mix m.
export function makeRig(m) {
  const rig = {
    amb: new AmbientLight(0xFFFFFF, 1.5),
    hemi: new HemisphereLight(0xFFF6EA, 0xF2DFC6, 1.1),
    dir: new DirectionalLight(0xFFF4E4, 0.35),
  };
  const split = (light, vecs) => {
    let i = 0;
    for (const v of vecs) i = Math.max(i, v.r, v.g, v.b);
    light.intensity = i;
    return i > 1e-6 ? 1 / i : 0;
  };
  const mixVec = (dayHex, dayI, nightHex, nightI) =>
    new Color(dayHex).multiplyScalar(dayI * (1 - m)).add(new Color(nightHex).multiplyScalar(nightI * m));
  const av = mixVec(RIG.amb.day.c, RIG.amb.day.i, RIG.amb.night.c, RIG.amb.night.i);
  let inv = split(rig.amb, [av]);
  rig.amb.color.setRGB(av.r * inv, av.g * inv, av.b * inv);
  const hs = mixVec(RIG.hemi.day.c, RIG.hemi.day.i, RIG.hemi.night.c, RIG.hemi.night.i);
  const hg = mixVec(RIG.hemi.day.g, RIG.hemi.day.i, RIG.hemi.night.g, RIG.hemi.night.i);
  inv = split(rig.hemi, [hs, hg]);
  rig.hemi.color.setRGB(hs.r * inv, hs.g * inv, hs.b * inv);
  rig.hemi.groundColor.setRGB(hg.r * inv, hg.g * inv, hg.b * inv);
  const dv = mixVec(RIG.dir.day.c, RIG.dir.day.i, RIG.dir.night.c, RIG.dir.night.i);
  inv = split(rig.dir, [dv]);
  rig.dir.color.setRGB(dv.r * inv, dv.g * inv, dv.b * inv);
  const dp = RIG.dir.day.p, np = RIG.dir.night.p;
  rig.dir.position.set(dp[0] + (np[0] - dp[0]) * m, dp[1] + (np[1] - dp[1]) * m, dp[2] + (np[2] - dp[2]) * m);
  return rig;
}
