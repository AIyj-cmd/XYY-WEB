import '../.astro/types.d.ts'

declare global {
  namespace App {
    interface Locals {
      /** Canonical server-resolved requester address, never a raw browser header. */
      requesterIp?: string
    }
  }
}
