// Every dynamic import goes through lazy(load, fallbackUrl). After a deploy an open tab's old hashed chunks are gone
// (Workers static assets serve only the new version), so a rejected import is version skew: with a fallbackUrl (the
// overlay passes the post's real page) it navigates there; otherwise it reloads the page, once per session.
export function lazy(load, fallbackUrl) {
  return load().catch((e) => {
    if (fallbackUrl) location.assign(fallbackUrl);
    else if (!sessionStorage.getItem('ao-reloaded')) { sessionStorage.setItem('ao-reloaded', '1'); location.reload(); }
    throw e;
  });
}
