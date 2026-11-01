// node scripts/tools/put-secret.mjs NAME [FROM]: sets one secret on the Worker blog, never printing its value.
// SESSION_KEY is 32 fresh random bytes (Ask tokens minted before stop working), TURNSTILE_SECRET comes from Ask's
// Turnstile widget (made if missing), any other is read from Infisical under FROM (default NAME). The Worker's
// ELEVENLABS_API_KEY is its own restricted key, never Aaron's main one, so it needs FROM. docs/WORKER.md lists all.
import crypto from 'node:crypto';
import { cf, WORKER, turnstileWidget } from '../lib/cfapi.mjs';
import { secret } from '../lib/secrets.mjs';

const [name = '', from = name] = process.argv.slice(2);
if (!/^[A-Z][A-Z0-9_]*$/.test(name) || (name === 'ELEVENLABS_API_KEY' && from === name)) {
  console.error('usage: node scripts/tools/put-secret.mjs NAME [FROM]  (ELEVENLABS_API_KEY needs FROM: the restricted key)');
  process.exit(2);
}
const text = name === 'SESSION_KEY' ? crypto.randomBytes(32).toString('base64url')
  : name === 'TURNSTILE_SECRET' ? (await turnstileWidget()).secret
  : secret(from);
await cf(`/workers/scripts/${WORKER}/secrets`, { method: 'PUT', body: { name, text, type: 'secret_text' } });
console.log(`${name} is set on the Worker ${WORKER}.`);
