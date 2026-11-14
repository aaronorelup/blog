/* The twelve projects on the garden path, in the order of the picks (src/data/tea-picks.json: projects/play,
   projects/watch, projects/download, projects/read). Name, line, needs and link are the projects page's own words
   (src/content/projects/<key>.yaml), copied as written. How each one is run is src/data/tea/embeds.js: run 'frame'
   (the game's own page in the window), 'film' (a video in the window, with its controls), or 'link' (the project's own
   link). mb: what a press fetches, said on the button when it is more than 5 MB. pic: the largest picture of the
   project on the site; a 640 px one is shown at its own size, never stretched. */
export const SHELVES = [
  { key: 'play', title: 'Play it here' },
  { key: 'watch', title: 'Watch' },
  { key: 'download', title: 'Download it' },
  { key: 'read', title: 'Read about it' },
];

export const TOTAL = 41;                      // every project on /projects/ (src/content/projects/*.yaml)

export const PROJECTS = [
  {
    key: 'blackwater', shelf: 'play', name: 'BLACKWATER',
    line: 'Zombies, but you’re cave diving in a flooded 1968 navy site. Built in a weekend, and every sound, voice and song came from ElevenLabs.',
    needs: 'Desktop browser, mouse and keyboard. Phones get a notice instead',
    pic: { src: '/media/projects/blackwater.webp', w: 640, h: 360, alt: 'Diving down a flooded cave shaft with a torch' },
    run: 'link', label: 'Play it', href: 'https://play.aaronorelup.com', note: 'Plays on its own site',
  },
  {
    key: 'grind-and-grimoire', shelf: 'play', name: 'Grind & Grimoire',
    line: 'You’re a skateboarding wizard on Venice Beach with a 2 a.m. open-mic slot and no poem. Made from one prompt in one evening.',
    needs: 'Desktop browser and a keyboard',
    pic: { src: '/media/projects/grind-and-grimoire.webp', w: 640, h: 360, alt: 'The wizard on a skateboard on the boardwalk' },
    run: 'frame', src: '/games/grind-and-grimoire/', mb: 10, label: 'Play', href: '/games/grind-and-grimoire/',
  },
  {
    key: 'storm-bell-fighter', shelf: 'play', name: 'Storm Bell Fighter',
    line: 'A fighting game starring my two characters, Jefrie and BloodTailor. One Claude session and 130 agents built it in 42 hours.',
    needs: 'Desktop browser with a keyboard or gamepad, about 22 MB to load',
    pic: { src: '/media/storm-bell-fighter/poster.webp', w: 1600, h: 900, alt: 'Jefrie and BloodTailor mid-fight, a red slash across the arena' },
    run: 'frame', src: '/games/storm-bell/', mb: 22, label: 'Play', href: '/games/storm-bell/',
  },
  {
    key: 'evening-television', shelf: 'watch', name: 'I Love My Evening Television',
    line: 'Half-hour films made by crews of Claude agents from one prompt each. Each one is a calm programme that turns strange at minute 20.',
    pic: { src: '/media/crimson-coil/film/poster.jpg', w: 1920, h: 1080, alt: 'A painted frame from Episode 1, Crimson Coil: Jefrie and BloodTailor mid-fight' },
    run: 'link', label: 'Watch Episode 1', href: 'https://www.youtube.com/watch?v=7TusXDOgV4Y', note: 'Plays on YouTube',
  },
  {
    key: 'bad-very-bad', shelf: 'watch', name: 'Bad. Very Bad.',
    line: 'A 30-second anime clip: a haggler talks a legendary sword down to 60 gold, then runs home cackling because he lied.',
    pic: { src: '/media/bad-very-bad/making-of/a/poster.webp', w: 1280, h: 720, alt: 'Bad. Very Bad., the first frame of the short' },
    run: 'film', src: '/media/bad-very-bad/making-of/a/final_720p.mp4', mb: 9, label: 'Watch', href: '/ledger/bad-very-bad/',
  },
  {
    key: 'showreel', shelf: 'watch', name: 'Showreel',
    line: 'Thirty seconds of what I’m building, as a 3D scene rendered in Blender, with music from ElevenLabs.',
    pic: { src: '/media/showreel/showreel-v3-poster.webp', w: 1280, h: 720, alt: 'The showreel’s first station, a course for building with AI' },
    run: 'film', src: '/media/showreel/showreel-v3-30.mp4', mb: 8, label: 'Watch', href: '/projects/#proj-reel',
  },
  {
    key: 'clawd-growth-montage', shelf: 'watch', name: 'Clawd, one skill at a time',
    line: 'A 30-second training montage of Claude Code’s little mascot learning new skills. Every frame and every note of music is code.',
    credit: 'Clawd is Anthropic’s mascot. This is a fan piece.',
    pic: { src: '/games/clawd-growth-montage/poster.jpg', w: 1920, h: 1080, alt: 'Clawd on a hilltop in front of a rising sun' },
    run: 'film', src: '/games/clawd-growth-montage/clawd-growth-montage.mp4', mb: 5.4, label: 'Watch', href: '/games/clawd-growth-montage/',
  },
  {
    key: 'claude-playback-lens', shelf: 'download', name: 'Claude Playback Lens',
    line: 'For people who use Claude Code: ask in plain English what your past sessions did and what they cost. It reads the records Claude Code already keeps.',
    needs: 'Claude Code, and Node 20 or later',
    pic: { src: '/media/previews/reading-my-own-agents.webp', w: 640, h: 360, alt: 'A magnifying glass over a pile of rolled-up records' },
    run: 'link', label: 'Get it on GitHub', href: 'https://github.com/aaronorelup/claude-playback-lens',
  },
  {
    key: 'reading-pacer', shelf: 'download', name: 'Reading Pacer',
    line: 'A desktop app that trains you to read faster: an arrow sets the pace, then a short AI quiz checks whether it sank in.',
    needs: 'Windows. Mac and Linux run from source. Quizzes need an AI key or a local model',
    pic: { src: '/media/projects/reading-pacer.webp', w: 640, h: 360, alt: 'Reading Pacer pacing a passage at 300 words a minute' },
    run: 'link', label: 'Download', href: 'https://github.com/aaronorelup/reading-pacer/releases',
  },
  {
    key: 'wordhord', shelf: 'download', name: 'Wordhord',
    line: 'A language-learning app that tracks every word you know and makes fresh reading, listening and chat practice about what you care about. Japanese is done.',
    needs: 'Windows, about 15 minutes to set up, a DeepSeek key (about $1 to $2 a month)',
    pic: { src: '/media/projects/wordhord.webp', w: 640, h: 360, alt: 'A chat lesson in Japanese, with a rewrite card under the message' },
    run: 'link', label: 'Get it on GitHub', href: 'https://github.com/aaronorelup/wordhord',
  },
  {
    key: 'wallpaper-breaker', shelf: 'read', name: 'Wallpaper Breaker',
    line: 'My own animated-wallpaper app for Windows, built so Claude can see and fix every wallpaper it makes. Not released yet.',
    pic: { src: '/media/wallpapers-nobody-saw/pilot-plate.webp', w: 1600, h: 900, alt: 'The pilot wallpaper: Jefrie cooking over a fire in the rain' },
    run: 'link', label: 'Read how it started', href: '/ledger/wallpapers-nobody-saw/',
  },
  {
    key: 'second-brain', shelf: 'read', name: 'The second brain',
    line: 'The notebook my agents read before they do anything for me, with every fact in one place. Rebuilt after the first try went badly.',
    pic: { src: '/media/previews/second-brain-v2.webp', w: 640, h: 360, alt: 'A brain with a stack of notes tucked into it' },
    run: 'link', label: 'Read the write-up', href: '/ledger/second-brain-v2/',
  },
];
