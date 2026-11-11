import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  // Existing gameplay checks use Polish; language-selection checks override this explicitly.
  use: { baseURL: 'http://127.0.0.1:4173', viewport: { width: 1440, height: 900 }, channel: 'chrome', locale: 'pl-PL' },
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
});
