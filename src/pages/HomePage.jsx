import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, ClipboardList, Languages } from 'lucide-react'
import { getTotalPages } from '../data/bookAudio'
import { getAudioCount } from '../data/audioManifests'
import { BOOK_LIST } from '../data/books'
import { VOCAB, getVocabByHanzi, loadLastVocab } from '../data/hsk1Vocab'
import { loadLastBookId, loadReadingPage } from '../hooks/useReadingProgress'

export default function HomePage() {
  const lastBookId = loadLastBookId()

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-8">
        <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 p-6 text-white shadow-xl md:p-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-teal-200">
            HSK Standard Course 1
          </p>
          <h2 className="text-2xl font-bold md:text-3xl">Giáo trình + Học từ</h2>
          <p className="mt-3 text-sm leading-relaxed text-teal-100 md:text-base">
            Đọc PDF kèm audio, hoặc ôn từ HSK 1–2 và tên quốc gia với chữ Hán, nét viết và pinyin.
          </p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          {BOOK_LIST.map((book) => {
            const savedPage = loadReadingPage(book.id)
            const totalPages = getTotalPages(book.id)
            const audioCount = getAudioCount(book.id)
            const isLast = lastBookId === book.id
            const Icon = book.id === 'textbook' ? BookOpen : ClipboardList

            return (
              <section
                key={book.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{book.title}</h3>
                    <p className="text-xs text-slate-500">{book.subtitle}</p>
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                    {totalPages} trang
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                    {audioCount} audio
                  </span>
                  {isLast && (
                    <span className="rounded-full bg-teal-100 px-2.5 py-1 text-teal-700">
                      Đọc gần đây
                    </span>
                  )}
                </div>

                <div className="mt-auto flex flex-col gap-2">
                  <Link
                    to={`/read/${book.id}/${savedPage}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
                  >
                    {savedPage > 1 ? `Tiếp tục trang ${savedPage}` : 'Bắt đầu đọc'}
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    to={`/read/${book.id}/1`}
                    className="text-center text-xs text-slate-500 hover:text-teal-600"
                  >
                    Từ trang 1
                  </Link>
                </div>
              </section>
            )
          })}

          <VocabHomeCard />
        </div>
      </div>
    </div>
  )
}

function VocabHomeCard() {
  const lastHanzi = loadLastVocab()
  const lastWord = lastHanzi ? getVocabByHanzi(lastHanzi) : null

  return (
    <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
          <Languages size={18} />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Học từ</h3>
          <p className="text-xs text-slate-500">Chữ Hán to, nét viết, pinyin và nghĩa</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{VOCAB.length} từ</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">Nét viết + TTS</span>
      </div>

      <div className="mt-auto flex flex-col gap-2 sm:flex-row">
        <Link
          to="/vocab"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
        >
          Danh sách từ
          <ArrowRight size={16} />
        </Link>
        {lastWord && (
          <Link
            to={`/vocab/${encodeURIComponent(lastWord.hanzi)}`}
            className="inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium text-teal-700 hover:bg-teal-50"
          >
            Tiếp tục {lastWord.hanzi}
          </Link>
        )}
      </div>
    </section>
  )
}
