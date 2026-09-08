import { describe, expect, it, vi } from 'vitest'

import {
  main,
  parseCliArgs,
  parseCmsConfig,
} from '../../deploy/oracle19c/verify-revision-capacity.mjs'

const validEnv =
  'DB_CLIENT=oracledb\nDB_USER=user\nDB_PASSWORD=$(not-executed)\nDB_CONNECT_STRING=db/service'

describe('Oracle revision capacity CLI', () => {
  it('parses only required Oracle settings without executing env values', () => {
    expect(parseCmsConfig(validEnv)).toEqual({
      user: 'user',
      password: '$(not-executed)',
      connectString: 'db/service',
    })
    expect(
      parseCmsConfig('DB_CLIENT=pg\nDB_USER=user\nDB_PASSWORD=password\nDB_CONNECT_STRING=db')
    ).toBeNull()
    expect(parseCmsConfig('DB_CLIENT=oracledb\nDB_USER=user')).toBeNull()
  })

  it.each([
    { args: ['--help'] },
    { args: [] },
    { args: ['--apply'] },
    { args: ['--cms-dir', '/tmp/cms', '--unexpected'] },
    { args: ['--cms-dir', '--apply'] },
    { args: ['--cms-dir', '--help'] },
    { args: ['--cms-dir', '--unexpected'] },
  ])('does not read configuration or load a driver for $args', async ({ args }) => {
    const readEnv = vi.fn()
    const loadDriver = vi.fn()
    const verify = vi.fn()
    await main(args, { readEnv, loadDriver, verify, write: () => undefined })
    expect(readEnv).not.toHaveBeenCalled()
    expect(loadDriver).not.toHaveBeenCalled()
    expect(verify).not.toHaveBeenCalled()
  })

  it('classifies help and invalid flags before any connection attempt', () => {
    expect(parseCliArgs(['--help'])).toEqual({ kind: 'help' })
    expect(parseCliArgs([])).toEqual({ kind: 'help' })
    expect(parseCliArgs(['--apply'])).toEqual({ kind: 'invalid' })
    expect(parseCliArgs(['--cms-dir', '/tmp/cms', '--unexpected'])).toEqual({ kind: 'invalid' })
    expect(parseCliArgs(['--cms-dir', '--apply'])).toEqual({ kind: 'invalid' })
    expect(parseCliArgs(['--cms-dir', '--help'])).toEqual({ kind: 'invalid' })
    expect(parseCliArgs(['--cms-dir', '--unexpected'])).toEqual({ kind: 'invalid' })
    expect(parseCliArgs(['--cms-dir', './-allowed-directory'])).toEqual({
      kind: 'verify',
      cmsDir: './-allowed-directory',
    })
  })

  it('fails safely for environment, configuration, driver, and connection failures', async () => {
    const output: string[] = []
    const base = { loadDriver: vi.fn(), write: (line: string) => output.push(line) }

    await expect(
      main(['--cms-dir', '/tmp/cms'], { ...base, readEnv: async () => Promise.reject() })
    ).resolves.toBe(1)
    await expect(
      main(['--cms-dir', '/tmp/cms'], { ...base, readEnv: async () => 'DB_CLIENT=pg' })
    ).resolves.toBe(1)
    await expect(
      main(['--cms-dir', '/tmp/cms'], {
        ...base,
        readEnv: async () => validEnv,
        loadDriver: async () => Promise.reject(),
      })
    ).resolves.toBe(1)
    await expect(
      main(['--cms-dir', '/tmp/cms'], {
        readEnv: async () => validEnv,
        loadDriver: async () => ({
          getConnection: async () => Promise.reject(new Error('secret detail')),
        }),
        write: (line: string) => output.push(line),
      })
    ).resolves.toBe(1)
    expect(output).toEqual([
      'revision-capacity: ENV_READ_FAILED',
      'revision-capacity: CONFIG_INVALID',
      'revision-capacity: DRIVER_LOAD_FAILED',
      'revision-capacity: CONNECTION_FAILED',
    ])
  })

  it('uses the driver object format, closes on every connected path, and hides errors', async () => {
    const close = vi.fn(async () => undefined)
    const execute = vi.fn(async () => ({
      rows: [
        { COLUMN_NAME: 'data', DATA_TYPE: 'CLOB' },
        { COLUMN_NAME: 'delta', DATA_TYPE: 'CLOB' },
      ],
    }))
    const output: string[] = []
    const base = {
      readEnv: async () => validEnv,
      loadDriver: async () => ({
        OUT_FORMAT_OBJECT: 4002,
        getConnection: async () => ({ execute, close }),
      }),
      write: (line: string) => output.push(line),
    }

    await expect(main(['--cms-dir', '/tmp/cms'], base)).resolves.toBe(0)
    expect(execute).toHaveBeenCalledWith(expect.any(String), [], { outFormat: 4002 })
    expect(close).toHaveBeenCalledOnce()
    expect(output).toEqual(['revision-capacity: CAPACITY_PASS'])

    const failedClose = vi.fn(async () => undefined)
    const failedOutput: string[] = []
    await expect(
      main(['--cms-dir', '/tmp/cms'], {
        readEnv: async () => validEnv,
        loadDriver: async () => ({
          OUT_FORMAT_OBJECT: 4002,
          getConnection: async () => ({
            execute: async () => Promise.reject(new Error('ORA-12899 secret')),
            close: failedClose,
          }),
        }),
        write: (line: string) => failedOutput.push(line),
      })
    ).resolves.toBe(1)
    expect(failedClose).toHaveBeenCalledOnce()
    expect(failedOutput).toEqual(['revision-capacity: QUERY_FAILED'])
  })

  it('fails closed if close fails or an injected verifier throws', async () => {
    const output: string[] = []
    const connection = {
      execute: vi.fn(),
      close: async () => Promise.reject(new Error('close secret')),
    }
    const dependencies = {
      readEnv: async () => validEnv,
      loadDriver: async () => ({
        OUT_FORMAT_OBJECT: 4002,
        getConnection: async () => connection,
      }),
      verify: async () => Promise.reject(new Error('unexpected secret')),
      write: (line: string) => output.push(line),
    }

    await expect(main(['--cms-dir', '/tmp/cms'], dependencies)).resolves.toBe(1)
    expect(output).toEqual(['revision-capacity: CONNECTION_CLOSE_FAILED'])
  })
})
