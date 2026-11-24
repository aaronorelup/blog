// What the chapter says and shows. Everything a reader reads is here, so the owner can change a word in one place.

// The four posts he picked for this chapter. Title, verdict and line are his own words, from each post's front matter
// (src/content/posts/<slug>.md: title, preview.verdict, the first sentence of preview.takeaway).
export const POSTS = {
  cost: {
    id: 'AO-065', slug: 'what-drives-claude-code-cost', verdict: 'Effort beats model',
    title: 'Seven things I believed about Claude Code costs, checked',
    line: 'On open-ended work the effort setting moved cost 16 to 90 times, far more than switching model did.',
    img: '/media/previews/what-drives-claude-code-cost.webp',
  },
  lie: {
    id: 'AO-066', slug: 'the-planted-lie', verdict: 'All five caught it',
    title: 'Testing whether AI writers catch a planted lie',
    line: 'All five other AI writers flagged the fake fact within 17 minutes, and none of them reused it.',
    img: '/media/previews/the-planted-lie.webp',
  },
  gauntlet: {
    id: 'AO-026', slug: 'sonnet-vs-opus-gauntlet', verdict: 'Half price, same bill',
    title: 'Claude Sonnet vs Opus at every effort level, on three long jobs',
    line: 'Sonnet 5.5 cost $249 to Opus 5.5’s $255 over three long tests.',
    img: '/media/previews/sonnet-vs-opus-gauntlet.webp',
  },
  clock: {
    id: 'AO-068', slug: 'the-clock-nobody-checked', verdict: 'Its own guesses drifted',
    title: 'How my overnight crew of AI agents kept track of itself',
    line: 'The lead agent guessed the time for hours, up to 22 minutes off, and the crew’s usage estimate ran 4 to 6 times low.',
    img: '/media/previews/a-meter-and-a-mailroom.webp',
  },
};

// DRAFT, the owner's to rewrite: the chapter's name and one line under it.
export const LEAD = {
  kicker: 'The tea room · a test',
  word: ['Working with', 'AI agents'],
  say: 'Out of the evening and into the terminal. Each way of running agents is a small scene out on the glass.',
};

// DRAFT, the owner's to rewrite: one short plain label under each scene, naming the way of working.
export const LABELS = {
  helper: { name: 'One helper at a time', line: 'One job goes out, one answer comes back.' },
  fanout: { name: 'A fan-out', line: 'Many small workers at once, each with one small piece.' },
  pipeline: { name: 'A pipeline', line: 'One card down a line, each hand adding one fold.' },
  orchestrator: { name: 'An orchestrator and its workers', line: 'One plans and hands out the work. The small ones do it.' },
  writers: { name: 'A writers’ room, in parallel', line: 'Six write side by side, then read each other.' },
  wall: { name: 'One job, ten sessions', line: 'A 30-second music video with no rules: two models, five effort levels.' },
  watcher: { name: 'The watcher', line: 'Does none of the work. Only watches.' },
};

