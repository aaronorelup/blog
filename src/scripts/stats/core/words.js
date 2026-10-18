// The page's vocabulary: the five kinds, the plain words for technical ideas, and the small
// dictionaries that turn a bot's name, a program's label, a scanner's path or a referrer's host
// into a sentence a newcomer can read. Pure data plus lookups; no DOM. DESIGN.md §C is the spec.
//
// A rule that runs through all of it: a name the server sends only reaches the page if it is in
// one of these lists or passes the display thresholds in agg.displayable(). Everything else
// folds into "other", and its name never prints.

// ---------- the five kinds ----------

// Station order: the order the gate asks its questions. Piles, legends, tabs and tables use it.
export const KIND_ORDER = ['bot', 'scanner', 'agent', 'stale', 'person'];
// Stack order, bottom to top: people sit on the ground, the loudest machines on top.
export const STACK_ORDER = [...KIND_ORDER].reverse();

export const KINDS = {
  bot: {
    key: 'bot', long: 'Bots that say who they are', short: 'Named bots', eyebrow: 'THE LIBRARY',
    station: 'Badge?', glyph: 'diamond', cssVar: '--st-bot', night: '#F16F46', day: '#AF2E13',
    def: "Automated visitors that say who they are, and Cloudflare has checked they're telling the truth: Googlebot, OpenAI's crawlers and about a hundred more.",
  },
  scanner: {
    key: 'scanner', long: 'Scanners', short: 'Scanners', eyebrow: 'THE LOCKED DOORS',
    station: 'Wrong door?', glyph: 'cross', cssVar: '--st-scanner', night: '#726757', day: '#6D6864',
    def: "Programs trying addresses this site never had (/wp-admin, /.env), hoping for a weak website. They get 'not found'. A person following a broken link lands here too.",
  },
  agent: {
    key: 'agent', long: 'Scripts & agents', short: 'Scripts', eyebrow: 'THE WORKSHOP',
    station: 'A program?', glyph: 'square', cssVar: '--st-agent', night: '#A8A3A0', day: '#403C39',
    def: "Programs that fetch pages without a browser window: command-line tools, Python scripts, AI agents, the Claude app checking a post. Many are Aaron's own.",
  },
  stale: {
    key: 'stale', long: 'Out-of-date browsers', short: 'Old browsers', eyebrow: 'THE COSTUME RACK',
    station: 'Old browser?', glyph: 'triangle', cssVar: '--st-stale', night: '#607EC2', day: '#6B8ACF',
    def: 'They look like a browser, but one more than a year out of date. People do run old browsers; not this many, this often, so most are probably bots in disguise.',
  },
  person: {
    key: 'person', long: 'Probably people', short: 'People', eyebrow: 'THE TEA ROOM',
    station: 'Everyone left', glyph: 'disc', cssVar: '--st-person', night: '#F0C06A', day: '#BE7A10',
    def: 'Visitors that got four noes: a recent browser, no badge, no error, not a program. Probably people, Aaron included. Some bots hide well, so this is the most it could be.',
  },
};

// ---------- plain words (term cards) ----------
// A value can be a function of ctx-like options ({ utcMidnight }) for the one card that is
// computed for the reader.

