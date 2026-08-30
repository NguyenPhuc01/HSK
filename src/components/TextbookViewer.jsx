import { memo, useCallback, useState } from 'react'
import { Page } from 'react-pdf'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import { useIsMobile } from '../hooks/useMediaQuery'
import { usePdfDocument } from '../context/PdfDocumentContext'
import MobilePdfViewer from './MobilePdfViewer'
import NativePdfFallback from './NativePdfFallback'

function TextbookViewer({ page = 1, totalPages = 143, onPageChange }) {
  const isMobile = useIsMobile()
  const { numPages } = usePdfDocument()
  const [scale, setScale] = useState(1)
  const [useFallback, setUseFallback] = useState(false)

  const maxPage = numPages ?? totalPages

  const goPrev = useCallback(() => onPageChange?.(page - 1), [page, onPageChange])
  const goNext = useCallback(() => onPageChange?.(page + 1), [page, onPageChange])

  if (isMobile) {
    return <MobilePdfViewer page={page} totalPages={totalPages} onPageChange={onPageChange} />
  }

  if (useFallback) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-200 bg-white px-4 py-3">
          <p className="text-sm font-semibold text-slate-800">Trang {page} / {totalPages}</p>
        </div>
        <div className="flex-1">
          <NativePdfFallback page={page} totalPages={totalPages} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-100">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-2 md:px-4">
        <p className="text-sm font-semibold text-slate-800">Trang {page} / {maxPage}</p>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setScale((s) => Math.max(0.6, s - 0.1))} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Thu nhỏ">
            <ZoomOut size={16} />
          </button>
          <span className="w-10 text-center text-xs font-medium text-slate-500">{Math.round(scale * 100)}%</span>
          <button type="button" onClick={() => setScale((s) => Math.min(2, s + 0.1))} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Phóng to">
            <ZoomIn size={16} />
          </button>
          <div className="mx-1 h-5 w-px bg-slate-200" />
          <button type="button" onClick={goPrev} disabled={page <= 1} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40" aria-label="Trang trước">
            <ChevronLeft size={18} />
          </button>
          <input type="number" min={1} max={maxPage} value={page} onChange={(e) => { const n = Number(e.target.value); if (n >= 1 && n <= maxPage) onPageChange?.(n) }} className="w-12 rounded border border-slate-200 px-1 py-1 text-center text-xs" aria-label="Số trang" />
          <button type="button" onClick={goNext} disabled={page >= maxPage} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40" aria-label="Trang sau">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto w-fit pb-4">
          <Page
            key={page}
            pageNumber={page}
            scale={scale}
            className="shadow-lg"
            renderTextLayer={false}
            renderAnnotationLayer={false}
            onRenderError={() => setUseFallback(true)}
          />
        </div>
      </div>
    </div>
  )
}

export default memo(TextbookViewer)
