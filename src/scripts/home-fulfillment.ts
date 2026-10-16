const fulfillment = document.querySelector<HTMLElement>('.s-fulfillment')

if (fulfillment) {
  const steps = Array.from(fulfillment.querySelectorAll<HTMLElement>('.fulfillment-step'))
  const revealSteps = () => {
    const animations: Animation[] = []

    try {
      steps.forEach((step, index) => {
        animations.push(
          step.animate(
            [
              { opacity: 0, transform: 'translateY(28px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            {
              duration: 700,
              delay: index * 130 + 200,
              easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
              fill: 'both',
            }
          )
        )
      })
    } catch (error) {
      animations.forEach((animation) => animation.cancel())
      throw error
    }
  }

  if (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    !HTMLElement.prototype.animate
  ) {
    fulfillment.classList.add('is-visible')
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        fulfillment.classList.add('is-visible')
        revealSteps()
        observer.unobserve(fulfillment)
      },
      { threshold: 0.16 }
    )

    observer.observe(fulfillment)
  }
}

export {}
