import { useT } from '../../i18n'
import type { FC, ReactNode } from 'react'
import { useId, useState } from 'react'
import { Button } from 'react-aria-components'
import { splitTitle } from '../../components/recipeTitle'
import type { LibraryIngredient } from '../../types/library'
import { capitaliseFirst } from '../../utils/capitaliseFirst'
import { bundledRelations } from '../../utils/suggest/relations'
import type { Suggestion } from '../../utils/suggest/suggest'
import { useExplore } from '../../utils/explore/ExploreContext'
import { showsSuggestions } from '../../utils/guidance/guidance'
import { ACTION_BUTTON } from './Filters'
import { Tip } from './Tip'
import { IngredientChoice, SuggestionNote } from './Suggestions'
import type { RowControls } from './RecipeRows'

/* The fixed journey of one ingredient (#205): the same four relations for every ingredient. */

const HEADING =
  'm-0 text-xs font-semibold uppercase tracking-wide text-text-secondary'

/** One of the four relations: its heading, then its content or the sentence that says it is empty. */
const Relation: FC<{ title: string; children: ReactNode }> = ({
  title,
  children
}) => (
  <div className="flex flex-col gap-1">
    <h4 className={HEADING}>{title}</h4>
    {children}
  </div>
)

const NameList: FC<{
  label: string
  names: readonly string[]
  empty: string
}> = ({ label, names, empty }) =>
  names.length === 0 ? (
    <p className="m-0 text-sm text-text-secondary">{empty}</p>
  ) : (
    <ul
      aria-label={label}
      className="m-0 flex list-none flex-col gap-1 p-0 text-sm text-text"
    >
      {names.map((name) => (
        <li key={name}>{name}</li>
      ))}
    </ul>
  )

/** What goes with it: buttons that start using one, or plain names where nothing is suggested unasked. */
const Complements: FC<{ items: readonly LibraryIngredient[] }> = ({
  items
}) => {
  const t = useT()
  const { guidance } = useExplore()
  const pick = showsSuggestions(guidance)
  return items.length === 0 ? (
    <p className="m-0 text-sm text-text-secondary">{t('journey.noPairs')}</p>
  ) : (
    <ul
      aria-label={t('journey.goesWith')}
      className="m-0 flex list-none flex-wrap gap-2 p-1"
    >
      {items.map((item) => (
        <li key={item.id}>
          {pick ? (
            <IngredientChoice item={item} />
          ) : (
            <span className="text-sm text-text">
              {capitaliseFirst(item.name)}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}

/** The recipes it suggests, each with what is missing, the cost and one "Add to list". */
const Suggested: FC<{
  suggestions: readonly Suggestion[]
  controls: RowControls
  onAdd: (suggestion: Suggestion) => void
}> = ({ suggestions, controls, onAdd }) => (
  <ul className="m-0 flex list-none flex-col gap-3 p-0">
    {suggestions.map((suggestion) => (
      <li key={suggestion.recipe.id}>
        <p className="m-0 font-semibold text-text">
          {splitTitle(suggestion.recipe.name).title}
        </p>
        <SuggestionNote
          suggestion={suggestion}
          title={splitTitle(suggestion.recipe.name).title}
          picked={controls.pickedIds.has(suggestion.recipe.id)}
          onAdd={() => onAdd(suggestion)}
          className="pt-1"
        />
      </li>
    ))}
  </ul>
)

/** Every ingredient's relations, laid out the same whichever ingredient it is. */
const Journey: FC<{ item: LibraryIngredient; controls: RowControls }> = ({
  item,
  controls
}) => {
  const t = useT()
  const [ack, setAck] = useState('')
  const relations = bundledRelations(item)
  const add = (suggestion: Suggestion) => {
    controls.onTogglePicked(suggestion.recipe)
    setAck(
      t('suggest.added', { title: splitTitle(suggestion.recipe.name).title })
    )
  }
  return (
    <section
      aria-label={t('journey.about', { name: item.name })}
      className="flex flex-col gap-3 rounded-control bg-surface p-3 shadow-raised"
    >
      <Relation title={t('journey.section')}>
        <p className="m-0 text-sm text-text">{relations.section}</p>
      </Relation>
      <Relation title={t('journey.goesWith')}>
        <Complements items={relations.complements} />
      </Relation>
      <Relation title={t('journey.usedIn')}>
        <NameList
          label={t('journey.usedIn')}
          names={relations.recipes.map((recipe) => recipe.name)}
          empty={t('journey.noRecipes')}
        />
      </Relation>
      <Relation title={t('journey.suggested')}>
        <p
          role="status"
          className="m-0 text-sm font-semibold text-success"
        >
          {ack}
        </p>
        {relations.suggestions.length === 0 ? (
          <p className="m-0 text-sm text-text-secondary">
            {t('journey.noSuggestions')}
          </p>
        ) : (
          <Suggested
            suggestions={relations.suggestions}
            controls={controls}
            onAdd={add}
          />
        )}
      </Relation>
    </section>
  )
}

/** A "Details" button under an ingredient result that opens its journey in place. */
export const IngredientDetails: FC<{
  item: LibraryIngredient
  controls: RowControls
}> = ({ item, controls }) => {
  const t = useT()
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <div className="flex flex-col gap-2">
      <Tip text={t('guidance.tipDetails')}>
        <Button
          aria-expanded={open}
          aria-controls={id}
          aria-label={t('journey.detailsLabel', { name: item.name })}
          onPress={() => setOpen(!open)}
          className={`${ACTION_BUTTON} self-start`}
        >
          {t('journey.details')}
        </Button>
      </Tip>
      <div id={id}>
        {open && (
          <Journey
            item={item}
            controls={controls}
          />
        )}
      </div>
    </div>
  )
}
