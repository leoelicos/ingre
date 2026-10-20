import type { FC, KeyboardEvent, ReactNode } from 'react'
import { useContext, useState } from 'react'
import type { Key } from 'react-aria-components'
import {
  ComboBox,
  ComboBoxStateContext,
  Input,
  ListBox,
  ListBoxItem,
  Popover
} from 'react-aria-components'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { IngreIconSearch } from '../../lib/icon/Icon'
import type { Suggestion } from './suggestions'
import { searchPath, tabAcceptance, visibleSuggestions } from './suggestions'

export const SEARCH_LABEL = 'Search recipes or ingredients'

/** Catches Tab before the combobox does, so Tab fills the box with the suggestion and stays put. */
export const TabToAccept: FC<{
  suggestions: readonly Suggestion[]
  onAccept: (suggestion: Suggestion) => void
  children: ReactNode
}> = ({ suggestions, onAccept, children }) => {
  const state = useContext(ComboBoxStateContext)
  const onKeyDownCapture = (e: KeyboardEvent) => {
    if (state === null) return
    const accepted = tabAcceptance(
      e.key,
      e.shiftKey,
      state.isOpen,
      state.selectionManager.focusedKey,
      suggestions
    )
    if (accepted === null) return
    e.preventDefault()
    e.stopPropagation()
    onAccept(accepted)
    state.close()
  }
  return (
    <div
      className="relative"
      onKeyDownCapture={onKeyDownCapture}
    >
      {children}
    </div>
  )
}

const OPTION =
  'flex min-h-[44px] cursor-pointer flex-col justify-center rounded-control px-3 py-1 text-text outline-none data-[focused]:bg-chip-active data-[focus-visible]:focus-ring'

/** The option text: the name, with "Recipe" or the shop section under it. */
const SuggestionOption: FC<{ suggestion: Suggestion }> = ({ suggestion }) => (
  <ListBoxItem
    id={suggestion.id}
    textValue={suggestion.name}
    className={OPTION}
  >
    <span className="font-semibold leading-tight">{suggestion.name}</span>
    <span className="text-xs leading-tight text-text-secondary">
      {suggestion.detail}
    </span>
  </ListBoxItem>
)

/**
 * Header search (#163): an accessible combobox on the device's own keyboard. Typing shows
 * suggestions; Tab accepts the highlighted (or first) one; Enter searches Pick. Choosing a recipe
 * opens it; choosing an ingredient searches Pick for it.
 */
export const HeaderSearch: FC = () => {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [text, setText] = useState(params.get('q') ?? '')
  const [accepted, setAccepted] = useState<string | null>(null)
  const suggestions = visibleSuggestions(text, accepted)
  const accept = (suggestion: Suggestion) => {
    setText(suggestion.name)
    setAccepted(suggestion.name)
  }
  /** Click or Enter on an option: fill the box and go there. */
  const choose = (key: Key | null) =>
    suggestions
      .filter((suggestion) => suggestion.id === key)
      .forEach((suggestion) => {
        accept(suggestion)
        navigate(suggestion.path)
      })
  return (
    <form
      role="search"
      className="min-w-0 flex-1"
      onSubmit={(e) => {
        e.preventDefault()
        navigate(searchPath(text))
      }}
    >
      <ComboBox
        aria-label={SEARCH_LABEL}
        items={suggestions}
        inputValue={text}
        onInputChange={setText}
        selectedKey={null}
        onSelectionChange={choose}
        allowsCustomValue={true}
        menuTrigger="input"
        className="w-full"
      >
        <TabToAccept
          suggestions={suggestions}
          onAccept={accept}
        >
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            aria-hidden="true"
          >
            <IngreIconSearch />
          </span>
          <Input
            type="search"
            enterKeyHint="search"
            placeholder="Search"
            className="min-h-[44px] w-full rounded-pill border border-border bg-surface py-2 pl-10 pr-3 text-text focus-visible:focus-ring"
          />
        </TabToAccept>
        <Popover
          placement="bottom start"
          className="w-[--trigger-width] min-w-[16rem] rounded-control border border-border bg-surface p-1 shadow-card"
        >
          <ListBox className="outline-none">
            {(suggestion: Suggestion) => (
              <SuggestionOption suggestion={suggestion} />
            )}
          </ListBox>
        </Popover>
      </ComboBox>
    </form>
  )
}
