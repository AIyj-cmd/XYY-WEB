import { access, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { assessCapacity, GIB, inspectCapacityPaths } from '../../scripts/lib/capacity-guard.mjs'
import { measureBaseline } from '../../scripts/capacity-baseline.mjs'
import { createMediaManifest } from '../../scripts/media-manifest.mjs'

async function fixture(name: string) {
  const path = join(tmpdir(), `xyy-${name}-${Date.now()}-${Math.random().toString(16).slice(2)}`)
  await mkdir(path, { recursive: true })
  return path
}

describe('capacity maintenance safeguards', () => {
  it('merges paths on the same device and blocks byte or inode shortages', async () => {
    const stats = new Map([
      ['/work', { dev: 1 }],
      ['/tmp', { dev: 1 }],
      ['/other', { dev: 2 }],
    ])
    const filesystems = new Map([
      ['/work', { bsize: 1, bavail: 4 * GIB, ffree: 2_000 }],
      ['/tmp', { bsize: 1, bavail: 3 * GIB, ffree: 1_500 }],
      ['/other', { bsize: 1, bavail: 2 * GIB, ffree: 500 }],
    ])
    const devices = await inspectCapacityPaths(['/work', '/tmp', '/other'], {
      statPath: async (path: any) => stats.get(path as string) as any,
      statFileSystem: async (path: any) => filesystems.get(path as string) as any,
    })
    expect(devices).toHaveLength(2)
    const result = assessCapacity(devices, {
      scope: 'local',
      peakBytesByDevice: { '1': 2 * GIB, '2': 0 },
      peakInodesByDevice: { '1': 100, '2': 100 },
    })
    expect(result.find((device: any) => device.deviceId === '1')?.ok).toBe(true)
    expect(result.find((device: any) => device.deviceId === '2')?.ok).toBe(false)
    expect(result.find((device: any) => device.deviceId === '2')?.requiredInodes).toBe(1024)
  })

  it('uses the remote 2 GiB floor and 25 percent measured peak margin', () => {
    const [result] = assessCapacity(
      [{ deviceId: '9', paths: ['/remote'], freeBytes: 3 * GIB, freeInodes: 5_000 }],
      { scope: 'remote', peakBytesByDevice: { '9': 3 * GIB }, peakInodesByDevice: { '9': 2_000 } }
    )
    expect(result.requiredBytes).toBe(Math.ceil(3 * GIB * 1.25))
    expect(result.requiredInodes).toBe(2500)
    expect(result.ok).toBe(false)
  })

  it('fails within a bounded interval when the measured child is terminated by a signal', async () => {
    const root = await fixture('baseline-signal')
    const output = join(root, 'baseline.json')
    const capacity = [{ deviceId: 'test', paths: [root], freeBytes: 4 * GIB, freeInodes: 2_000 }]
    const run = measureBaseline({
      paths: [root],
      output,
      command: `${process.execPath} -e "process.kill(process.pid, 'SIGTERM')"`,
      intervalMs: 5,
      inspect: async () => capacity,
      assess: () => [{ ...capacity[0], ok: true }],
    })
    try {
      await expect(
        Promise.race([
          run,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('baseline_signal_timeout')), 1_000)
          ),
        ])
      ).rejects.toThrow('capacity_baseline_command_failed')
      await expect(access(output)).rejects.toThrow()
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('checks the floor before launching a first-run child command', async () => {
    const root = await fixture('baseline-floor')
    const started = join(root, 'started')
    try {
      await expect(
        measureBaseline({
          paths: [root],
          output: join(root, 'baseline.json'),
          command: `${process.execPath} -e "require('node:fs').writeFileSync('${started}', 'started')"`,
          inspect: async () => [{ deviceId: 'test', paths: [root], freeBytes: 0, freeInodes: 0 }],
          assess: () => [{ ok: false }],
        })
      ).rejects.toThrow('capacity_baseline_floor_blocked')
      await expect(access(started)).rejects.toThrow()
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('marks a first-run child as measured while writing a separate workload baseline', async () => {
    const root = await fixture('baseline-first-run')
    const marker = join(root, 'marker')
    const output = join(root, 'npm-ci-baseline.json')
    const capacity = [{ deviceId: 'test', paths: [root], freeBytes: 4 * GIB, freeInodes: 2_000 }]
    try {
      await measureBaseline({
        paths: [root],
        output,
        command: `${process.execPath} -e "require('node:fs').writeFileSync('${marker}', process.env.CAPACITY_BASELINE_MEASUREMENT)"`,
        inspect: async () => capacity,
        assess: () => [{ ...capacity[0], ok: true }],
      })
      await expect(readFile(marker, 'utf8')).resolves.toBe('true')
      await expect(readFile(output, 'utf8')).resolves.toContain('"schemaVersion": 1')
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})

describe('media manifest', () => {
  it('records bytes, checksums, source references and Git ownership state without changing media', async () => {
    const root = await fixture('manifest')
    const publicDirectory = join(root, 'public')
    try {
      await mkdir(join(publicDirectory, 'assets'), { recursive: true })
      await writeFile(join(publicDirectory, 'assets', 'sample.txt'), 'media')
      await writeFile(join(root, 'page.astro'), '<img src="/assets/sample.txt">')
      const [entry] = await createMediaManifest({ publicDirectory, sourceRoot: root })
      expect(entry).toMatchObject({
        path: 'public/assets/sample.txt',
        bytes: 5,
        references: ['page.astro'],
        git: { tracked: false, lastCommit: null },
      })
      expect(entry.sha256).toHaveLength(64)
      expect(await readFile(join(publicDirectory, 'assets', 'sample.txt'), 'utf8')).toBe('media')
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
