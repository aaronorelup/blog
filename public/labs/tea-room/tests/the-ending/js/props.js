// What is drawn by code, in look B's hand: flat colour, one dark ink line, a little shading on the side the light is
// on. Each function returns SVG markup in the coordinates of the plate it stands on (room.webp is 2752 x 1536,
// the garden plates are 2400 x 1350), so it stays locked to the painting as the camera moves.

var INK = '#1b1219';
// a colour between a cold one and the one the floor lantern's light gives it
function tint(a, b, t) { return 'rgb(' + a.map(function (v, i) { return Math.round(v + (b[i] - v) * t); }).join(',') + ')'; }

// one paper lantern (a chochin), not lit: cx, cy its middle, w and h its size, tilt in degrees, warm 0..1 how much of
// the floor lantern's light falls on its right side
function chochin(cx, cy, w, h, tilt, warm, id) {
  var rx = w / 2, ry = h / 2, cap = Math.max(10, h * 0.09), cw = w * 0.56;
  var ribs = '';
  for (var i = 1; i < 7; i++) {
    var y = -ry + (h * i) / 7, f = Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))), x = rx * f;
    ribs += '<path d="M' + (-x).toFixed(1) + ' ' + y.toFixed(1) + ' Q0 ' + (y + h * 0.035).toFixed(1) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + '" />';
  }
  return '<g transform="translate(' + cx + ' ' + cy + ') rotate(' + tilt + ')">' +
    '<defs><linearGradient id="' + id + '" x1="0" x2="1" y1="0" y2="0">' +
    '<stop offset="0" stop-color="#5f4f5c"/><stop offset="0.5" stop-color="' + tint([150, 128, 128], [196, 158, 128], warm) + '"/>' +
    '<stop offset="1" stop-color="' + tint([170, 148, 140], [240, 190, 132], warm) + '"/></linearGradient></defs>' +
    '<ellipse rx="' + rx + '" ry="' + ry + '" fill="url(#' + id + ')" stroke="' + INK + '" stroke-width="6"/>' +
    '<g fill="none" stroke="#4e3d45" stroke-width="3" opacity="0.8">' + ribs + '</g>' +
    '<path d="M' + (-cw / 2) + ' ' + (-ry - cap * 0.4) + 'h' + cw + 'v' + cap + 'h' + (-cw) + 'z" fill="#2a1d24" stroke="' + INK + '" stroke-width="5"/>' +
    '<path d="M' + (-cw / 2) + ' ' + (ry - cap * 0.6) + 'h' + cw + 'v' + cap + 'h' + (-cw) + 'z" fill="#2a1d24" stroke="' + INK + '" stroke-width="5"/>' +
    '</g>';
}

// The back room, not ready: a ladder against the back wall, a stack of lanterns waiting to be hung, a coil of rope.
// The one lit lantern is the painting's own, on the floor at the right.
export function roomProps() {
  // the ladder: two rails, seven rungs, leaning on the left sliding door
  var x0 = 1420, x1 = 1600, yb = 1118, yt = 352, lean = 46;
  var rails = '', rungs = '';
  [[x0, x0 + lean], [x1, x1 + lean]].forEach(function (r, i) {
    rails += '<path d="M' + r[0] + ' ' + yb + ' L' + r[1] + ' ' + yt + '" stroke="' + INK + '" stroke-width="30" stroke-linecap="round"/>' +
             '<path d="M' + r[0] + ' ' + yb + ' L' + r[1] + ' ' + yt + '" stroke="' + (i ? '#7a5546' : '#5d4140') + '" stroke-width="19" stroke-linecap="round"/>';
  });
  rails += '<path d="M' + (x1 + 7) + ' ' + yb + ' L' + (x1 + lean + 7) + ' ' + yt + '" stroke="#c8895c" stroke-width="5" stroke-linecap="round" opacity="0.75"/>';
  for (var k = 1; k < 8; k++) {
    var t = k / 8, y = yb + (yt - yb) * t, xa = x0 + lean * t, xb = x1 + lean * t;
    rungs += '<path d="M' + (xa + 6) + ' ' + y + ' L' + (xb - 6) + ' ' + y + '" stroke="' + INK + '" stroke-width="20" stroke-linecap="round"/>' +
             '<path d="M' + (xa + 8) + ' ' + y + ' L' + (xb - 8) + ' ' + y + '" stroke="#6a4a43" stroke-width="10" stroke-linecap="round"/>';
  }
  // the rope over the third rung, hanging down in a loop
  var rope = '<path d="M' + (x0 + 30) + ' 830 C ' + (x0 - 40) + ' 900, ' + (x0 - 30) + ' 1010, ' + (x0 + 40) + ' 1040 S ' + (x0 + 120) + ' 940, ' + (x1 - 20) + ' 832" fill="none" stroke="' + INK + '" stroke-width="15"/>' +
             '<path d="M' + (x0 + 30) + ' 830 C ' + (x0 - 40) + ' 900, ' + (x0 - 30) + ' 1010, ' + (x0 + 40) + ' 1040 S ' + (x0 + 120) + ' 940, ' + (x1 - 20) + ' 832" fill="none" stroke="#a9876a" stroke-width="7"/>';
  // the ladder's shadow on the floor and the wall, away from the lantern
  var shade = '<path d="M' + (x0 - 30) + ' ' + (yb + 8) + ' L' + (x1 - 10) + ' ' + (yb + 8) + ' L' + (x1 - 120) + ' ' + (yb + 40) + ' L' + (x0 - 150) + ' ' + (yb + 40) + 'z" fill="#120b10" opacity="0.35"/>';
  // the stack: two lanterns side by side on the floor, one on top, one lying on its side in front
  var stack = '<ellipse cx="1990" cy="1080" rx="520" ry="80" fill="#ffb877" opacity="0.08"/>' +
    '<ellipse cx="1740" cy="1100" rx="200" ry="24" fill="#120b10" opacity="0.45"/>' +
    chochin(1700, 1012, 128, 160, -3, 0.45, 'lg1') +
    chochin(1836, 1016, 124, 154, 4, 1, 'lg2') +
    chochin(1768, 862, 118, 148, 2, 0.75, 'lg3') +
    chochin(1560, 1110, 104, 128, 84, 0.25, 'lg4');
  // a folded cloth on the floor, for the room still being made
  var cloth = '<path d="M1080 1150 l210 -14 l40 40 l-226 18z" fill="#3c3048" stroke="' + INK + '" stroke-width="5"/>' +
              '<path d="M1100 1168 l200 -12" stroke="#55456a" stroke-width="4"/>';
  return '<g>' + shade + rails + rungs + rope + cloth + stack + '</g>';
}

