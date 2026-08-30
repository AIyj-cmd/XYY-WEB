import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

export const isEqual = (left, right) => JSON.stringify(left) === JSON.stringify(right)

export function buildPatch(current, target, fields) {
  return Object.fromEntries(
    fields
      .filter((field) => !isEqual(current[field], target[field]))
      .map((field) => [field, target[field]])
  )
}

export function assertSync(condition, message) {
  if (!condition) throw new Error(message)
}

export function createCmsSyncRuntime({ directus, apply }) {
  let changeCount = 0

  async function patchRecord(collection, current, target, fields) {
    const patch = buildPatch(current, target, fields)
    if (Object.keys(patch).length === 0) return current

    changeCount += 1
    console.log(
      `${apply ? 'apply' : 'plan '} PATCH ${collection}/${current.id}: ${Object.keys(patch).join(', ')}`
    )
    if (!apply) return { ...current, ...patch }

    return directus.request('PATCH', `/items/${collection}/${current.id}`, patch)
  }

  async function createWarehouse(target) {
    changeCount += 1
    console.log(`${apply ? 'apply' : 'plan '} CREATE warehouses: ${target.name}`)
    if (!apply) return { id: `new:${target.name}`, ...target }

    const draft = await directus.request('POST', '/items/warehouses', {
      ...target,
      status: 'draft',
    })
    return directus.request('PATCH', `/items/warehouses/${draft.id}`, { status: 'published' })
  }

  async function writeBackup(snapshot, { includeDryRun = false } = {}) {
    if (!apply && !includeDryRun) return

    const backupDir = join(process.cwd(), 'output', 'cms-sync')
    const safeHost = directus.endpointLabel.replace(/[^a-zA-Z0-9.-]+/g, '_')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = join(backupDir, `${safeHost}-${timestamp}.json`)
    await mkdir(backupDir, { recursive: true })
    await writeFile(backupPath, `${JSON.stringify(snapshot, null, 2)}\n`, { mode: 0o600 })
    console.log(`backup ${backupPath}`)
  }

  return {
    patchRecord,
    createWarehouse,
    writeBackup,
    getChangeCount: () => changeCount,
  }
}
