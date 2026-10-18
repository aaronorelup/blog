// The few small line drawings the asking parts need. The page never prints a Unicode arrow or
// symbol as text (Windows draws them in whatever font it finds), so each one is a tiny SVG in
// currentColor, hidden from screen readers: the words beside it carry the meaning.
const NS = 'http://www.w3.org/2000/svg';

function svg(size, d, { fill = false, stroke = 1.6 } = {}) {
  const s = document.createElementNS(NS, 'svg');
  s.setAttribute('viewBox', '0 0 16 16');
  s.setAttribute('width', size);
  s.setAttribute('height', size);
  s.setAttribute('aria-hidden', 'true');
  s.setAttribute('focusable', 'false');
  s.classList.add('st-ask-ico');
  const p = document.createElementNS(NS, 'path');
  p.setAttribute('d', d);
  if (fill) p.setAttribute('fill', 'currentColor');
  else {
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', 'currentColor');
    p.setAttribute('stroke-width', stroke);
    p.setAttribute('stroke-linecap', 'round');
    p.setAttribute('stroke-linejoin', 'round');
  }
  s.append(p);
  return s;
}

export const arrowSVG = (size = 14) => svg(size, 'M3 8h9.5M8.5 4l4 4-4 4');
export const upSVG = (size = 14) => svg(size, 'M8 13V3.5M4 7.5l4-4 4 4');
export const closeSVG = (size = 16) => svg(size, 'M4 4l8 8M12 4l-8 8', { stroke: 1.8 });
export const searchSVG = (size = 16) => svg(size, 'M7 12.2A5.2 5.2 0 1 0 7 1.8a5.2 5.2 0 0 0 0 10.4zM10.8 10.8l3.4 3.4');
