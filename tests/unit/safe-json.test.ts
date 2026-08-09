import { describe, expect, it } from 'vitest'

import { serializeJsonForScript } from '@/lib/safe-json'

describe('serializeJsonForScript', () => {
  it('prevents a closing script tag from escaping an embedded JSON element', () => {
    const payload = '</script><script>window.__xss=1</script>'
    const serialized = serializeJsonForScript({ payload })

    expect(serialized).not.toContain('</script>')
    expect(serialized).not.toContain('<script>')
    expect(serialized).toContain('\\u003c/script\\u003e')
    expect(JSON.parse(serialized)).toEqual({ payload })
  })

  it('escapes every HTML-significant and JavaScript line-separator character', () => {
    const payload = '<tag>&\u2028\u2029'
    const serialized = serializeJsonForScript(payload)

    expect(serialized).toBe('"\\u003ctag\\u003e\\u0026\\u2028\\u2029"')
    expect(JSON.parse(serialized)).toBe(payload)
  })

  it('uses valid JSON for otherwise unserializable top-level values', () => {
    expect(serializeJsonForScript(undefined)).toBe('null')
  })
})
