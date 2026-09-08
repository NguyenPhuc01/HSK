import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Loader2, Search } from 'lucide-react'
import {
  PRACTICAL_TOPICS,
  VOCAB,
  VOCAB_GROUPS,
  searchVocab,
  vocabHref,
} from '../data/hsk1Vocab'
import {
  externalVocabHref,
  saveExternalWord,
  searchExternalVocab,
} from '../lib/externalDict'
import { useAudio } from '../context/AudioContext'

const TOPIC_BADGE = {
  food: 'Ăn',
  travel: 'Đi',
  shopping: 'Mua',
  home: 'Nhà',
  health: 'SK',
  time: 'TG',
  emotion: 'CX',
  school: 'Học',
  work: 'Việc',
  polite: 'LS',
}

function localBadge(word) {
  if (word.topic === 'country') return 'QG'
  if (word.topic && TOPIC_BADGE[word.topic]) return TOPIC_BADGE[word.topic]
  if (word.level === 2) return 'HSK2'
  return null
}

export default function VocabListPage() {
  const { stopTrack } = useAudio()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const group = searchParams.get('g') ?? 'all'
  const topic = searchParams.get('t') ?? ''
  const [draft, setDraft] = useState(query)
  const [external, setExternal] = useState({ items: [], status: 'idle' })

  useEffect(() => {
    stopTrack()
  }, [stopTrack])

  useEffect(() => {
    setDraft(query)
  }, [query])

  const words = useMemo(() => searchVocab(query, group, topic), [query, group, topic])

  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setExternal({ items: [], status: 'idle' })
      return undefined
    }

    const controller = new AbortController()
    setExternal({ items: [], status: 'loading' })

    const timer = window.setTimeout(async () => {
      try {
        const result = await searchExternalVocab(q, controller.signal)
        if (!controller.signal.aborted) setExternal(result)
      } catch (err) {
        if (err?.name === 'AbortError') return
        if (!controller.signal.aborted) {
          setExternal({ items: [], status: 'error', error: err?.message })
        }
      }
    }, 550)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [query])

  const localRows = useMemo(
    () =>
      words.map((word) => ({
        key: `local-${word.hanzi}`,
        word,
        external: false,
        href: vocabHref(word.hanzi, { q: query, g: group, t: topic }),
        badge: localBadge(word),
      })),
    [words, query, group, topic],
  )

  const externalRows = useMemo(() => {
    const localHanzi = new Set(words.map((w) => w.hanzi))
    return (external.items ?? [])
      .filter((word) => !localHanzi.has(word.hanzi))
      .map((word) => ({
        key: `ext-${word.hanzi}`,
        word,
        external: true,
        href: externalVocabHref(word.hanzi, { q: query, g: group, t: topic }),
        badge: 'Ngoài',
      }))
  }, [words, external.items, query, group, topic])

  const searching = Boolean(query.trim())
  const loadingExt = searching && external.status === 'loading'
  const results = [...localRows, ...externalRows]
  const showEmpty =
    results.length === 0 && !loadingExt && (external.status !== 'idle' || !searching)

  function setParams({ q = query, g = group, t = topic }) {
    const next = {}
    if (q.trim()) next.q = q.trim()
    if (g && g !== 'all') next.g = g
    if (g === 'practical' && t) next.t = t
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl p-4 pb-8 md:p-8">
        <header className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">HSK · Thực tế</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Học từ</h2>
          <p className="mt-1 text-sm text-slate-500">
            {VOCAB.length} từ trong app — gõ thêm để tra cả từ điển ngoài.
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
                  onClick={() => setParams({ g: item.id, t: '' })}
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

          {group === 'practical' ? (
            <div className="mb-2 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setParams({ t: '' })}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 transition ${
                  !topic
                    ? 'bg-slate-800 text-white ring-slate-800'
                    : 'bg-white text-slate-500 ring-slate-200 hover:bg-slate-50'
                }`}
              >
                Mọi chủ đề
              </button>
              {PRACTICAL_TOPICS.map((item) => {
                const active = topic === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setParams({ t: item.id })}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 transition ${
                      active
                        ? 'bg-slate-800 text-white ring-slate-800'
                        : 'bg-white text-slate-500 ring-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          ) : null}

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

        {localRows.length > 0 || loadingExt || externalRows.length > 0 ? (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {localRows.map((row) => (
              <ResultRow key={row.key} row={row} />
            ))}
            {loadingExt ? (
              <li className="flex items-center justify-center gap-2 px-4 py-3.5 text-sm text-slate-500">
                <Loader2 size={16} className="animate-spin text-teal-600" />
                Đang tìm trên mạng…
              </li>
            ) : (
              externalRows.map((row) => <ResultRow key={row.key} row={row} />)
            )}
          </ul>
        ) : null}

        {showEmpty ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
            {searching && external.status === 'error'
              ? 'Không tìm thấy. Kiểm tra mạng rồi thử lại.'
              : 'Không tìm thấy từ phù hợp.'}
          </p>
        ) : null}
      </div>
    </div>
  )
}

function ResultRow({ row }) {
  return (
    <li>
      <Link
        to={row.href}
        onClick={() => {
          if (row.external) saveExternalWord(row.word)
        }}
        className="flex items-baseline gap-3 px-4 py-3 transition hover:bg-teal-50"
      >
        <span className="min-w-[4.5rem] text-xl font-medium text-slate-900">{row.word.hanzi}</span>
        <span className="min-w-[6rem] text-sm text-teal-700">{row.word.pinyin}</span>
        <span className="flex-1 text-sm text-slate-600">
          {row.word.meaningVi}
          {row.word.meaningLang === 'en' ? (
            <span className="ml-1 text-[10px] font-semibold uppercase text-slate-400">EN</span>
          ) : null}
        </span>
        {row.badge ? (
          <span
            className={`text-[10px] font-semibold uppercase tracking-wide ${
              row.external ? 'text-teal-600' : 'text-slate-400'
            }`}
          >
            {row.badge}
          </span>
        ) : null}
      </Link>
    </li>
  )
}
