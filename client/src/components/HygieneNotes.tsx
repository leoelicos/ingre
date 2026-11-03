import { useT } from '../i18n'
import type { FC } from 'react'
import type { Chip } from '../utils/chips/chips'
import type { HygieneKind } from '../utils/hygiene/hygiene'
import { hygieneNotes, subjectOf } from '../utils/hygiene/hygiene'

/**
 * The food-safety notes that apply to these chips (#213): one chip in its details, the whole
 * list above the Ingredients. Always shown when they apply: never dismissed, never gated by
 * the guidance mode. Text only, so nothing relies on colour.
 */
export const HygieneNotes: FC<{ chips: readonly Chip[] }> = ({ chips }) => {
  const t = useT()
  const notes = hygieneNotes(chips.map(subjectOf))
  const text: Readonly<Record<HygieneKind, string>> = {
    separate: t('hygiene.separate'),
    handwash: t('hygiene.handwash'),
    storage: t('hygiene.storage'),
    capacity: t('hygiene.capacity')
  }
  if (notes.length === 0) return null
  return (
    <section
      aria-label={t('hygiene.title')}
      className="flex flex-col gap-1 rounded-card border border-border bg-surface p-3 text-sm"
    >
      <h4 className="m-0 font-semibold">{t('hygiene.title')}</h4>
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {notes.map((kind) => (
          <li key={kind}>{text[kind]}</li>
        ))}
      </ul>
    </section>
  )
}
