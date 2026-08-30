import { pdfjs } from 'react-pdf'

// Worker dùng chung — tránh load nhiều lần
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export { pdfjs }
