import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Eraser, Eye, EyeOff } from 'lucide-react'

const MIN_CELLS = 4
const EXPAND_MARGIN = 0.55

/**
 * Khung viết chữ Hán (touch / bút / chuột).
 * variant: "square" (1 chữ) | "strip" (dải ngang; giãn sau mỗi nét; cuộn bằng nút)
 * ref: { clear(), undoLastStroke(), toInkDataUrl(), getInk(), isBlank(), canUndo() }
 */
const HanziDrawPad = forwardRef(function HanziDrawPad(
  {
    char = '',
    variant = 'square',
    showOutline: showOutlineProp,
    onShowOutlineChange,
    showOutlineToggle = true,
    hideToolbar = false,
    onStrokesChange,
    className = '',
  },
  ref,
) {
  const isStrip = variant === 'strip'
  const scrollRef = useRef(null)
  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const currentStroke = useRef([])
  const strokesRef = useRef([])
  const dimsRef = useRef({ w: 280, h: 280 })
  const heightLockRef = useRef(null)
  const [dims, setDims] = useState({ w: 280, h: 280 })
  const [strokeCount, setStrokeCount] = useState(0)
  const [canPanLeft, setCanPanLeft] = useState(false)
  const [canPanRight, setCanPanRight] = useState(false)
  const [internalOutline, setInternalOutline] = useState(true)

  const showOutline = showOutlineProp ?? internalOutline
  const setShowOutline = onShowOutlineChange ?? setInternalOutline

  const applyPenStyle = useCallback((ctx, height) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#0f766e'
    ctx.lineWidth = Math.max(5, height * 0.032)
  }, [])

  const paintStroke = useCallback((ctx, stroke) => {
    if (!stroke?.length) return
    if (stroke.length < 2) {
      ctx.beginPath()
      ctx.arc(stroke[0].x, stroke[0].y, ctx.lineWidth / 2, 0, Math.PI * 2)
      ctx.fillStyle = ctx.strokeStyle
      ctx.fill()
      return
    }
    ctx.beginPath()
    ctx.moveTo(stroke[0].x, stroke[0].y)
    for (let i = 1; i < stroke.length; i += 1) {
      ctx.lineTo(stroke[i].x, stroke[i].y)
    }
    ctx.stroke()
  }, [])

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const { h } = dimsRef.current
    const ctx = canvas.getContext('2d')
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.restore()
    applyPenStyle(ctx, h)
    for (const stroke of strokesRef.current) paintStroke(ctx, stroke)
  }, [applyPenStyle, paintStroke])

  const syncBuffer = useCallback(
    (w, h) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      applyPenStyle(canvas.getContext('2d'), h)
      redraw()
    },
    [applyPenStyle, redraw],
  )

  const updatePanState = useCallback(() => {
    const el = scrollRef.current
    if (!el || !isStrip) {
      setCanPanLeft(false)
      setCanPanRight(false)
      return
    }
    const max = el.scrollWidth - el.clientWidth
    setCanPanLeft(el.scrollLeft > 2)
    setCanPanRight(el.scrollLeft < max - 2)
  }, [isStrip])

  const setCanvasDims = useCallback(
    (w, h) => {
      const next = { w: Math.round(w), h: Math.round(h) }
      const prev = dimsRef.current
      if (prev.w === next.w && prev.h === next.h) {
        updatePanState()
        return
      }
      dimsRef.current = next
      setDims(next)
      syncBuffer(next.w, next.h)
      requestAnimationFrame(updatePanState)
    },
    [syncBuffer, updatePanState],
  )

  const contentMaxX = useCallback(() => {
    let maxX = 0
    for (const stroke of strokesRef.current) {
      for (const p of stroke) maxX = Math.max(maxX, p.x)
    }
    return maxX
  }, [])

  /** Only call when NOT drawing — grow width to the right (coords stay valid). */
  const growAfterStroke = useCallback(() => {
    if (!isStrip) return
    const { w, h } = dimsRef.current
    const viewportW = scrollRef.current?.clientWidth || w
    const minW = Math.max(viewportW, Math.round(h * MIN_CELLS))
    const maxX = contentMaxX()
    const needed = Math.max(minW, Math.round(maxX + h * EXPAND_MARGIN + 12))
    if (needed > w) {
      setCanvasDims(needed, h)
    }
    // Bring empty space into view so the next character has room — after layout
    requestAnimationFrame(() => {
      const el = scrollRef.current
      if (!el) return
      const pad = h * 0.35
      const targetLeft = Math.max(0, maxX + pad - el.clientWidth * 0.65)
      const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth)
      el.scrollLeft = Math.min(maxScroll, targetLeft)
      updatePanState()
    })
  }, [contentMaxX, isStrip, setCanvasDims, updatePanState])

  const notifyStrokes = useCallback(() => {
    const count = strokesRef.current.length
    setStrokeCount(count)
    onStrokesChange?.(count)
  }, [onStrokesChange])

  const measureAndFit = useCallback(() => {
    if (drawing.current) return
    const viewport = scrollRef.current
    if (!viewport) return

    if (!isStrip) {
      const side = Math.min(Math.floor(viewport.clientWidth), 400)
      heightLockRef.current = null
      setCanvasDims(side, side)
      return
    }

    let h = heightLockRef.current
    if (h == null || strokesRef.current.length === 0) {
      h = Math.min(300, Math.max(240, Math.round(viewport.clientWidth * 0.72)))
      heightLockRef.current = h
    }
    const minW = Math.max(viewport.clientWidth, Math.round(h * MIN_CELLS))
    const needed = Math.max(minW, Math.round(contentMaxX() + h * EXPAND_MARGIN + 12))
    setCanvasDims(needed, h)
  }, [contentMaxX, isStrip, setCanvasDims])

  const panBy = useCallback(
    (dir) => {
      const el = scrollRef.current
      if (!el) return
      const step = dimsRef.current.h || 240
      el.scrollBy({ left: dir * step, behavior: 'smooth' })
      window.setTimeout(updatePanState, 220)
    },
    [updatePanState],
  )

  const clear = useCallback(() => {
    strokesRef.current = []
    currentStroke.current = []
    drawing.current = false
    notifyStrokes()
    if (scrollRef.current) scrollRef.current.scrollLeft = 0
    heightLockRef.current = null

    const viewport = scrollRef.current
    if (isStrip && viewport) {
      const h = Math.min(300, Math.max(240, Math.round(viewport.clientWidth * 0.72)))
      heightLockRef.current = h
      const minW = Math.max(viewport.clientWidth, Math.round(h * MIN_CELLS))
      dimsRef.current = { w: -1, h: -1 }
      setCanvasDims(minW, h)
    } else if (viewport) {
      const side = Math.min(Math.floor(viewport.clientWidth), 400)
      dimsRef.current = { w: -1, h: -1 }
      setCanvasDims(side, side)
    } else {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.restore()
      applyPenStyle(ctx, dimsRef.current.h)
    }
  }, [applyPenStyle, isStrip, notifyStrokes, setCanvasDims])

  const undoLastStroke = useCallback(() => {
    if (!strokesRef.current.length) return false
    strokesRef.current = strokesRef.current.slice(0, -1)
    notifyStrokes()
    redraw()
    return true
  }, [notifyStrokes, redraw])

  const toInkDataUrl = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const out = document.createElement('canvas')
    out.width = canvas.width
    out.height = canvas.height
    const ctx = out.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, out.width, out.height)
    ctx.drawImage(canvas, 0, 0)
    return out.toDataURL('image/png')
  }, [])

  const getInk = useCallback(() => {
    const { w, h } = dimsRef.current
    return {
      width: w,
      height: h,
      strokes: strokesRef.current.map((stroke) => stroke.map((p) => ({ x: p.x, y: p.y }))),
    }
  }, [])

  const isBlank = useCallback(() => strokesRef.current.length === 0, [])
  const canUndo = useCallback(() => strokesRef.current.length > 0, [])

  useImperativeHandle(
    ref,
    () => ({ clear, undoLastStroke, toInkDataUrl, getInk, isBlank, canUndo }),
    [clear, undoLastStroke, toInkDataUrl, getInk, isBlank, canUndo],
  )

  useEffect(() => {
    measureAndFit()
    const viewport = scrollRef.current
    if (!viewport || typeof ResizeObserver === 'undefined') return undefined
    const ro = new ResizeObserver(() => measureAndFit())
    ro.observe(viewport)
    return () => ro.disconnect()
  }, [measureAndFit])

  useEffect(() => {
    strokesRef.current = []
    currentStroke.current = []
    drawing.current = false
    setStrokeCount(0)
    onStrokesChange?.(0)
    heightLockRef.current = null
    if (scrollRef.current) scrollRef.current.scrollLeft = 0
    measureAndFit()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- char only
  }, [char])

  function pointFromEvent(e) {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const src = e.touches?.[0] ?? e.changedTouches?.[0] ?? e
    return {
      x: src.clientX - rect.left,
      y: src.clientY - rect.top,
    }
  }

  function startDraw(e) {
    e.preventDefault()
    drawing.current = true
    const p = pointFromEvent(e)
    currentStroke.current = [p]
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  function moveDraw(e) {
    if (!drawing.current) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const p = pointFromEvent(e)
    const stroke = currentStroke.current
    const prev = stroke[stroke.length - 1]
    stroke.push(p)
    // Never resize/scroll while drawing — that warps strokes
    if (prev) {
      applyPenStyle(ctx, dimsRef.current.h)
      ctx.beginPath()
      ctx.moveTo(prev.x, prev.y)
      ctx.lineTo(p.x, p.y)
      ctx.stroke()
    }
  }

  function endDraw(e) {
    if (!drawing.current) return
    e.preventDefault()
    drawing.current = false
    if (currentStroke.current.length) {
      strokesRef.current = [...strokesRef.current, currentStroke.current]
      notifyStrokes()
      growAfterStroke()
    }
    currentStroke.current = []
  }

  const cell = dims.h
  const guideCount = isStrip ? Math.max(MIN_CELLS, Math.ceil(dims.w / Math.max(cell, 1))) : 2

  return (
    <div className={`flex w-full max-w-md flex-col items-center gap-2 ${className}`}>
      <div
        ref={scrollRef}
        onScroll={updatePanState}
        className={`w-full max-w-[400px] rounded-2xl bg-white ring-1 ring-slate-200 ${
          isStrip ? 'overflow-x-hidden overflow-y-hidden' : 'overflow-hidden'
        }`}
      >
        <div className="relative touch-none" style={{ width: dims.w, height: dims.h }}>
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute inset-0 border border-slate-100" />
            <div className="absolute inset-x-0 top-1/2 h-px border-t border-dashed border-slate-200" />
            {isStrip ? (
              Array.from({ length: guideCount + 1 }, (_, i) => (
                <div
                  key={i}
                  className="absolute inset-y-0 w-px border-l border-dashed border-slate-200"
                  style={{ left: i * cell }}
                />
              ))
            ) : (
              <div className="absolute inset-y-0 left-1/2 w-px border-l border-dashed border-slate-200" />
            )}
          </div>

          {showOutline && char && !isStrip ? (
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
              aria-hidden
            >
              <span
                className="font-serif text-slate-200"
                style={{ fontSize: dims.h * 0.72, lineHeight: 1 }}
              >
                {char}
              </span>
            </div>
          ) : null}

          {showOutline && char && isStrip ? (
            <div
              className="pointer-events-none absolute top-0 left-0 flex items-center justify-center select-none"
              style={{ width: cell, height: cell }}
              aria-hidden
            >
              <span
                className="font-serif text-slate-200"
                style={{ fontSize: cell * 0.72, lineHeight: 1 }}
              >
                {char}
              </span>
            </div>
          ) : null}

          <canvas
            ref={canvasRef}
            className="absolute inset-0 z-10 touch-none"
            onPointerDown={startDraw}
            onPointerMove={moveDraw}
            onPointerUp={endDraw}
            onPointerCancel={endDraw}
          />
        </div>
      </div>

      {isStrip ? (
        <div className="flex w-full max-w-[400px] items-center justify-between gap-2 px-1">
          <button
            type="button"
            onClick={() => panBy(-1)}
            disabled={!canPanLeft}
            aria-label="Xem sang trái"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronLeft size={18} />
          </button>
          <p className="flex-1 text-center text-[11px] leading-snug text-slate-400">
            Viết xong một nét khung mới dài thêm. Dùng mũi tên để xem lại.
          </p>
          <button
            type="button"
            onClick={() => panBy(1)}
            disabled={!canPanRight}
            aria-label="Xem sang phải"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      ) : null}

      {!hideToolbar ? (
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            <Eraser size={14} />
            Xóa
          </button>
          {showOutlineToggle ? (
            <button
              type="button"
              onClick={() => setShowOutline(!showOutline)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              {showOutline ? <EyeOff size={14} /> : <Eye size={14} />}
              {showOutline ? 'Ẩn mẫu' : 'Hiện mẫu'}
            </button>
          ) : null}
        </div>
      ) : null}
      <span className="sr-only">{strokeCount} nét</span>
    </div>
  )
})

export default HanziDrawPad
