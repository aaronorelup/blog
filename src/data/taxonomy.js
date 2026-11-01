// The only place topic and project names live. Posts name one topic and any of the projects
// (src/schemas/post.ts); the ledger chips, cards and RSS categories read the labels from here.
export const TOPICS = {
  video:    { label: 'AI video & film',           glyph: 'film'  },
  art:      { label: 'AI art & images',           glyph: 'brush' },
  '3d':     { label: '3D & animation',            glyph: 'cube'  },
  games:    { label: 'Games',                     glyph: 'pad'   },
  agents:   { label: 'Working with AI agents',    glyph: 'agent' },
  learning: { label: 'Learning to build with AI', glyph: 'book'  },
  site:     { label: 'This website',              glyph: 'house' },
};
export const PROJECTS = {
  'evening-television': { label: 'I Love My Evening Television', blurb: 'Thirty-minute films made by crews of agents from one prompt each, calm until minute 20.' },
  blackwater:           { label: 'BLACKWATER',                   blurb: 'The cave-diving zombies game, its agent-built sequel, and its music video.' },
  'hidden-curriculum':  { label: 'The Hidden Curriculum',        blurb: 'The course agents build one lesson a day, and the lessons I sent back.' },
  characters:           { label: 'My characters',                blurb: 'Jefrie in 3D and Echo, built with Blender, TRELLIS.2, ComfyUI and Higgsfield.' },
  'oil-paint':          { label: 'Claude paints in oil',         blurb: "Paintings made stroke by stroke on alice's oil-paint simulator, with no undo." },
  'llm-monster-hunter': { label: 'LLM Monster Hunter',           blurb: 'The first real project: built by hand in 2025, stalled, then played by an agent.' },
  origin:               { label: 'How I got here',               blurb: 'From Excel cells in May 2025 to running agents, told in order.' },
};
export const TOPIC_KEYS = Object.keys(TOPICS);
export const PROJECT_KEYS = Object.keys(PROJECTS);

// v1 series → v2 project, for posts not yet rewritten. W4 deletes this. agent-runs and the-site
// map to no project on purpose: those posts are found by topic.
export const SERIES_TO_PROJECT = {
  origin: 'origin', 'llm-monster-hunter': 'llm-monster-hunter', blackwater: 'blackwater',
  'hidden-curriculum': 'hidden-curriculum', 'oil-paint': 'oil-paint', characters: 'characters',
  'evening-television': 'evening-television', introspection: 'evening-television',
};
