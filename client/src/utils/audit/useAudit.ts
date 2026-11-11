/* The measurement audit's rows: loading, failed (with a retry) or ready, each announced. */
import { translate } from '../../i18n'
import { useCallback, useEffect, useState } from 'react'
import type { LoadAudit } from './loadAudit'
import type { AuditRow } from './measurementAudit'

export type AuditState =
  | { readonly status: 'loading' }
  | { readonly status: 'error' }
  | { readonly status: 'ready'; readonly rows: readonly AuditRow[] }

export const useAudit = (
  recipeId: string,
  load: LoadAudit,
  announce: (message: string) => void
): { state: AuditState; retry: () => void } => {
  const [state, setState] = useState<AuditState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let current = true
    setState({ status: 'loading' })
    announce(translate('audit.loading'))
    load(recipeId).then(
      (rows) => {
        if (!current) return
        setState({ status: 'ready', rows })
        announce(translate('audit.loaded', { count: rows.length }))
      },
      () => {
        /* the failure shows in an alert, so it is not announced twice */
        if (current) setState({ status: 'error' })
      }
    )
    return () => {
      current = false
    }
  }, [recipeId, load, announce, attempt])
  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  return { state, retry }
}
