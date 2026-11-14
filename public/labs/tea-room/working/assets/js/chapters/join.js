/* THE JOIN BETWEEN THE FILM CHAPTER AND THE GAMES CHAPTER: what both draw from, so the cloth is the same cloth in both.
   The garden plate is 2752 x 1536 pixels; the cloth hangs on it a little turned, its right edge nearer. The film is
   thrown onto the middle of the cloth (FILM_UV, a band of bare cloth above and below).
   film.js dives into the cloth at its end and writes JOIN each frame it draws (where the film's picture is on the
   screen, and how far the dive has come); games.js, drawn over it in the same frame, throws the arena onto exactly
   that place, and writes back how much of the cloth the arena covers (the garden's light follows it). */
export var PW = 2752, PH = 1536;
export var CLOTH = [[1447, 398], [2199, 362], [2199, 908], [1447, 872]];
export var FOCUS = [1823, 634];
export var FILM_UV = [0.045, 0.1225, 0.955, 0.8775];
export var GLOW = { x: 638, y: 290, w: 1899, h: 1246 };          // where the lamp's light (img/film/garden-glow.webp) lies on the plate

// a flat picture seen in perspective: the 3 x 3 matrix that carries four points to four points
export function homography(src, dst) {
  var A = [], i, j, k;
  for (i = 0; i < 4; i++) {
    var x = src[i][0], y = src[i][1], X = dst[i][0], Y = dst[i][1];
    A.push([x, y, 1, 0, 0, 0, -x * X, -y * X, X]);
    A.push([0, 0, 0, x, y, 1, -x * Y, -y * Y, Y]);
  }
  for (i = 0; i < 8; i++) {
    var best = i;
    for (j = i + 1; j < 8; j++) if (Math.abs(A[j][i]) > Math.abs(A[best][i])) best = j;
    var tmp = A[i]; A[i] = A[best]; A[best] = tmp;
    for (j = 0; j < 8; j++) {
      if (j === i) continue;
      var f = A[j][i] / A[i][i];
      for (k = i; k < 9; k++) A[j][k] -= f * A[i][k];
    }
  }
  var h = [];
  for (i = 0; i < 8; i++) h.push(A[i][8] / A[i][i]);
  return h;
}
export function carry(h, x, y) { var w = h[6] * x + h[7] * y + 1; return [(h[0] * x + h[1] * y + h[2]) / w, (h[3] * x + h[4] * y + h[5]) / w]; }
export var clothH = homography([[0, 0], [1, 0], [1, 1], [0, 1]], CLOTH);
// the film's picture on the plate: its corners, its middle, and its height (the mean of its two sides)
export var FILMQ = [carry(clothH, FILM_UV[0], FILM_UV[1]), carry(clothH, FILM_UV[2], FILM_UV[1]), carry(clothH, FILM_UV[2], FILM_UV[3]), carry(clothH, FILM_UV[0], FILM_UV[3])];
export var FILM_MID = carry(clothH, 0.5, (FILM_UV[1] + FILM_UV[3]) / 2);
export var FILM_HGT = ((FILMQ[3][1] - FILMQ[0][1]) + (FILMQ[2][1] - FILMQ[1][1])) / 2;

// The dive's end, the same in both chapters: the film's picture as tall as the screen, its middle at the screen's
// middle. (The plate is then FILM_HGT / H times larger than its own pixels.) Returns the plate's scale and where its
// corner (0, 0) stands on the screen.
export function diveEnd(W, H) {
  var s = H / FILM_HGT;
  return { s: s, o: [W / 2 - FILM_MID[0] * s, H / 2 - FILM_MID[1] * s] };
}
// how far the arena has come over the reel at a point of the dive (0..1): the reel gives way early, the cloth is all
// arena well before its edges leave the frame
export function arenaOver(k) { k = k < 0 ? 0 : k > 1 ? 1 : k; var t = Math.min(1, Math.max(0, (k - 0.04) / 0.3)); return t * t * (3 - 2 * t); }
// how far the arena's picture has squared up from the cloth's lean (the cloth faces the camera as it comes close)
export function squared(k) { var t = Math.min(1, Math.max(0, (k - 0.45) / 0.55)); return t * t * (3 - 2 * t); }

