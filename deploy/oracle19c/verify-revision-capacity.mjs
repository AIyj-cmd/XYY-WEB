import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseEnv } from 'node:util'

import { verifyRevisionCapacity } from './lib/revision-capacity.mjs'

const HELP = 'usage: node verify-revision-capacity.mjs --cms-dir <existing-directus-directory>'

export function parseCliArgs(args) {
  if (!Array.isArray(args)) return { kind: 'invalid' }
  if (!args.length || (args.length === 1 && args[0] === '--help')) return { kind: 'help' }
  return args.length === 2 &&
    args[0] === '--cms-dir' &&
    typeof args[1] === 'string' &&
    !args[1].startsWith('-') &&
    args[1].trim()
    ? { kind: 'verify', cmsDir: args[1] }
    : { kind: 'invalid' }
}

export function parseCmsConfig(contents) {
  try {
    const env = parseEnv(contents)
    const client = env.DB_CLIENT?.trim()
    const user = env.DB_USER?.trim()
    const password = env.DB_PASSWORD
    const connectString = env.DB_CONNECT_STRING?.trim()
    return client === 'oracledb' && user && password && connectString
      ? { user, password, connectString }
      : null
  } catch {
    return null
  }
}

async function defaultLoadDriver(cmsDir) {
  return createRequire(resolve(cmsDir, 'package.json'))('oracledb')
}

function report(write, code) {
  write(`revision-capacity: ${code}`)
}

export async function main(args, dependencies = {}) {
  const parsed = parseCliArgs(args)
  const write = dependencies.write ?? console.log
  if (parsed.kind === 'help') {
    write(HELP)
    return 0
  }
  if (parsed.kind === 'invalid') {
    report(write, 'INVALID_ARGUMENTS')
    return 2
  }

  const readEnv = dependencies.readEnv ?? ((cmsDir) => readFile(resolve(cmsDir, '.env'), 'utf8'))
  const loadDriver = dependencies.loadDriver ?? defaultLoadDriver
  const verify = dependencies.verify ?? verifyRevisionCapacity
  let config
  try {
    config = parseCmsConfig(await readEnv(parsed.cmsDir))
  } catch {
    report(write, 'ENV_READ_FAILED')
    return 1
  }
  if (!config) {
    report(write, 'CONFIG_INVALID')
    return 1
  }

  let driver
  try {
    driver = await loadDriver(parsed.cmsDir)
  } catch {
    report(write, 'DRIVER_LOAD_FAILED')
    return 1
  }

  let connection
  try {
    connection = await driver.getConnection(config)
  } catch {
    report(write, 'CONNECTION_FAILED')
    return 1
  }

  let result
  try {
    result = await verify((sql, binds) =>
      connection.execute(sql, binds, { outFormat: driver.OUT_FORMAT_OBJECT })
    )
  } catch {
    result = { ok: false, code: 'QUERY_FAILED' }
  } finally {
    try {
      await connection.close()
    } catch {
      result = { ok: false, code: 'CONNECTION_CLOSE_FAILED' }
    }
  }
  report(write, result.code)
  return result.ok ? 0 : 1
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2))
    .then((code) => {
      process.exitCode = code
    })
    .catch(() => {
      report(console.log, 'UNEXPECTED_FAILURE')
      process.exitCode = 1
    })
}
