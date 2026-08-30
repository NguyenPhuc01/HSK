import { Pause, Play, RotateCcw, RotateCw, X } from 'lucide-react'
import { useAudio } from '../context/AudioContext'

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function BottomAudioBar() {
  const { activeTrack, activeLabel, isPlaying, currentTime, duration, togglePlay, stopTrack, skip, seek } =
    useAudio()

  if (!activeTrack) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur md:px-6 lg:left-64 xl:left-72">
      <div className="mx-auto flex max-w-5xl items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white hover:bg-teal-700"
          aria-label={isPlaying ? 'Tạm dừng' : 'Phát'}
        >
          {isPlaying ? (
            <Pause size={18} fill="currentColor" />
          ) : (
            <Play size={18} fill="currentColor" className="ml-0.5" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-800">
            {activeLabel || activeTrack}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[11px] tabular-nums text-slate-500">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="h-1 flex-1 cursor-pointer accent-teal-600"
            />
            <span className="text-[11px] tabular-nums text-slate-500">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        <div className="hidden items-center gap-1 sm:flex">
          <button
            type="button"
            onClick={() => skip(-5)}
            className="flex items-center gap-0.5 rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw size={13} />
            5s
          </button>
          <button
            type="button"
            onClick={() => skip(5)}
            className="flex items-center gap-0.5 rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            5s
            <RotateCw size={13} />
          </button>
        </div>

        <button
          type="button"
          onClick={stopTrack}
          className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Dừng phát"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
