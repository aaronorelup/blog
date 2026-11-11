// Characters and props from GLB files (meshopt-compressed or plain, WebP or JPEG textures). Each actor is a root
// (manifest position and rotation; whole-body tracks move it) holding an inner group (manifest scale; squash scales
// it) holding the model. Props load beside it and hang from a named node or from the actor. Material overrides by
// node name (the TV's screen shader), a tint, the env light, and a bend deform for a mesh with no skeleton.
import { Color, GLTFLoader, Group, MathUtils } from './three.js';
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

// Where an actor's root rests: its manifest position, or on a portrait screen its portraitPosition, else the same
// with x drawn in by camera.portrait.spread. Set again when the screen turns (stage.js).
export function orientActors(actors, manifest, portrait) {
  const spread = portrait ? manifest.camera.portrait.spread : 1;
  for (const a of actors) {
    const { position: p, portraitPosition: pp } = a.spec;
    a.restPos.fromArray(portrait && pp ? pp : [p[0] * spread, p[1], p[2]]);
    a.root.position.copy(a.restPos);
  }
}

export async function loadActors(manifest, portrait) {
  const actors = await Promise.all(manifest.actors.map(async (spec) => {
    const [model, ...props] = await Promise.all([load(spec.src), ...spec.props.map((p) => load(p.src))]);
    const root = new Group();
    const inner = new Group();
    root.name = 'actor:' + spec.id;
    place(root, spec.position, spec.rotation);
    inner.scale.setScalar(spec.scale);
    inner.add(model);
    root.add(inner);
    const actor = { spec, root, inner, model, shaders: [], bend: null, bendRest: 0, restPos: root.position.clone() };
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
  orientActors(actors, manifest, portrait);
  return actors;
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
