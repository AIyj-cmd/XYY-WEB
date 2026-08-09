const track = document.getElementById('history-track')
const dots = document.querySelectorAll('.history-dot')
const total = dots.length
let current = 0

function goTo(index: number) {
  current = Math.max(0, Math.min(index, total - 1))
  if (track) track.style.transform = `translateX(-${current * 100}%)`
  dots.forEach((dot, i) => {
    const circle = dot.querySelector('.history-dot-circle') as HTMLElement | null
    const label = dot.querySelector('.history-dot-label') as HTMLElement | null
    if (i === current) {
      circle?.classList.add('bg-brand-orange', 'border-brand-orange')
      circle?.classList.remove('bg-[#f8fafc]', 'border-gray-300')
      label?.classList.add('text-navy-700', 'font-bold')
      label?.classList.remove('text-gray-400')
    } else {
      circle?.classList.remove('bg-brand-orange', 'border-brand-orange')
      circle?.classList.add('bg-[#f8fafc]', 'border-gray-300')
      label?.classList.remove('text-navy-700', 'font-bold')
      label?.classList.add('text-gray-400')
    }
  })
}

document.getElementById('history-prev')?.addEventListener('click', () => goTo(current - 1))
document.getElementById('history-next')?.addEventListener('click', () => goTo(current + 1))
dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)))

goTo(0)
