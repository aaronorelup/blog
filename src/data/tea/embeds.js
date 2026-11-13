// Every thing on the tea room that can be played, watched or turned, and the chapters that may play it, in order of
// preference (2.3): the first of them that is on the page plays it; anywhere else its button is a link to that
// chapter. No chapter reads another chapter's files to find this out. kind: 'game' or 'machine' (an <ao-game>) or
// 'film' (a <video controls>); in: 'window' (it runs where its poster was) or 'sheet' (a <dialog> of paper: every lab
// machine, whose page takes the mouse wheel); mb: what a press costs, said on the button above 5 MB.
// The lab's machines live in the live notebook (public/labs/teardown/): they are named here by their own address
// and never copied, and a check of them only warns (src/data/exempt.js).
export const EMBEDS = {
  'storm-bell-fighter': {
    kind: 'game', in: 'window', src: '/games/storm-bell/', mb: 22, chapters: ['games', 'projects'],
    poster: { src: '/media/storm-bell-fighter/poster.webp', w: 1600, h: 900, alt: 'Storm Bell Fighter, playable in the browser' },
  },
};

// A lab machine, by its folder: played in the television chapter, in a sheet.
export const machine = (name, poster) => ({ kind: 'machine', in: 'sheet', src: `/labs/teardown/${name}/`, mb: 1, chapters: ['tv'], poster });

// The chapter that plays a thing, given the ids of the chapters on the page in order, or null.
export function homeOf(name, onPage) {
  const e = EMBEDS[name];
  return e?.chapters.find((id) => onPage.includes(id)) ?? null;
}
