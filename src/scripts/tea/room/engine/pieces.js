// The map of the chapters' set pieces: each a lazy chunk (src/scripts/tea/room/chapters/<id>.js) that exports
// piece(u, n, t, ptr, layout), a pure function to values for the chapter's own elements, and may export mount(root)
// for what a reader presses. boot.js loads a chapter's piece when the reader nears it (with its plates).
export const PIECES = {
  hero: () => import('../chapters/hero.js'),
  start: () => import('../chapters/start.js'),
  tv: () => import('../chapters/tv.js'),
  film: () => import('../chapters/film.js'),
  games: () => import('../chapters/games.js'),
  art: () => import('../chapters/art.js'),
  '3d': () => import('../chapters/3d.js'),
  agents: () => import('../chapters/agents.js'),
  learning: () => import('../chapters/learning.js'),
  site: () => import('../chapters/site.js'),
  projects: () => import('../chapters/projects.js'),
  courses: () => import('../chapters/courses.js'),
  now: () => import('../chapters/now.js'),
  about: () => import('../chapters/about.js'),
};
