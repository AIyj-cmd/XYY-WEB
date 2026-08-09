import { describe, expect, it } from 'vitest'
import { isRootDisallowedForUserAgent } from '../../scripts/lib/robots-policy.mjs'

describe('robots policy checks', () => {
  it('does not treat a GPTBot-only block as a global site block', () => {
    const robots = `User-agent: *
Allow: /

User-agent: GPTBot
Disallow: /
`
    expect(isRootDisallowedForUserAgent(robots)).toBe(false)
    expect(isRootDisallowedForUserAgent(robots, 'GPTBot')).toBe(true)
  })

  it('detects a root block in the global user-agent group', () => {
    const robots = `User-agent: *
Disallow: /

User-agent: OAI-SearchBot
Allow: /
`
    expect(isRootDisallowedForUserAgent(robots)).toBe(true)
  })

  it('ignores comments and non-root disallow rules', () => {
    const robots = `# candidate rules
User-agent: *
Disallow: /admin/ # protected area
Disallow: /cms/
`
    expect(isRootDisallowedForUserAgent(robots)).toBe(false)
  })
})
