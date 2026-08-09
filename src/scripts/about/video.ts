import { ABOUT_HERO_CAPTIONS } from '@/data/about'

const video = document.getElementById('hero-bg-video') as HTMLVideoElement | null
const captionEl = document.getElementById('hero-caption')
const playBtn = document.getElementById('hero-video-btn')
const muteBtn = document.getElementById('hero-mute-btn')
const iconPause = document.getElementById('icon-pause')
const iconPlay = document.getElementById('icon-play')
const iconMuted = document.getElementById('icon-muted')
const iconUnmuted = document.getElementById('icon-unmuted')
const videoLabel = document.getElementById('btn-label')

playBtn?.addEventListener('click', () => {
  if (!video) return
  if (video.paused) {
    void video.play()
    iconPause?.classList.remove('hidden')
    iconPlay?.classList.add('hidden')
    if (videoLabel) videoLabel.textContent = '暂停视频'
    playBtn.setAttribute('aria-label', '暂停视频')
  } else {
    video.pause()
    iconPause?.classList.add('hidden')
    iconPlay?.classList.remove('hidden')
    if (videoLabel) videoLabel.textContent = '播放视频'
    playBtn.setAttribute('aria-label', '播放视频')
  }
})

video?.addEventListener('timeupdate', () => {
  if (!captionEl) return
  const cue = ABOUT_HERO_CAPTIONS.find(
    ({ start, end }) => video.currentTime >= start && video.currentTime < end
  )
  if (cue) {
    if (captionEl.textContent !== cue.text) captionEl.textContent = cue.text
    captionEl.classList.remove('opacity-0')
  } else {
    captionEl.classList.add('opacity-0')
  }
})

muteBtn?.addEventListener('click', () => {
  if (!video) return
  video.muted = !video.muted
  iconMuted?.classList.toggle('hidden', !video.muted)
  iconUnmuted?.classList.toggle('hidden', video.muted)
  muteBtn.setAttribute('aria-label', video.muted ? '开启声音' : '静音')
})
