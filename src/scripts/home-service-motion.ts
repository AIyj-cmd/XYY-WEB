import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  gsap.registerPlugin(ScrollTrigger)

  document.querySelectorAll<HTMLElement>('.s-service').forEach((panel) => {
    const img = panel.querySelector('.svc-img')
    const toAnimate = panel.querySelectorAll(
      '.svc-problem, .svc-title, .svc-sub, .svc-quality-assurance, .svc-desc, .svc-features, .svc-scenarios, .svc-link'
    )

    ScrollTrigger.create({
      trigger: panel,
      start: 'top 60%',
      once: true,
      onEnter: () => {
        let timeline: gsap.core.Timeline | undefined

        try {
          timeline = gsap.timeline()
          if (img) timeline.to(img, { scale: 1, duration: 1.2, ease: 'power2.out' }, 0)
          timeline.fromTo(
            toAnimate,
            { opacity: 0, x: 0 },
            {
              opacity: 1,
              x: 0,
              stagger: 0.1,
              duration: 0.65,
              ease: 'power3.out',
              clearProps: 'transform,opacity,visibility',
            },
            0.15
          )
        } catch (error) {
          timeline?.kill()
          gsap.set([img, ...toAnimate].filter(Boolean), {
            clearProps: 'transform,opacity,visibility',
          })
          throw error
        }
      },
    })
  })
}
