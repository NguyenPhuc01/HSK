import { pinyin } from 'pinyin-pro'

/** Bỏ khoảng trắng và dấu câu để so khớp biến thể. */
export function normalizeZh(text) {
  return String(text ?? '')
    .trim()
    .replace(/\s+/g, '')
    .replace(/[。．\.？\?！!，,、；;：:\s]/g, '')
}

export function checkTranslation(input, answers) {
  const normalized = normalizeZh(input)
  if (!normalized) return false
  return answers.some((a) => normalizeZh(a) === normalized)
}

/** Chèn pinyin sau mỗi cụm chữ Hán trong công thức, vd. 几 → 几 (jǐ). */
export function annotateFormula(formula) {
  return String(formula ?? '').replace(/[\u3400-\u9fff]+/g, (hanzi) => {
    const py = pinyin(hanzi, {
      toneType: 'symbol',
      type: 'string',
      nonZh: 'consecutive',
    }).trim()
    return py ? `${hanzi} (${py})` : hanzi
  })
}

export function shuffleList(list, rng = Math.random) {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
