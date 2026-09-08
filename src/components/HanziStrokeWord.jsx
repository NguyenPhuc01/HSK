import { useEffect, useRef, useState } from 'react'
import HanziWriter from 'hanzi-writer'
import { splitHanzi } from '../data/hsk1Vocab'

function charBoxSize(count) {
  if (typeof window === 'undefined') return count <= 1 ? 260 : 180
  const max = Math.min(window.innerWidth - 40, 560)
  const raw = Math.floor(max / Math.max(count, 1)) - 10
  if (count <= 1) return Math.min(280, raw)
  if (count === 2) return Math.min(220, raw)
  if (count === 3) return Math.min(168, raw)
  return Math.min(132, raw)
}

export default function HanziStrokeWord({ hanzi }) {
  const hostRef = useRef(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    const chars = splitHanzi(hanzi)
    if (!host || chars.length === 0) return undefined

    let cancelled = false
    const writers = []
    setFailed(false)
    host.innerHTML = ''

    const size = charBoxSize(chars.length)

    const run = async () => {
      let loadErrors = 0

      for (const char of chars) {
        const wrap = document.createElement('div')
        wrap.className = 'overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200'
        host.appendChild(wrap)

        const writer = HanziWriter.create(wrap, char, {
          width: size,
          height: size,
          padding: Math.max(8, Math.round(size * 0.06)),
          strokeAnimationSpeed: 1,
          delayBetweenStrokes: 180,
          delayBetweenLoops: 1200,
          strokeColor: '#0f766e',
          outlineColor: '#e2e8f0',
          radicalColor: '#0d9488',
          showCharacter: true,
          showOutline: true,
          onLoadCharDataError: () => {
            loadErrors += 1
          },
        })
        writers.push(writer)
      }

      await new Promise((r) => setTimeout(r, 500))
      if (cancelled) return
      if (loadErrors === chars.length) {
        setFailed(true)
        return
      }

      while (!cancelled) {
        for (const writer of writers) {
          if (cancelled) return
          try {
            writer.hideCharacter()
            await writer.animateCharacter()
          } catch {
            /* animation cancelled */
          }
        }
        if (cancelled) return
        await new Promise((r) => setTimeout(r, 1200))
      }
    }

    run()

    return () => {
      cancelled = true
      for (const writer of writers) {
        try {
          writer.pauseAnimation()
        } catch {
          /* ignore */
        }
      }
      host.innerHTML = ''
    }
  }, [hanzi])

  if (failed) {
    return (
      <p className="text-center font-serif leading-none text-teal-800" style={{ fontSize: 'clamp(4rem, 22vw, 7rem)' }}>
        {hanzi}
      </p>
    )
  }

  return (
    <div
      ref={hostRef}
      className="flex flex-wrap items-center justify-center gap-2"
      aria-label={`Cách viết ${hanzi}`}
    />
  )
}
