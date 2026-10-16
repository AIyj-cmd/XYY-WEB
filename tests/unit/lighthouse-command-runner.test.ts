import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

import { createLighthouseCommandRunner } from '../../scripts/lib/lighthouse-command-runner.mjs'

const directories: string[] = []

async function waitForFile(path: string, timeoutMs = 3000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      await access(path)
      return
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 20))
    }
  }
  throw new Error(`fixture_file_timeout:${path}`)
}

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true }))
  )
})

describe('Lighthouse command lifecycle', () => {
  it('records and resolves a successful local command', async () => {
    const runner = createLighthouseCommandRunner()
    const commands: object[] = []

    await expect(
      runner.execute(process.execPath, ['-e', 'process.exit(0)'], {
        cwd: process.cwd(),
        env: process.env,
        commands,
      })
    ).resolves.toBeUndefined()
    expect(commands).toHaveLength(1)
    expect(commands[0]).toMatchObject({ command: process.execPath, exitCode: 0 })
  })

  it('reaps a failed command group before rejecting', async () => {
    const runner = createLighthouseCommandRunner()
    const commands: object[] = []

    await expect(
      runner.execute(process.execPath, ['-e', 'process.exit(23)'], {
        cwd: process.cwd(),
        env: process.env,
        commands,
      })
    ).rejects.toThrow('failed:23')
    expect(commands[0]).toMatchObject({ exitCode: 23 })
  })

  it('bounds TERM to KILL for a child that ignores TERM and leaves no active process', async () => {
    const directory = await mkdtemp(join(process.env.TMPDIR || tmpdir(), 'luna-lh-command-'))
    directories.push(directory)
    const marker = join(directory, 'child.pid')
    const ready = join(directory, 'child.ready')
    const term = join(directory, 'child.term')
    const script = join(directory, 'stubborn.mjs')
    await writeFile(
      script,
      `import { spawn } from 'node:child_process'
import { access, writeFile } from 'node:fs/promises'
const ready = ${JSON.stringify(ready)}
const child = spawn(process.execPath, ['-e', "const fs = require('node:fs'); process.on('SIGTERM', () => { fs.writeFileSync(process.argv[2], 'term') }); fs.writeFileSync(process.argv[1], 'ready'); setInterval(() => {}, 1000)", ready, ${JSON.stringify(term)}], { stdio: 'ignore' })
await writeFile(${JSON.stringify(marker)}, String(child.pid))
const wait = setInterval(async () => { try { await access(ready); clearInterval(wait); process.exit(0) } catch {} }, 10)
`
    )
    const runner = createLighthouseCommandRunner()
    const commands: object[] = []
    await expect(
      runner.execute(process.execPath, [script], {
        cwd: directory,
        env: process.env,
        commands,
      })
    ).resolves.toBeUndefined()
    await waitForFile(ready)
    await waitForFile(term)
    const pid = Number(await readFile(marker, 'utf8'))
    let active: boolean
    try {
      await access(`/proc/${pid}/stat`)
      const state = (await readFile(`/proc/${pid}/stat`, 'utf8')).split(' ')[2]
      active = Boolean(state && state !== 'Z')
    } catch {
      active = false
    }
    expect(active).toBe(false)
    expect(runner.cleanupError).toBeUndefined()
  }, 15000)

  it('cleans the active group when the runner parent receives SIGTERM', async () => {
    const directory = await mkdtemp(join(process.env.TMPDIR || tmpdir(), 'luna-lh-signal-'))
    directories.push(directory)
    const ready = join(directory, 'ready')
    const term = join(directory, 'term')
    const done = join(directory, 'done.json')
    const stubborn = join(directory, 'stubborn.mjs')
    const controller = join(directory, 'controller.mjs')
    await writeFile(
      stubborn,
      `import { writeFile } from 'node:fs/promises'
process.on('SIGTERM', () => { writeFile(${JSON.stringify(term)}, 'term') })
await writeFile(${JSON.stringify(ready)}, 'ready')
setInterval(() => {}, 1000)
`
    )
    await writeFile(
      controller,
      `import { writeFile } from 'node:fs/promises'
import { createLighthouseCommandRunner } from ${JSON.stringify(
        join(process.cwd(), 'scripts/lib/lighthouse-command-runner.mjs')
      )}
const [script, term, done] = process.argv.slice(2)
const runner = createLighthouseCommandRunner()
try { await runner.execute(process.execPath, [script], { cwd: process.cwd(), env: process.env, commands: [] }) } catch {}
await writeFile(done, JSON.stringify({ signal: runner.signal, cleanupError: runner.cleanupError }))
`
    )
    const child = spawn(process.execPath, [controller, stubborn, term, done], {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'ignore',
    })
    await waitForFile(ready)
    if (!child.pid) throw new Error('controller_pid_missing')
    process.kill(child.pid, 'SIGTERM')
    await new Promise((resolve) => child.once('exit', resolve))
    await waitForFile(done)
    await waitForFile(term)
    const result = JSON.parse(await readFile(done, 'utf8'))
    expect(result.signal).toBe('SIGTERM')
    expect(result.cleanupError).toBeUndefined()
  }, 15000)
})
