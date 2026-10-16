import { clearTimeout, setTimeout } from 'node:timers'

const signalExitCode = { SIGINT: 130, SIGTERM: 143 }

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error)
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

export function createLocalDevLifecycle({
  readyTimeoutMs = 60_000,
  stopTimeoutMs = 5_000,
  exit = process.exit,
}) {
  let server
  let readyTimer
  let signal
  let stopping = false

  function finish(code) {
    process.exitCode = code
    exit(code)
  }

  async function stop(code, reason) {
    if (stopping) return
    stopping = true
    if (readyTimer) clearTimeout(readyTimer)
    console.error(reason)
    if (!server) {
      finish(code)
      return
    }
    try {
      await Promise.race([
        server.stop(),
        wait(stopTimeoutMs).then(() => {
          throw new Error('local_dev_stop_timeout')
        }),
      ])
    } catch (error) {
      console.error(`${reason}:${errorMessage(error)}`)
      finish(1)
      return
    }
    finish(code)
  }

  function requestStop(receivedSignal) {
    const code = signalExitCode[receivedSignal] ?? 1
    if (signal) {
      finish(code)
      return
    }
    signal = receivedSignal
    void stop(code, `local_dev_signal:${receivedSignal}`)
  }

  function install() {
    for (const receivedSignal of Object.keys(signalExitCode))
      process.once(receivedSignal, () => requestStop(receivedSignal))
    readyTimer = setTimeout(() => void stop(1, 'local_dev_ready_timeout'), readyTimeoutMs)
  }

  function attach(value) {
    server = value
    if (signal) void stop(signalExitCode[signal], `local_dev_signal:${signal}`)
  }

  function ready() {
    if (readyTimer) clearTimeout(readyTimer)
    readyTimer = undefined
  }

  async function fail(error) {
    await stop(1, `local_dev_failed:${errorMessage(error)}`)
  }

  return { install, attach, ready, fail }
}
