const button = document.getElementById('btn-scroll-top')

if (button) {
  const syncVisibility = () => {
    const isVisible = window.scrollY > 400
    button.classList.toggle('opacity-0', !isVisible)
    button.classList.toggle('translate-y-2', !isVisible)
    button.classList.toggle('pointer-events-none', !isVisible)
    button.classList.toggle('opacity-100', isVisible)
    button.classList.toggle('translate-y-0', isVisible)
  }

  window.addEventListener('scroll', syncVisibility, { passive: true })
  button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }))
}

export {}
