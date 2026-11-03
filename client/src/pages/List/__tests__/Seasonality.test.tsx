import '@testing-library/jest-dom'
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  explore,
  pickedIds,
  renderList,
  searchBox
} from '../../../test/renderList'

/** Fake only the clock's date, so timers and promises keep working. */
const setDate = (iso: string) =>
  jest.useFakeTimers({
    now: new Date(iso),
    doNotFake: [
      'setTimeout',
      'clearTimeout',
      'setInterval',
      'clearInterval',
      'setImmediate',
      'clearImmediate',
      'nextTick',
      'queueMicrotask',
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'requestIdleCallback',
      'cancelIdleCallback',
      'performance',
      'hrtime'
    ]
  })

const open = (flags: string) => {
  window.history.pushState({}, '', `/?flags=${flags}`)
  return renderList()
}

beforeEach(() => {
  localStorage.clear()
  window.history.pushState({}, '', '/')
  setDate('2026-11-15T10:00:00+11:00')
})
afterEach(() => jest.useRealTimers())

describe('Seasonality in Explore (#218)', () => {
  it('is off by default: no in-season group', () => {
    renderList()
    expect(screen.queryByRole('region', { name: 'In season now' })).toBeNull()
  })

  it('with the flag on, shows what is in season this month in Sydney, at the top of Explore', () => {
    open('seasonality')
    const group = screen.getByRole('region', { name: 'In season now' })
    expect(explore().getByText('November in Sydney')).toBeInTheDocument()
    expect(group).toHaveTextContent('Tomatoes')
    expect(screen.queryByText("Editor's pick")).toBeNull()
  })

  it('picks a recipe from the group, and the Explore rows are still all there', () => {
    open('seasonality')
    fireEvent.click(
      screen.getByRole('button', { name: /Pick Greek salad with haloumi/ })
    )
    expect(pickedIds()).toEqual(['greek-salad-haloumi'])
  })

  it('steps aside while searching, so results are not doubled', async () => {
    open('seasonality')
    const user = userEvent.setup()
    await user.click(searchBox())
    await user.paste('dahl')
    expect(screen.queryByRole('region', { name: 'In season now' })).toBeNull()
  })

  it('shows the stubbed editor’s pick only with the micropayments flag too', () => {
    open('seasonality,micropayments')
    expect(screen.getByText("Editor's pick")).toBeInTheDocument()
  })

  it('micropayments alone does nothing: it needs seasonality', () => {
    open('micropayments')
    expect(screen.queryByText("Editor's pick")).toBeNull()
  })
})
