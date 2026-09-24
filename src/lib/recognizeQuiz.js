function shuffle(arr, rng) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** @returns {{ id: string, pinyin: string, meaningVi: string }[]} */
export function buildMeaningOptions(entry, pool, rng = Math.random) {
  const distractors = []
  const seenMeaning = new Set([entry.meaningVi])
  for (const other of shuffle(
    pool.filter((w) => w.id !== entry.id),
    rng,
  )) {
    if (seenMeaning.has(other.meaningVi)) continue
    seenMeaning.add(other.meaningVi)
    distractors.push(other)
    if (distractors.length >= 3) break
  }
  return shuffle([entry, ...distractors], rng).map((w) => ({
    id: w.id,
    pinyin: w.pinyin,
    meaningVi: w.meaningVi,
  }))
}
