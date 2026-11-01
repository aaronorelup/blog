// `npm run e2e:live`: live.spec.mjs against https://aaronorelup.com after a deploy (P step 4), desktop only.
import base from './playwright.config.mjs';

export default {
  ...base,
  testMatch: 'live.spec.mjs',
  testIgnore: [],
  webServer: undefined,
  use: { ...base.use, baseURL: 'https://aaronorelup.com' },
  projects: base.projects.filter((p) => p.name === 'desktop'),
};
