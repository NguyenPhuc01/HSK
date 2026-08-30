const STORAGE_KEY = 'hsk1-last-page'

export function saveReadingPage(page) {
  try {
    localStorage.setItem(STORAGE_KEY, String(page))
  } catch {
    // ignore quota / private mode
  }
}

export function loadReadingPage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const page = Number(raw)
    return Number.isInteger(page) && page >= 1 ? page : 1
  } catch {
    return 1
  }
}
