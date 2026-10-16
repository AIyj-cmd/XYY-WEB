import { positionGalleryPreview } from './gallery-preview-position'

function initGalleryPreview() {
  const gallery = document.querySelector<HTMLElement>('[data-about-gallery]')
  const preview = document.querySelector<HTMLElement>('[data-gallery-preview]')
  const previewImage = preview?.querySelector<HTMLImageElement>('[data-gallery-preview-image]')
  const dialog = document.querySelector<HTMLDialogElement>('[data-gallery-dialog]')
  const dialogImage = dialog?.querySelector<HTMLImageElement>('[data-gallery-dialog-image]')
  const closeButton = dialog?.querySelector<HTMLButtonElement>('[data-gallery-close]')
  if (!gallery || !preview || !previewImage || !dialog || !dialogImage || !closeButton) return
  if (gallery.dataset.previewReady) return
  gallery.dataset.previewReady = 'true'
  const controller = new AbortController()
  const { signal } = controller
  let active: HTMLAnchorElement | null = null
  let opener: HTMLAnchorElement | null = null
  let closeTimer: ReturnType<typeof setTimeout> | undefined
  let keyboardPreview = false
  let suppressPreview = false
  let hoverDismissed = false
  let mousePosition: { x: number; y: number } | null = null

  const cancelClose = () => clearTimeout(closeTimer)
  const hidePreview = () => {
    cancelClose()
    if (preview.matches(':popover-open')) preview.hidePopover()
    active = null
  }
  const fillImage = (
    target: HTMLImageElement,
    link: HTMLAnchorElement,
    source: HTMLImageElement
  ) => {
    target.src = link.href
    target.alt = source.alt
    target.width = Number(source.getAttribute('width'))
    target.height = Number(source.getAttribute('height'))
  }
  const showPreview = (link: HTMLAnchorElement, fromKeyboard = false) => {
    if (suppressPreview || dialog.open || (hoverDismissed && !fromKeyboard)) return
    const image = link.querySelector('img')
    if (!image) return
    cancelClose()
    active = link
    keyboardPreview = fromKeyboard
    fillImage(previewImage, link, image)
    positionGalleryPreview(preview, link, image)
    if (!preview.matches(':popover-open')) preview.showPopover()
  }
  const scheduleClose = () => {
    cancelClose()
    closeTimer = setTimeout(() => {
      if (preview.matches(':hover') || active?.matches(':hover')) return
      if (keyboardPreview && active === document.activeElement) return
      hidePreview()
    }, 180)
  }
  const openDialog = (link: HTMLAnchorElement) => {
    const image = link.querySelector('img')
    if (!image) return
    suppressPreview = true
    hidePreview()
    opener = link
    fillImage(dialogImage, link, image)
    dialog.showModal()
    document.documentElement.classList.add('about-gallery-dialog-open')
    closeButton.focus()
  }

  gallery.querySelectorAll<HTMLAnchorElement>('[data-gallery-thumbnail]').forEach((link) => {
    link.setAttribute('aria-haspopup', 'dialog')
    link.addEventListener(
      'pointerenter',
      (event) => {
        if (event.pointerType === 'mouse') showPreview(link)
      },
      { signal }
    )
    link.addEventListener('pointerleave', scheduleClose, { signal })
    link.addEventListener(
      'focus',
      () => {
        if (link.matches(':focus-visible')) showPreview(link, true)
      },
      { signal }
    )
    link.addEventListener('blur', scheduleClose, { signal })
    link.addEventListener(
      'click',
      (event) => {
        if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
          return
        event.preventDefault()
        openDialog(link)
      },
      { signal }
    )
  })
  preview.addEventListener('pointerenter', cancelClose, { signal })
  preview.addEventListener('pointerleave', scheduleClose, { signal })
  closeButton.addEventListener('click', () => dialog.close(), { signal })
  dialog.addEventListener(
    'click',
    (event) => {
      if (event.target === dialog) dialog.close()
    },
    { signal }
  )
  dialog.addEventListener(
    'close',
    () => {
      document.documentElement.classList.remove('about-gallery-dialog-open')
      opener?.focus({ preventScroll: true })
      opener = null
      queueMicrotask(() => {
        suppressPreview = false
      })
    },
    { signal }
  )
  document.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType !== 'mouse') return
      const moved =
        !mousePosition || mousePosition.x !== event.clientX || mousePosition.y !== event.clientY
      mousePosition = { x: event.clientX, y: event.clientY }
      if (!hoverDismissed || !moved) return
      hoverDismissed = false
      const link =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>('[data-gallery-thumbnail]')
          : null
      if (link && gallery.contains(link)) showPreview(link)
    },
    { capture: true, passive: true, signal }
  )
  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key !== 'Escape') return
      // Hiding the popover can expose another thumbnail beneath a stationary pointer.
      if (preview.matches(':popover-open')) hoverDismissed = true
      hidePreview()
    },
    { signal }
  )
  window.addEventListener('scroll', hidePreview, { passive: true, signal })
  window.addEventListener('resize', hidePreview, { signal })
  window.addEventListener('pagehide', hidePreview, { signal })
  document.addEventListener(
    'astro:before-swap',
    () => {
      hidePreview()
      if (dialog.open) dialog.close()
      document.documentElement.classList.remove('about-gallery-dialog-open')
      controller.abort()
      delete gallery.dataset.previewReady
    },
    { once: true, signal }
  )
}

initGalleryPreview()
document.addEventListener('astro:page-load', initGalleryPreview)
