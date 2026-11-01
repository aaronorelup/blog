// Stub until T2.3 (docs/WORKER.md): POST /api/ask, Ask Goobie. Answers 503 until then.
import { status } from '../lib/http.js';

export const serve = () => status(503);
