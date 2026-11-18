// The swirl in the cup, in cup units (the inner radius is 1, time in seconds). A Lamb-Oseen-like vortex, whose
// circulation spins down on the Ekman time H / sqrt(nu * Omega), sped up to settle in about seven seconds, and the
// secondary flow it drives: inward along the bottom, outward at the surface. That is the tea-leaf paradox.
import { clamp } from './rng.js';

export const RC = 0.42;           // the vortex core radius
const NU = 0.01;                  // water, cm^2/s
const SPEED = 4;                  // the cup's day squeezed into seconds
const VISC = 0.05;                // the wall's own drag, so the last of the spin dies
const K_IN = 1.1, K_OUT = 0.45;   // how hard the secondary flow pushes, along the bottom and at the surface
export const GMAX = 9;

export function vTheta(gamma, r) {
  if (r < 1e-4) return 0;
  return gamma / (2 * Math.PI * r) * (1 - Math.exp(-(r * r) / (RC * RC)));
}

// The core's angular speed, rad/s, which sets the Ekman layer.
export const omegaCore = (gamma) => Math.abs(gamma) / (Math.PI * RC * RC);
// Angular speed at radius r: what the dye rotates by.
export const omega = (gamma, r) => vTheta(gamma, r) / Math.max(r, 0.03);

// Radial speed of the secondary flow at r: below 0 (inward) along the bottom, above 0 (outward) at the surface.
// The Ekman layer's inflow saturates (and leaves.js gives the heap in the middle a size).
export function radial(gamma, r, layer) {
  const v = vTheta(gamma, r), u = (v * v) / Math.max(r, 0.12);
  return layer === 'bottom' ? -K_IN * Math.min(u, 0.32) : K_OUT * Math.min(u, 0.6);
}

// Vorticity and strain of the swirl at r, for leaves that turn to lie along the shear (Jeffery).
export function shear(gamma, r) {
  const h = 0.01, rr = Math.max(r, 0.02);
  const v0 = vTheta(gamma, rr - h), v1 = vTheta(gamma, rr + h), v = vTheta(gamma, rr);
  const dv = (v1 - v0) / (2 * h);
  return { zeta: dv + v / rr, strain: dv - v / rr };
}

// One step of spin-down: dGamma/dt = -Gamma / T_E, with T_E = H / sqrt(nu * Omega), H the tea's depth in cm.
export function spinDown(gamma, depth, dt) {
  if (!gamma) return 0;
  const H = Math.max(depth, 0.4);
  const rate = SPEED * Math.sqrt(NU * omegaCore(gamma)) / H + VISC;
  const g = gamma * Math.exp(-rate * dt);
  return Math.abs(g) < 1e-3 ? 0 : g;
}

export const stir = (gamma, impulse) => clamp(gamma + impulse, -GMAX, GMAX);
