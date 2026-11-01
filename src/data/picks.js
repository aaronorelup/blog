// src/data/picks.js: curated, ordered decisions. One file, so 72 parallel post rewrites never race on them.
// T0.2 creates it; T2.2 owns the START_HERE line and T2.5 the REEL line.
export const START_HERE = [];   // T2.2 fills it with 5 listed slugs; once it is not empty the checker requires 5
export const REEL = { src: '/media/showreel/showreel-v3-30.mp4', poster: '/media/showreel/showreel-v3-poster.webp',
                      short: '/media/showreel/showreel-v3-15.mp4' };
