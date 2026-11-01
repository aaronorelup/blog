// The thinking half of /api/stats: who a request came from, what a bot is called, which paths
// are safe to show, and how Cloudflare's GraphQL answers become one day of the snapshot. Pure
// functions only, with no Cloudflare APIs, so the tests run them in Node (worker/stats.js is the
// half that talks to D1 and the GraphQL API).
//
// Every request lands in exactly one class, tested in this order:
//
//   bot      Cloudflare has verified it is who it says (verifiedBotCategory is set)
//   scanner  answered 400 or worse: mostly scanners hunting /wp-admin and /.env, plus the odd
//            person on a dead link
//   agent    a program, not a browser: curl, Python, Go, headless Chrome, the Claude desktop
//            app's built-in browser, self-declared crawlers nobody verified, no user agent at all
//   stale    looks like a browser, but one over a year out of date (AO-057: "people do run old
//            browsers; not this many, this often"), so most likely a bot in a costume
//   person   everything else, Aaron included
//
// Nothing here keeps a person's user agent: it is read, turned into "Chrome" / "Windows" or a
// class, and dropped. Named bots and programs ("GPTBot", "curl") are kept by name.

export const CLASSES = ['person', 'stale', 'agent', 'bot', 'scanner'];
export const SITE = 'aaronorelup.com';
export const LAUNCH = '2026-08-02'; // the site's first day; the long-run totals start here

// ---------------------------------------------------------------------------------------------
// Bots, by name. Cloudflare tells us a bot is verified and its category, never its name, so the
// name comes from the user agent. More specific patterns first (GoogleOther before Googlebot).
// A null name means "the text the pattern matched" (Google-CloudVertexBot, Amzn-SearchBot …).

const BOT_NAMES = [
  [/Google-Extended/i, 'Google-Extended', 'Google'],
  [/GoogleOther/i, 'GoogleOther', 'Google'],
  [/Google-InspectionTool/i, 'Google-InspectionTool', 'Google'],
  [/AdsBot-Google/i, 'AdsBot-Google', 'Google'],
  [/Storebot-Google/i, 'Storebot-Google', 'Google'],
  [/FeedFetcher-Google/i, 'FeedFetcher-Google', 'Google'],
  [/APIs-Google/i, 'APIs-Google', 'Google'],
  [/Googlebot/i, 'Googlebot', 'Google'],
  [/\bGoogle-[A-Za-z]{3,30}/, null, 'Google'],
  [/bingbot|BingPreview|msnbot/i, 'Bingbot', 'Microsoft'],
  [/AdIdxBot/i, 'AdIdxBot', 'Microsoft'],
  [/MicrosoftPreview/i, 'MicrosoftPreview', 'Microsoft'],
  [/SkypeUriPreview/i, 'Skype link preview', 'Microsoft'],
  [/OAI-SearchBot/i, 'OAI-SearchBot', 'OpenAI'],
  [/ChatGPT-User/i, 'ChatGPT-User', 'OpenAI'],
  [/GPTBot/i, 'GPTBot', 'OpenAI'],
  [/Claude-SearchBot/i, 'Claude-SearchBot', 'Anthropic'],
  [/Claude-User/i, 'Claude-User', 'Anthropic'],
  [/ClaudeBot|anthropic-ai/i, 'ClaudeBot', 'Anthropic'],
  [/Perplexity-User/i, 'Perplexity-User', 'Perplexity'],
  [/PerplexityBot/i, 'PerplexityBot', 'Perplexity'],
  [/Amazonbot/i, 'Amazonbot', 'Amazon'],
  [/\bAmzn-[A-Za-z]{3,30}/i, null, 'Amazon'],
  [/Applebot-Extended/i, 'Applebot-Extended', 'Apple'],
  [/Applebot/i, 'Applebot', 'Apple'],
  [/meta-externalfetcher/i, 'meta-externalfetcher', 'Meta'],
  [/meta-externalagent/i, 'meta-externalagent', 'Meta'],
  [/facebookexternalhit|facebookcatalog|FacebookBot/i, 'facebookexternalhit', 'Meta'],
  [/Facebot/i, 'Facebot', 'Meta'],
  [/WhatsApp/i, 'WhatsApp', 'Meta'],
  [/ExaSearchBot|ExaBot/i, 'ExaSearchBot', 'Exa'],
  [/ExaUser/i, 'ExaUser', 'Exa'],
  [/AhrefsBot|AhrefsSiteAudit/i, 'AhrefsBot', 'Ahrefs'],
  [/SemrushBot|SiteAuditBot/i, 'SemrushBot', 'Semrush'],
  [/PetalBot/i, 'PetalBot', 'Huawei'],
  [/Yandex\w*Bot|YandexBot/i, 'YandexBot', 'Yandex'],
  [/Bytespider/i, 'Bytespider', 'ByteDance'],
  [/DuckAssistBot/i, 'DuckAssistBot', 'DuckDuckGo'],
  [/DuckDuckBot|DuckDuckGo-Favicons-Bot/i, 'DuckDuckBot', 'DuckDuckGo'],
  [/Bravebot/i, 'Bravebot', 'Brave'],
  [/MojeekBot/i, 'MojeekBot', 'Mojeek'],
  [/CCBot/i, 'CCBot', 'Common Crawl'],
  [/LinkedInBot/i, 'LinkedInBot', 'LinkedIn'],
  [/Slackbot|Slack-ImgProxy/i, 'Slackbot', 'Slack'],
  [/Discordbot/i, 'Discordbot', 'Discord'],
  [/TelegramBot/i, 'TelegramBot', 'Telegram'],
  [/Twitterbot/i, 'Twitterbot', 'X'],
  [/MJ12bot/i, 'MJ12bot', 'Majestic'],
  [/DotBot/i, 'DotBot', 'Moz'],
  [/SeznamBot/i, 'SeznamBot', 'Seznam'],
  [/Baiduspider/i, 'Baiduspider', 'Baidu'],
  [/UptimeRobot/i, 'UptimeRobot', 'UptimeRobot'],
  [/Barkrowler/i, 'Barkrowler', 'Babbar'],
  [/HubSpot/i, 'HubSpot', 'HubSpot'],
  [/Pinterestbot/i, 'Pinterestbot', 'Pinterest'],
  [/Qwantbot/i, 'Qwantbot', 'Qwant'],
  [/archive\.org_bot|ia_archiver/i, 'Internet Archive', 'Internet Archive'],
];
// All of the above in one pattern, one group per entry, so one run says whether any matched and
// which: a fresh isolate pays to compile every pattern it runs, and trying fifty small ones in
// turn cost more CPU than parsing the whole day. The name that appears first in the string wins;
// at the same spot, the entry listed first (Applebot-Extended before Applebot). It runs on the
// lower-cased string without the i flag, which compiles to far less code (the patterns hold no
// upper-case escapes such as \W, so lower-casing their source changes nothing else).
const oneOf = (table) => new RegExp(table.map(([re]) => `(${re.source.toLowerCase()})`).join('|'));
const pick = (re, table, ua) => {
  const m = re.exec(ua.toLowerCase());
  if (!m) return null;
  for (let i = 1; i < m.length; i++) if (m[i] !== undefined) return [table[i - 1], ua.substr(m.index, m[i].length)];
  return null;
};
const BOTS = oneOf(BOT_NAMES);
const botMatch = (ua) => {
  const hit = pick(BOTS, BOT_NAMES, ua);
  return hit ? [hit[0][1] || cleanName(hit[1]), hit[0][2]] : null;
};

