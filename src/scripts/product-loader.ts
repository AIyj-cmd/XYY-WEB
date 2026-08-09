let productMotionStarted = false

const startProductMotion = () => {
  if (productMotionStarted) return
  productMotionStarted = true
  window.removeEventListener('scroll', startProductMotion)
  window.removeEventListener('pointerdown', startProductMotion)
  window.removeEventListener('keydown', startProductMotion)
  void import('@/scripts/product-page')
}

window.addEventListener('scroll', startProductMotion, { once: true, passive: true })
window.addEventListener('pointerdown', startProductMotion, { once: true, passive: true })
window.addEventListener('keydown', startProductMotion, { once: true })
