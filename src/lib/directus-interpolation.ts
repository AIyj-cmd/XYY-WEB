import { BRAND_CLAIMS } from './claims'
import { interpolateClaimTemplate, type ClaimInterpolationContext } from './claims/interpolation'

export function interpolateClaims(value: string, context: ClaimInterpolationContext): string {
  return interpolateClaimTemplate(value, context, BRAND_CLAIMS)
}
