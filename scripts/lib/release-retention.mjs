import { lstat, readdir, readFile, realpath, rm } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { basename, resolve, sep } from 'node:path'

const releaseId = /^[A-Za-z0-9._-]+$/
const inside = (path, root) => path === root || path.startsWith(`${root}${sep}`)
export function parsePinned(value = '') {
  const ids = value.split(',').filter(Boolean)
  if (ids.some((id) => !releaseId.test(id))) throw new Error('invalid_pinned_release_id')
  return new Set(ids)
}
async function identity(path) {
  const s = await lstat(path)
  return {
    path,
    dev: s.dev,
    ino: s.ino,
    mtimeMs: s.mtimeMs,
    size: s.size,
    directory: s.isDirectory(),
    symbolicLink: s.isSymbolicLink(),
  }
}
async function target(path, root) {
  if (!path) return
  try {
    const full = await realpath(path)
    if (!inside(full, root)) return
    const id = basename(full)
    if (!releaseId.test(id) || resolve(root, id) !== full) throw new Error('unsafe_release_target')
    return id
  } catch (error) {
    if (error?.code === 'ENOENT') return
    throw error
  }
}
async function entries(root) {
  const all = []
  for (const item of await readdir(root, { withFileTypes: true })) {
    if (!releaseId.test(item.name)) throw new Error(`unsafe_release_entry:${item.name}`)
    const entry = { id: item.name, ...(await identity(resolve(root, item.name))) }
    if (!entry.directory || entry.symbolicLink || (await realpath(entry.path)) !== entry.path)
      throw new Error(`unsafe_release_entry:${item.name}`)
    all.push(entry)
  }
  return all.sort((a, b) => b.mtimeMs - a.mtimeMs || a.id.localeCompare(b.id))
}
/**
 * @param {{
 *   releasesDirectory: string,
 *   currentLink?: string,
 *   previousFile?: string,
 *   legacyDirectory?: string,
 *   keep?: number,
 *   pinned?: string,
 *   pinnedFile?: string,
 * }} options
 */
export async function planReleaseRetention({
  releasesDirectory,
  currentLink = undefined,
  previousFile = undefined,
  legacyDirectory = undefined,
  keep = 5,
  pinned = '',
  pinnedFile = undefined,
}) {
  void legacyDirectory
  if (!Number.isSafeInteger(keep) || keep < 1) throw new Error('invalid_release_keep')
  const root = await realpath(releasesDirectory)
  const directPinned = parsePinned(pinned)
  let pinnedFileText = ''
  let pinnedFileMissing = false
  if (pinnedFile) {
    try {
      pinnedFileText = await readFile(pinnedFile, 'utf8')
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error
      pinnedFileMissing = true
    }
  }
  const protectedIds = new Set([
    ...directPinned,
    ...parsePinned(pinnedFileText.trim().replace(/\s+/g, ',')),
  ])
  const current = await target(currentLink, root)
  if (current) protectedIds.add(current)
  if (previousFile) {
    try {
      const previous = await target((await readFile(previousFile, 'utf8')).trim(), root)
      if (previous) protectedIds.add(previous)
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error
    }
  }
  const all = await entries(root),
    newest = new Set(all.slice(0, keep).map(({ id }) => id))
  return {
    schemaVersion: 1,
    releasesDirectory: root,
    root: await identity(root),
    currentLink: currentLink ?? null,
    previousFile: previousFile ?? null,
    keep,
    pinned,
    pinnedFile: pinnedFile ?? null,
    pinnedFileMissing,
    pinnedSha256: createHash('sha256').update(pinned).digest('hex'),
    pinnedFileSha256: createHash('sha256').update(pinnedFileText).digest('hex'),
    protectedIds: [...protectedIds].sort(),
    entries: all.map((entry) => ({
      ...entry,
      protected: protectedIds.has(entry.id) || newest.has(entry.id),
    })),
  }
}
export async function applyReleaseRetention(plan) {
  if (plan?.schemaVersion !== 1) throw new Error('invalid_release_cleanup_plan')
  const current = await planReleaseRetention(plan)
  if (JSON.stringify(current) !== JSON.stringify(plan))
    throw new Error('release_cleanup_plan_changed')
  const deletions = plan.entries.filter((entry) => !entry.protected)
  for (const entry of deletions) {
    const now = await identity(entry.path)
    if (
      JSON.stringify(now) !==
        JSON.stringify({
          path: entry.path,
          dev: entry.dev,
          ino: entry.ino,
          mtimeMs: entry.mtimeMs,
          size: entry.size,
          directory: true,
          symbolicLink: false,
        }) ||
      (await realpath(entry.path)) !== entry.path
    )
      throw new Error(`release_changed_before_cleanup:${entry.id}`)
    await rm(entry.path, { recursive: true, force: false })
  }
  return deletions.map(({ id }) => id)
}
