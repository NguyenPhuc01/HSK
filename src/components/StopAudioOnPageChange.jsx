import { useEffect, useRef } from 'react'
import { useAudio } from '../context/AudioContext'

/** Dừng audio khi đổi trang hoặc đổi sách trong reader */
export default function StopAudioOnPageChange({ bookId, pageNum }) {
  const { stopTrack } = useAudio()
  const prev = useRef(null)

  useEffect(() => {
    if (prev.current !== null) {
      const { bookId: prevBook, pageNum: prevPage } = prev.current
      if (prevBook !== bookId || prevPage !== pageNum) {
        stopTrack()
      }
    }
    prev.current = { bookId, pageNum }
  }, [bookId, pageNum, stopTrack])

  return null
}
