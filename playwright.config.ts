import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  retries: 1,
  use: {
    baseURL: 'https://simple-orm.vercel.app',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  reporter: [
    ['list'],
    ['json', { outputFile: 'tests/results.json' }],
    ['html', { outputFolder: 'tests/report', open: 'never' }],
  ],
  projects: [
    { name: 'api', testDir: './tests', testMatch: 'api.spec.ts' },
    { name: 'e2e', testDir: './tests', testMatch: 'e2e.spec.ts' },
    { name: 'lighthouse', testDir: './tests', testMatch: 'lighthouse.spec.ts' },
  ],
})
