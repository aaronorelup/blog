// The ledger view's behaviour, on /ledger/ and in the homepage overlay: the chips, the search box, the feed's copy
// button, and the hover card (it listens document-wide, so importing it is its mount). mount(root) returns unmount.
import '../cards/hover.js';
import { mount as chips } from '../ledger/filter.js';
import { bindFeedCopy } from '../ledger/feed.js';
import { mount as search } from '../search/box.js';

export function mount(root) {
  const unmounts = [chips(root), search(root), bindFeedCopy(root)];
  return () => unmounts.forEach((unmount) => unmount());
}
