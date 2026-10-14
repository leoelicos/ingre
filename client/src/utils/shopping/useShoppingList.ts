import { catalogue, library } from '../library/recipeLibrary'
import { usePeople } from '../storage/people'
import type { Extra } from '../storage/shoppingState'
import {
  useBasketIds,
  useExtras,
  useFlowStep,
  useHaveIds,
  useLocationOverrides,
  usePickedIds
} from '../storage/shoppingState'
import {
  buildShoppingList,
  extraLineId,
  extraLines,
  splitByHave,
  withLocations
} from './shoppingList'

/** What the user typed or chose in "Add an item". */
export interface NewExtra {
  name: string
  ingredientId: string | null
}

const slug = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')

export const extraId = ({ name, ingredientId }: NewExtra) =>
  ingredientId ?? `free-${slug(name)}`

/** Adds an extra, or bumps its quantity when it is already on the list. */
export const addExtra = (
  extras: readonly Extra[],
  { name, ingredientId }: NewExtra
): Extra[] => {
  const id = extraId({ name, ingredientId })
  return extras.some((e) => e.id === id)
    ? extras.map((e) => (e.id === id ? { ...e, quantity: e.quantity + 1 } : e))
    : [...extras, { id, name: name.trim(), ingredientId, quantity: 1 }]
}

/** Sets an extra's quantity; 0 removes it. */
export const setExtraQuantity = (
  extras: readonly Extra[],
  lineId: string,
  quantity: number
): Extra[] =>
  extras.flatMap((e) =>
    extraLineId(e) !== lineId ? [e] : quantity > 0 ? [{ ...e, quantity }] : []
  )

/** All shopping-flow state: picks, people, extras, ticks, locations and step, persisted. */
export const useShoppingList = () => {
  const [people, setPeople] = usePeople()
  const [pickedIds, togglePicked] = usePickedIds()
  const [extras, updateExtras] = useExtras()
  const [haveIds, toggleHave, unHave, addHave] = useHaveIds()
  const [basketIds, toggleBasket, unBasket, addBasket] = useBasketIds()
  const [overrides, setLocation] = useLocationOverrides()
  const [step, setStep] = useFlowStep()
  const recipes = library.filter((r) => pickedIds.has(r.id))
  const lines = withLocations(
    [
      ...buildShoppingList(recipes, people, catalogue),
      ...extraLines(extras, catalogue)
    ],
    overrides
  )
  return {
    people,
    setPeople,
    step,
    setStep,
    recipes,
    pickedIds,
    togglePicked,
    haveIds,
    toggleHave,
    addHave,
    basketIds,
    toggleBasket,
    addBasket,
    setLocation,
    lineCount: lines.filter((l) => !l.staple).length,
    /** new extras start unticked: not had, not in the basket */
    addExtra: (extra: NewExtra) => {
      const lineId = extraLineId({ id: extraId(extra) })
      unHave(lineId)
      unBasket(lineId)
      updateExtras((previous) => addExtra(previous, extra))
    },
    setExtraQuantity: (lineId: string, quantity: number) =>
      updateExtras((previous) => setExtraQuantity(previous, lineId, quantity)),
    /** staples are assumed at home: never counted or listed as to buy */
    assumed: lines.filter((l) => l.staple),
    ...splitByHave(
      lines.filter((l) => !l.staple),
      haveIds
    ),
    /** to buy and not yet in the basket: the one count every screen shows */
    leftToBuy: lines.filter(
      (l) =>
        !l.staple &&
        !haveIds.has(l.ingredientId) &&
        !basketIds.has(l.ingredientId)
    ).length
  }
}

export type ShoppingListState = ReturnType<typeof useShoppingList>
