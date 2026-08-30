import { memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import TextbookViewer from '../components/TextbookViewer'
import { getTotalPages } from '../data/bookAudio'
import { saveReadingPage } from '../hooks/useReadingProgress'

function PdfPane({ bookId, pageNum }) {
  const navigate = useNavigate()
  const totalPages = getTotalPages(bookId)

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
    <div className="flex h-full min-h-0 flex-col pb-48 lg:pb-[72px]">
      <TextbookViewer
        page={pageNum}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  )
}

export default memo(PdfPane)
