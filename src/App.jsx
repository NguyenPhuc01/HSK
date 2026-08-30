import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { AudioProvider } from './context/AudioContext'
import { SidebarProvider } from './context/SidebarContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ReaderPage from './pages/ReaderPage'
import { textbookSections } from './data/textbookSections'

export default function App() {
  return (
    <AudioProvider>
      <SidebarProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/read" element={<Navigate to="/read/1" replace />} />
              <Route path="/read/:page" element={<ReaderPage />} />
              <Route path="/lesson/:id" element={<LessonRedirect />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </AudioProvider>
  )
}

function LessonRedirect() {
  const { id } = useParams()
  const section = textbookSections.find((s) => s.lessonId === Number(id))
  return <Navigate to={`/read/${section?.startPage ?? 1}`} replace />
}
