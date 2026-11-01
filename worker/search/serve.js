// Stub until T2.3 (docs/WORKER.md): GET /api/search?q=, the meaning half of search. Answers 503 until then.
import { status } from '../lib/http.js';

export const serve = () => status(503);
