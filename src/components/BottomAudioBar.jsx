import { useEffect, useRef, useState } from 'react'
import {
  MoreVertical,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
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
      className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
    >
      <Icon size={20} strokeWidth={1.75} />
      <span className="pointer-events-none absolute text-[8px] font-bold leading-none">
        10
      </span>
    </button>
  )
}

export default function BottomAudioBar() {
  const {
    activeTrack,
    activeLabel,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    togglePlay,
    stopTrack,
    skip,
    seek,
    beginScrub,
    endScrub,
    setVolume,
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

  if (!activeTrack) return null

  const { badge, lessonTitle } = getLessonInfoFromTrackLabel(activeLabel || activeTrack)
  const VolumeIcon = volume === 0 ? VolumeX : Volume2

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur safe-bottom safe-x lg:left-64 xl:left-72">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3">
        {/* Trái — track + bài + volume */}
        <div className="hidden min-w-0 shrink-0 items-center gap-2.5 md:flex md:w-[220px] lg:w-[260px]">
          <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-700">
            {badge}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-medium uppercase tracking-wider text-slate-400">
              Bài học
            </p>
            <p className="truncate text-sm font-semibold leading-tight text-slate-800">
              {lessonTitle}
            </p>
          </div>
          <div className="hidden items-center gap-1 lg:flex">
            <VolumeIcon size={14} className="shrink-0 text-slate-400" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="audio-progress audio-progress-teal h-1 w-14 cursor-pointer"
              style={{ '--progress': `${volume * 100}%` }}
              aria-label="Âm lượng"
            />
          </div>
        </div>

        {/* Giữa — controls + progress cùng hàng */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Skip10Button
              direction="back"
              onClick={() => skip(-SKIP_SECONDS)}
              title={`Lùi ${SKIP_SECONDS}s (←)`}
            />
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white shadow-sm transition hover:bg-teal-700 sm:h-10 sm:w-10"
              aria-label={isPlaying ? 'Tạm dừng (Space)' : 'Phát (Space)'}
            >
              {isPlaying ? (
                <Pause size={18} fill="currentColor" />
              ) : (
                <Play size={18} fill="currentColor" className="ml-0.5" />
              )}
            </button>
            <Skip10Button
              direction="forward"
              onClick={() => skip(SKIP_SECONDS)}
              title={`Tua ${SKIP_SECONDS}s (→)`}
            />
          </div>

          <span className="hidden w-8 shrink-0 text-[11px] tabular-nums text-slate-500 sm:block">
            {formatAudioTime(currentTime)}
          </span>
          <AudioProgressBar
            currentTime={currentTime}
            duration={duration}
            onSeek={seek}
            onScrubStart={beginScrub}
            onScrubEnd={endScrub}
            className="min-w-0 flex-1"
            accent="teal"
          />
          <span className="hidden w-8 shrink-0 text-right text-[11px] tabular-nums text-slate-500 sm:block">
            {formatAudioTime(duration)}
          </span>
        </div>

        {/* Phải — menu tốc độ + đóng */}
        <div className="relative flex shrink-0 items-center gap-0.5" ref={speedRef}>
          <button
            type="button"
            onClick={() => setSpeedOpen((v) => !v)}
            className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Tốc độ phát"
            aria-expanded={speedOpen}
            title={`Tốc độ: ${formatSpeed(playbackRate)}`}
          >
            <MoreVertical size={18} />
          </button>

          {speedOpen && (
            <div className="absolute bottom-full right-0 mb-2 min-w-[120px] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Tốc độ phát
              </p>
              {PLAYBACK_SPEEDS.map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => {
                    setPlaybackRate(speed)
                    setSpeedOpen(false)
                  }}
                  className={`flex w-full px-3 py-2 text-left text-sm tabular-nums transition hover:bg-slate-50 ${
                    playbackRate === speed
                      ? 'font-semibold text-teal-700'
                      : 'text-slate-700'
                  }`}
                >
                  {formatSpeed(speed)}
                  {speed === 1 && (
                    <span className="ml-1.5 text-xs font-normal text-slate-400">Bình thường</span>
                  )}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={stopTrack}
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Dừng phát"
            title="Dừng phát"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Mobile — tên bài + thời gian */}
      <div className="flex items-center justify-between border-t border-slate-100 px-3 py-1 text-[11px] text-slate-500 md:hidden">
        <span className="truncate">
          <span className="font-semibold text-slate-700">{badge}</span> · {lessonTitle}
        </span>
        <span className="shrink-0 tabular-nums">
          {formatAudioTime(currentTime)} / {formatAudioTime(duration)}
        </span>
      </div>
    </div>
  )
}
