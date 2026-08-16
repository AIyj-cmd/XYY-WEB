const dialog = document.querySelector<HTMLDialogElement>('#about-explorer-dialog')
const dialogTitle = document.querySelector<HTMLElement>('#about-explorer-dialog-title')
const closeButton = dialog?.querySelector<HTMLButtonElement>('[data-about-explorer-close]')
const triggers = document.querySelectorAll<HTMLButtonElement>('[data-about-explorer-open]')
const panels = document.querySelectorAll<HTMLElement>('[data-about-explorer-panel]')
let previousFocus: HTMLElement | null = null
let currentPanel = ''

const panelHash = (id: string) => `about-${id}`

const updateHash = (id: string) => {
  const url = new URL(window.location.href)
  url.hash = id ? panelHash(id) : ''
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
}

const showPanel = (id: string, title: string, updateLocation = true) => {
  if (!dialog) return
  const panel = Array.from(panels).find((item) => item.dataset.aboutExplorerPanel === id)
  if (!panel) return

  panels.forEach((item) => {
    item.hidden = item !== panel
  })
  if (dialogTitle) dialogTitle.textContent = title
  currentPanel = id
  previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  if (!dialog.open) dialog.showModal()
  document.documentElement.classList.add('about-explorer-open')
  if (updateLocation) updateHash(id)
  closeButton?.focus()
}

const closeExplorer = () => {
  if (dialog?.open) dialog.close()
}

triggers.forEach((trigger) => {
  trigger.addEventListener('click', () => {
    const id = trigger.dataset.aboutExplorerOpen
    const title = trigger.dataset.aboutExplorerTitle
    if (id && title) showPanel(id, title)
  })
})

closeButton?.addEventListener('click', closeExplorer)
dialog?.addEventListener('click', (event) => {
  if (event.target === dialog) closeExplorer()
})
dialog?.addEventListener('cancel', (event) => {
  const honorLightbox = document.querySelector<HTMLElement>('#hlb')
  if (honorLightbox && !honorLightbox.hidden) event.preventDefault()
})
dialog?.addEventListener('close', () => {
  document.documentElement.classList.remove('about-explorer-open')
  if (window.location.hash === `#${panelHash(currentPanel)}`) updateHash('')
  previousFocus?.focus()
  previousFocus = null
  currentPanel = ''
})

const requestedPanel = window.location.hash.replace(/^#about-/, '')
const requestedTrigger = Array.from(triggers).find(
  (trigger) => trigger.dataset.aboutExplorerOpen === requestedPanel
)
if (requestedTrigger) {
  const title = requestedTrigger.dataset.aboutExplorerTitle
  if (title) showPanel(requestedPanel, title, false)
}

export {}
