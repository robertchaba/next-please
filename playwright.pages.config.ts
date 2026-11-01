import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/deployment',
  use: {
    baseURL: 'http://127.0.0.1:4174/next-please/',
    viewport: { width: 1440, height: 900 },
    channel: 'chrome',
  },
  webServer: {
    command: 'node tests/deployment/serve-pages.mjs',
    url: 'http://127.0.0.1:4174/next-please/',
    reuseExistingServer: !process.env.CI,
  },
});
