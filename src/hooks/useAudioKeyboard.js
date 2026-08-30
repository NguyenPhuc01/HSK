import { useEffect } from 'react'
import { useAudio } from '../context/AudioContext'

function isTypingTarget(target) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable
}

export function useAudioKeyboard() {
  const { activeTrack, togglePlay, skip } = useAudio()

  useEffect(() => {
    if (!activeTrack) return undefined

    const onKeyDown = (e) => {
      if (isTypingTarget(e.target)) return

      if (e.code === 'Space') {
        e.preventDefault()
        togglePlay()
        return
      }

      if (e.code === 'ArrowLeft') {
        e.preventDefault()
        skip(-5)
        return
      }

      if (e.code === 'ArrowRight') {
        e.preventDefault()
        skip(5)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeTrack, togglePlay, skip])
}