// The veranda the garden is seen from: the eave across the top, a post at the left, the boards at the foot.
// In the garden plates' coordinates (2400 x 1350).
export function veranda() {
  var boards = '';
  for (var i = 0; i < 7; i++) {
    var y = 1150 + i * 32 + i * i * 2.4;
    boards += '<path d="M-40 ' + y.toFixed(0) + ' L2440 ' + y.toFixed(0) + '" stroke="#120d14" stroke-width="' + (3 + i * 0.6).toFixed(1) + '"/>';
  }
  return '<g>' +
    // the boards: dark wood lit only by the moon along their front edge
    '<path d="M-40 1112 L2440 1112 L2440 1400 L-40 1400z" fill="#2a2230" stroke="' + INK + '" stroke-width="8"/>' +
    '<path d="M-40 1112 L2440 1112 L2440 1142 L-40 1142z" fill="#4a4258"/>' +
    '<path d="M-40 1142 L2440 1142" stroke="' + INK + '" stroke-width="6"/>' +
    boards +
    // the post at the left, and its little stone
    '<path d="M70 -20 L210 -20 L214 1120 L66 1120z" fill="#241c27" stroke="' + INK + '" stroke-width="9"/>' +
    '<path d="M180 -20 L210 -20 L214 1120 L184 1120z" fill="#3a3346"/>' +
    // the eave: a beam and the roof's edge
    '<path d="M-40 -20 L2440 -20 L2440 120 L-40 150z" fill="#1c1621" stroke="' + INK + '" stroke-width="9"/>' +
    '<path d="M-40 150 L2440 120 L2440 146 L-40 178z" fill="#3b3447" stroke="' + INK + '" stroke-width="7"/>' +
    '</g>';
}

// The moon, flat and inked, with two rings of its light round it (painted rings, not a glow)
export function moon(cx, cy, r) {
  return '<g>' +
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 2.6) + '" fill="#8d97c8" opacity="0.07"/>' +
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 1.7) + '" fill="#aab3dc" opacity="0.1"/>' +
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#f1ead6" stroke="#2a2a44" stroke-width="5"/>' +
    '<path d="M' + (cx + r * 0.2) + ' ' + (cy - r) + ' A ' + r + ' ' + r + ' 0 0 1 ' + (cx + r * 0.2) + ' ' + (cy + r) + ' A ' + (r * 0.82) + ' ' + r + ' 0 0 0 ' + (cx + r * 0.2) + ' ' + (cy - r) + 'z" fill="#d9cfb9" opacity="0.8"/>' +
    '<circle cx="' + (cx - r * 0.3) + '" cy="' + (cy - r * 0.2) + '" r="' + (r * 0.16) + '" fill="#ddd3bd"/>' +
    '<circle cx="' + (cx + r * 0.1) + '" cy="' + (cy + r * 0.35) + '" r="' + (r * 0.11) + '" fill="#ddd3bd"/>' +
    '<circle cx="' + (cx - r * 0.05) + '" cy="' + (cy - r * 0.55) + '" r="' + (r * 0.07) + '" fill="#ddd3bd"/>' +
    '</g>';
}
