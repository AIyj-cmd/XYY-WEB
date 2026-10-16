import { access, mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
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
