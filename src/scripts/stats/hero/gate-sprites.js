// The gate's dots, drawn once per mode and pixel ratio into one small atlas, then stamped with
// drawImage every frame. Stamping a bitmap is far cheaper than filling a path 1,600 times a
// frame, and it keeps the glyph shapes identical to the SVG ones elsewhere on the page: both come
// from ui/glyph's glyphPath.

// Keys in the atlas. 'n' is an unsorted guest; 'pS' a counted person, 'pR' one who only looked
// like a person; 'glow' the lamplight halo under counted people at night; 'you' the reader.
export const SPRITES = ['n', 'bot', 'scanner', 'agent', 'stale', 'pS', 'pR', 'glow', 'you'];

/**
 * pal: ctx.palette() (person, personGlow, bot, scanner, agent, stale, soft, you, mode).
 * r: dot radius in CSS px; p: pitch; dpr: device pixels per CSS px.
 * forced: draw everything in one system colour (forced-colors mode).
 */
export function buildAtlas({ pal, r, p, dpr, glyphPath, forced = null }) {
  const gp = glyphPath;
  const ring = Math.max(1, 0.18 * p);
  const glowR = 2.2 * r;
  const youR = 1.4 * r;
  // Each cell is square and holds the sprite centred, with room for the biggest member.
  const sizeOf = (key) => (key === 'glow' ? 2 * glowR + 2 : key === 'you' ? 2 * youR + 4 : 2.6 * r + 3);
  const cells = {};
  let x = 0;
  for (const key of SPRITES) {
    const s = Math.ceil(sizeOf(key) * dpr);
    cells[key] = { sx: x, sy: 0, s, css: s / dpr };
    x += s + 2;
  }
  const h = Math.max(...Object.values(cells).map((c) => c.s));
  const canvas = typeof OffscreenCanvas === 'function' ? new OffscreenCanvas(x, h) : Object.assign(document.createElement('canvas'), { width: x, height: h });
  const c = canvas.getContext('2d');
  const col = (v) => forced || v;

  for (const key of SPRITES) {
    const cell = cells[key];
    c.save();
    c.translate(cell.sx + cell.s / 2, cell.s / 2);
    c.scale(dpr, dpr);
    switch (key) {
      case 'n':
        c.globalAlpha = 0.8;
        c.fillStyle = col(pal.soft);
        c.fill(gp('person', r));
        break;
      case 'scanner':
        c.strokeStyle = col(pal.scanner);
        c.lineWidth = Math.max(1, 0.44 * r);
        c.lineCap = 'round';
        c.stroke(gp('scanner', r));
        break;
      case 'pS':
        c.fillStyle = col(pal.person);
        c.fill(gp('person', r));
        break;
      case 'pR': {
        c.strokeStyle = col(pal.person);
        c.lineWidth = ring;
        c.beginPath(); c.arc(0, 0, r - ring / 2, 0, Math.PI * 2); c.stroke();
        break;
      }
      case 'glow': {
        if (forced) break;
        const g = c.createRadialGradient(0, 0, r * 0.6, 0, 0, glowR);
        g.addColorStop(0, pal.personGlow || 'rgba(240,192,106,.2)');
        g.addColorStop(1, 'rgba(240,192,106,0)');
        c.fillStyle = g;
        c.beginPath(); c.arc(0, 0, glowR, 0, Math.PI * 2); c.fill();
        break;
      }
      case 'you':
        c.strokeStyle = col(pal.you || '#F7C9D4');
        c.lineWidth = 2;
        c.beginPath(); c.arc(0, 0, youR, 0, Math.PI * 2); c.stroke();
        break;
      default:
        c.fillStyle = col(pal[key]);
        c.fill(gp(key, r));
    }
    c.restore();
  }
  return { canvas, cells, r, dpr };
}

/** Stamp sprite `key` centred at (x, y) CSS px, scaled by `scale`. The caller sets globalAlpha. */
export function stamp(g, atlas, key, x, y, scale = 1) {
  const cell = atlas.cells[key];
  const d = cell.css * scale;
  g.drawImage(atlas.canvas, cell.sx, cell.sy, cell.s, cell.s, x - d / 2, y - d / 2, d, d);
}
