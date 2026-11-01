// The posts read-aloud records: the listed ones, never a live notebook (src/data/exempt.js). /read/index.json and
// /read/<slug>.json are written for these alone, and only their Listen button offers the recording; any other post
// reads in the browser's own voice. ranked() is the order the cron voices them in: Start here first, then newest.
import { isLive } from '../../data/exempt.js';
import { START_HERE } from '../../data/picks.js';
import { isListed, ledgerOrder } from '../posts.js';

export const recordable = (post) => isListed(post.data) && !isLive(post.id);

const picked = (post) => (START_HERE.includes(post.id) ? START_HERE.indexOf(post.id) : START_HERE.length);
export const ranked = (posts) => ledgerOrder(posts.filter(recordable)).sort((a, b) => picked(a) - picked(b));
