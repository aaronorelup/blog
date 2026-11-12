// The tea room hero's runtime maths in plain node (src/scripts/tea/hero/: manifest.js, tracks.js, actors.js), with
// three loaded the way the page loads it: the manifest's defaults, and the new fields only where they are written; the
// track maths of every channel; one actor swapped for another (follow, a visible cut, an opacity dissolve that always
// comes back, scrolled down and back like the page); a skinned mesh's skeleton freed; and the shipped manifest held to
// what the runtime knows. The browser side of the same swap is e2e tea-hero-26.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

globalThis.location = { href: 'http://localhost/tea/' };
const three = await import('../../src/scripts/tea/hero/three.js');
await three.loadThree();
const { normalise } = await import('../../src/scripts/tea/hero/manifest.js');
const { CHANNELS, applyTracks, bindTracks, sample, shownBy } = await import('../../src/scripts/tea/hero/tracks.js');
const { disposeTree, loadActors, orientActors } = await import('../../src/scripts/tea/hero/actors.js');
const { Bone, BufferGeometry, Group, MeshStandardMaterial, Object3D, Skeleton, SkinnedMesh } = await import('three');

const SHIPPED = JSON.parse(fs.readFileSync(new URL('../../public/tea/hero/manifest.json', import.meta.url), 'utf8'));
const CAM = { keys: [{ t: 0, pos: [0, 1, 6], look: [0, 1, 0] }, { t: 1, pos: [0, 1, 2], look: [0, 1, -4] }] };
const man = (actors, tracks = [], idle = []) => normalise({ version: 1, camera: CAM, actors, tracks, idle }, '/tea/hero/m.json');
const near = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-9, `${msg}: ${a} vs ${b}`);

// An actor as loadActors makes it, around a made-up model: root (position, rotation) > inner (scale) > model > nodes.
function actor(spec, nodes = []) {
  const root = new Group(); const inner = new Group(); const model = new Group();
  for (const n of nodes) { const o = new Object3D(); o.name = n; model.add(o); }
  root.position.fromArray(spec.position); inner.scale.setScalar(spec.scale);
  inner.add(model); root.add(inner);
  return { spec, root, inner, model, shaders: [], bend: null, bendRest: 0, restPos: root.position.clone(), fadeMats: [] };
}

test('a manifest without follow or fade normalises as before: every old field and default, the new two off', () => {
  const OLD = ['id', 'src', 'scale', 'position', 'rotation', 'portraitPosition', 'rig', 'deform', 'materials', 'tint',
    'envIntensity', 'props'];
  const m = normalise(SHIPPED, '/tea/hero/manifest.json');
  assert.equal(m.actors.length, SHIPPED.actors.length);
  for (const a of m.actors) {
    assert.deepEqual(Object.keys(a).sort(), [...OLD, 'follow', 'fade'].sort(), a.id);
    assert.deepEqual([a.follow, a.fade], [null, false], a.id);
  }
  const [bare] = man([{ id: 'x', src: 'x.glb' }]).actors;
  assert.deepEqual(bare, {
    id: 'x', src: 'http://localhost/tea/hero/x.glb', scale: 1, position: [0, 0, 0], rotation: [0, 0, 0],
    portraitPosition: null, rig: { kind: 'baked', map: {} }, deform: null, materials: {}, tint: null, envIntensity: 0.6,
    follow: null, fade: false, props: [],
  });
});

test('follow and fade are read; a follower must name another actor that follows no one', () => {
  const m = man([{ id: 'a', src: 'a.glb' }, { id: 'b', src: 'b.glb', follow: 'a', fade: true, scale: 0.9 }]);
  assert.deepEqual([m.actors[1].follow, m.actors[1].fade, m.actors[1].scale], ['a', true, 0.9]);
  assert.throws(() => man([{ id: 'b', src: 'b.glb', follow: 'nobody' }]), /follow: b/);
  assert.throws(() => man([{ id: 'b', src: 'b.glb', follow: 'b' }]), /follow: b/);
  assert.throws(() => man([{ id: 'a', src: 'a.glb' }, { id: 'b', src: 'b.glb', follow: 'a' },
    { id: 'c', src: 'c.glb', follow: 'b' }]), /follow: c/);
});

