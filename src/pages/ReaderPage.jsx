import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { BookOpen, Headphones } from 'lucide-react'
import TextbookViewer from '../components/TextbookViewer'
import AudioTrackList from '../components/AudioTrackList'
import {
  TOTAL_PAGES,
  getAudioTracksForPage,
} from '../data/pageAudioMap'

export default function ReaderPage() {
  const { page: pageParam } = useParams()
  const navigate = useNavigate()

  // Redirect URL cũ dạng /read/cover → trang 1
  if (pageParam && !/^\d+$/.test(pageParam)) {
    return <Navigate to="/read/1" replace />
  }

  const pageNum = Number(pageParam)

  if (!pageParam || !Number.isInteger(pageNum) || pageNum < 1 || pageNum > TOTAL_PAGES) {
    return <Navigate to="/read/1" replace />
  }

  const audioTracks = getAudioTracksForPage(pageNum)

  const handlePageChange = (nextPage) => {
    if (nextPage >= 1 && nextPage <= TOTAL_PAGES) {
      navigate(`/read/${nextPage}`, { replace: true })
    }
  }

  return (
    <div className="flex h-full flex-col lg:flex-row">
      <div className="min-h-0 flex-1 lg:border-r lg:border-slate-200">
        <TextbookViewer
          page={pageNum}
          totalPages={TOTAL_PAGES}
          onPageChange={handlePageChange}
        />
      </div>

      <aside className="flex shrink-0 flex-col border-t border-slate-200 bg-white lg:w-64 lg:border-t-0 xl:w-72">
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wider text-teal-600">
            Trang {pageNum} / {TOTAL_PAGES}
          </p>
        </div>

        {audioTracks.length > 0 ? (
          <>
            <div className="border-b border-slate-100 px-4 py-2">
              <p className="flex items-center gap-1 text-xs text-slate-500">
                <Headphones size={12} />
                {audioTracks.length} audio · Nhấn loa để nghe
              </p>
            </div>
            <div className="border-b border-slate-100 px-4 py-3 lg:hidden">
              <AudioTrackList sections={audioTracks} compact />
            </div>
            <div className="max-h-48 overflow-y-auto p-3 lg:max-h-none lg:flex-1">
              <AudioTrackList sections={audioTracks} />
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-6 text-center">
            <div>
              <BookOpen size={24} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm text-slate-500">Trang này không có audio</p>
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
