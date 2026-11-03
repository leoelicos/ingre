import { translate } from '../../i18n'
import { capitaliseFirst } from '../capitaliseFirst'
import { MAX_PORTIONS, MIN_PORTIONS } from '../balance/copies'
import { amountText } from '../shopping/shoppingList'
import type { Outcome } from './resolve'

/** What to tell the cook once a constraint has been read: what changed, or why nothing did. */
export const outcomeMessage = (outcome: Outcome): string => {
  switch (outcome.kind) {
    case 'portions':
      return translate('orderPad.portions', { portions: outcome.portions })
    case 'set':
      return translate('orderPad.set', {
        name: capitaliseFirst(outcome.name),
        amount: amountText(outcome.quantity, outcome.measure)
      })
    case 'within':
      return translate('orderPad.within', {
        name: capitaliseFirst(outcome.name)
      })
    case 'missing':
      return translate('orderPad.missing', { ingredient: outcome.ingredient })
    case 'unit':
      return translate('orderPad.unit', {
        name: capitaliseFirst(outcome.name)
      })
    case 'range':
      return translate('orderPad.range', {
        min: MIN_PORTIONS,
        max: MAX_PORTIONS
      })
  }
}
