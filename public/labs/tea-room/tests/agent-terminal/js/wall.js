// The wall of ten: the ten music videos of the gauntlet post on ten small screens standing on the glass, all playing
// at once without sound. On each screen perches a paper animal: its paper says which model made the video, its fold
// how much effort it was given. One screen at a time can be heard, and only when the reader has turned the sound on.
import * as THREE from 'three';
import { PAL, clamp, ss, box, lit, glow } from './kit.js';
import { makeFigure } from './origami.js';
import { WALL, LOOP_AT, FOLD_OF_LEVEL } from './data.js';

export const SW = 2.4, SH = 1.35;
const HERE = new URL('../img/wall/', import.meta.url).href;

export function makeWall({ tall, canPlay, invalidate, holder }) {
  const group = new THREE.Group();
  const GX = 0.42, GY = tall ? 0.74 : 0.82, FOOT = 0.5;
  const postM = lit(0x15161c), bezelM = lit(0x0b0c11);
  const loader = new THREE.TextureLoader();
  const screens = WALL.map((w, i) => {
    // wide: five columns Low to Max, the upper row one model and the lower row the other.
    // tall: two columns, one a model, and five rows, Low at the foot and Max at the top.
    const cx = tall ? (w.row - 0.5) * (SW + GX) : (w.level - 2) * (SW + GX);
    const by = tall ? FOOT + w.level * (SH + GY) : FOOT + (1 - w.row) * (SH + GY);
    const curve = tall ? 0 : 24;
    const yaw = curve ? -Math.asin(cx / curve) : 0, cz = curve ? curve - Math.sqrt(curve * curve - cx * cx) : 0;
    const g = new THREE.Group(); g.position.set(cx, by, cz); g.rotation.y = yaw;
    const poster = loader.load(HERE + w.loop + '.webp', invalidate); poster.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({ map: poster, toneMapped: false });
    const geo = new THREE.PlaneGeometry(SW, SH); geo.translate(0, SH / 2, 0);
    const pic = new THREE.Mesh(geo, mat); pic.position.z = 0.05;
    const bezel = box(SW + 0.14, SH + 0.14, 0.08, bezelM); bezel.geometry.translate(0, SH / 2, 0);
    // a thin line of light round the one that is heard
    const rim = new THREE.Mesh(new THREE.PlaneGeometry(SW + 0.2, SH + 0.2), new THREE.MeshBasicMaterial({ color: PAL.amber, transparent: true, opacity: 0 }));
    rim.geometry.translate(0, SH / 2, 0); rim.position.z = 0.045;
    const fig = makeFigure(FOLD_OF_LEVEL[w.level], { paper: w.row === 0 ? PAL.cream : PAL.blue, line: w.row === 0 ? 0x6b5f4a : 0xdfe6ff, lineOpacity: 0.95, glowAmt: 0.5, print: false });
    fig.group.scale.setScalar((w.level >= 3 ? 0.3 : 0.34) * (tall ? 0.86 : 1));
    fig.group.position.set(SW / 2 - (tall ? 0.2 : 0.44), SH + 0.075, 0.02); fig.group.rotation.y = -0.55;
    g.add(bezel, rim, pic, fig.group);
    group.add(g);
    return { w, i, g, pic, mat, rim, fig, poster, by, video: null, vtex: null };
  });
  // one post behind each column
  const posts = [];
  const cols = tall ? 2 : 5, topY = tall ? FOOT + 4 * (SH + GY) + SH : FOOT + SH + GY + SH;
  for (let c = 0; c < cols; c++) {
    const s = screens.find((x) => (tall ? x.w.row : x.w.level) === c);
    const p = box(0.1, topY, 0.1, postM); p.geometry.translate(0, topY / 2, 0); p.position.set(s.g.position.x, 0, s.g.position.z - 0.1);
    group.add(p); posts.push(p);
  }
  const size = { w: tall ? 2 * SW + GX : 5 * SW + 4 * GX, h: topY + 0.5 };

  // ------------------------------------------------------------ the pictures: a still first, the loop when it runs
  let loaded = false, playing = false, soundOn = false, picked = -1, heard = -1;
  let full = null, fullTex = null;
  function load() {
    if (loaded || !canPlay) return; loaded = true;
    screens.forEach((s, i) => {
      const v = document.createElement('video');
      v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true; v.preload = 'auto'; v.setAttribute('playsinline', ''); v.setAttribute('muted', ''); v.disableRemotePlayback = true;
      v.src = LOOP_AT + s.w.loop + '.mp4';
      // the ten loops do not all cut at the same moment
      v.addEventListener('loadedmetadata', () => { try { v.currentTime = (i * 0.83) % 8; } catch (e) { /* not seekable yet */ } }, { once: true });
      v.addEventListener('playing', () => {
        if (s.vtex) return;
        s.vtex = new THREE.VideoTexture(v); s.vtex.colorSpace = THREE.SRGBColorSpace;
        if (heard !== i) { s.mat.map = s.vtex; s.mat.needsUpdate = true; }
      }, { once: true });
      v.addEventListener('error', () => { s.failed = true; }, { once: true });
      s.video = v; if (holder) holder.append(v);
    });
    if (playing) screens.forEach((s) => { const p = s.video.play(); if (p) p.catch(() => {}); });
  }
  function setPlaying(on) {
    if (on === playing) return; playing = on;
    if (!loaded) return;
    screens.forEach((s) => { if (!s.video || s.i === heard) return; if (on) { const p = s.video.play(); if (p) p.catch(() => {}); } else s.video.pause(); });
    if (full) { if (on && heard >= 0 && soundOn) { const p = full.play(); if (p) p.catch(() => {}); } else full.pause(); }
  }
  // the one that is heard plays the post's own whole video, picture and sound together
  function hear(i) {
    if (i === heard) return;
    if (heard >= 0) {
      const s = screens[heard];
      s.mat.map = s.vtex || s.poster; s.mat.needsUpdate = true;
      if (s.video && playing) { const p = s.video.play(); if (p) p.catch(() => {}); }
    }
    heard = i;
    if (!full) return;
    if (i < 0) { full.pause(); return; }
    const s = screens[i];
    full.src = s.w.full; full.muted = false; full.currentTime = 0;
    const token = i;
    const p = full.play();
    if (p) p.then(() => {
      if (heard !== token) return;
      if (!fullTex) { fullTex = new THREE.VideoTexture(full); fullTex.colorSpace = THREE.SRGBColorSpace; }
      s.mat.map = fullTex; s.mat.needsUpdate = true;
      if (s.video) s.video.pause();
    }).catch(() => { if (heard === token) heard = -1; });
  }
  function setSound(on) {
    soundOn = on;
    if (on) {
      if (!full) {
        full = document.createElement('video'); full.playsInline = true; full.setAttribute('playsinline', ''); full.preload = 'auto'; full.loop = true; full.disableRemotePlayback = true;
      }
      hear(picked >= 0 ? picked : 4);
      if (picked < 0) picked = 4;
    } else hear(-1);
    return picked;
  }
  function pick(i) {
    if (i === picked) return; picked = i;
    if (soundOn && i >= 0) hear(i);
  }

  return {
    group, screens, size, load, setPlaying, setSound, pick,
    get picked() { return picked; }, get heard() { return heard; }, get soundOn() { return soundOn; },
    // rise: 0 nothing stands yet, 1 all ten are up; they unroll upward one after another, Low first
    update(rise, t, dim) {
      posts.forEach((p, c) => { const e = ss(0, 1, clamp(rise * 2.6 - c * (tall ? 0.1 : 0.2))); p.scale.y = Math.max(0.001, e); p.visible = e > 0.002; });
      screens.forEach((s) => {
        const e = ss(0, 1, clamp(rise * 1.9 - s.w.level * 0.18 - s.w.row * 0.08));
        const pop = s.i === picked ? 1 : 0;
        s.g.scale.set(1, Math.max(0.001, e), 1); s.g.visible = e > 0.002;
        s.pic.position.z = 0.05 + pop * 0.02;
        s.rim.material.opacity = pop * (s.i === heard ? 0.95 : 0.5);
        s.mat.color.setScalar(dim * (picked >= 0 && !pop ? 0.82 : 1));
        s.fig.set(1, s.w.level === 4 ? Math.sin(Math.floor(t * 12) / 12 * 2.2 + s.i) * 0.12 : 0);
        s.fig.group.rotation.z = Math.sin(Math.floor(t * 12) / 12 * 1.7 + s.i * 1.9) * 0.035;
      });
    },
    dispose() {
      screens.forEach((s) => { if (s.video) { s.video.pause(); s.video.removeAttribute('src'); s.video.load(); } if (s.vtex) s.vtex.dispose(); s.poster.dispose(); });
      if (full) { full.pause(); full.removeAttribute('src'); full.load(); } if (fullTex) fullTex.dispose();
    },
  };
}
