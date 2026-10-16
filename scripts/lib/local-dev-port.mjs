import { readdir, readFile, readlink, realpath, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const LOOPBACK_HEX = '0100007F'

function validatePort(port) {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('local_dev_invalid_port')
}

function portHex(port) {
  return port.toString(16).toUpperCase().padStart(4, '0')
}

async function listeners(path, port) {
  let content
  try {
    content = await readFile(path, 'utf8')
  } catch (error) {
    throw new Error(`local_dev_proc_unavailable:${path}:${error?.code ?? 'unknown'}`, {
      cause: error,
    })
  }
  const expectedPort = portHex(port)
  return content
    .trim()
    .split('\n')
    .slice(1)
    .map((line) => line.trim().split(/\s+/))
    .filter((fields) => fields[3] === '0A' && fields[1]?.split(':')[1] === expectedPort)
    .map((fields) => ({ path, address: fields[1], inode: fields[9], uid: Number(fields[7]) }))
}

async function pidsForSocket(inode, expectedUid) {
  const pids = new Set()
  let unreadable = false
  for (const entry of await readdir('/proc', { withFileTypes: true })) {
    if (!entry.isDirectory() || !/^\d+$/.test(entry.name)) continue
    const processRoot = join('/proc', entry.name)
    let owner
    try {
      owner = await stat(processRoot)
    } catch (error) {
      if (error?.code === 'ENOENT') continue
      unreadable = true
      continue
    }
    if (owner.uid !== expectedUid) continue
    const fdDirectory = join(processRoot, 'fd')
    let descriptors
    try {
      descriptors = await readdir(fdDirectory)
    } catch (error) {
      if (error?.code === 'ENOENT') continue
      if (error?.code === 'EACCES') {
        unreadable = true
        continue
      }
      throw error
    }
    for (const descriptor of descriptors) {
      try {
        if ((await readlink(join(fdDirectory, descriptor))) === `socket:[${inode}]`)
          pids.add(Number(entry.name))
      } catch (error) {
        if (error?.code === 'ENOENT') continue
        if (error?.code === 'EACCES') unreadable = true
        else throw error
      }
    }
  }
  return { pids: [...pids], unreadable: unreadable && pids.size === 0 }
}

export async function isTrustedDevelopmentCommand({ argv, projectRoot, cwd }) {
  if (argv.some((argument) => argument.endsWith('/server.mjs') || argument === 'server.mjs'))
    return false
  const [, entrypoint] = argv
  if (!entrypoint) return false
  const expectedAstro = await realpath(
    join(projectRoot, 'node_modules', 'astro', 'bin', 'astro.mjs')
  )
  const expectedLocalDev = await realpath(join(projectRoot, 'scripts', 'local-dev.mjs'))
  let resolvedEntrypoint
  try {
    resolvedEntrypoint = await realpath(resolve(cwd, entrypoint))
  } catch {
    return false
  }
  return (
    resolvedEntrypoint === expectedLocalDev ||
    (resolvedEntrypoint === expectedAstro && argv.includes('dev'))
  )
}

async function inspectPid(pid, projectRoot) {
  const processRoot = join('/proc', String(pid))
  const [cwd, processStat, rootStat, executable, command] = await Promise.all([
    realpath(join(processRoot, 'cwd')),
    stat(processRoot),
    stat(projectRoot),
    realpath(join(processRoot, 'exe')),
    readFile(join(processRoot, 'cmdline')),
  ])
  if (cwd !== projectRoot) return { trusted: false, reason: 'cwd' }
  if (processStat.uid !== rootStat.uid) return { trusted: false, reason: 'uid' }
  if (executable !== (await realpath(process.execPath)))
    return { trusted: false, reason: 'executable' }
  const argv = command.toString().split('\0').filter(Boolean)
  return (await isTrustedDevelopmentCommand({ argv, projectRoot, cwd }))
    ? { trusted: true, pid }
    : { trusted: false, reason: 'command' }
}

async function processExists(pid) {
  try {
    await stat(join('/proc', String(pid)))
    return true
  } catch (error) {
    if (error?.code === 'ENOENT') return false
    throw error
  }
}

export async function inspectLocalDevPort({ projectRoot, port, expectedPid }) {
  validatePort(port)
  const root = await realpath(projectRoot)
  const rootUid = (await stat(root)).uid
  const matches = [
    ...(await listeners('/proc/net/tcp', port)),
    ...(await listeners('/proc/net/tcp6', port)),
  ]
  if (!matches.length) return { state: 'free' }
  if (
    matches.length !== 1 ||
    matches[0].path !== '/proc/net/tcp' ||
    !matches[0].address.startsWith(`${LOOPBACK_HEX}:`) ||
    matches[0].uid !== rootUid
  )
    return { state: 'occupied', reason: 'listener' }

  const owners = await pidsForSocket(matches[0].inode, rootUid)
  if (owners.unreadable || owners.pids.length !== 1) return { state: 'occupied', reason: 'owner' }
  if (expectedPid && owners.pids[0] !== expectedPid) return { state: 'occupied', reason: 'pid' }

  try {
    const inspected = await inspectPid(owners.pids[0], root)
    return inspected.trusted
      ? { state: 'trusted', pid: owners.pids[0] }
      : { state: 'occupied', reason: inspected.reason }
  } catch (error) {
    if (!(await processExists(owners.pids[0]))) return { state: 'free' }
    throw error
  }
}
