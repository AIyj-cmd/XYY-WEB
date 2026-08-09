import type { ContactLead } from './validation'
import { maskContactPhone } from './validation'

const failureMessage = '提交失败，请稍后重试或直接拨打客服热线'

function logStorageFailure(reason: string, lead: ContactLead, status?: number) {
  console.error(`[contact] ${reason}:`, {
    ...(status ? { status } : {}),
    name: lead.name,
    phone: maskContactPhone(lead.phone),
    company: lead.company,
  })
}

export async function storeContactLead(lead: ContactLead) {
  const directusUrl = import.meta.env.DIRECTUS_URL
  const directusToken = import.meta.env.DIRECTUS_TOKEN

  if (!directusUrl || !directusToken) {
    logStorageFailure('Directus storage is not configured; lead rejected', lead)
    return { error: failureMessage }
  }

  try {
    const response = await fetch(`${directusUrl.replace(/\/+$/, '')}/items/contact_leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${directusToken}`,
      },
      body: JSON.stringify(lead),
    })

    if (!response.ok) {
      logStorageFailure('Directus rejected lead', lead, response.status)
      return { error: failureMessage }
    }
  } catch {
    logStorageFailure('Directus unavailable, lead not saved', lead)
    return { error: failureMessage }
  }

  return { success: true as const }
}
