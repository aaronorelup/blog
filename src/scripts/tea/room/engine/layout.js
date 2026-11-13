// The impure half of the tea room's layout: it measures the page and hands plan() (the pure half) what it found.
// The viewport height comes from the stage's 100lvh probe, so a phone's address bar is never a resize. The marks
// are paper's data-room-mark elements, each at the place of its top edge in vh from its section's top (the scroll
// position, in vh into the chapter, at which that edge reaches the top of the frame: a key that should fire as
// an element comes into view says off: -1). A section taller than its formula (its paper grew) gives its measured
// height. layout.js measures once after document.fonts.ready, again when the width changes or the device turns,
// and whenever a section changes height (a font or a picture arriving late); never on a height-only resize.
export function measure(doc = document) {
  const probe = doc.querySelector('.room-lvh');
  const vh = (probe && probe.getBoundingClientRect().height) || innerHeight;
  const vw = doc.documentElement.clientWidth;
  const marks = {};
  const lens = [];
  const tops = [];
  for (const sec of doc.querySelectorAll('[data-room-chapter]')) {
    const top = sec.getBoundingClientRect().top + scrollY;
    const id = sec.dataset.roomChapter;
    tops.push(top);
    lens.push(sec.getBoundingClientRect().height / vh);
    marks[id] = {};
    for (const m of sec.querySelectorAll('[data-room-mark]')) {
      marks[id][m.dataset.roomMark] = (m.getBoundingClientRect().top + scrollY - top) / vh;
    }
  }
  return { vw, vh, marks, lens, tops };
}

// Watches what makes a new measurement: fonts ready (the caller awaits it), the width or the device's turn (never
// the height alone), and a section that changed height. onChange is called at most once a frame.
export function watch(doc, onChange) {
  let width = doc.documentElement.clientWidth;
  let turned = screen.orientation?.type;
  let asked = 0;
  const ask = () => { asked ||= requestAnimationFrame(() => { asked = 0; onChange(); }); };
  addEventListener('resize', () => {
    const w = doc.documentElement.clientWidth, o = screen.orientation?.type;
    if (w !== width || o !== turned) { width = w; turned = o; ask(); }
  });
  const heights = new Map();
  const ro = new ResizeObserver((entries) => {
    let changed = false;
    for (const e of entries) {
      const h = Math.round(e.contentRect.height);
      if (heights.has(e.target) && heights.get(e.target) !== h) changed = true;
      heights.set(e.target, h);
    }
    if (changed) ask();
  });
  for (const sec of doc.querySelectorAll('[data-room-chapter]')) ro.observe(sec);
}
