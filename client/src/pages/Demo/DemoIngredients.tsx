import type { FC } from 'react'
import { Button, Input, Label, SearchField } from 'react-aria-components'
import { useT } from '../../i18n'
import type { DemoIngredient } from '../../utils/demo/demo'

interface Props {
  readonly query: string
  readonly onQuery: (query: string) => void
  readonly matches: readonly DemoIngredient[]
  readonly picked: readonly string[]
  readonly onToggle: (id: string, name: string) => void
}

/** The search box and the matching ingredients, each with an Add or Remove button. */
export const DemoIngredients: FC<Props> = ({
  query,
  onQuery,
  matches,
  picked,
  onToggle
}) => {
  const t = useT()
  return (
    <section
      aria-label={t('demo.picked')}
      className="flex flex-col gap-3"
    >
      <SearchField
        value={query}
        onChange={onQuery}
        className="flex flex-col gap-1"
      >
        <Label className="text-sm font-medium">{t('demo.search')}</Label>
        <Input
          placeholder={t('demo.placeholder')}
          className="min-h-[48px] w-full rounded-control border border-border bg-surface px-3 text-base focus-visible:focus-ring"
        />
      </SearchField>
      {matches.length === 0 && (
        <p className="text-text-secondary">{t('demo.none')}</p>
      )}
      <ul className="divide-y divide-border">
        {matches.map(({ id, name }) => (
          <li
            key={id}
            className="flex items-center justify-between py-2"
          >
            <span className="capitalize">{name}</span>
            <Button
              onPress={() => onToggle(id, name)}
              aria-pressed={picked.includes(id)}
              aria-label={t(picked.includes(id) ? 'demo.remove' : 'demo.add', {
                name
              })}
              className="min-h-[44px] min-w-[44px] rounded-pill border border-primary px-4 text-primary focus-visible:focus-ring aria-pressed:bg-chip-active"
            >
              {picked.includes(id) ? '✓' : '+'}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  )
}
