// The five world configurations, resolved: worlds/<id>.js over the defaults, then brandMode. Read at build time
// by Page.astro, World.astro and Mark.astro, and in the browser by the scene. world(id) is the only way in.
// A world with no file of its own still gets a complete configuration from _default.js.
import { defaults, GLASS, HOUSE } from './_default.js';

const FILES = import.meta.glob(['./*.js', '!./index.js', '!./_default.js'], { eager: true, import: 'default' });
export const ORDER = ['anthropic', 'openai', 'google', 'meta', 'xai'];
export { HOUSE };

const NESTED = ['theme', 'hour', 'marks', 'art', 'alt', 'character', 'backdrop', 'fore'];
const cache = new Map();

// brandMode "marks-only" (SPEC 3.2, 10): glass, glow and the chrome line fall back to house greys.
// Marks, character, art and layout stay as they are.
function reserved(theme) {
  return { ...theme, glass: HOUSE.mid, rim: '#FFFFFF', glow: '#FFFFFF', line: HOUSE.ink2, prism: null };
}

export function world(id) {
  if (cache.has(id)) return cache.get(id);
  const base = defaults(id);
  const own = FILES[`./${id}.js`] || {};
  const cfg = { ...base, ...own };
  for (const key of NESTED) cfg[key] = own[key] === null ? null : { ...base[key], ...(own[key] || {}) };
  if (own.portrait === undefined && !cfg.art.portrait) cfg.portrait = null;
  if (cfg.brandMode === 'marks-only') cfg.theme = reserved(cfg.theme);
  cache.set(id, cfg);
  return cfg;
}

// Whose colour: the glass of any owner id, the five plus "outside", "you" and "house".
export function owner(id) {
  if (ORDER.includes(id)) { const t = world(id).theme; return { glass: t.glass, rim: t.rim, glow: t.glow, prism: t.prism }; }
  return GLASS[id] || GLASS.outside;
}

// The page's theme stylesheet, written into <head> by Page.astro: one source for the DOM and the scene.
// --w-edge is the outline a slab of this glass needs on paper: the rim for a pale glass, else the glass.
// --w-hatch is the second tone of its hatching: grey on a pale glass, paper on any other.
const pale = (hex) => { const n = parseInt(hex.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) > 200; };
export function themeCss() {
  const fill = (id) => { const o = owner(id); return o.prism ? `linear-gradient(90deg,${o.prism.join(',')})` : o.glass; };
  const vars = [...ORDER, 'outside', 'you'].map((id) => `--ail-own-${id}:${fill(id)};--ail-rim-${id}:${owner(id).rim}`).join(';');
  const rules = ORDER.map((id) => {
    const t = world(id).theme;
    const dark = t.chrome === 'dark';
    return `.ail-world[data-world="${id}"]{--w-ground:${t.ground};--w-ink:${t.ink};--w-glass:var(--ail-own-${id});--w-edge:${pale(t.glass) ? t.rim : t.glass};--w-hatch:${pale(t.glass) ? HOUSE.mid : HOUSE.floor};--w-line:${t.line};`
      + `--w-scrim:${dark ? 'rgba(12,13,16,.88)' : 'rgba(248,249,251,.9)'};--w-card:${dark ? '#16171B' : '#FFFFFF'}}`;
  });
  return `.ail{${vars}}${rules.join('')}`;
}
