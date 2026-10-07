import { stat, statfs } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

export const GIB = 1024 ** 3
export const LOCAL_MIN_FREE_BYTES = 3 * GIB
export const REMOTE_MIN_FREE_BYTES = 2 * GIB
export const MIN_FREE_INODES = 1024

async function existingPath(path, statPath = stat) {
  let candidate = resolve(path)
  for (;;) {
    try {
      await statPath(candidate)
      return candidate
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error
      const parent = dirname(candidate)
      if (parent === candidate) throw error
      candidate = parent
    }
  }
}

export async function inspectCapacityPaths(
  paths,
  { statPath = stat, statFileSystem = statfs } = {}
) {
  const devices = new Map()
  for (const input of paths) {
    const path = await existingPath(input, statPath)
    const metadata = await statPath(path)
    const filesystem = await statFileSystem(path)
    const key = String(metadata.dev)
    const blockSize = Number(filesystem.bsize)
    const record = devices.get(key) ?? {
      deviceId: key,
      paths: [],
      freeBytes: Number(filesystem.bavail) * blockSize,
      freeInodes: Number(filesystem.ffree),
    }
    record.paths.push(path)
    record.freeBytes = Math.min(record.freeBytes, Number(filesystem.bavail) * blockSize)
    record.freeInodes = Math.min(record.freeInodes, Number(filesystem.ffree))
    devices.set(key, record)
  }
  return [...devices.values()]
}

export function assessCapacity(
  devices,
  { scope, peakBytesByDevice = {}, peakInodesByDevice = {} }
) {
  const minimumFreeBytes = scope === 'remote' ? REMOTE_MIN_FREE_BYTES : LOCAL_MIN_FREE_BYTES
  return devices.map((device) => {
    const peakBytes = Number(peakBytesByDevice[device.deviceId] ?? 0)
    const peakInodes = Number(peakInodesByDevice[device.deviceId] ?? 0)
    if (
      !Number.isSafeInteger(peakBytes) ||
      peakBytes < 0 ||
      !Number.isSafeInteger(peakInodes) ||
      peakInodes < 0
    ) {
      throw new Error(`invalid_capacity_baseline_for_device:${device.deviceId}`)
    }
    const requiredBytes = Math.max(minimumFreeBytes, Math.ceil(peakBytes * 1.25))
    const requiredInodes = Math.max(MIN_FREE_INODES, Math.ceil(peakInodes * 1.25))
    return {
      ...device,
      peakBytes,
      peakInodes,
      requiredBytes,
      requiredInodes,
      ok: device.freeBytes >= requiredBytes && device.freeInodes >= requiredInodes,
    }
  })
}
