// A scene module for every one of the fourteen chapters, for the picks tests: the hero is the fixture walk with
// its open door, every other chapter one flat field of its light, its word and the object its shadow stands for,
// with the length formulas and phone layouts each chapter is given.
import { hero, SPARE, upright } from './scenes.mjs';

const LIGHT = { start: '#FFD892', tv: '#9FB8FF', film: '#EDE6D6', games: '#B9C7D6', art: '#F3E3C0', '3d': '#FFC86B',
  agents: '#E39A4A', learning: '#FFF4E4', site: '#FFD892', projects: '#EBD58A', courses: '#D9B8A0', now: '#C9D4F2', about: '#F4C7B8' };
export const LENGTHS = {
  start: { d: [2.4, 0.7], p: [2.4, 0.9] }, tv: { d: [5.4, 1.0], p: [5.4, 1.0] }, film: { d: [1.8, 1.0], p: [1.8, 1.0] },
  games: { d: [1.8, 1.0], p: [1.8, 1.0] }, art: { d: [1.8, 0.7], p: [1.8, 0.8] }, '3d': { d: [2.4, 0.9], p: [2.4, 0.9] },
  agents: { d: [3.0, 0.8], p: [3.2, 0.9] }, learning: { d: [1.8, 0.8], p: [1.8, 0.9] }, site: { d: [2.4, 0.7], p: [2.4, 0.8] },
  projects: { d: [1.8, 0.8], p: [1.8, 0.8] }, courses: { d: [2.6, 0], p: [2.8, 0] }, now: { d: [1.8, 0], p: [1.8, 0] },
  about: { d: [1.8, 0], p: [1.8, 0] },
};
const LAYOUT = { start: 'sheets', tv: 'set-above', film: 'cloth', games: 'outside', art: 'wall', '3d': 'bench', agents: 'tally',
  learning: 'page', site: 'house', projects: 'path', courses: 'notice', now: 'calm', about: 'calm' };
export const COUNT = { tv: { shelves: ['episodes'] }, projects: { d: { pair: ['download', 'read', 'stopped'] }, p: {} } };

function stub(id) {
  const d = {
    aim: [800, 450],
    flats: [
      { name: 'field', fill: LIGHT[id], box: [...SPARE], r: 1 },
      { name: 'word', text: true, box: [150, 150, 700, 230], r: 0.8 },
      { name: 'object', fill: '#000000', box: [1000, 420, 200, 260], r: 0.6 },
    ],
    camera: [{ at: 0, m: 0 }],
  };
  return { scene: {
    light: { colour: LIGHT[id], name: 'stub' }, still: { d: `/tea/scenes/${id}/still.webp`, p: `/tea/scenes/${id}/still-p.webp` }, shadow: { src: `/tea/scenes/${id}/shadow.webp`, flat: 'object' },
    length: LENGTHS[id], count: COUNT[id], d, p: { ...upright(d), layout: LAYOUT[id] },
  } };
}
export const STUBS = { hero, ...Object.fromEntries(Object.keys(LIGHT).map((id) => [id, stub(id)])) };
