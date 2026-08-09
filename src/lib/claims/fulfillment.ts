import { FULFILLMENT_PERFORMANCE_CLAIMS } from './fulfillment-performance'
import { FULFILLMENT_SCALE_CLAIMS } from './fulfillment-scale'

/** Stable fulfillment-claim facade for existing consumers. */
export const FULFILLMENT_CLAIMS = {
  ...FULFILLMENT_PERFORMANCE_CLAIMS,
  ...FULFILLMENT_SCALE_CLAIMS,
} as const
