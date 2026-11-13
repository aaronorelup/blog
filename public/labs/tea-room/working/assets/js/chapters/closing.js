/* THE CLOSING BEAT (a draft, until the next chapter is built): the page ends by naming the chapter that comes next,
   the way look B's teaser named the film chapter: its name in the giant type and one small line under it, coming on
   from the left wing over the last picture of the chapter before (which stays on the screen under this).
   The words are the section's own: <section id="closing" data-word="Games" data-say="7 posts">.
   When the next chapter is built its line goes above this one in chapters.js, and this beat names the one after. */
var clamp = function (x, a, b) { return x < a ? a : x > b ? b : x; };
var ss = function (a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
var io = function (t) { t = clamp(t, 0, 1); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };

export function mount(host, options) {
  var root = document.documentElement, K = 1.4;                 // (look B lays its type out larger than it is drawn)
  host.innerHTML = '<div class="flat word"></div><div class="flat say mono"></div>';
  var word = host.firstChild, say = host.lastChild, W = 0, H = 0, left = 0, wy = 0, sx = 0, sy = 0, laid = false, lastW = '', lastS = '';
  word.textContent = options.section.dataset.word || ''; say.textContent = options.section.dataset.say || '';

  function layout() {
    W = root.clientWidth; H = window.innerHeight;
    var tall = W / H < 0.9, narrow = W <= 820;
    // look B's rule for a chapter's name: its size, its left edge clear of the rail, a tenth of the way down
    var wp = clamp(W * (tall ? 0.15 : 0.115), 52, 190), sp = clamp(W * 0.0175, 17, 27);
    left = narrow ? 16 : (parseFloat(getComputedStyle(root).getPropertyValue('--rail-w')) || 172) + Math.max(16, Math.min(46, W * 0.032)) * 2;
    word.style.fontSize = (wp * K) + 'px'; say.style.fontSize = (sp * 0.8 * K) + 'px';
    wy = H * (narrow ? 0.11 : 0.1);
    sx = left + wp * 0.08; sy = wy + word.offsetHeight / K + sp * 0.7;
    lastW = lastS = '';
  }
  function put(el, x, y, k, was) {            // k: 0 off in the left wing, 1 in its place
    var w = el.offsetWidth / K, tr = 'translate3d(' + (x - (1 - k) * (Math.max(x, 0) + w + 30)).toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) scale(' + (1 / K).toFixed(5) + ')';
    if (tr !== was) { el.style.transform = tr; el.style.visibility = k < 0.0005 ? 'hidden' : ''; }
    return tr;
  }
  return {
    // q runs from -1 (the section's top is at the foot of the screen) through 0 (at its top) to 1 (the page's end)
    frame: function (q) {
      if (!laid) { layout(); laid = true; }
      var k = options.reduced ? (q > -0.5 ? 1 : 0) : io(ss(-0.8, -0.12, q));
      lastW = put(word, left, wy, k, lastW);
      lastS = put(say, sx, sy, options.reduced ? k : io(ss(-0.7, -0.02, q)), lastS);
      return true;
    },
    resize: function () { if (laid) layout(); },
    setActive: function () {},
    dispose: function () {}
  };
}
