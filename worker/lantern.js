// GET /api/lantern: the homepage's lantern door (src/scripts/home/lantern.js) opens here, and this sends it on to
// LANTERN_URL, a Worker secret, so the address is in neither this public repo nor the built site. Never cached.
import { status } from './lib/http.js';

export const serve = (request, env) => status(302, { Location: env.LANTERN_URL });
