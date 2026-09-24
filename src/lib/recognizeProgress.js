export const STORAGE_KEY = 'hsk-recognize-progress-v1'

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return parsed
  } catch {
    return {}
  }
}

export function saveProgress(map) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

export function effectiveStrength(progress, id) {
  const row = progress[id]
  if (!row) return -1
  return typeof row.strength === 'number' ? row.strength : -1
}

export function recordAnswer(progress, id, correct, now = Date.now()) {
  const prev = progress[id] ?? { strength: 0, wrongStreak: 0, lastSeen: 0 }
  const strength = correct
    ? Math.min(5, (prev.strength ?? 0) + 1)
    : Math.max(0, (prev.strength ?? 0) - 1)
  const wrongStreak = correct ? 0 : (prev.wrongStreak ?? 0) + 1
  return {
    ...progress,
    [id]: { strength, wrongStreak, lastSeen: now },
  }
}

function shuffleInPlace(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** Sort by ascending effective strength; shuffle within same strength band. */
export function buildSessionQueue(vocab, progress, size, rng = Math.random) {
  const byStrength = new Map()
  for (const entry of vocab) {
    const s = effectiveStrength(progress, entry.id)
    if (!byStrength.has(s)) byStrength.set(s, [])
    byStrength.get(s).push(entry)
  }
  const strengths = [...byStrength.keys()].sort((a, b) => a - b)
  const ordered = []
  for (const s of strengths) {
    ordered.push(...shuffleInPlace(byStrength.get(s), rng))
  }
  return ordered.slice(0, Math.min(size, ordered.length))
}
