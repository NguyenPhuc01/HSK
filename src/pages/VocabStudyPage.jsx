import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Eye, EyeOff, RotateCcw, Volume2 } from 'lucide-react'
import HanziStrokeWord from '../components/HanziStrokeWord'
import { useAudio } from '../context/AudioContext'
import { speakChinese, cancelSpeech } from '../lib/speakChinese'
import {
  getAdjacentVocab,
  getVocabByHanzi,
  loadHidePrefs,
  saveHidePrefs,
  saveLastVocab,
  searchVocab,
  splitHanzi,
  vocabHref,
} from '../data/hsk1Vocab'

export default function VocabStudyPage() {
  const { hanzi: rawHanzi } = useParams()
  const [searchParams] = useSearchParams()
  const hanzi = decodeURIComponent(rawHanzi ?? '')
  const query = searchParams.get('q') ?? ''
  const group = searchParams.get('g') ?? 'all'
  const word = getVocabByHanzi(hanzi)
  const filtered = searchVocab(query, group)
  const { index, prev, next, total } = getAdjacentVocab(hanzi, filtered)
  const listHref = vocabHref(null, { q: query, g: group })
  const navigate = useNavigate()
  const { stopTrack } = useAudio()
  const [replayKey, setReplayKey] = useState(0)
  const [{ hideHanzi, hidePinyin }, setHide] = useState(loadHidePrefs)

  useEffect(() => {
    stopTrack()
  }, [stopTrack])

  useEffect(() => {
    return () => cancelSpeech()
  }, [hanzi])

  useEffect(() => {
    if (word) saveLastVocab(word.hanzi)
  }, [word])

  useEffect(() => {
    saveHidePrefs({ hideHanzi, hidePinyin })
  }, [hideHanzi, hidePinyin])

  useEffect(() => {
    function onKey(e) {
      if (!(e.target instanceof Element) || e.target.closest('input, textarea')) return
      if (e.key === 'ArrowLeft' && prev) navigate(vocabHref(prev.hanzi, { q: query, g: group }))
      if (e.key === 'ArrowRight' && next) navigate(vocabHref(next.hanzi, { q: query, g: group }))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate, prev, next, query, group])

  if (!word) return <Navigate to={listHref} replace />

  const charCount = splitHanzi(word.hanzi).length

  function toggle(key) {
    setHide((current) => ({ ...current, [key]: !current[key] }))
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex min-h-full max-w-2xl flex-col p-4 pb-10 md:p-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link to={listHref} className="text-sm font-medium text-teal-700 hover:text-teal-800">
            ← Danh sách
          </Link>
          <p className="text-xs tabular-nums text-slate-400">
            {index + 1} / {total}
          </p>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          <ToggleChip
            active={hideHanzi}
            onClick={() => toggle('hideHanzi')}
            label={hideHanzi ? 'Hiện chữ Hán' : 'Ẩn chữ Hán'}
          />
          <ToggleChip
            active={hidePinyin}
            onClick={() => toggle('hidePinyin')}
            label={hidePinyin ? 'Hiện pinyin' : 'Ẩn pinyin'}
          />
        </div>

        <section className="flex flex-1 flex-col items-center rounded-3xl border border-slate-200 bg-linear-to-b from-white to-slate-50 px-4 py-8 shadow-sm">
          <div className="flex min-h-70 w-full items-center justify-center">
            {hideHanzi ? (
              <div className="flex flex-wrap justify-center gap-2">
                {Array.from({ length: charCount }, (_, i) => (
                  <div
                    key={i}
                    className="flex h-36 w-36 items-center justify-center rounded-2xl bg-slate-100 text-4xl text-slate-300 ring-1 ring-slate-200 sm:h-44 sm:w-44"
                  >
                    ?
                  </div>
                ))}
              </div>
            ) : (
              <HanziStrokeWord hanzi={word.hanzi} replayKey={replayKey} />
            )}
          </div>

          <div className="mt-6 min-h-10 text-center">
            {hidePinyin ? (
              <p className="text-2xl tracking-widest text-slate-300">····</p>
            ) : (
              <p className="text-3xl font-medium text-teal-800 md:text-4xl">{word.pinyin}</p>
            )}
          </div>

          <p className="mt-3 text-lg text-slate-700">{word.meaningVi}</p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => speakChinese(word.hanzi)}
              className="inline-flex items-center gap-1.5 rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
            >
              <Volume2 size={16} />
              Nghe
            </button>
            {!hideHanzi && (
              <button
                type="button"
                onClick={() => setReplayKey((n) => n + 1)}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-teal-800 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                <RotateCcw size={16} />
                Xem lại nét
              </button>
            )}
          </div>
        </section>

        <nav className="mt-5 flex items-center justify-between gap-3">
          {prev ? (
            <Link
              to={vocabHref(prev.hanzi, { q: query, g: group })}
              className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-medium text-slate-600 hover:bg-white hover:text-teal-700"
            >
              <ChevronLeft size={18} />
              {prev.hanzi}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              to={vocabHref(next.hanzi, { q: query, g: group })}
              className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-medium text-slate-600 hover:bg-white hover:text-teal-700"
            >
              {next.hanzi}
              <ChevronRight size={18} />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </div>
  )
}

function ToggleChip({ active, onClick, label }) {
  const Icon = active ? EyeOff : Eye
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
        active
          ? 'bg-teal-600 text-white ring-teal-600'
          : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  )
}
