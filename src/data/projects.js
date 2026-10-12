// Projects, hand-maintained — carried over from the homepage design.
// Add an object to add a project. `shot` is a screenshot path, or null: the card is
// designed for the missing state. `tier: "flagship"` puts it in the long-form section.
//
// Flagships run on your own machine, so their `href` IS the repo. The browser-playable
// ones put the play link in `href` and the source in `repo`. A flagship used somewhere else
// (on this site, say) sets `cta: { label, href, ledger? }` for its button, then either `repo`
// (a link to its public repo under the button, worded by `repoLabel`) or `noRepo` (the note
// under it when there is no public repo, and none coming); `ledger` makes the button open the
// post in the homepage panel's reader.
import hiddenCurriculum from './courses/the-hidden-curriculum.json';
import { courseCounts } from './courses.js';

// lessons of the course, not rows of its data: legacy lessons kept from before a rebuild are counted
// apart. Data from before the rebuild has no legacy rows: then the card says nothing about the rebuild
// (this file may deploy before the data does).
const hc = courseCounts(hiddenCurriculum);
const hcRebuilt = hc.legacy > 0;

export const PROJECTS = [
  {
    name: 'Wallpaper Breaker',
    tagline: 'a Windows live-wallpaper app built so Claude can see what it makes',
    blurb: "My own Windows 11 live-wallpaper app. I started it after agents spent a night building sixteen Wallpaper Engine scenes of my characters, and not one of them ever saw a wallpaper run. Rule one: Claude can render, look at and fix every wallpaper it makes, and I can compare, edit and remix every version.",
    year: 2026,
    status: 'building',
    tier: 'flagship',
    tags: ['.NET 10', 'TypeScript', 'WebGL2', 'three.js', 'WebView2'],
    highlights: [
      ['Made to be seen', 'A headless renderer draws any wallpaper version on the real GPU so Claude can look at it, which means nothing ships unseen.'],
      ['Your scripts, on your desktop', 'Buttons, hotkeys and live values on a wallpaper run your own scripts, with your own permissions. Scripts never travel with a wallpaper.'],
      ['Every version kept', 'Layers, effects, puppet rigs and 3D scenes, with versions and notes side by side in the Studio for comparing and remixing.']
    ],
    runsOn: 'Windows 11 · multi-monitor · not released yet',
    shot: '/media/wallpaper-breaker/card.webp',
    shotLabel: 'The pilot wallpaper: Jefrie cooking in the rain',
    cta: { label: 'READ HOW IT STARTED →', href: '/ledger/wallpapers-nobody-saw/', ledger: 'wallpapers-nobody-saw' },
    noRepo: 'Closed source · will be a paid app · no public repo',
    post: null
  },
  {
    name: 'The Hidden Curriculum',
    tagline: 'a course on what nobody teaches people who build with AI',
    blurb: "Anyone can build almost anything with AI now; what stops people is small gaps nobody teaches, and they move every week. Short narrated lessons, each one a single mental model: where the agent works, what its “done” is worth, which keys are public, what runs while you're away. Every lesson is drawn in code and made by a crew of agents.",
    year: 2026,
    status: hcRebuilt ? `${hc.out} of ${hc.lessons} new lessons out · ${hc.legacy} legacy` : `${hc.out} of ${hc.lessons} lessons out`,
    tier: 'flagship',
    tags: ['course', 'canvas animation', 'ElevenLabs', 'multi-agent'],
    highlights: [
      hcRebuilt
        ? ['Built on sources', 'Curriculum rebuilt on 2026-10-12 from 251 dated sources; every new lesson credits the ones it is built on, by name.']
        : ['Built on sources', 'The curriculum is being rebuilt from 251 dated sources; every new lesson will credit the ones it is built on, by name.'],
      ['Written three ways, then checked', 'Three competing scripts, a judge, four fact-checkers, a speech-to-text pass on the narration, and reviewers on every scene.'],
      ['A community project', 'Anyone can open an issue with what they wish they had known; the map is rebuilt as the gaps move.']
    ],
    runsOn: 'In the browser · captions, chapters, transcript and MP4 for every lesson',
    // the painted plate: card-tile.webp still shows the old 00.01 title card and its retired topics
    shot: '/courses/the-hidden-curriculum/engine/assets/teahouse-night.jpg',
    shotLabel: 'The course’s painted backdrop',
    cta: { label: 'OPEN THE COURSE →', href: '/courses/the-hidden-curriculum/' },
    repo: 'https://github.com/aaronorelup/The-Hidden-Curriculum',
    repoLabel: 'The course on GitHub ↗',
    post: null
  },
  {
    name: 'Wordhord',
    tagline: 'a local-first AI language-learning platform',
    blurb: 'A per-word, per-skill, evidence-based map of what you actually know — and the classic techniques (graded reading, shadowing, cloze, Pimsleur-style audio) generated fresh against it, about things you actually care about. Japanese is fully built; Korean, German and Spanish generate their own materials on first start.',
    href: 'https://github.com/Bloodtailor/wordhord',
    external: true,
    year: 2026,
    status: 'building',
    tier: 'flagship',
    tags: ['Python', 'DeepSeek', 'ElevenLabs', 'FSRS', 'local-first'],
    highlights: [
      ['The Chat', 'A teacher that remembers you and never interrupts. Every message earns a rewrite card — mistakes get fixed, clean messages get one reachable step above your level.'],
      ['The Hoard', 'Every word you master, with receipts: tap any word, anywhere, ever, and see what the app believes about it and why.'],
      ['Honest about failure', 'Where a capability failed its audit — pitch accent at 60% cross-model agreement against a 95% bar — the room says so instead of shipping unverified data.']
    ],
    runsOn: 'Runs on your machine · your keys · no cloud, no account, no telemetry',
    shot: '/media/wordhord/card.webp',
    shotLabel: 'The chat, mid-lesson',
    post: null
  },
  {
    name: 'LLM Monster Hunter',
    tagline: 'every monster written, painted, and refereed at play time',
    blurb: 'The archetypal creature-catching adventure, except no creature exists before you meet it. The code only manages context and stores data — the AI does the storytelling, the balancing, and the refereeing. Where most games ship gigabytes of assets, this one ships two API keys.',
    href: 'https://github.com/Bloodtailor/LlmMonsterHunter',
    external: true,
    year: 2026,
    status: 'playable, all core mechanics in',
    tier: 'flagship',
    tags: ['Python', 'Flask', 'React', 'DeepSeek', 'Gemini', 'SSE'],
    highlights: [
      ['Word ladders, not HP', 'The one rule the whole architecture obeys: the LLM only ever picks words, Python owns every number. Combat state is a position on a ladder from fresh to incapacitated.'],
      ['Monsters that remember', 'Battles, conversations, defeats and journeys persist across runs — a monster you beat can come back hostile, friendly, or wary, and evolution repaints use the old art as reference so it stays recognizably itself.'],
      ['You can just say things', 'Type a free-text action in battle and the referee decides whether it is possible. Recruitment is negotiation: monsters join by their own will, or talk, plead, and flee on their own turns.']
    ],
    runsOn: 'Windows 10/11 · one double-click setup · bring a DeepSeek key',
    shot: '/media/llm-monster-hunter/card.webp',
    shotLabel: 'Monsters painted at play time',
    post: null
  },
  {
    name: 'Armies of Gielinor',
    tagline: 'a game that died in 2018, rebuilt from screenshots',
    blurb: 'Jagex shipped this turn-based strategy game on FunOrb; FunOrb died in 2018 and took it with it, leaving wiki pages and a handful of screenshots. Claude rebuilt it from those — every sprite and sound generated fresh, no original assets. It ships with an in-browser content editor: click anything in a running match and you are editing that exact thing. A fan tribute, not affiliated with Jagex.',
    href: '/games/armies-of-gielinor/',
    external: false,
    year: 2026,
    status: 'playable',
    tags: ['gamedev', 'agents', 'gauntlet loop', 'content editor'],
    repo: 'https://github.com/Bloodtailor/armies-of-gielinor',
    post: 'armies-of-gielinor-gauntlet',
    shot: '/media/armies-of-gielinor/card.webp',
    shotLabel: 'The recreation, mid-match'
  },
  {
    name: 'BLACKWATER',
    tagline: 'cave-diving zombies, built in a weekend',
    blurb: 'Black Ops zombies, except you are cave diving. Procedural cave graph, a full in-game level editor, and 58 commits across four days. All audio — sound design, voice lines, music — came out of the ElevenLabs API.',
    href: 'https://play.aaronorelup.com',
    external: true,
    year: 2026,
    status: 'proof of concept',
    tags: ['Three.js', 'gamedev', 'ElevenLabs', 'level editor'],
    repo: 'https://github.com/Bloodtailor/blackwater',
    post: 'blackwater-weekend',
    shot: '/media/blackwater/card.webp',
    shotLabel: 'Descending the flooded site'
  },
  {
    name: 'Grind & Grimoire',
    tagline: 'a Venice Beach wizard story',
    blurb: 'A skateboarding wizard with a 2 AM open-mic slot and no poem written. Grind anything with an edge, fireball the fiends, buy drip for compliments that inflate an EGO stat your wizard resents. One prompt, one evening, everything procedural.',
    href: '/games/grind-and-grimoire/',
    external: false,
    year: 2026,
    status: 'finished',
    tags: ['Three.js', 'one-shot', 'ElevenLabs'],
    repo: 'https://github.com/Bloodtailor/Grind-Grimoire',
    post: 'grind-and-grimoire',
    shot: '/media/grind-and-grimoire/card.webp',
    shotLabel: 'The boardwalk, before the open mic'
  }
];
