import { memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import TextbookViewer from '../components/TextbookViewer'
import { getAudioTracksForPage, getTotalPages } from '../data/bookAudio'
import { saveReadingPage } from '../hooks/useReadingProgress'

function PdfPane({ bookId, pageNum }) {
  const navigate = useNavigate()
  const totalPages = getTotalPages(bookId)
  const hasTracks = getAudioTracksForPage(bookId, pageNum).length > 0

  const handlePageChange = useCallback(
    (nextPage) => {
      if (nextPage >= 1 && nextPage <= totalPages && nextPage !== pageNum) {
        saveReadingPage(bookId, nextPage)
        navigate(`/read/${bookId}/${nextPage}`, { replace: true })
      }
    },
    [bookId, navigate, pageNum, totalPages],
  )

  return (
    <div
      className={`flex h-dvh min-h-0 flex-col ${
        hasTracks
          ? 'pb-[calc(var(--mobile-audio-panel-open-h)+env(safe-area-inset-bottom,0px))] md:pb-[calc(var(--audio-bar-h)+var(--mobile-track-strip-h)+env(safe-area-inset-bottom,0px))] lg:pb-[var(--audio-bar-h)]'
          : 'pb-[env(safe-area-inset-bottom,0px)]'
      }`}
    >
      <TextbookViewer
        page={pageNum}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  )
}

export default memo(PdfPane)
