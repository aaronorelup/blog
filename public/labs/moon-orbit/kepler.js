// The exact answers, from the shape of the orbit (a conic section) instead of from stepping through time.
// Nothing here calls the simulator, so a check that compares the two can catch the simulator out.
// Units: km and seconds. A ball thrown sideways at speed v from radius r0 around a point mass GM.

export const vCirc = (GM, r) => Math.sqrt(GM / r);
export const vEsc = (GM, r) => Math.sqrt((2 * GM) / r);
// The slowest sideways throw from r0 that misses a ground of radius R: its lowest point just touches.
export const vGraze = (GM, R, r0) => Math.sqrt((2 * GM * R) / (r0 * (r0 + R)));
// Vis-viva: the size of the orbit (semi-major axis) a throw at v from r0 makes. Negative means it escapes.
export const semiMajor = (GM, r0, v) => 1 / (2 / r0 - (v * v) / GM);
export const period = (GM, a) => 2 * Math.PI * Math.sqrt((a * a * a) / GM);
// Speed at radius r, from the same energy.
export const speedAt = (GM, r0, v0, r) => Math.sqrt(v0 * v0 - 2 * GM * (1 / r0 - 1 / r));
// The far end of the orbit from the throw (its high point, or its low point for a throw under orbit speed).
export const farSide = (GM, r0, v) => 2 * semiMajor(GM, r0, v) - r0;

// Where a sideways throw slower than vGraze comes down: the distance along the ground and the time in the air.
// The throw point is the orbit's highest point (apoapsis). The ground meets the ellipse at true anomaly theta.
export function landing(GM, R, r0, v) {
  const q = (r0 * v * v) / GM;               // p / r0, below 1 for these throws
  if (q >= 1) return null;
  const e = 1 - q;                           // eccentricity
  const p = q * r0;                          // semi-latus rectum
  const c = (p - R) / (R * e);               // cos(theta) where r = R, from r = p / (1 + e cos theta)
  if (c < -1) return null;                   // the whole orbit clears the ground
  const theta = Math.acos(c);
  const a = p / (1 - e * e);
  const E = 2 * Math.atan(Math.sqrt((1 - e) / (1 + e)) * Math.tan(theta / 2));   // eccentric anomaly
  const M = E - e * Math.sin(E);                                                  // mean anomaly
  const t = (Math.PI - M) / Math.sqrt(GM / (a * a * a));                          // from apoapsis, M = pi
  return { along: R * (Math.PI - theta), t };
}
