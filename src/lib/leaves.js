// The leaves room's build-time data (src/pages/leaves/index.astro), pure: one leaf per listed entry, the id of the
// entry not written yet, and how much color each leaf has left to give. Tested headless (tests/unit/leaves.test.mjs).
import { isLive } from '../data/exempt.js';
import { isListed } from './posts.js';

const DAY = 86_400_000;
// A live notebook (AO-073) is counted, never read: its body stays with the sessions that write it.
export const LIVE_WORDS = 1200;
// Within a month an entry is "this month's".
export const RECENT_DAYS = 31;

const isoDay = (d) => new Date(d).toISOString().slice(0, 10);
const ageDays = (date, buildDate) => Math.max(0, (new Date(buildDate) - new Date(date)) / DAY);

// [{ id, title, date, words }] oldest first, listed entries only. wordsOf(post) is asked for every entry but a
// live notebook, whose words are LIVE_WORDS.
export async function leafData(posts, buildDate, wordsOf) {
  const listed = posts.filter((p) => isListed(p.data));
  const rows = [];
  for (const p of listed) {
    const live = isLive(p.data.id) || isLive(p.id);
    const words = live ? LIVE_WORDS : Math.max(0, Math.round(Number(await wordsOf(p)) || 0));
    rows.push({ id: p.data.id, title: p.data.title, date: isoDay(p.data.date), words });
  }
  const num = (id) => Number(/(\d+)$/.exec(id)?.[1] ?? 0);
  return rows.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : num(a.id) - num(b.id)));
}

// The id `npm run new-post` would give next (scripts/tools/new-post.mjs): one past the highest AO-### filed.
export function nextId(ids) {
  const last = Math.max(0, ...ids.map((id) => Number(/^AO-(\d+)$/.exec(id ?? '')?.[1] ?? 0)));
  return `AO-${String(last + 1).padStart(3, '0')}`;
}

// The color a leaf still holds: it halves every month.
export const extract = (days) => 2 ** (-days / 30.44);

// The share of all the color that comes from leaves under a month old, and how many of them there are.
export function colorTally(leaves, buildDate) {
  let total = 0, fresh = 0, recent = 0;
  for (const l of leaves) {
    const days = ageDays(l.date, buildDate);
    const e = extract(days);
    total += e;
    if (days < RECENT_DAYS) { fresh += e; recent++; }
  }
  return { share: total ? fresh / total : 0, recent };
}

export { ageDays };
