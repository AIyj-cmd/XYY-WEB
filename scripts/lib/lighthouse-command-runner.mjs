import { spawn } from 'node:child_process'
import { clearTimeout, setTimeout } from 'node:timers'

export function createLighthouseCommandRunner() {
  let activeChild
  let shutdownSignal
  let shutdownCleanupError
  let forceKillTimer

  function signalProcessGroup(child, signal) {
    if (!child?.pid) return
    try {
      if (process.platform === 'win32') child.kill(signal)
      else process.kill(-child.pid, signal)
    } catch (error) {
      if (error?.code !== 'ESRCH')
        shutdownCleanupError = error instanceof Error ? error.message : String(error)
    }
  }

  function clearForceKillTimer() {
    if (forceKillTimer) clearTimeout(forceKillTimer)
    forceKillTimer = undefined
  }

  function stopActiveChild() {
    if (!activeChild) return
    signalProcessGroup(activeChild, 'SIGTERM')
    clearForceKillTimer()
    forceKillTimer = setTimeout(() => signalProcessGroup(activeChild, 'SIGKILL'), 5000)
    forceKillTimer.unref()
  }

  async function reapProcessGroup(child) {
    clearForceKillTimer()
    signalProcessGroup(child, 'SIGTERM')
    const deadline = Date.now() + 5000
    while (child.pid && Date.now() < deadline) {
      try {
        if (process.platform === 'win32') return
        process.kill(-child.pid, 0)
      } catch (error) {
        if (error?.code === 'ESRCH') return
        shutdownCleanupError = error instanceof Error ? error.message : String(error)
        return
      }
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
    signalProcessGroup(child, 'SIGKILL')
    if (process.platform !== 'win32' && child.pid) {
      await new Promise((resolve) => setTimeout(resolve, 50))
      try {
        process.kill(-child.pid, 0)
        shutdownCleanupError = 'lighthouse_process_group_survived_sigkill'
      } catch (error) {
        if (error?.code !== 'ESRCH')
          shutdownCleanupError = error instanceof Error ? error.message : String(error)
      }
    }
  }

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
      shutdownSignal ??= signal
      stopActiveChild()
    })
  }

  function execute(command, arguments_, { cwd, env, commands }) {
    if (shutdownSignal) throw new Error(`lighthouse_interrupted:${shutdownSignal}`)
    const record = { command, arguments: arguments_, cwd, startedAt: new Date().toISOString() }
    commands.push(record)
    return new Promise((resolveCommand, rejectCommand) => {
      const child = spawn(command, arguments_, {
        cwd,
        detached: process.platform !== 'win32',
        env,
        stdio: 'inherit',
      })
      activeChild = child
      child.once('error', (error) => {
        clearForceKillTimer()
        if (activeChild === child) activeChild = undefined
        record.error = error.message
        record.finishedAt = new Date().toISOString()
        rejectCommand(error)
      })
      child.once('exit', async (code, signal) => {
        await reapProcessGroup(child)
        if (activeChild === child) activeChild = undefined
        record.exitCode = code
        record.signal = signal
        record.finishedAt = new Date().toISOString()
        if (shutdownCleanupError)
          rejectCommand(new Error(`lighthouse_process_cleanup:${shutdownCleanupError}`))
        else if (code === 0) resolveCommand()
        else rejectCommand(new Error(`lhci_${arguments_[0]}_failed:${code ?? signal ?? 'unknown'}`))
      })
    })
  }

  return {
    execute,
    get cleanupError() {
      return shutdownCleanupError
    },
    get signal() {
      return shutdownSignal
    },
  }
}
