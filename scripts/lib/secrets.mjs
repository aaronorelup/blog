// secret(NAME): a key for a box tool, from the environment or else from Infisical through ~/.claude/bin/getkey.py
// (project ai-keys, env prod). The value is returned, never printed or logged.
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

export function secret(name) {
  if (process.env[name]) return process.env[name];
  const getkey = path.join(os.homedir(), '.claude', 'bin', 'getkey.py');
  for (const python of ['python3', 'python']) {
    const r = spawnSync(python, [getkey, name], { encoding: 'utf8' });
    if (r.status === 0 && r.stdout.trim()) return r.stdout.trim();
  }
  throw new Error(`No ${name}: set it in the environment, or store it in Infisical for ${getkey}`);
}
