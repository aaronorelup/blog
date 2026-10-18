// The browser calendar: how old an out-of-date browser is ("from 2019 · 7 years"), and the newest
// version of a family at a date. Its own module because the Noticed cards on the first screen
// need browserAge() and nothing else; "Am I in here?" (readYou, classifyYou in browser.js) loads
// with the hero's drawer and the Questions sheet instead of in the first bundle.
//
// Release dates are a cadence, not a table, so every answer is "about":
// - Chrome and Edge N: 29 Mar 2022 + (N − 100) × 31.3 days from Chrome 94 on (the four-weekly
//   cadence, holiday gaps included). Before 94 Chrome shipped every six weeks, so N < 94 is
//   21 Sep 2021 − (94 − N) × 42 days: stretching the newer cadence back put Chrome 78 (2019)
//   in 2020.
// - Firefox N:         3 May 2022 + (N − 100) × 28.7 days
// - Safari (and iOS) N: September of 2006 + N for 7–18, September of 1999 + N from 26
//   (Apple jumped from 18 to 26 in 2025).

const DAY = 86400000;
const CHROME0 = Date.UTC(2022, 2, 29), FIREFOX0 = Date.UTC(2022, 4, 3);
const CHROME94 = Date.UTC(2021, 8, 21);

const parseISO = (iso) => {
  const t = Date.parse(String(iso || '').slice(0, 10) + 'T12:00:00Z');
  return Number.isFinite(t) ? t : Date.now();
};

function releasedAt(family, n) {
  if (family === 'chrome') return n >= 94 ? CHROME0 + (n - 100) * 31.3 * DAY : CHROME94 - (94 - n) * 42 * DAY;
  if (family === 'firefox') return FIREFOX0 + (n - 100) * 28.7 * DAY;
  if (family === 'safari') {
    if (n >= 26) return Date.UTC(1999 + n, 8, 15);
    if (n >= 1 && n <= 18) return Date.UTC(2006 + n, 8, 15);
    return null; // 19–25 were never shipped
  }
  return null;
}

/** The newest major version of a family at a date (the cadence, inverted). */
export function newestMajor(family, dateISO) {
  const t = parseISO(dateISO);
  if (family === 'chrome' || family === 'edge') {
    if (t < CHROME94) return 94 - Math.ceil((CHROME94 - t) / (42 * DAY));
    return 100 + Math.floor((t - CHROME0) / (31.3 * DAY));
  }
  if (family === 'firefox') return 100 + Math.floor((t - FIREFOX0) / (28.7 * DAY));
  if (family === 'safari') {
    const d = new Date(t);
    const y = d.getUTCMonth() >= 8 ? d.getUTCFullYear() : d.getUTCFullYear() - 1;
    return y >= 2025 ? y - 1999 : y - 2006;
  }
  return null;
}

/**
 * How old a browser label is, as of the filing. Labels look like 'Chrome 124', 'Edge 99',
 * 'Firefox 133', 'Chrome 131 on Android', 'Safari on iOS 13', 'Safari 15 on macOS'.
 * @returns {{year:number, month?:number, yearsOld:number, text:string, tag:string}|null}
 */
export function browserAge(label, throughISO) {
  const l = String(label || '');
  let fam = null, n = null, m;
  if ((m = /^(?:Chrome|Edge|Chromium)\s+(\d+)/i.exec(l))) { fam = 'chrome'; n = +m[1]; }
  else if ((m = /^Firefox\s+(\d+)/i.exec(l))) { fam = 'firefox'; n = +m[1]; }
  else if ((m = /\biOS\s+(\d+)/i.exec(l))) { fam = 'safari'; n = +m[1]; }
  else if ((m = /^Safari\s+(\d+)/i.exec(l))) { fam = 'safari'; n = +m[1]; }
  if (!fam || !n) return null;
  const t = releasedAt(fam, n);
  if (t == null) return null;
  const d = new Date(t);
  const year = d.getUTCFullYear();
  const yearsOld = Math.max(0, Math.round(((parseISO(throughISO) - t) / (365.25 * DAY)) * 10) / 10);
  const whole = Math.round(yearsOld);
  const age = whole < 1 ? 'under a year' : whole === 1 ? '1 year' : `${whole} years`;
  const out = { year, yearsOld, text: `from ${year}`, tag: `from ${year} · ${age}` };
  if (fam !== 'safari') out.month = d.getUTCMonth() + 1;
  return out;
}
