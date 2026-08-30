import { useEffect, useRef } from 'react'
import { useAudio } from '../context/AudioContext'

/** Component nhỏ — dừng audio khi đổi trang, không ảnh hưởng PDF */
export default function StopAudioOnPageChange({ pageNum }) {
  const { stopTrack } = useAudio()
  const prev = useRef(pageNum)

  useEffect(() => {
    if (prev.current !== pageNum) {
      stopTrack()
      prev.current = pageNum
    }
  }, [pageNum, stopTrack])

  return null
}
