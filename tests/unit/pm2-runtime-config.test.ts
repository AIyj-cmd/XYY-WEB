import { copyFile, mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createRequire } from 'node:module'

import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '../..')

async function fixture(env?: string, envDirectory = false) {
  const directory = await mkdtemp(join(tmpdir(), 'xyy-pm2-runtime-'))
  await copyFile(join(root, 'ecosystem.config.cjs'), join(directory, 'ecosystem.config.cjs'))
  await mkdir(join(directory, 'node_modules'))
  await symlink(join(root, 'node_modules', 'dotenv'), join(directory, 'node_modules', 'dotenv'))

  if (envDirectory) await mkdir(join(directory, '.env'))
  else if (env !== undefined) await writeFile(join(directory, '.env'), env)

  return directory
}

function loadRuntimeConfig(directory: string) {
  return createRequire(join(directory, 'fixture.cjs'))(join(directory, 'ecosystem.config.cjs'))
}

describe('PM2 runtime host configuration', () => {
  it('reads HOST from the release-root .env without exposing unrelated values', async () => {
    const directory = await fixture('HOST=127.0.0.1\nSECRET=special $& value\n')
    try {
      const config = loadRuntimeConfig(directory)

      expect(config.apps[0].env.HOST).toBe('127.0.0.1')
      expect(JSON.stringify(config)).not.toContain('special $& value')
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })

  it('uses the existing default when HOST or .env is absent', async () => {
    const withoutHost = await fixture('SECRET=unrelated\n')
    const withoutEnv = await fixture()
    try {
      expect(loadRuntimeConfig(withoutHost).apps[0].env.HOST).toBe('0.0.0.0')
      expect(loadRuntimeConfig(withoutEnv).apps[0].env.HOST).toBe('0.0.0.0')
    } finally {
      await Promise.all([
        rm(withoutHost, { recursive: true, force: true }),
        rm(withoutEnv, { recursive: true, force: true }),
      ])
    }
  })

  it('binds .env lookup to appRoot instead of the caller cwd', async () => {
    const directory = await fixture('HOST=127.0.0.1\n')
    const callerDirectory = await mkdtemp(join(tmpdir(), 'xyy-pm2-caller-'))
    const previousCwd = process.cwd()
    try {
      await writeFile(join(callerDirectory, '.env'), 'HOST=0.0.0.0\n')
      process.chdir(callerDirectory)

      expect(loadRuntimeConfig(directory).apps[0].env.HOST).toBe('127.0.0.1')
    } finally {
      process.chdir(previousCwd)
      await Promise.all([
        rm(directory, { recursive: true, force: true }),
        rm(callerDirectory, { recursive: true, force: true }),
      ])
    }
  })

  it('surfaces a non-ENOENT .env read error', async () => {
    const directory = await fixture(undefined, true)
    try {
      expect(() => loadRuntimeConfig(directory)).toThrow(/EISDIR/)
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })
})
