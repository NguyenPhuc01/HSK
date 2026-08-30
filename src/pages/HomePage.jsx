import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen } from 'lucide-react'
import { TOTAL_PAGES } from '../data/pageAudioMap'
import { loadReadingPage } from '../hooks/useReadingProgress'
import { audioManifest } from '../data/audioManifest'

export default function HomePage() {
  const savedPage = loadReadingPage()

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl space-y-8 p-4 md:p-8">
        <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 p-6 text-white shadow-xl md:p-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-teal-200">
            HSK Standard Course 1
          </p>
          <h2 className="text-2xl font-bold md:text-3xl">
            Giáo trình {TOTAL_PAGES} trang + Audio
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-teal-100 md:text-base">
            Cuộn xuống để đọc liên tục — trang tự chuyển.
            Nhấn nút loa màu xanh ở dưới màn hình để nghe audio.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              to={`/read/${savedPage}`}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-teal-700 shadow hover:bg-teal-50"
            >
              <BookOpen size={16} />
              Tiếp tục trang {savedPage}
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/read/1"
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/25"
            >
              Từ trang 1
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-white/15 px-3 py-1">{TOTAL_PAGES} trang PDF</span>
            <span className="rounded-full bg-white/15 px-3 py-1">{audioManifest.length} file audio</span>
          </div>
        </section>
      </div>
    </div>
  )
}
