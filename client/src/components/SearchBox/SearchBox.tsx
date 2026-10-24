import { translate } from '../../i18n'
import type { FC } from 'react'
import { useEffect } from 'react'
import { Input, SearchField } from 'react-aria-components'
import { useLocation, useNavigate } from 'react-router-dom'
import { IngreIconSearch } from '../../lib/icon/Icon'
import { useExplore } from '../../utils/explore/ExploreContext'
import { focusById } from '../../utils/focus'

export const SEARCH_LABEL = translate('search.label')
export const SEARCH_INPUT_ID = 'explore-search'

/**
 * The search bar (#181). It fills Explore as you type: no Enter-to-search, no query param.
 * Focus (click, tap or keyboard) and typing open Explore; Escape clears the text, which brings
 * back the browse list. Away from the list page it takes you there, keeping the text.
 */
export const SearchBox: FC = () => {
  const explore = useExplore()
  const navigate = useNavigate()
  const onList = useLocation().pathname === '/'
  const toExplore = () => {
    explore.show()
    if (onList) return
    explore.requestFocus()
    navigate('/')
  }
  const { focusPending, focusTaken } = explore
  useEffect(() => {
    if (!focusPending || !onList) return
    focusById(SEARCH_INPUT_ID)
    focusTaken()
  }, [focusPending, focusTaken, onList])
  return (
    <div
      role="search"
      className="relative w-full min-w-0 max-w-[36rem]"
    >
      <SearchField
        aria-label={SEARCH_LABEL}
        value={explore.query}
        onChange={(text) => {
          explore.setQuery(text)
          toExplore()
        }}
        onFocus={toExplore}
        className="w-full"
      >
        <span
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
          aria-hidden="true"
        >
          <IngreIconSearch />
        </span>
        <Input
          id={SEARCH_INPUT_ID}
          placeholder={SEARCH_LABEL}
          className="min-h-[44px] w-full rounded-pill border border-border bg-surface py-2 pl-10 pr-3 text-text placeholder:text-placeholder focus-visible:focus-ring [&::-webkit-search-cancel-button]:hidden"
        />
      </SearchField>
    </div>
  )
}
