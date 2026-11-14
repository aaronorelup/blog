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
    var dockW = Math.round(cl(W * 0.25, 300, 390)), dockR = Math.round(Math.max(24, W * 0.035));
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
  var s0 = Math.max(W / PW, H / PH) * (phone ? 1.0 : 1.08);
  var tx = cl(L.tcx - (phone ? 1080 : 1180) * s0, W - PW * s0, 0), ty = cl(H * 0.5 - (phone ? 700 : 760) * s0, H - PH * s0, 0);
  L.room = { s: s0, tx: tx, ty: ty, x: -tx / s0, y: -ty / s0, w: W / s0, h: H / s0 };
  return L;
}
