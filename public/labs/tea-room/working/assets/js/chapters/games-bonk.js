/* THE GAMES CHAPTER'S SECOND WORLD: Megabonk, with Jefrie modded in (games.js places it and says when; this file draws it).

   What is drawn is footage of the mod running on the owner's own machine, two short silent loops (docs/MEDIA.md: they
   live in R2, /media/tea/games/):
     lobby    she stands with her scythe in the game's lobby, the game's menus switched off. The game's own camera
              drifts, so the loop runs forward and then back.
     arrive   the game's loading screen (black), then its portal opens in the forest and she steps out of it.
   Each loop has one depth map (assets/img/games/bonk-*-depth.webp, white is near), made once from its footage. The
   picture is drawn through it: every point is moved by how near it is times how far the view leans, so near things
   slide against far ones as the mouse moves. No 3D library: one quad, one small shader.

   Everything drawn is a function of what games.js hands in (how far the picture has come in, which loop, the lean) and
   of where each loop is in its own time. With motion turned off, with time held, or without WebGL: the loops' stills,
   changed by a cut. */
var IMG = new URL('../../img/games/', import.meta.url).href;
var AT = '/media/tea/games/';
var clamp = function (x, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return x < a ? a : x > b ? b : x; };
var ss = function (a, b, x) { var t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
var ASPECT = 1280 / 720;
var DIP = 0.2;                                    // a change of loop goes through black, as the game's own does: this long down, this long up
// each loop: its files, where she stands in the picture (the view closes in on that), how near she is in the depth map
// (what stays put when the view leans), and how far the view comes in from first to last
var PARTS = [
  { file: 'megabonk-lobby', still: 'bonk-lobby', depth: 'bonk-lobby-depth', at: [0.545, 0.6], pivot: 0.573, zoom: [1.07, 1.3] },
  { file: 'megabonk-arrive', still: 'bonk-arrive', depth: 'bonk-arrive-depth', at: [0.5, 0.62], pivot: 0.465, zoom: [1.1, 1.75] }
];
var REACH = [0.028, 0.025];                        // how far the nearest thing slides at a full lean (of the picture's width, height)

var VERT = 'attribute vec2 p; varying vec2 v; void main() { v = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }';
var FRAG = [
  '#ifdef GL_FRAGMENT_PRECISION_HIGH',
  'precision highp float;',                       // (a phone's mediump would read a 1280-wide picture on a coarse grid)
  '#else',
  'precision mediump float;',
  '#endif',
  'varying vec2 v;',
  'uniform sampler2D pic, dep;',
  'uniform vec4 fit;',                            // the screen to the picture: size.xy, middle.xy
  'uniform vec3 lean;',                           // how far near things slide (x, y), and the depth that stays put
  'uniform float dim;',
  'void main() {',
  '  vec2 u = vec2(fit.z + (v.x - 0.5) * fit.x, fit.w - (v.y - 0.5) * fit.y);',
  '  vec2 q = u;',
  // (the depth is read where the point comes from, not where it lands: a few rounds settle it)
  '  for (int i = 0; i < 4; i++) { q = u + lean.xy * (texture2D(dep, clamp(q, 0.0, 1.0)).r - lean.z); }',
  '  gl_FragColor = vec4(texture2D(pic, clamp(q, 0.001, 0.999)).rgb * dim, 1.0);',
  '}'
].join('\n');

export function mount(host, options) {
  var RM = options.reduced, HELD = options.held, alive = true;
  host.innerHTML = '<img class="gm-bonk-still" data-k="0" alt="" decoding="async"><img class="gm-bonk-still" data-k="1" alt="" decoding="async" hidden>' +
    '<canvas class="gm-bonk-gl" hidden></canvas><div class="gm-bonk-hold"></div>';
  var stills = [host.querySelector('[data-k="0"]'), host.querySelector('[data-k="1"]')], canvas = host.querySelector('.gm-bonk-gl'), hold = host.querySelector('.gm-bonk-hold');
  var W = 1, H = 1, gl = null, prog = null, loc = {}, lost = false;
  var got = [{ still: false, depth: false, lost: false }, { still: false, depth: false, lost: false }];
  var tex = [{ pic: null, dep: null }, { pic: null, dep: null }], vids = [null, null], fed = [false, false];

  // ------------------------------------------------------------------ what has come in
  function whenIn(im, done) {
    var go = function () { if (alive) done(); };
    var dec = function () { (im.decode ? im.decode() : Promise.resolve()).then(go, go); };
    if (im.complete && im.naturalWidth) dec(); else { im.addEventListener('load', dec, { once: true }); im.addEventListener('error', go, { once: true }); }
  }
  PARTS.forEach(function (P, i) {
    // (each still covers the screen about where its own loop closes in: games.css has the lobby's place)
    stills[i].style.objectPosition = stills[i].style.transformOrigin = (P.at[0] * 100).toFixed(1) + '% ' + (P.at[1] * 100).toFixed(1) + '%';
    stills[i].src = IMG + P.still + '.webp';
    whenIn(stills[i], function () {
      got[i].still = !!stills[i].naturalWidth; if (!got[i].still) got[i].lost = true;
      if (gl && got[i].still && !fed[i]) put(tex[i].pic, stills[i]);
      options.redraw();
    });
  });

  // ------------------------------------------------------------------ the shader (not with motion off or time held)
  function texture() {
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([8, 22, 30]));
    return t;
  }
  function put(t, source) {
    try { gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source); return true; }
    catch (err) { return false; }                  // (a frame that cannot be read yet: the picture before stays)
  }
  function shader(kind, src) {
    var s = gl.createShader(kind); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
    return s;
  }
  function start() {
    try {
      gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'default' });
      if (!gl) return false;
      prog = gl.createProgram();
      gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || 'link');
      gl.useProgram(prog);
      var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      var at = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(at); gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0);
      ['pic', 'dep', 'fit', 'lean', 'dim'].forEach(function (n) { loc[n] = gl.getUniformLocation(prog, n); });
      gl.uniform1i(loc.pic, 0); gl.uniform1i(loc.dep, 1);
      PARTS.forEach(function (P, i) {
        tex[i].pic = texture(); tex[i].dep = texture();
        if (got[i].still) put(tex[i].pic, stills[i]);
        var d = new Image(); d.decoding = 'async'; d.src = IMG + P.depth + '.webp';
        whenIn(d, function () { if (gl && d.naturalWidth) { put(tex[i].dep, d); got[i].depth = true; } options.redraw(); });
      });
      // (a lost context is not asked back: the stills stand in from then on, and the loops stop)
      canvas.addEventListener('webglcontextlost', function () { lost = true; gl = null; canvas.hidden = true; shown = -1; showStill(part); sync(); if (alive) options.redraw(); });
      canvas.hidden = false;
      return true;
    } catch (err) {
      if (window.console) console.warn('The Megabonk picture is drawn flat, its shader could not start: ' + (err && err.message || err));
      if (gl) { var x = gl.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); }
      gl = null; canvas.hidden = true; return false;
    }
  }
  var moving = !RM && !HELD && start();

  // ------------------------------------------------------------------ the loops (asked for only when the reader is near)
  var asked = false, playing = false;
  function near() {
    if (asked || !moving) return; asked = true;
    // (a reader who asked their browser to save data keeps the stills: they still lean with the view)
    if (navigator.connection && navigator.connection.saveData) return;
    PARTS.forEach(function (P, i) {
      var v = document.createElement('video');
      v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true; v.preload = 'auto'; v.disableRemotePlayback = true;
      v.setAttribute('playsinline', ''); v.setAttribute('muted', ''); v.tabIndex = -1;
      v.addEventListener('error', function () { v.failed_ = true; });       // (the still stays)
      // (and it stays until the loop is really playing: a browser that will not start a video by itself, a phone
      // saving its battery, would else show the arrival's black first frame for good)
      v.addEventListener('playing', function () { v.plays_ = true; v.fresh_ = true; });
      // (the texture takes a picture only when the loop has a new one: the loops run at 30 a second, the screen faster)
      if (v.requestVideoFrameCallback) { var tick = function () { v.fresh_ = true; if (alive) v.requestVideoFrameCallback(tick); }; v.requestVideoFrameCallback(tick); }
      v.src = AT + P.file + '.mp4';
      hold.appendChild(v); vids[i] = v;
    });
    sync();
  }
  function sync() {
    for (var i = 0; i < vids.length; i++) {
      var v = vids[i]; if (!v) continue;
      var on = playing && i === part && !document.hidden && !lost;
      if (on && v.paused) { var pl = v.play(); if (pl && pl.catch) pl.catch(function () {}); }
      else if (!on && !v.paused) v.pause();
    }
  }
  function onVisibility() { sync(); }
  document.addEventListener('visibilitychange', onVisibility);

  // ------------------------------------------------------------------ the frame
  var part = 0, want = 0, dipAt = -1, dimWas = -1, shown = -1, sizeWas = '', drawnAt = -1e9, puts = 0;
  var armed = -1;                                   // when the arrival was last started: its first picture is waited for, a moment
  function showStill(i) {
    if (shown === i) return; shown = i;
    stills[0].hidden = gl ? true : i !== 0; stills[1].hidden = gl ? true : i !== 1;
  }
  function cut(i, t) {
    part = i; armed = -1;
    // (the arrival always starts at its loading screen; the lobby goes on from where it was)
    if (i === 1 && vids[1] && !vids[1].failed_) {
      vids[1].plays_ = false; armed = t === undefined ? -1 : t;
      try { vids[1].currentTime = 0; } catch (err) { /* not loaded yet: it starts at 0 anyway */ }
    }
    sync();
  }
  function resize() {
    W = host.clientWidth || 1; H = host.clientHeight || 1;
    if (!gl) { sizeWas = 'flat'; return; }
    // (the footage is 1280 wide, and a tall screen shows only a strip of it: a drawing buffer much finer than the
    // footage on the screen would show nothing more)
    var across = 1280 * Math.min(1, W / H / ASPECT) / PARTS[0].zoom[0];
    var d = Math.min(window.devicePixelRatio || 1, 2, 1920 / W, Math.max(1, 1.6 * across / W)), k = Math.round(W * d) + 'x' + Math.round(H * d);
    if (k === sizeWas) return; sizeWas = k;
    canvas.width = Math.round(W * d); canvas.height = Math.round(H * d);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  // st: { part 0|1, push 0..1 (how far in the view has come), lx, ly (the lean, -1..1), t (seconds) }
  function frame(st) {
    if (!alive) return;
    if (!sizeWas) resize();
    var t = st.t, dim = 1, fresh = t - drawnAt > 0.4 || t < drawnAt;   // (fresh: it was not on the screen a moment ago)
    drawnAt = t;
    // which loop: a change goes down through black and comes up on the other (DIP each way)
    if (st.part !== want || (fresh && part !== want)) {
      want = st.part;
      if (!moving) { cut(want); dipAt = -1; }
      // (nobody saw the other loop: no way down to show. The arrival still comes up out of its black loading screen)
      else if (fresh) { cut(want, t); dipAt = want === 1 ? t - DIP : -1; }
      else if (dipAt < 0) dipAt = t;
      // (a flick back turns the dip round where it is: on the way down it comes back up with nothing changed, on the
      // way up it goes down again so the change back is in black too)
      else if (part === want && t - dipAt < DIP) dipAt = t - (2 * DIP - (t - dipAt));
      else if (part !== want && armed < 0 && t - dipAt >= DIP) dipAt = t - Math.max(0, 2 * DIP - (t - dipAt));
    }
    if (dipAt >= 0 && t - dipAt >= DIP && part !== want) cut(want, t);
    // (with motion off nothing moves with the scroll: each still at one size)
    var P = PARTS[part], zoom = P.zoom[0] + (P.zoom[1] - P.zoom[0]) * (RM ? 0.3 : clamp(st.push));
    if (!gl) {                                     // the still, fitted like the footage (games.css: it covers the screen)
      dipAt = -1; showStill(part);
      var tr = 'scale(' + zoom.toFixed(4) + ')';
      if (stills[part].tr_ !== tr) { stills[part].style.transform = tr; stills[part].tr_ = tr; }
      return;
    }
    // the loop's own picture, when it is really running and has a new one (until then its still is in the texture)
    var v = vids[part], amp = 1;
    if (v && v.plays_ && !v.failed_ && !v.paused && !v.seeking && v.readyState >= 2 && (v.fresh_ || !v.requestVideoFrameCallback)) {
      if (put(tex[part].pic, v)) { fed[part] = true; v.fresh_ = false; puts++; if (part === 1) armed = -1; }
    }
    if (dipAt >= 0) {
      var k = (t - dipAt) / DIP;
      // (the picture stays down until the arrival's first picture is in, so neither its still nor its last run flashes
      // before its loading screen; a browser that will not start it gets the still after a moment)
      if (k >= 1 && part === 1 && armed >= 0) {
        if (v && !v.failed_ && t - armed < 0.7 && t >= armed) { dipAt = t - DIP; k = 1; } else armed = -1;
      }
      if (k >= 2 || k < 0) dipAt = part !== want ? t : -1; else dim = Math.abs(1 - k);
    }
    if (part === 1) {
      // (the arrival's camera moves until she is out of the portal, and its depth map is of the forest after that: the
      // view leans only once the camera stands, and lets go before the loop's end)
      var tb = v && fed[1] ? v.currentTime : 0;
      amp = ss(2.9, 3.7, tb) * (1 - ss(6.2, 6.7, tb));
    }
    if (!got[part].depth) amp = 0;
    // the screen to the picture: it covers the screen, closed in on where she stands, never past the picture's edge
    var S = W / H, fx = Math.min(1, S / ASPECT) / zoom, fy = Math.min(1, ASPECT / S) / zoom, m = 0.022;
    var cx = fx / 2 + m > 0.5 ? 0.5 : clamp(P.at[0], fx / 2 + m, 1 - fx / 2 - m), cy = fy / 2 + m > 0.5 ? 0.5 : clamp(P.at[1], fy / 2 + m, 1 - fy / 2 - m);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex[part].pic);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tex[part].dep);
    gl.uniform4f(loc.fit, fx, fy, cx, cy);
    gl.uniform3f(loc.lean, (st.lx || 0) * REACH[0] * amp, (st.ly || 0) * REACH[1] * amp, P.pivot);
    if (dim !== dimWas) { gl.uniform1f(loc.dim, dim); dimWas = dim; }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  return {
    frame: frame,
    near: near,
    resize: function () { sizeWas = ''; resize(); },
    // (the first loop's still is in: the picture can come across. Its footage and its depth come when they come)
    ready: function () { return got[0].still; },
    lost: function () { return got[0].lost; },    // (that still will never come: there is no second world this time)
    answered: function (i) { return got[i].still || got[i].lost; },   // (a loop's still is in, or will never be)
    setPlaying: function (on) { if (on === playing) return; playing = on; sync(); },
    moving: function () { return !!gl; },         // (for tests: drawn through the shader, or the stills)
    part: function () { return part; },
    stats: function () { return { puts: puts, dip: dipAt >= 0 }; },   // (for tests: pictures taken from the loops so far)
    dispose: function () {
      alive = false; playing = false;
      document.removeEventListener('visibilitychange', onVisibility);
      vids.forEach(function (v) { if (v) { try { v.pause(); v.removeAttribute('src'); v.load(); } catch (err) { /* it is going anyway */ } } });
      if (gl) { var ext = gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext(); gl = null; }
    }
  };
}
