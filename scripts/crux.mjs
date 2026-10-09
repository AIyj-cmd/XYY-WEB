import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { URL } from 'node:url'

const metrics = {
  largest_contentful_paint: { name: 'LCP', unit: 'ms', good: 2500 },
  interaction_to_next_paint: { name: 'INP', unit: 'ms', good: 200 },
  cumulative_layout_shift: { name: 'CLS', unit: 'score', good: 0.1 },
}
const timeoutMs = 10000

function args(argv) {
  const values = { formFactor: 'both' }
  for (let index = 0; index < argv.length; index += 1) {
    const option = argv[index]
    if (!['--origin', '--url', '--form-factor', '--output'].includes(option))
      throw new Error(`unexpected_argument:${option}`)
    values[option.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] =
      argv[++index]
  }
  if (Boolean(values.origin) === Boolean(values.url))
    throw new Error('provide_exactly_one_of_origin_or_url')
  if (!['PHONE', 'DESKTOP', 'both'].includes(values.formFactor))
    throw new Error('invalid_form_factor')
  const parsed = new URL(values.origin ?? values.url)
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('invalid_target_protocol')
  return values
}

function p75(record, metric) {
  const value = record.metrics?.[metric]?.percentiles?.p75
  if (typeof value !== 'number' && typeof value !== 'string')
    throw new Error(`missing_p75:${metric}`)
  if (typeof value === 'string' && !value.trim()) throw new Error(`invalid_p75:${metric}`)
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) throw new Error(`invalid_p75:${metric}`)
  return parsed
}

function collectionPeriod(record) {
  const period = record?.collectionPeriod
  if (!period || typeof period !== 'object') throw new Error('invalid_collection_period')
  const first = dateValue(period.firstDate, 'first')
  const last = dateValue(period.lastDate, 'last')
  if (first > last) throw new Error('invalid_collection_period_order')
  return period
}

function dateValue(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error(`invalid_collection_period_${label}`)
  const { year, month, day } = value
  if (![year, month, day].every(Number.isInteger))
    throw new Error(`invalid_collection_period_${label}`)
  const date = new Date(Date.UTC(year, month - 1, day))
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  )
    throw new Error(`invalid_collection_period_${label}`)
  return date.getTime()
}

function result(record, target, formFactor) {
  if (!record || typeof record !== 'object') throw new Error('invalid_crux_record')
  return {
    status: 'observed',
    granularity: target.origin ? 'origin' : 'url',
    target: target.origin ?? target.url,
    formFactor,
    collectionPeriod: collectionPeriod(record),
    metrics: Object.fromEntries(
      Object.entries(metrics).map(([metric, details]) => [
        details.name,
        { p75: p75(record, metric), unit: details.unit, goodThreshold: details.good },
      ])
    ),
  }
}

async function query(target, formFactor, key) {
  const requestTarget = target.origin ? { origin: target.origin } : { url: target.url }
  const controller = new globalThis.AbortController()
  let timer
  const request = (async () => {
    const response = await fetch(
      `https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${key}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ ...requestTarget, formFactor, metrics: Object.keys(metrics) }),
      }
    )
    if (response.ok) return result((await response.json()).record, target, formFactor)
    const body = await response.json().catch(() => ({}))
    const status = body.error?.status
    if (response.status === 404 && status === 'NOT_FOUND')
      return { status: 'no_data', granularity: target.origin ? 'origin' : 'url', formFactor }
    throw new Error(`crux_api_error:http_${response.status}:${status ?? 'unknown'}`)
  })()
  const timeout = new Promise((_, reject) => {
    timer = globalThis.setTimeout(() => {
      controller.abort()
      reject(new Error('crux_api_timeout'))
    }, timeoutMs)
  })
  try {
    return await Promise.race([request, timeout])
  } catch (error) {
    if (error instanceof Error && error.message === 'crux_api_timeout') throw error
    if (error instanceof Error && /^(crux_api_error|invalid_|missing_)/.test(error.message))
      throw error
    throw new Error('crux_network_error', { cause: error })
  } finally {
    globalThis.clearTimeout(timer)
  }
}

async function main() {
  const target = args(process.argv.slice(2))
  const key = process.env.CRUX_API_KEY
  if (!key) throw new Error('crux_api_key_required')
  const formFactors = target.formFactor === 'both' ? ['PHONE', 'DESKTOP'] : [target.formFactor]
  const observations = await Promise.all(
    formFactors.map((formFactor) => query(target, formFactor, key))
  )
  const output = { schemaVersion: 1, generatedAt: new Date().toISOString(), observations }
  if (target.output) {
    const path = resolve(target.output)
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, `${JSON.stringify(output, null, 2)}\n`)
  }
  console.log(JSON.stringify(output, null, 2))
  if (observations.some(({ status }) => status !== 'observed')) process.exitCode = 2
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
