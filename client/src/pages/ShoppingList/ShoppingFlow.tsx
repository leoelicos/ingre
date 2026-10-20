import type { FC, TouchEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { changeTitle } from '../../utils/changeTitle'
import {
  NO_UNSAVED,
  useShoppingList
} from '../../utils/shopping/useShoppingList'
import type {
  ShoppingListState,
  UnsavedTicks
} from '../../utils/shopping/useShoppingList'
import type { FlowStep } from '../../utils/storage/shoppingState'
import { FLOW_STEPS } from '../../utils/storage/shoppingState'
import { PickStep } from './PickStep'
import { IngreIconHouse } from '../../lib/icon/Icon'
import { STEPS_BAR, measureBar } from '../../utils/measureBar'
import { ClearedNote, LIST_CLEARED } from './StartNewList'
import { useStartNewList } from '../../utils/shopping/useStartNewList'
import type { UndoResult } from '../../utils/shopping/useStartNewList'
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

/** Pick · At home · At the shop: one Home control, Next buttons, and swipe on touch screens. */
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

/** The polite live region that says "List cleared"; always rendered, so the change is announced. */
export const CLEARED_STATUS_ID = 'list-cleared-status'

/** Id of each step's heading: Home and the Next buttons move focus there. */
export const stepHeadingId = (step: FlowStep): string => `flow-heading-${step}`

/** The Home control's label (#161): one control instead of the stepper. */
export const HOME_LABEL = 'Home'

/** A request to focus a step's heading once it has rendered; seq makes repeats count. */
interface FocusRequest {
  step: FlowStep | null
  seq: number
}

/** "?q=" from the header search and "?saved=1" from the Saved filter or old Saved links. */
export const pickParams = (
  params: URLSearchParams
): { query: string; savedOnly: boolean } => ({
  query: params.get('q') ?? '',
  savedOnly: params.get('saved') === '1'
})

/** The search params with the Saved filter switched on or off (other params kept). */
export const withSaved = (
  params: URLSearchParams,
  on: boolean
): URLSearchParams => {
  const next = new URLSearchParams(params)
  if (on) next.set('saved', '1')
  else next.delete('saved')
  return next
}

export const ShoppingFlow: FC<{ print?: () => void; timers?: Timers }> = ({
  print = () => window.print(),
  timers = browserTimers
}) => {
  useEffect(() => changeTitle('Shopping list'), [])
  const list = useShoppingList()
  const startNew = useStartNewList(list, timers)
  /** Every step change moves focus to the new step's heading, once it has rendered. */
  const [focus, setFocus] = useState<FocusRequest>({ step: null, seq: 0 })
  useEffect(() => {
    if (focus.step === null) return
    document.getElementById(stepHeadingId(focus.step))?.focus()
  }, [focus])
  const goTo = (step: FlowStep): void => {
    list.setStep(step)
    setFocus((previous) => ({ step, seq: previous.seq + 1 }))
  }
  const flow: ShoppingListState = { ...list, setStep: goTo }
  /** Clears; the Undo note then takes focus as it appears (ClearedNote). */
  const clearList = (unsaved: UnsavedTicks): void => startNew.start(unsaved)
  /** After a successful Undo, focus goes to the restored step's heading (the note is gone). */
  const [focusStep, setFocusStep] = useState(false)
  useEffect(() => {
    if (!focusStep) return
    setFocusStep(false)
    document.getElementById(stepHeadingId(list.step))?.focus()
  }, [focusStep, list.step])
  const undo = (): UndoResult => {
    const result = startNew.undo()
    setFocusStep(result === 'restored')
    return result
  }
  const { state, pathname, search } = useLocation()
  const here = { pathname, search }
  const navigate = useNavigate()
  const handled = useRef(false)
  useEffect(() => {
    if (handled.current || !wantsStartNew(state)) return
    handled.current = true
    clearList(NO_UNSAVED)
    navigate(here, { replace: true, state: null })
  })
  useEffect(() => {
    if (!wantsShopBarFocus(state)) return
    document.getElementById(SHOP_BAR_ID)?.focus()
    navigate(here, { replace: true, state: null })
  })
  const [params, setParams] = useSearchParams()
  const { query, savedOnly } = pickParams(params)
  /** A new search or Saved link always lands on Pick, where its results are. */
  const lastFilter = useRef('')
  useEffect(() => {
    const filter = params.toString()
    if (filter === lastFilter.current) return
    lastFilter.current = filter
    if ((query !== '' || savedOnly) && list.step !== 'pick')
      list.setStep('pick')
  })
  const index = FLOW_STEPS.indexOf(list.step)
  const count = FLOW_STEPS.length
  const [drag, setDrag] = useState<Drag | null>(null)
  const dragging = drag !== null && drag.horizontal === true

  const go = (i: number) => goTo(stepAt(i, list.step))

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
    <div className="flow">
      <div
        className="flow-steps justify-start"
        ref={measureBar(STEPS_BAR)}
      >
        <button
          type="button"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-pill border border-border bg-surface px-4 font-semibold text-text focus-visible:focus-ring"
          onClick={() => goTo('pick')}
        >
          <IngreIconHouse />
          {HOME_LABEL}
        </button>
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
                aria-labelledby={stepHeadingId(step)}
                className={
                  step === 'pick' ? 'flow-panel' : 'flow-panel flow-panel--list'
                }
              >
                <h1
                  id={stepHeadingId(step)}
                  className="list-title focus-visible:focus-ring"
                  tabIndex={-1}
                >
                  {STEP_LABELS[step]}
                </h1>
                {step === 'pick' ? (
                  <PickStep
                    list={flow}
                    query={query}
                    savedOnly={savedOnly}
                    onSavedOnly={(on) => setParams(withSaved(params, on))}
                  />
                ) : (
                  <ShoppingListView
                    list={flow}
                    view={step}
                    onStartNew={clearList}
                    timers={timers}
                    onPrint={print}
                  />
                )}
              </section>
            )
          )}
        </div>
      </div>
      <p
        id={CLEARED_STATUS_ID}
        className="sr-only"
        role="status"
      >
        {startNew.canUndo ? LIST_CLEARED : ''}
      </p>
      {startNew.canUndo && (
        <ClearedNote
          onUndo={undo}
          onFocusIn={startNew.pause}
          onFocusOut={startNew.resume}
        />
      )}
      <PrintSheet
        recipes={list.recipes}
        people={list.people}
        toBuy={list.toBuy}
      />
    </div>
  )
}
