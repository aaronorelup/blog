// The commit and branch this build is made from, in one place: /version.json reports them and the layouts' ao-build
// meta carries the commit (the overlay compares it before mounting a fetched page). Workers Builds sets WORKERS_CI_*;
// a local build asks git, and its branch is "local".
import { execSync } from 'node:child_process';

const git = (args) => {
  try { return execSync('git ' + args, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); }
  catch { return null; }
};

const CI = !!process.env.WORKERS_CI;

export const COMMIT = (CI && process.env.WORKERS_CI_COMMIT_SHA) || git('rev-parse HEAD');
export const BRANCH = CI ? process.env.WORKERS_CI_BRANCH || null : 'local';
