// The room's colors: the site's --pc-* tokens read from the page (tokens.css), the tea room's constants
// (docs/TEA_ROOM.md: washi, ink, lantern, vermilion, lamp-cream) and the materials of each mode. html[data-mode]
// says day ('day') or night (anything else); watch() re-reads them when the mode changes while the room is open.

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
export const TEA = { washi: '#F1E6D0', ink: '#231F2B', lantern: '#FFD892', vermilion: '#B5482E', cream: '#F6E7C8' };

const MODES = {
  night: {
    tray: [rgb('#5A3A27'), rgb('#3B2618')], grain: rgb('#2A1A11'), seam: rgb('#1A110C'),
    glaze: [rgb('#E9D3AC'), rgb('#CDB38A')], shade: [0.62, 0.56, 0.8], crackle: rgb('#7A5A3C'),
    run: rgb('#5B3626'), lip: rgb('#8C5A3A'), line: rgb('#17141E'),
    light: rgb('#FFD892'), lightAt: [-0.32, -0.42], ambient: 0.34,
    scatter: [0.36, 0.17, 0.04], env: [0.10, 0.09, 0.14], spec: 'moon', steam: 'lit',
  },
  day: {
    tray: [rgb('#C99060'), rgb('#A86E42')], grain: rgb('#8A5532'), seam: rgb('#6E4128'),
    glaze: [rgb('#F6EBD6'), rgb('#E2CFAC')], shade: [1, 0.96, 0.9], crackle: rgb('#9C7A55'),
    run: rgb('#7A4A30'), lip: rgb('#A8693F'), line: rgb('#231F2B'),
    light: rgb('#FFF4DC'), lightAt: [-0.38, -0.46], ambient: 0.72,
    scatter: [0.42, 0.26, 0.08], env: [0.42, 0.40, 0.38], spec: 'window', steam: 'shadow',
  },
};

const css = (v, fallback) => (v && v.trim()) || fallback;
export const modeOf = () => (document.documentElement.dataset.mode === 'day' ? 'day' : 'night');

// "rgb(16, 18, 32)" or "#101220" to [16, 18, 32].
export function parseColor(s) {
  const m = /rgba?\(([^)]+)\)/.exec(s);
  if (m) return m[1].split(',').slice(0, 3).map((v) => Math.round(parseFloat(v)));
  return s && s[0] === '#' ? rgb(s.length === 4 ? '#' + [...s.slice(1)].map((c) => c + c).join('') : s) : [16, 18, 32];
}

export function readPalette() {
  const mode = modeOf();
  const cs = getComputedStyle(document.documentElement);
  const page = css(cs.getPropertyValue('--pc-page'), mode === 'day' ? '#FBF3E8' : '#101220');
  return { mode, page, pageRgb: parseColor(page), quiet: css(cs.getPropertyValue('--pc-quiet'), '#8E8375'),
    ...MODES[mode], ...TEA };
}

export function watch(onChange) {
  let last = modeOf();
  const mo = new MutationObserver(() => { const m = modeOf(); if (m !== last) { last = m; onChange(readPalette()); } });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });
  return () => mo.disconnect();
}

export const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
export const toCss = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

// A leaf's color by its age in days: this week's sencha green, a month's olive, half a year's oxidised brown.
const AGES = [[0, rgb('#7FA04A')], [12, rgb('#77953F')], [35, rgb('#6B7638')], [70, rgb('#6E5A32')],
  [120, rgb('#5C432B')], [200, rgb('#4A3325')]];
export function leafColor(days) {
  for (let i = 1; i < AGES.length; i++) {
    if (days <= AGES[i][0]) return mix(AGES[i - 1][1], AGES[i][1], (days - AGES[i - 1][0]) / (AGES[i][0] - AGES[i - 1][0]));
  }
  return AGES[AGES.length - 1][1];
}
