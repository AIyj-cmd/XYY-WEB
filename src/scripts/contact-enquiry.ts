const message = document.getElementById('message') as HTMLTextAreaElement | null
const templateButton = document.querySelector<HTMLButtonElement>('[data-contact-template]')
const templateStatus = document.getElementById('contact-template-status')

type OutlineField = { title: string; line: string }

const outlines: Record<'zh' | 'en', OutlineField[]> = {
  zh: [
    { title: '品类：', line: '品类：' },
    { title: 'SKU/订单规模：', line: 'SKU/订单规模：' },
    { title: '销售渠道：', line: '销售渠道：' },
    { title: '退货情况：', line: '退货情况：' },
    { title: '计划时间：', line: '计划时间：' },
  ],
  en: [
    { title: 'Category:', line: 'Category:' },
    { title: 'SKU / order scale:', line: 'SKU / order scale:' },
    { title: 'Sales channels:', line: 'Sales channels:' },
    { title: 'Returns scenario:', line: 'Returns scenario:' },
    { title: 'Target timeline:', line: 'Target timeline:' },
  ],
} as const

const escapeExpression = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const hasField = (value: string, title: string) =>
  new RegExp(`(^|\\n)\\s*${escapeExpression(title)}`, 'm').test(value)
const contextFields = (value: string) =>
  value
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const separator = Math.max(line.indexOf('：'), line.indexOf(':'))
      return { title: separator >= 0 ? line.slice(0, separator + 1) : line, line }
    })

templateButton?.addEventListener('click', () => {
  if (!message || !templateStatus) return

  const form = message.closest<HTMLFormElement>('form')
  const english = form?.dataset.locale === 'en'
  const fields = [
    ...(english ? outlines.en : outlines.zh),
    ...contextFields(form?.dataset.enquiryContext || ''),
  ]
  const currentValue = message.value
  const missingLines = fields
    .filter(({ title }) => !hasField(currentValue, title))
    .map(({ line }) => line)

  if (!missingLines.length) {
    templateStatus.textContent = english
      ? 'All available outline fields are already in your requirements.'
      : '可用的填写提纲字段已在需求描述中。'
    return
  }

  const addition = missingLines.join('\n')
  const nextValue = currentValue ? `${currentValue}\n\n${addition}` : addition

  if (nextValue.length > message.maxLength) {
    templateStatus.textContent = english
      ? 'The outline was not added because it would exceed the 1200-character limit. Your text is unchanged.'
      : '加入填写提纲会超过1200字限制，原有内容未修改。'
    return
  }

  message.value = nextValue
  message.dispatchEvent(new Event('input', { bubbles: true }))
  templateStatus.textContent = english
    ? 'Outline added. Complete or edit it before submitting.'
    : '已加入填写提纲，可继续补充或编辑后提交。'
  message.focus()
})
