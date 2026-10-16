import { type ChildProcess } from 'node:child_process'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'

export async function listen(server: Server): Promise<number> {
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  return (server.address() as AddressInfo).port
}

export async function reservePort(): Promise<number> {
  const server = createServer()
  const port = await listen(server)
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  )
  return port
}

export async function waitForOrigin(origin: string, child: ChildProcess) {
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    if (child.exitCode !== null)
      throw new Error(`isolated Astro server exited with ${child.exitCode}`)
    try {
      const response = await fetch(origin, {
        redirect: 'manual',
        signal: AbortSignal.timeout(1_000),
      })
      if (response.status > 0) return
    } catch {
      // The child process may still be binding its port.
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error(`isolated Astro server did not start at ${origin}`)
}
