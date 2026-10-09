import { defineConfig, devices } from '@playwright/test'

const artifactDirectory =
  process.env.PLAYWRIGHT_ENGLISH_NEWS_ARTIFACTS_DIR ?? 'output/english-news/xyy-20260929-03/luna'

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/english-news*.spec.ts',
  timeout: 45_000,
  expect: { timeout: 7_000 },
  fullyParallel: false,
  outputDir: `${artifactDirectory}/test-results`,
  reporter: [
    ['list'],
    ['html', { outputFolder: `${artifactDirectory}/playwright-report`, open: 'never' }],
  ],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
