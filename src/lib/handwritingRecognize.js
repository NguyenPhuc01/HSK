const HAS_HAN = /\p{Script=Han}/u

const ENDPOINT =
  'https://inputtools.google.com/request?ime=handwriting&app=demopage&cs=1&ie=utf-8&oe=utf-8'

/**
 * @param {{ width: number, height: number, strokes: { x: number, y: number }[][] }} ink
 * @param {{ signal?: AbortSignal, maxResults?: number }} [opts]
 * @returns {Promise<string[]>}
 */
export async function recognizeHandwriting(ink, opts = {}) {
  const { signal, maxResults = 10 } = opts
  if (!ink?.strokes?.length) return []

  const payload = {
    options: 'enable_pre_space',
    requests: [
      {
        writing_guide: {
          writing_area_width: Math.max(1, Math.round(ink.width)),
          writing_area_height: Math.max(1, Math.round(ink.height)),
        },
        language: 'zh_CN',
        max_num_results: maxResults,
        ink: ink.strokes.map((stroke) => [
          stroke.map((p) => Math.round(p.x)),
          stroke.map((p) => Math.round(p.y)),
          [],
        ]),
      },
    ],
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })

  if (!res.ok) {
    throw new Error(`Handwriting API HTTP ${res.status}`)
  }

  const data = await res.json()
  if (!Array.isArray(data) || data[0] !== 'SUCCESS') {
    throw new Error('Handwriting recognition failed')
  }

  const raw = data[1]?.[0]?.[1]
  if (!Array.isArray(raw)) return []

  const seen = new Set()
  const out = []
  for (const item of raw) {
    const text = String(item || '').trim()
    if (!text || seen.has(text)) continue
    // Prefer strings that contain at least one Han character
    if (![...text].some((ch) => HAS_HAN.test(ch))) continue
    seen.add(text)
    out.push(text)
    if (out.length >= maxResults) break
  }
  return out
}
