// The behaviour suite (tests/e2e/INVENTORY.md lists every row). `npm run e2e` builds nothing: it serves the last
// `npm run build` with `astro preview`, or runs against E2E_BASE. targets.json is rewritten from dist/ before the
// specs are listed (they make one test per target). desktop is Chromium at 1440x900, phone WebKit as an iPhone 13.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

if (!process.env.TEST_WORKER_INDEX) {
  execFileSync(process.execPath, [fileURLToPath(new URL('../../scripts/tools/element-usage.mjs', import.meta.url))],
    { stdio: ['ignore', 'ignore', 'inherit'] });
}

const base = process.env.E2E_BASE;
const PORT = 4321;

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.mjs',
  testIgnore: base ? [] : ['live.spec.mjs'],
  timeout: 60_000,
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
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'phone', use: { ...devices['iPhone 13'] } },
  ],
  webServer: base ? undefined : {
    command: `npx astro preview --port ${PORT}`,
    cwd: '../..',
    url: `http://localhost:${PORT}/version.json`,
    reuseExistingServer: true,
  },
});
