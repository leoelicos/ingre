import { useEffect, useState } from 'react'

const matches = (query: string): boolean =>
  typeof window.matchMedia === 'function' && window.matchMedia(query).matches

/** Live result of a CSS media query (false where matchMedia is unavailable). */
export const useMediaQuery = (query: string): boolean => {
  const [match, setMatch] = useState(() => matches(query))
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const list = window.matchMedia(query)
    const onChange = () => setMatch(list.matches)
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])
  return match
}

export const NARROW_QUERY = '(max-width: 767px)'
