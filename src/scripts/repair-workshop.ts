const workshop = document.querySelector<HTMLElement>('[data-repair-workshop]')

if (workshop) {
  const controls = workshop.querySelector<HTMLElement>('[data-repair-workshop-controls]')
  const tabs = Array.from(
    workshop.querySelectorAll<HTMLButtonElement>('[data-repair-workshop-tab]')
  )
  const panels = Array.from(workshop.querySelectorAll<HTMLElement>('[data-repair-workshop-panel]'))

  const enableWorkshop = () => {
    if (!controls || tabs.length !== panels.length || tabs.length === 0) return false

    controls.setAttribute('role', 'tablist')
    controls.setAttribute('aria-label', '修复工位选择')
    tabs.forEach((tab, index) => {
      tab.id = `repair-workshop-tab-${index}`
      tab.setAttribute('role', 'tab')
      tab.setAttribute('aria-controls', `repair-workshop-panel-${index}`)
    })
    panels.forEach((panel, index) => {
      panel.id = `repair-workshop-panel-${index}`
      panel.setAttribute('role', 'tabpanel')
      panel.setAttribute('aria-labelledby', `repair-workshop-tab-${index}`)
    })

    return true
  }

  const selectWorkshop = (index: number, moveFocus = false) => {
    tabs.forEach((tab, tabIndex) => {
      const active = tabIndex === index
      tab.setAttribute('aria-selected', String(active))
      tab.tabIndex = active ? 0 : -1
      if (active && moveFocus) tab.focus()
    })
    panels.forEach((panel, panelIndex) => {
      panel.hidden = panelIndex !== index
    })
  }

  if (enableWorkshop() && controls) {
    selectWorkshop(0)
    controls.hidden = false

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectWorkshop(index))
      tab.addEventListener('keydown', (event) => {
        if (
          !['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)
        ) {
          return
        }
        event.preventDefault()
        let next = index
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown')
          next = (index + 1) % tabs.length
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
          next = (index - 1 + tabs.length) % tabs.length
        if (event.key === 'Home') next = 0
        if (event.key === 'End') next = tabs.length - 1
        if (next === index) return
        selectWorkshop(next, true)
      })
    })
  }
}
