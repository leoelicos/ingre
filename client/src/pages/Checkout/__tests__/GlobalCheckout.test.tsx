/* Paddle + RevenueCat: /checkout prices plans for the customer's country (#208 tiers flag). */
import '@testing-library/jest-dom'
import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toHaveNoViolations } from 'jest-axe'
import type { PaddleEventData, PricePreviewResponse } from '@paddle/paddle-js'
import { axe } from '../../../test/axe'
import { logIn, renderWithProviders } from '../../../test/providers'
import { FLAGS_KEY } from '../../../utils/flags/flags'
import type { PaymentSettings } from '../../../utils/payments/config'
import { PRICE_KEYS } from '../../../utils/payments/config'
import type { BrowserPlace } from '../../../utils/payments/country'
import type { PaddleCheckout } from '../../../utils/payments/paddle'
import type { PurchasesSdk } from '../../../utils/payments/revenuecat'
import { GlobalCheckout, countryName, defaultPlace } from '../GlobalCheckout'
import type { GlobalCheckoutProps } from '../GlobalCheckout'

expect.extend(toHaveNoViolations)

const PRICES = Object.fromEntries(PRICE_KEYS.map((key) => [key, `pri_${key}`]))

const SANDBOX: PaymentSettings = {
  paddle: {
    token: 'test_abc',
    environment: 'sandbox',
    prices: PRICES as NonNullable<PaymentSettings['paddle']>['prices']
  },
  revenueCatKey: null
}

/** Paddle's preview per country: amount, tax rate, inclusive or not. */
const BOOK: Record<string, [string, number, number, boolean]> = {
  US: ['USD', 400, 0.08875, false],
  DE: ['EUR', 399, 0.19, true],
  IN: ['INR', 117900, 0.18, true],
  AU: ['AUD', 699, 0.1, true]
}

const previewFor = (priceId: string, country: string) => {
  const [currency, amount, rate, inclusive] = BOOK[country] ?? [
    'USD',
    400,
    0,
    false
  ]
  const tax = inclusive
    ? Math.round(amount - amount / (1 + rate))
    : Math.round(amount * rate)
  const subtotal = inclusive ? amount - tax : amount
  return {
    data: {
      currencyCode: currency,
      details: {
        lineItems: [
          {
            price: { id: priceId },
            taxRate: String(rate),
            totals: {
              subtotal: String(subtotal),
              discount: '0',
              tax: String(tax),
              total: String(subtotal + tax)
            }
          }
        ]
      }
    }
  } as unknown as PricePreviewResponse
}

const fakePaddle = () => {
  const paddle = {
    PricePreview: jest.fn(
      async ({
        items,
        address
      }: {
        items: { priceId: string }[]
        address: { countryCode: string }
      }) => previewFor(items[0]?.priceId ?? '', address.countryCode)
    ),
    Checkout: { open: jest.fn() }
  }
  return paddle as unknown as PaddleCheckout & typeof paddle
}

const place = (
  locale: string,
  timeZone = 'UTC',
  located: { latitude: number; longitude: number } | null = null
): BrowserPlace => ({
  locale,
  timeZone,
  permissions:
    located === null
      ? undefined
      : {
          query: async () =>
            ({ state: 'granted' } as unknown as PermissionStatus)
        },
  geolocation:
    located === null
      ? undefined
      : {
          getCurrentPosition: (resolve) =>
            resolve({ coords: located } as unknown as GeolocationPosition)
        }
})

const show = (props: GlobalCheckoutProps = {}) =>
  renderWithProviders(<GlobalCheckout {...props} />, {
    mocks: [],
    path: '/checkout',
    routes: {}
  })

const withPaddle = (
  overrides: GlobalCheckoutProps = {},
  paddle = fakePaddle()
) => {
  const onEvents: ((event: PaddleEventData) => void)[] = []
  const props: GlobalCheckoutProps = {
    settings: SANDBOX,
    load: async (_config, onEvent) => {
      onEvents.push(onEvent)
      return paddle
    },
    place: place('en-US', 'America/New_York'),
    ...overrides
  }
  return { ...show(props), paddle, onEvents }
}

const choose = async (tier: string) =>
  userEvent.click(await screen.findByRole('button', { name: `Choose ${tier}` }))

const summary = () => screen.findByText('Total due today')

