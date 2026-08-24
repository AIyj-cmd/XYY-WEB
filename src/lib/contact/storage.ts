import type { ContactLead } from './validation'
import { maskContactPhone } from './validation'

const failureMessage = '提交失败，请稍后重试或直接拨打客服热线'
const XIANSUO_TIMEOUT_MS = 5_000

function configuredIntegrationToken(rawToken: string | undefined) {
  const token = rawToken?.trim()
  return token && new TextEncoder().encode(token).byteLength >= 32 ? token : null
}

function logStorageFailure(reason: string, lead: ContactLead, status?: number) {
  console.error(`[contact] ${reason}:`, {
    ...(status ? { status } : {}),
    name: lead.name,
    phone: maskContactPhone(lead.phone),
    company: lead.company,
  })
}

function resolveIntegrationUrl(rawUrl: string | undefined) {
  if (!rawUrl) return null
  try {
    const url = new URL(rawUrl)
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
      return null
    }
    return `${url.toString().replace(/\/+$/, '')}/api/integrations/website-leads`
  } catch {
    return null
  }
}

export async function storeContactLead(lead: ContactLead) {
  const integrationUrl = resolveIntegrationUrl(process.env.XIANSUO_API_URL)
  const integrationToken = configuredIntegrationToken(process.env.XIANSUO_INGEST_TOKEN)

  if (!integrationUrl || !integrationToken) {
    logStorageFailure('Xiansuo storage is not configured; lead rejected', lead)
    return { error: failureMessage }
  }

  try {
    const response = await fetch(integrationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${integrationToken}`,
      },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(XIANSUO_TIMEOUT_MS),
    })

    if (!response.ok) {
      logStorageFailure('Xiansuo rejected lead', lead, response.status)
      return { error: failureMessage }
    }
    const payload: unknown = await response.json()
    if (
      !payload ||
      typeof payload !== 'object' ||
      (payload as { code?: unknown }).code !== 0 ||
      !(payload as { data?: unknown }).data ||
      typeof (payload as { data?: unknown }).data !== 'object' ||
      ![true, false].includes(
        (payload as { data: { duplicate?: unknown } }).data.duplicate as boolean
      )
    ) {
      logStorageFailure('Xiansuo returned an invalid lead response', lead)
      return { error: failureMessage }
    }
  } catch {
    logStorageFailure('Xiansuo unavailable, lead not saved', lead)
    return { error: failureMessage }
  }

  return { success: true as const }
}
