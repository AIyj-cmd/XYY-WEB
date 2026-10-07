import { preflight } from './capacity-preflight.mjs'

if (process.env.CAPACITY_BASELINE_MEASUREMENT !== 'true') {
  const remote = process.env.CAPACITY_SCOPE === 'remote'
  const baselineFile = remote
    ? process.env.REMOTE_CAPACITY_BASELINE_FILE
    : (process.env.CAPACITY_BASELINE_FILE ?? 'output/capacity-baseline.json')
  try {
    await preflight({
      scope: remote ? 'remote' : 'local',
      baselineFile,
      paths: [
        process.cwd(),
        process.env.TMPDIR ?? '/tmp',
        process.env.PLAYWRIGHT_ARTIFACTS_DIR ?? 'output/playwright',
      ],
    })
    console.log('capacity_check_ok')
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}