describe('GlobalCheckout', () => {
  beforeEach(() => localStorage.setItem(FLAGS_KEY, '["tiers"]'))
  afterEach(() => localStorage.clear())

  it('stays shut while the tiers flag is off', () => {
    localStorage.clear()
    show({ settings: SANDBOX, place: place('en-US') })
    expect(
      screen.getByRole('heading', { level: 1, name: 'Plans in your currency' })
    ).toBeVisible()
    expect(screen.getByText('Plans are not open yet.')).toBeVisible()
  })

  it('shows prices without checkout when Paddle is not set up (the defaults)', () => {
    show()
    expect(
      screen.getByText(
        'Checkout isn’t set up yet, so nothing can be bought here.'.replace(
          '’',
          "'"
        )
      )
    ).toBeVisible()
    expect(defaultPlace()).toBe(defaultPlace())
  })

  it('US: tax-exclusive, base price then sales tax as its own line', async () => {
    const { paddle } = withPaddle()
    expect(
      screen.getByRole('heading', { name: 'Prices for United States' })
    ).toBeVisible()
    expect(
      screen.getByText("Worked out from your browser's language settings.")
    ).toBeVisible()
    expect(
      screen.getByText(
        'Prices are before tax. Sales tax is added at checkout where it applies.'
      )
    ).toBeVisible()
    expect(
      screen.getByText('Sandbox: no real charges.', { exact: false })
    ).toBeVisible()
    const explorer = screen.getByRole('region', { name: 'Explorer' })
    expect(within(explorer).getByText('$4.00 a month')).toBeVisible()
    await choose('Explorer')
    await summary()
    const order = screen.getByRole('region', { name: 'Your order: Explorer' })
    expect(
      within(order).getByRole('radio', { name: 'Monthly, $4.00' })
    ).toBeChecked()
    expect(within(order).getByText('Price').nextSibling).toHaveTextContent(
      '$4.00'
    )
    expect(
      within(order).getByText('Sales tax (8.875%)').nextSibling
    ).toHaveTextContent('$0.36')
    expect(
      within(order).getByText('Total due today').nextSibling
    ).toHaveTextContent('$4.36')
    expect(paddle.PricePreview).toHaveBeenLastCalledWith({
      items: [{ priceId: 'pri_EXPLORER_month', quantity: 1 }],
      address: { countryCode: 'US' }
    })
    // signed out: log in to pay
    expect(within(order).getByText('Log in')).toHaveAttribute('href', '/login')
  })

  it('EU: localised euros with VAT inside the price', async () => {
    withPaddle({ place: place('de-DE', 'Europe/Berlin') })
    expect(
      screen.getByRole('heading', { name: 'Prices for Deutschland' })
    ).toBeVisible()
    expect(screen.getByText('Prices include VAT.')).toBeVisible()
    expect(screen.getByText('3,99 € a month')).toBeVisible()
    await choose('Explorer')
    await summary()
    const order = screen.getByRole('region', { name: 'Your order: Explorer' })
    expect(
      within(order).getByText('Total due today').nextSibling
    ).toHaveTextContent('3,99 €')
    expect(within(order).getByText('Includes VAT (19 %): 0,64 €')).toBeVisible()
    expect(within(order).queryByText('Price')).toBeNull()
  })

  it('India: PPP rupees, GST inside, yearly enforced on the lowest tier', async () => {
    const { paddle } = withPaddle({
      place: place('en-IN', 'Asia/Kolkata', {
        latitude: 19.076,
        longitude: 72.8777
      })
    })
    expect(
      await screen.findByText('Worked out from your location.')
    ).toBeVisible()
    expect(screen.getByText('Prices include GST.')).toBeVisible()
    expect(
      screen.getByText('Regional price: 65% less than the US price.')
    ).toBeVisible()
    const explorer = screen.getByRole('region', { name: 'Explorer' })
    expect(within(explorer).getByText('₹1,179.00 a year')).toBeVisible()
    expect(within(explorer).getByText('Yearly billing only')).toBeVisible()
    await choose('Explorer')
    await summary()
    const order = screen.getByRole('region', { name: 'Your order: Explorer' })
    const group = within(order).getByRole('radiogroup', { name: 'Billing' })
    expect(group).toHaveAccessibleDescription(
      'Explorer is billed yearly in India. Monthly payments this small would lose too much to fixed card fees.'
    )
    expect(
      within(group).getByRole('radio', { name: 'Monthly, ₹119.00' })
    ).toBeDisabled()
    expect(
      within(group).getByRole('radio', { name: 'Yearly, ₹1,179.00' })
    ).toBeChecked()
    expect(within(order).getByText('Includes GST (18%): ₹179.85')).toBeVisible()
    expect(paddle.PricePreview).toHaveBeenLastCalledWith({
      items: [{ priceId: 'pri_EXPLORER_year', quantity: 1 }],
      address: { countryCode: 'IN' }
    })

    // Manager starts on yearly, but monthly can be picked
    await choose('Manager')
    const manager = screen.getByRole('region', { name: 'Your order: Manager' })
    const billing = within(manager).getByRole('radiogroup', { name: 'Billing' })
    expect(billing).toHaveAccessibleDescription(
      'Yearly costs the same as 10 months.'
    )
    expect(
      within(billing).getByRole('radio', { name: /^Yearly/ })
    ).toBeChecked()
    await userEvent.click(
      within(billing).getByRole('radio', { name: /^Monthly/ })
    )
    expect(
      within(billing).getByRole('radio', { name: /^Monthly/ })
    ).toBeChecked()
    await waitFor(() =>
      expect(paddle.PricePreview).toHaveBeenLastCalledWith({
        items: [{ priceId: 'pri_MANAGER_month', quantity: 1 }],
        address: { countryCode: 'IN' }
      })
    )
    await userEvent.click(
      within(billing).getByRole('radio', { name: /^Yearly/ })
    )
    expect(
      within(billing).getByRole('radio', { name: /^Yearly/ })
    ).toBeChecked()
  })

  it('a picked country wins, and reprices', async () => {
    withPaddle({ place: place('en', 'Australia/Sydney') })
    expect(screen.getByText('Worked out from your time zone.')).toBeVisible()
    expect(screen.getByText('Prices include GST.')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: /Country/ }))
    await userEvent.click(screen.getByRole('option', { name: 'India' }))
    expect(screen.getByText('You chose this country.')).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'Prices for India' })
    ).toBeVisible()
    await choose('Leader')
    await summary()
  })

  it('a picked country is not replaced by a late location', async () => {
    let answer: (position: GeolocationPosition) => void = () => undefined
    withPaddle({
      place: {
        ...place('en', 'UTC'),
        permissions: {
          query: async () =>
            ({ state: 'granted' } as unknown as PermissionStatus)
        },
        geolocation: {
          getCurrentPosition: (resolve) => {
            answer = resolve
          }
        }
      }
    })
    expect(
      screen.getByText(
        "We couldn't tell where you are, so these are US prices."
      )
    ).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: /Country/ }))
    await userEvent.click(
      screen.getByRole('option', { name: 'United Kingdom' })
    )
    await act(async () =>
      answer({
        coords: { latitude: 19.076, longitude: 72.8777 }
      } as unknown as GeolocationPosition)
    )
    expect(
      screen.getByRole('heading', { name: 'Prices for United Kingdom' })
    ).toBeVisible()
  })

  it('opens Paddle’s overlay for a signed-in user, then says when it is paid', async () => {
    logIn(false)
    const { paddle, onEvents } = withPaddle({
      place: place('en-IN', 'Asia/Kolkata')
    })
    await choose('Explorer')
    await summary()
    await userEvent.click(
      screen.getByRole('button', { name: 'Continue to payment' })
    )
    expect(paddle.Checkout.open).toHaveBeenCalledWith({
      items: [{ priceId: 'pri_EXPLORER_year', quantity: 1 }],
      customData: { ingre_user_id: 'u1' },
      customer: { email: 'ada@example.com', address: { countryCode: 'IN' } },
      settings: { displayMode: 'overlay', locale: 'en', allowLogout: false }
    })
    act(() => onEvents[0]?.({ name: 'checkout.loaded' } as PaddleEventData))
    expect(screen.queryByText(/Payment received/)).toBeNull()
    act(() => onEvents[0]?.({ name: 'checkout.completed' } as PaddleEventData))
    expect(
      screen.getByText('Payment received. Your plan switches on in a moment.')
    ).toBeVisible()
  })

  it('says when Paddle fails to load, or answers nothing', async () => {
    show({
      settings: SANDBOX,
      load: async () => {
        throw new Error('blocked')
      },
      place: place('en-US')
    })
    expect(
      await screen.findByText(
        "Couldn't load Paddle's checkout. Check your connection and reload the page."
      )
    ).toBeVisible()
  })

  it('treats a missing Paddle.js as a failed load', async () => {
    show({
      settings: SANDBOX,
      load: async () => undefined,
      place: place('en-US')
    })
    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't load Paddle's checkout."
    )
  })

  it('offers a retry when the price preview fails', async () => {
    const paddle = fakePaddle()
    paddle.PricePreview.mockRejectedValueOnce(new Error('offline'))
    paddle.PricePreview.mockResolvedValueOnce({
      data: { currencyCode: 'USD', details: { lineItems: [] } }
    } as unknown as PricePreviewResponse)
    withPaddle({}, paddle)
    await choose('Explorer')
    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't get the price from Paddle. Try again."
    )
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't get the price from Paddle."
    )
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    await summary()
  })

  it('says nothing about a preview or Paddle answer that lands after leaving', async () => {
    let finishLoad: (paddle: PaddleCheckout) => void = () => undefined
    let failLoad: (error: Error) => void = () => undefined
    const first = show({
      settings: SANDBOX,
      load: () =>
        new Promise((resolve, reject) => {
          finishLoad = resolve
          failLoad = reject
        }),
      place: place('en-US')
    })
    first.unmount()
    await act(async () => finishLoad(fakePaddle()))
    const second = show({
      settings: SANDBOX,
      load: () =>
        new Promise((_resolve, reject) => {
          failLoad = reject
        }),
      place: place('en-US')
    })
    second.unmount()
    await act(async () => failLoad(new Error('late')))

    const paddle = fakePaddle()
    let answer: (value: PricePreviewResponse) => void = () => undefined
    let refuse: (error: Error) => void = () => undefined
    paddle.PricePreview.mockImplementationOnce(
      () => new Promise((resolve) => (answer = resolve))
    )
    paddle.PricePreview.mockImplementationOnce(
      () => new Promise((_resolve, reject) => (refuse = reject))
    )
    const third = withPaddle({}, paddle)
    await choose('Explorer')
    // switching tier abandons the first preview
    await choose('Manager')
    third.unmount()
    await act(async () => {
      answer(previewFor('pri_EXPLORER_month', 'US'))
      refuse(new Error('late'))
    })
  })

  it('shows the plan RevenueCat reports for the signed-in user', async () => {
    logIn(false)
    const instance = {
      getAppUserId: () => 'u1',
      changeUser: jest.fn(),
      getCustomerInfo: async () => ({
        entitlements: { active: { manager: {} } }
      })
    }
    const sdk = {
      isConfigured: () => true,
      getSharedInstance: () => instance,
      configure: () => instance
    } as unknown as PurchasesSdk
    withPaddle({
      settings: { ...SANDBOX, revenueCatKey: 'rcb_sb_abc' },
      loadSdk: async () => sdk
    })
    expect(await screen.findByText('Your plan: Manager')).toBeVisible()
  })

  it('stays quiet when RevenueCat fails or answers late', async () => {
    logIn(false)
    withPaddle({
      settings: { ...SANDBOX, revenueCatKey: 'rcb_sb_abc' },
      loadSdk: async () => {
        throw new Error('offline')
      }
    })
    await screen.findByRole('button', { name: 'Choose Explorer' })
    expect(screen.queryByText(/Your plan/)).toBeNull()
    let finish: (sdk: PurchasesSdk) => void = () => undefined
    const late = withPaddle({
      settings: { ...SANDBOX, revenueCatKey: 'rcb_sb_abc' },
      loadSdk: () => new Promise((resolve) => (finish = resolve))
    })
    late.unmount()
    const instance = {
      getAppUserId: () => 'u1',
      changeUser: jest.fn(),
      getCustomerInfo: async () => ({ entitlements: { active: {} } })
    }
    await act(async () =>
      finish({
        isConfigured: () => true,
        getSharedInstance: () => instance,
        configure: () => instance
      } as unknown as PurchasesSdk)
    )
  })

  it('hides the sandbox note in production', () => {
    withPaddle({
      settings: {
        ...SANDBOX,
        paddle: {
          ...(SANDBOX.paddle as NonNullable<PaymentSettings['paddle']>),
          environment: 'production'
        }
      }
    })
    expect(screen.queryByText(/Sandbox/)).toBeNull()
  })

  it('has no axe violations with an order open', async () => {
    const { container } = withPaddle({ place: place('en-IN', 'Asia/Kolkata') })
    await choose('Explorer')
    await summary()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('picks a country by keyboard alone', async () => {
    const user = userEvent.setup()
    withPaddle()
    screen.getByRole('button', { name: /Country/ }).focus()
    await user.keyboard('{Enter}')
    const listbox = await screen.findByRole('listbox')
    expect(listbox).toBeVisible()
    await user.keyboard('{ArrowDown}{Enter}')
    expect(
      screen.getByRole('heading', { name: 'Prices for Canada' })
    ).toBeVisible()
  })
})

describe('countryName', () => {
  it('names a country in the customer’s language, or keeps the code', () => {
    expect(countryName('IN', 'en-IN')).toBe('India')
    expect(countryName('DE', 'de-DE')).toBe('Deutschland')
    expect(countryName('IN', 'not a locale!')).toBe('IN')
    const spy = jest
      .spyOn(Intl, 'DisplayNames')
      .mockImplementation(
        () => ({ of: () => undefined } as unknown as Intl.DisplayNames)
      )
    expect(countryName('IN', 'en')).toBe('IN')
    spy.mockRestore()
  })
})
