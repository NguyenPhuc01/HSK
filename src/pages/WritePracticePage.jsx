import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, ScanText, Undo2, Volume2 } from 'lucide-react'
import { pinyin } from 'pinyin-pro'
import HanziDrawPad from '../components/HanziDrawPad'
import { useAudio } from '../context/AudioContext'
import { getVocabByHanzi, vocabHref } from '../data/hsk1Vocab'
import { lookupExternalHanzi } from '../lib/externalDict'
import { recognizeHandwriting } from '../lib/handwritingRecognize'
import { speakChinese } from '../lib/speakChinese'

function toPinyin(hanzi) {
  return pinyin(hanzi, { toneType: 'symbol', type: 'string', nonZh: 'consecutive' }).trim()
}

export default function WritePracticePage() {
  const { stopTrack } = useAudio()
  const padRef = useRef(null)
  const abortRef = useRef(null)

  const [recognizing, setRecognizing] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  const [status, setStatus] = useState('')
  const [candidates, setCandidates] = useState([])
  const [selected, setSelected] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const setCanUndoFromCount = useCallback((count) => {
    setCanUndo(count > 0)
  }, [])

  useEffect(() => {
    stopTrack()
  }, [stopTrack])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const resolveMeaning = useCallback(async (hanzi, signal) => {
    const local = getVocabByHanzi(hanzi)
    if (local) {
      return {
        hanzi,
        pinyin: local.pinyin,
        meaningVi: local.meaningVi,
        source: 'app',
      }
    }

    const chars = [...hanzi]
    if (chars.length > 1) {
      try {
        const ext = await lookupExternalHanzi(hanzi, signal)
        if (ext) {
          return {
            hanzi,
            pinyin: ext.pinyin || toPinyin(hanzi),
            meaningVi: ext.meaningVi,
            meaningLang: ext.meaningLang,
            source: 'ngoài',
          }
        }
      } catch {
        /* fall through */
      }

      const parts = []
      for (const ch of chars) {
        const w = getVocabByHanzi(ch)
        if (w) parts.push(w.meaningVi)
        else {
          try {
            const ext = await lookupExternalHanzi(ch, signal)
            if (ext?.meaningVi) parts.push(ext.meaningVi)
          } catch {
            /* ignore */
          }
        }
      }
      if (parts.length) {
        return {
          hanzi,
          pinyin: toPinyin(hanzi),
          meaningVi: parts.join(' · '),
          source: 'ghép',
        }
      }
    }

    const ext = await lookupExternalHanzi(hanzi, signal)
    if (ext) {
      return {
        hanzi,
        pinyin: ext.pinyin || toPinyin(hanzi),
        meaningVi: ext.meaningVi,
        meaningLang: ext.meaningLang,
        source: 'ngoài',
      }
    }

    return {
      hanzi,
      pinyin: toPinyin(hanzi),
      meaningVi: '(chưa có nghĩa — thử viết rõ hơn)',
      source: 'nhận diện',
    }
  }, [])

  const loadMeaning = useCallback(
    async (hanzi, signal) => {
      setSelected(hanzi)
      setStatus('Đang lấy nghĩa…')
      setError('')
      try {
        const info = await resolveMeaning(hanzi, signal)
        if (signal?.aborted) return
        setResult(info)
        setStatus('')
      } catch (err) {
        if (err?.name === 'AbortError') return
        setError('Không lấy được nghĩa. Thử chọn chữ khác hoặc nhận diện lại.')
        setStatus('')
      }
    },
    [resolveMeaning],
  )

  const recognize = useCallback(async () => {
    const pad = padRef.current
    if (!pad || recognizing) return
    if (pad.isBlank()) {
      setError('Hãy viết chữ trước khi nhận diện.')
      setResult(null)
      setCandidates([])
      setSelected('')
      return
    }

    const ink = pad.getInk?.()
    if (!ink?.strokes?.length) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setRecognizing(true)
    setError('')
    setStatus('Đang nhận diện…')
    setResult(null)
    setCandidates([])
    setSelected('')

    try {
      const list = await recognizeHandwriting(ink, {
        signal: controller.signal,
        maxResults: 8,
      })

      if (!list.length) {
        setError('Không nhận ra chữ Hán. Viết to, rõ nét hơn rồi thử lại.')
        setStatus('')
        return
      }

      setCandidates(list)
      await loadMeaning(list[0], controller.signal)
    } catch (err) {
      if (err?.name === 'AbortError') return
      setError('Nhận diện lỗi. Kiểm tra mạng rồi thử lại.')
      setStatus('')
    } finally {
      setRecognizing(false)
    }
  }, [loadMeaning, recognizing])

  function handlePickCandidate(hanzi) {
    if (hanzi === selected || recognizing) return
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    loadMeaning(hanzi, controller.signal)
  }

  function handleClear() {
    abortRef.current?.abort()
    padRef.current?.clear()
    setCanUndo(false)
    setCandidates([])
    setSelected('')
    setResult(null)
    setError('')
    setStatus('')
    setSpeaking(false)
  }

  function handleUndo() {
    padRef.current?.undoLastStroke()
    setCanUndo(Boolean(padRef.current?.canUndo()))
  }

  async function handleSpeak() {
    if (!result?.hanzi || speaking) return
    setSpeaking(true)
    try {
      await speakChinese(result.hanzi)
    } finally {
      setSpeaking(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-6 pb-12 md:py-10">
        <header className="mb-5 w-full text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">Luyện viết</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Viết chữ Hán</h2>
          <p className="mt-1 text-sm text-slate-500">
            Viết từ dài sang phải (khung tự dài). Bấm Nhận diện — nếu sai, chọn gợi ý đúng.
          </p>
        </header>

        <HanziDrawPad
          ref={padRef}
          variant="strip"
          hideToolbar
          showOutline={false}
          onStrokesChange={setCanUndoFromCount}
          className="w-full"
        />

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={!canUndo || recognizing}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Undo2 size={16} />
            Quay lại 1 nét
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Xóa hết
          </button>
          <button
            type="button"
            onClick={recognize}
            disabled={recognizing}
            className="inline-flex items-center gap-1.5 rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {recognizing ? <Loader2 size={16} className="animate-spin" /> : <ScanText size={16} />}
            {recognizing ? 'Đang nhận…' : 'Nhận diện'}
          </button>
        </div>

        {status ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={14} className="animate-spin text-teal-600" />
            {status}
          </p>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
            {error}
          </p>
        ) : null}

        {candidates.length > 0 ? (
          <div className="mt-5 w-full">
            <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
              Gợi ý — chọn chữ đúng
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {candidates.map((ch) => {
                const active = ch === selected
                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => handlePickCandidate(ch)}
                    className={`min-w-12 rounded-xl px-3 py-2 text-2xl font-medium transition ${
                      active
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {ch}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        {result ? (
          <div className="mt-6 w-full rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
            <p className="text-5xl font-medium text-slate-900 md:text-6xl">{result.hanzi}</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <p className="text-2xl font-medium text-teal-800">{result.pinyin}</p>
              <button
                type="button"
                onClick={handleSpeak}
                disabled={speaking}
                aria-label="Nghe phát âm"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-700 ring-1 ring-teal-100 hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {speaking ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
              </button>
            </div>
            <p className="mt-2 text-base text-slate-700">
              {result.meaningVi}
              {result.meaningLang === 'en' ? (
                <span className="ml-1 text-[10px] font-semibold uppercase text-slate-400">EN</span>
              ) : null}
            </p>
            <p className="mt-2 text-[11px] uppercase tracking-wide text-slate-400">
              Nguồn: {result.source}
            </p>
            {getVocabByHanzi(result.hanzi) ? (
              <Link
                to={vocabHref(result.hanzi)}
                className="mt-4 inline-block text-sm font-medium text-teal-700 hover:underline"
              >
                Mở trang học từ →
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
