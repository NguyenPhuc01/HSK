import { Volume2 } from 'lucide-react'
import { getAudioSrc } from '../data/audioManifest'
import { useAudio } from '../context/AudioContext'

export default function SectionCard({ section, minimal = false }) {
  const { activeTrack, isPlaying, playTrack } = useAudio()
  const isActive = activeTrack === section.id
  const playing = isActive && isPlaying

  if (minimal && section.type === 'vocabulary') {
    return (
      <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <button
          type="button"
          onClick={() =>
            playTrack(section.id, getAudioSrc(section.audio), section.trackLabel)
          }
          className={`mb-3 flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold ${
            playing ? 'text-teal-700' : 'text-slate-700 hover:text-teal-700'
          }`}
        >
          <Volume2 size={16} className={playing ? 'text-teal-600' : ''} />
          {section.trackLabel}
          {section.titleZh && (
            <span className="font-normal text-slate-500">· {section.titleZh}</span>
          )}
        </button>
        <div className="grid grid-cols-2 gap-2">
          {section.items.map((item) => (
            <div key={item.pinyin} className="rounded-lg bg-white p-2 text-center ring-1 ring-slate-100">
              {item.emoji && <span className="text-2xl">{item.emoji}</span>}
              <p className="text-xs font-medium text-slate-800">{item.pinyin}</p>
              {item.hanzi && <p className="text-[11px] text-slate-500">{item.hanzi}</p>}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          {section.titleZh && (
            <h3 className="text-base font-bold text-slate-900">{section.titleZh}</h3>
          )}
          {section.titleVi && (
            <p className="mt-1 text-sm text-slate-600">{section.titleVi}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() =>
            playTrack(section.id, getAudioSrc(section.audio), section.trackLabel)
          }
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
            playing
              ? 'bg-teal-600 text-white'
              : 'bg-teal-50 text-teal-700 ring-1 ring-teal-200 hover:bg-teal-100'
          }`}
        >
          <Volume2 size={16} />
          {section.trackLabel}
        </button>
      </header>

      {section.type === 'vocabulary' && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {section.items.map((item) => (
            <div key={item.pinyin} className="text-center">
              <div className="mx-auto mb-1 flex aspect-square max-w-[100px] items-center justify-center rounded-lg bg-slate-50 ring-1 ring-slate-100">
                {item.emoji ? (
                  <span className="text-4xl">{item.emoji}</span>
                ) : (
                  <span className="text-xl font-bold text-teal-300">{item.pinyin[0]?.toUpperCase()}</span>
                )}
              </div>
              <p className="text-sm font-medium text-slate-800">{item.pinyin}</p>
              {item.hanzi && <p className="text-xs text-slate-500">{item.hanzi}</p>}
            </div>
          ))}
        </div>
      )}

      {section.type === 'text' && section.content && (
        <div className="text-sm leading-7 text-slate-700">
          {section.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      )}
    </article>
  )
}
