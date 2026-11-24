// The flat page: the scene is gone (no WebGL, a lost context, too slow, its chunk lost), so the canvas goes and every
// section stands in the document, seen and reachable, stacked close (home-flat; no staged first frame pending). The
// colours are already right (tokens.css), and the overlay, the coin and the switch never needed the scene.
export function flat(why) {
  console.warn('[home-scene] static fallback:', why);
  const root = document.documentElement;
  root.removeAttribute('data-stage-pending');
  root.classList.add('home-flat');
  document.getElementById('home-scene-canvas').style.display = 'none';
  for (const s of document.querySelectorAll('section[data-wp]')) {
    s.style.opacity = '1';
    s.style.transform = 'none';
    s.inert = false;
    s.removeAttribute('aria-hidden');
  }
}