export const TERMS = {
  page: { word: 'page', def: "One web page: a post, the list of posts, the homepage. The pictures and videos inside it aren't extra pages; they're files." },
  file: { word: 'file', def: 'Everything the site sends is a file: a page, a picture, a piece of video, a font. Opening one post is often 5 to 20 files. (Cloudflare calls these requests.)' },
  knock: { word: 'knock', def: "One try at an address by a scanner. Each knock is a file the site answered, almost always with 'not found'." },
  data: { word: 'data', def: 'How much the files weighed. Video is usually most of it.' },
  counter: { word: "Cloudflare's counter", def: "A tiny script in each page that tells Cloudflare 'a browser showed this'. Ad blockers stop it, and it listens to about 1 visit in 10 and multiplies, so its counts are estimates." },
  loads: { word: 'page loads', def: "A tiny script in each page that tells Cloudflare 'a browser showed this'. Ad blockers stop it, and it listens to about 1 visit in 10 and multiplies, so its counts are estimates." },
  visits: { word: 'visits', def: 'Arrivals from outside the site (a link, a search, a typed address), not clicks between its pages.' },
  stayed: { word: 'readers who stayed', def: 'Browsers that kept a post open at least 4 seconds, counted once a day by the site itself.' },
  range: { word: 'between about', def: "Two counts disagree. Cloudflare's counter misses people with blockers; the server's count includes some bots that pass for people. The truth is in between." },
  badge: { word: 'wears a badge', def: 'Cloudflare checks that a visitor calling itself Googlebot really comes from Google, and the same for about a hundred known bots. The ones that check out wear a badge.' },
  notfound: { word: "'not found'", def: "What the site answered: there's nothing at that address." },
  forbidden: { word: "'forbidden'", def: "What the site answered: that address isn't open." },
  where: { word: 'where', def: "Cloudflare's guess from the internet address. This page never sees the address. A VPN moves it." },
  referrer: { word: 'where they came from', def: 'The site a visitor clicked a link on. Blank when they typed the address, used a bookmark, or came from an app.' },
  nolink: { word: 'with no link', def: 'The site a visitor clicked a link on. Blank when they typed the address, used a bookmark, or came from an app.' },
  utc: {
    word: 'UTC',
    def: (o = {}) => `The world's reference clock. Days here run midnight to midnight UTC, which is ${o.utcMidnight || 'midnight'} to ${o.utcMidnight || 'midnight'} where you are.`,
  },
  p75: { word: 'three visits in four', def: 'Three of every four measured visits were at least this fast.' },
  lcp: { word: 'the main content showed', def: "How long until the biggest thing on the page (a heading, a picture) was on screen. Google calls under 2.5 seconds good." },
  inp: { word: 'a tap got an answer', def: 'How long the page took to respond to a tap, click or key. Google calls under 200 milliseconds good.' },
  cls: { word: 'the page moved while loading', def: 'How much things jumped around as the page filled in, as a score. Google calls under 0.1 good.' },
  ua: { word: 'the name a visitor gives', def: "Every visitor sends a name, like 'Chrome 141 on Windows', 'curl' or 'Googlebot'. Bots can lie; Cloudflare checks the ones claiming to be known bots." },
  datacentre: { word: 'a building full of rented computers', def: 'A data centre: rows of rented computers. Bots and scanners run there, not in anyone\'s home.' },
  filing: { word: 'filing', def: 'Once a day, just after midnight UTC, the numbers are gathered and filed. Everyone sees the same filing.' },
  filed: { word: 'filed', def: 'Once a day, just after midnight UTC, the numbers are gathered and filed. Everyone sees the same filing.' },
};

// ---------- bot purposes ----------

export const AI_CATEGORIES = new Set(['AI Crawler', 'AI Assistant', 'AI Search']);
const PURPOSES = {
  'AI Crawler': ['ai', 'collects pages to train AI'],
  'AI Assistant': ['ai', 'fetches a page because someone asked an AI'],
  'AI Search': ['ai', 'indexes pages for an AI search engine'],
  'Search Engine Crawler': ['search', 'search engine'],
  'Search Engine Optimization': ['seo', 'studies websites for marketers'],
  'Page Preview': ['preview', 'draws link previews'],
  'Monitoring & Analytics': ['other', 'checks the site is up'],
  'Feed Fetcher': ['other', 'a feed reader'],
  Archiver: ['other', 'a web archive'],
  Security: ['other', 'checks sites for security problems'],
};
export const PURPOSE_KEYS = ['ai', 'search', 'seo', 'preview', 'other'];
export const PURPOSE_LABELS = { ai: 'AI', search: 'Search engines', seo: 'SEO tools', preview: 'Link previews', other: 'Other' };

/** @returns {{key:'ai'|'search'|'seo'|'preview'|'other', plain:string}} */
export function purposeOf(category) {
  const p = PURPOSES[category];
  return p ? { key: p[0], plain: p[1] } : { key: 'other', plain: 'other helper' };
}

// ---------- bots ----------

const PREVIEW_SITES = { Twitterbot: 'X', Discordbot: 'Discord', Slackbot: 'Slack', LinkedInBot: 'LinkedIn', TelegramBot: 'Telegram' };

