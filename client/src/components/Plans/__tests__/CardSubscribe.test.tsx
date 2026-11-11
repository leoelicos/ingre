import '@testing-library/jest-dom'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import type { MockedResponse } from '@apollo/client/testing'
import { axe, toHaveNoViolations } from 'jest-axe'
import { SUBSCRIBE } from '../../../lib/apollo/graphQL/mutations'
import { GET_TIER } from '../../../lib/apollo/graphQL/queries'
import type { Tier } from '../../../lib/apollo/graphQL/typedefs'
import { logIn, renderWithProviders } from '../../../test/providers'
import { testModeKey } from '../../../utils/stripe/key'
import { markFirstEndToEnd } from '../../../utils/tier/upsell'
import type { LoadCard } from '../Plans'
import { Plans, cardLoader } from '../Plans'

expect.extend(toHaveNoViolations)

/*
 * #312: paying for a tier in place. Stripe.js is a stand-in `window.Stripe` (loaded by the real
 * loadStripe), and its createToken answers with Stripe's documented test tokens
 * (https://docs.stripe.com/testing): tok_visa pays; a declined card never becomes a token.
 */

const IN_APP_MAIN = { rules: { region: { enabled: false } } }

type TokenResult =
  | { token: { id: string }; error?: undefined }
  | { token?: undefined; error: { message?: string } }

const createToken = jest.fn<Promise<TokenResult>, [unknown]>()
const card = {
  mount: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
}
const elements = {
  create: jest.fn(() => card),
  getElement: jest.fn(() => card),
  update: jest.fn()
}

Object.defineProperty(window, 'Stripe', {
  configurable: true,
  value: Object.assign(
    () => ({
      elements: () => elements,
      createToken,
      createPaymentMethod: jest.fn(),
      confirmCardPayment: jest.fn()
    }),
    { version: 3 }
  )
})

const tierOf = (tier: Tier | null): MockedResponse => ({
  request: { query: GET_TIER },
  result: { data: { getUser: { __typename: 'User', _id: 'u1', tier } } }
})

const subscribed = (
  token: string,
  active: boolean,
  tier: Tier = 'MANAGER'
): MockedResponse => ({
  request: { query: SUBSCRIBE, variables: { tier, token } },
  result: {
    data: {
      subscribe: {
        __typename: 'TierSubscription',
        tier,
        status: active ? 'active' : 'incomplete',
        active
      }
    }
  }
})

const open = async (
  mocks: MockedResponse[],
  loadCard: LoadCard = cardLoader('pk_test_unit')
) => {
  markFirstEndToEnd()
  logIn(false)
  renderWithProviders(<Plans loadCard={loadCard} />, {
    mocks: [tierOf(null), ...mocks, tierOf('MANAGER')],
    path: '/upgrade',
    routes: {}
  })
  fireEvent.click(await screen.findByRole('button', { name: 'Choose Manager' }))
  return screen.findByRole('form', { name: 'Pay for Manager' })
}

const pay = (form: HTMLElement) =>
  fireEvent.click(
    within(form).getByRole('button', { name: 'Pay 8 USD a month' })
  )

beforeEach(() => {
  localStorage.clear()
  elements.create.mockImplementation(() => card)
  elements.getElement.mockImplementation(() => card)
})

describe('the publishable key', () => {
  it('is test mode only', () => {
    expect(testModeKey('pk_test_abc')).toBe('pk_test_abc')
    expect(testModeKey('pk_live_abc')).toBeNull()
    expect(testModeKey('')).toBeNull()
    expect(cardLoader(null)).toBeNull()
  })
})

