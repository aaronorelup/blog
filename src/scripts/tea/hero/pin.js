// The pin: data-3d="on" makes the section tall (stage.css) and data-hero-layout says what sticks: "dock" (landscape,
// the title box fits the screen) pins .tea-hero-pin, "flow" (portrait, or it doesn't fit) pins only the stage and the
// box scrolls away. Growing the section must not move what the reader sees: it waits for a moment when it moves nothing
// (whenPinnable). Written as the scroll moves: data-hero-phase ("open", then "docked" from progress 0.1).
export function pinSection(section) {
  const before = section.getBoundingClientRect();
  const y = scrollY;
  section.dataset['3d'] = 'on';
  section.dataset.heroLayout = layoutFor(section);
  keepPlace(section, before, y);
  writeProgress(section, rawOf(section), true);
  glide(section);
}

export function unpinSection(section) {
  if (!section.dataset['3d']) return;
  const before = section.getBoundingClientRect();
  const y = scrollY;
  delete section.dataset['3d'];
  delete section.dataset.heroLayout;
  delete section.dataset.heroPhase;
  delete section.dataset.heroGlide;
  delete section.dataset.heroEnd;
  delete section._teaP;
  keepPlace(section, before, y);
}

// Pinning grows the section by two screens, so it waits for a moment when that moves nothing the reader reads: the
// page at its very top, or the title box above the screen (the scroll then moves by the growth, keepPlace, so what is
// below the hero stays put; a strip of picture left at the top shows the scene's end instead of the poster), and the
// scroll at rest (a smooth scroll to a #chapter, or a fling, would be cut short by that move). A reader with the box
// still on screen keeps the poster until they go back to the top or past the box.
const REST = 200;
export function whenPinnable(section) {
  const box = section.querySelector('.tea-hero-box') || section;
  return new Promise((resolve) => {
    let timer = 0;
    const check = () => {
      if (scrollY > 0 && box.getBoundingClientRect().bottom > 0) return;
      removeEventListener('scroll', onScroll);
      resolve();
    };
    const onScroll = () => { clearTimeout(timer); timer = setTimeout(check, REST); };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  });
}

// A change of the section's height keeps what is below it where it was on screen (and the top of the page at the top).
function keepPlace(section, before, y) {
  if (y <= 0) return;
  const d = section.getBoundingClientRect().height - before.height;
  if (d) scrollTo({ top: Math.max(0, y + d), behavior: 'instant' });
}

// A reload or a way back should land where the reader was in the scene, but the browser restores the scroll against
// the one-screen static hero (the scene pins seconds later) and so lands on the chapters. So while the reader is inside
// the pinned scene, leaving keeps the place (sessionStorage: Chromium drops a history.state written while the page is
// hiding) and asks the browser to keep none (scrollRestoration 'manual'): the page opens at its top, on the poster,
// and placeBack puts the reader back once the scene has pinned. Anywhere else the browser restores as it always does.
const PLACE = 'tea-hero-place';
export function onLeave(section) {
  const raw = section.dataset['3d'] ? rawOf(section) : 0;
  const inside = scrollY > 0 && raw > 0 && raw < 0.999;
  try {
    history.scrollRestoration = inside ? 'manual' : 'auto';
    if (inside) sessionStorage.setItem(PLACE, JSON.stringify({ at: location.href, raw }));
    else sessionStorage.removeItem(PLACE);
  } catch { /* storage or history not allowed here: the browser restores as it would */ }
}

// Back at the place kept, with the box where it belongs there at once: only on a reload or a way back to that same
// address, and not for a reader who has scrolled since.
export function placeBack(section) {
  let kept = null;
  try { kept = JSON.parse(sessionStorage.getItem(PLACE)); sessionStorage.removeItem(PLACE); } catch { return false; }
  const nav = performance.getEntriesByType('navigation')[0];
  const again = !!nav && (nav.type === 'reload' || nav.type === 'back_forward');
  const raw = kept && kept.at === location.href && again ? kept.raw : 0;
  if (!(raw > 0) || scrollY > 0) return false;
  const top = scrollY + section.getBoundingClientRect().top;
  scrollTo({ top: top + raw * (section.offsetHeight - innerHeight), behavior: 'instant' });
  writeProgress(section, rawOf(section), true);
  glide(section);
  return true;
}

// How far through the pinned section the reader is: 0 at the top, 1 where the pin lets go.
export function rawOf(section) {
  const r = section.getBoundingClientRect();
  const run = r.height - innerHeight;
  return run > 0 ? Math.max(0, Math.min(1, -r.top / run)) : 0;
}

// In the dock layout the box glides between its open and docked places (stage.css, data-hero-glide), never into the
// open place from where the static layout or the flow layout had it: the glide comes on only once that place is laid
// out (a style read forces it), so the change of layout itself has nothing to animate.
function glide(section) {
  delete section.dataset.heroGlide;
  if (section.dataset.heroLayout !== 'dock') return;
  const box = section.querySelector('.tea-hero-box');
  if (box) getComputedStyle(box).translate;
  section.dataset.heroGlide = '';
}

const px = (cs, name) => parseFloat(cs.getPropertyValue(name)) || 0;

// "dock" only where the box, at its static size, fits one screen with the hero's padding (cover.css) around it.
// Docked, the box is folded and its height says nothing: the dock holds until it opens again (its resize re-asks).
export function layoutFor(section) {
  const docked = section.dataset.heroLayout === 'dock' && section.dataset.heroPhase === 'docked';
  if (docked && innerWidth > innerHeight) return 'dock';
  const box = section.querySelector('.tea-hero-box');
  const cs = getComputedStyle(section);
  const fits = !box || box.offsetHeight + px(cs, '--tea-hero-pt') + px(cs, '--tea-hero-pb') <= innerHeight;
  return innerWidth > innerHeight && fits ? 'dock' : 'flow';
}

// Re-picks the layout after a resize (a turned phone, a font swap); true when it changed.
export function relayout(section) {
  const next = layoutFor(section);
  if (section.dataset.heroLayout === next) return false;
  section.dataset.heroLayout = next;
  glide(section);
  return true;
}

// In "flow" the scene holds its opening frame while the box scrolls off: it starts once the box's foot has passed
// LEAD_LINE of the screen. The share of the scroll that takes, 0 in "dock" (the box docks as the scene starts).
const LEAD_LINE = 0.3;
export function leadOf(section) {
  const box = section.querySelector('.tea-hero-box');
  const run = section.offsetHeight - innerHeight;
  if (section.dataset.heroLayout !== 'flow' || !box || run <= 0) return 0;
  return Math.min(0.5, Math.max(0, (box.offsetTop + box.offsetHeight - innerHeight * LEAD_LINE) / run));
}

const DOCK = 0.1;
const END = 0.92;   // from here the hero's foot fades into the page (stage.css), as the pin is about to let go

export function writeProgress(section, p, force) {
  const v = Math.round(p * 1000) / 1000;
  if (!force && v === section._teaP) return;
  section._teaP = v;
  const phase = v < DOCK ? 'open' : 'docked';
  if (section.dataset.heroPhase !== phase) section.dataset.heroPhase = phase;
  if ((v >= END) !== ('heroEnd' in section.dataset)) {
    if (v >= END) section.dataset.heroEnd = '';
    else delete section.dataset.heroEnd;
  }
}
