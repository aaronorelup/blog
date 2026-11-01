// The commit this build is made from, for the layouts' ao-build meta (the overlay compares it before mounting a
// fetched page). Workers Builds names it; a local build asks git.
import { execSync } from 'node:child_process';

export const COMMIT = process.env.WORKERS_CI_COMMIT_SHA || execSync('git rev-parse HEAD').toString().trim();