// how much of the cloth the arena covers at a point of the dive, with motion on or off (both chapters reckon it from
// k alone, so neither waits a frame for the other)
export function arenaAt(k, reduced) { return reduced ? (k >= 0.5 ? 1 : 0) : arenaOver(k); }

// ready: the games chapter has its arena (or its still) in, and will draw over the film's frames
export var JOIN = { fresh: false, quad: null, mid: null, h: 0, k: 0, arena: 0, ready: false };

/* THE JOIN BETWEEN THE GAMES CHAPTER AND THE ART CHAPTER: the night garden where games ends (its last view, KE) is
   where the art chapter's camera starts its turn from the cloth to the trees. Both reckon that view from the layout
   alone, here, so neither needs the other to have drawn a frame (on a fresh load in the art chapter, games draws
   nothing). endPlate returns the plate's scale s and where its corner (0, 0) stands on the screen, (x, y). */
export var POLE_L = 1390, POLE_R = 2250, PIC_R = 2170, EDGE = 600;
export var HORIZON = 812;                                        // the lawn's far edge on the plate (plate pixels)
// where a chapter's name, set at look B's size left of the rail, ends on a wide screen (lines: the name's lines)
export function nameRightOf(lines, W, railW) {
  var px = Math.min(190, Math.max(52, W * 0.115)), left = railW + Math.max(16, Math.min(46, W * 0.032)) * 2;
  var c = document.createElement('canvas').getContext('2d'), w = 0;
  c.font = '700 ' + px + 'px "Zen Maru Gothic", sans-serif';
  lines.forEach(function (l) { w = Math.max(w, c.measureText(l).width); });
  return left + w;
}
export function endPlate(W, H, nameR) {
  var cl = function (x, a, b) { return x < a ? a : x > b ? b : x; };
  if (W / H >= 0.9) {
    var right = W - Math.max(8, W * 0.006), left = Math.max(W * 0.5, nameR + Math.max(24, W * 0.02));
    var s3 = Math.max(H / PH, Math.min((right - left) / (POLE_R - POLE_L), (W - 6) / 2172));
    var tx = Math.max((left + right) / 2 - (POLE_L + POLE_R) / 2 * s3, left - POLE_L * s3);
    tx = Math.max(W - PW * s3, Math.min(tx, right - PIC_R * s3, EDGE * s3 * 0.9));
    var ty = cl(0.5 * H - FOCUS[1] * s3, H - PH * s3, 0);
    return { s: s3, x: tx, y: ty };
  }
  // (a tall screen: the name is two lines over the cloth, the cloth under it)
  var wordPx = cl(W * 0.15, 52, 190), clothTop = H * 0.11 + wordPx * 0.9 * 2 + 150, clothBot = H * 0.7;
  var st = cl((clothBot - clothTop) / 546, 0.5 * W / 752, 0.95 * W / 752);
  return { s: st, x: 0.52 * W - FOCUS[0] * st, y: (clothTop + clothBot) / 2 - FOCUS[1] * st };
}

/* THE JOIN BETWEEN THE ART CHAPTER AND THE 3D CHAPTER: the art chapter ends by tilting down to look B's garden at the
   3D chapter's first step (look B's hero progress 0; a tall screen H0_TALL), standing TILT_LOW of the screen's height
   below its place; the 3D chapter draws that same picture over it and lifts it into place (toybox.js TILT). */
