/** Fallback khi react-pdf lỗi trên mobile — dùng trình xem PDF native */
export default function NativePdfFallback({ page, totalPages }) {
  return (
    <div className="flex h-full w-full flex-col">
      <p className="border-b border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs text-amber-800">
        Chế độ xem PDF native · Trang {page}/{totalPages}
      </p>
      <object
        data={`/textbook.pdf#page=${page}`}
        type="application/pdf"
        className="min-h-0 flex-1 w-full"
      >
        <iframe
          src={`/textbook.pdf#page=${page}`}
          title={`Trang ${page}`}
          className="h-full w-full border-0"
        />
      </object>
    </div>
  )
}
