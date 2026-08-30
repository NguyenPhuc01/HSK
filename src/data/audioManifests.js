import { audioManifest as textbookAudioManifest } from './audioManifest'
import { workbookAudioManifest } from './workbookAudioManifest'
import { getBook } from './books'

const manifests = {
  textbook: textbookAudioManifest,
  workbook: workbookAudioManifest,
}

export function getManifestForBook(bookId) {
  return manifests[bookId] ?? textbookAudioManifest
}

export function getAudioSrc(bookId, filename) {
  const book = getBook(bookId)
  return `${book.audioDir}/${filename}`
}

export function getAudioCount(bookId) {
  return getManifestForBook(bookId).length
}
