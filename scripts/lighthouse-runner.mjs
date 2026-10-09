import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
const devices = { desktop: 'lighthouserc.cjs', mobile: 'lighthouserc.mobile.cjs' }
const require = createRequire(import.meta.url)
const numeric = (value, label) => {
  if (!Number.isFinite(value)) throw new Error(`invalid_${label}`)
  return value
}

function args(argv) {
  const [device] = argv
  if (!devices[device] || argv.length !== 1)
    throw new Error('usage: lighthouse-runner.mjs desktop|mobile')
  return device
}

function metric(lhr, audit) {
  return numeric(lhr.audits?.[audit]?.numericValue, audit)
}

function median(values) {
  const sorted = [...values].sort((left, right) => left - right)
  const middle = sorted.length / 2
  return sorted.length % 2 ? sorted[Math.floor(middle)] : (sorted[middle - 1] + sorted[middle]) / 2
}

function execute(command, arguments_) {
  return new Promise((resolveCommand, rejectCommand) => {
    const child = spawn(command, arguments_, { stdio: 'inherit' })
    child.once('error', rejectCommand)
    child.once('exit', (code, signal) => {
      if (code === 0) resolveCommand()
      else rejectCommand(new Error(`lhci_${arguments_[0]}_failed:${code ?? signal ?? 'unknown'}`))
    })
  })
}

async function summarize(device, config) {
  const directory = resolve(`output/lighthouse/${device}`)
  const manifest = JSON.parse(await readFile(resolve(directory, 'manifest.json'), 'utf8'))
  const reports = await Promise.all(
    manifest.map(({ jsonPath }) => readFile(jsonPath, 'utf8').then(JSON.parse))
  )
  const grouped = new Map()
  for (const lhr of reports) {
    if (lhr.runtimeError) throw new Error(`lighthouse_runtime_error:${lhr.requestedUrl}`)
    if (lhr.audits?.['http-status-code']?.score !== 1)
      throw new Error(`http_status_error:${lhr.requestedUrl}`)
    const samples = grouped.get(lhr.requestedUrl) ?? []
    samples.push({
      lcp: metric(lhr, 'largest-contentful-paint'),
      tbt: metric(lhr, 'total-blocking-time'),
      cls: metric(lhr, 'cumulative-layout-shift'),
      performance: numeric(lhr.categories?.performance?.score, 'performance_score'),
      accessibility: numeric(lhr.categories?.accessibility?.score, 'accessibility_score'),
      bestPractices: numeric(lhr.categories?.['best-practices']?.score, 'best_practices_score'),
      seo: numeric(lhr.categories?.seo?.score, 'seo_score'),
    })
    grouped.set(lhr.requestedUrl, samples)
  }
  const expectedUrls = config.ci.collect.url
  const expected = new Set(expectedUrls)
  if (grouped.size !== expected.size || [...grouped].some(([url]) => !expected.has(url)))
    throw new Error('route_set_error')
  const routes = expectedUrls.map((url) => {
    const samples = grouped.get(url)
    if (samples.length !== 3) throw new Error(`sample_count_error:${url}:${samples.length}`)
    return {
      url,
      samples,
      metrics: Object.fromEntries(
        Object.keys(samples[0]).map((key) => [key, median(samples.map((sample) => sample[key]))])
      ),
    }
  })
  return {
    schemaVersion: 1,
    device,
    aggregation: 'median',
    runCount: 3,
    routeCount: routes.length,
    routes,
  }
}

async function main() {
  const device = args(process.argv.slice(2))
  const mode = process.env.LHCI_MODE ?? 'observe'
  if (!['observe', 'enforce'].includes(mode)) throw new Error('invalid_lhci_mode')
  const config = require(resolve(devices[device]))
  const lhci = process.platform === 'win32' ? 'npx.cmd' : 'npx'
  await execute(lhci, ['lhci', 'collect', `--config=${devices[device]}`])
  await execute(lhci, ['lhci', 'upload', `--config=${devices[device]}`])
  const summary = {
    mode,
    generatedAt: new Date().toISOString(),
    ...(await summarize(device, config)),
  }
  const path = resolve(`output/lighthouse/${device}/summary.json`)
  await writeFile(path, `${JSON.stringify(summary, null, 2)}\n`)
  console.log(
    `Lighthouse ${device}: ${summary.routeCount} routes × ${summary.runCount}; median summary: ${path}`
  )
  await execute(lhci, ['lhci', 'assert', `--config=${devices[device]}`])
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
