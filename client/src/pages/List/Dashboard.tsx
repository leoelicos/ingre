import {
  formatMoney,
  formatItemCount,
  formatNumber,
  formatOneDecimal,
  translate,
  useT
} from '../../i18n'
import type { FC } from 'react'
import { useState } from 'react'
import { Label, Meter } from 'react-aria-components'
import { categoryLabel } from '../../utils/chips/chips'
import type { Dashboard as DashboardData } from '../../utils/dashboard/dashboard'
import { summarise } from '../../utils/dashboard/dashboard'
import type { ChipsState } from '../../utils/chips/useChips'
import { Section } from './Section'

export const DASHBOARD_ID = 'dashboard'

/** "$48.20 · 12 items", or nothing while the list is empty. */
export const dashboardSummary = (data: DashboardData): string =>
  data.items === 0
    ? ''
    : translate('dashboard.summary', {
        cost: formatMoney(data.cost),
        items: formatItemCount(data.items)
      })

const names = (items: readonly string[]): string =>
  items.join(translate('dashboard.listSeparator'))

/** One figure and its name, as a term and its description. */
const Figure: FC<{ name: string; value: string }> = ({ name, value }) => (
  <div className="flex flex-col rounded-control bg-bg px-3 py-2 shadow-raised">
    <dt className="text-sm text-text-secondary">{name}</dt>
    <dd className="m-0 text-lg font-semibold text-text">{value}</dd>
  </div>
)

const Spread: FC<{ data: DashboardData }> = ({ data }) => {
  const t = useT()
  return (
    <div className="flex flex-col gap-2">
      <h3 className="m-0 text-sm font-semibold uppercase tracking-wide text-text-secondary">
        {t('dashboard.spreadHeading')}
      </h3>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {data.spread.map((entry) => (
          <li key={entry.section}>
            <Meter
              value={entry.percent}
              valueLabel={t('dashboard.spreadItem', {
                cost: formatMoney(entry.cost),
                items: formatItemCount(entry.items),
                percent: entry.percent
              })}
              className="flex flex-col gap-1"
            >
              {({ percentage, valueText }) => (
                <>
                  <div className="flex flex-wrap justify-between gap-x-3 text-sm text-text">
                    <Label className="font-semibold">
                      {categoryLabel(entry.section)}
                    </Label>
                    <span>{valueText}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-pill bg-badge-neutral">
                    <div
                      className="h-full rounded-pill bg-primary"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </>
              )}
            </Meter>
          </li>
        ))}
      </ul>
    </div>
  )
}

const Gaps: FC<{ data: DashboardData }> = ({ data }) => {
  const t = useT()
  return (
    <div className="flex flex-col gap-1 text-sm text-text-secondary">
      <p className="m-0">{t('dashboard.indicative')}</p>
      {data.noPrice.length > 0 && (
        <p className="m-0">
          {t('dashboard.noPrice', { items: names(data.noPrice) })}
        </p>
      )}
      {data.noMacros.length > 0 && (
        <p className="m-0">
          {t('dashboard.noMacros', { items: names(data.noMacros) })}
        </p>
      )}
    </div>
  )
}

const Totals: FC<{ data: DashboardData }> = ({ data }) => {
  const t = useT()
  const grams = (n: number) =>
    t('dashboard.grams', { amount: formatOneDecimal(n) })
  return (
    <div className="flex flex-col gap-2">
      <h3 className="m-0 text-sm font-semibold uppercase tracking-wide text-text-secondary">
        {t('dashboard.macrosHeading')}
      </h3>
      <dl className="m-0 grid grid-cols-2 gap-3">
        <Figure
          name={t('dashboard.cost')}
          value={t('dashboard.about', { cost: formatMoney(data.cost) })}
        />
        <Figure
          name={t('dashboard.energy')}
          value={t('dashboard.kj', {
            amount: formatNumber(Math.round(data.macros.kj))
          })}
        />
        <Figure
          name={t('dashboard.protein')}
          value={grams(data.macros.protein)}
        />
        <Figure
          name={t('dashboard.fat')}
          value={grams(data.macros.fat)}
        />
        <Figure
          name={t('dashboard.carbs')}
          value={grams(data.macros.carbs)}
        />
      </dl>
      <p className="m-0 text-sm text-text-secondary">
        {t('dashboard.macrosNote')}
      </p>
    </div>
  )
}

/**
 * The dashboard (#232): a cross-section of everything on the list: estimated cost, macros and
 * where the spend falls across the shop's sections. Collapses only in the vertical layout.
 */
export const Dashboard: FC<{ list: ChipsState; collapsible: boolean }> = ({
  list,
  collapsible
}) => {
  const t = useT()
  const [open, setOpen] = useState(true)
  const data = summarise(list.chips)
  return (
    <Section
      id={DASHBOARD_ID}
      title={t('dashboard.title')}
      collapsible={collapsible}
      open={open}
      onToggle={() => setOpen(!open)}
      summary={dashboardSummary(data)}
    >
      {data.items === 0 ? (
        <p className="m-0 text-text-secondary">{t('dashboard.empty')}</p>
      ) : (
        <div className="flex flex-col gap-4">
          <Totals data={data} />
          <Spread data={data} />
          <Gaps data={data} />
        </div>
      )}
    </Section>
  )
}
