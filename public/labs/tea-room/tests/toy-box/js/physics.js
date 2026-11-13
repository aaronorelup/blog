/* Toy physics: small, cheap, and tuned to feel like toys, not like a simulation.
   Every toy is one rigid body made of a few spheres. There is gravity, a floor, walls, a lamp and a box to bump
   into, sphere-against-sphere knocks between toys, a spring that stands a toy back up with a wobble a moment after
   it was knocked over, and a hop that carries it back to its place in the huddle. A held toy hangs from the
   pointer on a spring, so it swings, and whatever it touches gets shoved.
   No library, no wall clock and no Math.random: the same inputs give the same frames. */

const SLOP = 0.002;

export function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* rotate the vector (x,y,z) by the body's quaternion, into out[0..2] */
function rot(b, x, y, z, out) {
  const qx = b.qx, qy = b.qy, qz = b.qz, qw = b.qw;
  const ix = qw * x + qy * z - qz * y, iy = qw * y + qz * x - qx * z, iz = qw * z + qx * y - qy * x, iw = -qx * x - qy * y - qz * z;
  out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
  out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
  out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
  return out;
}

const T0 = [0, 0, 0], T1 = [0, 0, 0];

export class Body {
  constructor(o) {
    this.id = o.id;
    this.h = o.h;                       // standing height
    this.m = o.m; this.invM = 1 / o.m;
    this.I = o.I; this.invI = 1 / o.I;  // one number for the inertia: good enough for a toy
    this.spheres = o.spheres;           // [{x,y,z,r}] around the centre of mass
    this.com = o.com;                   // centre of mass above the feet
    this.R = o.R;                       // a sphere that holds the whole toy
    this.wc = new Float64Array(o.spheres.length * 3); // the spheres' centres in the room
    this.px = 0; this.py = 0; this.pz = 0;
    this.vx = 0; this.vy = 0; this.vz = 0;
    this.qx = 0; this.qy = 0; this.qz = 0; this.qw = 1;
    this.wx = 0; this.wy = 0; this.wz = 0;
    this.on = false;      // in the room (not in the box)
    this.asleep = false;
    this.rest = 0;        // seconds it has been at its place and still
    this.knock = 0;       // seconds until it may stand up again
    this.ghost = 0;       // seconds it passes through the box (on its way out)
    this.held = null;     // { s: sphere index, tx,ty,tz: where the pointer wants it }
    this.ground = 0;      // > 0 just after touching the floor
    this.hopT = 0;
    this.slot = null;     // { x, z, yaw }
    this.squash = 0; this.squashV = 0;  // a little cartoon give, for the picture only
    this.hit = 0;         // the hardest knock from a thrown, held or tumbling toy this step: it can knock this one over
    this.bump = 0;        // the hardest bump of any kind this step, for the picture only
    this.hot = 0;         // seconds it still counts as thrown: only a hot toy knocks others over
    this.rise = 0;        // seconds it has to get up in before it may fall over again
    this.away = 0;        // seconds it has been trying to get home
    this.pass = false;    // it has tried long enough: nothing but the floor and the walls is in its way now
    this.dock = null;     // the last moment of getting home: eased onto its spot, with a small wobble
    this.yaw0 = o.yaw0 || 0;
    this.tilt = 0;
  }
  centres() {
    const s = this.spheres, wc = this.wc;
    for (let i = 0; i < s.length; i++) {
      rot(this, s[i].x, s[i].y, s[i].z, T0);
      wc[i * 3] = this.px + T0[0]; wc[i * 3 + 1] = this.py + T0[1]; wc[i * 3 + 2] = this.pz + T0[2];
    }
  }
  setYaw(yaw) { this.qx = 0; this.qz = 0; this.qy = Math.sin(yaw / 2); this.qw = Math.cos(yaw / 2); }
  place(x, z, yaw) {
    this.px = x; this.py = this.com; this.pz = z; this.setYaw(yaw);
    this.vx = this.vy = this.vz = this.wx = this.wy = this.wz = 0;
    this.knock = 0; this.ghost = 0; this.rest = 1; this.asleep = true; this.on = true; this.held = null;
    this.hot = 0; this.rise = 0; this.away = 0; this.pass = false; this.dock = null;
    this.squash = this.squashV = 0; this.tilt = 0;
  }
  wake() { this.asleep = false; this.rest = 0; this.dock = null; }
}

