// Times as posts write them in markup and captions ("1:44.97", "0:05.4", "13:05:00", "90") and as players print
// them ("1:44"). Read by the elements that take times from their markup and by the now-playing bar.

// Seconds from h:m:s, m:s or plain seconds; NaN when a part isn't a number.
export const parseTime = (v) => {
  const p = String(v || '').trim().split(':').map(Number);
  return p.some((n) => !isFinite(n)) ? NaN : p.reduce((a, n) => a * 60 + n, 0);
};

// m:ss, the minutes uncapped; 0:00 for a time not known yet (a video's duration before its metadata).
export const fmtTime = (s) => (isFinite(s) ? Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') : '0:00');
