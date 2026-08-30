const STORAGE_PREFIX = 'hsk1-last-page'

function storageKey(bookId = 'textbook') {
  return `${STORAGE_PREFIX}-${bookId}`
}

export function saveReadingPage(bookId, page) {
  try {
    localStorage.setItem(storageKey(bookId), String(page))
    localStorage.setItem(`${STORAGE_PREFIX}-last-book`, bookId)
  } catch {
    /* ignore */
  }
}

export function loadReadingPage(bookId = 'textbook') {
  try {
    const raw = localStorage.getItem(storageKey(bookId))
    const page = Number(raw)
    return Number.isInteger(page) && page >= 1 ? page : 1
  } catch {
    return 1
  }
}

export function loadLastBookId() {
  try {
    return localStorage.getItem(`${STORAGE_PREFIX}-last-book`) || 'textbook'
  } catch {
    return 'textbook'
  }
}
