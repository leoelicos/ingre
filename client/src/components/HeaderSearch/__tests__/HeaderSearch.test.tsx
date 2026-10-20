import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { addFontAwesome } from '../../../utils/addFontAwesome'
import { HeaderSearch, SEARCH_LABEL, TabToAccept } from '../HeaderSearch'
import { searchSuggestions } from '../suggestions'

addFontAwesome()

/** Shows where the app is, so a test can see where a search went. */
const Where = () => {
  const { pathname, search } = useLocation()
  return <p data-testid="where">{pathname + search}</p>
}

const renderSearch = (path = '/somewhere') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <HeaderSearch />
      <button type="button">After</button>
      <Routes>
        <Route
          path="*"
          element={<Where />}
        />
      </Routes>
    </MemoryRouter>
  )

const box = () => screen.getByRole('combobox', { name: SEARCH_LABEL })
const where = () => screen.getByTestId('where').textContent

describe('HeaderSearch (#163)', () => {
  it('is a labelled search combobox on the normal keyboard, with suggestions as you type', async () => {
    const user = userEvent.setup()
    renderSearch()
    expect(screen.getByRole('search')).toContainElement(box())
    // the device's own keyboard: a plain search input, nothing custom
    expect(box()).toHaveAttribute('type', 'search')
    expect(box()).toHaveAttribute('enterkeyhint', 'search')
    expect(box()).toHaveClass('focus-visible:focus-ring')
    expect(screen.queryByRole('listbox')).toBeNull()
    await user.type(box(), 'egg')
    expect(box()).toHaveAttribute('aria-expanded', 'true')
    const options = screen.getAllByRole('option')
    expect(options.length).toBe(searchSuggestions('egg').length)
    expect(options[0]).toHaveTextContent(/Recipe$/)
  })

  it('Tab accepts the first suggestion and stays put; the next Tab moves on (no trap)', async () => {
    const user = userEvent.setup()
    renderSearch()
    await user.type(box(), 'red lent')
    const first = searchSuggestions('red lent')[0]?.name ?? ''
    expect(first).not.toBe('')
    await user.tab()
    expect(box()).toHaveValue(first)
    expect(box()).toHaveFocus()
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(where()).toBe('/somewhere')
    await user.tab()
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus()
  })

  it('Tab accepts the suggestion highlighted with the arrow keys', async () => {
    const user = userEvent.setup()
    renderSearch()
    await user.type(box(), 'onion')
    const [, second] = searchSuggestions('onion')
    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(box()).toHaveAttribute(
      'aria-activedescendant',
      screen.getAllByRole('option')[1]?.id ?? ''
    )
    await user.tab()
    expect(box()).toHaveValue(second?.name ?? '')
  })

  it('Shift+Tab never accepts; it leaves the box as usual', async () => {
    const user = userEvent.setup()
    renderSearch()
    await user.type(box(), 'onion')
    await user.tab({ shift: true })
    expect(box()).not.toHaveFocus()
    expect(box()).toHaveValue('onion')
  })

  it('Enter searches Pick for the text; blank Enter opens Pick unfiltered', async () => {
    const user = userEvent.setup()
    renderSearch()
    await user.type(box(), 'zzz{Enter}')
    expect(where()).toBe('/?q=zzz')
    await user.clear(box())
    await user.keyboard('{Enter}')
    expect(where()).toBe('/')
  })

  it('Tab then Enter searches for the accepted suggestion', async () => {
    const user = userEvent.setup()
    renderSearch()
    await user.type(box(), 'red lent')
    await user.tab()
    await user.keyboard('{Enter}')
    expect(where()).toBe('/?q=Red%20lentil%20dahl')
  })

  it('choosing a recipe opens it; choosing an ingredient searches Pick for it', async () => {
    const user = userEvent.setup()
    renderSearch()
    await user.type(box(), 'red lentil dahl')
    await user.click(screen.getByRole('option', { name: /^Red lentil dahl/ }))
    expect(where()).toBe('/recipe/dahl')
    expect(box()).toHaveValue('Red lentil dahl')
    await user.clear(box())
    await user.type(box(), 'banana')
    await user.keyboard('{ArrowDown}{Enter}')
    expect(where()).toBe('/?q=banana')
  })

  it('starts with the current search text', () => {
    renderSearch('/?q=lime')
    expect(box()).toHaveValue('lime')
  })

  it('outside a combobox, Tab is left alone', async () => {
    const user = userEvent.setup()
    const accepted: string[] = []
    render(
      <TabToAccept
        suggestions={searchSuggestions('egg')}
        onAccept={(s) => accepted.push(s.name)}
      >
        <input aria-label="plain" />
      </TabToAccept>
    )
    await user.click(screen.getByRole('textbox', { name: 'plain' }))
    await user.tab()
    expect(accepted).toEqual([])
  })
})
