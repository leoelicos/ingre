/*
 * Paddle + RevenueCat: Paddle's price and tax for the chosen plan, shown the way the
 * customer's country expects. US and Canada (tax-exclusive): the price, then sales tax as
 * its own line, then the total. UK, EU, Australia and India (tax-inclusive): one total
 * with the VAT or GST inside it.
 */
import type { FC } from 'react'
import { useT } from '../../i18n'
import type { Translate } from '../../i18n/useT'
import { formatPrice, formatRate } from '../../utils/payments/money'
import type { CheckoutQuote } from '../../utils/payments/paddle'
import type { Region, TaxName } from '../../utils/payments/pricing'
import type { QuoteState } from './useQuote'

const ROW = 'flex items-baseline justify-between gap-4'

const includesLine = (
  t: Translate,
  name: TaxName,
  rate: string,
  amount: string
): string =>
  name === 'gst'
    ? t('globalCheckout.includes.gst', { rate, amount })
    : t('globalCheckout.includes.vat', { rate, amount })

const Quote: FC<{ quote: CheckoutQuote; region: Region; locale: string }> = ({
  quote,
  region,
  locale
}) => {
  const t = useT()
  const money = (minor: number): string =>
    formatPrice(minor, quote.currency, locale)
  const rate = formatRate(quote.taxRate, locale)
  if (region.taxMode === 'inclusive')
    return (
      <dl
        aria-label={t('globalCheckout.summary')}
        className="flex flex-col gap-1"
      >
        <div className={ROW}>
          <dt className="font-semibold">{t('globalCheckout.total')}</dt>
          <dd className="font-semibold">{money(quote.total)}</dd>
        </div>
        <div className={ROW}>
          <dt className="text-text-secondary">
            {includesLine(t, region.taxName, rate, money(quote.tax))}
          </dt>
        </div>
      </dl>
    )
  return (
    <dl
      aria-label={t('globalCheckout.summary')}
      className="flex flex-col gap-1"
    >
      <div className={ROW}>
        <dt>{t('globalCheckout.price')}</dt>
        <dd>{money(quote.subtotal)}</dd>
      </div>
      <div className={ROW}>
        <dt>{t('globalCheckout.salesTax', { rate })}</dt>
        <dd>{money(quote.tax)}</dd>
      </div>
      <div className={`${ROW} border-t border-border pt-1`}>
        <dt className="font-semibold">{t('globalCheckout.total')}</dt>
        <dd className="font-semibold">{money(quote.total)}</dd>
      </div>
    </dl>
  )
}

export const CheckoutSummary: FC<{
  state: QuoteState
  region: Region
  locale: string
  onRetry: () => void
}> = ({ state, region, locale, onRetry }) => {
  const t = useT()
  if (state.status === 'idle') return null
  if (state.status === 'loading')
    return <p role="status">{t('globalCheckout.quoting')}</p>
  if (state.status === 'failed')
    return (
      <div className="flex flex-col gap-2">
        <p role="alert">{t('globalCheckout.quoteFailed')}</p>
        <button
          type="button"
          onClick={onRetry}
          className="min-h-[44px] self-start rounded-control border border-border px-3 focus-visible:focus-ring"
        >
          {t('globalCheckout.retry')}
        </button>
      </div>
    )
  return (
    <Quote
      quote={state.quote}
      region={region}
      locale={locale}
    />
  )
}
