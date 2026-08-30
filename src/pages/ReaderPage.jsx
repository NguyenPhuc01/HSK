import { useEffect, useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import PdfPane from '../components/PdfPane'
import AudioSidebar from '../components/AudioSidebar'
import MobileAudioDock from '../components/MobileAudioDock'
import StopAudioOnPageChange from '../components/StopAudioOnPageChange'
import { PdfDocumentProvider } from '../context/PdfDocumentContext'
import { TOTAL_PAGES, getAudioTracksForPage } from '../data/pageAudioMap'
import { saveReadingPage } from '../hooks/useReadingProgress'

function ReaderLayout({ pageNum }) {
  useEffect(() => {
    saveReadingPage(pageNum)
  }, [pageNum])

  const audioTracks = getAudioTracksForPage(pageNum)

  // Khóa subtree PDF — không re-render khi audio state thay đổi
  const pdfView = useMemo(
    () => (
      <PdfDocumentProvider>
        <PdfPane pageNum={pageNum} />
      </PdfDocumentProvider>
    ),
    [pageNum],
  )

  return (
    <>
      <StopAudioOnPageChange pageNum={pageNum} />

      <div className="flex h-full min-h-0 flex-col lg:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:border-r lg:border-slate-200">
          {pdfView}
        </div>

        <AudioSidebar pageNum={pageNum} />
      </div>

      <MobileAudioDock tracks={audioTracks} />
    </>
  )
}

export default function ReaderPage() {
  const { page: pageParam } = useParams()

  if (pageParam && !/^\d+$/.test(pageParam)) {
    return <Navigate to="/read/1" replace />
  }

  const pageNum = Number(pageParam)

  if (!pageParam || !Number.isInteger(pageNum) || pageNum < 1 || pageNum > TOTAL_PAGES) {
    return <Navigate to="/read/1" replace />
  }

  return <ReaderLayout pageNum={pageNum} />
}
