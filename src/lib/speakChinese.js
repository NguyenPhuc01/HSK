const YOUDAO_URL = 'https://dict.youdao.com/dictvoice'
const BAIDU_URL = 'https://fanyi.baidu.com/gettts'

let currentAudio = null
let speaking = false
let lastSpeakAt = 0
const DEBOUNCE_MS = 600
/** Chậm hơn một chút nhưng tránh cắt tiếng đầu (playbackRate lúc play() hay bị Chrome cắt). */
const PLAYBACK_RATE = 0.85

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

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function speakWithWebSpeech(text) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve()
      return
    }
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'zh-CN'
    utter.rate = 0.85
    const voice = pickZhVoice()
    if (voice) utter.voice = voice
    utter.onend = () => resolve()
    utter.onerror = () => resolve()
    // Cho engine gắn voice xong rồi mới speak — tránh mất âm đầu
    window.setTimeout(() => {
      window.speechSynthesis.speak(utter)
    }, 40)
  })
}

function playSrc(src) {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    audio.preload = 'auto'
    currentAudio = audio

    let settled = false
    let started = false
    const finish = (ok) => {
      if (settled) return
      settled = true
      if (currentAudio === audio) currentAudio = null
      if (ok) resolve()
      else reject(new Error('audio failed'))
    }

    audio.addEventListener('ended', () => finish(true), { once: true })
    audio.addEventListener('error', () => finish(false), { once: true })

    const start = async () => {
      if (started || settled) return
      started = true
      try {
        // Phát ở tốc độ bình thường trước, rồi mới chậm — tránh cắt đầu do playbackRate
        audio.playbackRate = 1
        audio.currentTime = 0
        await audio.play()
        await delay(80)
        if (currentAudio === audio && !settled) audio.playbackRate = PLAYBACK_RATE
      } catch {
        finish(false)
      }
    }

    audio.addEventListener('canplaythrough', () => start(), { once: true })

    // Fallback nếu canplaythrough không kịp fire trên một số trình duyệt
    audio.addEventListener(
      'loadeddata',
      () => {
        window.setTimeout(() => {
          if (!started && !settled && currentAudio === audio) start()
        }, 120)
      },
      { once: true },
    )

    audio.src = src
    audio.load()
  })
}

export function isSpeaking() {
  return speaking
}

/** Phát âm tiếng Trung. Trả về Promise; bỏ qua nếu đang nói / spam trong DEBOUNCE_MS. */
export async function speakChinese(text) {
  if (!text || typeof window === 'undefined') return false
  const now = Date.now()
  if (speaking || now - lastSpeakAt < DEBOUNCE_MS) return false

  speaking = true
  lastSpeakAt = now
  cancelSpeech()
  // Nhịp ngắn sau khi dừng audio cũ — tránh race cắt tiếng đầu
  await delay(50)

  try {
    try {
      await playSrc(youdaoSrc(text))
    } catch {
      try {
        await playSrc(baiduSrc(text))
      } catch {
        await speakWithWebSpeech(text)
      }
    }
    return true
  } finally {
    speaking = false
  }
}

export function cancelSpeech() {
  if (currentAudio) {
    try {
      currentAudio.pause()
      currentAudio.removeAttribute('src')
      currentAudio.load()
    } catch {
      /* ignore */
    }
    currentAudio = null
  }
  window.speechSynthesis?.cancel()
}
