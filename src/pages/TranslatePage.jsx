import { useEffect, useRef, useState } from 'react'
import { useAudio } from '../context/AudioContext'
import { TRANSLATE_SENTENCES } from '../data/translateSentences'
import { checkTranslation, shuffleList, annotateFormula } from '../lib/translateCheck'

const AUTO_NEXT_MS = 1500

export default function TranslatePage() {
  const { stopTrack } = useAudio()
  const inputRef = useRef(null)
  const [phase, setPhase] = useState('idle')
  const [queue, setQueue] = useState([])
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [answered, setAnswered] = useState(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [missed, setMissed] = useState([])

  useEffect(() => {
    stopTrack()
  }, [stopTrack])

  const entry = queue[index]

  function goNext(fromIndex, fromQueue) {
    const nextIndex = fromIndex + 1
    if (nextIndex >= fromQueue.length) {
      setPhase('summary')
      return
    }
    setIndex(nextIndex)
    setInput('')
    setAnswered(null)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  useEffect(() => {
    if (!answered?.correct) return undefined
    const timer = setTimeout(() => {
      goNext(index, queue)
    }, AUTO_NEXT_MS)
    return () => clearTimeout(timer)
  }, [answered, index, queue])

  function startSession() {
    if (TRANSLATE_SENTENCES.length === 0) return
    const nextQueue = shuffleList(TRANSLATE_SENTENCES)
    setQueue(nextQueue)
    setIndex(0)
    setInput('')
    setAnswered(null)
    setCorrectCount(0)
    setMissed([])
    setPhase('active')
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  function handleCheck(e) {
    e?.preventDefault()
    if (!entry || answered?.correct) return
    const correct = checkTranslation(input, entry.answers)
    if (correct) {
      const wasWrongBefore = answered && !answered.correct
      setAnswered({ correct: true })
      if (!wasWrongBefore) {
        setCorrectCount((n) => n + 1)
      }
      return
    }

    if (!answered) {
      setMissed((list) => [...list, { vi: entry.vi, answer: entry.answers[0] }])
    }
    setAnswered({ correct: false })
    requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })
  }

  if (TRANSLATE_SENTENCES.length === 0) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-lg p-4 md:p-8">
          <h2 className="text-xl font-bold text-slate-900">Luyện dịch</h2>
          <p className="mt-3 text-sm text-slate-600">Chưa có câu luyện — sẽ bổ sung sau.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-lg space-y-6 p-4 md:p-8">
        {phase === 'idle' && (
          <>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Luyện dịch</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Đọc câu tiếng Việt, gõ bản tiếng Trung. Sai mới hiện công thức để nhớ.
              </p>
            </div>
            <button
              type="button"
              onClick={startSession}
              className="inline-flex w-full items-center justify-center rounded-full bg-teal-600 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Bắt đầu
            </button>
          </>
        )}

        {phase === 'active' && entry && (
          <>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                {index + 1}/{queue.length}
              </span>
              <span>Đúng {correctCount}</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Dịch sang tiếng Trung
              </p>
              <p className="mt-2 text-xl font-semibold leading-snug text-slate-900">{entry.vi}</p>
            </div>

            <form onSubmit={handleCheck} className="space-y-3">
              <input
                ref={inputRef}
                type="text"
                lang="zh"
                inputMode="text"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                disabled={answered?.correct === true}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập chữ Hán…"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg text-slate-900 outline-none ring-teal-500 placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 disabled:bg-slate-50"
              />
              {answered?.correct !== true && (
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-full bg-teal-600 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-700"
                >
                  {answered && !answered.correct ? 'Kiểm tra lại' : 'Kiểm tra'}
                </button>
              )}
            </form>

            {answered?.correct && (
              <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <p className="font-semibold">Đúng!</p>
              </div>
            )}

            {answered && !answered.correct && (
              <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
                <p className="font-semibold">Sai rồi — sửa lại rồi bấm Kiểm tra lại</p>
                <p className="mt-2">
                  Đáp án: <span className="font-medium text-rose-950">{entry.answers[0]}</span>
                </p>
                <p className="mt-2">
                  Công thức:{' '}
                  <span className="font-medium text-rose-950">
                    {annotateFormula(entry.formula)}
                  </span>
                </p>
                <p className="mt-2 text-rose-700">{entry.explainVi}</p>
              </div>
            )}          </>
        )}

        {phase === 'summary' && (
          <>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Kết quả</h2>
              <p className="mt-2 text-sm text-slate-600">
                Đúng {correctCount}/{queue.length}
              </p>
            </div>

            {missed.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Câu hay sai
                </p>
                <ul className="space-y-2">
                  {missed.map((item) => (
                    <li
                      key={`${item.vi}-${item.answer}`}
                      className="rounded-xl border border-slate-200 px-4 py-3"
                    >
                      <p className="text-sm text-slate-600">{item.vi}</p>
                      <p className="mt-1 text-base font-medium text-slate-900">{item.answer}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-emerald-700">Không sai câu nào trong phiên này.</p>
            )}

            <button
              type="button"
              onClick={() => setPhase('idle')}
              className="inline-flex w-full items-center justify-center rounded-full bg-teal-600 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Luyện lại
            </button>
          </>
        )}
      </div>
    </div>
  )
}
