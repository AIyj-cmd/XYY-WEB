import { URL, pathToFileURL } from 'node:url'

export const ACTIVE_REMOTE_ORIGIN = 'https://8.138.148.179'
export const FORMAL_SITE_ORIGIN = 'https://56xyy.com'

const LOOPBACK_HOSTS = new Set(['localhost', '[::1]'])

function fail(label, reason) {
  throw new Error(`${label}_${reason}`)
}

function parseUrl(value, label) {
  if (typeof value !== 'string' || !value.trim()) fail(label, 'required')
  let url
  try {
    url = new URL(value)
  } catch {
    fail(label, 'invalid')
  }
  if (!['http:', 'https:'].includes(url.protocol)) fail(label, 'protocol')
  if (url.username || url.password || url.search || url.hash) fail(label, 'unsafe')
  return url
}

function normalizedUrl(url) {
  return url.href.replace(/\/+$/, '')
}

function isLoopback(url) {
  if (LOOPBACK_HOSTS.has(url.hostname)) return true
  const parts = url.hostname.split('.')
  return (
    parts.length === 4 &&
    parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255) &&
    parts[0] === '127'
  )
}

export function assertOperationTarget(value, label = 'remote_target') {
  const url = parseUrl(value, label)
  if (isLoopback(url)) return normalizedUrl(url)
  if (url.protocol !== 'https:' || url.origin !== ACTIVE_REMOTE_ORIGIN) fail(label, 'unapproved')
  return normalizedUrl(url)
}

export function assertCanonicalTarget(value, label = 'canonical_target') {
  const url = parseUrl(value, label)
  if (isLoopback(url) || url.origin === ACTIVE_REMOTE_ORIGIN || url.origin === FORMAL_SITE_ORIGIN)
    return normalizedUrl(url)
  fail(label, 'unapproved')
}

export function assertRemoteSshTarget(value, label = 'deploy_host') {
  if (typeof value !== 'string' || !value.trim()) fail(label, 'required')
  const target = value.trim()
  if (target === '8.138.148.179') return target
  if (/^[A-Za-z_][A-Za-z0-9_-]*@8\.138\.148\.179$/.test(target)) return target
  fail(label, 'unapproved')
}

function main(argv) {
  if (!argv.length || argv.length % 2) fail('remote_target_policy', 'arguments')
  for (let index = 0; index < argv.length; index += 2) {
    const [kind, value] = [argv[index], argv[index + 1]]
    if (!value || !['--operation-url', '--canonical-url', '--ssh'].includes(kind))
      fail('remote_target_policy', 'arguments')
    if (kind === '--operation-url') assertOperationTarget(value, 'operation_target')
    if (kind === '--canonical-url') assertCanonicalTarget(value, 'canonical_target')
    if (kind === '--ssh') assertRemoteSshTarget(value, 'deploy_host')
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  try {
    main(process.argv.slice(2))
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'remote_target_policy_failed')
    process.exitCode = 1
  }
}
