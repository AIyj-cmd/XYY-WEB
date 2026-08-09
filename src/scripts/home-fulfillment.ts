const fulfillment = document.querySelector<HTMLElement>('.s-fulfillment')

if (fulfillment) {
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      fulfillment.classList.add('is-visible')
      observer.unobserve(fulfillment)
    },
    { threshold: 0.16 }
  )

  observer.observe(fulfillment)
}

export {}
