// Light for both modes from the manifest: each light has a night and a day state and is lerped by mix (1 = night),
// so the toggle tweens instead of cutting. Lights and glows (additive halo sprites) may hang from an actor's node,
// as the lantern's does, and may follow the television's flicker. Also a small painted sky as the env map.
import {
  AdditiveBlending, AmbientLight, CanvasTexture, Color, DirectionalLight, EquirectangularReflectionMapping,
  HemisphereLight, PMREMGenerator, PointLight, SRGBColorSpace, Sprite, SpriteMaterial, Vector3,
} from './three.js';
import { flicker } from './crt.js';
import { findNode } from './tracks.js';

const MAKERS = {
  ambient: () => new AmbientLight(),
  hemi: () => new HemisphereLight(),
  dir: () => new DirectionalLight(),
  point: () => new PointLight(),
};

function anchor(attach, actors, scene) {
  if (!attach) return scene;
  const actor = actors.find((a) => a.spec.id === attach.actor);
  if (!actor) return null;
  return (attach.node && findNode(actor, attach.node)) || actor.root;
}

let C = null;   // scratch colours, made on first use (three arrives with the scene: three.js)

export function buildLights(manifest, actors, scene) {
  const lights = [];
  for (const spec of manifest.lights) {
    const make = MAKERS[spec.type];
    const parent = make && anchor(spec.attach, actors, scene);
    if (!parent) continue;
    const light = make();
    if (light.isPointLight) { light.distance = spec.distance; light.decay = spec.decay; }
    parent.add(light);
    if (light.isDirectionalLight) scene.add(light.target);
    lights.push({ spec, light });
  }
  const glows = [];
  const tex = glowTexture();
  for (const g of manifest.glows) {
    const parent = anchor(g.attach, actors, scene);
    if (!parent) continue;
    const s = new Sprite(new SpriteMaterial({
      map: tex, color: new Color(g.color), blending: AdditiveBlending, depthWrite: false, transparent: true,
    }));
    s.position.fromArray(g.position);
    s.scale.setScalar(g.size);
    s.renderOrder = 5;
    parent.add(s);
    glows.push({ spec: g, sprite: s });
  }
  return { lights, glows, tex };
}

export function paintLights(rig, mix, time) {
  const { a: _a, b: _b, v: _v } = C || (C = { a: new Color(), b: new Color(), v: new Vector3() });
  const f = flicker(time);
  for (const { spec, light } of rig.lights) {
    const n = spec.night;
    const d = spec.day;
    light.color.copy(_a.set(d.color)).lerp(_b.set(n.color), mix);
    if (light.isHemisphereLight) light.groundColor.copy(_a.set(d.ground)).lerp(_b.set(n.ground), mix);
    light.intensity = (d.intensity + (n.intensity - d.intensity) * mix) * (spec.flicker === 'crt' ? f : 1);
    if (!light.isAmbientLight) light.position.fromArray(d.position).lerp(_v.fromArray(n.position), mix);
  }
  for (const { spec, sprite } of rig.glows) {
    sprite.material.opacity = (spec.day + (spec.night - spec.day) * mix) * (spec.flicker === 'crt' ? f : 1);
  }
}

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(255,255,255,1)');
  r.addColorStop(0.25, 'rgba(255,255,255,0.45)');
  r.addColorStop(0.6, 'rgba(255,255,255,0.08)');
  r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

// A tiny painted sky (night above, a warm horizon, dark ground) as image-based light, so the models' PBR materials
// read as lit by this place rather than by black.
export function skyEnvironment(renderer, top, horizon, ground) {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 32;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 32);
  grad.addColorStop(0, top); grad.addColorStop(0.48, horizon); grad.addColorStop(0.55, ground); grad.addColorStop(1, ground);
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 32);
  const t = new CanvasTexture(c);
  t.mapping = EquirectangularReflectionMapping;
  t.colorSpace = SRGBColorSpace;
  const pmrem = new PMREMGenerator(renderer);
  const env = pmrem.fromEquirectangular(t).texture;
  pmrem.dispose();
  t.dispose();
  return env;
}
