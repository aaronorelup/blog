// The visitors a reader can drop through the Sieve, and the words for what happens to them.
// Pure (no DOM), so Node can check that each one stops at the right question.
//
// These are made-up but typical requests, not rows from the logs: the page never keeps a
// request, only daily totals. "You" is the one real visitor, built from the reader's own
// browser by core/browser, on their machine; nothing about it is sent anywhere.
import { readYou, classifyYou, newestMajor, browserAge } from '../core/browser.js';

// Station order: the four questions, then whatever got four noes.
export const GATES = [
  { q: 'badge', kind: 'bot', short: 'Badge?', ask: 'Does Cloudflare vouch for it as a known bot?' },
  { q: 'door', kind: 'scanner', short: 'Wrong door?', ask: "Did the site answer with an error, like 'not found'?" },
  { q: 'program', kind: 'agent', short: 'A program?', ask: 'Does it name a program instead of a browser (curl, Python, a browser run by a script), or give no name at all?' },
  { q: 'old', kind: 'stale', short: 'Old browser?', ask: 'Is its browser more than a year out of date?' },
];

export const COUNTED_AS = {
  bot: 'Counted as a named bot.',
  scanner: 'Counted as a scanner.',
  agent: 'Counted with scripts and agents.',
  stale: 'Counted as an old browser, probably a bot in costume.',
  person: 'Probably a person.',
};

/** @typedef {{key:string, label:string, line1:string, line2:string, answers:boolean[], kind:string,
 *   why:string, counter:boolean|null}} Sample */

// The fixed visitors. `answers` stops at the first yes; `counter` is whether Cloudflare's
// counter would have run in it (only asked of visitors that reach "probably people").
export function samples(through, postPath = '/ledger/') {
  const chrome = newestMajor('chrome', through);
  const ios = browserAge('Safari on iOS 13', through);
  return [
    { key: 'googlebot', label: 'Googlebot', line1: `GET ${postPath}`, line2: 'Googlebot · 200 OK',
      answers: [true], kind: 'bot', counter: null,
      why: 'Cloudflare checked that it really comes from Google, so it wears a badge.' },
    { key: 'chatgpt-user', label: 'ChatGPT-User', line1: `GET ${postPath}`, line2: 'ChatGPT-User · 200 OK',
      answers: [true], kind: 'bot', counter: null,
      why: 'A checked OpenAI bot. It fetches a page right then, because someone asked ChatGPT something.' },
    { key: 'curl', label: 'curl', line1: `GET ${postPath}`, line2: 'curl/8.4 · 200 OK',
      answers: [false, false, true], kind: 'agent', counter: null,
      why: "It names a program, not a browser. Aaron's agents use curl to check that a post went live." },
    { key: 'env', label: 'Something asking for /.env', line1: 'GET /.env', line2: 'Go-http-client · 404 Not Found',
      answers: [false, true], kind: 'scanner', counter: null,
      why: "There's no /.env here, so the site said 'not found'. It's a program too, but the wrong door is asked first, so that's where it stops." },
    { key: 'iphone', label: 'An iPhone on iOS 13', line1: 'GET /', line2: 'Safari on iOS 13 · 200 OK',
      answers: [false, false, false, true], kind: 'stale', counter: null,
      why: `iOS 13 is ${ios ? `${ios.text}, about ${Math.round(ios.yearsOld)} years old` : 'years out of date'}. People do run old phones; not this many, this often.` },
    { key: 'chrome', label: 'Chrome on Windows', line1: `GET ${postPath}`, line2: `Chrome ${chrome} on Windows · 200 OK`,
      answers: [false, false, false, false], kind: 'person', counter: true,
      why: 'A current browser with no badge, no error and no program name. Its page ran Cloudflare\'s counter, so it lands in the solid part of the people range.' },
  ];
}

const BROWSER_WORD = (y) => `${y.browser === 'Other' ? 'a browser' : y.browser}${y.major ? ' ' + y.major : ''} on ${y.os === 'Other' ? 'an unknown system' : y.os}`;

// The reader, as a sample. `counterRan` is whether Cloudflare's counter script loaded on this
// page in this browser (null when it can't be told).
export function youSample(through, counterRan = null, nav) {
  const you = readYou(nav);
  const res = classifyYou(you, through);
  const order = ['badge', 'door', 'program', 'old'];
  const answers = [];
  for (const q of order) {
    const step = res.steps.find((s) => s.q === q);
    const yes = !!(step && step.yes);
    answers.push(yes);
    if (yes) break;
  }
  return {
    key: 'you', label: 'You', you, res,
    line1: 'GET /stats',
    line2: `${you.browser === 'Other' ? 'Your browser' : you.browser}${you.major ? ' ' + you.major : ''} on ${you.os} · 200 OK`,
    answers, kind: res.kind, counter: res.kind === 'person' ? counterRan : null,
    why: youWhy(you, res),
  };
}

// The same verdict the hero's "Am I in here?" card gives, in the same words.
export function youWhy(you, res) {
  const said = `Your browser says it's ${BROWSER_WORD(you)}.`;
  // The old-browser answer and a yes to "a program?" carry their reason ("141 is about current").
  const steps = res.steps.map((s) => {
    const g = GATES.find((x) => x.q === s.q);
    const why = (s.q === 'old' || (s.q === 'program' && s.yes)) && s.why ? ': ' + s.why : '';
    return `${g ? g.short : s.q} ${s.yes ? 'yes' : 'no'}${why}.`;
  }).join(' ');
  const verdict = res.kind === 'agent' ? "You'd be counted with scripts and agents."
    : res.kind === 'stale' ? "You'd land on the costume rack, which is where bots in disguise go. Time to update?"
      : "You'd be counted as probably a person.";
  return `${said} At the gate: ${steps} ${verdict} Today's visit shows up in tomorrow's filing, and this page never knows which dot is you. Nothing was sent anywhere; your browser read its own name.`;
}

// "Googlebot: Badge? yes. Counted as a named bot." — what the live region says after a drop.
export function resultSentence(sample) {
  const asked = sample.answers.map((yes, i) => `${GATES[i].short} ${yes ? 'yes' : 'no'}.`).join(' ');
  const counter = sample.kind === 'person' && sample.counter != null
    ? (sample.counter ? " Cloudflare's counter ran in it." : " Cloudflare's counter didn't run in it.")
    : '';
  return `${sample.label}: ${asked} ${COUNTED_AS[sample.kind] || COUNTED_AS.person}${counter}`;
}

// Index of the question that decided it, or -1 for four noes.
export const decidedAt = (sample) => sample.answers.indexOf(true);
