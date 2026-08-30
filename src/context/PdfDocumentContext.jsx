import { createContext, memo, useContext, useRef, useState } from 'react'
import { Document } from 'react-pdf'
import '../lib/pdfSetup'

const PdfContext = createContext(null)

function PdfDocumentProviderInner({ pdfPath, loadingLabel = 'Đang mở sách…', children }) {
  const [numPages, setNumPages] = useState(null)
  const readyRef = useRef(false)

  const ready = readyRef.current || numPages !== null

  return (
    <PdfContext.Provider value={{ numPages, pdfReady: ready }}>
      <div className="flex h-full min-h-0 flex-col">
        {!ready && (
          <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
            {loadingLabel}
          </div>
        )}
        <Document
          key={pdfPath}
          file={pdfPath}
          onLoadSuccess={({ numPages: n }) => {
            readyRef.current = true
            setNumPages(n)
          }}
          className={ready ? 'flex h-full min-h-0 flex-col' : 'hidden'}
          options={{ isEvalSupported: false, useSystemFonts: true }}
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
