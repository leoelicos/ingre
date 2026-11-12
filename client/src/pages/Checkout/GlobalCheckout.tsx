/*
 * Paddle + RevenueCat: /checkout, plans priced for the customer's country. Prices come from
 * the pricing engine (currency, PPP), tax from Paddle, payment from Paddle's overlay. Low
 * PPP prices are billed yearly, so Paddle's flat fee doesn't swallow each payment.
 * Behind the tiers flag (#208) like Plans.
 */
import type { FC } from 'react'
import { useState } from 'react'
import {
  Button,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Radio,
  RadioGroup,
  Select,
  SelectValue,
  Text
} from 'react-aria-components'
import { formatPercent, useT } from '../../i18n'
import type { Translate } from '../../i18n/useT'
import NotLoggedIn from '../../components/NotLoggedIn'
import { PrimaryButton } from '../../components/PrimaryButton'
import { useAuthContext } from '../../utils/auth/AuthContext'
import { useFlag } from '../../utils/flags/useFlag'
import type { Tier } from '../../utils/tier/tiers'
import { TIERS } from '../../utils/tier/tiers'
import type { PaymentSettings } from '../../utils/payments/config'
import { PAYMENT_SETTINGS, priceKey } from '../../utils/payments/config'
import type { BrowserPlace, CountrySource } from '../../utils/payments/country'
import { browserPlace } from '../../utils/payments/country'
import { formatPrice } from '../../utils/payments/money'
import type { LoadPaddle } from '../../utils/payments/paddle'
import { loadPaddle, openCheckout } from '../../utils/payments/paddle'
import type {
  BillingInterval,
  BillingPolicy,
  Region
} from '../../utils/payments/pricing'
import {
  COUNTRIES,
  billingPolicy,
  enforceInterval,
  listPrice,
  pppDiscount,
  regionOf
} from '../../utils/payments/pricing'
import type { LoadPurchases } from '../../utils/payments/revenuecat'
import { loadPurchases } from '../../utils/payments/revenuecat'
import { useSignedInUser } from './account'
import { CheckoutSummary } from './CheckoutSummary'
import { useCustomerCountry } from './useCustomerCountry'
import { usePaddle } from './usePaddle'
import { useQuote } from './useQuote'
import { useWebEntitlement } from './useWebEntitlement'

const CARD =
  'flex h-full flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-card'
const OPTION =
  'flex min-h-[44px] cursor-pointer items-center gap-3 rounded-control border border-border bg-surface px-3 py-2 text-text data-[selected]:border-primary data-[selected]:bg-chip-active data-[focus-visible]:focus-ring data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60'

/** A country's name in the customer's language: "India", "Deutschland". */
export const countryName = (country: string, locale: string): string => {
  try {
    return (
      new Intl.DisplayNames([locale], { type: 'region' }).of(country) ?? country
    )
  } catch {
    return country
  }
}

const sourceText = (t: Translate, source: CountrySource): string => {
  if (source === 'location') return t('globalCheckout.source.location')
  if (source === 'locale') return t('globalCheckout.source.locale')
  if (source === 'timeZone') return t('globalCheckout.source.timeZone')
  if (source === 'chosen') return t('globalCheckout.source.chosen')
  return t('globalCheckout.source.default')
}

const taxNote = (t: Translate, region: Region): string => {
  if (region.taxMode === 'exclusive') return t('globalCheckout.taxExclusive')
  return region.taxName === 'gst'
    ? t('globalCheckout.taxInclusiveGst')
    : t('globalCheckout.taxInclusiveVat')
}

const perInterval = (
  t: Translate,
  interval: BillingInterval,
  price: string
): string =>
  interval === 'year'
    ? t('globalCheckout.perYear', { price })
    : t('globalCheckout.perMonth', { price })