export var TILT_LOW = 0.3, H0_TALL = 0.2;
// Look B's sky does not end at the top of its layer on the way down: its painting is shown whole (it reaches higher
// than the layer: the layer is not clipped above, SKY_CLIP), and above the painting's top the same night goes on, solid
// for SKY_UP.S of the screen's height, then fading out over SKY_UP.F into the gallery's sky. So the gallery's pictures
// are never seen through look B's sky: at TILT_LOW the fade is above the screen and the whole screen is look B's. The
// colour is the painting's top row (garden-sky.webp), so where the painting ends no line shows. art.js draws it; the
// 3D chapter's lead draws over art's last picture and needs only SKY_CLIP (above its sky, art's shows).
export var SKY_UP = { S: 0.16, F: 0.46, rgb: '14, 20, 49' };
export var SKY_CLIP = 'inset(-400% 0 0 0)';
// the element (a plain div), laid out for a screen H high; its bottom edge goes where the painting's top is. stars: a
// tile of stars (the gallery's own), so the night above look B's sky is not a bare band
export function skyUpLayout(el, H, stars) {
  var s = SKY_UP, h = Math.round((s.S + s.F) * H), m = 'linear-gradient(to bottom, transparent 0, #000 ' + Math.round(s.F * H) + 'px)';
  el.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:' + h + 'px;pointer-events:none;will-change:transform;' +
    'background-color:rgb(' + s.rgb + ');' + (stars && stars !== 'none' ? 'background-image:' + stars + ';background-repeat:repeat;' : '') +
    '-webkit-mask-image:' + m + ';mask-image:' + m;
  return h;
}

/* THE JOIN BETWEEN THE 3D CHAPTER AND THE MACHINES ON THE BENCH (machines.js): the toy box's room and the bench's room
   are the same painting (img/room.webp). The 3D chapter's camera ends on the room seen whole; in the machines' lead it
   cranes down a little, onto the place where the bench stands, and the bench (the low table, the backdrop behind it,
   the television on the floor, the lamp over it) comes up into the frame in front of the toys. Both chapters reckon
   that place from the layout alone, here: benchLayout(W, H, rail) (rail: the rail's rectangle on the screen, or null).
   Returns where everything of the bench stands on the screen, and room: the part of the painting the camera sees
   there ({x, y, w, h}, painting pixels; with s, tx, ty: its scale and where its corner stands on the screen). */
export var TABLE = { w: 873, h: 682, cx: 436, cy: 271, rx: 425, ry: 130 };   // the low table's top: an ellipse in its picture
export function benchLayout(W, H, rail) {
  var cl = function (x, a, b) { return x < a ? a : x > b ? b : x; };
  var phone = W < 820 || W / H < 1.05, L = { phone: phone, W: W, H: H };
  var bx, by, bw, bh;
  if (phone) {
    // (the tabs stand under the rail's pill at the top; the bench under them; the cards under the bench)
    L.tabsTop = (rail ? rail.bottom : 42) + 10;
    bx = 6; by = L.tabsTop + 44; bw = W - 12; bh = Math.round(Math.min(H * 0.44, bw * 1.04));
    L.tv = null;
  } else {
    // (the cards stand on the right, as the film's card does; the television on the floor at the left, clear of the
    // rail; the bench between them)
    var dockW = Math.round(cl(W * 0.25, 300, 440)), dockR = Math.round(Math.max(24, W * 0.035));
    L.dock = { l: W - dockR - dockW, w: dockW, r: dockR };
    var tvW = Math.round(Math.min(300, W * 0.18)), th = tvW * 1093 / 1200, tvT = Math.round(H * 0.955 - th);
    var railR = rail ? rail.right : 172, railB = rail ? rail.bottom : H;
    var tvL = Math.round(tvT > railB + 10 ? Math.max(W * 0.028, 16) : railR + 14);
    L.tv = { l: tvL, t: tvT, w: tvW, h: th };
    bx = Math.round(Math.max(tvL + tvW * 0.55, railR + Math.max(16, Math.min(46, W * 0.032))));
    bw = Math.round(L.dock.l - W * 0.012 - bx); by = Math.round(H * 0.15); bh = Math.round(H * 0.68);
  }
  L.bx = bx; L.by = by; L.bw = bw; L.bh = bh;
  // the table: its top centred under the machine, the machine's feet about four fifths of the way down the view
  L.tw = bw * (phone ? 1.3 : 1.16); L.ts = L.tw / TABLE.w;
  L.tcx = bx + bw / 2; L.tcy = by + bh * (phone ? 0.8 : 0.82);
  L.trx = TABLE.rx * L.ts; L.try = TABLE.ry * L.ts;
  L.lampW = phone ? 34 : Math.round(Math.min(78, W * 0.05)); L.lampY = phone ? by - 26 : Math.round(H * 0.005);
  // the room behind: the alcove and its scroll behind the bench
  // (a phone keeps a twentieth of the screen's height of the painting above the frame: at the end its camera tilts up)
  var s0 = Math.max(W / PW, H / PH) * 1.08;
  var tx = cl(L.tcx - (phone ? 1080 : 1180) * s0, W - PW * s0, 0), ty = cl(H * 0.5 - (phone ? 700 : 760) * s0, H - PH * s0, phone ? -H * 0.05 : 0);
  L.room = { s: s0, tx: tx, ty: ty, x: -tx / s0, y: -ty / s0, w: W / s0, h: H / s0 };
  return L;
}

