import AudioTrackList from './AudioTrackList'
import { useAudio } from '../context/AudioContext'

export default function MobileAudioTrackStrip({ bookId, tracks }) {
  const { activeTrack } = useAudio()

  if (!tracks?.length) return null

  return (
    <div
      className={`fixed left-0 right-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-2 backdrop-blur safe-x hidden md:block lg:hidden ${
        activeTrack
          ? 'bottom-[calc(var(--audio-bar-h)+env(safe-area-inset-bottom,0px))]'
          : 'bottom-0 safe-bottom'
      }`}
    >
      <AudioTrackList bookId={bookId} sections={tracks} compact />
    </div>
  )
}
