import { useEffect, useState } from 'react'
import { Download, Share, X } from 'lucide-react'

const DISMISS_KEY = 'hsk1-pwa-install-dismissed'

function isStandaloneMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function isIosSafari() {
  const ua = window.navigator.userAgent
  return /iphone|ipad|ipod/i.test(ua) && !window.navigator.standalone
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showAndroid, setShowAndroid] = useState(false)
  const [showIos, setShowIos] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY) || isStandaloneMode()) return undefined

    if (isIosSafari()) {
      setShowIos(true)
      return undefined
    }

    const onBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowAndroid(true)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setShowAndroid(false)
    setShowIos(false)
  }

  const install = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setShowAndroid(false)
  }

  if (!showAndroid && !showIos) return null

  return (
    <div className="fixed bottom-20 left-3 right-3 z-50 mx-auto max-w-md rounded-xl border border-teal-200 bg-white p-4 shadow-lg lg:bottom-24 lg:left-auto lg:right-6">
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-2 top-2 rounded-full p-1 text-slate-400 hover:bg-slate-100"
        aria-label="Đóng"
      >
        <X size={16} />
      </button>

      {showIos ? (
        <>
          <p className="pr-6 text-sm font-semibold text-slate-800">Thêm HSK1 vào màn hình chính</p>
          <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
            <Share size={14} className="mt-0.5 shrink-0 text-teal-600" />
            Nhấn <strong>Chia sẻ</strong> → <strong>Thêm vào Màn hình chính</strong> để mở như app.
          </p>
        </>
      ) : (
        <>
          <p className="pr-6 text-sm font-semibold text-slate-800">Cài app HSK1 lên màn hình</p>
          <p className="mt-1 text-xs text-slate-500">
            Mở nhanh như app native — phù hợp học trên điện thoại.
          </p>
          <button
            type="button"
            onClick={install}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700"
          >
            <Download size={14} />
            Cài đặt
          </button>
        </>
      )}
    </div>
  )
}
