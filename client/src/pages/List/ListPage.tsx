import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuthContext } from '../../utils/auth/AuthContext'
import { changeTitle } from '../../utils/changeTitle'
import { useChips } from '../../utils/chips/useChips'
import { useExplore } from '../../utils/explore/ExploreContext'
import { SPLIT_COLUMNS } from '../../utils/layout/split'
import { useSplit } from '../../utils/layout/useSplit'
import { useSaved } from '../../utils/saved/useSaved'
import type { ExploreProps } from './Explore'
import { Explore, ExploreDrawer } from './Explore'
import { Extra } from './Extra'
import {
  INGREDIENTS_HEADING_ID,
  INGREDIENTS_ID,
  Ingredients,
  useIngredients
} from './Ingredients'
import { LayoutToggle } from './LayoutToggle'
import { Recipes } from './Recipes'
import { ScrollToTop } from './ScrollToTop'

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

/**
 * The one page (#179, #181, #182): Explore, then Ingredients, Recipes and Extra, stacked or
 * side by side (Ingredients on the left; Recipes with Extra under it on the right). From 992px
 * Explore is a drawer column on the right.
 */
export const ListPage: FC = () => {
  useEffect(() => changeTitle('Shopping list'), [])
  const explore = useExplore()
  const list = useChips()
  const ingredients = useIngredients(list)
  const { split, options, wide, choose } = useSplit()
  const [params, setParams] = useSearchParams()
  const savedOnly = savedParam(params)
  const loggedIn = useAuthContext()[0].loggedIn
  const savedState = useSaved(loggedIn)
  const saved = loggedIn ? savedState : null
  /* on load, Explore opens when nothing is selected (or Saved was asked for) */
  const [openOnLoad] = useState(() => list.entries.length === 0 || savedOnly)
  const exploreOpen = explore.open ?? openOnLoad
  const vertical = split === 'vertical'
  const exploreProps: ExploreProps = {
    ingredients,
    rows: {
      pickedIds: list.pickedIds,
      onTogglePicked: list.togglePicked
    },
    saved,
    savedOnly,
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
          <div className="flex min-w-0 flex-col gap-6">
            <Recipes
              list={list}
              saved={saved}
              collapsible={vertical}
            />
            <Extra
              state={ingredients}
              collapsible={vertical}
            />
          </div>
        </div>
        <p
          role="status"
          className="sr-only"
        >
          {[ingredients.message, saved?.error ?? ''].join(' ').trim()}
        </p>
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
