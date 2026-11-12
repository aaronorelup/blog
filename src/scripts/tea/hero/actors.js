// Characters and props from GLB files (meshopt-compressed or plain, WebP or JPEG textures). Each actor is a root
// (manifest position and rotation; whole-body tracks move it) holding an inner group (manifest scale; squash scales
// it) holding the model. Props load beside it and hang from a named node or from the actor. Material overrides by
// node name (the TV's screen shader), a tint, the env light, and a bend deform for a mesh with no skeleton.
import { Color, GLTFLoader, Group, MathUtils } from './three.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { crtMaterial } from './crt.js';
import { addBend } from './deform.js';
import { findNode } from './tracks.js';

// The page being left (signal, boot.js) must leave nothing in the console. So a GLB is fetched here, with the signal,
// and not by three's FileLoader, whose streamed read turns a body the leaving cuts into an unhandled rejection; and the
// model's own pictures go through the parser's texture loader wrapped so that, once the page is being left, it starts
// none and passes on no failure (GLTFLoader logs one for every picture the leaving cuts; stage.js stops waiting then).
// The signal comes with pagehide, and WebKit cuts a page's loads earlier, as the leave begins (beforeunload): so a
// picture that fails is reported only after LEAVE_GRACE ms, and not at all if the page was being left by then (the
// pictures are in the GLB itself: one that fails for good, its data bad, is still reported, that much later).
const LEAVE_GRACE = 1500;
function gltf(signal) {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  if (signal) {
    loader.register((parser) => {
      parser.textureLoader = quiet(parser.textureLoader, signal);
      return { name: 'tea_quiet_textures' };
    });
  }
  return loader;
}

function quiet(inner, signal) {
  return {
    isImageBitmapLoader: inner.isImageBitmapLoader === true,   // GLTFLoader reads it to know what onLoad is given
    load(url, onLoad, onProgress, onError) {
      if (signal.aborted) return;
      inner.load(url, onLoad, onProgress, (e) => {
        if (!signal.aborted) setTimeout(() => { if (!signal.aborted) onError(e); }, LEAVE_GRACE);
      });
    },
  };
}

async function load(loader, url, signal) {
  const res = await fetch(url, { credentials: 'same-origin', signal });
  if (!res.ok) throw new Error(`model ${res.status}: ${url}`);
  const data = await res.arrayBuffer();
  // the folder of the file, as GLTFLoader.load gives parse
  return (await loader.parseAsync(data, url.slice(0, url.lastIndexOf('/') + 1))).scene;
}

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
      // fade: an opacity track dissolves the actor. An opaque material is alpha-hashed (the opaque pass, no sorting)
      // at opacity 1, drawn whole as before; a see-through one keeps its blending. Either one's opacity is the base
      // the track multiplies, so nothing is dithered while the actor is fully shown
      if (spec.fade) {
        if (!mat.transparent) { mat.alphaHash = true; mat.opacity = 1; }
        actor.fadeMats.push([mat, mat.opacity]);
      }
      if (spec.deform && spec.deform.kind === 'bend') {
        // every material of one actor shares the one bend uniform
        if (!actor.bend) { actor.bendRest = Number(spec.deform.rest ?? 0); actor.bend = { value: actor.bendRest }; }
        addBend(mat, spec.deform, actor.bend);
      }
    }
  });
}

// Where an actor's root rests: its manifest position, or on a portrait screen its portraitPosition, else the same
// with x drawn in by camera.portrait.spread. Set again when the screen turns (stage.js). A follower rests wherever its
// leader is (tracks.js puts it there every frame).
export function orientActors(actors, manifest, portrait) {
  const spread = portrait ? manifest.camera.portrait.spread : 1;
  for (const a of actors) {
    if (a.spec.follow) continue;
    const { position: p, portraitPosition: pp } = a.spec;
    a.restPos.fromArray(portrait && pp ? pp : [p[0] * spread, p[1], p[2]]);
    a.root.position.copy(a.restPos);
  }
}

export async function loadActors(manifest, portrait, signal) {
  const loader = gltf(signal);
  const actors = await Promise.all(manifest.actors.map(async (spec) => {
    const urls = [spec.src, ...spec.props.map((p) => p.src)];
    const [model, ...props] = await Promise.all(urls.map((u) => load(loader, u, signal)));
    const root = new Group();
    const inner = new Group();
    root.name = 'actor:' + spec.id;
    if (spec.follow) {
      // a follower's root and inner group take its leader's every frame: its own numbers place its model inside them,
      // in the leader's units (a pose-baked leap mesh fitted to the standing rig)
      place(model, spec.position, spec.rotation);
      model.scale.setScalar(spec.scale);
    } else {
      place(root, spec.position, spec.rotation);
      inner.scale.setScalar(spec.scale);
    }
    inner.add(model);
    root.add(inner);
    const actor = {
      spec, root, inner, model, shaders: [], bend: null, bendRest: 0, restPos: root.position.clone(), fadeMats: [],
    };
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

// Every picture of a material: its maps, and a shader's uniforms (the picture layers' night and day images).
export function texturesOf(mat) {
  const out = Object.values(mat).filter((v) => v && v.isTexture);
  for (const u of Object.values(mat.uniforms || {})) if (u && u.value && u.value.isTexture) out.push(u.value);
  return out;
}

// Every actor's pictures on the GPU at once, the hidden ones' too, and a skinned mesh's bone texture (which three makes
// on its first draw): a stand-in first drawn mid-scroll (the leap mesh) would otherwise upload them in the middle of the
// leap (a long frame).
export function uploadTextures(renderer, actors) {
  const seen = new Set();
  const up = (t) => { if (!seen.has(t)) { seen.add(t); renderer.initTexture(t); } };
  for (const a of actors) {
    a.root.traverse((o) => {
      for (const mat of [].concat(o.material || [])) texturesOf(mat).forEach(up);
      if (o.isSkinnedMesh && o.skeleton && renderer.capabilities.floatVertexTextures) {
        if (!o.skeleton.boneTexture) o.skeleton.computeBoneTexture();
        up(o.skeleton.boneTexture);
      }
    });
  }
}

export function disposeTree(obj) {
  obj.traverse((o) => {
    if (o.isSkinnedMesh && o.skeleton) o.skeleton.dispose();   // a rigged character's bone texture
    if (o.geometry) o.geometry.dispose();
    for (const mat of [].concat(o.material || [])) {
      for (const t of texturesOf(mat)) t.dispose();
      mat.dispose();
    }
  });
}
