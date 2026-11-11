import '@testing-library/jest-dom'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import { resetViewport, setViewportWidth } from '../../../test/media'
import { EXTRAS_KEY } from '../../../utils/storage/shoppingState'
import type { Abilities } from '../../../utils/voice/engine'
import type { Engine, Listener } from '../../../utils/voice/types'
import type { VoiceSetup } from '../../../utils/voice/useVoiceCapture'
import { ALL_TILES } from '../../../utils/warroom/rank'
import { SETTLE_MS } from '../../../utils/warroom/useWarRoom'
import { WarRoom } from '../WarRoom'

expect.extend(toHaveNoViolations)

beforeEach(() => localStorage.clear())

/* The War room's poster grid (t34u): adds on one tap and stays accessible. */

const open = () =>
  render(
    <MemoryRouter initialEntries={['/war-room']}>
      <WarRoom />
    </MemoryRouter>
  )
const wall = () => screen.getByRole('list', { name: 'Ingredients and recipes' })
const field = () =>
  screen.getByRole('searchbox', { name: 'Search, type or paste a list' })
const listed = (): { ingredientId: string; quantity: number }[] =>
  JSON.parse(localStorage.getItem(EXTRAS_KEY) ?? '[]')

describe('the poster grid', () => {
  it('adds on one tap, takes one off with minus, and passes axe', async () => {
    const user = userEvent.setup()
    const { container } = open()
    const banana = within(wall()).getByRole('button', { name: 'Add banana' })
    await user.click(banana)
    await user.click(banana)
    expect(listed()).toMatchObject([{ ingredientId: 'banana', quantity: 2 }])
    expect(
      within(wall()).getByRole('button', { name: 'Add banana, 2 on list' })
    ).toBeInTheDocument()
    await user.click(
      within(wall()).getByRole('button', { name: 'One less banana' })
    )
    expect(listed()).toMatchObject([{ ingredientId: 'banana', quantity: 1 }])
    expect(await axe(container)).toHaveNoViolations()
  })

  it('"ba" shows Banana first; Enter adds it and keeps the field', async () => {
    const user = userEvent.setup()
    open()
    await user.keyboard('/')
    expect(field()).toHaveFocus()
    await user.keyboard('ba')
    const matches = screen.getByRole('list', { name: 'Matches' })
    const first = within(matches).getAllByRole('button')[0]
    expect(first).toHaveAccessibleName('Add banana')
    await user.keyboard('{Enter}')
    expect(listed()).toMatchObject([{ ingredientId: 'banana', quantity: 1 }])
    expect(field()).toHaveFocus()
    expect(field()).toHaveValue('')
  })

  it('the kind toggle filters the wall and is remembered', async () => {
    const user = userEvent.setup()
    const { unmount } = open()
    await user.click(screen.getByRole('radio', { name: 'Recipes' }))
    expect(
      within(wall()).queryByRole('button', { name: 'Add banana' })
    ).not.toBeInTheDocument()
    unmount()
    open()
    expect(screen.getByRole('radio', { name: 'Recipes' })).toBeChecked()
  })
})

/* ---- the rest of the poster grid: voice, keys, paste, recipes, Undo, suggestions ---- */

interface Running {
  readonly lang: string
  readonly listener: Listener
  readonly stop: jest.Mock
  readonly cancel: jest.Mock
}

const fakeVoice = (abilities: Partial<Abilities>) => {
  const runs: Running[] = []
  const engine: Engine = (lang, listener) => {
    const run = { lang, listener, stop: jest.fn(), cancel: jest.fn() }
    runs.push(run)
    return run
  }
  const setup = (): VoiceSetup => ({
    abilities: { native: false, webSpeech: false, record: false, ...abilities },
    engines: { native: engine, webSpeech: engine, onDevice: engine },
    lang: () => 'en-AU'
  })
  return { runs, setup }
}

const openWith = (setup: () => VoiceSetup) =>
  render(
    <MemoryRouter initialEntries={['/war-room']}>
      <WarRoom setup={setup} />
    </MemoryRouter>
  )

const talk = () => screen.getByRole('button', { name: 'Talk' })
const said = () => screen.getByRole('status')
const live = () =>
  screen.getByText(
    (_, element) =>
      element?.tagName === 'P' &&
      element.getAttribute('aria-live') === 'polite' &&
      element.id === ''
  )

