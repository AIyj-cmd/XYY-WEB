import { describe, expect, it } from 'vitest'

import {
  assertCanonicalTarget,
  assertOperationTarget,
  assertRemoteSshTarget,
  ACTIVE_REMOTE_ORIGIN,
  FORMAL_SITE_ORIGIN,
} from '../../scripts/lib/remote-target-policy.mjs'
import {
  BANNED_OPERATION_TARGETS,
  LOOPBACK_CMS,
  RETIRED_ORIGIN,
} from './helpers/remote-target-fixtures'

describe('remote target policy', () => {
  it('allows loopback and the exact ECS HTTPS origin for operations', () => {
    expect(assertOperationTarget(`${LOOPBACK_CMS}///`)).toBe(`${LOOPBACK_CMS}`)
    for (const target of ['http://localhost:4399', 'http://127.0.0.2:4399', 'http://[::1]:4399']) {
      expect(assertOperationTarget(target)).toBe(target)
    }
    expect(assertOperationTarget(`${ACTIVE_REMOTE_ORIGIN}/cms`)).toBe(`${ACTIVE_REMOTE_ORIGIN}/cms`)
  })

  it.each(BANNED_OPERATION_TARGETS)('rejects banned operation target %s', (target) => {
    expect(() => assertOperationTarget(target)).toThrow(
      /remote_target_(unapproved|required|protocol)/
    )
  })

  it.each([
    '',
    'not-a-url',
    `${LOOPBACK_CMS}?token=secret`,
    `${LOOPBACK_CMS}#fragment`,
    'https://user:password@8.138.148.179',
  ])('rejects unsafe operation target %s', (target) =>
    expect(() => assertOperationTarget(target)).toThrow()
  )

  it('keeps canonical metadata independent while allowing only approved origins', () => {
    expect(assertCanonicalTarget(FORMAL_SITE_ORIGIN)).toBe(FORMAL_SITE_ORIGIN)
    expect(() => assertCanonicalTarget(RETIRED_ORIGIN)).toThrow()
    expect(() => assertCanonicalTarget('https://unknown.example')).toThrow()
    expect(assertCanonicalTarget(LOOPBACK_CMS)).toBe(LOOPBACK_CMS)
  })

  it('accepts only the exact ECS SSH host with an optional safe username', () => {
    expect(assertRemoteSshTarget('8.138.148.179')).toBe('8.138.148.179')
    expect(assertRemoteSshTarget('deploy_qa-1@8.138.148.179')).toBe('deploy_qa-1@8.138.148.179')
    for (const target of [
      'root@56xyy.com',
      '8.138.148.180',
      '47.82.105.103',
      'wz.tomatopia.top',
      'root@8.138.148.179:22',
      '',
    ]) {
      expect(() => assertRemoteSshTarget(target)).toThrow()
    }
  })
})