test('sample: a value holds before the first key and after the last, smooth (default) or linear between', () => {
  const keys = [[0.2, 0], [0.6, 10]];
  assert.deepEqual([sample(keys, 0, 'smooth'), sample(keys, 0.9, 'smooth')], [0, 10]);
  near(sample(keys, 0.4, 'linear'), 5, 'linear half way');
  near(sample(keys, 0.3, 'linear'), 2.5, 'linear quarter');
  near(sample(keys, 0.3, 'smooth'), 10 * (0.25 * 0.25 * (3 - 0.5)), 'smoothstep quarter');
  assert.deepEqual(sample([[0, [0, 0, 0]], [1, [2, 4, 6]]], 0.5, 'linear'), [1, 2, 3]);
  assert.equal(sample([], 0.5, 'linear'), 0);
});

test('the old channels move nodes and roots as deltas from rest, and leave every visibility alone', () => {
  const m = man([{ id: 'a', src: 'a.glb', position: [1, 0, 0], scale: 2 }], [
    { actor: 'a', channel: 'position', ease: 'linear', keys: [[0, [0, 0, 0]], [1, [2, 0, 0]]] },
    { actor: 'a', node: 'head', channel: 'rotation', ease: 'linear', keys: [[0, [0, 0, 0]], [1, [0, 90, 0]]] },
    { actor: 'a', node: 'head', channel: 'scale', ease: 'linear', keys: [[0, [1, 1, 1]], [1, [3, 1, 1]]] },
    { actor: 'a', channel: 'squash', ease: 'linear', keys: [[0, 0], [1, 0.21]] },
  ]);
  const a = actor(m.actors[0], ['head']);
  const head = a.model.children[0];
  head.position.set(0, 1, 0);
  a.root.visible = false; head.visible = false;   // whatever a tool set: no old channel writes it
  const bound = bindTracks(m, [a]);
  applyTracks(bound, 0.5, 0);
  assert.deepEqual(a.root.position.toArray(), [2, 0, 0]);
  near(head.rotation.y, Math.PI / 4, 'head turned 45 degrees');
  assert.deepEqual(head.position.toArray(), [0, 1, 0]);
  assert.deepEqual(head.scale.toArray(), [2, 1, 1]);
  near(a.inner.scale.y, 2 * 1.105, 'squash stretches the inner group');
  near(a.inner.scale.x, 2 / Math.sqrt(1.105), 'and thins it');
  assert.deepEqual([a.root.visible, head.visible], [false, false]);
  assert.deepEqual(bound.follow, []);
});

const SWAP = [{ id: 'jefrie', src: 'j.glb', position: [-1.8, 1.05, 0.8], scale: 2 },
  { id: 'jefrie_leap', src: 'l.glb', follow: 'jefrie', fade: true, position: [0.066, 0.0308, 0.0026],
    rotation: [-1.06, -36.11, 11.97], scale: 1.0164 }];
// down to 0.8 and back to 0, as the rig harness's swap check runs the page
const STEPS = [0, 0.1, 0.17, 0.19, 0.2, 0.25, 0.4, 0.5, 0.52, 0.6, 0.8, 0.45, 0.2, 0.1, 0];

test('a cut: the visible channel shows one actor or the other, scrolled down and back', () => {
  const m = man(SWAP, [
    { actor: 'jefrie', channel: 'visible', ease: 'linear', keys: [[0.499, 1], [0.501, 0]] },
    { actor: 'jefrie_leap', channel: 'visible', ease: 'linear', keys: [[0.499, 0], [0.501, 1]] },
  ]);
  const [j, l] = m.actors.map((s) => actor(s));
  const bound = bindTracks(m, [j, l]);
  // (at exactly p 0.5 both values are 0.5, so both draw for that one frame: "0.5 or more")
  for (const p of STEPS.filter((x) => x !== 0.5)) {
    applyTracks(bound, p, 0);
    assert.deepEqual([j.root.visible, l.root.visible], p < 0.5 ? [true, false] : [false, true], `p ${p}`);
  }
});

test('a dissolve: opacity hides an actor only while it is near 0, and brings it back on the way back (N1)', () => {
  const m = man(SWAP, [
    { actor: 'jefrie', channel: 'opacity', ease: 'linear', keys: [[0.18, 1], [0.21, 0], [0.5, 0], [0.53, 1]] },
    { actor: 'jefrie_leap', channel: 'opacity', ease: 'linear', keys: [[0.18, 0], [0.21, 1], [0.5, 1], [0.53, 0]] },
  ]);
  const [j, l] = m.actors.map((s) => actor(s));
  const mat = new MeshStandardMaterial({ opacity: 0.8 });
  l.fadeMats.push([mat, 0.8]);
  const bound = bindTracks(m, [j, l]);
  for (const p of STEPS) {
    applyTracks(bound, p, 0);
    const oj = sample(bound.scroll[0].keys, p, 'linear');
    const ol = sample(bound.scroll[1].keys, p, 'linear');
    assert.deepEqual([j.root.visible, l.root.visible], [oj > 0.004, ol > 0.004], `p ${p}`);
    near(mat.opacity, 0.8 * ol, `leap opacity at p ${p}`);
  }
  assert.equal(j.root.visible, true, 'back at the top, Jefrie shows again');
  assert.deepEqual([shownBy(null, null), shownBy(0.5, null), shownBy(0.49, null), shownBy(null, 0.004), shownBy(1, 0.01)],
    [true, true, false, false, true]);
});

