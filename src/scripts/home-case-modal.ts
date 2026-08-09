import type { CaseDetail } from './home-case-modal/types'
import { clearCaseModalImage, renderCaseModal } from './home-case-modal/view'

const caseDataElement = document.getElementById('case-data')
const modal = document.getElementById('case-modal')

if (caseDataElement && modal) {
  const caseData = JSON.parse(caseDataElement.textContent || '{}') as Record<string, CaseDetail>
  const panel = modal.querySelector<HTMLElement>('.modal-panel')
  const closeButton = modal.querySelector<HTMLButtonElement>('.modal-close')
  const backdrop = modal.querySelector<HTMLElement>('.modal-backdrop')
  const heroImage = modal.querySelector<HTMLImageElement>('#modal-hero-img')
  let previousFocus: HTMLElement | null = null

  const hideModal = () => {
    panel?.classList.remove('visible')
    window.setTimeout(() => {
      modal.hidden = true
      document.body.style.overflow = ''
      clearCaseModalImage(heroImage)
      previousFocus?.focus()
      previousFocus = null
    }, 250)
  }

  const openModal = (id: string, detailUrl: string) => {
    const detail = caseData[id]
    if (!detail || !panel) return

    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    renderCaseModal(modal, panel, heroImage, detail, detailUrl)

    modal.hidden = false
    document.body.style.overflow = 'hidden'
    history.pushState({ caseModal: id }, '', detailUrl)
    requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add('visible')))
    closeButton?.focus()
  }

  const closeModal = () => {
    const restoreHistory = Boolean(history.state?.caseModal)
    hideModal()
    if (restoreHistory) history.back()
  }

  document.querySelectorAll<HTMLAnchorElement>('#s-cases .case-card').forEach((card) => {
    card.addEventListener('click', (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return
      const id = card.dataset.case
      const detailUrl = card.getAttribute('href')
      if (!id || !detailUrl) return
      event.preventDefault()
      openModal(id, detailUrl)
    })
  })

  closeButton?.addEventListener('click', closeModal)
  backdrop?.addEventListener('click', closeModal)
  window.addEventListener('popstate', () => {
    if (!modal.hidden) hideModal()
  })
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) closeModal()
  })
}
