/* The words for a hit (#225): composed only from what retrieval found, never from outside facts. */
import { translate } from '../../i18n'
import type { Reason } from './retrieve'

const list = (names: readonly string[]): string =>
  names.join(translate('rag.separator'))

/** One sentence per reason: pairings, shared style, matched words. */
export const sentence = (reason: Reason): string =>
  reason.kind === 'partner'
    ? translate('rag.partner', { names: list(reason.with) })
    : reason.kind === 'style'
    ? translate('rag.style', {
        tags: list(reason.tags),
        names: list(reason.with)
      })
    : translate('rag.match', { terms: list(reason.terms) })
