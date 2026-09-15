import { useEffect, useMemo, useRef } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import PdfPane from '../components/PdfPane'
import AudioSidebar from '../components/AudioSidebar'
import MobileAudioPanel from '../components/MobileAudioPanel'
import MobileAudioTrackStrip from '../components/MobileAudioTrackStrip'
import { useAudio } from '../context/AudioContext'
import { PdfDocumentProvider } from '../context/PdfDocumentContext'
import { getAudioSrc } from '../data/audioManifests'
import { getAudioTracksForPage, getTotalPages } from '../data/bookAudio'
import { getBook, isValidBookId } from '../data/books'
import { saveReadingPage } from '../hooks/useReadingProgress'

function ReaderLayout({ bookId, pageNum }) {
  const book = getBook(bookId)
  const { stopTrack, selectTrack, activeTrack } = useAudio()
  const activeTrackRef = useRef(activeTrack)
  activeTrackRef.current = activeTrack
  const prevBookRef = useRef(bookId)

  useEffect(() => {
    saveReadingPage(bookId, pageNum)
  }, [bookId, pageNum])

  // Rời reader → dừng.
  useEffect(() => () => stopTrack(), [stopTrack])

  // Đổi sách → dừng. Đổi trang trong cùng sách → giữ session (audio xuyên nhiều trang).
  useEffect(() => {
    if (prevBookRef.current !== bookId) {
      prevBookRef.current = bookId
      stopTrack()
    }
  }, [bookId, stopTrack])

  // Chỉ auto-chọn track khi chưa có session; không ghi đè bài đang phát.
  useEffect(() => {
    if (activeTrackRef.current) return
    const tracks = getAudioTracksForPage(bookId, pageNum)
    if (tracks.length === 0) return
    const first = tracks[0]
    selectTrack(first.id, getAudioSrc(bookId, first.audio), first.trackLabel)
  }, [bookId, pageNum, selectTrack])

  const audioTracks = getAudioTracksForPage(bookId, pageNum)

  const pdfView = useMemo(
    () => (
      <PdfDocumentProvider pdfPath={book.pdfPath} loadingLabel={`Đang mở ${book.shortTitle}…`}>
        <PdfPane bookId={bookId} pageNum={pageNum} audioActive={Boolean(activeTrack)} />
      </PdfDocumentProvider>
    ),
    [book.pdfPath, book.shortTitle, bookId, pageNum, activeTrack],
  )

  return (
    <>
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
