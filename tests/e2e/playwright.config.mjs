// The behaviour suite (tests/e2e/INVENTORY.md lists every row). `npm run e2e` builds nothing: it serves the last
// `npm run build` with `astro preview` on a port of this checkout's own, or runs against E2E_BASE. targets.json is
// rewritten from dist/ before the specs are listed (they make one test per target). desktop is Chromium at
// 1440x900, phone WebKit as an iPhone 13. Wall-clock checks (tagged @timing: search-2, read-2) run in their own
// projects, the teardowns of the two above: Playwright starts them once both have finished, whatever their results,
// one test at a time a project, because 4 workers saturate the box's cores and a budget in ms then measures the box.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

if (!process.env.TEST_WORKER_INDEX) {
  execFileSync(process.execPath, [fileURLToPath(new URL('../../scripts/tools/element-usage.mjs', import.meta.url))],
    { stdio: ['ignore', 'ignore', 'inherit'] });
}

const base = process.env.E2E_BASE;
const TIMING = /@timing/;
const DESKTOP = { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } };
const PHONE = { ...devices['iPhone 13'] };
// Worktrees share a box, so each serves its own dist on a port taken from its path, never another's server.
const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const PORT = 4400 + (createHash('sha1').update(ROOT).digest().readUInt16BE(0) % 1000);

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.mjs',
  testIgnore: base ? [] : ['live.spec.mjs'],
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: 4,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'report' }]],
  outputDir: 'results',
  use: {
    baseURL: base || `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: DESKTOP, grepInvert: TIMING, teardown: 'desktop-timing' },
    { name: 'phone', use: PHONE, grepInvert: TIMING, teardown: 'phone-timing' },
    { name: 'desktop-timing', use: DESKTOP, grep: TIMING, workers: 1 },
    { name: 'phone-timing', use: PHONE, grep: TIMING, workers: 1 },
  ],
  webServer: base ? undefined : {
    // --ignore-lock keeps it in the foreground: Astro 7 sends a preview it sees an agent start to the background.
    command: `npx astro preview --port ${PORT} --ignore-lock`,
    cwd: '../..',
    url: `http://localhost:${PORT}/version.json`,
    reuseExistingServer: false,
  },
});
