import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

import { CMS_SCHEMA_VERSION_STATUS } from '../config/cms-contract.mjs'
import { createReleaseIdentity } from '../config/release-contract.mjs'

const requiredArguments = ['git-sha', 'build-time', 'environment']

function parseArguments(argumentsList) {
  const values = {}
  for (let index = 0; index < argumentsList.length; index += 2) {
    const name = argumentsList[index]
    const value = argumentsList[index + 1]
    if (!name?.startsWith('--') || value === undefined) {
      throw new Error('CI release identity arguments must use --name value pairs')
    }
    const key = name.slice(2)
    if (!requiredArguments.includes(key) || values[key] !== undefined) {
      throw new Error(`CI release identity argument is not allowed: ${name}`)
    }
    values[key] = value
  }
  for (const name of requiredArguments) {
    if (values[name] === undefined) {
      throw new Error(`CI release identity argument is required: --${name}`)
    }
  }
  return values
}

export function validateCiReleaseIdentity(argumentsList) {
  const options = parseArguments(argumentsList)
  if (options.environment !== 'ci') {
    throw new Error('ci_release_identity_invalid: environment must be ci')
  }

  const identity = createReleaseIdentity({
    gitSha: options['git-sha'],
    buildTime: options['build-time'],
    environment: 'ci',
  })

  return Object.freeze({
    identity,
    cmsSchemaStatus: CMS_SCHEMA_VERSION_STATUS,
  })
}

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])
if (isCli) {
  try {
    console.log(JSON.stringify(validateCiReleaseIdentity(process.argv.slice(2))))
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
}
