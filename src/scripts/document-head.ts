function activateDesktopFont(link: HTMLLinkElement) {
  if (window.matchMedia('(min-width: 768px)').matches) {
    link.media = 'all'
  }
}

document.querySelectorAll<HTMLLinkElement>('[data-deferred-desktop-font]').forEach((link) => {
  link.addEventListener('load', () => activateDesktopFont(link), { once: true })
  if (link.sheet) activateDesktopFont(link)
})
