import { useEffect, useState } from 'react'
import { useAudio } from '../context/AudioContext'
import { RECOGNIZE_VOCAB } from '../data/recognizeVocab'
import {
  buildSessionQueue,
  loadProgress,
  recordAnswer,
  saveProgress,
} from '../lib/recognizeProgress'
import { buildMeaningOptions } from '../lib/recognizeQuiz'

const AUTO_NEXT_MS = 1500

export default function RecognizePage() {
  const { stopTrack } = useAudio()
  const [phase, setPhase] = useState('idle')
  const [queue, setQueue] = useState([])
  const [index, setIndex] = useState(0)
  const [options, setOptions] = useState([])
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
    setOptions(buildMeaningOptions(fromQueue[nextIndex], RECOGNIZE_VOCAB))
    setAnswered(null)
  }

  useEffect(() => {
    if (!answered?.correct) return undefined
    const timer = setTimeout(() => {
      goNext(index, queue)
    }, AUTO_NEXT_MS)
    return () => clearTimeout(timer)
  }, [answered, index, queue])

  function startSession() {
    if (RECOGNIZE_VOCAB.length === 0) return
    const nextQueue = buildSessionQueue(
      RECOGNIZE_VOCAB,
      loadProgress(),
      RECOGNIZE_VOCAB.length,
    )
    const first = nextQueue[0]
    setQueue(nextQueue)
    setIndex(0)
    setOptions(first ? buildMeaningOptions(first, RECOGNIZE_VOCAB) : [])
    setAnswered(null)
    setCorrectCount(0)
    setMissed([])
    setPhase(nextQueue.length ? 'active' : 'idle')
  }

  function handlePick(option) {
    if (answered || !entry) return
    const correct = option.id === entry.id
    const nextProgress = recordAnswer(loadProgress(), entry.id, correct)
    saveProgress(nextProgress)
    setAnswered({ pickId: option.id, correct })
    if (correct) {
      setCorrectCount((n) => n + 1)
    } else {
      setMissed((list) => [
        ...list,
        { hanzi: entry.hanzi, pinyin: entry.pinyin, meaningVi: entry.meaningVi },
      ])
    }
  }

  if (RECOGNIZE_VOCAB.length === 0) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-lg p-4 md:p-8">
          <h2 className="text-xl font-bold text-slate-900">Nhận diện chữ</h2>
          <p className="mt-3 text-sm text-slate-600">Chưa có từ vựng — sẽ bổ sung sau.</p>
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
              <h2 className="text-xl font-bold text-slate-900">Nhận diện chữ</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Nhìn chữ Hán, chọn đúng pinyin / nghĩa. Mỗi lần luyện hết {RECOGNIZE_VOCAB.length}{' '}
                từ (chữ hay sai ưu tiên hơn).
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

            <div className="flex min-h-[9rem] items-center justify-center rounded-2xl bg-white py-8">
              <p className="text-8xl font-medium leading-none text-slate-900">{entry.hanzi}</p>
            </div>

            <div className="space-y-2">
              {options.map((option) => {
                let style = 'border-slate-200 hover:border-teal-300 hover:bg-teal-50'
                if (answered) {
                  if (option.id === entry.id) {
                    style = 'border-emerald-500 bg-emerald-50 text-emerald-900'
                  } else if (option.id === answered.pickId) {
                    style = 'border-rose-400 bg-rose-50 text-rose-900'
                  } else {
                    style = 'border-slate-200 opacity-50'
                  }
                }
                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={Boolean(answered)}
                    onClick={() => handlePick(option)}
                    className={`w-full rounded-xl border px-4 py-3 text-left text-base transition ${style}`}
                  >
                    <span className="font-medium text-slate-800">{option.pinyin}</span>
                    <span className="text-slate-400"> / </span>
                    <span className="text-slate-700">{option.meaningVi}</span>
                  </button>
                )
              })}
            </div>

            {answered && (
              <div className="space-y-4">
                <div
                  className={`rounded-xl px-4 py-3 text-sm ${
                    answered.correct
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'bg-rose-50 text-rose-800'
                  }`}
                >
                  <p className="font-semibold">{answered.correct ? 'Đúng!' : 'Sai rồi'}</p>
                  <p className="mt-1">
                    {entry.pinyin} / {entry.meaningVi}
                  </p>
                </div>
                {!answered.correct && (
                  <button
                    type="button"
                    onClick={() => goNext(index, queue)}
                    className="inline-flex w-full items-center justify-center rounded-full bg-teal-600 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-700"
                  >
                    Tiếp
                  </button>
                )}
              </div>
            )}
          </>
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
                  Chữ hay sai
                </p>
                <ul className="space-y-2">
                  {missed.map((item) => (
                    <li
                      key={`${item.hanzi}-${item.meaningVi}`}
                      className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl border border-slate-200 px-4 py-3"
                    >
                      <span className="text-2xl text-slate-900">{item.hanzi}</span>
                      <span className="text-sm text-slate-600">
                        {item.pinyin} / {item.meaningVi}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-emerald-700">Không sai chữ nào trong phiên này.</p>
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
