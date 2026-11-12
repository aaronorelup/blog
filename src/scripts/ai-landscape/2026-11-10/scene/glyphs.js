// Every symbol the page draws, as stroke paths on a 24 by 24 grid (the fonts hold no symbols, SPEC 3.1).
// Plain data: Glyph.astro prints them as inline SVG at build time, textures.js rasters them for the scene.
// The nine layer glyphs are keyed by layer id, the door glyphs by surface kind.
export const GLYPHS = {
  // the nine layers: a gate, a sound wave, a fork, a loop, a core, a tool, a machine, a paper plane, a spiral
  interface: 'M6 20V10a6 6 0 0 1 12 0v10M4 20h16M12 14v6',
  voice: 'M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4',
  router: 'M3 12h6M9 12c4 0 4-6 8-6h4M9 12c4 0 4 6 8 6h4M9 12h12',
  harness: 'M19.5 12a7.5 7.5 0 1 1-2.7-5.8M19.5 3.5v4.5H15',
  model: 'M12 8.2a3.8 3.8 0 1 0 0 7.6a3.8 3.8 0 0 0 0-7.6M12 2v2.6M12 19.4V22M2 12h2.6M19.4 12H22M4.9 4.9l1.9 1.9M17.2 17.2l1.9 1.9M19.1 4.9l-1.9 1.9M6.8 17.2l-1.9 1.9',
  tools: 'M15 4a4.5 4.5 0 0 0-4.2 6.2L4 17l3 3 6.8-6.8A4.5 4.5 0 0 0 20 9l-3 2.6-2.4-.6-.6-2.4L16.6 6A4.5 4.5 0 0 0 15 4z',
  compute: 'M5 5h14v6H5zM5 13h14v6H5zM8 8h1M8 16h1M12 8h4M12 16h4',
  delegation: 'M3 11l18-7-7 18-3-8zM11 14l10-10',
  memory: 'M12 12a2 2 0 0 1 2-2a4 4 0 0 1 4 4a6 6 0 0 1-6 6a8 8 0 0 1-8-8a10 10 0 0 1 10-10',
  // the doors on floor 1, by the kind of product
  'personal-agent': 'M12 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8M4.5 20.5a7.5 7.5 0 0 1 15 0',
  'chat-app': 'M4 5h16v11H10l-5 4v-4H4z',
  'coding-agent': 'M9 7l-5 5 5 5M15 7l5 5-5 5',
  'task-agent': 'M4 6l2 2 3-3M4 13l2 2 3-3M12 7h8M12 14h8M12 19h8M4 19h4',
  'creative-tool': 'M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z',
  search: 'M10.5 17a6.5 6.5 0 1 0 0-13a6.5 6.5 0 0 0 0 13M15.5 15.5L21 21',
  browser: 'M3 5h18v14H3zM3 9h18M6 7h1M9 7h1',
  // what a cloud computer has: a prompt, a pointer on a screen, a clock (its browser is the window above)
  prompt: 'M4 6l6 6-6 6M12 18h8',
  pointer: 'M3 4h18v13H3zM8 21h8M12 17v4M10 7l1.6 6 1.4-2.2 2.6-.8z',
  clock: 'M12 21a9 9 0 1 0 0-18a9 9 0 0 0 0 18M12 7v5l3.5 2',
  // small signs
  flag: 'M6 21V4M6 5h11l-2.5 3.5L17 12H6',
  question: 'M9 9a3 3 0 1 1 4.4 2.6c-.9.5-1.4 1.2-1.4 2.2v.7M12 18.2v.3',
  back: 'M10 6l-6 6 6 6M4 12h16',
  close: 'M6 6l12 12M18 6L6 18',
  lamp: 'M12 17a5 5 0 1 0 0-10a5 5 0 0 0 0 10',
};

// The layer order, top to bottom. Index + 1 is the floor number printed on the page.
export const LAYER_IDS = ['interface', 'voice', 'router', 'harness', 'model', 'tools', 'compute', 'delegation', 'memory'];
