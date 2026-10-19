const gallery = document.querySelector<HTMLElement>('#s-cases .cases-gallery')

if (gallery) {
  const panels = [...gallery.querySelectorAll<HTMLElement>('.cg-panel')]
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let entryX: number | null = null
  let requestedIndex = -1
  let pendingIndex: number | null = null
  let animationFrame = 0

  const scrollToPanel = (index: number) => {
    const panel = panels[index]
    if (!panel) return
    const maxScroll = gallery.scrollWidth - gallery.clientWidth
    const target = Math.min(
      maxScroll,
      panel.getBoundingClientRect().left - gallery.getBoundingClientRect().left + gallery.scrollLeft
    )
    gallery.scrollTo({ left: target, behavior: reducedMotion.matches ? 'auto' : 'smooth' })
  }

  const requestPanel = (index: number) => {
    if (index === requestedIndex) return
    requestedIndex = index
    pendingIndex = index
    if (animationFrame) return
    animationFrame = requestAnimationFrame(() => {
      animationFrame = 0
      if (pendingIndex === null) return
      scrollToPanel(pendingIndex)
      pendingIndex = null
    })
  }

  gallery.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'mouse') return
    entryX = event.clientX
    requestedIndex = -1
  })

  gallery.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse' || event.buttons !== 0 || entryX === null) return
    if (gallery.scrollWidth <= gallery.clientWidth || Math.abs(event.clientX - entryX) < 8) return
    const rect = gallery.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
    requestPanel(Math.round(ratio * (panels.length - 1)))
  })

  gallery.addEventListener('pointerleave', (event) => {
    if (event.pointerType !== 'mouse') return
    entryX = null
    requestedIndex = -1
    pendingIndex = null
    if (animationFrame) cancelAnimationFrame(animationFrame)
    animationFrame = 0
  })
}
