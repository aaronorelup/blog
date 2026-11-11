// The manifest's motion: scroll tracks (keyed on the hero's progress, 0 to 1) and idle waves (keyed on time), both as
// deltas from each node's rest pose, applied once a frame. A node is a bone or a rigid part, any Object3D; a track
// whose actor or node is missing is skipped. Channels: position, rotation (degrees), scale, squash, bend (deform).
import { Euler, MathUtils, Quaternion } from './three.js';

const sanitise = (n) => String(n).replace(/\s/g, '_').replace(/[[\]./:]/g, '');

// The node an actor's track names: the rig map's alias first, then the exact name, then the name GLTFLoader leaves
// after sanitising ("upperarm.L" arrives as "upperarmL"), then the glTF's original name in userData.
export function findNode(actor, name) {
  if (!name) return null;
  const wanted = actor.spec.rig.map[name] || name;
  const clean = sanitise(wanted);
  let hit = null;
  actor.model.traverse((o) => {
    if (hit) return;
    if (o.name === wanted || o.name === clean || (o.userData && o.userData.name === wanted)) hit = o;
  });
  return hit;
}

// Each animated thing gets a slot: its rest pose and this frame's sums.
function slotFor(slots, actor, nodeName) {
  const key = actor.spec.id + '|' + (nodeName || '');
  if (slots.has(key)) return slots.get(key);
  let slot = null;
  if (!nodeName) {
    slot = { obj: actor.root, inner: actor.inner, actor };
  } else {
    const obj = findNode(actor, nodeName);
    if (obj) slot = { obj, inner: null, actor };
  }
  if (slot) {
    slot.restPos = slot.obj.position.clone();
    slot.restQuat = slot.obj.quaternion.clone();
    slot.restScale = (slot.inner || slot.obj).scale.clone();
    slot.pos = [0, 0, 0]; slot.rot = [0, 0, 0]; slot.scl = [1, 1, 1]; slot.bend = 0;
  }
  slots.set(key, slot);
  return slot;
}

export function bindTracks(manifest, actors) {
  const byId = new Map(actors.map((a) => [a.spec.id, a]));
  const slots = new Map();
  const bind = (t) => {
    const actor = byId.get(t.actor);
    const slot = actor ? slotFor(slots, actor, t.node) : null;
    return slot ? { ...t, slot } : null;
  };
  const scroll = manifest.tracks.map(bind).filter(Boolean);
  const idle = manifest.idle.map(bind).filter(Boolean);
  const live = [...new Set([...slots.values()].filter(Boolean))];
  return { scroll, idle, live };
}

const smooth = (x) => x * x * (3 - 2 * x);

// A track's value at progress p: hold before the first and after the last key, eased between.
export function sample(keys, p, ease) {
  if (!keys.length) return 0;
  if (p <= keys[0][0]) return keys[0][1];
  const last = keys[keys.length - 1];
  if (p >= last[0]) return last[1];
  let i = 0;
  while (p > keys[i + 1][0]) i++;
  const [t0, a] = keys[i];
  const [t1, b] = keys[i + 1];
  let f = (p - t0) / (t1 - t0 || 1);
  if (ease === 'smooth') f = smooth(f);
  if (Array.isArray(a)) return a.map((v, j) => v + (b[j] - v) * f);
  return a + (b - a) * f;
}

function wave(t, time) {
  const x = 2 * Math.PI * (t.hz * time + t.phase);
  if (t.wave === 'bounce') return Math.abs(Math.sin(x)) * 2 - 1;
  if (t.wave === 'noise') return (Math.sin(x) + Math.sin(x * 2.3 + 1.7) * 0.5 + Math.sin(x * 4.1 + 0.4) * 0.25) / 1.75;
  return Math.sin(x);
}

function add(slot, channel, v, k = 1) {
  const vec = Array.isArray(v) ? v : [v, v, v];
  if (channel === 'position') for (let j = 0; j < 3; j++) slot.pos[j] += vec[j] * k;
  else if (channel === 'rotation') for (let j = 0; j < 3; j++) slot.rot[j] += vec[j] * k;
  else if (channel === 'scale') for (let j = 0; j < 3; j++) slot.scl[j] *= 1 + (vec[j] - 1) * k;
  else if (channel === 'squash') {
    const s = 1 + (Array.isArray(v) ? v[0] : v) * k;   // 0.1 stretches 10% up and thins to keep the volume
    slot.scl[1] *= s; slot.scl[0] /= Math.sqrt(s); slot.scl[2] /= Math.sqrt(s);
  } else if (channel === 'bend') slot.bend += (Array.isArray(v) ? v[0] : v) * k;
}

let R = null;   // scratch rotation, made on first use (three arrives with the scene: three.js)

// p: the smoothed scroll progress; time: seconds of idle clock (frozen for screenshots).
export function applyTracks(bound, p, time) {
  const { e: _e, q: _q } = R || (R = { e: new Euler(), q: new Quaternion() });
  for (const s of bound.live) {
    s.pos[0] = s.pos[1] = s.pos[2] = 0; s.rot[0] = s.rot[1] = s.rot[2] = 0;
    s.scl[0] = s.scl[1] = s.scl[2] = 1; s.bend = 0;
  }
  for (const t of bound.scroll) add(t.slot, t.channel, sample(t.keys, p, t.ease));
  for (const t of bound.idle) {
    // an idle wave may swell or fade with scroll: scroll is [[p, gain], ...]
    const gain = t.scroll ? sample(t.scroll, p, 'smooth') : 1;
    const w = wave(t, time) * gain;
    if (t.channel === 'scale') add(t.slot, 'scale', (Array.isArray(t.amp) ? t.amp : [t.amp, t.amp, t.amp]).map((a) => 1 + a * w));
    else add(t.slot, t.channel, t.amp, w);
  }
  for (const s of bound.live) {
    s.obj.position.set(s.restPos.x + s.pos[0], s.restPos.y + s.pos[1], s.restPos.z + s.pos[2]);
    _e.set(MathUtils.degToRad(s.rot[0]), MathUtils.degToRad(s.rot[1]), MathUtils.degToRad(s.rot[2]), 'YXZ');
    s.obj.quaternion.copy(s.restQuat).multiply(_q.setFromEuler(_e));
    (s.inner || s.obj).scale.set(s.restScale.x * s.scl[0], s.restScale.y * s.scl[1], s.restScale.z * s.scl[2]);
    if (s.inner && s.actor.bend) s.actor.bend.value = s.actor.bendRest + s.bend;
  }
}
