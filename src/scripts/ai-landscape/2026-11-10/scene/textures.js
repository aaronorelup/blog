// Every texture the scene draws: the world pictures, the mark plates, type and glyphs printed to a canvas.
// A mark is the official file drawn once, unaltered, on a plain white or ink plate with its clear space
// (SPEC 3.3 rule 7, 4.8). With no official file the plate carries the name in the house type: never an imitation.
import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter, Mesh, NoColorSpace, PlaneGeometry, SRGBColorSpace, TextureLoader } from 'three';
import { GLYPHS } from './glyphs.js';

const DISPLAY = '"League Gothic", "Arial Narrow", Impact, sans-serif';

export function createTextures(ctx) {
  const loader = new TextureLoader();
  const cache = new Map();
  const aniso = Math.min(8, ctx.renderer.capabilities.getMaxAnisotropy());
  const finish = (t, colour = true) => {
    t.colorSpace = colour ? SRGBColorSpace : NoColorSpace;
    t.anisotropy = aniso; t.generateMipmaps = true; t.minFilter = LinearMipmapLinearFilter; t.magFilter = LinearFilter;
    t.needsUpdate = true;
    return t;
  };
  const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
  const image = (url) => new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = url; });

  const tx = {
    // A picture file as a texture. Cached by URL: release(url) frees it when its world unmounts.
    load(url) {
      if (!url) return Promise.resolve(null);
      if (!cache.has(url)) cache.set(url, new Promise((resolve) => loader.load(url, (t) => resolve(finish(t)), undefined, () => resolve(null))));
      return cache.get(url);
    },
    release(url) {
      const hit = cache.get(url);
      if (!hit) return;
      cache.delete(url);
      hit.then((t) => t && t.dispose());
    },

    // The lid plate: `url` (the official SVG or PNG) centred on a rounded plate, clear space = clear x its height.
    async markPlate({ url, name, plate = 'white', clear = 0.5 }) {
      const S = 512;
      const ink = plate === 'ink';
      const blank = () => {
        const [c, g] = canvas(S, S);
        g.fillStyle = ink ? '#0C0D10' : '#FFFFFF';
        g.beginPath(); g.roundRect(3, 3, S - 6, S - 6, S * 0.112); g.fill();
        g.strokeStyle = ink ? '#33363D' : '#C9CDD5'; g.lineWidth = 3; g.stroke();
        return [c, g];
      };
      const [c, g] = blank();
      let img = null;
      let iw = 0;
      let ih = 0;
      let made = null;
      let over = 0;
      let foreign = false;
      if (url) {
        try {
          // an SVG with only a viewBox has no size of its own, and some browsers then draw nothing: give the
          // drawing (never the file) the size its viewBox states
          if (/\.svg(\?|$)/.test(url)) {
            const text = await (await fetch(url)).text();
            foreign = /<foreignObject/i.test(text);
            const root = text.slice(0, text.indexOf('>') + 1);
            const box = (root.match(/viewBox="([^"]+)"/) || [])[1];
            if (!/\swidth="/.test(root) && box) {
              const [, , bw, bh] = box.split(/[\s,]+/).map(Number);
              made = URL.createObjectURL(new Blob([text.replace('<svg', `<svg width="${bw * 32}" height="${bh * 32}"`)], { type: 'image/svg+xml' }));
            }
          }
          img = await image(made || url);
          iw = img.naturalWidth; ih = img.naturalHeight;
        } catch { img = null; }
      }
      if (img && iw && ih) {
        const pad = clear === 'own' ? 0 : clear;                  // 'own': the file carries its own clear space
        const h = Math.min((S * 0.94) / (1 + 2 * pad), ((S * 0.94) * ih) / (iw + 2 * pad * ih));
        const w = (h * iw) / ih;
        // an SVG with a foreignObject taints any canvas it is drawn to, so it cannot be a texture. The plate
        // then stays blank and row.js holds the file itself, as an <img>, over it (texture.userData.over)
        if (foreign) over = h / S; else g.drawImage(img, (S - w) / 2, (S - h) / 2, w, h);
      }
      if (made) URL.revokeObjectURL(made);
      if (!over && (!img || !iw || !ih)) {
        g.fillStyle = ink ? '#F8F9FB' : '#0C0D10';
        g.textAlign = 'center'; g.textBaseline = 'middle';
        const text = String(name || '').toUpperCase();
        let px = 150;
        g.font = `400 ${px}px ${DISPLAY}`;
        px = Math.min(px, (px * S * 0.62) / Math.max(1, g.measureText(text).width));
        g.font = `400 ${px}px ${DISPLAY}`;
        g.fillText(text, S / 2, S / 2 + px * 0.04);
      }
      const texture = finish(new CanvasTexture(c));
      texture.userData.over = over;              // the mark's height as a fraction of the plate, when it must be an <img>
      return texture;
    },

    // A portrait in its frame: a paper mat and an ink edge, drawn in code. One treatment for all five (SPEC 3.3).
    async framed(url) {
      let img = null;
      try { img = await image(url); } catch { return null; }
      const [c, g] = canvas(672, 872);
      g.fillStyle = '#0C0D10'; g.fillRect(0, 0, 672, 872);
      g.fillStyle = '#FFFFFF'; g.fillRect(8, 8, 656, 856);
      g.drawImage(img, 36, 36, 600, 800);
      g.strokeStyle = 'rgba(12,13,16,.35)'; g.lineWidth = 2; g.strokeRect(36, 36, 600, 800);
      return finish(new CanvasTexture(c));
    },

    // A word in the display face as an ink mask, cropped tight. Returns { texture, aspect }.
    title(text, px = 420) {
      const [m, mg] = canvas(8, 8);
      mg.font = `400 ${px}px ${DISPLAY}`;
      const box = mg.measureText(text);
      const w = Math.ceil(box.actualBoundingBoxLeft + box.actualBoundingBoxRight) + 8;
      const h = Math.ceil(box.actualBoundingBoxAscent + box.actualBoundingBoxDescent) + 8;
      const scale = Math.min(1, 4096 / w);
      const [c, g] = canvas(Math.ceil(w * scale), Math.ceil(h * scale));
      g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height);
      g.scale(scale, scale);
      g.font = `400 ${px}px ${DISPLAY}`; g.fillStyle = '#fff';
      g.fillText(text, box.actualBoundingBoxLeft + 4, box.actualBoundingBoxAscent + 4);
      m.width = 1;
      return { texture: finish(new CanvasTexture(c), false), aspect: c.width / c.height };
    },

    // One of GLYPHS as an ink mask.
    glyph(name, px = 128) {
      const key = `glyph:${name}:${px}`;
      if (cache.has(key)) return cache.get(key);
      const [c, g] = canvas(px, px);
      g.fillStyle = '#000'; g.fillRect(0, 0, px, px);
      g.scale(px / 24, px / 24);
      g.strokeStyle = '#fff'; g.lineWidth = 1.7; g.lineCap = 'round'; g.lineJoin = 'round';
      g.stroke(new Path2D(GLYPHS[name] || GLYPHS.lamp));
      const t = finish(new CanvasTexture(c), false);
      cache.set(key, t);
      return t;
    },
    // A small upright plane printed with a glyph, in ink (or `tint`).
    glyphPlane(name, size = 0.3, { side = 0, tint = '#0C0D10' } = {}) {
      const mesh = new Mesh(new PlaneGeometry(size, size), ctx.mats.paper(tx.glyph(name), { side, tint, blended: true, mask: true }));
      mesh.renderOrder = 6;
      return mesh;
    },

    // A soft round glow, for cores with the lights out.
    halo() {
      if (cache.has('halo')) return cache.get('halo');
      const [c, g] = canvas(128, 128);
      const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.25, 'rgba(255,255,255,.42)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
      const t = finish(new CanvasTexture(c));
      cache.set('halo', t);
      return t;
    },
  };
  return tx;
}
