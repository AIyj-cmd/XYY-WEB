const genericEnglishFailure = (phone: string) =>
  phone
    ? `We could not submit your enquiry. Please call ${phone}.`
    : 'We could not submit your enquiry. Please use the contact details shown on this page.'

const messages = {
  body_too_large: 'Your submission is too large. Please shorten it and try again.',
  unsupported_content_type: 'The request format is not supported.',
  rate_limited: 'Too many submissions. Please try again later.',
  invalid_json: 'The request could not be read. Please try again.',
  validation_failed: 'Please complete the required fields using a valid domestic contact number.',
  storage_unavailable: (help: string) => `We could not save your enquiry. ${help}`,
  internal_error: (help: string) => `Something went wrong. ${help}`,
} as const

export function englishContactFailure(code: unknown, phone: string) {
  const help = phone
    ? `Please call ${phone}.`
    : 'Please use the contact details shown on this page.'
  if (typeof code !== 'string' || !Object.hasOwn(messages, code))
    return genericEnglishFailure(phone)
  const message = messages[code as keyof typeof messages]
  return typeof message === 'function' ? message(help) : message
}
