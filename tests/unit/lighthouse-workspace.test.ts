import { access, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

import {
  addExternalSymlink,
  createLighthouseRunnerFixture,
  removeFixture,
} from '../helpers/lighthouse-runner-fixture'
import {
  createLighthouseWorkspace,
  removeLighthouseWorkspace,
} from '../../scripts/lib/lighthouse-workspace.mjs'

const fixtures: Awaited<ReturnType<typeof createLighthouseRunnerFixture>>[] = []

afterEach(async () => {
  await Promise.all(fixtures.splice(0).map(removeFixture))
})

describe('Lighthouse workspace isolation', () => {
  it('copies a fixed project root outside the repository without env, dist, or cache state', async () => {
    const fixture = await createLighthouseRunnerFixture()
    fixtures.push(fixture)
    await writeFile(join(fixture.root, '.env'), 'SECRET=must-not-copy\n')
    await writeFile(join(fixture.root, '.env.production'), 'SECRET=must-not-copy\n')
    await mkdir(join(fixture.root, 'dist'))
    await writeFile(join(fixture.root, 'dist/old.txt'), 'old\n')
    await mkdir(join(fixture.root, '.astro'))
    await mkdir(join(fixture.root, 'node_modules/.vite'))

    const workspace = await createLighthouseWorkspace({
      projectRoot: fixture.root,
      temporaryRoot: process.env.TMPDIR,
    })
    try {
      expect(workspace).not.toContain(fixture.root)
      await expect(access(join(workspace, '.env'))).rejects.toThrow()
      await expect(access(join(workspace, '.env.production'))).rejects.toThrow()
      await expect(access(join(workspace, 'dist'))).rejects.toThrow()
      await expect(access(join(workspace, '.astro'))).rejects.toThrow()
      await expect(access(join(workspace, 'node_modules/.vite'))).rejects.toThrow()
      await expect(access(join(workspace, 'src/index.html'))).resolves.toBeUndefined()
      await expect(
        readFile(join(workspace, 'output/capacity-baseline.json'), 'utf8')
      ).resolves.toBe('{}\n')
    } finally {
      await removeLighthouseWorkspace(workspace)
    }
  })

  it.each(['src', 'public'])(
    'rejects a %s symlink that resolves outside the fixture',
    async (rootName) => {
      const fixture = await createLighthouseRunnerFixture()
      fixtures.push(fixture)
      await addExternalSymlink(fixture, rootName)
      let workspace
      let accepted = false
      try {
        workspace = await createLighthouseWorkspace({
          projectRoot: fixture.root,
          temporaryRoot: process.env.TMPDIR,
        })
        accepted = true
      } catch (error) {
        expect(String(error)).toMatch(/symlink|escape/)
      } finally {
        if (workspace) await removeLighthouseWorkspace(workspace)
      }
      expect(accepted).toBe(false)
    }
  )

  it('rejects a temporary root inside the project root', async () => {
    const fixture = await createLighthouseRunnerFixture()
    fixtures.push(fixture)

    await expect(
      createLighthouseWorkspace({ projectRoot: fixture.root, temporaryRoot: fixture.root })
    ).rejects.toThrow('lighthouse_workspace_must_be_outside_project')
  })

  it('copies a selected absolute baseline when the CI default is absent', async () => {
    const fixture = await createLighthouseRunnerFixture()
    fixtures.push(fixture)
    const selected = join(fixture.external, 'verify-release-baseline.json')
    const contents = '{"source":"external-ci"}\n'
    await rm(join(fixture.root, 'output/capacity-baseline.json'))
    await writeFile(selected, contents)

    const workspace = await createLighthouseWorkspace({
      projectRoot: fixture.root,
      temporaryRoot: process.env.TMPDIR,
      capacityBaselineFile: selected,
    })
    try {
      await expect(
        readFile(join(workspace, 'output/capacity-baseline.json'), 'utf8')
      ).resolves.toBe(contents)
      await expect(readFile(selected, 'utf8')).resolves.toBe(contents)
    } finally {
      await removeLighthouseWorkspace(workspace)
    }
  })

  it('resolves a selected relative baseline from the project root', async () => {
    const fixture = await createLighthouseRunnerFixture()
    fixtures.push(fixture)
    const contents = '{"source":"project-relative"}\n'
    await mkdir(join(fixture.root, 'output/ci'), { recursive: true })
    await writeFile(join(fixture.root, 'output/ci/verify-release-baseline.json'), contents)

    const workspace = await createLighthouseWorkspace({
      projectRoot: fixture.root,
      temporaryRoot: process.env.TMPDIR,
      capacityBaselineFile: 'output/ci/verify-release-baseline.json',
    })
    try {
      await expect(
        readFile(join(workspace, 'output/capacity-baseline.json'), 'utf8')
      ).resolves.toBe(contents)
    } finally {
      await removeLighthouseWorkspace(workspace)
    }
  })

  it.each([
    [
      'missing',
      'output/ci/missing-baseline.json',
      /lighthouse_workspace_capacity_baseline_missing/,
    ],
    ['invalid', '', /lighthouse_workspace_invalid_capacity_baseline/],
  ])(
    'fails and cleans the workspace for a %s selected baseline',
    async (_label, selected, expected) => {
      const fixture = await createLighthouseRunnerFixture()
      fixtures.push(fixture)
      const temporaryRoot = await mkdtemp(join(process.env.TMPDIR || tmpdir(), 'luna-lh-baseline-'))
      try {
        await expect(
          createLighthouseWorkspace({
            projectRoot: fixture.root,
            temporaryRoot,
            capacityBaselineFile: selected,
          })
        ).rejects.toThrow(expected)
        await expect(readdir(temporaryRoot)).resolves.toEqual([])
      } finally {
        await rm(temporaryRoot, { recursive: true, force: true })
      }
    }
  )

  it('cleans the partially copied workspace when an input is missing', async () => {
    const fixture = await createLighthouseRunnerFixture()
    fixtures.push(fixture)
    await rm(join(fixture.root, 'public'), { recursive: true, force: true })
    const temporaryRoot = await mkdtemp(join(process.env.TMPDIR || tmpdir(), 'luna-lh-missing-'))
    try {
      await expect(
        createLighthouseWorkspace({ projectRoot: fixture.root, temporaryRoot })
      ).rejects.toThrow()
      await expect(readdir(temporaryRoot)).resolves.toEqual([])
    } finally {
      await rm(temporaryRoot, { recursive: true, force: true })
    }
  })
})
