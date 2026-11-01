// Every heading's id, set here so it never moves: github-slugger over the heading's text in document order, as Astro
// 5 slugs them (a trailing "-" dropped, an id written in the post kept), so every existing anchor keeps its id across
// Astro upgrades. An id the page itself uses gets "-1". Astro's own pass runs later and keeps these.
import GithubSlugger from 'github-slugger';

const RESERVED = ['content', 'short', 'contents', 'panel-scroll', 'panel-screen', 'panel-card', 'panel-inner',
  'mode-toggle', 'mode-knob'];
const HEADING = /^h[1-6]$/;
const textOf = (node) => (node.type === 'text' ? node.value : (node.children || []).map(textOf).join(''));

export default function rehypeHeadingIds() {
  return (tree) => {
    const slugger = new GithubSlugger();
    for (const id of RESERVED) slugger.slug(id);
    (function walk(node) {
      for (const el of node.children) {
        if (el.type !== 'element') continue;
        if (HEADING.test(el.tagName) && typeof el.properties.id !== 'string') {
          const id = slugger.slug(textOf(el)).replace(/-$/, '');
          el.properties.id = id.startsWith('scene-') ? slugger.slug(`${id}-1`) : id;
        }
        walk(el);
      }
    })(tree);
  };
}
