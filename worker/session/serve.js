// Stub until T2.3 (docs/WORKER.md): GET /api/session says whether Ask is on, POST /api/session turns a Turnstile
// solve into an Ask token (lib/session.js). Both answer 503 until then.
import { status } from '../lib/http.js';

export const flags = () => status(503);
export const mint = () => status(503);
