// The index (2.6): apply.js writes the current chapter's mark with the frame. This module only does what a reader
// does to the index: the tab's sheet closes when a chapter is chosen, Esc closes it, and focus stays inside it
// while it is open. Index links jump at once (no glide).
export function wireIndex(doc = document) {
  const tab = doc.querySelector('.room-tab');
  if (!tab) return;
  tab.addEventListener('click', (e) => {
    if (e.target.closest('a[href^="#"]')) tab.open = false;
  });
  tab.addEventListener('keydown', (e) => {
    if (!tab.open) return;
    if (e.key === 'Escape') { tab.open = false; tab.querySelector('summary').focus(); return; }
    if (e.key !== 'Tab') return;
    const all = [...tab.querySelectorAll('summary, a[href]')];
    const at = all.indexOf(doc.activeElement);
    if (e.shiftKey && at <= 0) { e.preventDefault(); all[all.length - 1].focus(); }
    else if (!e.shiftKey && at === all.length - 1) { e.preventDefault(); all[0].focus(); }
  });
}
