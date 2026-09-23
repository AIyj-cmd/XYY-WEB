const root = document.querySelector<HTMLElement>('[data-footwear-tabs]')
const tablist = root?.querySelector<HTMLElement>('[role="tablist"]')
const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-footwear-stage]'))
const panels = Array.from(document.querySelectorAll<HTMLElement>('[data-footwear-panel]'))
const orientationQuery = window.matchMedia('(max-width: 960px)')

const setOrientation = () => {
  tablist?.setAttribute('aria-orientation', orientationQuery.matches ? 'horizontal' : 'vertical')
}

const selectStage = (id: string) => {
  tabs.forEach((tab) => {
    const active = tab.dataset.footwearStage === id
    tab.setAttribute('aria-selected', String(active))
    tab.tabIndex = active ? 0 : -1
  })
  panels.forEach((panel) => {
    panel.hidden = panel.dataset.footwearPanel !== id
  })
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectStage(tab.dataset.footwearStage ?? ''))
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key))
      return
    event.preventDefault()
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? tabs.length - 1
          : (index +
              (event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1) +
              tabs.length) %
            tabs.length
    tabs[next]?.focus()
    selectStage(tabs[next]?.dataset.footwearStage ?? '')
  })
})

if (root && tabs[0]) {
  root.dataset.enhanced = 'true'
  setOrientation()
  orientationQuery.addEventListener('change', setOrientation)
  selectStage(tabs[0].dataset.footwearStage ?? '')
}
