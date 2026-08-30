import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Page } from 'react-pdf'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { usePdfDocument } from '../context/PdfDocumentContext'
import NativePdfFallback from './NativePdfFallback'

function MobilePdfViewer({ page, totalPages, onPageChange }) {
  const { numPages } = usePdfDocument()
  const containerRef = useRef(null)
  const [pageHeight, setPageHeight] = useState(null)
  const [useFallback, setUseFallback] = useState(false)
  const [renderedPages, setRenderedPages] = useState(() => new Set())

  const maxPage = numPages ?? totalPages

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setPageHeight(containerRef.current.clientHeight)
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const goTo = useCallback(
    (next) => {
      if (next >= 1 && next <= maxPage && next !== page) {
        onPageChange?.(next)
      }
    },
    [maxPage, page, onPageChange],
  )

  const showPageLoading = !renderedPages.has(page)

  if (useFallback) {
    return (
      <div className="flex h-full flex-col bg-slate-100">
        <MobileHeader page={page} maxPage={maxPage} goTo={goTo} />
        <div className="min-h-0 flex-1">
          <NativePdfFallback page={page} totalPages={maxPage} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-100">
      <MobileHeader page={page} maxPage={maxPage} goTo={goTo} />

      <div
        ref={containerRef}
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-2 py-2"
      >
        {showPageLoading && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <p className="rounded-full bg-white/90 px-4 py-2 text-sm text-slate-500 shadow">
              Đang tải trang {page}…
            </p>
          </div>
        )}

        {pageHeight && (
          <Page
            key={page}
            pageNumber={page}
            height={pageHeight}
            className="shadow-lg"
            renderTextLayer={false}
            renderAnnotationLayer={false}
            onRenderSuccess={() => {
              setRenderedPages((prev) => new Set(prev).add(page))
            }}
            onRenderError={() => setUseFallback(true)}
          />
        )}
      </div>
    </div>
  )
}

function MobileHeader({ page, maxPage, goTo }) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-2 py-2">
      <button
        type="button"
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className="rounded-lg p-2 text-slate-600 disabled:opacity-30 active:bg-slate-100"
        aria-label="Trang trước"
      >
        <ChevronLeft size={22} />
      </button>
      <div className="text-center">
        <p className="text-sm font-bold text-slate-800">
          Trang {page} / {maxPage}
        </p>
        <p className="text-[11px] text-slate-400">Dùng nút ← → để chuyển trang</p>
      </div>
      <button
        type="button"
        onClick={() => goTo(page + 1)}
        disabled={page >= maxPage}
        className="rounded-lg p-2 text-slate-600 disabled:opacity-30 active:bg-slate-100"
        aria-label="Trang sau"
      >
        <ChevronRight size={22} />
      </button>
    </div>
  )
}

export default memo(MobilePdfViewer)
