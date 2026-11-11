import { translate, useT } from '../../i18n'
import type { FC } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuthContext } from '../../utils/auth/AuthContext'
import { changeTitle } from '../../utils/changeTitle'
import { useChips } from '../../utils/chips/useChips'
import { useExplore } from '../../utils/explore/ExploreContext'
import { useFlag } from '../../utils/flags/useFlag'
import { usePersonal } from '../../utils/profile/personal'
import { useSaved } from '../../utils/saved/useSaved'
import { useMarkFirstEndToEnd } from '../../utils/tier/upsell'
import type { ExploreProps } from './Explore'
import { ExploreSheet, savedIdsOf } from './Explore'
import { ExtraSheet } from './Extra'
import type { FabMode } from './Fab'
import { Fab, useFabMode } from './Fab'
import { INGREDIENTS_ID, Ingredients, useIngredients } from './Ingredients'
import { RECIPES_HEADING_ID, RECIPES_ID, Recipes } from './Recipes'
import { useTabArrival } from './tabArrival'
import { ScrollToTop } from './ScrollToTop'
import { Bra } from '../../components/Bra'
import { PageMain } from '../../components/SkipLink'

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

/** Which discovery sheet is open (#192), if any. */
export type OpenSheet = 'explore' | 'extra' | null

/** "+ Recipe" opens Explore, "+ Pantry Item" opens Extra. */
export const sheetFor = (mode: FabMode): OpenSheet =>
  mode === 'pantry' ? 'extra' : 'explore'

/**
 * The one page (#179, #192): a single workspace, no accordions. Recipes and Ingredients side by
 * side from 576px (Recipes on the left), Recipes above Ingredients below it. Discovery lives
 * in sheets (a bottom sheet on mobile, a centred modal from 576px) opened from the FAB:
 * Explore, with the search bar, from "+ Recipe" and Extra from "+ Pantry Item". The account
 * menu's Saved link ("?saved=1") opens Explore with its Saved filter on.
 */
export const ListPage: FC = () => {
  const t = useT()
  useEffect(() => changeTitle(translate('list.title')), [])
  const explore = useExplore()
  useTabArrival(explore)
  const list = useChips()
  useMarkFirstEndToEnd(useFlag('tiers'), list.chips, list.pickedIds.size)
  const ingredients = useIngredients(list)
  const [params, setParams] = useSearchParams()
  const savedOnly = savedParam(params)
  const loggedIn = useAuthContext()[0].loggedIn
  const savedState = useSaved(loggedIn)
  const saved = loggedIn ? savedState : null
  const personal = usePersonal(list, savedIdsOf(saved))
  /* Explore's sheet is open while Explore is expanded (#181, #192): the FAB, the Explore tab
     and the account menu's Saved link all expand it; it starts shut */
  const exploreOpen = explore.expanded === true
  const [extraOpen, setExtraOpen] = useState(false)
  const sheet: OpenSheet = exploreOpen ? 'explore' : extraOpen ? 'extra' : null
  const mode = useFabMode(INGREDIENTS_ID)
  /* the Saved link opens Explore once each time it is followed, not on every render */
  const latest = useRef(explore)
  latest.current = explore
  useEffect(() => {
    if (savedOnly) latest.current.show()
  }, [savedOnly])
  const open = (next: OpenSheet) => {
    if (next === 'extra') setExtraOpen(true)
    else {
      explore.show()
      explore.requestFocus()
    }
  }
  /* closing Explore also drops "?saved=1", so the Saved link opens it again next time */
  const close = () => {
    explore.collapse()
    setExtraOpen(false)
    if (savedOnly) setParams(withSaved(params, false))
  }
  const exploreProps: ExploreProps = {
    ingredients,
    rows: {
      pickedIds: list.pickedIds,
      onTogglePicked: list.togglePicked
    },
    saved,
    savedOnly,
    personal,
    onSaved: (on) => setParams(withSaved(params, on))
  }
  return (
    <div className="mx-auto flex w-full max-w-layout px-gutter">
      <PageMain className="flex min-w-0 flex-1 flex-col gap-6 pb-36 pt-4">
        <h1 className="sr-only">{t('list.title')}</h1>
        <div
          data-workspace=""
          className="grid grid-cols-1 items-start gap-6 desk:grid-cols-2"
        >
          <Recipes
            list={list}
            saved={saved}
          />
          <Ingredients state={ingredients} />
        </div>
        <p
          role="status"
          className="sr-only"
        >
          {[sheet === null ? ingredients.message : '', saved?.error ?? '']
            .join(' ')
            .trim()}
        </p>
        <Bra>
          <ScrollToTop
            watchId={RECIPES_ID}
            headingId={RECIPES_HEADING_ID}
          />
          <Fab
            mode={mode}
            onPress={(pressed) => open(sheetFor(pressed))}
          />
        </Bra>
        <ExploreSheet
          {...exploreProps}
          isOpen={sheet === 'explore'}
          onClose={close}
          query={explore.query}
          onQuery={explore.setQuery}
        />
        <ExtraSheet
          state={ingredients}
          isOpen={sheet === 'extra'}
          onClose={close}
        />
      </PageMain>
    </div>
  )
}
