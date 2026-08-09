const DURATION = 1600

function parseVal(raw: string) {
  const chineseSuffix = raw.match(/[亿万]+/)
  const suffix = chineseSuffix ? chineseSuffix[0] : ''
  const num = parseFloat(raw.replace(/[亿万]/g, ''))
  const decimals = (raw.replace(/[亿万]/g, '').split('.')[1] ?? '').length
  return { num, suffix, decimals }
}

function animateStat(el: HTMLElement) {
  const raw = el.dataset.raw ?? el.textContent ?? ''
  const { num, suffix, decimals } = parseVal(raw)
  const start = performance.now()

  function tick(now: number) {
    const elapsed = now - start
    const progress = Math.min(elapsed / DURATION, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    const current = num * eased
    el.textContent = current.toFixed(decimals) + suffix
    if (progress < 1) requestAnimationFrame(tick)
  }

  requestAnimationFrame(tick)
}

const statsBar = document.getElementById('about-stats-bar')
if (statsBar) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          statsBar.querySelectorAll<HTMLElement>('.about-stat-num').forEach(animateStat)
          observer.disconnect()
        }
      })
    },
    { threshold: 0.3 }
  )
  observer.observe(statsBar)
}
