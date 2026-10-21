import { defineConfig, devices } from '@playwright/test'

const artifactDirectory =
  process.env.PLAYWRIGHT_NEWS_IMAGES_ARTIFACTS_DIR ??
  'output/mobile-news-images/xyy-20261021-03/luna'

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/news-body-images.spec.ts',
  timeout: 45_000,
  expect: { timeout: 7_000 },
  fullyParallel: false,
  outputDir: `${artifactDirectory}/test-results`,
  reporter: [
    ['list'],
    ['html', { outputFolder: `${artifactDirectory}/playwright-report`, open: 'never' }],
  ],
  use: { trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
