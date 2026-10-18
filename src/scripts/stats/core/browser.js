// "Am I in here?" The reader's own browser, read and sorted by the same four questions the gate
// asks, entirely in their browser: nothing here sends anything anywhere. The browser calendar it
// checks versions against is browser-age.js, re-exported here so callers have one place to import.
import { newestMajor } from './browser-age.js';

export { newestMajor, browserAge } from './browser-age.js';

const familyOf = (browser) =>
  browser === 'Chrome' || browser === 'Edge' ? 'chrome' : browser === 'Firefox' ? 'firefox' : browser === 'Safari' ? 'safari' : null;

/** @returns {{browser:string, major:number|null, os:string, mobile:boolean, automated:boolean, headless:boolean}} */
export function readYou(nav = typeof navigator !== 'undefined' ? navigator : {}) {
  const ua = String(nav.userAgent || '');
  let browser = 'Other', major = null;
  const brands = nav.userAgentData?.brands;
  const pick = (re) => { const m = re.exec(ua); return m ? +m[1] : null; };
  if (Array.isArray(brands) && brands.length) {
    const find = (name) => brands.find((b) => b.brand === name);
    const b = find('Microsoft Edge') || find('Opera') || find('Google Chrome') || find('Chromium');
    if (b) {
      browser = b.brand === 'Microsoft Edge' ? 'Edge' : b.brand === 'Opera' ? 'Opera' : 'Chrome';
      major = +b.version || null;
    }
  }
  if (browser === 'Other') {
    if (/Edg(e|A|iOS)?\/(\d+)/.test(ua)) { browser = 'Edge'; major = +/Edg(?:e|A|iOS)?\/(\d+)/.exec(ua)[1]; }
    else if (/OPR\/(\d+)/.test(ua)) { browser = 'Opera'; major = pick(/OPR\/(\d+)/); }
    else if (/SamsungBrowser\/(\d+)/.test(ua)) { browser = 'Samsung Internet'; major = pick(/SamsungBrowser\/(\d+)/); }
    else if (/(?:Firefox|FxiOS)\/(\d+)/.test(ua)) { browser = 'Firefox'; major = pick(/(?:Firefox|FxiOS)\/(\d+)/); }
    else if (/CriOS\/(\d+)/.test(ua)) { browser = 'Chrome'; major = pick(/CriOS\/(\d+)/); }
    else if (/(?:Chrome|Chromium|HeadlessChrome)\/(\d+)/.test(ua)) { browser = 'Chrome'; major = pick(/(?:Chrome|Chromium|HeadlessChrome)\/(\d+)/); }
    else if (/Version\/(\d+).*Safari/.test(ua)) { browser = 'Safari'; major = pick(/Version\/(\d+)/); }
  }
  let os = 'Other';
  if (/Windows NT/.test(ua)) os = 'Windows';
  else if (/iPhone|iPod/.test(ua)) os = 'iOS';
  else if (/iPad/.test(ua) || (/Macintosh/.test(ua) && (nav.maxTouchPoints || 0) > 1)) os = 'iPadOS';
  else if (/Mac OS X|Macintosh/.test(ua)) os = 'macOS';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/CrOS/.test(ua)) os = 'ChromeOS';
  else if (/Linux/.test(ua)) os = 'Linux';
  const platform = nav.userAgentData?.platform;
  if (os === 'Other' && platform) os = platform === 'macOS' ? 'macOS' : platform === 'Chrome OS' ? 'ChromeOS' : platform;
  const mobile = typeof nav.userAgentData?.mobile === 'boolean' ? nav.userAgentData.mobile : /Mobi|iPhone|Android/.test(ua);
  return { browser, major, os, mobile, automated: !!nav.webdriver, headless: /Headless/i.test(ua) };
}

// Safari's version by the year it shipped, the same rule as the Worker (worker/stats-shape.js).
// Apple went from 18 (2024) to 26 (2025), so counting versions put Safari 18 nine behind 27 and
// told every iPhone that can't leave iOS 18 it was a bot in costume. Years don't jump.
const safariYear = (major) => (major <= 18 ? 2006 + major : 1999 + major);

/**
 * The four questions, asked of the reader. Old only when they are behind by the backend's
 * threshold plus two (Chrome, Edge, Firefox 15+ versions; Safari 5+ years), so the cadence's slop
 * never tells a current reader they're out of date. `behind` is versions, or years for Safari.
 */
export function classifyYou(you, throughISO) {
  const steps = [];
  steps.push({ q: 'badge', yes: false, why: 'browsers never wear one' });
  steps.push({ q: 'door', yes: false, why: 'this page answered fine' });
  const program = !!(you?.automated || you?.headless);
  steps.push({
    q: 'program', yes: program,
    why: you?.automated ? 'your browser says a script is driving it' : you?.headless ? 'it runs with no screen' : 'it names a browser',
  });
  let behind = null, old = false, why = 'no version to check';
  const fam = familyOf(you?.browser);
  if (!program && fam && you.major) {
    const newest = newestMajor(fam, throughISO);
    if (fam === 'safari') {
      const year = safariYear(you.major);
      behind = Math.max(0, safariYear(newest) - year);
      old = behind >= 5;
      // in years, because 19 to 25 never shipped and "versions behind" would count them
      why = behind === 0 ? `${you.major} is current` : `${you.major} is from ${year}, about ${behind === 1 ? 'a year' : behind + ' years'} old`;
    } else {
      behind = Math.max(0, newest - you.major);
      old = behind >= 15;
      why = behind <= 2 ? `${you.major} is about current` : `${you.major} is about ${behind} versions behind`;
    }
  }
  if (!program) steps.push({ q: 'old', yes: old, why });
  return { kind: program ? 'agent' : old ? 'stale' : 'person', steps, behind };
}
