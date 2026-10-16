const routes = [
  '/',
  '/product',
  '/about',
  '/xiefu-yuncang',
  '/b2b-mendian-cangpei',
  '/houzheng-xiufu',
  '/contact',
  '/en/contact',
]

const offlineEnvironment =
  'CI=1 DEPLOY_ENVIRONMENT=ci ENABLE_DOMAIN_REDIRECTS=false DIRECTUS_URL=http://127.0.0.1:9 DIRECTUS_CONTENT_TOKEN=local-fake-content PUBLIC_DIRECTUS_URL=http://127.0.0.1:9 XIANSUO_API_URL=http://127.0.0.1:9 XIANSUO_INGEST_TOKEN=local-fake-ingest'

function createConfig({
  device,
  port,
  origin: configuredOrigin,
  outputDirectory: configuredOutput,
} = {}) {
  const mobile = device === 'mobile'
  const activePort = Number(port ?? process.env.LHCI_PORT ?? (mobile ? 4401 : 4400))
  if (!Number.isInteger(activePort) || activePort < 1 || activePort > 65535)
    throw new Error('invalid_lhci_port')
  const origin = configuredOrigin ?? `http://127.0.0.1:${activePort}`
  const outputDirectory =
    configuredOutput ?? process.env.LHCI_REPORT_DIRECTORY ?? `./output/lighthouse/${device}`
  const mode = process.env.LHCI_MODE ?? 'observe'
  if (!['observe', 'enforce'].includes(mode)) throw new Error('invalid_lhci_mode')
  const calibrated = mode === 'enforce' ? parseThresholds() : null
  const collect = {
    startServerCommand: `HOST=127.0.0.1 PORT=${activePort} PUBLIC_SITE_URL=${origin} ${offlineEnvironment} npm run start`,
    startServerReadyPattern: 'Server started',
    startServerReadyTimeout: 30000,
    url: routes.map((route) => `${origin}${route}`),
    numberOfRuns: 3,
    settings: {
      chromeFlags: '--headless=new --no-sandbox',
      disableStorageReset: false,
      ...(mobile
        ? {
            formFactor: 'mobile',
            screenEmulation: {
              mobile: true,
              width: 390,
              height: 844,
              deviceScaleFactor: 1,
              disabled: false,
            },
          }
        : { preset: 'desktop' }),
    },
    ...(process.env.LHCI_CHROME_PATH ? { chromePath: process.env.LHCI_CHROME_PATH } : {}),
  }

  return {
    ci: {
      collect,
      assert: {
        assertions: createAssertions(mode, calibrated),
      },
      upload: {
        target: 'filesystem',
        outputDir: outputDirectory,
      },
    },
  }
}

function parseThresholds() {
  if (!process.env.LHCI_ENFORCE_THRESHOLDS) throw new Error('enforce_thresholds_required')
  const thresholds = JSON.parse(process.env.LHCI_ENFORCE_THRESHOLDS)
  for (const key of ['performance', 'accessibility', 'bestPractices', 'seo', 'lcp', 'tbt', 'cls']) {
    if (!Number.isFinite(thresholds[key])) throw new Error(`invalid_threshold_${key}`)
  }
  return thresholds
}

function createAssertions(mode, thresholds) {
  const level = mode === 'enforce' ? 'error' : 'warn'
  const minScore = (fallback, key) => thresholds?.[key] ?? fallback
  const maxNumericValue = (fallback, key) => thresholds?.[key] ?? fallback
  const median = { aggregationMethod: 'median' }
  return {
    'categories:performance': [level, { ...median, minScore: minScore(0.75, 'performance') }],
    'categories:accessibility': [level, { ...median, minScore: minScore(0.9, 'accessibility') }],
    'categories:best-practices': [level, { ...median, minScore: minScore(0.9, 'bestPractices') }],
    'categories:seo': [level, { ...median, minScore: minScore(0.9, 'seo') }],
    'largest-contentful-paint': [
      level,
      { ...median, maxNumericValue: maxNumericValue(4000, 'lcp') },
    ],
    'total-blocking-time': [level, { ...median, maxNumericValue: maxNumericValue(600, 'tbt') }],
    'cumulative-layout-shift': [
      level,
      { ...median, maxNumericValue: maxNumericValue(0.25, 'cls') },
    ],
  }
}

module.exports = { createConfig, routes }
