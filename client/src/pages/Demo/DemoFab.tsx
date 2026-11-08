import type { FC } from 'react'
import { Button } from 'react-aria-components'
import { useT } from '../../i18n'
import { ABOVE_NAV } from '../../components/BottomNav/BottomNav'
import type { DemoSuggestion, Ticket } from '../../utils/demo/demo'

interface Props {
  readonly suggestions: readonly DemoSuggestion[]
  readonly tickets: readonly Ticket[]
  readonly onAdd: (ticket: Ticket) => void
}

/** The first suggestion that is not yet a ticket, as a list: one, or none. */
const nextOne = (
  suggestions: readonly DemoSuggestion[],
  tickets: readonly Ticket[]
): readonly DemoSuggestion[] =>
  suggestions
    .filter((s) => !tickets.some((ticket) => ticket.id === s.id))
    .slice(0, 1)

/** The bottom-right button: adds a ticket for the top suggestion; off when there is none. */
export const DemoFab: FC<Props> = ({ suggestions, tickets, onAdd }) => {
  const t = useT()
  const next = nextOne(suggestions, tickets)
  const first = next[0]
  return (
    <div className={`fixed ${ABOVE_NAV} right-4 z-10`}>
      <Button
        onPress={() => next.forEach(onAdd)}
        isDisabled={first === undefined}
        aria-label={
          first === undefined
            ? t('demo.fabNone')
            : t('demo.fab', { title: first.title })
        }
        className="h-14 w-14 rounded-pill bg-primary text-3xl text-on-primary shadow-raised focus-visible:focus-ring disabled:bg-primary-disabled-bg disabled:text-primary-disabled-fg"
      >
        +
      </Button>
    </div>
  )
}
