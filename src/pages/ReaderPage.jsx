import { useEffect, useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import PdfPane from '../components/PdfPane'
import AudioSidebar from '../components/AudioSidebar'
import MobileAudioPanel from '../components/MobileAudioPanel'
import MobileAudioTrackStrip from '../components/MobileAudioTrackStrip'
import StopAudioOnPageChange from '../components/StopAudioOnPageChange'
import { PdfDocumentProvider } from '../context/PdfDocumentContext'
import { getAudioTracksForPage, getTotalPages } from '../data/bookAudio'
import { getBook, isValidBookId } from '../data/books'
import { saveReadingPage } from '../hooks/useReadingProgress'

function ReaderLayout({ bookId, pageNum }) {
  const book = getBook(bookId)

  useEffect(() => {
    saveReadingPage(bookId, pageNum)
  }, [bookId, pageNum])

  const audioTracks = getAudioTracksForPage(bookId, pageNum)

  const pdfView = useMemo(
    () => (
      <PdfDocumentProvider pdfPath={book.pdfPath} loadingLabel={`Đang mở ${book.shortTitle}…`}>
        <PdfPane bookId={bookId} pageNum={pageNum} />
      </PdfDocumentProvider>
    ),
    [book.pdfPath, book.shortTitle, bookId, pageNum],
  )

  return (
    <>
      <StopAudioOnPageChange pageNum={pageNum} />

      <div className="flex h-full min-h-0 flex-col lg:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:border-r lg:border-slate-200">
          {pdfView}
        </div>

        <AudioSidebar bookId={bookId} pageNum={pageNum} />
      </div>

      <MobileAudioPanel bookId={bookId} tracks={audioTracks} />
      <MobileAudioTrackStrip bookId={bookId} tracks={audioTracks} />
    </>
  )
}

export default function ReaderPage() {
  const { bookId, page: pageParam } = useParams()

  if (!isValidBookId(bookId)) {
    return <Navigate to="/read/textbook/1" replace />
  }

  if (pageParam && !/^\d+$/.test(pageParam)) {
    return <Navigate to={`/read/${bookId}/1`} replace />
  }

  const pageNum = Number(pageParam)
  const totalPages = getTotalPages(bookId)

  if (!pageParam || !Number.isInteger(pageNum) || pageNum < 1 || pageNum > totalPages) {
    return <Navigate to={`/read/${bookId}/1`} replace />
  }

  return <ReaderLayout bookId={bookId} pageNum={pageNum} />
}