const CountryPicker: FC<{
  country: string
  locale: string
  onChoose: (country: string) => void
}> = ({ country, locale, onChoose }) => {
  const t = useT()
  return (
    <Select
      selectedKey={country}
      onSelectionChange={(key) => onChoose(String(key))}
      className="flex flex-col gap-1"
    >
      <Label>{t('globalCheckout.country')}</Label>
      <Button className="flex min-h-[44px] items-center justify-between gap-2 rounded-control border border-border bg-surface px-3 text-left text-text data-[focus-visible]:focus-ring">
        <SelectValue />
        <span aria-hidden="true">▾</span>
      </Button>
      <Popover className="max-h-72 overflow-auto rounded-control border border-border bg-surface shadow-card">
        <ListBox className="flex flex-col">
          {COUNTRIES.map((code) => (
            <ListBoxItem
              key={code}
              id={code}
              textValue={countryName(code, locale)}
              className="min-h-[44px] cursor-pointer px-3 py-2 text-text data-[focused]:bg-highlight data-[selected]:font-semibold"
            >
              {countryName(code, locale)}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </Select>
  )
}

const TierCard: FC<{
  tier: Tier
  region: Region
  locale: string
  onChoose: (tier: Tier) => void
}> = ({ tier, region, locale, onChoose }) => {
  const t = useT()
  const name = t(`tiers.names.${tier}`)
  const policy = billingPolicy(tier, region)
  const interval = enforceInterval(policy, null)
  const price = formatPrice(
    listPrice(tier, interval, region),
    region.currency,
    locale
  )
  return (
    <li>
      <section
        aria-labelledby={`checkout-plan-${tier}`}
        className={CARD}
      >
        <h2
          id={`checkout-plan-${tier}`}
          className="text-xl"
        >
          {name}
        </h2>
        <p className="text-lg font-semibold">
          {perInterval(t, interval, price)}
        </p>
        {policy === 'annual-only' && (
          <p className="text-text-secondary">
            {t('globalCheckout.yearlyOnly')}
          </p>
        )}
        <PrimaryButton
          onPress={() => onChoose(tier)}
          className="mt-auto"
        >
          {t('globalCheckout.choose', { tier: name })}
        </PrimaryButton>
      </section>
    </li>
  )
}

const BillingChoice: FC<{
  tier: Tier
  policy: BillingPolicy
  interval: BillingInterval
  region: Region
  country: string
  locale: string
  onChange: (interval: BillingInterval) => void
}> = ({ tier, policy, interval, region, country, locale, onChange }) => {
  const t = useT()
  const price = (option: BillingInterval): string =>
    formatPrice(listPrice(tier, option, region), region.currency, locale)
  return (
    <RadioGroup
      value={interval}
      onChange={(value) => onChange(value === 'month' ? 'month' : 'year')}
      className="flex flex-col gap-2"
    >
      <Label className="font-semibold">{t('globalCheckout.billing')}</Label>
      {policy === 'annual-only' ? (
        <Text slot="description">
          {t('globalCheckout.yearlyOnlyWhy', {
            tier: t(`tiers.names.${tier}`),
            country: countryName(country, locale)
          })}
        </Text>
      ) : (
        <Text slot="description">{t('globalCheckout.yearlySaves')}</Text>
      )}
      <Radio
        value="month"
        isDisabled={policy === 'annual-only'}
        className={OPTION}
      >
        {t('globalCheckout.monthly', { price: price('month') })}
      </Radio>
      <Radio
        value="year"
        className={OPTION}
      >
        {t('globalCheckout.yearly', { price: price('year') })}
      </Radio>
    </RadioGroup>
  )
}

export interface GlobalCheckoutProps {
  settings?: PaymentSettings
  load?: LoadPaddle
  loadSdk?: LoadPurchases
  place?: BrowserPlace
}

const Checkout: FC<Required<GlobalCheckoutProps>> = ({
  settings,
  load,
  loadSdk,
  place
}) => {
  const t = useT()
  const [auth] = useAuthContext()
  const user = useSignedInUser(auth.loggedIn)
  const [{ country, source }, chooseCountry] = useCustomerCountry(place)
  const region = regionOf(country)
  const locale = place.locale
  const { state: paddle, completed } = usePaddle(settings.paddle, load)
  const currentTier = useWebEntitlement(
    settings.revenueCatKey,
    user?.id ?? null,
    loadSdk
  )
  const [tier, setTier] = useState<Tier | null>(null)
  const [wanted, setWanted] = useState<BillingInterval | null>(null)
  const policy = tier === null ? null : billingPolicy(tier, region)
  const interval = policy === null ? null : enforceInterval(policy, wanted)
  const priceId =
    tier === null || interval === null || settings.paddle === null
      ? null
      : settings.paddle.prices[priceKey(tier, interval)]
  const ready = paddle.status === 'ready' ? paddle.paddle : null
  const { state: quote, retry } = useQuote(ready, priceId, country)
  const discount = pppDiscount(region)
  const choose = (next: Tier): void => {
    setTier(next)
    setWanted(null)
  }
  return (
    <div className="flex flex-col gap-4">
      {currentTier !== null && (
        <p role="status">
          {t('globalCheckout.current', {
            tier: t(`tiers.names.${currentTier}`)
          })}
        </p>
      )}
      <section
        aria-labelledby="checkout-where"
        className="flex flex-col gap-2"
      >
        <h2
          id="checkout-where"
          className="text-lg"
        >
          {t('globalCheckout.pricesFor', {
            country: countryName(country, locale)
          })}
        </h2>
        <p>{sourceText(t, source)}</p>
        <CountryPicker
          country={country}
          locale={locale}
          onChoose={chooseCountry}
        />
        <p>{taxNote(t, region)}</p>
        {discount > 0 && (
          <p>{t('globalCheckout.ppp', { percent: formatPercent(discount) })}</p>
        )}
        {settings.paddle?.environment === 'sandbox' && (
          <p>{t('globalCheckout.sandbox')}</p>
        )}
      </section>
      {paddle.status === 'off' && <p>{t('globalCheckout.notSetUp')}</p>}
      {paddle.status === 'failed' && (
        <p role="alert">{t('globalCheckout.paddleFailed')}</p>
      )}
      <ul className="grid gap-4 md:grid-cols-3">
        {TIERS.map(({ id }) => (
          <TierCard
            key={id}
            tier={id}
            region={region}
            locale={locale}
            onChoose={choose}
          />
        ))}
      </ul>
      {tier !== null && policy !== null && interval !== null && (
        <section
          aria-labelledby="checkout-order"
          className={CARD}
        >
          <h2
            id="checkout-order"
            className="text-xl"
          >
            {t('globalCheckout.order', { tier: t(`tiers.names.${tier}`) })}
          </h2>
          <BillingChoice
            tier={tier}
            policy={policy}
            interval={interval}
            region={region}
            country={country}
            locale={locale}
            onChange={setWanted}
          />
          <CheckoutSummary
            state={quote}
            region={region}
            locale={locale}
            onRetry={retry}
          />
          {completed && <p role="status">{t('globalCheckout.completed')}</p>}
          {user === null ? (
            <NotLoggedIn />
          ) : (
            ready !== null &&
            priceId !== null &&
            quote.status === 'ready' && (
              <PrimaryButton
                onPress={() =>
                  openCheckout(ready, {
                    priceId,
                    countryCode: country,
                    userId: user.id,
                    email: user.email,
                    locale
                  })
                }
              >
                {t('globalCheckout.pay')}
              </PrimaryButton>
            )
          )}
        </section>
      )}
    </div>
  )
}

const BROWSER: { place: BrowserPlace | null } = { place: null }

/** The browser's place, read once per page load (so effects keyed on it run once). */
export const defaultPlace = (): BrowserPlace => {
  BROWSER.place = BROWSER.place ?? browserPlace()
  return BROWSER.place
}

export const GlobalCheckout: FC<GlobalCheckoutProps> = ({
  settings = PAYMENT_SETTINGS,
  load = loadPaddle,
  loadSdk = loadPurchases,
  place
}) => {
  const t = useT()
  const tiers = useFlag('tiers')
  const [where] = useState(() => place ?? defaultPlace())
  return (
    <div className="mx-auto flex w-full max-w-layout flex-col gap-4 px-gutter py-4">
      <h1 className="text-2xl">{t('globalCheckout.title')}</h1>
      {tiers ? (
        <Checkout
          settings={settings}
          load={load}
          loadSdk={loadSdk}
          place={where}
        />
      ) : (
        <p>{t('globalCheckout.off')}</p>
      )}
    </div>
  )
}

export default GlobalCheckout
