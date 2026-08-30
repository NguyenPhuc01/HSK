import { useEffect, useRef, useState } from 'react'
import {
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  X,
} from 'lucide-react'
import { getAudioSrc } from '../data/audioManifests'
import { useAudio, PLAYBACK_SPEEDS } from '../context/AudioContext'
import AudioProgressBar, { formatAudioTime } from './AudioProgressBar'
import { getLessonInfoFromTrackLabel } from '../lib/trackLessonInfo'

const SKIP_SECONDS = 10

function formatSpeed(rate) {
  return rate === 1 ? '1x' : `${rate}x`
}

function Skip10Button({ direction, onClick, title }) {
  const Icon = direction === 'back' ? RotateCcw : RotateCw
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="relative flex h-12 w-12 items-center justify-center rounded-full text-slate-600 active:bg-slate-100"
    >
      <Icon size={26} strokeWidth={1.75} />
      <span className="pointer-events-none absolute text-[9px] font-bold leading-none">10</span>
    </button>
  )
}

export default function MobileAudioPanel({ bookId, tracks }) {
  const {
    activeTrack,
    activeLabel,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    playTrack,
    togglePlay,
    stopTrack,
    skip,
    seek,
    beginScrub,
    endScrub,
    setPlaybackRate,
  } = useAudio()

  const [speedOpen, setSpeedOpen] = useState(false)
  const speedRef = useRef(null)

  useEffect(() => {
    if (!speedOpen) return undefined
    const close = (e) => {
      if (speedRef.current && !speedRef.current.contains(e.target)) setSpeedOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [speedOpen])

  if (!tracks?.length) return null

  const playerOpen = Boolean(activeTrack)
  const { badge, lessonTitle } = playerOpen
    ? getLessonInfoFromTrackLabel(activeLabel || activeTrack)
    : { badge: '', lessonTitle: '' }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden safe-bottom safe-x">
      <div className="rounded-t-2xl border border-b-0 border-slate-200/90 bg-white shadow-[0_-6px_24px_rgba(15,23,42,0.1)]">
        <div className="flex justify-center pt-2">
          <div className="h-1 w-9 rounded-full bg-slate-200" aria-hidden />
        </div>

        <div className="flex gap-2 overflow-x-auto px-4 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tracks.map((track) => {
            const isActive = activeTrack === track.id
            const playing = isActive && isPlaying
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => {
                  if (isActive) {
                    togglePlay()
                  } else {
                    playTrack(track.id, getAudioSrc(bookId, track.audio), track.trackLabel)
                  }
                }}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition active:scale-[0.98] ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {playing ? (
                  <Pause size={15} fill="currentColor" />
                ) : (
                  <Play
                    size={15}
                    fill="currentColor"
                    className={isActive ? 'text-white' : 'text-teal-600'}
                  />
                )}
                {track.trackLabel}
              </button>
            )
          })}
        </div>

        {playerOpen && (
          <div className="border-t border-slate-100 px-4 pb-3 pt-2">
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <p className="min-w-0 truncate text-sm text-slate-800">
                <span className="font-semibold text-teal-700">{badge}</span>
                <span className="text-slate-400"> · </span>
                {lessonTitle}
              </p>
              <span className="shrink-0 text-xs tabular-nums text-slate-400">
                {formatAudioTime(currentTime)} / {formatAudioTime(duration)}
              </span>
            </div>

            <AudioProgressBar
              currentTime={currentTime}
              duration={duration}
              onSeek={seek}
              onScrubStart={beginScrub}
              onScrubEnd={endScrub}
              className="mb-1 w-full"
              accent="teal"
            />

            {speedOpen && (
              <div className="mb-2 flex flex-wrap justify-center gap-1.5">
                {PLAYBACK_SPEEDS.map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => {
                      setPlaybackRate(speed)
                      setSpeedOpen(false)
                    }}
                    className={`rounded-full px-3 py-1 text-xs font-semibold tabular-nums transition active:scale-95 ${
                      playbackRate === speed
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {formatSpeed(speed)}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-1 flex items-center justify-between">
              <div className="w-14" ref={speedRef}>
                <button
                  type="button"
                  onClick={() => setSpeedOpen((v) => !v)}
                  className={`rounded-lg px-2 py-1.5 text-xs font-semibold tabular-nums active:bg-slate-100 ${
                    speedOpen ? 'bg-teal-50 text-teal-700' : 'text-slate-500'
                  }`}
                  aria-expanded={speedOpen}
                >
                  {formatSpeed(playbackRate)}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Skip10Button
                  direction="back"
                  onClick={() => skip(-SKIP_SECONDS)}
                  title={`Lùi ${SKIP_SECONDS}s`}
                />
                <button
                  type="button"
                  onClick={togglePlay}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-white shadow-md active:scale-95"
                  aria-label={isPlaying ? 'Tạm dừng' : 'Phát'}
                >
                  {isPlaying ? (
                    <Pause size={26} fill="currentColor" />
                  ) : (
                    <Play size={26} fill="currentColor" className="ml-0.5" />
                  )}
                </button>
                <Skip10Button
                  direction="forward"
                  onClick={() => skip(SKIP_SECONDS)}
                  title={`Tua ${SKIP_SECONDS}s`}
                />
              </div>

              <button
                type="button"
                onClick={stopTrack}
                className="flex h-10 w-14 items-center justify-end rounded-lg text-slate-400 active:bg-slate-100"
                aria-label="Dừng phát"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
