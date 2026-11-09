import '@testing-library/jest-dom'
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import { EXTRAS_KEY } from '../../../utils/storage/shoppingState'
import type { HistoryEntry } from '../../../utils/warroom/history'
import { HISTORY_KEY } from '../../../utils/warroom/history'
import { WarRoom } from '../WarRoom'

expect.extend(toHaveNoViolations)

beforeEach(() => localStorage.clear())

/*
 * Acceptance for #207 and t26u: type, paste or say; it lands on the list with an inline
 * acknowledgement and an Undo; suggestions as you type; one-tap recent, frequent and
 * examples; a history kept on the device.
 */

const open = () =>
  render(
    <MemoryRouter>
      <WarRoom />
    </MemoryRouter>
  )
const field = () => screen.getByRole('combobox', { name: 'Add an item' })
const suggestions = () => screen.queryByRole('listbox', { name: 'Matches' })
const listed = (): { ingredientId: string; quantity: number }[] =>
  JSON.parse(localStorage.getItem(EXTRAS_KEY) ?? '[]')
const listedIds = () => listed().map(({ ingredientId }) => ingredientId)
const stored = (): HistoryEntry[] =>
  JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')
const history = () => screen.getByRole('region', { name: 'History' })
const historyButtons = () =>
  within(history()).queryAllByRole('button', { name: /^Add .* again$/ })
const status = () => screen.getByRole('status')
const seed = (entries: readonly HistoryEntry[]) =>
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries))
const entry = (
  id: string,
  itemId: string,
  at: number,
  quantity = 1
): HistoryEntry => ({ id, itemId, quantity, at })

