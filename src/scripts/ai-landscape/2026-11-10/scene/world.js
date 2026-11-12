// A world: the paper theatre behind one stack (SPEC 4.1, 4.4). The plate on a curved wall, the framed portrait,
// cut-out props at three depths, a foreground edge, dust, and the name standing behind the stack. Everything
// here is drawn only inside the iris, which opens from the stack: the grey studio is simply still there outside.
// One generic scene for all five: a world is this plus its configuration (worlds/<id>.js) and its pictures.
import { BufferGeometry, Color, CylinderGeometry, Float32BufferAttribute, Group, Mesh, PlaneGeometry, Points, Vector3 } from 'three';

// The curved wall the plate hangs on: 64 degrees of arc (SPEC 4.1), which covers a 16:9 frame at the open stop with
// the pointer at either end. Behind it stands one plain back wall in the world's ground colour, wide enough for
// 21:9: where the plate ends, it ends in a torn paper edge with a soft shadow, never in bare studio.
const RAD = Math.PI / 180;
const WALL = { radius: 34, arc: 64 * RAD, behind: 22 };
WALL.height = (WALL.radius * WALL.arc) / 2;
const BACK = { radius: 36.5, arc: 150 * RAD, height: 26, torn: 0.4, shade: 1.2 };

export function createWorlds(ctx) {
  const { scene, mats, textures } = ctx;
  const sh = mats.shared;
  const mounted = new Map();
  const v = new Vector3();
  const fwd = new Vector3();
  const HOUSE = new Color('#E6E8ED');
  const size = { w: 1, h: 1, ratio: 1 };

  function build(cfg, tower) {
    const group = new Group();
    group.position.set(tower.x, 0, tower.z);
    scene.add(group);
    const urls = [];
    const use = (url) => { if (url) urls.push(url); return textures.load(url); };
    const ground = cfg.theme.ground;
    const inst = { id: cfg.id, cfg, tower, group, open: 0, name: null, nameRect: null, nameShow: 0, ready: null, parts: {} };

    // the plate on the inside of a curved wall, 2:1 from the 16:9 picture (the top of the picture is cropped).
    // backdrop.full keeps the whole picture: the wall grows upward by an eighth, so it can hang lower
    const full = cfg.backdrop.full ? 9 / 8 : 1;
    const geo = new CylinderGeometry(WALL.radius, WALL.radius, WALL.height * full, 48, 1, true, Math.PI - WALL.arc / 2, WALL.arc);
    const uv = geo.attributes.uv;
    // backdrop.flip hangs the picture mirrored, for a plate whose subject would stand behind the stack
    for (let i = 0; i < uv.count; i++) uv.setXY(i, cfg.backdrop.flip ? uv.getX(i) : 1 - uv.getX(i), uv.getY(i) * (8 / 9) * full);
    const wall = new Mesh(geo, mats.paper(null, { side: 1, torn: [BACK.torn / (WALL.radius * WALL.arc), 0, 46, cfg.id.length] }));
    wall.position.set(0, cfg.backdrop.y + (WALL.height * full) / 2, WALL.radius - WALL.behind);
    wall.rotation.y = cfg.backdrop.turn || 0;
    wall.visible = false; wall.renderOrder = -8;
    group.add(wall);
    // the plain back wall: the world's ground, 6 percent darker, with grain, and a soft shadow where the plate ends
    const half = WALL.arc / BACK.arc / 2;
    const tone = new Color(ground).multiplyScalar(0.94);
    const back = new Mesh(new CylinderGeometry(BACK.radius, BACK.radius, BACK.height, 56, 1, true, Math.PI - BACK.arc / 2, BACK.arc),
      mats.paper(null, { side: 1, plain: true, tint: `#${tone.getHexString()}`, edge: [0.5 - half, 0.5 + half, BACK.shade / (BACK.radius * BACK.arc)] }));
    back.position.set(0, BACK.height / 2 - 5, WALL.radius - WALL.behind);
    back.rotation.y = wall.rotation.y;
    back.renderOrder = -9;
    group.add(back);
    inst.ready = use(ctx.quality.small ? cfg.art.plateSmall || cfg.art.plate : cfg.art.plate || cfg.art.plateSmall).then((tex) => {
      if (!tex || !inst.group.parent) return;
      wall.material.uniforms.uMap.value = tex; wall.visible = true;
    });

    // the framed portrait hangs on the wall, right of centre
    if (cfg.portrait && cfg.art.portrait) {
      const px = cfg.portrait.x;
      const z = WALL.radius - WALL.behind - Math.sqrt(WALL.radius * WALL.radius - px * px) + 0.25;
      const frame = new Mesh(new PlaneGeometry(3.36, 4.36), mats.paper(null, { side: 1 }));
      frame.position.set(px, cfg.portrait.y, cfg.portrait.z ?? z);
      frame.rotation.y = -Math.asin(px / WALL.radius);
      frame.visible = false; frame.renderOrder = -7; frame.userData.portrait = true;
      group.add(frame);
      inst.parts.portrait = frame;
      textures.framed(cfg.art.portrait).then((tex) => { if (tex && inst.group.parent) { frame.material.uniforms.uMap.value = tex; frame.visible = true; inst.parts.portraitTex = tex; } });
    }

    // props: flat cut-outs parallel to the screen at their depths, like a paper theatre. The far ones fade a little
    const cut = (url, place, order) => {
      const mesh = new Mesh(new PlaneGeometry(1, 1), mats.paper(null, { side: 1, blended: true, ground, fade: Math.max(0, Math.min(0.14, -place.z * 0.012)) }));
      mesh.position.set(place.x, place.y, place.z);
      mesh.visible = false; mesh.renderOrder = order;
      group.add(mesh);
      use(url).then((tex) => {
        if (!tex || !inst.group.parent) return;
        mesh.material.uniforms.uMap.value = tex;
        mesh.scale.set(place.w, (place.w * tex.image.height) / tex.image.width, 1);
        mesh.visible = true;
      });
      return mesh;
    };
    inst.parts.props = cfg.props.slice(0, ctx.quality.props).map((p, k) => cut(cfg.art.props[(p.file || k + 1) - 1], p, -6 + k));
    if (cfg.fore && cfg.art.fore) inst.parts.fore = cut(cfg.art.fore, cfg.fore, 12);

    // dust: slow motes in the world's light colour
    if (ctx.quality.dust > 0) {
      const n = ctx.quality.dust;
      const pos = new Float32Array(n * 3);
      const ph = new Float32Array(n);
      let seed = 7 + cfg.id.length * 13;
      const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
      for (let i = 0; i < n; i++) { pos[i * 3] = (rnd() - 0.5) * 22 + 1.5; pos[i * 3 + 1] = 0.3 + rnd() * 8.5; pos[i * 3 + 2] = -12 + rnd() * 17; ph[i] = rnd() * 6.283; }
      const g = new BufferGeometry();
      g.setAttribute('position', new Float32BufferAttribute(pos, 3));
      g.setAttribute('aPh', new Float32BufferAttribute(ph, 1));
      const dust = new Points(g, mats.dust(cfg.dust || cfg.theme.glow, 0.5));
      dust.frustumCulled = false; dust.renderOrder = 10;
      dust.material.uniforms.uDrift.value = ctx.reduced ? 0 : 1;
      group.add(dust);
      inst.parts.dust = dust;
    }

    // the name behind the stack: type printed on a plane that always faces the camera, placed to match a DOM box
    inst.setName = (text) => {
      if (inst.nameText === text) return;
      inst.nameText = text;
      const t = textures.title(text.toUpperCase());
      if (inst.name) { inst.name.material.uniforms.uMap.value.dispose(); inst.name.material.uniforms.uMap.value = t.texture; }
      else {
        inst.name = new Mesh(new PlaneGeometry(1, 1), mats.paper(t.texture, { side: 1, blended: true, mask: true, tint: cfg.theme.ink }));
        inst.name.renderOrder = -2; inst.name.frustumCulled = false;
        scene.add(inst.name);
      }
      inst.nameAspect = t.aspect;
    };

    inst.dispose = () => {
      group.traverse((o) => { if (o.isMesh || o.isPoints) { o.geometry.dispose(); o.material.dispose(); } });
      scene.remove(group);
      if (inst.name) { scene.remove(inst.name); inst.name.material.uniforms.uMap.value.dispose(); inst.name.material.dispose(); }
      if (inst.parts.portraitTex) inst.parts.portraitTex.dispose();
      urls.forEach((u) => textures.release(u));
    };
    return inst;
  }

  const worlds = {
    active: null,
    // The world of `cfg` behind `tower`. Mounting is cheap: pictures arrive when they have loaded.
    mount(cfg, tower) {
      if (!mounted.has(cfg.id)) mounted.set(cfg.id, build(cfg, tower));
      return mounted.get(cfg.id);
    },
    unmount(id) { const inst = mounted.get(id); if (inst) { inst.dispose(); mounted.delete(id); if (worlds.active === inst) worlds.active = null; } },
    reset() { for (const inst of mounted.values()) { inst.open = 0; inst.nameShow = 0; } },
    resize(w, h, ratio) { size.w = w; size.h = h; size.ratio = ratio; },

    // Write the iris and the world's ground for whichever world is open this frame. inst.open: 0 shut .. 1 open.
    update() {
      let top = null;
      for (const inst of mounted.values()) {
        inst.group.visible = inst.open > 0.001;
        if (inst.name) inst.name.visible = false;
        if (inst.open > 0.001 && (!top || inst.open > top.open)) top = inst;
      }
      worlds.active = top;
      mats.irisOpen = top ? top.open : 0;           // a plain number for code that cannot read the iris in a shader
      if (!top) { sh.uIris.value.z = 0; sh.uIrisTint.value.setRGB(0, 0, 0); sh.uPaper.value.copy(HOUSE); return; }
      const cam = ctx.camera;
      const t = top.tower;
      top.group.position.set(t.x + t.shift, 0, t.z);
      v.set(t.x + t.shift, 2.5, t.z).project(cam);
      const bw = size.w * size.ratio, bh = size.h * size.ratio;
      const cx = v.x * 0.5 + 0.5, cy = v.y * 0.5 + 0.5;
      const reach = Math.hypot(Math.max(cx, 1 - cx) * 2 * (size.w / size.h), Math.max(cy, 1 - cy) * 2) / 1.2 + 0.2;
      sh.uIris.value.set(cx * bw, cy * bh, top.open >= 0.999 ? 9 : top.open * reach, 2 / bh);
      sh.uIrisTint.value.set(top.cfg.theme.line).multiplyScalar(top.open >= 0.999 ? 0 : 1);
      sh.uWorld.value.set(top.cfg.theme.ground);
      sh.uPaper.value.copy(HOUSE).lerp(sh.uWorld.value, Math.min(1, top.open * 1.5));
      if (top.parts.dust) top.parts.dust.material.uniforms.uPx.value = size.ratio * size.h * 0.26;      // motes about 0.25 units across, soft

      // the name: a camera-facing plane behind the stack, sized so it covers the DOM box given in nameRect
      const r = top.nameRect;
      if (top.name && r && top.nameShow > 0.01 && r.width > 4) {
        cam.getWorldDirection(fwd);
        const depth = v.set(t.x, 2.5, t.z - 2.6).sub(cam.position).dot(fwd);
        const unit = (2 * depth * Math.tan((cam.fov * RAD) / 2)) / size.h;          // world units per CSS pixel at that depth
        const w = r.width * unit;
        v.set(((r.left + r.width / 2) / size.w) * 2 - 1, -((r.top + r.height / 2) / size.h) * 2 + 1, 0.5).unproject(cam).sub(cam.position).normalize();
        top.name.position.copy(cam.position).addScaledVector(v, depth / v.dot(fwd));
        top.name.quaternion.copy(cam.quaternion);
        top.name.scale.set(w, w / top.nameAspect, 1);
        top.name.material.uniforms.uOpacity.value = top.nameShow;
        top.name.visible = true;
      }
    },
  };
  return worlds;
}