// The ten music videos of the gauntlet post, as its own table names them (session, title, time, cost). loop is the
// small silent loop cut for this page (/media/tea/agents/<loop>.mp4); full is the post's own video, whose sound plays
// when the reader has turned the sound on. row 0 is the upper row of the wall, level 0 to 4 is Low to Max.
const MV = '/gauntlet/music-video/';
export const WALL = [
  { model: 'Opus 5.5', effort: 'Low', level: 0, row: 0, title: 'Lantern Tide', time: '9 min', cost: '$0.50', loop: 'lantern-tide', full: MV + 'opus-5-5-low.mp4' },
  { model: 'Opus 5.5', effort: 'Medium', level: 1, row: 0, title: 'Last Tram to the Moon', time: '56 min', cost: '$3.33', loop: 'last-tram-to-the-moon', full: MV + 'opus-5-5-medium.mp4' },
  { model: 'Opus 5.5', effort: 'High', level: 2, row: 0, title: 'Paper Lantern', time: '62 min', cost: '$3.59', loop: 'paper-lantern', full: MV + 'opus-5-5-high.mp4' },
  { model: 'Opus 5.5', effort: 'XHigh', level: 3, row: 0, title: 'Neon Koi', time: '1 h 41 min', cost: '$14.72', loop: 'neon-koi', full: MV + 'opus-5-5-xhigh.mp4' },
  { model: 'Opus 5.5', effort: 'Max', level: 4, row: 0, title: 'The Terrible Snail', time: '1 h 34 min', cost: '$20.11', loop: 'the-terrible-snail', full: MV + 'opus-5-5-max.mp4' },
  { model: 'Sonnet 5.5', effort: 'Low', level: 0, row: 1, title: 'Night Drive', time: '6 min', cost: '$0.27', loop: 'night-drive', full: MV + 'sonnet-5-5-low.mp4' },
  { model: 'Sonnet 5.5', effort: 'Medium', level: 1, row: 1, title: 'Moth Song', time: '10 min', cost: '$0.60', loop: 'moth-song', full: MV + 'sonnet-5-5-medium.mp4' },
  { model: 'Sonnet 5.5', effort: 'High', level: 2, row: 1, title: 'Night Shift', time: '58 min', cost: '$2.22', loop: 'night-shift', full: MV + 'sonnet-5-5-high.mp4' },
  { model: 'Sonnet 5.5', effort: 'XHigh', level: 3, row: 1, title: 'Light Load', time: '1 h 34 min', cost: '$9.73', loop: 'light-load', full: MV + 'sonnet-5-5-xhigh.mp4' },
  { model: 'Sonnet 5.5', effort: 'Max', level: 4, row: 1, title: 'All at Once', time: '1 h 45 min', cost: '$24.38', loop: 'all-at-once', full: MV + 'sonnet-5-5-max.mp4' },
];
export const LOOP_AT = '/media/tea/agents/';
// The paper animal beside each screen: its fold says the effort (more folds, more effort), its paper says the model.
export const FOLD_OF_LEVEL = ['boat', 'fan', 'fox', 'star', 'crane'];
// DRAFT: the words of the wall's small key and of the sound switch.
export const WALL_WORDS = {
  key: ['Cream paper: Opus 5.5', 'Blue paper: Sonnet 5.5', 'More folds: more effort, a boat at Low to a crane at Max'],
  soundSay: 'Each video has its own song. The sound stays off until you turn it on.',
  soundOff: 'Sound off', soundOn: 'Sound on',
  pickSay: 'Point at a screen, or tap it, to hear that one.',
};

// DRAFT: the log that lies on the glass. Written for this page from the four posts' own public numbers; not the
// film's log. Each block is a few lines of monospace.
export const LOG = [
  ['• start_helper("check seven things I believed about cost")', '  └ helper started', '• read 510 sessions, 16 weeks', '  └ re-reading the conversation: 52% of the cost'],
  ['• effort  low → max', '  └ cost ×16 to ×90', '• switch model, same effort', '  └ cost ×0.18 to ×1.42'],
  ['• start_helper ×49', '  └ one shared 5-hour limit', '• read the meter', '  └ 51%   reset 05:20'],
  ['• six writers, one room', '  └ "one claim in her pitch looks invented"', '  └ flagged by all five, in 17 minutes', '• nobody reused it'],
  ['• one job, ten sessions', '  └ a 30-second music video, no rules', '  └ low   6 min   $0.27', '  └ max   1 h 45 min   $24.38'],
  ['• the lead agent guessed the time', '  └ up to 22 minutes off', '• usage estimate', '  └ 4 to 6 times low'],
  ['• fold(card)', '  └ passed down the line', '• fold(card)', '  └ passed down the line', '• fold(card)  done'],
  ['• watch feed 3', '  └ nothing unusual', '• watch feed 3', '  └ nothing unusual'],
];
// The yellow note on the watcher's monitor, as the course's lore page words it.
export const STICKY = ['watch feed 3', 'flag anything', 'unusual'];
