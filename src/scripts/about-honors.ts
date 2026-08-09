const lightbox = document.getElementById('hlb')
const lightboxImage = document.getElementById('hlb-img') as HTMLImageElement | null
const closeButton = lightbox?.querySelector<HTMLButtonElement>('.honors-lightbox__close')
let previousFocus: HTMLElement | null = null

const closeLightbox = () => {
  if (!lightbox || !lightboxImage) return
  lightbox.hidden = true
  lightbox.classList.remove('open')
  lightboxImage.hidden = true
  lightboxImage.removeAttribute('src')
  lightboxImage.alt = ''
  previousFocus?.focus()
  previousFocus = null
}

document.querySelectorAll<HTMLButtonElement>('.honor-card').forEach((card) => {
  card.addEventListener('click', () => {
    if (!lightbox || !lightboxImage || !card.dataset.img) return
    previousFocus = card
    lightboxImage.src = card.dataset.img
    lightboxImage.alt = card.dataset.alt ?? ''
    lightboxImage.hidden = false
    lightbox.hidden = false
    lightbox.classList.add('open')
    closeButton?.focus()
  })
})

closeButton?.addEventListener('click', closeLightbox)
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox()
})
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && lightbox && !lightbox.hidden) closeLightbox()
})

export {}
