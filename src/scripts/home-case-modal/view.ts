import type { CaseDetail, CaseStat } from './types'

const createStat = (item: CaseStat) => {
  const card = document.createElement('div')
  card.className = 'modal-stat-card'

  const value = document.createElement('div')
  value.className = 'modal-stat-val'
  value.textContent = item.value
  card.append(value)

  if (item.unit) {
    const unit = document.createElement('div')
    unit.className = 'modal-stat-unit'
    unit.textContent = item.unit
    card.append(unit)
  }

  const label = document.createElement('div')
  label.className = 'modal-stat-label'
  label.textContent = item.label
  card.append(label)
  return card
}

export const clearCaseModalImage = (heroImage: HTMLImageElement | null) => {
  if (!heroImage) return
  heroImage.hidden = true
  heroImage.removeAttribute('src')
  heroImage.alt = ''
}

export function renderCaseModal(
  modal: HTMLElement,
  panel: HTMLElement,
  heroImage: HTMLImageElement | null,
  detail: CaseDetail,
  detailUrl: string
) {
  panel.style.setProperty('--modal-accent', detail.accent || '#2563eb')
  if (heroImage && detail.image) {
    heroImage.src = detail.image
    heroImage.alt = detail.fullName
    heroImage.hidden = false
  }

  const category = modal.querySelector<HTMLElement>('#modal-category')
  const title = modal.querySelector<HTMLElement>('#modal-title')
  const description = modal.querySelector<HTMLElement>('#modal-desc')
  const stats = modal.querySelector<HTMLElement>('#modal-stats')
  const detailLink = modal.querySelector<HTMLAnchorElement>('#modal-detail-link')
  if (category) category.textContent = detail.category
  if (title) title.textContent = detail.fullName
  if (description) description.textContent = detail.description
  if (stats) stats.replaceChildren(...detail.stats.map(createStat))
  if (detailLink) detailLink.href = detailUrl

  const modalBody = modal.querySelector<HTMLElement>('.modal-body')
  if (modalBody) modalBody.scrollTop = 0
}
