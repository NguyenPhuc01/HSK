import { pinyin } from 'pinyin-pro'

/** Bỏ khoảng trắng và dấu câu để so khớp biến thể. */
export function normalizeZh(text) {
  return String(text ?? '')
    .trim()
    .replace(/\s+/g, '')
    .replace(/[。．\.？\?！!，,、；;：:\s]/g, '')
}

/** Người/đi cùng hay gặp — tránh nuốt luôn động từ (朋友去…). */
const COMPANION_WHO =
  '大学同学|同学|朋友|老师|妈妈|爸爸|先生|小姐|儿子|女儿|你们|我们|孩子|妈|爸|他|她|你|我'

function addCompanionVariants(forms) {
  const re = new RegExp(`([跟和])(${COMPANION_WHO})(一起)?`, 'g')
  const extra = []
  for (const f of forms) {
    let m
    re.lastIndex = 0
    while ((m = re.exec(f)) !== null) {
      const [full, prep, who] = m
      const other = prep === '跟' ? '和' : '跟'
      const before = f.slice(0, m.index)
      const after = f.slice(m.index + full.length)
      for (const mid of [`${prep}${who}`, `${prep}${who}一起`, `${other}${who}`, `${other}${who}一起`]) {
        extra.push(before + mid + after)
      }
    }
  }
  for (const x of extra) forms.add(x)
}

/**
 * Sinh biến thể tự nhiên HSK1 — answers chỉ cần 1–2 dạng chính.
 */
export function expandAnswerVariants(normalized) {
  const forms = new Set([normalized])
  if (!normalized) return forms

  for (let round = 0; round < 3; round++) {
    const snapshot = [...forms]
    if (snapshot.length > 64) break

    for (const f of snapshot) {
      if (f.includes('吃米饭')) forms.add(f.replaceAll('吃米饭', '吃饭'))
      if (f.includes('吃饭')) forms.add(f.replaceAll('吃饭', '吃米饭'))
      if (f.includes('买米饭')) forms.add(f.replaceAll('买米饭', '买饭'))
      if (f.includes('买饭') && !f.includes('买米饭')) forms.add(f.replaceAll('买饭', '买米饭'))

      if (f.includes('一点儿')) forms.add(f.replaceAll('一点儿', '一点'))
      if (f.includes('一点') && !f.includes('一点儿')) forms.add(f.replaceAll('一点', '一点儿'))

      forms.add(f.replace(/(我|你|他|她|我们|你们)的/g, '$1'))

      if (f.endsWith('了') && f.length > 2) forms.add(f.slice(0, -1))
      else if (!/[吗呢吧啊了]$/.test(f)) forms.add(`${f}了`)
    }

    addCompanionVariants(forms)
  }

  return forms
}

export function checkTranslation(input, answers) {
  const normalized = normalizeZh(input)
  if (!normalized) return false
  const inputSet = expandAnswerVariants(normalized)
  return answers.some((a) => {
    const answerSet = expandAnswerVariants(normalizeZh(a))
    for (const v of inputSet) {
      if (answerSet.has(v)) return true
    }
    return false
  })
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
