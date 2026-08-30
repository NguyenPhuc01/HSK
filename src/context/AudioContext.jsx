import { createContext, useCallback, useContext, useRef, useState } from 'react'

const AudioContext = createContext(null)

export function AudioProvider({ children }) {
  const audioRef = useRef(null)
  const activeSrcRef = useRef(null)
  const [activeTrack, setActiveTrack] = useState(null)
  const [activeLabel, setActiveLabel] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const playTrack = useCallback((trackId, src, label = '') => {
    const audio = audioRef.current
    if (!audio) return

    if (activeTrack === trackId) {
      if (audio.paused) {
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
    if (audio.paused) audio.play()
    else audio.pause()
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
    audio.currentTime = Math.max(0, Math.min(time, audio.duration || 0))
  }, [])

  const skip = useCallback((seconds) => {
    const audio = audioRef.current
    if (!audio) return
    seek(audio.currentTime + seconds)
  }, [seek])

  const value = {
    activeTrack,
    activeLabel,
    isPlaying,
    currentTime,
    duration,
    playTrack,
    togglePlay,
    pause,
    stopTrack,
    seek,
    skip,
  }

  return (
    <AudioContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => {
          setIsPlaying(false)
          setActiveTrack(null)
          setActiveLabel('')
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
