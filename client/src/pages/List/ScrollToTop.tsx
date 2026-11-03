import { useT } from '../../i18n'
import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { Button } from 'react-aria-components'
import { focusById, scrollToStartOf } from '../../utils/focus'

/** True once the chips have scrolled up out of view (not when they are below the screen). */
export const isScrolledPast = (
  entry: Pick<
    IntersectionObserverEntry,
    'isIntersecting' | 'boundingClientRect'
  >
): boolean => !entry.isIntersecting && entry.boundingClientRect.top < 0

/** True while the element's box sits wholly above the screen. */
export const isAbove = (rect: Pick<DOMRect, 'bottom'>): boolean =>
  rect.bottom < 0

/**
 * Watches the element with this id; true while it is scrolled up out of view. The observer
 * misses a jump from above the screen to below it (e.g. scrolling to the very top while
 * Explore sits above the chips), so scrolling also re-checks the element's position.
 */
export const useScrolledPast = (id: string): boolean => {
  const [past, setPast] = useState(false)
  useEffect(() => {
    const target = document.getElementById(id)
    if (typeof IntersectionObserver === 'undefined' || target === null) return
    const observer = new IntersectionObserver((entries) =>
      entries.forEach((entry) => setPast(isScrolledPast(entry)))
    )
    observer.observe(target)
    const onScroll = () => setPast(isAbove(target.getBoundingClientRect()))
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [id])
  return past
}

/**
 * Scroll to top (#179): shows once the watched section (#192: Recipes, at the top) has scrolled
 * out of view. Scrolls it back to the top of the screen and moves focus to its heading, so
 * keyboard and screen reader users land there too. It sits just above the FAB.
 */
export const ScrollToTop: FC<{ watchId: string; headingId: string }> = ({
  watchId,
  headingId
}) => {
  const t = useT()
  const past = useScrolledPast(watchId)
  return past ? (
    <Button
      aria-label={t('scrollToTop')}
      onPress={() => {
        scrollToStartOf(watchId)
        focusById(headingId)
      }}
      className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-20 inline-flex h-12 w-12 items-center justify-center rounded-pill bg-primary text-xl text-on-primary shadow-raised data-[focus-visible]:focus-ring"
    >
      <span aria-hidden="true">↑</span>
    </Button>
  ) : null
}
