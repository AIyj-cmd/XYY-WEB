import { probeLocalHealth, probeLocalVersion } from './lib/local-probe.mjs'

const requested = new Set(process.argv.slice(2))
if (!requested.size || [...requested].some((value) => !['--health', '--version'].includes(value))) {
  throw new Error('usage: local-release-probe.mjs --health [--version]')
}

const baseUrl = process.env.LOCAL_PROBE_URL
const timeoutMs = Number(process.env.LOCAL_PROBE_TIMEOUT_MS || 2_000)
if (!Number.isInteger(timeoutMs) || timeoutMs < 1)
  throw new Error('LOCAL_PROBE_TIMEOUT_MS must be positive')

if (requested.has('--health')) await probeLocalHealth({ baseUrl, timeoutMs })
if (requested.has('--version')) {
  if (!process.env.RELEASE_MANIFEST)
    throw new Error('RELEASE_MANIFEST is required for version probe')
  await probeLocalVersion({ baseUrl, manifestPath: process.env.RELEASE_MANIFEST, timeoutMs })
}
