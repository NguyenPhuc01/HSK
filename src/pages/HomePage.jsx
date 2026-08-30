import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Download } from 'lucide-react'
import { TOTAL_PAGES } from '../data/textbookSections'
import { audioManifest } from '../data/audioManifest'

export default function HomePage() {
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
            Chọn trang ở menu bên trái (1 → {TOTAL_PAGES}) để xem giáo trình.
            Trang có audio sẽ hiện icon loa — nhấn để nghe.
          </p>
          <Link
            to="/read/1"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-teal-700 shadow hover:bg-teal-50"
          >
            <BookOpen size={16} />
            Bắt đầu từ trang 1
            <ArrowRight size={16} />
          </Link>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-white/15 px-3 py-1">{TOTAL_PAGES} trang PDF</span>
            <span className="rounded-full bg-white/15 px-3 py-1">{audioManifest.length} file audio</span>
          </div>
        </section>

        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="flex items-start gap-2">
            <Download size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Cài đặt lần đầu</p>
              <ul className="mt-2 space-y-1 text-amber-800">
                <li>
                  <code className="rounded bg-amber-100 px-1.5 py-0.5">npm run download-textbook</code>
                </li>
                <li>
                  <code className="rounded bg-amber-100 px-1.5 py-0.5">npm run download-audio</code>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
