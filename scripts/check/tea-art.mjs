// The tea room's art (2.8): every item the picks put in a chapter should have an entry in that chapter's art.js
// (its picture, layers or backdrop). An item with none is shown in the chapter's plain form, so this only warns,
// naming it; it never fails the build. It also prints, as a note, how long the page is for the picks as saved, on
// a desktop and on a phone (2.10). The live notebook's machines only warn, as every rule does.
import { TEA_CHAPTERS } from '../../src/data/tea-chapters.js';
import { PICKS_FILE, readPicks } from '../../src/lib/tea-picks.js';
import { runOf } from '../../src/lib/tea-scene.js';
import { itemCount, pageLengths } from '../../src/scripts/tea/room/engine/lengths.js';
import { picksSite } from './tea-picks.mjs';
import { art as heroArt } from '../../src/data/tea/hero/art.js';
import { art as startArt } from '../../src/data/tea/start/art.js';
import { art as tvArt } from '../../src/data/tea/tv/art.js';
import { art as filmArt } from '../../src/data/tea/film/art.js';
import { art as gamesArt } from '../../src/data/tea/games/art.js';
import { art as artArt } from '../../src/data/tea/art/art.js';
import { art as threeDArt } from '../../src/data/tea/3d/art.js';
import { art as agentsArt } from '../../src/data/tea/agents/art.js';
import { art as learningArt } from '../../src/data/tea/learning/art.js';
import { art as siteArt } from '../../src/data/tea/site/art.js';
import { art as projectsArt } from '../../src/data/tea/projects/art.js';
import { art as coursesArt } from '../../src/data/tea/courses/art.js';
import { art as nowArt } from '../../src/data/tea/now/art.js';
import { art as aboutArt } from '../../src/data/tea/about/art.js';
import * as heroScene from '../../src/data/tea/hero/scene.js';
import * as startScene from '../../src/data/tea/start/scene.js';
import * as tvScene from '../../src/data/tea/tv/scene.js';
import * as filmScene from '../../src/data/tea/film/scene.js';
import * as gamesScene from '../../src/data/tea/games/scene.js';
import * as artScene from '../../src/data/tea/art/scene.js';
import * as threeDScene from '../../src/data/tea/3d/scene.js';
import * as agentsScene from '../../src/data/tea/agents/scene.js';
import * as learningScene from '../../src/data/tea/learning/scene.js';
import * as siteScene from '../../src/data/tea/site/scene.js';
import * as projectsScene from '../../src/data/tea/projects/scene.js';
import * as coursesScene from '../../src/data/tea/courses/scene.js';
import * as nowScene from '../../src/data/tea/now/scene.js';
import * as aboutScene from '../../src/data/tea/about/scene.js';

export const ART = { hero: heroArt, start: startArt, tv: tvArt, film: filmArt, games: gamesArt, art: artArt, '3d': threeDArt, agents: agentsArt, learning: learningArt, site: siteArt, projects: projectsArt, courses: coursesArt, now: nowArt, about: aboutArt };
export const SCENES = { hero: heroScene, start: startScene, tv: tvScene, film: filmScene, games: gamesScene, art: artScene, '3d': threeDScene, agents: agentsScene, learning: learningScene, site: siteScene, projects: projectsScene, courses: coursesScene, now: nowScene, about: aboutScene };
const strip = (key) => key;

// The rebuilt page (its art and scenes are this repo's own files): a repo without it, such as a test's seeded one,
// has nothing to check. The swap (piece 6a) points PAGE at src/pages/tea/index.astro.
export const PAGE = 'src/pages/tea-next/index.astro';

// The picks as saved, read as the check reads them: the visible chapters with their shelves, or null when the
// rebuilt page or the picks file is not in this repo, or the picks cannot be read (the tea-picks rule says why).
export function roomChapters(repo) {
  if (!repo.exists(PICKS_FILE) || !repo.exists(PAGE)) return null;
  try {
    return readPicks(JSON.parse(repo.read(PICKS_FILE)), TEA_CHAPTERS, picksSite(repo)).chapters;
  } catch {
    return null;
  }
}

// Each chapter's length for the picks as saved (2.10): [{ id, shelves, len: { d, p }, n: { d, p } }] and the page's
// totals in vh, from each chapter's scene data (its length and count) and lengths.js, the formula the page uses.
// length.mjs prints the same numbers.
export function roomLengths(chapters) {
  const lens = [];
  for (const c of chapters) {
    const first = runOf(SCENES[c.id])[0]?.scene;
    if (!first) continue;
    const shelves = c.shelves.map((s) => ({ id: s.id, rows: s.keys }));
    const rule = first.count?.d || first.count?.p ? first.count : { d: first.count, p: first.count };
    lens.push({ id: c.id, shelves: c.shelves, len: first.length, n: { d: itemCount(shelves, rule.d ?? {}), p: itemCount(shelves, rule.p ?? {}) } });
  }
  const d = pageLengths(lens, 'd'), p = pageLengths(lens, 'p');
  return { chapters: lens.map((c, i) => ({ ...c, vh: { d: d.chapters[i].len, p: p.chapters[i].len } })), total: { d: d.total, p: p.total } };
}

export default function teaArt(repo, report) {
  const chapters = roomChapters(repo);
  if (!chapters) return;
  for (const c of chapters) {
    const art = ART[c.id] ?? {};
    for (const s of c.shelves) {
      for (const key of s.keys) {
        if (!(strip(key) in art)) report(`src/data/tea/${c.id}/art.js`, null, `${c.id}/${s.id}: "${strip(key)}" has no entry, so it is shown in the chapter's plain form`, 'warn');
      }
    }
  }
  const { total } = roomLengths(chapters);
  report(PICKS_FILE, null, `note: the tea room is ${total.d.toFixed(1)} screens long on a desktop and ${total.p.toFixed(1)} on a phone, for the picks as saved`, 'warn');
}
