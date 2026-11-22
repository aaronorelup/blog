// Randomness without state: every "random" number in the film is a pure hash of integers
// (a seed, then up to three of: note or frame, channel, index). Same inputs, same output, in every browser and in
// Node, in any order. Nothing here keeps state between calls, and Math.random is never used.
//
// The mixing is MurmurHash3's (32-bit, public domain): Math.imul keeps every step in exact 32-bit integer maths,
// so the result does not depend on the JavaScript engine.

function mix(h, k) {
  k = Math.imul(k | 0, 0xcc9e2d51);
  k = (k << 15) | (k >>> 17);
  k = Math.imul(k, 0x1b873593);
  h ^= k;
  h = (h << 13) | (h >>> 19);
  return (Math.imul(h, 5) + 0xe6546b64) | 0;
}

function finish(h) {
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

/**
 * A pure hash of four integers to [0, 1). Non-integer inputs are truncated toward zero (pass integers).
 * @param {number} seed @param {number} [a] @param {number} [b] @param {number} [c]
 */
export function hash01(seed, a = 0, b = 0, c = 0) {
  let h = mix(0x9e3779b9 ^ (seed | 0), a);
  h = mix(h, b);
  h = mix(h, c);
  h ^= 16;
  return finish(h) / 4294967296;
}

/** The same hash mapped to [-1, 1). */
export function hashSigned(seed, a = 0, b = 0, c = 0) {
  return hash01(seed, a, b, c) * 2 - 1;
}

/**
 * Smooth seeded value noise in [-1, 1]: a closed form of x (no state). Knots every `period` units of x, each knot
 * a hash of (seed, channel, knot index), joined by a smoothstep. Two octaves so it does not look periodic.
 */
export function noise1(seed, channel, x, period) {
  const octave = (s, p) => {
    const u = x / p, i = Math.floor(u), f = u - i, t = f * f * (3 - 2 * f);
    const a = hashSigned(s, channel, i), b = hashSigned(s, channel, i + 1);
    return a + (b - a) * t;
  };
  return (octave(seed, period) * 2 + octave(seed + 1, period / 2.7)) / 3;
}
