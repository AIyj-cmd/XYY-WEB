module.exports = {
  ci: {
    collect: {
      startServerCommand:
        'HOST=127.0.0.1 PORT=4401 ENABLE_DOMAIN_REDIRECTS=false DIRECTUS_URL=http://127.0.0.1:9 DIRECTUS_CONTENT_TOKEN= XIANSUO_API_URL= XIANSUO_INGEST_TOKEN= npm run start',
      startServerReadyPattern: 'Server started',
      url: [
        'http://127.0.0.1:4401/',
        'http://127.0.0.1:4401/product',
        'http://127.0.0.1:4401/contact',
        'http://127.0.0.1:4401/en/contact',
      ],
      numberOfRuns: 1,
      settings: {
        chromeFlags: '--headless=new --no-sandbox',
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 390,
          height: 844,
          deviceScaleFactor: 1,
          disabled: false,
        },
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.75 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './output/lighthouse/mobile',
    },
  },
}
