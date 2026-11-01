// Public keys the pages carry (never secrets). Ask's Turnstile widget "aaronorelup.com Ask Goobie" (managed,
// aaronorelup.com only; scripts/lib/cfapi.mjs makes it), and Cloudflare's always-pass test site key, which pages
// served anywhere else use (localhost, wrangler dev, the e2e runs) with .dev.vars's always-pass test secret.
export const TURNSTILE_SITE_KEY = '0x4AAAAAAFutcJmJVFfZXaN5';
export const TURNSTILE_TEST_SITE_KEY = '1x00000000000000000000AA';