describe('typing', () => {
  it('opens with the field focused, suggestions closed and examples to try', () => {
    open()
    expect(field()).toHaveFocus()
    expect(field()).toHaveAttribute('aria-expanded', 'false')
    expect(field()).toHaveAttribute('aria-autocomplete', 'list')
    expect(field()).toHaveAccessibleDescription(/Type, paste or say/)
    expect(field()).toHaveAttribute('placeholder', 'Try “3 carrots”')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'War room'
    )
    expect(suggestions()).toBeNull()
    const tryOne = screen.getByRole('region', { name: 'Try one' })
    expect(within(tryOne).getAllByRole('button')).toHaveLength(6)
    expect(within(history()).getByText(/Nothing yet/)).toBeInTheDocument()
    expect(
      within(history()).queryByRole('button', { name: 'Clear history' })
    ).toBeNull()
  })

  it('suggests on every keystroke, on short and long names and typos, with a count', async () => {
    const user = userEvent.setup()
    open()
    await user.type(field(), 'car')
    expect(field()).toHaveAttribute('aria-expanded', 'true')
    expect(field()).toHaveAttribute('aria-controls', 'war-room-suggestions')
    expect(
      within(suggestions() as HTMLElement).getByRole('option', {
        name: 'Carrot'
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/^\d+ suggestions?\. Up and down/)
    ).toBeInTheDocument()
    await user.clear(field())
    await user.type(field(), 'cream')
    expect(
      screen.getByRole('option', { name: 'Thickened cream' })
    ).toBeInTheDocument()
    await user.clear(field())
    await user.type(field(), 'brocoli')
    expect(screen.getByRole('option', { name: 'Broccoli' })).toBeInTheDocument()
    expect(screen.getByText(/^1 suggestion\. Up and down/)).toBeInTheDocument()
    await user.clear(field())
    await user.type(field(), 'zzzz')
    expect(suggestions()).toBeNull()
    expect(screen.getByText('No suggestions')).toBeInTheDocument()
  })

  it('a tap on a suggestion adds it, says so, clears the field and keeps focus there', async () => {
    const user = userEvent.setup()
    open()
    await user.type(field(), 'car')
    await user.click(screen.getByRole('option', { name: 'Carrot' }))
    expect(status()).toHaveTextContent('Carrot added')
    expect(field()).toHaveValue('')
    expect(field()).toHaveFocus()
    expect(listedIds()).toEqual(['carrot'])
    expect(
      within(history()).getByRole('heading', { level: 3, name: 'Today' })
    ).toBeInTheDocument()
    expect(historyButtons()).toHaveLength(1)
  })

  it('Enter adds the best match, with a quantity when one is typed', async () => {
    const user = userEvent.setup()
    open()
    await user.type(field(), '3 carrots{Enter}')
    expect(status()).toHaveTextContent('Carrot added')
    expect(listed()).toMatchObject([{ ingredientId: 'carrot', quantity: 3 }])
    expect(
      within(history()).getByRole('button', { name: 'Add carrot ×3 again' })
    ).toBeInTheDocument()
    expect(stored()).toMatchObject([{ itemId: 'carrot', quantity: 3 }])
  })

  it('reads pack words and weights: "2 tins of chickpeas, 500 g plain flour"', async () => {
    const user = userEvent.setup()
    open()
    await user.type(field(), '2 tins of chickpeas, 500 g plain flour{Enter}')
    expect(listed()).toMatchObject([
      { ingredientId: 'chickpeas', quantity: 2 },
      { ingredientId: 'plain-flour', quantity: 1 }
    ])
  })

  it('a quantity typed before picking a suggestion goes with it', async () => {
    const user = userEvent.setup()
    open()
    await user.type(field(), '2 onion')
    await user.click(screen.getByRole('option', { name: 'Brown onion' }))
    expect(listed()).toMatchObject([{ ingredientId: 'onion', quantity: 2 }])
  })

  it('suggests for the part being typed, and a pick adds the whole line', async () => {
    const user = userEvent.setup()
    open()
    await user.type(field(), 'carrot, 2 oni')
    expect(screen.queryByRole('option', { name: 'Carrot' })).toBeNull()
    await user.click(screen.getByRole('option', { name: 'Brown onion' }))
    expect(status()).toHaveTextContent('Carrot, Brown onion added')
    expect(listed()).toMatchObject([
      { ingredientId: 'carrot', quantity: 1 },
      { ingredientId: 'onion', quantity: 2 }
    ])
  })

  it('says when nothing matches, and when it is already on the list', async () => {
    const user = userEvent.setup()
    open()
    await user.type(field(), 'zzzz{Enter}')
    expect(status()).toHaveTextContent('No match for zzzz')
    expect(historyButtons()).toHaveLength(0)
    expect(screen.queryByRole('button', { name: /^Undo/ })).toBeNull()
    await user.type(field(), 'carrot{Enter}')
    await user.type(field(), 'carrot{Enter}')
    expect(status()).toHaveTextContent('Carrot already on your list')
    expect(historyButtons()).toHaveLength(1)
    expect(screen.queryByRole('button', { name: /^Undo/ })).toBeNull()
    await user.type(field(), 'car')
    expect(
      screen.getByRole('option', { name: 'Carrot On your list' })
    ).toBeInTheDocument()
  })

  it('several in one line, said once each', async () => {
    const user = userEvent.setup()
    open()
    await user.type(field(), 'carrot, onion and carrot{Enter}')
    expect(status()).toHaveTextContent('Carrot, Brown onion added')
    expect(historyButtons()).toHaveLength(2)
  })

  it('Enter in an empty field does nothing', async () => {
    const user = userEvent.setup()
    open()
    await user.type(field(), '{Enter}')
    expect(status()).toHaveTextContent('')
  })

  it('has no accessibility violations with suggestions open and a history', async () => {
    const user = userEvent.setup()
    const { container } = open()
    await user.type(field(), 'carrot{Enter}')
    await user.type(field(), 'oni{ArrowDown}')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('links back to the list', () => {
    open()
    expect(
      screen.getByRole('link', { name: 'Back to your list' })
    ).toHaveAttribute('href', '/')
  })
})

describe('keyboard', () => {
  it('arrows move the highlight through the suggestions and round; Enter adds it', async () => {
    const user = userEvent.setup()
    open()
    await user.type(field(), 'onion')
    const options = screen.getAllByRole('option')
    expect(options.length).toBeGreaterThan(2)
    expect(field()).not.toHaveAttribute('aria-activedescendant')
    await user.keyboard('{ArrowDown}')
    expect(field()).toHaveAttribute('aria-activedescendant', options[0]?.id)
    expect(options[0]).toHaveAttribute('aria-selected', 'true')
    await user.keyboard('{ArrowDown}')
    expect(field()).toHaveAttribute('aria-activedescendant', options[1]?.id)
    expect(options[0]).toHaveAttribute('aria-selected', 'false')
    await user.keyboard('{ArrowUp}{ArrowUp}')
    expect(field()).toHaveAttribute(
      'aria-activedescendant',
      options[options.length - 1]?.id
    )
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    expect(status()).toHaveTextContent(`${options[1]?.textContent ?? ''} added`)
  })

  it('ArrowUp from no highlight goes to the last suggestion', async () => {
    const user = userEvent.setup()
    open()
    await user.type(field(), 'onion{ArrowUp}')
    const options = screen.getAllByRole('option')
    expect(options[options.length - 1]).toHaveAttribute('aria-selected', 'true')
  })

  it('Escape closes the suggestions, then clears the field; ArrowDown opens them again', async () => {
    const user = userEvent.setup()
    open()
    await user.type(field(), 'car{ArrowDown}{Escape}')
    expect(field()).toHaveAttribute('aria-expanded', 'false')
    expect(field()).not.toHaveAttribute('aria-activedescendant')
    expect(field()).toHaveValue('car')
    await user.keyboard('{ArrowUp}')
    expect(field()).toHaveAttribute('aria-expanded', 'false')
    await user.keyboard('{ArrowDown}')
    expect(field()).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getAllByRole('option')[0]).toHaveAttribute(
      'aria-selected',
      'true'
    )
    await user.keyboard('{Escape}{Escape}')
    expect(field()).toHaveValue('')
    await user.keyboard('{Escape}{ArrowDown}')
    expect(field()).toHaveValue('')
    expect(field()).toHaveAttribute('aria-expanded', 'false')
  })

  it('Tab completes the highlighted suggestion and stays; without a highlight it moves on', async () => {
    const user = userEvent.setup()
    open()
    await user.type(field(), '2 car{ArrowDown}{Tab}')
    expect(field()).toHaveValue('2 carrot')
    expect(field()).toHaveFocus()
    await user.type(field(), ', oni{ArrowDown}')
    await user.keyboard('{Shift>}{Tab}{/Shift}')
    expect(field()).not.toHaveFocus()
    await user.click(field())
    await user.tab()
    expect(field()).not.toHaveFocus()
  })

  it('leaving the field drops the highlight', async () => {
    const user = userEvent.setup()
    open()
    await user.type(field(), 'car{ArrowDown}')
    act(() => field().blur())
    expect(field()).not.toHaveAttribute('aria-activedescendant')
  })

  it('"/" from anywhere on the page goes to the field, but not while typing elsewhere', async () => {
    const user = userEvent.setup()
    open()
    const back = screen.getByRole('link', { name: 'Back to your list' })
    act(() => back.focus())
    await user.keyboard('/')
    expect(field()).toHaveFocus()
    expect(field()).toHaveValue('')
    await user.keyboard('/')
    expect(field()).toHaveValue('/')
    act(() => back.focus())
    await user.keyboard('{Control>}/{/Control}')
    expect(back).toHaveFocus()
    await user.keyboard('{Meta>}/{/Meta}{Alt>}/{/Alt}a')
    expect(back).toHaveFocus()
    const editable = document.createElement('div')
    Object.defineProperty(editable, 'isContentEditable', { value: true })
    document.body.append(editable)
    fireEvent.keyDown(editable, { key: '/' })
    expect(back).toHaveFocus()
    fireEvent.keyDown(document, { key: '/' })
    expect(field()).toHaveFocus()
    editable.remove()
  })

  it('lists the shortcuts', () => {
    open()
    const group = screen.getByText('Keyboard shortcuts').closest('details')
    expect(group).not.toBeNull()
    expect(within(group as HTMLElement).getAllByRole('term')).toHaveLength(6)
  })
})

describe('rapid entry: paste and undo', () => {
  it('a pasted list goes on at once, bullets and all, with what was typed', async () => {
    const user = userEvent.setup()
    open()
    await user.type(field(), 'carrot')
    await user.paste('- [ ] 2 eggs\n- garlic\n\n3. honey')
    expect(status()).toHaveTextContent('Carrot, Eggs, Garlic, Honey added')
    expect(listed()).toMatchObject([
      { ingredientId: 'carrot' },
      { ingredientId: 'egg', quantity: 2 },
      { ingredientId: 'garlic' },
      { ingredientId: 'honey' }
    ])
    expect(field()).toHaveValue('')
  })

  it('a pasted word is just typed', async () => {
    const user = userEvent.setup()
    open()
    await user.paste('garlic')
    expect(field()).toHaveValue('garlic')
    expect(listed()).toEqual([])
  })

  it('Undo takes the last add off the list and out of the history, and comes back to the field', async () => {
    const user = userEvent.setup()
    open()
    await user.type(field(), 'garlic{Enter}')
    await user.type(field(), 'carrot and onion{Enter}')
    await user.click(
      screen.getByRole('button', { name: 'Undo adding Carrot, Brown onion' })
    )
    expect(listedIds()).toEqual(['garlic'])
    expect(stored().map(({ itemId }) => itemId)).toEqual(['garlic'])
    expect(status()).toHaveTextContent(
      'Carrot, Brown onion taken off your list'
    )
    expect(field()).toHaveFocus()
    expect(screen.queryByRole('button', { name: /^Undo/ })).toBeNull()
  })

  it('Ctrl+Z or Cmd+Z in an empty field undoes; with text it is the field’s own undo', async () => {
    const user = userEvent.setup()
    open()
    await user.type(field(), 'garlic{Enter}')
    await user.type(field(), 'x{Control>}z{/Control}')
    expect(listedIds()).toEqual(['garlic'])
    await user.clear(field())
    await user.keyboard('z')
    expect(field()).toHaveValue('z')
    await user.clear(field())
    await user.keyboard('{Control>}z{/Control}')
    expect(listedIds()).toEqual([])
    expect(status()).toHaveTextContent('Garlic taken off your list')
    await user.type(field(), 'carrot{Enter}{Meta>}z{/Meta}')
    expect(listedIds()).toEqual([])
    await user.keyboard('{Control>}z{/Control}')
    expect(status()).toHaveTextContent('Carrot taken off your list')
  })
})

describe('one tap: recent, often added, examples', () => {
  const now = new Date('2026-11-10T12:00:00').getTime()
  const hour = 3_600_000

  it('shows recent and often-added items not on the list, and adds in one tap', async () => {
    seed([
      ...['garlic', 'egg', 'honey', 'jam', 'lime', 'tea-bags', 'butter'].map(
        (id, i) => entry(`r${i}`, id, now - i * hour)
      ),
      entry('c1', 'carrot', now - 20 * hour),
      entry('c2', 'carrot', now - 21 * hour),
      entry('b2', 'butter', now - 22 * hour),
      entry('gone', 'not-in-the-catalogue', now - 23 * hour)
    ])
    const user = userEvent.setup()
    open()
    const recent = screen.getByRole('region', { name: 'Recently added' })
    expect(
      within(recent)
        .getAllByRole('button')
        .map((b) => b.textContent)
    ).toEqual(['Garlic', 'Eggs', 'Honey', 'Jam', 'Lime', 'Tea bags'])
    const often = screen.getByRole('region', { name: 'Often added' })
    expect(
      within(often)
        .getAllByRole('button')
        .map((b) => b.textContent)
    ).toEqual(['Butter', 'Carrot'])
    expect(screen.queryByRole('region', { name: 'Try one' })).toBeNull()
    await user.click(within(often).getByRole('button', { name: 'Add carrot' }))
    expect(listedIds()).toEqual(['carrot'])
    expect(field()).toHaveFocus()
    expect(
      within(
        screen.getByRole('region', { name: 'Recently added' })
      ).queryByRole('button', { name: 'Add carrot' })
    ).toBeNull()
  })

  it('hides the chips while typing', async () => {
    seed([entry('a', 'garlic', now)])
    const user = userEvent.setup()
    open()
    expect(screen.getByRole('region', { name: 'Recently added' })).toBeVisible()
    await user.type(field(), 'g')
    expect(screen.queryByRole('region', { name: 'Recently added' })).toBeNull()
  })

  it('an example goes into the field to try, and the examples turn over after each add', async () => {
    const user = userEvent.setup()
    open()
    const tryOne = screen.getByRole('region', { name: 'Try one' })
    await user.click(within(tryOne).getByRole('button', { name: '3 carrots' }))
    expect(field()).toHaveValue('3 carrots')
    expect(field()).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(field()).toHaveAttribute('placeholder', 'Try “2 tins of chickpeas”')
    const more = screen.getByText('More examples').closest('details')
    expect(within(more as HTMLElement).getAllByRole('button')).toHaveLength(16)
  })
})

describe('history', () => {
  const now = new Date('2026-11-10T12:00:00').getTime()
  const day = 86_400_000
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(now)
  })
  afterEach(() => jest.restoreAllMocks())

  const seeded = () =>
    seed([
      entry('t1', 'carrot', now - 1000, 3),
      entry('t2', 'garlic', now - 2000),
      entry('gone', 'not-in-the-catalogue', now - 3000),
      entry('y1', 'onion', now - day),
      entry('old', 'egg', now - 4 * day),
      entry('lost', 'not-in-the-catalogue', now - 6 * day)
    ])

  it('reads newest first, in days, skipping items the catalogue no longer has', () => {
    seeded()
    open()
    const days = within(history()).getAllByRole('heading', { level: 3 })
    expect(days.map((h) => h.textContent)).toEqual([
      'Today',
      'Yesterday',
      expect.stringMatching(/Friday/)
    ])
    expect(historyButtons().map((b) => b.getAttribute('aria-label'))).toEqual([
      'Add carrot ×3 again',
      'Add garlic again',
      'Add brown onion again',
      'Add eggs again'
    ])
    expect(
      within(history()).getAllByRole('button', { name: /^Remove / })[0]
    ).toHaveAccessibleName(/^Remove carrot, .+, from history$/)
  })

  it('adds an entry again in one tap, with its quantity', async () => {
    seeded()
    const user = userEvent.setup()
    open()
    await user.click(
      within(history()).getByRole('button', { name: 'Add carrot ×3 again' })
    )
    expect(listed()).toMatchObject([{ ingredientId: 'carrot', quantity: 3 }])
    expect(historyButtons()).toHaveLength(5)
    expect(field()).toHaveFocus()
  })

  it('removes one entry and moves focus to the next, then the one before, then the heading', async () => {
    seed([entry('a', 'carrot', now - 1000), entry('b', 'garlic', now - 2000)])
    const user = userEvent.setup()
    open()
    await user.click(
      within(history()).getByRole('button', { name: /^Remove carrot/ })
    )
    expect(status()).toHaveTextContent('Carrot removed from history')
    expect(stored().map(({ id }) => id)).toEqual(['b'])
    await waitFor(() =>
      expect(
        within(history()).getByRole('button', { name: /^Remove garlic/ })
      ).toHaveFocus()
    )
    await user.keyboard('{Enter}')
    await waitFor(() =>
      expect(
        within(history()).getByRole('heading', { level: 2, name: 'History' })
      ).toHaveFocus()
    )
    expect(within(history()).getByText(/Nothing yet/)).toBeInTheDocument()
  })

  it('removing the last entry of several moves focus to the one before', async () => {
    seed([entry('a', 'carrot', now - 1000), entry('b', 'garlic', now - 2000)])
    const user = userEvent.setup()
    open()
    await user.click(
      within(history()).getByRole('button', { name: /^Remove garlic/ })
    )
    await waitFor(() =>
      expect(
        within(history()).getByRole('button', { name: /^Remove carrot/ })
      ).toHaveFocus()
    )
  })

  it('clears everything only after a question, with Keep focused first', async () => {
    seeded()
    const user = userEvent.setup()
    open()
    await user.click(screen.getByRole('button', { name: 'Clear history' }))
    const question = screen.getByRole('group', { name: /Clear all of your/ })
    await waitFor(() =>
      expect(
        within(question).getByRole('button', { name: 'Keep' })
      ).toHaveFocus()
    )
    await user.keyboard('{Enter}')
    expect(
      screen.queryByRole('group', { name: /Clear all of your/ })
    ).toBeNull()
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Clear history' })
      ).toHaveFocus()
    )
    expect(historyButtons()).toHaveLength(4)
    await user.click(screen.getByRole('button', { name: 'Clear history' }))
    await user.click(screen.getByRole('button', { name: 'Clear all' }))
    expect(stored()).toEqual([])
    expect(status()).toHaveTextContent('History cleared')
    expect(within(history()).getByText(/Nothing yet/)).toBeInTheDocument()
    expect(field()).toHaveFocus()
  })

  it('clearing also drops the Undo for the last add', async () => {
    const user = userEvent.setup()
    open()
    await user.type(field(), 'carrot{Enter}')
    await user.click(screen.getByRole('button', { name: 'Clear history' }))
    await user.click(screen.getByRole('button', { name: 'Clear all' }))
    expect(screen.queryByRole('button', { name: /^Undo/ })).toBeNull()
    expect(listedIds()).toEqual(['carrot'])
  })

  it('a question left open goes when the page goes', () => {
    seeded()
    const { unmount } = open()
    fireEvent.click(screen.getByRole('button', { name: 'Clear history' }))
    unmount()
  })
})

