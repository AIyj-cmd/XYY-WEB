import { randomUUID } from 'node:crypto'
import { access, mkdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  copyLighthouseRawReports,
  createLighthouseWorkspace,
  removeLighthouseWorkspace,
} from './lib/lighthouse-workspace.mjs'
import { createLighthouseCommandRunner } from './lib/lighthouse-command-runner.mjs'
import { summarizeLighthouse } from './lib/lighthouse-summary.mjs'

const devices = { desktop: 'lighthouserc.cjs', mobile: 'lighthouserc.mobile.cjs' }
const defaultPorts = { desktop: 4400, mobile: 4401 }
const require = createRequire(import.meta.url)
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function args(argv) {
  const [selection] = argv
  if (!['desktop', 'mobile', 'all'].includes(selection) || argv.length !== 1)
    throw new Error('usage: lighthouse-runner.mjs desktop|mobile|all')
  return selection === 'all' ? ['desktop', 'mobile'] : [selection]
}

function lhciOptions() {
  const mode = process.env.LHCI_MODE ?? 'observe'
  if (!['observe', 'enforce'].includes(mode)) throw new Error('invalid_lhci_mode')
  const options = { LHCI_MODE: mode }
  if (mode === 'enforce') {
    const thresholds = JSON.parse(process.env.LHCI_ENFORCE_THRESHOLDS ?? '')
    for (const key of [
      'performance',
      'accessibility',
      'bestPractices',
      'seo',
      'lcp',
      'tbt',
      'cls',
    ]) {
      if (!Number.isFinite(thresholds[key])) throw new Error(`invalid_threshold_${key}`)
    }
    options.LHCI_ENFORCE_THRESHOLDS = process.env.LHCI_ENFORCE_THRESHOLDS
  }
  if (process.env.LHCI_CHROME_PATH) options.LHCI_CHROME_PATH = process.env.LHCI_CHROME_PATH
  return options
}

function isolatedEnvironment(originValue, port, reportDirectory, options) {
  const passthrough = [
    'HOME',
    'PATH',
    'TMP',
    'TMPDIR',
    'TEMP',
    'SystemRoot',
    'WINDIR',
    'ComSpec',
    'PATHEXT',
  ]
  const environment = Object.fromEntries(
    passthrough.flatMap((key) => (process.env[key] ? [[key, process.env[key]]] : []))
  )
  return {
    ...environment,
    CI: '1',
    DEPLOY_ENVIRONMENT: 'ci',
    ENABLE_DOMAIN_REDIRECTS: 'false',
    HOST: '127.0.0.1',
    PORT: String(port),
    PUBLIC_SITE_URL: originValue,
    DIRECTUS_URL: 'http://127.0.0.1:9',
    DIRECTUS_CONTENT_TOKEN: 'local-fake-content',
    PUBLIC_DIRECTUS_URL: 'http://127.0.0.1:9',
    XIANSUO_API_URL: 'http://127.0.0.1:9',
    XIANSUO_INGEST_TOKEN: 'local-fake-ingest',
    LHCI_REPORT_DIRECTORY: reportDirectory,
    LHCI_PORT: String(port),
    ...options,
  }
}

async function localLhci(cwd) {
  const binary = join(
    cwd,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'lhci.cmd' : 'lhci'
  )
  await access(binary)
  return binary
}

async function runDevice(device, workspace, reportRoot, env, commands, execute) {
  const directory = join(reportRoot, device)
  await mkdir(directory, { recursive: true })
  const deviceEnvironment = { ...env, LHCI_REPORT_DIRECTORY: directory }
  const configPath = join(workspace, devices[device])
  const { createConfig } = require(join(workspace, 'config', 'lighthouse.cjs'))
  const config = createConfig({
    device,
    port: Number(env.LHCI_PORT),
    origin: env.PUBLIC_SITE_URL,
    outputDirectory: directory,
  })
  const lhci = await localLhci(workspace)
  for (const command of ['collect', 'upload']) {
    await execute(lhci, [command, `--config=${configPath}`], {
      cwd: workspace,
      env: deviceEnvironment,
      commands,
    })
  }
  const summary = await summarizeLighthouse(device, config, directory)
  const summaryPath = join(directory, 'summary.json')
  await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`)
  console.log(
    `Lighthouse ${device}: ${summary.routeCount} routes × ${summary.runCount}; ${summaryPath}`
  )
  await execute(lhci, ['assert', `--config=${configPath}`], {
    cwd: workspace,
    env: deviceEnvironment,
    commands,
  })
}

function runIdentifier() {
  return `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`
}

async function main() {
  const selectedDevices = args(process.argv.slice(2))
  const port = selectedDevices.length === 2 ? 4400 : defaultPorts[selectedDevices[0]]
  const originValue = `http://127.0.0.1:${port}`
  const reportRoot = resolve(projectRoot, 'output', 'lighthouse', runIdentifier())
  const commands = []
  const commandRunner = createLighthouseCommandRunner()
  let workspace
  let failure = null
  let rawReports = false
  let workspaceRemoved = false
  const cleanupFailures = []
  await mkdir(reportRoot, { recursive: true })
  try {
    workspace = await createLighthouseWorkspace({ projectRoot })
    const environment = isolatedEnvironment(originValue, port, reportRoot, lhciOptions())
    await commandRunner.execute('npm', ['run', 'build'], {
      cwd: workspace,
      env: environment,
      commands,
    })
    for (const device of selectedDevices)
      await runDevice(device, workspace, reportRoot, environment, commands, commandRunner.execute)
  } catch (error) {
    failure = error instanceof Error ? error.message : String(error)
  } finally {
    if (commandRunner.cleanupError)
      cleanupFailures.push(`signal_cleanup:${commandRunner.cleanupError}`)
    if (workspace) {
      try {
        rawReports = await copyLighthouseRawReports(workspace, reportRoot)
      } catch (error) {
        cleanupFailures.push(
          `raw_reports:${error instanceof Error ? error.message : String(error)}`
        )
      }
      try {
        await removeLighthouseWorkspace(workspace)
        workspaceRemoved = true
      } catch (error) {
        cleanupFailures.push(
          `workspace_cleanup:${error instanceof Error ? error.message : String(error)}`
        )
      }
    }
    if (!failure && cleanupFailures.length) failure = cleanupFailures.join(';')
    await writeFile(
      join(reportRoot, 'run.json'),
      `${JSON.stringify(
        { commands, failure, rawReports, cleanupFailures, workspaceRemoved },
        null,
        2
      )}\n`
    )
  }
  if (failure) {
    process.exitCode =
      commandRunner.signal === 'SIGINT' ? 130 : commandRunner.signal === 'SIGTERM' ? 143 : 1
    throw new Error(failure)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode ??= 1
})
