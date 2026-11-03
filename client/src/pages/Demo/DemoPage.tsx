import { useMemo, useState } from 'react'
import type { FC } from 'react'
import { useT } from '../../i18n'
import { PageMain } from '../../components/SkipLink'
import type { Ticket } from '../../utils/demo/demo'
import {
  matchIngredients,
  suggest,
  toggleId,
  withTicket
} from '../../utils/demo/demo'
import { DemoFab } from './DemoFab'
import { DemoIngredients } from './DemoIngredients'
import { DemoSuggestions } from './DemoSuggestions'

/**
 * The prototype loop at /demo (#216), permanent and with no backend: pick ingredients, see
 * suggestions with what is missing and the cost, add a ticket from the card or the
 * bottom-right button. Every step is acknowledged in a status line.
 */
export const DemoPage: FC = () => {
  const t = useT()
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState<readonly string[]>([])
  const [tickets, setTickets] = useState<readonly Ticket[]>([])
  const [ack, setAck] = useState('')
  const matches = useMemo(() => matchIngredients(query), [query])
  const suggestions = useMemo(() => suggest(picked), [picked])
  const toggle = (id: string, name: string): void => {
    setAck(
      t(picked.includes(id) ? 'demo.removedAck' : 'demo.pickedAck', { name })
    )
    setPicked(toggleId(picked, id))
  }
  const addTicket = ({ id, title }: Ticket): void => {
    setTickets(withTicket(tickets, { id, title }))
    setAck(t('demo.ticketAdded', { title }))
  }
  return (
    <PageMain className="ingre-page flex flex-col gap-6 pb-36 pt-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium tracking-tight">
          {t('demo.title')}
        </h1>
        <p className="text-text-secondary">{t('demo.intro')}</p>
      </header>
      <DemoIngredients
        query={query}
        onQuery={setQuery}
        matches={matches}
        picked={picked}
        onToggle={toggle}
      />
      <p
        role="status"
        className="min-h-6 text-success"
      >
        {ack}
      </p>
      <DemoSuggestions
        suggestions={suggestions}
        tickets={tickets}
        onAdd={addTicket}
      />
      {tickets.length > 0 && (
        <section
          aria-labelledby="demo-tickets"
          className="flex flex-col gap-2"
        >
          <h2
            id="demo-tickets"
            className="text-sm font-medium uppercase tracking-wide text-text-secondary"
          >
            {t('demo.tickets')}
          </h2>
          <ul className="flex flex-col gap-1">
            {tickets.map(({ id, title }) => (
              <li key={id}>{title}</li>
            ))}
          </ul>
        </section>
      )}
      <DemoFab
        suggestions={suggestions}
        tickets={tickets}
        onAdd={addTicket}
      />
    </PageMain>
  )
}