/* THE JOIN BETWEEN THE MACHINES ON THE BENCH AND THE AGENTS CHAPTER (agents.js): look B's own move, into the
   television. After its last machine the bench is put away (machines.js PACK: the machine goes, the backdrop rolls up,
   the lamp and the table leave), and the room at night is left with the little television on the floor. Its glass
   turns to the terminal's dark plane, and the camera goes straight at it until the glass is the frame (TVDIVE). The
   machines chapter moves its room (the whole .mc-world); the agents chapter, drawn over it in its lead, draws the
   same set's body over its own picture and throws the terminal into the glass. At the agents chapter's end the same
   move runs backwards out of the glass, into the same bare room, which the agents chapter then draws itself.
   Both reckon everything from the layout alone, here; times are in screens before the agents section's top (its
   lead), so the machines chapter reckons them from its own end: p = (q - 1) * span - 1. */
export var AGENTS = {
  PACK: [-3.75, -3.0],     // (machines) the machine goes, the backdrop rolls up, the lamp and the table leave
  NAME: [-3.55, -2.85],    // (agents) the chapter's name comes on from the left wing over the bare room
  TUNE: [-2.8, -2.6],      // (agents) the glass turns from the machine's picture to the terminal, in a cold flash
  DIVE: [-2.5, -1.0],      // (both) straight into the glass
  RM_CUT: -1.75            // motion off: one cut from the room to the terminal
};
// the glass within the set's picture (img/tv-body.webp, 1200 x 1093): where its hole is, as a box
export var TV_GLASS = { x0: 129 / 1200, y0: 376 / 1093, x1: 720 / 1200, y1: 918 / 1093 };
// the television's place on the screen when the camera has not moved: a wide screen's is the bench's (benchLayout); a
// phone's room has none in the bench, so there it stands on the floor at the right, in front of where the table was
export function tvPlace(W, H, rail) {
  var L = benchLayout(W, H, rail);
  // (the room's layer is the screen's own box, its painting covering it: that box's edge must never come into view)
  var room = { x: 0, y: 0, w: W, h: H };
  if (L.tv) return { l: L.tv.l, t: L.tv.t, w: L.tv.w, h: L.tv.h, phone: false, room: L.room, box: room };
  var w = Math.round(Math.min(W * 0.5, 240)), h = w * 1093 / 1200;
  return { l: Math.round(W - w - W * 0.06), t: Math.round(H * 0.95 - h), w: w, h: h, phone: true, room: L.room, box: room };
}
// the camera at k (0: where it stands, 1: the glass a little larger than the screen, its middle at the screen's
// middle): the room's transform (scale Z about the screen's corner, then moved by tx, ty), at an even pace for the eye,
// and where the glass's box then stands on the screen
export function tvDive(tv, W, H, k) {
  k = k < 0 ? 0 : k > 1 ? 1 : k;
  var e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  var c = Math.min(1, k / 0.7); c = c < 0.5 ? 2 * c * c : 1 - Math.pow(-2 * c + 2, 2) / 2;
  var gx = tv.l + tv.w * (TV_GLASS.x0 + TV_GLASS.x1) / 2, gy = tv.t + tv.h * (TV_GLASS.y0 + TV_GLASS.y1) / 2;
  var gw = tv.w * (TV_GLASS.x1 - TV_GLASS.x0), gh = tv.h * (TV_GLASS.y1 - TV_GLASS.y0);
  var Zend = 1.12 * Math.max(W / gw, H / gh), Z = Math.pow(Zend, e);
  var cx = gx + (W / 2 - gx) * c, cy = gy + (H / 2 - gy) * c, tx = cx - gx * Z, ty = cy - gy * Z;
  // (the room's painting never shows its edge: while it is small the glass lags behind its way to the middle)
  var b = tv.box;
  if (b && k < 1) {
    tx = Math.min(Math.max(tx, W - (b.x + b.w) * Z), -b.x * Z); ty = Math.min(Math.max(ty, H - (b.y + b.h) * Z), -b.y * Z);
    cx = tx + gx * Z; cy = ty + gy * Z;
  }
  return { Z: Z, tx: tx, ty: ty, k: k, glass: { x: cx - gw * Z / 2, y: cy - gh * Z / 2, w: gw * Z, h: gh * Z } };
}

