import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { lstat, readdir, readFile } from 'node:fs/promises'
import { relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const run = promisify(execFile)
const root = resolve(import.meta.dirname, '..')
const ignored = new Set(['.git', 'node_modules', 'dist', 'output'])

async function walk(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(path)))
    else if (entry.isFile()) files.push(path)
  }
  return files
}

function checksum(path) {
  return new Promise((resolveHash, reject) => {
    const hash = createHash('sha256')
    createReadStream(path)
      .on('error', reject)
      .on('data', (chunk) => hash.update(chunk))
      .on('end', () => resolveHash(hash.digest('hex')))
  })
}

async function gitOwnership(path) {
  const repositoryPath = relative(root, path)
  try {
    await run('git', ['ls-files', '--error-unmatch', '--', repositoryPath], { cwd: root })
    const { stdout } = await run('git', ['log', '-1', '--format=%H', '--', repositoryPath], {
      cwd: root,
    })
    return { tracked: true, lastCommit: stdout.trim() || null }
  } catch {
    return { tracked: false, lastCommit: null }
  }
}

export async function createMediaManifest({
  publicDirectory = resolve(root, 'public'),
  sourceRoot = root,
} = {}) {
  const sourceFiles = (await walk(sourceRoot)).filter(
    (path) => !path.startsWith(`${resolve(sourceRoot, 'public')}${sep}`)
  )
  const sourceText = await Promise.all(
    sourceFiles.map(async (path) => ({ path, text: await readFile(path, 'utf8').catch(() => '') }))
  )
  const files = await walk(publicDirectory)
  return Promise.all(
    files.map(async (path) => {
      const relativePublicPath = relative(publicDirectory, path).split(sep).join('/')
      const url = `/${relativePublicPath}`
      const references = sourceText
        .filter((source) => source.text.includes(url))
        .map((source) => relative(sourceRoot, source.path).split(sep).join('/'))
        .sort()
      return {
        path: `public/${relativePublicPath}`,
        url,
        bytes: (await lstat(path)).size,
        sha256: await checksum(path),
        references,
        git: await gitOwnership(path),
      }
    })
  )
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const output = process.argv[2]
  if (!output) throw new Error('usage: node scripts/media-manifest.mjs output.json')
  const files = await createMediaManifest()
  await (
    await import('node:fs/promises')
  ).writeFile(output, `${JSON.stringify({ schemaVersion: 1, files }, null, 2)}\n`)
  console.log(`media manifest written: ${output} (${files.length} files)`)
}
