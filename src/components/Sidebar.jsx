import { useEffect, useRef } from 'react'
import { NavLink, useMatch } from 'react-router-dom'
import { BookOpen, ClipboardList, Languages, PenLine, ScanSearch, Volume2, X } from 'lucide-react'
import { pageHasAudio, getTotalPages } from '../data/bookAudio'
import { BOOK_LIST, getBook } from '../data/books'

export default function Sidebar({ onNavigate }) {
  const match = useMatch('/read/:bookId/:page')
  const vocabMatch = useMatch('/vocab/:hanzi')
  const writeMatch = useMatch('/write/:hanzi')
  const isVocab = Boolean(useMatch('/vocab') || vocabMatch)
  const isWrite = Boolean(useMatch('/write') || writeMatch)
  const isRecognize = Boolean(useMatch('/recognize'))
  const bookId = match?.params.bookId
  const currentPage = match ? Number(match.params.page) : null
  const book = getBook(bookId)
  const totalPages = getTotalPages(bookId ?? 'textbook')
  const pages = bookId ? Array.from({ length: totalPages }, (_, i) => i + 1) : []
  const activeRef = useRef(null)

  useEffect(() => {
    if (currentPage) {
      activeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [currentPage, bookId])

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition ${
      isActive
        ? 'bg-teal-600 font-semibold text-white shadow-sm'
        : 'text-slate-600 hover:bg-slate-100'
    }`

  function bookHref(id) {
    const page = currentPage && bookId === id ? currentPage : 1
    return `/read/${id}/${page}`
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/favicon.svg"
              alt=""
              className="h-10 w-10 rounded-xl shadow-md"
            />
            <div>
              <h1 className="text-sm font-bold text-slate-900">HSK 1 Reader</h1>
              <p className="text-xs text-slate-500">
                {isVocab
                  ? 'Từ vựng HSK'
                  : isWrite
                    ? 'Luyện viết'
                    : isRecognize
                      ? 'Nhận diện chữ'
                      : bookId
                        ? `${book.shortTitle} · ${totalPages} trang`
                        : 'Giáo trình + Học từ'}
              </p>
            </div>
          </div>
          {onNavigate && (
            <button
              type="button"
              onClick={onNavigate}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
              aria-label="Đóng"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <NavLink to="/" end className={linkClass} onClick={onNavigate}>
          <BookOpen size={16} />
          Trang chủ
        </NavLink>
        {BOOK_LIST.map((b) => (
          <NavLink
            key={b.id}
            to={bookHref(b.id)}
            className={() => linkClass({ isActive: bookId === b.id })}
            onClick={onNavigate}
          >
            {b.id === 'textbook' ? <BookOpen size={16} /> : <ClipboardList size={16} />}
            {b.shortTitle}
          </NavLink>
        ))}
        <NavLink to="/vocab" className={linkClass} onClick={onNavigate}>
          <Languages size={16} />
          Học từ
        </NavLink>
        <NavLink to="/write" className={linkClass} onClick={onNavigate}>
          <PenLine size={16} />
          Luyện viết
        </NavLink>
        <NavLink to="/recognize" className={linkClass} onClick={onNavigate}>
          <ScanSearch size={16} />
          Nhận diện chữ
        </NavLink>

        {bookId && (
          <p className="mb-1.5 mt-4 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            {book.title}
          </p>
        )}
        {isVocab && (
          <p className="mb-1.5 mt-4 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Học từ
          </p>
        )}
        {isWrite && (
          <p className="mb-1.5 mt-4 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Luyện viết
          </p>
        )}
        {isRecognize && (
          <p className="mb-1.5 mt-4 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Nhận diện chữ
          </p>
        )}

        {isVocab ? (
          <p className="px-3 py-2 text-sm leading-relaxed text-slate-500">
            HSK 1, HSK 2 và tên quốc gia — bấm một từ để xem chữ Hán, nét viết và pinyin.
          </p>
        ) : isWrite ? (
          <p className="px-3 py-2 text-sm leading-relaxed text-slate-500">
            Viết chữ Hán trên khung — app nhận diện rồi hiện pinyin và nghĩa tiếng Việt.
          </p>
        ) : isRecognize ? (
          <p className="px-3 py-2 text-sm leading-relaxed text-slate-500">
            Nhìn chữ Hán, chọn nghĩa tiếng Việt. Chữ hay sai sẽ hiện lại nhiều hơn.
          </p>
        ) : bookId ? (
          <div className="space-y-px">
            {pages.map((pageNum) => {
              const hasAudio = pageHasAudio(bookId, pageNum)
              const isActive = currentPage === pageNum

              return (
                <NavLink
                  key={pageNum}
                  to={`/read/${bookId}/${pageNum}`}
                  className={linkClass}
                  onClick={onNavigate}
                  ref={isActive ? activeRef : undefined}
                >
                  <span
                    className={`w-8 shrink-0 text-right font-mono text-xs tabular-nums ${
                      isActive ? 'text-teal-100' : 'text-slate-400'
                    }`}
                  >
                    {pageNum}
                  </span>
                  <span className="flex-1 truncate">Trang {pageNum}</span>
                  {hasAudio && (
                    <Volume2
                      size={13}
                      className={isActive ? 'text-teal-200' : 'text-teal-500 opacity-70'}
                    />
                  )}
                </NavLink>
              )
            })}
          </div>
        ) : null}
      </nav>
    </div>
  )
}
