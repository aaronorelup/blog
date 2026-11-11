// The hero's manifest (public/tea/hero/manifest.json; its format is documented in the hero-runtime status file):
// fetched once, then every optional field given its default so the other modules read plain values. A manifest the
// runtime cannot use throws, which leaves the poster.
const V3 = (v, d = [0, 0, 0]) => (Array.isArray(v) && v.length === 3 ? v.map(Number) : d.slice());

export async function loadManifest(url) {
  const res = await fetch(url, { credentials: 'same-origin' });
  if (!res.ok) throw new Error('manifest ' + res.status);
  return normalise(await res.json(), url);
}

export function normalise(m, url) {
  if (!m || m.version !== 1) throw new Error('manifest version');
  const base = new URL(url, location.href);
  const abs = (u) => (u ? new URL(u, base).href : null);
  const cam = m.camera || {};
  if (!Array.isArray(cam.keys) || cam.keys.length < 2) throw new Error('manifest camera keys');
  return {
    reference: { aspect: (m.reference && m.reference.aspect) || 1.6 },
    background: ((m.background && m.background.layers) || []).map((l, i) => ({
      id: l.id || 'layer' + i,
      night: abs(l.night || l.src), day: abs(l.day || l.night || l.src),
      z: Number(l.z ?? -10), size: l.size || [20, 12.5], y: Number(l.y ?? 0), x: Number(l.x ?? 0),
      cutout: !!l.cutout, fog: Number(l.fog ?? 0), portraitScale: Number(l.portraitScale ?? 1.5),
    })),
    actors: (m.actors || []).map((a) => ({
      id: a.id, src: abs(a.src), scale: Number(a.scale ?? 1),
      position: V3(a.position), rotation: V3(a.rotation), portraitPosition: a.portraitPosition ? V3(a.portraitPosition) : null,
      rig: { kind: (a.rig && a.rig.kind) || 'baked', map: (a.rig && a.rig.map) || {} },
      deform: a.deform || null, materials: a.materials || {}, tint: a.tint || null,
      envIntensity: Number(a.envIntensity ?? 0.6),
      props: (a.props || []).map((p) => ({
        id: p.id, src: abs(p.src), parent: p.parent || null, scale: Number(p.scale ?? 1),
        position: V3(p.position), rotation: V3(p.rotation), materials: p.materials || {},
      })),
    })),
    lights: (m.lights || []).map((l) => ({
      id: l.id, type: l.type || 'point', attach: l.attach || null, flicker: l.flicker || null,
      distance: Number(l.distance ?? 0), decay: Number(l.decay ?? 2),
      night: litState(l.night || l), day: litState(l.day || l.night || l),
    })),
    glows: (m.glows || []).map((g) => ({
      attach: g.attach || null, position: V3(g.position), size: Number(g.size ?? 1), color: g.color || '#FFD892',
      night: Number(g.night ?? 1), day: Number(g.day ?? 0.4), flicker: g.flicker || null,
    })),
    camera: {
      fov: Number(cam.fov ?? 34), near: Number(cam.near ?? 0.05), far: Number(cam.far ?? 80),
      keys: cam.keys.map((k) => ({ t: Number(k.t), pos: V3(k.pos), look: V3(k.look) }))
        .sort((a, b) => a.t - b.t),
      parallax: { x: 0.3, y: 0.18, ease: 4, drift: 0.5, ...(cam.parallax || {}) },
      portrait: portraitOf(cam.portrait || {}),
      // the dock layout's lens shift: a number, or keys [[t, shift], ...] along the scene's progress; cover: the share
      // of the frame's width the docked box covered where they were tuned (the shift scales with the share it covers)
      dock: { shift: keysOf((cam.dock && cam.dock.shift) ?? 0), cover: Number((cam.dock && cam.dock.cover) ?? 0.33) },
    },
    tracks: (m.tracks || []).map(track),
    idle: (m.idle || []).map((t) => ({
      actor: t.actor, node: t.node || null, channel: t.channel,
      amp: Array.isArray(t.amp) ? t.amp.map(Number) : Number(t.amp ?? 0),
      hz: Number(t.hz ?? 0.5), phase: Number(t.phase ?? 0), wave: t.wave || 'sin',
      scroll: t.scroll || null,
    })),
    motes: { count: 140, mobile: 50, size: 0.05, box: [[-6, -0.5, -5], [6, 5, 4]], ...(m.motes || {}) },
    look: {
      night: { exposure: 1, fog: '#0B1030', clear: '#121A1E', ...(m.look && m.look.night) },
      day: { exposure: 1, fog: '#C98A6B', clear: '#3E4A2C', ...(m.look && m.look.day) },
    },
  };
}

// travel: how much of a whole actor's own sideways travel (its position track's x) a portrait screen keeps. aspect:
// the portrait frame (the tall poster's shape): narrower screens keep its height and crop its sides, wider ones crop
// its top and bottom
const portraitOf = (p) => {
  const o = { fov: 46, spread: 0.55, pull: 1.6, drop: 0.9, aspect: 430 / 932, ...p };
  return { ...o, travel: Number(p.travel ?? o.spread) };
};

const keysOf = (v) => (Array.isArray(v) ? v.map(([t, x]) => [Number(t), Number(x)]).sort((a, b) => a[0] - b[0])
  : [[0, Number(v) || 0]]);

function litState(s) {
  return {
    color: s.color || '#FFFFFF', ground: s.ground || '#000000', intensity: Number(s.intensity ?? 1),
    position: V3(s.position, [0, 5, 5]),
  };
}

function track(t) {
  return {
    actor: t.actor, node: t.node || null, channel: t.channel, ease: t.ease || 'smooth',
    keys: (t.keys || []).map(([at, v]) => [Number(at), Array.isArray(v) ? v.map(Number) : Number(v)])
      .sort((a, b) => a[0] - b[0]),
  };
}
