const YOUDAO_URL = 'https://dict.youdao.com/dictvoice'
const BAIDU_URL = 'https://fanyi.baidu.com/gettts'

let currentAudio = null

function youdaoSrc(text) {
  return `${YOUDAO_URL}?le=zh&audio=${encodeURIComponent(text)}`
}

function baiduSrc(text) {
  return `${BAIDU_URL}?lan=zh&spd=3&source=web&text=${encodeURIComponent(text)}`
}

function pickZhVoice() {
  const voices = window.speechSynthesis?.getVoices?.() ?? []
  return (
    voices.find((v) => v.lang === 'zh-CN') ||
    voices.find((v) => v.lang.startsWith('zh')) ||
    null
  )
}

function speakWithWebSpeech(text) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'zh-CN'
  utter.rate = 0.5
  const voice = pickZhVoice()
  if (voice) utter.voice = voice
  window.speechSynthesis.speak(utter)
}

function playSrc(src, text, onFail) {
  const audio = new Audio(src)
  audio.playbackRate = 0.7
  currentAudio = audio
  audio.addEventListener(
    'error',
    () => {
      if (currentAudio === audio) onFail(text)
    },
    { once: true },
  )
  audio.play().catch(() => {
    if (currentAudio === audio) onFail(text)
  })
}

export function speakChinese(text) {
  if (!text || typeof window === 'undefined') return

  cancelSpeech()
  playSrc(youdaoSrc(text), text, () => {
    playSrc(baiduSrc(text), text, speakWithWebSpeech)
  })
}

export function cancelSpeech() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.removeAttribute('src')
    currentAudio.load()
    currentAudio = null
  }
  window.speechSynthesis?.cancel()
}
