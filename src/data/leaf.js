// The word-leaf, the one leaf the guest pulls off "leaves" on the homepage: its outline in SVG path syntax, one unit
// long along x (the stem at -0.5, the tip at +0.5, centred on 0), so the door's <svg> (scripts/home/leaves-door.js),
// the room's first paint (pages/leaves/index.astro) and the room's canvas (Path2D, scripts/leaves/paint-leaves.js)
// all draw the same leaf, and the hand-off between them never pops.
export const LEAF = {
  body: 'M-.47 0C-.37-.17-.05-.25.2-.17.34-.12.44-.05.5 0 .42.07.3.15.14.18-.1.22-.37.15-.47 0Z',
  veins: 'M-.58.03L-.47 0M-.47 0C-.2-.015.15-.02.46 0M-.26-.01Q-.2-.08-.12-.145M-.05-.015Q0-.09.07-.155'
    + 'M.14-.015Q.19-.07.26-.12M-.3 0Q-.24.07-.17.13M-.1-.005Q-.05.08.02.165M.1-.01Q.15.07.22.135',
  fill: '#97BE4E',
  vein: '#D3E19A',
  edge: 'rgba(30,26,22,0.55)',
  line: 0.024,                       // the outline's width, in leaf lengths
  view: '-0.6 -0.3 1.2 0.6',         // the <svg>'s viewBox: 1.2 leaf lengths wide, half as tall
};

// The leaf's size, in CSS px, when the homepage hands it to the room: about 3.5 times the 15 px it peels off at.
export const handoffSize = (w, h) => Math.round(Math.min(72, Math.max(44, Math.min(w, h) * 0.075)));
