// Every dynamic import goes through lazy(load, fallbackUrl). After a deploy an open tab's old hashed chunks are gone
// (Workers static assets serve only the new version), so a rejected import is version skew: with a fallbackUrl (the
// overlay passes the post's real page) it navigates there; otherwise it reloads the page, once per session.

// A page that is leaving on purpose (the leaves door) abandons its loads, and WebKit rejects them: that is not version
// skew, so nothing navigates or reloads over the way out. Back to the page (pageshow) clears it.
let away = false;
export const isLeaving = () => away;
export function leaving() {
  away = true;
  addEventListener('pageshow', () => { away = false; }, { once: true });
}

export function lazy(load, fallbackUrl) {
  return load().catch((e) => {
    if (away) throw e;
    if (fallbackUrl) location.assign(fallbackUrl);
    else if (!sessionStorage.getItem('ao-reloaded')) { sessionStorage.setItem('ao-reloaded', '1'); location.reload(); }
    throw e;
  });
}
