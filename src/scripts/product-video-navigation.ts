const initProductVideoNavigation = () => {
  document.querySelectorAll<HTMLElement>('[data-product-video-sequence]').forEach((sequence) => {
    if (sequence.dataset.initialized === 'true') return

    const scrollContainer = sequence.querySelector<HTMLElement>('[data-product-video-scroll]')
    const slides = Array.from(sequence.querySelectorAll<HTMLElement>('[data-product-video-slide]'))
    const previous = sequence.querySelector<HTMLButtonElement>('[data-product-video-previous]')
    const next = sequence.querySelector<HTMLButtonElement>('[data-product-video-next]')
    const status = sequence.querySelector<HTMLOutputElement>('[data-product-video-status]')

    if (!scrollContainer || !slides.length || !previous || !next || !status) return

    sequence.dataset.initialized = 'true'

    let currentIndex = 0
    let pendingIndex: number | null = null
    let scrollFrame: number | undefined

    const closestIndex = () => {
      const scrollTop = scrollContainer.scrollTop
      return slides.reduce(
        (closest, slide, index) =>
          Math.abs(slide.offsetTop - scrollTop) < Math.abs(slides[closest].offsetTop - scrollTop)
            ? index
            : closest,
        0
      )
    }

    const setCurrentIndex = (index: number) => {
      currentIndex = index
      status.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`
      previous.disabled = index === 0
      next.disabled = index === slides.length - 1
    }

    const cancelPendingNavigation = () => {
      pendingIndex = null
      setCurrentIndex(closestIndex())
    }

    const syncCurrentIndex = () => {
      scrollFrame = undefined
      const observedIndex = closestIndex()
      if (pendingIndex === null) {
        setCurrentIndex(observedIndex)
      } else if (observedIndex === pendingIndex) {
        pendingIndex = null
        setCurrentIndex(observedIndex)
      }
    }

    const scheduleSync = () => {
      if (scrollFrame !== undefined) return
      scrollFrame = window.requestAnimationFrame(syncCurrentIndex)
    }

    const moveTo = (index: number) => {
      const targetIndex = Math.min(Math.max(index, 0), slides.length - 1)
      if (targetIndex === currentIndex) return

      pendingIndex = targetIndex
      setCurrentIndex(targetIndex)
      scrollContainer.scrollTo({
        top: slides[targetIndex].offsetTop,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      })
    }

    previous.addEventListener('click', () => moveTo(currentIndex - 1))
    next.addEventListener('click', () => moveTo(currentIndex + 1))
    scrollContainer.addEventListener('scroll', scheduleSync, { passive: true })
    scrollContainer.addEventListener('wheel', cancelPendingNavigation, { passive: true })
    scrollContainer.addEventListener('pointerdown', cancelPendingNavigation, { passive: true })
    scrollContainer.addEventListener('keydown', cancelPendingNavigation)
    window.addEventListener('resize', () => {
      cancelPendingNavigation()
      scheduleSync()
    })
    setCurrentIndex(closestIndex())
  })
}

initProductVideoNavigation()
