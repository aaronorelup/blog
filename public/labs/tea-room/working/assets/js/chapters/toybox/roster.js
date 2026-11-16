/* What is in the toy box. One line per toy: where its model file lives, how big it stands, and the words on the
   small card that names it when it is picked up.
   The words are DRAFTS in plain language, Aaron's to rewrite: `from` is the experiment or project, `how` is how the
   model was made. Models the site serves under /media/ and /tea/ are loaded from their own addresses; the others are copies in
   the working copy's assets/models/ (the fighter is the games chapter's own file; how the light copies were made is
   in the toy box test's models/README.txt).
   h: standing height in metres (the paper lamp in the room is about 0.55). face: turn, in degrees, that makes the
   model look at the camera. shape: how it is held up in the physics (fig = two stacked balls, box = four or eight balls, ball = one).
   cx, cz: where its feet are, in parts of its own width and depth, when that is not the middle of the model.
   side, back: a prop's place in the huddle: which end of a row (-1 left, 1 right) and how far back (0 the front
   row, 1 the last). Jefrie and Yusef have neither: they stand in the middle, by height.
   desk: true for a prop that only comes out on a wide screen (a phone's picture has no room for it). */

const M = new URL('../../../models/', import.meta.url).href;   // (the working copy's own: assets/models/)
const TEA = M + 'toys/';

