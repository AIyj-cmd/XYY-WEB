import { createRequire } from 'node:module'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
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

  it('passes the measured CI baseline into the isolated Lighthouse workspace and uploads run reports', async () => {
    const workflow = await readFile(resolve(process.cwd(), '.github/workflows/ci.yml'), 'utf8')
    const namedStep = (name: string) => {
      const marker = `      - name: ${name}\n`
      const start = workflow.indexOf(marker)
      expect(start, `workflow step not found: ${name}`).toBeGreaterThanOrEqual(0)
      const next = workflow.indexOf('\n      - name: ', start + marker.length)
      return workflow.slice(start, next === -1 ? workflow.length : next)
    }
    const lighthouseStep = namedStep('Collect median Lighthouse reports after production build')
    const desktopUpload = namedStep('Upload desktop Lighthouse report')
    const mobileUpload = namedStep('Upload mobile Lighthouse report')

    expect(lighthouseStep).toContain('set -euo pipefail')
    expect(lighthouseStep).toContain('capacity_dir="${RUNNER_TEMP}/xyy-capacity"')
    expect(lighthouseStep).toContain('lighthouse_tmp="${RUNNER_TEMP}/xyy-lighthouse-tmp"')
    expect(lighthouseStep).toContain('mkdir -p "$lighthouse_tmp"')
    expect(lighthouseStep).toMatch(
      /TMPDIR="\$lighthouse_tmp"\s*\\\s*\n\s*CAPACITY_BASELINE_FILE="\$\{capacity_dir\}\/verify-release-baseline\.json"\s*\\\s*\n\s*LHCI_CHROME_PATH="\$chrome_path" npm run test:lhci:all/
    )
    expect(lighthouseStep.match(/npm run test:lhci:all/g)).toHaveLength(1)
    expect(desktopUpload).toContain('path: output/lighthouse/*/desktop/')
    expect(mobileUpload).toContain('path: output/lighthouse/*/mobile/')
  })
})
