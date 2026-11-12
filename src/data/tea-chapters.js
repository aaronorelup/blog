// The chapters of the tea room being rebuilt, in the picker's order: what src/data/tea-picks.json may name. id is the
// picker's, dom the section's id on the page (a valid CSS id: never a bare "3d"), kind the component that draws it.
// A shelf holds one kind of item, at most max of them picked; auto says which listed posts fill it when the owner
// asks for the newest instead ({} for any listed post). Titles come from the copy and the taxonomy, never from here.
import { COPY } from './tea.js';
import { PROJECTS, TOPICS } from './taxonomy.js';

const label = (id) => COPY.chapterTitles[id];
const topic = (id, key, max) => ({ id, dom: `topic-${key}`, kind: 'topic', topic: key, title: TOPICS[key].label,
  shelves: [{ id: 'leads', max, holds: 'post', auto: { topic: key } }] });
const projects = (id, max) => ({ id, max, holds: 'project' });

export const TEA_CHAPTERS = [
  { id: 'hero', dom: 'top', kind: 'hero', title: label('hero'), shelves: [] },
  { id: 'start', dom: 'start', kind: 'start', title: label('start'),
    shelves: [{ id: 'leads', max: 3, holds: 'post', auto: {} }] },
  { id: 'tv', dom: 'evening-television', kind: 'series', title: PROJECTS['evening-television'].label,
    shelves: [{ id: 'episodes', max: 6, holds: 'post', auto: { project: 'evening-television' } },
              { id: 'machines', max: 5, holds: 'machine' }] },
  topic('film', 'video', 5),
  topic('games', 'games', 5),
  topic('art', 'art', 7),
  topic('3d', '3d', 5),
  topic('agents', 'agents', 5),
  topic('learning', 'learning', 5),
  topic('site', 'site', 5),
  { id: 'projects', dom: 'projects', kind: 'projects', title: label('projects'),
    shelves: [projects('play', 5), projects('watch', 5), projects('download', 4), projects('read', 4), projects('stopped', 3)] },
  { id: 'courses', dom: 'courses', kind: 'courses', title: label('courses'), shelves: [] },
  { id: 'now', dom: 'now', kind: 'now', title: label('now'), shelves: [] },
  { id: 'about', dom: 'about', kind: 'about', title: label('about'), shelves: [] },
];
