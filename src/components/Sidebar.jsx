import { useEffect, useRef } from 'react'
import { NavLink, useMatch } from 'react-router-dom'
import { BookOpen, ClipboardList, Volume2, X } from 'lucide-react'
import { pageHasAudio, getTotalPages } from '../data/bookAudio'
import { BOOK_LIST, getBook } from '../data/books'

export default function Sidebar({ onNavigate }) {
  const match = useMatch('/read/:bookId/:page')
  const bookId = match?.params.bookId ?? 'textbook'
  const currentPage = match ? Number(match.params.page) : null
  const book = getBook(bookId)
  const totalPages = getTotalPages(bookId)
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
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

  const bookTabClass = (id) =>
    `flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition ${
      bookId === id
        ? 'bg-teal-600 text-white shadow-sm'
        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
    }`

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-lg font-bold text-white shadow-md">
              中
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900">HSK 1 Reader</h1>
              <p className="text-xs text-slate-500">{book.shortTitle} · {totalPages} trang</p>
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

        <div className="mt-3 flex gap-1">
          {BOOK_LIST.map((b) => (
            <NavLink
              key={b.id}
              to={`/read/${b.id}/${currentPage && bookId === b.id ? currentPage : 1}`}
              className={bookTabClass(b.id)}
              onClick={onNavigate}
            >
              {b.id === 'textbook' ? <BookOpen size={14} /> : <ClipboardList size={14} />}
              {b.shortTitle}
            </NavLink>
          ))}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <NavLink to="/" end className={linkClass} onClick={onNavigate}>
          <BookOpen size={16} />
          Trang chủ
        </NavLink>

        <p className="mb-1.5 mt-4 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
          {book.title}
        </p>

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
      </nav>
    </div>
  )
}
