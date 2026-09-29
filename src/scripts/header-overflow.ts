const MOBILE_HEADER_QUERY = '(width < 40rem)'

const initHeaderOverflow = () => {
  document.querySelectorAll<HTMLElement>('[data-header-overflow]').forEach((header) => {
    if (header.dataset.headerOverflowInitialized === 'true') return

    const row = header.querySelector<HTMLElement>('.site-header__row')
    const primaryNavigation = header.querySelector<HTMLElement>('.site-header__desktop-navigation')
    const overflowMenu = header.querySelector<HTMLDetailsElement>('[data-header-overflow-menu]')
    const overflowToggle = overflowMenu?.querySelector<HTMLElement>('summary')
    const primaryLinks = Array.from(
      primaryNavigation?.querySelectorAll<HTMLAnchorElement>(':scope > a') ?? []
    )
    const overflowLinks = Array.from(
      overflowMenu?.querySelectorAll<HTMLAnchorElement>('[data-header-overflow-link]') ?? []
    )

    if (!row || !primaryNavigation || !overflowMenu || !overflowToggle || !primaryLinks.length)
      return
    if (primaryLinks.length !== overflowLinks.length) return

    header.dataset.headerOverflowInitialized = 'true'
    const mobileQuery = window.matchMedia(MOBILE_HEADER_QUERY)
    let resizeFrame: number | undefined

    const setLinkVisibility = (visiblePrefix: number) => {
      primaryLinks.forEach((link, index) => {
        link.hidden = index >= visiblePrefix
        overflowLinks[index].hidden = index < visiblePrefix
      })
    }

    const focusedLinkIndex = () => {
      const activeElement = document.activeElement
      const primaryIndex = primaryLinks.indexOf(activeElement as HTMLAnchorElement)
      return primaryIndex >= 0
        ? primaryIndex
        : overflowLinks.indexOf(activeElement as HTMLAnchorElement)
    }

    const restoreFocus = (index: number, previousElement: Element | null) => {
      if (index >= 0) {
        const nextTarget = primaryLinks[index].hidden ? overflowLinks[index] : primaryLinks[index]
        if (document.activeElement !== nextTarget) {
          if (nextTarget === overflowLinks[index]) overflowMenu.open = true
          nextTarget.focus()
        }
      } else if (previousElement === overflowToggle) {
        if (overflowMenu.hidden) primaryLinks.at(-1)?.focus()
        else if (document.activeElement !== overflowToggle) overflowToggle.focus()
      }
    }

    const distribute = () => {
      const previousElement = document.activeElement
      const activeIndex = focusedLinkIndex()

      primaryLinks.forEach((link) => (link.hidden = false))
      overflowLinks.forEach((link) => (link.hidden = false))

      if (!mobileQuery.matches) {
        overflowMenu.hidden = true
        overflowMenu.open = false
        restoreFocus(activeIndex, previousElement)
        return
      }

      header.dataset.headerOverflowReady = 'true'
      overflowMenu.hidden = true

      const gap = Number.parseFloat(window.getComputedStyle(primaryNavigation).columnGap) || 0
      const linkWidths = primaryLinks.map((link) => link.getBoundingClientRect().width)
      const totalWidth =
        linkWidths.reduce((total, width) => total + width, 0) + gap * (linkWidths.length - 1)

      if (totalWidth <= primaryNavigation.clientWidth) {
        overflowMenu.open = false
        restoreFocus(activeIndex, previousElement)
        return
      }

      overflowMenu.hidden = false
      const availableWidth = primaryNavigation.clientWidth
      let visiblePrefix = 0
      let usedWidth = 0
      for (const width of linkWidths) {
        const nextWidth = usedWidth + (visiblePrefix ? gap : 0) + width
        if (nextWidth > availableWidth && visiblePrefix) break
        usedWidth = nextWidth
        visiblePrefix += 1
      }

      setLinkVisibility(visiblePrefix)
      restoreFocus(activeIndex, previousElement)
    }

    const scheduleDistribution = () => {
      if (resizeFrame !== undefined) return
      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = undefined
        distribute()
      })
    }

    overflowMenu.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !overflowMenu.open) return
      event.preventDefault()
      overflowMenu.open = false
      overflowToggle.focus()
    })
    document.addEventListener('pointerdown', (event) => {
      if (overflowMenu.open && !overflowMenu.contains(event.target as Node))
        overflowMenu.open = false
    })
    window.addEventListener('resize', scheduleDistribution, { passive: true })
    mobileQuery.addEventListener('change', scheduleDistribution)
    if (typeof ResizeObserver === 'function') new ResizeObserver(scheduleDistribution).observe(row)
    void document.fonts?.ready.then(scheduleDistribution)
    document.fonts?.addEventListener('loadingdone', scheduleDistribution)

    distribute()
  })
}

initHeaderOverflow()
