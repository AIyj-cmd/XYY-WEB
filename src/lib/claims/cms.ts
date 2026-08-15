import { getClaimPresentation, isBrandClaimKey, type BrandClaimKey } from '../claims'
import { resolveLegacyHomepageClaim } from './legacy-mapping'

export interface CmsHomepageStatReference {
  id?: number
  claimKey?: string
  value?: string
  label?: string
  unit?: string
  detail?: string
}

export class CmsClaimReferenceError extends Error {
  readonly code: 'unknown_claim' | 'legacy_mapping_missing' | 'invalid_record'

  constructor(code: CmsClaimReferenceError['code'], identifier: string) {
    super(`[claims:${code}] collection=homepage_content reference=${identifier}`)
    this.name = 'CmsClaimReferenceError'
    this.code = code
  }
}

function requiredText(value: unknown, field: string) {
  if (typeof value !== 'string') throw new CmsClaimReferenceError('invalid_record', field)
  return value
}

function resolveClaimKey(item: CmsHomepageStatReference) {
  if (item.claimKey !== undefined) {
    if (!isBrandClaimKey(item.claimKey)) {
      throw new CmsClaimReferenceError('unknown_claim', item.claimKey)
    }
    return { claimKey: item.claimKey, legacy: false }
  }

  const claimKey = resolveLegacyHomepageClaim(item.id)
  if (!claimKey) {
    throw new CmsClaimReferenceError('legacy_mapping_missing', String(item.id ?? 'missing_id'))
  }
  return { claimKey, legacy: true }
}

export function resolveHomepageClaimStat(
  item: CmsHomepageStatReference,
  index: number,
  warned: Set<string>
) {
  const { claimKey, legacy } = resolveClaimKey(item)
  const presentation = getClaimPresentation(claimKey, 'home')
  const recordId = item.id ?? index + 1

  if (legacy) {
    const warningKey = `legacy:${claimKey}`
    if (!warned.has(warningKey)) {
      warned.add(warningKey)
      console.warn(
        `[claims:legacy] collection=homepage_content record=${recordId} claimKey=${claimKey}`
      )
    }
  } else if (
    (item.value !== undefined && item.value !== presentation.value) ||
    (item.unit !== undefined && item.unit !== presentation.unit)
  ) {
    const warningKey = `conflict:${claimKey}`
    if (!warned.has(warningKey)) {
      warned.add(warningKey)
      console.warn(
        `[claims:conflict] collection=homepage_content record=${recordId} claimKey=${claimKey}`
      )
    }
  }

  return {
    id: index + 1,
    sort: index + 1,
    claimKey: claimKey as BrandClaimKey,
    value: presentation.value,
    unit: presentation.unit,
    label: requiredText(item.label, 'label'),
    detail: requiredText(item.detail, 'detail'),
  }
}
