import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const AudioContext = createContext(null)

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5]

export { PLAYBACK_SPEEDS }

export function AudioProvider({ children }) {
  const audioRef = useRef(null)
  const activeSrcRef = useRef(null)
  const isScrubbingRef = useRef(false)
  const pendingTimeRef = useRef(0)
  const rafRef = useRef(null)
  const [activeTrack, setActiveTrack] = useState(null)
  const [activeLabel, setActiveLabel] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [playbackRate, setPlaybackRate] = useState(1)

  useEffect(() => {
    const audio = audioRef.current
    if (audio) audio.volume = volume
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) audio.playbackRate = playbackRate
  }, [playbackRate])

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const playTrack = useCallback((trackId, src, label = '') => {
    const audio = audioRef.current
    if (!audio) return

    if (activeTrack === trackId) {
      if (audio.paused) {
        if (audio.ended || (audio.duration > 0 && audio.currentTime >= audio.duration - 0.05)) {
          audio.currentTime = 0
          setCurrentTime(0)
        }
        audio.play()
      } else {
        audio.pause()
      }
      return
    }

    setActiveTrack(trackId)
    setActiveLabel(label)
    if (src) {
      activeSrcRef.current = src
      audio.src = src
    }
    audio.play()
  }, [activeTrack])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !activeTrack) return
    if (audio.paused) {
      // Hết bài → Play lại từ đầu
      if (audio.ended || (audio.duration > 0 && audio.currentTime >= audio.duration - 0.05)) {
        audio.currentTime = 0
        setCurrentTime(0)
      }
      audio.play()
    } else {
      audio.pause()
    }
  }, [activeTrack])

  const pause = useCallback(() => {
    audioRef.current?.pause()
  }, [])

  const stopTrack = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    setActiveTrack(null)
    setActiveLabel('')
    setIsPlaying(false)
    setCurrentTime(0)
  }, [])

  const seek = useCallback((time) => {
    const audio = audioRef.current
    if (!audio) return
    const max = audio.duration || 0
    const next = Math.max(0, Math.min(time, max))
    audio.currentTime = next
    setCurrentTime(next)
  }, [])

  const skip = useCallback((seconds) => {
    const audio = audioRef.current
    if (!audio) return
    seek(audio.currentTime + seconds)
  }, [seek])

  const cyclePlaybackRate = useCallback(() => {
    setPlaybackRate((prev) => {
      const index = PLAYBACK_SPEEDS.indexOf(prev)
      return PLAYBACK_SPEEDS[(index + 1) % PLAYBACK_SPEEDS.length]
    })
  }, [])

  const beginScrub = useCallback(() => {
    isScrubbingRef.current = true
  }, [])

  const endScrub = useCallback(() => {
    isScrubbingRef.current = false
    const audio = audioRef.current
    if (audio) setCurrentTime(audio.currentTime)
  }, [])

  const handleTimeUpdate = useCallback((time) => {
    if (isScrubbingRef.current) return
    pendingTimeRef.current = time
    if (rafRef.current != null) return
    rafRef.current = requestAnimationFrame(() => {
      setCurrentTime(pendingTimeRef.current)
      rafRef.current = null
    })
  }, [])

  const value = {
    activeTrack,
    activeLabel,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    playTrack,
    togglePlay,
    pause,
    stopTrack,
    seek,
    skip,
    beginScrub,
    endScrub,
    setVolume,
    setPlaybackRate,
    cyclePlaybackRate,
  }

  return (
    <AudioContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => handleTimeUpdate(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onSeeked={(e) => {
          if (!isScrubbingRef.current) setCurrentTime(e.currentTarget.currentTime)
        }}
        onEnded={(e) => {
          // Giữ player mở — đứng yên ở cuối bài (không ẩn bar)
          setIsPlaying(false)
          setCurrentTime(e.currentTarget.duration || 0)
        }}
      />
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const ctx = useContext(AudioContext)
  if (!ctx) throw new Error('useAudio must be used within AudioProvider')
  return ctx
}
