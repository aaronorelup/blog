// The materials of SPEC 4.8 and the uniforms they share. No scene lights anywhere: one lamp direction, one
// iris and one lights-out state are plain uniforms that every shader reads, so the whole room changes together.
// An "owner" is { glass, rim, glow, prism } from worlds/index.js: a colour always means whose part it is.
import { Color, DoubleSide, ShaderMaterial, Vector2, Vector3, Vector4 } from 'three';
import { coreFrag, cycFrag, dustFrag, dustVert, glassFrag, groundFrag, orbFrag, orbVert, paperFrag, worldVert } from './shaders.js';

const lum = (c) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;

export function createMaterials() {
  const shared = {
    uIris: { value: new Vector4(0, 0, 0, 1) }, uIrisTint: { value: new Color(0, 0, 0) }, uTime: { value: 0 },
    uDark: { value: new Vector4(0, 0, 0, 0) }, uGlowPos: { value: new Vector3() }, uGlowCol: { value: new Color(1, 1, 1) },
    uLight: { value: new Vector3(-0.34, 0.8, -0.5).normalize() }, uPaper: { value: new Color('#E6E8ED') },
    uWorld: { value: new Color('#E6E8ED') },
  };

  // Write an owner's colours into a glass or core material. Pale glass hatches toward grey, any other toward paper.
  function setOwner(mat, owner) {
    const u = mat.uniforms;
    u.uColor.value.set(owner.glass);
    u.uRim.value.set(owner.rim);
    if (u.uHot) u.uHot.value.set(owner.glass).multiplyScalar(1.3).addScalar(0.1).lerp(new Color(owner.glow), 0.35);
    if (u.uHatchCol) {
      const pale = lum(new Color(owner.glass).convertLinearToSRGB()) > 0.78;
      const tone = new Color(pale ? '#8C929C' : '#F8F9FB');
      u.uHatchCol.value.set(tone.r, tone.g, tone.b, pale ? 1 : 0);
    }
    if (u.uPrism) {
      u.uPrism.value = owner.prism ? 1 : 0;
      (owner.prism || []).forEach((hex, k) => u[`uP${k}`].value.set(hex));
    }
    mat.userData.owner = owner;
    return mat;
  }

  const mats = {
    shared,
    setOwner,

    // Cast glass for one floor (or a step, a door, a plinth). side: 0 always, 1 inside the iris, -1 outside.
    glass(owner, { halfH = 0.13, side = 0, alpha = 0.9 } = {}) {
      const mat = new ShaderMaterial({
        vertexShader: worldVert, fragmentShader: glassFrag, transparent: true, side: DoubleSide, depthWrite: true, extensions: { derivatives: true },
        uniforms: {
          ...shared,
          uColor: { value: new Color() }, uRim: { value: new Color() }, uHot: { value: new Color() }, uHatchCol: { value: new Vector4(1, 1, 1, 0) },
          uP0: { value: new Color() }, uP1: { value: new Color() }, uP2: { value: new Color() }, uP3: { value: new Color() },
          uAlpha: { value: alpha }, uHatch: { value: 0 }, uFrost: { value: 0 }, uPulse: { value: 0 }, uDim: { value: 0 },
          uHalfH: { value: halfH }, uSide: { value: side }, uPrism: { value: 0 }, uShow: { value: 1 },
        },
      });
      return setOwner(mat, owner);
    },

    // A solid piece inside the glass: a model core, a lamp, a bead. hatch marks it announced or preview.
    // ghost: drawn over the glass and faded by uFade, for a core behind frosted glass.
    core(owner, { side = 0, hatch = false, ghost = false } = {}) {
      const mat = new ShaderMaterial({
        vertexShader: worldVert, fragmentShader: coreFrag, transparent: ghost, depthTest: !ghost, depthWrite: !ghost,
        uniforms: {
          ...shared, uColor: { value: new Color() }, uRim: { value: new Color() }, uFade: { value: 1 },
          uActive: { value: 0 }, uShow: { value: 1 }, uSide: { value: side }, uHatch: { value: hatch ? 1 : 0 },
        },
      });
      return setOwner(mat, owner);
    },

    // Paper. blended: soft edges for cut-outs and type (sorted, no depth write). Otherwise opaque and dithered.
    // mask: the texture is ink coverage and prints in `tint` (titles, glyphs, marks drawn in type).
    // self: lights out leaves it alone (a mark on its plate is never darkened). plain: no texture, `tint` with grain.
    // torn: [x, y, frequency, seed] tears the upright edges or the top edge. edge: [x0, x1, width] (see shaders.js).
    paper(texture, { side = 1, tint = '#FFFFFF', blended = false, mask = false, opacity = 1, ground = null, fade = 0, depthTest = true, self = false, plain = false, torn = null, edge = null } = {}) {
      return new ShaderMaterial({
        vertexShader: worldVert, fragmentShader: paperFrag, transparent: blended, depthWrite: !blended, depthTest, side: DoubleSide,
        uniforms: {
          ...shared, uMap: { value: texture }, uTint: { value: new Color(tint) }, uGround: ground ? { value: new Color(ground) } : shared.uWorld,
          uSide: { value: side }, uOpacity: { value: opacity }, uFade: { value: fade }, uMode: { value: plain ? 2 : mask ? 1 : 0 }, uDither: { value: blended ? 0 : 1 }, uSelf: { value: self ? 1 : 0 },
          uTorn: { value: new Vector4(...(torn || [0, 0, 0, 0])) }, uEdge: { value: new Vector3(...(edge || [0, 0, 0])) },
        },
      });
    },

    ground() {
      const N = 8;
      return new ShaderMaterial({
        vertexShader: worldVert, fragmentShader: groundFrag,
        uniforms: {
          ...shared,
          uNear: { value: new Color('#F8F9FB') }, uFar: { value: new Color('#E6E8ED') }, uInkColor: { value: new Color('#0C0D10') },
          uInk: { value: null }, uInkRect: { value: new Vector4(-12, -7, 24, 14) }, uInkAmt: { value: 0 }, uFloorH: { value: 0.26 }, uHalf: { value: 1.2 },
          uTPos: { value: Array.from({ length: N }, () => new Vector2()) },
          uTCol: { value: Array.from({ length: N }, () => new Color('#8C929C')) },
          uTH: { value: new Array(N).fill(2.7) }, uTGap: { value: new Array(N).fill(0.045) },
          uTAmt: { value: new Array(N).fill(0) }, uTIn: { value: new Array(N).fill(0) },
        },
      });
    },

    cyc() {
      return new ShaderMaterial({
        vertexShader: worldVert, fragmentShader: cycFrag, side: DoubleSide, depthWrite: false,
        uniforms: { ...shared, uFar: { value: new Color('#E6E8ED') }, uTop: { value: new Color('#EEF0F4') } },
      });
    },

    orb({ side = 0 } = {}) {
      return new ShaderMaterial({
        vertexShader: orbVert, fragmentShader: orbFrag,
        uniforms: { ...shared, uLook: { value: new Vector3(0, 0, 1) }, uBody: { value: new Color('#070708') }, uBlink: { value: 1 }, uSide: { value: side } },
      });
    },

    dust(color, opacity = 0.5) {
      return new ShaderMaterial({
        vertexShader: dustVert, fragmentShader: dustFrag, transparent: true, depthWrite: false,
        uniforms: { ...shared, uColor: { value: new Color(color) }, uOpacity: { value: opacity }, uPx: { value: 1 }, uDrift: { value: 1 } },
      });
    },

  };
  return mats;
}
