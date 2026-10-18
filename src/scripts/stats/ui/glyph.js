// The five kinds' shapes, drawn, never typed: Windows doesn't render most symbol characters the
// same way twice, and a shape is how a colour-blind reader tells the piles apart. The same
// geometry serves SVG (labels, legends, sentences) and canvas (the gate, the map) through
// glyphPath, so a diamond in a sentence is the diamond in the pile.
//
//   person  a filled disc, or a ring (stroke 0.18 × size) for "looked like a person"
//   bot     a diamond, half-diagonal r (a name badge)
//   scanner an X, two strokes 0.22 × size
//   agent   a square, side 1.6r, corner radius 0.15r
//   stale   an equilateral triangle, apex up, circumradius 1.15r
//   you     a ring in --st-you, stroke 2px

const NS = 'http://www.w3.org/2000/svg';
export const STROKED = { scanner: true, you: true };

const tri = (r) => {
  const R = 1.15 * r;
  // apex up; centred on the circumcentre
  return [[0, -R], [R * Math.sin(Math.PI / 3 * 2), R * 0.5], [-R * Math.sin(Math.PI / 3 * 2), R * 0.5]];
};

// SVG path data centred at 0,0 for radius r.
function pathData(kind, r) {
  switch (kind) {
    case 'bot': return `M0 ${-r}L${r} 0L0 ${r}L${-r} 0Z`;
    case 'scanner': { const a = r * 0.72; return `M${-a} ${-a}L${a} ${a}M${a} ${-a}L${-a} ${a}`; }
    case 'agent': {
      const h = 0.8 * r, c = 0.15 * r;
      return `M${-h + c} ${-h}H${h - c}Q${h} ${-h} ${h} ${-h + c}V${h - c}Q${h} ${h} ${h - c} ${h}H${-h + c}Q${-h} ${h} ${-h} ${h - c}V${-h + c}Q${-h} ${-h} ${-h + c} ${-h}Z`;
    }
    case 'stale': { const p = tri(r); return `M${p[0][0]} ${p[0][1]}L${p[1][0]} ${p[1][1]}L${p[2][0]} ${p[2][1]}Z`; }
    default: return `M${r} 0A${r} ${r} 0 1 1 ${-r} 0A${r} ${r} 0 1 1 ${r} 0Z`; // person, you
  }
}

const COLOR = {
  person: 'var(--st-person)', bot: 'var(--st-bot)', scanner: 'var(--st-scanner)',
  agent: 'var(--st-agent)', stale: 'var(--st-stale)', you: 'var(--st-you)',
};

/** An inline SVG glyph, aria-hidden. size is the box in CSS px (or '0.8em'). */
export function glyphSVG(kind, { size = 12, tier = 'solid', color } = {}) {
  const svg = document.createElementNS(NS, 'svg');
  // a 24-unit box with r = 10: room for the triangle's 1.15r and the X's stroke caps
  svg.setAttribute('viewBox', '-12 -12 24 24');
  const s = typeof size === 'number' ? size + 'px' : size;
  svg.setAttribute('width', s);
  svg.setAttribute('height', s);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.classList.add('st-glyph', 'st-glyph-' + kind);
  const p = document.createElementNS(NS, 'path');
  const r = 10;
  p.setAttribute('d', pathData(kind, kind === 'you' ? r - 1 : r));
  const c = color || COLOR[kind] || 'currentColor';
  const ring = kind === 'you' || (kind === 'person' && tier === 'ring');
  if (kind === 'scanner') {
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', c);
    p.setAttribute('stroke-width', String(0.22 * 24));
    p.setAttribute('stroke-linecap', 'round');
  } else if (ring) {
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', c);
    // 0.18 × size for the person ring; a fixed 2 CSS px for You, converted to box units
    const px = typeof size === 'number' ? size : 12;
    p.setAttribute('stroke-width', kind === 'you' ? String((2 * 24) / px) : String(0.18 * 24));
    p.setAttribute('d', pathData('person', kind === 'you' ? r - (24 / px) : r - 0.09 * 24));
  } else {
    p.setAttribute('fill', c);
  }
  svg.append(p);
  return svg;
}

/** The same shape for canvas, centred at 0,0. Stroke STROKED kinds (and person rings) yourself. */
export function glyphPath(kind, r) {
  return new Path2D(pathData(kind === 'you' ? 'person' : kind, r));
}

/** Line width a canvas should use for a stroked glyph of radius r. */
export const glyphStroke = (kind, r) => (kind === 'scanner' ? 0.22 * 2 * r : kind === 'you' ? 2 : 0.18 * 2 * r);

/** A small drawn arrow for links ("→ What do people read?"), so no symbol character is typed. */
export function arrowSVG(dir = 'right', size = '0.85em') {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.classList.add('st-arrow');
  const p = document.createElementNS(NS, 'path');
  const d = {
    right: 'M2 8h11M9 4l4 4-4 4',
    left: 'M14 8H3M7 4L3 8l4 4',
    down: 'M8 2v11M4 9l4 4 4-4',
    up: 'M8 14V3M4 7l4-4 4 4',
  }[dir] || 'M2 8h11M9 4l4 4-4 4';
  p.setAttribute('d', d);
  p.setAttribute('fill', 'none');
  p.setAttribute('stroke', 'currentColor');
  p.setAttribute('stroke-width', '1.8');
  p.setAttribute('stroke-linecap', 'round');
  p.setAttribute('stroke-linejoin', 'round');
  svg.append(p);
  return svg;
}

/** A drawn close mark (the × on the picked-day pill). */
export function closeSVG(size = 10) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 10 10');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const p = document.createElementNS(NS, 'path');
  p.setAttribute('d', 'M1.5 1.5l7 7M8.5 1.5l-7 7');
  p.setAttribute('stroke', 'currentColor');
  p.setAttribute('stroke-width', '1.6');
  p.setAttribute('stroke-linecap', 'round');
  svg.append(p);
  return svg;
}