describe('the big yellow mic on the bar’s edge', () => {
  it('is not there when the device cannot listen, and the field keeps its own padding', () => {
    openWith(fakeVoice({}).setup)
    expect(screen.queryByRole('button', { name: 'Talk' })).toBeNull()
    expect(field().className).toContain('pr-3')
  })

  it('sits half over the field’s right-hand edge, yellow with ink, and says where the audio goes', () => {
    openWith(fakeVoice({ webSpeech: true }).setup)
    expect(talk().className).toContain('bg-mic')
    expect(talk().className).toContain('text-on-mic')
    expect(talk().className).toContain('-right-7')
    expect(talk().className).toContain('h-14')
    expect(field().className).toContain('pr-10')
    expect(talk()).toHaveAccessibleDescription(
      'Uses your browser’s speech recognition, which may send audio to Google or Apple.'
    )
  })

  it('on-device: says the first download', () => {
    openWith(fakeVoice({ record: true }).setup)
    expect(talk()).toHaveAccessibleDescription(/Recognised on this device/)
    expect(talk()).toHaveAccessibleDescription(/MB speech model/)
  })

  it('a tap listens, shows what it hears, adds what is said, and a tap stops', async () => {
    const user = userEvent.setup()
    const { runs } = fakeVoice({ webSpeech: true })
    const voice = fakeVoice({ webSpeech: true })
    openWith(voice.setup)
    expect(runs).toHaveLength(0)
    await user.click(talk())
    const run = voice.runs[0]
    expect(run?.lang).toBe('en-AU')
    expect(talk()).toHaveAttribute('aria-pressed', 'true')
    expect(talk().className).toContain('motion-safe:animate-pulse')
    expect(live()).toHaveTextContent('Starting the microphone')
    act(() => run?.listener.listening())
    expect(live()).toHaveTextContent('Listening')
    act(() => run?.listener.interim('two bana'))
    expect(live()).toHaveTextContent('Hearing: two bana')
    act(() => run?.listener.final('Two bananas.'))
    expect(listed()).toMatchObject([{ ingredientId: 'banana', quantity: 2 }])
    await user.click(talk())
    expect(run?.stop).toHaveBeenCalled()
    act(() => run?.listener.transcribing())
    expect(live()).toHaveTextContent('Working out what you said')
    act(() => run?.listener.end())
    expect(talk()).toHaveAttribute('aria-pressed', 'false')
    expect(live()).toHaveTextContent('')
    expect(live()).toHaveClass('sr-only')
  })

  it('shows the model download, then an error in words', async () => {
    const user = userEvent.setup()
    const voice = fakeVoice({ record: true })
    openWith(voice.setup)
    await user.click(talk())
    const run = voice.runs[0]
    act(() => run?.listener.download({ loaded: 5e6, total: 34e6 }))
    expect(live()).toHaveTextContent('Downloading the speech model: 5 of 34 MB')
    act(() => run?.listener.error('denied'))
    expect(live()).toHaveTextContent('The microphone is blocked.')
  })
})

describe('the search field’s keys', () => {
  it('ArrowDown goes to the first tile; ArrowUp from the top row comes back', async () => {
    const user = userEvent.setup()
    open()
    await user.click(field())
    await user.keyboard('{ArrowDown}')
    expect(document.activeElement).toHaveAttribute('data-tile')
    await user.keyboard('{ArrowUp}')
    expect(field()).toHaveFocus()
  })

  it('Escape clears what was typed; Enter on nothing does nothing', async () => {
    const user = userEvent.setup()
    open()
    await user.click(field())
    await user.keyboard('{Escape}{Enter}')
    expect(listed()).toEqual([])
    await user.keyboard('ba')
    expect(
      screen.getByText(/ matches\. Down arrow to reach them\.$/)
    ).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(field()).toHaveValue('')
  })

  it('a tapped match clears the search', async () => {
    const user = userEvent.setup()
    open()
    await user.click(field())
    await user.keyboard('ba')
    const matches = screen.getByRole('list', { name: 'Matches' })
    const first = within(matches).getAllByRole('button')[0]
    if (first === undefined) throw new Error('no match')
    await user.click(first)
    expect(field()).toHaveValue('')
    expect(listed()).toMatchObject([{ ingredientId: 'banana', quantity: 1 }])
  })

  it('says when nothing matches', async () => {
    const user = userEvent.setup()
    open()
    await user.click(field())
    await user.keyboard('zzzzq')
    expect(
      screen.getByText('No matches. Enter adds what you typed if it can.')
    ).toBeInTheDocument()
    await user.keyboard('{Enter}')
    expect(said()).toHaveTextContent('No match for zzzzq')
  })

  it('a typed list adds each once and says so; Ctrl+Z in an empty field undoes the last', async () => {
    const user = userEvent.setup()
    open()
    await user.click(field())
    await user.keyboard('banana, banana, 2 carrots{Enter}')
    expect(said()).toHaveTextContent('Banana, Carrot added')
    expect(listed()).toMatchObject([
      { ingredientId: 'banana', quantity: 1 },
      { ingredientId: 'carrot', quantity: 2 }
    ])
    await user.keyboard('{Control>}z{/Control}')
    expect(listed()).toHaveLength(2)
    await user.click(
      within(wall()).getByRole('button', { name: 'Add banana, 1 on list' })
    )
    await user.click(field())
    await user.keyboard('x{Control>}z{/Control}{Backspace}{Meta>}z{/Meta}')
    expect(listed()).toMatchObject([
      { ingredientId: 'banana', quantity: 1 },
      { ingredientId: 'carrot', quantity: 2 }
    ])
  })

  it('a pasted list goes on at once; a pasted word is just typed', async () => {
    const user = userEvent.setup()
    open()
    await user.click(field())
    await user.paste('banana')
    expect(field()).toHaveValue('banana')
    await user.clear(field())
    await user.paste('- banana\n- carrot')
    expect(listed().map(({ ingredientId }) => ingredientId)).toEqual([
      'banana',
      'carrot'
    ])
  })
})

