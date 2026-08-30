import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Page } from 'react-pdf'
import Tesseract from 'tesseract.js'
import { PdfDocumentProvider } from '../context/PdfDocumentContext'
import '../lib/pdfSetup'
import {
  TOTAL_PAGES,
  getAllTrackLabelsFromManifest,
  pageAudioMap,
} from '../data/pageAudioMap'
import rawMap from '../data/pageAudioMap.json'

const STORAGE_KEY = 'hsk1-audio-map-draft'

function labelsFromOcr(text) {
  const matches = text.match(/\b(0[0-9]|1[0-5])-(\d{1,2})\b/g) ?? []
  return [...new Set(matches)].sort()
}

function sortLabels(labels) {
  return [...labels].sort((a, b) => {
    const [la, na] = a.split('-')
    const [lb, nb] = b.split('-')
    if (la !== lb) return la.localeCompare(lb)
    return Number(na) - Number(nb)
  })
}

function loadDraft() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    /* ignore */
  }
  return { ...rawMap }
}

function AudioMapEditor() {
  const allLabels = useMemo(() => sortLabels(getAllTrackLabelsFromManifest()), [])
  const [map, setMap] = useState(loadDraft)
  const [page, setPage] = useState(1)
  const [scanning, setScanning] = useState(false)
  const [scanAllProgress, setScanAllProgress] = useState(null)
  const [pageWidth, setPageWidth] = useState(480)
  const pageWrapRef = useRef(null)

  const selected = useMemo(
    () => sortLabels(map[String(page)] ?? []),
    [map, page],
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  }, [map])

  useEffect(() => {
    const update = () => {
      if (pageWrapRef.current) {
        setPageWidth(Math.min(pageWrapRef.current.clientWidth - 16, 560))
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const setPageLabels = useCallback((pageNum, labels) => {
    setMap((prev) => {
      const next = { ...prev }
      const key = String(pageNum)
      if (labels.length) next[key] = sortLabels(labels)
      else delete next[key]
      return next
    })
  }, [])

  const toggleLabel = (label) => {
    const next = selected.includes(label)
      ? selected.filter((l) => l !== label)
      : [...selected, label]
    setPageLabels(page, next)
  }

  const scanCanvas = async (canvas) => {
    const { data } = await Tesseract.recognize(canvas, 'eng', {
      logger: () => {},
    })
    return labelsFromOcr(data.text)
  }

  const scanCurrentPage = async () => {
    const canvas = pageWrapRef.current?.querySelector('canvas')
    if (!canvas) return
    setScanning(true)
    try {
      const found = await scanCanvas(canvas)
      if (found.length) setPageLabels(page, found)
      else alert(`Không tìm thấy mã audio trên trang ${page}. Chọn thủ công bên phải.`)
    } finally {
      setScanning(false)
    }
  }

  const scanAllPages = async () => {
    if (!window.confirm('Quét OCR 143 trang (~5–15 phút). Tiếp tục?')) return

    setScanAllProgress({ current: 0, total: TOTAL_PAGES })
    const nextMap = { ...map }

    for (let p = 1; p <= TOTAL_PAGES; p += 1) {
      setScanAllProgress({ current: p, total: TOTAL_PAGES })
      setPage(p)

      await new Promise((r) => setTimeout(r, 600))

      const canvas = pageWrapRef.current?.querySelector('canvas')
      if (!canvas) continue

      try {
        const found = await scanCanvas(canvas)
        if (found.length) nextMap[String(p)] = found
        else delete nextMap[String(p)]
      } catch {
        /* skip failed page */
      }
    }

    setMap(nextMap)
    setScanAllProgress(null)
    alert('Quét xong! Kiểm tra vài trang mẫu rồi Export JSON.')
  }

  const exportJson = () => {
    const sorted = Object.fromEntries(
      Object.entries(map)
        .map(([k, v]) => [k, sortLabels(v)])
        .sort(([a], [b]) => Number(a) - Number(b)),
    )
    const blob = new Blob([JSON.stringify(sorted, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pageAudioMap.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importJson = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        setMap(JSON.parse(reader.result))
      } catch {
        alert('File JSON không hợp lệ')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const resetToBuiltIn = () => {
    if (window.confirm('Reset về file pageAudioMap.json gốc trong project?')) {
      localStorage.removeItem(STORAGE_KEY)
      setMap({ ...rawMap })
    }
  }

  const mappedCount = Object.keys(map).length
  const builtInCount = Object.keys(pageAudioMap).length

  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Map audio chính xác</h1>
            <p className="text-xs text-slate-500">
              Chọn đúng mã audio có icon đĩa trên từng trang · Draft: {mappedCount} trang ·
              Built-in: {builtInCount} trang
            </p>
          </div>
          <Link to="/read/1" className="text-sm text-teal-600 hover:underline">
            ← Về đọc sách
          </Link>
        </div>
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-3 p-3 lg:flex-row">
        {/* PDF */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg px-3 py-1.5 text-sm disabled:opacity-40"
              >
                ←
              </button>
              <span className="text-sm font-semibold">
                Trang {page} / {TOTAL_PAGES}
              </span>
              <button
                type="button"
                disabled={page >= TOTAL_PAGES}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg px-3 py-1.5 text-sm disabled:opacity-40"
              >
                →
              </button>
              <input
                type="number"
                min={1}
                max={TOTAL_PAGES}
                value={page}
                onChange={(e) => {
                  const n = Number(e.target.value)
                  if (n >= 1 && n <= TOTAL_PAGES) setPage(n)
                }}
                className="w-16 rounded border border-slate-200 px-2 py-1 text-center text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={scanCurrentPage}
                disabled={scanning || scanAllProgress}
                className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                {scanning ? 'Đang quét…' : 'OCR trang này'}
              </button>
              <button
                type="button"
                onClick={scanAllPages}
                disabled={scanning || scanAllProgress}
                className="rounded-lg border border-teal-600 px-3 py-1.5 text-xs font-semibold text-teal-700 disabled:opacity-50"
              >
                OCR 143 trang
              </button>
            </div>
          </div>

          {scanAllProgress && (
            <div className="shrink-0 bg-teal-50 px-3 py-2 text-center text-xs text-teal-800">
              Đang quét trang {scanAllProgress.current}/{scanAllProgress.total}…
            </div>
          )}

          <div
            ref={pageWrapRef}
            className="flex min-h-0 flex-1 items-start justify-center overflow-y-auto p-2"
          >
            <Page
              key={page}
              pageNumber={page}
              width={pageWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </div>

          {selected.length > 0 && (
            <div className="shrink-0 border-t border-slate-100 px-3 py-2 text-center text-sm text-teal-700">
              Trang {page}: {selected.join(', ')}
            </div>
          )}
        </div>

        {/* Track picker */}
        <div className="flex w-full shrink-0 flex-col rounded-xl border border-slate-200 bg-white lg:w-80">
          <div className="border-b border-slate-100 px-3 py-2">
            <p className="text-sm font-semibold text-slate-800">Chọn audio trên trang</p>
            <p className="text-xs text-slate-500">Tick đúng mã như icon đĩa trong sách</p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            <div className="flex flex-wrap gap-1.5">
              {allLabels.map((label) => {
                const on = selected.includes(label)
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleLabel(label)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      on
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="shrink-0 space-y-2 border-t border-slate-100 p-3">
            <button
              type="button"
              onClick={() => setPageLabels(page, [])}
              className="w-full rounded-lg border border-slate-200 py-2 text-xs text-slate-600"
            >
              Xóa audio trang {page}
            </button>
            <button
              type="button"
              onClick={exportJson}
              className="w-full rounded-lg bg-teal-600 py-2 text-xs font-bold text-white"
            >
              Export pageAudioMap.json
            </button>
            <label className="block w-full cursor-pointer rounded-lg border border-dashed border-slate-300 py-2 text-center text-xs text-slate-600">
              Import JSON
              <input type="file" accept=".json" className="hidden" onChange={importJson} />
            </label>
            <button
              type="button"
              onClick={resetToBuiltIn}
              className="w-full py-1 text-xs text-slate-400 hover:text-slate-600"
            >
              Reset về bản gốc
            </button>
            <p className="text-[10px] leading-relaxed text-slate-400">
              Sau Export: thay file{' '}
              <code className="text-slate-500">src/data/pageAudioMap.json</code> rồi reload app.
              OCR ~90% chính xác — nên kiểm tra trang có 2+ audio.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AudioMapAdminPage() {
  return (
    <PdfDocumentProvider>
      <AudioMapEditor />
    </PdfDocumentProvider>
  )
}
