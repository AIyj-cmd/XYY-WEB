import { CLAIM_TEXT } from './claims'

export function interpolateClaims(value: string): string {
  return value.replace(/\{\{([A-Za-z][A-Za-z0-9]*)\}\}/g, (token, key: string) => {
    return key in CLAIM_TEXT ? CLAIM_TEXT[key as keyof typeof CLAIM_TEXT] : token
  })
}
