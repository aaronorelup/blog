// The pin: data-3d="on" makes the section tall (stage.css) and data-hero-layout says what sticks: "dock" (landscape,
// the title box fits the screen) pins .tea-hero-pin, "flow" (portrait, or it doesn't fit) pins only the stage and the
// box scrolls away. Growing the section must not move what the reader sees, so a reader below the hero is scrolled by
// the growth. Written each frame: --tea-hero-progress (0..1) and data-hero-phase ("open", then "docked").
export function pinSection(section) {
  const before = section.getBoundingClientRect();
  const y = scrollY;
  section.dataset['3d'] = 'on';
  section.dataset.heroLayout = layoutFor(section);
  if (before.bottom <= 0 || (before.top < 0 && location.hash && location.hash !== '#top')) {
    const after = section.getBoundingClientRect();
    scrollTo({ top: y + (after.height - before.height), behavior: 'instant' });
  }
  writeProgress(section, 0, true);
}

export function unpinSection(section) {
  delete section.dataset['3d'];
  delete section.dataset.heroLayout;
  delete section.dataset.heroPhase;
  section.style.removeProperty('--tea-hero-progress');
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

export function writeProgress(section, p, force) {
  const v = Math.round(p * 1000) / 1000;
  if (!force && v === section._teaP) return;
  section._teaP = v;
  section.style.setProperty('--tea-hero-progress', String(v));
  const phase = v < DOCK ? 'open' : 'docked';
  if (section.dataset.heroPhase !== phase) section.dataset.heroPhase = phase;
}
