import { englishContactFailure } from '@/lib/contact/client-copy'

const form = document.getElementById('contact-form') as HTMLFormElement | null
const button = document.getElementById('submit-btn') as HTMLButtonElement | null
const result = document.getElementById('form-result')
const isEnglish = form?.dataset.locale === 'en'
const contactPhone = form?.dataset.contactPhone || ''
const genericEnglishFailure = englishContactFailure(undefined, contactPhone)
const responseCode = (payload: unknown) =>
  payload && typeof payload === 'object' && 'code' in payload ? payload.code : undefined
const isEnglishSuccessPayload = (payload: unknown) =>
  Boolean(
    payload &&
    typeof payload === 'object' &&
    Object.hasOwn(payload, 'success') &&
    (payload as { success?: unknown }).success === true
  )

form?.addEventListener('submit', async (event) => {
  event.preventDefault()
  if (!button || !result) return

  button.disabled = true
  button.setAttribute('aria-busy', 'true')
  form.setAttribute('aria-busy', 'true')
  button.textContent = isEnglish ? 'Submitting…' : '提交中...'
  result.className = 'hidden'
  let englishSubmissionFailure = genericEnglishFailure

  try {
    const formData = new FormData(form)
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(formData)),
    })
    const payload = await response.json().catch(() => ({}))

    const invalidEnglishSuccess = isEnglish && response.ok && !isEnglishSuccessPayload(payload)
    if (!response.ok || invalidEnglishSuccess) {
      if (isEnglish && !invalidEnglishSuccess) {
        englishSubmissionFailure = englishContactFailure(responseCode(payload), contactPhone)
      }
      throw new Error(
        isEnglish
          ? englishSubmissionFailure
          : typeof payload.error === 'string'
            ? payload.error
            : 'server error'
      )
    }

    result.className =
      'mt-4 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm font-medium'
    result.textContent = isEnglish
      ? 'Thank you. Our business team will follow up on your requirements.'
      : '提交成功！商务团队将根据您的需求与您联系。'
    form.reset()
  } catch (error) {
    result.className = 'mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm'
    result.textContent = isEnglish
      ? englishSubmissionFailure
      : error instanceof Error && error.message !== 'server error'
        ? error.message
        : '提交失败，请直接拨打电话 400-6865-156 联系我们。'
  } finally {
    button.disabled = false
    button.removeAttribute('aria-busy')
    form.removeAttribute('aria-busy')
    button.textContent = isEnglish ? 'Submit enquiry' : '提交咨询'
  }
})
