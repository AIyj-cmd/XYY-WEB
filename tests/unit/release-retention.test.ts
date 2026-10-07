import { mkdir, readFile, rm, symlink, utimes, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  applyReleaseRetention,
  planReleaseRetention,
} from '../../scripts/lib/release-retention.mjs'

async function fixture(name: string) {
  const path = join(tmpdir(), `xyy-${name}-${Date.now()}-${Math.random().toString(16).slice(2)}`)
  await mkdir(path, { recursive: true })
  return path
}

describe('release retention safeguards', () => {
  it('previews only and precisely protects current, previous, pinned and newest releases', async () => {
    const root = await fixture('retention')
    const releases = join(root, 'releases')
    const current = join(root, 'current')
    const previous = join(root, 'previous.txt')
    try {
      await mkdir(releases)
      for (const [index, id] of ['one', 'two', 'three', 'four', 'five', 'six', 'seven'].entries()) {
        const directory = join(releases, id)
        await mkdir(directory)
        await utimes(directory, new Date(1_000 + index * 1_000), new Date(1_000 + index * 1_000))
      }
      await symlink(join(releases, 'three'), current)
      await writeFile(previous, `${join(releases, 'two')}\n`)
      const plan = await planReleaseRetention({
        releasesDirectory: releases,
        currentLink: current,
        previousFile: previous,
        legacyDirectory: root,
        keep: 2,
        pinned: 'one',
      })
      expect(plan.entries.filter((entry) => !entry.protected).map((entry) => entry.id)).toEqual([
        'five',
        'four',
      ])
      expect(await readFile(join(releases, 'four')).catch(() => 'present')).toBe('present')
      expect(await applyReleaseRetention(plan)).toEqual(['five', 'four'])
      await expect(readFile(join(releases, 'four'))).rejects.toThrow()
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('rejects symbolic-link release entries before any deletion plan', async () => {
    const root = await fixture('retention-symlink')
    const releases = join(root, 'releases')
    try {
      await mkdir(releases)
      await symlink(tmpdir(), join(releases, 'escape'))
      await expect(
        planReleaseRetention({
          releasesDirectory: releases,
          currentLink: join(root, 'missing'),
          keep: 5,
        })
      ).rejects.toThrow('unsafe_release_entry')
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('fails closed when a protected target changes after preview', async () => {
    const root = await fixture('retention-current-change')
    const releases = join(root, 'releases')
    const current = join(root, 'current')
    try {
      await mkdir(releases)
      for (const id of ['one', 'two', 'three', 'four', 'five', 'six'])
        await mkdir(join(releases, id))
      await symlink(join(releases, 'one'), current)
      const plan = await planReleaseRetention({
        releasesDirectory: releases,
        currentLink: current,
        keep: 5,
      })
      await rm(current)
      await symlink(join(releases, 'two'), current)
      await expect(applyReleaseRetention(plan)).rejects.toThrow('release_cleanup_plan_changed')
      await expect(readFile(join(releases, 'one'))).rejects.toThrow()
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('records a missing pinned file and rejects its later appearance before apply', async () => {
    const root = await fixture('retention-pinned-file')
    const releases = join(root, 'releases')
    const pinnedFile = join(root, 'pinned.txt')
    try {
      await mkdir(releases)
      for (const id of ['one', 'two', 'three', 'four', 'five', 'six'])
        await mkdir(join(releases, id))
      const plan = await planReleaseRetention({
        releasesDirectory: releases,
        keep: 5,
        pinned: 'one',
        pinnedFile,
      })
      expect(plan.pinnedFileMissing).toBe(true)
      expect(plan.protectedIds).toContain('one')
      await writeFile(pinnedFile, 'one\n')
      await expect(applyReleaseRetention(plan)).rejects.toThrow('release_cleanup_plan_changed')
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('protects the union of explicit and fixed-file release ids', async () => {
    const root = await fixture('retention-pinned-union')
    const releases = join(root, 'releases')
    const pinnedFile = join(root, 'pinned.txt')
    try {
      await mkdir(releases)
      for (const id of ['one', 'two', 'three', 'four', 'five', 'six', 'seven']) {
        await mkdir(join(releases, id))
      }
      await writeFile(pinnedFile, 'two\n')
      const plan = await planReleaseRetention({
        releasesDirectory: releases,
        keep: 1,
        pinned: 'one',
        pinnedFile,
      })
      expect(plan.protectedIds).toEqual(expect.arrayContaining(['one', 'two']))
      expect(plan.entries.find(({ id }) => id === 'one')?.protected).toBe(true)
      expect(plan.entries.find(({ id }) => id === 'two')?.protected).toBe(true)
      expect(plan.pinnedSha256).not.toBe(plan.pinnedFileSha256)
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
