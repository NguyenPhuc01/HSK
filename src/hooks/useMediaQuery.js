import { useEffect, useState } from 'react'

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  )

  useEffect(() => {
    const mq = window.matchMedia(query)
    const handler = (e) => setMatches(e.matches)
    mq.addEventListener('change', handler)
    setMatches(mq.matches)
    return () => mq.removeEventListener('change', handler)
  }, [query])

  return matches
}

/** Chỉ điện thoại (< 768px). Tablet dùng viewer PC (có zoom). */
export function useIsMobile() {
  return useMediaQuery('(max-width: 767px)')
}
