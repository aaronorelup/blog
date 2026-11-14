/* THE CLOSING BEAT (a draft, until the next chapter is built): the page ends by naming the chapter that comes next,
   the way look B's teaser named the film chapter: its name in the giant type and one small line under it, coming on
   from the left wing over the last picture of the chapter before (which stays on the screen under this). On a
   narrow screen the left wing is the screen's own edge, where a word coming on would show only its last letters, so
   there it rises a little from below instead, and is whole after the first few steps.
   The note under it ("More chapters are on their way", in the page: .closing-note) stands still on the screen
   (chapters.css makes it sticky): it comes on there, just after the name, in a few steps of scroll. On a phone it
   stands under the name; on a wider screen at the foot of the screen, over the floor of the toy room.
   The words are the section's own: <section id="closing" data-word="AI art|&amp; images" data-say="6 posts"> (a |
   breaks the name into lines, as look B breaks "AI video / & film"). The note stands under the name, however many
   lines it has: its place is set here from the name's height.
   When the next chapter is built its line goes above this one in chapters.js, and this beat names the one after. */
var clamp = function (x, a, b) { return x < a ? a : x > b ? b : x; };
var ss = function (a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
var io = function (t) { t = clamp(t, 0, 1); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };

export function mount(host, options) {
  var root = document.documentElement, K = 1.4;                 // (look B lays its type out larger than it is drawn)
  host.innerHTML = '<div class="flat word"></div><div class="flat say mono"></div>';
  var word = host.firstChild, say = host.lastChild, W = 0, H = 0, left = 0, wy = 0, sx = 0, sy = 0, laid = false, lastW = '', lastS = '', narrow = false;
  var note = options.section.querySelector('.closing-note'), lastN = -1;
  (options.section.dataset.word || '').split('|').forEach(function (line) { var l = document.createElement('span'); l.className = 'l'; l.textContent = line; word.appendChild(l); });
  say.textContent = options.section.dataset.say || '';

  function layout() {
    W = root.clientWidth; H = window.innerHeight;
    var tall = W / H < 0.9; narrow = W <= 820;
    // look B's rule for a chapter's name: its size, its left edge clear of the rail, a tenth of the way down
    var wp = clamp(W * (tall ? 0.15 : 0.115), 52, 190), sp = clamp(W * 0.0175, 17, 27);
    // (a wide, short screen: the name is held to a fifth of the height, so that its two lines end above the toy box's
    // open lid in the last picture of the chapter before: toybox.js's last view)
    if (!narrow) wp = Math.min(wp, H * 0.19);
    left = narrow ? 16 : (parseFloat(getComputedStyle(root).getPropertyValue('--rail-w')) || 172) + Math.max(16, Math.min(46, W * 0.032)) * 2;
    word.style.fontSize = (wp * K) + 'px'; say.style.fontSize = (sp * 0.8 * K) + 'px';
    wy = H * (narrow ? 0.11 : 0.1);
    sx = left + wp * 0.08; sy = wy + word.offsetHeight / K + sp * 0.7;
    // the note: on a phone under the name; on a wider screen at the foot of the screen, over the floor, clear of the
    // toy box and the huddle (as the games chapter's card waits at the foot of its screen)
    if (note) note.style.top = Math.round(narrow ? sy + say.offsetHeight / K + 22 : H * 0.92 - note.offsetHeight) + 'px';
    lastW = lastS = '';
  }
  function put(el, x, y, k, was) {            // k: 0 off in the left wing (narrow: a little below, unseen), 1 in its place
    var tr;
    if (narrow) tr = 'translate3d(' + x.toFixed(2) + 'px,' + (y + (1 - k) * H * 0.07).toFixed(2) + 'px,0) scale(' + (1 / K).toFixed(5) + ')';
    else { var w = el.offsetWidth / K; tr = 'translate3d(' + (x - (1 - k) * (Math.max(x, 0) + w + 30)).toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) scale(' + (1 / K).toFixed(5) + ')'; }
    if (tr !== was) {
      var o = narrow ? clamp((k - 0.06) * 5.5, 0, 1) : 1;       // (narrow: whole after the first fifth of its rise)
      el.style.transform = tr; el.style.visibility = k < 0.0005 || o <= 0 ? 'hidden' : '';
      el.style.opacity = narrow && o < 1 ? o.toFixed(3) : '';
    }
    return tr;
  }
  return {
    // q runs from -1 (the section's top is at the foot of the screen) through 0 (at its top) to 1 (the page's end)
    frame: function (q) {
      if (!laid) { layout(); laid = true; }
      // (narrow: later, once the last of the chapter before has gone up off the screen)
      var k = options.reduced ? (q > -0.5 ? 1 : 0) : narrow ? io(ss(-0.55, -0.14, q)) : io(ss(-0.8, -0.12, q));
      lastW = put(word, left, wy, k, lastW);
      lastS = put(say, sx, sy, options.reduced ? k : narrow ? io(ss(-0.5, -0.08, q)) : io(ss(-0.7, -0.02, q)), lastS);
      // the note: until it has reached its place at the top of the screen it is not there (so it never crosses the
      // picture on its way up); there it comes on, lifting a few pixels
      var n = options.reduced ? (q >= 0 ? 1 : 0) : Math.round(ss(0, 0.14, q) * 200) / 200;
      if (note && n !== lastN) {
        note.style.opacity = n >= 1 ? '' : String(n); note.style.visibility = n <= 0 ? 'hidden' : '';
        note.style.transform = n >= 1 ? '' : 'translate3d(0,' + ((1 - n) * 10).toFixed(1) + 'px,0)'; lastN = n;
      }
      return true;
    },
    resize: function () { if (laid) layout(); },
    setActive: function () {},
    dispose: function () { if (note) { note.style.opacity = ''; note.style.visibility = ''; note.style.transform = ''; note.style.top = ''; } }
  };
}
