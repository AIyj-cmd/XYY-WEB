const genericEnglishFailure =
  'We could not submit your enquiry. Please try again and keep your details in the form.'

const messages = {
  body_too_large: 'Your submission is too large. Please shorten it and try again.',
  unsupported_content_type: 'The request format is not supported.',
  rate_limited: 'Too many submissions. Please try again later.',
  invalid_json: 'The request could not be read. Please try again.',
  validation_failed:
    'Please provide your name, a valid email address, your requirements, and consent. If you add a phone number, include + and the country or region code.',
  storage_unavailable:
    'We could not save your enquiry. Please try again and keep your details in the form.',
  internal_error: 'Something went wrong. Please try again and keep your details in the form.',
} as const

export function englishContactFailure(code: unknown) {
  if (typeof code !== 'string' || !Object.hasOwn(messages, code)) return genericEnglishFailure
  const message = messages[code as keyof typeof messages]
  return message
}

export const englishContactClientValidation = {
  missingEmail: 'Please enter your email address.',
  invalidEmail: 'Please enter a valid email address.',
  invalidPhone: 'If you add a phone number, include + and the country or region code.',
} as const
