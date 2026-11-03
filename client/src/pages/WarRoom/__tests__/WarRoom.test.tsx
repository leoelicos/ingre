import '@testing-library/jest-dom'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import { EXTRAS_KEY } from '../../../utils/storage/shoppingState'
import { WarRoom } from '../WarRoom'

expect.extend(toHaveNoViolations)

beforeEach(() => localStorage.clear())

/* Acceptance for #207: a bare capture list; type or say, it lands on the list with an inline acknowledgement. */

const open = () =>
  render(
    <MemoryRouter>
      <WarRoom />
    </MemoryRouter>
  )
const field = () => screen.getByRole('textbox', { name: 'Add an item' })
const captured = () => screen.queryByRole('list', { name: 'Captured' })
const listed = () => localStorage.getItem(EXTRAS_KEY) ?? ''

describe('typing', () => {
  it('opens with the field focused and nothing else in the way', () => {
    open()
    expect(field()).toHaveFocus()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'War room'
    )
    expect(captured()).toBeNull()
    expect(screen.queryByRole('list', { name: 'Matches' })).toBeNull()
  })

  it('autofills on every keystroke, on short and long names', async () => {
    const user = userEvent.setup()
    open()
    await user.type(field(), 'car')
    const matches = within(screen.getByRole('list', { name: 'Matches' }))
    expect(
      matches.getByRole('button', { name: 'Add carrot' })
    ).toBeInTheDocument()
    await user.clear(field())
    await user.type(field(), 'cream')
    expect(
      screen.getByRole('button', { name: 'Add thickened cream' })
    ).toBeInTheDocument()
  })

  it('a tap on a match adds it, says so inline, clears the field and keeps focus there', async () => {
    const user = userEvent.setup()
    open()
    await user.type(field(), 'car')
    await user.click(screen.getByRole('button', { name: 'Add carrot' }))
    expect(screen.getByRole('status')).toHaveTextContent('Carrot added')
    expect(field()).toHaveValue('')
    expect(field()).toHaveFocus()
    expect(
      within(screen.getByRole('list', { name: 'Captured' })).getByText('Carrot')
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      '1 captured'
    )
  })

  it('Enter adds the best match, with a quantity when one is typed', async () => {
    const user = userEvent.setup()
    open()
    await user.type(field(), '3 carrots{Enter}')
    expect(screen.getByRole('status')).toHaveTextContent('Carrot added')
    expect(
      within(screen.getByRole('list', { name: 'Captured' })).getByText('×3')
    ).toBeInTheDocument()
    expect(JSON.parse(listed())).toMatchObject([
      { ingredientId: 'carrot', quantity: 3 }
    ])
  })

  it('a quantity typed before picking a match goes with it', async () => {
    const user = userEvent.setup()
    open()
    await user.type(field(), '2 onion')
    await user.click(screen.getByRole('button', { name: 'Add brown onion' }))
    expect(
      within(screen.getByRole('list', { name: 'Captured' })).getByText('×2')
    ).toBeInTheDocument()
  })

  it('says when nothing matches, and when it is already on the list', async () => {
    const user = userEvent.setup()
    open()
    await user.type(field(), 'zzzz{Enter}')
    expect(screen.getByRole('status')).toHaveTextContent('No match for zzzz')
    expect(captured()).toBeNull()
    await user.type(field(), 'carrot{Enter}')
    await user.type(field(), 'carrot{Enter}')
    expect(screen.getByRole('status')).toHaveTextContent(
      'Carrot already on your list'
    )
    expect(
      within(screen.getByRole('list', { name: 'Captured' })).getAllByRole(
        'listitem'
      )
    ).toHaveLength(1)
  })

  it('several in one line, said once each', async () => {
    const user = userEvent.setup()
    open()
    await user.type(field(), 'carrot, onion and carrot{Enter}')
    expect(screen.getByRole('status')).toHaveTextContent(
      'Carrot, Brown onion added'
    )
    expect(
      within(screen.getByRole('list', { name: 'Captured' })).getAllByRole(
        'listitem'
      )
    ).toHaveLength(2)
  })

  it('has no way to undo here, and no accessibility violations', async () => {
    const user = userEvent.setup()
    const { container } = open()
    await user.type(field(), 'carrot{Enter}')
    expect(screen.queryByRole('button', { name: /undo|remove/i })).toBeNull()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('links back to the list', () => {
    open()
    expect(
      screen.getByRole('link', { name: 'Back to your list' })
    ).toHaveAttribute('href', '/')
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
      expect(
        within(screen.getByRole('list', { name: 'Captured' })).getAllByRole(
          'listitem'
        )
      ).toHaveLength(3)
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
