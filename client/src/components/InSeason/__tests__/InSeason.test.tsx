import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { catalogue } from '../../../utils/library/recipeLibrary'
import { PICK_PRICE_CENTS } from '../../../utils/micropayment/micropayment'
import { parseSeasons } from '../../../utils/seasons/seasons'
import { InSeason } from '../InSeason'
import type { InSeasonProps } from '../InSeason'

expect.extend(toHaveNoViolations)

/** 15 Nov 2026 in Sydney: tomato, cucumber, zucchini, corn... are in season. */
const NOVEMBER = new Date('2026-11-15T10:00:00+11:00')
/** A calendar where nothing in the library is in season. */
const BARE = parseSeasons({
  region: 'sydney',
  timeZone: 'Australia/Sydney',
  ingredients: { 'not-in-the-library': [11] }
})

const handlers = () => ({
  onTogglePicked: jest.fn(),
  onAddIngredient: jest.fn(),
  onList: jest.fn((id: string) => id === 'cucumber')
})

const setup = (props: Partial<InSeasonProps> = {}) => {
  const h = handlers()
  const view = render(
    <InSeason
      now={NOVEMBER}
      pickedIds={new Set()}
      micropayments={false}
      {...h}
      {...props}
    />
  )
  return { ...view, ...h }
}

beforeEach(() => localStorage.clear())

describe('InSeason (#218)', () => {
  it('names the month in Sydney and says it is only a guide', () => {
    setup()
    expect(
      screen.getByRole('region', { name: 'In season now' })
    ).toBeInTheDocument()
    expect(screen.getByText('November in Sydney')).toBeInTheDocument()
    expect(screen.getByText(/A guide only/)).toBeInTheDocument()
  })

  it('reads the month in Sydney, not the device: 31 Oct 14:00 UTC is November', () => {
    setup({ now: new Date('2026-10-31T14:00:00Z') })
    expect(screen.getByText('November in Sydney')).toBeInTheDocument()
  })

  it('lists in-season ingredients as text buttons, and adds one', () => {
    const { onAddIngredient } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Add tomatoes' }))
    expect(onAddIngredient).toHaveBeenCalledWith(
      catalogue.find((item) => item.id === 'tomato')
    )
  })

  it('says when an ingredient is already on the list', () => {
    setup()
    expect(
      screen.getByRole('button', { name: 'Lebanese cucumber, on your list' })
    ).toBeInTheDocument()
  })

  it('lists recipes using something in season, saying what, and picks one', () => {
    const { onTogglePicked } = setup()
    const button = screen.getByRole('button', {
      name: /Pick Greek salad with haloumi/
    })
    expect(button).toHaveTextContent('In season:')
    expect(button).toHaveTextContent(/tomato/i)
    fireEvent.click(button)
    expect(onTogglePicked).toHaveBeenCalledTimes(1)
    expect(onTogglePicked.mock.calls[0]?.[0]).toMatchObject({
      id: 'greek-salad-haloumi'
    })
  })

  it('shows a picked recipe as pressed', () => {
    setup({ pickedIds: new Set(['greek-salad-haloumi']) })
    expect(
      screen.getByRole('button', { name: /Pick Greek salad with haloumi/ })
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('has no editor’s pick unless the micropayments flag is on', () => {
    setup()
    expect(screen.queryByText("Editor's pick")).not.toBeInTheDocument()
  })

  it('has no recipes group when no recipe uses anything in season', () => {
    setup({ calendar: BARE })
    expect(
      screen.queryByRole('heading', {
        name: 'Recipes using something in season'
      })
    ).not.toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = setup({ micropayments: true })
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('the stubbed editor’s pick (#218)', () => {
  const unlockButton = () =>
    screen.getByRole('button', { name: /Unlock why it is in season/ })

  it('unlocks through the gateway, with no charge, and remembers it', async () => {
    const gateway = {
      charge: jest.fn((request: { productId: string }) =>
        Promise.resolve({
          id: 'r1',
          amountCents: PICK_PRICE_CENTS,
          currency: 'usd' as const,
          charged: false,
          productId: request.productId
        })
      )
    }
    const view = setup({ micropayments: true, gateway })
    expect(screen.getByText("Editor's pick")).toBeInTheDocument()
    expect(unlockButton()).toHaveTextContent('1 USD (stub, no charge)')
    fireEvent.click(unlockButton())
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Unlocked. This is a stub: you were not charged.'
    )
    expect(gateway.charge).toHaveBeenCalledWith({
      productId: 'pick:greek-salad-haloumi',
      amountCents: PICK_PRICE_CENTS,
      currency: 'usd'
    })
    expect(screen.getByText(/Why it is in season:/)).toBeInTheDocument()
    view.unmount()
    setup({ micropayments: true, gateway })
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('works with the default stub gateway', async () => {
    setup({ micropayments: true })
    fireEvent.click(unlockButton())
    expect(await screen.findByRole('status')).toBeInTheDocument()
  })

  it('shows progress, and a failure that did not charge', async () => {
    let fail: (error: Error) => void = () => undefined
    const gateway = {
      charge: () =>
        new Promise<never>((_, reject) => {
          fail = reject
        })
    }
    setup({ micropayments: true, gateway })
    fireEvent.click(unlockButton())
    expect(
      await screen.findByRole('button', { name: 'Unlocking…' })
    ).toBeDisabled()
    fail(new Error('declined'))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'You have not been charged.'
    )
    await waitFor(() => expect(unlockButton()).toBeEnabled())
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('has no pick when nothing in the library is in season', () => {
    setup({ micropayments: true, calendar: BARE })
    expect(screen.queryByText("Editor's pick")).not.toBeInTheDocument()
  })
})
