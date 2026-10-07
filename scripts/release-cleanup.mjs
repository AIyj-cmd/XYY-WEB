import { readFile, writeFile } from 'node:fs/promises'
import { applyReleaseRetention, planReleaseRetention } from './lib/release-retention.mjs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

function args(argv) {
  const result = {}
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index]
    if (value === '--apply') result.apply = true
    else if (value.startsWith('--')) result[value.slice(2)] = argv[++index]
    else throw new Error(`unexpected_argument:${value}`)
  }
  return result
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = args(process.argv.slice(2))
    if (options.apply && !options.plan)
      throw new Error('release_cleanup_apply_requires_preview_plan')
    const plan = options.apply
      ? JSON.parse(await readFile(options.plan, 'utf8'))
      : await planReleaseRetention({
          releasesDirectory: options['releases-dir'],
          currentLink: options['current-link'],
          previousFile: options['previous-file'],
          legacyDirectory: options['legacy-dir'],
          keep: Number(options.keep ?? 5),
          pinned: options.pinned ?? '',
          pinnedFile: options['pinned-file'],
        })
    const candidates = plan.entries.filter((entry) => !entry.protected).map((entry) => entry.id)
    if (options.apply) {
      console.log(JSON.stringify({ mode: 'apply', deleted: await applyReleaseRetention(plan) }))
    } else {
      if (options.output)
        await writeFile(options.output, `${JSON.stringify(plan, null, 2)}\n`, { flag: 'wx' })
      console.log(JSON.stringify({ mode: 'preview', candidates }))
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}
