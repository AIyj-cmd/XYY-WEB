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
  'ENABLE_DOMAIN_REDIRECTS=false DIRECTUS_URL=http://127.0.0.1:9 DIRECTUS_CONTENT_TOKEN= XIANSUO_API_URL= XIANSUO_INGEST_TOKEN='

function createConfig({ device, port }) {
  const mobile = device === 'mobile'
  const mode = process.env.LHCI_MODE ?? 'observe'
  if (!['observe', 'enforce'].includes(mode)) throw new Error('invalid_lhci_mode')
  const calibrated = mode === 'enforce' ? parseThresholds() : null
  const collect = {
    startServerCommand: `HOST=127.0.0.1 PORT=${port} ${offlineEnvironment} npm run start`,
    startServerReadyPattern: 'Server started',
    startServerReadyTimeout: 30000,
    url: routes.map((route) => `http://127.0.0.1:${port}${route}`),
    numberOfRuns: 3,
    settings: {
      chromeFlags: '--headless=new --no-sandbox',
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
        outputDir: `./output/lighthouse/${device}`,
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
