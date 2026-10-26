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
  'hidden-curriculum': {
    title: 'The Hidden Curriculum',
    blurb: 'The course agents build one lesson a day, and the lessons I sent back.',
  },
  'oil-paint': {
    title: 'Claude paints in oil',
    blurb: "Paintings made stroke by stroke on alice's oil-paint simulator, with no undo.",
  },
  characters: {
    title: 'My characters, made with agents',
    blurb: 'Jefrie in 3D and Echo, built with Blender, TRELLIS.2, ComfyUI and Higgsfield.',
  },
  'the-site': {
    title: 'This website, run by agents',
    blurb: 'How aaronorelup.com is served, deployed, measured and fixed, the outages included.',
  },
  'evening-television': {
    title: 'I Love My Evening Television',
    blurb: 'Thirty-minute films made by crews of agents from one prompt each, calm until minute 20.',
  },
  introspection: {
    title: 'Making Episode 5, Introspection',
    blurb: 'Written from inside the crew while the episode was being made: what was tried, what it found, what failed.',
  },
};