export const BOT_INFO = {
  Googlebot: "Google's search crawler: reads pages so they can show up in Google.",
  GoogleOther: "Google's crawler for research and its AI products, not search results.",
  'Google-Extended': 'A permission name: says whether the company may use pages to train AI.',
  'Applebot-Extended': 'A permission name: says whether the company may use pages to train AI.',
  Bingbot: "Microsoft's search crawler, for Bing and the AI answers built on it.",
  Applebot: "Apple's crawler, for Siri, Spotlight and Apple's AI.",
  GPTBot: "OpenAI's crawler that collects pages to train its models.",
  'OAI-SearchBot': "OpenAI's search crawler: indexes pages so ChatGPT search can show and cite them.",
  'ChatGPT-User': 'Fetches a page right then, because someone asked ChatGPT something that needed it.',
  ClaudeBot: "Anthropic's crawler that collects pages for training Claude.",
  'Claude-User': 'Fetches a page because someone asked Claude something that needed it.',
  'Claude-SearchBot': "Anthropic's search crawler for Claude's web search.",
  PerplexityBot: "Perplexity's crawler for its AI search engine.",
  'Perplexity-User': "Fetches a page for a Perplexity user's question.",
  'meta-externalagent': "Meta's crawler for training its AI models.",
  facebookexternalhit: 'Draws the preview card when someone shares a link on Facebook or Instagram.',
  Amazonbot: "Amazon's crawler, for Alexa and its AI.",
  PetalBot: "Huawei's crawler for its Petal search and AI.",
  ExaSearchBot: 'The crawler for Exa, an AI search engine that other AI tools call.',
  ExaUser: "Fetches a page for someone using Exa's search.",
  CCBot: "Common Crawl's crawler: a free public copy of the web that many AI models are trained on.",
  Bytespider: "ByteDance's (TikTok's) crawler for its AI.",
  SemrushBot: "Semrush's crawler: studies websites for marketers.",
  AhrefsBot: "Ahrefs' crawler: maps who links to whom, for marketers.",
  Barkrowler: "Babbar's crawler: maps links between sites, for marketers.",
  DuckDuckBot: "DuckDuckGo's crawler for its search and its AI answers.",
  DuckAssistBot: "DuckDuckGo's crawler for its search and its AI answers.",
  YandexBot: "Yandex's search crawler (Russia's biggest search engine).",
  MojeekBot: "Mojeek's crawler: a small independent search engine.",
  'Internet Archive': 'The Wayback Machine, saving copies of the web.',
  UptimeRobot: 'Checks the site is up.',
};
for (const [bot, site] of Object.entries(PREVIEW_SITES)) BOT_INFO[bot] = `Draws the preview when someone posts a link on ${site}.`;

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export function botBlurb(name, category) {
  const n = String(name || '');
  if (BOT_INFO[n]) return BOT_INFO[n];
  if (/^Unnamed\b/.test(n)) return "A bot Cloudflare verified that didn't give its name.";
  return cap(purposeOf(category).plain) + '.';
}
export const isKnownBot = (name) => Object.prototype.hasOwnProperty.call(BOT_INFO, String(name || '')) || /^Unnamed\b/.test(String(name || ''));

// ---------- programs (scripts & agents) ----------

export const PROGRAM_INFO = {
  'Claude desktop app': "The Claude app's built-in browser; Aaron's agents use it to look at posts as they write them.",
  'Claude Code': "Anthropic's coding agent fetching a page, usually Aaron's own.",
  curl: "A command-line tool for fetching one page; Aaron's agents use it to check that a post went live.",
  'Headless Chrome': 'A real browser with no screen, driven by a script.',
  'python-requests': 'A Python script fetching pages.',
  Python: 'A Python script fetching pages.',
  'Python urllib': 'A Python script fetching pages.',
  httpx: 'A Python script fetching pages.',
  aiohttp: 'A Python script fetching pages.',
  'Go-http-client': 'A program written in Go; often a scanner or a monitoring tool.',
  'Node.js': 'A JavaScript program fetching pages.',
  axios: 'A JavaScript program fetching pages.',
  Deno: 'A JavaScript program fetching pages.',
  Bun: 'A JavaScript program fetching pages.',
  Wget: 'A command-line downloader.',
  PowerShell: 'A Windows script fetching a page.',
  Postman: 'A developer tool for testing web addresses.',
  HTTPie: 'A developer tool for testing web addresses.',
  'Unknown program': 'Sent a name nobody recognises.',
  'No user agent': 'Sent no name at all. Every real browser sends one.',
  'No name given': 'Sent no name at all. Every real browser sends one.',
  'Other programs': 'Smaller programs, grouped.',
};
// Labels the Worker sends that the page words differently (core/agg.js agentsMerged swaps them).
export const PROGRAM_SHOWN = { 'No user agent': 'No name given' };
const LANGS = { Java: 'Java', okhttp: 'Java', Scrapy: 'Python', Ruby: 'Ruby', PHP: 'PHP', Perl: 'Perl', Rust: 'Rust', Dart: 'Dart' };
for (const [label, lang] of Object.entries(LANGS)) PROGRAM_INFO[label] = `A program written in ${lang}, fetching pages.`;

