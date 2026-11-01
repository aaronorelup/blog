// Folded details (<details><summary> in a post): the one holding the URL's #target opens, with any around it, on mount
// and on every hashchange, and the target is brought into view. mount(root) returns unmount.
import { targetOf } from './target.js';

export function mount(root) {
  const open = () => {
    const target = targetOf(root);
    if (!target?.closest('details:not([open])')) return;
    for (let d = target.closest('details'); d; d = d.parentElement.closest('details')) d.open = true;
    target.scrollIntoView();
  };
  open();
  addEventListener('hashchange', open);
  return () => removeEventListener('hashchange', open);
}
