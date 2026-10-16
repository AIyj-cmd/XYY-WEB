import { afterEach, describe, expect, it } from 'vitest'

import { createLocalDevLifecycle } from '../../scripts/lib/local-dev-lifecycle.mjs'
import {
  readFirstLine,
  sendSignal,
  waitForExit,
  waitForPortClosed,
} from '../helpers/local-dev-process'
import { spawnLifecycleFixture } from '../helpers/local-dev-fixtures'

const originalExitCode = process.exitCode
const originalSignals = {
  SIGINT: process.listeners('SIGINT'),
  SIGTERM: process.listeners('SIGTERM'),
}

function captureExit(exits: number[]) {
  return (code?: string | number | null): never => {
    exits.push(Number(code))
    return undefined as never
  }
}

afterEach(() => {
  process.exitCode = originalExitCode
  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    for (const listener of process.listeners(signal)) {
      if (!originalSignals[signal].includes(listener)) process.removeListener(signal, listener)
    }
  }
})

describe('local development lifecycle', () => {
  const realCases = [
    ['unattached-timeout', 1, 'local_dev_ready_timeout'],
    ['unattached-reject', 1, 'local_dev_failed:fixture_startup_rejected'],
    ['attached-reject', 1, 'local_dev_failed:fixture_failure:fixture_stop_rejected'],
    ['attached-timeout', 1, 'local_dev_failed:fixture_failure:local_dev_stop_timeout'],
    ['unattached-sigint', 130, 'local_dev_signal:SIGINT'],
    ['attached-second-signal', 130, 'local_dev_signal:SIGTERM'],
  ] as const

  it.each(realCases)(
    'cleans a real child fixture: %s',
    async (kind, expectedExit, expectedError) => {
      const child = spawnLifecycleFixture(kind)
      const errors: string[] = []
      child.stderr?.on('data', (chunk) => errors.push(chunk.toString()))
      try {
        const marker = JSON.parse(await readFirstLine(child)) as { port: number }
        const result = await waitForExit(child, 3000)
        expect(result).toEqual({ code: expectedExit, signal: null })
        expect(await waitForPortClosed(marker.port)).toBe(true)
        expect(errors.join('')).toContain(expectedError)
      } finally {
        if (child.exitCode === null && child.signalCode === null) {
          sendSignal(child, 'SIGKILL')
          await waitForExit(child, 1000).catch(() => undefined)
        }
      }
    }
  )

  it('stops an attached server and preserves the requested exit code', async () => {
    const exits: number[] = []
    let stops = 0
    const lifecycle = createLocalDevLifecycle({ exit: captureExit(exits) })
    lifecycle.install()
    lifecycle.attach({
      stop: async () => {
        stops += 1
      },
    })
    await lifecycle.fail(new Error('identity_failed'))
    expect(stops).toBe(1)
    expect(exits).toEqual([1])
  })

  it('turns a stop rejection into a nonzero exit', async () => {
    const exits: number[] = []
    const lifecycle = createLocalDevLifecycle({ exit: captureExit(exits) })
    lifecycle.install()
    lifecycle.attach({
      stop: async () => {
        throw new Error('stop_failed')
      },
    })
    await lifecycle.fail(new Error('startup_failed'))
    expect(exits).toEqual([1])
  })

  it('turns a stop timeout into a nonzero exit', async () => {
    const exits: number[] = []
    const lifecycle = createLocalDevLifecycle({
      exit: captureExit(exits),
      stopTimeoutMs: 5,
    })
    lifecycle.install()
    lifecycle.attach({ stop: async () => new Promise<void>(() => {}) })
    await lifecycle.fail(new Error('startup_failed'))
    expect(exits).toEqual([1])
  })

  it('fails without a server when startup rejects before attachment', async () => {
    const exits: number[] = []
    const lifecycle = createLocalDevLifecycle({ exit: captureExit(exits) })
    lifecycle.install()
    await lifecycle.fail(new Error('pending_startup_failed'))
    expect(exits).toEqual([1])
  })
})
