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

const SKIP_SECONDS = 5

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
      className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 sm:h-8 sm:w-8"
    >
      <Icon size={24} strokeWidth={1.75} className="sm:h-5 sm:w-5" />
      <span className="pointer-events-none absolute text-[9px] font-bold leading-none sm:text-[8px]">
        5
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
    resetPlayback,
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

  // Giữ bar khi đang có session audio (kể cả trang không map track).
  if (!activeTrack) return null

  const { badge, lessonTitle } = getLessonInfoFromTrackLabel(activeLabel || activeTrack)
  const VolumeIcon = volume === 0 ? VolumeX : Volume2

  const playbackControls = (
    <div className="flex shrink-0 items-center gap-3 md:gap-2">
      <Skip10Button
        direction="back"
        onClick={() => skip(-SKIP_SECONDS)}
        title={`Lùi ${SKIP_SECONDS}s (←)`}
      />
      <button
        type="button"
        onClick={togglePlay}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white shadow-sm transition hover:bg-teal-700 md:h-10 md:w-10"
        aria-label={isPlaying ? 'Tạm dừng (Space)' : 'Phát (Space)'}
      >
        {isPlaying ? (
          <Pause size={22} fill="currentColor" className="md:h-[18px] md:w-[18px]" />
        ) : (
          <Play size={22} fill="currentColor" className="ml-0.5 md:h-[18px] md:w-[18px]" />
        )}
      </button>
      <Skip10Button
        direction="forward"
        onClick={() => skip(SKIP_SECONDS)}
        title={`Tua ${SKIP_SECONDS}s (→)`}
      />
    </div>
  )

  const speedMenu = (
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
        onClick={resetPlayback}
        className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        aria-label="Dừng phát"
        title="Dừng phát"
      >
        <X size={18} />
      </button>
    </div>
  )

  const progressBar = (
    <AudioProgressBar
      currentTime={currentTime}
      duration={duration}
      onSeek={seek}
      onScrubStart={beginScrub}
      onScrubEnd={endScrub}
      className="w-full"
      accent="teal"
    />
  )

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 hidden border-t border-slate-200 bg-white/95 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur md:block lg:left-64 xl:left-72">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-4">
        {/* Trái — badge + tên bài (dọc) + volume popup */}
        <div className="hidden min-w-0 shrink-0 flex-col md:flex md:w-[180px] lg:w-[220px] xl:w-[260px]">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-700">
              {badge}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-medium uppercase tracking-wider text-slate-400">
                Bài học
              </p>
              <p
                className="line-clamp-2 text-sm font-semibold leading-snug text-slate-800"
                title={lessonTitle}
              >
                {lessonTitle}
              </p>
            </div>
          </div>
        </div>

        {/* Giữa — volume + progress + controls cùng hàng */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="group/vol relative hidden shrink-0 lg:flex lg:items-center">
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 -translate-x-1/2 pb-1 opacity-0 transition-opacity group-hover/vol:pointer-events-auto group-hover/vol:opacity-100 group-focus-within/vol:pointer-events-auto group-focus-within/vol:opacity-100">
              <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-3 shadow-lg">
                <div className="flex h-20 w-7 items-center justify-center">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="audio-progress audio-progress-teal audio-progress-vertical cursor-pointer"
                    style={{ '--progress': `${volume * 100}%` }}
                    aria-label="Âm lượng"
                  />
                </div>
              </div>
            </div>
            <button
              type="button"
              className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 group-hover/vol:bg-slate-100 group-hover/vol:text-slate-600"
              aria-label="Âm lượng"
              title="Âm lượng"
            >
              <VolumeIcon size={14} />
            </button>
          </div>
          <span className="hidden w-8 shrink-0 text-[11px] tabular-nums text-slate-500 lg:block">
            {formatAudioTime(currentTime)}
          </span>
          <div className="min-w-0 flex-1 w-full">{progressBar}</div>
          <span className="hidden w-8 shrink-0 text-right text-[11px] tabular-nums text-slate-500 lg:block">
            {formatAudioTime(duration)}
          </span>
          {playbackControls}
        </div>

        {speedMenu}
      </div>
    </div>
  )
}
