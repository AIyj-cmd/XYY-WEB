import { CMS_SCHEMA_VERSION } from './cms-contract.mjs'

export { CMS_SCHEMA_VERSION }

export const RELEASE_SCHEMA_VERSION = 1
export const RELEASE_ENVIRONMENTS = ['ci', 'staging', 'production', 'development']

const fields = [
  'schemaVersion',
  'gitSha',
  'gitShortSha',
  'releaseId',
  'buildTime',
  'environment',
  'cmsSchemaVersion',
]

function compactUtcTimestamp(buildTime) {
  return buildTime.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

/**
 * @param {{ gitSha: string, buildTime: string, environment: string, releaseId?: string }} input
 */
export function createReleaseIdentity({ gitSha, buildTime, environment, releaseId }) {
  const gitShortSha = typeof gitSha === 'string' ? gitSha.slice(0, 7) : ''
  return validateReleaseIdentity({
    schemaVersion: RELEASE_SCHEMA_VERSION,
    gitSha,
    gitShortSha,
    releaseId: releaseId || `${compactUtcTimestamp(buildTime)}-${gitShortSha}`,
    buildTime,
    environment,
    cmsSchemaVersion: CMS_SCHEMA_VERSION,
  })
}

export function validateReleaseIdentity(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('release_identity_invalid: manifest must be an object')
  }
  const keys = Object.keys(value)
  const unexpected = keys.filter((key) => !fields.includes(key))
  const missing = fields.filter((key) => !keys.includes(key))
  if (unexpected.length || missing.length) {
    throw new Error(
      `release_identity_invalid: fields missing=${missing.join(',') || 'none'} unexpected=${unexpected.join(',') || 'none'}`
    )
  }
  if (value.schemaVersion !== RELEASE_SCHEMA_VERSION) {
    throw new Error('release_identity_invalid: unsupported schemaVersion')
  }
  if (!/^[0-9a-f]{40}$/.test(value.gitSha)) {
    throw new Error('release_identity_invalid: gitSha must be a full lowercase commit SHA')
  }
  if (value.gitShortSha !== value.gitSha.slice(0, 7)) {
    throw new Error('release_identity_invalid: gitShortSha does not match gitSha')
  }
  if (
    typeof value.releaseId !== 'string' ||
    !/^[A-Za-z0-9._-]+$/.test(value.releaseId) ||
    !value.releaseId.includes(value.gitShortSha)
  ) {
    throw new Error('release_identity_invalid: releaseId must contain gitShortSha')
  }
  if (
    typeof value.buildTime !== 'string' ||
    Number.isNaN(Date.parse(value.buildTime)) ||
    new Date(value.buildTime).toISOString() !== value.buildTime
  ) {
    throw new Error('release_identity_invalid: buildTime must be UTC ISO-8601')
  }
  if (!RELEASE_ENVIRONMENTS.includes(value.environment)) {
    throw new Error('release_identity_invalid: unsupported environment')
  }
  if (value.cmsSchemaVersion !== CMS_SCHEMA_VERSION) {
    throw new Error('release_identity_invalid: cmsSchemaVersion does not match the CMS contract')
  }
  return Object.freeze({ ...value })
}
