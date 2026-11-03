import { translate, useT } from '../../i18n'
import type { FC } from 'react'
import { useEffect, useState } from 'react'
import {
  Checkbox,
  CheckboxGroup,
  Input,
  Label,
  SearchField,
  Text
} from 'react-aria-components'
import { PageMain } from '../../components/SkipLink'
import { changeTitle } from '../../utils/changeTitle'
import { ALLERGENS } from '../../utils/rag/corpus'
import { sentence } from '../../utils/rag/explain'
import type { Hit } from '../../utils/rag/retrieve'
import { retrieve } from '../../utils/rag/retrieve'

/** How many ideas to show. */
export const IDEA_LIMIT = 8

const CARD = 'flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card'

const Idea: FC<{ hit: Hit }> = ({ hit }) => (
  <li
    data-idea={hit.id}
    className="flex flex-col gap-1 rounded-control border border-border bg-surface p-3"
  >
    <span className="font-semibold capitalize text-text">{hit.name}</span>
    {hit.reasons.map((reason) => (
      <span
        key={reason.kind}
        className="text-sm text-text-secondary"
      >
        {sentence(reason)}
      </span>
    ))}
  </li>
)

const Avoid: FC<{
  avoid: string[]
  onChange: (next: string[]) => void
}> = ({ avoid, onChange }) => {
  const t = useT()
  return (
    <CheckboxGroup
      value={avoid}
      onChange={onChange}
      className="flex flex-col gap-2"
    >
      <Label className="text-sm font-semibold text-text">
        {t('ideas.avoidLegend')}
      </Label>
      <div className="flex flex-wrap gap-2">
        {ALLERGENS.map((allergen) => (
          <Checkbox
            key={allergen}
            value={allergen}
            className="inline-flex min-h-[44px] cursor-pointer items-center rounded-pill border border-border bg-surface px-4 text-text data-[focus-visible]:focus-ring data-[selected]:bg-chip-active data-[selected]:font-semibold"
          >
            {allergen}
          </Checkbox>
        ))}
      </div>
    </CheckboxGroup>
  )
}

/**
 * Ideas (#225): retrieval over the hand-curated profiles, as plain lists with their reasons; no
 * chat, no model, no network. Locks (Avoid) remove an ingredient before anything is ranked.
 */
export const IdeasPage: FC = () => {
  const t = useT()
  useEffect(() => changeTitle(translate('ideas.title')), [])
  const [text, setText] = useState('')
  const [avoid, setAvoid] = useState<string[]>([])
  const asked = text.trim() !== ''
  const hits = asked ? retrieve({ text, avoid, limit: IDEA_LIMIT }) : []
  return (
    <PageMain className="mx-auto flex w-full max-w-layout flex-col gap-6 px-gutter pb-8 pt-4">
      <h1 className="m-0 text-2xl font-semibold text-text">
        {t('ideas.title')}
      </h1>
      <section className={CARD}>
        <p className="m-0 text-text">{t('ideas.intro')}</p>
        <SearchField
          value={text}
          onChange={setText}
          className="flex flex-col gap-1"
        >
          <Label className="text-sm font-semibold text-text">
            {t('ideas.queryLabel')}
          </Label>
          <Input
            placeholder={t('ideas.queryPlaceholder')}
            className="min-h-[44px] w-full rounded-pill border border-border bg-surface px-4 py-2 text-text placeholder:text-placeholder focus-visible:focus-ring [&::-webkit-search-cancel-button]:hidden"
          />
          <Text
            slot="description"
            className="text-sm text-text-secondary"
          >
            {t('ideas.hint')}
          </Text>
        </SearchField>
        <Avoid
          avoid={avoid}
          onChange={setAvoid}
        />
      </section>
      <section
        aria-labelledby="ideas-heading"
        className={CARD}
      >
        <h2
          id="ideas-heading"
          className="m-0 text-xl font-semibold text-text"
        >
          {t('ideas.listLabel')}
        </h2>
        {asked && (
          <p
            role="status"
            className="m-0 text-text-secondary"
          >
            {hits.length === 0
              ? t('ideas.none')
              : t('ideas.count', { count: hits.length })}
          </p>
        )}
        {hits.length > 0 && (
          <ul
            aria-label={t('ideas.listLabel')}
            className="m-0 flex list-none flex-col gap-2 p-0"
          >
            {hits.map((hit) => (
              <Idea
                key={hit.id}
                hit={hit}
              />
            ))}
          </ul>
        )}
      </section>
    </PageMain>
  )
}
