import { Volume2, Pause } from 'lucide-react'
import { getAudioSrc } from '../data/audioManifests'
import { useAudio } from '../context/AudioContext'

export default function MobileAudioDock({ bookId, tracks }) {
  const { activeTrack, isPlaying, playTrack } = useAudio()

  if (!tracks?.length) return null

  const playerVisible = Boolean(activeTrack)

  return (
    <div
      className={`fixed left-0 right-0 z-20 border-t border-teal-200 bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden ${
        playerVisible ? 'bottom-[96px]' : 'bottom-0'
      }`}
    >
      <p className="mb-2 text-center text-xs font-semibold text-teal-700">
        🔊 Nhấn để nghe audio trang này
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {tracks.map((track) => {
          const playing = activeTrack === track.id && isPlaying
          return (
            <button
              key={track.id}
              type="button"
              onClick={() =>
                playTrack(track.id, getAudioSrc(bookId, track.audio), track.trackLabel)
              }
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold shadow-md transition active:scale-95 ${
                playing
                  ? 'bg-teal-600 text-white'
                  : 'bg-teal-500 text-white hover:bg-teal-600'
              }`}
            >
              {playing ? (
                <Pause size={18} fill="currentColor" />
              ) : (
                <Volume2 size={18} />
              )}
              {track.trackLabel}
            </button>
          )
        })}
      </div>
    </div>
  )
}
