import { useRef, useState } from 'react'
import type { FC, ReactNode } from 'react'
import { Button } from 'react-aria-components'
import { useT } from '../../i18n'

/** The slide the scroll position is on: clamped, and the first one before there is any width. */
export const slideIndex = (
  left: number,
  width: number,
  count: number
): number =>
  width <= 0 ? 0 : Math.min(count - 1, Math.max(0, Math.round(left / width)))

const NAV =
  'min-h-[44px] min-w-[44px] rounded-pill border border-border bg-surface px-3 text-text focus-visible:focus-ring disabled:text-primary-disabled-fg'

/** Scrolls a track to a card; no track yet is nothing to scroll. */
export const scrollToSlide = (el: HTMLElement | null, to: number): void =>
  el?.scrollTo({ left: to * el.clientWidth })

/**
 * A scrolling carousel of cards (#211, #238): swipe, scroll with the keyboard, or use Previous
 * and Next. Nothing moves by itself, and reduced motion scrolls instantly. Each card is a named
 * group ("Card 2 of 3"), and the position is also written out, so dots are never the only cue.
 */
export const Carousel: FC<{
  label: string
  slides: readonly ReactNode[]
}> = ({ label, slides }) => {
  const t = useT()
  const track = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const go = (to: number): void => scrollToSlide(track.current, to)
  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className="flex flex-col gap-3"
    >
      <div
        ref={track}
        tabIndex={0}
        aria-label={label}
        onScroll={(e) =>
          setIndex(
            slideIndex(
              e.currentTarget.scrollLeft,
              e.currentTarget.clientWidth,
              slides.length
            )
          )
        }
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-card motion-reduce:scroll-auto focus-visible:focus-ring"
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={t('landing.cardOf', { n: i + 1, total: slides.length })}
            className="w-full shrink-0 snap-center"
          >
            {slide}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-2">
        <Button
          onPress={() => go(index - 1)}
          isDisabled={index === 0}
          className={NAV}
        >
          {t('landing.previous')}
        </Button>
        <p
          aria-live="polite"
          className="m-0 text-sm text-text-secondary"
        >
          {t('landing.cardOf', { n: index + 1, total: slides.length })}
        </p>
        <Button
          onPress={() => go(index + 1)}
          isDisabled={index === slides.length - 1}
          className={NAV}
        >
          {t('landing.next')}
        </Button>
      </div>
    </section>
  )
}
