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
