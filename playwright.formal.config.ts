import { defineConfig, devices } from '@playwright/test'
import { randomBytes } from 'node:crypto'

const port = process.env.PLAYWRIGHT_FORMAL_PORT ?? '4401'
const origin = `http://127.0.0.1:${port}`
const integrationToken = randomBytes(32).toString('base64url')
const environment =
  `DIRECTUS_URL=http://127.0.0.1:1 ` +
  `DIRECTUS_CONTENT_TOKEN=formal-content-check-only ` +
  `XIANSUO_API_URL=https://xiansuo-integration.test XIANSUO_INGEST_TOKEN=${integrationToken} ` +
  `PUBLIC_DIRECTUS_URL=http://127.0.0.1:1 ` +
  `PUBLIC_SITE_URL=https://56xyy.com ENABLE_DOMAIN_REDIRECTS=true PORT=${port}`

export default defineConfig({
  testDir: './tests/formal',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  reporter: [['list']],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: origin,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: `${environment} npm run build && ${environment} npm run start`,
    url: origin,
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
