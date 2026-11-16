// The podium of best at (SPEC 2.8): a step of frosted house glass under each stack with its place engraved, hatched
// when the call is contested or a tie, a sixth grey plinth at the end of the row for a leader outside the five, and
// fog that rolls in to chest height when nobody knows. set() takes the targets, update(dt, k) eases toward them at
// 3.2 a second and lifts the stacks. Steps are never plain boxes: the glass shader's frost and hatch carry them.
import { BoxGeometry, Color, Mesh, PlaneGeometry, ShaderMaterial } from 'three';
import { owner } from '../worlds/index.js';

const RATE = 3.2;
const DEPTH = 2.75;
const fogVert = /* glsl */ `varying vec2 vUv; varying vec3 vW;
void main() { vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const fogFrag = /* glsl */ `uniform float uAmt; uniform float uTime; uniform float uSeed; uniform vec3 uCol;
varying vec2 vUv; varying vec3 vW;
float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h(i), h(i + vec2(1.0, 0.0)), f.x), mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), f.x), f.y); }
void main() {
  vec2 p = vec2(vW.x * 0.3 - uTime * 0.11 + uSeed, vW.y * 0.85 + uSeed * 0.5);
  float m = n(p) * 0.62 + n(p * 2.4 + 3.7) * 0.38;
  float top = 1.0 - smoothstep(0.3, 1.0, vUv.y + (m - 0.5) * 0.4);
  float side = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x);
  gl_FragColor = vec4(uCol, uAmt * top * side * (0.45 + 0.55 * m) * 0.93);
  #include <colorspace_fragment>
}`;

export function createPodium(ctx, { plinthX }) {
  const { mats, textures, row, scene } = ctx;
  const house = owner('house');
  const engrave = [1, 2].map((k) => textures.title(String(k), 260));
  const stepGeo = new BoxGeometry(2.75, 1, DEPTH);
  const plateGeo = new PlaneGeometry(1, 1);

  function makeStep(x, glassOwner) {
    const mesh = new Mesh(stepGeo, mats.glass(glassOwner, { halfH: 0.5, alpha: 0.9 }));
    mesh.visible = false; mesh.renderOrder = 1;
    const mark = new Mesh(plateGeo, mats.paper(null, { side: 0, tint: '#0C0D10', blended: true, mask: true, opacity: 0 }));
    mark.visible = false; mark.renderOrder = 9;
    scene.add(mesh, mark);
    return { mesh, mark, x, h: 0, want: 0, kind: 'solid', place: 0, wl: 1.375, wr: 1.375 };
  }
  const steps = row.towers.map((tw) => makeStep(tw.x, house));
  const plinth = makeStep(plinthX, owner('outside'));
  plinth.mesh.material.uniforms.uFrost.value = 0.35;
  plinth.wl = plinth.wr = 0.95;                              // a narrower plinth: it carries a label, not a stack

  const fogs = [[2.95, 0.0], [1.8, 2.3], [-1.95, 4.9]].map(([z, seed]) => {
    const mat = new ShaderMaterial({ vertexShader: fogVert, fragmentShader: fogFrag, transparent: true, depthWrite: false,
      uniforms: { uAmt: { value: 0 }, uTime: { value: 0 }, uSeed: { value: seed }, uCol: { value: new Color('#EEF0F4') } } });
    const mesh = new Mesh(new PlaneGeometry(30, 2.5), mat);
    mesh.position.set(0, 1.25, z); mesh.renderOrder = z > 0 ? 20 : 2; mesh.visible = false;
    scene.add(mesh);
    return mesh;
  });

  const podium = {
    fog: 0, fogWant: 0, shift: 0,
    // places: [{ p: provider or 'outside', h, step: 'solid' or 'hatch', place }] and the verdict
    set(places, verdict) {
      const at = (id) => places.find((x) => x.p === id);
      row.towers.forEach((tw, t) => {
        const s = steps[t], x = at(tw.id);
        s.want = x ? x.h : 0; s.kind = x ? x.step : s.kind; s.place = x ? x.place : 0;
        // a tie is one shared low step: a tied neighbour's step reaches over to meet it
        const tie = (k) => verdict === 'tie' && row.towers[k] && at(row.towers[k].id);
        s.wl = x && tie(t - 1) ? 2.1 : 1.375; s.wr = x && tie(t + 1) ? 2.1 : 1.375;
      });
      const out = places.filter((x) => x.p === 'outside');
      plinth.want = out.length ? Math.max(...out.map((x) => x.h)) : 0;
      plinth.kind = out.length ? out[0].step : plinth.kind; plinth.place = out.length ? out[0].place : 0;
      podium.fogWant = verdict === 'unknown' ? 1 : 0;
    },
    // the top of the plinth, for its label
    plinthTop: () => plinth.h,
    update(dt, k, snap = false) {
      const e = snap ? 1 : 1 - Math.exp(-RATE * dt);
      const write = (s, x, tw) => {
        s.h += (s.want - s.h) * e;
        const h = s.h * k;
        const on = h > 0.004;
        s.mesh.visible = on; s.mark.visible = on && s.place > 0 && h > 0.25;
        if (!on) return;
        const w = s.wl + s.wr;
        s.mesh.position.set(x + (s.wr - s.wl) / 2, h / 2, 0);
        s.mesh.scale.set(w / 2.75, h, 1);
        const u = s.mesh.material.uniforms;
        u.uHatch.value = s.kind === 'hatch' ? 1 : 0;
        if (s !== plinth) u.uFrost.value = s.kind === 'hatch' ? 0.25 : 0.6;
        u.uDim.value = tw ? tw.dim : 0; u.uShow.value = 1;
        if (s.mark.visible) {
          const tex = engrave[s.place - 1];
          s.mark.material.uniforms.uMap.value = tex.texture;
          const size = Math.min(0.62, h * 0.6);
          s.mark.scale.set(size * tex.aspect, size, 1);
          s.mark.position.set(x, h * 0.5, DEPTH / 2 + 0.015);
          s.mark.material.uniforms.uOpacity.value = 0.62 * Math.min(1, (h - 0.25) * 4);
        }
        if (tw) tw.lift = h;
      };
      row.towers.forEach((tw, t) => write(steps[t], tw.x + tw.shift, tw));
      write(plinth, plinthX + podium.shift, null);
      podium.fog += (podium.fogWant - podium.fog) * (snap ? 1 : 1 - Math.exp(-1.6 * dt));
      fogs.forEach((m, i) => {
        const a = podium.fog * k;
        m.visible = a > 0.005;
        m.material.uniforms.uAmt.value = a;
        m.material.uniforms.uTime.value = ctx.reduced ? 0 : ctx.time;
        m.position.x = (1 - podium.fog) * (i % 2 ? 7 : -7) + podium.shift;       // it rolls in from the sides
      });
    },
    hide() { [...steps, plinth].forEach((s) => { s.mesh.visible = false; s.mark.visible = false; }); fogs.forEach((m) => { m.visible = false; }); },
    dispose() {
      [...steps, plinth].forEach((s) => { scene.remove(s.mesh, s.mark); s.mesh.material.dispose(); s.mark.material.dispose(); });
      fogs.forEach((m) => { scene.remove(m); m.geometry.dispose(); m.material.dispose(); });
      engrave.forEach((t) => t.texture.dispose());
      stepGeo.dispose(); plateGeo.dispose();
    },
  };
  return podium;
}
