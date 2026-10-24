import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { Button } from 'react-aria-components'
import { focusById, scrollBehaviour } from '../../utils/focus'

/** True once the chips have scrolled up out of view (not when they are below the screen). */
export const isScrolledPast = (
  entry: Pick<
    IntersectionObserverEntry,
    'isIntersecting' | 'boundingClientRect'
  >
): boolean => !entry.isIntersecting && entry.boundingClientRect.top < 0

/** Watches the element with this id; true while it is scrolled up out of view. */
export const useScrolledPast = (id: string): boolean => {
  const [past, setPast] = useState(false)
  useEffect(() => {
    const target = document.getElementById(id)
    if (typeof IntersectionObserver === 'undefined' || target === null) return
    const observer = new IntersectionObserver((entries) =>
      entries.forEach((entry) => setPast(isScrolledPast(entry)))
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [id])
  return past
}

/**
 * Scroll to top (#179): shows once the chips are out of view. Brings them back into view and
 * moves focus to the Ingredients heading, so keyboard and screen reader users land there too.
 */
export const ScrollToTop: FC<{ watchId: string; headingId: string }> = ({
  watchId,
  headingId
}) => {
  const past = useScrolledPast(watchId)
  return past ? (
    <Button
      aria-label="Scroll to top"
      onPress={() => {
        window.scrollTo({ top: 0, behavior: scrollBehaviour() })
        focusById(headingId)
      }}
      className="fixed bottom-4 right-4 z-10 inline-flex h-12 w-12 items-center justify-center rounded-pill bg-primary text-xl text-on-primary shadow-raised data-[focus-visible]:focus-ring"
    >
      <span aria-hidden="true">↑</span>
    </Button>
  ) : null
}
