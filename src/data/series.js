// Threads that run through the ledger. A post joins one by listing the key in its
// frontmatter (`series: ["blackwater"]`); PostView prints every post in that thread, in ledger
// order, at the foot of the article, so a reader who lands on part three can find part one.
// A key a post names that isn't here fails the build instead of rendering nothing.
export const SERIES = {
  origin: {
    title: 'How I got here',
    blurb: 'From Excel cells in May 2025 to running agents, told in order.',
  },
  'llm-monster-hunter': {
    title: 'LLM Monster Hunter',
    blurb: 'The first real project: built by hand in 2025, stalled, then played by an agent.',
  },
  blackwater: {
    title: 'BLACKWATER',
    blurb: 'The cave-diving zombies game, its agent-built sequel, and its music video.',
  },
  'agent-runs': {
    title: 'Long agent runs, and reading what they did',
    blurb: 'Overnight runs with dozens of agents, and what the transcripts showed afterwards.',
  },
  characters: {
    title: 'My characters, made with agents',
    blurb: 'Jefrie in 3D and Echo, built with Blender, TRELLIS.2, ComfyUI and Higgsfield.',
  },
};
