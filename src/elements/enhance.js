// enhance(root, fallbackUrl): what a post needs once its HTML is in the page, standalone or in the homepage's reader
// (the overlay's contract export). Pictures open the viewer, same-origin frames join one-player-at-a-time, and the
// post components present load; the promise settles when they are defined.
import { hookFrames } from './_core/player.js';
import { hookViewer } from './_core/viewer.js';
import { upgrade } from './registry.js';

export function enhance(root = document, fallbackUrl) {
  hookViewer(root);
  hookFrames(root);
  return upgrade(root, fallbackUrl);
}