export class World {
  constructor() {
    this.bodies = [];
    this.planes = [];       // { nx,ny,nz,d, mu, e } : n.p + d >= 0 is inside
    this.view = [];         // the same, for the edges of the picture (they move with the camera)
    this.balls = [];        // things that never move: { x,y,z,r }
    this.boxes = [];        // { x0,x1,y0,y1,z0,z1 }
    this.g = 8.4;
    this.t = 0;
    this.rand = rng(20261113);
    this.awake = 0;
  }

  /* one contact: a at the point (cx,cy,cz), pushed along n (pointing at a), sunk in by pen; b may be null (the room) */
  contact(a, b, cx, cy, cz, nx, ny, nz, pen, mu, e) {
    let aS = a.asleep, bS = b ? b.asleep : true;
    const rax = cx - a.px, ray = cy - a.py, raz = cz - a.pz;
    let vax = a.vx + a.wy * raz - a.wz * ray, vay = a.vy + a.wz * rax - a.wx * raz, vaz = a.vz + a.wx * ray - a.wy * rax;
    let rbx = 0, rby = 0, rbz = 0, vbx = 0, vby = 0, vbz = 0;
    if (b) {
      rbx = cx - b.px; rby = cy - b.py; rbz = cz - b.pz;
      vbx = b.vx + b.wy * rbz - b.wz * rby; vby = b.vy + b.wz * rbx - b.wx * rbz; vbz = b.vz + b.wx * rby - b.wy * rbx;
    }
    const rvx = vax - vbx, rvy = vay - vby, rvz = vaz - vbz;
    const vn = rvx * nx + rvy * ny + rvz * nz;
    // a sleeping toy stays put for a nudge, and wakes for a knock
    if (b && (aS || bS)) {
      if (vn < -0.18) { if (aS) { a.wake(); aS = false; } if (bS) { b.wake(); bS = false; } }
    }
    const imA = aS ? 0 : a.invM, iiA = aS ? 0 : a.invI;
    const imB = b && !bS ? b.invM : 0, iiB = b && !bS ? b.invI : 0;
    if (imA + imB === 0) return;
    if (vn < 0) {
      // along the normal
      let ux = ray * nz - raz * ny, uy = raz * nx - rax * nz, uz = rax * ny - ray * nx;
      let k = imA + iiA * (ux * ux + uy * uy + uz * uz);
      if (imB) { ux = rby * nz - rbz * ny; uy = rbz * nx - rbx * nz; uz = rbx * ny - rby * nx; k += imB + iiB * (ux * ux + uy * uy + uz * uz); }
      const bounce = -vn > 0.9 ? e : 0;
      const j = -(1 + bounce) * vn / k;
      this.push(a, imA, iiA, rax, ray, raz, nx * j, ny * j, nz * j);
      if (imB) this.push(b, imB, iiB, rbx, rby, rbz, -nx * j, -ny * j, -nz * j);
      const dvA = j * imA, dvB = j * imB;
      if (dvA > a.bump) a.bump = dvA;
      if (b) {
        if (dvB > b.bump) b.bump = dvB;
        // landing from a hop or shuffling past a neighbour never knocks a toy over: only a thrown one does
        if (a.hot > 0 || b.hot > 0 || a.held || b.held) { if (dvA > a.hit) a.hit = dvA; if (dvB > b.hit) b.hit = dvB; }
      }
      // along the surface
      let tx = rvx - vn * nx, ty = rvy - vn * ny, tz = rvz - vn * nz;
      const tl = Math.hypot(tx, ty, tz);
      if (tl > 1e-5) {
        tx /= tl; ty /= tl; tz /= tl;
        ux = ray * tz - raz * ty; uy = raz * tx - rax * tz; uz = rax * ty - ray * tx;
        let kt = imA + iiA * (ux * ux + uy * uy + uz * uz);
        if (imB) { ux = rby * tz - rbz * ty; uy = rbz * tx - rbx * tz; uz = rbx * ty - rby * tx; kt += imB + iiB * (ux * ux + uy * uy + uz * uz); }
        let jt = tl / kt; const lim = mu * j; if (jt > lim) jt = lim;
        this.push(a, imA, iiA, rax, ray, raz, -tx * jt, -ty * jt, -tz * jt);
        if (imB) this.push(b, imB, iiB, rbx, rby, rbz, tx * jt, ty * jt, tz * jt);
      }
    }
    // never leave one thing inside another
    const c = Math.max(pen - SLOP, 0) * 0.7;
    if (c > 0) {
      const sA = imA / (imA + imB), sB = imB / (imA + imB);
      a.px += nx * c * sA; a.py += ny * c * sA; a.pz += nz * c * sA;
      if (imB) { b.px -= nx * c * sB; b.py -= ny * c * sB; b.pz -= nz * c * sB; }
    }
  }
  push(b, im, ii, rx, ry, rz, jx, jy, jz) {
    b.vx += jx * im; b.vy += jy * im; b.vz += jz * im;
    b.wx += (ry * jz - rz * jy) * ii; b.wy += (rz * jx - rx * jz) * ii; b.wz += (rx * jy - ry * jx) * ii;
  }

