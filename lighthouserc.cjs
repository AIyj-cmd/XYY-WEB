module.exports = {
  ci: {
    collect: {
      startServerCommand: 'HOST=127.0.0.1 PORT=4400 ENABLE_DOMAIN_REDIRECTS=false npm run start',
      startServerReadyPattern: 'Server started',
      url: [
        'http://127.0.0.1:4400/',
        'http://127.0.0.1:4400/product',
        'http://127.0.0.1:4400/about',
      ],
      numberOfRuns: 1,
      settings: {
        chromeFlags: '--headless=new --no-sandbox',
        preset: 'desktop',
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
      outputDir: './output/lighthouse',
    },
  },
}
