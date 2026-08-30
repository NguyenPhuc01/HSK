import { BookOpen } from 'lucide-react'
import AudioTrackList from './AudioTrackList'
import { getAudioTracksForPage, getTotalPages } from '../data/bookAudio'

export default function AudioSidebar({ bookId, pageNum }) {
  const audioTracks = getAudioTracksForPage(bookId, pageNum)
  const totalPages = getTotalPages(bookId)

  return (
    <aside className="hidden min-h-0 w-64 shrink-0 flex-col border-l border-slate-200 bg-white lg:flex xl:w-72">
      <div className="shrink-0 border-b border-slate-100 px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-wider text-teal-600">
          Trang {pageNum} / {totalPages}
        </p>
      </div>
      {audioTracks.length > 0 ? (
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <p className="mb-2 text-xs text-slate-500">Nhấn loa để nghe</p>
          <AudioTrackList bookId={bookId} sections={audioTracks} />
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center p-6 text-center">
          <div>
            <BookOpen size={24} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm text-slate-500">Trang này không có audio</p>
            {bookId === 'workbook' && (
              <p className="mt-1 text-xs text-slate-400">
                Map audio tại /admin/audio-map
              </p>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}