// Names that come out of a user agent end up on a public page, so they are cut down to plain
// characters and a sensible length whatever the string held.
const cleanName = (s) => String(s || '').replace(/[^\w .+-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 32);
const cleanCategory = (s) => String(s || '').replace(/[^\w &/+.-]/g, '').trim().slice(0, 40) || 'Other';

// The product a crawler names itself after: "compatible; QlyzeBot/1.0", "KeenableBot/1.0",
// or a leading "NoMoreVibe/1.0". Not used for browsers.
function tokenName(ua) {
  let m = /compatible;\s*([A-Za-z][\w.\- ]{1,40}?)\s*(?:\/|;|\)|$)/.exec(ua);
  if (m && !/^(MSIE|Windows|Mozilla)/i.test(m[1])) return cleanName(m[1]);
  m = /\b([A-Za-z][\w-]{1,30}?(?:bot|crawler|spider|scanner))\b/i.exec(ua);
  if (m) return cleanName(m[1]);
  m = /^([A-Za-z][\w.-]{1,30})\/\d/.exec(ua);
  if (m && !/^Mozilla$/i.test(m[1])) return cleanName(m[1]);
  return '';
}

// Who runs a verified bot nobody listed above: the site its user agent points to
// ("+https://crawler.exa.ai/" -> exa.ai), or Unknown.
function ownerFromUA(ua) {
  const m = /https?:\/\/([a-z0-9-]+(?:\.[a-z0-9-]+)+)/i.exec(ua);
  return m ? registrable(m[1].toLowerCase().replace(/^www\./, '')) : 'Unknown';
}

// [name, owner] for a verified bot. A verified bot whose user agent names nobody (one AI
// assistant arrives as plain Chrome on Linux) is called by its category.
export function botName(userAgent, category) {
  const ua = String(userAgent || '');
  const known = botMatch(ua);
  if (known) return known;
  const program = ua.trim() ? programName(ua) : '';
  if (program) return [program, ownerFromUA(ua)];
  const token = tokenName(ua);
  if (token) return [token, ownerFromUA(ua)];
  return ['Unnamed ' + cleanCategory(category), 'Unknown'];
}

// ---------------------------------------------------------------------------------------------
// Programs. agentName() is null for anything that looks like a real browser.

