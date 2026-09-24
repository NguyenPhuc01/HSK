import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { AudioProvider } from './context/AudioContext'
import { SidebarProvider } from './context/SidebarContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ReaderPage from './pages/ReaderPage'
import VocabListPage from './pages/VocabListPage'
import VocabStudyPage from './pages/VocabStudyPage'
import WritePracticePage from './pages/WritePracticePage'
import RecognizePage from './pages/RecognizePage'
import AudioMapAdminPage from './pages/AudioMapAdminPage'
import { loadLastBookId, loadReadingPage } from './hooks/useReadingProgress'
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
              <Route path="/vocab" element={<VocabListPage />} />
              <Route path="/vocab/:hanzi" element={<VocabStudyPage />} />
              <Route path="/write" element={<WritePracticePage />} />
              <Route path="/write/:hanzi" element={<WritePracticePage />} />
              <Route path="/recognize" element={<RecognizePage />} />
              <Route path="/read" element={<ResumeRedirect />} />
              <Route path="/read/:bookId/:page" element={<ReaderPage />} />
              <Route path="/read/:page" element={<LegacyReaderRedirect />} />
              <Route path="/lesson/:id" element={<LessonRedirect />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </AudioProvider>
  )
}

function ResumeRedirect() {
  const bookId = loadLastBookId()
  const saved = loadReadingPage(bookId)
  return <Navigate to={`/read/${bookId}/${saved}`} replace />
}

function LegacyReaderRedirect() {
  const { page } = useParams()
  return <Navigate to={`/read/textbook/${page}`} replace />
}

function LessonRedirect() {
  const { id } = useParams()
  const section = textbookSections.find((s) => s.lessonId === Number(id))
  return <Navigate to={`/read/textbook/${section?.startPage ?? loadReadingPage('textbook')}`} replace />
}
