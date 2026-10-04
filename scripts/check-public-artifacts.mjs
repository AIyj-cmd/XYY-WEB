import { readdir } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../public')

export async function findPublicHtmlArtifacts(directory = root) {
  const artifacts = []

  async function visit(currentDirectory) {
    const entries = await readdir(currentDirectory, { withFileTypes: true })
    for (const entry of entries) {
      const path = resolve(currentDirectory, entry.name)
      if (entry.isDirectory()) {
        await visit(path)
      } else if (/\.html?$/i.test(entry.name)) {
        artifacts.push(relative(directory, path))
      }
    }
  }

  await visit(directory)
  return artifacts.sort()
}

export async function assertNoPublicHtmlArtifacts(directory = root) {
  const artifacts = await findPublicHtmlArtifacts(directory)
  if (artifacts.length > 0) {
    throw new Error(
      `Public HTML artifacts are forbidden:\n${artifacts.map((path) => `- ${path}`).join('\n')}`
    )
  }
}

async function main() {
  try {
    await assertNoPublicHtmlArtifacts()
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main()
}
