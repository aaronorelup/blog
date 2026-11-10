// Characters and props from GLB files (meshopt-compressed or plain, WebP or JPEG textures). Each actor is a root
// (manifest position and rotation; whole-body tracks move it) holding an inner group (manifest scale; squash scales
// it) holding the model. Props load beside it and hang from a named node or from the actor. Material overrides by
// node name (the TV's screen shader), a tint, the env light, and a bend deform for a mesh with no skeleton.
import { Color, Group, MathUtils } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { crtMaterial } from './crt.js';
import { addBend } from './deform.js';
import { findNode } from './tracks.js';

let loader = null;
function gltf() {
  if (!loader) { loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder); }
  return loader;
}

const load = (url) => gltf().loadAsync(url).then((g) => g.scene);

function place(obj, position, rotation) {
  obj.position.fromArray(position);
  obj.rotation.set(...rotation.map((d) => MathUtils.degToRad(d)), 'YXZ');
}

// Materials named by node: every mesh at or under that node gets the override.
function overrideMaterials(model, specMaterials, owner, shaders) {
  for (const [name, m] of Object.entries(specMaterials)) {
    const node = findNode(owner, name);
    if (!node || m.shader !== 'crt') continue;
    const mat = crtMaterial();
    shaders.push(mat);
    node.traverse((o) => { if (o.isMesh) o.material = mat; });
  }
}

function finishMaterials(model, spec, actor) {
  const tint = spec.tint ? new Color(spec.tint) : null;
  const seen = new Set();
  model.traverse((o) => {
    if (!o.isMesh) return;
    o.frustumCulled = false;   // tracks and bends move parts past their bounds
    for (const mat of [].concat(o.material)) {
      if (seen.has(mat) || mat.isShaderMaterial) continue;
      seen.add(mat);
      if (tint && mat.color) mat.color.multiply(tint);
      if ('envMapIntensity' in mat) mat.envMapIntensity = spec.envIntensity;
      if (spec.deform && spec.deform.kind === 'bend') {
        // every material of one actor shares the one bend uniform
        if (!actor.bend) { actor.bendRest = Number(spec.deform.rest ?? 0); actor.bend = { value: actor.bendRest }; }
        addBend(mat, spec.deform, actor.bend);
      }
    }
  });
}

export async function loadActors(manifest, portrait) {
  const spread = portrait ? manifest.camera.portrait.spread : 1;
  return Promise.all(manifest.actors.map(async (spec) => {
    const [model, ...props] = await Promise.all([load(spec.src), ...spec.props.map((p) => load(p.src))]);
    const root = new Group();
    const inner = new Group();
    root.name = 'actor:' + spec.id;
    const pos = portrait && spec.portraitPosition ? spec.portraitPosition
      : [spec.position[0] * spread, spec.position[1], spec.position[2]];
    place(root, pos, spec.rotation);
    inner.scale.setScalar(spec.scale);
    inner.add(model);
    root.add(inner);
    const actor = { spec, root, inner, model, shaders: [], bend: null, bendRest: 0 };
    spec.props.forEach((p, i) => {
      const prop = props[i];
      prop.name = p.id || prop.name;
      prop.scale.setScalar(p.scale);
      place(prop, p.position, p.rotation);
      (findNode(actor, p.parent) || model).add(prop);
      overrideMaterials(prop, p.materials, { spec: { rig: { map: {} } }, model: prop }, actor.shaders);
    });
    overrideMaterials(model, spec.materials, actor, actor.shaders);
    finishMaterials(model, spec, actor);
    return actor;
  }));
}

export function disposeTree(obj) {
  obj.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    for (const mat of [].concat(o.material || [])) {
      for (const v of Object.values(mat)) if (v && v.isTexture) v.dispose();
      mat.dispose();
    }
  });
}
