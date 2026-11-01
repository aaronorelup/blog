// The stop rail: a dot per stop, shown while the page is staged (cards.js). The lit dot is aria-current (home.css
// colours it); a click on a dot flies there (camera.js binds it with the rest of the input). It fades out while the
// overlay's panel is up.
export function showRail(s, on) {
  s.rail.style.display = on ? 'flex' : 'none';
}

export function syncRail(s) {
  Array.from(s.rail.children).forEach((b, i) => b.setAttribute('aria-current', i === s.stopIdx ? 'true' : 'false'));
}

export function fadeRail(s, up) {
  s.rail.style.transition = 'opacity 260ms ease';
  s.rail.style.opacity = up ? '0' : '1';
  s.rail.style.pointerEvents = up ? 'none' : 'auto';
}
