import { translate, useT } from '../../i18n'
import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuthContext } from '../../utils/auth/AuthContext'
import { changeTitle } from '../../utils/changeTitle'
import { useChips } from '../../utils/chips/useChips'
import { useSaved } from '../../utils/saved/useSaved'
import type { ExploreProps } from './Explore'
import { ExploreSheet } from './Explore'
import { ExtraSheet } from './Extra'
import type { FabMode } from './Fab'
import { Fab, useFabMode } from './Fab'
import { INGREDIENTS_ID, Ingredients, useIngredients } from './Ingredients'
import { RECIPES_HEADING_ID, RECIPES_ID, Recipes } from './Recipes'
import { ScrollToTop } from './ScrollToTop'
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
  const list = useChips()
  const ingredients = useIngredients(list)
  const [params, setParams] = useSearchParams()
  const savedOnly = savedParam(params)
  const loggedIn = useAuthContext()[0].loggedIn
  const savedState = useSaved(loggedIn)
  const saved = loggedIn ? savedState : null
  const [sheet, setSheet] = useState<OpenSheet>(null)
  const [query, setQuery] = useState('')
  const mode = useFabMode(INGREDIENTS_ID)
  useEffect(() => {
    if (savedOnly) setSheet('explore')
  }, [savedOnly])
  /* closing Explore also drops "?saved=1", so the Saved link opens it again next time */
  const close = () => {
    setSheet(null)
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
    onSaved: (on) => setParams(withSaved(params, on))
  }
  return (
    <div className="mx-auto flex w-full max-w-layout px-gutter">
      <PageMain className="flex min-w-0 flex-1 flex-col gap-6 pt-4">
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
        <ScrollToTop
          watchId={RECIPES_ID}
          headingId={RECIPES_HEADING_ID}
        />
        <Fab
          mode={mode}
          onPress={(pressed) => setSheet(sheetFor(pressed))}
        />
        <ExploreSheet
          {...exploreProps}
          isOpen={sheet === 'explore'}
          onClose={close}
          query={query}
          onQuery={setQuery}
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
