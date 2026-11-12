// three.js for the hero, reached through the same dynamic imports <ao-model> makes (src/elements/ao-model): a static
// `import { X } from 'three'` here would add X to the shared three chunk's exports and re-hash it and GLTFLoader's, so
// the homepage would download three again after a deploy. loadThree() fills these live bindings once; stage.js awaits
// it before anything else, so no hero module may make a three object at its top level.
export let ACESFilmicToneMapping, AdditiveBlending, AmbientLight, BufferGeometry, CanvasTexture, CatmullRomCurve3,
  Color, DirectionalLight, EquirectangularReflectionMapping, Euler, Float32BufferAttribute, Fog, GLTFLoader, Group,
  HemisphereLight, MathUtils, Mesh, PerspectiveCamera, PlaneGeometry, PMREMGenerator, PointLight, Points, Quaternion,
  Scene, ShaderMaterial, Sprite, SpriteMaterial, SRGBColorSpace, TextureLoader, Vector3, WebGLRenderer;

let loading = null;
export function loadThree() {
  loading ||= Promise.all([import('three'), import('three/examples/jsm/loaders/GLTFLoader.js')]).then(([T, G]) => {
    ({
      ACESFilmicToneMapping, AdditiveBlending, AmbientLight, BufferGeometry, CanvasTexture, CatmullRomCurve3, Color,
      DirectionalLight, EquirectangularReflectionMapping, Euler, Float32BufferAttribute, Fog, Group, HemisphereLight,
      MathUtils, Mesh, PerspectiveCamera, PlaneGeometry, PMREMGenerator, PointLight, Points, Quaternion, Scene,
      ShaderMaterial, Sprite, SpriteMaterial, SRGBColorSpace, TextureLoader, Vector3, WebGLRenderer,
    } = T);
    ({ GLTFLoader } = G);
  });
  return loading;
}
