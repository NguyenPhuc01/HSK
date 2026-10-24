import { createContext, memo, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Document } from 'react-pdf'
import '../lib/pdfSetup'

const PdfContext = createContext(null)

/** Tải đủ file một lần (200), tránh Range request — SW cache ổn định hơn. */
const PDF_DOCUMENT_OPTIONS = {
  isEvalSupported: false,
  useSystemFonts: true,
  disableRange: true,
  disableStream: true,
}

function PdfDocumentProviderInner({ pdfPath, loadingLabel = 'Đang mở sách…', children }) {
  const [numPages, setNumPages] = useState(null)
  const [error, setError] = useState(null)
  const [loadKey, setLoadKey] = useState(0)

  useEffect(() => {
    setNumPages(null)
    setError(null)
  }, [pdfPath])

  const ready = numPages !== null && !error

  const retry = useCallback(() => {
    setError(null)
    setNumPages(null)
    setLoadKey((k) => k + 1)
  }, [])

  const ctx = useMemo(
    () => ({ numPages, pdfReady: ready, pdfError: error, retryPdf: retry, pdfPath }),
    [numPages, ready, error, retry, pdfPath],
  )

  return (
    <PdfContext.Provider value={ctx}>
      <div className="flex h-full min-h-0 flex-col">
        {error && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-sm font-medium text-rose-700">Không tải được PDF</p>
            <p className="max-w-sm text-xs text-slate-500">
              Mạng yếu hoặc cache lỗi. Thử lại — nếu đã từng mở thành công, lần sau sẽ lấy từ bộ nhớ
              đệm nhanh hơn.
            </p>
            <button
              type="button"
              onClick={retry}
              className="rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Thử lại
            </button>
          </div>
        )}
        {!ready && !error && (
          <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
            {loadingLabel}
          </div>
        )}
        <Document
          key={`${pdfPath}::${loadKey}`}
          file={pdfPath}
          options={PDF_DOCUMENT_OPTIONS}
          loading={null}
          error={null}
          onLoadSuccess={({ numPages: n }) => {
            setError(null)
            setNumPages(n)
          }}
          onLoadError={(err) => {
            console.error('[pdf] load error', pdfPath, err)
            setNumPages(null)
            setError(err?.message || 'Failed to load PDF file.')
          }}
          onSourceError={(err) => {
            console.error('[pdf] source error', pdfPath, err)
            setNumPages(null)
            setError(err?.message || 'Failed to load PDF file.')
          }}
          className={ready ? 'flex h-full min-h-0 flex-col' : 'hidden'}
        >
          {ready ? children : null}
        </Document>
      </div>
    </PdfContext.Provider>
  )
}

export const PdfDocumentProvider = memo(PdfDocumentProviderInner)

export function usePdfDocument() {
  const ctx = useContext(PdfContext)
  if (!ctx) throw new Error('usePdfDocument must be used within PdfDocumentProvider')
  return ctx
}
