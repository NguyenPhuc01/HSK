import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import BottomAudioBar from './BottomAudioBar'
import AudioKeyboardListener from './AudioKeyboardListener'
import { useSidebar } from '../context/SidebarContext'

export default function Layout() {
  const { open, isOpen, close } = useSidebar()

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-100">
      {/* Desktop sidebar */}
      <aside className="hidden h-full w-64 shrink-0 border-r border-slate-200 bg-white lg:block xl:w-72">
        <Sidebar />
      </aside>

      {/* Mobile drawer overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={close}
            aria-label="Đóng menu"
          />
          <aside className="relative h-full w-72 max-w-[85vw] bg-white shadow-xl">
            <Sidebar onNavigate={close} />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile / tablet header */}
        <header className="safe-top safe-x flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={open}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Mở menu"
          >
            <Menu size={22} />
          </button>
          <div>
            <p className="text-sm font-bold text-slate-900">HSK 1 Reader</p>
            <p className="text-xs text-slate-500">Giáo trình + Audio</p>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>

      <BottomAudioBar />
      <AudioKeyboardListener />
    </div>
  )
}
