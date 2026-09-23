const stages = document.querySelector<HTMLElement>('[data-live-stages]')

if (stages) {
  const tabs = Array.from(stages.querySelectorAll<HTMLButtonElement>('[data-live-stage-tab]'))
  const panels = Array.from(stages.querySelectorAll<HTMLElement>('[data-live-stage-panel]'))
  const tablist = stages.querySelector<HTMLElement>('[role="tablist"]')
  const compactViewport = window.matchMedia('(max-width: 760px)')
  const syncOrientation = () =>
    tablist?.setAttribute('aria-orientation', compactViewport.matches ? 'horizontal' : 'vertical')
  const select = (index: number, focus = false) => {
    tabs.forEach((tab, tabIndex) => {
      const active = tabIndex === index
      tab.setAttribute('aria-selected', String(active))
      tab.tabIndex = active ? 0 : -1
      if (active && focus) tab.focus()
    })
    panels.forEach((panel, panelIndex) => {
      const active = panelIndex === index
      panel.hidden = !active
      if (active) {
        panel.dataset.liveStageEntering = 'true'
        window.setTimeout(() => delete panel.dataset.liveStageEntering, 180)
      }
    })
  }
  stages.dataset.enhanced = 'true'
  syncOrientation()
  compactViewport.addEventListener('change', syncOrientation)
  select(0)
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(index))
    tab.addEventListener('keydown', (event) => {
      const keys = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End']
      if (!keys.includes(event.key)) return
      event.preventDefault()
      const offset = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1
      const next =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? tabs.length - 1
            : (index + offset + tabs.length) % tabs.length
      select(next, true)
    })
  })
}
