import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { VOCAB, VOCAB_GROUPS, searchVocab, vocabHref } from '../data/hsk1Vocab'
import { useAudio } from '../context/AudioContext'

export default function VocabListPage() {
  const { stopTrack } = useAudio()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const group = searchParams.get('g') ?? 'all'
  const [draft, setDraft] = useState(query)

  useEffect(() => {
    stopTrack()
  }, [stopTrack])

  useEffect(() => {
    setDraft(query)
  }, [query])

  const words = useMemo(() => searchVocab(query, group), [query, group])

  function setParams({ q = query, g = group }) {
    const next = {}
    if (q.trim()) next.q = q.trim()
    if (g && g !== 'all') next.g = g
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl p-4 pb-8 md:p-8">
        <header className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">HSK 1 · HSK 2</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Học từ</h2>
          <p className="mt-1 text-sm text-slate-500">
            {VOCAB.length} từ — chữ Hán, nét viết, pinyin và nghĩa.
          </p>
        </header>

        <div className="sticky top-0 z-10 bg-slate-100/95 pb-3 pt-1 backdrop-blur">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {VOCAB_GROUPS.map((item) => {
              const active = group === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setParams({ g: item.id })}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
                    active
                      ? 'bg-teal-600 text-white ring-teal-600'
                      : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              setParams({ q: draft })
            }}
          >
            <label className="relative block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={draft}
                onChange={(e) => {
                  const value = e.target.value
                  setDraft(value)
                  setParams({ q: value })
                }}
                placeholder="Tìm chữ Hán, pinyin hoặc nghĩa…"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none ring-teal-600 placeholder:text-slate-400 focus:border-teal-400 focus:ring-2"
              />
            </label>
          </form>
        </div>

        {words.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
            Không tìm thấy từ phù hợp.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {words.map((word) => (
              <li key={word.hanzi}>
                <Link
                  to={vocabHref(word.hanzi, { q: query, g: group })}
                  className="flex items-baseline gap-3 px-4 py-3 transition hover:bg-teal-50"
                >
                  <span className="min-w-[4.5rem] text-xl font-medium text-slate-900">{word.hanzi}</span>
                  <span className="min-w-[6rem] text-sm text-teal-700">{word.pinyin}</span>
                  <span className="flex-1 text-sm text-slate-600">{word.meaningVi}</span>
                  {word.topic === 'country' ? (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">QG</span>
                  ) : word.level === 2 ? (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">HSK2</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
