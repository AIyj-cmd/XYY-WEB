import { Buffer } from 'node:buffer'
import { readFile, readdir } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../public')
export const googleVerificationFileName = 'google4adb4e763f43adcd.html'
export const googleVerificationContents = Buffer.from(
  'google-site-verification: google4adb4e763f43adcd.html'
)

export async function findPublicHtmlArtifacts(directory = root) {
  const artifacts = []

  async function visit(currentDirectory) {
    const entries = await readdir(currentDirectory, { withFileTypes: true })
    for (const entry of entries) {
      const path = resolve(currentDirectory, entry.name)
      if (entry.isDirectory()) {
        await visit(path)
      } else if (/\.html?$/i.test(entry.name)) {
        const artifact = relative(directory, path)
        const content = await readFile(path)
        const approvedGoogleVerification =
          artifact === googleVerificationFileName && content.equals(googleVerificationContents)
        if (!approvedGoogleVerification) artifacts.push(artifact)
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
