import { spawn, type ChildProcess } from 'node:child_process'
import { createConnection } from 'node:net'
import { createInterface } from 'node:readline'

export function spawnNode(
  executable: string,
  args: string[],
  options: Parameters<typeof spawn>[2] = {}
) {
  return spawn(executable, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  })
}

export function waitForExit(child: ChildProcess, timeoutMs = 5000) {
  return new Promise<{ code: number | null; signal: NodeJS.Signals | null }>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('child_exit_timeout')), timeoutMs)
    child.once('error', (error) => {
      clearTimeout(timer)
      reject(error)
    })
    child.once('exit', (code, signal) => {
      clearTimeout(timer)
      resolve({ code, signal })
    })
  })
}

export function sendSignal(child: ChildProcess, signal: NodeJS.Signals = 'SIGTERM') {
  if (child.exitCode === null && child.signalCode === null) child.kill(signal)
}

export function readFirstLine(child: ChildProcess, timeoutMs = 1000) {
  return new Promise<string>((resolve, reject) => {
    const input = child.stdout
    if (!input) {
      reject(new Error('child_stdout_unavailable'))
      return
    }
    const lines = createInterface({ input })
    const timer = setTimeout(() => {
      lines.close()
      reject(new Error('child_ready_timeout'))
    }, timeoutMs)
    lines.once('line', (line) => {
      clearTimeout(timer)
      lines.close()
      resolve(line)
    })
    child.once('error', (error) => {
      clearTimeout(timer)
      lines.close()
      reject(error)
    })
  })
}

export async function waitForPortClosed(port: number, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const open = await new Promise<boolean>((resolve) => {
      const socket = createConnection({ host: '127.0.0.1', port })
      const finish = (value: boolean) => {
        socket.destroy()
        resolve(value)
      }
      socket.once('connect', () => finish(true))
      socket.once('error', () => finish(false))
    })
    if (!open) return true
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  return false
}
