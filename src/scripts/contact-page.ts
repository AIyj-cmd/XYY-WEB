import { englishContactFailure } from '@/lib/contact/client-copy'
import {
  type ContactFormField,
  isContactFormField,
  validateContactForm,
} from './contact-form-validation'

const form = document.getElementById('contact-form') as HTMLFormElement | null
const button = document.getElementById('submit-btn') as HTMLButtonElement | null
const result = document.getElementById('form-result')
const locale = form?.dataset.locale === 'en' ? 'en' : 'zh-CN'
const genericFailure =
  locale === 'en'
    ? englishContactFailure(undefined)
    : '提交失败，请直接拨打电话 400-6865-156 联系我们。'
const timeoutFailure =
  locale === 'en'
    ? 'The request timed out. Please try again and keep your details in the form.'
    : '提交超时，请重试并保留已填写的信息。'

let submitting = false

const isSuccessPayload = (payload: unknown) =>
  Boolean(
    payload &&
    typeof payload === 'object' &&
    Object.hasOwn(payload, 'success') &&
    (payload as { success?: unknown }).success === true
  )

const responseCode = (payload: unknown) =>
  payload && typeof payload === 'object' && 'code' in payload ? payload.code : undefined

const responseErrorMessage = (payload: unknown) =>
  payload &&
  typeof payload === 'object' &&
  typeof (payload as { error?: unknown }).error === 'string'
    ? (payload as { error: string }).error
    : undefined

const responseField = (payload: unknown): ContactFormField | null => {
  const field =
    payload && typeof payload === 'object' && 'field' in payload
      ? (payload as { field?: unknown }).field
      : undefined
  return isContactFormField(field) ? field : null
}

function setResult(message: string, state: 'error' | 'success') {
  if (!result) return
  result.className =
    state === 'success'
      ? 'mt-4 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm font-medium'
      : 'mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm'
  result.textContent = message
}

function focusSummary() {
  result?.focus()
}

function focusField(field: ContactFormField) {
  if (!form) return focusSummary()
  const control = form.elements.namedItem(field)
  if (!(control instanceof HTMLElement)) return focusSummary()
  const optionalFields = control.closest<HTMLDetailsElement>('[data-contact-optional-fields]')
  if (optionalFields) optionalFields.open = true
  control.focus()
}

function showValidationError(field: ContactFormField, message: string) {
  setResult(message, 'error')
  focusField(field)
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault()
  if (!button || !result || submitting) return

  const formData = new FormData(form)
  const validationIssue = validateContactForm(formData, locale)
  if (validationIssue) {
    showValidationError(validationIssue.field, validationIssue.message)
    return
  }

  submitting = true
  const controller = new AbortController()
  let timedOut = false
  const timeout = window.setTimeout(() => {
    timedOut = true
    controller.abort()
  }, 15_000)
  let failureMessage = genericFailure
  let failureField: ContactFormField | null = null

  button.disabled = true
  button.setAttribute('aria-busy', 'true')
  form.setAttribute('aria-busy', 'true')
  button.textContent = locale === 'en' ? 'Submitting…' : '提交中...'
  result.className = 'hidden'

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(formData)),
      signal: controller.signal,
    })
    let payload: unknown
    try {
      payload = await response.json()
    } catch (error) {
      if (timedOut) throw error
      payload = {}
    }

    if (!response.ok || !isSuccessPayload(payload)) {
      failureField = responseField(payload)
      failureMessage =
        locale === 'en'
          ? englishContactFailure(responseCode(payload))
          : (responseErrorMessage(payload) ?? genericFailure)
      throw new Error('contact_submission_failed')
    }

    setResult(
      locale === 'en'
        ? 'Thank you. Our business team will follow up on your requirements.'
        : '提交成功！商务团队将根据您的需求与您联系。',
      'success'
    )
    form.reset()
  } catch {
    setResult(timedOut ? timeoutFailure : failureMessage, 'error')
    if (failureField) focusField(failureField)
    else focusSummary()
  } finally {
    window.clearTimeout(timeout)
    submitting = false
    button.disabled = false
    button.removeAttribute('aria-busy')
    form.removeAttribute('aria-busy')
    button.textContent = locale === 'en' ? 'Submit enquiry' : '提交咨询'
  }
})
