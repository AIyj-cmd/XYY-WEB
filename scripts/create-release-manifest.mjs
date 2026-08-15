import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createReleaseIdentity } from '../config/release-contract.mjs'

function parseArguments(argumentsList) {
  const values = {}
  for (let index = 0; index < argumentsList.length; index += 2) {
    const name = argumentsList[index]
    const value = argumentsList[index + 1]
    if (!name?.startsWith('--') || value === undefined) {
      throw new Error('release manifest arguments must use --name value pairs')
    }
    values[name.slice(2)] = value
  }
  return values
}

export async function createReleaseManifest(argumentsList) {
  const options = parseArguments(argumentsList)
  if (!options.output) throw new Error('--output is required')
  const identity = createReleaseIdentity({
    gitSha: options['git-sha'],
    buildTime: options['build-time'],
    environment: options.environment,
    releaseId: options['release-id'],
  })
  const output = resolve(options.output)
  await writeFile(output, `${JSON.stringify(identity, null, 2)}\n`, { flag: 'wx' })
  return { identity, output }
}

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])
if (isCli) {
  createReleaseManifest(process.argv.slice(2))
    .then(({ identity, output }) => {
      console.log(`release manifest created: ${identity.releaseId} (${output})`)
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error)
      process.exitCode = 1
    })
}
