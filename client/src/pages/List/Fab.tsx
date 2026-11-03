import { useT } from '../../i18n'
import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { Button } from 'react-aria-components'
import { MOTION } from '../../components/Collapse'

/** What the FAB adds (#192): a recipe near the top, a pantry item once in Ingredients. */
export type FabMode = 'recipe' | 'pantry'

/**
 * The band the Ingredients section is watched in: the top tenth of the screen. The section
 * counts as in view once it reaches the top, its pinned header there; from 576px Recipes
 * and Ingredients start side by side, so "anywhere on screen" would be true from the start.
 */
export const FAB_ROOT_MARGIN = '0px 0px -90% 0px'

export const fabMode = (
  entry: Pick<IntersectionObserverEntry, 'isIntersecting'>
): FabMode => (entry.isIntersecting ? 'pantry' : 'recipe')

/**
 * The FAB's mode, from an IntersectionObserver on the section with this id (no scroll
 * listener). "+ Recipe" until the observer says otherwise, and where there is none.
 */
export const useFabMode = (id: string): FabMode => {
  const [mode, setMode] = useState<FabMode>('recipe')
  useEffect(() => {
    const target = document.getElementById(id)
    if (typeof IntersectionObserver === 'undefined' || target === null) return
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => setMode(fabMode(entry))),
      { rootMargin: FAB_ROOT_MARGIN }
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [id])
  return mode
}

export const FAB_ID = 'fab'

/** Fixed bottom right, above the iOS home indicator (with viewport-fit=cover). */
const FAB =
  'fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-20 inline-flex min-h-[56px] items-center gap-2 rounded-pill bg-primary px-5 text-lg font-bold text-on-primary shadow-raised data-[pressed]:shadow-pressed data-[focus-visible]:focus-ring'

/**
 * The FAB (#192): "+ Recipe" opens Explore, "+ Pantry Item" opens Extra. Its accessible
 * name says what it adds; the label fades in and the plus turns as it changes.
 */
export const Fab: FC<{ mode: FabMode; onPress: (mode: FabMode) => void }> = ({
  mode,
  onPress
}) => {
  const t = useT()
  return (
    <Button
      id={FAB_ID}
      data-mode={mode}
      aria-haspopup="dialog"
      aria-label={t(mode === 'pantry' ? 'fab.pantryLabel' : 'fab.recipeLabel')}
      onPress={() => onPress(mode)}
      className={FAB}
    >
      <span
        aria-hidden="true"
        className={`inline-block text-2xl leading-none transition-transform ${MOTION} ${
          mode === 'pantry' ? 'rotate-90' : ''
        }`}
      >
        +
      </span>
      <span
        key={mode}
        aria-hidden="true"
        className="whitespace-nowrap motion-safe:animate-label-in"
      >
        {t(mode === 'pantry' ? 'fab.pantry' : 'fab.recipe')}
      </span>
    </Button>
  )
}