/* THE JOIN BETWEEN THE AGENTS CHAPTER AND THE LEARNING CHAPTER (learning.js): the painted room becomes the modelled
   one. After the camera has come back out of the television, the agents chapter turns its room (the painting, the
   set with it) to the corner where the lantern stands by the shoji (LEARN.TURN): there the painting stands so that its
   lantern lies exactly where the modelled room's andon is seen from LEARN's pose. The learning chapter then lets the
   lantern's light grow until it fills the screen, changes the painting for its modelled room under it (never both at
   once), and draws the light back into the andon, the camera still at that pose; from there it
   comes down onto the writing desk (the test's own arrival). Both chapters reckon everything from the layout alone,
   here; times are in screens before the learning section's top (its lead). The agents chapter reckons them from its
   own foot: pe = p + FOOT_PE (its walk ends FOOT_PE screens before the learning section's top). */
export var LEARN = {
  FOOT: 4.6,               // the agents chapter's foot (.agents-foot, 460vh): its walk ends this many screens before learning
  TURN: [-2.35, -1.05],    // (agents) the painted room turns to the lantern's corner; the set leaves the frame
  NAME: [-2.2, -1.5],      // (learning) its name comes on from the left wing
  MELT: [-0.95, -0.35],    // (learning) the lantern's light fills the screen, the rooms change under it, it draws back
  MELT_PEAK: [0.46, 0.54], // (learning) the part of MELT (0..1) where the light is wholly opaque: the rooms change at its middle
  RM_CUT: -0.6,            // motion off: one cut from the painting to the modelled room
  ANDON: { x: -5.42, z: 4.26, foot: 0.47, top: 1.6 },          // the modelled andon (world/lamps.js)
  LANTERN: { x: 1941, top: 796, foot: 1062 },                   // the painted lantern (img/room.webp, 2752 x 1536)
  // the camera the modelled room is first seen from: p, the point looked at t, the widest lens fov (degrees). learnPose
  // narrows the lens, a degree at a time, until the painting that matches it covers the screen.
  WIDE: { p: [-3.2, 1.75, -1.5], t: [-5.3, 1.0, 4.9], fov: 38 },
  TALL: { p: [-4.0, 1.7, -1.0], t: [-5.3, 1.0, 4.9], fov: 50 }
};
// the inset a wide picture is framed with (the rail's right edge), the same rule as the scene's
export function learnInset(W, H, rail) { return W / H < 0.8 ? 0 : Math.max(0, Math.min(W * 0.3, rail && rail.right < W * 0.4 ? rail.right : 0)); }
// a point of the modelled room on the screen, seen from pose (the picture framed right of IN)
export function seeFrom(pose, W, H, IN, X) {
  var P = pose.p, T = pose.t;
  var f = [T[0] - P[0], T[1] - P[1], T[2] - P[2]], fl = Math.hypot(f[0], f[1], f[2]); f = [f[0] / fl, f[1] / fl, f[2] / fl];
  var r = [-f[2], 0, f[0]], rl = Math.hypot(r[0], r[2]); r = [r[0] / rl, 0, r[2] / rl];
  var u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  var d = [X[0] - P[0], X[1] - P[1], X[2] - P[2]];
  var z = d[0] * f[0] + d[1] * f[1] + d[2] * f[2], F = (H / 2) / Math.tan(pose.fov * Math.PI / 360);
  return [(W + IN) / 2 + F * (d[0] * r[0] + d[1] * r[1] + d[2] * r[2]) / z, H / 2 - F * (d[0] * u[0] + d[1] * u[1] + d[2] * u[2]) / z];
}
function matchAt(pose, W, H, IN) {
  var A = LEARN.ANDON, L = LEARN.LANTERN;
  var top = seeFrom(pose, W, H, IN, [A.x, A.top, A.z]), foot = seeFrom(pose, W, H, IN, [A.x, A.foot, A.z]);
  var s = (foot[1] - top[1]) / (L.foot - L.top);
  var R = { s: s, tx: foot[0] - L.x * s, ty: foot[1] - L.foot * s, andon: [foot[0], top[1], foot[1]], IN: IN };
  R.margin = Math.min(-R.tx, -R.ty, R.tx + PW * s - W, R.ty + PH * s - H);
  return R;
}
var poseMemo = {};
export function learnPose(W, H, rail) {
  var tall = W / H < 0.8, IN = learnInset(W, H, rail), key = W + 'x' + H + ':' + IN;
  if (poseMemo[key]) return poseMemo[key];
  var b = tall ? LEARN.TALL : LEARN.WIDE, pose = { p: b.p, t: b.t, fov: b.fov };
  while (pose.fov > 16 && matchAt(pose, W, H, IN).margin < 6) pose = { p: b.p, t: b.t, fov: pose.fov - 1 };
  return (poseMemo[key] = pose);
}
// the painting at the turn's end: its scale s and where its corner stands (tx, ty), so its lantern is the andon
export function learnRoom(W, H, rail) {
  var IN = learnInset(W, H, rail);
  return matchAt(learnPose(W, H, rail), W, H, IN);
}

/* THE JOIN BETWEEN "LEARNING TO BUILD WITH AI" AND "THIS WEBSITE": one modelled room, one renderer (learning/house.js).
   Times in screens of the learning chapter's own scroll (p, from its section's top). At the end of the learning
   chapter the ledger shuts (SHUT), then the camera leaves the desk (LIFT) and arrives, as the learning section ends, at
   the first place of the site chapter's camera (site/camera.js cameraAt(0)), from where the site chapter goes on with
   the test's own track: no cut, no dissolve. The site chapter's name comes on over the lift (its lead, NAME, in
   screens before its own top). The learning section's last screen (its scroll ends a screen before the next section's
   top) is not a still: from START (screens before its own top) the site chapter draws the room itself and its camera
   goes on at once, while the learning chapter, its scroll at its end, stands aside (learning.js).
   Motion off: one cut at RM_CUT, from the open book to that first place. */
export var SITE = { SHUT: [8.1, 8.7], LIFT: [8.5, 10.0], START: -1, LEAD: 1.8, NAME: [-1.7, -1.05], OUT: [0.022, 0.07], RM_CUT: 9.2 };
