import { useCallback, useRef, useState } from 'react'

export function formatAudioTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function AudioProgressBar({
  currentTime,
  duration,
  onSeek,
  onScrubStart,
  onScrubEnd,
  className = '',
  accent = 'teal',
}) {
  const [scrubTime, setScrubTime] = useState(null)
  const scrubbingRef = useRef(false)
  const max = duration || 0
  const value = scrubTime ?? currentTime
  const progress = max > 0 ? Math.min(100, (value / max) * 100) : 0

  const applySeek = useCallback(
    (next) => {
      const clamped = Math.max(0, Math.min(next, max))
      setScrubTime(clamped)
      onSeek(clamped)
    },
    [max, onSeek],
  )

  const valueFromPointer = useCallback(
    (el, clientX) => {
      const rect = el.getBoundingClientRect()
      if (rect.width <= 0) return 0
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      return ratio * max
    },
    [max],
  )

  const finishScrub = useCallback(
    (next) => {
      scrubbingRef.current = false
      applySeek(next)
      setScrubTime(null)
      onScrubEnd?.()
    },
    [applySeek, onScrubEnd],
  )

  return (
    <input
      type="range"
      min={0}
      max={max}
      step="any"
      value={value}
      style={{ '--progress': `${progress}%` }}
      onPointerDown={(e) => {
        scrubbingRef.current = true
        onScrubStart?.()
        applySeek(valueFromPointer(e.currentTarget, e.clientX))
        e.currentTarget.setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        if (!scrubbingRef.current) return
        applySeek(valueFromPointer(e.currentTarget, e.clientX))
      }}
      onPointerUp={(e) => {
        finishScrub(valueFromPointer(e.currentTarget, e.clientX))
        e.currentTarget.releasePointerCapture(e.pointerId)
      }}
      onPointerCancel={(e) => {
        finishScrub(valueFromPointer(e.currentTarget, e.clientX))
        e.currentTarget.releasePointerCapture(e.pointerId)
      }}
      onInput={(e) => {
        if (!scrubbingRef.current) return
        applySeek(Number(e.target.value))
      }}
      className={`audio-progress audio-progress-${accent} ${className}`}
      aria-label="Tiến trình phát audio"
    />
  )
}
