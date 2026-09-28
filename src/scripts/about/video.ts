import { aboutHeroCaptions } from '@/i18n/about-ui-captions'

const video = document.getElementById('hero-bg-video') as HTMLVideoElement | null
const captionEl = document.getElementById('hero-caption')
const playBtn = document.getElementById('hero-video-btn')
const muteBtn = document.getElementById('hero-mute-btn')
const iconPause = document.getElementById('icon-pause')
const iconPlay = document.getElementById('icon-play')
const iconMuted = document.getElementById('icon-muted')
const iconUnmuted = document.getElementById('icon-unmuted')
const videoLabel = document.getElementById('btn-label')
const pauseLabel = playBtn?.dataset.aboutVideoPause ?? '暂停视频'
const playLabel = playBtn?.dataset.aboutVideoPlay ?? '播放视频'
const unmuteLabel = muteBtn?.dataset.aboutVideoUnmute ?? '开启声音'
const muteLabel = muteBtn?.dataset.aboutVideoMute ?? '静音'
const captions = aboutHeroCaptions(
  (video?.dataset.aboutLocale as 'zh-CN' | 'en' | undefined) ?? 'zh-CN'
)

playBtn?.addEventListener('click', () => {
  if (!video) return
  if (video.paused) {
    void video.play()
    iconPause?.classList.remove('hidden')
    iconPlay?.classList.add('hidden')
    if (videoLabel) videoLabel.textContent = pauseLabel
    playBtn.setAttribute('aria-label', pauseLabel)
  } else {
    video.pause()
    iconPause?.classList.add('hidden')
    iconPlay?.classList.remove('hidden')
    if (videoLabel) videoLabel.textContent = playLabel
    playBtn.setAttribute('aria-label', playLabel)
  }
})

video?.addEventListener('timeupdate', () => {
  if (!captionEl) return
  const cue = captions.find(
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
  muteBtn.setAttribute('aria-label', video.muted ? unmuteLabel : muteLabel)
})
