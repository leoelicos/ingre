import type { FC, ReactNode } from 'react'
import { createContext, useContext } from 'react'
import { useStored } from '../storage/useStored'
import type { Guest } from './guests'
import {
  GUESTS_KEY,
  addGuest,
  parseGuests,
  removeGuest,
  setAllergens
} from './guests'

/** The guests, readable anywhere: with no provider there are none, so nothing is flagged. */
const GuestListContext = createContext<readonly Guest[]>([])

export interface GuestActions {
  readonly add: (name: string) => void
  readonly remove: (id: string) => void
  readonly setAllergens: (id: string, allergens: readonly string[]) => void
}

const GuestActionsContext = createContext<GuestActions | null>(null)

/** A new id from the clock and how many guests there are; ids only need to differ on one device. */
const newId = (count: number): string => `${Date.now().toString(36)}-${count}`

/** The guests, kept on this device (localStorage) like the rest of the list. */
export const GuestsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [guests, update] = useStored<readonly Guest[]>(
    GUESTS_KEY,
    parseGuests,
    []
  )
  const actions: GuestActions = {
    add: (name) =>
      update((previous) => addGuest(previous, name, newId(previous.length))),
    remove: (id) => update((previous) => removeGuest(previous, id)),
    setAllergens: (id, allergens) =>
      update((previous) => setAllergens(previous, id, allergens))
  }
  return (
    <GuestListContext.Provider value={guests}>
      <GuestActionsContext.Provider value={actions}>
        {children}
      </GuestActionsContext.Provider>
    </GuestListContext.Provider>
  )
}

export const useGuestList = (): readonly Guest[] => useContext(GuestListContext)

export const useGuestActions = (): GuestActions => {
  const actions = useContext(GuestActionsContext)
  if (actions === null)
    throw new Error('useGuestActions needs a GuestsProvider')
  return actions
}