describe('Undo, minus and recipes', () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = jest.fn()
  })

  it('Undo takes the last tap back; minus to none takes it off the list', async () => {
    const user = userEvent.setup()
    open()
    const undo = () => screen.getByRole('button', { name: /^Undo/ })
    expect(undo()).toBeDisabled()
    await user.click(within(wall()).getByRole('button', { name: 'Add banana' }))
    await user.click(
      within(wall()).getByRole('button', { name: 'Add banana, 1 on list' })
    )
    expect(undo()).toHaveAccessibleName('Undo Banana ×2')
    await user.click(undo())
    expect(listed()).toMatchObject([{ ingredientId: 'banana', quantity: 1 }])
    expect(said()).toHaveTextContent('Banana, 1 on list')
    await user.click(
      within(wall()).getByRole('button', { name: 'One less banana' })
    )
    expect(listed()).toEqual([])
    expect(said()).toHaveTextContent('Banana, none on list')
    await user.click(within(wall()).getByRole('button', { name: 'Add banana' }))
    await user.click(undo())
    expect(listed()).toEqual([])
  })

  it('the minus key on a tile takes one off; other keys move between tiles', async () => {
    const user = userEvent.setup()
    open()
    const banana = within(wall()).getByRole('button', { name: 'Add banana' })
    await user.click(banana)
    await user.click(banana)
    within(wall())
      .getByRole('button', { name: 'Add banana, 2 on list' })
      .focus()
    await user.keyboard('-')
    expect(listed()).toMatchObject([{ ingredientId: 'banana', quantity: 1 }])
    await user.keyboard('{Home}')
    expect(within(wall()).getAllByRole('button')[0]).toHaveFocus()
  })

  it('a recipe goes on in one tap, once, comes off with minus, and Undo takes it back', async () => {
    const user = userEvent.setup()
    open()
    await user.click(screen.getByRole('radio', { name: 'Recipes' }))
    const recipe = within(wall()).getAllByRole('button')[0]
    const name = recipe?.getAttribute('aria-label') ?? ''
    expect(name).toMatch(/^Add recipe: /)
    if (recipe === undefined) throw new Error('no recipe tile')
    await user.click(recipe)
    const on = within(wall()).getByRole('button', {
      name: /^Recipe: .*, on list$/
    })
    await user.click(on)
    expect(said()).toHaveTextContent(/, 1 on list$/)
    await user.click(
      within(wall()).getByRole('button', { name: /^Take .* recipe off$/ })
    )
    expect(said()).toHaveTextContent(/, none on list$/)
    expect(within(wall()).getAllByRole('button')[0]).toHaveAccessibleName(name)
    await user.click(within(wall()).getAllByRole('button')[0] ?? recipe)
    expect(within(wall()).getAllByRole('button')[0]).not.toHaveAccessibleName(
      name
    )
    await user.click(screen.getByRole('button', { name: /^Undo/ }))
    expect(within(wall()).getAllByRole('button')[0]).toHaveAccessibleName(name)
  })

  it('a recipe’s ingredients count as on the list', async () => {
    const user = userEvent.setup()
    open()
    await user.click(screen.getByRole('radio', { name: 'Recipes' }))
    const recipe = within(wall()).getAllByRole('button')[0]
    if (recipe === undefined) throw new Error('no recipe tile')
    await user.click(recipe)
    await user.click(screen.getByRole('radio', { name: 'Ingredients' }))
    expect(
      within(wall()).getAllByRole('button', { name: /, 1 on list$/ }).length
    ).toBeGreaterThan(0)
  })

  it('a stored kind the app does not know falls back to Both', () => {
    localStorage.setItem('ingre.warRoom.kind', '"zzz"')
    open()
    expect(screen.getByRole('radio', { name: 'Both' })).toBeChecked()
  })
})

