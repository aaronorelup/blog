// The pin: data-3d="on" makes the section tall and its .tea-hero-pin sticky (stage.css). Growing the section must not
// move what the reader is looking at, so a reader already below the hero is scrolled by the growth. The progress is
// written as --tea-hero-progress (0..1) and data-hero-phase ("open" while the title box is centred, then "docked").
export function pinSection(section) {
  const before = section.getBoundingClientRect();
  const y = scrollY;
  section.dataset['3d'] = 'on';
  if (before.bottom <= 0 || (before.top < 0 && location.hash && location.hash !== '#top')) {
    const after = section.getBoundingClientRect();
    scrollTo({ top: y + (after.height - before.height), behavior: 'instant' });
  }
  writeProgress(section, 0, true);
}

export function unpinSection(section) {
  delete section.dataset['3d'];
  delete section.dataset.heroPhase;
  section.style.removeProperty('--tea-hero-progress');
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
