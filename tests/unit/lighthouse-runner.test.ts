import { access, readFile, rm, writeFile } from 'node:fs/promises'
import { afterEach, describe, expect, it } from 'vitest'

import {
  createLighthouseRunnerFixture,
  readDeviceSummary,
  readReportRoot,
  readRun,
  readSummary,
  removeFixture,
  runFixture,
} from '../helpers/lighthouse-runner-fixture'

const fixtures: Awaited<ReturnType<typeof createLighthouseRunnerFixture>>[] = []

async function run(mode = 'ok', device = 'desktop', extraEnv = {}) {
  const fixture = await createLighthouseRunnerFixture(mode)
  fixtures.push(fixture)
  return { fixture, result: await runFixture(fixture, device, extraEnv) }
}

afterEach(async () => {
  await Promise.all(fixtures.splice(0).map(removeFixture))
})

describe('Lighthouse runner contract', () => {
  it('runs the real runner in an isolated workspace and summarizes native medians', async () => {
    const { fixture, result } = await run()

    expect(result.status, `${result.error?.message || ''}\n${result.stderr || ''}`).toBe(0)
    const summary = await readSummary(fixture)
    expect(summary).toMatchObject({ aggregation: 'median', runCount: 3, routeCount: 8 })
    expect(summary.routes[0].metrics).toMatchObject({
      lcp: 2,
      tbt: 3,
      cls: 0.02,
      performance: 0.7,
      accessibility: 0.85,
      bestPractices: 0.85,
      seo: 0.85,
    })
    const runRecord = await readRun(fixture)
    expect(runRecord.workspaceRemoved).toBe(true)
    expect(runRecord.commands.map((command) => command.command)).toMatchObject([
      'npm',
      expect.stringMatching(/\/xyy-lhci-[^/]+\/node_modules\/\.bin\/lhci$/),
      expect.stringMatching(/\/xyy-lhci-[^/]+\/node_modules\/\.bin\/lhci$/),
      expect.stringMatching(/\/xyy-lhci-[^/]+\/node_modules\/\.bin\/lhci$/),
    ])
    expect(runRecord.failure).toBeNull()
  })

  it.each([
    ['route set', 'route'],
    ['sample count', 'sample'],
    ['runtime error', 'runtime'],
    ['HTTP error', 'http'],
    ['final origin', 'final-origin'],
  ])('hard-fails on %s fixture', async (_label, mode) => {
    const { fixture, result } = await run(mode)

    expect(result.status).not.toBe(0)
    const runRecord = await readRun(fixture)
    expect(runRecord.failure).toMatch(
      /route_set_error|sample_count_error|runtime_error|http_status_error|final_origin_error/
    )
    expect(runRecord.workspaceRemoved).toBe(true)
  })

  it('propagates a non-zero native assertion result after writing the summary', async () => {
    const { fixture, result } = await run('assert-fail')

    expect(result.status).not.toBe(0)
    await expect(readDeviceSummary(fixture, 'desktop')).resolves.toMatchObject({ routeCount: 8 })
    const runRecord = await readRun(fixture)
    expect(runRecord.failure).toContain('lhci_assert_failed')
    expect(runRecord.workspaceRemoved).toBe(true)
  })

  it('keeps the raw failure visible when the isolated build fails', async () => {
    const { fixture } = await run('build-fail')

    const runRecord = await readRun(fixture)
    expect(runRecord.failure).toContain('lhci_run_failed:19')
    expect(runRecord.workspaceRemoved).toBe(true)
  })

  it.each([
    ['collect-fail', 'lhci_collect_failed:31'],
    ['upload-fail', 'lhci_upload_failed:32'],
  ])('copies raw reports when %s occurs', async (mode, expectedFailure) => {
    const { fixture, result } = await run(mode)

    expect(result.status).not.toBe(0)
    const runRecord = await readRun(fixture)
    expect(runRecord.failure).toContain(expectedFailure)
    expect(runRecord.rawReports).toBe(true)
    await expect(access(`${await readReportRoot(fixture)}/raw`)).resolves.toBeUndefined()
  })

  it('uses one build and one origin for all desktop and mobile runs', async () => {
    const { fixture, result } = await run('ok', 'all')

    expect(result.status).toBe(0)
    const runRecord = await readRun(fixture)
    expect(runRecord.commands.filter((command) => command.command === 'npm')).toHaveLength(1)
    expect(runRecord.commands).toHaveLength(7)
    await expect(readDeviceSummary(fixture, 'desktop')).resolves.toMatchObject({
      origin: 'http://127.0.0.1:4400',
    })
    await expect(readDeviceSummary(fixture, 'mobile')).resolves.toMatchObject({
      origin: 'http://127.0.0.1:4400',
    })
  })

  it('isolates a production parent and forwards enforce thresholds to child build', async () => {
    const thresholds = {
      performance: 0.81,
      accessibility: 0.91,
      bestPractices: 0.92,
      seo: 0.93,
      lcp: 2100,
      tbt: 250,
      cls: 0.08,
    }
    const { fixture, result } = await run('ok', 'desktop', {
      DEPLOY_ENVIRONMENT: 'production',
      PUBLIC_SITE_URL: 'https://production.example',
      LHCI_MODE: 'enforce',
      LHCI_ENFORCE_THRESHOLDS: JSON.stringify(thresholds),
    })

    expect(result.status).toBe(0)
    const env = JSON.parse(
      await readFile(`${await readReportRoot(fixture)}/build-env.json`, 'utf8')
    )
    expect(env).toMatchObject({
      CI: '1',
      DEPLOY_ENVIRONMENT: 'ci',
      PUBLIC_SITE_URL: 'http://127.0.0.1:4400',
      LHCI_MODE: 'enforce',
      LHCI_ENFORCE_THRESHOLDS: JSON.stringify(thresholds),
    })
  })

  it('uses the CI-selected baseline when the project default is absent', async () => {
    const fixture = await createLighthouseRunnerFixture()
    fixtures.push(fixture)
    const contents = '{"source":"runner-ci-selection"}\n'
    const selected = `${fixture.external}/verify-release-baseline.json`
    await rm(`${fixture.root}/output/capacity-baseline.json`)
    await writeFile(selected, contents)

    const result = await runFixture(fixture, 'desktop', { CAPACITY_BASELINE_FILE: selected })

    expect(result.status, `${result.error?.message || ''}\n${result.stderr || ''}`).toBe(0)
    const environment = JSON.parse(
      await readFile(`${await readReportRoot(fixture)}/build-env.json`, 'utf8')
    )
    expect(environment.capacityBaseline).toBe(contents)
  })
})