describe('More: clear the history', () => {
  it('clears it, and Undo puts it back', async () => {
    const user = userEvent.setup()
    open()
    await user.click(within(wall()).getByRole('button', { name: 'Add banana' }))
    await user.click(screen.getByRole('button', { name: 'More' }))
    await user.click(screen.getByRole('menuitem', { name: 'Clear history' }))
    expect(said()).toHaveTextContent('History cleared')
    expect(localStorage.getItem('ingre.warRoom.history')).toBe('[]')
    await user.click(
      screen.getByRole('button', { name: 'Undo History cleared' })
    )
    expect(localStorage.getItem('ingre.warRoom.history')).not.toBe('[]')
  })
})

describe('suggestions settle after the last tap', () => {
  afterEach(() => jest.useRealTimers())

  it('fill the strip 600 ms later with things that go with the list, and a tap adds one', async () => {
    jest.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    open()
    const strip = () => screen.getByRole('list', { name: 'Suggestions' })
    await user.click(within(wall()).getByRole('button', { name: 'Add banana' }))
    await user.click(screen.getByRole('radio', { name: 'Ingredients' }))
    await user.click(field())
    await user.keyboard('beef mince{Enter}')
    act(() => jest.advanceTimersByTime(SETTLE_MS))
    const first = within(strip()).getAllByRole('button')[0]
    expect(first).toHaveAccessibleName(/, with /)
    if (first === undefined) throw new Error('no suggestion')
    await user.click(first)
    expect(listed().length).toBe(3)
  })

  it('pads with recipes to try, and with this person’s usuals', () => {
    jest.useFakeTimers()
    localStorage.setItem(
      'ingre.warRoom.history',
      JSON.stringify(
        ['quinoa', 'tofu', 'kale', 'tempeh', 'miso-paste'].map((itemId, i) => ({
          id: `h${i}`,
          itemId,
          quantity: 1,
          at: 1_000 + i
        }))
      )
    )
    open()
    const names = within(screen.getByRole('list', { name: 'Suggestions' }))
      .getAllByRole('button')
      .map((b) => b.getAttribute('aria-label'))
    expect(names.some((n) => n?.endsWith('try it'))).toBe(true)
  })

  it('pads with this person’s usuals beyond what the wall already shows', () => {
    const ids = ALL_TILES.filter((tile) => tile.kind === 'ingredient')
      .slice(0, 40)
      .map(({ id }) => id)
    localStorage.setItem(
      'ingre.warRoom.history',
      JSON.stringify(
        ids.map((itemId, i) => ({
          id: `h${i}`,
          itemId,
          quantity: 1,
          at: 1_000 + i
        }))
      )
    )
    open()
    const names = within(screen.getByRole('list', { name: 'Suggestions' }))
      .getAllByRole('button')
      .map((b) => b.getAttribute('aria-label'))
    expect(names.some((n) => n?.endsWith('usual'))).toBe(true)
  })
})

describe('on a tablet', () => {
  afterEach(() => resetViewport())

  it('draws bigger pictures', () => {
    setViewportWidth(768)
    open()
    const img = wall().querySelector('img')
    expect(img).toHaveAttribute('width', '64')
  })
})

describe('the bar under a sticky header', () => {
  it('sticks right under the app header', () => {
    const header = document.createElement('header')
    header.className = 'ingre-navbar'
    header.style.position = 'sticky'
    Object.defineProperty(header, 'offsetHeight', { value: 60 })
    document.body.append(header)
    const { unmount } = open()
    expect(field().closest('.sticky')).toHaveStyle({ top: '60px' })
    window.dispatchEvent(new Event('resize'))
    unmount()
    header.style.position = 'static'
    open()
    expect(field().closest('.sticky')).toHaveStyle({ top: '0px' })
    header.remove()
  })
})

describe('a picture that fails to load', () => {
  it('falls back to initials on the aisle colour', () => {
    open()
    const img = wall().querySelector('img')
    if (img === null) throw new Error('no picture')
    fireEvent.error(img)
    expect(screen.getAllByTestId('tile-fallback').length).toBe(1)
  })
})
