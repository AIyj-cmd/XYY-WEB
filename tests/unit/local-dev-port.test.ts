import { realpath } from 'node:fs/promises'
import { createServer } from 'node:net'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  inspectLocalDevPort,
  isTrustedDevelopmentCommand,
} from '../../scripts/lib/local-dev-port.mjs'

const root = resolve(import.meta.dirname, '../..')

describe('local development port ownership', () => {
  it('resolves a relative local-dev entrypoint from the inspected cwd', async () => {
    await expect(
      isTrustedDevelopmentCommand({
        argv: [process.execPath, './scripts/local-dev.mjs'],
        projectRoot: root,
        cwd: root,
      })
    ).resolves.toBe(true)
  })

  it('rejects server.mjs and a listener whose process command is not local dev', async () => {
    await expect(
      isTrustedDevelopmentCommand({
        argv: [process.execPath, './server.mjs'],
        projectRoot: root,
        cwd: root,
      })
    ).resolves.toBe(false)

    const server = createServer().listen(45138, '127.0.0.1')
    try {
      await expect(
        inspectLocalDevPort({
          projectRoot: await realpath(root),
          port: 45138,
          expectedPid: undefined,
        })
      ).resolves.toEqual({
        state: 'occupied',
        reason: 'command',
      })
    } finally {
      await new Promise<void>((resolveClose) => server.close(() => resolveClose()))
    }
  })

  it('reports an unused loopback port as free without touching the shared preview', async () => {
    const port = 45137
    await expect(
      inspectLocalDevPort({ projectRoot: await realpath(root), port, expectedPid: undefined })
    ).resolves.toEqual({
      state: 'free',
    })
  })
})
