import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuthContext } from '../../utils/auth/AuthContext'
import { changeTitle } from '../../utils/changeTitle'
import type { ChipsState } from '../../utils/chips/useChips'
import { useChips } from '../../utils/chips/useChips'
import { useExplore } from '../../utils/explore/ExploreContext'
import { SPLIT_COLUMNS } from '../../utils/layout/split'
import { useSplit } from '../../utils/layout/useSplit'
import { readFavourites } from '../../utils/storage/favourites'
import type { ExploreProps } from './Explore'
import { Explore, ExploreDrawer } from './Explore'
import {
  INGREDIENTS_HEADING_ID,
  INGREDIENTS_ID,
  Ingredients,
  useIngredients
} from './Ingredients'
import { LayoutToggle } from './LayoutToggle'
import { recipeCount } from './recipeFilter'
import { RecipeRows } from './RecipeRows'
import { ScrollToTop } from './ScrollToTop'
import { Section } from './Section'

/** "?saved=1" from the Saved account link or old Saved links: Explore's Saved filter (#181). */
export const savedParam = (params: URLSearchParams): boolean =>
  params.get('saved') === '1'

/** The params with the Saved filter switched on or off; everything else is kept. */
export const withSaved = (
  params: URLSearchParams,
  on: boolean
): URLSearchParams => {
  const next = new URLSearchParams(params)
  if (on) next.set('saved', '1')
  else next.delete('saved')
  return next
}

/** A set with one id added, or removed when it is already there. */
export const toggled = (
  ids: ReadonlySet<string>,
  id: string
): ReadonlySet<string> =>
  new Set(ids.has(id) ? [...ids].filter((x) => x !== id) : [...ids, id])

export const NO_PICKS_HINT =
  'No recipes picked yet. Tick recipes in Explore and they show here.'

/** The Recipes section (#181): only the picked recipes, as rows. */
const PickedRecipes: FC<{
  list: ChipsState
  canSave: boolean
  collapsible: boolean
}> = ({ list, canSave, collapsible }) => {
  const [open, setOpen] = useState(true)
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(new Set())
  return (
    <Section
      id="recipes"
      title="Recipes"
      collapsible={collapsible}
      open={open}
      onToggle={() => setOpen(!open)}
      summary={`${recipeCount(list.recipes.length)} picked`}
    >
      {list.recipes.length === 0 ? (
        <p className="m-0 text-text-secondary">{NO_PICKS_HINT}</p>
      ) : (
        <RecipeRows
          recipes={list.recipes}
          controls={{
            pickedIds: list.pickedIds,
            onTogglePicked: list.togglePicked,
            openIds,
            onToggleOpen: (id) => setOpenIds((ids) => toggled(ids, id)),
            people: list.people,
            onPeople: list.setPeople,
            canSave,
            seeRecipe: false
          }}
        />
      )}
    </Section>
  )
}

/**
 * The one page (#179, #181): Explore, then Ingredients (chips by category) and Recipes (the
 * picked rows), stacked or side by side. From 992px Explore is a drawer column on the right.
 */
export const ListPage: FC = () => {
  useEffect(() => changeTitle('Shopping list'), [])
  const explore = useExplore()
  const list = useChips()
  const ingredients = useIngredients(list)
  const { split, options, wide, choose } = useSplit()
  const [params, setParams] = useSearchParams()
  const savedOnly = savedParam(params)
  const canSave = useAuthContext()[0].loggedIn
  /* on load, Explore opens when nothing is selected (or Saved was asked for) */
  const [openOnLoad] = useState(() => list.pickedIds.size === 0 || savedOnly)
  const exploreOpen = explore.open ?? openOnLoad
  const vertical = split === 'vertical'
  const exploreProps: ExploreProps = {
    ingredients,
    rows: {
      pickedIds: list.pickedIds,
      onTogglePicked: list.togglePicked,
      people: list.people,
      onPeople: list.setPeople,
      canSave
    },
    savedOnly,
    savedIds: readFavourites(),
    onSaved: (on) => setParams(withSaved(params, on))
  }
  return (
    <div className="mx-auto flex w-full max-w-layout gap-6 px-gutter">
      <main className="flex min-w-0 flex-1 flex-col gap-6 pb-24 pt-4">
        <h1 className="sr-only">Shopping list</h1>
        {!wide && exploreOpen && <Explore {...exploreProps} />}
        <LayoutToggle
          split={split}
          options={options}
          onChange={choose}
        />
        <div
          data-split={split}
          className={`grid items-start gap-6 ${SPLIT_COLUMNS[split]}`}
        >
          <Ingredients
            state={ingredients}
            collapsible={vertical}
          />
          <PickedRecipes
            list={list}
            canSave={canSave}
            collapsible={vertical}
          />
        </div>
        <ScrollToTop
          watchId={INGREDIENTS_ID}
          headingId={INGREDIENTS_HEADING_ID}
        />
      </main>
      {wide && (
        <ExploreDrawer
          open={exploreOpen}
          {...exploreProps}
        />
      )}
    </div>
  )
}
