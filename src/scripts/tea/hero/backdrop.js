// The one picture behind the characters: a plane set back in the scene, plus cut-out layers of the same picture at
// nearer depths (alpha in the image). Each layer holds its night and day image and mixes them by the mode; the
// current mode's image loads first, the other after the first frame (later()).
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

let texLoader = null;
function tex(url, anisotropy) {
  texLoader ||= new TextureLoader();
  return texLoader.loadAsync(url).then((t) => {
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = anisotropy;
    return t;
  });
}

export async function loadBackdrop(manifest, night, anisotropy) {
  const layers = await Promise.all(manifest.background.map(async (spec, i) => {
    const first = await tex(night ? spec.night : spec.day, anisotropy);
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
  return {
    layers,
    // the other mode's images, fetched once the first frame is up
    later() {
      return Promise.all(layers.map(async (l) => {
        const url = night ? l.spec.day : l.spec.night;
        if (url === (night ? l.spec.night : l.spec.day)) return;
        const t = await tex(url, anisotropy);
        l.mat.uniforms[night ? 'uDay' : 'uNight'].value = t;
      })).catch(() => {});
    },
  };
}

export function paintBackdrop(backdrop, mix, fogColor) {
  for (const l of backdrop.layers) {
    l.mat.uniforms.uMix.value = mix;
    l.mat.uniforms.uFog.value = fogColor;
  }
}
