import { defineConfig, devices } from '@playwright/test'
import { randomBytes } from 'node:crypto'

const testPort = process.env.PLAYWRIGHT_PORT ?? '4399'
const testOrigin = `http://127.0.0.1:${testPort}`
const integrationToken = randomBytes(32).toString('base64url')
const testEnvironment =
  `DIRECTUS_URL=http://127.0.0.1:1 ` +
  `DIRECTUS_CONTENT_TOKEN=playwright-content-check-only ` +
  `XIANSUO_API_URL=https://xiansuo-integration.test XIANSUO_INGEST_TOKEN=${integrationToken} ` +
  `PUBLIC_DIRECTUS_URL=http://127.0.0.1:1 ` +
  `PUBLIC_SITE_URL=${testOrigin} ENABLE_DOMAIN_REDIRECTS=false PORT=${testPort}`

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  workers: process.env.CI ? 1 : undefined,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  reporter: [['list'], ['html', { outputFolder: 'output/playwright-report', open: 'never' }]],
  use: {
    baseURL: testOrigin,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `${testEnvironment} npm run build && ${testEnvironment} npm run start`,
    url: testOrigin,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
