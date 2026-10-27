import { useT } from '../../i18n'
import type { FC, MutableRefObject } from 'react'
import { useEffect, useRef } from 'react'
import { Button } from 'react-aria-components'
import { SearchBox } from '../../components/SearchBox/SearchBox'
import type { IngredientsState } from './Ingredients'
import { Extra } from './Extra'
import { ExplorePanel } from './Explore'
import type { ExploreProps } from './Explore'
import {
  capturePointer,
  escapeAction,
  focusFirstInput,
  sheetShouldClose,
  tabTarget
} from './gestures'

export type DiscoveryMode = 'recipe' | 'pantry'

/**
 * Discovery (#192): a bottom sheet below 576px and a centred dialog from there.
 * Search stays at the top. Escape closes once nothing nested wants the key; a downward
 * drag on the handle closes it; focus is trapped and returned to the trigger.
 */
export const Discovery: FC<{
  mode: DiscoveryMode | null
  opener: MutableRefObject<HTMLElement | null>
  onClose: () => void
  explore: ExploreProps
  ingredients: IngredientsState
}> = ({ mode, opener, onClose, explore, ingredients }) => {
  const t = useT()
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number } | null>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (mode === null) {
      opener.current?.focus()
      opener.current = null
      return
    }
    focusFirstInput(ref.current)
  }, [mode, opener])

  useEffect(() => {
    if (mode === null) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (escapeAction(ref.current, document.activeElement) === 'close') {
          event.preventDefault()
          onCloseRef.current()
        }
        return
      }
      if (event.key !== 'Tab') return
      const next = tabTarget(ref.current, event.target, event.shiftKey)
      if (next === null) return
      event.preventDefault()
      next.focus()
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [mode])

  if (mode === null) return null
  const title =
    mode === 'recipe' ? t('recipes.find') : t('ingredients.addPantry')
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-text/40 min-[576px]:items-center min-[576px]:p-6"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[100dvh] w-full flex-col rounded-t-card bg-surface text-text shadow-card outline-none min-[576px]:max-h-[85vh] min-[576px]:max-w-4xl min-[576px]:rounded-card"
      >
        <div
          className="flex justify-center pt-2 min-[576px]:hidden"
          onPointerDown={(event) => {
            capturePointer(event.currentTarget, event.pointerId)
            drag.current = { x: event.clientX, y: event.clientY }
          }}
          onPointerUp={(event) => {
            const start = drag.current
            drag.current = null
            if (start === null) return
            if (
              sheetShouldClose(event.clientY - start.y, event.clientX - start.x)
            ) {
              onClose()
            }
          }}
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-10 rounded-pill bg-border"
          />
        </div>
        <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-2">
          <h2 className="m-0 text-lg font-bold">{title}</h2>
          <Button
            aria-label={t('discovery.close')}
            onPress={onClose}
            className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-pill px-3 font-semibold text-text data-[focus-visible]:focus-ring"
          >
            {t('discovery.close')}
          </Button>
        </div>
        <div className="shrink-0 px-4 pb-3">
          <SearchBox />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
          {mode === 'recipe' ? (
            <ExplorePanel props={explore} />
          ) : (
            <Extra state={ingredients} />
          )}
        </div>
      </div>
    </div>
  )
}
