export const BOOKS = {
  textbook: {
    id: 'textbook',
    title: 'Sách giáo trình',
    shortTitle: 'Giáo trình',
    subtitle: 'HSK Standard Course 1',
    pdfPath: '/textbook.pdf',
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

export function isValidBookId(bookId) {
  return bookId in BOOKS
}
