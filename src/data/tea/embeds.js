// Every thing on the tea room that can be played, watched or turned, and the chapters that may play it, in order of
// preference (2.3): the first of them that is on the page plays it; anywhere else its button is a link to that
// chapter. No chapter reads another chapter's files to find this out. kind: 'game' or 'machine' (an <ao-game>) or
// 'film' (a <video controls>); in: 'window' (it runs where its poster was) or 'sheet' (a <dialog> of paper: every lab
// machine, whose page takes the mouse wheel); mb: what a press costs, said on the button above 5 MB.
// The lab's machines live in the live notebook (public/labs/teardown/): they are named here by their own address
// and never copied, and a check of them only warns (src/data/exempt.js).
// Keyed by the row's own key: a post's slug (film), a project's key (projects/play and projects/watch), a machine's
// folder (tv/machines). Every row the picks name today has an entry, with the post's or project's own poster as a
// placeholder each chapter's builder may replace in its art.js; a row picked later without one is shown with its
// link alone. watch: a page that plays a film in its own frame (an <ao-game>), labelled to watch, not to play.
// row: where another chapter plays the thing under a row of another key ({ chapterId: thatKey }).
// mb: null where the cost is not yet measured (the chapter's builder measures it); nothing is said on the button.
// The lab's machines live in the live notebook (public/labs/teardown/): they are named here by their own address
// and never copied, and a check of them only warns (src/data/exempt.js).
const film = (src, mb, poster, chapters = ['film']) => ({ kind: 'film', in: 'window', src, mb, chapters, poster });
const still = (src, alt, w = 1280, h = 720) => ({ src, w, h, alt });
// A lab machine, by its folder: played in the television chapter, in a sheet.
export const machine = (name, poster) => ({ kind: 'machine', in: 'sheet', src: `/labs/teardown/${name}/`, mb: 1, chapters: ['tv'], poster });
const lab = (name, alt) => machine(name, still(`/media/teardown-lab/${name}/poster.webp`, alt));

export const EMBEDS = {
  'storm-bell-fighter': {
    kind: 'game', in: 'window', src: '/games/storm-bell/', mb: 22, chapters: ['games', 'projects'],
    poster: { src: '/media/storm-bell-fighter/poster.webp', w: 1600, h: 900, alt: 'Storm Bell Fighter, playable in the browser' },
  },
  // films (film/leads)
  'bad-very-bad': film('/media/bad-very-bad/making-of/a/final_720p.mp4', 9,
    still('/media/bad-very-bad/making-of/a/poster.webp', 'Bad. Very Bad., the first frame of the short'), ['film', 'projects']),
  'moonlight-five-times': film('/media/moonlight-v4/moonlight_v4_720.mp4', 22,
    still('/media/moonlight-v4/poster.webp', 'Moonlight, the version made with AI models')),
  'still-on-shift-music-video': { kind: 'game', watch: true, in: 'window', src: '/media/still-on-shift/?embed', mb: null,
    chapters: ['film', 'projects'], poster: still('/media/still-on-shift/still-15_t107.5.webp', 'The red Heart glowing in its apse, from Still on Shift') },
  'a-film-of-mit-s-ai-weight-editing-experiments-from-the-ai-s-side': film(
    '/media/a-film-of-mit-s-ai-weight-editing-experiments-from-the-ai-s-side/astra-film.mp4', 996,
    still('/media/a-film-of-mit-s-ai-weight-editing-experiments-from-the-ai-s-side/poster.webp', 'The film of the weight editing experiments, its first frame')),
  // projects/play and projects/watch
  blackwater: { kind: 'game', in: 'sheet', src: 'https://play.aaronorelup.com/', mb: null, chapters: ['projects'],
    poster: still('/media/projects/blackwater.webp', 'Diving down a flooded cave shaft with a torch', 640, 360) },
  'armies-of-gielinor': { kind: 'game', in: 'sheet', src: '/games/armies-of-gielinor/', mb: null, chapters: ['projects'],
    poster: still('/media/projects/armies-of-gielinor.webp', 'A match in progress: small armies on a green map', 640, 360) },
  'claude-paints-in-oil': film('/media/oil-paintings/stack-timelapse.mp4', 3,
    still('/media/oil-paintings/stack-3-twilight-feast.webp', 'An oil painting of a twilight feast, painted by Claude', 1600, 900), ['projects']),
  'grind-and-grimoire': { kind: 'game', in: 'sheet', src: '/games/grind-and-grimoire/', mb: null, chapters: ['games', 'projects'],
    poster: still('/media/projects/grind-and-grimoire.webp', 'The wizard on a skateboard on the boardwalk', 640, 360) },
  showreel: film('/media/showreel/showreel-v3-30.mp4', 8,
    still('/media/projects/showreel.webp', 'The first station of the showreel, a course for building with AI', 640, 360), ['projects']),
  'clawd-growth-montage': film('/games/clawd-growth-montage/clawd-growth-montage.mp4', 5,
    still('/games/clawd-growth-montage/poster.jpg', 'Clawd on a hilltop in front of a rising sun', 1920, 1080), ['projects']),
  // the songs' videos: the one that plays is Still on Shift, which Film plays, under that post's own row, when it
  // shows it
  'blackwater-songs': { kind: 'game', watch: true, in: 'window', src: '/media/still-on-shift/?embed', mb: null,
    chapters: ['film', 'projects'], row: { film: 'still-on-shift-music-video' },
    poster: still('/media/projects/blackwater-songs.webp', 'A red crystal heart from the Still on Shift video', 640, 360) },
  // the lab's machines (tv/machines)
  dray: lab('dray', 'DRAY, the six-wheel hauler, in the lab'),
  hab3: lab('hab3', 'HAB 3, the habitat, cut away in the lab'),
  lander: lab('lander', 'The cargo lander on its four legs, in the lab'),
  mole1: lab('mole1', 'MOLE-1, the drum digger, in its cut'),
};

// A row of the play and watch shelves that nothing on the site can play: it is shown with its link alone, and why.
export const LINK_ONLY = {
  'evening-television': 'its episodes play on YouTube, so the row links out',
};

// The chapter that plays a thing, or null: the first chapter its entry names that is on the page (onPage: their ids
// in order) and, when shows is given ({ chapterId: Set of the row keys that chapter shows }), that shows the row
// that plays it there (the entry's row[chapterId], or its own key). The picks decide what a chapter shows, so a
// game picked for Projects alone plays in Projects, and its button is never a link to a chapter that lacks it.
export function homeOf(name, onPage, shows) {
  const e = EMBEDS[name];
  return e?.chapters.find((id) => onPage.includes(id) && (!shows || Boolean(shows[id]?.has(e.row?.[id] ?? name)))) ?? null;
}