export function programBlurb(label) {
  const l = String(label || '');
  if (PROGRAM_INFO[l]) return PROGRAM_INFO[l];
  const m = /^(.*) \(unverified\)$/.exec(l);
  if (m) return `Calls itself ${m[1]}, but Cloudflare couldn't confirm it, so it isn't trusted as one.`;
  return 'A program, not a browser.';
}
export const isKnownProgram = (label) => Object.prototype.hasOwnProperty.call(PROGRAM_INFO, String(label || ''));

// ---------- scanner doors ----------

export const PROBE_FAMILIES = [
  { key: 'wordpress', name: 'WordPress', test: /\/wp-|wordpress|xmlrpc\.php/i,
    hoped: "a WordPress site's setup or login page. On an unfinished WordPress site, whoever reaches the setup page first can take it over.",
    house: "This site isn't WordPress." },
  { key: 'secrets', name: 'Password and settings files', test: /\.env|\.aws|credentials|secrets?\.json|config\.json|service-account\.json|keys\.json|firebase\.json|\.docker|\.npmrc|id_rsa/i,
    hoped: 'a settings file left in public, the kind that often holds passwords or keys.',
    house: "There's no such file here." },
  { key: 'code', name: 'Code history', test: /\.git|\.svn|\.hg\b/i,
    hoped: "the site's code history, which can leak old passwords.",
    house: "There's no code folder here to find." },
  { key: 'php', name: 'Leftover scripts', test: /\.php\b|cgi-bin|shell|phpinfo/i,
    hoped: 'a script left behind on a hacked server, or one with a known hole.',
    house: 'This site has no PHP at all.' },
  { key: 'admin', name: 'Admin and login pages', test: /admin|login|cpanel|phpmyadmin|manager/i,
    hoped: 'a login page to guess passwords at.',
    house: "There's nothing to log in to." },
  { key: 'habit', name: 'Browser habits', test: /^\/(favicon\.ico|apple-touch-icon[\w.-]*\.png)$/i,
    hoped: 'an icon browsers ask for by habit. Not a scanner at all.',
    house: "This site's icon lives at /favicon.svg." },
  { key: 'own', name: "This site's old addresses", test: /^\/(ledger|posts|courses|media|games|presentations|labs)\//i,
    hoped: 'a page of this site that moved or never existed: an old link, or a guess.',
    house: 'A person following a broken link lands here too.' },
  { key: 'other', name: 'Other doors', test: null,
    hoped: "a page that doesn't exist here.",
    house: '' },
];
export function probeFamily(path) {
  const p = String(path || '');
  for (const f of PROBE_FAMILIES) if (f.test && f.test.test(p)) return f;
  return PROBE_FAMILIES[PROBE_FAMILIES.length - 1];
}

// ---------- paths ----------

export const PATH_LABELS = {
  '/': 'The homepage (the tea house)',
  '/ledger/': 'The ledger (list of posts)',
  '/courses/': 'Courses',
  '/projects/': 'Projects',
  '/about/': 'About',
  '/stats/': 'This page',
};

const withSlash = (p) => (p.endsWith('/') || /\.[a-z0-9]+$/i.test(p) ? p : p + '/');

/**
 * A friendly name for a public path. The caller has already checked isPublicPath().
 * @returns {{label:string, kind:'post'|'site'|'course'|'lesson'|'other', id?:string, slug?:string, href:string, date?:string}}
 */
