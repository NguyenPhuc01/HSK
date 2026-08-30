import { audioManifest } from './audioManifest'

export const TOTAL_PAGES = 143

/**
 * Map audio track → trang PDF (mỗi trang chỉ hiện đúng track in trên sách)
 * Format: { [pageNumber]: ['01-6', ...] }
 */
export const pageAudioMap = {
  5: ['00-片头'],
  8: ['01-1'],
  9: ['01-2'],
  10: ['01-3'],
  11: ['01-4'],
  12: ['01-5'],
  16: ['01-6'],
  17: ['01-7'],
  18: ['01-8'],
  19: ['01-9'],
  20: ['02-1'],
  21: ['02-2'],
  22: ['02-3'],
  23: ['02-4'],
  24: ['02-5'],
  25: ['02-6'],
  26: ['02-7'],
  27: ['02-8'],
  28: ['02-9'],
  29: ['02-10'],
  30: ['03-1'],
  31: ['03-2'],
  32: ['03-3'],
  33: ['03-4'],
  34: ['03-5'],
  35: ['03-6'],
  36: ['03-7'],
  37: ['04-1'],
  38: ['04-2'],
  39: ['04-3'],
  40: ['04-4'],
  41: ['04-5'],
  42: ['04-6'],
  43: ['04-7'],
  44: ['05-1'],
  45: ['05-2'],
  46: ['05-3'],
  47: ['05-4'],
  48: ['05-5'],
  49: ['05-6'],
  50: ['05-7'],
  51: ['05-8'],
  52: ['05-9'],
  53: ['05-10'],
  54: ['06-1'],
  55: ['06-2'],
  56: ['06-3'],
  57: ['06-4'],
  58: ['07-1'],
  59: ['07-2'],
  60: ['07-3'],
  61: ['07-4'],
  62: ['08-1'],
  63: ['08-2'],
  64: ['08-3'],
  65: ['08-4'],
  66: ['09-1'],
  67: ['09-2'],
  68: ['09-3'],
  69: ['09-4'],
  70: ['10-1'],
  71: ['10-2'],
  72: ['10-3'],
  73: ['10-4'],
  74: ['10-5'],
  75: ['10-6'],
  76: ['11-1'],
  77: ['11-2'],
  78: ['11-3'],
  79: ['11-4'],
  80: ['12-1'],
  81: ['12-2'],
  82: ['12-3'],
  83: ['12-4'],
  84: ['13-1'],
  85: ['13-2'],
  86: ['13-3'],
  87: ['13-4'],
  88: ['14-1'],
  89: ['14-2'],
  90: ['14-3'],
  91: ['14-4'],
  92: ['15-1'],
  93: ['15-2'],
  94: ['15-3'],
  95: ['15-4'],
}

const manifestByLabel = Object.fromEntries(
  audioManifest.map(({ file }) => {
    const label = file.replace('.mp3', '')
    return [label, file]
  }),
)

// Alias ngắn → tên file đầy đủ
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
  const trackLabel = label.includes('-') && /^\d{2}-\d/.test(label) ? label : file.replace('.mp3', '')
  return {
    id: `page${pageNum}-${trackLabel}`,
    audio: file,
    trackLabel,
    label: trackLabel,
    type: 'audio',
  }
}

export function getAudioTracksForPage(pageNum) {
  const labels = pageAudioMap[pageNum]
  if (!labels?.length) return []
  return labels.map((label) => buildTrack(pageNum, label)).filter(Boolean)
}

export function pageHasAudio(pageNum) {
  return (pageAudioMap[pageNum]?.length ?? 0) > 0
}
