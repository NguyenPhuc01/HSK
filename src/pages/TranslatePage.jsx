import { useEffect, useMemo, useRef, useState } from 'react'
import { useAudio } from '../context/AudioContext'
import LessonFilter from '../components/LessonFilter'
import { filterSentencesByLesson, HSK1_LESSONS } from '../data/hsk1Lessons'
import { LESSON_TRANSLATE_SENTENCES } from '../data/lessonTranslateSentences'
import { TRANSLATE_SENTENCES } from '../data/translateSentences'
import { checkTranslation, shuffleList, annotateFormula } from '../lib/translateCheck'

const AUTO_NEXT_MS = 1500

const ALL_SENTENCES = [...TRANSLATE_SENTENCES, ...LESSON_TRANSLATE_SENTENCES]

export default function TranslatePage() {
  const { stopTrack } = useAudio()
  const inputRef = useRef(null)
  const [phase, setPhase] = useState('idle')
  const [lessonFilter, setLessonFilter] = useState('all')
  const [queue, setQueue] = useState([])
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [answered, setAnswered] = useState(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [missed, setMissed] = useState([])

  useEffect(() => {
    stopTrack()
  }, [stopTrack])

  const pool = useMemo(
    () => filterSentencesByLesson(ALL_SENTENCES, lessonFilter),
    [lessonFilter],
  )

  const lessonCounts = useMemo(() => {
    const byLesson = {}
    for (const lesson of HSK1_LESSONS) {
      byLesson[lesson.id] = ALL_SENTENCES.filter((s) => s.lesson === lesson.id).length
    }
    return { all: ALL_SENTENCES.length, byLesson }
  }, [])

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
    if (pool.length === 0) return
    // Mỗi lần bắt đầu / luyện lại đều xáo lại toàn bộ câu trong bộ lọc.
    const nextQueue = shuffleList(pool)
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

  if (ALL_SENTENCES.length === 0) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-5xl p-4 md:p-8 lg:max-w-6xl">
          <h2 className="text-xl font-bold text-slate-900">Luyện dịch</h2>
          <p className="mt-3 text-sm text-slate-600">Chưa có câu luyện — sẽ bổ sung sau.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8 lg:max-w-6xl">
        {phase === 'idle' && (
          <>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Luyện dịch</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Đọc câu tiếng Việt, gõ tiếng Trung. Mỗi lần bắt đầu sẽ xáo thứ tự câu. Nhiều cách
                viết tự nhiên vẫn được tính đúng; sai mới hiện công thức theo bài cô.
              </p>
            </div>
            <LessonFilter value={lessonFilter} onChange={setLessonFilter} counts={lessonCounts} />
            {pool.length === 0 ? (
              <p className="text-sm text-amber-700">Bài này chưa có câu luyện dịch.</p>
            ) : (
              <button
                type="button"
                onClick={startSession}
                className="inline-flex w-full items-center justify-center rounded-full bg-teal-600 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-700"
              >
                Bắt đầu · {pool.length} câu
              </button>
            )}
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
                {entry.pattern && (
                  <p className="mt-2">
                    Công thức chung:{' '}
                    <span className="font-medium text-rose-950">
                      {annotateFormula(entry.pattern)}
                    </span>
                  </p>
                )}
                <p className="mt-2">
                  Gợi ý cấu trúc:{' '}
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
              onClick={startSession}
              className="inline-flex w-full items-center justify-center rounded-full bg-teal-600 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Luyện lại (xáo câu mới)
            </button>
          </>
        )}
      </div>
    </div>
  )
}
