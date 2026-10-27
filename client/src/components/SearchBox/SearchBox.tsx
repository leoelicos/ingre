import { translate } from '../../i18n'
import type { FC } from 'react'
import { Input, SearchField } from 'react-aria-components'
import { IngreIconSearch } from '../../lib/icon/Icon'

export const SEARCH_LABEL = translate('search.label')
export const SEARCH_INPUT_ID = 'explore-search'

/**
 * The search bar (#181, #192). It sits at the top of the discovery sheet, so it stays just above
 * the on-screen keyboard, and takes focus when the sheet opens. It fills the results as you
 * type: no Enter-to-search. Escape in it closes the sheet (React Aria clears a filled field
 * first).
 */
export const SearchBox: FC<{
  value: string
  onChange: (text: string) => void
}> = ({ value, onChange }) => (
  <div
    role="search"
    className="relative w-full min-w-0"
  >
    <SearchField
      aria-label={SEARCH_LABEL}
      value={value}
      onChange={onChange}
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
        autoFocus
        placeholder={SEARCH_LABEL}
        className="min-h-[44px] w-full rounded-pill border border-border bg-surface py-2 pl-10 pr-3 text-text placeholder:text-placeholder focus-visible:focus-ring [&::-webkit-search-cancel-button]:hidden"
      />
    </SearchField>
  </div>
)
