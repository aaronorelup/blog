// The world every provider gets before its own file exists: house grey paper, the owner's glass from the brand
// sheets (SPEC 3.2), and whatever art and marks are on disk. Also the lookups a world file uses for its art, so
// a missing picture is null and never a broken import. No facts here: names and numbers come from the data.
const ART = import.meta.glob('../../../../assets/ai-landscape/2026-11-10/art/*/*.webp', { eager: true, query: '?no-inline', import: 'default' });
const MARKS = import.meta.glob('../../../../assets/ai-landscape/2026-11-10/marks/*/*.{svg,png}', { eager: true, query: '?no-inline', import: 'default' });
const ROOT = '../../../../assets/ai-landscape/2026-11-10';

export const HOUSE = { paper: '#E6E8ED', floor: '#F8F9FB', ink: '#0C0D10', ink2: '#4A4E57', mid: '#8C929C', line: '#C9CDD5', night: '#050608' };

// One picture of a world, or null: art('xai', 'plate'). Names: plate, plate-s, hero, prop-1..3, fore, portrait.
export const art = (id, name) => ART[`${ROOT}/art/${id}/${name}.webp`] || null;
// One official mark file, or null: mark('xai', 'grok-mark'). A world with no file gets its name set in type.
export const mark = (id, name) => MARKS[`${ROOT}/marks/${id}/${name}.svg`] || MARKS[`${ROOT}/marks/${id}/${name}.png`] || null;
// Every picture of one world, with null for a piece that was left out.
export const artOf = (id) => ({
  plate: art(id, 'plate'), plateSmall: art(id, 'plate-s'), hero: art(id, 'hero'),
  props: [art(id, 'prop-1'), art(id, 'prop-2'), art(id, 'prop-3')], fore: art(id, 'fore'), portrait: art(id, 'portrait'),
});

// The ownership colour of each company: its glass everywhere on the page. `prism` blends through the glass.
export const GLASS = {
  anthropic: { glass: '#D97757', rim: '#F0EEE6', glow: '#D97757' },
  openai: { glass: '#F3F3F3', rim: '#0D0D0D', glow: '#FFFFFF' },
  google: { glass: '#378AFF', rim: '#FFFFFF', glow: '#378AFF', prism: ['#E0C027', '#D55F74', '#378AFF', '#29B585'] },
  meta: { glass: '#0064D4', rim: '#DBECFF', glow: '#0064D4' },
  xai: { glass: '#0A0A0A', rim: '#FFFFFF', glow: '#FFFFFF' },
  outside: { glass: HOUSE.mid, rim: '#FFFFFF', glow: HOUSE.mid },
  you: { glass: HOUSE.mid, rim: '#FFFFFF', glow: HOUSE.mid },
  house: { glass: HOUSE.mid, rim: '#FFFFFF', glow: '#FFFFFF' },
};
// The lid mark of each company (SPEC 5, marks), and whether it stands for the assistant brand or the company name.
// clear: the space kept around it on its plate, as a fraction of its height. 'own' = the file carries it already.
const LID = { anthropic: ['claude-spark', 'brand', 0.5], openai: ['blossom', 'name', 0.5], google: ['google-g', 'name', 'own'], meta: ['meta-logo', 'name', 1], xai: ['grok-mark', 'brand', 0.5] };

// The full configuration for `id`. A world file overrides any key (index.js merges one level deep).
export function defaults(id) {
  const own = GLASS[id] || GLASS.house;
  const [lid, of, clear] = LID[id] || ['mark', 'name', 0.5];
  return {
    id,
    brandMode: 'full',
    theme: { chrome: 'light', ground: HOUSE.paper, ink: HOUSE.ink, glass: own.glass, rim: own.rim, glow: own.glow, line: HOUSE.ink2, prism: own.prism || null },
    hour: { lamp: [-0.34, 0.8, -0.5], warmth: 0 },
    marks: { lid: mark(id, lid), of, plate: 'white', clear },
    art: artOf(id),
    alt: { plate: 'A paper stage set for this company.', hero: 'The character of its personal agent, as a paper cut-out.', portrait: 'A framed cut-paper portrait.' },
    character: { kind: 'sprite', floor: 3, size: 1.1 },
    backdrop: { y: -3.8, turn: 0 },
    props: [{ file: 1, z: -9, x: 11, y: 2.2, w: 2.4 }, { file: 2, z: -6, x: -4.3, y: 1.5, w: 1.8 }, { file: 3, z: -3.5, x: 7.5, y: 0.9, w: 2.6 }],
    fore: { z: 3.2, x: 3.2, y: 0.12, w: 5 },
    portrait: art(id, 'portrait') ? { x: 12.7, y: 5.4 } : null,
    dust: own.glow,
    signature: id,
    myth: null,
    catchFloor: 5,
  };
}