test('visible and opacity on a node are skipped; the actor\'s other tracks still bind', () => {
  const m = man([{ id: 'a', src: 'a.glb' }], [
    { actor: 'a', node: 'head', channel: 'visible', keys: [[0, 0], [1, 0]] },
    { actor: 'a', node: 'head', channel: 'opacity', keys: [[0, 0], [1, 0]] },
    { actor: 'a', node: 'head', channel: 'rotation', keys: [[0, [0, 0, 0]], [1, [10, 0, 0]]] },
  ]);
  const a = actor(m.actors[0], ['head']);
  const bound = bindTracks(m, [a]);
  assert.deepEqual(bound.scroll.map((t) => t.channel), ['rotation']);
  applyTracks(bound, 1, 0);
  assert.equal(a.model.children[0].visible, true);
});

test('a follower takes its leader\'s root and inner scale after every track, its own whole-actor ones included, while the leader is cut away too', () => {
  const m = man(SWAP, [
    { actor: 'jefrie', channel: 'position', ease: 'linear', keys: [[0, [0, 0, 0]], [1, [1.2, 0.5, 0]]] },
    { actor: 'jefrie', channel: 'rotation', ease: 'linear', keys: [[0, [0, 0, 0]], [1, [0, 0, -22]]] },
    { actor: 'jefrie', channel: 'squash', ease: 'linear', keys: [[0, 0], [1, 0.1]] },
    // the leader cut away from 0.5 (the leap mesh drawn in its place) while its tracks go on moving it
    { actor: 'jefrie', channel: 'visible', ease: 'linear', keys: [[0.499, 1], [0.501, 0]] },
    { actor: 'jefrie_leap', channel: 'position', keys: [[0, [5, 5, 5]], [1, [5, 5, 5]]] },
  ]);
  const [j, l] = m.actors.map((s) => actor(s));
  l.inner.scale.setScalar(1);   // a follower's inner group is the leader's, every frame
  const bound = bindTracks(m, [j, l]);
  assert.deepEqual(bound.follow.map(([f, lead]) => [f.spec.id, lead.spec.id]), [['jefrie_leap', 'jefrie']]);
  for (const p of [0.3, 0.7, 0.9, 0]) {
    applyTracks(bound, p, 1.5);
    assert.equal(j.root.visible, p < 0.5, `the leader shown at p ${p}`);
    assert.deepEqual(l.root.position.toArray(), j.root.position.toArray(), `position at p ${p}`);
    assert.deepEqual(l.root.quaternion.toArray(), j.root.quaternion.toArray(), `rotation at p ${p}`);
    assert.deepEqual(l.inner.scale.toArray(), j.inner.scale.toArray(), `scale at p ${p}`);
  }
});

// A GLB in memory: two triangles under hips > head, one opaque (its factor's alpha 0.9, which an opaque material
// doesn't draw) and one see-through (BLEND, 0.8); fetch answers it for any address.
function glb() {
  const pos = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
  const json = {
    asset: { version: '2.0' }, scene: 0, scenes: [{ nodes: [0] }],
    nodes: [{ name: 'hips', children: [1] }, { name: 'head', mesh: 0, translation: [0, 1, 0] }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 }, material: 0 }, { attributes: { POSITION: 0 }, material: 1 }] }],
    materials: [{ pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 0.9] } },
      { pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 0.8] }, alphaMode: 'BLEND' }],
    accessors: [{ bufferView: 0, componentType: 5126, count: 3, type: 'VEC3', min: [0, 0, 0], max: [1, 1, 0] }],
    bufferViews: [{ buffer: 0, byteLength: 36 }], buffers: [{ byteLength: 36 }],
  };
  const pad = (b, c) => Buffer.concat([b, Buffer.alloc((4 - (b.length % 4)) % 4, c)]);
  const j = pad(Buffer.from(JSON.stringify(json)), 0x20);
  const d = pad(Buffer.from(pos.buffer), 0);
  const chunk = (len, type) => { const c = Buffer.alloc(8); c.writeUInt32LE(len, 0); c.write(type, 4); return c; };
  const head = Buffer.alloc(12);
  head.write('glTF', 0); head.writeUInt32LE(2, 4); head.writeUInt32LE(12 + 8 + j.length + 8 + d.length, 8);
  return Buffer.concat([head, chunk(j.length, 'JSON'), j, chunk(d.length, 'BIN\0'), d]);
}

