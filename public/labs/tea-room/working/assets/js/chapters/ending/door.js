// THE TEA HOUSE'S DOOR, as the walk's camera comes up to it (join.js ENDING; projects.js lays this over the walk's
// house). Look B's own passage through the door (diorama.js drawGarden), on the walk's plate: as the house grows,
// its sharp front (garden-doorhi.webp, the house four times as fine, with the doorway open) comes in over the plate;
// in the doorway the lamplight (garden-veil.webp) thins and the back room is there behind it (ending/scene.js
// roomScene), deeper than the door, so it grows more slowly; the warm glow round the door fades. Look B's thresholds,
// on look B's measure of how large the house stands (zh).
//   doorStack(parent) -> { frame(house, zh, room, t), hide(), ready() }
//     house: where the walk draws its house plate ({ x, y, s }: top left and scale, the plate 2816 x 1297)
//     room:  where the room plate stands ({ x, y, s }) and tall (a phone: the room's foot fades to the floor)
import { roomScene } from './scene.js';

var IMG = new URL('../../../img/', import.meta.url).href;
var clamp = function (x, a, b) { return x < a ? a : x > b ? b : x; };
var ss = function (a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
// in the walk's house plate's pixels (look B: the far plate's point (1408, 786) less the ground plate's top, 287)
var HI = [1064, 257, 704, 396], VEIL = [1356.75, 385.25, 115.25, 122], GLOW = [1416, 469, 560], HOLE = [1358.75, 387.5, 1470, 505.25];

export function doorStack(parent) {
  var box = document.createElement('div');
  box.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;z-index:8;pointer-events:none;visibility:hidden';
  parent.appendChild(box);
  var roomBox = document.createElement('div'); roomBox.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
  box.appendChild(roomBox);
  var room = roomScene(roomBox);
  function pic(src, w, h) {
    var i = document.createElement('img'); i.alt = ''; i.decoding = 'async'; i.draggable = false; i.src = src;
    i.style.cssText = 'position:absolute;left:0;top:0;width:' + w + 'px;height:' + h + 'px;max-width:none;transform-origin:0 0';
    box.appendChild(i); return i;
  }
  var veil = pic(IMG + 'garden-veil.webp', 461, 488);
  var hi = pic(IMG + 'garden-doorhi.webp', 2816, 1584);
  // (the walk's house fades into the lawn below its middle: the sharp front takes the same fade)
  var m = 'linear-gradient(to bottom, #000 53%, rgba(0, 0, 0, 0.45) 100%)';
  hi.style.webkitMaskImage = m; hi.style.maskImage = m;
  var glow = document.createElement('div');
  glow.style.cssText = 'position:absolute;left:0;top:0;width:560px;height:560px;border-radius:50%;transform-origin:0 0;' +
    'background:radial-gradient(closest-side, rgba(255, 196, 110, 0.42), rgba(255, 180, 90, 0.16) 45%, rgba(255, 170, 80, 0) 100%)';
  box.appendChild(glow);
  var was = {};
  function set(e, k, v, key) { key = key || k; if (was[key] !== v) { was[key] = v; e.style[k] = v; } }
  function at(e, x, y, s, key) { set(e, 'transform', 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) scale(' + s.toFixed(5) + ')', key); }
  var shown = false;

  return {
    // t: seconds (the glow breathes as look B's does); returns true when the house's own front can no longer be seen
    frame: function (house, zh, rm, t) {
      if (!shown) { box.style.visibility = 'inherit'; shown = true; }
      var X = function (v) { return house.x + v * house.s; }, Y = function (v) { return house.y + v * house.s; };
      var a = ss(1.25, 1.7, zh);
      set(hi, 'opacity', a.toFixed(3), 'hio'); at(hi, X(HI[0]), Y(HI[1]), house.s / 4, 'hit');
      var open = a >= 0.999;
      // the room, only through the doorway, and only once the sharp front stands over the plate's painted door
      set(roomBox, 'visibility', open ? 'inherit' : 'hidden', 'rv');
      if (open) {
        var l = X(HOLE[0]), tp = Y(HOLE[1]), r = X(HOLE[2]), b = Y(HOLE[3]);
        set(roomBox, 'clipPath', 'inset(' + Math.max(0, tp).toFixed(1) + 'px ' + Math.max(0, roomBox.clientWidth - r).toFixed(1) + 'px ' + Math.max(0, roomBox.clientHeight - b).toFixed(1) + 'px ' + Math.max(0, l).toFixed(1) + 'px)', 'rc');
        room.put(rm, rm.tall);
      }
      var vo = open ? 1 - ss(1.5, 6.5, zh) : 0;
      set(veil, 'visibility', vo > 0.002 ? 'inherit' : 'hidden', 'vv');
      if (vo > 0.002) { set(veil, 'opacity', vo.toFixed(3), 'vo'); at(veil, X(VEIL[0]), Y(VEIL[1]), house.s / 4, 'vt'); }
      var breathe = 0.9 + 0.06 * Math.sin(t * 1.26) + 0.02 * Math.sin(t * 2.9);
      var go = Math.round(breathe * (1 - ss(2.5, 7, zh)) * a * 200) / 200;
      set(glow, 'visibility', go > 0 ? 'inherit' : 'hidden', 'gv');
      if (go > 0) { set(glow, 'opacity', String(go), 'go'); at(glow, X(GLOW[0] - GLOW[2] / 2), Y(GLOW[1] - GLOW[2] / 2), house.s, 'gt'); }
      return zh > 2.7;
    },
    hide: function () { if (shown) { box.style.visibility = 'hidden'; shown = false; } },
    ready: function () { return hi.complete && veil.complete && room.ready(); },
    dispose: function () { box.remove(); }
  };
}
