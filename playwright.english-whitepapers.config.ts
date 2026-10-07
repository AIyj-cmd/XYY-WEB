import { defineConfig, devices } from '@playwright/test'

const artifactDirectory =
  process.env.PLAYWRIGHT_ENGLISH_WHITEPAPERS_ARTIFACTS_DIR ?? 'output/english-whitepapers'

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/english-whitepapers*.spec.ts',
  timeout: 45_000,
  expect: { timeout: 7_000 },
  fullyParallel: false,
  outputDir: `${artifactDirectory}/test-results`,
  reporter: [['list']],
  use: { trace: 'off', screenshot: 'off' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