test('loadActors: a follower\'s model sits inside its leader\'s frame by its own numbers; fade alpha-hashes the opaque materials only, none dithered while shown', async () => {
  const fetched = globalThis.fetch;
  const body = glb();
  globalThis.fetch = async () => new Response(body, { status: 200 });
  try {
    const m = man([{ id: 'a', src: 'a.glb', position: [2, 0, 0], rotation: [0, 30, 0], scale: 2 },
      { id: 'b', src: 'b.glb', follow: 'a', fade: true, position: [0.1, 0.2, 0.3], rotation: [0, 90, 0], scale: 0.5 }],
    [{ actor: 'b', channel: 'opacity', keys: [[0, 0.5], [1, 0.5]] }]);
    const [a, b] = await loadActors(m, false);
    assert.deepEqual([a.root.position.toArray(), a.inner.scale.toArray()], [[2, 0, 0], [2, 2, 2]]);
    assert.deepEqual([a.model.position.toArray(), a.fadeMats.length], [[0, 0, 0], 0]);
    assert.deepEqual([b.root.position.toArray(), b.root.quaternion.toArray(), b.inner.scale.toArray()],
      [[0, 0, 0], [0, 0, 0, 1], [1, 1, 1]]);
    assert.deepEqual([b.model.position.toArray(), b.model.scale.toArray()], [[0.1, 0.2, 0.3], [0.5, 0.5, 0.5]]);
    near(b.model.rotation.y, Math.PI / 2, 'the model turned by the follower\'s rotation');
    // [alphaHash, transparent, opacity, the base an opacity track multiplies]: the opaque material hashed and drawn whole
    // at 1, the see-through one blended at its own 0.8 as loaded, so neither is dithered at full opacity; the leader's
    // own materials untouched
    const mats = (x) => { const r = []; x.model.traverse((o) => { if (o.isMesh) r.push(o.material); }); return r; };
    assert.deepEqual(b.fadeMats.map(([mat, base]) => [mat.alphaHash, mat.transparent, mat.opacity, base]),
      [[true, false, 1, 1], [false, true, 0.8, 0.8]]);
    assert.deepEqual(mats(a).map((mat) => [mat.alphaHash, mat.transparent, mat.opacity]), [[false, false, 0.9], [false, true, 0.8]]);
    orientActors([a, b], { camera: { portrait: { spread: 0.5 } } }, true);
    assert.deepEqual([a.root.position.toArray(), b.root.position.toArray()], [[1, 0, 0], [0, 0, 0]]);
    // half way through a dissolve each is drawn at half its own opacity
    applyTracks(bindTracks(m, [a, b]), 0.3, 0);
    assert.deepEqual([b.root.visible, ...b.fadeMats.map(([mat]) => mat.opacity)], [true, 0.5, 0.4]);
  } finally {
    globalThis.fetch = fetched;
  }
});

test('disposeTree frees a skinned mesh\'s skeleton (its bone texture) with the geometry and materials', () => {
  const bone = new Bone();
  const mesh = new SkinnedMesh(new BufferGeometry(), new MeshStandardMaterial());
  mesh.add(bone);
  mesh.bind(new Skeleton([bone]));
  const freed = [];
  const keep = mesh.skeleton.dispose.bind(mesh.skeleton);
  mesh.skeleton.dispose = () => { freed.push('skeleton'); keep(); };
  mesh.geometry.addEventListener('dispose', () => freed.push('geometry'));
  mesh.material.addEventListener('dispose', () => freed.push('material'));
  const g = new Group();
  g.add(mesh);
  disposeTree(g);
  assert.deepEqual(freed, ['skeleton', 'geometry', 'material']);
});

test('the shipped manifest: every channel is one the runtime knows, a whole-actor one on no node, and it normalises', () => {
  for (const t of [...(SHIPPED.tracks || []), ...(SHIPPED.idle || [])]) {
    assert.ok(CHANNELS.includes(t.channel), `${t.actor}/${t.node || ''}: ${t.channel}`);
    assert.ok(!(t.node && ['visible', 'opacity'].includes(t.channel)), `${t.actor}/${t.node}: ${t.channel} is skipped on a node`);
  }
  assert.doesNotThrow(() => normalise(SHIPPED, '/tea/hero/manifest.json'));
});
