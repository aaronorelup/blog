// Terms that must never be published (the employer, a private program, private and easter-egg links), matched
// without naming them: src/data/never-publish.json holds sha256(SALT + term), made by scripts/tools/never-publish-
// hash.mjs from the private list in the agent kit. Words match case-sensitively as whole tokens, alone or in runs of
// 2 or 3; anything shaped like a host or URL also offers its host, parent domains and host + path prefixes.
import crypto from 'node:crypto';
import { liner } from './text.mjs';

export const SALT = 'aaronorelup.com never-publish v1\n';
export const hash = (key) => crypto.hash('sha256', SALT + key);

const WORD = /[\p{L}\p{N}_]+/gu;
const URLISH = /(?:https?:\/\/)?((?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,})((?:\/[^\s"'`<>()[\]{}|*,]*)?)/g;

const segmentsOf = (pathPart) => pathPart.split('/').filter(Boolean).map((s) => s.replace(/[.:;!?]+$/, ''));

// A URL's keys: each domain of its host from the full host up (lower case), and each with its leading path segments.
function urlKeys(host, pathPart) {
  const labels = host.toLowerCase().split('.');
  const segments = segmentsOf(pathPart);
  const keys = [];
  for (let i = 0; i <= labels.length - 2; i++) {
    const domain = labels.slice(i).join('.');
    keys.push(domain, ...segments.map((_, j) => [domain, ...segments.slice(0, j + 1)].join('/')));
  }
  return keys;
}

// [key, index] for everything in the text a term could be.
export function* keys(text) {
  const words = [...text.matchAll(WORD)];
  for (let i = 0; i < words.length; i++) {
    yield [words[i][0], words[i].index];
    if (i + 1 < words.length) yield [`${words[i][0]} ${words[i + 1][0]}`, words[i].index];
    if (i + 2 < words.length) yield [`${words[i][0]} ${words[i + 1][0]} ${words[i + 2][0]}`, words[i].index];
  }
  for (const m of text.matchAll(URLISH)) for (const key of urlKeys(m[1], m[2])) yield [key, m.index];
}

// The key a line of the private list is stored under: a host or URL as its host (lower case) and path, else its
// 1 to 3 words joined by single spaces. null for a line that can't be matched.
export function termKey(line) {
  const url = /^(?:https?:\/\/)?((?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,})(\/\S*)?$/.exec(line);
  if (url) return [url[1].toLowerCase(), ...segmentsOf(url[2] ?? '')].join('/');
  const words = line.match(WORD) ?? [];
  return words.length >= 1 && words.length <= 3 ? words.join(' ') : null;
}

const scope = (repo) => [
  ...repo.posts, ...repo.notes, ...repo.projects,
  ...repo.list('src/components/about'),
  ...repo.list('src/data', (f) => /^src\/data\/[^/]+\.js$/.test(f)),
].map((e) => (typeof e === 'string' ? { file: e, raw: repo.read(e) } : e));

export default function neverPublish(repo, report) {
  const hashes = new Set(JSON.parse(repo.read('src/data/never-publish.json')));
  const known = new Map();
  for (const { file, raw } of scope(repo)) {
    const seen = new Set();
    const line = liner(raw);
    for (const [key, index] of keys(raw)) {
      if (!known.has(key)) known.set(key, hashes.has(hash(key)));
      if (!known.get(key) || seen.has(key)) continue;
      seen.add(key);
      report(file, line(index), `"${key}" is on the never-publish list (WRITING.md, "Never publish")`, 'deploy');
    }
  }
}
