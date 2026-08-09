const button = document.getElementById('mobile-menu-btn') as HTMLButtonElement | null
const menu = document.getElementById('mobile-menu')

const setMenuOpen = (open: boolean, returnFocus = false) => {
  menu?.classList.toggle('hidden', !open)
  button?.setAttribute('aria-expanded', String(open))
  button?.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单')
  if (!open && returnFocus) button?.focus()
}

button?.addEventListener('click', () => {
  setMenuOpen(menu?.classList.contains('hidden') ?? true)
})

menu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenuOpen(false))
})

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu && !menu.classList.contains('hidden')) {
    setMenuOpen(false, true)
  }
})

export {}
