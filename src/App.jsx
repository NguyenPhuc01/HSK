import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { AudioProvider } from './context/AudioContext'
import { SidebarProvider } from './context/SidebarContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ReaderPage from './pages/ReaderPage'
import AudioMapAdminPage from './pages/AudioMapAdminPage'
import { loadReadingPage } from './hooks/useReadingProgress'
import { textbookSections } from './data/textbookSections'

export default function App() {
  return (
    <AudioProvider>
      <SidebarProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/admin/audio-map" element={<AudioMapAdminPage />} />
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/read" element={<ResumeRedirect />} />
              <Route path="/read/:page" element={<ReaderPage />} />
              <Route path="/lesson/:id" element={<LessonRedirect />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </AudioProvider>
  )
}

function ResumeRedirect() {
  const saved = loadReadingPage()
  return <Navigate to={`/read/${saved}`} replace />
}

function LessonRedirect() {
  const { id } = useParams()
  const section = textbookSections.find((s) => s.lessonId === Number(id))
  return <Navigate to={`/read/${section?.startPage ?? loadReadingPage()}`} replace />
}
