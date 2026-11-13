/* What is in the toy box. One line per toy: where its model file lives, how big it stands, and the words on the
   small card that names it when it is picked up.
   The words are DRAFTS in plain language, Aaron's to rewrite: `from` is the experiment or project, `how` is how the
   model was made. Models the site already serves are loaded from their own addresses; the others are light copies
   in ../models/ (how each was made is in ../models/README.txt).
   h: standing height in metres (the paper lamp in the room is about 0.55). face: turn, in degrees, that makes the
   model look at the camera. shape: how it is held up in the physics (fig = two stacked balls, box = four balls).
   cx, cz: where its feet are, in parts of its own width and depth, when that is not the middle of the model. */

const TEA = '/labs/tea-room/v1/assets/tea/hero/';

export const ROSTER = [
  {
    id: 'tea-rig', url: TEA + 'jefrie_rig.glb', h: 0.36, jefrie: true,
    name: 'Tea-room Jefrie', from: 'The first tea room page',
    how: 'Made from one drawing by an image-to-3D model, then given bones for her legs, tail and cape.',
  },
  {
    id: 'fighter', url: '/labs/tea-room/tests/storm-bell-backdrop/models/jefrie.glb', h: 0.5, jefrie: true, clips: true,
    name: 'Fighter Jefrie', from: 'Storm Bell Fighter, the game',
    how: 'Built in Blender for my fighting game, with a skeleton and her moves. Let go and she shows you one.',
  },
  {
    id: 'megabonk', url: 'models/jefrie-megabonk-3k.glb', h: 0.27, jefrie: true,
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
    id: 'retopo', url: 'models/jefrie-retopo-5k.glb', h: 0.33, jefrie: true,
    name: 'Jefrie in 5,000 triangles', from: 'Jefrie in 3D · AO-018',
    how: 'The generated model again, with its 685,000-triangle skin redrawn as about 5,000.',
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
    id: 'tv', url: '/tea/hero/tv_rig.glb', h: 0.24, shape: 'box',
    name: 'The little television', from: 'The tea room',
    how: 'The set from the room’s far corner. Made from one drawing; the screen is its own piece so it can light up.',
  },
  {
    id: 'lantern', url: TEA + 'lantern_rig.glb', h: 0.3,
    name: 'Yusef’s lantern', from: 'The first tea room page',
    how: 'Made from one drawing. The glass is a separate material so it can glow.',
  },
  {
    id: 'crate-3k', url: '/media/props-three-budgets/crate-3k.glb', h: 0.115, shape: 'box',
    name: 'Crate, 3,000 triangles', from: 'Props on three budgets · AO-059',
    how: 'A generated crate cut down in Blender to 3,000 triangles. This one held together.',
  },
  {
    id: 'crate-300', url: '/media/props-three-budgets/crate-300.glb', h: 0.115, shape: 'box',
    name: 'Crate, 300 triangles', from: 'Props on three budgets · AO-059',
    how: 'The same crate at 300 triangles. Charming from here, rough up close.',
  },
  {
    id: 'diver', url: 'models/toy-diver.glb', h: 0.2, clips: true,
    name: 'Toy diver', from: 'Blackwater, the diving game',
    how: 'A wind-up toy from my underwater horror game, about a thousand triangles, with a waddle.',
  },
  {
    id: 'jukebox', url: 'models/jukebox.glb', h: 0.38, shape: 'box',
    name: 'Jukebox', from: 'Blackwater, the diving game',
    how: 'A prop from the same game, made game-ready at 3,500 triangles.',
  },
];
