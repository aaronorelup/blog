// The site's nav and its links elsewhere. components/chrome/PanelChrome.astro renders both; the homepage overlay
// opens the NAV entries marked overlay (scripts/home/overlay/routes.js). A key is also the view's name
// (data-active-view).
export const NAV = [
  { key: 'stats', href: '/stats', label: 'Stats', overlay: false },
  { key: 'ledger', href: '/ledger', label: 'Ledger', overlay: true },
  { key: 'courses', href: '/courses', label: 'Courses', overlay: true },
  { key: 'projects', href: '/projects', label: 'Projects', overlay: true },
  { key: 'about', href: '/about', label: 'About', overlay: true },
  { key: 'now', href: '/now', label: 'Now', overlay: true },
];

export const SOCIAL = [
  { label: 'GitHub', href: 'https://github.com/aaronorelup' },
  { label: 'DEV', href: 'https://dev.to/aaron_orelup' },
  { label: 'X', href: 'https://x.com/AaronOrelup' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/aaron-orelup/' },
];
