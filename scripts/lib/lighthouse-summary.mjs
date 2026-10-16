import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { URL } from 'node:url'

const numeric = (value, label) => {
  if (!Number.isFinite(value)) throw new Error(`invalid_${label}`)
  return value
}

const metric = (lhr, audit) => numeric(lhr.audits?.[audit]?.numericValue, audit)

function requestCount(lhr) {
  const items = lhr.audits?.['network-requests']?.details?.items
  if (!Array.isArray(items)) throw new Error('invalid_network_requests')
  return items.length
}

function median(values) {
  const sorted = [...values].sort((left, right) => left - right)
  const middle = sorted.length / 2
  return sorted.length % 2 ? sorted[Math.floor(middle)] : (sorted[middle - 1] + sorted[middle]) / 2
}

function origin(value, label) {
  try {
    return new URL(value).origin
  } catch {
    throw new Error(`invalid_${label}`)
  }
}

function requireSameOrigin(lhr, expectedOrigin) {
  if (origin(lhr.requestedUrl, 'requested_origin') !== expectedOrigin)
    throw new Error(`requested_origin_error:${lhr.requestedUrl}`)
  if (!lhr.finalUrl || origin(lhr.finalUrl, 'final_origin') !== expectedOrigin)
    throw new Error(`final_origin_error:${lhr.finalUrl ?? 'missing'}`)
}

export async function summarizeLighthouse(device, config, directory) {
  const manifest = JSON.parse(await readFile(join(directory, 'manifest.json'), 'utf8'))
  const reports = await Promise.all(
    manifest.map(({ jsonPath }) => readFile(jsonPath, 'utf8').then(JSON.parse))
  )
  const expectedUrls = config.ci.collect.url
  const expected = new Set(expectedUrls)
  const expectedOrigin = origin(expectedUrls[0], 'config_origin')
  const grouped = new Map()
  const finalOrigins = new Set()
  for (const lhr of reports) {
    requireSameOrigin(lhr, expectedOrigin)
    finalOrigins.add(origin(lhr.finalUrl, 'final_origin'))
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
      resourceBytes: metric(lhr, 'total-byte-weight'),
      requestCount: requestCount(lhr),
    })
    grouped.set(lhr.requestedUrl, samples)
  }
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
  const first = reports[0]
  const settings = config.ci.collect.settings ?? {}
  return {
    schemaVersion: 2,
    device,
    aggregation: 'median',
    runCount: 3,
    routeCount: routes.length,
    origin: expectedOrigin,
    finalOrigins: [...finalOrigins].sort(),
    collection: {
      chromeFlags: settings.chromeFlags ?? null,
      chromePath: config.ci.collect.chromePath ?? null,
      disableStorageReset: settings.disableStorageReset ?? null,
      throttlingMethod: first.configSettings?.throttlingMethod ?? null,
      throttling: first.configSettings?.throttling ?? null,
      formFactor: first.configSettings?.formFactor ?? null,
      screenEmulation: first.configSettings?.screenEmulation ?? null,
      browser: first.userAgent ?? null,
      lighthouseVersion: first.lighthouseVersion ?? null,
    },
    routes,
  }
}
