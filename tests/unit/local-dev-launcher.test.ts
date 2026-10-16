import { afterEach, describe, expect, it } from 'vitest'
import { join } from 'node:path'

import {
  configureLocalDevelopment,
  parseLocalDevArguments,
  projectOutputWatchIgnore,
} from '../../scripts/local-dev.mjs'

const originalArgv = [...process.argv]
const originalEnv = { ...process.env }

afterEach(() => {
  process.argv = [...originalArgv]
  for (const key of Object.keys(process.env)) {
    if (!(key in originalEnv)) delete process.env[key]
  }
  Object.assign(process.env, originalEnv)
})

describe('local development launcher arguments', () => {
  it('accepts the separated development port and rejects duplicate or unsupported values', () => {
    expect(parseLocalDevArguments(['--port', '45089'])).toEqual({ port: 45089 })
    expect(() => parseLocalDevArguments(['--port', '45089', '--port', '45090'])).toThrow(
      'local_dev_duplicate_port'
    )
    expect(() => parseLocalDevArguments(['--mode', 'production'])).toThrow(
      'local_dev_mode_must_be_development'
    )
    expect(() => parseLocalDevArguments(['--unknown'])).toThrow('local_dev_unsupported_argument')
  })

  it('does not silently accept extra inline equals or missing values', () => {
    expect(() => parseLocalDevArguments(['--port=45089=tail'])).toThrow('local_dev_invalid_port')
    expect(() => parseLocalDevArguments(['--mode=development=tail'])).toThrow(
      'local_dev_mode_must_be_development'
    )
    expect(() => parseLocalDevArguments(['--port'])).toThrow('local_dev_missing_port')
  })

  it('sets the isolated CI loopback environment and normalized Astro mode', () => {
    expect(configureLocalDevelopment({ port: 45089 })).toBe('http://127.0.0.1:45089')
    expect(process.env.NODE_ENV).toBe('development')
    expect(process.env.DEPLOY_ENVIRONMENT).toBe('ci')
    expect(process.env.PUBLIC_SITE_URL).toBe('http://127.0.0.1:45089')
    expect(process.env.DIRECTUS_URL).toBe('http://127.0.0.1:1')
    expect(process.env.XIANSUO_API_URL).toBe('https://127.0.0.1:1')
    expect(process.argv).toContain('--mode=development')
  })

  it('ignores only the project output root and descendants', () => {
    const ignored = projectOutputWatchIgnore('/workspace/site')
    expect(ignored('/workspace/site/output')).toBe(true)
    expect(ignored(join('/workspace/site', 'output', 'nested', 'evidence.json'))).toBe(true)
    expect(ignored('/workspace/site/src/public/output-backup')).toBe(false)
    expect(ignored('/workspace/site/public/output')).toBe(false)
  })
})
