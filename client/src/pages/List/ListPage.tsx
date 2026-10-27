import { translate, useT } from '../../i18n'
import type { FC } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageMain } from '../../components/SkipLink'
import { useAuthContext } from '../../utils/auth/AuthContext'
import { changeTitle } from '../../utils/changeTitle'
import { useChips } from '../../utils/chips/useChips'
import { useExplore } from '../../utils/explore/ExploreContext'
import { useSaved } from '../../utils/saved/useSaved'
import { Discovery } from './Discovery'
import type { DiscoveryMode } from './Discovery'
import { openerFrom } from './gestures'
import {
  INGREDIENTS_HEADING_ID,
  INGREDIENTS_ID,
  Ingredients,
  useIngredients
} from './Ingredients'
import { Recipes } from './Recipes'
import { ScrollToTop } from './ScrollToTop'
import { WorkspaceFab } from './WorkspaceFab'

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
 * The workspace (#192): Recipes and Ingredients, side by side from 576px and stacked
 * (Recipes first) below that. Search, Explore and Extra open from discovery, not the page.
 */
export const ListPage: FC = () => {
  const t = useT()
  useEffect(() => changeTitle(translate('list.title')), [])
  const explore = useExplore()
  const list = useChips()
  const ingredients = useIngredients(list)
  const [params, setParams] = useSearchParams()
  const savedOnly = savedParam(params)
  const loggedIn = useAuthContext()[0].loggedIn
  const savedState = useSaved(loggedIn)
  const saved = loggedIn ? savedState : null
  const [discovery, setDiscovery] = useState<DiscoveryMode | null>(null)
  const opener = useRef<HTMLElement | null>(null)
  const exploreRef = useRef(explore)
  exploreRef.current = explore
  useEffect(() => {
    if (!savedOnly) return
    setDiscovery('recipe')
    exploreRef.current.show()
    exploreRef.current.requestFocus()
  }, [savedOnly])
  useEffect(() => {
    if (!explore.focusPending) return
    setDiscovery('recipe')
    exploreRef.current.show()
  }, [explore.focusPending])

  const open = (mode: DiscoveryMode) => {
    opener.current = openerFrom(document.activeElement)
    setDiscovery(mode)
    exploreRef.current.show()
    if (mode === 'recipe') exploreRef.current.requestFocus()
  }
  const close = () => {
    setDiscovery(null)
    exploreRef.current.collapse()
  }
  return (
    <div className="mx-auto flex w-full max-w-layout px-gutter">
      <PageMain className="flex min-w-0 flex-1 flex-col gap-6 pb-28 pt-4">
        <h1 className="sr-only">{t('list.title')}</h1>
        <div
          data-workspace=""
          className="grid grid-cols-1 items-start gap-6 min-[576px]:grid-cols-2"
        >
          <Recipes
            list={list}
            saved={saved}
            onFind={() => open('recipe')}
          />
          <Ingredients
            state={ingredients}
            onAdd={() => open('pantry')}
          />
        </div>
        <p
          role="status"
          className="sr-only"
        >
          {[ingredients.message, saved?.error ?? ''].join(' ').trim()}
        </p>
        <WorkspaceFab
          watchId={INGREDIENTS_ID}
          onRecipe={() => open('recipe')}
          onPantry={() => open('pantry')}
        />
        <ScrollToTop
          watchId={INGREDIENTS_ID}
          headingId={INGREDIENTS_HEADING_ID}
        />
        <Discovery
          mode={discovery}
          opener={opener}
          onClose={close}
          explore={{
            ingredients,
            rows: {
              pickedIds: list.pickedIds,
              onTogglePicked: list.togglePicked
            },
            saved,
            savedOnly,
            onSaved: (on) => setParams(withSaved(params, on))
          }}
          ingredients={ingredients}
        />
      </PageMain>
    </div>
  )
}
