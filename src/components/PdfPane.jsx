import { memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import TextbookViewer from '../components/TextbookViewer'
import { TOTAL_PAGES } from '../data/pageAudioMap'
import { saveReadingPage } from '../hooks/useReadingProgress'

/** Chỉ hiển thị PDF — không subscribe audio context → không bị remount khi phát nhạc */
function PdfPane({ pageNum }) {
  const navigate = useNavigate()

  const handlePageChange = useCallback(
    (nextPage) => {
      if (nextPage >= 1 && nextPage <= TOTAL_PAGES && nextPage !== pageNum) {
        saveReadingPage(nextPage)
        navigate(`/read/${nextPage}`, { replace: true })
      }
    },
    [navigate, pageNum],
  )

  return (
    <div className="flex h-full min-h-0 flex-col pb-36 lg:pb-20">
      <TextbookViewer
        page={pageNum}
        totalPages={TOTAL_PAGES}
        onPageChange={handlePageChange}
      />
    </div>
  )
}

export default memo(PdfPane)
