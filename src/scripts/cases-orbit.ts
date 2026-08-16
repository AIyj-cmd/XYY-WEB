const initCaseOrbit = () => {
  document.querySelectorAll<HTMLElement>('[data-case-orbit]').forEach((root) => {
    if (root.dataset.initialized === 'true') return
    root.dataset.initialized = 'true'

    const panels = [...root.querySelectorAll<HTMLElement>('[data-case-orbit-panel]')]
    const previous = root.querySelector<HTMLButtonElement>('[data-case-orbit-prev]')
    const next = root.querySelector<HTMLButtonElement>('[data-case-orbit-next]')
    const status = root.querySelector<HTMLElement>('[data-case-orbit-status]')
    const previousLabel = root.querySelector<HTMLElement>('[data-case-orbit-prev-label]')
    const nextLabel = root.querySelector<HTMLElement>('[data-case-orbit-next-label]')
    const caseLink = root.querySelector<HTMLAnchorElement>('[data-case-orbit-link]')
    let activeIndex = 0

    const activate = (index: number) => {
      activeIndex = (index + panels.length) % panels.length
      panels.forEach((panel, panelIndex) => {
        panel.hidden = panelIndex !== activeIndex
      })
      if (status) {
        status.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(
          panels.length
        ).padStart(2, '0')}`
      }

      const previousIndex = (activeIndex - 1 + panels.length) % panels.length
      const nextIndex = (activeIndex + 1) % panels.length
      const previousName = panels[previousIndex]?.dataset.caseName ?? ''
      const nextName = panels[nextIndex]?.dataset.caseName ?? ''
      const activePath = panels[activeIndex]?.dataset.casePath ?? ''

      if (previousLabel) previousLabel.textContent = previousName
      if (nextLabel) nextLabel.textContent = nextName
      if (previous) previous.setAttribute('aria-label', `上一个案例：${previousName}`)
      if (next) next.setAttribute('aria-label', `下一个案例：${nextName}`)
      if (caseLink && activePath) caseLink.href = activePath
    }

    previous?.addEventListener('click', () => activate(activeIndex - 1))
    next?.addEventListener('click', () => activate(activeIndex + 1))
  })
}

initCaseOrbit()
document.addEventListener('astro:page-load', initCaseOrbit)
