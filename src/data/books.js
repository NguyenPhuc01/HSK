/**
 * pdfVersion: tăng số này khi thay file PDF trong /public
 * → URL đổi (?v=) → service worker lấy bản mới, không kẹt cache cũ.
 */
export const BOOKS = {
  textbook: {
    id: 'textbook',
    title: 'Sách giáo trình',
    shortTitle: 'Giáo trình',
    subtitle: 'HSK Standard Course 1',
    pdfPath: '/textbook.pdf',
    pdfVersion: '1',
    audioDir: '/audio',
    totalPages: 143,
    drivePdfId: '1KAtFbofFT2Tx_HWCfR64365k62VKNGS4',
    driveFolderUrl: 'https://drive.google.com/drive/folders/1p0Ga8BeHtZOm3sLZigODJNynWuFASieQ',
  },
  workbook: {
    id: 'workbook',
    title: 'Sách bài tập',
    shortTitle: 'Bài tập',
    subtitle: 'HSK 1 Workbook',
    pdfPath: '/workbook.pdf',
    pdfVersion: '1',
    audioDir: '/audio/workbook',
    totalPages: 137,
    drivePdfId: '1BFN-Ebu_GxyVgV9_xBYVMjKsgTt0plLr',
    driveFolderUrl: 'https://drive.google.com/drive/folders/1oBwBq8SdrOU1tynaS4f-uFC95PL30uoZ',
  },
}

export const BOOK_LIST = [BOOKS.textbook, BOOKS.workbook]

export function getBook(bookId) {
  return BOOKS[bookId] ?? BOOKS.textbook
}

/** URL PDF có version — dùng cho Document / cache. */
export function getPdfUrl(book) {
  const path = book?.pdfPath ?? '/textbook.pdf'
  const version = book?.pdfVersion ?? '1'
  return `${path}?v=${encodeURIComponent(version)}`
}

export function isValidBookId(bookId) {
  return bookId in BOOKS
}
