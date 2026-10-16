import type { FC, KeyboardEvent, TouchEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { changeTitle } from '../../utils/changeTitle'
import { useShoppingList } from '../../utils/shopping/useShoppingList'
import type { FlowStep } from '../../utils/storage/shoppingState'
import { FLOW_STEPS } from '../../utils/storage/shoppingState'
import { PickStep } from './PickStep'
import { STEPS_BAR, measureBar } from '../../utils/measureBar'
import { ClearedNote } from './StartNewList'
import { useStartNewList } from '../../utils/shopping/useStartNewList'
import { browserTimers } from '../../utils/shopping/usePendingTicks'
import type { Timers } from '../../utils/shopping/usePendingTicks'
import { PrintSheet } from './PrintSheet'
import { ShoppingListView, SHOP_BAR_ID } from './ShoppingListView'
import { dragOffset, stepAt, swipeTarget } from './swipe'
import '../../styles/segmented.css'
import './shoppingList.css'

export const STEP_LABELS: Readonly<Record<FlowStep, string>> = {
  pick: 'Pick',
  home: 'At home',
  shop: 'At the shop'
}

interface Drag {
  x: number
  y: number
  /** null until the gesture is known to be horizontal or vertical */
  horizontal: boolean | null
  dx: number
}

/** Pick · At home · At the shop: tabs everywhere, plus swipe between steps on touch screens. */
/** Router state the finish screen sends when Start a new list is tapped. */
export const START_NEW_STATE = { startNew: true }
/** Router state sent by "Back to my list". */
export const FOCUS_SHOP_BAR = { focusShopBar: true }
export const wantsStartNew = (state: unknown): boolean =>
  typeof state === 'object' &&
  state !== null &&
  'startNew' in state &&
  state.startNew === true
export const wantsShopBarFocus = (state: unknown): boolean =>
  typeof state === 'object' &&
  state !== null &&
  'focusShopBar' in state &&
  state.focusShopBar === true

export const ShoppingFlow: FC<{ print?: () => void; timers?: Timers }> = ({
  print = () => window.print(),
  timers = browserTimers
}) => {
  useEffect(() => changeTitle('Shopping list'), [])
  const list = useShoppingList()
  const startNew = useStartNewList(list, timers)
  const previous = startNew.previous
  const { state } = useLocation()
  const navigate = useNavigate()
  const handled = useRef(false)
  useEffect(() => {
    if (handled.current || !wantsStartNew(state)) return
    handled.current = true
    startNew.start()
    navigate('/ingredients', { replace: true, state: null })
  })
  useEffect(() => {
    if (!wantsShopBarFocus(state)) return
    document.getElementById(SHOP_BAR_ID)?.focus()
    navigate('/ingredients', { replace: true, state: null })
  })
  const index = FLOW_STEPS.indexOf(list.step)
  const count = FLOW_STEPS.length
  const [drag, setDrag] = useState<Drag | null>(null)
  const dragging = drag !== null && drag.horizontal === true

  const go = (i: number) => {
    const next = stepAt(i, list.step)
    list.setStep(next)
    document.getElementById(`flow-tab-${next}`)?.focus()
  }

  const onTabKey = (e: KeyboardEvent) => {
    if (e.key === 'Home') {
      e.preventDefault()
      list.setStep(FLOW_STEPS[0]!)
      document.getElementById(`flow-tab-${FLOW_STEPS[0]}`)?.focus()
      return
    }
    if (e.key === 'End') {
      e.preventDefault()
      const last = FLOW_STEPS[count - 1]!
      list.setStep(last)
      document.getElementById(`flow-tab-${last}`)?.focus()
      return
    }
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (delta === 0) return
    const next = stepAt((index + delta + count) % count, list.step)
    list.setStep(next)
    document.getElementById(`flow-tab-${next}`)?.focus()
  }

  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0]
    if (t !== undefined)
      setDrag({ x: t.clientX, y: t.clientY, horizontal: null, dx: 0 })
  }
  const onTouchMove = (e: TouchEvent) => {
    const t = e.touches[0]
    if (drag === null || t === undefined || drag.horizontal === false) return
    const dx = t.clientX - drag.x
    const dy = t.clientY - drag.y
    const horizontal = drag.horizontal ?? Math.abs(dx) > Math.abs(dy)
    setDrag({ ...drag, horizontal, dx: horizontal ? dx : 0 })
  }
  const onTouchEnd = (e: TouchEvent) => {
    if (dragging)
      go(swipeTarget(index, drag.dx, e.currentTarget.clientWidth, count))
    setDrag(null)
  }

  return (
    <main className="flow">
      <div
        className="flow-steps"
        ref={measureBar(STEPS_BAR)}
        role="tablist"
        aria-label="Shopping steps"
        onKeyDown={onTabKey}
      >
        {FLOW_STEPS.map((step, i) => (
          <span
            key={step}
            className="flow-steps__item"
          >
            {i > 0 && (
              <span
                className="flow-steps__dot"
                aria-hidden="true"
              >
                ·
              </span>
            )}
            <button
              type="button"
              role="tab"
              id={`flow-tab-${step}`}
              aria-selected={step === list.step}
              aria-controls={`flow-panel-${step}`}
              tabIndex={step === list.step ? 0 : -1}
              className="flow-steps__tab"
              onClick={() => {
                list.setStep(step)
                document.getElementById(`flow-tab-${step}`)?.focus()
              }}
            >
              {STEP_LABELS[step]}
            </button>
          </span>
        ))}
      </div>
      <div
        className="flow-viewport"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={() => setDrag(null)}
      >
        <div
          className="flow-track"
          style={
            dragging
              ? {
                  transform: `translateX(calc(${
                    index === 0 ? 0 : -100
                  }% + ${dragOffset(index, drag.dx, count)}px))`
                }
              : {}
          }
        >
          {FLOW_STEPS.map((step, i) =>
            !(i === index || (dragging && Math.abs(i - index) === 1)) ? null : (
              <section
                key={step}
                id={`flow-panel-${step}`}
                role="tabpanel"
                aria-labelledby={`flow-tab-${step}`}
                className={
                  step === 'pick' ? 'flow-panel' : 'flow-panel flow-panel--list'
                }
              >
                {step === 'pick' ? (
                  <PickStep list={list} />
                ) : (
                  <ShoppingListView
                    list={list}
                    view={step}
                    onStartNew={startNew.start}
                    timers={timers}
                    onPrint={print}
                  />
                )}
              </section>
            )
          )}
        </div>
      </div>
      {previous !== null && (
        <ClearedNote onUndo={() => startNew.undo(previous)} />
      )}
      <PrintSheet
        recipes={list.recipes}
        people={list.people}
        toBuy={list.toBuy}
      />
    </main>
  )
}