export function pathLabel(path, build) {
  const p = withSlash(String(path || '/'));
  const labels = (build && build.labels) || PATH_LABELS;
  if (labels[p]) return { label: labels[p], kind: 'site', href: p };
  const post = /^\/(?:ledger|posts)\/([^/]+)\/$/.exec(p);
  if (post && build && build.bySlug) {
    let slug = post[1];
    try { slug = decodeURIComponent(slug); } catch (e) { /* keep it raw */ }
    const hit = build.bySlug.get(slug.toLowerCase());
    if (hit) return { label: hit.title, kind: 'post', id: hit.id, slug: hit.slug, href: `/ledger/${hit.slug}/`, date: hit.date };
  }
  const courses = (build && build.courses) || [];
  for (const c of courses) {
    const href = withSlash(c.href);
    if (p === href) return { label: `${c.title} (course)`, kind: 'course', href };
    if (p.startsWith(href + 'lessons/')) return { label: `A lesson of ${c.title}`, kind: 'lesson', href: p };
  }
  return { label: p, kind: 'other', href: p };
}

// ---------- referrers ----------

export const REFERRER_ALLOW = {
  'google.com': 'Google', 'bing.com': 'Bing', 'duckduckgo.com': 'DuckDuckGo', 'search.yahoo.com': 'Yahoo',
  'yandex.ru': 'Yandex', 'ecosia.org': 'Ecosia', 'search.brave.com': 'Brave Search', 'kagi.com': 'Kagi',
  'chatgpt.com': 'ChatGPT', 'chat.openai.com': 'ChatGPT', 'perplexity.ai': 'Perplexity', 'claude.ai': 'Claude',
  'gemini.google.com': 'Gemini', 'copilot.microsoft.com': 'Copilot', 'github.com': 'GitHub',
  'news.ycombinator.com': 'Hacker News', 'reddit.com': 'Reddit', 'old.reddit.com': 'Reddit', 't.co': 'X',
  'x.com': 'X', 'twitter.com': 'X', 'linkedin.com': 'LinkedIn', 'lnkd.in': 'LinkedIn', 'facebook.com': 'Facebook',
  'l.facebook.com': 'Facebook', 'instagram.com': 'Instagram', 'youtube.com': 'YouTube', 'dev.to': 'DEV',
  'bsky.app': 'Bluesky', 'mastodon.social': 'Mastodon', 'discord.com': 'Discord', 'medium.com': 'Medium',
  'substack.com': 'Substack',
};
export const normHost = (host) => String(host || '').trim().toLowerCase().replace(/^www\./, '').replace(/\.$/, '');
/** The friendly name for an allowlisted referrer host, or null. */
export function referrerLabel(host) {
  const h = normHost(host);
  if (!h) return null;
  if (REFERRER_ALLOW[h]) return REFERRER_ALLOW[h];
  if (/^google\.(com?\.)?[a-z]{2,3}$/.test(h)) return 'Google';
  return null;
}

// ---------- filter synonyms (the Questions index) ----------

export const SYNONYMS = {
  google: ['googlebot', 'search', 'google.com'],
  ai: ['chatgpt', 'openai', 'claude', 'anthropic', 'gpt', 'perplexity', 'llm'],
  phone: ['mobile', 'iphone', 'android', 'tablet', 'device'],
  computer: ['desktop', 'laptop'],
  attack: ['scanner'], hack: ['scanner'], hacker: ['scanner'], security: ['scanner'],
  robot: ['bot'], crawler: ['bot'], spider: ['bot'],
  old: ['stale'], outdated: ['stale'], disguise: ['stale'], costume: ['stale'],
  time: ['when'], hour: ['when'], clock: ['when'], night: ['when'],
  fast: ['speed'], speed: ['speed'], slow: ['speed'], load: ['speed'],
  country: ['where'], world: ['where'], map: ['where'], where: ['where'],
  post: ['read'], article: ['read'], read: ['read'], popular: ['read'],
  grow: ['growing'], growth: ['growing'], trend: ['growing'], more: ['growing'], traffic: ['growing'],
  me: ['you'], my: ['you'], i: ['you'], myself: ['you'],
  data: ['data'], bytes: ['data'], bandwidth: ['data'], mb: ['data'], gb: ['data'],
  yesterday: ['latest day'], today: ['latest day'], latest: ['latest day'],
  week: ['7 days'],
  aaron: ['aaron'], owner: ['aaron'], himself: ['aaron'],
};

// ---------- small label sets ----------

export const DEVICE_LABELS = { desktop: 'Computer', mobile: 'Phone', tablet: 'Tablet', other: 'Other' };
export const CONTINENTS = {
  NA: 'North America', SA: 'South America', EU: 'Europe', AF: 'Africa', AS: 'Asia', OC: 'Oceania', AN: 'Antarctica',
};