  step(dt) {
    const B = this.bodies, n = B.length, g = this.g;
    this.t += dt;
    let awake = 0;
    // forces
    for (let i = 0; i < n; i++) {
      const b = B[i];
      if (!b.on) continue;
      b.hit = 0; b.bump = 0;
      if (b.ghost > 0) b.ghost -= dt;
      if (b.hot > 0) b.hot -= dt;
      if (b.rise > 0) b.rise -= dt;
      if (b.ground > 0) b.ground -= dt;
      // the cartoon give: a spring that only the picture reads
      b.squashV += (-420 * b.squash - 13 * b.squashV) * dt; b.squash += b.squashV * dt;
      if (b.squash > 0.22) b.squash = 0.22; else if (b.squash < -0.22) b.squash = -0.22;
      if (b.dock) {
        // the last moment of getting home is not left to chance: the toy eases onto its spot and stops with a
        // small wobble. Until then it stands firm, as a sleeping toy does, unless something knocks it.
        const d = b.dock, sl = b.slot; d.t += dt; awake++;
        const u = d.t >= d.dur ? 1 : d.t / d.dur, e = 1 - (1 - u) * (1 - u) * Math.cos(u * 6.6);
        const yaw = sl.yaw + b.yaw0; let sy = Math.sin(yaw / 2), cy = Math.cos(yaw / 2);
        if (d.qy * sy + d.qw * cy < 0) { sy = -sy; cy = -cy; }
        b.px = d.x + (sl.x - d.x) * e; b.py = d.y + (b.com - d.y) * (1 - (1 - u) * (1 - u)); b.pz = d.z + (sl.z - d.z) * e;
        let qx = d.qx * (1 - e), qy = d.qy + (sy - d.qy) * e, qz = d.qz * (1 - e), qw = d.qw + (cy - d.qw) * e;
        const l = 1 / Math.hypot(qx, qy, qz, qw); b.qx = qx * l; b.qy = qy * l; b.qz = qz * l; b.qw = qw * l;
        b.tilt = Math.acos(Math.min(1, Math.max(-1, 1 - 2 * (b.qx * b.qx + b.qz * b.qz))));
        if (u >= 1) b.place(sl.x, sl.z, yaw);
        continue;
      }
      if (b.asleep) continue;
      awake++;
      b.vy -= g * dt;
      rot(b, 0, 1, 0, T0);
      const ux = T0[0], uy = T0[1], uz = T0[2];
      const tilt = Math.acos(uy > 1 ? 1 : uy < -1 ? -1 : uy);
      b.tilt = tilt;
      if (b.held) {
        // hangs from the pointer on a spring, by the sphere that was picked
        const h = b.held, s = b.spheres[h.s];
        rot(b, s.x, s.y, s.z, T1);
        const rx = T1[0], ry = T1[1], rz = T1[2];
        const gx = b.px + rx, gy = b.py + ry, gz = b.pz + rz;
        const gvx = b.vx + b.wy * rz - b.wz * ry, gvy = b.vy + b.wz * rx - b.wx * rz, gvz = b.vz + b.wx * ry - b.wy * rx;
        let fx = (h.tx - gx) * 300 - gvx * 26, fy = (h.ty - gy) * 300 - gvy * 26 + g, fz = (h.tz - gz) * 300 - gvz * 26;
        const fl = Math.hypot(fx, fy, fz), fmax = 260; if (fl > fmax) { fx *= fmax / fl; fy *= fmax / fl; fz *= fmax / fl; }
        b.vx += fx * dt; b.vy += fy * dt; b.vz += fz * dt;
        const k = b.m * b.invI * dt * 0.55;
        b.wx += (ry * fz - rz * fy) * k; b.wy += (rz * fx - rx * fz) * k; b.wz += (rx * fy - ry * fx) * k;
        // and it likes to hang the right way up, loosely
        b.wx += (-uz * 30 - b.wx * 5) * dt; b.wz += (ux * 30 - b.wz * 5) * dt; b.wy -= b.wy * 3 * dt;
        b.knock = 0.45; b.rest = 0; b.away = 0; b.pass = false;
      } else if (b.knock > 0) {
        b.knock -= dt;   // knocked over: it lies there for a moment
        // then up it gets: a little jump, and for a second a strong spring that even a box on its side obeys
        if (b.knock <= 0) { b.rise = 1.1; if (tilt > 0.5 && (b.ground > 0 || Math.abs(b.vy) < 0.4)) { b.vy += 1.5 + 0.6 * tilt; b.squashV += 2.2; } }
      } else {
        // pushed further over than it can come back from: it gives up and falls
        if (tilt > 1.05 && b.rise <= 0 && b.ground > 0 && !b.pass) { b.knock = 0.45 + this.rand() * 0.3; }
        // it has been trying to get home for too long: from now on nothing but the floor is in its way
        b.away += dt;
        if (b.away > 4.5) { b.pass = true; b.ghost = 0.2; }
        if (b.away > 10 && b.slot) { b.place(b.slot.x, b.slot.z, b.slot.yaw + b.yaw0); continue; }
        // stand up: a spring toward upright, a little loose so it wobbles
        const al = Math.hypot(uz, ux);
        if (al > 1e-4) {
          const ax = -uz / al, az = ux / al;       // the axis that tips it upright
          const up = b.rise > 0 || b.pass, k = (up ? 250 : 95) * tilt, c = up ? 11 : 7.5, wperp = b.wx * ax + b.wz * az;
          b.wx += (ax * k - ax * wperp * c) * dt; b.wz += (az * k - az * wperp * c) * dt;
          // whatever wobble is across that axis dies down too
          const cx = az, cz = -ax, wc = b.wx * cx + b.wz * cz;
          b.wx -= cx * wc * 5 * dt; b.wz -= cz * wc * 5 * dt;
        } else if (uy < 0) { b.wx += 6 * dt; }
        const sl = b.slot;
        if (sl && tilt < 0.5) {
          // turn to face the way its place says
          rot(b, 0, 0, 1, T1);
          let dy = sl.yaw + b.yaw0 - Math.atan2(T1[0], T1[2]);
          while (dy > Math.PI) dy -= 2 * Math.PI; while (dy < -Math.PI) dy += 2 * Math.PI;
          b.wy += (dy * 42 - b.wy * 11) * dt;
          // and go back to the huddle in hops
          const dx = sl.x - b.px, dz = sl.z - b.pz, dist = Math.hypot(dx, dz);
          if (dist > 0.05) {
            b.rest = 0;
            b.hopT -= dt;
            // wedged between two others and going nowhere counts as standing: it can hop out
            b.idle = b.ground <= 0 && Math.abs(b.vx) + Math.abs(b.vy) + Math.abs(b.vz) < 0.3 ? (b.idle || 0) + dt : 0;
            if (b.hopT <= 0 && (b.ground > 0 || b.idle > 0.25)) {
              // each hop is aimed: a near one lands on the spot, a far one covers what it can
              // and if the last hops got it nowhere (the box is in the way), it jumps higher, right over
              b.stuck = dist > (b.lastDist || 9) - 0.03 ? (b.stuck || 0) + 1 : 0; b.lastDist = dist;
              const vy = Math.min(3.3, 1.0 + Math.min(0.9, dist * 0.9) + Math.max(0, b.stuck - 1) * 0.8);
              const sp = Math.min(b.stuck > 1 ? 2.4 : 1.5, dist / (2 * vy / g) * 1.04);
              b.vx += (dx / dist * sp - b.vx) * 0.9; b.vz += (dz / dist * sp - b.vz) * 0.9;
              b.vy = vy;
              b.wx += dz / dist * 0.9; b.wz -= dx / dist * 0.9;   // leans into the hop
              b.squashV += 1.6;
              b.hopT = 0.2 + this.rand() * 0.07;
            }
          } else if (b.ground > 0) {
            // home: from here it is eased onto the exact spot (see the top of this loop), then it sleeps
            b.dock = { t: 0, dur: 0.42, x: b.px, y: b.py, z: b.pz, qx: b.qx, qy: b.qy, qz: b.qz, qw: b.qw };
            b.vx = b.vy = b.vz = b.wx = b.wy = b.wz = 0; b.asleep = true; b.rest = 0;
          }
        }
      }
      // air and rolling drag
      const ld = Math.exp(-0.25 * dt), ad = Math.exp(-(b.ground > 0 ? 2.6 : 0.5) * dt);
      b.vx *= ld; b.vy *= ld; b.vz *= ld; b.wx *= ad; b.wy *= ad; b.wz *= ad;
      // nothing flies off for ever
      const v = Math.hypot(b.vx, b.vy, b.vz); if (v > 11) { b.vx *= 11 / v; b.vy *= 11 / v; b.vz *= 11 / v; }
      const w = Math.hypot(b.wx, b.wy, b.wz); if (w > 22) { b.wx *= 22 / w; b.wy *= 22 / w; b.wz *= 22 / w; }
      // move
      b.px += b.vx * dt; b.py += b.vy * dt; b.pz += b.vz * dt;
      const hx = b.wx * dt * 0.5, hy = b.wy * dt * 0.5, hz = b.wz * dt * 0.5;
      const qx = b.qx, qy = b.qy, qz = b.qz, qw = b.qw;
      b.qx += hx * qw + hy * qz - hz * qy; b.qy += hy * qw + hz * qx - hx * qz; b.qz += hz * qw + hx * qy - hy * qx; b.qw += -hx * qx - hy * qy - hz * qz;
      const ql = 1 / Math.hypot(b.qx, b.qy, b.qz, b.qw); b.qx *= ql; b.qy *= ql; b.qz *= ql; b.qw *= ql;
      if (!(b.px === b.px && b.py === b.py && b.qw === b.qw) || b.py < -2 || b.py > 12 || Math.abs(b.px) > 12 || Math.abs(b.pz) > 14) {
        // should never happen; if it does, the toy simply drops back in above its place
        const sl = b.slot || { x: 0, z: -2, yaw: 0 };
        b.place(sl.x, sl.z, sl.yaw); b.py = 1.2; b.asleep = false; b.rest = 0;
      }
    }
    this.awake = awake;
    if (!awake) return;
    // contacts, twice over so a pile settles
    for (let it = 0; it < 2; it++) {
      for (let i = 0; i < n; i++) { const b = B[i]; if (b.on) b.centres(); }
      for (let i = 0; i < n; i++) {
        const a = B[i];
        if (!a.on || a.asleep) continue;
        const sa = a.spheres, wa = a.wc;
        // the room
        for (let s = 0; s < sa.length; s++) {
          const x = wa[s * 3], y = wa[s * 3 + 1], z = wa[s * 3 + 2], r = sa[s].r;
          for (let p = 0; p < this.planes.length; p++) {
            const P = this.planes[p], d = P.nx * x + P.ny * y + P.nz * z + P.d - r;
            if (d < 0) {
              this.contact(a, null, x - P.nx * r, y - P.ny * r, z - P.nz * r, P.nx, P.ny, P.nz, -d, P.mu, P.e);
              if (P.floor) a.ground = 0.08;
            }
          }
          for (let p = 0; p < this.view.length; p++) {
            const P = this.view[p], d = P.nx * x + P.ny * y + P.nz * z + P.d - r * P.k;
            if (d < 0) this.contact(a, null, x - P.nx * r, y - P.ny * r, z - P.nz * r, P.nx, P.ny, P.nz, Math.min(-d, 0.02), 0.1, 0.3);
          }
          if (!a.pass) for (let p = 0; p < this.balls.length; p++) {
            const S = this.balls[p], dx = x - S.x, dy = y - S.y, dz = z - S.z, rr = r + S.r, d2 = dx * dx + dy * dy + dz * dz;
            if (d2 < rr * rr && d2 > 1e-9) { const d = Math.sqrt(d2); this.contact(a, null, x - dx / d * r, y - dy / d * r, z - dz / d * r, dx / d, dy / d, dz / d, rr - d, 0.4, 0.35); }
          }
          if (a.ghost <= 0) for (let p = 0; p < this.boxes.length; p++) {
            const X = this.boxes[p];
            const qx = x < X.x0 ? X.x0 : x > X.x1 ? X.x1 : x, qy = y < X.y0 ? X.y0 : y > X.y1 ? X.y1 : y, qz = z < X.z0 ? X.z0 : z > X.z1 ? X.z1 : z;
            let dx = x - qx, dy = y - qy, dz = z - qz; const d2 = dx * dx + dy * dy + dz * dz;
            if (d2 < r * r) {
              if (d2 > 1e-9) { const d = Math.sqrt(d2); this.contact(a, null, qx, qy, qz, dx / d, dy / d, dz / d, r - d, 0.5, 0.3); if (dy / d > 0.7) a.ground = 0.08; }
              else {
                // the centre is inside: out through the nearest face
                const ex = Math.min(x - X.x0, X.x1 - x), ey = X.y1 - y, ez = Math.min(z - X.z0, X.z1 - z);
                if (ey <= ex && ey <= ez) this.contact(a, null, x, X.y1, z, 0, 1, 0, ey + r, 0.5, 0.3);
                else if (ex <= ez) { const sgn = x - X.x0 < X.x1 - x ? -1 : 1; this.contact(a, null, x, y, z, sgn, 0, 0, Math.min(ex + r, 0.03), 0.5, 0.3); }
                else { const sgn = z - X.z0 < X.z1 - z ? -1 : 1; this.contact(a, null, x, y, z, 0, 0, sgn, Math.min(ez + r, 0.03), 0.5, 0.3); }
              }
            }
          }
        }
      }
      // toy against toy
      for (let i = 0; i < n; i++) {
        const a = B[i]; if (!a.on) continue;
        for (let j = i + 1; j < n; j++) {
          const b = B[j]; if (!b.on || (a.asleep && b.asleep) || a.pass || b.pass) continue;
          const ddx = a.px - b.px, ddy = a.py - b.py, ddz = a.pz - b.pz, RR = a.R + b.R;
          if (ddx * ddx + ddy * ddy + ddz * ddz > RR * RR) continue;
          const sa = a.spheres, sb = b.spheres, wa = a.wc, wb = b.wc;
          for (let s = 0; s < sa.length; s++) for (let u = 0; u < sb.length; u++) {
            const dx = wa[s * 3] - wb[u * 3], dy = wa[s * 3 + 1] - wb[u * 3 + 1], dz = wa[s * 3 + 2] - wb[u * 3 + 2];
            const rr = sa[s].r + sb[u].r, d2 = dx * dx + dy * dy + dz * dz;
            if (d2 >= rr * rr || d2 < 1e-9) continue;
            const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, nz = dz / d, ra = sa[s].r;
            this.contact(a, b, wa[s * 3] - nx * ra, wa[s * 3 + 1] - ny * ra, wa[s * 3 + 2] - nz * ra, nx, ny, nz, rr - d, 0.35, 0.3);
            // standing on another toy's head is standing: it can hop off
            if (ny > 0.6) a.ground = 0.08; else if (ny < -0.6) b.ground = 0.08;
          }
        }
      }
    }
    // what the knocks mean
    for (let i = 0; i < n; i++) {
      const b = B[i];
      if (!b.on || b.asleep || !b.bump) continue;
      if (b.bump > 0.5) b.squashV -= Math.min(b.bump, 4) * 0.9;
      // knocked over by a thrown toy; for a moment it can knock the next one over too
      if (b.hit > 1.25 && !b.held) { const k = 0.75 + this.rand() * 0.55; if (k > b.knock) b.knock = k; b.rest = 0; b.away = 0; b.pass = false; if (b.hot < 0.5) b.hot = 0.5; }
    }
  }
}
