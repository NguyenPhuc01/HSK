import { useCallback, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, ExternalLink } from 'lucide-react'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

const DRIVE_PREVIEW =
  'https://drive.google.com/file/d/1KAtFbofFT2Tx_HWCfR64365k62VKNGS4/preview'

export default function TextbookViewer({ page = 1, totalPages = 143, onPageChange }) {
  const [scale, setScale] = useState(1)
  const [numPages, setNumPages] = useState(null)
  const [pdfError, setPdfError] = useState(false)

  const maxPage = numPages ?? totalPages

  const goPrev = useCallback(() => onPageChange?.(page - 1), [page, onPageChange])
  const goNext = useCallback(() => onPageChange?.(page + 1), [page, onPageChange])

  if (pdfError) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-200 bg-white px-4 py-3">
          <p className="text-sm font-semibold text-slate-800">Trang {page} / {totalPages}</p>
        </div>
        <iframe
          src={DRIVE_PREVIEW}
          title="HSK1 Giáo trình"
          className="h-full min-h-[60vh] w-full flex-1 border-0"
          allow="autoplay"
        />
        <p className="border-t border-slate-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
          Chưa có file PDF local. Chạy{' '}
          <code className="rounded bg-amber-100 px-1">npm run download-textbook</code>
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-2 md:px-4">
        <p className="text-sm font-semibold text-slate-800">
          Trang {page} / {maxPage}
        </p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(0.6, s - 0.1))}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Thu nhỏ"
          >
            <ZoomOut size={16} />
          </button>
          <span className="w-10 text-center text-xs font-medium text-slate-500">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(2, s + 0.1))}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Phóng to"
          >
            <ZoomIn size={16} />
          </button>
          <div className="mx-1 h-5 w-px bg-slate-200" />
          <button
            type="button"
            onClick={goPrev}
            disabled={page <= 1}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            aria-label="Trang trước"
          >
            <ChevronLeft size={18} />
          </button>
          <input
            type="number"
            min={1}
            max={maxPage}
            value={page}
            onChange={(e) => {
              const n = Number(e.target.value)
              if (n >= 1 && n <= maxPage) onPageChange?.(n)
            }}
            className="w-12 rounded border border-slate-200 px-1 py-1 text-center text-xs"
            aria-label="Số trang"
          />
          <button
            type="button"
            onClick={goNext}
            disabled={page >= maxPage}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            aria-label="Trang sau"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 md:p-6">
        <div className="mx-auto w-fit">
          <Document
            file="/textbook.pdf"
            onLoadSuccess={({ numPages: n }) => setNumPages(n)}
            onLoadError={() => setPdfError(true)}
            loading={
              <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
                Đang tải giáo trình...
              </div>
            }
          >
            <Page
              key={page}
              pageNumber={page}
              scale={scale}
              className="shadow-lg"
              renderTextLayer
              renderAnnotationLayer
            />
          </Document>
        </div>
      </div>
    </div>
  )
}
