import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

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
const runner = resolve('scripts/lighthouse-runner.mjs')
const temporaryDirectories: string[] = []

async function createFixture() {
  const directory = await mkdtemp(join(tmpdir(), 'xyy-luna-lh-runner-'))
  temporaryDirectories.push(directory)
  const bin = join(directory, 'bin')
  await mkdir(bin)
  await writeFile(
    join(directory, 'lighthouserc.cjs'),
    `module.exports = { ci: { collect: { url: ${JSON.stringify(
      routes.map((route) => `http://127.0.0.1:4400${route}`)
    )} } } }\n`
  )
  await writeFile(
    join(directory, 'fake-npx.mjs'),
    `
    import { mkdir, writeFile } from 'node:fs/promises'
    import { resolve } from 'node:path'
    const mode = process.env.FIXTURE_MODE
    const command = process.argv[3]
    if (command === 'collect') {
      const output = resolve('output/lighthouse/desktop')
      await mkdir(output, { recursive: true })
      const urls = mode === 'route' ? ${JSON.stringify(
        routes.slice(0, -1).map((route) => `http://127.0.0.1:4400${route}`)
      )} : ${JSON.stringify(routes.map((route) => `http://127.0.0.1:4400${route}`))}
      const manifest = []
      for (const [routeIndex, url] of urls.entries()) {
        const count = mode === 'sample' && routeIndex === 0 ? 2 : 3
        for (let sample = 0; sample < count; sample += 1) {
          const value = sample === 1 ? 3 : sample === 2 ? 2 : 1
          const report = {
            requestedUrl: url,
            ...(mode === 'runtime' && routeIndex === 0 && sample === 0
              ? { runtimeError: { code: 'fixture_runtime_error' } }
              : {}),
            audits: {
              'http-status-code': { score: mode === 'http' && routeIndex === 0 ? 0 : 1 },
              'largest-contentful-paint': { numericValue: value },
              'total-blocking-time': { numericValue: value + 1 },
              'cumulative-layout-shift': { numericValue: value / 100 },
            },
            categories: {
              performance: { score: value / 3 },
              accessibility: { score: 0.9 },
              'best-practices': { score: 0.9 },
              seo: { score: 0.9 },
            },
          }
          const jsonPath = resolve(output, 'report-' + routeIndex + '-' + sample + '.json')
          await writeFile(jsonPath, JSON.stringify(report))
          manifest.push({ jsonPath })
        }
      }
      await writeFile(resolve(output, 'manifest.json'), JSON.stringify(manifest))
    }
    if (command === 'assert' && Number(process.env.FIXTURE_ASSERT_EXIT) !== 0) process.exit(1)
  `
  )
  await writeFile(
    join(bin, 'npx'),
    `#!/usr/bin/env node\nawait import(${JSON.stringify(join(directory, 'fake-npx.mjs'))})\n`
  )
  await chmod(join(bin, 'npx'), 0o755)
  return { directory, bin }
}

function runFixture(directory: string, bin: string, mode: string, assertExit: number) {
  return spawnSync(process.execPath, [runner, 'desktop'], {
    cwd: directory,
    env: {
      ...process.env,
      PATH: `${bin}:${process.env.PATH ?? ''}`,
      FIXTURE_MODE: mode,
      FIXTURE_ASSERT_EXIT: String(assertExit),
    },
    encoding: 'utf8',
  })
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true }))
  )
})

describe('Lighthouse runner contract', () => {
  it('summarizes three samples per route with native median values', async () => {
    const fixture = await createFixture()
    const result = runFixture(fixture.directory, fixture.bin, 'ok', 0)

    expect(result.status).toBe(0)
    const summary = JSON.parse(
      await readFile(join(fixture.directory, 'output/lighthouse/desktop/summary.json'), 'utf8')
    )
    expect(summary).toMatchObject({
      aggregation: 'median',
      runCount: 3,
      routeCount: 8,
    })
    expect(summary.routes[0].metrics).toMatchObject({
      lcp: 2,
      tbt: 3,
      cls: 0.02,
      performance: 2 / 3,
    })
  })

  it.each([
    ['route set', 'route'],
    ['sample count', 'sample'],
    ['runtime error', 'runtime'],
    ['HTTP error', 'http'],
  ])('hard-fails on %s fixture', async (_label, mode) => {
    const fixture = await createFixture()
    const result = runFixture(fixture.directory, fixture.bin, mode, 0)

    expect(result.status).not.toBe(0)
  })

  it('propagates a non-zero native assertion result after writing the summary', async () => {
    const fixture = await createFixture()
    const result = runFixture(fixture.directory, fixture.bin, 'ok', 1)

    expect(result.status).not.toBe(0)
    await expect(
      readFile(join(fixture.directory, 'output/lighthouse/desktop/summary.json'), 'utf8')
    ).resolves.toContain('"aggregation": "median"')
  })
})
