import { Buffer } from 'node:buffer'
import { isIP } from 'node:net'

const MAX_FORWARDED_FOR_BYTES = 2_048
const MAX_FORWARDED_FOR_HOPS = 16

export class TrustedProxyConfigurationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'TrustedProxyConfigurationError'
  }
}

export class ForwardedAddressError extends Error {
  constructor() {
    super('Malformed forwarded address chain')
    this.name = 'ForwardedAddressError'
  }
}

function ipv4ToNumber(value) {
  const parts = value.split('.')
  if (parts.length !== 4 || parts.some((part) => !/^\d{1,3}$/.test(part))) return undefined
  const numbers = parts.map(Number)
  if (numbers.some((part) => part > 255)) return undefined
  return numbers.reduce((total, part) => (total << 8n) | BigInt(part), 0n)
}

function parseIpv6(value) {
  const lower = value.toLowerCase()
  if (lower.includes(':::')) return undefined

  const [head, tail] = lower.split('::')
  if (lower.split('::').length > 2) return undefined
  const headParts = head ? head.split(':') : []
  const tailParts = tail ? tail.split(':') : []
  const parts = [...headParts, ...tailParts]
  const embeddedIpv4 = parts.at(-1)?.includes('.')

  if (embeddedIpv4) {
    const ipv4 = ipv4ToNumber(parts.pop())
    if (ipv4 === undefined) return undefined
    parts.push(((ipv4 >> 16n) & 0xffffn).toString(16), (ipv4 & 0xffffn).toString(16))
  }
  if (parts.some((part) => !/^[0-9a-f]{1,4}$/.test(part))) return undefined
  if (lower.includes('::')) {
    if (parts.length >= 8) return undefined
    parts.splice(headParts.length, 0, ...Array(8 - parts.length).fill('0'))
  } else if (parts.length !== 8) {
    return undefined
  }

  return parts.reduce((total, part) => (total << 16n) | BigInt(`0x${part}`), 0n)
}

function formatIpv6(value) {
  const parts = []
  for (let index = 0; index < 8; index += 1) {
    const shift = BigInt((7 - index) * 16)
    parts.push(Number((value >> shift) & 0xffffn))
  }

  let bestStart = -1
  let bestLength = 0
  for (let index = 0; index < parts.length;) {
    if (parts[index] !== 0) {
      index += 1
      continue
    }
    let end = index
    while (end < parts.length && parts[end] === 0) end += 1
    if (end - index > bestLength && end - index >= 2) {
      bestStart = index
      bestLength = end - index
    }
    index = end
  }

  if (bestStart === -1) return parts.map((part) => part.toString(16)).join(':')
  const before = parts
    .slice(0, bestStart)
    .map((part) => part.toString(16))
    .join(':')
  const after = parts
    .slice(bestStart + bestLength)
    .map((part) => part.toString(16))
    .join(':')
  return before && after ? `${before}::${after}` : before ? `${before}::` : `::${after}`
}

export function normalizeIp(value) {
  const candidate = value?.trim()
  if (!candidate) return undefined
  const family = isIP(candidate)
  if (family === 4) {
    const numeric = ipv4ToNumber(candidate)
    return numeric === undefined
      ? undefined
      : { family: 4, value: numeric, text: candidate.split('.').map(Number).join('.') }
  }
  if (family !== 6) return undefined

  const numeric = parseIpv6(candidate)
  if (numeric === undefined) return undefined
  const mappedIpv4Prefix = 0xffffn
  if (numeric >> 32n === mappedIpv4Prefix) {
    const text = [24n, 16n, 8n, 0n].map((shift) => Number((numeric >> shift) & 0xffn)).join('.')
    return { family: 4, value: ipv4ToNumber(text), text }
  }
  return { family: 6, value: numeric, text: formatIpv6(numeric) }
}

function parseCidr(value) {
  const [address, bitsText, ...extra] = value.split('/')
  if (extra.length || !address || bitsText === undefined || !/^\d{1,3}$/.test(bitsText)) {
    throw new TrustedProxyConfigurationError(`Invalid trusted proxy CIDR: ${value}`)
  }
  const ip = normalizeIp(address)
  const bits = Number(bitsText)
  const maximum = ip?.family === 4 ? 32 : 128
  if (!ip || bits > maximum) {
    throw new TrustedProxyConfigurationError(`Invalid trusted proxy CIDR: ${value}`)
  }
  const width = BigInt(maximum)
  const mask = bits === 0 ? 0n : ((1n << width) - 1n) ^ ((1n << (width - BigInt(bits))) - 1n)
  return { family: ip.family, network: ip.value & mask, mask }
}

export function parseTrustedProxyCidrs(value = '') {
  if (!value.trim()) return []
  return value.split(',').map((entry) => {
    const cidr = entry.trim()
    if (!cidr) throw new TrustedProxyConfigurationError('Invalid trusted proxy CIDR list')
    return parseCidr(cidr)
  })
}

function isTrusted(ip, cidrs) {
  return Boolean(
    ip && cidrs.some((cidr) => cidr.family === ip.family && (ip.value & cidr.mask) === cidr.network)
  )
}

function parseForwardedFor(header) {
  if (Buffer.byteLength(header, 'utf8') > MAX_FORWARDED_FOR_BYTES) throw new ForwardedAddressError()
  const hops = header.split(',').map((entry) => entry.trim())
  if (!hops.length || hops.length > MAX_FORWARDED_FOR_HOPS) throw new ForwardedAddressError()
  const parsed = hops.map(normalizeIp)
  if (parsed.some((ip) => !ip)) throw new ForwardedAddressError()
  return parsed
}

/** Derive one canonical requester address from a socket peer and a trusted XFF chain. */
export function resolveTrustedClientAddress({ socketAddress, forwardedFor, trustedProxyCidrs }) {
  let current = normalizeIp(socketAddress)
  if (!current) return { clientAddress: 'unknown', trustedPeer: false }
  if (!isTrusted(current, trustedProxyCidrs)) {
    return { clientAddress: current.text, trustedPeer: false }
  }
  if (!forwardedFor) return { clientAddress: current.text, trustedPeer: true }

  const hops = parseForwardedFor(forwardedFor)
  for (let index = hops.length - 1; index >= 0; index -= 1) {
    if (!isTrusted(current, trustedProxyCidrs)) break
    current = hops[index]
  }
  return { clientAddress: current.text, trustedPeer: true }
}

export const TRUSTED_PROXY_LIMITS = {
  maxForwardedForBytes: MAX_FORWARDED_FOR_BYTES,
  maxForwardedForHops: MAX_FORWARDED_FOR_HOPS,
}
