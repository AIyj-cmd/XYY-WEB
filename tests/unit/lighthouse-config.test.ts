import { createRequire } from 'node:module'
import { afterEach, describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const { createConfig, routes } = require('../../config/lighthouse.cjs') as {
  createConfig: (options: { device: string; port: number }) => any
  routes: string[]
}

afterEach(() => {
  delete process.env.LHCI_MODE
  delete process.env.LHCI_ENFORCE_THRESHOLDS
})

describe('Lighthouse CI configuration contract', () => {
  it('uses the same eight loopback routes and three runs on desktop and mobile', () => {
    const desktop = createConfig({ device: 'desktop', port: 4400 })
    const mobile = createConfig({ device: 'mobile', port: 4401 })

    expect(routes).toEqual([
      '/',
      '/product',
      '/about',
      '/xiefu-yuncang',
      '/b2b-mendian-cangpei',
      '/houzheng-xiufu',
      '/contact',
      '/en/contact',
    ])
    expect(desktop.ci.collect.numberOfRuns).toBe(3)
    expect(mobile.ci.collect.numberOfRuns).toBe(3)
    expect(desktop.ci.collect.url).toEqual(routes.map((route) => `http://127.0.0.1:4400${route}`))
    expect(mobile.ci.collect.url).toEqual(routes.map((route) => `http://127.0.0.1:4401${route}`))
    expect(mobile.ci.collect.settings.screenEmulation).toMatchObject({
      mobile: true,
      width: 390,
      height: 844,
    })
  })

  it('uses warn assertions by default and median aggregation for every metric', () => {
    const config = createConfig({ device: 'desktop', port: 4400 })

    for (const [level, assertion] of Object.values(config.ci.assert.assertions) as any[]) {
      expect(level).toBe('warn')
      expect(assertion.aggregationMethod).toBe('median')
    }
  })

  it('requires complete thresholds and switches native assertions to errors in enforce mode', () => {
    process.env.LHCI_MODE = 'enforce'
    process.env.LHCI_ENFORCE_THRESHOLDS = JSON.stringify({
      performance: 0.8,
      accessibility: 0.9,
      bestPractices: 0.9,
      seo: 0.9,
      lcp: 2500,
      tbt: 300,
      cls: 0.1,
    })
    const config = createConfig({ device: 'mobile', port: 4401 })

    for (const [level, assertion] of Object.values(config.ci.assert.assertions) as any[]) {
      expect(level).toBe('error')
      expect(assertion.aggregationMethod).toBe('median')
    }
    expect(config.ci.assert.assertions['largest-contentful-paint'][1].maxNumericValue).toBe(2500)
  })
})