describe('paying for a tier by card (#312)', () => {
  it('tok_visa: tokenises the card with createToken, sends only the token, and says it is done', async () => {
    createToken.mockResolvedValue({ token: { id: 'tok_visa' } })
    const form = await open([subscribed('tok_visa', true)])
    await waitFor(() => expect(card.mount).toHaveBeenCalled())
    expect(elements.create).toHaveBeenCalledWith('card', {})
    expect(
      within(form).getByRole('group', { name: 'Card details' })
    ).toBeInTheDocument()
    expect(
      within(form).getByText(/4242 4242 4242 4242 pays/)
    ).toBeInTheDocument()
    expect(await axe(document.body, IN_APP_MAIN)).toHaveNoViolations()
    pay(form)
    expect(within(form).getByRole('status')).toHaveTextContent('Paying…')
    pay(form)
    expect(
      await within(form).findByText('Done: you are on Manager.')
    ).toBeInTheDocument()
    expect(createToken).toHaveBeenCalledTimes(1)
    expect(createToken).toHaveBeenCalledWith(card)
  })

  it('a card Stripe.js declines never reaches the server', async () => {
    createToken.mockResolvedValue({
      error: { message: 'Your card number is incomplete.' }
    })
    const form = await open([])
    pay(form)
    expect(await within(form).findByRole('alert')).toHaveTextContent(
      'Your card was declined: Your card number is incomplete.'
    )
    createToken.mockResolvedValue({ error: {} })
    pay(form)
    await waitFor(() =>
      expect(within(form).getByRole('alert')).toHaveTextContent(
        /^Your card was declined:$/
      )
    )
  })

  it('tok_visa_chargeDeclined: shows the server’s decline', async () => {
    createToken.mockResolvedValue({ token: { id: 'tok_visa_chargeDeclined' } })
    const form = await open([
      {
        request: {
          query: SUBSCRIBE,
          variables: { tier: 'MANAGER', token: 'tok_visa_chargeDeclined' }
        },
        result: {
          errors: [
            {
              message: 'Your card was declined.',
              extensions: { code: 'PAYMENT_DECLINED', decline: 'card_declined' }
            }
          ]
        }
      }
    ])
    pay(form)
    expect(await within(form).findByRole('alert')).toHaveTextContent(
      'Your card was declined: Your card was declined.'
    )
  })

  it('tok_chargeCustomerFail: saved, but the first payment failed', async () => {
    createToken.mockResolvedValue({ token: { id: 'tok_chargeCustomerFail' } })
    const form = await open([subscribed('tok_chargeCustomerFail', false)])
    pay(form)
    expect(await within(form).findByRole('alert')).toHaveTextContent(
      'the first payment did not go through'
    )
  })

  it('says it could not reach Stripe when the server or Stripe.js fails', async () => {
    createToken.mockResolvedValue({ token: { id: 'tok_visa' } })
    const form = await open([
      {
        request: {
          query: SUBSCRIBE,
          variables: { tier: 'MANAGER', token: 'tok_visa' }
        },
        error: new Error('down')
      }
    ])
    pay(form)
    expect(await within(form).findByRole('alert')).toHaveTextContent(
      "Couldn't reach Stripe"
    )
    createToken.mockRejectedValue(new Error('Stripe.js broke'))
    pay(form)
    await waitFor(() => expect(createToken).toHaveBeenCalledTimes(2))
    expect(await within(form).findByRole('alert')).toHaveTextContent(
      "Couldn't reach Stripe"
    )
  })

  it('without Stripe.js, or a card field, it cannot pay', async () => {
    const form = await open([], () => Promise.resolve(null))
    pay(form)
    expect(await within(form).findByRole('alert')).toHaveTextContent(
      "Couldn't reach Stripe"
    )
  })

  it('choosing another tier keeps Stripe.js and shows that tier’s form', async () => {
    const load = jest.fn(
      cardLoader('pk_test_unit') ?? (() => Promise.resolve(null))
    )
    await open([], load)
    fireEvent.click(screen.getByRole('button', { name: 'Choose Leader' }))
    expect(
      await screen.findByRole('form', { name: 'Pay for Leader' })
    ).toBeInTheDocument()
    expect(load).toHaveBeenCalledTimes(1)
  })
})
