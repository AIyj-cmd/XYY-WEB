import { spawnSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { parseCmsSetupOptions } from '../../scripts/lib/cms-setup-options.mjs'

const runCli = (script: string, args: string[], env: NodeJS.ProcessEnv = {}) =>
  spawnSync(process.execPath, [script, ...args], { cwd: process.cwd(), encoding: 'utf8', env })

describe('CMS initialization CLI safety', () => {
  it.each(['scripts/init-cms-content.mjs', 'scripts/setup-cms.mjs'])(
    'supports %s help without credentials or requests',
    (script) => {
      const result = runCli(script, ['--help'])
      expect(result.status).toBe(0)
      expect(result.stdout).toContain('Usage:')
    }
  )

  it.each(['--apply --check', '--aply', '--check --check'])(
    'rejects invalid content options %s before networking',
    (args) => {
      const result = runCli('scripts/init-cms-content.mjs', args.split(' '))
      expect(result.status).toBe(1)
      expect(result.stderr).toContain('invalid_arguments')
    }
  )

  it('requires explicit URL and token without auto-loading an env file', () => {
    const result = runCli('scripts/init-cms-content.mjs', [], { DIRECTUS_TOKEN: 'test-token' })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('DIRECTUS_URL and DIRECTUS_TOKEN are required')
    expect(result.stderr).not.toContain('test-token')
  })

  it('rejects embedded URL credentials without exposing them', () => {
    const result = runCli('scripts/init-cms-content.mjs', [], {
      DIRECTUS_URL: 'https://user:secret-url@cms.example.test',
      DIRECTUS_TOKEN: 'secret-token',
    })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('invalid_directus_url')
    expect(result.stderr).not.toMatch(/secret|cms\.example/)
  })

  it('supports only explicit schema-only and rejects ignored setup flags', () => {
    expect(parseCmsSetupOptions([])).toEqual({ schemaOnly: false, help: false })
    expect(parseCmsSetupOptions(['--schema-only'])).toEqual({ schemaOnly: true, help: false })
    expect(() => parseCmsSetupOptions(['--schemaOnly'])).toThrow('invalid_arguments')
    const result = runCli('scripts/setup-cms.mjs', ['--schemaOnly'])
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('invalid_arguments')
  })
})