class FakeRecogniser {
  static last: FakeRecogniser | null = null
  lang = ''
  continuous = false
  interimResults = false
  onresult: ((event: unknown) => void) | null = null
  onend: (() => void) | null = null
  onerror: (() => void) | null = null
  start = jest.fn()
  stop = jest.fn(() => this.onend?.())
  constructor() {
    FakeRecogniser.last = this
  }
}

const say = (text: string) =>
  act(() =>
    FakeRecogniser.last?.onresult?.({
      resultIndex: 0,
      results: [{ isFinal: true, 0: { transcript: text } }]
    })
  )

describe('voice (the browser’s own recogniser)', () => {
  it('has no microphone button when the browser cannot listen', () => {
    open()
    expect(screen.queryByRole('button', { name: 'Speak' })).toBeNull()
  })

  describe('in a browser that can listen', () => {
    beforeEach(() => {
      Reflect.set(window, 'webkitSpeechRecognition', FakeRecogniser)
    })
    afterEach(() => {
      Reflect.deleteProperty(window, 'webkitSpeechRecognition')
    })

    it('listens while pressed, adds what is said, and stops when pressed again', async () => {
      const user = userEvent.setup()
      open()
      await user.click(screen.getByRole('button', { name: 'Speak' }))
      expect(FakeRecogniser.last?.start).toHaveBeenCalled()
      expect(FakeRecogniser.last?.continuous).toBe(true)
      expect(
        screen.getByRole('button', { name: 'Stop listening' })
      ).toHaveAttribute('aria-pressed', 'true')
      say('2 carrots and onion')
      expect(screen.getByRole('status')).toHaveTextContent(
        'Carrot, Brown onion added'
      )
      say('garlic')
      expect(historyButtons()).toHaveLength(3)
      await user.click(screen.getByRole('button', { name: 'Stop listening' }))
      expect(FakeRecogniser.last?.stop).toHaveBeenCalled()
      expect(screen.getByRole('button', { name: 'Speak' })).toHaveAttribute(
        'aria-pressed',
        'false'
      )
    })

    it('goes back to Speak when the recogniser ends by itself', async () => {
      const user = userEvent.setup()
      open()
      await user.click(screen.getByRole('button', { name: 'Speak' }))
      act(() => FakeRecogniser.last?.onerror?.())
      expect(screen.getByRole('button', { name: 'Speak' })).toBeInTheDocument()
    })

    it('stops listening when the page goes', async () => {
      const user = userEvent.setup()
      const { unmount } = open()
      await user.click(screen.getByRole('button', { name: 'Speak' }))
      unmount()
      expect(FakeRecogniser.last?.stop).toHaveBeenCalled()
    })
  })
})
