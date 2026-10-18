// The one place chapters get their numbers. A RangeView is everything the page can say about one
// range of days, computed lazily (each field the first time something reads it) and kept, so
// the hero, the machines tabs and the Questions index all read the same figures without merging
// the raw days again. Views are memoised by range key; a range change costs one view.
import * as agg from './agg.js';
import { day as fmtDay } from './fmt.js';

// Define a getter that computes once, then replaces itself with the value.
function lazy(obj, key, fn) {
  Object.defineProperty(obj, key, {
    configurable: true, enumerable: true,
    get() {
      const v = fn();
      Object.defineProperty(obj, key, { value: v, enumerable: true, configurable: true, writable: false });
      return v;
    },
  });
}

function phraseFor(snap, range, days) {
  const all = snap.days.length;
  if (range.kind === 'day' || (range.kind === 'last' && range.n === 1 && days.length === 1)) {
    const d = range.kind === 'day' ? range.d : days[0].d;
    return { long: 'on ' + fmtDay(d, 'long'), short: fmtDay(d, 'short'), eyebrow: fmtDay(d, 'eyebrow') };
  }
  const n = days.length;
  if (n === all && all < 30) {
    return { long: `in the ${n} days gathered so far`, short: `${n} days`, eyebrow: `ALL ${n} DAYS SO FAR` };
  }
  return { long: `in the last ${n} days`, short: `${n} days`, eyebrow: `LAST ${n} DAYS` };
}

export function createViews(snap, build) {
  const cache = new Map();

  function make(rangeIn) {
    const range = agg.clampRange(snap, rangeIn);
    const key = agg.rangeKey(range);
    if (cache.has(key)) return cache.get(key);
    const days = agg.rangeDays(snap, range);
    const v = {
      key, range, days, n: days.length,
      from: days[0]?.d ?? null,
      to: days[days.length - 1]?.d ?? null,
    };
    lazy(v, 'phrase', () => phraseFor(snap, range, days));
    lazy(v, 'pages', () => agg.kindSums(days, 'pages'));
    lazy(v, 'files', () => agg.kindSums(days, 'req'));
    lazy(v, 'bytes', () => agg.kindSums(days, 'bytes'));
    lazy(v, 'people', () => {
      const p = agg.peopleRange(days);
      const t = v.pages.total, n = Math.max(1, days.length);
      return { ...p, loShare: t ? p.lo / t : 0, hiShare: t ? p.hi / t : 0, loPerDay: p.lo / n, hiPerDay: p.hi / n };
    });
    lazy(v, 'machines', () => ({ lo: Math.max(0, v.pages.total - v.people.hi), hi: Math.max(0, v.pages.total - v.people.lo) }));
    lazy(v, 'verdict', () => agg.verdict(v.people.lo, v.people.hi, v.pages.total));
    lazy(v, 'perDay', () => agg.perDay(days));
    lazy(v, 'busiest', () => agg.busiestDay(days, 'pages'));
    lazy(v, 'bots', () => agg.botsMerged(days));
    lazy(v, 'owners', () => agg.ownersMerged(v.bots));
    lazy(v, 'purposes', () => agg.purposeSums(v.bots));
    lazy(v, 'botCountries', () => agg.countryRows(sumMaps(days, (d) => d.botCountries)));
    lazy(v, 'agents', () => agg.agentsMerged(days));
    lazy(v, 'stale', () => agg.staleMerged(days));
    lazy(v, 'probes', () => agg.probesMerged(days, build));
    lazy(v, 'probeStatus', () => agg.countryRows(sumMaps(days, (d) => d.probeStatus)));
    lazy(v, 'probeCountries', () => agg.countryRows(sumMaps(days, (d) => d.probeCountries)));
    lazy(v, 'countries', () => ({
      people: agg.countryRows(sumMaps(days, (d) => d.people.countries)),
      rum: agg.countryRows(sumMaps(days, (d) => (d.rum ? d.rum.countries : null))),
    }));
    lazy(v, 'devices', () => agg.mergeMap(days, (d) => d.people.devices));
    lazy(v, 'browsers', () => agg.mergeMap(days, (d) => d.people.browsers));
    lazy(v, 'os', () => agg.mergeMap(days, (d) => d.people.os));
    lazy(v, 'peopleCoverage', () => {
      const split = v.devices.reduce((s, r) => s + r.n, 0);
      return v.pages.person > 0 ? Math.min(1, split / v.pages.person) : 1;
    });
    lazy(v, 'hoursUTC', () => {
      const out = new Array(24).fill(0);
      for (const d of days) for (let h = 0; h < 24; h++) out[h] += d.people.hours[h];
      return out;
    });
    lazy(v, 'weekdays', () => agg.weekdayMeans(days));
    lazy(v, 'paths', () => agg.pathsPeople(days, build));
    lazy(v, 'rumPaths', () => agg.mergeTop(days, (d) => (d.rum ? d.rum.paths : []), 40).filter((r) => agg.isPublicPath(r.key, build)));
    lazy(v, 'referrers', () => agg.referrersMerged(days));
    lazy(v, 'reads', () => agg.mergeTop(days, (d) => d.reads)
      .map((r) => ({ slug: r.key, n: r.n, post: build?.bySlug?.get(String(r.key).toLowerCase()) }))
      .filter((r) => r.post)); // the reader counter only takes listed posts; this drops any that aren't now
    cache.set(key, v);
    return v;
  }

  return {
    get: (range) => make(range),
    all: () => make({ kind: 'last', n: snap.days.length }),
  };
}

function sumMaps(days, pick) {
  const out = {};
  for (const d of days) {
    const m = pick(d);
    if (!m) continue;
    for (const [k, v] of Object.entries(m)) out[k] = (out[k] || 0) + v;
  }
  return out;
}
