// src/data/taxonomy.js: the only place topic and project names live.
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
  'evening-television': { label: 'I Love My Evening Television', blurb: '…' },
  blackwater:           { label: 'BLACKWATER',                   blurb: '…' },
  'hidden-curriculum':  { label: 'The Hidden Curriculum',        blurb: '…' },
  characters:           { label: 'My characters',                blurb: '…' },
  'oil-paint':          { label: 'Claude paints in oil',         blurb: '…' },
  'llm-monster-hunter': { label: 'LLM Monster Hunter',           blurb: '…' },
  origin:               { label: 'How I got here',               blurb: '…' },
};
export const TOPIC_KEYS = Object.keys(TOPICS);
export const PROJECT_KEYS = Object.keys(PROJECTS);
// v1 series → v2 project, for posts not yet rewritten. W4 deletes this.
export const SERIES_TO_PROJECT = { origin: 'origin', 'llm-monster-hunter': 'llm-monster-hunter',
  blackwater: 'blackwater', 'hidden-curriculum': 'hidden-curriculum', 'oil-paint': 'oil-paint',
  characters: 'characters', 'evening-television': 'evening-television', introspection: 'evening-television' };
