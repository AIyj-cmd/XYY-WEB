import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { assessCapacity, inspectCapacityPaths } from './lib/capacity-guard.mjs'

function args(argv) {
  const result = { paths: [] }
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index]
    if (value === '--path') result.paths.push(argv[++index])
    else if (value.startsWith('--')) result[value.slice(2)] = argv[++index]
    else throw new Error(`unexpected_argument:${value}`)
  }
  return result
}

export async function loadBaseline(path) {
  let baseline
  try {
    baseline = JSON.parse(await readFile(path, 'utf8'))
  } catch (error) {
    if (error?.code === 'ENOENT')
      throw new Error(`capacity_baseline_measurement_required:${path}`, { cause: error })
    throw error
  }
  if (
    baseline?.schemaVersion !== 1 ||
    typeof baseline.devices !== 'object' ||
    baseline.devices === null
  ) {
    throw new Error(`invalid_capacity_baseline:${path}`)
  }
  const peakBytesByDevice = {}
  const peakInodesByDevice = {}
  for (const [deviceId, sample] of Object.entries(baseline.devices)) {
    if (
      !Number.isSafeInteger(sample?.peakBytes) ||
      sample.peakBytes < 0 ||
      !Number.isSafeInteger(sample?.peakInodes) ||
      sample.peakInodes < 0
    ) {
      throw new Error(`invalid_capacity_baseline_for_device:${deviceId}`)
    }
    peakBytesByDevice[deviceId] = sample.peakBytes
    peakInodesByDevice[deviceId] = sample.peakInodes
  }
  return { peakBytesByDevice, peakInodesByDevice }
}

export async function preflight({ scope, paths, baselineFile }) {
  if (!['local', 'remote'].includes(scope) || paths.length === 0 || !baselineFile) {
    throw new Error(
      'usage: --scope local|remote --baseline-file file --path directory [--path directory]'
    )
  }
  const baseline = await loadBaseline(baselineFile)
  const devices = await inspectCapacityPaths(paths)
  const report = assessCapacity(devices, { scope, ...baseline })
  const blocked = report.filter((device) => !device.ok)
  if (blocked.length) {
    throw new Error(`capacity_preflight_blocked:${JSON.stringify(blocked)}`)
  }
  return report
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = args(process.argv.slice(2))
    const report = await preflight({
      scope: options.scope,
      paths: options.paths,
      baselineFile: options['baseline-file'],
    })
    console.log(JSON.stringify({ status: 'ok', scope: options.scope, devices: report }))
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}
