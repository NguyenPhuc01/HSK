import { getBook } from './books'
import { getManifestForBook } from './audioManifests'
import textbookRawMap from './pageAudioMap.json'
import workbookRawMap from './workbookPageAudioMap.json'

const DRAFT_KEYS = {
  textbook: 'hsk1-audio-map-draft-textbook',
  workbook: 'hsk1-audio-map-draft-workbook',
}

const builtInMaps = {
  textbook: textbookRawMap,
  workbook: workbookRawMap,
}

function loadBuiltInMap(bookId) {
  const raw = builtInMaps[bookId] ?? {}
  return Object.fromEntries(
    Object.entries(raw).map(([page, labels]) => [Number(page), labels]),
  )
}

function getPageAudioMap(bookId) {
  try {
    const draft = localStorage.getItem(DRAFT_KEYS[bookId])
    if (draft) {
      const parsed = JSON.parse(draft)
      return Object.fromEntries(
        Object.entries(parsed).map(([page, labels]) => [Number(page), labels]),
      )
    }
  } catch {
    /* ignore */
  }
  return loadBuiltInMap(bookId)
}

/** @deprecated — dùng getPageAudioMap(bookId) */
export const pageAudioMap = loadBuiltInMap('textbook')

export const TOTAL_PAGES = getBook('textbook').totalPages

export function getTotalPages(bookId) {
  return getBook(bookId).totalPages
}

function buildManifestLookup(bookId) {
  const manifest = getManifestForBook(bookId)
  const byLabel = Object.fromEntries(
    manifest.map(({ file }) => [file.replace('.mp3', ''), file]),
  )
  if (bookId === 'textbook') {
    byLabel['00-片头'] = '00 HSK标准教程1--片头.mp3'
  }
  return byLabel
}

function buildTrack(bookId, pageNum, label) {
  const manifestByLabel = buildManifestLookup(bookId)
  const file = manifestByLabel[label]
  if (!file) return null
  const trackLabel = /^\d{2}-/.test(label) ? label : file.replace('.mp3', '')
  return {
    id: `${bookId}-p${pageNum}-${trackLabel}`,
    audio: file,
    trackLabel,
    label: trackLabel,
    type: 'audio',
  }
}

export function getAudioTracksForPage(bookId, pageNum) {
  const labels = getPageAudioMap(bookId)[pageNum]
  if (!labels?.length) return []
  return labels.map((label) => buildTrack(bookId, pageNum, label)).filter(Boolean)
}

export function pageHasAudio(bookId, pageNum) {
  return (getPageAudioMap(bookId)[pageNum]?.length ?? 0) > 0
}

export function getAllTrackLabelsFromManifest(bookId) {
  return getManifestForBook(bookId).map(({ file }) => {
    if (file.startsWith('00')) return '00-片头'
    return file.replace('.mp3', '')
  })
}
