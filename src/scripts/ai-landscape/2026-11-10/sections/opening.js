// The opening (SPEC 2.1): a flat poster seen from straight above, five lids and the title printed on the floor,
// that tilts into five stacks by a dolly zoom 0.9 s after the scene is up. Then the idle tour (4.6), and the
// scroll scrubs the camera down to the level row. pose(), place() and print() are exported for the ending,
// which runs the same move backwards. Tests read window.__landscape.opening { t, tour } and may set { at }.
import { PerspectiveCamera, Vector3 } from 'three';
import { backOut, damp, easeIO, lerp, smooth, span } from '../core/clock.js';
import { $, $$, fade } from '../core/dom.js';
import { HOURS } from '../scene/studio.js';

const RAD = Math.PI / 180;
export const SUBJECT = [0, 2.7, 0];                 // the middle lid: what keeps its width through the dolly zoom
const ACROSS = { wide: 24, phone: 21, tall: 14.4 };  // world units the screen holds on the poster (--u in frame.css)
const HERO = { tilt: 69, turn: -7, look: [0.3, 0.7, 2.4], cy: 0.5 };
const HERO_PHONE = { tilt: 72, turn: -9, look: [0, 1.6, 0.6], cy: 0.37 };
const PX = 600;                                        // the size the floor print is drawn at, in pixels a letter
export const LID = { flat: 1.56, high: 1.0, up: 1.9 };   // the mark plate: its width lying on the lid, and held over the character

// The camera between the poster (e = 0, lens 5 degrees, straight above) and the three-quarter row (e = 1, lens 24).
// It stays on a sphere around SUBJECT whose radius follows the lens, so the lids keep their width on screen.
// z0 is how far in front of the lids the poster is centred, in world units (--z0 in frame.css).
export function pose(ctx, e, z0) {
  const h = ctx.phone ? HERO_PHONE : HERO;
  const aspect = ctx.camera.aspect;
  const tall = Math.max(ctx.phone ? ACROSS.phone : ACROSS.wide, ACROSS.tall * aspect) / aspect;
  const fov = lerp(5, 24, Math.pow(e, 1.6));
  const r = tall / (2 * Math.tan((fov * RAD) / 2));
  const tilt0 = Math.asin((z0 + 0.6) / (tall / (2 * Math.tan(2.5 * RAD))));
  const tilt = lerp(tilt0, h.tilt * RAD, e), turn = h.turn * RAD * e;
  return {
    pos: [SUBJECT[0] + r * Math.sin(tilt) * Math.sin(turn), SUBJECT[1] + r * Math.cos(tilt), SUBJECT[2] + r * Math.sin(tilt) * Math.cos(turn)],
    look: [h.look[0] * e, h.look[1] * e, lerp(z0, h.look[2], e)],
    fov, cy: lerp(0.5, h.cy, e), tilt,
  };
}

// Set a lid plate to a width `s` and a height `up` above its stack (row.js derives both from lift and size).
export function place(lid, s, up) {
  const b = 0.5 * s + 0.231 - 0.45 * up;
  lid.lift = (-b + Math.sqrt(b * b + 0.4158 * up)) / 0.378;
  lid.size = s / (0.55 + 0.45 * lid.lift);
}

// Print on the floor the words of `el`, exactly where the page shows them on the poster. The element is the ruler:
// its letters are measured, then carried through the poster's camera down to the floor. Returns the printed type.
export function print(ctx, el, z0, made) {
  const cs = getComputedStyle(el);
  const text = cs.textTransform === 'uppercase' ? el.textContent.toUpperCase() : el.textContent;
  const type = made || ctx.textures.title(text, PX);
  const img = type.texture.image;
  const probe = document.createElement('span');          // no size, on the baseline, where the pen starts
  probe.style.cssText = 'display:inline-block;width:0;height:0';
  el.prepend(probe);
  const pen = probe.getBoundingClientRect();
  probe.remove();
  const g = document.createElement('canvas').getContext('2d');
  g.font = `400 ${PX}px ${cs.fontFamily}`;
  const m = g.measureText(text), k = parseFloat(cs.fontSize) / PX;
  const left = pen.left - (m.actualBoundingBoxLeft + 4) * k, top = pen.bottom - (m.actualBoundingBoxAscent + 4) * k;
  const stop = pose(ctx, 0, z0);
  const cam = new PerspectiveCamera(stop.fov, ctx.camera.aspect, 0.5, 700);
  cam.position.set(...stop.pos); cam.up.set(0, 0, -1); cam.lookAt(...stop.look); cam.updateMatrixWorld();
  const box = ctx.canvas.getBoundingClientRect();
  const floor = (x, y) => {
    const v = new Vector3(((x - box.left) / box.width) * 2 - 1, 1 - ((y - box.top) / box.height) * 2, 0.5).unproject(cam).sub(cam.position);
    return v.multiplyScalar(-cam.position.y / v.y).add(cam.position);
  };
  const a = floor(left, top), b = floor(left + img.width * k, top + img.height * k);
  ctx.studio.setInk(type.texture, [a.x, b.z, b.x - a.x, a.z - b.z]);
  return type;
}

