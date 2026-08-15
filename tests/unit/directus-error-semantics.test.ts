import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  __setDirectusRequesterForTests,
  __setDirectusTimeoutForTests,
  getCases,
  getFaqs,
  getServices,
} from '@/lib/directus'

describe('Directus error semantics', () => {
  beforeEach(() => {
    __setDirectusRequesterForTests(null)
    __setDirectusTimeoutForTests()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    __setDirectusRequesterForTests(null)
    __setDirectusTimeoutForTests()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  const withStatus = (status: number) => Object.assign(new Error(`HTTP ${status}`), { status })
  const faqFallback = [{ q: '本地问题', a: '本地答案' }]

  it('uses the reviewed FAQ fallback only when the CMS network is unavailable', async () => {
    const warningSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    __setDirectusRequesterForTests(async () => {
      throw new Error('connect ECONNREFUSED')
    })

    await expect(getFaqs('home', faqFallback)).resolves.toEqual(faqFallback)
    expect(warningSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[directus:fallback\].*collection=faqs.*reason=network/)
    )
  })

  it('uses fallback on timeout and logs timeout as the reason', async () => {
    const warningSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    __setDirectusRequesterForTests(async () => {
      throw new DOMException('request timed out', 'AbortError')
    })

    await expect(getFaqs('home', faqFallback)).resolves.toEqual(faqFallback)
    expect(warningSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[directus:fallback\].*collection=faqs.*reason=timeout/)
    )
  })

  it('applies the centralized timeout to collection requests', async () => {
    const warningSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    __setDirectusTimeoutForTests(5)
    __setDirectusRequesterForTests(() => new Promise(() => {}))

    await expect(getFaqs('home', faqFallback)).resolves.toEqual(faqFallback)
    expect(warningSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[directus:fallback\].*collection=faqs.*reason=timeout/)
    )
  })

  it('uses fallback on a CMS 500 response and logs the status', async () => {
    const warningSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    __setDirectusRequesterForTests(async () => {
      throw withStatus(500)
    })

    await expect(getFaqs('home', faqFallback)).resolves.toEqual(faqFallback)
    expect(warningSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[directus:fallback\].*reason=server_error.*status=500/)
    )
  })

  it.each([401, 403])('fails explicitly on CMS %s without using fallback', async (status) => {
    const warningSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    __setDirectusRequesterForTests(async () => {
      throw withStatus(status)
    })

    await expect(getFaqs('home', faqFallback)).rejects.toThrow(
      new RegExp(`\\[directus:unauthorized\\].*collection=faqs.*status=${status}`)
    )
    expect(warningSpy).not.toHaveBeenCalled()
  })

  it('fails explicitly on invalid JSON without using fallback', async () => {
    const warningSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    __setDirectusRequesterForTests(async () => {
      throw new SyntaxError('Unexpected token')
    })

    await expect(getCases([])).rejects.toThrow(
      /\[directus:invalid\].*collection=cases.*reason=invalid_json/
    )
    expect(warningSpy).not.toHaveBeenCalled()
  })

  it('fails explicitly when a collection payload is not an array', async () => {
    const warningSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    __setDirectusRequesterForTests(async () => ({ data: 'not-an-array' }))

    await expect(getCases([])).rejects.toThrow(
      /\[directus:invalid\].*collection=cases.*reason=invalid_data/
    )
    expect(warningSpy).not.toHaveBeenCalled()
  })

  it('fails explicitly when a collection contains an empty record', async () => {
    const warningSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    __setDirectusRequesterForTests(async () => [{}])

    await expect(getCases([])).rejects.toThrow(
      /\[directus:invalid\].*collection=cases.*reason=invalid_data/
    )
    expect(warningSpy).not.toHaveBeenCalled()
  })

  it('fails explicitly when the HTTP payload is missing data', async () => {
    const warningSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ unexpected: [] }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          })
      )
    )

    await expect(getCases([])).rejects.toThrow(
      /\[directus:invalid\].*collection=cases.*reason=missing_data/
    )
    expect(warningSpy).not.toHaveBeenCalled()
  })

  it('clears the test requester so state does not leak between tests', async () => {
    __setDirectusRequesterForTests(async () => [
      {
        id: 1,
        sort: 1,
        slug: 'from-override',
        icon: 'warehouse',
        name: '覆盖请求',
        subtitle: '',
        description: '',
        features: [],
      },
    ])
    await expect(getServices()).resolves.toHaveLength(1)

    __setDirectusRequesterForTests(null)
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ data: [] }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          })
      )
    )

    await expect(getServices()).resolves.toEqual([])
  })
})
