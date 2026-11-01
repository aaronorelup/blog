// Content hashes at build time: sha256hex(s) is the full digest, short(hex) the 8 characters that name a version of
// something (a read-aloud recording, an og image's ?v=, the Markdown plugins' code).
import { createHash } from 'node:crypto';

export const sha256hex = (s) => createHash('sha256').update(s).digest('hex');
export const short = (hex) => hex.slice(0, 8);
