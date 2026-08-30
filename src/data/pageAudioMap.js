import { audioManifest } from './audioManifest'
import rawMap from './pageAudioMap.json'

export const TOTAL_PAGES = 143

const STORAGE_KEY = 'hsk1-audio-map-draft'

function loadBuiltInMap() {
  return Object.fromEntries(
    Object.entries(rawMap).map(([page, labels]) => [Number(page), labels]),
  )
}

/** Ưu tiên draft từ /admin/audio-map, fallback JSON trong repo */
function getPageAudioMap() {
  try {
    const draft = localStorage.getItem(STORAGE_KEY)
    if (draft) {
      const parsed = JSON.parse(draft)
      return Object.fromEntries(
        Object.entries(parsed).map(([page, labels]) => [Number(page), labels]),
      )
    }
  } catch {
    /* ignore */
  }
  return loadBuiltInMap()
}

/** @deprecated dùng getPageAudioMap() — giữ cho admin so sánh bản gốc */
export const pageAudioMap = loadBuiltInMap()

const manifestByLabel = Object.fromEntries(
  audioManifest.map(({ file }) => {
    const label = file.replace('.mp3', '')
    return [label, file]
  }),
)

const labelAliases = {
  '00-片头': '00 HSK标准教程1--片头',
}

function resolveFile(label) {
  const key = labelAliases[label] ?? label
  return manifestByLabel[key]
}

function buildTrack(pageNum, label) {
  const file = resolveFile(label)
  if (!file) return null
  const trackLabel = /^\d{2}-\d/.test(label) ? label : file.replace('.mp3', '')
  return {
    id: `p${pageNum}-${trackLabel}`,
    audio: file,
    trackLabel,
    label: trackLabel,
    type: 'audio',
  }
}

export function getAudioTracksForPage(pageNum) {
  const labels = getPageAudioMap()[pageNum]
  if (!labels?.length) return []
  return labels.map((label) => buildTrack(pageNum, label)).filter(Boolean)
}

export function pageHasAudio(pageNum) {
  return (getPageAudioMap()[pageNum]?.length ?? 0) > 0
}

export function getAllTrackLabelsFromManifest() {
  return audioManifest.map(({ file }) => {
    if (file.startsWith('00')) return '00-片头'
    return file.replace('.mp3', '')
  })
}
