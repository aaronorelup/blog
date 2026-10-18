// The Equal Earth projection (Šavrič, Patterson and Jenny, 2018): equal-area, so a country's
// share of the map isn't inflated by how far north it is, and its curved sides still read as "the
// whole world" at a glance. Pure; importable from Node for the tests.

const A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796;
const M = Math.sqrt(3) / 2;
const RAD = Math.PI / 180;

/** [x, y] in projection units, y up. x spans about ±2.707, y about ±1.317. */
export function project(lat, lon) {
  const th = Math.asin(M * Math.sin(lat * RAD));
  const t2 = th * th, t6 = t2 * t2 * t2;
  const x = (lon * RAD * Math.cos(th)) / (M * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2)));
  const y = th * (A1 + A2 * t2 + t6 * (A3 + A4 * t2));
  return [x, y];
}

/**
 * Fit the world, cropped to [latMin, latMax], into a width × height box with the aspect kept and
 * the drawing centred. Returns a projector to screen pixels (y down) and the box it fills.
 */
export function fitBox(width, height, { latMin = -56, latMax = 78, pad = 0 } = {}) {
  const xMax = project(0, 180)[0];
  const yTop = project(latMax, 0)[1];
  const yBot = project(latMin, 0)[1];
  const w = Math.max(1, width - 2 * pad), h = Math.max(1, height - 2 * pad);
  const s = Math.min(w / (2 * xMax), h / (yTop - yBot));
  const ox = width / 2;
  const oy = pad + (h - s * (yTop - yBot)) / 2 + s * yTop;
  return {
    scale: s,
    left: ox - s * xMax,
    right: ox + s * xMax,
    top: oy - s * yTop,
    bottom: oy - s * yBot,
    project(lat, lon) {
      const [x, y] = project(lat, lon);
      return [ox + s * x, oy - s * y];
    },
  };
}

/** Height over width of the cropped world: what a box should be to waste no space. */
export function aspect({ latMin = -56, latMax = 78 } = {}) {
  return (project(latMax, 0)[1] - project(latMin, 0)[1]) / (2 * project(0, 180)[0]);
}
