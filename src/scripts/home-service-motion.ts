import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ── Service panels ───────────────────────────────────────────
document.querySelectorAll<HTMLElement>('.s-service').forEach((panel) => {
  const img = panel.querySelector('.svc-img')
  const toAnimate = panel.querySelectorAll(
    '.svc-problem, .svc-title, .svc-sub, .svc-quality-assurance, .svc-desc, .svc-features, .svc-scenarios, .svc-link'
  )

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: panel,
      start: 'top 60%',
      once: true,
    },
  })

  if (img) {
    tl.to(img, { scale: 1, duration: 1.2, ease: 'power2.out' }, 0)
  }
  tl.to(
    toAnimate,
    {
      opacity: 1,
      x: 0,
      stagger: 0.1,
      duration: 0.65,
      ease: 'power3.out',
    },
    0.15
  )
})
