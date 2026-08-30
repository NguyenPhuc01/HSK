import { Pause, Play, RotateCcw, RotateCw } from 'lucide-react'
import { useAudio } from '../context/AudioContext'

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function InlineAudioPlayer({ trackId, src, label }) {
  const { activeTrack, isPlaying, currentTime, duration, playTrack, skip, seek } = useAudio()
  const isActive = activeTrack === trackId
  const playing = isActive && isPlaying

  return (
    <div className="inline-flex flex-wrap items-center gap-2 rounded-xl border border-violet-200 bg-white/90 px-3 py-2 shadow-sm">
      <button
        type="button"
        onClick={() => playTrack(trackId, src)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-white transition hover:bg-violet-700"
        aria-label={playing ? 'Tạm dừng' : 'Phát audio'}
      >
        {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
      </button>

      <div className="min-w-[120px]">
        <p className="text-xs font-semibold text-violet-900">{label}</p>
        {isActive && (
          <p className="text-[11px] text-slate-500">
            {formatTime(currentTime)} / {formatTime(duration)}
          </p>
        )}
      </div>

      {isActive && (
        <>
          <button
            type="button"
            onClick={() => skip(-5)}
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            title="Lùi 5 giây"
          >
            <RotateCcw size={14} />
            5s
          </button>
          <button
            type="button"
            onClick={() => skip(5)}
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            title="Tua 5 giây"
          >
            5s
            <RotateCw size={14} />
          </button>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="h-1.5 w-28 cursor-pointer accent-violet-600"
          />
        </>
      )}
    </div>
  )
}