export function create(ctx, el, sec) {
  const { rig, row, studio, labels, input } = ctx;
  const towers = row.towers;
  const ruler = $('.ail-print span', el);
  const words = $('.ail-open__words', el);
  const tourEl = $('.ail-open__tour', el);
  const list = $('.ail-open__five', el);
  const caps = $$('.ail-open__co', el).map((li) => { const at = new Vector3(); return { li, at, pin: ctx.phone ? null : labels.pin(li, at, { ax: 0.5, ay: 0 }) }; });
  const skip = ctx.reduced || !!window.location.hash || window.scrollY > 100;
  const st = { t0: -1, born: -1, last: -1, heard: -1, type: null, laid: false, z0: 0, tour: '', tt: 0, grace: 0, dim: 0, hover: -1, lifts: towers.map(() => 0) };
  const v = new Vector3();
  ctx.state.opening = { t: 0, tour: '' };

  const layout = () => { st.z0 = Number(getComputedStyle(el).getPropertyValue('--z0')) || 0; st.type = print(ctx, ruler, st.z0, st.type); st.laid = true; };
  const onResize = () => { st.laid = false; };
  window.addEventListener('resize', onResize);
  // any real input ends the tour (SPEC 4.6). A short grace after "Resume" keeps the hand that pressed it from ending it
  const unhear = input.onInput((kind) => { st.heard = ctx.time; if (st.tour === 'on' && !(kind === 'move' && st.grace > 0)) st.tour = 'off'; });
  const resume = $('button', tourEl);
  const onResume = () => { st.tour = 'on'; st.tt = 0; st.grace = 0.8; };
  resume.addEventListener('click', onResume);
  // a click on the scene lands on <main>, which lies over the canvas: listen on the window and leave real controls alone
  const onClick = (e) => {
    if (ctx.clock.current !== sec || e.target.closest('a, button, summary, header, nav')) return;
    const hit = row.pick(e.clientX, e.clientY);
    const world = hit && document.getElementById(hit.tower.id);
    if (world) ctx.scrollTo(hit.tower.id, Number(world.dataset.land) || 0);
  };
  window.addEventListener('click', onClick);

  return {
    stops: [0, 0.625, 1],
    enter() { st.laid = false; st.last = -1; },
    leave() {
      for (const tw of towers) tw.lid.size = 1.1;
      // an inline "visible" would show through a hidden stage: hand every faded piece back to the stylesheet
      for (const node of [words, list, ...caps.map((c) => c.li)]) { node.style.opacity = ''; node.style.visibility = ''; }
      delete tourEl.dataset.state;
      ctx.canvas.style.cursor = '';
      st.hover = -1;
      if (st.tour === 'on') st.tour = 'off';
    },
    update(t, dt, u) {
      if (!st.laid) layout();
      if (st.born < 0) st.born = st.heard = ctx.time;
      // the poster goes live once the five mark plates can be drawn (or after 1.2 s, whatever has loaded)
      const first = st.t0 < 0;
      if (first && (ctx.time - st.born > 1.2 || towers.every((tw) => tw.lid.mesh.material.uniforms.uMap.value))) {
        st.t0 = ctx.time - (skip ? 60 : 0);
        el.classList.add('is-live');
      }
      const time = ctx.state.opening.at ?? (st.t0 < 0 ? (skip ? 60 : 0) : ctx.time - st.t0);     // a test may pin the intro: opening.at = seconds
      const tau = span(time, 0.9, 3.5), e = easeIO(tau);          // hold 0.9 s, then the dolly zoom takes 2.6 s
      const down = easeIO(span(u, 0, 1));
      const drop = easeIO(span(u, 0.25, 0.85));

      const hero = pose(ctx, e, st.z0);
      hero.fit = 24.3 * Math.min(1, down * 5);                    // on the way down the row keeps its width, as at both ends
      rig.mix(hero, rig.stops.row, down);
      if (tau < 1) rig.cut();                                      // the intro is already eased: no lag, so the width holds exactly
      rig.yaw = 0.06 * smooth(span(e, 0.3, 0.9));
      rig.pitch = 0.025 * smooth(span(e, 0.3, 0.9));
      studio.lamp.set(...HOURS.noon).lerp(v.set(...HOURS.hero), smooth(e));
      if (first) studio.snap();
      studio.ink = 1 - smooth(span(u, 0.15, 0.6));
      row.datum = smooth(span(u, 0.95, 1.35));

      // the tour: after 4 s with no input each stack in turn rises one unit, 3.5 s each, until any input.
      // It runs on real seconds (the engine's dt is capped), so a slow machine still stops it within 400 ms
      const real = st.last < 0 ? 0 : Math.min(0.25, ctx.time - st.last);
      st.last = ctx.time;
      const calm = time > 3.6 && u < 0.03 && !ctx.reduced;
      st.grace = Math.max(0, st.grace - real);
      if (!st.tour && calm && ctx.time - st.heard > 4) { st.tour = 'on'; st.tt = 0; }
      if (st.tour === 'on' && !calm) st.tour = 'off';
      const touring = st.tour === 'on';
      if (touring) st.tt += real;
      const turn = Math.floor(st.tt / 3.5) % towers.length, ph = (st.tt % 3.5) / 3.5;
      st.dim = damp(st.dim, touring ? 1 : 0, 6, real);
      if (!input.touch && input.moved && tau >= 1 && u < 1.2) {
        const hit = row.pick(input.px, input.py);
        st.hover = hit ? hit.tower.index : -1;
        ctx.canvas.style.cursor = hit ? 'pointer' : '';
      }

      towers.forEach((tw, i) => {
        // the plate lifts off its lid and stays facing the screen. The character pops up under it, then steps down
        const lifted = backOut(span(tau, 0.16 + i * 0.03, 0.62 + i * 0.03));
        const wide = lerp(lerp(LID.flat, LID.high, lifted), 1.1, drop);
        // a plate faces the screen, so its lower edge dips as the camera tilts: it keeps clear of the lid
        place(tw.lid, wide, Math.max(lerp(LID.up * lifted, 0.97, drop), 0.5 * wide * Math.sin(hero.tilt) + (e > 0 ? 0.03 : 0)));
        const pop = span(tau, 0.62 + i * 0.03, 0.86 + i * 0.03);        // late: a cut-out seen from above reads as lying down
        const c = tw.char;
        c.from = 'top'; c.to = 'floor'; c.t = drop;
        c.show = pop > 0 ? 1 : 0;
        c.scale = backOut(pop) * lerp(1.22, 1, drop);

        const on = touring && i === turn;
        const want = on ? smooth(ph / 0.2) * (1 - smooth((ph - 0.78) / 0.2)) : st.hover === i && !touring ? 0.22 : 0;
        st.lifts[i] = damp(st.lifts[i], want, on ? 6 : 14, real);
        tw.lift = st.lifts[i];
        if (!on) tw.dim = 0.12 * st.dim;
        if (on) {
          c.scale *= 1 + 0.16 * Math.sin(Math.PI * span(ph, 0.24, 0.5));
          const wave = span(ph, 0.2, 0.72) * 10.5 - 1;                 // a light runs down its nine floors
          tw.floors.forEach((f, j) => { f.lit = 0.5 * Math.max(0, 1 - Math.abs(wave - j) / 1.3); });
        }
        const cap = caps[i];
        cap.at.set(tw.x + tw.shift, 0.02, tw.z + 1.2 + lerp(0.25, 0.8, e));
        cap.li.classList.toggle('is-hot', !ctx.phone && (on || (st.hover === i && !touring)));
      });

      // words: the captions sit under the lids and leave before the next section, the open line leaves first
      const seen = st.t0 < 0 ? 0 : 1;
      const capO = seen * (1 - smooth(span(u, 1.2, 1.5)));
      if (ctx.phone) fade(list, seen * (1 - smooth(span(u, 0.55, 0.85))));
      else for (const cap of caps) { cap.li.style.opacity = capO.toFixed(3); cap.li.style.visibility = capO < 0.01 ? 'hidden' : 'visible'; }
      fade(words, 1 - smooth(span(u, 0.55, 0.85)), -24 * smooth(span(u, 0.55, 0.85)));
      const chip = st.tour && u < 0.05 ? st.tour : '';
      if (tourEl.dataset.state !== chip) { if (chip) tourEl.dataset.state = chip; else delete tourEl.dataset.state; }
      ctx.state.opening.t = time; ctx.state.opening.tour = st.tour;
    },
    dispose() {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('click', onClick);
      resume.removeEventListener('click', onResume);
      unhear();
      for (const cap of caps) if (cap.pin) cap.pin.drop();
      for (const tw of towers) tw.lid.size = 1.1;
      const ink = studio.ground.material.uniforms.uInk;
      if (st.type) { if (ink.value === st.type.texture) ink.value = null; st.type.texture.dispose(); }
    },
  };
}
