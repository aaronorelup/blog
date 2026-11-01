// UTC date formats. Frontmatter dates are bare YYYY-MM-DD, which coerce to UTC midnight; without pinning
// the zone, a build west of UTC prints them a day early.
const short = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric', timeZone: 'UTC' });
const day = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const month = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

export const shortDate = (d) => short.format(d);              // "Oct 11, 2026"
export const dayOf = (d) => day.format(d);                    // "Oct 11" (a ledger row, under its month)
export const monthOf = (d) => month.format(d);                // "October 2026"
export const isoDay = (d) => d.toISOString().slice(0, 10);    // "2026-10-11"
