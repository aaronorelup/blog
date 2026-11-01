// The small line drawings, 16 by 16, stroked in currentColor: a topic's glyph (src/data/taxonomy.js names it) where a
// post has no icon file, and the search box's lens. Read by components/chrome/Glyph.astro and, for rows the browser
// draws, by src/scripts/cards/render.js.
export const GLYPHS = {
  film: 'M2.5 3.5h11v9h-11zM5 3.5v9M11 3.5v9M2.5 6h2.5M2.5 10h2.5M11 6h2.5M11 10h2.5',
  brush: 'M13.5 2.5 7.5 8.5M7.5 8.5l1.5 1.5M9 10c-.5 2-2.5 3.5-6.5 3.5 1-1.2.8-2.6 1.6-3.6 1-1.2 2.6-1.4 3.4-.6',
  cube: 'M8 2 13.5 5v6L8 14 2.5 11V5zM2.5 5 8 8l5.5-3M8 8v6',
  pad: 'M4.5 5h7a3 3 0 0 1 2.9 3.8l-.8 2.9a1.6 1.6 0 0 1-2.8.6L9.5 10h-3l-1.3 2.3a1.6 1.6 0 0 1-2.8-.6l-.8-2.9A3 3 0 0 1 4.5 5zM5 7v2M4 8h2M10.5 7.5h.01M12 8.5h.01',
  agent: 'M4 5.5h8a1.5 1.5 0 0 1 1.5 1.5v4.5A1.5 1.5 0 0 1 12 13H4a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 4 5.5zM8 5.5V3M8 2.5h.01M6 9h.01M10 9h.01M6.5 11h3',
  book: 'M2.5 4c2-.8 3.8-.8 5.5.5 1.7-1.3 3.5-1.3 5.5-.5v8.5c-2-.8-3.8-.8-5.5.5-1.7-1.3-3.5-1.3-5.5-.5zM8 4.5V13',
  house: 'M2.5 7.5 8 3l5.5 4.5M4 6.5v7h8v-7M6.8 13.5v-3.5h2.4v3.5',
  lens: 'M7 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zM10.3 10.3l3.2 3.2',
};
