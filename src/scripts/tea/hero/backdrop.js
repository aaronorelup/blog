// The one picture behind the characters: a plane set back in the scene, plus cut-out layers of the same picture at
// nearer depths (alpha in the image). Each layer holds its night and day image and mixes them by the mode; the
// current mode's image loads first, the other after the first frame (later()).
import { patient } from './manifest.js';
import { Mesh, PlaneGeometry, ShaderMaterial, SRGBColorSpace, TextureLoader } from './three.js';

const VERT = `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const FRAG = `
uniform sampler2D uNight; uniform sampler2D uDay; uniform float uMix; uniform float uFade; uniform vec3 uFog;
varying vec2 vUv;
void main() {
  vec4 n = texture2D(uNight, vUv);
  vec4 d = texture2D(uDay, vUv);
  vec4 c = mix(d, n, uMix);
  c.rgb = mix(c.rgb, uFog, uFade);
  gl_FragColor = c;
  #include <colorspace_fragment>
}
`;

// A layer's image is fetched (a network error tried again, as the models are: manifest.js patient), then decoded from
// its bytes: WebKit cancels an image element's load as a link starts to leave the page (a mailto link) and fires
// neither its load nor its error, so a decode not settled in 4 s is started again, once (as the models' pictures are,
// actors.js quiet). userData.src keeps the image's address.
let texLoader = null;
async function tex(url, anisotropy, signal) {
  const blob = await patient(async () => {
    const res = await fetch(url, { credentials: 'same-origin', signal });
    if (!res.ok) throw new Error(`picture ${res.status}: ${url}`);
    return res.blob();
  }, signal);
  const local = URL.createObjectURL(blob);
  texLoader ||= new TextureLoader();
  const decode = () => new Promise((ok, no) => {
    const stall = setTimeout(() => no(new TypeError('picture stalled: ' + url)), 4000);
    texLoader.loadAsync(local).then(ok, no).finally(() => clearTimeout(stall));
  });
  try {
    const t = await decode().catch((e) => (signal && signal.aborted ? Promise.reject(e) : decode()));
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = anisotropy;
    t.userData.src = url;
    return t;
  } finally {
    URL.revokeObjectURL(local);
  }
}

export async function loadBackdrop(manifest, night, anisotropy, signal) {
  const layers = await Promise.all(manifest.background.map(async (spec, i) => {
    const first = await tex(night ? spec.night : spec.day, anisotropy, signal);
    const mat = new ShaderMaterial({
      uniforms: {
        uNight: { value: first }, uDay: { value: first }, uMix: { value: night ? 1 : 0 },
        uFade: { value: spec.fog }, uFog: { value: null },
      },
      vertexShader: VERT, fragmentShader: FRAG, transparent: spec.cutout, depthWrite: !spec.cutout,
      toneMapped: false,
    });
    const mesh = new Mesh(new PlaneGeometry(spec.size[0], spec.size[1]), mat);
    mesh.position.set(spec.x, spec.y, spec.z);
    mesh.renderOrder = -10 + i;
    mesh.name = 'layer:' + spec.id;
    return { spec, mesh, mat, loaded: { night, day: !night } };
  }));
  let other = null;
  const b = {
    layers,
    tried: false,
    // the other mode's images, fetched once (after the first frame, or before it if the mode changed while loading);
    // tried is true once that is over, loaded or not (a missing one leaves the first mode's picture in its place)
    later() {
      other ||= Promise.all(layers.map(async (l) => {
        const url = night ? l.spec.day : l.spec.night;
        if (url === (night ? l.spec.night : l.spec.day)) return;
        const t = await tex(url, anisotropy, signal);
        l.mat.uniforms[night ? 'uDay' : 'uNight'].value = t;
      })).catch(() => {}).then(() => { b.tried = true; });
      return other;
    },
  };
  return b;
}

export function paintBackdrop(backdrop, mix, fogColor) {
  for (const l of backdrop.layers) {
    l.mat.uniforms.uMix.value = mix;
    l.mat.uniforms.uFog.value = fogColor;
  }
}
