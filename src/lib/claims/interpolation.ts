import type { BrandClaim } from './types'
import { ClaimContractError, resolveApprovedClaim, type ClaimRegistry } from './validation'

export interface ClaimInterpolationSource {
  collection: string
  recordId?: string | number
  field: string
}

export interface ClaimInterpolationContext {
  pageScope: string
  source: ClaimInterpolationSource
  now?: Date
}

export class ClaimInterpolationError extends Error {
  readonly claimKey: string
  readonly pageScope: string
  readonly collection: string
  readonly field: string

  constructor(claimKey: string, context: ClaimInterpolationContext, cause?: unknown) {
    super(
      `[claims:interpolation_error] claimKey=${claimKey} pageScope=${context.pageScope} collection=${context.source.collection} field=${context.source.field}`,
      { cause }
    )
    this.name = 'ClaimInterpolationError'
    this.claimKey = claimKey
    this.pageScope = context.pageScope
    this.collection = context.source.collection
    this.field = context.source.field
  }
}

export function interpolateClaimTemplate<Registry extends ClaimRegistry>(
  value: string,
  context: ClaimInterpolationContext,
  registry: Registry
) {
  return value.replace(/\{\{\s*([^{}]+?)\s*\}\}/gu, (_token, rawKey: string) => {
    const key = rawKey.trim()
    if (!/^[A-Za-z][A-Za-z0-9]*$/.test(key) || !(key in registry)) {
      throw new ClaimContractError('unknown_claim', key, context.pageScope)
    }
    try {
      return resolveApprovedClaim(registry, key as keyof Registry, context.pageScope, context.now)
        .displayValue
    } catch (error) {
      if (error instanceof ClaimContractError) throw error
      throw new ClaimInterpolationError(key, context, error)
    }
  })
}

export type InterpolationRegistry = Readonly<Record<string, BrandClaim>>
