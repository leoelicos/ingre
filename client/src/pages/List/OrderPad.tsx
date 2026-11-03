import { useT } from '../../i18n'
import type { FC } from 'react'
import { useState } from 'react'
import {
  Button,
  Form,
  Input,
  Label,
  Text,
  TextField
} from 'react-aria-components'
import type { CopyLine } from '../../utils/balance/copies'
import { outcomeMessage } from '../../utils/orderpad/message'
import { parseConstraint } from '../../utils/orderpad/parse'
import type { Outcome } from '../../utils/orderpad/resolve'
import { resolveConstraint } from '../../utils/orderpad/resolve'

/** What the order pad changes on a ticket. */
export interface OrderPadActions {
  readonly onPortions: (portions: number) => void
  readonly onAmount: (ingredientId: string, quantity: number) => void
}

/** Makes the change an outcome asks for; the ones that change nothing do nothing. */
export const performOutcome = (
  outcome: Outcome,
  actions: OrderPadActions
): void => {
  if (outcome.kind === 'portions') actions.onPortions(outcome.portions)
  if (outcome.kind === 'set')
    actions.onAmount(outcome.ingredientId, outcome.quantity)
}

/**
 * The order pad (#233): say what you want the way a cook orders, "portion for 3" or "at most
 * 1 kg carrots", instead of working out quantities. It changes this ticket once; amounts are
 * kept per serve, so a later change of portions scales them again.
 */
export const OrderPad: FC<
  OrderPadActions & { readonly lines: readonly CopyLine[] }
> = ({ lines, onPortions, onAmount }) => {
  const t = useT()
  const [text, setText] = useState('')
  const [message, setMessage] = useState('')
  const submit = () => {
    const constraint = parseConstraint(text)
    if (constraint === null) return setMessage(t('orderPad.unreadable'))
    const outcome = resolveConstraint(constraint, lines)
    performOutcome(outcome, { onPortions, onAmount })
    setMessage(outcomeMessage(outcome))
    if (outcome.kind === 'portions' || outcome.kind === 'set') setText('')
  }
  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
      className="flex min-w-0 flex-col gap-1"
    >
      <TextField
        value={text}
        onChange={setText}
        className="flex min-w-0 flex-col gap-1"
      >
        <Label className="text-sm font-semibold">{t('orderPad.label')}</Label>
        <div className="flex items-center gap-2">
          <Input
            placeholder={t('orderPad.example')}
            className="h-11 w-0 min-w-0 flex-1 rounded-control border border-border bg-surface px-3 text-text focus-visible:focus-ring"
          />
          <Button
            type="submit"
            className="inline-flex min-h-[44px] items-center rounded-pill border-2 border-primary px-4 text-sm font-semibold text-primary data-[focus-visible]:focus-ring data-[pressed]:opacity-80"
          >
            {t('orderPad.apply')}
          </Button>
        </div>
        <Text
          slot="description"
          className="text-xs text-text-secondary"
        >
          {t('orderPad.hint')}
        </Text>
      </TextField>
      <p
        role="status"
        className="m-0 min-h-[1.25rem] text-sm text-text"
      >
        {message}
      </p>
    </Form>
  )
}
