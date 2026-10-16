import { chmod, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const projectRoot = resolve(import.meta.dirname, '../..')
const runnerFiles = [
  'scripts/lighthouse-runner.mjs',
  'scripts/lib/lighthouse-command-runner.mjs',
  'scripts/lib/lighthouse-summary.mjs',
  'scripts/lib/lighthouse-workspace.mjs',
  'config/lighthouse.cjs',
  'lighthouserc.cjs',
  'lighthouserc.mobile.cjs',
]
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

export type LighthouseFixture = { root: string; external: string; bin: string }
export type LighthouseRun = {
  commands: Array<{ command: string }>
  failure: string | null
  rawReports: boolean
  workspaceRemoved: boolean
}

const lhci = `#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
const mode = (await readFile(resolve('scripts/fixture-mode.txt'), 'utf8')).trim()
const command = process.argv[2]
const port = process.env.LHCI_PORT || '4400'
const origin = 'http://127.0.0.1:' + port
const routeList = ${JSON.stringify(routes)}
const output = resolve(process.env.LHCI_REPORT_DIRECTORY || '.lighthouseci')
if ((mode === 'collect-fail' && command === 'collect') || (mode === 'upload-fail' && command === 'upload')) {
  await mkdir(resolve('.lighthouseci'), { recursive: true })
  await writeFile(resolve('.lighthouseci', command + '-failure.json'), JSON.stringify({ command, mode }))
  process.exit(command === 'collect' ? 31 : 32)
}
if (command === 'collect') {
  await mkdir(output, { recursive: true })
  const selected = mode === 'route' ? routeList.slice(0, -1) : routeList
  const manifest = []
  for (const [routeIndex, route] of selected.entries()) {
    const count = mode === 'sample' && routeIndex === 0 ? 2 : 3
    for (let sample = 0; sample < count; sample += 1) {
      const report = {
        requestedUrl: origin + route,
        finalUrl: mode === 'final-origin' && routeIndex === 0 ? 'http://127.0.0.1:4499' + route : origin + route,
        runtimeError: mode === 'runtime' && routeIndex === 0 && sample === 0 ? { code: 'fixture_runtime_error' } : undefined,
        configSettings: { throttlingMethod: 'provided', formFactor: 'desktop', screenEmulation: null },
        userAgent: 'lighthouse-fixture', lighthouseVersion: 'fixture',
        audits: {
          'http-status-code': { score: mode === 'http' && routeIndex === 0 ? 0 : 1 },
          'largest-contentful-paint': { numericValue: sample + 1 },
          'total-blocking-time': { numericValue: sample + 2 },
          'cumulative-layout-shift': { numericValue: (sample + 1) / 100 },
          'total-byte-weight': { numericValue: 1000 + sample },
          'network-requests': { details: { items: [{ url: origin + route }] } },
        },
        categories: {
          performance: { score: [0.6, 0.8, 0.7][sample] },
          accessibility: { score: [0.8, 0.9, 0.85][sample] },
          'best-practices': { score: [0.8, 0.9, 0.85][sample] },
          seo: { score: [0.8, 0.9, 0.85][sample] },
        },
      }
      const jsonPath = join(output, 'report-' + routeIndex + '-' + sample + '.json')
      await writeFile(jsonPath, JSON.stringify(report))
      manifest.push({ jsonPath })
    }
  }
  await writeFile(join(output, 'manifest.json'), JSON.stringify(manifest))
}
if (command === 'assert' && mode === 'assert-fail') process.exit(17)
`

const npm = `#!/usr/bin/env node
import { access, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
try {
  await access('scripts/build-fail.txt')
  console.error('fixture_build_failure')
  process.exit(19)
} catch {}
await writeFile('scripts/build-ran.txt', 'ok\\n')
await writeFile(join(process.env.LHCI_REPORT_DIRECTORY, 'build-env.json'), JSON.stringify({
  CI: process.env.CI,
  DEPLOY_ENVIRONMENT: process.env.DEPLOY_ENVIRONMENT,
  PUBLIC_SITE_URL: process.env.PUBLIC_SITE_URL,
  LHCI_MODE: process.env.LHCI_MODE,
  LHCI_ENFORCE_THRESHOLDS: process.env.LHCI_ENFORCE_THRESHOLDS,
}))
`

export async function createLighthouseRunnerFixture(mode = 'ok'): Promise<LighthouseFixture> {
  const root = await mkdtemp(join(process.env.TMPDIR || tmpdir(), 'luna-lh-fixture-'))
  const external = await mkdtemp(join(process.env.TMPDIR || tmpdir(), 'luna-lh-outside-'))
  for (const directory of [
    'config',
    'server',
    'scripts/lib',
    'src',
    'public',
    'node_modules/.bin',
    'output',
  ])
    await mkdir(join(root, directory), { recursive: true })
  for (const file of runnerFiles) {
    const destination = join(root, file)
    await mkdir(resolve(destination, '..'), { recursive: true })
    await writeFile(destination, await readFile(join(projectRoot, file)))
  }
  await writeFile(join(root, 'package.json'), '{"type":"module"}\n')
  await writeFile(
    join(root, 'package-lock.json'),
    '{"name":"fixture","lockfileVersion":3,"packages":{}}\n'
  )
  await writeFile(join(root, 'tsconfig.json'), '{}\n')
  await writeFile(join(root, 'astro.config.mjs'), 'export default {}\n')
  await writeFile(join(root, 'server.mjs'), '')
  await writeFile(join(root, 'output/capacity-baseline.json'), '{}\n')
  await writeFile(join(root, 'src/index.html'), '<!doctype html>\n')
  await writeFile(join(root, 'public/index.html'), '<!doctype html>\n')
  await writeFile(join(root, 'server/index.mjs'), '')
  await writeFile(join(root, 'scripts/fixture-mode.txt'), mode)
  if (mode === 'build-fail') await writeFile(join(root, 'scripts/build-fail.txt'), 'fail\n')
  await writeFile(join(root, 'node_modules/.bin/lhci'), lhci)
  await chmod(join(root, 'node_modules/.bin/lhci'), 0o755)
  const bin = join(root, 'fake-bin')
  await mkdir(bin)
  await writeFile(join(bin, 'npm'), npm)
  await chmod(join(bin, 'npm'), 0o755)
  return { root, external, bin }
}

export async function runFixture(
  fixture: LighthouseFixture,
  device = 'desktop',
  extraEnv: Record<string, string> = {}
) {
  return spawnSync(
    process.execPath,
    [join(fixture.root, 'scripts/lighthouse-runner.mjs'), device],
    {
      cwd: fixture.root,
      env: {
        ...process.env,
        PATH: `${fixture.bin}:${process.env.PATH || ''}`,
        TMPDIR: process.env.TMPDIR || tmpdir(),
        ...extraEnv,
      },
      encoding: 'utf8',
      timeout: 30000,
    }
  )
}

export async function readRun(fixture: LighthouseFixture): Promise<LighthouseRun> {
  const [runId] = await readdir(join(fixture.root, 'output/lighthouse'))
  return JSON.parse(
    await readFile(join(fixture.root, 'output/lighthouse', runId, 'run.json'), 'utf8')
  )
}

export async function readSummary(fixture: LighthouseFixture) {
  return readDeviceSummary(fixture, 'desktop')
}

export async function readDeviceSummary(fixture: LighthouseFixture, device: string) {
  const [runId] = await readdir(join(fixture.root, 'output/lighthouse'))
  return JSON.parse(
    await readFile(join(fixture.root, 'output/lighthouse', runId, device, 'summary.json'), 'utf8')
  )
}

export async function readReportRoot(fixture: LighthouseFixture) {
  const [runId] = await readdir(join(fixture.root, 'output/lighthouse'))
  return join(fixture.root, 'output/lighthouse', runId)
}

export async function removeFixture(fixture: LighthouseFixture) {
  await rm(fixture.root, { recursive: true, force: true })
  await rm(fixture.external, { recursive: true, force: true })
}

export async function addExternalSymlink(fixture: LighthouseFixture, rootName: string) {
  await writeFile(join(fixture.external, 'escape.txt'), 'outside\n')
  await symlink(join(fixture.external, 'escape.txt'), join(fixture.root, rootName, 'escape-link'))
}
