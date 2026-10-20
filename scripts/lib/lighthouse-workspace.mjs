import { constants } from 'node:fs'
import { access, cp, lstat, mkdir, mkdtemp, readdir, realpath, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'

const directoryInputs = ['config', 'server', 'scripts', 'src', 'public', 'node_modules']
const fileInputs = [
  'astro.config.mjs',
  'server.mjs',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'lighthouserc.cjs',
  'lighthouserc.mobile.cjs',
]

function isInside(parent, candidate) {
  const path = relative(parent, candidate)
  return path === '' || (path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path))
}

function assertExternalWorkspace(projectRoot, workspace) {
  if (isInside(projectRoot, workspace))
    throw new Error('lighthouse_workspace_must_be_outside_project')
}

async function copyInput(projectRoot, workspace, input, options) {
  await cp(join(projectRoot, input), join(workspace, input), options)
}

async function resolveCapacityBaseline(projectRoot, selection) {
  const input = selection ?? 'output/capacity-baseline.json'
  if (typeof input !== 'string' || !input.trim())
    throw new Error('lighthouse_workspace_invalid_capacity_baseline')
  const root = await realpath(resolve(projectRoot))
  const source = isAbsolute(input) ? resolve(input) : resolve(root, input)
  if (!isAbsolute(input) && !isInside(root, source))
    throw new Error(`lighthouse_workspace_invalid_capacity_baseline:${input}`)
  let metadata
  try {
    metadata = await lstat(source)
  } catch (error) {
    if (error?.code === 'ENOENT')
      throw new Error(`lighthouse_workspace_capacity_baseline_missing:${source}`, { cause: error })
    throw error
  }
  if (!metadata.isFile() || metadata.isSymbolicLink())
    throw new Error(`lighthouse_workspace_invalid_capacity_baseline:${source}`)
  return source
}

async function assertContainedSymlinks(directory, workspace) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const location = join(directory, entry.name)
    if (entry.isSymbolicLink()) {
      if (!isInside(workspace, await realpath(location)))
        throw new Error(`lighthouse_workspace_symlink_escape:${location}`)
    } else if (entry.isDirectory()) {
      await assertContainedSymlinks(location, workspace)
    }
  }
}

export async function createLighthouseWorkspace({
  projectRoot,
  temporaryRoot = process.env.TMPDIR,
  capacityBaselineFile = process.env.CAPACITY_BASELINE_FILE,
}) {
  const root = await realpath(resolve(temporaryRoot || tmpdir()))
  const rootProject = await realpath(resolve(projectRoot))
  const capacityBaseline = await resolveCapacityBaseline(projectRoot, capacityBaselineFile)
  assertExternalWorkspace(rootProject, root)
  const workspace = await mkdtemp(join(root, 'xyy-lhci-'))
  const options = {
    recursive: true,
    mode: constants.COPYFILE_FICLONE,
    verbatimSymlinks: true,
  }

  try {
    for (const input of directoryInputs) await copyInput(projectRoot, workspace, input, options)
    for (const input of fileInputs) await copyInput(projectRoot, workspace, input, options)
    await mkdir(join(workspace, 'output'), { recursive: true })
    await cp(capacityBaseline, join(workspace, 'output/capacity-baseline.json'), options)
    await rm(join(workspace, '.astro'), { recursive: true, force: true })
    await rm(join(workspace, 'node_modules', '.vite'), { recursive: true, force: true })
    await assertContainedSymlinks(workspace, workspace)
    return workspace
  } catch (error) {
    await rm(workspace, { recursive: true, force: true })
    throw error
  }
}

export async function copyLighthouseRawReports(workspace, reportRoot) {
  const source = join(workspace, '.lighthouseci')
  try {
    await access(source)
  } catch {
    return false
  }
  const destination = join(reportRoot, 'raw')
  await rm(destination, { recursive: true, force: true })
  await mkdir(dirname(destination), { recursive: true })
  await cp(source, destination, { recursive: true, mode: constants.COPYFILE_FICLONE })
  return true
}

export async function removeLighthouseWorkspace(workspace) {
  await rm(workspace, { recursive: true, force: true })
}
