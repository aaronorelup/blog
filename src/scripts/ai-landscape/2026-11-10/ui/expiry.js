// A fact with an end date (SPEC 6.4) says "until" its date, and "Expired" once that date is behind the reader: every
// [data-until] earlier than today gets data-past, in the 3D page and in the text version alike (base.css swaps the word).
// Without JavaScript the page says "until", which was true on the day it was built.
import { $$ } from '../core/dom.js';

export function markExpired(now = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  const today = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
  let past = 0;
  for (const el of $$('[data-until]')) {
    const gone = el.dataset.until < today;
    el.toggleAttribute('data-past', gone);
    if (gone) past++;
  }
  return past;
}
