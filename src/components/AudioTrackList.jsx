import { Volume2, Pause } from 'lucide-react'
import { getAudioSrc } from '../data/audioManifests'
import { useAudio } from '../context/AudioContext'

export default function AudioTrackList({ bookId = 'textbook', sections, compact = false }) {
  const { activeTrack, isPlaying, playTrack } = useAudio()

  const src = (section) => getAudioSrc(bookId, section.audio)

  if (compact) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1">
        {sections.map((section) => {
          const isActive = activeTrack === section.id
          const playing = isActive && isPlaying
          return (
            <button
              key={section.id}
              type="button"
              onClick={() =>
                playTrack(section.id, src(section), section.trackLabel)
              }
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                playing
                  ? 'bg-teal-600 text-white shadow-md'
                  : isActive
                    ? 'bg-teal-100 text-teal-800 ring-1 ring-teal-300'
                    : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-teal-50 hover:ring-teal-200'
              }`}
            >
              {playing ? <Pause size={13} fill="currentColor" /> : <Volume2 size={13} />}
              {section.trackLabel}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <ul className="space-y-1">
      {sections.map((section) => {
        const isActive = activeTrack === section.id
        const playing = isActive && isPlaying
        return (
          <li key={section.id}>
            <button
              type="button"
              onClick={() =>
                playTrack(section.id, src(section), section.trackLabel)
              }
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                playing
                  ? 'bg-teal-600 text-white shadow-md'
                  : isActive
                    ? 'bg-teal-50 text-teal-900 ring-1 ring-teal-200'
                    : 'bg-white text-slate-700 hover:bg-slate-50 ring-1 ring-slate-100'
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
                  playing
                    ? 'bg-white/20'
                    : 'bg-teal-100 text-teal-700 group-hover:bg-teal-200'
                }`}
              >
                {playing ? (
                  <Pause size={16} fill="currentColor" />
                ) : (
                  <Volume2 size={16} />
                )}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-mono text-sm font-bold tracking-wide">
                  {section.trackLabel}
                </span>
                {(section.titleZh || section.label) && (
                  <span
                    className={`block truncate text-xs ${
                      playing ? 'text-teal-100' : 'text-slate-500'
                    }`}
                  >
                    {section.titleZh || section.label}
                  </span>
                )}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