export const ROSTER = [
  {
    id: 'tea-rig', url: TEA + 'jefrie_rig.glb', h: 0.36, jefrie: true,
    name: 'Tea-room Jefrie', from: 'The first tea room page',
    how: 'Made from one drawing by an image-to-3D model, then given bones for her legs, tail and cape.',
  },
  {
    id: 'fighter', url: M + 'games/jefrie.glb', h: 0.5, jefrie: true, clips: true,
    name: 'Fighter Jefrie', from: 'Storm Bell Fighter, the game',
    how: 'Built in Blender for my fighting game, with a skeleton and her moves. Let go and she shows you one.',
  },
  {
    id: 'megabonk', url: M + 'toys/jefrie-megabonk-3k.glb', h: 0.27, jefrie: true,
    name: 'Megabonk Jefrie', from: 'My Megabonk mod',
    how: 'The whole character in 3,000 triangles and one tiny texture, light enough to drop into someone else’s game.',
  },
  {
    id: 'v2', url: '/media/jefrie-3d/jefrie-v2.glb', h: 0.34, jefrie: true,
    name: 'Jefrie, second build', from: 'Jefrie in 3D · AO-018',
    how: 'Generated from one picture, then rebuilt by an agent with a new tail, cape and ears so she could bend.',
  },
  {
    id: 'headmerge', url: '/media/jefrie-3d/jefrie-headmerge.glb', h: 0.36, jefrie: true,
    name: 'Head-swap Jefrie', from: 'Jefrie in 3D · AO-018',
    how: 'Generated from one picture. The first head came out wrong, so a better one was grafted on.',
  },
  {
    id: 'retopo', url: M + 'toys/jefrie-retopo-5k.glb', h: 0.33, jefrie: true,
    name: 'Jefrie in 5,000 triangles', from: 'Jefrie in 3D · AO-018',
    how: 'The generated model again, with its 685,000-triangle skin redrawn as about 5,000.',
  },
  {
    id: 'code', url: M + 'toys/jefrie-built-in-code.glb', h: 0.4, jefrie: true,
    name: 'Jefrie built in code', from: 'An agent, Blender and no pictures',
    how: 'Nobody sculpted her and nothing generated her: an AI agent wrote the Blender script that builds her, part by part. 833,000 triangles in the original, 33,000 here.',
  },
  {
    id: 'hand-a', url: M + 'toys/jefrie-hand-built-a.glb', h: 0.33, jefrie: true,
    name: 'Hand-built Jefrie, walking', from: 'Jefrie in 3D · AO-018',
    how: 'Built shape by shape in Blender by an AI agent, from her reference sheet. She could walk within a day, scythe and all.',
  },
  {
    id: 'hand-b', url: M + 'toys/jefrie-hand-built-b.glb', h: 0.47, jefrie: true,
    name: 'Hand-built Jefrie, second opinion', from: 'Jefrie in 3D · AO-018',
    how: 'The same job given to a different AI model: the same reference sheet, built by hand again, in another hand.',
  },
  {
    id: 'picture', url: M + 'toys/jefrie-from-one-picture.glb', h: 0.35, jefrie: true,
    name: 'Jefrie from one picture', from: 'Jefrie in 3D · AO-018',
    how: 'One picture in, a whole model out, from a second image-to-3D generator. 696,000 triangles in the original, 33,000 here.',
  },
  {
    id: 'head', url: M + 'toys/jefrie-head.glb', h: 0.25, jefrie: true, shape: 'ball',
    name: 'Jefrie’s head', from: 'Jefrie in 3D · AO-018',
    how: 'Generated from a close-up of her face alone, to be grafted onto a body whose own head came out wrong.',
  },
  {
    id: 'leap', url: TEA + 'jefrie_leap_rig.glb', h: 0.3, jefrie: true,
    name: 'Leaping Jefrie', from: 'The first tea room page',
    how: 'Generated already in mid-air from a drawing of her jumping, for the page’s opening.',
  },
  {
    id: 'yusef', url: TEA + 'yusef_rig.glb', h: 0.42,
    name: 'Yusef', from: 'The first tea room page',
    how: 'Jefrie’s company in the tea room. Made from one drawing, with bones in the wings and arms.',
  },
  {
    id: 'tv', side: -1, back: 0, url: '/tea/hero/tv_rig.glb', h: 0.24, shape: 'box',
    name: 'The little television', from: 'The tea room',
    how: 'The set from the room’s far corner. Made from one drawing; the screen is its own piece so it can light up.',
  },
  {
    id: 'lantern', desk: true, side: 1, back: 0.67, url: TEA + 'lantern_rig.glb', h: 0.3,
    name: 'Yusef’s lantern', from: 'The first tea room page',
    how: 'Made from one drawing. The glass is a separate material so it can glow.',
  },
  {
    id: 'crate-3k', side: -1, back: 0.34, url: '/media/props-three-budgets/crate-3k.glb', h: 0.115, shape: 'box',
    name: 'Crate, 3,000 triangles', from: 'Props on three budgets · AO-059',
    how: 'A generated crate cut down in Blender to 3,000 triangles. This one held together.',
  },
  {
    id: 'crate-300', desk: true, side: 1, back: 0.34, url: '/media/props-three-budgets/crate-300.glb', h: 0.115, shape: 'box',
    name: 'Crate, 300 triangles', from: 'Props on three budgets · AO-059',
    how: 'The same crate at 300 triangles. Charming from here, rough up close.',
  },
  {
    id: 'diver', side: 1, back: 0, url: M + 'toys/toy-diver.glb', h: 0.2, clips: true,
    name: 'Toy diver', from: 'Blackwater, the diving game',
    how: 'A wind-up toy from my underwater horror game, about a thousand triangles, with a waddle.',
  },
  {
    id: 'recorder', desk: true, side: 1, back: 0, url: M + 'toys/tape-recorder.glb', h: 0.13, shape: 'box',
    name: 'Tape recorder', from: 'Blackwater, the diving game',
    how: 'Another prop from the game, about 1,500 triangles. Its two reels are separate pieces so they can turn.',
  },
  {
    id: 'jukebox', side: -1, back: 1, url: M + 'toys/jukebox.glb', h: 0.38, shape: 'box',
    name: 'Jukebox', from: 'Blackwater, the diving game',
    how: 'A prop from the same game, made game-ready at 3,500 triangles.',
  },
];
