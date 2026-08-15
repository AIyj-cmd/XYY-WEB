import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const registryFiles = [
  'src/lib/claims/fulfillment-scale.ts',
  'src/lib/claims/fulfillment-performance.ts',
  'src/lib/claims/quality.ts',
]

export function readClaimAliases(root) {
  const aliases = new Set()
  for (const file of registryFiles) {
    const source = readFileSync(resolve(root, file), 'utf8')
    for (const match of source.matchAll(/^ {2}([A-Za-z][A-Za-z0-9]*): \{/gmu)) {
      aliases.add(match[1])
    }
  }
  return aliases
}

export function assertKnownClaimReferences(value, { root, source }) {
  const aliases = readClaimAliases(root)

  function inspect(current, path) {
    if (typeof current === 'string') {
      for (const match of current.matchAll(/\{\{\s*([^{}]+?)\s*\}\}/gu)) {
        const key = match[1].trim()
        if (!aliases.has(key)) throw new Error(`Unknown claimKey "${key}" in ${source}:${path}`)
      }
      return
    }
    if (Array.isArray(current)) {
      current.forEach((item, index) => inspect(item, `${path}[${index}]`))
      return
    }
    if (!current || typeof current !== 'object') return
    for (const [field, item] of Object.entries(current)) {
      if (field === 'claimKey' && (typeof item !== 'string' || !aliases.has(item))) {
        throw new Error(`Unknown claimKey "${String(item)}" in ${source}:${path}.${field}`)
      }
      inspect(item, `${path}.${field}`)
    }
  }

  inspect(value, '$')
}
