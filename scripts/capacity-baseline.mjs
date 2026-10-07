import { writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
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

export async function measureBaseline({
  paths,
  command,
  output,
  scope = 'local',
  intervalMs = 250,
  inspect = inspectCapacityPaths,
  assess = assessCapacity,
}) {
  if (!command || !output || paths.length === 0)
    throw new Error('usage: --command command --output file --path directory [--path directory]')
  if (!['local', 'remote'].includes(scope)) throw new Error('invalid_capacity_scope')
  const initial = await inspect(paths)
  if (assess(initial, { scope }).some((device) => !device.ok)) {
    throw new Error('capacity_baseline_floor_blocked')
  }
  const peak = new Map(
    initial.map((device) => [device.deviceId, { ...device, peakBytes: 0, peakInodes: 0 }])
  )
  const sample = async () => {
    const devices = await inspect(paths)
    if (assess(devices, { scope }).some((device) => !device.ok)) {
      throw new Error('capacity_baseline_floor_blocked')
    }
    for (const device of devices) {
      const record = peak.get(device.deviceId)
      if (!record) continue
      record.peakBytes = Math.max(record.peakBytes, record.freeBytes - device.freeBytes)
      record.peakInodes = Math.max(record.peakInodes, record.freeInodes - device.freeInodes)
    }
  }
  const child = spawn(command, {
    shell: true,
    stdio: 'inherit',
    detached: process.platform !== 'win32',
    env: { ...process.env, CAPACITY_BASELINE_MEASUREMENT: 'true' },
  })
  let childFinished = false
  const exited = new Promise((resolveExit, rejectExit) => {
    child.once('error', rejectExit)
    child.once('close', (code, signal) => {
      childFinished = true
      resolveExit(code ?? (signal ? 1 : 0))
    })
  })
  let monitoringError
  const monitor = (async () => {
    try {
      while (!childFinished) {
        await sample()
        await new Promise((resolveDelay) => setTimeout(resolveDelay, intervalMs))
      }
    } catch (error) {
      monitoringError = error
      if (child.pid) {
        if (process.platform === 'win32') child.kill('SIGTERM')
        else process.kill(-child.pid, 'SIGTERM')
      }
    }
  })()
  const exitCode = await exited
  await monitor
  if (monitoringError) throw monitoringError
  await sample()
  if (exitCode !== 0) throw new Error(`capacity_baseline_command_failed:${exitCode}`)
  const devices = Object.fromEntries(
    [...peak].map(([deviceId, record]) => [
      deviceId,
      { peakBytes: record.peakBytes, peakInodes: record.peakInodes },
    ])
  )
  await writeFile(
    output,
    `${JSON.stringify({ schemaVersion: 1, measuredAt: new Date().toISOString(), command, devices }, null, 2)}\n`
  )
  return devices
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = args(process.argv.slice(2))
    console.log(
      JSON.stringify(
        await measureBaseline({
          paths: options.paths,
          command: options.command,
          output: options.output,
          scope: options.scope,
        })
      )
    )
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}
