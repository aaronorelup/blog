// The <title> and description of each page that has no content file, by its address. The page puts them in its head
// (chrome/Head.astro) and its share card is drawn from them (lib/og/pages.js), so the two never differ.
const SITE = 'Aaron Orelup';
const NOW = 'Now + Setup';

export const PAGES = {
  '/': {
    title: `${SITE} · the tea house`,
    description: "Aaron Orelup's tea house. Everything I learn about AI, free for you. You're never more than a month behind.",
  },
  '/ledger/': {
    title: `The Ledger · ${SITE}`,
    description: "A running ledger of what I'm learning about AI: agents, automation and whatever breaks along the way.",
  },
  '/projects/': {
    title: `Projects · ${SITE}`,
    description: 'Everything I’ve made or am making, sorted by what you can do with it: games to play in the browser, apps to download, films to watch, and the private tools behind them.',
  },
  '/about/': {
    title: `About · ${SITE}`,
    description: 'I build things with AI agents to find out where they actually hold up. Most of it is about making learning fun and open to anyone who wants it.',
  },
  '/research/': {
    title: `Research · ${SITE}`,
    description: "Standalone research documents. They're deeper and drier than ledger entries, written to be handed to an agent as much as read by a person.",
  },
  '/now/': {
    title: `${NOW} · ${SITE}`,
    description: "What I'm working on and the setup I do it with. Every update is dated, and the old ones stay below.",
  },
};

// The <title> of /now/<date>/: `day` as shortDate gives it.
export const nowTitle = (day) => `${NOW}, ${day} · ${SITE}`;
