// The AI landscape's snapshots, newest first. /ai-landscape/ shows the first one and each stays at
// /ai-landscape/<date>/ for good. Read by the page files, the edition list, the sitemap and the unit test.
// Plain data only: this file never imports a component.
export const SNAPSHOTS = [
  { date: '2026-11-10', title: 'AI Landscape', summary: 'Five companies. Nine layers under each.' },
];

// The one switch for whether the AI landscape is listed. false: a preview under the owner's review, reachable only
// by its address. Every page and sources page says noindex and carries ao-secret (so stats-pages.txt, and with it
// /stats, never names it: scripts/build/stats-pages.mjs), the sitemap leaves them out, no project card shows it
// (lib/content.js projects()), and the chrome carries a small Draft label. true lists it: none of those.
// On since 2026-11-25, when the owner said to list it.
export const LISTED = true;
