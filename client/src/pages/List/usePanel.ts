import { useEffect, useState } from 'react'
import { focusCheckedIn, focusFirstOf, revealById } from '../../utils/focus'
import type { PanelState } from './Chips'

/** Where focus goes after the next render, once a chip has moved, opened or gone. */
export type FocusTarget =
  | { readonly kind: 'reveal'; readonly id: string }
  | { readonly kind: 'checked'; readonly id: string }
  | { readonly kind: 'first'; readonly ids: readonly string[] }

export const moveFocus = (target: FocusTarget): void => {
  if (target.kind === 'reveal') revealById(target.id)
  else if (target.kind === 'checked') focusCheckedIn(target.id)
  else focusFirstOf(target.ids)
}

export const useFocusAfterRender = () => {
  const [target, setTarget] = useState<FocusTarget | null>(null)
  useEffect(() => {
    if (target === null) return
    moveFocus(target)
    setTarget(null)
  }, [target])
  return setTarget
}

/** One chip panel open at a time; the last one stays mounted so it can animate shut. */
export const usePanel = () => {
  const [id, setId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const show = (chipId: string) => {
    setId(chipId)
    setOpen(true)
  }
  const panel: PanelState = {
    id,
    open,
    onChevron: (chipId) =>
      open && id === chipId ? setOpen(false) : show(chipId)
  }
  return { panel, show }
}
