import type { FC } from 'react'
import { useT } from '../../i18n'
import { PrimaryButton } from '../../components/PrimaryButton'
import { formatDollars } from '../../utils/demo/demo'
import type { DemoSuggestion, Ticket } from '../../utils/demo/demo'

interface Props {
  readonly suggestions: readonly DemoSuggestion[]
  readonly tickets: readonly Ticket[]
  readonly onAdd: (ticket: Ticket) => void
}

/** One suggestion per card: what is missing, the cost, and Add ticket. */
export const DemoSuggestions: FC<Props> = ({ suggestions, tickets, onAdd }) => {
  const t = useT()
  if (suggestions.length === 0) return null
  return (
    <section
      aria-labelledby="demo-suggestions"
      className="flex flex-col gap-3"
    >
      <h2
        id="demo-suggestions"
        className="text-sm font-medium uppercase tracking-wide text-text-secondary"
      >
        {t('demo.suggestions')}
      </h2>
      <ul className="flex flex-col gap-3">
        {suggestions.map((suggestion) => (
          <li
            key={suggestion.id}
            className="flex flex-col gap-2 rounded-card bg-surface p-4 shadow-card"
          >
            <p className="font-medium">{suggestion.title}</p>
            <p className="text-sm text-text-secondary">
              {suggestion.missing.length === 0
                ? t('demo.complete')
                : t('demo.missing', { items: suggestion.missing.join(', ') })}
              {' · '}
              {t('demo.cost', { price: formatDollars(suggestion.costCents) })}
            </p>
            <PrimaryButton
              onPress={() => onAdd(suggestion)}
              isDisabled={tickets.some((ticket) => ticket.id === suggestion.id)}
              className="self-start"
            >
              {t('demo.addTicket')}
            </PrimaryButton>
          </li>
        ))}
      </ul>
    </section>
  )
}
