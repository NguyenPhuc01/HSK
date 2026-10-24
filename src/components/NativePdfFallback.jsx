import { usePdfDocument } from '../context/PdfDocumentContext'

/** Fallback khi react-pdf lỗi trên mobile — dùng trình xem PDF native */
export default function NativePdfFallback({ page, totalPages }) {
  const { pdfPath } = usePdfDocument()
  const src = `${pdfPath}${pdfPath.includes('#') ? '' : `#page=${page}`}`

  return (
    <div className="flex h-full w-full flex-col">
      <p className="border-b border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs text-amber-800">
        Chế độ xem PDF native · Trang {page}/{totalPages}
      </p>
      <object data={src} type="application/pdf" className="min-h-0 w-full flex-1">
        <iframe src={src} title={`Trang ${page}`} className="h-full w-full border-0" />
      </object>
    </div>
  )
}
