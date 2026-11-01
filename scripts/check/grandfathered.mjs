// The files code.mjs skips, by exact path or folder (/**). KEEP is for good: pages and data other people write, and
// the /stats internals. UNTIL lists files a planned task splits or deletes; that task deletes its line, and
// code.mjs flags a line whose files are gone or clean. Nothing is ever added to UNTIL.
export const KEEP = [
  'src/pages/courses/**', 'src/pages/research/**', 'src/components/lore/**', 'src/styles/lore.css',
  'src/pages/stats.astro', 'src/scripts/stats/**', 'src/styles/stats/**', 'worker/stats/**',
];

export const UNTIL = {};

export const covers = (pattern, file) => (pattern.endsWith('/**') ? file.startsWith(pattern.slice(0, -2)) : file === pattern);
