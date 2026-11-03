import { useT } from '../../i18n'
import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { Button } from 'react-aria-components'

export type FabMode = 'recipe' | 'pantry'

/** "+ Recipe" until Ingredients is on screen, then "+ Pantry Item" (#192). */
export const fabMode = (ingredientsInView: boolean): FabMode =>
  ingredientsInView ? 'pantry' : 'recipe'

/** The latest observation, or null when the observer reported nothing. */
export const latestIntersecting = (
  entries: readonly { isIntersecting: boolean }[]
): boolean | null => {
  const entry = entries[entries.length - 1]
  return entry === undefined ? null : entry.isIntersecting
}

/** True once the element is in view. False when there is no observer or no element. */
export const useInView = (id: string): boolean => {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const target = document.getElementById(id)
    if (typeof IntersectionObserver === 'undefined' || target === null) return
    const observer = new IntersectionObserver((entries) => {
      const next = latestIntersecting(entries)
      if (next === null) return
      setInView(next)
    })
    observer.observe(target)
    return () => observer.disconnect()
  }, [id])
  return inView
}

const FAB =
  'fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-4 z-30 inline-flex min-h-[48px] max-w-[calc(100%-2rem)] items-center rounded-pill bg-primary px-5 text-base font-semibold text-on-primary shadow-raised transition-[background-color,transform] duration-200 data-[focus-visible]:focus-ring'

/**
 * The add button (#192): fixed at the bottom right, clear of the home indicator.
 * Its label follows Ingredients via IntersectionObserver, not a scroll listener.
 */
export const WorkspaceFab: FC<{
  watchId: string
  onRecipe: () => void
  onPantry: () => void
}> = ({ watchId, onRecipe, onPantry }) => {
  const t = useT()
  const pantry = fabMode(useInView(watchId)) === 'pantry'
  return (
    <Button
      onPress={pantry ? onPantry : onRecipe}
      data-fab={pantry ? 'pantry' : 'recipe'}
      className={FAB}
    >
      <span className="transition-opacity duration-200 motion-reduce:transition-none">
        {t(pantry ? 'fab.pantry' : 'fab.recipe')}
      </span>
    </Button>
  )
}
