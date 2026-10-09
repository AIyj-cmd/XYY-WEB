import { describe, expect, it } from 'vitest'

import {
  ForwardedAddressError,
  TrustedProxyConfigurationError,
  normalizeIp,
  parseTrustedProxyCidrs,
  resolveTrustedClientAddress,
} from '../../server/trusted-proxy.mjs'

describe('trusted proxy requester resolution', () => {
  it('defaults to the socket peer and ignores spoofed forwarding headers', () => {
    expect(
      resolveTrustedClientAddress({
        socketAddress: '198.51.100.80',
        forwardedFor: '203.0.113.42',
        trustedProxyCidrs: parseTrustedProxyCidrs(),
      })
    ).toEqual({ clientAddress: '198.51.100.80', trustedPeer: false })
  })

  it('walks a trusted chain right-to-left until the first untrusted requester', () => {
    const trustedProxyCidrs = parseTrustedProxyCidrs('10.0.0.0/8, 2001:db8:1234::/48')
    expect(
      resolveTrustedClientAddress({
        socketAddress: '10.0.0.8',
        forwardedFor: '203.0.113.42, 10.1.2.3',
        trustedProxyCidrs,
      })
    ).toEqual({ clientAddress: '203.0.113.42', trustedPeer: true })
    expect(
      resolveTrustedClientAddress({
        socketAddress: '2001:db8:1234::8',
        forwardedFor: '2001:db8:ffff::42, 2001:db8:1234:1::3',
        trustedProxyCidrs,
      })
    ).toEqual({ clientAddress: '2001:db8:ffff::42', trustedPeer: true })
  })

  it('canonicalizes IPv4, IPv4-mapped IPv6, and compressed IPv6', () => {
    expect(normalizeIp('001.002.003.004')).toBeUndefined()
    expect(normalizeIp('::ffff:192.0.2.7')?.text).toBe('192.0.2.7')
    expect(normalizeIp('2001:0DB8:0:0:0:0:0:1')?.text).toBe('2001:db8::1')
  })

  it('fails startup for invalid CIDRs', () => {
    expect(() => parseTrustedProxyCidrs('10.0.0.0/33')).toThrow(TrustedProxyConfigurationError)
    expect(() => parseTrustedProxyCidrs('10.0.0.0/8,')).toThrow(TrustedProxyConfigurationError)
    expect(() => parseTrustedProxyCidrs('not-a-network')).toThrow(TrustedProxyConfigurationError)
  })

  it('rejects malformed, oversized, and overlong forwarded chains from a trusted peer', () => {
    const trustedProxyCidrs = parseTrustedProxyCidrs('10.0.0.0/8')
    for (const forwardedFor of [
      '203.0.113.42, invalid',
      Array.from({ length: 17 }, () => '203.0.113.42').join(','),
      '203.0.113.42'.padEnd(2_049, ' '),
    ]) {
      expect(() =>
        resolveTrustedClientAddress({ socketAddress: '10.0.0.8', forwardedFor, trustedProxyCidrs })
      ).toThrow(ForwardedAddressError)
    }
  })
})
