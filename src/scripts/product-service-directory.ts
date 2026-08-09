const directory = document.querySelector<HTMLElement>('[data-need-directory]')
if (directory) {
  const tabs = Array.from(directory.querySelectorAll<HTMLButtonElement>('[data-need-tab]'))
  const panels = Array.from(directory.querySelectorAll<HTMLElement>('[data-need-panel]'))
  const selectNeed = (id: string, moveFocus = false) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.needTab === id
      tab.dataset.selected = String(active)
      tab.setAttribute('aria-selected', String(active))
      tab.tabIndex = active ? 0 : -1
      if (active && moveFocus) tab.focus()
    })
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.needPanel !== id
    })
  }

  tabs.forEach((tab) => {
    const choose = () => selectNeed(tab.dataset.needTab ?? '')
    tab.addEventListener('focus', choose)
    tab.addEventListener('click', choose)
    tab.addEventListener('keydown', (event) => {
      const currentIndex = tabs.indexOf(tab)
      let nextIndex = currentIndex
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight')
        nextIndex = (currentIndex + 1) % tabs.length
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft')
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length
      if (event.key === 'Home') nextIndex = 0
      if (event.key === 'End') nextIndex = tabs.length - 1
      if (nextIndex === currentIndex) return
      event.preventDefault()
      selectNeed(tabs[nextIndex]?.dataset.needTab ?? '', true)
    })
  })
}