const PROGRAMS = [
  [/^curl\//i, 'curl'],
  [/^Wget\//i, 'Wget'],
  [/python-requests/i, 'python-requests'],
  [/Python-urllib/i, 'Python urllib'],
  [/python-httpx/i, 'httpx'],
  [/aiohttp/i, 'aiohttp'],
  [/^Python\//i, 'Python'],
  [/Go-http-client/i, 'Go-http-client'],
  [/^axios\//i, 'axios'],
  [/node-fetch|undici|^node\b|Node\.js/i, 'Node.js'],
  [/okhttp/i, 'okhttp'],
  [/^Java\/|Apache-HttpClient|Jakarta Commons/i, 'Java'],
  [/PostmanRuntime/i, 'Postman'],
  [/Scrapy/i, 'Scrapy'],
  [/PowerShell/i, 'PowerShell'],
  [/libwww-perl|^Perl\b/i, 'Perl'],
  [/^Ruby\b|Faraday/i, 'Ruby'],
  [/GuzzleHttp|^PHP\b/i, 'PHP'],
  [/^Deno\//i, 'Deno'],
  [/^Bun\//i, 'Bun'],
  [/^Dart\//i, 'Dart'],
  [/HTTPie/i, 'HTTPie'],
  [/^reqwest|^hyper\//i, 'Rust'],
  [/claude-code/i, 'Claude Code'],
  [/Lighthouse/i, 'Lighthouse'],
  [/PhantomJS/i, 'PhantomJS'],
];

const PROGRAM_SET = oneOf(PROGRAMS);
const programName = (ua) => {
  const hit = pick(PROGRAM_SET, PROGRAMS, ua);
  return hit ? hit[0][1] : '';
};

// Things only programs write: a bot word, or a URL or e-mail address (browsers never carry one).
const PROGRAMMY = /bot\b|bot\/|crawl|spider|scrape|scanner|\bscan\b|https?:\/\/|\+http|@[\w-]+\.\w/i;

// What a user agent is, worked out once per string: { agent: name or null, browser }. The cache
// lives as long as the Worker's isolate, so the same few dozen strings a day cost nothing after
// their first sighting.
const described = new Map();
function describe(userAgent) {
  const ua = String(userAgent == null ? '' : userAgent);
  let d = described.get(ua);
  if (!d) {
    const agent = nameProgram(ua.trim());
    d = { agent, browser: agent === null ? parseBrowser(ua) : null };
    if (described.size > 5000) described.clear();
    described.set(ua, d);
  }
  return d;
}

export const agentName = (userAgent) => describe(userAgent).agent;
export const forgetUserAgents = () => described.clear(); // for timing tests

function nameProgram(ua) {
  if (!ua) return 'No user agent';
  if (/HeadlessChrome|Headless\b/i.test(ua)) return 'Headless Chrome';
  // The Claude desktop app's built-in browser: Chrome inside the app, "Claude/2.x" in the agent.
  if (/\bClaude\/\d/.test(ua) && /Electron\/|MSIX|Chrome\//.test(ua)) return 'Claude desktop app';
  const program = programName(ua);
  if (program) return program;
  const bot = botMatch(ua);
  if (bot) return bot[0] + ' (unverified)';
  if (/Palo Alto Networks/i.test(ua)) return 'Palo Alto Networks scanner';
  // A string that parses as a browser keeps its device model in the first parentheses, where a
  // phone called "CUBOT" would read as a bot word: only what is outside them is looked at.
  const browser = parseBrowser(ua);
  const outside = browser ? ua.replace(/\([^)]*\)/, '') : ua;
  if (PROGRAMMY.test(outside)) return tokenName(outside) || 'Unknown program';
  if (browser) return null;
  // Not a browser we can name: a bare "Mozilla/5.0", a truncated string, a home-made tool.
  const m = /^([A-Za-z][\w.-]{1,30})\/\d/.exec(ua);
  if (m && !/^Mozilla$/i.test(m[1])) return cleanName(m[1]);
  return 'Unknown program';
}

// ---------------------------------------------------------------------------------------------
// Browsers. parseBrowser() returns { name, family, major, os, osMajor } or null.
// family is the version line the stale test reads: chrome (Chrome, Edge, Opera, Samsung …,
// all numbered like Chrome), firefox, safari (Safari and everything on iOS, judged by year), and
// ie and android (Internet Explorer and the pre-Chrome Android browser: out of date by now).

const IN_APP = /FBAN|FBAV|FB_IAB|Instagram|Snapchat|TikTok|musical_ly|BytedanceWebview|LinkedInApp|\bLine\/|MicroMessenger|\bGSA\/|Pinterest\/|Twitter for/i;

function parseOS(ua) {
  let m = /\((?:iPad)[^)]*?OS (\d+)[_\d]* like Mac OS X/.exec(ua);
  if (m) return ['iPadOS', +m[1]];
  m = /\((?:iPhone|iPod)[^)]*?OS (\d+)[_\d]* like Mac OS X/.exec(ua);
  if (m) return ['iOS', +m[1]];
  if (/Windows NT|Windows Phone|Win64|WOW64/.test(ua)) return ['Windows', 0];
  if (/Android/.test(ua)) return ['Android', 0];
  if (/CrOS/.test(ua)) return ['ChromeOS', 0];
  if (/Macintosh|Mac OS X/.test(ua)) return ['macOS', 0];
  if (/Linux|X11/.test(ua)) return ['Linux', 0];
  return ['Other', 0];
}

export function parseBrowser(userAgent) {
  const ua = String(userAgent || '');
  const num = (re) => { const m = re.exec(ua); return m ? +m[1] : 0; };
  // Internet Explorer: "Mozilla/5.0 (… Trident/7.0; rv:11.0) like Gecko", or MSIE 4 to 10.
  if (/^Mozilla\/[45]\.0 \(/.test(ua) && /Trident\/|MSIE \d/.test(ua) && !/Chrome\/|Edg/.test(ua)) {
    return { name: 'Internet Explorer', family: 'ie', major: num(/MSIE (\d+)/) || num(/rv:(\d+)/) || 11, os: parseOS(ua)[0], osMajor: 0 };
  }
  if (!/^Mozilla\/5\.0 \(/.test(ua)) return null;
  const [os, osMajor] = parseOS(ua);
  const ios = os === 'iOS' || os === 'iPadOS';
  const chrome = num(/(?:Chrome|Chromium)\/(\d+)\./);
  const out = (name, family, major) => ({ name, family, major, os, osMajor });
  // Since iOS 26 the system version in the user agent is frozen at 18, so an app's web view on an
  // up-to-date iPhone still says 18. Only an older number than that says anything about its age.
  const webview = () => out('In-app browser', 'safari', osMajor >= 18 ? 0 : osMajor);

  if (IN_APP.test(ua)) return ios ? webview() : chrome ? out('In-app browser', 'chrome', chrome) : null;
  if (ios) {
    let v;
    if ((v = num(/CriOS\/(\d+)/))) return out('Chrome on iOS', 'chrome', v);
    if ((v = num(/FxiOS\/(\d+)/))) return out('Firefox on iOS', 'firefox', v);
    if ((v = num(/EdgiOS\/(\d+)/))) return out('Edge', 'chrome', v);
    if ((v = num(/Version\/(\d+)[\d.]* Mobile\/\w+ Safari/))) return out('Safari', 'safari', v);
    if (/Mobile\/\w+/.test(ua)) return webview();
    return null;
  }
  let v;
  if ((v = num(/Edg(?:e|A)?\/(\d+)/))) return out('Edge', 'chrome', v);
  if (/OPR\/\d/.test(ua) && chrome) return out('Opera', 'chrome', chrome);
  if (/SamsungBrowser\/\d/.test(ua) && chrome) return out('Samsung Internet', 'chrome', chrome);
  if (/YaBrowser\/\d/.test(ua) && chrome) return out('Yandex Browser', 'chrome', chrome);
  if ((v = num(/Firefox\/(\d+)/))) return out('Firefox', 'firefox', v);
  if (chrome) return out('Chrome', 'chrome', chrome);
  if (os === 'Android' && (v = num(/Version\/(\d+)[\d.]* (?:Mobile )?Safari\//))) return out('Android Browser', 'android', v);
  if ((v = num(/Version\/(\d+)[\d.]*(?: Mobile\/\w+)? Safari\//))) return out('Safari', 'safari', v);
  return null;
}

// ---------------------------------------------------------------------------------------------
// Out of date. Chrome and Firefox ship on four-week trains with a gap over the holidays, about
// twelve versions a year, so 13 behind is over a year. Safari ships once a year, in September,
// and jumped from 18 to 26 in 2025 (renumbered to the year after), so it is compared by release
// year: 3 years behind.
//
// "Behind" what? The newest version people actually used that day, weighted by how much each
// was used, so one spoofed "Chrome/999" can't make everyone else look old. That is held between
// four versions below and exactly where stable should be: Google's own crawler is evergreen, so a
// day with Googlebot says what stable Chrome is; otherwise the calendar does (Chrome 153 from
// 22 Sep 2026, a version every 30 days, which errs low). Erring low only means fewer browsers
// are called old.

const TRAIN = (365.25 / 12) * 86400e3;
const ANCHOR = {
  chrome: [153, Date.parse('2026-09-22T00:00:00Z')],
  firefox: [156, Date.parse('2026-09-22T00:00:00Z')],
};
export const STALE_BEHIND = { chrome: 13, firefox: 13, safari: 3 };

export const safariYear = (major) => (major <= 18 ? 2006 + major : 1999 + major); // 13 -> 2019, 26 -> 2025

function expectedRef(day) {
  const t = Date.parse((day || new Date().toISOString().slice(0, 10)) + 'T12:00:00Z');
  const along = ([v, at]) => v + Math.floor((t - at) / TRAIN);
  const y = new Date(t).getUTCFullYear();
  const safari = t >= Date.parse(`${y}-09-15T00:00:00Z`) ? y : y - 1; // a new Safari each September
  return { chrome: along(ANCHOR.chrome), firefox: along(ANCHOR.firefox), safari };
}

// The Chrome version Google's crawlers announce (they run stable Chrome), from bot user agents.
export function googleChrome(botUserAgents) {
  let v = 0;
  for (const ua of botUserAgents || []) {
    if (!/Googlebot|GoogleOther|Google-InspectionTool/.test(ua)) continue;
    const m = /Chrome\/(\d+)\./.exec(ua);
    if (m) v = Math.max(v, +m[1]);
  }
  return v;
}

// rows: [{ ua, n }] (any traffic that isn't a verified bot); googleV: googleChrome() of the day's
// verified bots, or 0. Returns { chrome, firefox, safari }.
export function staleRef(rows, day, googleV = 0) {
  const want = expectedRef(day);
  if (googleV && Math.abs(googleV - want.chrome) <= 6) want.chrome = googleV;
  const seen = { chrome: new Map(), firefox: new Map(), safari: new Map() };
  for (const { ua, n } of rows || []) {
    const b = describe(ua).browser;
    if (!b || !seen[b.family]) continue;
    const key = b.family === 'safari' ? safariYear(b.major) : b.major;
    if (!b.major || key > 10000) continue;
    seen[b.family].set(key, (seen[b.family].get(key) || 0) + (n || 1));
  }
  const ref = {};
  for (const fam of ['chrome', 'firefox', 'safari']) {
    const [lo, hi] = fam === 'safari' ? [want.safari - 1, want.safari] : [want[fam] - 4, want[fam]];
    const versions = [...seen[fam].entries()].sort((a, b) => b[0] - a[0]);
    const total = versions.reduce((s, [, n]) => s + n, 0);
    // The highest version that, with everything newer, carries a real share of the traffic.
    let high = 0, acc = 0;
    for (const [v, n] of versions) {
      acc += n;
      if (acc >= Math.max(2, total * 0.03)) { high = v; break; }
    }
    ref[fam] = high ? Math.min(hi, Math.max(lo, high)) : want[fam];
  }
  return ref;
}

export function isStale(browser, ref) {
  if (!browser) return false;
  if (browser.family === 'ie' || browser.family === 'android') return true;
  if (!browser.major) return false;
  const r = ref || expectedRef();
  if (browser.family === 'safari') return r.safari - safariYear(browser.major) >= STALE_BEHIND.safari;
  return r[browser.family] - browser.major >= STALE_BEHIND[browser.family];
}

// "Safari on iOS 13", "Chrome 124", "Chrome 114 on Android", "Safari 15 on macOS".
export function staleLabel(b) {
  if (b.family === 'safari' && (b.os === 'iOS' || b.os === 'iPadOS')) {
    return `${b.name === 'Safari' ? 'Safari' : b.name} on ${b.os} ${b.osMajor || b.major}`;
  }
  const base = b.name.replace(/ on iOS$/, '');
  const mobile = b.os === 'Android' || b.os === 'iOS' || b.os === 'iPadOS';
  if (b.family === 'safari') return `${base} ${b.major} on ${b.os}`;
  return `${base} ${b.major}${mobile ? ' on ' + b.os : ''}`;
}

// ---------------------------------------------------------------------------------------------
// The class of one request. ref is the day's staleRef(); without one, the calendar's.

export function classify(userAgent, botCategory, status, ref) {
  if (botCategory) return 'bot';
  if (+status >= 400) return 'scanner';
  const d = describe(userAgent);
  if (d.agent !== null) return 'agent';
  return isStale(d.browser, ref) ? 'stale' : 'person';
}

// ---------------------------------------------------------------------------------------------
// What may be shown. An unlisted post (isListed in src/data/listed.js) must never surface by
// slug, and anyone can put any text into a request path, a user agent or a Web Analytics beacon,
// so every path, name and host that reaches the snapshot goes through the checks below.
//
// The site: the build writes /stats-pages.txt (astro.config.mjs), every public page on the site,
// one path per line, with unlisted posts and anything named after one left out. The listed posts
// are its /ledger/<slug>/ lines. makeSite() turns it into what the checks use; without that file,
// /ledger/previews.json gives the listed posts alone and the checks are stricter.

// A word shaped like a post slug: three or more words joined by hyphens.
const SLUGGY = /^[a-z0-9]+(?:-[a-z0-9]+){2,}$/;
// _redirects sources: a 301 to somewhere else, never a page anyone read.
const REDIRECT_ROOTS = new Set(['posts', 'course']);

const encodeOut = (s) => s.replace(/[^A-Za-z0-9/._~!$()*+,;=:@-]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'));

export function siteFrom(listed, pages = null) {
  const words = new Set(listed);
  const prefixes = new Set(), sections = new Set();
  if (pages) {
    for (const p of pages.keys()) {
      for (const w of p.split(/[^a-z0-9-]+/)) if (w) words.add(w);
      const segs = p.split('/');
      if (segs.length >= 3 && segs[2]) { prefixes.add(`/${segs[1]}/${segs[2]}/`); sections.add(segs[1]); }
    }
  }
  return { listed, pages, words, prefixes, sections, key: [...listed].sort().join(' ') };
}

export function makeSite(text) {
  const t = String(text || '');
  if (/^\s*\{/.test(t)) {
    const j = JSON.parse(t);
    const listed = new Set(Object.keys((j && j.posts) || {}));
    if (!listed.size) throw new Error('previews.json lists no posts');
    return siteFrom(listed, null);
  }
  const pages = new Map(), listed = new Set();
  for (const line of t.split('\n')) {
    const p = line.trim();
    if (p[0] !== '/' || p.length > 200) continue;
    pages.set(p.toLowerCase(), encodeOut(p));
    const m = /^\/ledger\/([^/]+)\/$/.exec(p);
    if (m) listed.add(m[1]);
  }
  if (!listed.size) throw new Error('stats-pages.txt names no posts');
  return siteFrom(listed, pages);
}

// Accepts a site from makeSite()/siteFrom(), or just the listed slugs (a Set or an array).
const sites = new WeakMap();
export function siteOf(x) {
  if (x && x.listed instanceof Set && x.words) return x;
  if (x && typeof x === 'object' && sites.has(x)) return sites.get(x);
  const s = siteFrom(x instanceof Set ? x : new Set(x || []), null);
  if (x && typeof x === 'object') sites.set(x, s);
  return s;
}

// Every word in a lower-case string that is shaped like a post slug must be a word the site uses
// itself (a listed slug, or part of a public page's path).
const wordsOk = (low, S) => low.split(/[^a-z0-9-]+/).every((w) => {
  w = w.replace(/^-+|-+$/g, '');
  return !SLUGGY.test(w) || S.words.has(w);
});

// A path that may be shown, as it should be shown, or null.
//   people and Web Analytics paths (pages that answered): only a public page of the site, by its
//     own address ("/ledger" and "/ledger/" are one page);
//   opts.probe, for paths that got a 400 or worse: quoted as asked (a trailing slash on
//     "/.git/config" would misquote the scanner), but decoded first, so "%2F" can't smuggle a
//     slash past the checks, and dropped if anything in it is shaped like a post slug the site
//     doesn't use, or sits in a section of the site under a name the section doesn't have.
// Characters that mean something in HTML come out percent-encoded, so the page can't be handed
// markup however the snapshot is shown.
export function safePath(path, site, opts) {
  if (typeof path !== 'string' || path.length < 1 || path.length > 160 || path[0] !== '/') return null;
  if (!/^[\x21-\x7e]+$/.test(path)) return null; // printable ASCII, no spaces or control bytes
  const S = siteOf(site);
  const probe = !!(opts && opts.probe);
  let d = path;
  for (let i = 0; i < 3 && d.includes('%'); i++) {
    try { d = decodeURIComponent(d); } catch (e) { return null; }
  }
  if (d.includes('%') || d.includes('\\') || !/^[\x21-\x7e]+$/.test(d)) return null;
  d = d.replace(/\/{2,}/g, '/');
  const low = d.toLowerCase();
  const segs = low.split('/');
  if (segs.some((s) => s === '..' || s === '.')) return null;

  if (!probe && S.pages) {
    return S.pages.get(low) || S.pages.get(low + '/') || S.pages.get(low.replace(/(.)\/$/, '$1')) || null;
  }

  const [, root, second, third] = segs;
  const bare = (s) => s.replace(/\.[^.]*$/, '');
  if ((root === 'ledger' || root === 'posts') && second && !S.listed.has(bare(second))) return null;
  if (root === 'media' && second) {
    if (second === 'previews') {
      if (third && !S.listed.has(bare(third))) return null;
    } else if (!S.listed.has(second)) return null;
  }
  if (!probe && REDIRECT_ROOTS.has(root)) return null;
  if (!wordsOk(low, S)) return null;
  if (probe && S.pages && second && root !== 'media' && root !== 'ledger' && S.sections.has(root) && !S.prefixes.has(`/${root}/${second}/`)) return null;

  let out = encodeOut(d);
  if (!probe) {
    const last = out.slice(out.lastIndexOf('/') + 1);
    if (last && !last.includes('.')) out += '/';
  }
  return out;
}

// A bot or program name, or a bot's owner, that may be shown; otherwise the fallback.
const FIXED_NAMES = new Set([
  ...BOT_NAMES.map(([, name]) => name).filter(Boolean), ...PROGRAMS.map(([, name]) => name),
  'Claude desktop app', 'Headless Chrome', 'No user agent', 'Unknown program', 'Palo Alto Networks scanner',
  'Other programs', 'Other bots', 'Other old browsers', 'Unknown',
]);
export function safeLabel(name, site, fallback) {
  const s = String(name || '');
  if (FIXED_NAMES.has(s.replace(/ \(unverified\)$/, ''))) return s;
  return wordsOk(s.toLowerCase(), siteOf(site)) ? s : fallback;
}

export function safeHost(host) {
  let h = String(host == null ? '' : host).trim().toLowerCase().replace(/\.$/, '');
  if (!h) return '';
  h = h.replace(/^www\./, '');
  if (h.length > 100 || !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(h)) return null;
  if (/^\d+(\.\d+){3}$/.test(h)) return null; // a bare address is nobody's site name
  return h;
}

export const isOwnHost = (h) => h === SITE || (h || '').endsWith('.' + SITE);

// "jira.corp.acme.com" -> "acme.com", "a.b.example.co.uk" -> "example.co.uk".
function registrable(h) {
  const labels = h.split('.');
  return labels.slice(/\.(?:co|com|net|org|ac|gov|edu|ne|or|go)\.[a-z]{2}$/.test(h) ? -3 : -2).join('.');
}
// Names that only mean something inside someone's own network, and the workers.dev / pages.dev
// hosts (Aaron's private dashboards and preview builds live there).
const PRIVATE_HOST = /\.(?:local|lan|internal|intranet|corp|home|localdomain|localhost|test|example|invalid|arpa|onion|private)$|\.(?:workers|pages)\.dev$/;

// A referring site that may be shown: '' for none, a host, or null to leave it out. A host of
// four or more labels (a machine on someone's network) is cut to the site it belongs to. Android
// apps arrive as reversed names ("com.google.android.gm") and are left whole.
export function refHost(host, site) {
  const h = safeHost(host);
  if (!h) return h;
  if (isOwnHost(h) || PRIVATE_HOST.test(h)) return null;
  const out = h.split('.').length >= 4 && !/^(?:com|org|net|io|app)\./.test(h) ? registrable(h) : h;
  return wordsOk(out, siteOf(site)) ? out : null;
}

// Cloudflare's country codes, two letters; "XX" for unknown, Tor ("T1") and anything else
// (Intl.DisplayNames can't name those, and throws on "T1").
const safeCountry = (c) => (/^[A-Z]{2}$/.test(c || '') ? c : 'XX');
const safeDevice = (d) => (['desktop', 'mobile', 'tablet'].includes(d) ? d : 'other');

// ---------------------------------------------------------------------------------------------
// Queries. One GraphQL query per cron run (the Worker has 10 ms of CPU), each answer kept small.

const isDay = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d);
const isTag = (t) => /^[0-9a-f]{32}$/.test(t);
function tags(t) {
  if (!t || !isTag(t.zone) || !isTag(t.account) || !isTag(t.site)) throw new Error('stats: zone, account or site tag missing');
  return t;
}
const nextDay = (d) => new Date(Date.parse(d + 'T00:00:00Z') + 86400e3).toISOString().slice(0, 10);

// Row limits. A normal day has 20 to 40 bot user agents and 60 to 100 others (17 Oct), so these
// only bite on a day when something rotates random user agents; what the rows miss is still
// counted (botAll, okAll, okPages), and a run in a fresh isolate pays about 25 µs of CPU for each
// new user agent, so the limits are kept low: at these a full core answer is about 80 KB. LITE is
// the smaller core query used after a run was stopped mid-way. people: rows per slice of the day.
export const LIMITS = { bots: 60, ua: 150, people: 300 };
export const LITE = { bots: 25, ua: 60, people: 300 };

// Everything about one day except the people's own page views: bots by user agent, scanners,
// non-bot traffic by user agent (to class it), and Web Analytics' page loads.
export function coreQuery(day, t, limits = LIMITS) {
  if (!isDay(day)) throw new Error('stats: bad day');
  const { zone, account, site } = tags(t);
  const f = (extra) => `filter:{date:"${day}"${extra}}`;
  const bot = ', verifiedBotCategory_neq:""';
  const scan = ', verifiedBotCategory:"", edgeResponseStatus_geq:400';
  const ok = ', verifiedBotCategory:"", edgeResponseStatus_lt:400';
  const html = ', edgeResponseContentTypeName:"html"';
  const rf = `filter:{date:"${day}", siteTag:"${site}"}`;
  const g = 'httpRequestsAdaptiveGroups';
  const r = 'rumPageloadEventsAdaptiveGroups';
  return `query { viewer {
 zones(filter:{zoneTag:"${zone}"}) {
  bots: ${g}(limit:${limits.bots}, ${f(bot)}, orderBy:[count_DESC]) { count sum{edgeResponseBytes} dimensions{userAgent verifiedBotCategory} }
  botPages: ${g}(limit:${limits.bots}, ${f(bot + html)}, orderBy:[count_DESC]) { count dimensions{userAgent verifiedBotCategory} }
  botAll: ${g}(limit:1, ${f(bot)}) { count sum{edgeResponseBytes} }
  botPagesAll: ${g}(limit:1, ${f(bot + html)}) { count }
  botCountries: ${g}(limit:100, ${f(bot)}, orderBy:[count_DESC]) { count dimensions{clientCountryName} }
  scan: ${g}(limit:100, ${f(scan)}, orderBy:[count_DESC]) { count sum{edgeResponseBytes} dimensions{edgeResponseContentTypeName edgeResponseStatus} }
  probes: ${g}(limit:80, ${f(scan)}, orderBy:[count_DESC]) { count dimensions{clientRequestPath} }
  probeCountries: ${g}(limit:100, ${f(scan)}, orderBy:[count_DESC]) { count dimensions{clientCountryName} }
  ua: ${g}(limit:${limits.ua}, ${f(ok)}, orderBy:[count_DESC]) { count sum{edgeResponseBytes} dimensions{userAgent} }
  uaPages: ${g}(limit:${limits.ua}, ${f(ok + html)}, orderBy:[count_DESC]) { count dimensions{userAgent} }
  okAll: ${g}(limit:1, ${f(ok)}) { count sum{edgeResponseBytes} }
  okPages: ${g}(limit:1, ${f(ok + html)}) { count }
 }
 accounts(filter:{accountTag:"${account}"}) {
  rumTotal: ${r}(limit:1, ${rf}) { count sum{visits} }
  rumPaths: ${r}(limit:60, ${rf}, orderBy:[count_DESC]) { count dimensions{requestPath} }
  rumRefs: ${r}(limit:40, ${rf}, orderBy:[count_DESC]) { count dimensions{refererHost} }
  rumCountries: ${r}(limit:100, ${rf}, orderBy:[count_DESC]) { count dimensions{countryName} }
  rumDevices: ${r}(limit:10, ${rf}, orderBy:[count_DESC]) { count dimensions{deviceType} }
 }
}}`;
}

// The day's successful, non-bot HTML responses, one row per user agent, page, country, device and
// hour, for a slice of the day. Rows can't outnumber page views, and the core step counted those,
// so windowCount() picks slices that should come back well under the row limit (a row is about
// 290 bytes; a busy slice is cut finer anyway).
export const WINDOWS = [1, 2, 3, 4, 6, 8, 12, 24];
export const ROWS_PER_WINDOW = 300;
export const windowCount = (pages) => WINDOWS.find((w) => (pages || 0) / w <= ROWS_PER_WINDOW) || 24;

export function windowQuery(day, i, n, t) {
  if (!isDay(day) || !WINDOWS.includes(n) || !(i >= 0 && i < n)) throw new Error('stats: bad window');
  const { zone } = tags(t);
  const hours = 24 / n;
  const at = (h) => (h >= 24 ? `${nextDay(day)}T00:00:00Z` : `${day}T${String(h).padStart(2, '0')}:00:00Z`);
  return `query { viewer {
 zones(filter:{zoneTag:"${zone}"}) {
  people: httpRequestsAdaptiveGroups(limit:${LIMITS.people}, filter:{datetime_geq:"${at(i * hours)}", datetime_lt:"${at((i + 1) * hours)}", verifiedBotCategory:"", edgeResponseStatus_lt:400, edgeResponseContentTypeName:"html"}, orderBy:[count_DESC]) { count dimensions{userAgent clientRequestPath clientCountryName clientDeviceType datetimeHour} }
 }
}}`;
}

// Daily totals since launch (the 1d dataset keeps a year), and the last 30 days of Core Web
// Vitals from Web Analytics, in one query once a day. `uniques` is Cloudflare's own daily count of
// distinct visitors (it counts addresses on its side); only that one number per day comes back,
// and it is the same column AO-057 already published. No address is ever asked for or seen here.
export function totalsQuery(from, to, vitalsFrom, t) {
  if (![from, to, vitalsFrom].every(isDay)) throw new Error('stats: bad totals range');
  const { zone, account, site } = tags(t);
  return `query { viewer {
 zones(filter:{zoneTag:"${zone}"}) {
  totals: httpRequests1dGroups(limit:400, filter:{date_geq:"${from}", date_lt:"${nextDay(to)}"}, orderBy:[date_ASC]) { dimensions{date} sum{requests pageViews bytes cachedBytes threats} uniq{uniques} }
 }
 accounts(filter:{accountTag:"${account}"}) {
  vitals: rumWebVitalsEventsAdaptiveGroups(limit:10, filter:{datetime_geq:"${vitalsFrom}T00:00:00Z", datetime_lt:"${nextDay(to)}T00:00:00Z", siteTag:"${site}"}) { count quantiles{largestContentfulPaintP75 interactionToNextPaintP75 cumulativeLayoutShiftP75} dimensions{deviceType} }
 }
}}`;
}

// ---------------------------------------------------------------------------------------------
// Builders: GraphQL answer (already parsed, the `data` object) -> pieces of the contract.

const zoneOf = (data) => (data && data.viewer && data.viewer.zones && data.viewer.zones[0]) || {};
const accountOf = (data) => (data && data.viewer && data.viewer.accounts && data.viewer.accounts[0]) || {};
const add = (o, k, n) => { o[k] = (o[k] || 0) + n; };
const int = (n) => Math.max(0, Math.round(+n || 0));
const first = (rows) => (rows && rows[0]) || null;
const sortObj = (o) => Object.fromEntries(Object.entries(o).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)));
const top = (o, n) => Object.entries(o).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).slice(0, n);
const zeroes = () => ({ person: 0, stale: 0, agent: 0, bot: 0, scanner: 0 });

// Folds a long tail into one row so a day can't carry hundreds of one-off program names.
function capped(o, n, other) {
  const rows = top(o, Infinity);
  if (rows.length <= n) return rows;
  const kept = rows.slice(0, n - 1);
  kept.push([other, rows.slice(n - 1).reduce((s, [, v]) => s + v, 0)]);
  return kept;
}

// The core step's answer -> the part of the day it can fill, plus what the people step needs:
// the stale reference and how many slices to cut the day into. site: makeSite() (or the listed
// slugs).
export function buildCore(data, day, site, limits = LIMITS) {
  const z = zoneOf(data), a = accountOf(data);
  const S = siteOf(site);
  const req = zeroes(), pages = zeroes(), bytes = zeroes();

  // Bots: one row per name, under the category most of its requests carried.
  const bots = new Map(); // name -> { owner, cats: {cat: n}, req, pages }
  const named = new Map(); // ua + category -> its row, so each string is read once
  const bot = (ua, cat) => {
    const k = cat + '\n' + ua;
    if (!named.has(k)) {
      const [n, o] = botName(ua, cat);
      const name = safeLabel(n, S, 'Unnamed ' + cat);
      if (!bots.has(name)) bots.set(name, { owner: safeLabel(o, S, 'Unknown'), cats: {}, req: 0, pages: 0 });
      named.set(k, bots.get(name));
    }
    return named.get(k);
  };
  for (const r of z.bots || []) {
    const n = int(r.count), cat = cleanCategory(r.dimensions.verifiedBotCategory);
    const b = bot(r.dimensions.userAgent, cat);
    b.req += n; add(b.cats, cat, n);
    req.bot += n; bytes.bot += int(r.sum && r.sum.edgeResponseBytes);
  }
  for (const r of z.botPages || []) {
    const n = int(r.count);
    bot(r.dimensions.userAgent, cleanCategory(r.dimensions.verifiedBotCategory)).pages += n;
    pages.bot += n;
  }
  // More bot user agents than the rows hold: the rest still count, as "Other bots".
  const botAll = first(z.botAll), botPagesAll = first(z.botPagesAll);
  const moreReq = botAll ? int(botAll.count) - req.bot : 0;
  const moreBytes = botAll ? int(botAll.sum && botAll.sum.edgeResponseBytes) - bytes.bot : 0;
  const morePages = botPagesAll ? int(botPagesAll.count) - pages.bot : 0;
  if (moreReq > 0 || morePages > 0) {
    const o = { owner: 'Unknown', cats: { Other: 1 }, req: Math.max(0, moreReq), pages: Math.max(0, morePages) };
    bots.set('Other bots', o);
    req.bot += o.req; pages.bot += o.pages;
  }
  if (moreBytes > 0) bytes.bot += moreBytes;
  const botRows = [...bots.entries()]
    .map(([name, b]) => [name, b.owner, top(b.cats, 1)[0]?.[0] || 'Other', b.req, b.pages])
    .filter((r) => r[3] > 0 || r[4] > 0)
    .sort((x, y) => (x[0] === 'Other bots') - (y[0] === 'Other bots') || y[3] - x[3] || y[4] - x[4] || (x[0] < y[0] ? -1 : 1));

  // Scanners: whatever failed, minus the verified bots.
  const probeStatus = {};
  for (const r of z.scan || []) {
    const n = int(r.count);
    req.scanner += n; bytes.scanner += int(r.sum && r.sum.edgeResponseBytes);
    if (r.dimensions.edgeResponseContentTypeName === 'html') pages.scanner += n;
    const s = int(r.dimensions.edgeResponseStatus);
    if (s >= 400 && s < 600) add(probeStatus, String(s), n);
  }
  const probes = {};
  for (const r of z.probes || []) {
    const p = safePath(r.dimensions.clientRequestPath, S, { probe: true });
    if (p) add(probes, p, int(r.count));
  }
  const countries = (rows, key) => {
    const o = {};
    for (const r of rows || []) add(o, safeCountry(r.dimensions[key]), int(r.count));
    return sortObj(o);
  };

  // Everyone else, by user agent. The reference for "out of date" is taken from this day's own
  // traffic (and Googlebot's Chrome), and stored, so the people step judges the same browsers the
  // same way.
  const uaRows = (z.ua || []).map((r) => ({ ua: r.dimensions.userAgent, n: int(r.count), b: int(r.sum && r.sum.edgeResponseBytes) }));
  const ref = staleRef(uaRows, day, googleChrome((z.bots || []).map((r) => r.dimensions.userAgent)));
  const agents = {}, staleReq = {}, stale = {};
  const seen = new Map(); // ua -> class, so each string is parsed once
  const classOf = (ua) => {
    if (!seen.has(ua)) seen.set(ua, classify(ua, '', 200, ref));
    return seen.get(ua);
  };
  for (const { ua, n, b } of uaRows) {
    const c = classOf(ua);
    req[c] += n; bytes[c] += b;
    if (c === 'agent') add(agents, safeLabel(agentName(ua), S, 'Unknown program'), n);
    if (c === 'stale') add(staleReq, staleLabel(describe(ua).browser), n);
  }
  for (const r of z.uaPages || []) {
    const ua = r.dimensions.userAgent, n = int(r.count), c = classOf(ua);
    pages[c] += n;
    if (c === 'stale') add(stale, staleLabel(describe(ua).browser), n);
  }
  // A day with more distinct user agents than the query returns (a bot rotating random ones).
  // Requests the rows didn't cover are counted as programs. Pages are put right when the day is
  // assembled: the people step classes every user agent that loaded a page.
  const okAll = first(z.okAll), okPages = first(z.okPages);
  if (okAll && uaRows.length >= limits.ua) {
    const missing = int(okAll.count) - uaRows.reduce((s, r) => s + r.n, 0);
    if (missing > 0) { req.agent += missing; add(agents, 'Unknown program', missing); }
    const missingBytes = int(okAll.sum && okAll.sum.edgeResponseBytes) - uaRows.reduce((s, r) => s + r.b, 0);
    if (missingBytes > 0) bytes.agent += missingBytes;
  }
  const uaTrunc = (z.uaPages || []).length >= limits.ua;
  if (okPages && uaTrunc) {
    const missing = int(okPages.count) - (z.uaPages || []).reduce((s, r) => s + int(r.count), 0);
    if (missing > 0) pages.agent += missing;
  }
  // Labels with requests but no page that day still count as a sighting of zero pages; keep them
  // only when they carried a page, which is what the contract counts.
  for (const k of Object.keys(staleReq)) if (!(k in stale)) delete staleReq[k];

  const pagesOk = okPages ? int(okPages.count) : (z.uaPages || []).reduce((s, r) => s + int(r.count), 0);
  return {
    d: day,
    lite: limits !== LIMITS,
    ref,
    win: windowCount(pagesOk),
    pagesOk,
    uaTrunc,
    req, pages, bytes,
    bots: botRows,
    agents: capped(agents, 20, 'Other programs'),
    stale: capped(stale, 20, 'Other old browsers'),
    probes: top(probes, 25),
    probeStatus: sortObj(probeStatus),
    probeCountries: countries(z.probeCountries, 'clientCountryName'),
    botCountries: countries(z.botCountries, 'clientCountryName'),
    rum: buildRum(a, S),
  };
}

function buildRum(a, S) {
  const total = (a.rumTotal && a.rumTotal[0]) || {};
  const paths = {}, refs = {}, countries = {}, devices = {};
  for (const r of a.rumPaths || []) {
    const p = safePath(r.dimensions.requestPath, S);
    if (p) add(paths, p, int(r.count));
  }
  for (const r of a.rumRefs || []) {
    const h = refHost(r.dimensions.refererHost, S);
    if (h === null) continue; // the site's own pages aren't a source, and private names stay private
    add(refs, h, int(r.count));
  }
  for (const r of a.rumCountries || []) add(countries, safeCountry(r.dimensions.countryName), int(r.count));
  for (const r of a.rumDevices || []) add(devices, safeDevice(r.dimensions.deviceType), int(r.count));
  return {
    loads: int(total.count),
    visits: int(total.sum && total.sum.visits),
    paths: top(paths, 30),
    referrers: top(refs, 20),
    countries: sortObj(countries),
    devices: sortObj(devices),
  };
}

// One slice of the people step -> counts for the `person` class, in pages, plus the slice's pages
// per class (used when the core step's user agent rows ran out). Paths are kept whole here
// (merged across slices, then cut to the top 40 when the day is assembled).
export function buildWindow(data, ref, site) {
  const z = zoneOf(data);
  const S = siteOf(site);
  const shown = new Map(); // path -> safePath(path), each path checked once
  const out = { rows: 0, cls: { person: 0, stale: 0, agent: 0 }, countries: {}, devices: {}, browsers: {}, os: {}, hours: new Array(24).fill(0), paths: {} };
  const seen = new Map();
  for (const r of z.people || []) {
    out.rows++;
    const d = r.dimensions, n = int(r.count), ua = d.userAgent;
    if (!seen.has(ua)) seen.set(ua, classify(ua, '', 200, ref));
    const c = seen.get(ua);
    if (c in out.cls) out.cls[c] += n;
    if (c !== 'person') continue;
    const b = describe(ua).browser;
    add(out.countries, safeCountry(d.clientCountryName), n);
    add(out.devices, safeDevice(d.clientDeviceType), n);
    add(out.browsers, b.name, n);
    add(out.os, b.os, n);
    const h = +String(d.datetimeHour).slice(11, 13); // "2026-10-17T05:00:00Z"
    if (h >= 0 && h < 24) out.hours[h] += n;
    if (!shown.has(d.clientRequestPath)) shown.set(d.clientRequestPath, safePath(d.clientRequestPath, S));
    const p = shown.get(d.clientRequestPath);
    if (p) add(out.paths, p, n);
  }
  return out;
}

// The core part, every slice and the reader counter's rows -> one Day of the contract, keys in
// the contract's order.
export function assembleDay(core, windows, readsRows, site) {
  const S = siteOf(site);
  const people = { countries: {}, devices: {}, browsers: {}, os: {}, hours: new Array(24).fill(0), paths: {} };
  const cls = { person: 0, stale: 0, agent: 0 };
  for (const w of windows) {
    for (const k of ['countries', 'devices', 'browsers', 'os', 'paths']) for (const [key, n] of Object.entries(w[k] || {})) add(people[k], key, n);
    (w.hours || []).forEach((n, h) => { people.hours[h] += n || 0; });
    for (const k of Object.keys(cls)) cls[k] += (w.cls && w.cls[k]) || 0;
  }
  // The core step ran out of user agent rows: the slices classed every page, so their counts win.
  const pages = core.uaTrunc && windows.length ? { ...core.pages, ...cls } : core.pages;
  // Re-checked here as well: a post can be unlisted between the step that fetched it and now.
  const keep = (rows, probe) => rows.filter(([p]) => safePath(p, S, { probe }) === p);
  const reads = (readsRows || [])
    .map((r) => [String(r.slug), int(r.n)])
    .filter(([s, n]) => n > 0 && S.listed.has(s))
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
  return {
    d: core.d,
    req: core.req,
    pages,
    bytes: core.bytes,
    bots: core.bots,
    agents: core.agents,
    stale: core.stale,
    probes: keep(core.probes, true),
    probeStatus: core.probeStatus,
    probeCountries: core.probeCountries,
    botCountries: core.botCountries,
    people: {
      countries: sortObj(people.countries),
      devices: sortObj(people.devices),
      browsers: sortObj(people.browsers),
      os: sortObj(people.os),
      hours: people.hours,
      paths: keep(top(people.paths, 40)),
    },
    rum: { ...core.rum, paths: keep(core.rum.paths) },
    reads,
  };
}

// The totals step's answer -> { totals, vitals } as the contract writes them. vitals is null when
// the answer carried none (Web Analytics refused that half): the last good ones are kept.
const MS = (us) => Math.round((+us || 0) / 1000); // the vitals come back in microseconds
export function buildTotals(data, vitalsFrom, to) {
  const z = zoneOf(data), a = accountOf(data);
  const rows = (z.totals || [])
    .filter((r) => isDay(r.dimensions && r.dimensions.date))
    .map((r) => [r.dimensions.date, int(r.sum.requests), int(r.sum.pageViews), int(r.uniq && r.uniq.uniques), int(r.sum.bytes), int(r.sum.cachedBytes), int(r.sum.threats)]);
  let vitals = null;
  if (Array.isArray(a.vitals)) {
    vitals = { from: vitalsFrom, to };
    for (const r of a.vitals) {
      const dev = safeDevice(r.dimensions && r.dimensions.deviceType);
      const q = r.quantiles || {};
      vitals[dev] = {
        n: int(r.count),
        lcp: MS(q.largestContentfulPaintP75),
        inp: MS(q.interactionToNextPaintP75),
        cls: Math.round((+q.cumulativeLayoutShiftP75 || 0) * 1000) / 1000,
      };
    }
  }
  return { totals: { cols: ['d', 'requests', 'pages', 'uniques', 'bytes', 'cachedBytes', 'threats'], rows }, vitals };
}

// ---------------------------------------------------------------------------------------------
// Belt and braces when the snapshot is put together: does a stored day mention a post that isn't
// listed (any more)? Cheap enough to run over every day's text on every rebuild. (A post that is
// unlisted after its days were stored is found another way: stats.js compares the listed posts
// with the ones it saw last time and cleans every stored day.)

const POST_REF = /\/(?:ledger|posts|media)(?:\/|%2f)(?:previews(?:\/|%2f))?([^"\/?#\s%]+)/gi;
export function mentionsUnlisted(dayText, site) {
  const L = siteOf(site).listed;
  POST_REF.lastIndex = 0;
  let m;
  while ((m = POST_REF.exec(dayText))) {
    const s = m[1].toLowerCase().replace(/\.[^.]*$/, '');
    if (s && !L.has(s)) return true;
  }
  const reads = /"reads":\[(.*?)\]\}$/.exec(dayText);
  if (reads) for (const r of reads[1].matchAll(/\["([^"]+)",/g)) if (!L.has(r[1])) return true;
  return false;
}

// Runs every check above over a stored day again, keeping the rest of it.
export function scrubDay(day, site) {
  const S = siteOf(site);
  const keep = (rows, probe) => (rows || []).filter(([p]) => safePath(p, S, { probe }) === p);
  const relabel = (rows, fallback) => { // same order, a renamed row merged into one already there
    const o = new Map();
    for (const [name, n] of rows || []) { const k = safeLabel(name, S, fallback); o.set(k, (o.get(k) || 0) + n); }
    return [...o];
  };
  const refs = {};
  for (const [h, n] of (day.rum && day.rum.referrers) || []) {
    const ok = h === '' ? '' : refHost(h, S);
    if (ok !== null) add(refs, ok, n);
  }
  return {
    ...day,
    bots: (day.bots || []).map(([name, owner, cat, r, p]) => [safeLabel(name, S, 'Unnamed ' + cat), safeLabel(owner, S, 'Unknown'), cat, r, p]),
    agents: relabel(day.agents, 'Unknown program'),
    probes: keep(day.probes, true),
    people: { ...day.people, paths: keep(day.people && day.people.paths) },
    rum: { ...day.rum, paths: keep(day.rum && day.rum.paths), referrers: top(refs, 20) },
    reads: (day.reads || []).filter(([s]) => S.listed.has(s)),
  };
}
